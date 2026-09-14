const assert = require('node:assert/strict');
const test = require('node:test');
const { summarizeMarketHistory } = require('../market-history');
const { _internals: { mapYahooMarketHistory }, getMarketHistory } = require('../api/lib/twelve-data');
const quotes = require('../api/portfolio/quotes');
const now = Date.parse('2026-09-14T21:00:00Z');
const day = 86400000;
const point = (days, price) => ({ time: now - days * day, price });

test('market movement uses unit prices independently of owned shares, cost or distributions', () => {
  const history = { currency: 'USD', points: [point(20, 100), point(0, 90)], shares: 5, purchasePrice: 50, dividends: 100 };
  const result = summarizeMarketHistory(history, '1m', now);
  assert.equal(result.change, -10);
  assert.equal(result.changeRate, -0.1);
  assert.deepEqual(summarizeMarketHistory({ ...history, shares: 200, purchasePrice: 200, dividends: 0 }, '1m', now), result);
});

test('ranges use actual calendar dates, retain fractional prices, deduplicate and reject invalid observations', () => {
  const history = { currency: 'USD', points: [point(0, .00002), point(20, .00001), point(20, .000015), point(40, 5), point(-1, 8), point(2, 0), point(3, null), null] };
  const result = summarizeMarketHistory(history, '1m', now);
  assert.equal(result.points.length, 2);
  assert.equal(result.first.price, .000015);
  assert.equal(result.last.price, .00002);
  assert.equal(summarizeMarketHistory(history, '3m', now).points.length, 3);
  const march = Date.parse('2026-03-31T21:00:00Z');
  assert.equal(summarizeMarketHistory({ currency: 'USD', points: [{ time: Date.parse('2026-02-28T15:00:00Z'), price: 10 }] }, '1m', march).points.length, 1);
});

test('empty, one-point, stale and foreign-currency series do not invent market movement', () => {
  for (const history of [null, { currency: 'EUR', points: [point(0, 20)] }, { currency: 'USD', points: [point(90, 20)] }]) {
    const result = summarizeMarketHistory(history, '1m', now);
    assert.equal(result.points.length, 0);
    assert.equal(result.change, null);
  }
  assert.equal(summarizeMarketHistory({ currency: 'USD', points: [point(0, 20)] }, '1m', now).changeRate, null);
  assert.equal(summarizeMarketHistory({ currency: 'USD', points: [point(20, 20), point(0, 20)] }, '1m', now).change, 0);
});

function payload(currency = 'USD') {
  return { chart: { result: [{ meta: { currency }, timestamp: [(now - day) / 1000, now / 1000, (now + day) / 1000, 'bad'], indicators: { quote: [{ close: [100, 90, 999, null] }], adjclose: [{ adjclose: [10, 50, 999, null] }] } }] } };
}
test('provider mapping uses daily quote closes, never dividend-adjusted values or future data', () => {
  assert.deepEqual(mapYahooMarketHistory(payload(), now), [point(1, 100), point(0, 90)]);
  assert.throws(() => mapYahooMarketHistory(payload('GBP'), now), /USD/);
  assert.throws(() => mapYahooMarketHistory({}, now), /unavailable/);
});

test('history endpoint authenticates before fetching bounded public history and caches only market data', async t => {
  const previous = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY };
  Object.assign(process.env, { SUPABASE_URL: 'https://test.invalid', SUPABASE_ANON_KEY: 'test-key' });
  t.after(() => {
    for (const [name, value] of [['SUPABASE_URL', previous.url], ['SUPABASE_ANON_KEY', previous.key]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  });
  let valid = false, providerCalls = 0;
  t.mock.method(global, 'fetch', async (url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    if (url.includes('/auth/v1/user')) return { ok: valid, status: valid ? 200 : 401, json: async () => ({ id: '11111111-1111-4111-8111-111111111111' }) };
    providerCalls++;
    assert.match(url, /chart\/HISTORYTEST\?range=5y&interval=1d$/);
    assert.equal(options.headers.Authorization, undefined);
    return { ok: true, json: async () => payload() };
  });
  const request = { method: 'GET', headers: { authorization: 'Bearer test-token' }, query: { history: '1', symbol: 'HISTORYTEST', instrumentType: 'etf' } };
  const response = () => ({ headers: {}, setHeader(k,v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
  const rejected = response(); await quotes(request, rejected);
  assert.equal(rejected.code, 401); assert.equal(providerCalls, 0);
  valid = true;
  for (let i = 0; i < 2; i++) {
    const accepted = response(); await quotes(request, accepted);
    assert.equal(accepted.code, 200);
    assert.equal(accepted.headers['Cache-Control'], 'private, no-store');
    assert.equal(accepted.body.currency, 'USD');
  }
  assert.equal(providerCalls, 1);
  await assert.rejects(getMarketHistory({ symbol: ['BAD'] }), /unavailable/);
  await assert.rejects(getMarketHistory({ symbol: 'CASH', instrumentType: 'cash' }), /unavailable/);
  assert.equal(providerCalls, 1);
});

test('Portfolio week and six-month ranges include only the requested daily market observations', () => {
  const history = { currency: 'USD', points: [point(190, 50), point(180, 60), point(8, 70), point(7, 80), point(0, 90)] };
  const week = summarizeMarketHistory(history, '1w', now);
  assert.deepEqual(week.points, [point(7, 80), point(0, 90)]);
  assert.equal(week.change, 10);
  const sixMonths = summarizeMarketHistory(history, '6m', now);
  assert.equal(sixMonths.points.length, 4);
  assert.equal(sixMonths.change, 30);
});
