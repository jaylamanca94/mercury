const assert = require("node:assert/strict");
const test = require("node:test");

const {
  YAHOO_HISTORY_OBSERVATIONS,
  YAHOO_HISTORY_RANGE,
  YAHOO_SERIES,
  buildFreshnessSummary,
  buildSummary,
  buildValues,
  classifyReleaseFreshness,
  classifyTrend,
  parseFredCsv,
} = require("../api/live-snapshot")._internals;

test("Yahoo bridge keeps enough market history for five-year dashboard views", () => {
  assert.equal(YAHOO_HISTORY_RANGE, "5y");
  assert.equal(YAHOO_HISTORY_OBSERVATIONS, 1300);
});

test("Yahoo market pulse includes Bitcoin as a supporting market indicator", () => {
  const bitcoin = YAHOO_SERIES.find((series) => series.id === "bitcoin");

  assert.deepEqual(
    {
      context: bitcoin.context,
      symbol: bitcoin.symbol,
      ticker: bitcoin.ticker,
      viewGroup: bitcoin.viewGroup,
      weight: bitcoin.weight,
    },
    {
      context: "BTC/USD spot rate",
      symbol: "BTC-USD",
      ticker: "BTC",
      viewGroup: "currency",
      weight: 0.5,
    },
  );
});

test("parseFredCsv keeps valid rows sorted by date", () => {
  const csv = [
    "observation_date,CPIAUCSL",
    "2025-02-01,321.1",
    "2025-01-01,320.0",
    "2025-03-01,.",
  ].join("\n");

  assert.deepEqual(parseFredCsv(csv), [
    { date: "2025-01-01", value: 320 },
    { date: "2025-02-01", value: 321.1 },
  ]);
});

test("classifyReleaseFreshness uses cadence-aware current, delayed, and stale windows", () => {
  const checkedAt = new Date("2026-06-14T12:00:00Z");

  assert.equal(classifyReleaseFreshness("2026-06-10", "Daily market close", checkedAt).status, "current");
  assert.equal(classifyReleaseFreshness("2026-06-07", "Daily market close", checkedAt).status, "delayed");
  assert.equal(classifyReleaseFreshness("2026-05-01", "Daily market close", checkedAt).status, "stale");
  assert.equal(classifyReleaseFreshness("2025", "Annual release", checkedAt).status, "current");
  assert.equal(classifyReleaseFreshness(null, "Monthly release", checkedAt).status, "unavailable");
});

test("buildFreshnessSummary preserves most important source state", () => {
  assert.equal(
    buildFreshnessSummary([
      { freshness: { status: "current" } },
      { freshness: { status: "unavailable" } },
    ]).status,
    "partial",
  );

  assert.equal(
    buildFreshnessSummary([
      { freshness: { status: "current" } },
      { freshness: { status: "delayed" } },
      { freshness: { status: "unavailable" } },
    ]).status,
    "delayed",
  );

  assert.equal(
    buildFreshnessSummary([
      { freshness: { status: "current" } },
      { freshness: { status: "stale" } },
      { freshness: { status: "delayed" } },
    ]).status,
    "stale",
  );
});

test("buildValues derives year-over-year values only when a prior year exists", () => {
  const observations = Array.from({ length: 14 }, (_, index) => ({
    date: new Date(Date.UTC(2025, index, 1)).toISOString().slice(0, 10),
    value: 100 + index,
  }));

  assert.deepEqual(buildValues(observations, { valueKind: "year-over-year" }), [
    { date: "2026-01-01", value: 12 },
    { date: "2026-02-01", value: 11.881188118811881 },
  ]);
});

test("buildSummary excludes unavailable sections from the condition score", () => {
  const summary = buildSummary({
    marketPulse: [{ sourceStatus: "Source-backed", tone: "up" }],
    economicHealth: [{ sourceStatus: "Unavailable", tone: "up" }],
    riskIndicators: [{ sourceStatus: "Source-backed", tone: "caution" }],
    regions: [],
  });

  assert.equal(summary.score, 58);
  assert.deepEqual(
    summary.drivers.map((driver) => driver.value),
    ["Firm", "Unavailable", "Under pressure", "Unavailable"],
  );
});

test("classifyTrend keeps risk language neutral and non-advisory", () => {
  assert.deepEqual(
    classifyTrend({ trendModel: "financial-stress" }, -0.2, -0.1),
    { trend: "Below average", tone: "up" },
  );
  assert.deepEqual(
    classifyTrend({ trendModel: "volatility" }, 28, 20),
    { trend: "Elevated", tone: "caution" },
  );
});
