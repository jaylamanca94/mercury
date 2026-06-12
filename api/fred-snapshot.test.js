const assert = require("node:assert/strict");

const {
  _internals: { buildSeriesIndicator, classifyFreshness, summarizeSourceHealth },
} = require("./fred-snapshot");

const monthlySeries = {
  cadence: "Monthly release",
  delayedAfterDays: 50,
  staleAfterDays: 85,
};

assert.equal(
  classifyFreshness("2026-05-01", "2026-06-10T12:00:00.000Z", monthlySeries).freshnessStatus,
  "Current release",
);

assert.equal(
  classifyFreshness("2026-04-01", "2026-06-10T12:00:00.000Z", monthlySeries).freshnessStatus,
  "Delayed release",
);

assert.equal(
  classifyFreshness("2026-01-01", "2026-06-10T12:00:00.000Z", monthlySeries).freshnessStatus,
  "Stale release",
);

assert.equal(
  summarizeSourceHealth(
    [
      { freshnessStatus: "Current release" },
      { freshnessStatus: "Current release" },
      { freshnessStatus: "Current release" },
      { freshnessStatus: "Current release" },
    ],
    [],
  ).status,
  "ready",
);

assert.equal(
  summarizeSourceHealth([{ freshnessStatus: "Current release" }], [{ id: "inflation" }]).status,
  "partial",
);

assert.equal(summarizeSourceHealth([], [{ id: "inflation" }]).status, "unavailable");

const monthlyIndicator = buildSeriesIndicator(
  {
    id: "unemployment",
    name: "Unemployment",
    context: "Labor market",
    icon: "fa-briefcase",
    seriesId: "UNRATE",
    source: "FRED: Unemployment Rate",
    cadence: "Monthly release",
    valueKind: "latest",
    decimals: 1,
    delayedAfterDays: 50,
    staleAfterDays: 85,
  },
  [
    { date: "2026-03-01", value: 4 },
    { date: "2026-04-01", value: 4.1 },
    { date: "2026-05-01", value: 4.2 },
  ],
  "2026-06-10T12:00:00.000Z",
);

assert.equal(monthlyIndicator.releaseDate, "2026-05-01");
assert.equal(monthlyIndicator.previousReleaseDate, "2026-04-01");
assert.equal(monthlyIndicator.previous, "4.1%");
assert.equal(monthlyIndicator.change, "+0.1 pts");
