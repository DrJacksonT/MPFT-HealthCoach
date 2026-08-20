import Link from "next/link";
import { notFound } from "next/navigation";
import { requireServerSession } from "@/src/auth/server";
import { participantForUser } from "@/src/study/context";
import { participantOutcome } from "@/src/study/outcomes";
import { FollowUpForm } from "@/src/ui/study/FollowUpForm";

export default async function FollowUpPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireServerSession(); const participant = await participantForUser(session.userId); const { id } = await params; const outcome = participant ? await participantOutcome(participant.id, id) : null; if (!outcome) notFound(); const now = new Date(); const unavailable = now < outcome.windowOpensAt ? "This follow-up window has not opened yet." : now > outcome.windowClosesAt ? "This follow-up window has closed. Missing follow-up remains unknown." : null; const existing = (outcome.selfReport ?? {}) as Record<string, unknown>;
  return <main id="main-content" className="app-content"><nav className="breadcrumbs"><Link href="/participant/follow-ups">Smoking follow-ups</Link><span>/</span><span>{outcome.timepoint}</span></nav><div className="app-title"><div><p className="eyebrow">{outcome.timepoint.replace("-", " ")}</p><h1>Smoking follow-up</h1><p>A brief, versioned self-report for the configured outcome window.</p></div></div>{outcome.completedAt ? <div className="success-summary"><h2>Already completed</h2><p>Completed {outcome.completedAt.toLocaleString("en-GB")}. The source observation is immutable.</p></div> : unavailable ? <div className="notice"><h2>Follow-up unavailable</h2><p>{unavailable}</p></div> : <FollowUpForm id={outcome.id} existing={existing} />}</main>;
}
