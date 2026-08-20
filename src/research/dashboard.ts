import { sql } from "drizzle-orm";
import { getDb } from "@/db";

export type ResearchSummary = {
  participants: number;
  consented: number;
  active: number;
  withdrawn: number;
  checkins_completed: number;
  progress_missing: number;
  progress_total: number;
  surveys_completed: number;
  surveys_total: number;
  followups_completed: number;
  followups_total: number;
  followups_overdue: number;
  referrals_accepted: number;
  referrals_used: number;
  safety_open: number;
  safety_total: number;
  coach_completed: number;
  coach_fallback: number;
  coach_refused: number;
  cost_usd: string;
};

export async function researchSummary(): Promise<ResearchSummary> {
  const db = await getDb();
  const result = await db.execute(sql`
    select
      (select count(*)::int from research.participants) participants,
      (select count(*)::int from research.participants where status = 'consented') consented,
      (select count(*)::int from research.participants where status = 'active') active,
      (select count(*)::int from research.participants where status = 'withdrawn') withdrawn,
      (select count(*)::int from research.check_ins where completed_at is not null) checkins_completed,
      (select count(*)::int from research.progress_statuses where missing = true) progress_missing,
      (select count(*)::int from research.progress_statuses) progress_total,
      (select count(*)::int from research.survey_instances where status = 'completed') surveys_completed,
      (select count(*)::int from research.survey_instances) surveys_total,
      (select count(*)::int from research.outcome_assessments where completed_at is not null) followups_completed,
      (select count(*)::int from research.outcome_assessments) followups_total,
      (select count(*)::int from research.outcome_assessments where completed_at is null and window_closes_at < now()) followups_overdue,
      (select count(*)::int from research.referrals where accepted_at is not null) referrals_accepted,
      (select count(*)::int from research.referrals where used_at is not null) referrals_used,
      (select count(*)::int from safety.flags where status = 'open') safety_open,
      (select count(*)::int from safety.flags) safety_total,
      (select count(*)::int from coaching.interactions where outcome = 'completed') coach_completed,
      (select count(*)::int from coaching.interactions where outcome = 'fallback') coach_fallback,
      (select count(*)::int from coaching.interactions where outcome = 'refused') coach_refused,
      (select coalesce(sum(cost_usd), 0)::text from operations.cost_ledger) cost_usd
  `) as { rows: ResearchSummary[] };
  return result.rows[0];
}
