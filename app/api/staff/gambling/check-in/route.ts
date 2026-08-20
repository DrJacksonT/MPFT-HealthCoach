import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { checkIns } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { gamblingSimulationData } from "@/src/gambling/simulation";

const schema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), gamblingOccurred: z.boolean(), urge: z.number().int().min(0).max(10), episodes: z.number().int().min(0).max(1000), moneyStakedPence: z.number().int().min(0).max(100_000_000), moneyLostPence: z.number().int().min(0).max(100_000_000), currency: z.literal("GBP"), chasing: z.boolean(), distress: z.number().int().min(0).max(10), protectiveActions: z.array(z.enum(["bank-block-active", "self-exclusion-active", "money-access-limited", "trusted-person", "specialist-support", "none"])).max(6) });
export async function POST(request: Request) {
  const session = await requirePermission(request, "research:deidentified"); if (!session) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ ok: false, message: "Complete the synthetic gambling record using the defined fields." }, { status: 400, headers: noStoreHeaders });
  const context = await gamblingSimulationData(); if (!context) return NextResponse.json({ ok: false }, { status: 503, headers: noStoreHeaders }); const db = await getDb();
  const [existing] = await db.select({ id: checkIns.id }).from(checkIns).where(and(eq(checkIns.participantId, context.participantId), eq(checkIns.scheduledFor, parsed.data.date), eq(checkIns.intervention, "gambling"))).limit(1); if (existing) return NextResponse.json({ ok: false, message: "A source record already exists for that date and is not overwritten." }, { status: 409, headers: noStoreHeaders });
  const [record] = await db.insert(checkIns).values({ participantId: context.participantId, intervention: "gambling", scheduledFor: parsed.data.date, completedAt: new Date(), status: "completed", gamblingOccurred: parsed.data.gamblingOccurred, gamblingUrge: parsed.data.urge, gamblingEpisodes: parsed.data.episodes, moneyGambledPence: parsed.data.moneyStakedPence, gamblingLossPence: parsed.data.moneyLostPence, currency: parsed.data.currency, chasing: parsed.data.chasing, distress: parsed.data.distress, financialProtectionCodes: parsed.data.protectiveActions, freeTextPresent: false }).returning({ id: checkIns.id });
  await recordAuditEvent({ actorUserId: session.userId, studyId: context.studyId, participantId: context.participantId, eventType: "gambling.synthetic_check_in_recorded", targetType: "check_in", targetId: record.id, outcome: "success", metadata: { staffSimulation: true, date: parsed.data.date, currency: "GBP", rawText: false } });
  return NextResponse.json({ ok: true, message: "Synthetic staff-simulation record saved. It does not represent a live participant." }, { status: 201, headers: noStoreHeaders });
}
