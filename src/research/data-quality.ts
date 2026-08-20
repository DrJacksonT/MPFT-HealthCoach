import { and, desc, eq, isNull, lt } from "drizzle-orm";
import { getDb } from "@/db";
import {
  aiBudgetReservations,
  dataQualityIssues,
  evidenceReleases,
  participants,
  progressStatuses,
  surveyInstances,
} from "@/db/schema";

type DetectedIssue = {
  studyId: string;
  participantId?: string | null;
  ruleCode: string;
  entityType: string;
  entityId: string;
  severity: "warning" | "error";
  details: Record<string, unknown>;
};

export async function runDataQualityChecks() {
  const db = await getDb();
  const now = new Date();
  const detected: DetectedIssue[] = [];

  const activeWithoutEnrollment = await db
    .select({ id: participants.id, studyId: participants.studyId })
    .from(participants)
    .where(and(eq(participants.status, "active"), isNull(participants.enrolledAt)));
  detected.push(...activeWithoutEnrollment.map((row) => ({ studyId: row.studyId, participantId: row.id, ruleCode: "participant_active_without_enrollment", entityType: "participant", entityId: row.id, severity: "error" as const, details: { expected: "enrolled_at present when active" } })));

  const completedSurveyMissingTime = await db
    .select({ id: surveyInstances.id, participantId: surveyInstances.participantId, studyId: participants.studyId })
    .from(surveyInstances)
    .innerJoin(participants, eq(participants.id, surveyInstances.participantId))
    .where(and(eq(surveyInstances.status, "completed"), isNull(surveyInstances.completedAt)));
  detected.push(...completedSurveyMissingTime.map((row) => ({ studyId: row.studyId, participantId: row.participantId, ruleCode: "survey_completed_without_timestamp", entityType: "survey_instance", entityId: row.id, severity: "error" as const, details: { expected: "completed_at present when status is completed" } })));

  const progressWithSources = await db
    .select({ id: progressStatuses.id, participantId: progressStatuses.participantId, studyId: participants.studyId, missing: progressStatuses.missing, sourceCheckInId: progressStatuses.sourceCheckInId })
    .from(progressStatuses)
    .innerJoin(participants, eq(participants.id, progressStatuses.participantId));
  detected.push(...progressWithSources.filter((row) => row.missing && row.sourceCheckInId).map((row) => ({ studyId: row.studyId, participantId: row.participantId, ruleCode: "progress_marked_missing_with_source", entityType: "progress_status", entityId: row.id, severity: "error" as const, details: { expected: "missing false when a source check-in exists" } })));

  const releasesMissingHumanApproval = await db
    .select({ id: evidenceReleases.id, studyId: evidenceReleases.studyId })
    .from(evidenceReleases)
    .where(and(eq(evidenceReleases.status, "verified"), isNull(evidenceReleases.approvedByUserId)));
  detected.push(...releasesMissingHumanApproval.map((row) => ({ studyId: row.studyId, ruleCode: "verified_evidence_missing_human_reviewer", entityType: "evidence_release", entityId: row.id, severity: "error" as const, details: { releaseBlocked: true } })));

  const staleReservations = await db
    .select({ id: aiBudgetReservations.id, studyId: aiBudgetReservations.studyId })
    .from(aiBudgetReservations)
    .where(and(eq(aiBudgetReservations.status, "reserved"), lt(aiBudgetReservations.expiresAt, now)));
  detected.push(...staleReservations.map((row) => ({ studyId: row.studyId, ruleCode: "ai_budget_reservation_expired", entityType: "ai_budget_reservation", entityId: row.id, severity: "warning" as const, details: { failClosed: true, requiresReconciliation: true } })));

  for (const issue of detected)
    await db
      .insert(dataQualityIssues)
      .values(issue)
      .onConflictDoUpdate({
        target: [dataQualityIssues.studyId, dataQualityIssues.ruleCode, dataQualityIssues.entityType, dataQualityIssues.entityId],
        set: { participantId: issue.participantId, severity: issue.severity, status: "open", details: issue.details, detectedAt: now, resolvedAt: null, updatedAt: now },
      });
  return { checkedAt: now, detected: detected.length };
}

export async function dataQualityRows() {
  const db = await getDb();
  const issues = await db
    .select({ id: dataQualityIssues.id, participantId: dataQualityIssues.participantId, ruleCode: dataQualityIssues.ruleCode, entityType: dataQualityIssues.entityType, entityId: dataQualityIssues.entityId, severity: dataQualityIssues.severity, status: dataQualityIssues.status, details: dataQualityIssues.details, detectedAt: dataQualityIssues.detectedAt, resolvedAt: dataQualityIssues.resolvedAt })
    .from(dataQualityIssues)
    .orderBy(desc(dataQualityIssues.detectedAt));
  const people = await db.select({ id: participants.id, code: participants.participantCode }).from(participants);
  const codeById = new Map(people.map((person) => [person.id, person.code]));
  return issues.map((issue) => ({ ...issue, participantCode: issue.participantId ? codeById.get(issue.participantId) ?? "Unknown pseudonym" : null }));
}
