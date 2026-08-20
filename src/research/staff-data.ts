import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  coachInteractions,
  evidenceClaims,
  evidenceReleases,
  exportRuns,
  outcomeAssessments,
  participants,
  releases,
  safetyFlags,
  safetyReviews,
  studies,
  surveyDefinitions,
  surveyEvents,
  surveyInstances,
  surveyVersions,
  users,
} from "@/db/schema";

export async function surveyAndOutcomeRows() {
  const db = await getDb();
  const surveys = await db.select({ id: surveyInstances.id, participantCode: participants.participantCode, name: surveyDefinitions.name, version: surveyVersions.version, status: surveyInstances.status, windowOpensAt: surveyInstances.windowOpensAt, windowClosesAt: surveyInstances.windowClosesAt, completedAt: surveyInstances.completedAt, score: surveyInstances.score }).from(surveyInstances).innerJoin(participants, eq(participants.id, surveyInstances.participantId)).innerJoin(surveyVersions, eq(surveyVersions.id, surveyInstances.surveyVersionId)).innerJoin(surveyDefinitions, eq(surveyDefinitions.id, surveyVersions.surveyDefinitionId)).orderBy(desc(surveyInstances.windowOpensAt));
  const events = await db.select().from(surveyEvents);
  const outcomes = await db.select({ id: outcomeAssessments.id, participantCode: participants.participantCode, timepoint: outcomeAssessments.timepoint, dueAt: outcomeAssessments.dueAt, windowClosesAt: outcomeAssessments.windowClosesAt, completedAt: outcomeAssessments.completedAt, verificationStatus: outcomeAssessments.verificationStatus, selfReport: outcomeAssessments.selfReport }).from(outcomeAssessments).innerJoin(participants, eq(participants.id, outcomeAssessments.participantId)).orderBy(desc(outcomeAssessments.dueAt));
  return { surveys: surveys.map((survey) => ({ ...survey, burdenSeconds: events.filter((event) => event.surveyInstanceId === survey.id).reduce((total, event) => total + Number(event.metadata.burdenSeconds ?? 0), 0) })), outcomes };
}

export async function aiReliabilityRows() {
  const db = await getDb();
  return db.select({ id: coachInteractions.id, participantCode: participants.participantCode, intent: coachInteractions.intent, provider: coachInteractions.provider, model: coachInteractions.model, promptVersion: coachInteractions.promptVersion, rulesVersion: coachInteractions.rulesVersion, outcome: coachInteractions.outcome, fallbackReason: coachInteractions.fallbackReason, claimIds: coachInteractions.claimIds, latencyMs: coachInteractions.latencyMs, inputTokens: coachInteractions.inputTokens, outputTokens: coachInteractions.outputTokens, costUsd: coachInteractions.costUsd, createdAt: coachInteractions.createdAt }).from(coachInteractions).innerJoin(participants, eq(participants.id, coachInteractions.participantId)).orderBy(desc(coachInteractions.createdAt));
}

export async function safetyRows() {
  const db = await getDb();
  const flags = await db.select({ id: safetyFlags.id, participantCode: participants.participantCode, category: safetyFlags.category, severity: safetyFlags.severity, status: safetyFlags.status, messageCode: safetyFlags.participantMessageCode, createdAt: safetyFlags.createdAt, resolvedAt: safetyFlags.resolvedAt }).from(safetyFlags).innerJoin(participants, eq(participants.id, safetyFlags.participantId)).orderBy(desc(safetyFlags.createdAt));
  const reviews = await db.select().from(safetyReviews).orderBy(desc(safetyReviews.reviewedAt));
  return flags.map((flag) => ({ ...flag, reviews: reviews.filter((review) => review.flagId === flag.id) }));
}

export async function releaseRows() {
  const db = await getDb();
  return db.select({ id: releases.id, study: studies.title, type: releases.releaseType, version: releases.version, environment: releases.environment, status: releases.status, manifest: releases.manifest, authorisedAt: releases.authorisedAt, revokedAt: releases.revokedAt, createdAt: releases.createdAt }).from(releases).innerJoin(studies, eq(studies.id, releases.studyId)).orderBy(desc(releases.createdAt));
}

export async function evidenceRows() {
  const db = await getDb();
  const releasesData = await db.select().from(evidenceReleases).orderBy(desc(evidenceReleases.createdAt));
  const claims = await db.select().from(evidenceClaims);
  return releasesData.map((release) => ({ ...release, claims: claims.filter((claim) => claim.evidenceReleaseId === release.id) }));
}

export async function exportHistoryRows() {
  const db = await getDb();
  return db.select({ id: exportRuns.id, creator: users.displayName, format: exportRuns.format, scope: exportRuns.scope, includesRawText: exportRuns.includesRawText, status: exportRuns.status, rowCount: exportRuns.rowCount, contentHash: exportRuns.contentHash, completedAt: exportRuns.completedAt, createdAt: exportRuns.createdAt }).from(exportRuns).innerJoin(users, eq(users.id, exportRuns.requestedByUserId)).orderBy(desc(exportRuns.createdAt));
}
