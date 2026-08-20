import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { evidenceClaimPassages, evidenceClaims, evidencePassages, evidenceReleases, evidenceReviewDecisions, evidenceSources } from "@/db/schema";
import { evidenceRecords } from "@/src/data/evidence";

export const coachingIntents = ["craving", "plan", "setback", "motivation", "support"] as const;
export type CoachingIntent = (typeof coachingIntents)[number];

type StructuredAction = {
  code: string;
  title: string;
  detail: string;
};

type IntentContent = {
  title: string;
  introduction: string;
  question: string;
  actions: StructuredAction[];
};

export const intentContent: Record<CoachingIntent, IntentContent> = {
  craving: {
    title: "Get through the next few minutes",
    introduction: "You do not need to decide the whole day right now. Pick one small action and notice what changes.",
    question: "Which action feels easiest to try first?",
    actions: [
      { code: "delay-five", title: "Delay for five minutes", detail: "Set a short timer. Decide again when it ends." },
      { code: "change-place", title: "Change your surroundings", detail: "Move away from the cigarette, shop or usual smoking place if you safely can." },
      { code: "hands-busy", title: "Keep hands and mouth busy", detail: "Try a drink, sugar-free gum, a pen or another familiar alternative." },
      { code: "contact-support", title: "Contact someone", detail: "Message a person you trust or use your chosen stop-smoking support." },
    ],
  },
  plan: {
    title: "Plan for a trigger",
    introduction: "A specific if-then plan can make the next response easier to remember.",
    question: "What situation would be most useful to plan for?",
    actions: [
      { code: "spot-trigger", title: "Name the trigger", detail: "Choose one time, place, feeling or routine rather than trying to cover everything." },
      { code: "if-then", title: "Make an if-then plan", detail: "For example: if the trigger happens, then I will step outside, text someone or wait five minutes." },
      { code: "remove-cue", title: "Reduce a cue", detail: "Move cigarettes, lighters or ashtrays out of immediate reach if that suits your goal." },
    ],
  },
  setback: {
    title: "Reset without blame",
    introduction: "Smoking once or returning to smoking does not erase the work you have already done. Record what happened as accurately as you can, then choose the next step.",
    question: "What would make the next hour a little easier?",
    actions: [
      { code: "record-kindly", title: "Record it honestly", detail: "Use today’s check-in. Missing or difficult days are not treated as failure." },
      { code: "learn-one-thing", title: "Notice one useful detail", detail: "Think about what happened just before smoking, without judging yourself." },
      { code: "revise-plan", title: "Revise the plan", detail: "Keep the same goal or choose a smaller next step. You remain in control." },
    ],
  },
  motivation: {
    title: "Reconnect with what matters",
    introduction: "Motivation can move up and down. Your own reasons are more useful than a lecture.",
    question: "What would be different for you if this change became easier?",
    actions: [
      { code: "one-reason", title: "Choose one reason", detail: "Pick the reason that matters today, even if it is small." },
      { code: "confidence-step", title: "Shrink the next step", detail: "Choose an action that feels possible rather than aiming for a perfect day." },
      { code: "review-progress", title: "Review observed progress", detail: "Look at recorded days and missing days without filling in the gaps." },
    ],
  },
  support: {
    title: "Choose human support",
    introduction: "This research tool does not replace a stop-smoking adviser, pharmacist or GP. You can use structured support without using AI.",
    question: "Which kind of support would you be most comfortable trying?",
    actions: [
      { code: "stop-service", title: "Stop-smoking service", detail: "A trained adviser can discuss behavioural support and available treatment choices." },
      { code: "pharmacist", title: "Pharmacist or GP", detail: "Use a qualified professional for personal medicine, pregnancy or health questions." },
      { code: "trusted-person", title: "A person you trust", detail: "Tell them the specific kind of support you would find helpful." },
    ],
  },
};

export type ReleasedClaim = {
  claimId: string;
  wording: string;
  certainty: string;
  citations: Array<{ id: string; title: string; organisation: string; year: number; url: string }>;
};

