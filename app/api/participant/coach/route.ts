import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import {
  coachInteractions,
  consents,
  costLedger,
  safetyFlags,
  studyVersions,
} from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { clientAddress, noStoreHeaders } from "@/src/auth/http";
import { hashToken } from "@/src/auth/crypto";
import { consumeRateLimit } from "@/src/auth/rate-limit";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import {
  COACH_PROMPT_VERSION,
  COACH_RULES_VERSION,
  COACH_SCHEMA_VERSION,
  generateBoundedReflection,
} from "@/src/coaching/ai-adapter";
import {
  claimsForIntent,
  coachingIntents,
  structuredResponse,
} from "@/src/coaching/catalogue";
import { reserveAiBudget, settleAiBudgetReservation } from "@/src/coaching/budget";
import { environment } from "@/src/config/environment";
import { classifySafety, safetyResponse } from "@/src/domain/safety";
import { releaseGate } from "@/src/governance/release-gates";
import { participantEntryOpen, participantForUser } from "@/src/study/context";
import { recordProductEvent } from "@/src/research/product-events";

const requestSchema = z.object({
  intent: z.enum(coachingIntents),
  mode: z.enum(["structured", "ai"]).default("structured"),
  message: z.string().trim().max(500).default(""),
});

function estimateCost(inputTokens: number, outputTokens: number) {
  const env = environment();
  return (inputTokens * env.OPENAI_INPUT_USD_PER_1M + outputTokens * env.OPENAI_OUTPUT_USD_PER_1M) / 1_000_000;
}

function clinicalSafetyRoute(route: ReturnType<typeof classifySafety>) {
  return !["supported", "injection", "gambling-prohibited"].includes(route);
}

