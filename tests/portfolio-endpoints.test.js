const assert = require("node:assert/strict");
const test = require("node:test");
const snapshot = require("../api/portfolio/snapshot");
const quotes = require("../api/portfolio/quotes");
const { currentUser } = require("../api/lib/portfolio-auth");

const ownerId = "11111111-1111-4111-8111-111111111111";
const accountId = "22222222-2222-4222-8222-222222222222";
function setup(t, fetcher) {
  const names = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET"];
  const previous = names.map((name) => process.env[name]);
  Object.assign(process.env, { SUPABASE_URL: "https://test.invalid", SUPABASE_ANON_KEY: "test-anon", SUPABASE_SERVICE_ROLE_KEY: "test-service" });
  delete process.env.CRON_SECRET;
  t.mock.method(global, "fetch", fetcher);
  t.after(() => names.forEach((name, index) => {
    if (previous[index] === undefined) delete process.env[name];
    else process.env[name] = previous[index];
  }));
}
function response() {
  return { headers: {}, setHeader(name, value) { this.headers[name] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
function json(body, status = 200) { return { ok: status < 400, status, headers: { get: () => Array.isArray(body) ? `0-${body.length-1}/${body.length}` : null }, json: async () => body }; }
function request(authorization = "Bearer owner-token") { return { method: "GET", headers: { authorization }, query: { symbol: "VT" } }; }

test("an unset or empty cron secret never authorises a service-role snapshot", async (t) => {
  const calls = [];
  setup(t, async (url) => { calls.push(url); return json({}, 401); });
  for (const secret of [undefined, "", " "]) {
    if (secret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = secret;
    const result = response();
    await snapshot(request(`Bearer ${secret}`), result);
    assert.equal(result.code, 401);
  }
  assert.ok(calls.every((url) => url.endsWith("/auth/v1/user")));
});

test("both protected endpoints return retryable JSON when authentication fails", async (t) => {
  setup(t, async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    throw new Error("private upstream diagnostic");
  });
  for (const handler of [quotes, snapshot]) {
    const result = response();
    await handler(request(), result);
    assert.equal(result.code, 503);
    assert.match(result.body.error, /Authentication is temporarily unavailable/);
    assert.doesNotMatch(JSON.stringify(result.body), /private upstream/);
  }
});

test("authentication distinguishes rejected sessions from upstream outages and invalid identities", async (t) => {
  let upstream = json({}, 401);
  setup(t, async () => upstream);
  assert.equal(await currentUser(request()), null);
  upstream = json({}, 503);
  await assert.rejects(currentUser(request()), /temporarily unavailable/);
  for (const body of [{}, { id: "owner&select=*" }, null]) {
    upstream = json(body);
    assert.equal(await currentUser(request()), null);
  }
  upstream = json({ id: ownerId });
  assert.equal((await currentUser(request())).id, ownerId);
});

test("protected quote recovery rejects undated prices and caches only the corrected provider time", async (t) => {
  const oldKey = process.env.TWELVE_DATA_API_KEY;
  process.env.TWELVE_DATA_API_KEY = "test-key";
  t.after(() => {
    if (oldKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = oldKey;
  });
  let providerCalls = 0;
  let payload = { close: "100" };
  setup(t, async (url) => {
    if (String(url).endsWith("/auth/v1/user")) return json({ id: ownerId });
    assert.equal(new URL(url).pathname, "/quote");
    providerCalls++;
    return json(payload);
  });
  const req = { ...request(), query: { symbol: "TIMECHECK/USD", instrumentType: "crypto" } };
  const missing = response();
  await quotes(req, missing);
  assert.equal(missing.code, 422);
  assert.match(missing.body.error, /no usable quote time/);
  payload = { close: "100", datetime: "2026-09-01", last_quote_at: 1788292800 };
  const retried = response();
  await quotes(req, retried);
  assert.equal(retried.code, 200);
  assert.equal(retried.body.asOf, "2026-09-01T20:00:00.000Z");
  const cached = response();
  await quotes(req, cached);
  assert.equal(cached.body.asOf, retried.body.asOf);
  assert.equal(providerCalls, 2);
});

test("incomplete valuations leave existing daily history untouched", async (t) => {
  const writes = [];
  setup(t, async (url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    if (url.endsWith("/auth/v1/user")) return json({ id: ownerId });
    if (options.method === "POST") { writes.push(options.body); return json([]); }
    if (url.includes("/accounts?")) {
      assert.match(url, new RegExp(`user_id=eq.${ownerId}`));
      return json([{ id: accountId, user_id: ownerId }]);
    }
    if (url.includes("/holdings?")) return json([{ id: "unpriced", valuation_basis: "shares-and-price", shares: "10", manual_price_cents: null }]);
    return json([]);
  });
  const result = response();
  await snapshot(request(), result);
  assert.equal(result.code, 503);
  assert.match(result.body.error, /missing or invalid valuation/);
  assert.deepEqual(writes, []);
});

test("owner snapshots use their account filter and upsert a complete cent-safe value", async (t) => {
  const writes = [];
  setup(t, async (url, options) => {
    if (url.endsWith("/auth/v1/user")) return json({ id: ownerId });
    if (url.includes("/accounts?")) {
      assert.match(url, new RegExp(`user_id=eq.${ownerId}`));
      return json([{ id: accountId, user_id: ownerId }]);
    }
    if (url.includes("/holdings?")) return json([
      { id: "manual", valuation_basis: "manual-value", manual_value_cents: 2500 },
      { id: "quoted", valuation_basis: "shares-and-price", shares: "1.5", manual_price_cents: null },
    ]);
    if (url.includes("/holding_quotes?")) return json([{ id: "quote", holding_id: "quoted", price_cents: 101, as_of: "2026-09-07T20:00:00Z" }]);
    assert.match(url, /portfolio_snapshots\?on_conflict=account_id,snapshot_date/);
    assert.equal(options.method, "POST");
    const body = JSON.parse(options.body);
    writes.push(body);
    return json(body);
  });
  const result = response();
  await snapshot(request(), result);
  assert.equal(result.code, 200);
  assert.equal(writes.length, 1);
  assert.equal(writes[0][0].total_value_cents, 2652);
  assert.equal(writes[0][0].account_id, accountId);
});

test("configured cron requests retain the scheduled close gate without user authentication", async (t) => {
  setup(t, async (url) => {
    assert.doesNotMatch(url, /auth\/v1\/user/);
    assert.doesNotMatch(url, /user_id=eq/);
    return json([]);
  });
  process.env.CRON_SECRET = "test-cron";
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-09-07T19:00:00Z") });
  const beforeClose = response();
  await snapshot(request("Bearer test-cron"), beforeClose);
  assert.equal(beforeClose.code, 202);
  assert.equal(beforeClose.body.skipped, true);
  t.mock.timers.setTime(new Date("2026-09-07T21:00:00Z").getTime());
  const afterClose = response();
  await snapshot(request("Bearer test-cron"), afterClose);
  assert.equal(afterClose.code, 200);
});

test("snapshots read every quote page and use the newest quote beyond the API cap", async t => {
  const writes=[], pages=[];
  const history=Array.from({length:1001},(_,i)=>({id:'quote-'+i,holding_id:'asset',price_cents:100+i,as_of:new Date(Date.UTC(2023,0,1+i)).toISOString()}));
  setup(t,async (url,options)=>{
    if(url.endsWith('/auth/v1/user'))return json({id:ownerId});
    if(url.includes('/accounts?'))return json([{id:accountId}]);
    if(url.includes('/holdings?'))return json([{id:'asset',valuation_basis:'shares-and-price',shares:2}]);
    if(url.includes('/holding_quotes?')) {
      assert.match(url,new RegExp(`holdings.account_id=eq.${accountId}`));
      assert.match(url,/holdings!inner\(account_id\)/);
      assert.match(url,/order=id.asc/);
      assert.equal(options.headers.Prefer,'count=exact');
      const from=Number(new URL(url).searchParams.get('offset'));pages.push(from);
      const body=history.slice(from,from+500);
      return {...json(body),headers:{get:()=>`${from}-${from+body.length-1}/${history.length}`}};
    }
    writes.push(JSON.parse(options.body));return json(writes.at(-1));
  });
  const result=response();await snapshot(request(),result);
  assert.equal(result.code,200);
  assert.deepEqual(pages,[0,500,1000]);
  assert.equal(writes[0][0].total_value_cents,2200);
});

test("truncated or changing snapshot reads never write partial daily history",async t=>{
  let malformed=false;const writes=[];
  setup(t,async(url,options)=>{
    if(url.endsWith('/auth/v1/user'))return json({id:ownerId});
    if(options.method==='POST'){writes.push(url);return json([]);}
    if(url.includes('/accounts?'))return json([{id:accountId}]);
    const from=Number(new URL(url).searchParams.get('offset'));
    const body=from?[]:[{id:'asset',valuation_basis:'manual-value',manual_value_cents:500}];
    return {...json(body),headers:{get:()=>malformed?null:`0-0/2`}};
  });
  for(malformed of [false,true]) {
    const result=response();await snapshot(request(),result);
    assert.equal(result.code,503);
  }
  assert.deepEqual(writes,[]);
});
