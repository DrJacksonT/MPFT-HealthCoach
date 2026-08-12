import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/evidence-summary/route";
import { evidenceRecords } from "@/src/data/evidence";
import { AI_PROFILE_FIELDS } from "@/src/ai/profile-context";

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
      quantified_facts: {
        evidence_id: string;
        metric: "absoluteEffect" | "relativeEffect" | "effectValue";
        kind: "risk" | "benefit";
      }[];
      important_uncertainties: string[];
      profile_factors_used: string[];
      personalised_strategy: {
        steps: { matched_factors: string[]; evidence_ids: string[] }[];
      };
    };
    expect(response.status).toBe(200);
    expect(body.kind).toBe("evidence-brief");
    expect(body.generatedBy).toBe("reviewed-template");
    expect(body.key_points[0].evidence_ids).toEqual(["nice-ng209-options"]);
    expect(body.quantified_facts).toHaveLength(0);
    expect(new Set(body.profile_factors_used)).toEqual(
      new Set(AI_PROFILE_FIELDS),
    );
    expect(body.personalised_strategy.steps.length).toBeGreaterThanOrEqual(2);
    expect(body.important_uncertainties.join(" ")).toMatch(/cannot|not provide/i);
  });

  it("returns quantified COPD facts whose displayed metric exists in the cited record", async () => {
    const copdContext = { ...context, conditions: ["copd" as const] };
    const ids = [
      "lung-health-study-copd-lung-function",
      "lung-health-study-copd-mortality",
    ];
    const response = await POST(request({ evidenceIds: ids, context: copdContext }));
    const body = (await response.json()) as {
      generatedBy: string;
      quantified_facts: {
        evidence_id: string;
        metric: "absoluteEffect" | "relativeEffect" | "effectValue";
        kind: "risk" | "benefit";
      }[];
    };
    expect(response.status).toBe(200);
    expect(body.generatedBy).toBe("reviewed-template");
    expect(body.quantified_facts).toHaveLength(2);
    expect(body.quantified_facts.map((fact) => fact.kind)).toEqual([
      "risk",
      "benefit",
    ]);
    for (const fact of body.quantified_facts) {
      expect(ids).toContain(fact.evidence_id);
      expect(
        evidenceRecords.find((item) => item.id === fact.evidence_id)?.[
          fact.metric
        ],
      ).toBeTruthy();
    }
  });

  it("fails closed when no eligible evidence is selected", async () => {
    const response = await POST(
      request({ evidenceIds: ["invented-study"], context }),
    );
    expect(response.status).toBe(400);
  });
});
