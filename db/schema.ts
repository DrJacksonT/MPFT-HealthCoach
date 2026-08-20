import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const identity = pgSchema("identity");
export const research = pgSchema("research");
export const safety = pgSchema("safety");
export const coaching = pgSchema("coaching");
export const operations = pgSchema("operations");

export const studies = pgTable(
  "studies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    title: text("title").notNull(),
    intervention: text("intervention").notNull(),
    status: text("status").notNull().default("draft"),
    syntheticOnly: boolean("synthetic_only").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (t) => [
    uniqueIndex("studies_code_unique").on(t.code),
    check("studies_intervention_check", sql`${t.intervention} in ('smoking', 'gambling')`),
  ],
);

export const studyVersions = pgTable(
  "study_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    protocolReference: text("protocol_reference").notNull(),
    protocolStatus: text("protocol_status").notNull().default("draft"),
    settings: jsonb("settings").$type<Record<string, unknown>>().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [uniqueIndex("study_versions_study_version_unique").on(t.studyId, t.version)],
);

export const contentVersions = pgTable(
  "content_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    locale: text("locale").notNull().default("en-GB"),
    version: integer("version").notNull(),
    title: text("title").notNull(),
    body: jsonb("body").$type<Record<string, unknown>>().notNull(),
    status: text("status").notNull().default("draft"),
    approvedByUserId: uuid("approved_by_user_id"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [uniqueIndex("content_versions_identity_unique").on(t.studyId, t.kind, t.locale, t.version)],
);

export const supportResources = pgTable(
  "support_resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    url: text("url"),
    telephone: text("telephone"),
    availability: text("availability"),
    urgent: boolean("urgent").notNull().default(false),
    version: integer("version").notNull(),
    active: boolean("active").notNull().default(true),
    reviewDueAt: timestamp("review_due_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [uniqueIndex("support_resources_code_version_unique").on(t.studyId, t.code, t.version)],
);

export const releases = pgTable(
  "releases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id, { onDelete: "cascade" }),
    studyVersionId: uuid("study_version_id").notNull().references(() => studyVersions.id),
    releaseType: text("release_type").notNull(),
    version: text("version").notNull(),
    environment: text("environment").notNull(),
    status: text("status").notNull().default("draft"),
    manifest: jsonb("manifest").$type<Record<string, unknown>>().notNull(),
    authorisedByUserId: uuid("authorised_by_user_id"),
    authorisedAt: timestamp("authorised_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [
    uniqueIndex("releases_identity_unique").on(t.studyId, t.releaseType, t.version, t.environment),
    check("releases_status_check", sql`${t.status} in ('draft', 'authorised', 'revoked')`),
  ],
);

export const users = identity.table(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: text("status").notNull().default("invited"),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    lastSignedInAt: timestamp("last_signed_in_at", { withTimezone: true }),
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [check("users_status_check", sql`${t.status} in ('invited', 'active', 'suspended', 'withdrawn', 'deleted')`)],
);

export const contactIdentities = identity.table(
  "contact_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    normalisedValue: text("normalised_value").notNull(),
    displayValue: text("display_value").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [
    uniqueIndex("contact_identities_kind_value_unique").on(t.kind, t.normalisedValue),
    index("contact_identities_user_idx").on(t.userId),
  ],
);

export const invitations = identity.table(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    intendedRole: text("intended_role").notNull().default("participant"),
    contactHint: text("contact_hint"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    maxUses: integer("max_uses").notNull().default(1),
    usedCount: integer("used_count").notNull().default(0),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt,
  },
  (t) => [uniqueIndex("invitations_code_hash_unique").on(t.codeHash), index("invitations_study_idx").on(t.studyId)],
);

export const invitationUses = identity.table(
  "invitation_uses",
  {
    invitationId: uuid("invitation_id").notNull().references(() => invitations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.invitationId, t.userId] })],
);

export const userRoles = identity.table(
  "user_roles",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    studyId: uuid("study_id").notNull().references(() => studies.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    grantedByUserId: uuid("granted_by_user_id").references(() => users.id),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.studyId, t.role] }),
    check("user_roles_role_check", sql`${t.role} in ('participant', 'researcher', 'safety_reviewer', 'evidence_reviewer', 'administrator')`),
  ],
);

