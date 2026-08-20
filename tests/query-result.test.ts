import { describe, expect, it } from "vitest";
import { firstQueryRow, queryRows } from "../db/query-result";

describe("database query result compatibility", () => {
  it("reads Postgres.js array results", () => {
    const result = [{ count: 2 }];
    expect(queryRows<{ count: number }>(result)).toEqual(result);
    expect(firstQueryRow<{ count: number }>(result)).toEqual({ count: 2 });
  });

  it("reads PGlite results with a rows property", () => {
    const result = { rows: [{ count: 3 }] };
    expect(queryRows<{ count: number }>(result)).toEqual(result.rows);
    expect(firstQueryRow<{ count: number }>(result)).toEqual({ count: 3 });
  });

  it("rejects unknown result shapes", () => {
    expect(() => queryRows({ count: 1 })).toThrow("unsupported result shape");
  });
});
