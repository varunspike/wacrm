import assert from "node:assert/strict";

const origin = process.argv[2] || "http://127.0.0.1:8787";
for (const [path, status] of [
  ["/login", 200],
  ["/inbox", 307],
  ["/api/whatsapp/config", 401],
  ["/opus/encoderWorker.min.js", 200],
]) {
  const response = await fetch(new URL(path, origin), { redirect: "manual" });
  assert.equal(response.status, status, path);
  if (!path.startsWith("/opus/")) {
    assert.match(response.headers.get("cache-control") || "", /no-store/, path);
  }
  if (path === "/inbox") {
    assert.equal(new URL(response.headers.get("location"), origin).pathname, "/login");
  }
  await response.arrayBuffer();
  console.log(`${status} ${path}`);
}
