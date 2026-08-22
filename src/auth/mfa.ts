import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import * as OTPAuth from "otpauth";
import { environment } from "@/src/config/environment";

const ENCRYPTION_VERSION = "v1";
const ENCRYPTION_CONTEXT = Buffer.from("mpft-staff-totp:v1", "utf8");

function productionKey() {
  const encoded = process.env.MFA_ENCRYPTION_KEY;
  if (!encoded) throw new Error("MFA encryption key is not configured.");
  const key = Buffer.from(encoded, "base64url");
  if (key.length !== 32) throw new Error("MFA encryption key must contain 32 bytes.");
  return key;
}

export function encryptStaffTotpSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", productionKey(), iv);
  cipher.setAAD(ENCRYPTION_CONTEXT);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [
    ENCRYPTION_VERSION,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
}

function decryptStaffTotpSecret(value: string) {
  const [version, encodedIv, encodedTag, encodedCiphertext, extra] = value.split(":");
  if (
    version !== ENCRYPTION_VERSION ||
    !encodedIv ||
    !encodedTag ||
    !encodedCiphertext ||
    extra
  )
    throw new Error("Unsupported encrypted MFA secret.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    productionKey(),
    Buffer.from(encodedIv, "base64url"),
  );
  decipher.setAAD(ENCRYPTION_CONTEXT);
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function validTotp(secretValue: string, token: string, now?: number) {
  const secret = OTPAuth.Secret.fromBase32(secretValue);
  const totp = new OTPAuth.TOTP({
    issuer: "MPFT Behaviour Change Research",
    label: "Staff account",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  return totp.validate({ token, timestamp: now, window: 1 }) !== null;
}

export function verifyStaffTotp(encryptedSecret: string, token: string, now?: number) {
  const env = environment();
  if (env.STAFF_MFA_PROVIDER === "development_totp") {
    if (env.NODE_ENV === "production" || !encryptedSecret.startsWith("development-only:"))
      return false;
    return validTotp(encryptedSecret.slice("development-only:".length), token, now);
  }

  try {
    return validTotp(decryptStaffTotpSecret(encryptedSecret), token, now);
  } catch {
    return false;
  }
}
