import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/src/auth/http";
import { readSession } from "@/src/auth/session";

export async function GET(request: Request) {
  const session = await readSession(request);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401, headers: noStoreHeaders });
  return NextResponse.json(
    {
      authenticated: true,
      user: {
        displayName: session.displayName,
        roles: session.roles,
        assuranceLevel: session.assuranceLevel,
      },
      expiresAt: session.expiresAt,
    },
    { headers: noStoreHeaders },
  );
}
