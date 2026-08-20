import Link from "next/link";
import { requireServerPermission } from "@/src/auth/server";
import { evidenceRows } from "@/src/research/staff-data";

export default async function StaffEvidencePage() {
  await requireServerPermission("evidence:review"); const rows = await evidenceRows();
  return <main id="main-content" className="app-content"><nav className="breadcrumbs"><Link href="/staff">Staff workspace</Link><span>/</span><span>Evidence releases</span></nav><div className="app-title"><div><p className="eyebrow">Human gate preserved</p><h1>Evidence releases</h1><p>Automated checks can suppress or flag evidence. They cannot assign human verification.</p></div></div><div className="notice"><strong>No release control is enabled in this technical build.</strong> A named authorised human must complete source, locator, entailment, applicability, limitation and patient-wording review before a live release can be signed.</div>{rows.map((release) => <section className="staff-section" key={release.id}><div className="section-heading"><div><span className="tag">{release.status.replaceAll("_", " ")}</span><h2>{release.version}</h2></div><span>{release.claims.length} claims</span></div><p className="microcopy">Manifest hash {release.manifestHash}</p><div className="evidence-card-list">{release.claims.map((claim) => <article key={claim.id}><strong>{claim.claimId}</strong><p>{claim.wording}</p><p className="microcopy">Intent: {claim.intent} · certainty: {claim.certainty} · source IDs: {claim.citationIds.join(", ")}</p></article>)}</div></section>)}</main>;
}
