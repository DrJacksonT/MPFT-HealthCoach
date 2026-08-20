import { describe, expect, it } from "vitest";
import { GET as accountGet, POST as accountPost, DELETE as accountDelete } from "@/app/api/account/route";
import { POST as legacyCoach } from "@/app/api/coach/route";
import { POST as legacyEvidenceSummary } from "@/app/api/evidence-summary/route";
import { GET as legacyTelemetry } from "@/app/api/telemetry/route";

const request = (path: string) => new Request(`http://localhost${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });

describe("retired prototype routes", () => {
  it("keeps the unauthenticated account surface closed", async () => {
    expect((await accountGet(new Request("http://localhost/api/account"))).status).toBe(410);
    expect((await accountPost(request("/api/account"))).status).toBe(410);
    expect((await accountDelete(new Request("http://localhost/api/account", { method: "DELETE" }))).status).toBe(410);
  });

  it("keeps legacy coaching and evidence generation closed", async () => {
    const coach = await legacyCoach(request("/api/coach"));
    const evidence = await legacyEvidenceSummary(request("/api/evidence-summary"));
    expect(coach.status).toBe(410);
    expect(evidence.status).toBe(410);
    expect(await coach.text()).not.toContain("citation");
  });

  it("does not expose old in-memory telemetry", async () => {
    expect((await legacyTelemetry(new Request("http://localhost/api/telemetry"))).status).toBe(410);
  });
});
