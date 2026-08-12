import type { Assessment } from "@/src/domain/types";

export const AI_PROFILE_FIELDS = [
  "ageBand",
  "cigarettesPerDay",
  "yearsSmoked",
  "firstCigarette",
  "previousAttempts",
  "longestQuit",
  "methodsTried",
  "vaping",
  "packPrice",
  "motivations",
  "importance",
  "confidence",
  "conditions",
  "intention",
] as const;

export type AiProfileField = (typeof AI_PROFILE_FIELDS)[number];

const firstCigaretteLabels: Record<Assessment["firstCigarette"], string> = {
  "within-5": "within five minutes of waking",
  "6-30": "six to thirty minutes after waking",
  "31-60": "thirty-one to sixty minutes after waking",
  "after-60": "more than an hour after waking",
};

const attemptLabels: Record<Assessment["previousAttempts"], string> = {
  none: "no previous attempts",
  "1": "one previous attempt",
  "2-3": "two or three previous attempts",
  "4+": "four or more previous attempts",
};

const longestQuitLabels: Record<Assessment["longestQuit"], string> = {
  "not-applicable": "not applicable",
  "under-day": "less than a day",
  days: "several days",
  weeks: "several weeks",
  "months-plus": "several months or longer",
};

const vapingLabels: Record<Assessment["vaping"], string> = {
  no: "does not vape",
  sometimes: "sometimes vapes",
  daily: "vapes daily",
  "prefer-not-to-say": "preferred not to say",
};

export function buildAiProfile(assessment: Assessment) {
  return {
    ageBand: assessment.ageBand,
    cigarettesPerDay: assessment.cigarettesPerDay,
    yearsSmoked: assessment.yearsSmoked,
    firstCigarette: assessment.firstCigarette,
    previousAttempts: assessment.previousAttempts,
    longestQuit: assessment.longestQuit,
    methodsTried: assessment.methodsTried,
    vaping: assessment.vaping,
    packPrice: assessment.packPrice ?? null,
    motivations: assessment.motivations,
    importance: assessment.importance,
    confidence: assessment.confidence,
    conditions: assessment.conditions,
    intention: assessment.intention,
    interpretation_boundaries: {
      earlyMorningSmokingPattern:
        assessment.firstCigarette === "within-5" ||
        assessment.firstCigarette === "6-30",
      lowerConfidence: assessment.confidence <= 5,
      previousQuitExperience: assessment.previousAttempts !== "none",
      healthConditionsDisclosed: assessment.conditions.filter(
        (value) => value !== "none" && value !== "prefer-not-to-say",
      ),
      rule:
        "Use these details to select and explain relevant population evidence and support options. Do not calculate an individual prognosis or select a medicine.",
    },
  };
}

export function buildPartialAiProfile(context: Partial<Assessment>) {
  return Object.fromEntries(
    AI_PROFILE_FIELDS.filter((field) => context[field] !== undefined).map(
      (field) => [field, context[field]],
    ),
  );
}

export function profileDisplayRows(assessment: Assessment) {
  return [
    ["Age group", assessment.ageBand],
    ["Cigarettes on a usual day", String(assessment.cigarettesPerDay)],
    ["Approximate years smoked", String(assessment.yearsSmoked)],
    ["First cigarette", firstCigaretteLabels[assessment.firstCigarette]],
    ["Previous quit attempts", attemptLabels[assessment.previousAttempts]],
    ["Longest time stopped", longestQuitLabels[assessment.longestQuit]],
    [
      "Methods tried",
      assessment.methodsTried.length
        ? assessment.methodsTried.join(", ")
        : "none entered",
    ],
    ["Vaping", vapingLabels[assessment.vaping]],
    [
      "Pack price",
      assessment.packPrice === undefined
        ? "not entered"
        : `£${assessment.packPrice.toFixed(2)}`,
    ],
    [
      "What matters most",
      assessment.motivations.length
        ? assessment.motivations.join(", ")
        : "none selected",
    ],
    ["Importance of change", `${assessment.importance} out of 10`],
    ["Confidence", `${assessment.confidence} out of 10`],
    [
      "Health areas",
      assessment.conditions.length
        ? assessment.conditions.join(", ")
        : "none selected",
    ],
    ["Current aim", assessment.intention],
  ] as const;
}
