CREATE TABLE "operations"."ai_budget_counters" (
	"study_id" uuid PRIMARY KEY NOT NULL,
	"budget_usd" numeric(12, 8) NOT NULL,
	"reserved_usd" numeric(12, 8) DEFAULT '0' NOT NULL,
	"spent_usd" numeric(12, 8) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations"."audit_chain_heads" (
	"chain_id" text PRIMARY KEY NOT NULL,
	"current_hash" text DEFAULT 'GENESIS' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations"."data_quality_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"participant_id" uuid,
	"rule_code" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"details" jsonb NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations"."data_quality_resolutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"resolved_by_user_id" uuid NOT NULL,
	"outcome" text NOT NULL,
	"note" text NOT NULL,
	"resolved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching"."evidence_claim_passages" (
	"claim_id" uuid NOT NULL,
	"passage_id" uuid NOT NULL,
	"relationship" text DEFAULT 'supports' NOT NULL,
	CONSTRAINT "evidence_claim_passages_claim_id_passage_id_pk" PRIMARY KEY("claim_id","passage_id")
);
--> statement-breakpoint
CREATE TABLE "coaching"."evidence_passages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"locator" text NOT NULL,
	"passage_hash" text NOT NULL,
	"reviewed_summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching"."evidence_review_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"reviewer_user_id" uuid NOT NULL,
	"decision" text NOT NULL,
	"rationale" text NOT NULL,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_review_decision_check" CHECK ("coaching"."evidence_review_decisions"."decision" in ('verified', 'rejected', 'returned_for_changes', 'superseded', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "coaching"."evidence_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text NOT NULL,
	"module" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"exact_locator" text NOT NULL,
	"provenance" jsonb NOT NULL,
	"applicability" text NOT NULL,
	"limitations" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"review_due_at" timestamp with time zone,
	"superseded_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_sources_status_check" CHECK ("coaching"."evidence_sources"."status" in ('draft', 'in_review', 'verified', 'rejected', 'superseded', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "research"."measure_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"module" text NOT NULL,
	"status" text DEFAULT 'candidate' NOT NULL,
	"licence_status" text NOT NULL,
	"wording_approved" boolean DEFAULT false NOT NULL,
	"scoring_approved" boolean DEFAULT false NOT NULL,
	"protocol_approved" boolean DEFAULT false NOT NULL,
	"approved_by_user_id" uuid,
	"approved_at" timestamp with time zone,
	"notes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "measure_registry_module_check" CHECK ("research"."measure_registry"."module" in ('smoking', 'gambling', 'cross_module')),
	CONSTRAINT "measure_registry_status_check" CHECK ("research"."measure_registry"."status" in ('candidate', 'approved', 'rejected', 'retired'))
);
--> statement-breakpoint
CREATE TABLE "operations"."product_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"participant_id" uuid,
	"session_id" uuid,
	"event_name" text NOT NULL,
	"taxonomy_version" integer DEFAULT 1 NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text,
	"idempotency_key" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "operations"."ai_budget_counters" ADD CONSTRAINT "ai_budget_counters_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."data_quality_issues" ADD CONSTRAINT "data_quality_issues_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."data_quality_issues" ADD CONSTRAINT "data_quality_issues_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."data_quality_resolutions" ADD CONSTRAINT "data_quality_resolutions_issue_id_data_quality_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "operations"."data_quality_issues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."data_quality_resolutions" ADD CONSTRAINT "data_quality_resolutions_resolved_by_user_id_users_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."evidence_claim_passages" ADD CONSTRAINT "evidence_claim_passages_claim_id_evidence_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "coaching"."evidence_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."evidence_claim_passages" ADD CONSTRAINT "evidence_claim_passages_passage_id_evidence_passages_id_fk" FOREIGN KEY ("passage_id") REFERENCES "coaching"."evidence_passages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."evidence_passages" ADD CONSTRAINT "evidence_passages_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "coaching"."evidence_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching"."evidence_review_decisions" ADD CONSTRAINT "evidence_review_decisions_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."measure_registry" ADD CONSTRAINT "measure_registry_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research"."measure_registry" ADD CONSTRAINT "measure_registry_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."product_events" ADD CONSTRAINT "product_events_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."product_events" ADD CONSTRAINT "product_events_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations"."product_events" ADD CONSTRAINT "product_events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "identity"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "data_quality_issue_identity_unique" ON "operations"."data_quality_issues" USING btree ("study_id","rule_code","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "data_quality_issue_status_idx" ON "operations"."data_quality_issues" USING btree ("study_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_passages_source_locator_unique" ON "coaching"."evidence_passages" USING btree ("source_id","locator");--> statement-breakpoint
CREATE INDEX "evidence_review_target_idx" ON "coaching"."evidence_review_decisions" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_sources_source_id_unique" ON "coaching"."evidence_sources" USING btree ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "measure_registry_study_code_unique" ON "research"."measure_registry" USING btree ("study_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "product_events_study_idempotency_unique" ON "operations"."product_events" USING btree ("study_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "product_events_participant_time_idx" ON "operations"."product_events" USING btree ("participant_id","occurred_at");