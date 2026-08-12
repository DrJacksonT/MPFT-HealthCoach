import type { DemoState } from "@/src/domain/types";
import { demoStateSchema } from "@/src/domain/state-schema";
import { pricing } from "@/src/telemetry/store";

const CONSENT_VERSION = "health-profile-v1-2026-08-12";
const adjectives = [
  "Amber",
  "Bright",
  "Calm",
  "Clear",
  "Gentle",
  "Green",
  "Quiet",
  "Silver",
  "Steady",
  "Warm",
];
const nouns = [
  "Badger",
  "Brook",
  "Fern",
  "Finch",
  "Harbour",
  "Oak",
  "Robin",
  "Rowan",
  "Willow",
  "Wren",
];

interface AccountRow {
  id: string;
  alias: string;
  consent_version: string;
  created_at: string;
}

async function getAccountDb() {
  const { getD1 } = await import("@/db");
  return getD1();
}

async function subjectHash(request: Request) {
  const subject = request.headers.get("oai-authenticated-user-id");
  if (!subject) return null;
  const { env } = await import("cloudflare:workers");
  const runtimeEnv = env as typeof env & { ACCOUNT_ID_PEPPER?: string };
  if (!runtimeEnv.ACCOUNT_ID_PEPPER || runtimeEnv.ACCOUNT_ID_PEPPER.length < 32)
    throw new Error("ACCOUNT_ID_PEPPER is not configured");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(runtimeEnv.ACCOUNT_ID_PEPPER),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(subject));
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function getSafetyIdentifier(request: Request) {
  return subjectHash(request);
}

export async function getAccountForRequest(request: Request) {
  const hash = await subjectHash(request);
  if (!hash) return null;
  return (await getAccountDb())
    .prepare(
      "SELECT id, alias, consent_version, created_at FROM accounts WHERE subject_hash = ?",
    )
    .bind(hash)
    .first<AccountRow>();
}

function createAlias() {
  const bytes = crypto.getRandomValues(new Uint16Array(3));
  return `${adjectives[bytes[0] % adjectives.length]}-${nouns[bytes[1] % nouns.length]}-${String(bytes[2] % 10_000).padStart(4, "0")}`;
}

export async function createAccountForRequest(request: Request) {
  const hash = await subjectHash(request);
  if (!hash) return null;
  const existing = await getAccountForRequest(request);
  if (existing) return existing;
  const db = await getAccountDb();
  const now = new Date().toISOString();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const row: AccountRow = {
      id: crypto.randomUUID(),
      alias: createAlias(),
      consent_version: CONSENT_VERSION,
      created_at: now,
    };
    try {
      await db
        .prepare(
          "INSERT INTO accounts (id, subject_hash, alias, consent_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(row.id, hash, row.alias, row.consent_version, now, now)
        .run();
      return row;
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  throw new Error("Could not create a pseudonymous account");
}

export async function readAccountState(accountId: string): Promise<DemoState> {
  const db = await getAccountDb();
  const profile = await db
    .prepare(
      "SELECT assessment_json, goal_json FROM profiles WHERE account_id = ?",
    )
    .bind(accountId)
    .first<{ assessment_json: string | null; goal_json: string | null }>();
  const result = await db
    .prepare(
      "SELECT id, date, cigarettes, craving, confidence, goal_attempted, trigger, win FROM check_ins WHERE account_id = ? ORDER BY date ASC, created_at ASC",
    )
    .bind(accountId)
    .all<{
      id: string;
      date: string;
      cigarettes: number;
      craving: number;
      confidence: number;
      goal_attempted: number;
      trigger: string;
      win: string;
    }>();
  const candidate = {
    version: 1,
    synthetic: false,
    assessment: profile?.assessment_json
      ? JSON.parse(profile.assessment_json)
      : undefined,
    goal: profile?.goal_json ? JSON.parse(profile.goal_json) : undefined,
    checkIns: result.results.map((item) => ({
      id: item.id,
      date: item.date,
      cigarettes: item.cigarettes,
      craving: item.craving,
      confidence: item.confidence,
      goalAttempted: Boolean(item.goal_attempted),
      trigger: item.trigger,
      win: item.win,
    })),
  };
  const parsed = demoStateSchema.safeParse(candidate);
  return parsed.success
    ? parsed.data
    : { version: 1, synthetic: false, checkIns: [] };
}

export async function saveAccountState(accountId: string, state: DemoState) {
  const parsed = demoStateSchema.parse(state);
  if (parsed.synthetic) throw new Error("Fictional demo data is not persisted");
  const db = await getAccountDb();
  const now = new Date().toISOString();
  const statements = [
    db
      .prepare(
        "INSERT INTO profiles (account_id, assessment_json, goal_json, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(account_id) DO UPDATE SET assessment_json = excluded.assessment_json, goal_json = excluded.goal_json, updated_at = excluded.updated_at",
      )
      .bind(
        accountId,
        parsed.assessment ? JSON.stringify(parsed.assessment) : null,
        parsed.goal ? JSON.stringify(parsed.goal) : null,
        now,
      ),
    db.prepare("UPDATE accounts SET updated_at = ? WHERE id = ?").bind(now, accountId),
    ...parsed.checkIns.map((item) =>
      db
        .prepare(
          "INSERT OR IGNORE INTO check_ins (id, account_id, date, cigarettes, craving, confidence, goal_attempted, trigger, win, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          item.id,
          accountId,
          item.date,
          item.cigarettes,
          item.craving,
          item.confidence,
          item.goalAttempted ? 1 : 0,
          item.trigger,
          item.win,
          now,
        ),
    ),
  ];
  await db.batch(statements);
}

export async function accountInsights(accountId: string) {
  const db = await getAccountDb();
  const progress = await db
    .prepare(
      "SELECT COUNT(*) AS check_in_count, SUM(CASE WHEN cigarettes = 0 THEN 1 ELSE 0 END) AS smoke_free_check_ins, MIN(date) AS first_check_in, MAX(date) AS latest_check_in, AVG(cigarettes) AS average_cigarettes FROM check_ins WHERE account_id = ?",
    )
    .bind(accountId)
    .first<{
      check_in_count: number;
      smoke_free_check_ins: number;
      first_check_in: string | null;
      latest_check_in: string | null;
      average_cigarettes: number | null;
    }>();
  const usage = await db
    .prepare(
      "SELECT COUNT(*) AS request_count, COALESCE(SUM(input_tokens), 0) AS input_tokens, COALESCE(SUM(output_tokens), 0) AS output_tokens, COALESCE(SUM(approximate_cost_usd), 0) AS approximate_cost_usd FROM api_usage WHERE account_id = ?",
    )
    .bind(accountId)
    .first<{
      request_count: number;
      input_tokens: number;
      output_tokens: number;
      approximate_cost_usd: number;
    }>();
  return { progress, usage };
}

export async function deleteAccount(accountId: string) {
  await (await getAccountDb())
    .prepare("DELETE FROM accounts WHERE id = ?")
    .bind(accountId)
    .run();
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
  const price = pricing.models[input.model];
  const cost = price
    ? (input.inputTokens / 1_000_000) * price.inputPerMillion +
      (input.outputTokens / 1_000_000) * price.outputPerMillion
    : 0;
  await (await getAccountDb())
    .prepare(
      "INSERT INTO api_usage (id, account_id, at, route, model, input_tokens, output_tokens, latency_ms, ok, approximate_cost_usd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      crypto.randomUUID(),
      account.id,
      input.at,
      route,
      input.model,
      input.inputTokens,
      input.outputTokens,
      input.latencyMs,
      input.ok ? 1 : 0,
      cost,
    )
    .run();
}
