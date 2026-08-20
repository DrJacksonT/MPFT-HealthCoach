import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = {
  title: "Smoking behaviour-change research test",
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="study-hero">
          <div className="study-hero__copy">
            <p className="eyebrow">Smoking support research</p>
            <h1>Small, practical steps towards changing your smoking</h1>
            <p className="lead">
              This standalone research test combines a structured programme, short check-ins and clear evidence. It is designed as an adjunct to existing support, not a replacement for a clinician or stop-smoking service.
            </p>
            <div className="button-row">
              <Link className="button" href="/eligibility">Try the fictional eligibility route <ArrowRight aria-hidden="true" size={19} /></Link>
              <Link className="button button--outline" href="/study">Read the study information</Link>
            </div>
            <p className="microcopy">An invitation is needed to create an account. No real participants are being recruited.</p>
          </div>
          <aside className="status-card" aria-labelledby="status-title">
            <span className="status-card__icon"><ShieldCheck aria-hidden="true" /></span>
            <h2 id="status-title">Current release status</h2>
            <dl>
              <div><dt>Staff simulation</dt><dd><span className="tag tag--open">Open locally</span></dd></div>
              <div><dt>Real recruitment</dt><dd><span className="tag tag--closed">Closed</span></dd></div>
              <div><dt>Live AI coach</dt><dd><span className="tag tag--closed">Closed</span></dd></div>
              <div><dt>Gambling participant module</dt><dd><span className="tag tag--closed">Closed</span></dd></div>
            </dl>
            <p>Software checks cannot approve a live pilot. Named governance, safety and deployment decisions are still required.</p>
          </aside>
        </section>

        <section className="feature-section" aria-labelledby="how-heading">
          <div className="section-heading">
            <p className="eyebrow">What the smoking programme contains</p>
            <h2 id="how-heading">Useful structure, with honest limits</h2>
          </div>
          <div className="feature-grid">
            <article><ClipboardCheck aria-hidden="true" /><h3>Make a flexible plan</h3><p>Choose a goal, notice triggers and keep coping actions you can revise without judgement.</p></article>
            <article><CheckCircle2 aria-hidden="true" /><h3>Check in briefly</h3><p>Record what happened today. A missing day stays unknown; it is never counted as success or failure.</p></article>
            <article><LockKeyhole aria-hidden="true" /><h3>Keep choices bounded</h3><p>Essential actions work without generated text. Evidence and safety wording remain controlled by the application.</p></article>
          </div>
        </section>

        <section className="callout-band">
          <div><p className="eyebrow">Already have a fictional test account?</p><h2>Continue where you left off</h2></div>
          <Link className="button button--light" href="/login">Sign in to the test platform</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
