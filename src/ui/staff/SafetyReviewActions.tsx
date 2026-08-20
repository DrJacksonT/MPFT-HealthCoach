"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function csrfToken() { return decodeURIComponent(document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? ""); }
export function SafetyReviewActions({ flagId, status }: { flagId: string; status: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function send(action: string) { setBusy(true); const response = await fetch("/api/staff/safety/review", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": csrfToken() }, body: JSON.stringify({ flagId, action }) }); setBusy(false); setMessage(response.ok ? "Review recorded." : "Review could not be recorded."); if (response.ok) router.refresh(); }
  if (status === "resolved") return <span>Resolved</span>;
  return <div className="staff-row-actions">{status === "open" && <button className="button button--small button--outline" onClick={() => void send("acknowledge")} disabled={busy}>Acknowledge</button>}<button className="button button--small button--outline" onClick={() => void send("resolve_quality_follow_up")} disabled={busy}>Resolve: follow-up recorded</button><button className="plain-button" onClick={() => void send("resolve_no_further_action")} disabled={busy}>Resolve: no further action</button>{message && <span role="status">{message}</span>}</div>;
}
