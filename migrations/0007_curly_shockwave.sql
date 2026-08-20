ALTER TABLE "operations"."product_events" DROP CONSTRAINT "product_events_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "operations"."product_events" ADD CONSTRAINT "product_events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "identity"."sessions"("id") ON DELETE set null ON UPDATE no action;