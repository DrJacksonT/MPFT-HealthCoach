import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { environment } from "@/src/config/environment";
import type { CoachingIntent } from "@/src/coaching/catalogue";

export const COACH_PROMPT_VERSION = "smoking-reflection-v1";
export const COACH_SCHEMA_VERSION = "bounded-reflection-v1";
export const COACH_RULES_VERSION = "deterministic-safety-v2";

const outputSchema = z.object({
  reflection: z.string().min(1).max(320),
  coachingQuestion: z.string().min(1).max(220),
  suggestedActionCode: z.string().min(1).max(80),
});

export type BoundedAiOutput = z.infer<typeof outputSchema>;

const prohibitedOutput = [
  /\b(diagnos(e|is)|prescrib(e|ing)|dosage|dose of)\b/i,
  /\byou (definitely|will|should take|need to take|must take)\b/i,
  /\bguarantee(d)?\b/i,
  /\b(odds|winning strategy|beat the bookmaker|bypass (a )?block)\b/i,
  /\b(call|contact) (999|111) later\b/i,
];

export function validateBoundedOutput(output: BoundedAiOutput, actionCodes: string[]) {
  const combined = `${output.reflection} ${output.coachingQuestion}`;
  return actionCodes.includes(output.suggestedActionCode) && !prohibitedOutput.some((pattern) => pattern.test(combined));
}

export async function generateBoundedReflection(input: {
  intent: CoachingIntent;
  message: string;
  actionOptions: Array<{ code: string; title: string; detail: string }>;
  safetyIdentifier: string;
}) {
  const env = environment();
  if (!env.OPENAI_API_KEY) throw new Error("provider_not_configured");
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: env.OPENAI_TIMEOUT_MS, maxRetries: 0 });
  const started = Date.now();
  const response = await client.responses.parse({
    model: env.OPENAI_COACH_MODEL,
    store: false,
    safety_identifier: input.safetyIdentifier,
    reasoning: { effort: "low" },
    max_output_tokens: 450,
    input: [
      {
        role: "system",
        content: "You are a bounded, non-clinical smoking behaviour-change reflection component in a research tool. Return only a short empathetic reflection, one open coaching question, and exactly one action code from the supplied options. Do not produce health facts, evidence claims, numbers, treatment or medicine advice, diagnosis, emergency advice, legal or financial advice, citations, links, or new actions. Do not imply a human is monitoring. The application renders approved factual content and safety routes separately.",
      },
      {
        role: "user",
        content: JSON.stringify({ intent: input.intent, participantText: input.message, allowedActions: input.actionOptions }),
      },
    ],
    text: { format: zodTextFormat(outputSchema, "bounded_coaching_reflection") },
  });
  const output = outputSchema.parse(response.output_parsed);
  if (!validateBoundedOutput(output, input.actionOptions.map((option) => option.code)))
    throw new Error("unsafe_or_invalid_output");
  return { output, usage: response.usage ?? null, model: response.model, latencyMs: Date.now() - started };
}
