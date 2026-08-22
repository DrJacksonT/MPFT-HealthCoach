import * as OTPAuth from "otpauth";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetEnvironmentForTests } from "@/src/config/environment";
import { encryptStaffTotpSecret, verifyStaffTotp } from "@/src/auth/mfa";

afterEach(() => {
  vi.unstubAllEnvs();
  resetEnvironmentForTests();
});

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

  it("encrypts and verifies production TOTP secrets", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgres://example.invalid/mpft");
    vi.stubEnv("APP_ORIGIN", "https://example.invalid");
    vi.stubEnv("RELEASE_ENVIRONMENT", "production");
    vi.stubEnv("SESSION_HASH_KEY", "a-unique-production-session-key-with-32-characters");
    vi.stubEnv("MAIL_TRANSPORT", "disabled");
    vi.stubEnv("STAFF_MFA_PROVIDER", "totp");
    vi.stubEnv("MFA_ENCRYPTION_KEY", "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY");
    resetEnvironmentForTests();

    const now = Date.UTC(2026, 7, 20, 12, 0, 0);
    const secret = OTPAuth.Secret.fromBase32("JBSWY3DPEHPK3PXP");
    const totp = new OTPAuth.TOTP({
      issuer: "MPFT Behaviour Change Research",
      label: "Staff account",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });
    const encrypted = encryptStaffTotpSecret(secret.base32);

    expect(encrypted).toMatch(/^v1:/);
    expect(encrypted).not.toContain(secret.base32);
    expect(verifyStaffTotp(encrypted, totp.generate({ timestamp: now }), now)).toBe(true);
    expect(verifyStaffTotp(`${encrypted}tampered`, totp.generate({ timestamp: now }), now)).toBe(false);
  });
});
