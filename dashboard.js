"use strict";

// Shared read models: no network access, persistence, or display formatting.
const DashboardIncome = typeof module !== "undefined" ? require("./income") : window.MercuryIncome;
const DashboardPlan = typeof module !== "undefined" ? require("./plan") : window.MercuryPlan;
const DashboardPortfolio = typeof module !== "undefined" ? require("./portfolio") : window.MercuryPortfolio;
const HISTORY_MINIMUM_DAYS = 1;

// Public fund exposure labels, verified against issuer references in DESIGN-README.md.
// Exact USD fund symbols only; never infer a strategy from a ticker substring or name.
const FUND_ASSET_TYPES = Object.freeze({
  VFIAX: "S&P 500", VOO: "S&P 500",
  VSMAX: "Small-Cap", VB: "Small-Cap",
  VTIAX: "International", VXUS: "International",
  VBTLX: "Bonds", VGT: "Technology",
});
const CATEGORY_ASSET_TYPES = Object.freeze({
  "domestic-equity": "U.S. Stocks", "international-equity": "International",
  bonds: "Bonds", crypto: "Crypto", cash: "Cash",
});
const INSTRUMENT_ASSET_TYPES = Object.freeze({
  stock: "Stocks", etf: "ETF", "mutual-fund": "Mutual Fund", crypto: "Crypto", cash: "Cash",
});
function holdingAssetTypeLabel(asset = {}) {
  const symbol = String(asset.symbol || "").trim().toUpperCase();
  if (["crypto", "cash"].includes(asset.instrumentType)) return INSTRUMENT_ASSET_TYPES[asset.instrumentType];
  if (Object.hasOwn(FUND_ASSET_TYPES, symbol)) return FUND_ASSET_TYPES[symbol];
  if (Object.hasOwn(CATEGORY_ASSET_TYPES, asset.allocationCategory)) return CATEGORY_ASSET_TYPES[asset.allocationCategory];
  return Object.hasOwn(INSTRUMENT_ASSET_TYPES, asset.instrumentType) ? INSTRUMENT_ASSET_TYPES[asset.instrumentType] : "Unclassified";
}

function investmentGroup(asset) {
  return asset.isRetirement ? "retirement" : asset.instrumentType === "crypto" ? "crypto" : "brokerage";
}

function summarizeInvestmentGroups(rows) {
  const groups = [
    { id: "all", name: "All investments" },
    { id: "brokerage", name: "Brokerage" },
    { id: "retirement", name: "Retirement" },
    { id: "crypto", name: "Crypto" },
  ].map((group) => {
    const members = group.id === "all" ? rows : rows.filter((row) => investmentGroup(row.asset) === group.id);
    const missingCount = members.filter((row) => !Number.isSafeInteger(row.marketValueCents) || row.marketValueCents < 0).length;
    return { ...group, count: members.length, missingCount,
      valueCents: missingCount ? null : members.reduce((sum, row) => sum + row.marketValueCents, 0) };
  });
  const total = groups[0].valueCents;
  return groups.map((group) => ({ ...group,
    allocationRate: total > 0 && group.valueCents !== null ? group.valueCents / total : null }));
}

// Home groups use the same rounded, source-backed estimates as its summary.
// Plan overrides and expected-return inputs must not become historical returns.
function summarizeHomeGroups(rows, properties, { propertiesAvailable = true, pendingIds = new Set() } = {}) {
  const investments = summarizeInvestmentGroups(rows);
  const groups = ["brokerage", "crypto", "retirement"].map(id => {
    const group = investments.find(group => group.id === id);
    const members = rows.filter(row => investmentGroup(row.asset) === id);
    const pending = members.some(row => pendingIds.has(row.asset.id));
    const rate = field => group.valueCents > 0 && !pending && members.every(row => Number.isSafeInteger(row[field]))
      ? members.reduce((sum, row) => sum + row[field], 0) / group.valueCents : null;
    return { ...group, pending, growthRate: rate("estimatedAnnualGrowthCents"),
      yieldRate: rate("estimatedAnnualIncomeCents"), hasYield: id !== "crypto" };
  });
  const marketValue = properties.reduce((sum, property) => sum + property.currentValueCents, 0);
  const appreciation = properties.map(property => DashboardPlan.propertyAppreciation(property));
  groups.push({ id: "property", name: "Property", count: propertiesAvailable ? properties.length : null,
    valueCents: propertiesAvailable ? DashboardPlan.totalPropertyEquityCents(properties) : null,
    growthRate: propertiesAvailable && marketValue > 0 && appreciation.every(value => value.rate !== null)
      ? properties.reduce((sum, property, index) => sum + property.currentValueCents * appreciation[index].rate, 0) / marketValue : null,
    growthSource: propertiesAvailable ? appreciation.map(value => value.source).join("; ") : "Property data unavailable",
    hasYield: false, pending: false });
  return groups;
}

