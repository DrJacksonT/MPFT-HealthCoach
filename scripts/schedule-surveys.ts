import { and, eq, inArray } from "drizzle-orm";
import { closeDb, getDb } from "../db/index";
import { participants, studyVersions, surveyInstances, surveySchedules } from "../db/schema";

async function main() {
  const db = await getDb();
  const rows = await db
    .select({
      participantId: participants.id,
      enrolledAt: participants.enrolledAt,
      scheduleId: surveySchedules.id,
      surveyVersionId: surveySchedules.surveyVersionId,
      offsetDays: surveySchedules.triggerOffsetDays,
      openDays: surveySchedules.openDays,
    })
    .from(participants)
    .innerJoin(studyVersions, eq(studyVersions.studyId, participants.studyId))
    .innerJoin(surveySchedules, eq(surveySchedules.studyVersionId, studyVersions.id))
    .where(
      and(
        inArray(participants.status, ["consented", "active", "completed"]),
        eq(surveySchedules.active, true),
      ),
    );
  let inserted = 0;
  for (const row of rows) {
    const anchor = row.enrolledAt ?? new Date();
    const windowOpensAt = new Date(anchor.getTime() + row.offsetDays * 86_400_000);
    const windowClosesAt = new Date(windowOpensAt.getTime() + row.openDays * 86_400_000);
    const result = await db
      .insert(surveyInstances)
      .values({ participantId: row.participantId, surveyScheduleId: row.scheduleId, surveyVersionId: row.surveyVersionId, windowOpensAt, windowClosesAt, status: "available" })
      .onConflictDoNothing()
      .returning({ id: surveyInstances.id });
    inserted += result.length;
  }
  console.log(`Survey scheduler checked ${rows.length} participant schedules and created ${inserted} instances.`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Survey scheduling failed."); process.exitCode = 1; }).finally(closeDb);
