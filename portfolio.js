"use strict";

const VALUATION_BASES = Object.freeze({
  MANUAL_VALUE: "manual-value",
  SHARES_AND_PRICE: "shares-and-price",
});

const DISTRIBUTION_POLICIES = Object.freeze([
  "reinvest",
  "transfer-to-bank",
  "transfer-to-fund",
  "hold-cash",
  "custom",
]);

const INSTRUMENT_TYPES = Object.freeze([
  "mutual-fund",
  "etf",
  "stock",
  "crypto",
  "cash",
  "other",
]);

const ALLOCATION_CATEGORIES = Object.freeze([
  "domestic-equity",
  "international-equity",
  "bonds",
  "crypto",
  "cash",
  "other",
]);

const CONTRIBUTION_FREQUENCIES = Object.freeze(["weekly", "monthly"]);
const PERFORMANCE_PERIODS = Object.freeze({
  all: null,
  "1y": { years: 1 },
  "6m": { months: 6 },
  "3m": { months: 3 },
});

class PortfolioValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "PortfolioValidationError";
  }
}

function validationError(field, message) {
  throw new PortfolioValidationError(`${field} ${message}`);
}

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) validationError(field, "is required");
  return value.trim();
}

function optionalText(value, field) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") validationError(field, "must be text");
  return value.trim() || null;
}

function optionalRate(value, field, { minimum = 0, maximum = 1 } = {}) {
  if (value === undefined || value === null || value === "") return null;
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    validationError(field, `must be a decimal between ${minimum} and ${maximum}`);
  }
  return value;
}

function optionalMoney(value, field) {
  if (value === undefined || value === null || value === "") return null;
  if (!Number.isSafeInteger(value) || value < 0) {
    validationError(field, "must be a non-negative whole number of cents");
  }
  return value;
}

function requiredMoney(value, field) {
  const money = optionalMoney(value, field);
  if (money === null) validationError(field, "is required");
  return money;
}

function optionalShares(value) {
  if (value === undefined || value === null || value === "") return null;
  if (!Number.isFinite(value) || value < 0) validationError("shares", "must be a non-negative number");
  return value;
}

function normalizePolicy(value, field) {
  if (value === undefined || value === null || value === "") return null;
  if (!DISTRIBUTION_POLICIES.includes(value)) {
    validationError(field, `must be one of: ${DISTRIBUTION_POLICIES.join(", ")}`);
  }
  return value;
}

function normalizeChoice(value, field, choices, fallback) {
  const normalized = value === undefined || value === null || value === "" ? fallback : value;
  if (!choices.includes(normalized)) validationError(field, `must be one of: ${choices.join(", ")}`);
  return normalized;
}

function optionalDate(value, field) {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) validationError(field, "must be an ISO date or timestamp");
  return date.toISOString();
}

