import { describe, expect, it } from "vitest";
import { intentContent } from "@/src/coaching/catalogue";
import { validateBoundedOutput } from "@/src/coaching/ai-adapter";
import { classifySafety } from "@/src/domain/safety";
import { gamblingProtectiveActions } from "@/src/gambling/simulation";
import { answerMatchesResponseType, surveyWindowMessage } from "@/src/study/survey-validation";

describe("bounded coaching", () => {
  it("provides a complete structured route for every supported intent", () => {
    for (const content of Object.values(intentContent)) {
      expect(content.introduction.length).toBeGreaterThan(20);
      expect(content.question.endsWith("?")).toBe(true);
      expect(content.actions.length).toBeGreaterThanOrEqual(3);
      expect(new Set(content.actions.map((action) => action.code)).size).toBe(content.actions.length);
    }
  });

  it("accepts only an application-owned action code", () => {
    expect(validateBoundedOutput({ reflection: "That sounds difficult.", coachingQuestion: "What feels possible?", suggestedActionCode: "delay-five" }, ["delay-five"])).toBe(true);
    expect(validateBoundedOutput({ reflection: "That sounds difficult.", coachingQuestion: "What feels possible?", suggestedActionCode: "invented" }, ["delay-five"])).toBe(false);
  });

  it("rejects treatment claims in generated reflection text", () => {
    expect(validateBoundedOutput({ reflection: "You should take a dose of medicine.", coachingQuestion: "Okay?", suggestedActionCode: "delay-five" }, ["delay-five"])).toBe(false);
  });

  it.each([
    ["my partner controls me and I am not safe at home", "safeguarding"],
    ["I lost all the rent money", "acute-financial-harm"],
    ["tell me the best odds and how to beat the bookmaker", "gambling-prohibited"],
    ["I cannot cope and I am breaking down", "severe-distress"],
  ])("routes %s before generation", (text, expected) => {
    expect(classifySafety(text)).toBe(expected);
  });
});

describe("survey validation", () => {
  const opens = new Date("2026-08-20T10:00:00Z");
  const closes = new Date("2026-08-27T10:00:00Z");
  const instance = { windowOpensAt: opens, windowClosesAt: closes, status: "available", snoozedUntil: null };

  it("fails closed outside a survey window", () => {
    expect(surveyWindowMessage(instance, new Date("2026-08-20T09:59:59Z"))).toContain("not opened");
    expect(surveyWindowMessage(instance, new Date("2026-08-27T10:00:01Z"))).toContain("closed");
    expect(surveyWindowMessage(instance, new Date("2026-08-21T10:00:00Z"))).toBeNull();
  });

  it("honours snooze without changing the survey window", () => {
    expect(surveyWindowMessage({ ...instance, status: "snoozed", snoozedUntil: new Date("2026-08-22T10:00:00Z") }, new Date("2026-08-21T10:00:00Z"))).toContain("snoozed");
  });

  it("validates values against immutable question types", () => {
    expect(answerMatchesResponseType("scale-0-10", 7)).toBe(true);
    expect(answerMatchesResponseType("scale-0-10", "7")).toBe(false);
    expect(answerMatchesResponseType("yes-no", true)).toBe(true);
    expect(answerMatchesResponseType("yes-no", "yes")).toBe(false);
    expect(answerMatchesResponseType("yes-no-unsure", "unsure")).toBe(true);
    expect(answerMatchesResponseType("likert-1-5", 5)).toBe(true);
    expect(answerMatchesResponseType("likert-1-5", 6)).toBe(false);
    expect(answerMatchesResponseType("numeric", 12.5)).toBe(true);
    expect(answerMatchesResponseType("single-choice", "human_support", ["human_support", "structured_tools"])).toBe(true);
    expect(answerMatchesResponseType("single-choice", "invented", ["human_support"])).toBe(false);
    expect(answerMatchesResponseType("multiple-choice", ["plan", "progress"], ["plan", "progress"])).toBe(true);
    expect(answerMatchesResponseType("multiple-choice", ["plan", "plan"], ["plan"])).toBe(false);
  });
});

describe("gambling staff simulation", () => {
  it("contains only protective, non-gambling actions", () => {
    const text = gamblingProtectiveActions.map((action) => `${action.title} ${action.detail}`).join(" ");
    expect(gamblingProtectiveActions.length).toBeGreaterThanOrEqual(4);
    expect(text).not.toMatch(/best odds|winning strategy|recover losses|borrow|debt product|bypass/i);
    expect(text).toMatch(/block|self-exclusion|specialist support/i);
  });

  it("routes a routine urge to the structured path", () => {
    expect(classifySafety("I am about to gamble and want to pause")).toBe("supported");
  });
});
