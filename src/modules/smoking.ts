import type { Assessment, HealthModule } from "@/src/domain/types";

export const smokingModule: HealthModule = {
  id: "smoking",
  title: "Smoking",
  assessmentFields: [
    "ageBand",
    "cigarettesPerDay",
    "yearsSmoked",
    "firstCigarette",
    "previousAttempts",
    "motivations",
    "conditions",
    "intention",
  ],
  evidenceTags(assessment: Assessment) {
    return Array.from(
      new Set([
        "overall",
        "cessation-support",
        assessment.intention,
        ...(assessment.vaping !== "no" &&
        assessment.vaping !== "prefer-not-to-say"
          ? ["vaping"]
          : []),
        ...(assessment.confidence <= 5 ? ["confidence"] : []),
        ...(assessment.firstCigarette === "within-5" ||
        assessment.firstCigarette === "6-30"
          ? ["higher-dependence-pattern"]
          : []),
        ...(assessment.previousAttempts !== "none"
          ? ["previous-attempts", "quit-experience"]
          : []),
        ...(assessment.methodsTried.length ? ["quit-experience"] : []),
        ...(assessment.packPrice !== undefined ? ["money"] : []),
        "personalised-approach",
        ...assessment.conditions,
        ...assessment.motivations,
      ]),
    );
  },
  goals: [
    {
      kind: "quit-date",
      title: "Choose a quit date",
      detail: "Pick a date and decide what support you want around it.",
      intentions: ["quit"],
    },
    {
      kind: "craving-plan",
      title: "Plan for one trigger",
      detail: "Choose a likely trigger and one response to try.",
      intentions: ["quit", "reduce"],
    },
    {
      kind: "delay-first",
      title: "Delay the first cigarette",
      detail: "Try moving the first cigarette a little later.",
      intentions: ["reduce"],
    },
    {
      kind: "smoke-free-space",
      title: "Make one situation smoke-free",
      detail: "Choose one place or routine where you will not smoke.",
      intentions: ["reduce"],
    },
    {
      kind: "support",
      title: "Explore professional support",
      detail:
        "Find out what an NHS stop smoking adviser or pharmacist can offer.",
      intentions: ["quit", "reduce", "learn"],
    },
    {
      kind: "learn-options",
      title: "Understand my options",
      detail: "Compare general evidence about support without choosing today.",
      intentions: ["learn"],
    },
  ],
  checkInFields: [
    "cigarettes",
    "craving",
    "confidence",
    "goalAttempted",
    "trigger",
    "win",
  ],
  coachingBoundaries: [
    "No diagnosis",
    "No symptom assessment",
    "No prescribing or personal medicine selection",
    "No emergencies",
    "No pregnancy pathway",
  ],
  resources: [
    {
      title: "NHS Better Health: Quit smoking",
      url: "https://www.nhs.uk/better-health/quit-smoking/",
      description: "National NHS information, tools and routes to support.",
    },
    {
      title: "NHS stop smoking services",
      url: "https://www.nhs.uk/live-well/quit-smoking/nhs-stop-smoking-services-help-you-quit/",
      description: "What local stop-smoking services offer.",
    },
    {
      title: "MPFT health and wellbeing resources",
      url: "https://www.mpft.nhs.uk/services/podiatry-adults/podiatry-adults-patient-information/health-and-wellbeing-resources",
      description:
        "Public MPFT page listing Staffordshire and Stoke-on-Trent support.",
    },
  ],
  outcomeMeasures: [
    "cigarettes per day",
    "quit attempts",
    "self-reported abstinent days",
    "goal attempts",
    "importance",
    "confidence",
  ],
};

export function calculatePackYears(
  cigarettesPerDay: number,
  yearsSmoked: number,
) {
  if (
    !Number.isFinite(cigarettesPerDay) ||
    !Number.isFinite(yearsSmoked) ||
    cigarettesPerDay < 0 ||
    yearsSmoked < 0
  )
    return 0;
  return Math.round((cigarettesPerDay / 20) * yearsSmoked * 10) / 10;
}

export function calculateDailyCost(
  cigarettesPerDay: number,
  packPrice?: number,
) {
  if (
    packPrice === undefined ||
    !Number.isFinite(packPrice) ||
    !Number.isFinite(cigarettesPerDay) ||
    packPrice < 0 ||
    cigarettesPerDay < 0
  )
    return undefined;
  return Math.round((cigarettesPerDay / 20) * packPrice * 100) / 100;
}

export function calculateProgress(
  baseline: number,
  checkIns: { cigarettes: number }[],
  packPrice?: number,
) {
  const safeBaseline = Number.isFinite(baseline) && baseline >= 0 ? baseline : 0;
  const avoided = checkIns.reduce(
    (sum, item) =>
      Number.isFinite(item.cigarettes) && item.cigarettes >= 0
        ? sum + Math.max(0, safeBaseline - item.cigarettes)
        : sum,
    0,
  );
  const money =
    packPrice !== undefined && Number.isFinite(packPrice) && packPrice >= 0
    ? Math.round(avoided * (packPrice / 20) * 100) / 100
    : undefined;
  return { avoided, money };
}
