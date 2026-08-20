import { NextResponse } from "next/server";
import { z } from "zod";
import { clientAddress, genericAuthError, noStoreHeaders, sameOrigin } from "@/src/auth/http";
import { consumeRateLimit } from "@/src/auth/rate-limit";
import { registerWithInvitation } from "@/src/auth/service";

const inputSchema = z.object({
  invitationCode: z.string().trim().min(8).max(128),
  identityKind: z.enum(["email", "alias"]),
  identity: z.string().trim().min(3).max(254),
  displayName: z.string().trim().min(1).max(80),
  password: z.string().min(12).max(128),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json(genericAuthError(), { status: 403, headers: noStoreHeaders });
  const rate = await consumeRateLimit({ key: clientAddress(request), bucket: "auth.register", limit: 6, windowMs: 60 * 60_000 });
  if (!rate.allowed) return NextResponse.json(genericAuthError(), { status: 429, headers: { ...noStoreHeaders, "retry-after": "3600" } });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(genericAuthError(), { status: 400, headers: noStoreHeaders });
  try {
    const result = await registerWithInvitation(parsed.data);
    return NextResponse.json(
      { ok: true, verificationRequired: result.verificationRequired },
      { status: 201, headers: noStoreHeaders },
    );
  } catch {
    return NextResponse.json(genericAuthError(), { status: 400, headers: noStoreHeaders });
  }
}