function normalizeAsset(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new PortfolioValidationError("asset must be an object");
  }

  const id = requiredText(input.id, "id");
  const symbol = optionalText(input.symbol, "symbol");
  const name = optionalText(input.name, "name");
  if (!symbol && !name) throw new PortfolioValidationError("symbol or name is required");

  const valuationBasis = input.valuationBasis;
  if (!Object.values(VALUATION_BASES).includes(valuationBasis)) {
    validationError("valuationBasis", "must be manual-value or shares-and-price");
  }

  const asset = {
    id,
    symbol: symbol ? symbol.toUpperCase() : null,
    name,
    assetType: requiredText(input.assetType, "assetType"),
    instrumentType: normalizeChoice(input.instrumentType, "instrumentType", INSTRUMENT_TYPES, "other"),
    allocationCategory: normalizeChoice(
      input.allocationCategory,
      "allocationCategory",
      ALLOCATION_CATEGORIES,
      "other",
    ),
    accountName: optionalText(input.accountName, "accountName"),
    valuationBasis,
    manualValueCents: null,
    shares: null,
    unitPriceCents: null,
    previousValueCents: optionalMoney(input.previousValueCents, "previousValueCents"),
    quoteSource: optionalText(input.quoteSource, "quoteSource"),
    quoteAsOf: optionalDate(input.quoteAsOf, "quoteAsOf"),
    priorCloseCents: optionalMoney(input.priorCloseCents, "priorCloseCents"),
    expectedAnnualReturnRate: optionalRate(input.expectedAnnualReturnRate, "expectedAnnualReturnRate", {
      minimum: -1,
      maximum: 1,
    }),
    distributionYieldRate: optionalRate(input.distributionYieldRate, "distributionYieldRate"),
    targetAllocationRate: optionalRate(input.targetAllocationRate, "targetAllocationRate"),
    weeklyContributionRate: optionalRate(input.weeklyContributionRate, "weeklyContributionRate"),
    contributionCents: optionalMoney(input.contributionCents, "contributionCents"),
    contributionFrequency: input.contributionFrequency === undefined || input.contributionFrequency === null || input.contributionFrequency === ""
      ? null
      : normalizeChoice(input.contributionFrequency, "contributionFrequency", CONTRIBUTION_FREQUENCIES, null),
    dividendPolicy: normalizePolicy(input.dividendPolicy, "dividendPolicy"),
    capitalGainsPolicy: normalizePolicy(input.capitalGainsPolicy, "capitalGainsPolicy"),
    customPolicyNote: optionalText(input.customPolicyNote, "customPolicyNote"),
  };

  if (valuationBasis === VALUATION_BASES.MANUAL_VALUE) {
    asset.manualValueCents = requiredMoney(input.manualValueCents, "manualValueCents");
    if (optionalShares(input.shares) !== null || optionalMoney(input.unitPriceCents, "unitPriceCents") !== null) {
      throw new PortfolioValidationError(
        "manual-value assets cannot also include shares or unitPriceCents; choose one valuation basis",
      );
    }
  } else {
    asset.shares = optionalShares(input.shares);
    if (asset.shares === null) validationError("shares", "is required for shares-and-price valuation");
    asset.unitPriceCents = requiredMoney(input.unitPriceCents, "unitPriceCents");
    if (optionalMoney(input.manualValueCents, "manualValueCents") !== null) {
      throw new PortfolioValidationError(
        "shares-and-price assets cannot also include manualValueCents; choose one valuation basis",
      );
    }
  }

  if (
    (asset.dividendPolicy === "custom" || asset.capitalGainsPolicy === "custom") &&
    !asset.customPolicyNote
  ) {
    validationError("customPolicyNote", "is required when a policy is custom");
  }

  if (asset.contributionCents !== null && asset.contributionFrequency === null) {
    validationError("contributionFrequency", "is required when contributionCents is set");
  }

  if (asset.priorCloseCents !== null && asset.valuationBasis !== VALUATION_BASES.SHARES_AND_PRICE) {
    throw new PortfolioValidationError("priorCloseCents requires shares-and-price valuation");
  }

  return Object.freeze(asset);
}

function marketValueCents(asset) {
  const normalized = normalizeAsset(asset);
  if (normalized.valuationBasis === VALUATION_BASES.MANUAL_VALUE) return normalized.manualValueCents;
  return Math.round(normalized.shares * normalized.unitPriceCents);
}

function calculateAsset(asset, totalPortfolioValueCents, weeklyContributionCents) {
  const normalized = normalizeAsset(asset);
  const totalPortfolioValue = requiredMoney(totalPortfolioValueCents, "totalPortfolioValueCents");
  const weeklyContribution = requiredMoney(weeklyContributionCents, "weeklyContributionCents");
  const valueCents = marketValueCents(normalized);
  const allocationRate = totalPortfolioValue > 0 ? valueCents / totalPortfolioValue : null;
  const targetValueCents =
    normalized.targetAllocationRate === null
      ? null
      : Math.round(totalPortfolioValue * normalized.targetAllocationRate);
  const previousValueCents =
    normalized.previousValueCents ??
    (normalized.priorCloseCents === null || normalized.shares === null
      ? null
      : Math.round(normalized.shares * normalized.priorCloseCents));
  const dayChangeCents = previousValueCents === null ? null : valueCents - previousValueCents;

  return {
    asset: normalized,
    marketValueCents: valueCents,
    allocationRate,
    expectedAnnualGrowthCents:
      normalized.expectedAnnualReturnRate === null
        ? null
        : Math.round(valueCents * normalized.expectedAnnualReturnRate),
    estimatedAnnualIncomeCents:
      normalized.distributionYieldRate === null
        ? null
        : Math.round(valueCents * normalized.distributionYieldRate),
    weeklyContributionCents:
      normalized.weeklyContributionRate === null
        ? null
        : Math.round(weeklyContribution * normalized.weeklyContributionRate),
    dayChangeCents,
    dayChangeRate:
      previousValueCents === null || previousValueCents === 0
        ? null
        : dayChangeCents / previousValueCents,
    targetValueCents,
    targetVarianceCents: targetValueCents === null ? null : valueCents - targetValueCents,
    targetVarianceRate:
      normalized.targetAllocationRate === null || allocationRate === null
        ? null
        : allocationRate - normalized.targetAllocationRate,
  };
}

