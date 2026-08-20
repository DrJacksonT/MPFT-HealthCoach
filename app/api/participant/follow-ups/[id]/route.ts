import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { outcomeAssessments } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { participantEntryOpen, participantForUser } from "@/src/study/context";
import { participantOutcome } from "@/src/study/outcomes";
import { recordProductEvent } from "@/src/research/product-events";

const schema = z.object({
  action: z.enum(["save", "complete"]),
  smokingStatus: z.enum(["not_smoked_past_7_days", "smoked_on_1_to_6_days", "smoked_daily", "prefer_not_to_answer"]).nullable(),
  cigarettesPerDay: z.number().int().min(0).max(200).nullable(),
  quitAttemptSinceBaseline: z.boolean().nullable(),
  supportUsed: z.array(z.enum(["stop_smoking_service", "pharmacist_or_gp", "telephone_support", "digital_support", "friends_or_family", "medicine_discussed_with_professional", "other", "none", "prefer_not_to_answer"])).max(9),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(request, "participant:self"); if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ ok: false, message: "Some follow-up answers are outside the supported format." }, { status: 400, headers: noStoreHeaders });
  const participant = await participantForUser(session.userId); const { id } = await params; if (!participant || !participantEntryOpen(participant)) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const outcome = await participantOutcome(participant.id, id); if (!outcome) return NextResponse.json({ ok: false }, { status: 404, headers: noStoreHeaders });
  const now = new Date();
  if (outcome.completedAt) return NextResponse.json({ ok: false, message: "This follow-up is already complete." }, { status: 409, headers: noStoreHeaders });
  if (now < outcome.windowOpensAt) return NextResponse.json({ ok: false, message: "This follow-up window has not opened yet." }, { status: 409, headers: noStoreHeaders });
  if (now > outcome.windowClosesAt) return NextResponse.json({ ok: false, message: "This follow-up window has closed. Missing follow-up remains unknown." }, { status: 409, headers: noStoreHeaders });
  if (parsed.data.action === "complete" && parsed.data.smokingStatus === null) return NextResponse.json({ ok: false, message: "Choose a smoking-status answer or prefer not to answer." }, { status: 400, headers: noStoreHeaders });
  const db = await getDb();
  await db.update(outcomeAssessments).set({
    selfReport: { ...parsed.data, collectedAt: now.toISOString(), source: "participant_self_report", missingInference: false },
    completedAt: parsed.data.action === "complete" ? now : null,
  }).where(eq(outcomeAssessments.id, outcome.id));
  await recordAuditEvent({ actorUserId: session.userId, studyId: participant.studyId, participantId: participant.id, eventType: `follow_up.${parsed.data.action === "complete" ? "completed" : "saved"}`, targetType: "outcome_assessment", targetId: outcome.timepoint, outcome: "success", metadata: { timepoint: outcome.timepoint, selfReport: true, biochemicalVerificationStatus: outcome.verificationStatus } });
  if (parsed.data.action === "complete") await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "follow_up.completed", sourceType: "outcome_assessment", sourceId: outcome.id, idempotencyKey: `follow-up:${outcome.id}:completed`, metadata: { timepoint: outcome.timepoint } });
  return NextResponse.json({ ok: true, completed: parsed.data.action === "complete", message: parsed.data.action === "complete" ? "Follow-up complete. Self-report remains separate from biochemical verification." : "Draft saved. Missing answers remain unknown." }, { headers: noStoreHeaders });
}
