import { z } from "zod";

const assessmentSchema = z.object({
  ageBand: z.enum(["18-29", "30-44", "45-59", "60-65", "66+"]),
  cigarettesPerDay: z.number().min(0).max(100),
  yearsSmoked: z.number().min(0).max(80),
  firstCigarette: z.enum(["within-5", "6-30", "31-60", "after-60"]),
  previousAttempts: z.enum(["none", "1", "2-3", "4+"]),
  longestQuit: z.enum([
    "not-applicable",
    "under-day",
    "days",
    "weeks",
    "months-plus",
  ]),
  methodsTried: z.array(z.string()).max(20),
  vaping: z.enum(["no", "sometimes", "daily", "prefer-not-to-say"]),
  packPrice: z.number().min(0).max(100).optional(),
  motivations: z.array(z.string()).max(12),
  importance: z.number().min(0).max(10),
  confidence: z.number().min(0).max(10),
  conditions: z
    .array(
      z.enum([
        "diabetes",
        "cardiovascular",
        "copd",
        "asthma",
        "hypertension",
        "mental-wellbeing",
        "none",
        "prefer-not-to-say",
      ]),
    )
    .max(8),
  intention: z.enum(["quit", "reduce", "learn"]),
});

const goalSchema = z.object({
  id: z.string().max(100),
  kind: z.string().max(100),
  title: z.string().max(200),
  detail: z.string().max(500),
  createdAt: z.string(),
  completed: z.boolean(),
  plan: z
    .object({
      targetDate: z.string().max(20).optional(),
      supportPlan: z.string().max(200).optional(),
      trigger: z.string().max(100).optional(),
      response: z.string().max(200).optional(),
      delayUntil: z.string().max(20).optional(),
      smokeFreeSituation: z.string().max(150).optional(),
      supportRoute: z.string().max(100).optional(),
      learningFocus: z.string().max(100).optional(),
    })
    .optional(),
});

const checkInSchema = z.object({
  id: z.string().max(100),
  date: z.string(),
  cigarettes: z.number().min(0).max(100),
  craving: z.number().min(0).max(10),
  confidence: z.number().min(0).max(10),
  goalAttempted: z.boolean(),
  trigger: z.string().max(100),
  win: z.string().max(500),
});

export const demoStateSchema = z.object({
  version: z.literal(1),
  synthetic: z.boolean(),
  personaName: z.string().max(100).optional(),
  savedAt: z.string().optional(),
  assessment: assessmentSchema.optional(),
  goal: goalSchema.optional(),
  checkIns: z.array(checkInSchema).max(1000),
});
