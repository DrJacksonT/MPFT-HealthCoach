import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/src/ui/auth/LogoutButton";
import { requireServerSession } from "@/src/auth/server";
import { StatusBanner } from "@/src/ui/site/SiteHeader";

export default async function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const session = await requireServerSession();
  if (!session.roles.includes("participant")) redirect("/staff");
  return <><StatusBanner /><div className="app-shell"><aside className="app-sidebar"><Link href="/participant" className="app-wordmark">MPFT <span>Research test</span></Link><nav aria-label="Participant"><Link href="/participant">Today</Link><Link href="/participant/plan">My plan</Link><Link href="/participant/check-in">Check in</Link><Link href="/participant/progress">Progress</Link><Link href="/participant/coach">Coping support</Link><Link href="/participant/evidence">Evidence library</Link><Link href="/participant/support">Support options</Link><Link href="/participant/surveys">Research questions</Link><Link href="/participant/follow-ups">Smoking follow-ups</Link><Link href="/participant/account">Account and choices</Link><Link href="/help">Help</Link></nav><div className="sidebar-user"><span>Signed in as</span><strong>{session.displayName}</strong><LogoutButton /></div></aside><div className="app-main"><header className="app-mobile-header"><Link href="/participant">MPFT Research test</Link><LogoutButton /></header>{children}</div></div></>;
}
