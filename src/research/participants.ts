import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { checkIns, outcomeAssessments, participants } from "@/db/schema";

export async function deidentifiedParticipants() {
  const db = await getDb();
  const people = await db.select({ id: participants.id, code: participants.participantCode, status: participants.status, synthetic: participants.synthetic, enrolledAt: participants.enrolledAt, withdrawnAt: participants.withdrawnAt }).from(participants).orderBy(asc(participants.participantCode));
  const checkins = await db.select({ participantId: checkIns.participantId, completedAt: checkIns.completedAt }).from(checkIns);
  const outcomes = await db.select().from(outcomeAssessments);
  const now = new Date();
  return people.map((person) => ({
    ...person,
    completedCheckIns: checkins.filter((item) => item.participantId === person.id && item.completedAt).length,
    followUpsCompleted: outcomes.filter((item) => item.participantId === person.id && item.completedAt).length,
    followUpsDue: outcomes.filter((item) => item.participantId === person.id && !item.completedAt && item.windowOpensAt <= now && item.windowClosesAt >= now).length,
    followUpsOverdue: outcomes.filter((item) => item.participantId === person.id && !item.completedAt && item.windowClosesAt < now).length,
  }));
}
