import Link from "next/link";
import { notFound } from "next/navigation";
import { requireServerSession } from "@/src/auth/server";
import { evidenceLibrary } from "@/src/coaching/evidence-library";
import { participantForUser } from "@/src/study/context";

export default async function EvidenceClaimPage({ params }: { params: Promise<{ claimId: string }> }) {
  const session = await requireServerSession();
  const participant = await participantForUser(session.userId);
  const { claimId } = await params;
  const library = participant ? await evidenceLibrary(participant.studyId, participant.synthetic) : null;
  const claim = library?.claims.find((item) => item.claimId === claimId);
  if (!claim) notFound();
  return <main id="main-content" className="app-content app-content--narrow">
    <nav className="breadcrumbs"><Link href="/participant/evidence">Evidence library</Link><span>/</span><span>Evidence detail</span></nav>
    <div className="app-title"><div><p className="eyebrow">Claim ID {claim.claimId}</p><h1>Evidence detail</h1></div></div>
    <article className="evidence-detail"><span className="tag">Synthetic release · {claim.certainty} source certainty</span><h2>{claim.wording}</h2><div className="notice"><strong>What this does not mean</strong><p>This population evidence cannot predict your outcome, diagnose a condition or decide which treatment is suitable for you. A qualified professional should discuss personal treatment choices.</p></div><h2>Sources</h2><ul>{claim.citations.map((citation) => <li key={citation.id}><a href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a><br /><span>{citation.organisation}, {citation.year} · source ID {citation.id}</span></li>)}</ul><h2>Review status</h2><p>This wording is released only for synthetic technical testing. It must remain hidden from real participants until a named authorised human completes evidence, citation-entailment and clinical-content review and a live evidence release is approved.</p></article>
  </main>;
}
