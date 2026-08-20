"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function csrfToken() {
  return decodeURIComponent(document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? "");
}

export function AccountActions({ optionalAiText, optionalContact, withdrawn }: { optionalAiText: boolean; optionalContact: boolean; withdrawn: boolean }) {
  const router = useRouter(); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false); const [confirm, setConfirm] = useState("");
  async function send(body: Record<string, unknown>) {
    setBusy(true); setStatus("");
    const response = await fetch("/api/participant/account", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": csrfToken() }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({})); setBusy(false); setStatus(String(data.message ?? (response.ok ? "Saved." : "The request could not be saved."))); if (response.ok) router.refresh();
  }
  return <div className="account-sections">
    {!withdrawn && <section><h2>Optional consent choices</h2><p>These choices are separate from the required study consent and can be changed without losing access to structured support.</p><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void send({ action: "update_choices", optionalAiText: form.get("optionalAiText") === "on", optionalContact: form.get("optionalContact") === "on" }); }}><label className="toggle-choice"><input type="checkbox" name="optionalAiText" defaultChecked={optionalAiText} /> Allow my optional typed words to be sent to the bounded AI provider when the live AI gate is open</label><label className="toggle-choice"><input type="checkbox" name="optionalContact" defaultChecked={optionalContact} /> Allow separate contact about an optional interview</label><button className="button" disabled={busy}>Save optional choices</button></form></section>}
    <section><h2>Your information rights</h2><p>These buttons create auditable requests. They do not claim that deletion is immediate; authorised staff must verify identity and apply the approved retention rules.</p><div className="account-action-grid"><button className="button button--outline" type="button" onClick={() => void send({ action: "request_data_copy" })} disabled={busy}>Request an accessible data copy</button><button className="button button--outline" type="button" onClick={() => void send({ action: "request_restriction" })} disabled={busy}>Request restriction</button><button className="button button--outline" type="button" onClick={() => void send({ action: "request_deletion" })} disabled={busy}>Request deletion review</button></div></section>
    {!withdrawn && <section className="danger-zone"><h2>Withdraw from the study</h2><p>Withdrawal closes coaching and new research entries. Existing records are not silently erased; their future use follows the approved withdrawal and retention decision.</p><label htmlFor="withdraw-confirm">Type <strong>WITHDRAW</strong> to confirm</label><input id="withdraw-confirm" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="off" /><button className="button button--danger" type="button" onClick={() => void send({ action: "withdraw", confirm, scope: "stop_and_restrict_future_use" })} disabled={busy || confirm !== "WITHDRAW"}>Record withdrawal</button></section>}
    {status && <div className="success-summary" role="status"><p>{status}</p></div>}
  </div>;
}
