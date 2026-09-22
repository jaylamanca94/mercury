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

const { summarizePortfolioMarketHistory: basket } = require('../market-history');
const basketRow = (id, shares, extra = {}) => ({ asset: { id, shares, instrumentType: 'etf', valuationBasis: 'shares-and-price', ...extra } });
const history = points => ({ currency: 'USD', source: 'Test closes', points });

test('portfolio market change holds current units constant and weights the starting market value', () => {
  const rows = [basketRow('a', 2), basketRow('b', 3)];
  const histories = new Map([['a', history([point(7,100), point(0,110)])], ['b', history([point(7,50), point(0,40)])]]);
  const result = basket(rows, histories, '1w', now);
  assert.equal(result.changeCents, -1000); // +20 and -30 dollars
  assert.equal(result.changeRate, -10 / 350);
  assert.equal(result.startDate, '2026-09-07');assert.equal(result.endDate, '2026-09-14');
  // Account snapshots, cost, current quotes and contributions do not enter price movement.
  const changed = rows.map(row => ({...row, marketValueCents:99999999, deposits:999999, withdrawals:999999}));
  assert.deepEqual(basket(changed, histories, '1w', now), result);
  assert.equal(basket([basketRow('a',4),basketRow('b',6)],histories,'1w',now).changeCents,-2000);
  assert.equal(basket([basketRow('a',4),basketRow('b',6)],histories,'1w',now).changeRate,result.changeRate);
});

test('portfolio market history uses common observed dates across stock and crypto calendars', () => {
  const histories = new Map([
    ['stock',history([point(7,100),point(4,120),point(3,110)])],
    ['coin',history([point(6,20),point(4,30),point(3,40),point(0,90)])],
  ]);
  const result=basket([basketRow('stock',2),basketRow('coin',3)],histories,'1w',now);
  assert.equal(result.startDate,'2026-09-10');assert.equal(result.endDate,'2026-09-11');
  assert.equal(result.changeCents,1000);assert.equal(result.changeRate,10/330);
  histories.set('coin',history([point(2,30),point(0,40)]));
  assert.equal(basket([basketRow('stock',2),basketRow('coin',3)],histories,'1w',now).changeCents,null);
});

test('portfolio totals never silently exclude missing history or unknown share counts', () => {
  const good=history([point(7,100),point(0,110)]);
  for(const bad of [null,history([]),history([point(0,100)]),{...good,currency:'EUR'}]) {
    const result=basket([basketRow('a',2),basketRow('b',1)],new Map([['a',good],['b',bad]]),'1w',now);
    assert.equal(result.changeCents,null);assert.equal(result.changeRate,null);
  }
  for(const shares of [null,undefined,NaN,-1]) assert.equal(basket([basketRow('a',shares)],new Map([['a',good]]),'1w',now).changeCents,null);
  assert.equal(basket([basketRow('a',2,{valuationBasis:'manual-value'})],new Map([['a',good]]),'1w',now).changeCents,null);
  assert.equal(basket([],new Map(),'1w',now).changeRate,null);
});

test('portfolio market totals preserve fractional prices and aggregate before rounding cents', () => {
  const rows=[basketRow('a',15000),basketRow('b',15000)];
  const histories=new Map(rows.map(row=>[row.asset.id,history([point(7,.00001),point(0,.000011)])]));
  const result=basket(rows,histories,'1w',now);
  assert.equal(result.changeCents,3);assert.ok(Math.abs(result.changeRate-.1)<1e-12);
  const flat=basket([basketRow('a',5)],new Map([['a',history([point(7,20),point(0,20)])]]),'1w',now);
  assert.equal(flat.changeCents,0);assert.equal(flat.changeRate,0);
});

test('cash has zero price movement and stays in the portfolio starting-value denominator', () => {
  const cash={asset:{id:'cash',instrumentType:'cash'},marketValueCents:10000};
  const histories=new Map([['a',history([point(7,100),point(0,110)])]]);
  const result=basket([basketRow('a',1),cash],histories,'1w',now);
  assert.equal(result.changeCents,1000);assert.equal(result.changeRate,.05);
  assert.equal(basket([cash],new Map(),'1w',now).changeRate,0);
  assert.equal(basket([{...cash,marketValueCents:null}],new Map(),'1w',now).changeCents,null);
  assert.equal(basket([basketRow('zero',0),cash],new Map(),'1w',now).changeCents,0);
});

test('Home series includes every shared observation and matches value-weighted Portfolio endpoints', () => {
  const rows=[basketRow('large',9),basketRow('small',1)];
  const histories=new Map([
    ['large',history([point(20,100),point(10,110),point(0,120)])],
    ['small',history([point(20,100),point(10,80),point(0,50)])],
  ]);
  const result=basket(rows,histories,'1m',now);
  assert.deepEqual(result.points.map(p=>p.valueCents),[100000,107000,113000]);
  assert.deepEqual(result.points.map(p=>p.changeRate),[0,.07,.13]);
  assert.equal(result.changeRate,result.points.at(-1).changeRate);
  assert.equal(result.changeCents,13000);
  histories.set('small',history([point(20,100),point(0,50)]));
  assert.equal(basket(rows,histories,'1m',now).points.length,2,'never interpolate a missing market date');
});

test('Home 1D uses latest two shared daily observations, including a weekend gap',()=>{
  const rows=[basketRow('stock',1),basketRow('coin',2)];
  const histories=new Map([
    ['stock',history([point(7,50),point(3,100),point(0,110)])],
    ['coin',history([point(7,30),point(3,50),point(1,200),point(0,60)])],
  ]);
  const result=basket(rows,histories,'1d',now);
  assert.deepEqual(result.points.map(p=>p.date),['2026-09-11','2026-09-14']);
  assert.equal(result.changeRate,.15);
  assert.equal(result.changeCents,3000);
  assert.equal(basket(rows,histories,'1d',now+14*day).points.length,0,'old daily data is not a current day change');
});

test('Home longer ranges retain genuine coverage; missing data never produces a partial line',()=>{
  const rows=[basketRow('a',1),basketRow('b',1)];
  const histories=new Map([
    ['a',history([point(2000,10),point(1000,50),point(0,100)])],
    ['b',history([point(1000,20),point(0,40)])],
  ]);
  const result=basket(rows,histories,'5y',now);
  assert.equal(result.points.length,2);assert.equal(result.changeRate,1);
  assert.equal(basket(rows,histories,'1m',now).points.length,0);
  histories.delete('b');assert.equal(basket(rows,histories,'5y',now).points.length,0);
  assert.equal(basket([{asset:{instrumentType:'cash'},marketValueCents:100}],new Map(),'1m',now).points.length,0);
});
