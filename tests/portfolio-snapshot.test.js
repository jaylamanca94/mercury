const assert = require("node:assert/strict");
const test = require("node:test");
const { _internals } = require("../api/portfolio/snapshot");

test("uses the New York calendar date rather than the server's UTC date", () => {
  assert.equal(_internals.newYorkDate(new Date("2026-08-31T02:30:00.000Z")), "2026-08-30");
});

test("takes a snapshot only after the New York market close", () => {
  assert.equal(_internals.isAfterMarketClose(new Date("2026-08-30T19:59:00.000Z")), false);
  assert.equal(_internals.isAfterMarketClose(new Date("2026-08-30T20:01:00.000Z")), true);
});

test("calculates one account snapshot from the latest quote or an explicit manual value", () => {
  const total = _internals.totalValueCents(
    [
      { id: "etf", valuation_basis: "shares-and-price", shares: 10, manual_price_cents: null },
      { id: "cash", valuation_basis: "manual-value", manual_value_cents: 250000 },
    ],
    [{ holding_id: "etf", price_cents: 12625, as_of: "2026-08-30T20:00:00.000Z" }],
  );
  assert.equal(total, 376250);
});

test("snapshot totals reject missing, negative and unsafe values rather than recording partial history", () => {
  for (const holding of [
    { valuation_basis: "shares-and-price", shares: "10", manual_price_cents: null },
    { valuation_basis: "shares-and-price", shares: "-1", manual_price_cents: 100 },
    { valuation_basis: "shares-and-price", shares: null, manual_price_cents: 100 },
    { valuation_basis: "shares-and-price", shares: "Infinity", manual_price_cents: 100 },
    { valuation_basis: "manual-value", manual_value_cents: null },
    { valuation_basis: "manual-value", manual_value_cents: -1 },
    { valuation_basis: "manual-value", manual_value_cents: Number.MAX_SAFE_INTEGER + 1 },
  ]) assert.throws(() => _internals.totalValueCents([holding], []), /missing or invalid valuation/);
  assert.throws(() => _internals.totalValueCents([
    { valuation_basis: "manual-value", manual_value_cents: Number.MAX_SAFE_INTEGER },
    { valuation_basis: "manual-value", manual_value_cents: 1 },
  ], []), /missing or invalid valuation/);
});

test("snapshot totals preserve explicit zero, empty accounts and fractional manual-price values", () => {
  assert.equal(_internals.totalValueCents([], []), 0);
  assert.equal(_internals.totalValueCents([{ valuation_basis: "manual-value", manual_value_cents: 0 }], []), 0);
  assert.equal(_internals.totalValueCents([{ valuation_basis: "shares-and-price", shares: "1.5", manual_price_cents: 101 }], []), 152);
});

test('property snapshot equity subtracts debt and rejects incomplete or unsafe coverage', () => {
  const equity = _internals.propertyEquityCents;
  assert.equal(equity([]),0);
  assert.equal(equity([{current_value_cents:50000000,mortgage_balance_cents:30000000},{current_value_cents:100,mortgage_balance_cents:200}]),19999900);
  for(const value of [null,undefined,-1,Number.MAX_SAFE_INTEGER+1]) assert.throws(()=>equity([{current_value_cents:value,mortgage_balance_cents:0}]),/property/);
  assert.throws(()=>equity([{current_value_cents:100,mortgage_balance_cents:null}]),/property/);
  assert.throws(()=>equity([{current_value_cents:Number.MAX_SAFE_INTEGER,mortgage_balance_cents:0},{current_value_cents:1,mortgage_balance_cents:0}]),/property/);
});

test('snapshot writes both components together and never overwrites history after failed property reads', async t => {
  let written, failProperties=false;
  t.mock.method(global,'fetch',async(url,options)=>{
    const table=new URL(url).pathname.split('/').at(-1);
    if(options.method==='POST'){written=JSON.parse(options.body)[0];return new Response(JSON.stringify([written]),{status:200})}
    if(table==='home_properties'&&failProperties) return new Response('{}',{status:503});
    const data=table==='holdings'?[{id:'a',valuation_basis:'manual-value',manual_value_cents:1000000}]
      :table==='home_properties'?[{id:'p',current_value_cents:500000,mortgage_balance_cents:300000}]:[];
    return new Response(JSON.stringify(data),{status:200,headers:{'content-range':data.length?`0-${data.length-1}/${data.length}`:'*/0'}});
  });
  const original=process.env.SUPABASE_URL;process.env.SUPABASE_URL='https://example.invalid';
  try {
    await _internals.recordAccountSnapshot({id:'account'});
    assert.equal(written.total_value_cents,1000000);assert.equal(written.property_equity_cents,200000);
    written=null;failProperties=true;
    await assert.rejects(_internals.recordAccountSnapshot({id:'account'}),/storage/);assert.equal(written,null);
  } finally {if(original===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=original}
});
