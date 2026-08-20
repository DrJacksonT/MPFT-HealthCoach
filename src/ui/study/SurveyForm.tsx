"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  code: string;
  prompt: string;
  responseType: string;
  responseOptions: unknown[] | null;
  required: boolean;
};

function stringOptions(question: Question) {
  return (question.responseOptions ?? []).filter((value): value is string => typeof value === "string");
}

function QuestionInput({ question, existing }: { question: Question; existing: unknown }) {
  if (question.responseType === "scale-0-10" || question.responseType === "likert-1-5") {
    const start = question.responseType === "likert-1-5" ? 1 : 0;
    const end = question.responseType === "likert-1-5" ? 5 : 10;
    return <select id={question.id} name={question.id} defaultValue={String(existing ?? "")}><option value="">Prefer not to answer</option>{Array.from({ length: end - start + 1 }, (_, index) => index + start).map((value) => <option key={value} value={value}>{value}</option>)}</select>;
  }
  if (question.responseType === "numeric") return <input id={question.id} name={question.id} type="number" step="any" defaultValue={typeof existing === "number" ? existing : ""} />;
  if (question.responseType === "short-text") return <textarea id={question.id} name={question.id} maxLength={500} rows={4} defaultValue={String(existing ?? "")} />;
  if (question.responseType === "single-choice") return <select id={question.id} name={question.id} defaultValue={String(existing ?? "")}><option value="">Prefer not to answer</option>{stringOptions(question).map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select>;
  if (question.responseType === "multiple-choice") {
    const selected = Array.isArray(existing) ? existing : [];
    return <fieldset className="question"><legend className="visually-hidden">{question.prompt}</legend>{stringOptions(question).map((option) => <label key={option}><input type="checkbox" name={question.id} value={option} defaultChecked={selected.includes(option)} />{option.replaceAll("_", " ")}</label>)}</fieldset>;
  }
  return <fieldset className="question"><legend className="visually-hidden">{question.prompt}</legend><label><input type="radio" name={question.id} value="yes" defaultChecked={existing === true} required={question.required} />Yes</label><label><input type="radio" name={question.id} value="no" defaultChecked={existing === false} required={question.required} />No</label>{question.responseType === "yes-no-unsure" && <label><input type="radio" name={question.id} value="unsure" defaultChecked={existing === "unsure"} />Not sure</label>}</fieldset>;
}

export function SurveyForm({ instanceId, questions, existing }: { instanceId: string; questions: Question[]; existing: Record<string, unknown> }) {
  const router = useRouter();
  const startedAt = useRef<number | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { startedAt.current = Date.now(); }, []);
  const csrf = () => decodeURIComponent(document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? "");

  async function submit(formElement: HTMLFormElement, action: "save" | "complete") {
    setBusy(true); setStatus(""); const form = new FormData(formElement);
    const answers = questions.map((question) => {
      const raw = form.get(question.id);
      let value: unknown = raw === null || raw === "" ? null : raw;
      if (["scale-0-10", "likert-1-5", "numeric"].includes(question.responseType) && raw !== null && raw !== "") value = Number(raw);
      if (question.responseType.startsWith("yes-no") && raw !== null) value = raw === "yes" ? true : raw === "no" ? false : String(raw);
      if (question.responseType === "multiple-choice") value = form.getAll(question.id).map(String);
      return { questionId: question.id, value };
    });
    const response = await fetch(`/api/participant/surveys/${instanceId}`, { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": csrf() }, body: JSON.stringify({ action, answers, burdenSeconds: Math.round((Date.now() - (startedAt.current ?? Date.now())) / 1000) }) });
    const data = await response.json().catch(() => ({})); setBusy(false);
    if (!response.ok) { setStatus(String(data.message ?? "The answers could not be saved.")); return; }
    if (action === "save") { setStatus("Saved. You can return during the survey window."); router.refresh(); return; }
    setStatus(data.unsafeFeedbackRecorded ? "Saved. Your unsafe or upsetting feedback created a quality and safety record. This is not monitored in real time; use urgent support if needed." : "Thank you. The response is complete."); router.refresh();
  }

  async function changeState(action: "snooze" | "skip" | "dismiss") {
    setBusy(true); const response = await fetch(`/api/participant/surveys/${instanceId}`, { method: "PATCH", headers: { "content-type": "application/json", "x-csrf-token": csrf() }, body: JSON.stringify({ action, snoozeDays: 1 }) });
    if (response.ok) { router.push("/participant/surveys"); router.refresh(); } else { setStatus("That choice could not be saved."); setBusy(false); }
  }

  return <form className="long-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void submit(event.currentTarget, "complete"); }}>{status && <div className={status.startsWith("Saved") || status.startsWith("Thank") ? "success-summary" : "error-summary"} role="status"><p>{status}</p>{status.includes("not monitored") && <p><Link href="/help">Open help and support</Link></p>}</div>}<section>{questions.map((question) => <div className="survey-question" key={question.id}><label htmlFor={question.id}><strong>{question.prompt}</strong>{!question.required && <span>Optional</span>}</label><QuestionInput question={question} existing={existing[question.id]} /></div>)}</section><div className="survey-actions"><button className="button" type="submit" disabled={busy}>Complete survey</button><button className="button button--outline" type="button" onClick={(event) => { if (event.currentTarget.form) void submit(event.currentTarget.form, "save"); }} disabled={busy}>Save for later</button><button className="plain-button" type="button" onClick={() => changeState("snooze")} disabled={busy}>Snooze for one day</button><button className="plain-button" type="button" onClick={() => changeState("skip")} disabled={busy}>Skip this survey</button></div></form>;
}