function summarizePlanningPosition({ sources = [], categories = [], holdings = [], passiveAnnualCents = null,
  sourcesAvailable = true, categoriesAvailable = true, holdingsAvailable = true, passiveAvailable = true,
  period = "month" } = {}) {
  if (!["month", "year"].includes(period)) throw new Error("period must be month or year");
  const convert = (value) => Number.isSafeInteger(value) ? (period === "month" ? Math.round(value / 12) : value) : null;
  const recurringCents = sourcesAvailable ? convert(DashboardIncome.summarizeIncomeSources(sources, "year").totalAnnualIncomeCents) : null;
  const passiveCents = passiveAvailable ? convert(passiveAnnualCents) : null;
  const spendingCents = categoriesAvailable ? convert(DashboardIncome.summarizeBudgetCategories(categories, "year").totalPeriodAmountCents) : null;
  const investingCents = holdingsAvailable ? convert(DashboardPlan.annualRecurringContributionCents(holdings)) : null;
  const expectedCents = recurringCents !== null && passiveCents !== null ? recurringCents + passiveCents : null;
  const balanceCents = [expectedCents, spendingCents, investingCents].every(Number.isSafeInteger)
    ? expectedCents - spendingCents - investingCents : null;
  return { period, recurringCents, passiveCents, expectedCents, spendingCents, investingCents, balanceCents };
}

