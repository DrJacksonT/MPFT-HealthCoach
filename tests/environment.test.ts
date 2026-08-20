import { afterEach, describe, expect, it, vi } from "vitest";
import { environment, resetEnvironmentForTests } from "../src/config/environment";

const productionEnvironment = {
  NODE_ENV: "production",
  DATABASE_URL: "postgres://example.invalid/mpft",
  APP_ORIGIN: "https://example.invalid",
  RELEASE_ENVIRONMENT: "production",
  SESSION_HASH_KEY: "a-unique-production-session-key-with-32-characters",
  STAFF_MFA_PROVIDER: "totp",
} as const;

afterEach(() => {
  vi.unstubAllEnvs();
  resetEnvironmentForTests();
});

describe("production email configuration", () => {
  it("permits fail-closed disabled delivery", () => {
    for (const [key, value] of Object.entries({ ...productionEnvironment, MAIL_TRANSPORT: "disabled" }))
      vi.stubEnv(key, value);
    expect(environment().MAIL_TRANSPORT).toBe("disabled");
  });

  it("rejects the local file sink", () => {
    for (const [key, value] of Object.entries({ ...productionEnvironment, MAIL_TRANSPORT: "file" }))
      vi.stubEnv(key, value);
    expect(() => environment()).toThrow("Production cannot use the local file mail sink");
  });
});
