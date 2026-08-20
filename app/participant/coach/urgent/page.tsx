import Link from "next/link";
import { intentContent } from "@/src/coaching/catalogue";

export default function UrgentCravingPage() {
  const content = intentContent.craving;
  return <main id="main-content" className="app-content app-content--narrow">
    <nav className="breadcrumbs"><Link href="/participant/coach">Coping support</Link><span>/</span><span>I might smoke</span></nav>
    <div className="app-title"><div><p className="eyebrow">No AI needed</p><h1>{content.title}</h1><p>{content.introduction}</p></div></div>
    <div className="notice"><strong>If this is really about immediate danger, severe symptoms or thoughts of harming yourself, do not continue here.</strong> <Link href="/help">Open urgent help without explaining it again</Link>.</div>
    <div className="structured-actions structured-actions--large">{content.actions.map((action, index) => <article key={action.code}><span className="step-number">{index + 1}</span><h2>{action.title}</h2><p>{action.detail}</p></article>)}</div>
    <div className="coach-actions"><Link className="button" href="/participant/check-in">Record what happened</Link><Link className="button button--outline" href="/participant/plan">Review my plan</Link><Link className="plain-button" href="/participant">Back to today</Link></div>
  </main>;
}
