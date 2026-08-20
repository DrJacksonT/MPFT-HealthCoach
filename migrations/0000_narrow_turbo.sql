CREATE SCHEMA "coaching";
--> statement-breakpoint
CREATE SCHEMA "identity";
--> statement-breakpoint
CREATE SCHEMA "operations";
--> statement-breakpoint
CREATE SCHEMA "research";
--> statement-breakpoint
CREATE SCHEMA "safety";
--> statement-breakpoint
CREATE TABLE "operations"."audit_events" (
	"sequence" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "operations"."audit_events_sequence_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"actor_user_id" uuid,
	"study_id" uuid,
	"participant_id" uuid,
	"event_type" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"outcome" text NOT NULL,
	"reason" text,
	"metadata" jsonb NOT NULL,
	"previous_event_hash" text,
	"event_hash" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."baselines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"study_version_id" uuid NOT NULL,
	"smoking" jsonb,
	"gambling" jsonb,
	"wellbeing" jsonb,
	"demographics" jsonb,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"intervention" text NOT NULL,
	"scheduled_for" date NOT NULL,
	"completed_at" timestamp with time zone,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"cigarettes" integer,
	"smoking_status" text,
	"craving" integer,
	"confidence" integer,
	"goal_attempted" boolean,
	"gambling_occurred" boolean,
	"gambling_urge" integer,
	"money_gambled_pence" integer,
	"free_text_present" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching"."interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"study_version_id" uuid NOT NULL,
	"release_id" uuid,
	"evidence_release_id" uuid,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"rules_version" text NOT NULL,
	"schema_version" text NOT NULL,
	"intent" text NOT NULL,
	"claim_ids" jsonb NOT NULL,
	"input_safety" jsonb NOT NULL,
	"output_safety" jsonb NOT NULL,
	"outcome" text NOT NULL,
	"fallback_reason" text,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(12, 8) DEFAULT '0' NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching"."messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interaction_id" uuid NOT NULL,
	"role" text NOT NULL,
	"encrypted_body" text NOT NULL,
	"encryption_key_version" text NOT NULL,
	"retention_until" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"information_content_id" uuid NOT NULL,
	"consent_content_id" uuid NOT NULL,
	"decision" text NOT NULL,
	"items" jsonb NOT NULL,
	"optional_ai_text" boolean DEFAULT false NOT NULL,
	"optional_contact" boolean DEFAULT false NOT NULL,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL,
	"withdrawn_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "identity"."contact_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"normalised_value" text NOT NULL,
	"display_value" text NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"locale" text DEFAULT 'en-GB' NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"body" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"approved_by_user_id" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations"."cost_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"participant_id" uuid,
	"interaction_id" uuid,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"cost_usd" numeric(12, 8) NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."eligibility_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"study_version_id" uuid NOT NULL,
	"answers" jsonb NOT NULL,
	"outcome" text NOT NULL,
	"reason_codes" jsonb NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching"."evidence_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evidence_release_id" uuid NOT NULL,
	"claim_id" text NOT NULL,
	"intent" text NOT NULL,
	"wording" text NOT NULL,
	"certainty" text NOT NULL,
	"citation_ids" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching"."evidence_releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"version" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"manifest_hash" text NOT NULL,
	"approved_by_user_id" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations"."export_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"requested_by_user_id" uuid NOT NULL,
	"format" text NOT NULL,
	"scope" text NOT NULL,
	"includes_raw_text" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"row_count" integer,
	"content_hash" text,
	"storage_reference" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."invitation_uses" (
	"invitation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_uses_invitation_id_user_id_pk" PRIMARY KEY("invitation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "identity"."invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"intended_role" text DEFAULT 'participant' NOT NULL,
	"contact_hint" text,
	"expires_at" timestamp with time zone NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."mfa_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"method" text NOT NULL,
	"encrypted_secret" text NOT NULL,
	"label" text NOT NULL,
	"enabled_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."one_time_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."outcome_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"timepoint" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"window_opens_at" timestamp with time zone NOT NULL,
	"window_closes_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"self_report" jsonb,
	"biochemical_verification" jsonb,
	"verification_status" text DEFAULT 'not_requested' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"participant_code" text NOT NULL,
	"synthetic" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'registered' NOT NULL,
	"enrolled_at" timestamp with time zone,
	"withdrawn_at" timestamp with time zone,
	"withdrawal_scope" text,
	"deletion_requested_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."plan_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"goal_type" text NOT NULL,
	"target_date" date,
	"motivations" jsonb NOT NULL,
	"triggers" jsonb NOT NULL,
	"coping_actions" jsonb NOT NULL,
	"support_choices" jsonb NOT NULL,
	"medication_discussion" text,
	"revision_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"current_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."progress_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"status_date" date NOT NULL,
	"intervention" text NOT NULL,
	"participant_confirmed_status" text,
	"source_check_in_id" uuid,
	"missing" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations"."rate_limits" (
	"key_hash" text NOT NULL,
	"bucket" text NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rate_limits_key_hash_bucket_window_started_at_pk" PRIMARY KEY("key_hash","bucket","window_started_at")
);
--> statement-breakpoint
CREATE TABLE "research"."referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"resource_id" uuid NOT NULL,
	"offered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"used_at" timestamp with time zone,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"study_version_id" uuid NOT NULL,
	"release_type" text NOT NULL,
	"version" text NOT NULL,
	"environment" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"manifest" jsonb NOT NULL,
	"authorised_by_user_id" uuid,
	"authorised_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "releases_status_check" CHECK ("releases"."status" in ('draft', 'authorised', 'revoked'))
);
--> statement-breakpoint
CREATE TABLE "operations"."retention_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid,
	"job_type" text NOT NULL,
	"dry_run" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"affected_rows" integer DEFAULT 0 NOT NULL,
	"details" jsonb NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safety"."flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_id" uuid,
	"category" text NOT NULL,
	"severity" text NOT NULL,
	"rule_version" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"participant_message_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "safety"."reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flag_id" uuid NOT NULL,
	"reviewer_user_id" uuid NOT NULL,
	"outcome" text NOT NULL,
	"note" text NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"csrf_secret_hash" text NOT NULL,
	"assurance_level" integer DEFAULT 1 NOT NULL,
	"ip_hash" text,
	"user_agent_hash" text,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"intervention" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"synthetic_only" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studies_intervention_check" CHECK ("studies"."intervention" in ('smoking', 'gambling'))
);
--> statement-breakpoint
CREATE TABLE "study_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"protocol_reference" text NOT NULL,
	"protocol_status" text DEFAULT 'draft' NOT NULL,
	"settings" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"url" text,
	"telephone" text,
	"availability" text,
	"urgent" boolean DEFAULT false NOT NULL,
	"version" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"review_due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."survey_answers" (
	"survey_instance_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "survey_answers_survey_instance_id_question_id_pk" PRIMARY KEY("survey_instance_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "research"."survey_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"purpose" text NOT NULL,
	"licence_status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."survey_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_instance_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."survey_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"survey_schedule_id" uuid NOT NULL,
	"survey_version_id" uuid NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"window_opens_at" timestamp with time zone NOT NULL,
	"window_closes_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"snoozed_until" timestamp with time zone,
	"score" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."survey_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_version_id" uuid NOT NULL,
	"code" text NOT NULL,
	"position" integer NOT NULL,
	"prompt" text NOT NULL,
	"response_type" text NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"response_options" jsonb,
	"safety_tag" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."survey_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_version_id" uuid NOT NULL,
	"survey_version_id" uuid NOT NULL,
	"trigger" text NOT NULL,
	"trigger_offset_days" integer DEFAULT 0 NOT NULL,
	"open_days" integer DEFAULT 7 NOT NULL,
	"sampling_rate" numeric(5, 4) DEFAULT '1' NOT NULL,
	"max_instances" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research"."survey_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_definition_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"instructions" text NOT NULL,
	"scoring_definition" jsonb,
	"attribution" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."user_roles" (
	"user_id" uuid NOT NULL,
	"study_id" uuid NOT NULL,
	"role" text NOT NULL,
	"granted_by_user_id" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "user_roles_user_id_study_id_role_pk" PRIMARY KEY("user_id","study_id","role"),
	CONSTRAINT "user_roles_role_check" CHECK ("identity"."user_roles"."role" in ('participant', 'researcher', 'safety_reviewer', 'evidence_reviewer', 'administrator'))
);
--> statement-breakpoint
CREATE TABLE "identity"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"display_name" text NOT NULL,
	"password_hash" text,
	"verified_at" timestamp with time zone,
	"last_signed_in_at" timestamp with time zone,
	"password_changed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_status_check" CHECK ("identity"."users"."status" in ('invited', 'active', 'suspended', 'withdrawn', 'deleted'))
);
--> statement-breakpoint
ALTER TABLE "operations"."audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."audit_events" ADD CONSTRAINT "audit_events_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."audit_events" ADD CONSTRAINT "audit_events_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."baselines" ADD CONSTRAINT "baselines_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."baselines" ADD CONSTRAINT "baselines_study_version_id_study_versions_id_fk" FOREIGN KEY ("study_version_id") REFERENCES "public"."study_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."check_ins" ADD CONSTRAINT "check_ins_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."interactions" ADD CONSTRAINT "interactions_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."interactions" ADD CONSTRAINT "interactions_study_version_id_study_versions_id_fk" FOREIGN KEY ("study_version_id") REFERENCES "public"."study_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."interactions" ADD CONSTRAINT "interactions_release_id_releases_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."interactions" ADD CONSTRAINT "interactions_evidence_release_id_evidence_releases_id_fk" FOREIGN KEY ("evidence_release_id") REFERENCES "coaching"."evidence_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."messages" ADD CONSTRAINT "messages_interaction_id_interactions_id_fk" FOREIGN KEY ("interaction_id") REFERENCES "coaching"."interactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."consents" ADD CONSTRAINT "consents_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."consents" ADD CONSTRAINT "consents_information_content_id_content_versions_id_fk" FOREIGN KEY ("information_content_id") REFERENCES "public"."content_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."consents" ADD CONSTRAINT "consents_consent_content_id_content_versions_id_fk" FOREIGN KEY ("consent_content_id") REFERENCES "public"."content_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."contact_identities" ADD CONSTRAINT "contact_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."cost_ledger" ADD CONSTRAINT "cost_ledger_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."cost_ledger" ADD CONSTRAINT "cost_ledger_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."cost_ledger" ADD CONSTRAINT "cost_ledger_interaction_id_interactions_id_fk" FOREIGN KEY ("interaction_id") REFERENCES "coaching"."interactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."eligibility_assessments" ADD CONSTRAINT "eligibility_assessments_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."eligibility_assessments" ADD CONSTRAINT "eligibility_assessments_study_version_id_study_versions_id_fk" FOREIGN KEY ("study_version_id") REFERENCES "public"."study_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."evidence_claims" ADD CONSTRAINT "evidence_claims_evidence_release_id_evidence_releases_id_fk" FOREIGN KEY ("evidence_release_id") REFERENCES "coaching"."evidence_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."evidence_releases" ADD CONSTRAINT "evidence_releases_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."evidence_releases" ADD CONSTRAINT "evidence_releases_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."export_runs" ADD CONSTRAINT "export_runs_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."export_runs" ADD CONSTRAINT "export_runs_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."invitation_uses" ADD CONSTRAINT "invitation_uses_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "identity"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."invitation_uses" ADD CONSTRAINT "invitation_uses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."invitations" ADD CONSTRAINT "invitations_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."invitations" ADD CONSTRAINT "invitations_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."mfa_credentials" ADD CONSTRAINT "mfa_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."one_time_tokens" ADD CONSTRAINT "one_time_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."outcome_assessments" ADD CONSTRAINT "outcome_assessments_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."participants" ADD CONSTRAINT "participants_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."participants" ADD CONSTRAINT "participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."plan_versions" ADD CONSTRAINT "plan_versions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "research"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."plans" ADD CONSTRAINT "plans_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."progress_statuses" ADD CONSTRAINT "progress_statuses_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."progress_statuses" ADD CONSTRAINT "progress_statuses_source_check_in_id_check_ins_id_fk" FOREIGN KEY ("source_check_in_id") REFERENCES "research"."check_ins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."referrals" ADD CONSTRAINT "referrals_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."referrals" ADD CONSTRAINT "referrals_resource_id_support_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."support_resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "releases" ADD CONSTRAINT "releases_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "releases" ADD CONSTRAINT "releases_study_version_id_study_versions_id_fk" FOREIGN KEY ("study_version_id") REFERENCES "public"."study_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."retention_jobs" ADD CONSTRAINT "retention_jobs_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety"."flags" ADD CONSTRAINT "flags_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety"."reviews" ADD CONSTRAINT "reviews_flag_id_flags_id_fk" FOREIGN KEY ("flag_id") REFERENCES "safety"."flags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety"."reviews" ADD CONSTRAINT "reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_versions" ADD CONSTRAINT "study_versions_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_resources" ADD CONSTRAINT "support_resources_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_answers" ADD CONSTRAINT "survey_answers_survey_instance_id_survey_instances_id_fk" FOREIGN KEY ("survey_instance_id") REFERENCES "research"."survey_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_answers" ADD CONSTRAINT "survey_answers_question_id_survey_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "research"."survey_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_definitions" ADD CONSTRAINT "survey_definitions_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_events" ADD CONSTRAINT "survey_events_survey_instance_id_survey_instances_id_fk" FOREIGN KEY ("survey_instance_id") REFERENCES "research"."survey_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_instances" ADD CONSTRAINT "survey_instances_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_instances" ADD CONSTRAINT "survey_instances_survey_schedule_id_survey_schedules_id_fk" FOREIGN KEY ("survey_schedule_id") REFERENCES "research"."survey_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_instances" ADD CONSTRAINT "survey_instances_survey_version_id_survey_versions_id_fk" FOREIGN KEY ("survey_version_id") REFERENCES "research"."survey_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_questions" ADD CONSTRAINT "survey_questions_survey_version_id_survey_versions_id_fk" FOREIGN KEY ("survey_version_id") REFERENCES "research"."survey_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_schedules" ADD CONSTRAINT "survey_schedules_study_version_id_study_versions_id_fk" FOREIGN KEY ("study_version_id") REFERENCES "public"."study_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_schedules" ADD CONSTRAINT "survey_schedules_survey_version_id_survey_versions_id_fk" FOREIGN KEY ("survey_version_id") REFERENCES "research"."survey_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."survey_versions" ADD CONSTRAINT "survey_versions_survey_definition_id_survey_definitions_id_fk" FOREIGN KEY ("survey_definition_id") REFERENCES "research"."survey_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_granted_by_user_id_users_id_fk" FOREIGN KEY ("granted_by_user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "audit_events_event_hash_unique" ON "operations"."audit_events" USING btree ("event_hash");--> statement-breakpoint
CREATE INDEX "audit_events_study_time_idx" ON "operations"."audit_events" USING btree ("study_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "baselines_participant_version_unique" ON "research"."baselines" USING btree ("participant_id","study_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "check_ins_participant_date_intervention_unique" ON "research"."check_ins" USING btree ("participant_id","scheduled_for","intervention");--> statement-breakpoint
CREATE INDEX "check_ins_status_date_idx" ON "research"."check_ins" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "coach_interactions_participant_time_idx" ON "coaching"."interactions" USING btree ("participant_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "contact_identities_kind_value_unique" ON "identity"."contact_identities" USING btree ("kind","normalised_value");--> statement-breakpoint
CREATE INDEX "contact_identities_user_idx" ON "identity"."contact_identities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_versions_identity_unique" ON "content_versions" USING btree ("study_id","kind","locale","version");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_claims_release_claim_unique" ON "coaching"."evidence_claims" USING btree ("evidence_release_id","claim_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_releases_study_version_unique" ON "coaching"."evidence_releases" USING btree ("study_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_code_hash_unique" ON "identity"."invitations" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "invitations_study_idx" ON "identity"."invitations" USING btree ("study_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mfa_credentials_user_method_unique" ON "identity"."mfa_credentials" USING btree ("user_id","method");--> statement-breakpoint
CREATE UNIQUE INDEX "one_time_tokens_hash_unique" ON "identity"."one_time_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "one_time_tokens_user_purpose_idx" ON "identity"."one_time_tokens" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE UNIQUE INDEX "outcome_assessments_participant_timepoint_unique" ON "research"."outcome_assessments" USING btree ("participant_id","timepoint");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_study_code_unique" ON "research"."participants" USING btree ("study_id","participant_code");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_study_user_unique" ON "research"."participants" USING btree ("study_id","user_id");--> statement-breakpoint
CREATE INDEX "participants_study_status_idx" ON "research"."participants" USING btree ("study_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_versions_plan_version_unique" ON "research"."plan_versions" USING btree ("plan_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_statuses_identity_unique" ON "research"."progress_statuses" USING btree ("participant_id","status_date","intervention");--> statement-breakpoint
CREATE UNIQUE INDEX "releases_identity_unique" ON "releases" USING btree ("study_id","release_type","version","environment");--> statement-breakpoint
CREATE INDEX "safety_flags_status_created_idx" ON "safety"."flags" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "identity"."sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_expiry_idx" ON "identity"."sessions" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "studies_code_unique" ON "studies" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "study_versions_study_version_unique" ON "study_versions" USING btree ("study_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "support_resources_code_version_unique" ON "support_resources" USING btree ("study_id","code","version");--> statement-breakpoint
CREATE UNIQUE INDEX "survey_definitions_study_code_unique" ON "research"."survey_definitions" USING btree ("study_id","code");--> statement-breakpoint
CREATE INDEX "survey_instances_participant_status_idx" ON "research"."survey_instances" USING btree ("participant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "survey_questions_version_code_unique" ON "research"."survey_questions" USING btree ("survey_version_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "survey_questions_version_position_unique" ON "research"."survey_questions" USING btree ("survey_version_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "survey_versions_definition_version_unique" ON "research"."survey_versions" USING btree ("survey_definition_id","version");