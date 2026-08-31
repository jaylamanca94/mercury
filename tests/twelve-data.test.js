const assert = require("node:assert/strict");
const test = require("node:test");
const { _internals } = require("../api/lib/twelve-data");

test("normalises a crypto ticker to the provider's USD pair without changing fund symbols", () => {
  assert.equal(_internals.normaliseSymbol("btc", "crypto"), "BTC/USD");
  assert.equal(_internals.normaliseSymbol("VFIAX", "mutual-fund"), "VFIAX");
});

test("maps a Twelve Data quote into Mercury's cent-based quote contract", () => {
  const quote = _internals.mapQuote({ close: "126.25", previous_close: "125.60", datetime: "2026-08-30T20:00:00Z" }, "VT");
  assert.deepEqual(quote, { symbol: "VT", priceCents: 12625, priorCloseCents: 12560, asOf: "2026-08-30T20:00:00.000Z", source: "Twelve Data" });
});

test("rejects provider responses that would create a fabricated price", () => {
  assert.throws(() => _internals.mapQuote({ status: "error", message: "Unknown symbol" }, "NOPE"), /Unknown symbol/);
});
