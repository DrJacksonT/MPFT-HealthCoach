"use client";
import { useState } from "react";

function csrfToken() { return decodeURIComponent(document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? ""); }
export function ExportButtons() {
  const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  async function download(format: "csv" | "json") { setBusy(true); setStatus(""); const response = await fetch("/api/staff/exports", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": csrfToken() }, body: JSON.stringify({ format, scope: "deidentified_analysis" }) }); if (!response.ok) { setBusy(false); setStatus("Export could not be generated."); return; } const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = response.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] ?? `analysis.${format}`; link.click(); URL.revokeObjectURL(url); setBusy(false); setStatus(`Generated audited ${format.toUpperCase()} export ${response.headers.get("x-export-id")}.`); }
  return <div><div className="account-action-grid"><button className="button" onClick={() => void download("csv")} disabled={busy}>Download analysis CSV</button><button className="button button--outline" onClick={() => void download("json")} disabled={busy}>Download JSON with dictionary</button></div>{status && <p role="status">{status}</p>}</div>;
}
