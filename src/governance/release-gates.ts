import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { releases, studies } from "@/db/schema";
import { environment } from "@/src/config/environment";

export type GovernedCapability =
  | "participant_recruitment"
  | "live_ai"
  | "gambling_participant";

type ReleaseRecord = {
  status: string;
  authorisedByUserId: string | null;
  authorisedAt: Date | null;
  revokedAt: Date | null;
  manifest: Record<string, unknown>;
};

export type GateDecision = {
  allowed: boolean;
  reasons: string[];
};

export function evaluateGate(
  environmentEnabled: boolean,
  release: ReleaseRecord | null,
): GateDecision {
  const reasons: string[] = [];
  if (!environmentEnabled) reasons.push("environment_flag_disabled");
  if (!release) reasons.push("authorised_database_release_missing");
  if (release) {
    if (release.status !== "authorised") reasons.push("database_release_not_authorised");
    if (!release.authorisedByUserId || !release.authorisedAt)
      reasons.push("named_dated_authorisation_missing");
    if (release.revokedAt) reasons.push("database_release_revoked");
    if (release.manifest.governanceApproval !== true)
      reasons.push("governance_approval_missing");
    if (release.manifest.clinicalSafetyApproval !== true)
      reasons.push("clinical_safety_approval_missing");
    if (release.manifest.deploymentApproval !== true)
      reasons.push("deployment_approval_missing");
  }
  return { allowed: reasons.length === 0, reasons };
}

export async function releaseGate(
  capability: GovernedCapability,
  studyCode: string,
): Promise<GateDecision> {
  const env = environment();
  const environmentEnabled = {
    participant_recruitment: env.LIVE_PILOT_ENABLED,
    live_ai: env.LIVE_AI_ENABLED,
    gambling_participant: env.GAMBLING_PARTICIPANT_ENABLED,
  }[capability];
  const db = await getDb();
  const [release] = await db
    .select({
      status: releases.status,
      authorisedByUserId: releases.authorisedByUserId,
      authorisedAt: releases.authorisedAt,
      revokedAt: releases.revokedAt,
      manifest: releases.manifest,
    })
    .from(releases)
    .innerJoin(studies, eq(studies.id, releases.studyId))
    .where(
      and(
        eq(studies.code, studyCode),
        eq(releases.releaseType, capability),
        eq(releases.environment, env.RELEASE_ENVIRONMENT),
        isNull(releases.revokedAt),
      ),
    )
    .limit(1);
  return evaluateGate(environmentEnabled, release ?? null);
}
