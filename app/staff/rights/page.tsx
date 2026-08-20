import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { participantRequests, participants } from "@/db/schema";
import { requireServerPermission } from "@/src/auth/server";

export default async function StaffRightsPage() {
  await requireServerPermission("identity:privileged");
  const db = await getDb();
  const requests = await db.select({ id: participantRequests.id, participantCode: participants.participantCode, type: participantRequests.requestType, status: participantRequests.status, createdAt: participantRequests.createdAt, completedAt: participantRequests.completedAt, synthetic: participants.synthetic }).from(participantRequests).innerJoin(participants, eq(participants.id, participantRequests.participantId)).orderBy(desc(participantRequests.createdAt));
  return <main id="main-content" className="app-content"><nav className="breadcrumbs"><Link href="/staff">Overview</Link><span>/</span><span>Subject rights</span></nav><div className="app-title"><div><p className="eyebrow">Privileged identity procedure</p><h1>Data-copy, restriction and deletion requests</h1><p>Only research pseudonyms are shown here. Live requests require identity verification and an approved retention decision outside this application.</p></div></div><div className="notice"><strong>Synthetic processing is available only through the audited operations command.</strong> It fails closed for non-synthetic records and never silently erases the audit trail.</div><div className="table-scroll staff-table"><table><thead><tr><th>Participant</th><th>Request</th><th>Status</th><th>Requested</th><th>Completed</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td>{request.participantCode} {request.synthetic && <span className="tag">synthetic</span>}</td><td>{request.type.replaceAll("_", " ")}</td><td>{request.status.replaceAll("_", " ")}</td><td>{request.createdAt.toLocaleString("en-GB")}</td><td>{request.completedAt?.toLocaleString("en-GB") ?? "Not complete"}</td></tr>)}</tbody></table></div></main>;
}
