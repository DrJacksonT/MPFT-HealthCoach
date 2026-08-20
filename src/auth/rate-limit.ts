import { and, eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";
import { hashToken } from "@/src/auth/crypto";

export async function consumeRateLimit(input: {
  key: string;
  bucket: string;
  limit: number;
  windowMs: number;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const windowStartedAt = new Date(
    Math.floor(now.getTime() / input.windowMs) * input.windowMs,
  );
  const keyHash = hashToken(input.key);
  const db = await getDb();
  await db
    .delete(rateLimits)
    .where(
      and(
        eq(rateLimits.bucket, input.bucket),
        lt(rateLimits.windowStartedAt, new Date(now.getTime() - input.windowMs * 2)),
      ),
    );
  const [row] = await db
    .insert(rateLimits)
    .values({ keyHash, bucket: input.bucket, windowStartedAt, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.keyHash, rateLimits.bucket, rateLimits.windowStartedAt],
      set: { count: sql`${rateLimits.count} + 1`, updatedAt: now },
    })
    .returning({ count: rateLimits.count });
  return { allowed: Boolean(row && row.count <= input.limit), remaining: Math.max(0, input.limit - (row?.count ?? input.limit)) };
}
