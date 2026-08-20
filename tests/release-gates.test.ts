import { describe, expect, it } from "vitest";
import { evaluateGate } from "@/src/governance/release-gates";

const approvedRelease = {
  status: "authorised",
  authorisedByUserId: "40000000-0000-4000-8000-000000000004",
  authorisedAt: new Date("2026-08-20T09:00:00Z"),
  revokedAt: null,
  manifest: {
    governanceApproval: true,
    clinicalSafetyApproval: true,
    deploymentApproval: true,
  },
};

describe("dual release gate", () => {
  it("fails closed when the environment flag is disabled", () => {
    expect(evaluateGate(false, approvedRelease)).toEqual({
      allowed: false,
      reasons: ["environment_flag_disabled"],
    });
  });

  it("fails closed when the database release is missing", () => {
    expect(evaluateGate(true, null)).toEqual({
      allowed: false,
      reasons: ["authorised_database_release_missing"],
    });
  });

  it("requires named approvals and every governed manifest approval", () => {
    const decision = evaluateGate(true, {
      status: "draft",
      authorisedByUserId: null,
      authorisedAt: null,
      revokedAt: null,
      manifest: {},
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reasons).toEqual([
      "database_release_not_authorised",
      "named_dated_authorisation_missing",
      "governance_approval_missing",
      "clinical_safety_approval_missing",
      "deployment_approval_missing",
    ]);
  });

  it("opens only when both gates and all approval records agree", () => {
    expect(evaluateGate(true, approvedRelease)).toEqual({ allowed: true, reasons: [] });
  });
});
