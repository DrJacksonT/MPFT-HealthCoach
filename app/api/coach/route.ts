import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/src/auth/http";

export async function POST(request: Request) {
  void request;
  return NextResponse.json({ ok: false, message: "This legacy route is closed. Use the authenticated participant coaching route." }, { status: 410, headers: noStoreHeaders });
}
