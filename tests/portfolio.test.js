const assert = require("node:assert/strict");
const test = require("node:test");

const {
  PortfolioValidationError,
  ALLOCATION_CATEGORIES,
  CONTRIBUTION_FREQUENCIES,
  INSTRUMENT_TYPES,
  VALUATION_BASES,
  calculateAsset,
  normalizeAsset,
  summarizePortfolio,
} = require("../portfolio");

const baseAsset = {
  id: "total-market",
  symbol: "VTI",
  assetType: "US equity",
  valuationBasis: VALUATION_BASES.SHARES_AND_PRICE,
  shares: 10.5,
  unitPriceCents: 27_345,
  expectedAnnualReturnRate: 0.08,
  distributionYieldRate: 0.013,
  targetAllocationRate: 0.6,
  weeklyContributionRate: 0.6,
  dividendPolicy: "reinvest",
  capitalGainsPolicy: "transfer-to-fund",
};

test("shares-and-price assets calculate their market value from the canonical cent price", () => {
  const asset = normalizeAsset(baseAsset);
  const row = calculateAsset(asset, 1_000_000, 50_000);

  assert.equal(row.marketValueCents, 287_123);
  assert.equal(row.expectedAnnualGrowthCents, 22_970);
  assert.equal(row.estimatedAnnualIncomeCents, 3_733);
  assert.equal(row.weeklyContributionCents, 30_000);
});

test("manual-value assets retain their declared value without a fabricated share price", () => {
  const asset = normalizeAsset({
    id: "cash",
    name: "Cash reserve",
    assetType: "Cash fund",
    valuationBasis: VALUATION_BASES.MANUAL_VALUE,
    manualValueCents: 250_000,
    targetAllocationRate: 0.1,
    weeklyContributionRate: 0.1,
    dividendPolicy: "transfer-to-bank",
  });

  assert.equal(asset.manualValueCents, 250_000);
  assert.equal(asset.shares, null);
  assert.equal(asset.unitPriceCents, null);
});

test("a quoted fund retains its instrument, allocation, quote source, and prior close", () => {
  const asset = normalizeAsset({
    ...baseAsset,
    instrumentType: "mutual-fund",
    allocationCategory: "domestic-equity",
    quoteSource: "Twelve Data",
    quoteAsOf: "2026-08-30T20:00:00Z",
    priorCloseCents: 27_000,
  });
  const row = calculateAsset(asset, 1_000_000, 0);

  assert.equal(asset.instrumentType, "mutual-fund");
  assert.equal(asset.allocationCategory, "domestic-equity");
  assert.equal(asset.quoteSource, "Twelve Data");
  assert.equal(row.dayChangeCents, 3_623);
  assert.equal(INSTRUMENT_TYPES.includes("crypto"), true);
  assert.equal(ALLOCATION_CATEGORIES.includes("bonds"), true);
});

test("an asset cannot silently use a manual value and shares-and-price at once", () => {
  assert.throws(
    () => normalizeAsset({ ...baseAsset, manualValueCents: 287_000 }),
    PortfolioValidationError,
  );
});

test("a custom dividend or capital-gains policy requires its instruction", () => {
  assert.throws(
    () => normalizeAsset({ ...baseAsset, dividendPolicy: "custom" }),
    /customPolicyNote is required/,
  );
});

test("an asset keeps a dollar contribution distinct from weekly allocation", () => {
  const asset = normalizeAsset({
    ...baseAsset,
    contributionCents: 10_000,
    contributionFrequency: "monthly",
  });

  assert.equal(asset.contributionCents, 10_000);
  assert.equal(asset.contributionFrequency, "monthly");
  assert.equal(asset.weeklyContributionRate, 0.6);
  assert.equal(CONTRIBUTION_FREQUENCIES.includes("weekly"), true);
  assert.throws(
    () => normalizeAsset({ ...baseAsset, contributionCents: 10_000 }),
    /contributionFrequency is required/,
  );
});

test("portfolio summaries calculate allocation, income, contribution, and complete day movement", () => {
  const summary = summarizePortfolio(
    [
      { ...baseAsset, previousValueCents: 280_000 },
      {
        id: "bond-fund",
        symbol: "BND",
        assetType: "Bonds",
        valuationBasis: VALUATION_BASES.MANUAL_VALUE,
        manualValueCents: 200_000,
        previousValueCents: 202_000,
        expectedAnnualReturnRate: 0.04,
        distributionYieldRate: 0.04,
        targetAllocationRate: 0.4,
        weeklyContributionRate: 0.4,
        dividendPolicy: "transfer-to-bank",
      },
    ],
    { weeklyContributionCents: 50_000 },
  );

  assert.equal(summary.totalMarketValueCents, 487_123);
  assert.equal(summary.rows[0].allocationRate, 287_123 / 487_123);
  assert.equal(summary.totalEstimatedAnnualIncomeCents, 11_733);
  assert.equal(summary.totalWeeklyContributionCents, 50_000);
  assert.equal(summary.dayChangeCoverage, "complete");
  assert.equal(summary.totalDayChangeCents, 5_123);
  assert.equal(summary.targetAllocationRate, 1);
  assert.deepEqual(summary.warnings, []);
});

test("portfolio summaries with incomplete baseline values do not invent a day change", () => {
  const summary = summarizePortfolio([
    { ...baseAsset, previousValueCents: 280_000 },
    {
      id: "cash",
      name: "Cash reserve",
      assetType: "Cash",
      valuationBasis: VALUATION_BASES.MANUAL_VALUE,
      manualValueCents: 100_000,
    },
  ]);

  assert.equal(summary.dayChangeCoverage, "unavailable");
  assert.equal(summary.totalDayChangeCents, null);
  assert.equal(summary.totalDayChangeRate, null);
  assert.deepEqual(summary.warnings, [
    "Some assets do not have a target allocation.",
    "Some assets do not have a weekly contribution allocation.",
  ]);
});

test("an empty portfolio has no invented allocations or day baseline", () => {
  const summary = summarizePortfolio([], { weeklyContributionCents: 50_000 });

  assert.equal(summary.totalMarketValueCents, 0);
  assert.equal(summary.dayChangeCoverage, "unavailable");
  assert.equal(summary.targetAllocationRate, null);
  assert.equal(summary.weeklyContributionRate, null);
  assert.deepEqual(summary.warnings, [
    "Some assets do not have a target allocation.",
    "Some assets do not have a weekly contribution allocation.",
  ]);
});
