import type { PGlite } from "@electric-sql/pglite";

export function getPgliteClient(dataDir: string): Promise<PGlite>;
export function closePgliteClient(): Promise<void>;
