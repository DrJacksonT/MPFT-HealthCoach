import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as pgliteDrizzle } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as postgresDrizzle } from "drizzle-orm/postgres-js";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const migrationsFolder = resolve("migrations");

async function main() {
  if (process.env.DATABASE_URL) {
    const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
    try {
      await migratePostgres(postgresDrizzle(client), { migrationsFolder });
      console.log("Applied PostgreSQL migrations.");
    } finally {
      await client.end({ timeout: 5 });
    }
    return;
  }

  const dataDir = process.env.PGLITE_DATA_DIR || ".data/mpft-pglite";
  if (dataDir !== ":memory:") await mkdir(resolve(dataDir), { recursive: true });
  const client = new PGlite(dataDir === ":memory:" ? undefined : dataDir);
  try {
    await client.waitReady;
    await migratePglite(pgliteDrizzle(client), { migrationsFolder });
    console.log(`Applied PGlite migrations at ${dataDir}.`);
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Database migration failed.");
  process.exitCode = 1;
});
