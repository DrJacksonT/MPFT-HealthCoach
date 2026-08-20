import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { baselines, checkIns, outcomeAssessments, participants, studies, studyVersions } from "@/db/schema";

export const gamblingProtectiveActions = [
  { code: "pause-ten", title: "Pause for ten minutes", detail: "Do not place the bet or transfer money during the pause. Decide again when the timer ends." },
  { code: "leave-device", title: "Move away from access", detail: "Close the site or app, leave the venue, or give yourself physical distance if it is safe to do so." },
  { code: "activate-block", title: "Use an existing block", detail: "Turn on a bank gambling block, device block or self-exclusion tool that you have already chosen." },
  { code: "trusted-person", title: "Contact a trusted person", detail: "Tell them you have an urge and ask for the specific support you want right now." },
  { code: "gamcare", title: "Contact specialist support", detail: "GamCare’s National Gambling Helpline can provide free information and support. The research tool does not notify them for you." },
] as const;

export async function gamblingSimulationData() {
  const db = await getDb();
  const [context] = await db.select({ studyId: studies.id, studyVersionId: studyVersions.id, participantId: participants.id, participantCode: participants.participantCode, studyTitle: studies.title, studySettings: studyVersions.settings }).from(studies).innerJoin(studyVersions, eq(studyVersions.studyId, studies.id)).innerJoin(participants, eq(participants.studyId, studies.id)).where(eq(studies.code, "GAMBLE-STAFF-SIMULATION")).limit(1);
  if (!context) return null;
  const [baseline] = await db.select().from(baselines).where(and(eq(baselines.participantId, context.participantId), eq(baselines.studyVersionId, context.studyVersionId))).limit(1);
  const checkins = await db.select().from(checkIns).where(and(eq(checkIns.participantId, context.participantId), eq(checkIns.intervention, "gambling"))).orderBy(desc(checkIns.scheduledFor));
  const outcomes = await db.select().from(outcomeAssessments).where(eq(outcomeAssessments.participantId, context.participantId)).orderBy(asc(outcomeAssessments.dueAt));
  return { ...context, baseline: baseline ?? null, checkins, outcomes };
}
