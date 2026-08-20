import { getDb } from "@/db";
import { productEvents } from "@/db/schema";

export const PRODUCT_EVENT_TAXONOMY_VERSION = 1;

export const productEventNames = [
  "invitation.opened",
  "eligibility.started",
  "eligibility.completed",
  "information.viewed",
  "consent.consented",
  "consent.declined",
  "consent.withdrawn",
  "registration.completed",
  "session.authenticated",
  "baseline.started",
  "baseline.completed",
  "goal.created",
  "goal.revised",
  "check_in.started",
  "check_in.completed",
  "structured_tool.started",
  "structured_tool.completed",
  "coach.requested",
  "coach.completed",
  "coach.refused",
  "coach.fallback",
  "evidence.viewed",
  "safety.route_shown",
  "referral.offered",
  "referral.accepted",
  "referral.declined",
  "referral.participant_reported_used",
  "survey.displayed",
  "survey.started",
  "survey.submitted",
  "survey.skipped",
  "survey.snoozed",
  "survey.dismissed",
  "follow_up.due",
  "follow_up.completed",
  "follow_up.overdue",
  "data_copy.requested",
  "account.deletion_requested",
  "account.restriction_requested",
  "account.request_completed",
] as const;

export type ProductEventName = (typeof productEventNames)[number];
type MetadataValue = string | number | boolean | null;

const prohibitedMetadataKey = /(message|text|email|identity|name|answer|free.?text|body)/i;

export async function recordProductEvent(input: {
  studyId: string;
  participantId?: string | null;
  sessionId?: string | null;
  eventName: ProductEventName;
  sourceType: string;
  sourceId?: string | null;
  idempotencyKey: string;
  occurredAt?: Date;
  metadata?: Record<string, MetadataValue>;
}) {
  const metadata = input.metadata ?? {};
  if (Object.keys(metadata).some((key) => prohibitedMetadataKey.test(key)))
    throw new Error("product_event_metadata_must_be_content_free");
  const db = await getDb();
  const [recorded] = await db
    .insert(productEvents)
    .values({
      studyId: input.studyId,
      participantId: input.participantId,
      sessionId: input.sessionId,
      eventName: input.eventName,
      taxonomyVersion: PRODUCT_EVENT_TAXONOMY_VERSION,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      idempotencyKey: input.idempotencyKey,
      occurredAt: input.occurredAt ?? new Date(),
      metadata,
    })
    .onConflictDoNothing()
    .returning({ id: productEvents.id });
  return Boolean(recorded);
}

export const engagementDefinitions = {
  activation: "baseline.completed and goal.created for the same participant",
  meaningfulInteraction: "one completed structured tool, coach interaction, check-in, survey or follow-up",
  meaningfulUse: "activation plus meaningful interactions on at least two distinct UTC dates",
  session: "a successful authenticated session; page views alone do not count",
  retention: "meaningful interaction in a configured follow-up period among participants eligible for that period",
} as const;
