const assert = require("node:assert/strict");

const {
  _internals: { buildRiskIndicator, buildSourceAudit, classifyFreshness, summarizeSourceHealth },
} = require("./risk-snapshot");

const dailySeries = {
  cadence: "Daily close",
  delayedAfterDays: 4,
  staleAfterDays: 8,
};

assert.equal(
  classifyFreshness("2026-06-10", "2026-06-12T12:00:00.000Z", dailySeries).freshnessStatus,
  "Current risk data",
);

assert.equal(
  classifyFreshness("2026-06-04", "2026-06-12T12:00:00.000Z", dailySeries).freshnessStatus,
  "Delayed risk data",
);

assert.equal(
  classifyFreshness("2026-05-29", "2026-06-12T12:00:00.000Z", dailySeries).freshnessStatus,
  "Stale risk data",
);

assert.equal(
  summarizeSourceHealth(
    [
      { freshnessStatus: "Current risk data" },
      { freshnessStatus: "Current risk data" },
      { freshnessStatus: "Current risk data" },
    ],
    [],
  ).status,
  "ready",
);

assert.equal(
  summarizeSourceHealth([{ freshnessStatus: "Current risk data" }], [{ id: "gold" }]).status,
  "partial",
);

assert.equal(summarizeSourceHealth([], [{ id: "volatility" }]).status, "unavailable");

const sourceAudit = buildSourceAudit(
  [
    { releaseDate: "2026-06-10" },
    { releaseDate: "2026-06-08" },
  ],
  [{ id: "gold" }],
);

assert.deepEqual(sourceAudit.coverage, {
  area: "Risk and Confidence",
  loaded: 2,
  total: 3,
  unavailable: 1,
});
assert.deepEqual(sourceAudit.releaseRange, {
  earliest: "2026-06-08",
  latest: "2026-06-10",
});

const vixIndicator = buildRiskIndicator(
  {
    id: "volatility",
    name: "Volatility",
    seriesId: "VIXCLS",
    source: "FRED: CBOE Volatility Index",
    cadence: "Daily close",
    valueKind: "index",
    decimals: 2,
    delayedAfterDays: 4,
    staleAfterDays: 8,
  },
  [
    { date: "2026-06-08", value: 18.92 },
    { date: "2026-06-09", value: 19.87 },
    { date: "2026-06-10", value: 22.22 },
  ],
  "2026-06-12T12:00:00.000Z",
);

assert.equal(vixIndicator.releaseDate, "2026-06-10");
assert.equal(vixIndicator.previousReleaseDate, "2026-06-09");
assert.equal(vixIndicator.value, "22.22");
assert.equal(vixIndicator.previous, "19.87");
assert.equal(vixIndicator.trend, "Watch");
assert.equal(vixIndicator.sourceStatus, "Source-backed");
assert.match(vixIndicator.copy, /VIX is 22.22/);

const goldIndicator = buildRiskIndicator(
  {
    id: "gold",
    name: "Gold",
    seriesId: "GOLDAMGBD228NLBM",
    source: "FRED: Gold Fixing Price",
    cadence: "Daily fixing",
    valueKind: "price",
    decimals: 2,
    delayedAfterDays: 9,
    staleAfterDays: 16,
  },
  [
    { date: "2026-06-08", value: 3300 },
    { date: "2026-06-09", value: 3310 },
    { date: "2026-06-10", value: 3350 },
  ],
  "2026-06-12T12:00:00.000Z",
);

assert.equal(goldIndicator.value, "$3,350.00");
assert.equal(goldIndicator.previous, "$3,310.00");
assert.equal(goldIndicator.change, "+1.2%");
assert.equal(goldIndicator.trend, "Rising");
