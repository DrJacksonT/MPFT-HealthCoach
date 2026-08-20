import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "@/next.config";
import { resetEnvironmentForTests } from "@/src/config/environment";

describe("production security configuration", () => {
  afterEach(() => { vi.unstubAllEnvs(); resetEnvironmentForTests(); });

  it("adds transport and browser isolation headers in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const rules = await nextConfig.headers?.();
    const headers = new Map(rules?.flatMap((rule) => rule.headers).map((header) => [header.key.toLowerCase(), header.value]));
    expect(headers.get("strict-transport-security")).toContain("max-age=31536000");
    expect(headers.get("x-content-type-options")).toBe("nosniff");
    expect(headers.get("x-frame-options")).toBe("DENY");
    expect(headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("permissions-policy")).toContain("microphone=()");
    expect(headers.get("cross-origin-opener-policy")).toBe("same-origin");
  });
});
