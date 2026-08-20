import Link from "next/link";
import { requireServerPermission } from "@/src/auth/server";
import { deidentifiedParticipants } from "@/src/research/participants";

export default async function StaffParticipantsPage() {
  await requireServerPermission("research:deidentified"); const people = await deidentifiedParticipants();
  return <main id="main-content" className="app-content"><nav className="breadcrumbs"><Link href="/staff">Overview</Link><span>/</span><span>Participant flow</span></nav><div className="app-title"><div><p className="eyebrow">Pseudonymised only</p><h1>Participant flow</h1><p>Contact identities are not joined into this workspace.</p></div></div><div className="notice"><strong>Participant codes are research pseudonyms, not account aliases.</strong> Due and overdue counts describe configured windows; they do not imply monitoring.</div><div className="table-scroll staff-table"><table><thead><tr><th>Participant code</th><th>Status</th><th>Enrolled</th><th>Check-ins</th><th>Follow-ups complete</th><th>Due</th><th>Overdue</th></tr></thead><tbody>{people.map((person) => <tr key={person.code}><td><strong>{person.code}</strong>{person.synthetic && <span className="tag">synthetic</span>}</td><td>{person.status}</td><td>{person.enrolledAt?.toLocaleDateString("en-GB") ?? "Not enrolled"}</td><td>{person.completedCheckIns}</td><td>{person.followUpsCompleted}</td><td>{person.followUpsDue}</td><td>{person.followUpsOverdue}</td></tr>)}</tbody></table></div></main>;
}
