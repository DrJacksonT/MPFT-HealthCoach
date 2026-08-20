import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { exportRuns } from "@/db/schema";
import { recordAuditEvent } from "@/src/audit/events";
import { noStoreHeaders } from "@/src/auth/http";
import { requirePermission, verifyCsrf } from "@/src/auth/session";
import { buildAnalysisExport, exportCsv } from "@/src/research/export";

const schema = z.object({ format: z.enum(["csv", "json"]), scope: z.literal("deidentified_analysis").default("deidentified_analysis") });
export async function POST(request: Request) {
  const session = await requirePermission(request, "exports:create"); if (!session) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  if (!(await verifyCsrf(request, session.id))) return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
  const db = await getDb();
  const [run] = await db.insert(exportRuns).values({ studyId: "10000000-0000-4000-8000-000000000001", requestedByUserId: session.userId, format: parsed.data.format, scope: parsed.data.scope, includesRawText: false, status: "generating" }).returning({ id: exportRuns.id });
  const generated = await buildAnalysisExport({ exportId: run.id }); const content = parsed.data.format === "json" ? JSON.stringify(generated, null, 2) : exportCsv(generated.records); const hash = createHash("sha256").update(content).digest("hex");
  await db.update(exportRuns).set({ status: "completed", rowCount: generated.records.length, contentHash: hash, completedAt: new Date() }).where(eq(exportRuns.id, run.id));
  await recordAuditEvent({ actorUserId: session.userId, studyId: "10000000-0000-4000-8000-000000000001", eventType: "research.export_generated", targetType: "export_run", targetId: run.id, outcome: "success", metadata: { format: parsed.data.format, rowCount: generated.records.length, includesRawText: false, contentHash: hash } });
  return new NextResponse(content, { headers: { ...noStoreHeaders, "content-type": parsed.data.format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8", "content-disposition": `attachment; filename="mpft-synthetic-analysis-${run.id}.${parsed.data.format}"`, "x-export-id": run.id, "x-content-sha256": hash } });
}
