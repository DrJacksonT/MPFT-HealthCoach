ALTER TABLE "research"."check_ins" ADD COLUMN "gambling_episodes" integer;--> statement-breakpoint
ALTER TABLE "research"."check_ins" ADD COLUMN "gambling_loss_pence" integer;--> statement-breakpoint
ALTER TABLE "research"."check_ins" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "research"."check_ins" ADD COLUMN "chasing" boolean;--> statement-breakpoint
ALTER TABLE "research"."check_ins" ADD COLUMN "distress" integer;--> statement-breakpoint
ALTER TABLE "research"."check_ins" ADD COLUMN "financial_protection_codes" jsonb;