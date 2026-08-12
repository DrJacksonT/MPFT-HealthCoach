// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CoachApp } from "@/src/ui/CoachApp";

const key = "evidence-coach-demo-v1";
let stored: Map<string, string>;

beforeEach(() => {
  stored = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (name: string) => stored.get(name) ?? null,
    setItem: (name: string, value: string) => stored.set(name, value),
    removeItem: (name: string) => stored.delete(name),
    clear: () => stored.clear(),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("local demo data lifecycle", () => {
  it("deletes the stored key and can persist a later manual review", async () => {
    render(<CoachApp evidence={[]} />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Family focus/i }),
    );
    expect(screen.getByText("SELECTED FICTIONAL DEMO")).not.toBeNull();
    expect(screen.queryByText("Fictional demo evidence")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: /Open the Family focus demo/i }),
    );
    expect(
      screen.getByLabelText("Active fictional demo").textContent,
    ).toContain("Family focus");
    await waitFor(() => expect(localStorage.getItem(key)).not.toBeNull());
    expect(JSON.parse(localStorage.getItem(key) ?? "{}").personaName).toBe(
      "Family focus",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Delete my demo data" }),
    );
    await waitFor(() => expect(localStorage.getItem(key)).toBeNull());

    fireEvent.click(
      screen.getByRole("button", { name: /Start my smoking review/i }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /See evidence that may be relevant/i,
      }),
    );
    await waitFor(() => expect(localStorage.getItem(key)).not.toBeNull());
  });

  it("turns a goal choice into a specific, editable plan", async () => {
    render(<CoachApp evidence={[]} />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Family focus/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Open the Family focus demo/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /My plan/i }));

    fireEvent.click(
      screen.getByRole("button", { name: /Plan for one trigger/i }),
    );
    expect(
      screen.getByRole("button", { name: /Back to goal choices/i }),
    ).not.toBeNull();

    fireEvent.change(
      screen.getByLabelText(/A situation that triggers me to smoke/i),
      { target: { value: "After dinner" } },
    );
    fireEvent.change(screen.getByLabelText(/What I will try instead/i), {
      target: { value: "Walk around the block" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Save and activate this step/i }),
    );

    expect(screen.getByText("After dinner")).not.toBeNull();
    expect(screen.getByText("Walk around the block")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: /Choose a different step/i }),
    ).not.toBeNull();
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem(key) ?? "{}").goal.plan.trigger,
      ).toBe("After dinner"),
    );
  });
});
