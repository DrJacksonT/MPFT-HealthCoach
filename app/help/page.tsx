import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Help and support" };

export default function HelpPage() {
  return (
    <>
      <SiteHeader compact />
      <main id="main-content" className="content-shell">
        <article className="prose-card">
          <p className="eyebrow">Help is available outside this website</p>
          <h1>Help and support</h1>
          <div className="notice notice--urgent"><h2>If someone is in immediate danger</h2><p>Call <strong>999</strong> or go to A&amp;E. This website is not monitored and cannot contact emergency services for you.</p></div>
          <h2>Urgent health advice</h2><p>Use <a href="https://111.nhs.uk/">NHS 111 online</a> or call <strong>111</strong> when you need urgent help but it is not a 999 emergency.</p>
          <h2>Stop-smoking support</h2><p>Your GP, pharmacist or local stop-smoking service can discuss evidence-based support, including medication suitability. The research test does not prescribe or replace that advice.</p>
          <h2>Problems with the research test</h2><p>No staffed response service has been authorised for this build. Do not submit urgent or identifying clinical information through test feedback.</p>
          <Link className="button button--outline" href="/">Return home</Link>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
