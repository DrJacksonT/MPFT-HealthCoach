import { NextResponse } from "next/server";
import { z } from "zod";
import { clientAddress, genericAuthError, noStoreHeaders } from "@/src/auth/http";
import { completeMfa } from "@/src/auth/service";
import { attachSessionCookies, readSession, verifyCsrf } from "@/src/auth/session";

const inputSchema = z.object({ token: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request) {
  const session = await readSession(request);
  if (!session || !(await verifyCsrf(request, session.id)))
    return NextResponse.json(genericAuthError(), { status: 403, headers: noStoreHeaders });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(genericAuthError(), { status: 400, headers: noStoreHeaders });
  try {
    const rotated = await completeMfa(session, parsed.data.token, {
      ip: clientAddress(request),
      userAgent: request.headers.get("user-agent"),
    });
    return attachSessionCookies(
      NextResponse.json({ ok: true }, { headers: noStoreHeaders }),
      rotated,
    );
  } catch {
    return NextResponse.json(genericAuthError(), { status: 401, headers: noStoreHeaders });
  }
}
