import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { safetyFlags, surveyAnswers, surveyEvents, surveyInstances } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { participantEntryOpen, participantForUser } from "@/src/study/context";
import { participantSurvey } from "@/src/study/surveys";
import { answerMatchesResponseType, surveyWindowMessage } from "@/src/study/survey-validation";
import { recordProductEvent } from "@/src/research/product-events";

const answerValue = z.union([z.string().max(500), z.number().min(-1_000_000).max(1_000_000), z.boolean(), z.array(z.string().max(100)).max(20), z.null()]);
const saveSchema = z.object({
  action: z.enum(["save", "complete"]),
  answers: z.array(z.object({ questionId: z.string().uuid(), value: answerValue })).max(100),
  burdenSeconds: z.number().int().min(0).max(86_400),
});
const stateSchema = z.object({ action: z.enum(["snooze", "skip", "dismiss"]), snoozeDays: z.number().int().min(1).max(7).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(request, "participant:self");
  if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Some answers are outside the supported format." }, { status: 400, headers: noStoreHeaders });
  const participant = await participantForUser(session.userId); const { id } = await params;
  if (!participant || !participantEntryOpen(participant)) return NextResponse.json({ ok: false, message: "New survey responses are closed for this account." }, { status: 403, headers: noStoreHeaders });
  const survey = await participantSurvey(participant.id, id);
  if (!survey || ["completed", "skipped", "dismissed", "expired"].includes(survey.instance.status))
    return NextResponse.json({ ok: false, message: "This survey is not available." }, { status: 409, headers: noStoreHeaders });
  const now = new Date();
  const unavailableMessage = surveyWindowMessage(survey.instance, now);
  if (unavailableMessage)
    return NextResponse.json({ ok: false, message: unavailableMessage }, { status: 409, headers: noStoreHeaders });
  const questionMap = new Map(survey.questions.map((question) => [question.id, question]));
  if (new Set(parsed.data.answers.map((answer) => answer.questionId)).size !== parsed.data.answers.length)
    return NextResponse.json({ ok: false, message: "Each question can be answered only once." }, { status: 400, headers: noStoreHeaders });
  if (parsed.data.answers.some((answer) => {
    const question = questionMap.get(answer.questionId);
    return !question || !answerMatchesResponseType(question.responseType, answer.value, question.responseOptions);
  }))
    return NextResponse.json({ ok: false, message: "One or more answers do not match the question format." }, { status: 400, headers: noStoreHeaders });
  if (parsed.data.action === "complete") {
    const answeredIds = new Set(parsed.data.answers.filter((answer) => answer.value !== null && answer.value !== "").map((answer) => answer.questionId));
    if (survey.questions.some((question) => question.required && !answeredIds.has(question.id)))
      return NextResponse.json({ ok: false, message: "Answer the required safety question or choose save for later." }, { status: 400, headers: noStoreHeaders });
  }
  const db = await getDb();
  const numeric = parsed.data.answers.map((answer) => answer.value).filter((value): value is number => typeof value === "number");
  const unsafe = parsed.data.answers.some((answer) => questionMap.get(answer.questionId)?.safetyTag === "unsafe_upsetting" && answer.value === true);
  await db.transaction(async (tx) => {
    for (const answer of parsed.data.answers) {
      await tx.insert(surveyAnswers).values({ surveyInstanceId: id, questionId: answer.questionId, value: answer.value }).onConflictDoUpdate({ target: [surveyAnswers.surveyInstanceId, surveyAnswers.questionId], set: { value: answer.value, answeredAt: now } });
    }
    await tx.update(surveyInstances).set({ status: parsed.data.action === "complete" ? "completed" : "in_progress", startedAt: survey.instance.status === "available" ? now : undefined, completedAt: parsed.data.action === "complete" ? now : null, score: parsed.data.action === "complete" ? { descriptiveMean: numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : null, validatedScale: false } : null, updatedAt: now }).where(eq(surveyInstances.id, id));
    await tx.insert(surveyEvents).values({ surveyInstanceId: id, eventType: parsed.data.action === "complete" ? "completed" : "saved", metadata: { burdenSeconds: parsed.data.burdenSeconds, answeredCount: parsed.data.answers.length } });
    if (unsafe && parsed.data.action === "complete") await tx.insert(safetyFlags).values({ participantId: participant.id, sourceType: "survey_feedback", sourceId: id, category: "product_quality_unsafe_upsetting", severity: "moderate", ruleVersion: "survey-feedback-v1", participantMessageCode: "feedback-recorded-not-realtime" });
  });
  await recordAuditEvent({ actorUserId: session.userId, studyId: participant.studyId, participantId: participant.id, eventType: `survey.${parsed.data.action}`, targetType: "survey_instance", targetId: id, outcome: "success", metadata: { version: survey.instance.version, unsafeFeedback: unsafe, burdenSeconds: parsed.data.burdenSeconds } });
  await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "survey.started", sourceType: "survey_instance", sourceId: id, idempotencyKey: `survey:${id}:started`, metadata: { version: survey.instance.version } });
  if (parsed.data.action === "complete") await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: "survey.submitted", sourceType: "survey_instance", sourceId: id, idempotencyKey: `survey:${id}:submitted`, metadata: { version: survey.instance.version, burdenSeconds: parsed.data.burdenSeconds, safetyRecordCreated: unsafe } });
  return NextResponse.json({ ok: true, completed: parsed.data.action === "complete", unsafeFeedbackRecorded: unsafe && parsed.data.action === "complete" }, { headers: noStoreHeaders });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(request, "participant:self");
  if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = stateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
  const participant = await participantForUser(session.userId); const { id } = await params;
  if (!participant || !participantEntryOpen(participant)) return NextResponse.json({ ok: false, message: "New survey responses are closed for this account." }, { status: 403, headers: noStoreHeaders });
  const survey = await participantSurvey(participant.id, id);
  if (!survey) return NextResponse.json({ ok: false }, { status: 404, headers: noStoreHeaders });
  if (["completed", "skipped", "dismissed", "expired"].includes(survey.instance.status))
    return NextResponse.json({ ok: false, message: "This survey is no longer available." }, { status: 409, headers: noStoreHeaders });
  const now = new Date();
  const unavailableMessage = surveyWindowMessage(survey.instance, now);
  if (unavailableMessage && survey.instance.status !== "snoozed")
    return NextResponse.json({ ok: false, message: unavailableMessage }, { status: 409, headers: noStoreHeaders });
  const snoozedUntil = parsed.data.action === "snooze" ? new Date(Math.min(survey.instance.windowClosesAt.getTime(), now.getTime() + (parsed.data.snoozeDays ?? 1) * 86_400_000)) : null;
  const status = parsed.data.action === "snooze" ? "snoozed" : parsed.data.action === "skip" ? "skipped" : "dismissed";
  const db = await getDb();
  await db.transaction(async (tx) => { await tx.update(surveyInstances).set({ status, snoozedUntil, updatedAt: now }).where(eq(surveyInstances.id, id)); await tx.insert(surveyEvents).values({ surveyInstanceId: id, eventType: status, metadata: { snoozedUntil } }); });
  await recordAuditEvent({ actorUserId: session.userId, studyId: participant.studyId, participantId: participant.id, eventType: `survey.${status}`, targetType: "survey_instance", targetId: id, outcome: "success" });
  await recordProductEvent({ studyId: participant.studyId, participantId: participant.id, sessionId: session.id, eventName: parsed.data.action === "snooze" ? "survey.snoozed" : parsed.data.action === "skip" ? "survey.skipped" : "survey.dismissed", sourceType: "survey_instance", sourceId: id, idempotencyKey: `survey:${id}:${status}`, metadata: { version: survey.instance.version } });
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
