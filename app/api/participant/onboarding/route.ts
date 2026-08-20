import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import {
  baselines,
  consents,
  contentVersions,
  eligibilityAssessments,
  outcomeAssessments,
  participants,
  studyVersions,
  surveyInstances,
  surveySchedules,
} from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { participantEntryOpen, participantForUser } from "@/src/study/context";
import { recordProductEvent } from "@/src/research/product-events";

const schema = z.object({
  eligibility: z.object({
    age18OrOver: z.literal(true),
    currentlySmokes: z.literal(true),
    canConsent: z.literal(true),
    needsUrgentHelp: z.literal(false),
  }),
  consentItems: z.object({
    readInformation: z.literal(true),
    voluntaryChoice: z.literal(true),
    healthDataUse: z.literal(true),
    withdrawalUnderstood: z.literal(true),
    notMonitored: z.literal(true),
  }),
  optionalAiText: z.boolean(),
  optionalContact: z.boolean(),
  baseline: z.object({
    cigarettesPerDay: z.number().int().min(0).max(200),
    yearsSmoked: z.number().int().min(0).max(100),
    previousAttempts: z.number().int().min(0).max(100),
    currentGoal: z.enum(["stop", "reduce", "unsure"]),
    craving: z.number().int().min(0).max(10),
    confidence: z.number().int().min(0).max(10),
    ageBand: z.enum(["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "prefer-not-to-say"]),
  }),
});

export async function POST(request: Request) {
  const session = await requirePermission(request, "participant:self");
  if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id)))
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ ok: false, message: "Complete every required eligibility and consent item." }, { status: 400, headers: noStoreHeaders });
  const participant = await participantForUser(session.userId);
  if (!participant || !participantEntryOpen(participant))
    return NextResponse.json({ ok: false, message: "Onboarding is closed for this account." }, { status: 403, headers: noStoreHeaders });
  const db = await getDb();
  const [version] = await db
    .select()
    .from(studyVersions)
    .where(eq(studyVersions.studyId, participant.studyId))
    .orderBy(desc(studyVersions.version))
    .limit(1);
  const content = await db
    .select()
    .from(contentVersions)
    .where(and(eq(contentVersions.studyId, participant.studyId), eq(contentVersions.version, 1)));
  const information = content.find((item) => item.kind === "participant_information");
  const consentContent = content.find((item) => item.kind === "consent");
  if (!version || !information || !consentContent)
    return NextResponse.json({ ok: false, message: "The versioned onboarding content is unavailable." }, { status: 503, headers: noStoreHeaders });

  const schedules = await db
    .select()
    .from(surveySchedules)
    .where(and(eq(surveySchedules.studyVersionId, version.id), eq(surveySchedules.active, true)));

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.insert(eligibilityAssessments).values({
      participantId: participant.id,
      studyVersionId: version.id,
      answers: parsed.data.eligibility,
      outcome: "eligible_synthetic",
      reasonCodes: [],
    });
    await tx.insert(consents).values({
      participantId: participant.id,
      informationContentId: information.id,
      consentContentId: consentContent.id,
      decision: "consented",
      items: Object.entries(parsed.data.consentItems).map(([code, accepted]) => ({ code, accepted })),
      optionalAiText: parsed.data.optionalAiText,
      optionalContact: parsed.data.optionalContact,
    });
    await tx
      .insert(baselines)
      .values({
        participantId: participant.id,
        studyVersionId: version.id,
        smoking: {
          cigarettesPerDay: parsed.data.baseline.cigarettesPerDay,
          yearsSmoked: parsed.data.baseline.yearsSmoked,
          previousAttempts: parsed.data.baseline.previousAttempts,
          currentGoal: parsed.data.baseline.currentGoal,
          craving: parsed.data.baseline.craving,
          confidence: parsed.data.baseline.confidence,
        },
        demographics: { ageBand: parsed.data.baseline.ageBand },
      })
      .onConflictDoNothing();
    for (const [timepoint, weeks] of [["week-4", 4], ["week-12", 12]] as const) {
      const dueAt = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
      await tx
        .insert(outcomeAssessments)
        .values({
          participantId: participant.id,
          timepoint,
          dueAt,
          windowOpensAt: new Date(dueAt.getTime() - 3 * 24 * 60 * 60 * 1000),
          windowClosesAt: new Date(dueAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        })
        .onConflictDoNothing();
    }
    for (const schedule of schedules) {
      const windowOpensAt = new Date(now.getTime() + schedule.triggerOffsetDays * 24 * 60 * 60 * 1000);
      const windowClosesAt = new Date(windowOpensAt.getTime() + schedule.openDays * 24 * 60 * 60 * 1000);
      await tx
        .insert(surveyInstances)
        .values({
          participantId: participant.id,
          surveyScheduleId: schedule.id,
          surveyVersionId: schedule.surveyVersionId,
          windowOpensAt,
          windowClosesAt,
          status: windowOpensAt <= now ? "available" : "available",
        })
        .onConflictDoNothing();
    }
    await tx
      .update(participants)
      .set({ status: "consented", enrolledAt: now, updatedAt: now })
      .where(eq(participants.id, participant.id));
  });
  await recordAuditEvent({
    actorUserId: session.userId,
    studyId: participant.studyId,
    participantId: participant.id,
    eventType: "study.onboarding_completed",
    targetType: "participant",
    targetId: participant.id,
    outcome: "success",
    metadata: { studyVersion: version.version, optionalAiText: parsed.data.optionalAiText, optionalContact: parsed.data.optionalContact },
  });
  for (const eventName of ["eligibility.completed", "information.viewed", "consent.consented", "baseline.completed"] as const)
    await recordProductEvent({
      studyId: participant.studyId,
      participantId: participant.id,
      sessionId: session.id,
      eventName,
      sourceType: "onboarding",
      sourceId: version.id,
      idempotencyKey: `${eventName}:${participant.id}:${version.id}`,
      metadata: { studyVersion: version.version, synthetic: participant.synthetic },
    });
  return NextResponse.json({ ok: true }, { status: 201, headers: noStoreHeaders });
}