export const sessions = identity.table(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    csrfSecretHash: text("csrf_secret_hash").notNull(),
    assuranceLevel: integer("assurance_level").notNull().default(1),
    ipHash: text("ip_hash"),
    userAgentHash: text("user_agent_hash"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [uniqueIndex("sessions_token_hash_unique").on(t.tokenHash), index("sessions_user_expiry_idx").on(t.userId, t.expiresAt)],
);

export const oneTimeTokens = identity.table(
  "one_time_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    purpose: text("purpose").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [uniqueIndex("one_time_tokens_hash_unique").on(t.tokenHash), index("one_time_tokens_user_purpose_idx").on(t.userId, t.purpose)],
);

export const mfaCredentials = identity.table(
  "mfa_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    method: text("method").notNull(),
    encryptedSecret: text("encrypted_secret").notNull(),
    label: text("label").notNull(),
    enabledAt: timestamp("enabled_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [uniqueIndex("mfa_credentials_user_method_unique").on(t.userId, t.method)],
);

export const participants = research.table(
  "participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    participantCode: text("participant_code").notNull(),
    synthetic: boolean("synthetic").notNull().default(true),
    status: text("status").notNull().default("registered"),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
    withdrawalScope: text("withdrawal_scope"),
    deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [
    uniqueIndex("participants_study_code_unique").on(t.studyId, t.participantCode),
    uniqueIndex("participants_study_user_unique").on(t.studyId, t.userId),
    index("participants_study_status_idx").on(t.studyId, t.status),
  ],
);

export const eligibilityAssessments = research.table("eligibility_assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  participantId: uuid("participant_id").notNull().references(() => participants.id),
  studyVersionId: uuid("study_version_id").notNull().references(() => studyVersions.id),
  answers: jsonb("answers").$type<Record<string, unknown>>().notNull(),
  outcome: text("outcome").notNull(),
  reasonCodes: jsonb("reason_codes").$type<string[]>().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const consents = research.table("consents", {
  id: uuid("id").primaryKey().defaultRandom(),
  participantId: uuid("participant_id").notNull().references(() => participants.id),
  informationContentId: uuid("information_content_id").notNull().references(() => contentVersions.id),
  consentContentId: uuid("consent_content_id").notNull().references(() => contentVersions.id),
  decision: text("decision").notNull(),
  items: jsonb("items").$type<Array<{ code: string; accepted: boolean }>>().notNull(),
  optionalAiText: boolean("optional_ai_text").notNull().default(false),
  optionalContact: boolean("optional_contact").notNull().default(false),
  decidedAt: timestamp("decided_at", { withTimezone: true }).notNull().defaultNow(),
  withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
});

export const baselines = research.table(
  "baselines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id").notNull().references(() => participants.id),
    studyVersionId: uuid("study_version_id").notNull().references(() => studyVersions.id),
    smoking: jsonb("smoking").$type<Record<string, unknown>>(),
    gambling: jsonb("gambling").$type<Record<string, unknown>>(),
    wellbeing: jsonb("wellbeing").$type<Record<string, unknown>>(),
    demographics: jsonb("demographics").$type<Record<string, unknown>>(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("baselines_participant_version_unique").on(t.participantId, t.studyVersionId)],
);

export const plans = research.table("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  participantId: uuid("participant_id").notNull().references(() => participants.id),
  status: text("status").notNull().default("active"),
  currentVersion: integer("current_version").notNull().default(1),
  createdAt,
  updatedAt,
});

export const planVersions = research.table(
  "plan_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    goalType: text("goal_type").notNull(),
    targetDate: date("target_date"),
    motivations: jsonb("motivations").$type<string[]>().notNull(),
    triggers: jsonb("triggers").$type<string[]>().notNull(),
    copingActions: jsonb("coping_actions").$type<string[]>().notNull(),
    supportChoices: jsonb("support_choices").$type<string[]>().notNull(),
    medicationDiscussion: text("medication_discussion"),
    revisionReason: text("revision_reason"),
    createdAt,
  },
  (t) => [uniqueIndex("plan_versions_plan_version_unique").on(t.planId, t.version)],
);

