import { claimsForIntent, coachingIntents, type ReleasedClaim } from "@/src/coaching/catalogue";

export async function evidenceLibrary(studyId: string, participantIsSynthetic: boolean) {
  const bundles = await Promise.all(coachingIntents.map((intent) => claimsForIntent({ studyId, participantIsSynthetic, intent })));
  const claims = new Map<string, ReleasedClaim>();
  for (const bundle of bundles) for (const claim of bundle.claims) claims.set(claim.claimId, claim);
  return {
    releaseVersion: bundles.find((bundle) => bundle.releaseVersion)?.releaseVersion ?? null,
    releaseStatus: bundles.find((bundle) => bundle.releaseStatus)?.releaseStatus ?? null,
    claims: [...claims.values()],
  };
}