function allocationTotal(assets, field) {
  return assets.reduce((total, asset) => total + (asset[field] ?? 0), 0);
}

function isCompleteAllocation(assets, field) {
  return assets.every((asset) => asset[field] !== null);
}

function normalizeSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    throw new PortfolioValidationError("snapshot must be an object");
  }
  const snapshotDate = requiredText(snapshot.snapshot_date, "snapshot_date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate) || Number.isNaN(Date.parse(`${snapshotDate}T12:00:00.000Z`))) {
    validationError("snapshot_date", "must be a calendar date");
  }
  const totalValueCents = Number(snapshot.total_value_cents);
  if (!Number.isSafeInteger(totalValueCents) || totalValueCents < 0) {
    validationError("total_value_cents", "must be a non-negative whole number of cents");
  }
  return { snapshotDate, totalValueCents };
}

function performanceSnapshots(snapshots, period = "all") {
  if (!Array.isArray(snapshots)) throw new PortfolioValidationError("snapshots must be an array");
  if (!Object.hasOwn(PERFORMANCE_PERIODS, period)) {
    validationError("period", `must be one of: ${Object.keys(PERFORMANCE_PERIODS).join(", ")}`);
  }
  const normalized = snapshots.map(normalizeSnapshot).sort((left, right) => left.snapshotDate.localeCompare(right.snapshotDate));
  const duration = PERFORMANCE_PERIODS[period];
  if (!duration || normalized.length === 0) return normalized;

  const end = new Date(`${normalized.at(-1).snapshotDate}T12:00:00.000Z`);
  if (duration.years) end.setUTCFullYear(end.getUTCFullYear() - duration.years);
  if (duration.months) end.setUTCMonth(end.getUTCMonth() - duration.months);
  const startDate = end.toISOString().slice(0, 10);
  return normalized.filter((snapshot) => snapshot.snapshotDate >= startDate);
}

function summarizePerformance(snapshots, period = "all") {
  const range = performanceSnapshots(snapshots, period);
  if (range.length < 2) {
    return { snapshots: range, changeCents: null, changeRate: null };
  }
  const start = range[0].totalValueCents;
  const end = range.at(-1).totalValueCents;
  const changeCents = end - start;
  return {
    snapshots: range,
    changeCents,
    changeRate: start === 0 ? null : changeCents / start,
  };
}

