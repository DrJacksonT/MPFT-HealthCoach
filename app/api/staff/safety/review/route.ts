import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { safetyFlags, safetyReviews } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";

const schema = z.object({ flagId: z.string().uuid(), action: z.enum(["acknowledge", "resolve_quality_follow_up", "resolve_no_further_action"]) });
const notes = { acknowledge: "Acknowledged for authorised quality review; not an emergency response.", resolve_quality_follow_up: "Resolved after quality follow-up was recorded outside the emergency pathway.", resolve_no_further_action: "Resolved with no further quality action required." } as const;

export async function POST(request: Request) {
  const session = await requirePermission(request, "safety:review"); if (!session) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
  const db = await getDb(); const [flag] = await db.select().from(safetyFlags).where(eq(safetyFlags.id, parsed.data.flagId)).limit(1); if (!flag) return NextResponse.json({ ok: false }, { status: 404, headers: noStoreHeaders });
  const resolved = parsed.data.action !== "acknowledge"; const now = new Date();
  await db.transaction(async (tx) => { await tx.insert(safetyReviews).values({ flagId: flag.id, reviewerUserId: session.userId, outcome: parsed.data.action, note: notes[parsed.data.action] }); await tx.update(safetyFlags).set({ status: resolved ? "resolved" : "acknowledged", resolvedAt: resolved ? now : null }).where(eq(safetyFlags.id, flag.id)); });
  await recordAuditEvent({ actorUserId: session.userId, participantId: flag.participantId, eventType: "safety.quality_review_recorded", targetType: "safety_flag", targetId: flag.id, outcome: "success", metadata: { action: parsed.data.action, emergencyResponse: false } });
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
