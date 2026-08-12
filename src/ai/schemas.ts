import { z } from "zod";

export const coachRequestSchema = z.object({
  message: z.string().trim().min(1).max(800),
  evidenceIds: z
    .array(z.string().min(1).max(100).regex(/^[a-z0-9-]+$/))
    .max(6)
    .transform((ids) => [...new Set(ids)])
    .default([]),
  context: z
    .object({
      intention: z.enum(["quit", "reduce", "learn"]).optional(),
      importance: z.number().min(0).max(10).optional(),
      confidence: z.number().min(0).max(10).optional(),
    })
    .default({}),
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
