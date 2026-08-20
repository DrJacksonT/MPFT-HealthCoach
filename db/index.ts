import type { PgDatabase } from "drizzle-orm/pg-core";
import type { PgQueryResultHKT } from "drizzle-orm/pg-core/session";
import { drizzle as pgliteDrizzle } from "drizzle-orm/pglite";
import { drizzle as postgresDrizzle } from "drizzle-orm/postgres-js";
import type { PGlite } from "@electric-sql/pglite";
import { closePgliteClient, getPgliteClient } from "@mpft/database-runtime";
import postgres from "postgres";
import * as schema from "./schema";

export type AppDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

type DatabaseState = {
  database?: AppDatabase;
  pgliteClient?: PGlite;
  postgresClient?: ReturnType<typeof postgres>;
  initialising?: Promise<AppDatabase>;
};

const shared = globalThis as typeof globalThis & {
  __mpftDatabaseState?: DatabaseState;
};
const state = (shared.__mpftDatabaseState ??= {});

export function databaseKind(): "postgres" | "pglite" {
  return process.env.DATABASE_URL ? "postgres" : "pglite";
}

export async function getDb(): Promise<AppDatabase> {
  if (state.database) return state.database;
  if (state.initialising) return state.initialising;

  state.initialising = initialiseDb();
  try {
    return await state.initialising;
  } finally {
    state.initialising = undefined;
  }
}

async function initialiseDb(): Promise<AppDatabase> {
  if (process.env.DATABASE_URL) {
    state.postgresClient = postgres(process.env.DATABASE_URL, {
      max: process.env.NODE_ENV === "test" ? 1 : 10,
      connect_timeout: 10,
      idle_timeout: 20,
      prepare: false,
    });
    state.database = postgresDrizzle(state.postgresClient, { schema }) as unknown as AppDatabase;
    return state.database;
  }

  const dataDir = process.env.PGLITE_DATA_DIR || ".data/mpft-pglite";
  state.pgliteClient = await getPgliteClient(dataDir);
  state.database = pgliteDrizzle(state.pgliteClient, { schema }) as unknown as AppDatabase;
  return state.database;
}

export async function closeDb() {
  await state.postgresClient?.end({ timeout: 5 });
  if (state.pgliteClient) await closePgliteClient();
  state.database = undefined;
  state.postgresClient = undefined;
  state.pgliteClient = undefined;
  state.initialising = undefined;
}
