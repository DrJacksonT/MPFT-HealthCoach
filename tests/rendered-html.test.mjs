import assert from "node:assert/strict";
import test from "node:test";
async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}
test("server renders the evidence coach", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Evidence Coach/);
  assert.match(html, /This is a research prototype/);
  assert.match(html, /Start my smoking review/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(
    response.headers.get("content-security-policy") ?? "",
    /frame-ancestors 'none'/,
  );
});
test("production hides developer evidence admin by default", async () => {
  const response = await render("/admin/evidence");
  assert.equal(response.status, 404);
});
