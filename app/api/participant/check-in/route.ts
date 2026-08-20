import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { checkIns, progressStatuses } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { participantEntryOpen, participantForUser } from "@/src/study/context";
import { recordProductEvent } from "@/src/research/product-events";

const schema = z.object({
  smokingStatus: z.enum(["smoke_free", "smoked", "lapse", "returned_to_smoking", "prefer_not_to_say"]),
  cigarettes: z.number().int().min(0).max(200),
  craving: z.number().int().min(0).max(10),
  confidence: z.number().int().min(0).max(10),
  goalAttempted: z.boolean(),
  triggerCodes: z.array(z.enum(["stress", "after-meals", "alcohol", "social", "boredom", "morning", "other-structured"])).max(7),
  copingActionCodes: z.array(z.enum(["delay", "breathe", "water", "walk", "message-support", "change-routine", "none"])).max(7),
  positiveMomentCode: z.enum(["noticed-trigger", "used-coping", "asked-support", "smoked-less", "smoke-free", "checked-in", "none-yet"]),
});

export async function POST(request: Request) {
  const session = await requirePermission(request, "participant:self");
  if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Check the cigarette, craving and confidence values." }, { status: 400, headers: noStoreHeaders });
  const participant = await participantForUser(session.userId);
  if (!participant || !participantEntryOpen(participant)) return NextResponse.json({ ok: false, message: "New check-ins are closed for this account." }, { status: 403, headers: noStoreHeaders });
  const today = new Date().toISOString().slice(0, 10);
  const db = await getDb();
  const [scheduled] = await db
    .select({ id: checkIns.id })
    .from(checkIns)
    .where(and(eq(checkIns.participantId, participant.id), eq(checkIns.intervention, "smoking"), eq(checkIns.scheduledFor, today)))
    .limit(1);
  if (!scheduled) return NextResponse.json({ ok: false, message: "No check-in is scheduled for today. Make a plan first." }, { status: 409, headers: noStoreHeaders });
  await db.transaction(async (tx) => {
    await tx.update(checkIns).set({ ...parsed.data, status: "completed", completedAt: new Date(), freeTextPresent: false }).where(eq(checkIns.id, scheduled.id));
    await tx.update(progressStatuses).set({ participantConfirmedStatus: parsed.data.smokingStatus, sourceCheckInId: scheduled.id, missing: false }).where(and(eq(progressStatuses.participantId, participant.id), eq(progressStatuses.statusDate, today), eq(progressStatuses.intervention, "smoking")));
  });
  await recordAuditEvent({ actorUserId: session.userId, studyId: participant.studyId, participantId: participant.id, eventType: "check_in.completed", targetType: "check_in", targetId: scheduled.id, outcome: "success", metadata: { date: today, status: parsed.data.smokingStatus } });
  await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "check_in.completed", sourceType: "check_in", sourceId: scheduled.id, idempotencyKey: `check-in:${scheduled.id}:completed`, metadata: { scheduledDate: today } });
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
