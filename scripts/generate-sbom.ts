import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const run = promisify(execFile);
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is unavailable; run this generator through npm run sbom.");
const { stdout } = await run(process.execPath, [npmCli, "sbom", "--omit=dev", "--package-lock-only", "--sbom-format", "cyclonedx", "--sbom-type", "application"], { maxBuffer: 20 * 1024 * 1024 });
const document = JSON.parse(stdout) as { bomFormat?: string; components?: unknown[] };
if (document.bomFormat !== "CycloneDX" || !Array.isArray(document.components)) throw new Error("npm returned an invalid CycloneDX inventory.");
await mkdir("artifacts/security", { recursive: true });
await writeFile("artifacts/security/sbom.cdx.json", `${JSON.stringify(document, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ok: true, file: "artifacts/security/sbom.cdx.json", components: document.components.length }, null, 2));
