import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { consents, participantRequests, participants } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { participantEntryOpen, participantForUser } from "@/src/study/context";
import { recordProductEvent } from "@/src/research/product-events";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("update_choices"), optionalAiText: z.boolean(), optionalContact: z.boolean() }),
  z.object({ action: z.literal("request_data_copy") }),
  z.object({ action: z.literal("request_restriction") }),
  z.object({ action: z.literal("request_deletion") }),
  z.object({ action: z.literal("withdraw"), confirm: z.literal("WITHDRAW"), scope: z.enum(["stop_participation", "stop_and_restrict_future_use"]) }),
]);

export async function POST(request: Request) {
  const session = await requirePermission(request, "participant:self");
  if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "The account request was not recognised." }, { status: 400, headers: noStoreHeaders });
  const participant = await participantForUser(session.userId);
  if (!participant) return NextResponse.json({ ok: false }, { status: 404, headers: noStoreHeaders });
  const db = await getDb(); const now = new Date();

  if (parsed.data.action === "update_choices") {
    if (!participantEntryOpen(participant)) return NextResponse.json({ ok: false, message: "Study choices cannot be changed after withdrawal or restriction." }, { status: 409, headers: noStoreHeaders });
    const [current] = await db.select().from(consents).where(and(eq(consents.participantId, participant.id), isNull(consents.withdrawnAt))).orderBy(desc(consents.decidedAt)).limit(1);
    if (!current) return NextResponse.json({ ok: false, message: "No active consent record was found." }, { status: 409, headers: noStoreHeaders });
    await db.insert(consents).values({
      participantId: participant.id,
      informationContentId: current.informationContentId,
      consentContentId: current.consentContentId,
      decision: "consented",
      items: current.items,
      optionalAiText: parsed.data.optionalAiText,
      optionalContact: parsed.data.optionalContact,
    });
    await recordAuditEvent({ actorUserId: session.userId, studyId: participant.studyId, participantId: participant.id, eventType: "consent.optional_choices_changed", targetType: "participant", targetId: participant.id, outcome: "success", metadata: { optionalAiText: parsed.data.optionalAiText, optionalContact: parsed.data.optionalContact } });
    return NextResponse.json({ ok: true, message: "Your optional choices were saved as a new consent event." }, { headers: noStoreHeaders });
  }

  if (parsed.data.action === "withdraw") {
    if (participant.withdrawnAt) return NextResponse.json({ ok: true, message: "This account is already withdrawn." }, { headers: noStoreHeaders });
    const withdrawalScope = parsed.data.scope;
    await db.transaction(async (tx) => {
      await tx.update(participants).set({ status: "withdrawn", withdrawnAt: now, withdrawalScope, updatedAt: now }).where(eq(participants.id, participant.id));
      await tx.update(consents).set({ withdrawnAt: now }).where(and(eq(consents.participantId, participant.id), isNull(consents.withdrawnAt)));
      await tx.insert(participantRequests).values({ participantId: participant.id, requestType: "withdrawal", status: "completed", details: { scope: withdrawalScope, auditPreserved: true }, completedAt: now });
    });
    await recordAuditEvent({ actorUserId: session.userId, studyId: participant.studyId, participantId: participant.id, eventType: "study.withdrawn", targetType: "participant", targetId: participant.id, outcome: "success", metadata: { scope: withdrawalScope, auditPreserved: true } });
    await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "consent.withdrawn", sourceType: "participant", sourceId: participant.id, idempotencyKey: `withdrawal:${participant.id}`, metadata: { restrictionRequested: withdrawalScope === "stop_and_restrict_future_use" } });
    return NextResponse.json({ ok: true, withdrawn: true, message: "Withdrawal is recorded. Coaching and new research entries are now closed." }, { headers: noStoreHeaders });
  }

  const requestType = { request_data_copy: "data_copy", request_restriction: "restriction", request_deletion: "deletion" }[parsed.data.action];
  const [existing] = await db.select({ id: participantRequests.id }).from(participantRequests).where(and(eq(participantRequests.participantId, participant.id), eq(participantRequests.requestType, requestType), eq(participantRequests.status, "requested"))).limit(1);
  let requestId = existing?.id;
  if (!existing) {
    const [created] = await db.insert(participantRequests).values({ participantId: participant.id, requestType, status: "requested", details: { synthetic: participant.synthetic, identityVerificationRequired: true } }).returning({ id: participantRequests.id });
    requestId = created?.id;
  }
  if (requestType === "deletion" && !participant.deletionRequestedAt) await db.update(participants).set({ deletionRequestedAt: now, updatedAt: now }).where(eq(participants.id, participant.id));
  await recordAuditEvent({ actorUserId: session.userId, studyId: participant.studyId, participantId: participant.id, eventType: `rights.${requestType}_requested`, targetType: "participant_request", targetId: requestId, outcome: "success", metadata: { duplicateSuppressed: Boolean(existing), synthetic: participant.synthetic } });
  if (requestId) await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: requestType === "data_copy" ? "data_copy.requested" : requestType === "restriction" ? "account.restriction_requested" : "account.deletion_requested", sourceType: "participant_request", sourceId: requestId, idempotencyKey: `participant-request:${requestId}`, metadata: { duplicateSuppressed: Boolean(existing) } });
  return NextResponse.json({ ok: true, message: existing ? "That request is already open." : "Your request was recorded for authorised staff review." }, { status: existing ? 200 : 201, headers: noStoreHeaders });
}
