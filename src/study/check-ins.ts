import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { checkIns, progressStatuses } from "@/db/schema";

export async function todayCheckIn(participantId: string) {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn] = await db
    .select()
    .from(checkIns)
    .where(
      and(
        eq(checkIns.participantId, participantId),
        eq(checkIns.intervention, "smoking"),
        eq(checkIns.scheduledFor, today),
      ),
    )
    .limit(1);
  return checkIn ?? null;
}

export async function progressWindow(participantId: string, days = 14) {
  const db = await getDb();
  const rows = await db
    .select({
      date: progressStatuses.statusDate,
      missing: progressStatuses.missing,
      confirmedStatus: progressStatuses.participantConfirmedStatus,
      cigarettes: checkIns.cigarettes,
      craving: checkIns.craving,
      confidence: checkIns.confidence,
    })
    .from(progressStatuses)
    .leftJoin(checkIns, eq(checkIns.id, progressStatuses.sourceCheckInId))
    .where(eq(progressStatuses.participantId, participantId))
    .orderBy(desc(progressStatuses.statusDate))
    .limit(days);
  return rows.reverse().sort((a, b) => a.date.localeCompare(b.date));
}
