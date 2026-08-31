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
