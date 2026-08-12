export interface TelemetryEvent {
  at: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  ok: boolean;
  approximateCostUsd: number;
}
const events: TelemetryEvent[] = [];
export const pricing = {
  effectiveDate: "2026-08-12",
  currency: "USD",
  models: {
    "gpt-5.6-luna": { inputPerMillion: 0.2, outputPerMillion: 1.2 },
    "gpt-5.6-terra": { inputPerMillion: 2, outputPerMillion: 12 },
  } as Record<string, { inputPerMillion: number; outputPerMillion: number }>,
};
export function addTelemetry(
  input: Omit<TelemetryEvent, "approximateCostUsd">,
) {
  const price = pricing.models[input.model];
  const approximateCostUsd = price
    ? (input.inputTokens / 1_000_000) * price.inputPerMillion +
      (input.outputTokens / 1_000_000) * price.outputPerMillion
    : 0;
  events.push({ ...input, approximateCostUsd });
  if (events.length > 500) events.shift();
}
export function telemetrySummary() {
  const count = events.length;
  const totalCost = events.reduce((n, x) => n + x.approximateCostUsd, 0);
  return {
    requestCount: count,
    inputTokens: events.reduce((n, x) => n + x.inputTokens, 0),
    outputTokens: events.reduce((n, x) => n + x.outputTokens, 0),
    approximateCostUsd: totalCost,
    averageCost: count ? totalCost / count : 0,
    averageLatencyMs: count
      ? events.reduce((n, x) => n + x.latencyMs, 0) / count
      : 0,
    errorRate: count ? events.filter((x) => !x.ok).length / count : 0,
    pricing,
    recent: events.slice(-20).reverse(),
  };
}
