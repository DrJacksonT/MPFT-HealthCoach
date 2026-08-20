import Link from "next/link";
import { redirect } from "next/navigation";
import { requireServerSession } from "@/src/auth/server";
import { hasPermission, isStaff } from "@/src/auth/permissions";
import { LogoutButton } from "@/src/ui/auth/LogoutButton";
import { StatusBanner } from "@/src/ui/site/SiteHeader";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await requireServerSession(); if (!isStaff(session.roles)) redirect("/participant"); if (session.assuranceLevel < 2) redirect("/mfa");
  return <><StatusBanner /><div className="app-shell staff-shell"><aside className="app-sidebar staff-sidebar"><Link href="/staff" className="app-wordmark">MPFT <span>Staff research workspace</span></Link><nav aria-label="Staff">{hasPermission(session.roles, "research:deidentified") && <><Link href="/staff">Overview</Link><Link href="/staff/participants">Participant flow</Link><Link href="/staff/surveys">Surveys and outcomes</Link><Link href="/staff/ai">AI reliability and cost</Link><Link href="/staff/data-quality">Data quality</Link><Link href="/staff/gambling">Gambling simulation</Link></>}{hasPermission(session.roles, "safety:review") && <Link href="/staff/safety">Safety and quality</Link>}{hasPermission(session.roles, "evidence:review") && <Link href="/staff/evidence">Evidence releases</Link>}{hasPermission(session.roles, "exports:create") && <Link href="/staff/exports">Exports and reports</Link>}{hasPermission(session.roles, "identity:privileged") && <Link href="/staff/rights">Subject rights</Link>}{hasPermission(session.roles, "configuration:manage") && <Link href="/staff/releases">Release gates</Link>}</nav><div className="sidebar-user"><span>Second factor confirmed</span><strong>{session.displayName}</strong><small>{session.roles.join(", ")}</small><LogoutButton /></div></aside><div className="app-main"><header className="app-mobile-header"><Link href="/staff">Staff workspace</Link><LogoutButton /></header>{children}</div></div></>;
}
