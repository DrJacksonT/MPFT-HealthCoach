import * as OTPAuth from "otpauth";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { closeDb, getDb } from "../db/index";
import {
  contactIdentities,
  mfaCredentials,
  participants,
  sessions,
  studies,
  userRoles,
  users,
} from "../db/schema";
import { recordAuditEvent } from "../src/audit/events";
import { hashPassword, normaliseIdentity, randomToken } from "../src/auth/crypto";
import { encryptStaffTotpSecret } from "../src/auth/mfa";
import { roles } from "../src/auth/permissions";

const inputSchema = z.object({
  ACCOUNT_IDENTITY_KIND: z.enum(["alias", "email"]).default("alias"),
  ACCOUNT_IDENTITY: z.string().trim().min(3).max(254),
  ACCOUNT_DISPLAY_NAME: z.string().trim().min(1).max(80),
  ACCOUNT_PASSWORD: z.string().min(12).max(128).optional(),
  ACCOUNT_ROLE: z.enum(roles).default("administrator"),
  ACCOUNT_STUDY_CODE: z.string().trim().min(1).default("SMOKE-PILOT-SYNTHETIC"),
  ACCOUNT_UPDATE_EXISTING: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is required. Provision deployed accounts only against an explicit PostgreSQL database.");

  const input = inputSchema.parse(process.env);
  if (
    input.ACCOUNT_IDENTITY_KIND === "email" &&
    !z.email().safeParse(input.ACCOUNT_IDENTITY).success
  )
    throw new Error("ACCOUNT_IDENTITY must be a valid email address when ACCOUNT_IDENTITY_KIND=email.");

  const db = await getDb();
  const [study] = await db
    .select({ id: studies.id, code: studies.code, syntheticOnly: studies.syntheticOnly })
    .from(studies)
    .where(eq(studies.code, input.ACCOUNT_STUDY_CODE))
    .limit(1);
  if (!study) throw new Error(`Study ${input.ACCOUNT_STUDY_CODE} does not exist. Run migrations and the approved seed first.`);

  const normalisedIdentity = normaliseIdentity(
    input.ACCOUNT_IDENTITY_KIND,
    input.ACCOUNT_IDENTITY,
  );
  const [existing] = await db
    .select({ userId: contactIdentities.userId })
    .from(contactIdentities)
    .where(
      and(
        eq(contactIdentities.kind, input.ACCOUNT_IDENTITY_KIND),
        eq(contactIdentities.normalisedValue, normalisedIdentity),
      ),
    )
    .limit(1);
  if (existing && !input.ACCOUNT_UPDATE_EXISTING)
    throw new Error("That identity already exists. Set ACCOUNT_UPDATE_EXISTING=true only when you intend to rotate its password and MFA.");

  const generatedPassword = input.ACCOUNT_PASSWORD ? null : randomToken(24);
  const password = input.ACCOUNT_PASSWORD ?? generatedPassword!;
  const passwordHash = await hashPassword(password);
  const isStaff = input.ACCOUNT_ROLE !== "participant";
  const totpSecret = isStaff ? new OTPAuth.Secret({ size: 20 }) : null;
  const encryptedTotpSecret = totpSecret
    ? encryptStaffTotpSecret(totpSecret.base32)
    : null;
  const now = new Date();
  const userId = existing?.userId ?? crypto.randomUUID();
  let participantId: string | null = null;

  await db.transaction(async (tx) => {
    if (existing) {
      await tx
        .update(users)
        .set({
          status: "active",
          displayName: input.ACCOUNT_DISPLAY_NAME,
          passwordHash,
          verifiedAt: now,
          passwordChangedAt: now,
          updatedAt: now,
        })
        .where(eq(users.id, userId));
      await tx
        .update(contactIdentities)
        .set({ verifiedAt: now })
        .where(
          and(
            eq(contactIdentities.userId, userId),
            eq(contactIdentities.kind, input.ACCOUNT_IDENTITY_KIND),
            eq(contactIdentities.normalisedValue, normalisedIdentity),
          ),
        );
      await tx
        .update(sessions)
        .set({ revokedAt: now })
        .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
    } else {
      await tx.insert(users).values({
        id: userId,
        status: "active",
        displayName: input.ACCOUNT_DISPLAY_NAME,
        passwordHash,
        verifiedAt: now,
        passwordChangedAt: now,
      });
      await tx.insert(contactIdentities).values({
        userId,
        kind: input.ACCOUNT_IDENTITY_KIND,
        normalisedValue: normalisedIdentity,
        displayValue: input.ACCOUNT_IDENTITY,
        verifiedAt: now,
      });
    }

    await tx
      .insert(userRoles)
      .values({ userId, studyId: study.id, role: input.ACCOUNT_ROLE })
      .onConflictDoUpdate({
        target: [userRoles.userId, userRoles.studyId, userRoles.role],
        set: { revokedAt: null, grantedAt: now },
      });

    if (isStaff && encryptedTotpSecret) {
      await tx
        .insert(mfaCredentials)
        .values({
          userId,
          method: "totp",
          encryptedSecret: encryptedTotpSecret,
          label: `${input.ACCOUNT_DISPLAY_NAME} authenticator`,
          enabledAt: now,
        })
        .onConflictDoUpdate({
          target: [mfaCredentials.userId, mfaCredentials.method],
          set: {
            encryptedSecret: encryptedTotpSecret,
            label: `${input.ACCOUNT_DISPLAY_NAME} authenticator`,
            enabledAt: now,
            lastUsedAt: null,
            revokedAt: null,
          },
        });
    }

    if (!isStaff) {
      const [existingParticipant] = await tx
        .select({ id: participants.id })
        .from(participants)
        .where(and(eq(participants.studyId, study.id), eq(participants.userId, userId)))
        .limit(1);
      if (existingParticipant) {
        participantId = existingParticipant.id;
      } else {
        participantId = crypto.randomUUID();
        await tx.insert(participants).values({
          id: participantId,
          userId,
          studyId: study.id,
          participantCode: `SYN-${randomToken(8).replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase()}`,
          synthetic: study.syntheticOnly,
          status: "registered",
        });
      }
    }
  });

  await recordAuditEvent({
    actorUserId: userId,
    studyId: study.id,
    participantId,
    eventType: existing ? "auth.account_reprovisioned" : "auth.account_provisioned",
    targetType: "user",
    targetId: userId,
    outcome: "success",
    metadata: {
      identityKind: input.ACCOUNT_IDENTITY_KIND,
      role: input.ACCOUNT_ROLE,
      synthetic: study.syntheticOnly,
    },
  });

  console.log("Account provisioned successfully.");
  console.log(`Sign-in type: ${input.ACCOUNT_IDENTITY_KIND}`);
  console.log(`Identity: ${input.ACCOUNT_IDENTITY}`);
  console.log(`Role: ${input.ACCOUNT_ROLE}`);
  if (generatedPassword) console.log(`Generated password: ${generatedPassword}`);
  else console.log("Password: supplied through ACCOUNT_PASSWORD and not printed.");
  if (totpSecret) {
    const totp = new OTPAuth.TOTP({
      issuer: "MPFT Behaviour Change Research",
      label: input.ACCOUNT_IDENTITY,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: totpSecret,
    });
    console.log(`Authenticator secret: ${totpSecret.base32}`);
    console.log(`Authenticator URI: ${totp.toString()}`);
  }
  console.log("Store generated credentials now. Plaintext passwords and TOTP secrets are not retained by this command.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Account provisioning failed.");
    process.exitCode = 1;
  })
  .finally(closeDb);