function summarizeHoldingAllocation(assets) {
  const valued = [];
  let unvaluedCount = 0;
  for (const asset of assets) {
    const valueCents = asset.valuationBasis === "manual-value" ? asset.manualValueCents
      : Number.isFinite(asset.shares) && Number.isSafeInteger(asset.unitPriceCents)
        ? Math.round(asset.shares * asset.unitPriceCents) : null;
    if (!Number.isSafeInteger(valueCents) || valueCents < 0) { unvaluedCount++; continue; }
    valued.push({ id: asset.id, name: asset.symbol || asset.name || "Asset", valueCents });
  }
  valued.sort((a, b) => b.valueCents - a.valueCents || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  const totalValueCents = valued.reduce((sum, row) => sum + row.valueCents, 0);
  const rows = valued.slice(0, 4);
  if (valued.length > 4) rows.push({ id: null, name: "Other investments", valueCents: valued.slice(4).reduce((sum, row) => sum + row.valueCents, 0) });
  return { totalValueCents, unvaluedCount, valuedCount: valued.length,
    rows: totalValueCents > 0 ? rows.map((row) => ({ ...row, allocationRate: row.valueCents / totalValueCents })) : [] };
}

// The caller supplies Home's complete, unfiltered net worth (including property equity).
function summarizeNetWorthAllocation(valueCents, netWorthCents) {
  if (!Number.isSafeInteger(valueCents) || valueCents < 0 || !Number.isSafeInteger(netWorthCents)) {
    return { rate: null, showRing: false, reason: "Complete valuations are needed for allocation." };
  }
  if (netWorthCents <= 0) return { rate: null, showRing: false, reason: "Allocation requires positive net worth." };
  const rate = valueCents / netWorthCents;
  return { rate, showRing: rate <= 1,
    reason: rate > 1 ? "Exceeds total net worth because property equity is negative." : "" };
}

function summarizeDashboardHistory(snapshots, period = "all") {
  const unique = new Map();
  for (const snapshot of snapshots) {
    const previous = unique.get(snapshot.snapshot_date);
    if (!previous || String(snapshot.recorded_at || "") >= String(previous.recorded_at || "")) unique.set(snapshot.snapshot_date, snapshot);
  }
  const result = DashboardPortfolio.summarizePerformance([...unique.values()], period);
  const dates = result.snapshots.map((point) => Date.parse(`${point.snapshotDate}T12:00:00Z`));
  const duration = dates.length > 1 ? dates.at(-1) - dates[0] : 0;
  return { ...result, recordedDays: result.snapshots.length, showTrend: result.snapshots.length >= HISTORY_MINIMUM_DAYS,
    positions: dates.map((date) => duration ? ((date - dates[0]) / duration) * 100 : 0) };
}

// Net worth history requires observed investment AND property equity values.
// Legacy investment-only records are not a complete net worth baseline.
function summarizeHomeBalanceHistory(snapshots, currentValueCents, { period = "ytd", today } = {}) {
  if (!["ytd", "1y", "all"].includes(period)) throw new Error("Unsupported Home period");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today || "") || !Number.isFinite(Date.parse(today))) throw new Error("A current date is required");
  const currentAvailable = Number.isSafeInteger(currentValueCents);
  const complete = snapshots.filter(point => Number.isSafeInteger(point.property_equity_cents)
    && Number.isSafeInteger(point.total_value_cents) && point.total_value_cents >= 0
    && Number.isSafeInteger(point.total_value_cents + point.property_equity_cents));
  const records = complete.filter(point => point.snapshot_date <= today && (!currentAvailable || point.snapshot_date !== today))
    .map(point => ({ ...point, total_value_cents: point.total_value_cents + point.property_equity_cents }));
  if (currentAvailable) records.push({ snapshot_date: today, total_value_cents: currentValueCents });
  let boundary = null;
  if (period === "ytd") boundary = `${Number(today.slice(0, 4)) - 1}-12-31`;
  if (period === "1y") {
    const date = new Date(`${today}T12:00:00Z`), month = date.getUTCMonth();
    date.setUTCFullYear(date.getUTCFullYear() - 1);
    if (date.getUTCMonth() !== month) date.setUTCDate(0);
    boundary = date.toISOString().slice(0, 10);
  }
  const unique = new Map();
  for (const point of records.filter(point => !boundary || point.snapshot_date >= boundary)) {
    const previous = unique.get(point.snapshot_date);
    if (!previous || String(point.recorded_at || "") >= String(previous.recorded_at || "")) unique.set(point.snapshot_date, point);
  }
  const points = [...unique.values()].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date))
    .map(point => ({ snapshotDate: point.snapshot_date, totalValueCents: point.total_value_cents }));
  const dates = points.map(point => Date.parse(`${point.snapshotDate}T12:00:00Z`));
  const duration = dates.length > 1 ? dates.at(-1) - dates[0] : 0;
  const change = points.length > 1 ? points.at(-1).totalValueCents - points[0].totalValueCents : null;
  const result = { snapshots: points, startDate: points[0]?.snapshotDate ?? null, endDate: points.at(-1)?.snapshotDate ?? null,
    latestValueCents: points.at(-1)?.totalValueCents ?? null, changeCents: Number.isSafeInteger(change) ? change : null,
    changeRate: Number.isSafeInteger(change) && points[0].totalValueCents > 0 ? change / points[0].totalValueCents : null,
    recordedDays: points.length, showTrend: points.length > 0,
    positions: dates.map(date => duration ? (date - dates[0]) / duration * 100 : 0),
    missingPropertyHistory: snapshots.some(point => point.property_equity_cents == null && point.snapshot_date <= today) };

  return { ...result, currentAvailable, boundary, fullPeriod: period === "all" || result.startDate === boundary,
    showTrend: currentAvailable && result.showTrend,
    changeCents: currentAvailable ? result.changeCents : null,
    changeRate: currentAvailable ? result.changeRate : null };
}

// The lifetime baseline is the first recorded investment value, independent of chart range.
function summarizeAllTimeChange(snapshots, currentValueCents) {
  const first = summarizeDashboardHistory(snapshots, "all").snapshots[0];
  const available = first && Number.isSafeInteger(currentValueCents) && currentValueCents >= 0;
  const changeCents = available ? currentValueCents - first.totalValueCents : null;
  return { startDate: first?.snapshotDate ?? null, changeCents,
    changeRate: available && first.totalValueCents > 0 ? changeCents / first.totalValueCents : null };
}

const dashboardContract = { HISTORY_MINIMUM_DAYS, holdingAssetTypeLabel, investmentGroup, summarizeInvestmentGroups, summarizeHomeGroups, summarizePlanningPosition, summarizeHoldingAllocation, summarizeNetWorthAllocation, summarizeDashboardHistory, summarizeHomeBalanceHistory, summarizeAllTimeChange };
if (typeof module !== "undefined") module.exports = dashboardContract;
if (typeof window !== "undefined") window.MercuryDashboard = dashboardContract;
