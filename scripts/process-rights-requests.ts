import { and, eq, inArray } from "drizzle-orm";
import { closeDb, getDb } from "../db/index";
import { coachInteractions, coachMessages, contactIdentities, participantRequests, participants, retentionJobs, sessions, users } from "../db/schema";
import { recordAuditEvent } from "../src/audit/events";
import { rightsProcessingPlan, type RightsRequestType } from "../src/research/rights";

const apply = process.env.RIGHTS_APPLY === "true";
const db = await getDb();
const requests = await db
  .select({ id: participantRequests.id, requestType: participantRequests.requestType, participantId: participants.id, studyId: participants.studyId, userId: participants.userId, synthetic: participants.synthetic })
  .from(participantRequests)
  .innerJoin(participants, eq(participants.id, participantRequests.participantId))
  .where(eq(participantRequests.status, "requested"));
const candidates = requests.map((request) => ({ ...request, plan: rightsProcessingPlan(request.requestType as RightsRequestType, request.synthetic) }));
const [job] = await db.insert(retentionJobs).values({ jobType: "subject_rights_v1", dryRun: !apply, status: "running", details: { candidateCount: candidates.length, syntheticExecutable: candidates.filter((item) => item.plan.executable).length }, startedAt: new Date() }).returning({ id: retentionJobs.id });
if (!job) throw new Error("rights_job_not_created");
let affectedRows = 0;
try {
  if (apply) for (const request of candidates) {
    if (!request.plan.executable) continue;
    const now = new Date();
    if (request.requestType === "restriction") {
      await db.transaction(async (tx) => {
        await tx.update(participants).set({ status: "restricted", updatedAt: now }).where(eq(participants.id, request.participantId));
        await tx.update(sessions).set({ revokedAt: now }).where(eq(sessions.userId, request.userId));
        await tx.update(participantRequests).set({ status: "completed", details: { synthetic: true, identityVerificationRequired: false, newEntriesClosed: true, auditPreserved: true }, completedAt: now, updatedAt: now }).where(eq(participantRequests.id, request.id));
      });
      affectedRows += 1;
    }
    if (request.requestType === "deletion") {
      const interactionIds = await db.select({ id: coachInteractions.id }).from(coachInteractions).where(eq(coachInteractions.participantId, request.participantId));
      const ids = interactionIds.map((item) => item.id);
      let deletedMessages = 0;
      await db.transaction(async (tx) => {
        if (ids.length) deletedMessages = (await tx.delete(coachMessages).where(inArray(coachMessages.interactionId, ids)).returning({ id: coachMessages.id })).length;
        await tx.delete(contactIdentities).where(eq(contactIdentities.userId, request.userId));
        await tx.update(users).set({ status: "disabled", displayName: "Deleted synthetic account", passwordHash: null, updatedAt: now }).where(eq(users.id, request.userId));
        await tx.update(sessions).set({ revokedAt: now }).where(eq(sessions.userId, request.userId));
        await tx.update(participants).set({ status: "restricted", updatedAt: now }).where(eq(participants.id, request.participantId));
        await tx.update(participantRequests).set({ status: "identity_deleted_research_retention_pending", details: { synthetic: true, contactIdentityDeleted: true, accountDisabled: true, rawCoachMessagesDeleted: deletedMessages, auditPreserved: true, researchRecordRetentionDecision: "external_governance_required" }, updatedAt: now }).where(and(eq(participantRequests.id, request.id), eq(participantRequests.status, "requested")));
      });
      affectedRows += 1;
    }
    await recordAuditEvent({ studyId: request.studyId, participantId: request.participantId, eventType: `rights.${request.requestType}_processed`, targetType: "participant_request", targetId: request.id, outcome: "success", metadata: { synthetic: true, auditPreserved: true, liveProcessing: false } });
  }
  await db.update(retentionJobs).set({ status: "completed", affectedRows, details: { candidateCount: candidates.length, syntheticExecutable: candidates.filter((item) => item.plan.executable).length, applied: apply, liveRequestsProcessed: false }, completedAt: new Date() }).where(eq(retentionJobs.id, job.id));
  await recordAuditEvent({ eventType: "rights.job_completed", targetType: "retention_job", targetId: job.id, outcome: "success", metadata: { dryRun: !apply, affectedRows, candidateCount: candidates.length } });
  console.log(JSON.stringify({ ok: true, jobId: job.id, dryRun: !apply, affectedRows, candidates: candidates.map(({ id, requestType, synthetic, plan }) => ({ id, requestType, synthetic, plan })) }, null, 2));
} catch (error) {
  await db.update(retentionJobs).set({ status: "failed", details: { errorCode: "rights_job_failed" }, completedAt: new Date() }).where(eq(retentionJobs.id, job.id));
  throw error;
} finally {
  await closeDb();
}
