import { createHash } from "node:crypto";
import { cp, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

async function sha256(file: string) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function main() {
  const sourceValue = process.env.PGLITE_RESTORE_SOURCE;
  const targetValue = process.env.PGLITE_RESTORE_TARGET;
  if (!sourceValue || !targetValue) throw new Error("Set PGLITE_RESTORE_SOURCE and PGLITE_RESTORE_TARGET.");
  const source = path.resolve(sourceValue);
  const target = path.resolve(targetValue);
  if (source === target || target.startsWith(`${source}${path.sep}`)) throw new Error("Restore target must be separate from the backup.");
  try { await stat(target); throw new Error("Restore target already exists; no files were overwritten."); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const manifest = JSON.parse(await readFile(path.join(source, "backup-manifest.json"), "utf8")) as { format: string; hashes: Record<string, string>; fileCount: number };
  if (manifest.format !== "mpft-pglite-directory-backup-v1") throw new Error("Unsupported backup format.");
  const entries = Object.entries(manifest.hashes);
  if (entries.length !== manifest.fileCount) throw new Error("Backup manifest file count does not match.");
  for (const [relative, expected] of entries) {
    const candidate = path.resolve(source, "data", relative);
    if (!candidate.startsWith(`${path.resolve(source, "data")}${path.sep}`)) throw new Error("Backup manifest contains an unsafe path.");
    if (await sha256(candidate) !== expected) throw new Error(`Backup checksum failed for ${relative}.`);
  }
  await mkdir(path.dirname(target), { recursive: true });
  await cp(path.join(source, "data"), target, { recursive: true, errorOnExist: true, force: false });
  console.log(JSON.stringify({ ok: true, target, verifiedFiles: entries.length }, null, 2));
}

await main();
