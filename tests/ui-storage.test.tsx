// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    fireEvent.click(await screen.findByRole("button", { name: /Family focus/i }));
    await waitFor(() => expect(localStorage.getItem(key)).not.toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Delete my demo data" }));
    await waitFor(() => expect(localStorage.getItem(key)).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: /Start my smoking review/i }));
    fireEvent.click(screen.getByRole("button", { name: /See evidence that may be relevant/i }));
    await waitFor(() => expect(localStorage.getItem(key)).not.toBeNull());
  });
});
