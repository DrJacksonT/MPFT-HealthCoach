import Link from "next/link";
import { requireServerSession } from "@/src/auth/server";
import { evidenceLibrary } from "@/src/coaching/evidence-library";
import { participantForUser } from "@/src/study/context";

export default async function EvidenceLibraryPage() {
  const session = await requireServerSession();
  const participant = await participantForUser(session.userId);
  const library = participant ? await evidenceLibrary(participant.studyId, participant.synthetic) : { releaseVersion: null, releaseStatus: null, claims: [] };
  return <main id="main-content" className="app-content">
    <nav className="breadcrumbs"><Link href="/participant">Today</Link><span>/</span><span>Evidence library</span></nav>
    <div className="app-title"><div><p className="eyebrow">Application-owned facts</p><h1>Evidence library</h1><p>Sources and limitations shown separately from any optional AI reflection.</p></div></div>
    <div className="notice"><strong>Synthetic evidence release only.</strong> The current release is for staff and fictional testing. Named human evidence and clinical-content approval is still required before live participant use.</div>
    <dl className="release-summary"><div><dt>Release</dt><dd>{library.releaseVersion ?? "No eligible release"}</dd></div><div><dt>Status</dt><dd>{library.releaseStatus?.replaceAll("_", " ") ?? "closed"}</dd></div><div><dt>Claims available</dt><dd>{library.claims.length}</dd></div></dl>
    <div className="evidence-card-list">{library.claims.length === 0 ? <div className="notice"><h2>No claims are released</h2><p>Coping tools still work, but factual evidence text stays suppressed.</p></div> : library.claims.map((claim) => <article key={claim.claimId}><span className="tag">{claim.certainty} certainty in source review</span><h2><Link href={`/participant/evidence/${claim.claimId}`}>{claim.wording}</Link></h2><p>{claim.citations.length} source{claim.citations.length === 1 ? "" : "s"} · population evidence, not an individual prediction</p><Link className="plain-button" href={`/participant/evidence/${claim.claimId}`}>Read sources and limitations</Link></article>)}</div>
  </main>;
}
