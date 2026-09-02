const assert = require("node:assert/strict");
const test = require("node:test");

const {
  PortfolioValidationError,
  ALLOCATION_CATEGORIES,
  CONTRIBUTION_FREQUENCIES,
  INSTRUMENT_TYPES,
  PERFORMANCE_PERIODS,
  VALUATION_BASES,
  calculateAsset,
  normalizeAsset,
  performanceSnapshots,
  summarizeAllocationTargets,
  summarizePortfolio,
  summarizePerformance,
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
  assert.equal(summary.totalExpectedAnnualGrowthCents, 30_970);
  assert.ok(Math.abs(summary.expectedAnnualReturnRate - (30_970 / 487_123)) < Number.EPSILON);
  assert.equal(summary.totalWeeklyContributionCents, 50_000);
  assert.equal(summary.dayChangeCoverage, "complete");
  assert.equal(summary.totalDayChangeCents, 5_123);
  assert.equal(summary.targetAllocationRate, 1);
  assert.deepEqual(summary.warnings, []);
});

test("provider dividend data calculates asset and portfolio distribution yields", () => {
  const summary = summarizePortfolio([
    {
      ...baseAsset,
      distributionYieldRate: null,
      annualDividendCents: 120,
      providerDistributionYieldRate: 0.0095,
    },
    {
      id: "provider-income-fund",
      symbol: "BND",
      assetType: "Bonds",
      valuationBasis: VALUATION_BASES.SHARES_AND_PRICE,
      shares: 10,
      unitPriceCents: 10_000,
      annualDividendCents: 50,
      dividendPolicy: "reinvest",
    },
  ]);

  assert.equal(summary.rows[0].estimatedAnnualIncomeCents, 1_260);
  assert.equal(summary.rows[0].distributionYieldRate, 1_260 / 287_123);
  assert.equal(summary.rows[1].estimatedAnnualIncomeCents, 500);
  assert.equal(summary.totalEstimatedAnnualIncomeCents, 1_760);
  assert.equal(summary.distributionYieldRate, 1_760 / 387_123);
});

test("portfolio income stays unavailable when a valued holding has neither provider nor manual data", () => {
  const summary = summarizePortfolio([
    { ...baseAsset, distributionYieldRate: null, annualDividendCents: 100 },
    {
      id: "unknown-income",
      name: "Unknown income",
      assetType: "Other",
      valuationBasis: VALUATION_BASES.MANUAL_VALUE,
      manualValueCents: 100_000,
    },
  ]);

  assert.equal(summary.totalEstimatedAnnualIncomeCents, null);
  assert.equal(summary.distributionYieldRate, null);
});

test("expected annual return stays unavailable until every valued holding has an assumption", () => {
  const summary = summarizePortfolio([
    baseAsset,
    {
      id: "unmodelled-cash",
      name: "Cash reserve",
      assetType: "Cash",
      valuationBasis: VALUATION_BASES.MANUAL_VALUE,
      manualValueCents: 100_000,
    },
  ]);

  assert.equal(summary.totalExpectedAnnualGrowthCents, null);
  assert.equal(summary.expectedAnnualReturnRate, null);
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

test("target status uses only valued holdings and flags a two-point allocation variance", () => {
  const summary = summarizePortfolio([
    { ...baseAsset, targetAllocationRate: 0.5, weeklyContributionRate: 0.5 },
    {
      id: "cash",
      name: "Cash reserve",
      assetType: "Cash",
      valuationBasis: VALUATION_BASES.MANUAL_VALUE,
      manualValueCents: 100_000,
      targetAllocationRate: null,
      weeklyContributionRate: 0.5,
    },
  ]);
  const targetStatus = summarizeAllocationTargets(summary.rows, 0.02);

  assert.equal(targetStatus.valuedCount, 2);
  assert.equal(targetStatus.configuredCount, 1);
  assert.equal(targetStatus.attentionCount, 1);
  assert.equal(targetStatus.complete, false);
  assert.equal(targetStatus.allClear, false);
});

test("complete targets within two points produce an all-clear status", () => {
  const rows = [
    { marketValueCents: 60_000, allocationRate: 0.6, targetVarianceRate: 0.01, asset: { targetAllocationRate: 0.59 } },
    { marketValueCents: 40_000, allocationRate: 0.4, targetVarianceRate: -0.01, asset: { targetAllocationRate: 0.41 } },
  ];

  assert.deepEqual(summarizeAllocationTargets(rows), {
    valuedCount: 2,
    configuredCount: 2,
    attentionCount: 0,
    complete: true,
    allClear: true,
  });
});

test("performance periods use only persisted daily snapshots and calculate an authentic range return", () => {
  const snapshots = [
    { snapshot_date: "2025-01-01", total_value_cents: 100_000 },
    { snapshot_date: "2026-03-01", total_value_cents: 120_000 },
    { snapshot_date: "2026-06-01", total_value_cents: 135_000 },
    { snapshot_date: "2026-09-01", total_value_cents: 150_000 },
  ];
  const all = summarizePerformance(snapshots);
  const threeMonths = summarizePerformance(snapshots, "3m");

  assert.deepEqual(Object.keys(PERFORMANCE_PERIODS), ["all", "1y", "6m", "3m"]);
  assert.equal(all.changeCents, 50_000);
  assert.equal(all.changeRate, 0.5);
  assert.deepEqual(performanceSnapshots(snapshots, "3m").map((snapshot) => snapshot.snapshotDate), ["2026-06-01", "2026-09-01"]);
  assert.equal(threeMonths.changeCents, 15_000);
  assert.ok(Math.abs(threeMonths.changeRate - (150_000 / 135_000 - 1)) < Number.EPSILON);
});

test("performance returns stay unavailable until a range has two authentic snapshots", () => {
  const performance = summarizePerformance([{ snapshot_date: "2026-09-01", total_value_cents: 150_000 }], "all");

  assert.equal(performance.changeCents, null);
  assert.equal(performance.changeRate, null);
});
