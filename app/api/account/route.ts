import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/src/auth/http";

export async function GET(request: Request) { void request; return NextResponse.json({ ok: false }, { status: 410, headers: noStoreHeaders }); }
export async function POST(request: Request) { void request; return NextResponse.json({ ok: false }, { status: 410, headers: noStoreHeaders }); }
export async function DELETE(request: Request) { void request; return NextResponse.json({ ok: false }, { status: 410, headers: noStoreHeaders }); }
