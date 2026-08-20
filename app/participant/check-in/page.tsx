import Link from "next/link";
import { requireServerSession } from "@/src/auth/server";
import { participantForUser } from "@/src/study/context";
import { todayCheckIn } from "@/src/study/check-ins";
import { CheckInForm } from "@/src/ui/study/CheckInForm";

export default async function CheckInPage() {
  const session = await requireServerSession(); const participant = await participantForUser(session.userId); const checkIn = participant ? await todayCheckIn(participant.id) : null;
  return <main id="main-content" className="app-content"><nav className="breadcrumbs"><Link href="/participant">Today</Link><span>/</span><span>Check in</span></nav><div className="app-title"><div><p className="eyebrow">About two minutes</p><h1>Today’s check-in</h1><p>Record what happened without judgement. This is self-report, not biochemical verification.</p></div></div>{!checkIn ? <div className="notice notice--warning"><h2>No check-in is scheduled</h2><p>Complete consent and make a plan first.</p><Link href="/participant/plan">Go to my plan</Link></div> : <CheckInForm completed={checkIn.status === "completed"} />}</main>;
}
