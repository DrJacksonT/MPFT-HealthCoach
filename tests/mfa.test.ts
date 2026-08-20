import * as OTPAuth from "otpauth";
import { describe, expect, it, vi } from "vitest";
import { resetEnvironmentForTests } from "@/src/config/environment";
import { verifyStaffTotp } from "@/src/auth/mfa";

describe("staff second factor", () => {
  it("accepts a current synthetic TOTP only through the development adapter", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("STAFF_MFA_PROVIDER", "development_totp");
    resetEnvironmentForTests();
    const now = Date.UTC(2026, 7, 20, 12, 0, 0);
    const secret = OTPAuth.Secret.fromBase32("JBSWY3DPEHPK3PXP");
    const totp = new OTPAuth.TOTP({ issuer: "MPFT Research Synthetic", label: "Staff simulation", algorithm: "SHA1", digits: 6, period: 30, secret });
    expect(verifyStaffTotp("development-only:JBSWY3DPEHPK3PXP", totp.generate({ timestamp: now }), now)).toBe(true);
    expect(verifyStaffTotp("development-only:JBSWY3DPEHPK3PXP", "000000", now)).toBe(false);
  });
});
