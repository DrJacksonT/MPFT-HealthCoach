import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { aiBudgetCounters, aiBudgetReservations } from "@/db/schema";
import { environment } from "@/src/config/environment";

const MAX_ESTIMATED_INPUT_TOKENS = 10_000;
const MAX_OUTPUT_TOKENS = 450;
const RESERVATION_TTL_MS = 2 * 60_000;

function decimal(value: number) {
  return value.toFixed(8);
}

export function maximumCoachCallCostUsd() {
  const env = environment();
  return (
    (MAX_ESTIMATED_INPUT_TOKENS * env.OPENAI_INPUT_USD_PER_1M +
      MAX_OUTPUT_TOKENS * env.OPENAI_OUTPUT_USD_PER_1M) /
    1_000_000
  );
}

export async function reserveAiBudget(studyId: string) {
  const env = environment();
  const reservedUsd = maximumCoachCallCostUsd();
  if (env.OPENAI_STUDY_BUDGET_USD <= 0 || reservedUsd <= 0) return null;
  const db = await getDb();
  return db.transaction(async (tx) => {
    await tx
      .insert(aiBudgetCounters)
      .values({
        studyId,
        budgetUsd: decimal(env.OPENAI_STUDY_BUDGET_USD),
        reservedUsd: "0",
        spentUsd: "0",
      })
      .onConflictDoUpdate({
        target: aiBudgetCounters.studyId,
        set: { budgetUsd: decimal(env.OPENAI_STUDY_BUDGET_USD), updatedAt: new Date() },
      });
    const [claimed] = await tx
      .update(aiBudgetCounters)
      .set({
        reservedUsd: sql`${aiBudgetCounters.reservedUsd} + ${decimal(reservedUsd)}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(aiBudgetCounters.studyId, studyId),
          sql`${aiBudgetCounters.spentUsd} + ${aiBudgetCounters.reservedUsd} + ${decimal(reservedUsd)} <= ${aiBudgetCounters.budgetUsd}`,
        ),
      )
      .returning({ studyId: aiBudgetCounters.studyId });
    if (!claimed) return null;
    const [reservation] = await tx
      .insert(aiBudgetReservations)
      .values({
        studyId,
        reservedUsd: decimal(reservedUsd),
        expiresAt: new Date(Date.now() + RESERVATION_TTL_MS),
      })
      .returning({ id: aiBudgetReservations.id });
    return reservation ? { id: reservation.id, reservedUsd } : null;
  });
}

export async function settleAiBudgetReservation(
  reservationId: string,
  actualCostUsd: number,
) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const [reservation] = await tx
      .update(aiBudgetReservations)
      .set({
        actualCostUsd: decimal(actualCostUsd),
        status: "settled",
        settledAt: new Date(),
      })
      .where(
        and(
          eq(aiBudgetReservations.id, reservationId),
          eq(aiBudgetReservations.status, "reserved"),
        ),
      )
      .returning({
        studyId: aiBudgetReservations.studyId,
        reservedUsd: aiBudgetReservations.reservedUsd,
      });
    if (!reservation) return;
    await tx
      .update(aiBudgetCounters)
      .set({
        reservedUsd: sql`greatest(${aiBudgetCounters.reservedUsd} - ${reservation.reservedUsd}, 0)`,
        spentUsd: sql`${aiBudgetCounters.spentUsd} + ${decimal(actualCostUsd)}`,
        updatedAt: new Date(),
      })
      .where(eq(aiBudgetCounters.studyId, reservation.studyId));
  });
}