export const checkIns = research.table(
  "check_ins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id").notNull().references(() => participants.id),
    intervention: text("intervention").notNull(),
    scheduledFor: date("scheduled_for").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: text("status").notNull().default("scheduled"),
    cigarettes: integer("cigarettes"),
    smokingStatus: text("smoking_status"),
    craving: integer("craving"),
    confidence: integer("confidence"),
    goalAttempted: boolean("goal_attempted"),
    gamblingOccurred: boolean("gambling_occurred"),
    gamblingUrge: integer("gambling_urge"),
    gamblingEpisodes: integer("gambling_episodes"),
    moneyGambledPence: integer("money_gambled_pence"),
    gamblingLossPence: integer("gambling_loss_pence"),
    currency: text("currency"),
    chasing: boolean("chasing"),
    distress: integer("distress"),
    financialProtectionCodes: jsonb("financial_protection_codes").$type<string[]>(),
    triggerCodes: jsonb("trigger_codes").$type<string[]>(),
    copingActionCodes: jsonb("coping_action_codes").$type<string[]>(),
    positiveMomentCode: text("positive_moment_code"),
    freeTextPresent: boolean("free_text_present").notNull().default(false),
    createdAt,
  },
  (t) => [
    uniqueIndex("check_ins_participant_date_intervention_unique").on(t.participantId, t.scheduledFor, t.intervention),
    index("check_ins_status_date_idx").on(t.status, t.scheduledFor),
  ],
);

export const progressStatuses = research.table(
  "progress_statuses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id").notNull().references(() => participants.id),
    statusDate: date("status_date").notNull(),
    intervention: text("intervention").notNull(),
    participantConfirmedStatus: text("participant_confirmed_status"),
    sourceCheckInId: uuid("source_check_in_id").references(() => checkIns.id),
    missing: boolean("missing").notNull().default(true),
    createdAt,
  },
  (t) => [uniqueIndex("progress_statuses_identity_unique").on(t.participantId, t.statusDate, t.intervention)],
);

export const outcomeAssessments = research.table(
  "outcome_assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id").notNull().references(() => participants.id),
    timepoint: text("timepoint").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    windowOpensAt: timestamp("window_opens_at", { withTimezone: true }).notNull(),
    windowClosesAt: timestamp("window_closes_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    selfReport: jsonb("self_report").$type<Record<string, unknown>>(),
    biochemicalVerification: jsonb("biochemical_verification").$type<Record<string, unknown>>(),
    verificationStatus: text("verification_status").notNull().default("not_requested"),
    createdAt,
  },
  (t) => [uniqueIndex("outcome_assessments_participant_timepoint_unique").on(t.participantId, t.timepoint)],
);

export const referrals = research.table("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  participantId: uuid("participant_id").notNull().references(() => participants.id),
  resourceId: uuid("resource_id").notNull().references(() => supportResources.id),
  offeredAt: timestamp("offered_at", { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  usedAt: timestamp("used_at", { withTimezone: true }),
  source: text("source").notNull(),
  createdAt,
});

export const participantRequests = research.table(
  "participant_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id").notNull().references(() => participants.id),
    requestType: text("request_type").notNull(),
    status: text("status").notNull().default("requested"),
    details: jsonb("details").$type<Record<string, unknown>>().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [index("participant_requests_participant_status_idx").on(t.participantId, t.status)],
);

export const surveyDefinitions = research.table(
  "survey_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id),
    code: text("code").notNull(),
    name: text("name").notNull(),
    purpose: text("purpose").notNull(),
    licenceStatus: text("licence_status").notNull(),
    createdAt,
  },
  (t) => [uniqueIndex("survey_definitions_study_code_unique").on(t.studyId, t.code)],
);

export const measureRegistry = research.table(
  "measure_registry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id),
    code: text("code").notNull(),
    name: text("name").notNull(),
    module: text("module").notNull(),
    status: text("status").notNull().default("candidate"),
    licenceStatus: text("licence_status").notNull(),
    wordingApproved: boolean("wording_approved").notNull().default(false),
    scoringApproved: boolean("scoring_approved").notNull().default(false),
    protocolApproved: boolean("protocol_approved").notNull().default(false),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    notes: text("notes").notNull(),
    createdAt,
    updatedAt,
  },
  (t) => [
    uniqueIndex("measure_registry_study_code_unique").on(t.studyId, t.code),
    check("measure_registry_module_check", sql`${t.module} in ('smoking', 'gambling', 'cross_module')`),
    check("measure_registry_status_check", sql`${t.status} in ('candidate', 'approved', 'rejected', 'retired')`),
  ],
);

