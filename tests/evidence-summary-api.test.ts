import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/evidence-summary/route";

const context = {
  ageBand: "45-59" as const,
  cigarettesPerDay: 20,
  yearsSmoked: 25,
  firstCigarette: "6-30" as const,
  previousAttempts: "2-3" as const,
  longestQuit: "weeks" as const,
  methodsTried: [],
  vaping: "no" as const,
  packPrice: 15,
  motivations: ["family", "health"],
  importance: 9,
  confidence: 5,
  conditions: ["hypertension" as const],
  intention: "quit" as const,
};

function request(body: unknown) {
  return new Request("http://localhost/api/evidence-summary", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("personalised evidence summary API", () => {
  beforeEach(() => vi.stubEnv("OPENAI_API_KEY", ""));

  it("returns a plain-language, source-linked fallback without an API key", async () => {
    const response = await POST(
      request({ evidenceIds: ["nice-ng209-options"], context }),
    );
    const body = (await response.json()) as {
      kind: string;
      generatedBy: string;
      key_points: { evidence_ids: string[] }[];
      important_uncertainties: string[];
    };
    expect(response.status).toBe(200);
    expect(body.kind).toBe("evidence-brief");
    expect(body.generatedBy).toBe("reviewed-template");
    expect(body.key_points[0].evidence_ids).toEqual(["nice-ng209-options"]);
    expect(body.important_uncertainties.join(" ")).toMatch(/cannot|not provide/i);
  });

  it("fails closed when no eligible evidence is selected", async () => {
    const response = await POST(
      request({ evidenceIds: ["invented-study"], context }),
    );
    expect(response.status).toBe(400);
  });
});
