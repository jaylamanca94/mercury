const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "vercel.json"), "utf8"));
const securityHeaders = Object.fromEntries(
  config.headers[0].headers.map(({ key, value }) => [key.toLowerCase(), value]),
);

test("Vercel applies a restrictive security envelope to every Mercury route", () => {
  assert.equal(config.headers[0].source, "/(.*)");
  assert.match(securityHeaders["content-security-policy"], /default-src 'self'/);
  assert.match(securityHeaders["content-security-policy"], /connect-src 'self'/);
  assert.match(securityHeaders["content-security-policy"], /frame-ancestors 'none'/);
  assert.match(securityHeaders["content-security-policy"], /https:\/\/cdnjs\.cloudflare\.com/);
  assert.equal(securityHeaders["permissions-policy"], "camera=(), geolocation=(), microphone=(), payment=()");
  assert.equal(securityHeaders["referrer-policy"], "strict-origin-when-cross-origin");
  assert.equal(securityHeaders["x-content-type-options"], "nosniff");
  assert.equal(securityHeaders["x-frame-options"], "DENY");
});