export const surveyVersions = research.table(
  "survey_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    surveyDefinitionId: uuid("survey_definition_id").notNull().references(() => surveyDefinitions.id),
    version: integer("version").notNull(),
    status: text("status").notNull().default("draft"),
    instructions: text("instructions").notNull(),
    scoringDefinition: jsonb("scoring_definition").$type<Record<string, unknown>>(),
    attribution: text("attribution"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [uniqueIndex("survey_versions_definition_version_unique").on(t.surveyDefinitionId, t.version)],
);

export const surveyQuestions = research.table(
  "survey_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    surveyVersionId: uuid("survey_version_id").notNull().references(() => surveyVersions.id),
    code: text("code").notNull(),
    position: integer("position").notNull(),
    prompt: text("prompt").notNull(),
    responseType: text("response_type").notNull(),
    required: boolean("required").notNull().default(false),
    responseOptions: jsonb("response_options").$type<unknown[]>(),
    safetyTag: text("safety_tag"),
    createdAt,
  },
  (t) => [
    uniqueIndex("survey_questions_version_code_unique").on(t.surveyVersionId, t.code),
    uniqueIndex("survey_questions_version_position_unique").on(t.surveyVersionId, t.position),
  ],
);

export const surveySchedules = research.table("survey_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  studyVersionId: uuid("study_version_id").notNull().references(() => studyVersions.id),
  surveyVersionId: uuid("survey_version_id").notNull().references(() => surveyVersions.id),
  trigger: text("trigger").notNull(),
  triggerOffsetDays: integer("trigger_offset_days").notNull().default(0),
  openDays: integer("open_days").notNull().default(7),
  samplingRate: numeric("sampling_rate", { precision: 5, scale: 4 }).notNull().default("1"),
  maxInstances: integer("max_instances").notNull().default(1),
  active: boolean("active").notNull().default(true),
  createdAt,
});

export const surveyInstances = research.table(
  "survey_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id").notNull().references(() => participants.id),
    surveyScheduleId: uuid("survey_schedule_id").notNull().references(() => surveySchedules.id),
    surveyVersionId: uuid("survey_version_id").notNull().references(() => surveyVersions.id),
    status: text("status").notNull().default("available"),
    windowOpensAt: timestamp("window_opens_at", { withTimezone: true }).notNull(),
    windowClosesAt: timestamp("window_closes_at", { withTimezone: true }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    snoozedUntil: timestamp("snoozed_until", { withTimezone: true }),
    score: jsonb("score").$type<Record<string, unknown>>(),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("survey_instances_participant_status_idx").on(t.participantId, t.status),
    uniqueIndex("survey_instances_participant_schedule_unique").on(t.participantId, t.surveyScheduleId),
  ],
);

export const surveyAnswers = research.table(
  "survey_answers",
  {
    surveyInstanceId: uuid("survey_instance_id").notNull().references(() => surveyInstances.id, { onDelete: "cascade" }),
    questionId: uuid("question_id").notNull().references(() => surveyQuestions.id),
    value: jsonb("value").$type<unknown>().notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.surveyInstanceId, t.questionId] })],
);

export const surveyEvents = research.table("survey_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyInstanceId: uuid("survey_instance_id").notNull().references(() => surveyInstances.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const safetyFlags = safety.table(
  "flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id").notNull().references(() => participants.id),
    sourceType: text("source_type").notNull(),
    sourceId: uuid("source_id"),
    category: text("category").notNull(),
    severity: text("severity").notNull(),
    ruleVersion: text("rule_version").notNull(),
    status: text("status").notNull().default("open"),
    participantMessageCode: text("participant_message_code").notNull(),
    createdAt,
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [index("safety_flags_status_created_idx").on(t.status, t.createdAt)],
);

export const safetyReviews = safety.table("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  flagId: uuid("flag_id").notNull().references(() => safetyFlags.id),
  reviewerUserId: uuid("reviewer_user_id").notNull().references(() => users.id),
  outcome: text("outcome").notNull(),
  note: text("note").notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const evidenceReleases = coaching.table(
  "evidence_releases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id),
    version: text("version").notNull(),
    status: text("status").notNull().default("draft"),
    manifestHash: text("manifest_hash").notNull(),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [uniqueIndex("evidence_releases_study_version_unique").on(t.studyId, t.version)],
);

export const evidenceClaims = coaching.table(
  "evidence_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    evidenceReleaseId: uuid("evidence_release_id").notNull().references(() => evidenceReleases.id),
    claimId: text("claim_id").notNull(),
    intent: text("intent").notNull(),
    wording: text("wording").notNull(),
    certainty: text("certainty").notNull(),
    citationIds: jsonb("citation_ids").$type<string[]>().notNull(),
    createdAt,
  },
  (t) => [uniqueIndex("evidence_claims_release_claim_unique").on(t.evidenceReleaseId, t.claimId)],
);

