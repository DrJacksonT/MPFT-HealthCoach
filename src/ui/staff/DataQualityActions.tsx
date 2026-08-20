"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function csrfToken() { return decodeURIComponent(document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? ""); }

export function DataQualityActions({ issueId, resolved = false }: { issueId?: string; resolved?: boolean }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function send(action: string) { setBusy(true); setMessage(""); const response = await fetch("/api/staff/data-quality", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": csrfToken() }, body: JSON.stringify(issueId ? { action, issueId } : { action }) }); const data = await response.json().catch(() => ({})); setBusy(false); setMessage(response.ok ? action === "scan" ? `Scan complete: ${Number(data.detected ?? 0)} issue matches.` : "Resolution recorded." : "The data-quality action could not be recorded."); if (response.ok) router.refresh(); }
  if (!issueId) return <div className="staff-row-actions"><button className="button button--small" type="button" onClick={() => void send("scan")} disabled={busy}>Run deterministic checks</button>{message && <span role="status">{message}</span>}</div>;
  if (resolved) return <span>Resolved</span>;
  return <div className="staff-row-actions"><button className="button button--small button--outline" type="button" onClick={() => void send("corrected_source")} disabled={busy}>Source corrected</button><button className="plain-button" type="button" onClick={() => void send("confirmed_exception")} disabled={busy}>Accept exception</button><button className="plain-button" type="button" onClick={() => void send("not_an_issue")} disabled={busy}>Not applicable</button>{message && <span role="status">{message}</span>}</div>;
}
