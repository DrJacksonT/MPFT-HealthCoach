import Link from "next/link";
import { evidenceRecords } from "@/src/data/evidence";

export const dynamic = "force-dynamic";
export const metadata = { title: "Evidence administration", robots: { index: false, follow: false } };
export default function EvidenceAdmin() {
  const counts = ["VERIFIED", "UNREVIEWED", "REJECTED", "STALE"].map(
    (status) => ({
      status,
      count: evidenceRecords.filter((x) => x.status === status).length,
    }),
  );
  return (
    <main id="main-content" className="content">
      <div className="prototype-banner">
        This developer page is for checking sources. It is not a clinical
        publication system.
      </div>
      <header className="page-head" style={{ marginTop: 40 }}>
        <p className="eyebrow">Evidence administration</p>
        <h1>Every claim has a trail</h1>
        <p>
          Read-only inspection of source, extraction, confidence, status and
          freshness. Changes require reviewed code/data updates; this page
          cannot publish evidence.
        </p>
      </header>
      <div className="stats">
        {counts.map((x) => (
          <article key={x.status}>
            <small>{x.status}</small>
            <strong>{x.count}</strong>
            <span>records</span>
          </article>
        ))}
      </div>
      <div className="chart-card">
        <table>
          <caption>Evidence records and provenance</caption>
          <thead>
            <tr>
              <th>Status</th>
              <th>Record</th>
              <th>Source</th>
              <th>Confidence</th>
              <th>Last checked</th>
              <th>Review due</th>
              <th>Why visible</th>
            </tr>
          </thead>
          <tbody>
            {evidenceRecords.map((x) => (
              <tr key={x.id}>
                <td>
                  <span className="verified">{x.status}</span>
                </td>
                <td>
                  <strong>{x.id}</strong>
                  <br />
                  <small>{x.patientFriendlySummary}</small>
                </td>
                <td>
                  <a href={x.url} target="_blank" rel="noreferrer">
                    {x.organisation}, {x.publicationYear}
                  </a>
                </td>
                <td>{x.evidenceConfidence}</td>
                <td>{x.lastVerifiedDate}</td>
                <td>{x.reviewDueDate}</td>
                <td>
                  <small>{x.verificationNotes}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="support-note">
        <div>
          <strong>Freshness rule</strong>
          <p>
            A patient-eligible record must be VERIFIED, active, not superseded
            and within its review date. The freshness script can flag records
            but never publishes changes automatically.
          </p>
          <code>npm run evidence:freshness</code>
        </div>
      </section>
      <Link href="/" className="secondary inline">
        Return to prototype
      </Link>
    </main>
  );
}
