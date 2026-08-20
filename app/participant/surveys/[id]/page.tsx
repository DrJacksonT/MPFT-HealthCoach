import Link from "next/link";
import { notFound } from "next/navigation";
import { requireServerSession } from "@/src/auth/server";
import { participantForUser } from "@/src/study/context";
import { participantSurvey } from "@/src/study/surveys";
import { SurveyForm } from "@/src/ui/study/SurveyForm";

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireServerSession(); const participant = await participantForUser(session.userId); const { id } = await params; const survey = participant ? await participantSurvey(participant.id, id) : null; if (!survey) notFound();
  const existing = Object.fromEntries(survey.answers.map((answer) => [answer.questionId, answer.value]));
  const now = new Date();
  const unavailable = survey.instance.windowOpensAt > now
    ? "This survey window has not opened yet."
    : survey.instance.windowClosesAt < now
      ? "This survey window has closed."
      : survey.instance.status === "snoozed" && survey.instance.snoozedUntil && survey.instance.snoozedUntil > now
        ? `This survey is snoozed until ${survey.instance.snoozedUntil.toLocaleString("en-GB")}.`
        : ["skipped", "dismissed", "expired"].includes(survey.instance.status)
          ? "This survey is no longer available."
          : null;
  return <main id="main-content" className="app-content"><nav className="breadcrumbs"><Link href="/participant/surveys">Research questions</Link><span>/</span><span>{survey.instance.name}</span></nav><div className="app-title"><div><p className="eyebrow">Version {survey.instance.version}</p><h1>{survey.instance.name}</h1><p>{survey.instance.instructions}</p><p className="microcopy">{survey.instance.attribution}</p></div></div>{survey.instance.status === "completed" ? <div className="success-summary"><h2>Response is complete</h2><p>This immutable survey version is complete.</p></div> : unavailable ? <div className="notice"><h2>Survey unavailable</h2><p>{unavailable}</p><Link href="/participant/surveys">Return to research questions</Link></div> : <SurveyForm instanceId={survey.instance.id} questions={survey.questions.map(({ id: questionId, code, prompt, responseType, responseOptions, required }) => ({ id: questionId, code, prompt, responseType, responseOptions, required }))} existing={existing} />}</main>;
}
