ALTER TABLE "research"."check_ins" ADD COLUMN "trigger_codes" jsonb;--> statement-breakpoint
ALTER TABLE "research"."check_ins" ADD COLUMN "coping_action_codes" jsonb;--> statement-breakpoint
ALTER TABLE "research"."check_ins" ADD COLUMN "positive_moment_code" text;