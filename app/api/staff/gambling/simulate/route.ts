import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { coachInteractions, safetyFlags } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { COACH_RULES_VERSION, COACH_SCHEMA_VERSION } from "@/src/coaching/ai-adapter";
import { classifySafety, safetyResponse } from "@/src/domain/safety";
import { gamblingProtectiveActions, gamblingSimulationData } from "@/src/gambling/simulation";

const schema = z.object({ message: z.string().trim().max(500).default("") });
export async function POST(request: Request) {
  const session = await requirePermission(request, "research:deidentified"); if (!session) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
  const context = await gamblingSimulationData(); if (!context) return NextResponse.json({ ok: false }, { status: 503, headers: noStoreHeaders });
  const route = parsed.data.message ? classifySafety(parsed.data.message) : "supported"; const db = await getDb(); const refused = route !== "supported";
  const [interaction] = await db.insert(coachInteractions).values({ participantId: context.participantId, studyVersionId: context.studyVersionId, provider: "deterministic", model: "gambling-safety-router", promptVersion: "gambling-staff-simulation-v1", rulesVersion: COACH_RULES_VERSION, schemaVersion: COACH_SCHEMA_VERSION, intent: "immediate_gambling_urge", claimIds: [], inputSafety: { route, staffSimulation: true, rawTextStored: false }, outputSafety: { passed: true, generativeOutput: false }, outcome: refused ? "refused" : "completed", fallbackReason: refused ? `input_${route}` : null, latencyMs: 0 }).returning({ id: coachInteractions.id });
  if (interaction && !["supported", "injection", "gambling-prohibited"].includes(route)) await db.insert(safetyFlags).values({ participantId: context.participantId, sourceType: "gambling_staff_simulation", sourceId: interaction.id, category: route, severity: ["emergency", "self-harm"].includes(route) ? "urgent" : "moderate", ruleVersion: COACH_RULES_VERSION, participantMessageCode: "immediate-self-directed-support" });
  await recordAuditEvent({ actorUserId: session.userId, studyId: context.studyId, participantId: context.participantId, eventType: refused ? "gambling.simulation_refused" : "gambling.protective_route_shown", targetType: "coach_interaction", targetId: interaction?.id, outcome: refused ? "denied" : "success", reason: refused ? route : undefined, metadata: { staffSimulation: true, rawTextStored: false, generativeOutput: false } });
  if (refused) return NextResponse.json({ ok: true, kind: "boundary", route, message: safetyResponse(route), helpUrl: "/help", monitored: false }, { headers: noStoreHeaders });
  return NextResponse.json({ ok: true, kind: "structured", title: "Protect the next few minutes", introduction: "This is a deterministic staff simulation. Choose one protective action and avoid borrowing, chasing or trying to recover losses.", actions: gamblingProtectiveActions, monitored: false, generativeOutput: false }, { headers: noStoreHeaders });
}
