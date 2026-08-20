import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { environment } from "@/src/config/environment";

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(value: string) {
  return createHmac("sha256", environment().SESSION_HASH_KEY)
    .update(value)
    .digest("hex");
}

export function tokenMatches(value: string, expectedHash: string) {
  const actual = Buffer.from(hashToken(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function hashPassword(value: string) {
  return hash(value, {
    algorithm: 2,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  });
}

export async function verifyPassword(passwordHash: string, candidate: string) {
  try {
    return await verify(passwordHash, candidate);
  } catch {
    return false;
  }
}

export function normaliseIdentity(kind: "email" | "alias", value: string) {
  const normalised = value.trim().toLocaleLowerCase("en-GB");
  return kind === "email" ? normalised : normalised.replace(/\s+/g, "-");
}
