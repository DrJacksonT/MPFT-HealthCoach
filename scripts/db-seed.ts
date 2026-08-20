import { hash } from "@node-rs/argon2";
import { sql } from "drizzle-orm";
import { closeDb, databaseKind, getDb } from "../db/index";
import {
  contactIdentities,
  baselines,
  checkIns,
  contentVersions,
  evidenceClaims,
  evidenceReleases,
  invitations,
  measureRegistry,
  mfaCredentials,
  outcomeAssessments,
  participants,
  releases,
  studies,
  studyVersions,
  supportResources,
  surveyDefinitions,
  surveyInstances,
  surveyQuestions,
  surveySchedules,
  surveyVersions,
  userRoles,
  users,
} from "../db/schema";
import { hashToken } from "../src/auth/crypto";
import { firstQueryRow } from "../db/query-result";

const ids = {
  smokingStudy: "10000000-0000-4000-8000-000000000001",
  smokingVersion: "10000000-0000-4000-8000-000000000002",
  gamblingStudy: "20000000-0000-4000-8000-000000000001",
  gamblingVersion: "20000000-0000-4000-8000-000000000002",
  participantUser: "30000000-0000-4000-8000-000000000001",
  participant: "30000000-0000-4000-8000-000000000002",
  gamblingParticipant: "30000000-0000-4000-8000-000000000003",
  researcher: "40000000-0000-4000-8000-000000000001",
  safetyReviewer: "40000000-0000-4000-8000-000000000002",
  evidenceReviewer: "40000000-0000-4000-8000-000000000003",
  administrator: "40000000-0000-4000-8000-000000000004",
  smokingInfo: "50000000-0000-4000-8000-000000000001",
  smokingConsent: "50000000-0000-4000-8000-000000000002",
  gamblingInfo: "50000000-0000-4000-8000-000000000003",
  gamblingConsent: "50000000-0000-4000-8000-000000000004",
  weeklySurvey: "60000000-0000-4000-8000-000000000001",
  weeklySurveyVersion: "60000000-0000-4000-8000-000000000002",
  week4Survey: "60000000-0000-4000-8000-000000000003",
  week4SurveyVersion: "60000000-0000-4000-8000-000000000004",
  weeklySchedule: "60000000-0000-4000-8000-000000000005",
  week4Schedule: "60000000-0000-4000-8000-000000000006",
  week12Schedule: "60000000-0000-4000-8000-000000000007",
  smokingEvidenceRelease: "70000000-0000-4000-8000-000000000001",
  behaviouralSupportClaim: "71000000-0000-4000-8000-000000000001",
  plannedReductionClaim: "71000000-0000-4000-8000-000000000002",
  supportChoiceClaim: "71000000-0000-4000-8000-000000000003",
} as const;

async function password(value: string) {
  return hash(value, {
    algorithm: 2,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  });
}

