"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const csrf = document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? "";
    const response = await fetch("/api/participant/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": decodeURIComponent(csrf) },
      body: JSON.stringify({
        eligibility: { age18OrOver: form.get("age18OrOver") === "on", currentlySmokes: form.get("currentlySmokes") === "on", canConsent: form.get("canConsent") === "on", needsUrgentHelp: false },
        consentItems: { readInformation: form.get("readInformation") === "on", voluntaryChoice: form.get("voluntaryChoice") === "on", healthDataUse: form.get("healthDataUse") === "on", withdrawalUnderstood: form.get("withdrawalUnderstood") === "on", notMonitored: form.get("notMonitored") === "on" },
        optionalAiText: form.get("optionalAiText") === "on",
        optionalContact: form.get("optionalContact") === "on",
        baseline: { cigarettesPerDay: Number(form.get("cigarettesPerDay")), yearsSmoked: Number(form.get("yearsSmoked")), previousAttempts: Number(form.get("previousAttempts")), currentGoal: form.get("currentGoal"), craving: Number(form.get("craving")), confidence: Number(form.get("confidence")), ageBand: form.get("ageBand") },
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setBusy(false); setError(String(data.message ?? "The onboarding record could not be saved.")); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    router.push("/participant/plan"); router.refresh();
  }
  const required = [
    ["age18OrOver", "I confirm this fictional participant is aged 18 or over."],
    ["currentlySmokes", "I confirm this fictional participant currently smokes tobacco."],
    ["canConsent", "I can understand the draft information and make this choice."],
    ["readInformation", "I have read the version 1 draft participant information."],
    ["voluntaryChoice", "I understand participation is voluntary and ordinary NHS care is unaffected."],
    ["healthDataUse", "I agree to the test platform storing special-category smoking and wellbeing research data."],
    ["withdrawalUnderstood", "I understand the withdrawal, contact-stop and deletion-request choices."],
    ["notMonitored", "I understand this website is not monitored and is not an emergency service."],
  ];
  return <form className="long-form" onSubmit={submit}>{error && <div className="error-summary" role="alert"><h2>There is a problem</h2><p>{error}</p></div>}<section><h2>Eligibility and required consent</h2><p>Each item is recorded separately with the information and consent content versions.</p><div className="check-list">{required.map(([name, label]) => <label key={name}><input type="checkbox" name={name} required />{label}</label>)}</div></section><section><h2>Optional choices</h2><div className="check-list"><label><input type="checkbox" name="optionalAiText" />Allow optional open text to be sent to an approved AI provider when the live-AI release is open. It is currently closed.</label><label><input type="checkbox" name="optionalContact" />Allow follow-up contact for this fictional test account.</label></div></section><section><h2>Smoking baseline</h2><div className="field-grid field-grid--two"><label className="field"><span>Cigarettes on a typical day</span><input name="cigarettesPerDay" type="number" min="0" max="200" defaultValue="12" required /></label><label className="field"><span>Years smoked</span><input name="yearsSmoked" type="number" min="0" max="100" defaultValue="9" required /></label><label className="field"><span>Previous change attempts</span><input name="previousAttempts" type="number" min="0" max="100" defaultValue="2" required /></label><label className="field"><span>Current aim</span><select name="currentGoal" defaultValue="stop"><option value="stop">Stop smoking</option><option value="reduce">Reduce smoking</option><option value="unsure">Not sure yet</option></select></label><label className="field"><span>Craving today: 0 to 10</span><input name="craving" type="number" min="0" max="10" defaultValue="6" required /></label><label className="field"><span>Confidence today: 0 to 10</span><input name="confidence" type="number" min="0" max="10" defaultValue="5" required /></label><label className="field"><span>Age band</span><select name="ageBand" defaultValue="35-44"><option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55-64</option><option>65+</option><option value="prefer-not-to-say">Prefer not to say</option></select></label></div></section><div className="form-actions"><button className="button" disabled={busy}>{busy ? "Saving…" : "Agree and save fictional baseline"}</button><p className="microcopy">Submitting records an immutable consent event. Optional choices can be withdrawn later.</p></div></form>;
}
