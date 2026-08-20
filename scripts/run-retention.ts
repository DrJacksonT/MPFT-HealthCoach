import { and, count, eq, isNotNull, lt, or, sql } from "drizzle-orm";
import { closeDb, getDb } from "../db/index";
import { aiBudgetCounters, aiBudgetReservations, coachMessages, oneTimeTokens, retentionJobs, sessions } from "../db/schema";
import { recordAuditEvent } from "../src/audit/events";

const apply = process.env.RETENTION_APPLY === "true";
const sessionRetentionDays = Number(process.env.RETENTION_SESSION_DAYS ?? 30);
if (!Number.isInteger(sessionRetentionDays) || sessionRetentionDays < 1 || sessionRetentionDays > 3650) throw new Error("RETENTION_SESSION_DAYS must be between 1 and 3650.");

const db = await getDb();
const now = new Date();
const sessionCutoff = new Date(now.getTime() - sessionRetentionDays * 86_400_000);
const sessionWhere = or(lt(sessions.expiresAt, sessionCutoff), and(isNotNull(sessions.revokedAt), lt(sessions.revokedAt, sessionCutoff)));
const [messageCount] = await db.select({ value: count() }).from(coachMessages).where(lt(coachMessages.retentionUntil, now));
const [tokenCount] = await db.select({ value: count() }).from(oneTimeTokens).where(lt(oneTimeTokens.expiresAt, now));
const [sessionCount] = await db.select({ value: count() }).from(sessions).where(sessionWhere);
const staleReservations = await db.select({ id: aiBudgetReservations.id, studyId: aiBudgetReservations.studyId, reservedUsd: aiBudgetReservations.reservedUsd }).from(aiBudgetReservations).where(and(eq(aiBudgetReservations.status, "reserved"), lt(aiBudgetReservations.expiresAt, now)));
const candidates = { coachMessages: messageCount?.value ?? 0, oneTimeTokens: tokenCount?.value ?? 0, sessions: sessionCount?.value ?? 0, expiredBudgetReservations: staleReservations.length };
const [job] = await db.insert(retentionJobs).values({ jobType: "scheduled_retention_v1", dryRun: !apply, status: "running", details: { candidates, sessionRetentionDays, researchDataDeleted: false, subjectRightsRequestsProcessed: false }, startedAt: now }).returning({ id: retentionJobs.id });
if (!job) throw new Error("retention_job_not_created");

let affectedRows = 0;
try {
  if (apply) {
    await db.transaction(async (tx) => {
      const removedMessages = await tx.delete(coachMessages).where(lt(coachMessages.retentionUntil, now)).returning({ id: coachMessages.id });
      const removedTokens = await tx.delete(oneTimeTokens).where(lt(oneTimeTokens.expiresAt, now)).returning({ id: oneTimeTokens.id });
      const removedSessions = await tx.delete(sessions).where(sessionWhere).returning({ id: sessions.id });
      affectedRows += removedMessages.length + removedTokens.length + removedSessions.length;
      for (const reservation of staleReservations) {
        const [released] = await tx.update(aiBudgetReservations).set({ status: "released", actualCostUsd: "0", settledAt: now }).where(and(eq(aiBudgetReservations.id, reservation.id), eq(aiBudgetReservations.status, "reserved"))).returning({ id: aiBudgetReservations.id });
        if (!released) continue;
        await tx.update(aiBudgetCounters).set({ reservedUsd: sql`greatest(${aiBudgetCounters.reservedUsd} - ${reservation.reservedUsd}, 0)`, updatedAt: now }).where(eq(aiBudgetCounters.studyId, reservation.studyId));
        affectedRows += 1;
      }
    });
  }
  await db.update(retentionJobs).set({ status: "completed", affectedRows, details: { candidates, sessionRetentionDays, researchDataDeleted: false, subjectRightsRequestsProcessed: false, applied: apply }, completedAt: new Date() }).where(eq(retentionJobs.id, job.id));
  await recordAuditEvent({ eventType: "retention.completed", targetType: "retention_job", targetId: job.id, outcome: "success", metadata: { dryRun: !apply, affectedRows, ...candidates } });
  console.log(JSON.stringify({ ok: true, jobId: job.id, dryRun: !apply, candidates, affectedRows }, null, 2));
} catch (error) {
  await db.update(retentionJobs).set({ status: "failed", details: { candidates, errorCode: "retention_job_failed" }, completedAt: new Date() }).where(eq(retentionJobs.id, job.id));
  await recordAuditEvent({ eventType: "retention.failed", targetType: "retention_job", targetId: job.id, outcome: "failure", reason: "retention_job_failed" });
  throw error;
} finally {
  await closeDb();
}
