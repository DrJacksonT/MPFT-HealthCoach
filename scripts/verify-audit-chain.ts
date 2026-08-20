import { createHash } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { closeDb, getDb } from "../db/index";
import { auditChainHeads, auditEvents } from "../db/schema";
import { countAuditSegments, stableJson } from "../src/audit/canonical";

const db = await getDb();
const rows = await db.select().from(auditEvents).orderBy(asc(auditEvents.sequence));
let previous: string | null = null;
const segments = countAuditSegments(rows);
const errors: string[] = [];
for (const row of rows) {
  if (row.previousEventHash !== previous) {
    if (row.previousEventHash !== null)
      errors.push(`sequence ${row.sequence}: previous hash does not match the preceding event`);
  }
  const payload: Record<string, unknown> = {
    previous: row.previousEventHash,
    actorUserId: row.actorUserId,
    studyId: row.studyId,
    participantId: row.participantId,
    eventType: row.eventType,
    targetType: row.targetType,
    targetId: row.targetId,
    outcome: row.outcome,
    reason: row.reason,
    metadata: row.metadata,
    occurredAt: row.occurredAt.toISOString(),
  };
  const canonical: string = row.metadata.auditCanonicalVersion === 2 ? stableJson(payload) : JSON.stringify(payload);
  const expected: string = createHash("sha256").update(canonical).digest("hex");
  if (expected !== row.eventHash) errors.push(`sequence ${row.sequence}: event hash does not match canonical content`);
  previous = row.eventHash;
}
const [head] = await db.select({ currentHash: auditChainHeads.currentHash }).from(auditChainHeads).where(eq(auditChainHeads.chainId, "global-v1")).limit(1);
if (rows.length && head?.currentHash !== previous) errors.push("audit chain head does not match the latest event");
if (!rows.length && head && head.currentHash !== "GENESIS") errors.push("empty audit log has a non-genesis head");
await closeDb();
if (errors.length) throw new Error(`Audit verification failed:\n${errors.join("\n")}`);
console.log(JSON.stringify({ ok: true, events: rows.length, segments, canonicalVersion: 2, head: head?.currentHash ?? null }, null, 2));
