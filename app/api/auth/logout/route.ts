import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/src/auth/http";
import { clearSessionCookies, readSession, revokeRequestSession, verifyCsrf } from "@/src/auth/session";

export async function POST(request: Request) {
  const session = await readSession(request);
  if (!session || !(await verifyCsrf(request, session.id)))
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  await revokeRequestSession(request);
  return clearSessionCookies(NextResponse.json({ ok: true }, { headers: noStoreHeaders }));
}
