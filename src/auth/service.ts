import { and, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  contactIdentities,
  invitationUses,
  invitations,
  mfaCredentials,
  oneTimeTokens,
  participants,
  sessions,
  studies,
  userRoles,
  users,
} from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import {
  hashPassword,
  hashToken,
  normaliseIdentity,
  randomToken,
  verifyPassword,
} from "@/src/auth/crypto";
import { isStaff } from "@/src/auth/permissions";
import {
  createSession,
  rotateSession,
  type AuthenticatedSession,
} from "@/src/auth/session";
import { verifyStaffTotp } from "@/src/auth/mfa";
import { environment } from "@/src/config/environment";
import { releaseGate } from "@/src/governance/release-gates";
import { sendMail } from "@/src/mail/transport";
import { recordProductEvent } from "@/src/research/product-events";

export class AuthError extends Error {
  constructor(
    public readonly code:
      | "invalid_invitation"
      | "registration_closed"
      | "identity_unavailable"
      | "invalid_credentials"
      | "verification_required"
      | "invalid_token"
      | "mfa_required"
      | "invalid_mfa",
  ) {
    super(code);
  }
}

const dummyPasswordHash = hashPassword("not-a-real-account-password-constant");

async function issueToken(userId: string, purpose: "verify_contact" | "reset_password") {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + (purpose === "verify_contact" ? 24 : 1) * 60 * 60 * 1000);
  const db = await getDb();
  await db.insert(oneTimeTokens).values({ userId, purpose, tokenHash: hashToken(token), expiresAt });
  return { token, expiresAt };
}

export async function registerWithInvitation(input: {
  invitationCode: string;
  identityKind: "email" | "alias";
  identity: string;
  displayName: string;
  password: string;
}) {
  const db = await getDb();
  const now = new Date();
  const normalised = normaliseIdentity(input.identityKind, input.identity);
  const [invitation] = await db
    .select({
      id: invitations.id,
      studyId: invitations.studyId,
      intendedRole: invitations.intendedRole,
      expiresAt: invitations.expiresAt,
      maxUses: invitations.maxUses,
      usedCount: invitations.usedCount,
      syntheticOnly: studies.syntheticOnly,
      studyCode: studies.code,
    })
    .from(invitations)
    .innerJoin(studies, eq(studies.id, invitations.studyId))
    .where(
      and(
        eq(invitations.codeHash, hashToken(input.invitationCode)),
        isNull(invitations.revokedAt),
        gt(invitations.expiresAt, now),
      ),
    )
    .limit(1);
  if (!invitation || invitation.usedCount >= invitation.maxUses)
    throw new AuthError("invalid_invitation");
  if (!invitation.syntheticOnly) {
    const gate = await releaseGate("participant_recruitment", invitation.studyCode);
    if (!gate.allowed) throw new AuthError("registration_closed");
  }
  const [existing] = await db
    .select({ id: contactIdentities.id })
    .from(contactIdentities)
    .where(
      and(
        eq(contactIdentities.kind, input.identityKind),
        eq(contactIdentities.normalisedValue, normalised),
      ),
    )
    .limit(1);
  if (existing) throw new AuthError("identity_unavailable");

  const passwordHash = await hashPassword(input.password);
  const userId = crypto.randomUUID();
  const participantId = crypto.randomUUID();
  const participantCode = `SYN-${randomToken(6).toUpperCase()}`;
  const verifiedAt = input.identityKind === "alias" ? now : null;
  await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(invitations)
      .set({ usedCount: sql`${invitations.usedCount} + 1` })
      .where(and(eq(invitations.id, invitation.id), lt(invitations.usedCount, invitations.maxUses)))
      .returning({ id: invitations.id });
    if (!claimed) throw new AuthError("invalid_invitation");
    await tx.insert(users).values({
      id: userId,
      status: verifiedAt ? "active" : "invited",
      displayName: input.displayName.trim(),
      passwordHash,
      verifiedAt,
    });
    await tx.insert(contactIdentities).values({
      userId,
      kind: input.identityKind,
      normalisedValue: normalised,
      displayValue: input.identity.trim(),
      verifiedAt,
    });
    await tx.insert(userRoles).values({
      userId,
      studyId: invitation.studyId,
      role: invitation.intendedRole,
    });
    await tx.insert(invitationUses).values({ invitationId: invitation.id, userId });
    if (invitation.intendedRole === "participant") {
      await tx.insert(participants).values({
        id: participantId,
        userId,
        studyId: invitation.studyId,
        participantCode,
        synthetic: invitation.syntheticOnly,
      });
    }
  });

  let verificationToken: string | undefined;
  if (input.identityKind === "email") {
    const issued = await issueToken(userId, "verify_contact");
    verificationToken = issued.token;
    const link = `${environment().APP_ORIGIN}/verify?token=${encodeURIComponent(issued.token)}`;
    await sendMail({
      to: normalised,
      subject: "Verify your MPFT research test account",
      text: `This is a research test account message. Verify it using: ${link}\n\nThe link expires at ${issued.expiresAt.toISOString()}.`,
    });
  }
  await recordAuditEvent({
    actorUserId: userId,
    studyId: invitation.studyId,
    participantId: invitation.intendedRole === "participant" ? participantId : null,
    eventType: "auth.registration",
    targetType: "user",
    targetId: userId,
    outcome: "success",
    metadata: { identityKind: input.identityKind, synthetic: invitation.syntheticOnly },
  });
  if (invitation.intendedRole === "participant")
    await recordProductEvent({
      studyId: invitation.studyId,
      participantId,
      eventName: "registration.completed",
      sourceType: "registration",
      sourceId: userId,
      idempotencyKey: `registration:${userId}`,
      metadata: { accountRoute: input.identityKind, synthetic: invitation.syntheticOnly },
    });
  return { userId, participantCode, verificationRequired: input.identityKind === "email", verificationToken };
}

