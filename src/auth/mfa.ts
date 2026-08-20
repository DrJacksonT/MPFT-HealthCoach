import * as OTPAuth from "otpauth";
import { environment } from "@/src/config/environment";

export function verifyStaffTotp(encryptedSecret: string, token: string, now?: number) {
  const env = environment();
  if (env.STAFF_MFA_PROVIDER === "development_totp") {
    if (env.NODE_ENV === "production" || !encryptedSecret.startsWith("development-only:"))
      return false;
    const secret = OTPAuth.Secret.fromBase32(encryptedSecret.slice("development-only:".length));
    const totp = new OTPAuth.TOTP({
      issuer: "MPFT Research Synthetic",
      label: "Staff simulation",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });
    return totp.validate({ token, timestamp: now, window: 1 }) !== null;
  }

  // The production adapter intentionally stays closed until an approved encrypted
  // secret provider and key-management route are configured.
  return false;
}
