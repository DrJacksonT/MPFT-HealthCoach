import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auditChainHeads, auditEvents } from "@/db/schema";
import { stableJson } from "@/src/audit/canonical";

const AUDIT_CHAIN_ID = "global-v1";
const GENESIS_HASH = "GENESIS";

class AuditChainContention extends Error {}

export async function recordAuditEvent(input: {
  actorUserId?: string | null;
  studyId?: string | null;
  participantId?: string | null;
  eventType: string;
  targetType: string;
  targetId?: string | null;
  outcome: "success" | "denied" | "failure";
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const occurredAt = new Date();
  const metadata = { ...(input.metadata ?? {}), auditCanonicalVersion: 2 };
  const db = await getDb();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await db.transaction(async (tx) => {
        await tx
          .insert(auditChainHeads)
          .values({ chainId: AUDIT_CHAIN_ID, currentHash: GENESIS_HASH })
          .onConflictDoNothing();
        const [head] = await tx
          .select({ currentHash: auditChainHeads.currentHash })
          .from(auditChainHeads)
          .where(eq(auditChainHeads.chainId, AUDIT_CHAIN_ID))
          .limit(1);
        if (!head) throw new Error("audit_chain_head_unavailable");
        const previousEventHash = head.currentHash === GENESIS_HASH ? null : head.currentHash;
        const canonical = stableJson({
          previous: previousEventHash,
          actorUserId: input.actorUserId ?? null,
          studyId: input.studyId ?? null,
          participantId: input.participantId ?? null,
          eventType: input.eventType,
          targetType: input.targetType,
          targetId: input.targetId ?? null,
          outcome: input.outcome,
          reason: input.reason ?? null,
          metadata,
          occurredAt: occurredAt.toISOString(),
        });
        const eventHash = createHash("sha256").update(canonical).digest("hex");
        const [claimed] = await tx
          .update(auditChainHeads)
          .set({ currentHash: eventHash, updatedAt: occurredAt })
          .where(
            and(
              eq(auditChainHeads.chainId, AUDIT_CHAIN_ID),
              eq(auditChainHeads.currentHash, head.currentHash),
            ),
          )
          .returning({ chainId: auditChainHeads.chainId });
        if (!claimed) throw new AuditChainContention();
        await tx.insert(auditEvents).values({
          actorUserId: input.actorUserId,
          studyId: input.studyId,
          participantId: input.participantId,
          eventType: input.eventType,
          targetType: input.targetType,
          targetId: input.targetId,
          outcome: input.outcome,
          reason: input.reason,
          metadata,
          previousEventHash,
          eventHash,
          occurredAt,
        });
        return eventHash;
      });
    } catch (error) {
      if (!(error instanceof AuditChainContention) || attempt === 4) throw error;
    }
  }
  throw new Error("audit_chain_contention");
}
