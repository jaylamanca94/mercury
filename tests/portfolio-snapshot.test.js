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