export async function verifyContact(token: string) {
  const db = await getDb();
  const now = new Date();
  const [record] = await db
    .select({ id: oneTimeTokens.id, userId: oneTimeTokens.userId })
    .from(oneTimeTokens)
    .where(
      and(
        eq(oneTimeTokens.tokenHash, hashToken(token)),
        eq(oneTimeTokens.purpose, "verify_contact"),
        isNull(oneTimeTokens.usedAt),
        gt(oneTimeTokens.expiresAt, now),
      ),
    )
    .limit(1);
  if (!record) throw new AuthError("invalid_token");
  await db.transaction(async (tx) => {
    await tx.update(oneTimeTokens).set({ usedAt: now }).where(eq(oneTimeTokens.id, record.id));
    await tx.update(users).set({ status: "active", verifiedAt: now, updatedAt: now }).where(eq(users.id, record.userId));
    await tx.update(contactIdentities).set({ verifiedAt: now }).where(eq(contactIdentities.userId, record.userId));
  });
  await recordAuditEvent({ actorUserId: record.userId, eventType: "auth.contact_verified", targetType: "user", targetId: record.userId, outcome: "success" });
}

export async function login(input: {
  identityKind: "email" | "alias";
  identity: string;
  password: string;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const db = await getDb();
  const normalised = normaliseIdentity(input.identityKind, input.identity);
  const [account] = await db
    .select({
      userId: users.id,
      passwordHash: users.passwordHash,
      status: users.status,
      verifiedAt: users.verifiedAt,
    })
    .from(contactIdentities)
    .innerJoin(users, eq(users.id, contactIdentities.userId))
    .where(
      and(
        eq(contactIdentities.kind, input.identityKind),
        eq(contactIdentities.normalisedValue, normalised),
      ),
    )
    .limit(1);
  const passwordHash = account?.passwordHash ?? (await dummyPasswordHash);
  const valid = await verifyPassword(passwordHash, input.password);
  if (!account || !valid || account.status !== "active") {
    await recordAuditEvent({ eventType: "auth.login", targetType: "identity", outcome: "denied", reason: "invalid_credentials", metadata: { identityKind: input.identityKind } });
    throw new AuthError(account && !account.verifiedAt ? "verification_required" : "invalid_credentials");
  }
  const roleRows = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(and(eq(userRoles.userId, account.userId), isNull(userRoles.revokedAt)));
  const userRoleNames = roleRows.map((row) => row.role);
  const mfaRequired = isStaff(userRoleNames);
  const session = await createSession({ userId: account.userId, assuranceLevel: mfaRequired ? 1 : 1, ip: input.ip, userAgent: input.userAgent });
  await db.update(users).set({ lastSignedInAt: new Date(), updatedAt: new Date() }).where(eq(users.id, account.userId));
  await recordAuditEvent({ actorUserId: account.userId, eventType: "auth.login", targetType: "session", targetId: session.id, outcome: "success", metadata: { mfaRequired } });
  if (!mfaRequired) {
    const [participant] = await db
      .select({ id: participants.id, studyId: participants.studyId })
      .from(participants)
      .where(eq(participants.userId, account.userId))
      .limit(1);
    if (participant)
      await recordProductEvent({
        studyId: participant.studyId,
        participantId: participant.id,
        sessionId: session.id,
        eventName: "session.authenticated",
        sourceType: "session",
        sourceId: session.id,
        idempotencyKey: `session:${session.id}`,
        metadata: { assuranceLevel: 1 },
      });
  }
  return { ...session, mfaRequired };
}

export async function completeMfa(
  session: AuthenticatedSession,
  token: string,
  context: { ip?: string | null; userAgent?: string | null } = {},
) {
  if (!isStaff(session.roles)) throw new AuthError("mfa_required");
  const db = await getDb();
  const [credential] = await db
    .select({ id: mfaCredentials.id, secret: mfaCredentials.encryptedSecret })
    .from(mfaCredentials)
    .where(and(eq(mfaCredentials.userId, session.userId), isNull(mfaCredentials.revokedAt)))
    .limit(1);
  if (!credential || !verifyStaffTotp(credential.secret, token)) {
    await recordAuditEvent({ actorUserId: session.userId, eventType: "auth.mfa", targetType: "session", targetId: session.id, outcome: "denied", reason: "invalid_mfa" });
    throw new AuthError("invalid_mfa");
  }
  const rotated = await rotateSession({
    sessionId: session.id,
    userId: session.userId,
    assuranceLevel: 2,
    ip: context.ip,
    userAgent: context.userAgent,
  });
  await db.update(mfaCredentials).set({ lastUsedAt: new Date() }).where(eq(mfaCredentials.id, credential.id));
  await recordAuditEvent({ actorUserId: session.userId, eventType: "auth.mfa", targetType: "session", targetId: rotated.id, outcome: "success", metadata: { sessionRotated: true } });
  return rotated;
}

export async function requestPasswordReset(identityKind: "email" | "alias", identity: string) {
  const db = await getDb();
  const normalised = normaliseIdentity(identityKind, identity);
  const [account] = await db
    .select({ userId: contactIdentities.userId, destination: contactIdentities.displayValue })
    .from(contactIdentities)
    .where(and(eq(contactIdentities.kind, identityKind), eq(contactIdentities.normalisedValue, normalised)))
    .limit(1);
  if (!account) return;
  const issued = await issueToken(account.userId, "reset_password");
  if (identityKind === "email") {
    const link = `${environment().APP_ORIGIN}/reset-password?token=${encodeURIComponent(issued.token)}`;
    await sendMail({ to: normalised, subject: "Reset your MPFT research test password", text: `Reset this research test account using: ${link}\n\nThe link expires at ${issued.expiresAt.toISOString()}.` });
  }
}

export async function resetPassword(token: string, password: string) {
  const db = await getDb();
  const now = new Date();
  const [record] = await db
    .select({ id: oneTimeTokens.id, userId: oneTimeTokens.userId })
    .from(oneTimeTokens)
    .where(and(eq(oneTimeTokens.tokenHash, hashToken(token)), eq(oneTimeTokens.purpose, "reset_password"), isNull(oneTimeTokens.usedAt), gt(oneTimeTokens.expiresAt, now)))
    .limit(1);
  if (!record) throw new AuthError("invalid_token");
  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    await tx.update(oneTimeTokens).set({ usedAt: now }).where(eq(oneTimeTokens.id, record.id));
    await tx.update(users).set({ passwordHash, passwordChangedAt: now, updatedAt: now }).where(eq(users.id, record.userId));
    await tx.update(sessions).set({ revokedAt: now }).where(and(eq(sessions.userId, record.userId), isNull(sessions.revokedAt)));
  });
  await recordAuditEvent({ actorUserId: record.userId, eventType: "auth.password_reset", targetType: "user", targetId: record.userId, outcome: "success" });
}
