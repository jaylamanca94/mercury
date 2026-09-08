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
    statistics: {
      dividends_and_splits: {
        trailing_annual_dividend_rate: "1.20",
        trailing_annual_dividend_yield: "0.95",
      },
    },
  }, 12_625);

  assert.equal(distribution.annualDividendCents, 120);
  assert.equal(distribution.distributionYieldRate, 120 / 12_625);
});

test("uses the provider decimal yield when no annual distribution amount is present", () => {
  const distribution = _internals.mapDistribution({
    statistics: {
      dividends_and_splits: { trailing_annual_dividend_yield: "0.0057" },
    },
  }, 12_625);

  assert.deepEqual(distribution, { annualDividendCents: null, distributionYieldRate: 0.0057 });
});

test("does not invent a distribution estimate when provider statistics are unavailable", () => {
  assert.deepEqual(
    _internals.mapDistribution({ status: "error", message: "Not available" }, 12_625),
    { annualDividendCents: null, distributionYieldRate: null },
  );
});

test("calculates annualised return from dividend-adjusted historical closes", () => {
  const performance = _internals.annualizedReturn([
    { datetime: "2021-09-01", close: "100" },
    { datetime: "2026-09-01", close: "161.05" },
  ]);

  assert.equal(performance.annualizedReturnYears, 5);
  assert.ok(Math.abs(performance.annualizedReturnRate - 0.1) < 0.0002);
});

test("calculates trailing distribution yield from provider cash-distribution history", () => {
  const distribution = _internals.mapYahooDistribution({
    chart: {
      result: [{
        events: { dividends: { first: { amount: 0.6 }, second: { amount: 0.6 } } },
      }],
    },
  }, 12_000);

  assert.deepEqual(distribution, { annualDividendCents: 120, distributionYieldRate: 0.01 });
});

test("calculates annualised return from Yahoo adjusted-close history as a coverage fallback", () => {
  const performance = _internals.mapYahooPerformance({
    chart: {
      result: [{
        timestamp: [1630454400, 1788220800],
        indicators: { adjclose: [{ adjclose: [100, 161.05] }] },
      }],
    },
  });

  assert.equal(performance.annualizedReturnYears, 5);
  assert.ok(Math.abs(performance.annualizedReturnRate - 0.1) < 0.0002);
});

test("calculates both portfolio card metrics from one Yahoo market-history response", () => {
  const metrics = _internals.mapYahooPortfolioMetrics({
    chart: {
      result: [{
        timestamp: [1630454400, 1788220800],
        indicators: {
          quote: [{ close: [100, 120] }],
          adjclose: [{ adjclose: [100, 161.05] }],
        },
        events: { dividends: { distribution: { date: 1780000000, amount: 1.2 } } },
      }],
    },
  }, "mutual-fund");

  assert.equal(metrics.annualizedReturnYears, 5);
  assert.equal(metrics.annualDividendCents, 120);
  assert.equal(metrics.distributionYieldRate, 0.01);
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

test("uses provider cash-distribution history when dividend statistics are unavailable", async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.TWELVE_DATA_API_KEY;
  process.env.TWELVE_DATA_API_KEY = "test-key";
  global.fetch = async (url) => {
    const request = new URL(url);
    if (request.pathname === "/quote") {
      return { ok: true, json: async () => ({ close: "100", previous_close: "99", datetime: "2026-09-01T20:00:00Z" }) };
    }
    if (request.hostname === "query1.finance.yahoo.com") {
      return { ok: true, json: async () => ({ chart: { result: [{ events: { dividends: { dividend: { amount: 2 } } } }] } }) };
    }
    return { ok: false, json: async () => ({}) };
  };

  try {
    const quote = await getQuote({ symbol: "HISTORYYIELD", instrumentType: "stock" });
    assert.equal(quote.annualDividendCents, 200);
    assert.equal(quote.distributionYieldRate, 0.02);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = originalKey;
  }
});

test("includes source-backed annualised performance only when requested", async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.TWELVE_DATA_API_KEY;
  process.env.TWELVE_DATA_API_KEY = "test-key";
  global.fetch = async (url) => {
    const request = new URL(url);
    if (request.pathname === "/quote") {
      return { ok: true, json: async () => ({ close: "100", previous_close: "99", datetime: "2026-09-01T20:00:00Z" }) };
    }
    if (request.pathname === "/time_series") {
      return { ok: true, json: async () => ({ values: [
        { datetime: "2021-09-01", close: "100" },
        { datetime: "2026-09-01", close: "161.05" },
      ] }) };
    }
    return { ok: false, json: async () => ({}) };
  };

  try {
    const quote = await getQuote({ symbol: "WITHPERFORMANCE", instrumentType: "stock", includeMetrics: true });
    assert.equal(quote.annualizedReturnYears, 5);
    assert.ok(Math.abs(quote.annualizedReturnRate - 0.1) < 0.0002);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = originalKey;
  }
});

test("provider prices reject blanks, nulls, booleans and unsafe cent values without fabricating zero", () => {
  for (const price of [null, undefined, "", "   ", false, true, [], {}, "1e100"]) {
    assert.throws(() => _internals.mapQuote({ price }, "VT"), /no usable price/);
  }
  assert.equal(_internals.mapQuote({ price: "0" }, "VT").priceCents, 0);
});

