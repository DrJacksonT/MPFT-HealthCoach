import { afterEach, describe, expect, it, vi } from "vitest";
import { engagementDefinitions, productEventNames } from "@/src/research/product-events";
import { maximumCoachCallCostUsd } from "@/src/coaching/budget";
import { resetEnvironmentForTests } from "@/src/config/environment";
import { rightsProcessingPlan } from "@/src/research/rights";
import { participantEntryOpen } from "@/src/study/context";
import { countAuditSegments, stableJson } from "@/src/audit/canonical";

describe("research semantics", () => {
  afterEach(() => { vi.unstubAllEnvs(); resetEnvironmentForTests(); });
  it("defines engagement without treating page views as meaningful use", () => {
    expect(productEventNames).toContain("session.authenticated");
    expect(productEventNames).toContain("check_in.completed");
    expect(productEventNames.some((name) => name.includes("page_view"))).toBe(false);
    expect(engagementDefinitions.meaningfulUse).toContain("two distinct UTC dates");
    expect(engagementDefinitions.session).toContain("page views alone do not count");
  });

  it("reserves a conservative positive maximum when reviewed prices are configured", () => {
    vi.stubEnv("OPENAI_INPUT_USD_PER_1M", "1");
    vi.stubEnv("OPENAI_OUTPUT_USD_PER_1M", "4");
    resetEnvironmentForTests();
    expect(maximumCoachCallCostUsd()).toBeCloseTo(0.0118, 8);
  });

  it("fails live subject-rights processing closed and closes restricted entry", () => {
    expect(rightsProcessingPlan("deletion", false).executable).toBe(false);
    expect(rightsProcessingPlan("deletion", true).actions).toContain("delete_contact_identity");
    expect(participantEntryOpen({ status: "active", withdrawnAt: null })).toBe(true);
    expect(participantEntryOpen({ status: "restricted", withdrawnAt: null })).toBe(false);
    expect(participantEntryOpen({ status: "active", withdrawnAt: new Date() })).toBe(false);
  });

  it("canonicalises audit data and reports chain roots", () => {
    expect(stableJson({ z: 1, a: { c: 3, b: 2 } })).toBe(
      '{"a":{"b":2,"c":3},"z":1}',
    );
    expect(
      countAuditSegments([
        { previousEventHash: null },
        { previousEventHash: "first" },
      ]),
    ).toBe(1);
    expect(
      countAuditSegments([
        { previousEventHash: null },
        { previousEventHash: "first" },
        { previousEventHash: null },
      ]),
    ).toBe(2);
  });
});
