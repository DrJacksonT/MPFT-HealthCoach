import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { environment } from "@/src/config/environment";
import { hasPermission, type Permission } from "@/src/auth/permissions";
import { readSession } from "@/src/auth/session";

export async function serverSession() {
  const incoming = await headers();
  const requestHeaders = new Headers();
  incoming.forEach((value, key) => requestHeaders.set(key, value));
  return readSession(new Request(environment().APP_ORIGIN, { headers: requestHeaders }));
}

export async function requireServerSession() {
  const session = await serverSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireServerPermission(permission: Permission) {
  const session = await requireServerSession();
  if (!hasPermission(session.roles, permission)) redirect("/participant");
  if (session.roles.some((role) => role !== "participant") && session.assuranceLevel < 2)
    redirect("/mfa");
  return session;
}
