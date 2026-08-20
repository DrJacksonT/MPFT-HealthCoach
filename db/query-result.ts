type ResultWithRows<T> = {
  rows: T[];
};

export function queryRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (
    result !== null &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as ResultWithRows<T>).rows)
  )
    return (result as ResultWithRows<T>).rows;
  throw new Error("Database query returned an unsupported result shape.");
}

export function firstQueryRow<T>(result: unknown): T | undefined {
  return queryRows<T>(result)[0];
}
