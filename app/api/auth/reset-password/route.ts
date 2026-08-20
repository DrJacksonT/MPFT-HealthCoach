import { NextResponse } from "next/server";
import { z } from "zod";
import { genericAuthError, noStoreHeaders, sameOrigin } from "@/src/auth/http";
import { resetPassword } from "@/src/auth/service";

const inputSchema = z.object({ token: z.string().min(32).max(256), password: z.string().min(12).max(128) });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json(genericAuthError(), { status: 403, headers: noStoreHeaders });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(genericAuthError(), { status: 400, headers: noStoreHeaders });
  try {
    await resetPassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json(genericAuthError(), { status: 400, headers: noStoreHeaders });
  }
}
