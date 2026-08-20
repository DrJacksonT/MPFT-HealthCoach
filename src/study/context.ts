import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { participants } from "@/db/schema";

export async function participantForUser(userId: string) {
  const db = await getDb();
  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.userId, userId))
    .limit(1);
  return participant ?? null;
}

export function participantEntryOpen(participant: { status: string; withdrawnAt: Date | null }) {
  return !participant.withdrawnAt && !["restricted", "deletion_completed", "withdrawn", "completed", "stopped_by_team"].includes(participant.status);
}
