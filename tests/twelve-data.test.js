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

test("calculates a distribution yield from a provider annual dividend and the current quote", () => {
  const distribution = _internals.mapDistribution({
    meta: {
      dividends_and_splits: {
        trailing_annual_dividend_rate: "1.20",
        trailing_annual_dividend_yield: "0.95",
      },
    },
  }, 12_625);

  assert.equal(distribution.annualDividendCents, 120);
  assert.equal(distribution.distributionYieldRate, 120 / 12_625);
});

test("does not invent a distribution estimate when provider statistics are unavailable", () => {
  assert.deepEqual(
    _internals.mapDistribution({ status: "error", message: "Not available" }, 12_625),
    { annualDividendCents: null, distributionYieldRate: null },
  );
});

test("rejects provider responses that would create a fabricated price", () => {
  assert.throws(() => _internals.mapQuote({ status: "error", message: "Unknown symbol" }, "NOPE"), /Unknown symbol/);
});

test("quick-add quote lookup sends BTC directly to the provider's USD pair", async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.TWELVE_DATA_API_KEY;
  const requestedRequests = [];
  process.env.TWELVE_DATA_API_KEY = "test-key";
  global.fetch = async (url) => {
    const request = new URL(url);
    const symbol = request.searchParams.get("symbol");
    requestedRequests.push({ pathname: request.pathname, symbol });
    return { ok: true, json: async () => symbol === "BTC/USD" ? { close: "65000", previous_close: "64000", datetime: "2026-09-01T20:00:00Z" } : { status: "error", message: "Unknown symbol" } };
  };

  try {
    const quote = await getQuote({ symbol: "btc", instrumentType: "other" });
    assert.deepEqual(requestedRequests, [{ pathname: "/quote", symbol: "BTC/USD" }]);
    assert.equal(quote.symbol, "BTC/USD");
    assert.equal(quote.instrumentType, "crypto");
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = originalKey;
  }
});

test("retains a successful quote when provider dividend statistics fail", async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.TWELVE_DATA_API_KEY;
  process.env.TWELVE_DATA_API_KEY = "test-key";
  global.fetch = async (url) => {
    const request = new URL(url);
    if (request.pathname === "/quote") {
      return { ok: true, json: async () => ({ close: "100", previous_close: "99", datetime: "2026-09-01T20:00:00Z" }) };
    }
    return { ok: false, json: async () => ({}) };
  };

  try {
    const quote = await getQuote({ symbol: "NOYIELD", instrumentType: "stock" });
    assert.equal(quote.priceCents, 10_000);
    assert.equal(quote.annualDividendCents, null);
    assert.equal(quote.distributionYieldRate, null);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = originalKey;
  }
});
