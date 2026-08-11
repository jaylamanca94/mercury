const assert = require("node:assert/strict");
const test = require("node:test");

const liveSnapshot = require("../api/live-snapshot");

test("a complete source outage is not cached as a current snapshot", async () => {
  const originalFetch = global.fetch;
  const headers = new Map();
  let body = "";
  const response = {
    setHeader(name, value) {
      headers.set(name.toLowerCase(), value);
    },
    end(value) {
      body = value;
    },
  };

  global.fetch = async () => {
    throw new Error("Upstream unavailable");
  };

  try {
    await liveSnapshot({ method: "GET" }, response);
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(body).status, "unavailable");
  assert.equal(headers.get("cache-control"), "no-store");
});
