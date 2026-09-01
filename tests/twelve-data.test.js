const assert = require("node:assert/strict");
const test = require("node:test");
const { _internals, getQuote } = require("../api/lib/twelve-data");

test("normalises known crypto tickers to the provider's USD pair without changing fund symbols", () => {
  assert.equal(_internals.normaliseSymbol("btc", "crypto"), "BTC/USD");
  assert.equal(_internals.normaliseSymbol("btc", "other"), "BTC/USD");
  assert.equal(_internals.normaliseSymbol("BTC-USD", "other"), "BTC/USD");
  assert.equal(_internals.normaliseSymbol("VFIAX", "mutual-fund"), "VFIAX");
});

test("maps a Twelve Data quote into Mercury's cent-based quote contract", () => {
  const quote = _internals.mapQuote({ close: "126.25", previous_close: "125.60", datetime: "2026-08-30T20:00:00Z" }, "VT");
  assert.deepEqual(quote, { symbol: "VT", priceCents: 12625, priorCloseCents: 12560, asOf: "2026-08-30T20:00:00.000Z", source: "Twelve Data" });
});

test("rejects provider responses that would create a fabricated price", () => {
  assert.throws(() => _internals.mapQuote({ status: "error", message: "Unknown symbol" }, "NOPE"), /Unknown symbol/);
});

test("quick-add quote lookup sends BTC directly to the provider's USD pair", async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.TWELVE_DATA_API_KEY;
  const requestedSymbols = [];
  process.env.TWELVE_DATA_API_KEY = "test-key";
  global.fetch = async (url) => {
    const symbol = new URL(url).searchParams.get("symbol");
    requestedSymbols.push(symbol);
    return { ok: true, json: async () => symbol === "BTC/USD" ? { close: "65000", previous_close: "64000", datetime: "2026-09-01T20:00:00Z" } : { status: "error", message: "Unknown symbol" } };
  };

  try {
    const quote = await getQuote({ symbol: "btc", instrumentType: "other" });
    assert.deepEqual(requestedSymbols, ["BTC/USD"]);
    assert.equal(quote.symbol, "BTC/USD");
    assert.equal(quote.instrumentType, "crypto");
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = originalKey;
  }
});
