import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { dataQualityIssues, dataQualityResolutions } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { runDataQualityChecks } from "@/src/research/data-quality";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("scan") }),
  z.object({ action: z.enum(["confirmed_exception", "corrected_source", "not_an_issue"]), issueId: z.string().uuid() }),
]);
const resolutionNotes = {
  confirmed_exception: "Authorised reviewer documented this as an accepted data exception.",
  corrected_source: "Authorised reviewer confirmed that the source record was corrected and the rule rerun.",
  not_an_issue: "Authorised reviewer documented why this rule does not apply to this record.",
} as const;

export async function POST(request: Request) {
  const session = await requirePermission(request, "research:deidentified");
  if (!session) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
  if (parsed.data.action === "scan") {
    const result = await runDataQualityChecks();
    await recordAuditEvent({ actorUserId: session.userId, eventType: "data_quality.scan", targetType: "data_quality", outcome: "success", metadata: { detected: result.detected } });
    return NextResponse.json({ ok: true, detected: result.detected }, { headers: noStoreHeaders });
  }
  const db = await getDb();
  const [issue] = await db.select().from(dataQualityIssues).where(eq(dataQualityIssues.id, parsed.data.issueId)).limit(1);
  if (!issue) return NextResponse.json({ ok: false }, { status: 404, headers: noStoreHeaders });
  const resolutionAction = parsed.data.action as keyof typeof resolutionNotes;
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.insert(dataQualityResolutions).values({ issueId: issue.id, resolvedByUserId: session.userId, outcome: resolutionAction, note: resolutionNotes[resolutionAction], resolvedAt: now });
    await tx.update(dataQualityIssues).set({ status: "resolved", resolvedAt: now, updatedAt: now }).where(eq(dataQualityIssues.id, issue.id));
  });
  await recordAuditEvent({ actorUserId: session.userId, studyId: issue.studyId, participantId: issue.participantId, eventType: "data_quality.resolved", targetType: "data_quality_issue", targetId: issue.id, outcome: "success", metadata: { resolution: resolutionAction, ruleCode: issue.ruleCode } });
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
