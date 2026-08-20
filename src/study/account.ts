import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { consents, participantRequests } from "@/db/schema";

export async function participantAccount(participantId: string) {
  const db = await getDb();
  const [consent] = await db
    .select()
    .from(consents)
    .where(and(eq(consents.participantId, participantId), isNull(consents.withdrawnAt)))
    .orderBy(desc(consents.decidedAt))
    .limit(1);
  const requests = await db
    .select()
    .from(participantRequests)
    .where(eq(participantRequests.participantId, participantId))
    .orderBy(desc(participantRequests.createdAt));
  return { consent: consent ?? null, requests };
}
