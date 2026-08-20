import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { referrals, supportResources } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { participantEntryOpen, participantForUser } from "@/src/study/context";
import { recordProductEvent } from "@/src/research/product-events";

const schema = z.object({ resourceId: z.string().uuid(), action: z.enum(["accept", "used"]) });

export async function POST(request: Request) {
  const session = await requirePermission(request, "participant:self"); if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
  const participant = await participantForUser(session.userId); if (!participant || !participantEntryOpen(participant)) return NextResponse.json({ ok: false, message: "New support records are closed for this account." }, { status: 403, headers: noStoreHeaders });
  const db = await getDb();
  const [resource] = await db.select().from(supportResources).where(and(eq(supportResources.id, parsed.data.resourceId), eq(supportResources.studyId, participant.studyId), eq(supportResources.active, true))).limit(1);
  if (!resource) return NextResponse.json({ ok: false }, { status: 404, headers: noStoreHeaders });
  const [existing] = await db.select().from(referrals).where(and(eq(referrals.participantId, participant.id), eq(referrals.resourceId, resource.id))).limit(1);
  const now = new Date();
  if (parsed.data.action === "used" && !existing?.acceptedAt) return NextResponse.json({ ok: false, message: "Save this support option before recording that you used it." }, { status: 409, headers: noStoreHeaders });
  if (!existing) await db.insert(referrals).values({ participantId: participant.id, resourceId: resource.id, acceptedAt: now, usedAt: parsed.data.action === "used" ? now : null, source: "participant_selection" });
  else await db.update(referrals).set(parsed.data.action === "accept" ? { acceptedAt: existing.acceptedAt ?? now } : { usedAt: now }).where(eq(referrals.id, existing.id));
  await recordAuditEvent({ actorUserId: session.userId, studyId: participant.studyId, participantId: participant.id, eventType: `referral.${parsed.data.action === "accept" ? "accepted" : "participant_reported_used"}`, targetType: "support_resource", targetId: resource.code, outcome: "success", metadata: { urgent: resource.urgent, source: "participant_selection" } });
  await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: parsed.data.action === "accept" ? "referral.accepted" : "referral.participant_reported_used", sourceType: "support_resource", sourceId: resource.id, idempotencyKey: `referral:${participant.id}:${resource.id}:${parsed.data.action}`, metadata: { urgent: resource.urgent } });
  return NextResponse.json({ ok: true, message: parsed.data.action === "accept" ? "Saved as a support option." : "Recorded as used, based on your report." }, { headers: noStoreHeaders });
}