export const evidenceSources = coaching.table(
  "evidence_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: text("source_id").notNull(),
    module: text("module").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    exactLocator: text("exact_locator").notNull(),
    provenance: jsonb("provenance").$type<Record<string, unknown>>().notNull(),
    applicability: text("applicability").notNull(),
    limitations: text("limitations").notNull(),
    status: text("status").notNull().default("draft"),
    active: boolean("active").notNull().default(false),
    reviewDueAt: timestamp("review_due_at", { withTimezone: true }),
    supersededById: uuid("superseded_by_id"),
    createdAt,
    updatedAt,
  },
  (t) => [
    uniqueIndex("evidence_sources_source_id_unique").on(t.sourceId),
    check("evidence_sources_status_check", sql`${t.status} in ('draft', 'in_review', 'verified', 'rejected', 'superseded', 'expired')`),
  ],
);

export const evidencePassages = coaching.table(
  "evidence_passages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id").notNull().references(() => evidenceSources.id),
    locator: text("locator").notNull(),
    passageHash: text("passage_hash").notNull(),
    reviewedSummary: text("reviewed_summary").notNull(),
    createdAt,
  },
  (t) => [uniqueIndex("evidence_passages_source_locator_unique").on(t.sourceId, t.locator)],
);

export const evidenceClaimPassages = coaching.table(
  "evidence_claim_passages",
  {
    claimId: uuid("claim_id").notNull().references(() => evidenceClaims.id, { onDelete: "cascade" }),
    passageId: uuid("passage_id").notNull().references(() => evidencePassages.id),
    relationship: text("relationship").notNull().default("supports"),
  },
  (t) => [primaryKey({ columns: [t.claimId, t.passageId] })],
);

export const evidenceReviewDecisions = coaching.table(
  "evidence_review_decisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reviewerUserId: uuid("reviewer_user_id").notNull().references(() => users.id),
    decision: text("decision").notNull(),
    rationale: text("rationale").notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("evidence_review_target_idx").on(t.targetType, t.targetId),
    check("evidence_review_decision_check", sql`${t.decision} in ('verified', 'rejected', 'returned_for_changes', 'superseded', 'expired')`),
  ],
);

export const coachInteractions = coaching.table(
  "interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id").notNull().references(() => participants.id),
    studyVersionId: uuid("study_version_id").notNull().references(() => studyVersions.id),
    releaseId: uuid("release_id").references(() => releases.id),
    evidenceReleaseId: uuid("evidence_release_id").references(() => evidenceReleases.id),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    promptVersion: text("prompt_version").notNull(),
    rulesVersion: text("rules_version").notNull(),
    schemaVersion: text("schema_version").notNull(),
    intent: text("intent").notNull(),
    claimIds: jsonb("claim_ids").$type<string[]>().notNull(),
    inputSafety: jsonb("input_safety").$type<Record<string, unknown>>().notNull(),
    outputSafety: jsonb("output_safety").$type<Record<string, unknown>>().notNull(),
    outcome: text("outcome").notNull(),
    fallbackReason: text("fallback_reason"),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    costUsd: numeric("cost_usd", { precision: 12, scale: 8 }).notNull().default("0"),
    latencyMs: integer("latency_ms").notNull().default(0),
    createdAt,
  },
  (t) => [index("coach_interactions_participant_time_idx").on(t.participantId, t.createdAt)],
);

export const coachMessages = coaching.table("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  interactionId: uuid("interaction_id").notNull().references(() => coachInteractions.id),
  role: text("role").notNull(),
  encryptedBody: text("encrypted_body").notNull(),
  encryptionKeyVersion: text("encryption_key_version").notNull(),
  retentionUntil: timestamp("retention_until", { withTimezone: true }).notNull(),
  createdAt,
});

export const rateLimits = operations.table(
  "rate_limits",
  {
    keyHash: text("key_hash").notNull(),
    bucket: text("bucket").notNull(),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
    updatedAt,
  },
  (t) => [primaryKey({ columns: [t.keyHash, t.bucket, t.windowStartedAt] })],
);

