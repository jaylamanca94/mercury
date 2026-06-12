const assert = require("node:assert/strict");

const {
  _internals: { buildMarketIndicator, buildSourceAudit, classifyFreshness, summarizeSourceHealth },
} = require("./market-snapshot");

const dailySeries = {
  cadence: "Daily close",
  delayedAfterDays: 4,
  staleAfterDays: 8,
};

assert.equal(
  classifyFreshness("2026-06-10", "2026-06-12T12:00:00.000Z", dailySeries).freshnessStatus,
  "Current market data",
);

assert.equal(
  classifyFreshness("2026-06-04", "2026-06-12T12:00:00.000Z", dailySeries).freshnessStatus,
  "Delayed market data",
);

assert.equal(
  classifyFreshness("2026-05-29", "2026-06-12T12:00:00.000Z", dailySeries).freshnessStatus,
  "Stale market data",
);

assert.equal(
  summarizeSourceHealth(
    [
      { freshnessStatus: "Current market data" },
      { freshnessStatus: "Current market data" },
      { freshnessStatus: "Current market data" },
    ],
    [{ id: "international" }],
  ).status,
  "partial",
);

assert.equal(summarizeSourceHealth([], [{ id: "us-markets" }]).status, "unavailable");

const sourceAudit = buildSourceAudit(
  [
    { releaseDate: "2026-06-10" },
    { releaseDate: "2026-06-08" },
    { releaseDate: "2026-06-11" },
  ],
  [{ id: "international", reason: "No source selected" }],
);

assert.deepEqual(sourceAudit.coverage, {
  area: "Market Pulse",
  loaded: 3,
  total: 4,
  unavailable: 1,
});
assert.deepEqual(sourceAudit.releaseRange, {
  earliest: "2026-06-08",
  latest: "2026-06-11",
});
assert.equal(sourceAudit.gaps[0].id, "international");

const marketIndicator = buildMarketIndicator(
  {
    id: "us-markets",
    name: "U.S. markets",
    context: "S&P 500 close",
    icon: "fa-chart-line",
    seriesId: "SP500",
    source: "FRED: S&P 500",
    cadence: "Daily close",
    valueKind: "index",
    decimals: 2,
    delayedAfterDays: 4,
    staleAfterDays: 8,
  },
  [
    { date: "2026-06-08", value: 1000 },
    { date: "2026-06-09", value: 1010 },
    { date: "2026-06-10", value: 1025.15 },
  ],
  "2026-06-12T12:00:00.000Z",
);

assert.equal(marketIndicator.releaseDate, "2026-06-10");
assert.equal(marketIndicator.previousReleaseDate, "2026-06-09");
assert.equal(marketIndicator.value, "1,025.15");
assert.equal(marketIndicator.previous, "1,010.00");
assert.equal(marketIndicator.change, "+1.5%");
assert.equal(marketIndicator.sourceStatus, "Source-backed");

const yieldIndicator = buildMarketIndicator(
  {
    id: "bonds",
    name: "10-year yield",
    context: "Treasury rate",
    icon: "fa-scale-balanced",
    seriesId: "DGS10",
    source: "FRED: 10-Year Treasury Constant Maturity Rate",
    cadence: "Daily release",
    valueKind: "rate",
    decimals: 2,
    delayedAfterDays: 4,
    staleAfterDays: 8,
  },
  [
    { date: "2026-06-08", value: 4.47 },
    { date: "2026-06-09", value: 4.53 },
    { date: "2026-06-10", value: 4.55 },
  ],
  "2026-06-12T12:00:00.000Z",
);

assert.equal(yieldIndicator.value, "4.55%");
assert.equal(yieldIndicator.previous, "4.53%");
assert.equal(yieldIndicator.change, "+0.02 pts");