export async function claimsForIntent(input: {
  studyId: string;
  participantIsSynthetic: boolean;
  intent: CoachingIntent;
}) {
  const db = await getDb();
  const allowedStatus = input.participantIsSynthetic ? "synthetic_test" : "verified";
  const rows = await db
    .select({
      claimRecordId: evidenceClaims.id,
      claimId: evidenceClaims.claimId,
      wording: evidenceClaims.wording,
      certainty: evidenceClaims.certainty,
      citationIds: evidenceClaims.citationIds,
      intents: evidenceClaims.intent,
      releaseId: evidenceReleases.id,
      releaseVersion: evidenceReleases.version,
      releaseStatus: evidenceReleases.status,
    })
    .from(evidenceClaims)
    .innerJoin(evidenceReleases, eq(evidenceReleases.id, evidenceClaims.evidenceReleaseId))
    .where(
      and(
        eq(evidenceReleases.studyId, input.studyId),
        eq(evidenceReleases.status, allowedStatus),
        input.participantIsSynthetic ? undefined : isNotNull(evidenceReleases.approvedAt),
        input.participantIsSynthetic ? undefined : isNotNull(evidenceReleases.approvedByUserId),
      ),
    )
    .orderBy(asc(evidenceClaims.claimId));

  const sources = new Map(evidenceRecords.map((record) => [record.id, record]));
  let liveEligibleClaimIds: Set<string> | null = null;
  if (!input.participantIsSynthetic && rows.length) {
    const claimRecordIds = rows.map((row) => row.claimRecordId);
    const [links, decisions] = await Promise.all([
      db
        .select({ claimId: evidenceClaimPassages.claimId, sourceId: evidenceSources.sourceId, sourceStatus: evidenceSources.status, sourceActive: evidenceSources.active, reviewDueAt: evidenceSources.reviewDueAt, exactLocator: evidenceSources.exactLocator, passageHash: evidencePassages.passageHash })
        .from(evidenceClaimPassages)
        .innerJoin(evidencePassages, eq(evidencePassages.id, evidenceClaimPassages.passageId))
        .innerJoin(evidenceSources, eq(evidenceSources.id, evidencePassages.sourceId))
        .where(inArray(evidenceClaimPassages.claimId, claimRecordIds)),
      db
        .select({ targetId: evidenceReviewDecisions.targetId })
        .from(evidenceReviewDecisions)
        .where(and(eq(evidenceReviewDecisions.targetType, "evidence_claim"), eq(evidenceReviewDecisions.decision, "verified"), inArray(evidenceReviewDecisions.targetId, claimRecordIds))),
    ]);
    const now = new Date();
    const reviewedClaims = new Set(decisions.map((decision) => decision.targetId));
    liveEligibleClaimIds = new Set(rows.filter((row) => {
      if (!reviewedClaims.has(row.claimRecordId)) return false;
      const claimLinks = links.filter((link) => link.claimId === row.claimRecordId && link.sourceStatus === "verified" && link.sourceActive && (!link.reviewDueAt || link.reviewDueAt >= now) && Boolean(link.exactLocator) && Boolean(link.passageHash));
      const linkedSourceIds = new Set(claimLinks.map((link) => link.sourceId));
      return row.citationIds.length > 0 && row.citationIds.every((sourceId) => linkedSourceIds.has(sourceId));
    }).map((row) => row.claimRecordId));
  }

  const claims = rows
    .filter((row) => !liveEligibleClaimIds || liveEligibleClaimIds.has(row.claimRecordId))
    .filter((row) => row.claimId && row.wording && row.certainty)
    .filter((row) => row.claimId && row.wording && row.certainty && row.citationIds.length > 0)
    .filter((row) => row.claimId && row.wording && row.certainty && row.citationIds.every((id) => sources.has(id)))
    .filter((row) => row.intents.split(",").includes(input.intent))
    .map((row): ReleasedClaim => ({
      claimId: row.claimId,
      wording: row.wording,
      certainty: row.certainty,
      citations: row.citationIds.map((id) => {
        const source = sources.get(id)!;
        return { id, title: source.title, organisation: source.organisation, year: source.publicationYear, url: source.url };
      }),
    }));
  return {
    releaseId: rows[0]?.releaseId ?? null,
    releaseVersion: rows[0]?.releaseVersion ?? null,
    releaseStatus: rows[0]?.releaseStatus ?? null,
    claims,
  };
}

export function structuredResponse(intent: CoachingIntent) {
  return intentContent[intent];
}