export async function POST(request: Request) {
  const session = await requirePermission(request, "participant:self");
  if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id)))
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  if (Number(request.headers.get("content-length") ?? 0) > 8_000)
    return NextResponse.json({ ok: false, message: "That request is too large." }, { status: 413, headers: noStoreHeaders });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ ok: false, message: "Choose one of the supported coaching topics." }, { status: 400, headers: noStoreHeaders });

  const participant = await participantForUser(session.userId);
  if (!participant || !participantEntryOpen(participant))
    return NextResponse.json({ ok: false, message: "Coaching is not available for this account." }, { status: 403, headers: noStoreHeaders });
  const ip = clientAddress(request);
  const [participantRate, ipRate] = await Promise.all([
    consumeRateLimit({ key: participant.id, bucket: "coach.participant", limit: 30, windowMs: 60 * 60_000 }),
    consumeRateLimit({ key: ip, bucket: "coach.ip", limit: 80, windowMs: 60 * 60_000 }),
  ]);
  if (!participantRate.allowed || !ipRate.allowed)
    return NextResponse.json({ ok: false, message: "Please wait before requesting more coaching support." }, { status: 429, headers: { ...noStoreHeaders, "retry-after": "3600" } });

  const db = await getDb();
  const [studyVersion] = await db
    .select({ id: studyVersions.id })
    .from(studyVersions)
    .where(eq(studyVersions.studyId, participant.studyId))
    .orderBy(desc(studyVersions.version))
    .limit(1);
  if (!studyVersion)
    return NextResponse.json({ ok: false, message: "The study configuration is unavailable." }, { status: 503, headers: noStoreHeaders });

  const structured = structuredResponse(parsed.data.intent);
  const evidence = await claimsForIntent({
    studyId: participant.studyId,
    participantIsSynthetic: participant.synthetic,
    intent: parsed.data.intent,
  });
  const inputSafety = parsed.data.message ? classifySafety(parsed.data.message) : "supported";

  if (inputSafety !== "supported") {
    const [interaction] = await db
      .insert(coachInteractions)
      .values({
        participantId: participant.id,
        studyVersionId: studyVersion.id,
        evidenceReleaseId: evidence.releaseId,
        provider: "deterministic",
        model: "safety-router",
        promptVersion: COACH_PROMPT_VERSION,
        rulesVersion: COACH_RULES_VERSION,
        schemaVersion: COACH_SCHEMA_VERSION,
        intent: parsed.data.intent,
        claimIds: [],
        inputSafety: { route: inputSafety },
        outputSafety: { route: "boundary" },
        outcome: "refused",
        fallbackReason: `input_${inputSafety}`,
      })
      .returning({ id: coachInteractions.id });
    if (interaction && clinicalSafetyRoute(inputSafety))
      await db.insert(safetyFlags).values({
        participantId: participant.id,
        sourceType: "coach_input",
        sourceId: interaction.id,
        category: inputSafety,
        severity: ["emergency", "self-harm"].includes(inputSafety) ? "urgent" : "moderate",
        ruleVersion: COACH_RULES_VERSION,
        participantMessageCode: "immediate-self-directed-support",
      });
    await recordAuditEvent({
      actorUserId: session.userId,
      studyId: participant.studyId,
      participantId: participant.id,
      eventType: "coach.interaction_refused",
      targetType: "coach_interaction",
      targetId: interaction?.id,
      outcome: "denied",
      reason: inputSafety,
      metadata: { intent: parsed.data.intent, rawTextStored: false },
    });
    if (interaction) {
      await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "coach.requested", sourceType: "coach_interaction", sourceId: interaction.id, idempotencyKey: `coach:${interaction.id}:requested`, metadata: { intent: parsed.data.intent, mode: parsed.data.mode } });
      await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "coach.refused", sourceType: "coach_interaction", sourceId: interaction.id, idempotencyKey: `coach:${interaction.id}:refused`, metadata: { route: inputSafety } });
      await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "safety.route_shown", sourceType: "coach_interaction", sourceId: interaction.id, idempotencyKey: `coach:${interaction.id}:safety-route`, metadata: { route: inputSafety } });
    }
    return NextResponse.json({
      ok: true,
      kind: "boundary",
      route: inputSafety,
      message: safetyResponse(inputSafety),
      helpUrl: "/help",
      monitored: false,
    }, { headers: noStoreHeaders });
  }

  let provider = "none";
  let model = "structured-template";
  let outcome = "completed";
  let fallbackReason: string | null = null;
  let latencyMs = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let costUsd = 0;
  let reflection = structured.introduction;
  let question = structured.question;
  let suggestedActionCode = structured.actions[0]?.code ?? "";

  if (parsed.data.mode === "ai") {
    const [consent] = await db
      .select({ optionalAiText: consents.optionalAiText })
      .from(consents)
      .where(and(eq(consents.participantId, participant.id), eq(consents.decision, "consented"), isNull(consents.withdrawnAt)))
      .orderBy(desc(consents.decidedAt))
      .limit(1);
    const gate = await releaseGate("live_ai", "SMOKE-PILOT-SYNTHETIC");
    const env = environment();
    let reservation: Awaited<ReturnType<typeof reserveAiBudget>> = null;
    if (!consent?.optionalAiText) fallbackReason = "ai_text_consent_missing";
    else if (!gate.allowed) fallbackReason = `live_ai_gate_closed:${gate.reasons.join(",")}`;
    else if (!env.OPENAI_API_KEY) fallbackReason = "provider_not_configured";
    else {
      reservation = await reserveAiBudget(participant.studyId);
      if (!reservation) fallbackReason = "study_budget_exhausted";
    }
    if (reservation) {
      provider = "openai";
      model = env.OPENAI_COACH_MODEL;
      try {
        const result = await generateBoundedReflection({
          intent: parsed.data.intent,
          message: parsed.data.message,
          actionOptions: structured.actions,
          safetyIdentifier: hashToken(participant.id),
        });
        reflection = result.output.reflection;
        question = result.output.coachingQuestion;
        suggestedActionCode = result.output.suggestedActionCode;
        latencyMs = result.latencyMs;
        model = result.model;
        inputTokens = result.usage?.input_tokens ?? 0;
        outputTokens = result.usage?.output_tokens ?? 0;
        costUsd = estimateCost(inputTokens, outputTokens);
      } catch (error) {
        outcome = "fallback";
        fallbackReason = error instanceof Error && error.message === "unsafe_or_invalid_output" ? "output_validation_failed" : "provider_failure";
        costUsd = reservation.reservedUsd;
      }
      await settleAiBudgetReservation(reservation.id, costUsd);
    } else {
      outcome = "fallback";
    }
  }

  const [interaction] = await db
    .insert(coachInteractions)
    .values({
      participantId: participant.id,
      studyVersionId: studyVersion.id,
      evidenceReleaseId: evidence.releaseId,
      provider,
      model,
      promptVersion: COACH_PROMPT_VERSION,
      rulesVersion: COACH_RULES_VERSION,
      schemaVersion: COACH_SCHEMA_VERSION,
      intent: parsed.data.intent,
      claimIds: evidence.claims.map((claim) => claim.claimId),
      inputSafety: { route: inputSafety, rawTextStored: false },
      outputSafety: { passed: true, applicationOwnedClaims: true },
      outcome,
      fallbackReason,
      inputTokens,
      outputTokens,
      costUsd: costUsd.toFixed(8),
      latencyMs,
    })
    .returning({ id: coachInteractions.id });
  if (interaction)
    await db.insert(costLedger).values({
      studyId: participant.studyId,
      participantId: participant.id,
      interactionId: interaction.id,
      provider,
      model,
      costUsd: costUsd.toFixed(8),
    });
  await recordAuditEvent({
    actorUserId: session.userId,
    studyId: participant.studyId,
    participantId: participant.id,
    eventType: outcome === "fallback" ? "coach.interaction_fallback" : "coach.interaction_completed",
    targetType: "coach_interaction",
    targetId: interaction?.id,
    outcome: "success",
    reason: fallbackReason ?? undefined,
    metadata: { intent: parsed.data.intent, modeRequested: parsed.data.mode, provider, claimCount: evidence.claims.length, rawTextStored: false },
  });
  if (interaction) {
    await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "coach.requested", sourceType: "coach_interaction", sourceId: interaction.id, idempotencyKey: `coach:${interaction.id}:requested`, metadata: { intent: parsed.data.intent, mode: parsed.data.mode } });
    await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: outcome === "fallback" ? "coach.fallback" : "coach.completed", sourceType: "coach_interaction", sourceId: interaction.id, idempotencyKey: `coach:${interaction.id}:${outcome}`, metadata: { intent: parsed.data.intent, mode: parsed.data.mode, provider } });
    if (parsed.data.mode === "structured") await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "structured_tool.completed", sourceType: "coach_interaction", sourceId: interaction.id, idempotencyKey: `coach:${interaction.id}:structured-completed`, metadata: { intent: parsed.data.intent } });
  }
  return NextResponse.json({
    ok: true,
    kind: outcome === "fallback" ? "fallback" : parsed.data.mode,
    interactionId: interaction?.id,
    title: structured.title,
    reflection,
    question,
    suggestedActionCode,
    actions: structured.actions,
    claims: evidence.claims,
    evidenceRelease: {
      version: evidence.releaseVersion,
      status: evidence.releaseStatus,
      liveApprovalRequired: participant.synthetic,
    },
    boundaries: {
      automated: true,
      clinician: false,
      monitored: false,
      emergencyCare: false,
      rawTextStored: false,
    },
    fallbackReason: outcome === "fallback" ? fallbackReason : null,
  }, { headers: noStoreHeaders });
}