export const costLedger = operations.table("cost_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  studyId: uuid("study_id").notNull().references(() => studies.id),
  participantId: uuid("participant_id").references(() => participants.id),
  interactionId: uuid("interaction_id").references(() => coachInteractions.id),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  costUsd: numeric("cost_usd", { precision: 12, scale: 8 }).notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiBudgetCounters = operations.table("ai_budget_counters", {
  studyId: uuid("study_id").primaryKey().references(() => studies.id),
  budgetUsd: numeric("budget_usd", { precision: 12, scale: 8 }).notNull(),
  reservedUsd: numeric("reserved_usd", { precision: 12, scale: 8 }).notNull().default("0"),
  spentUsd: numeric("spent_usd", { precision: 12, scale: 8 }).notNull().default("0"),
  updatedAt,
});

export const aiBudgetReservations = operations.table(
  "ai_budget_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id),
    reservedUsd: numeric("reserved_usd", { precision: 12, scale: 8 }).notNull(),
    actualCostUsd: numeric("actual_cost_usd", { precision: 12, scale: 8 }),
    status: text("status").notNull().default("reserved"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    settledAt: timestamp("settled_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [
    index("ai_budget_reservations_study_status_idx").on(t.studyId, t.status),
    check("ai_budget_reservations_status_check", sql`${t.status} in ('reserved', 'settled', 'released')`),
  ],
);

export const auditChainHeads = operations.table("audit_chain_heads", {
  chainId: text("chain_id").primaryKey(),
  currentHash: text("current_hash").notNull().default("GENESIS"),
  updatedAt,
});

export const auditEvents = operations.table(
  "audit_events",
  {
    sequence: bigint("sequence", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    studyId: uuid("study_id").references(() => studies.id),
    participantId: uuid("participant_id").references(() => participants.id),
    eventType: text("event_type").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    outcome: text("outcome").notNull(),
    reason: text("reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    previousEventHash: text("previous_event_hash"),
    eventHash: text("event_hash").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("audit_events_event_hash_unique").on(t.eventHash), index("audit_events_study_time_idx").on(t.studyId, t.occurredAt)],
);

export const exportRuns = operations.table("export_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  studyId: uuid("study_id").notNull().references(() => studies.id),
  requestedByUserId: uuid("requested_by_user_id").notNull().references(() => users.id),
  format: text("format").notNull(),
  scope: text("scope").notNull(),
  includesRawText: boolean("includes_raw_text").notNull().default(false),
  status: text("status").notNull().default("requested"),
  rowCount: integer("row_count"),
  contentHash: text("content_hash"),
  storageReference: text("storage_reference"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt,
});

export const retentionJobs = operations.table("retention_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  studyId: uuid("study_id").references(() => studies.id),
  jobType: text("job_type").notNull(),
  dryRun: boolean("dry_run").notNull().default(true),
  status: text("status").notNull().default("pending"),
  affectedRows: integer("affected_rows").notNull().default(0),
  details: jsonb("details").$type<Record<string, unknown>>().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt,
});

export const productEvents = operations.table(
  "product_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id),
    participantId: uuid("participant_id").references(() => participants.id),
    sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "set null" }),
    eventName: text("event_name").notNull(),
    taxonomyVersion: integer("taxonomy_version").notNull().default(1),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id"),
    idempotencyKey: text("idempotency_key").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
  },
  (t) => [
    uniqueIndex("product_events_study_idempotency_unique").on(t.studyId, t.idempotencyKey),
    index("product_events_participant_time_idx").on(t.participantId, t.occurredAt),
  ],
);

export const dataQualityIssues = operations.table(
  "data_quality_issues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyId: uuid("study_id").notNull().references(() => studies.id),
    participantId: uuid("participant_id").references(() => participants.id),
    ruleCode: text("rule_code").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    severity: text("severity").notNull(),
    status: text("status").notNull().default("open"),
    details: jsonb("details").$type<Record<string, unknown>>().notNull(),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [
    uniqueIndex("data_quality_issue_identity_unique").on(t.studyId, t.ruleCode, t.entityType, t.entityId),
    index("data_quality_issue_status_idx").on(t.studyId, t.status),
  ],
);

export const dataQualityResolutions = operations.table("data_quality_resolutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: uuid("issue_id").notNull().references(() => dataQualityIssues.id),
  resolvedByUserId: uuid("resolved_by_user_id").notNull().references(() => users.id),
  outcome: text("outcome").notNull(),
  note: text("note").notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type Study = typeof studies.$inferSelect;
export type Session = typeof sessions.$inferSelect;
