import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { plans, planVersions } from "@/db/schema";

export async function currentPlan(participantId: string) {
  const db = await getDb();
  const [plan] = await db.select().from(plans).where(eq(plans.participantId, participantId)).orderBy(desc(plans.updatedAt)).limit(1);
  if (!plan) return null;
  const [version] = await db.select().from(planVersions).where(eq(planVersions.planId, plan.id)).orderBy(desc(planVersions.version)).limit(1);
  return version ? { plan, version } : null;
}
