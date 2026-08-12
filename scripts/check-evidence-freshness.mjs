import fs from "node:fs";
const source = fs.readFileSync(new URL("../src/data/evidence.ts", import.meta.url), "utf8");
const defaultDue = source.match(/const due = "([0-9-]+)"/)?.[1];
const verified = [...source.matchAll(/verifiedRecord\(\{([\s\S]*?)\}\),/g)].map((match) => {
  const body = match[1];
  return {
    id: body.match(/id:\s*"([^"]+)"/)?.[1] ?? "unknown",
    reviewDueDate: body.match(/reviewDueDate:\s*"([0-9-]+)"/)?.[1] ?? defaultDue,
  };
});
const today = new Date().toISOString().slice(0,10);
const invalid = verified.filter((item) => !item.reviewDueDate || !/^\d{4}-\d{2}-\d{2}$/.test(item.reviewDueDate));
const overdue = verified.filter((item) => item.reviewDueDate && item.reviewDueDate < today);
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), verifiedRecords: verified.length, overdue, invalid, action: overdue.length || invalid.length ? "Suppress affected records and re-verify; never auto-publish." : "No verified record review dates are overdue. URL and content checks still require reviewed verification." }, null, 2));
process.exitCode = overdue.length || invalid.length ? 1 : 0;
