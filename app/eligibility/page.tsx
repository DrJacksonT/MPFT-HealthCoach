import type { Metadata } from "next";
import Link from "next/link";
import { EligibilityForm } from "@/src/ui/study/EligibilityForm";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Fictional eligibility check" };

export default function EligibilityPage() {
  return <><SiteHeader compact /><main id="main-content" className="content-shell"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Eligibility</span></nav><div className="form-card"><p className="eyebrow">Step 1 of the synthetic onboarding route</p><h1>Check the draft eligibility route</h1><p className="lead">Answer four questions. These answers are not saved because you are not signed in yet.</p><EligibilityForm /></div></main><SiteFooter /></>;
}
