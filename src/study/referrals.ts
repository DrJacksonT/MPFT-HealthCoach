import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { referrals, supportResources } from "@/db/schema";

export async function participantSupport(participantId: string, studyId: string) {
  const db = await getDb();
  const resources = await db.select().from(supportResources).where(and(eq(supportResources.studyId, studyId), eq(supportResources.active, true)));
  const records = await db.select().from(referrals).where(eq(referrals.participantId, participantId));
  return { resources, records };
}
