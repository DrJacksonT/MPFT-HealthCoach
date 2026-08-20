import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Study information" };

export default function StudyInformationPage() {
  return (
    <>
      <SiteHeader compact />
      <main id="main-content" className="content-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Study information</span></nav>
        <article className="prose-card">
          <p className="eyebrow">Draft participant information · version 1 · synthetic test</p>
          <h1>About the smoking behaviour-change study</h1>
          <div className="notice notice--warning"><strong>No real recruitment is open.</strong> This information is present so the complete software journey can be tested with fictional data. It has not been approved as a live participant information sheet.</div>

          <h2>Why this research is being explored</h2>
          <p>We are testing whether a structured digital programme can help people plan changes to smoking, use brief coping tools and record outcomes. The software is intended to sit alongside established stop-smoking and healthcare support.</p>

          <h2>What taking part would involve</h2>
          <ul>
            <li>checking eligibility, creating an invited account and giving item-by-item consent;</li>
            <li>answering baseline questions about smoking and wellbeing;</li>
            <li>making and revising a change plan;</li>
            <li>using short daily check-ins and scheduled 4-week and 12-week outcome questions;</li>
            <li>optionally using bounded coaching text where a release has been separately approved.</li>
          </ul>

          <h2>Choice, withdrawal and contact</h2>
          <p>Use of generated text and follow-up contact are separate choices. A participant route must allow withdrawal, stopping further contact and requesting deletion where policy permits. Withdrawing from research must not affect ordinary NHS care.</p>

          <h2>Risks and limits</h2>
          <p>Digital advice can be incomplete or wrong. The site cannot diagnose, prescribe, predict an individual outcome or watch for emergencies. Structured help and support links remain available if an AI provider is disabled or fails.</p>

          <h2 id="privacy">Privacy summary</h2>
          <p>The technical design separates sign-in/contact identity, research records, raw optional text, safety records and audit events. Researchers should normally see de-identified data. The final controller, lawful basis, retention schedule and DPIA require organisational approval before live use.</p>

          <h2 id="accessibility">Accessibility</h2>
          <p>The test platform targets WCAG 2.2 AA, keyboard use, clear focus, useful error summaries and text alternatives for charts. Automated and browser checks support—but do not replace—accessibility testing with people.</p>

          <div className="button-row"><Link className="button" href="/eligibility">Continue to the fictional eligibility route</Link><Link className="button button--outline" href="/help">See support options</Link></div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
