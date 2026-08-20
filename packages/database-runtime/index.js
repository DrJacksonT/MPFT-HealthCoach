import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const stateKey = Symbol.for("mpft.database-runtime.pglite");
const state = (globalThis[stateKey] ??= {});

function installShutdownHandlers() {
  if (state.handlersInstalled) return;
  state.handlersInstalled = true;
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, async () => {
      await closePgliteClient().catch(() => undefined);
      process.exit(signal === "SIGINT" ? 130 : 143);
    });
  }
}

export async function getPgliteClient(dataDir) {
  if (state.client) return state.client;
  if (state.initialising) return state.initialising;
  state.initialising = (async () => {
    if (dataDir !== ":memory:") await mkdir(resolve(dataDir), { recursive: true });
    const client = new PGlite(dataDir === ":memory:" ? undefined : dataDir);
    await client.waitReady;
    state.client = client;
    installShutdownHandlers();
    return client;
  })();
  try {
    return await state.initialising;
  } finally {
    state.initialising = undefined;
  }
}

export async function closePgliteClient() {
  await state.client?.close();
  state.client = undefined;
  state.initialising = undefined;
}
