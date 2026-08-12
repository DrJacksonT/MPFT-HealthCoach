import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    subjectHash: text("subject_hash").notNull(),
    alias: text("alias").notNull(),
    consentVersion: text("consent_version").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_accounts_subject_hash").on(table.subjectHash),
    uniqueIndex("idx_accounts_alias").on(table.alias),
  ],
);

export const profiles = sqliteTable("profiles", {
  accountId: text("account_id")
    .primaryKey()
    .references(() => accounts.id, { onDelete: "cascade" }),
  assessmentJson: text("assessment_json"),
  goalJson: text("goal_json"),
  updatedAt: text("updated_at").notNull(),
});

export const checkIns = sqliteTable(
  "check_ins",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    cigarettes: integer("cigarettes").notNull(),
    craving: integer("craving").notNull(),
    confidence: integer("confidence").notNull(),
    goalAttempted: integer("goal_attempted", { mode: "boolean" }).notNull(),
    trigger: text("trigger").notNull(),
    win: text("win").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_check_ins_account_date").on(table.accountId, table.date)],
);

export const apiUsage = sqliteTable(
  "api_usage",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    at: text("at").notNull(),
    route: text("route").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    latencyMs: integer("latency_ms").notNull(),
    ok: integer("ok", { mode: "boolean" }).notNull(),
    approximateCostUsd: real("approximate_cost_usd").notNull(),
  },
  (table) => [index("idx_api_usage_account_at").on(table.accountId, table.at)],
);
