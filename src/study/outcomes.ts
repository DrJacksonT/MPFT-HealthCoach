import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { outcomeAssessments } from "@/db/schema";

export async function participantOutcomes(participantId: string) {
  const db = await getDb();
  return db.select().from(outcomeAssessments).where(eq(outcomeAssessments.participantId, participantId)).orderBy(asc(outcomeAssessments.dueAt));
}

export async function participantOutcome(participantId: string, id: string) {
  const db = await getDb();
  const [outcome] = await db.select().from(outcomeAssessments).where(eq(outcomeAssessments.id, id)).limit(1);
  return outcome?.participantId === participantId ? outcome : null;
}
