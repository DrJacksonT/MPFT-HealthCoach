import { NextResponse } from "next/server";
import { z } from "zod";
import { login } from "@/src/auth/service";
import { attachSessionCookies } from "@/src/auth/session";
import { clientAddress, genericAuthError, noStoreHeaders, sameOrigin } from "@/src/auth/http";
import { consumeRateLimit } from "@/src/auth/rate-limit";

const inputSchema = z.object({
  identityKind: z.enum(["email", "alias"]),
  identity: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json(genericAuthError(), { status: 403, headers: noStoreHeaders });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(genericAuthError(), { status: 400, headers: noStoreHeaders });
  const ip = clientAddress(request);
  const rate = await consumeRateLimit({ key: `${ip}:${parsed.data.identity}`, bucket: "auth.login", limit: 8, windowMs: 15 * 60_000 });
  if (!rate.allowed) return NextResponse.json(genericAuthError(), { status: 429, headers: { ...noStoreHeaders, "retry-after": "900" } });
  try {
    const session = await login({ ...parsed.data, ip, userAgent: request.headers.get("user-agent") });
    const response = NextResponse.json({ ok: true, mfaRequired: session.mfaRequired }, { headers: noStoreHeaders });
    return attachSessionCookies(response, session);
  } catch {
    return NextResponse.json(genericAuthError(), { status: 401, headers: noStoreHeaders });
  }
}
