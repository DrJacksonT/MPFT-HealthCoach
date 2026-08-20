export function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(",")}}`;
}

export function countAuditSegments(
  rows: ReadonlyArray<{ previousEventHash: string | null }>,
): number {
  return rows.reduce(
    (count, row) => count + (row.previousEventHash === null ? 1 : 0),
    0,
  );
}
