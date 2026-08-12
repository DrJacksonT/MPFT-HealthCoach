import { z } from "zod";

export const assessmentContextSchema = z.object({
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
  methodsTried: z.array(z.string().max(100)).max(20),
  vaping: z.enum(["no", "sometimes", "daily", "prefer-not-to-say"]),
  packPrice: z.number().min(0).max(100).optional(),
  motivations: z.array(z.string().max(100)).max(12),
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

export const coachRequestSchema = z.object({
  message: z.string().trim().min(1).max(800),
  evidenceIds: z
    .array(z.string().min(1).max(100).regex(/^[a-z0-9-]+$/))
    .max(6)
    .transform((ids) => [...new Set(ids)])
    .default([]),
  context: assessmentContextSchema.partial().default({}),
});

export const coachOutputSchema = z.object({
  summary: z.string().max(600),
  why_relevant: z.string().max(400),
  claims: z
    .array(
      z.object({
        text: z.string().max(400),
        evidence_ids: z
          .array(z.string().min(1).max(100).regex(/^[a-z0-9-]+$/))
          .min(1)
          .max(3),
        certainty: z.enum(["high", "moderate", "limited"]),
      }),
    )
    .max(4),
  limitations: z.array(z.string().max(250)).max(4),
  coaching_question: z.string().max(300),
});

export type CoachOutput = z.infer<typeof coachOutputSchema>;

const citedEvidenceIds = z
  .array(z.string().min(1).max(100).regex(/^[a-z0-9-]+$/))
  .min(1)
  .max(3);

export const evidenceBriefRequestSchema = z.object({
  evidenceIds: z
    .array(z.string().min(1).max(100).regex(/^[a-z0-9-]+$/))
    .min(1)
    .max(8)
    .transform((ids) => [...new Set(ids)]),
  context: assessmentContextSchema,
});

export const evidenceBriefOutputSchema = z.object({
  headline: z.string().max(180),
  overview: z.string().max(800),
  key_points: z
    .array(
      z.object({
        title: z.string().max(120),
        explanation: z.string().max(450),
        why_it_matters: z.string().max(350),
        evidence_ids: citedEvidenceIds,
        certainty: z.enum(["high", "moderate", "limited"]),
      }),
    )
    .min(1)
    .max(5),
  context_notes: z
    .array(
      z.object({
        factor: z.string().max(100),
        explanation: z.string().max(350),
        evidence_ids: citedEvidenceIds,
      }),
    )
    .max(4),
  important_uncertainties: z.array(z.string().max(300)).min(1).max(4),
  follow_up_suggestions: z.array(z.string().max(160)).max(3),
});

export type EvidenceBriefOutput = z.infer<typeof evidenceBriefOutputSchema>;
