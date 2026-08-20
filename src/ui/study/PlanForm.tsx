"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const choices = {
  motivations: [["health", "Protect my health"], ["family", "Be there for family"], ["money", "Keep more money"], ["fitness", "Feel fitter"], ["freedom", "Feel less controlled by smoking"]],
  triggers: [["stress", "Stress"], ["after-meals", "After meals"], ["alcohol", "Alcohol"], ["social", "Social situations"], ["boredom", "Boredom"], ["morning", "First thing in the morning"]],
  copingActions: [["delay", "Delay for five minutes"], ["breathe", "Slow breathing"], ["water", "Have water"], ["walk", "Take a short walk"], ["message-support", "Message someone supportive"], ["change-routine", "Change the usual routine"]],
  supportChoices: [["gp", "Ask my GP"], ["pharmacy", "Ask a pharmacist"], ["local-service", "Use a local stop-smoking service"], ["friend-family", "Ask a friend or family member"], ["none-yet", "No support choice yet"]],
} as const;

export function PlanForm({ revision }: { revision: boolean }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const form = new FormData(event.currentTarget);
    const csrf = document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? "";
    const selected = (name: string) => form.getAll(name).map(String);
    const targetDate = String(form.get("targetDate") ?? "");
    const response = await fetch("/api/participant/plan", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": decodeURIComponent(csrf) }, body: JSON.stringify({ goalType: form.get("goalType"), targetDate: targetDate || null, motivations: selected("motivations"), triggers: selected("triggers"), copingActions: selected("copingActions"), supportChoices: selected("supportChoices"), medicationDiscussion: form.get("medicationDiscussion"), revisionReason: revision ? form.get("revisionReason") : "first-plan" }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(String(data.message ?? "The plan could not be saved.")); setBusy(false); return; }
    router.push("/participant/check-in"); router.refresh();
  }
  return <form className="long-form" onSubmit={submit}>{error && <div className="error-summary" role="alert"><p>{error}</p></div>}<section><h2>Choose your goal</h2><fieldset className="question"><legend>What feels right now?</legend><label><input type="radio" name="goalType" value="stop" defaultChecked />Stop smoking</label><label><input type="radio" name="goalType" value="reduce" />Reduce smoking</label></fieldset><label className="field"><span>Target date (optional)</span><input name="targetDate" type="date" /></label>{revision && <label className="field"><span>Why are you revising the plan?</span><select name="revisionReason"><option value="goal-changed">My goal changed</option><option value="what-worked">Build on what worked</option><option value="lapse">I smoked and want a fresh plan</option><option value="life-changed">My circumstances changed</option></select></label>}</section>{Object.entries(choices).map(([name, options]) => <section key={name}><h2>{name === "motivations" ? "What matters to you?" : name === "triggers" ? "What tends to prompt smoking?" : name === "copingActions" ? "What could you try?" : "What support would you consider?"}</h2><div className="choice-grid">{options.map(([value, label]) => <label key={value}><input type="checkbox" name={name} value={value} />{label}</label>)}</div></section>)}<section><h2>Medication discussion</h2><p>This platform does not recommend or prescribe medication for an individual.</p><label className="field"><span>Choose one</span><select name="medicationDiscussion" defaultValue="ask-clinician"><option value="ask-clinician">I may ask a GP, pharmacist or stop-smoking adviser</option><option value="already-discussed">I have already discussed it with a suitable professional</option><option value="not-now">Not now</option></select></label></section><div className="form-actions"><button className="button" disabled={busy}>{busy ? "Saving plan…" : revision ? "Save revised plan" : "Save my plan"}</button><p className="microcopy">Plans are versioned. Revising one does not erase the earlier record.</p></div></form>;
}
