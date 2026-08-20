import { NextResponse } from "next/server";
import { z } from "zod";
import { clientAddress, noStoreHeaders, sameOrigin } from "@/src/auth/http";
import { consumeRateLimit } from "@/src/auth/rate-limit";
import { requestPasswordReset } from "@/src/auth/service";

const inputSchema = z.object({ identityKind: z.enum(["email", "alias"]), identity: z.string().trim().min(1).max(254) });

export async function POST(request: Request) {
  const generic = { ok: true, message: "If that account can be reset, instructions have been created." };
  if (!sameOrigin(request)) return NextResponse.json(generic, { headers: noStoreHeaders });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(generic, { headers: noStoreHeaders });
  const rate = await consumeRateLimit({ key: clientAddress(request), bucket: "auth.forgot", limit: 5, windowMs: 60 * 60_000 });
  if (rate.allowed) await requestPasswordReset(parsed.data.identityKind, parsed.data.identity);
  return NextResponse.json(generic, { headers: noStoreHeaders });
}