function timedProvider(t, fetcher) {
  const key = process.env.TWELVE_DATA_API_KEY;
  process.env.TWELVE_DATA_API_KEY = 'test-key';
  t.after(() => {
    if (key === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = key;
  });
  const deadlines = [];
  t.mock.method(AbortSignal, 'timeout', (ms) => {
    const controller = new AbortController();
    deadlines.push({ms, controller});
    return controller.signal;
  });
  t.mock.method(global, 'fetch', fetcher);
  return deadlines;
}
function stalled(signal) {
  return new Promise((_, reject) => {
    if (signal.aborted) reject(signal.reason);
    else signal.addEventListener('abort', () => reject(signal.reason), {once:true});
  });
}
const testQuote = {close:'100', previous_close:'99', datetime:'2026-09-08T20:00:00Z'};

test('a stalled quote aborts and a later retry succeeds without caching failure', async (t) => {
  let signal;
  const deadlines = timedProvider(t, async (_url, options) => {
    signal = options.signal;
    return stalled(signal);
  });
  const pending = getQuote({symbol:'TIMEOUTPRICE', instrumentType:'crypto'});
  const rejected = assert.rejects(pending, /timed out/);
  assert.deepEqual(deadlines.map(d => d.ms), [10000, 4000]);
  deadlines[1].controller.abort();
  await rejected;
  assert.equal(signal.aborted, true);
  t.mock.method(global, 'fetch', async () => ({ok:true, json:async()=>testQuote}));
  assert.equal((await getQuote({symbol:'TIMEOUTPRICE', instrumentType:'crypto'})).priceCents, 10000);
});

test('provider deadlines also abort a stalled JSON response body', async (t) => {
  const deadlines = timedProvider(t, async (_url, {signal}) => ({ok:true, json:()=>stalled(signal)}));
  const rejected = assert.rejects(getQuote({symbol:'TIMEOUTBODY', instrumentType:'crypto'}), /timed out/);
  await Promise.resolve();
  deadlines[1].controller.abort();
  await rejected;
});

test('optional statistics timeout falls back to distribution history and preserves the price', async (t) => {
  let started;
  const ready = new Promise(resolve => {started = resolve});
  const deadlines = timedProvider(t, async (url, {signal}) => {
    const path = new URL(url).pathname;
    if (path === '/quote') return {ok:true, json:async()=>testQuote};
    if (path === '/statistics') {started(); return stalled(signal);}
    return {ok:true, json:async()=>({chart:{result:[{events:{dividends:{a:{amount:1.5}}}}]}})};
  });
  const pending = getQuote({symbol:'TIMEOUTSTATS', instrumentType:'stock'});
  await ready;
  deadlines.at(-1).controller.abort();
  const quote = await pending;
  assert.equal(quote.priceCents, 10000);
  assert.equal(quote.annualDividendCents, 150);
});

test('the whole lookup budget stops optional fallbacks without discarding a usable price', async (t) => {
  let started;
  const ready = new Promise(resolve => {started = resolve});
  const paths = [];
  const deadlines = timedProvider(t, async (url, {signal}) => {
    const path = new URL(url).pathname; paths.push(path);
    if (path === '/quote') return {ok:true, json:async()=>testQuote};
    started(); return stalled(signal);
  });
  const pending = getQuote({symbol:'TOTALBUDGET', instrumentType:'stock', includeMetrics:true});
  await ready; deadlines[0].controller.abort();
  const quote = await pending;
  assert.equal(quote.priceCents, 10000);
  assert.equal(quote.distributionYieldRate, null);
  assert.equal(quote.annualizedReturnRate, null);
  assert.deepEqual(paths, ['/quote', '/statistics']);
});

test('an exhausted lookup budget never starts a second crypto symbol request', async (t) => {
  let calls = 0;
  const deadlines = timedProvider(t, async (_url, {signal}) => {calls++; return stalled(signal);});
  const rejected = assert.rejects(getQuote({symbol:'TOTALPAIR', instrumentType:'other'}), /timed out/);
  deadlines[0].controller.abort();
  await rejected;
  assert.equal(calls, 1);
});

test('background portfolio metrics release stalled requests and omit upstream diagnostics', async (t) => {
  const {getPortfolioMetrics} = require('../api/lib/twelve-data');
  const deadlines = timedProvider(t, async (_url, {signal}) => stalled(signal));
  const rejected = assert.rejects(getPortfolioMetrics({symbol:'METRICSTIMEOUT', instrumentType:'stock'}), /timed out/);
  deadlines[1].controller.abort();
  await rejected;
  t.mock.method(global, 'fetch', async () => {throw new Error('https://provider.invalid/?apikey=private-value');});
  await assert.rejects(getPortfolioMetrics({symbol:'METRICSERROR', instrumentType:'stock'}), error => {
    assert.match(error.message, /temporarily unavailable/);
    assert.doesNotMatch(error.message, /apikey|private-value/);
    return true;
  });
});
