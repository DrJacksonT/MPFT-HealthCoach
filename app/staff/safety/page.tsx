import Link from "next/link";
import { requireServerPermission } from "@/src/auth/server";
import { safetyRows } from "@/src/research/staff-data";
import { SafetyReviewActions } from "@/src/ui/staff/SafetyReviewActions";

export default async function StaffSafetyPage() {
  await requireServerPermission("safety:review"); const rows = await safetyRows();
  return <main id="main-content" className="app-content"><nav className="breadcrumbs"><Link href="/staff">Overview</Link><span>/</span><span>Safety and quality</span></nav><div className="app-title"><div><p className="eyebrow">Authorised quality review</p><h1>Safety and quality records</h1><p>Deterministic events and product feedback, without raw participant text.</p></div></div><div className="notice"><strong>This is not a clinical command centre or emergency inbox.</strong> Participants receive immediate self-directed signposting. Reviewing a record here does not mean emergency help was sent.</div><div className="safety-list">{rows.length === 0 ? <p>No safety or quality records.</p> : rows.map((flag) => <article key={flag.id}><div><span className={`tag ${flag.severity === "urgent" ? "tag--warning" : ""}`}>{flag.severity}</span><h2>{flag.category.replaceAll("_", " ")}</h2><p>{flag.participantCode} · {flag.createdAt.toLocaleString("en-GB")} · {flag.status}</p><p className="microcopy">Participant message code: {flag.messageCode}. Raw input is not displayed.</p><p>{flag.reviews.length} review event{flag.reviews.length === 1 ? "" : "s"} recorded.</p></div><SafetyReviewActions flagId={flag.id} status={flag.status} /></article>)}</div></main>;
}
