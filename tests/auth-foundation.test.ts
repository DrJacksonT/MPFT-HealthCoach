import { describe, expect, it } from "vitest";
import { hasPermission, isStaff } from "@/src/auth/permissions";
import { hashPassword, normaliseIdentity, verifyPassword } from "@/src/auth/crypto";

describe("authentication foundation", () => {
  it("hashes passwords with Argon2id and rejects a wrong password", async () => {
    const passwordHash = await hashPassword("A sufficiently long fictional password");
    expect(passwordHash).toContain("$argon2id$");
    await expect(verifyPassword(passwordHash, "A sufficiently long fictional password")).resolves.toBe(true);
    await expect(verifyPassword(passwordHash, "wrong password")).resolves.toBe(false);
  });

  it("normalises email and alias identities consistently", () => {
    expect(normaliseIdentity("email", " Test.Person@Example.Invalid ")).toBe("test.person@example.invalid");
    expect(normaliseIdentity("alias", " Rowan Fictional 02 ")).toBe("rowan-fictional-02");
  });

  it("keeps de-identified research and privileged identity access separate", () => {
    expect(hasPermission(["researcher"], "research:deidentified")).toBe(true);
    expect(hasPermission(["researcher"], "identity:privileged")).toBe(false);
    expect(hasPermission(["administrator"], "identity:privileged")).toBe(true);
  });

  it("requires staff assurance for every non-participant role", () => {
    expect(isStaff(["participant"])).toBe(false);
    expect(isStaff(["evidence_reviewer"])).toBe(true);
  });
});
