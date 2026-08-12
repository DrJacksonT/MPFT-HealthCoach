import Link from "next/link";
import { telemetrySummary } from "@/src/telemetry/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Development telemetry", robots: { index: false, follow: false } };

export default function TelemetryPage() {
  const data = telemetrySummary();
  return (
    <main id="main-content" className="content">
      <div className="prototype-banner">
        Development information only. Prompts and profile details are not
        recorded here.
      </div>
      <header className="page-head" style={{ marginTop: 40 }}>
        <p className="eyebrow">Cost and reliability</p>
        <h1>Development telemetry</h1>
        <p>
          These figures cover the current server process only. Cost is an
          estimate based on dated pricing metadata.
        </p>
      </header>
      <div className="stats">
        <article>
          <small>REQUESTS</small>
          <strong>{data.requestCount}</strong>
          <span>current process</span>
        </article>
        <article>
          <small>INPUT TOKENS</small>
          <strong>{data.inputTokens}</strong>
          <span>reported by the API</span>
        </article>
        <article>
          <small>OUTPUT TOKENS</small>
          <strong>{data.outputTokens}</strong>
          <span>reported by the API</span>
        </article>
        <article>
          <small>ESTIMATED COST</small>
          <strong>${data.approximateCostUsd.toFixed(4)}</strong>
          <span>USD</span>
        </article>
      </div>
      <div className="help-grid">
        <article>
          <h2>Average interaction</h2>
          <p>
            ${data.averageCost.toFixed(4)} estimated cost and{" "}
            {Math.round(data.averageLatencyMs)} milliseconds latency.
          </p>
        </article>
        <article>
          <h2>Error rate</h2>
          <p>{(data.errorRate * 100).toFixed(1)}% in this process.</p>
        </article>
      </div>
      <div className="chart-card">
        <h2>Pricing metadata</h2>
        <p>
          Effective {data.pricing.effectiveDate}. Prices are configuration, not
          permanent constants.
        </p>
        <table>
          <caption>Model prices per million tokens</caption>
          <thead>
            <tr>
              <th>Model</th>
              <th>Input</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.pricing.models).map(([model, price]) => (
              <tr key={model}>
                <td>{model}</td>
                <td>${price.inputPerMillion}</td>
                <td>${price.outputPerMillion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        This prototype has no stable participant identifier, so it does not
        claim a reliable cost per real participant. A controlled simulation can
        use average interaction cost multiplied by a fixed interaction count.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href="/admin/evidence" className="secondary inline">
          Evidence dashboard
        </Link>
        <Link href="/" className="secondary inline">
          Return to prototype
        </Link>
      </div>
    </main>
  );
}