async function main() {
  const db = await getDb();
  const fictionalPassword = await password("Fictional-only-2026!");

  await db
    .insert(studies)
    .values([
      {
        id: ids.smokingStudy,
        code: "SMOKE-PILOT-SYNTHETIC",
        title: "Smoking behaviour-change technical pilot",
        intervention: "smoking",
        status: "staff_simulation",
        syntheticOnly: true,
      },
      {
        id: ids.gamblingStudy,
        code: "GAMBLE-STAFF-SIMULATION",
        title: "Gambling behaviour-change staff simulation",
        intervention: "gambling",
        status: "staff_simulation",
        syntheticOnly: true,
      },
    ])
    .onConflictDoUpdate({ target: studies.code, set: { syntheticOnly: true, status: "staff_simulation" } });

  await db
    .insert(studyVersions)
    .values([
      {
        id: ids.smokingVersion,
        studyId: ids.smokingStudy,
        version: 1,
        protocolReference: "SYNTHETIC-SMOKE-PROTOCOL-DRAFT-1",
        protocolStatus: "draft",
        settings: {
          liveRecruitment: false,
          liveAi: false,
          outcomeWeeks: [4, 12],
          dailyConfidenceScheduled: true,
          missingMeansUnknown: true,
        },
      },
      {
        id: ids.gamblingVersion,
        studyId: ids.gamblingStudy,
        version: 1,
        protocolReference: "SYNTHETIC-GAMBLING-PROTOCOL-DRAFT-1",
        protocolStatus: "draft",
        settings: {
          participantAccess: false,
          staffSimulationOnly: true,
          measureWordingApproved: false,
        },
      },
    ])
    .onConflictDoNothing();

  const staff = [
    [ids.researcher, "Fictional Researcher", "fictional.researcher@example.invalid"],
    [ids.safetyReviewer, "Fictional Safety Reviewer", "fictional.safety@example.invalid"],
    [ids.evidenceReviewer, "Fictional Evidence Reviewer", "fictional.evidence@example.invalid"],
    [ids.administrator, "Fictional Administrator", "fictional.admin@example.invalid"],
  ] as const;
  await db
    .insert(users)
    .values([
      {
        id: ids.participantUser,
        status: "active",
        displayName: "Fictional Participant Rowan",
        passwordHash: fictionalPassword,
        verifiedAt: new Date("2026-08-01T09:00:00Z"),
      },
      ...staff.map(([id, displayName]) => ({
        id,
        status: "active",
        displayName,
        passwordHash: fictionalPassword,
        verifiedAt: new Date("2026-08-01T09:00:00Z"),
      })),
    ])
    .onConflictDoUpdate({ target: users.id, set: { status: "active", passwordHash: fictionalPassword } });

  await db
    .insert(contactIdentities)
    .values([
      {
        userId: ids.participantUser,
        kind: "alias",
        normalisedValue: "rowan-fictional-01",
        displayValue: "rowan-fictional-01",
        verifiedAt: new Date("2026-08-01T09:00:00Z"),
      },
      ...staff.map(([id, , email]) => ({
        userId: id,
        kind: "email",
        normalisedValue: email,
        displayValue: email,
        verifiedAt: new Date("2026-08-01T09:00:00Z"),
      })),
    ])
    .onConflictDoNothing();

  const roles = [
    [ids.participantUser, ids.smokingStudy, "participant"],
    [ids.researcher, ids.smokingStudy, "researcher"],
    [ids.safetyReviewer, ids.smokingStudy, "safety_reviewer"],
    [ids.evidenceReviewer, ids.smokingStudy, "evidence_reviewer"],
    [ids.administrator, ids.smokingStudy, "administrator"],
    [ids.administrator, ids.gamblingStudy, "administrator"],
    [ids.researcher, ids.gamblingStudy, "researcher"],
    [ids.safetyReviewer, ids.gamblingStudy, "safety_reviewer"],
    [ids.evidenceReviewer, ids.gamblingStudy, "evidence_reviewer"],
  ] as const;
  await db
    .insert(userRoles)
    .values(roles.map(([userId, studyId, role]) => ({ userId, studyId, role, grantedByUserId: ids.administrator })))
    .onConflictDoNothing();

  await db
    .insert(participants)
    .values([
      {
        id: ids.participant,
        studyId: ids.smokingStudy,
        userId: ids.participantUser,
        participantCode: "SYN-P-0001",
        synthetic: true,
        status: "registered",
      },
      {
        id: ids.gamblingParticipant,
        studyId: ids.gamblingStudy,
        userId: ids.administrator,
        participantCode: "GAM-SIM-0001",
        synthetic: true,
        status: "active",
        enrolledAt: new Date("2026-08-01T09:00:00Z"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(baselines)
    .values({
      participantId: ids.gamblingParticipant,
      studyVersionId: ids.gamblingVersion,
      gambling: {
        gamblingDaysPast30: 12,
        episodesPast30: 18,
        moneyStakedPence: 42000,
        moneyLostPence: 18000,
        currency: "GBP",
        urge: 8,
        chasing: true,
        goalType: "stop",
        financialProtection: ["bank-block", "self-exclusion"],
        measureStatus: "custom-synthetic-fields-not-a-validated-scale",
      },
      wellbeing: { distress: 6, preferNotToAnswerAvailable: true },
    })
    .onConflictDoNothing();

  await db
    .insert(checkIns)
    .values([
      { participantId: ids.gamblingParticipant, intervention: "gambling", scheduledFor: "2026-08-18", completedAt: new Date("2026-08-18T20:00:00Z"), status: "completed", gamblingOccurred: true, gamblingUrge: 8, gamblingEpisodes: 2, moneyGambledPence: 4500, gamblingLossPence: 2200, currency: "GBP", chasing: true, distress: 7, financialProtectionCodes: ["bank-block-considered"], copingActionCodes: ["contact-support"] },
      { participantId: ids.gamblingParticipant, intervention: "gambling", scheduledFor: "2026-08-19", completedAt: new Date("2026-08-19T20:00:00Z"), status: "completed", gamblingOccurred: false, gamblingUrge: 6, gamblingEpisodes: 0, moneyGambledPence: 0, gamblingLossPence: 0, currency: "GBP", chasing: false, distress: 4, financialProtectionCodes: ["bank-block-active", "self-exclusion-active"], copingActionCodes: ["leave-device", "contact-support"] },
      { participantId: ids.gamblingParticipant, intervention: "gambling", scheduledFor: "2026-08-20", completedAt: new Date("2026-08-20T20:00:00Z"), status: "completed", gamblingOccurred: false, gamblingUrge: 4, gamblingEpisodes: 0, moneyGambledPence: 0, gamblingLossPence: 0, currency: "GBP", chasing: false, distress: 3, financialProtectionCodes: ["bank-block-active", "self-exclusion-active"], copingActionCodes: ["delay-ten", "trusted-person"] },
    ])
    .onConflictDoNothing();

  await db
    .insert(outcomeAssessments)
    .values({
      participantId: ids.gamblingParticipant,
      timepoint: "gambling-week-4-synthetic",
      dueAt: new Date("2026-08-20T12:00:00Z"),
      windowOpensAt: new Date("2026-08-17T12:00:00Z"),
      windowClosesAt: new Date("2026-08-27T12:00:00Z"),
      completedAt: new Date("2026-08-20T12:15:00Z"),
      selfReport: { gamblingDaysPast7: 1, episodesPast7: 2, moneyStakedPence: 4500, moneyLostPence: 2200, currency: "GBP", urge: 4, chasing: false, measureStatus: "custom-synthetic-fields-not-a-validated-scale" },
      verificationStatus: "not_applicable",
    })
    .onConflictDoNothing();

  await db
    .insert(mfaCredentials)
    .values(
      staff.map(([userId, displayName]) => ({
        userId,
        method: "totp",
        encryptedSecret: "development-only:JBSWY3DPEHPK3PXP",
        label: `${displayName} synthetic TOTP`,
        enabledAt: new Date("2026-08-01T09:00:00Z"),
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(invitations)
    .values([
      {
        studyId: ids.smokingStudy,
        codeHash: hashToken("SMOKE-FICTIONAL-2026"),
        intendedRole: "participant",
        contactHint: "fictional participant invitation",
        expiresAt: new Date("2030-01-01T00:00:00Z"),
        maxUses: 20,
        createdByUserId: ids.administrator,
      },
      {
        studyId: ids.gamblingStudy,
        codeHash: hashToken("GAMBLE-STAFF-ONLY-2026"),
        intendedRole: "researcher",
        contactHint: "staff simulation only",
        expiresAt: new Date("2030-01-01T00:00:00Z"),
        maxUses: 20,
        createdByUserId: ids.administrator,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(contentVersions)
    .values([
      {
        id: ids.smokingInfo,
        studyId: ids.smokingStudy,
        kind: "participant_information",
        version: 1,
        title: "Smoking study information — fictional technical pilot",
        body: { status: "draft", realRecruitment: false },
        status: "draft",
      },
      {
        id: ids.smokingConsent,
        studyId: ids.smokingStudy,
        kind: "consent",
        version: 1,
        title: "Smoking study consent — fictional technical pilot",
        body: { status: "draft", granular: true },
        status: "draft",
      },
      {
        id: ids.gamblingInfo,
        studyId: ids.gamblingStudy,
        kind: "participant_information",
        version: 1,
        title: "Gambling simulation information — staff only",
        body: { status: "draft", participantAccess: false },
        status: "draft",
      },
      {
        id: ids.gamblingConsent,
        studyId: ids.gamblingStudy,
        kind: "consent",
        version: 1,
        title: "Gambling simulation consent — not approved for participants",
        body: { status: "draft", participantAccess: false },
        status: "draft",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(supportResources)
    .values([
      {
        studyId: ids.smokingStudy,
        code: "nhs-better-health-smoking",
        name: "NHS Better Health quit-smoking support",
        description: "National information and routes to stop-smoking support.",
        url: "https://www.nhs.uk/better-health/quit-smoking/",
        availability: "Online",
        urgent: false,
        version: 1,
      },
      {
        studyId: ids.smokingStudy,
        code: "nhs-111",
        name: "NHS 111",
        description: "Urgent health advice when it is not a 999 emergency.",
        url: "https://111.nhs.uk/",
        telephone: "111",
        availability: "24 hours",
        urgent: true,
        version: 1,
      },
      {
        studyId: ids.gamblingStudy,
        code: "gamcare",
        name: "GamCare National Gambling Helpline",
        description: "Free information, advice and support about gambling harms.",
        url: "https://www.gamcare.org.uk/",
        telephone: "0808 8020 133",
        availability: "24 hours",
        urgent: true,
        version: 1,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(surveyDefinitions)
    .values([
      {
        id: ids.weeklySurvey,
        studyId: ids.smokingStudy,
        code: "weekly-pilot-experience",
        name: "Weekly pilot experience",
        purpose: "Usability, burden and perceived-safety feedback for the technical pilot.",
        licenceStatus: "original-custom-questions",
      },
      {
        id: ids.week4Survey,
        studyId: ids.smokingStudy,
        code: "follow-up-experience",
        name: "Follow-up experience",
        purpose: "Descriptive follow-up feedback; not a validated clinical measure.",
        licenceStatus: "original-custom-questions",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(measureRegistry)
    .values([
      {
        id: "60000000-0000-4000-8000-000000000010",
        studyId: ids.smokingStudy,
        code: "custom-pilot-experience-v1",
        name: "Custom pilot experience questions",
        module: "cross_module",
        status: "approved",
        licenceStatus: "original-custom-questions",
        wordingApproved: true,
        scoringApproved: true,
        protocolApproved: true,
        approvedByUserId: ids.administrator,
        approvedAt: new Date("2026-08-20T09:00:00Z"),
        notes: "Synthetic technical-test approval only. Descriptive scoring; not a validated instrument.",
      },
      {
        id: "60000000-0000-4000-8000-000000000011",
        studyId: ids.smokingStudy,
        code: "candidate-validated-measure",
        name: "Sponsor-selected validated experience measure",
        module: "cross_module",
        status: "candidate",
        licenceStatus: "licence-and-wording-not-confirmed",
        wordingApproved: false,
        scoringApproved: false,
        protocolApproved: false,
        notes: "Fail closed: no questionnaire wording is seeded until sponsor, licence and protocol approval are recorded.",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(surveyVersions)
    .values([
      {
        id: ids.weeklySurveyVersion,
        surveyDefinitionId: ids.weeklySurvey,
        version: 1,
        status: "approved_for_synthetic_test",
        instructions: "Answer only what you want to. You can save, snooze or skip. This is not monitored in real time.",
        scoringDefinition: { kind: "descriptive-only", validatedScale: false },
        attribution: "Original MPFT technical-pilot questions; no validated instrument claimed.",
        approvedAt: new Date("2026-08-20T09:00:00Z"),
      },
      {
        id: ids.week4SurveyVersion,
        surveyDefinitionId: ids.week4Survey,
        version: 1,
        status: "approved_for_synthetic_test",
        instructions: "These custom questions describe the fictional test experience and do not measure clinical effectiveness.",
        scoringDefinition: { kind: "descriptive-only", validatedScale: false },
        attribution: "Original MPFT technical-pilot questions; no validated instrument claimed.",
        approvedAt: new Date("2026-08-20T09:00:00Z"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(surveyQuestions)
    .values([
      { id: "61000000-0000-4000-8000-000000000001", surveyVersionId: ids.weeklySurveyVersion, code: "helpful", position: 1, prompt: "How helpful did the programme feel this week?", responseType: "likert-1-5", required: false },
      { id: "61000000-0000-4000-8000-000000000002", surveyVersionId: ids.weeklySurveyVersion, code: "easy", position: 2, prompt: "How easy was it to use?", responseType: "likert-1-5", required: false },
      { id: "61000000-0000-4000-8000-000000000003", surveyVersionId: ids.weeklySurveyVersion, code: "burden", position: 3, prompt: "How burdensome did the questions feel?", responseType: "likert-1-5", required: false },
      { id: "61000000-0000-4000-8000-000000000004", surveyVersionId: ids.weeklySurveyVersion, code: "unsafe-upsetting", position: 4, prompt: "Did anything feel unsafe or upsetting?", responseType: "yes-no", required: true, safetyTag: "unsafe_upsetting" },
      { id: "61000000-0000-4000-8000-000000000005", surveyVersionId: ids.weeklySurveyVersion, code: "optional-comment", position: 5, prompt: "Optional: add a short comment without names or urgent clinical information.", responseType: "short-text", required: false },
      { id: "62000000-0000-4000-8000-000000000001", surveyVersionId: ids.week4SurveyVersion, code: "would-use", position: 1, prompt: "Would you choose to use a programme like this again?", responseType: "yes-no-unsure", required: false },
      { id: "62000000-0000-4000-8000-000000000002", surveyVersionId: ids.week4SurveyVersion, code: "confidence-support", position: 2, prompt: "How confident did you feel using the structured coping options?", responseType: "scale-0-10", required: false },
      { id: "62000000-0000-4000-8000-000000000003", surveyVersionId: ids.week4SurveyVersion, code: "unsafe-upsetting", position: 3, prompt: "Did anything feel unsafe or upsetting?", responseType: "yes-no", required: true, safetyTag: "unsafe_upsetting" },
      { id: "62000000-0000-4000-8000-000000000004", surveyVersionId: ids.week4SurveyVersion, code: "preferred-route", position: 4, prompt: "Which type of support would you prefer next?", responseType: "single-choice", responseOptions: ["structured_tools", "human_support", "both", "none_now"], required: false },
      { id: "62000000-0000-4000-8000-000000000005", surveyVersionId: ids.week4SurveyVersion, code: "features-used", position: 5, prompt: "Which parts did you use?", responseType: "multiple-choice", responseOptions: ["plan", "check_ins", "progress", "structured_coaching", "evidence", "support_links"], required: false },
      { id: "62000000-0000-4000-8000-000000000006", surveyVersionId: ids.week4SurveyVersion, code: "technical-problems", position: 6, prompt: "How many technical problems did you notice?", responseType: "numeric", required: false },
    ])
    .onConflictDoNothing();

  await db
    .insert(surveySchedules)
    .values([
      { id: ids.weeklySchedule, studyVersionId: ids.smokingVersion, surveyVersionId: ids.weeklySurveyVersion, trigger: "enrolment", triggerOffsetDays: 7, openDays: 7, samplingRate: "1", maxInstances: 1 },
      { id: ids.week4Schedule, studyVersionId: ids.smokingVersion, surveyVersionId: ids.week4SurveyVersion, trigger: "enrolment", triggerOffsetDays: 28, openDays: 10, samplingRate: "1", maxInstances: 1 },
      { id: ids.week12Schedule, studyVersionId: ids.smokingVersion, surveyVersionId: ids.week4SurveyVersion, trigger: "enrolment", triggerOffsetDays: 84, openDays: 10, samplingRate: "1", maxInstances: 1 },
    ])
    .onConflictDoNothing();

  if (process.env.E2E_SEED_DUE === "true") {
    const now = new Date();
    await db
      .insert(surveyInstances)
      .values({
        id: "69000000-0000-4000-8000-000000000001",
        participantId: ids.participant,
        surveyScheduleId: ids.weeklySchedule,
        surveyVersionId: ids.weeklySurveyVersion,
        status: "available",
        windowOpensAt: new Date(now.getTime() - 60 * 60 * 1000),
        windowClosesAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      })
      .onConflictDoNothing();
    await db
      .insert(outcomeAssessments)
      .values({
        id: "69000000-0000-4000-8000-000000000002",
        participantId: ids.participant,
        timepoint: "week-4",
        dueAt: now,
        windowOpensAt: new Date(now.getTime() - 60 * 60 * 1000),
        windowClosesAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      })
      .onConflictDoNothing();
  }

  await db
    .insert(evidenceReleases)
    .values({
      id: ids.smokingEvidenceRelease,
      studyId: ids.smokingStudy,
      version: "synthetic-smoking-2026-08-20-v1",
      status: "synthetic_test",
      manifestHash: "0b5dc2b6eeecff701629120317b6587fba6f8d717af18f444b872520bf57dbb0",
    })
    .onConflictDoNothing();

  await db
    .insert(evidenceClaims)
    .values([
      {
        id: ids.behaviouralSupportClaim,
        evidenceReleaseId: ids.smokingEvidenceRelease,
        claimId: "smoking-behavioural-support-v1",
        intent: "craving,plan,setback,motivation",
        wording: "Behavioural support can improve the chance of stopping compared with minimal support, although results vary and cannot predict what will happen for one person.",
        certainty: "high",
        citationIds: ["cochrane-behaviour-2021"],
      },
      {
        id: ids.plannedReductionClaim,
        evidenceReleaseId: ids.smokingEvidenceRelease,
        claimId: "smoking-planned-reduction-v1",
        intent: "plan,motivation",
        wording: "For people who are not ready to stop in one go, NICE supports planned steps such as delaying the first cigarette or choosing smoke-free situations.",
        certainty: "high",
        citationIds: ["nice-ng209-reduction"],
      },
      {
        id: ids.supportChoiceClaim,
        evidenceReleaseId: ids.smokingEvidenceRelease,
        claimId: "smoking-support-choice-v1",
        intent: "support,plan",
        wording: "NICE recommends discussing behavioural support and stop-smoking options in a way that reflects the person's preferences and circumstances.",
        certainty: "high",
        citationIds: ["nice-ng209-options"],
      },
    ])
    .onConflictDoNothing();

  const releaseRows = [
    [ids.smokingStudy, ids.smokingVersion, "staff_simulation", "authorised"],
    [ids.smokingStudy, ids.smokingVersion, "participant_recruitment", "draft"],
    [ids.smokingStudy, ids.smokingVersion, "live_ai", "draft"],
    [ids.gamblingStudy, ids.gamblingVersion, "staff_simulation", "authorised"],
    [ids.gamblingStudy, ids.gamblingVersion, "gambling_participant", "draft"],
  ] as const;
  await db
    .insert(releases)
    .values(
      releaseRows.map(([studyId, studyVersionId, releaseType, status]) => ({
        studyId,
        studyVersionId,
        releaseType,
        version: "synthetic-1",
        environment: "local",
        status,
        manifest: {
          syntheticOnly: true,
          governanceApproval: false,
          clinicalSafetyApproval: false,
          deploymentApproval: false,
        },
        authorisedByUserId: status === "authorised" ? ids.administrator : null,
        authorisedAt: status === "authorised" ? new Date("2026-08-20T09:00:00Z") : null,
      })),
    )
    .onConflictDoNothing();

  const result = await db.execute(sql`
    select
      (select count(*)::int from studies) as studies,
      (select count(*)::int from identity.users) as users,
      (select count(*)::int from research.participants) as participants,
      (select count(*)::int from releases where status = 'authorised') as authorised_releases
  `);
  console.log(`Seeded ${databaseKind()} with fictional records:`, firstQueryRow<Record<string, unknown>>(result));
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Database seed failed.");
    process.exitCode = 1;
  })
  .finally(closeDb);
