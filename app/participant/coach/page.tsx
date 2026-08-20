import Link from "next/link";
import { CoachPanel } from "@/src/ui/study/CoachPanel";

export default function CoachPage() {
  return <main id="main-content" className="app-content">
    <nav className="breadcrumbs"><Link href="/participant">Today</Link><span>/</span><span>Coping support</span></nav>
    <div className="app-title"><div><p className="eyebrow">Structured first</p><h1>Coping support</h1><p>Choose a guided route. Chat is optional and never the only way forward.</p></div><Link className="button button--danger" href="/participant/coach/urgent">I might smoke now</Link></div>
    <div className="notice"><strong>This is an automated research tool, not a clinician.</strong> It can be wrong, nobody monitors it in real time, and it is not for emergencies. <Link href="/help">Get human or urgent help</Link>.</div>
    <CoachPanel />
  </main>;
}
