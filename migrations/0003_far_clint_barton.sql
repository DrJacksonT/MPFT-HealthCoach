CREATE TABLE "research"."participant_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"request_type" text NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"details" jsonb NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "research"."participant_requests" ADD CONSTRAINT "participant_requests_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "research"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "participant_requests_participant_status_idx" ON "research"."participant_requests" USING btree ("participant_id","status");