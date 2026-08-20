import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url().optional().or(z.literal("")),
    PGLITE_DATA_DIR: z.string().default(".data/mpft-pglite"),
    APP_ORIGIN: z.string().url().default("http://localhost:3000"),
    RELEASE_ENVIRONMENT: z.enum(["local", "staging", "production"]).default("local"),
    SESSION_HASH_KEY: z
      .string()
      .min(32)
      .default("local-development-session-key-change-before-production"),
    SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(12),
    FIELD_ENCRYPTION_KEY: z.string().optional().or(z.literal("")),
    MAIL_TRANSPORT: z.enum(["disabled", "file", "smtp"]).default("file"),
    MAIL_FILE_DIR: z.string().default(".data/mail"),
    SMTP_HOST: z.string().default("127.0.0.1"),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(1025),
    SMTP_SECURE: booleanString,
    MAIL_FROM: z.string().default("MPFT research test <research-test@example.invalid>"),
    LIVE_PILOT_ENABLED: booleanString,
    LIVE_AI_ENABLED: booleanString,
    GAMBLING_PARTICIPANT_ENABLED: booleanString,
    STAFF_MFA_PROVIDER: z.enum(["development_totp", "totp"]).default("development_totp"),
    OPENAI_API_KEY: z.string().optional().or(z.literal("")),
    OPENAI_COACH_MODEL: z.string().min(1).default("gpt-5.6-luna"),
    OPENAI_STUDY_BUDGET_USD: z.coerce.number().min(0).default(0),
    OPENAI_INPUT_USD_PER_1M: z.coerce.number().min(0).default(0),
    OPENAI_OUTPUT_USD_PER_1M: z.coerce.number().min(0).default(0),
    OPENAI_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(20_000),
    RAW_COACH_TEXT_STORAGE_ENABLED: booleanString,
    DISCLOSURE_MIN_CELL: z.coerce.number().int().min(2).max(20).default(5),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV !== "production") return;
    const add = (path: string, message: string) =>
      context.addIssue({ code: "custom", path: [path], message });
    if (!env.DATABASE_URL) add("DATABASE_URL", "Production requires PostgreSQL.");
    if (env.RELEASE_ENVIRONMENT !== "production")
      add("RELEASE_ENVIRONMENT", "Production requires the production release environment.");
    if (!env.APP_ORIGIN.startsWith("https://")) add("APP_ORIGIN", "Production origin must use HTTPS.");
    if (env.SESSION_HASH_KEY.includes("local-development"))
      add("SESSION_HASH_KEY", "Production requires a unique session hash key.");
    if (env.MAIL_TRANSPORT === "file")
      add("MAIL_TRANSPORT", "Production cannot use the local file mail sink.");
    if (env.STAFF_MFA_PROVIDER === "development_totp")
      add("STAFF_MFA_PROVIDER", "Production refuses the development MFA adapter.");
    if (env.LIVE_AI_ENABLED && !env.OPENAI_API_KEY)
      add("OPENAI_API_KEY", "A provider key is required when live AI is enabled.");
    if (env.LIVE_AI_ENABLED && env.OPENAI_STUDY_BUDGET_USD <= 0)
      add("OPENAI_STUDY_BUDGET_USD", "A positive study budget is required for live AI.");
    if (env.LIVE_AI_ENABLED && (env.OPENAI_INPUT_USD_PER_1M <= 0 || env.OPENAI_OUTPUT_USD_PER_1M <= 0))
      add("OPENAI_INPUT_USD_PER_1M", "Positive reviewed model prices are required for live AI budget enforcement.");
    if (env.RAW_COACH_TEXT_STORAGE_ENABLED && !env.FIELD_ENCRYPTION_KEY)
      add("FIELD_ENCRYPTION_KEY", "Raw coach text storage requires a field-encryption key.");
  });

export type AppEnvironment = z.infer<typeof schema>;

let cached: AppEnvironment | undefined;

export function environment(): AppEnvironment {
  cached ??= schema.parse(process.env);
  return cached;
}

export function resetEnvironmentForTests() {
  cached = undefined;
}
