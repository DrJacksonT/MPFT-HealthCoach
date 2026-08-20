import Link from "next/link";
import { requireServerSession } from "@/src/auth/server";
import { participantForUser } from "@/src/study/context";
import { currentPlan } from "@/src/study/plan";
import { PlanForm } from "@/src/ui/study/PlanForm";

const labels: Record<string, string> = { health: "Protect my health", family: "Be there for family", money: "Keep more money", fitness: "Feel fitter", freedom: "Feel less controlled", stress: "Stress", "after-meals": "After meals", alcohol: "Alcohol", social: "Social situations", boredom: "Boredom", morning: "Morning", delay: "Delay", breathe: "Slow breathing", water: "Have water", walk: "Short walk", "message-support": "Message support", "change-routine": "Change routine" };

export default async function PlanPage() {
  const session = await requireServerSession(); const participant = await participantForUser(session.userId); const current = participant ? await currentPlan(participant.id) : null;
  return <main id="main-content" className="app-content"><nav className="breadcrumbs"><Link href="/participant">Today</Link><span>/</span><span>My plan</span></nav><div className="app-title"><div><p className="eyebrow">Flexible and versioned</p><h1>{current ? "Review or revise my plan" : "Make my plan"}</h1><p>A lapse is information, not failure. You can revise the plan compassionately.</p></div></div>{current && <section className="current-plan"><div><span className="tag tag--open">Version {current.version.version}</span><h2>{current.version.goalType === "stop" ? "Stop smoking" : "Reduce smoking"}</h2><p>{current.version.targetDate ? `Target date: ${current.version.targetDate}` : "No target date chosen"}</p></div><dl><div><dt>Motivations</dt><dd>{current.version.motivations.map((item) => labels[item] ?? item).join(", ")}</dd></div><div><dt>Triggers</dt><dd>{current.version.triggers.map((item) => labels[item] ?? item).join(", ")}</dd></div><div><dt>Coping actions</dt><dd>{current.version.copingActions.map((item) => labels[item] ?? item).join(", ")}</dd></div></dl></section>}<PlanForm revision={Boolean(current)} /></main>;
}
