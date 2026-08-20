"use client";

import Link from "next/link";
import { useState } from "react";
import type { CoachingIntent, ReleasedClaim } from "@/src/coaching/catalogue";

type CoachResult = {
  kind: string;
  title?: string;
  reflection?: string;
  question?: string;
  message?: string;
  actions?: Array<{ code: string; title: string; detail: string }>;
  claims?: ReleasedClaim[];
  fallbackReason?: string | null;
  boundaries?: { monitored: boolean; rawTextStored: boolean };
};

const labels: Record<CoachingIntent, string> = {
  craving: "I might smoke",
  plan: "Plan for a trigger",
  setback: "I smoked and want to reset",
  motivation: "Reconnect with my reasons",
  support: "Find human support",
};

const coachingIntents: CoachingIntent[] = ["craving", "plan", "setback", "motivation", "support"];
const descriptions: Record<CoachingIntent, string> = {
  craving: "Choose one small action for the next few minutes.",
  plan: "Make a specific plan for one time, place, feeling or routine.",
  setback: "Record what happened honestly and choose the next step without blame.",
  motivation: "Reconnect with one reason that matters to you today.",
  support: "Find a stop-smoking service, pharmacist, GP or person you trust.",
};

function csrfToken() {
  return decodeURIComponent(document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? "");
}

export function CoachPanel() {
  const [intent, setIntent] = useState<CoachingIntent>("craving");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<CoachResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function request(mode: "structured" | "ai") {
    setBusy(true); setError(""); setResult(null);
    const response = await fetch("/api/participant/coach", {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrfToken() },
      body: JSON.stringify({ intent, mode, message: mode === "ai" ? message : "" }),
    });
    const data = await response.json().catch(() => ({})) as CoachResult & { message?: string };
    setBusy(false);
    if (!response.ok) { setError(data.message ?? "Coping support could not be loaded."); return; }
    setResult(data);
  }

  return <div className="coach-workspace">
    <section className="coach-picker" aria-labelledby="coach-topic-heading">
      <h2 id="coach-topic-heading">What would help right now?</h2>
      <div className="coach-topic-grid">
        {coachingIntents.map((code) => <button key={code} type="button" className={`coach-topic ${intent === code ? "coach-topic--active" : ""}`} onClick={() => { setIntent(code); setResult(null); }} aria-pressed={intent === code}><strong>{labels[code]}</strong><span>{descriptions[code]}</span></button>)}
      </div>
      <div className="coach-actions">
        <button className="button" type="button" onClick={() => void request("structured")} disabled={busy}>Show structured steps</button>
      </div>
      <details className="ai-option">
        <summary>Optional AI reflection</summary>
        <p>The AI can only reflect on your words and select one of the same structured actions. Facts and sources stay controlled by the application. Live AI is closed unless the separate release gate, consent and study budget all allow it.</p>
        <label htmlFor="coach-message">What is happening? <span>Optional, up to 500 characters</span></label>
        <textarea id="coach-message" maxLength={500} rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
        <p className="microcopy">This technical test does not store your raw text. Do not add names or urgent information.</p>
        <button className="button button--outline" type="button" onClick={() => void request("ai")} disabled={busy || !message.trim()}>Try bounded reflection</button>
      </details>
      {error && <div className="error-summary" role="alert"><p>{error}</p></div>}
    </section>
    {result && <section className={result.kind === "boundary" ? "coach-result coach-result--boundary" : "coach-result"} aria-live="polite" tabIndex={-1}>
      {result.kind === "boundary" ? <><h2>Use a safer route</h2><p>{result.message}</p><div className="coach-actions"><Link className="button" href="/help">Open help now</Link></div></> : <>
        <p className="eyebrow">{result.kind === "fallback" ? "Structured fallback used" : "Coping support"}</p>
        <h2>{result.title}</h2>
        <p className="coach-reflection">{result.reflection}</p>
        {result.question && <p><strong>{result.question}</strong></p>}
        <div className="structured-actions">{result.actions?.map((action) => <article key={action.code}><h3>{action.title}</h3><p>{action.detail}</p></article>)}</div>
        {!!result.claims?.length && <div className="evidence-panel"><h3>Evidence used by the application</h3><p className="microcopy">These application-owned claims come from a synthetic evidence release. Named human approval is still required before live use.</p>{result.claims.map((claim) => <article key={claim.claimId}><p>{claim.wording}</p><ul>{claim.citations.map((citation) => <li key={citation.id}><a href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a> — {citation.organisation}, {citation.year}</li>)}</ul></article>)}</div>}
        {result.kind === "fallback" && <p className="notice">The optional AI layer was not used. All essential actions remain available.</p>}
        <p className="microcopy">Automated research tool · not a clinician · not monitored · not emergency care · raw text not stored in this configuration</p>
      </>}
    </section>}
  </div>;
}
