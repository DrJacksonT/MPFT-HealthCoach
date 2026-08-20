import { and, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { sessions, userRoles, users } from "@/db/schema";
import { hashToken, randomToken, tokenMatches } from "@/src/auth/crypto";
import { environment } from "@/src/config/environment";
import { isStaff, type Permission, hasPermission } from "@/src/auth/permissions";

const SESSION_COOKIE = "mpft_session";
const CSRF_COOKIE = "mpft_csrf";

export type AuthenticatedSession = {
  id: string;
  userId: string;
  displayName: string;
  assuranceLevel: number;
  expiresAt: Date;
  roles: string[];
};

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export async function createSession(input: {
  userId: string;
  assuranceLevel?: 1 | 2;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const env = environment();
  const sessionToken = randomToken();
  const csrfToken = randomToken();
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);
  const db = await getDb();
  const [session] = await db
    .insert(sessions)
    .values({
      userId: input.userId,
      tokenHash: hashToken(sessionToken),
      csrfSecretHash: hashToken(csrfToken),
      assuranceLevel: input.assuranceLevel ?? 1,
      ipHash: input.ip ? hashToken(input.ip) : null,
      userAgentHash: input.userAgent ? hashToken(input.userAgent) : null,
      expiresAt,
    })
    .returning({ id: sessions.id });
  return { id: session.id, sessionToken, csrfToken, expiresAt };
}

export function attachSessionCookies(
  response: NextResponse,
  session: { sessionToken: string; csrfToken: string; expiresAt: Date },
) {
  const secure = environment().NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE, session.sessionToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
  response.cookies.set(CSRF_COOKIE, session.csrfToken, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
  return response;
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set(CSRF_COOKIE, "", { httpOnly: false, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}

export async function readSession(request: Request): Promise<AuthenticatedSession | null> {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return null;
  const db = await getDb();
  const [record] = await db
    .select({
      id: sessions.id,
      userId: users.id,
      displayName: users.displayName,
      status: users.status,
      assuranceLevel: sessions.assuranceLevel,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!record || record.status !== "active") return null;
  const roleRows = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(and(eq(userRoles.userId, record.userId), isNull(userRoles.revokedAt)));
  await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, record.id));
  return { ...record, roles: roleRows.map((row) => row.role) };
}

export async function requirePermission(request: Request, permission: Permission) {
  const session = await readSession(request);
  if (!session || !hasPermission(session.roles, permission)) return null;
  if (isStaff(session.roles) && session.assuranceLevel < 2) return null;
  return session;
}

export async function verifyCsrf(request: Request, sessionId?: string) {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieToken = cookieValue(request, CSRF_COOKIE);
  const origin = request.headers.get("origin");
  const expectedOrigin = environment().APP_ORIGIN;
  if (!headerToken || !cookieToken || headerToken !== cookieToken) return false;
  if (origin && origin !== expectedOrigin) return false;
  const db = await getDb();
  const [record] = sessionId
    ? await db.select({ csrfSecretHash: sessions.csrfSecretHash }).from(sessions).where(eq(sessions.id, sessionId)).limit(1)
    : [];
  return Boolean(record && tokenMatches(headerToken, record.csrfSecretHash));
}

export async function revokeRequestSession(request: Request) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return;
  const db = await getDb();
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.tokenHash, hashToken(token)));
}

export async function rotateSession(input: {
  sessionId: string;
  userId: string;
  assuranceLevel: 1 | 2;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const env = environment();
  const sessionToken = randomToken();
  const csrfToken = randomToken();
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);
  const db = await getDb();
  const newSessionId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(sessions).values({
      id: newSessionId,
      userId: input.userId,
      tokenHash: hashToken(sessionToken),
      csrfSecretHash: hashToken(csrfToken),
      assuranceLevel: input.assuranceLevel,
      ipHash: input.ip ? hashToken(input.ip) : null,
      userAgentHash: input.userAgent ? hashToken(input.userAgent) : null,
      expiresAt,
    });
    await tx
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.id, input.sessionId), isNull(sessions.revokedAt)));
  });
  return { id: newSessionId, sessionToken, csrfToken, expiresAt };
}
