const assert = require("node:assert/strict");

const {
  _internals: { classifyFreshness, summarizeSourceHealth },
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

