import { createHash } from "node:crypto";
import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

async function filesUnder(root: string, relative = ""): Promise<string[]> {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(root, child));
    else if (entry.isFile()) files.push(child.replaceAll("\\", "/"));
  }
  return files.sort();
}

async function sha256(file: string) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function main() {
  const source = path.resolve(process.env.PGLITE_DATA_DIR ?? ".data/mpft-pglite");
  const outputValue = process.env.PGLITE_BACKUP_OUTPUT;
  if (!outputValue) throw new Error("Set PGLITE_BACKUP_OUTPUT to a new backup directory.");
  const output = path.resolve(outputValue);
  if (source === output || output.startsWith(`${source}${path.sep}`)) throw new Error("Backup output must be separate from the live data directory.");
  if (!(await stat(source)).isDirectory()) throw new Error("PGlite source is not a directory.");
  try { await stat(output); throw new Error("Backup output already exists; no files were overwritten."); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  await mkdir(path.dirname(output), { recursive: true });
  await mkdir(output, { recursive: false });
  const dataOutput = path.join(output, "data");
  await cp(source, dataOutput, { recursive: true, errorOnExist: true, force: false });
  const files = await filesUnder(dataOutput);
  const hashes = Object.fromEntries(await Promise.all(files.map(async (relative) => [relative, await sha256(path.join(dataOutput, relative))])));
  const manifest = { format: "mpft-pglite-directory-backup-v1", createdAt: new Date().toISOString(), sourceDirectoryName: path.basename(source), fileCount: files.length, hashes };
  await writeFile(path.join(output, "backup-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  console.log(JSON.stringify({ ok: true, output, fileCount: files.length }, null, 2));
}

await main();
