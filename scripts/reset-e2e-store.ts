import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const dataRoot = path.resolve(".data");
const target = path.resolve(process.env.PGLITE_DATA_DIR ?? ".data/mpft-e2e-test");
const mailTarget = path.resolve(".data/e2e-mail");
if (path.dirname(target) !== dataRoot || path.basename(target) !== "mpft-e2e-test") throw new Error("Refusing to reset anything except .data/mpft-e2e-test.");
if (path.dirname(mailTarget) !== dataRoot || path.basename(mailTarget) !== "e2e-mail") throw new Error("Refusing to reset anything except .data/e2e-mail.");
await mkdir(dataRoot, { recursive: true });
await rm(target, { recursive: true, force: true });
await rm(mailTarget, { recursive: true, force: true });
console.log(`Reset isolated E2E store: ${target}`);