function summarizePortfolio(assets, { weeklyContributionCents = 0 } = {}) {
  if (!Array.isArray(assets)) throw new PortfolioValidationError("assets must be an array");
  const weeklyContribution = requiredMoney(weeklyContributionCents, "weeklyContributionCents");
  const normalizedAssets = assets.map(normalizeAsset);
  const totalMarketValueCents = normalizedAssets.reduce(
    (total, asset) => total + marketValueCents(asset),
    0,
  );
  const rows = normalizedAssets.map((asset) =>
    calculateAsset(asset, totalMarketValueCents, weeklyContribution),
  );
  const hasAssets = normalizedAssets.length > 0;
  const rowsWithBaselines = rows.filter((row) => row.dayChangeCents !== null);
  const hasCompleteDayBaseline = hasAssets && rowsWithBaselines.length === normalizedAssets.length;
  const totalPreviousValueCents = hasCompleteDayBaseline
    ? rows.reduce((total, row) => total + row.marketValueCents - row.dayChangeCents, 0)
    : null;
  const targetAllocationComplete =
    hasAssets && isCompleteAllocation(normalizedAssets, "targetAllocationRate");
  const weeklyAllocationComplete =
    hasAssets && isCompleteAllocation(normalizedAssets, "weeklyContributionRate");
  const targetAllocationRate = allocationTotal(normalizedAssets, "targetAllocationRate");
  const weeklyContributionRate = allocationTotal(normalizedAssets, "weeklyContributionRate");
  const warnings = [];

  if (!targetAllocationComplete) warnings.push("Some assets do not have a target allocation.");
  else if (Math.abs(targetAllocationRate - 1) > 0.0001) warnings.push("Target allocations do not total 100%.");

  if (!weeklyAllocationComplete) warnings.push("Some assets do not have a weekly contribution allocation.");
  else if (Math.abs(weeklyContributionRate - 1) > 0.0001) warnings.push("Weekly contribution allocations do not total 100%.");

  return {
    rows,
    totalMarketValueCents,
    totalExpectedAnnualGrowthCents: rows.reduce(
      (total, row) => total + (row.expectedAnnualGrowthCents ?? 0),
      0,
    ),
    totalEstimatedAnnualIncomeCents: rows.reduce(
      (total, row) => total + (row.estimatedAnnualIncomeCents ?? 0),
      0,
    ),
    totalWeeklyContributionCents: rows.reduce(
      (total, row) => total + (row.weeklyContributionCents ?? 0),
      0,
    ),
    dayChangeCoverage: hasCompleteDayBaseline ? "complete" : "unavailable",
    totalDayChangeCents:
      totalPreviousValueCents === null ? null : totalMarketValueCents - totalPreviousValueCents,
    totalDayChangeRate:
      totalPreviousValueCents === null || totalPreviousValueCents === 0
        ? null
        : (totalMarketValueCents - totalPreviousValueCents) / totalPreviousValueCents,
    targetAllocationRate: targetAllocationComplete ? targetAllocationRate : null,
    weeklyContributionRate: weeklyAllocationComplete ? weeklyContributionRate : null,
    warnings,
  };
}

function summarizeAllocationTargets(rows, toleranceRate = 0.02) {
  if (!Array.isArray(rows)) throw new PortfolioValidationError("rows must be an array");
  if (!Number.isFinite(toleranceRate) || toleranceRate < 0) {
    validationError("toleranceRate", "must be a non-negative decimal");
  }

  const valuedRows = rows.filter((row) => (
    Number.isSafeInteger(row?.marketValueCents) && row.marketValueCents >= 0 && Number.isFinite(row.allocationRate)
  ));
  const configuredRows = valuedRows.filter((row) => Number.isFinite(row.asset?.targetAllocationRate));
  const attentionRows = configuredRows.filter((row) => (
    Number.isFinite(row.targetVarianceRate) && Math.abs(row.targetVarianceRate) >= toleranceRate
  ));

  return {
    valuedCount: valuedRows.length,
    configuredCount: configuredRows.length,
    attentionCount: attentionRows.length,
    complete: valuedRows.length > 0 && configuredRows.length === valuedRows.length,
    allClear: valuedRows.length > 0
      && configuredRows.length === valuedRows.length
      && attentionRows.length === 0,
  };
}

const portfolioContract = {
  ALLOCATION_CATEGORIES,
  CONTRIBUTION_FREQUENCIES,
  DISTRIBUTION_POLICIES,
  INSTRUMENT_TYPES,
  PERFORMANCE_PERIODS,
  PortfolioValidationError,
  VALUATION_BASES,
  calculateAsset,
  marketValueCents,
  normalizeAsset,
  performanceSnapshots,
  summarizeAllocationTargets,
  summarizePortfolio,
  summarizePerformance,
};

if (typeof module !== "undefined") module.exports = portfolioContract;
if (typeof window !== "undefined") window.MercuryPortfolio = portfolioContract;
