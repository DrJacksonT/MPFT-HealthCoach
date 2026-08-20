import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  surveyAnswers,
  surveyDefinitions,
  surveyInstances,
  surveyQuestions,
  surveyVersions,
} from "@/db/schema";

export async function participantSurveys(participantId: string) {
  const db = await getDb();
  return db
    .select({
      id: surveyInstances.id,
      status: surveyInstances.status,
      windowOpensAt: surveyInstances.windowOpensAt,
      windowClosesAt: surveyInstances.windowClosesAt,
      snoozedUntil: surveyInstances.snoozedUntil,
      name: surveyDefinitions.name,
      purpose: surveyDefinitions.purpose,
      instructions: surveyVersions.instructions,
      version: surveyVersions.version,
    })
    .from(surveyInstances)
    .innerJoin(surveyVersions, eq(surveyVersions.id, surveyInstances.surveyVersionId))
    .innerJoin(surveyDefinitions, eq(surveyDefinitions.id, surveyVersions.surveyDefinitionId))
    .where(eq(surveyInstances.participantId, participantId))
    .orderBy(asc(surveyInstances.windowOpensAt));
}

export async function participantSurvey(participantId: string, instanceId: string) {
  const db = await getDb();
  const [instance] = await db
    .select({
      id: surveyInstances.id,
      status: surveyInstances.status,
      windowOpensAt: surveyInstances.windowOpensAt,
      windowClosesAt: surveyInstances.windowClosesAt,
      snoozedUntil: surveyInstances.snoozedUntil,
      surveyVersionId: surveyInstances.surveyVersionId,
      name: surveyDefinitions.name,
      instructions: surveyVersions.instructions,
      version: surveyVersions.version,
      attribution: surveyVersions.attribution,
    })
    .from(surveyInstances)
    .innerJoin(surveyVersions, eq(surveyVersions.id, surveyInstances.surveyVersionId))
    .innerJoin(surveyDefinitions, eq(surveyDefinitions.id, surveyVersions.surveyDefinitionId))
    .where(and(eq(surveyInstances.id, instanceId), eq(surveyInstances.participantId, participantId)))
    .limit(1);
  if (!instance) return null;
  const questions = await db
    .select()
    .from(surveyQuestions)
    .where(eq(surveyQuestions.surveyVersionId, instance.surveyVersionId))
    .orderBy(asc(surveyQuestions.position));
  const answers = await db
    .select()
    .from(surveyAnswers)
    .where(eq(surveyAnswers.surveyInstanceId, instance.id));
  return { instance, questions, answers };
}
