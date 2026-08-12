import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/account/route";

describe("pseudonymous account boundary", () => {
  it("requires platform authentication for account reads", async () => {
    const response = await GET(new Request("http://localhost/api/account"));
    expect(response.status).toBe(401);
  });

  it("requires platform authentication even after storage consent", async () => {
    const response = await POST(
      new Request("http://localhost/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ acceptsHealthDataStorage: true }),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("rejects account creation without explicit health-data consent", async () => {
    const response = await POST(
      new Request("http://localhost/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ acceptsHealthDataStorage: false }),
      }),
    );
    expect(response.status).toBe(400);
  });
});
