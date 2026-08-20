import Link from "next/link";
import { requireServerSession } from "@/src/auth/server";
import { participantOverview } from "@/src/study/participant";
import { OnboardingForm } from "@/src/ui/study/OnboardingForm";

export default async function OnboardingPage() {
  const session = await requireServerSession();
  const overview = await participantOverview(session.userId);
  return <main id="main-content" className="app-content"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/participant">Today</Link><span>/</span><span>Onboarding</span></nav><div className="app-title"><div><p className="eyebrow">Draft content version 1</p><h1>Consent and baseline</h1><p>Complete this route only with fictional data.</p></div></div>{overview?.consent ? <div className="success-summary"><h2>Onboarding is complete</h2><p>The recorded consent remains versioned. You can now make or revise a plan.</p><Link className="button" href="/participant/plan">Go to my plan</Link></div> : <OnboardingForm />}</main>;
}
