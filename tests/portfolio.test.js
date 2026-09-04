const assert = require("node:assert/strict");
const test = require("node:test");

const {
  PortfolioValidationError,
  ALLOCATION_CATEGORIES,
  CONTRIBUTION_FREQUENCIES,
  INSTRUMENT_TYPES,
  PERFORMANCE_PERIODS,
  VALUATION_BASES,
  calculateQuotePreviewValueCents,
  calculateAsset,
  normalizeAsset,
  normalizeContributionPlan,
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

test("assets keep an explicit retirement classification with a safe default", () => {
  assert.equal(normalizeAsset(baseAsset).isRetirement, false);
  assert.equal(normalizeAsset({ ...baseAsset, isRetirement: true }).isRetirement, true);
  assert.throws(
    () => normalizeAsset({ ...baseAsset, isRetirement: "true" }),
    /isRetirement must be true or false/,
  );
});

test("portfolio value includes retirement and crypto holdings without classification filtering", () => {
  const summary = summarizePortfolio([
    {
      ...baseAsset,
      id: "retirement-fund",
      shares: 2,
      unitPriceCents: 10_000,
      isRetirement: true,
    },
    {
      ...baseAsset,
      id: "bitcoin",
      instrumentType: "crypto",
      shares: 1,
      unitPriceCents: 30_000,
      isRetirement: false,
    },
  ]);

  assert.equal(summary.totalMarketValueCents, 50_000);
});

test("quick add normalises an optional recurring contribution without saving an orphan cadence", () => {
  assert.deepEqual(normalizeContributionPlan("", "weekly"), {
    contributionCents: null,
    contributionFrequency: null,
  });
  assert.deepEqual(normalizeContributionPlan("100.25", "monthly"), {
    contributionCents: 10_025,
    contributionFrequency: "monthly",
  });
  assert.throws(
    () => normalizeContributionPlan("100.001", "weekly"),
    /whole cents/,
  );
  assert.throws(
    () => normalizeContributionPlan("100", ""),
    /contributionFrequency/,
  );
});

test("quick add calculates a cent-safe quote preview only from valid shares and price", () => {
  assert.equal(calculateQuotePreviewValueCents("417", 71_300), 29_732_100);
  assert.equal(calculateQuotePreviewValueCents("0.125", 6_500_000), 812_500);
  assert.equal(calculateQuotePreviewValueCents("", 71_300), null);
  assert.equal(calculateQuotePreviewValueCents("invalid", 71_300), null);
  assert.equal(calculateQuotePreviewValueCents("417", null), null);
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

  assert.equal(summary.rows[0].estimatedAnnualIncomeCents, 2_728);
  assert.equal(summary.rows[0].distributionYieldRate, 2_728 / 287_123);
  assert.equal(summary.rows[1].estimatedAnnualIncomeCents, 500);
  assert.equal(summary.totalEstimatedAnnualIncomeCents, 3_228);
  assert.equal(summary.distributionYieldRate, 3_228 / 387_123);
});

test("live annualised return and trailing yield use market-value weights and calculate dollar estimates", () => {
  const summary = summarizePortfolio([
    {
      ...baseAsset,
      shares: 10,
      unitPriceCents: 10_000,
      historicalAnnualizedReturnRate: 0.1,
      distributionYieldRate: null,
      providerDistributionYieldRate: 0.02,
    },
    {
      id: "income-fund",
      symbol: "BND",
      assetType: "Bonds",
      valuationBasis: VALUATION_BASES.SHARES_AND_PRICE,
      shares: 30,
      unitPriceCents: 10_000,
      historicalAnnualizedReturnRate: -0.05,
      providerDistributionYieldRate: 0.04,
      dividendPolicy: "reinvest",
    },
    {
      id: "bitcoin",
      symbol: "BTC",
      assetType: "Crypto",
      instrumentType: "crypto",
      valuationBasis: VALUATION_BASES.SHARES_AND_PRICE,
      shares: 60,
      unitPriceCents: 10_000,
      historicalAnnualizedReturnRate: 0.2,
      dividendPolicy: "hold-cash",
    },
  ]);

  assert.equal(summary.totalMarketValueCents, 1_000_000);
  assert.equal(summary.totalEstimatedAnnualGrowthCents, 115_000);
  assert.equal(summary.estimatedAnnualGrowthRate, 0.115);
  assert.equal(summary.totalEstimatedAnnualIncomeCents, 14_000);
  assert.equal(summary.distributionYieldRate, 0.014);
});

test("manual distribution yield overrides live provider yield", () => {
  const summary = summarizePortfolio([{
    ...baseAsset,
    shares: 10,
    unitPriceCents: 10_000,
    distributionYieldRate: 0.01,
    providerDistributionYieldRate: 0.04,
    historicalAnnualizedReturnRate: 0.08,
  }]);

  assert.equal(summary.totalEstimatedAnnualIncomeCents, 1_000);
  assert.equal(summary.distributionYieldRate, 0.01);
});

test("live annual metric summaries stay unavailable until every valued holding has coverage", () => {
  const summary = summarizePortfolio([
    { ...baseAsset, historicalAnnualizedReturnRate: 0.08, distributionYieldRate: null, providerDistributionYieldRate: 0.01 },
    {
      id: "uncovered",
      symbol: "MISSING",
      assetType: "Other",
      valuationBasis: VALUATION_BASES.SHARES_AND_PRICE,
      shares: 10,
      unitPriceCents: 10_000,
      dividendPolicy: "reinvest",
    },
  ]);

  assert.equal(summary.totalEstimatedAnnualGrowthCents, null);
  assert.equal(summary.estimatedAnnualGrowthRate, null);
  assert.equal(summary.totalEstimatedAnnualIncomeCents, null);
  assert.equal(summary.distributionYieldRate, null);
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

  assert.deepEqual(Object.keys(PERFORMANCE_PERIODS), ["3m", "6m", "1y", "all"]);
  assert.equal(all.changeCents, 50_000);
  assert.equal(all.changeRate, 0.5);
  assert.equal(all.startDate, "2025-01-01");
  assert.equal(all.endDate, "2026-09-01");
  assert.equal(all.latestValueCents, 150_000);
  assert.deepEqual(performanceSnapshots(snapshots, "3m").map((snapshot) => snapshot.snapshotDate), ["2026-06-01", "2026-09-01"]);
  assert.equal(threeMonths.changeCents, 15_000);
  assert.ok(Math.abs(threeMonths.changeRate - (150_000 / 135_000 - 1)) < Number.EPSILON);
  assert.equal(threeMonths.startDate, "2026-06-01");
  assert.equal(threeMonths.endDate, "2026-09-01");
  assert.equal(threeMonths.latestValueCents, 150_000);
});

test("performance returns stay unavailable until a range has two authentic snapshots", () => {
  const performance = summarizePerformance([{ snapshot_date: "2026-09-01", total_value_cents: 150_000 }], "all");

  assert.equal(performance.changeCents, null);
  assert.equal(performance.changeRate, null);
  assert.equal(performance.startDate, "2026-09-01");
  assert.equal(performance.endDate, "2026-09-01");
  assert.equal(performance.latestValueCents, 150_000);
});

test("performance context stays explicitly unavailable when no authentic snapshots exist", () => {
  assert.deepEqual(summarizePerformance([], "6m"), {
    snapshots: [],
    startDate: null,
    endDate: null,
    latestValueCents: null,
    changeCents: null,
    changeRate: null,
  });
});
