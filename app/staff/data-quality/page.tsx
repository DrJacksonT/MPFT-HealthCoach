import Link from "next/link";
import { requireServerPermission } from "@/src/auth/server";
import { dataQualityRows } from "@/src/research/data-quality";
import { DataQualityActions } from "@/src/ui/staff/DataQualityActions";

export default async function StaffDataQualityPage() {
  await requireServerPermission("research:deidentified"); const issues = await dataQualityRows();
  return <main id="main-content" className="app-content"><nav className="breadcrumbs"><Link href="/staff">Overview</Link><span>/</span><span>Data quality</span></nav><div className="app-title"><div><p className="eyebrow">Deterministic research checks</p><h1>Data-quality issues and exceptions</h1><p>Rules identify contradictions and governance gaps. They never infer a missing outcome.</p></div><DataQualityActions /></div><div className="notice"><strong>Resolution is auditable, not destructive.</strong> Source observations remain immutable; a resolution records the authorised interpretation or confirms that a source correction was made.</div><div className="safety-list">{issues.length === 0 ? <p>No issues recorded. Run the deterministic checks to create a timestamped scan.</p> : issues.map((issue) => <article key={issue.id}><div><span className={`tag ${issue.severity === "error" ? "tag--warning" : ""}`}>{issue.severity}</span><h2>{issue.ruleCode.replaceAll("_", " ")}</h2><p>{issue.participantCode ? `${issue.participantCode} · ` : ""}{issue.entityType} · {issue.status}</p><p className="microcopy">Detected {issue.detectedAt.toLocaleString("en-GB")}. Structured details: {JSON.stringify(issue.details)}</p></div><DataQualityActions issueId={issue.id} resolved={issue.status === "resolved"} /></article>)}</div></main>;
}
