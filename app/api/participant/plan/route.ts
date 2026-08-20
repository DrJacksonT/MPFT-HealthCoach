import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { checkIns, participants, plans, planVersions, progressStatuses } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { participantForUser } from "@/src/study/context";
import { currentPlan } from "@/src/study/plan";
import { recordProductEvent } from "@/src/research/product-events";

const schema = z.object({
  goalType: z.enum(["stop", "reduce"]),
  targetDate: z.string().date().nullable(),
  motivations: z.array(z.enum(["health", "family", "money", "fitness", "freedom"])).min(1).max(5),
  triggers: z.array(z.enum(["stress", "after-meals", "alcohol", "social", "boredom", "morning"])).min(1).max(6),
  copingActions: z.array(z.enum(["delay", "breathe", "water", "walk", "message-support", "change-routine"])).min(1).max(6),
  supportChoices: z.array(z.enum(["gp", "pharmacy", "local-service", "friend-family", "none-yet"])).min(1).max(5),
  medicationDiscussion: z.enum(["ask-clinician", "already-discussed", "not-now"]),
  revisionReason: z.enum(["first-plan", "goal-changed", "what-worked", "lapse", "life-changed"]),
});

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const session = await requirePermission(request, "participant:self");
  if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Choose at least one motivation, trigger, coping action and support option." }, { status: 400, headers: noStoreHeaders });
  const participant = await participantForUser(session.userId);
  if (!participant || !["consented", "active"].includes(participant.status))
    return NextResponse.json({ ok: false, message: "Complete consent and baseline first." }, { status: 409, headers: noStoreHeaders });
  const db = await getDb();
  const existing = await currentPlan(participant.id);
  const planId = existing?.plan.id ?? crypto.randomUUID();
  const version = (existing?.version.version ?? 0) + 1;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  await db.transaction(async (tx) => {
    if (!existing) await tx.insert(plans).values({ id: planId, participantId: participant.id, currentVersion: 1 });
    else await tx.update(plans).set({ currentVersion: version, updatedAt: new Date() }).where(eq(plans.id, planId));
    await tx.insert(planVersions).values({ planId, version, ...parsed.data });
    await tx.update(participants).set({ status: "active", updatedAt: new Date() }).where(eq(participants.id, participant.id));
    const dates = Array.from({ length: 84 }, (_, day) => {
      const value = new Date(today);
      value.setUTCDate(value.getUTCDate() + day);
      return isoDate(value);
    });
    await tx.insert(checkIns).values(dates.map((scheduledFor) => ({ participantId: participant.id, intervention: "smoking", scheduledFor }))).onConflictDoNothing();
    await tx.insert(progressStatuses).values(dates.map((statusDate) => ({ participantId: participant.id, intervention: "smoking", statusDate, missing: true }))).onConflictDoNothing();
  });
  await recordAuditEvent({ actorUserId: session.userId, studyId: participant.studyId, participantId: participant.id, eventType: existing ? "plan.revised" : "plan.created", targetType: "plan", targetId: planId, outcome: "success", metadata: { version, revisionReason: parsed.data.revisionReason } });
  await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: existing ? "goal.revised" : "goal.created", sourceType: "plan", sourceId: planId, idempotencyKey: `goal:${planId}:${version}`, metadata: { version } });
  return NextResponse.json({ ok: true, planId, version }, { status: existing ? 200 : 201, headers: noStoreHeaders });
}
