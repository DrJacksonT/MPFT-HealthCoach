import { and, asc, eq, sql } from "drizzle-orm";
import type { DemoState } from "@/src/domain/types";
import { demoStateSchema } from "@/src/domain/state-schema";
import { pricing } from "@/src/telemetry/store";
import { getDb } from "@/db";
import { checkIns, costLedger, participants, sessions } from "@/db/schema";
import { readSession } from "@/src/auth/session";
import { firstQueryRow } from "@/db/query-result";

const CONSENT_VERSION = "standalone-synthetic-v1-2026-08-20";

export async function getSafetyIdentifier(request: Request) {
  return (await readSession(request))?.userId ?? null;
}

export async function getAccountForRequest(request: Request) {
  const session = await readSession(request);
  if (!session) return null;
  const db = await getDb();
  const [participant] = await db
    .select({
      id: participants.id,
      alias: participants.participantCode,
      createdAt: participants.createdAt,
    })
    .from(participants)
    .where(eq(participants.userId, session.userId))
    .limit(1);
  if (!participant) return null;
  return {
    id: participant.id,
    alias: participant.alias,
    consent_version: CONSENT_VERSION,
    created_at: participant.createdAt.toISOString(),
  };
}

export async function createAccountForRequest(request: Request) {
  return getAccountForRequest(request);
}

export async function readAccountState(participantId: string): Promise<DemoState> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(checkIns)
    .where(and(eq(checkIns.participantId, participantId), eq(checkIns.intervention, "smoking")))
    .orderBy(asc(checkIns.scheduledFor), asc(checkIns.createdAt));
  const candidate = {
    version: 1,
    synthetic: true,
    checkIns: rows
      .filter((row) => row.status === "completed")
      .map((row) => ({
        id: row.id,
        date: row.scheduledFor,
        cigarettes: row.cigarettes ?? 0,
        craving: row.craving ?? 0,
        confidence: row.confidence ?? 0,
        goalAttempted: row.goalAttempted ?? false,
        trigger: "",
        win: "",
      })),
  };
  const parsed = demoStateSchema.safeParse(candidate);
  return parsed.success ? parsed.data : { version: 1, synthetic: true, checkIns: [] };
}

export async function saveAccountState(participantId: string, state: DemoState) {
  const parsed = demoStateSchema.parse(state);
  const db = await getDb();
  for (const item of parsed.checkIns) {
    await db
      .insert(checkIns)
      .values({
        id: item.id,
        participantId,
        intervention: "smoking",
        scheduledFor: item.date,
        completedAt: new Date(),
        status: "completed",
        cigarettes: item.cigarettes,
        smokingStatus: item.cigarettes === 0 ? "smoke_free" : "smoked",
        craving: item.craving,
        confidence: item.confidence,
        goalAttempted: item.goalAttempted,
      })
      .onConflictDoNothing();
  }
}

export async function accountInsights(participantId: string) {
  const db = await getDb();
  const progress = await db.execute(sql`
    select
      count(*)::int as check_in_count,
      count(*) filter (where cigarettes = 0)::int as smoke_free_check_ins,
      min(scheduled_for) as first_check_in,
      max(scheduled_for) as latest_check_in,
      avg(cigarettes)::float as average_cigarettes
    from research.check_ins
    where participant_id = ${participantId}::uuid and status = 'completed'
  `);
  const usage = await db.execute(sql`
    select count(*)::int as request_count, coalesce(sum(cost_usd), 0)::float as approximate_cost_usd
    from operations.cost_ledger where participant_id = ${participantId}::uuid
  `);
  return {
    progress: firstQueryRow<Record<string, unknown>>(progress),
    usage: firstQueryRow<Record<string, unknown>>(usage),
  };
}

export async function deleteAccount(participantId: string) {
  const db = await getDb();
  const [participant] = await db
    .update(participants)
    .set({ status: "withdrawn", withdrawnAt: new Date(), deletionRequestedAt: new Date(), updatedAt: new Date() })
    .where(eq(participants.id, participantId))
    .returning({ userId: participants.userId });
  if (participant)
    await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.userId, participant.userId));
}

export async function recordAccountUsage(
  request: Request,
  route: string,
  input: {
    at: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    ok: boolean;
  },
) {
  const account = await getAccountForRequest(request);
  if (!account) return;
  const db = await getDb();
  const [participant] = await db
    .select({ studyId: participants.studyId })
    .from(participants)
    .where(eq(participants.id, account.id))
    .limit(1);
  if (!participant) return;
  const price = pricing.models[input.model];
  const cost = price
    ? (input.inputTokens / 1_000_000) * price.inputPerMillion +
      (input.outputTokens / 1_000_000) * price.outputPerMillion
    : 0;
  await db.insert(costLedger).values({
    studyId: participant.studyId,
    participantId: account.id,
    provider: route,
    model: input.model,
    costUsd: String(cost),
    occurredAt: new Date(input.at),
  });
}
