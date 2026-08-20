import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { checkIns, consents, participants, plans, surveyInstances } from "@/db/schema";

export async function participantOverview(userId: string) {
  const db = await getDb();
  const [participant] = await db.select().from(participants).where(eq(participants.userId, userId)).limit(1);
  if (!participant) return null;
  const [consent, plan, recentCheckIn] = await Promise.all([
    db.select({ id: consents.id, decidedAt: consents.decidedAt }).from(consents).where(and(eq(consents.participantId, participant.id), eq(consents.decision, "consented"))).orderBy(desc(consents.decidedAt)).limit(1),
    db.select({ id: plans.id, status: plans.status }).from(plans).where(eq(plans.participantId, participant.id)).orderBy(desc(plans.updatedAt)).limit(1),
    db.select({ id: checkIns.id, date: checkIns.scheduledFor, status: checkIns.status }).from(checkIns).where(eq(checkIns.participantId, participant.id)).orderBy(desc(checkIns.scheduledFor)).limit(1),
  ]);
  const surveys = await db.select({ id: surveyInstances.id, status: surveyInstances.status }).from(surveyInstances).where(and(eq(surveyInstances.participantId, participant.id), eq(surveyInstances.status, "available")));
  return { participant, consent: consent[0] ?? null, plan: plan[0] ?? null, recentCheckIn: recentCheckIn[0] ?? null, availableSurveyCount: surveys.length };
}
