"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function csrfToken() { return decodeURIComponent(document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? ""); }
export function ReferralActions({ resourceId, accepted, used }: { resourceId: string; accepted: boolean; used: boolean }) {
  const router = useRouter(); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  async function send(action: "accept" | "used") { setBusy(true); const response = await fetch("/api/participant/referrals", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": csrfToken() }, body: JSON.stringify({ resourceId, action }) }); const data = await response.json().catch(() => ({})); setBusy(false); setStatus(String(data.message ?? "The choice could not be saved.")); if (response.ok) router.refresh(); }
  return <div className="referral-actions">{!accepted && <button className="button button--outline" type="button" onClick={() => void send("accept")} disabled={busy}>Save as a support option</button>}{accepted && !used && <button className="button button--outline" type="button" onClick={() => void send("used")} disabled={busy}>I used this support</button>}{used && <span className="tag tag--open">Participant reported used</span>}{status && <span role="status">{status}</span>}</div>;
}
