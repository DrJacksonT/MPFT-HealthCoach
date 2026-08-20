import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  baselines,
  checkIns,
  coachInteractions,
  costLedger,
  outcomeAssessments,
  participants,
  referrals,
  studies,
  studyVersions,
  surveyInstances,
} from "@/db/schema";

export const OUTCOME_DERIVATION_VERSION = "smoking-feasibility-v1";
export const exportDictionary = [
  ["export_id", "UUID for this audited export run"],
  ["generated_at", "UTC export generation timestamp"],
  ["data_cutoff", "UTC latest included server-receipt time"],
  ["study_code", "Versioned study identifier"],
  ["study_version", "Integer study configuration version"],
  ["protocol_reference", "Protocol reference stored with the study version"],
  ["participant_code", "Pseudonymous study participant code; not a login alias"],
  ["participant_status", "Current research participation state"],
  ["synthetic", "True only for fictional or synthetic records"],
  ["enrolled_at", "UTC enrolment timestamp or null"],
  ["baseline_cigarettes_per_day", "Participant baseline report; null means unknown"],
  ["completed_checkins", "Count of completed smoking check-ins"],
  ["observed_days", "Count of scheduled progress days with a participant observation"],
  ["missing_days", "Count of scheduled progress days with no observation; never treated as abstinent"],
  ["latest_observed_cigarettes_per_day", "Latest completed check-in value or null"],
  ["week_4_followup_status", "completed, overdue_missing, due, scheduled or not_scheduled"],
  ["week_12_followup_status", "completed, overdue_missing, due, scheduled or not_scheduled"],
  ["referrals_accepted", "Count of support options the participant accepted"],
  ["referrals_reported_used", "Count the participant reported using"],
  ["surveys_completed", "Count of completed versioned surveys"],
  ["coach_attempts", "Count of structured, fallback or refused coaching interactions"],
  ["ai_cost_usd", "Recorded provider cost; zero includes structured and gated fallback attempts"],
  ["derivation_version", "Version of these descriptive derivations"],
] as const;

function outcomeStatus(outcome: typeof outcomeAssessments.$inferSelect | undefined, now: Date) {
  if (!outcome) return "not_scheduled";
  if (outcome.completedAt) return "completed";
  if (outcome.windowClosesAt < now) return "overdue_missing";
  if (outcome.windowOpensAt <= now) return "due";
  return "scheduled";
}

export async function buildAnalysisExport(input: { exportId: string; generatedAt?: Date }) {
  const db = await getDb(); const generatedAt = input.generatedAt ?? new Date();
  const people = await db.select({ participant: participants, studyCode: studies.code, studyVersion: studyVersions.version, protocolReference: studyVersions.protocolReference }).from(participants).innerJoin(studies, eq(studies.id, participants.studyId)).innerJoin(studyVersions, eq(studyVersions.studyId, studies.id)).orderBy(asc(participants.participantCode));
  const baselineRows = await db.select().from(baselines); const checkinRows = await db.select().from(checkIns).orderBy(desc(checkIns.completedAt)); const outcomeRows = await db.select().from(outcomeAssessments); const referralRows = await db.select().from(referrals); const surveyRows = await db.select().from(surveyInstances); const coachRows = await db.select().from(coachInteractions); const costRows = await db.select().from(costLedger);
  const records = people.map(({ participant, studyCode, studyVersion, protocolReference }) => {
    const baseline = baselineRows.find((row) => row.participantId === participant.id); const completed = checkinRows.filter((row) => row.participantId === participant.id && row.completedAt); const latest = completed[0]; const scheduled = checkinRows.filter((row) => row.participantId === participant.id); const outcomes = outcomeRows.filter((row) => row.participantId === participant.id); const referralsForPerson = referralRows.filter((row) => row.participantId === participant.id); const interactions = coachRows.filter((row) => row.participantId === participant.id);
    return {
      export_id: input.exportId,
      generated_at: generatedAt.toISOString(),
      data_cutoff: generatedAt.toISOString(),
      study_code: studyCode,
      study_version: studyVersion,
      protocol_reference: protocolReference,
      participant_code: participant.participantCode,
      participant_status: participant.status,
      synthetic: participant.synthetic,
      enrolled_at: participant.enrolledAt?.toISOString() ?? null,
      baseline_cigarettes_per_day: typeof (baseline?.smoking as Record<string, unknown> | null)?.cigarettesPerDay === "number" ? (baseline?.smoking as Record<string, unknown>).cigarettesPerDay : null,
      completed_checkins: completed.length,
      observed_days: completed.length,
      missing_days: scheduled.filter((row) => !row.completedAt).length,
      latest_observed_cigarettes_per_day: latest?.cigarettes ?? null,
      week_4_followup_status: outcomeStatus(outcomes.find((row) => row.timepoint === "week-4"), generatedAt),
      week_12_followup_status: outcomeStatus(outcomes.find((row) => row.timepoint === "week-12"), generatedAt),
      referrals_accepted: referralsForPerson.filter((row) => row.acceptedAt).length,
      referrals_reported_used: referralsForPerson.filter((row) => row.usedAt).length,
      surveys_completed: surveyRows.filter((row) => row.participantId === participant.id && row.completedAt).length,
      coach_attempts: interactions.length,
      ai_cost_usd: costRows.filter((row) => row.participantId === participant.id).reduce((total, row) => total + Number(row.costUsd), 0).toFixed(8),
      derivation_version: OUTCOME_DERIVATION_VERSION,
    };
  });
  return { metadata: { exportId: input.exportId, generatedAt: generatedAt.toISOString(), dataCutoff: generatedAt.toISOString(), population: "All participants in included configured studies", missingDataRule: "Missing observations remain unknown and are never interpreted as abstinent, smoking, success or failure.", causalBoundary: "Descriptive feasibility export; no causal effect can be inferred.", includesContactIdentity: false, includesRawText: false, derivationVersion: OUTCOME_DERIVATION_VERSION }, dictionary: Object.fromEntries(exportDictionary), records };
}

function csvCell(value: unknown) { const text = value === null || value === undefined ? "" : String(value); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
export function exportCsv(records: Array<Record<string, unknown>>) { if (!records.length) return `${exportDictionary.map(([field]) => field).join(",")}\r\n`; const headers = Object.keys(records[0]); return `${headers.join(",")}\r\n${records.map((record) => headers.map((header) => csvCell(record[header])).join(",")).join("\r\n")}\r\n`; }
