import * as OTPAuth from "otpauth";
import { eq, sql } from "drizzle-orm";
import { closeDb, getDb } from "../db/index";
import { sessions } from "../db/schema";
import { completeMfa, login, registerWithInvitation } from "../src/auth/service";

const staffUserId = "40000000-0000-4000-8000-000000000001";

async function main() {
  const participantLogin = await login({
    identityKind: "alias",
    identity: "rowan-fictional-01",
    password: "Fictional-only-2026!",
    ip: "127.0.0.1",
    userAgent: "auth-smoke-test",
  });
  if (participantLogin.mfaRequired) throw new Error("Participant login unexpectedly requires staff MFA.");

  const staffLogin = await login({
    identityKind: "email",
    identity: "fictional.researcher@example.invalid",
    password: "Fictional-only-2026!",
    ip: "127.0.0.1",
    userAgent: "auth-smoke-test",
  });
  if (!staffLogin.mfaRequired) throw new Error("Staff login did not require second factor.");
  const secret = OTPAuth.Secret.fromBase32("JBSWY3DPEHPK3PXP");
  const token = new OTPAuth.TOTP({
    issuer: "MPFT Research Synthetic",
    label: "Staff simulation",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  }).generate();
  await completeMfa(
    {
      id: staffLogin.id,
      userId: staffUserId,
      displayName: "Fictional Researcher",
      assuranceLevel: 1,
      expiresAt: staffLogin.expiresAt,
      roles: ["researcher"],
    },
    token,
  );

  const alias = `auth-smoke-${Date.now()}`;
  const registration = await registerWithInvitation({
    invitationCode: "SMOKE-FICTIONAL-2026",
    identityKind: "alias",
    identity: alias,
    displayName: "Fictional Registration Test",
    password: "Fictional-registration-2026!",
  });
  if (registration.verificationRequired) throw new Error("Alias registration should be invite-verified.");
  await login({
    identityKind: "alias",
    identity: alias,
    password: "Fictional-registration-2026!",
    ip: "127.0.0.1",
    userAgent: "auth-smoke-test",
  });

  const db = await getDb();
  const [assurance] = await db
    .select({ level: sessions.assuranceLevel })
    .from(sessions)
    .where(eq(sessions.id, staffLogin.id));
  const audit = (await db.execute(sql`select count(*)::int as count from operations.audit_events`)) as {
    rows: Array<{ count: number }>;
  };
  if (assurance?.level !== 2) throw new Error("Staff session assurance was not raised to level 2.");
  if ((audit.rows[0]?.count ?? 0) < 5) throw new Error("Authentication audit events are missing.");
  console.log("Authentication smoke test passed with participant login, staff TOTP, invite registration and chained audit events.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Authentication smoke test failed.");
    process.exitCode = 1;
  })
  .finally(closeDb);
