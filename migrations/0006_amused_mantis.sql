CREATE TABLE "operations"."ai_budget_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"reserved_usd" numeric(12, 8) NOT NULL,
	"actual_cost_usd" numeric(12, 8),
	"status" text DEFAULT 'reserved' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"settled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_budget_reservations_status_check" CHECK ("operations"."ai_budget_reservations"."status" in ('reserved', 'settled', 'released'))
);
--> statement-breakpoint
ALTER TABLE "operations"."ai_budget_reservations" ADD CONSTRAINT "ai_budget_reservations_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_budget_reservations_study_status_idx" ON "operations"."ai_budget_reservations" USING btree ("study_id","status");