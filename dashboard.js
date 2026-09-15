"use strict";

// Shared read models: no network access, persistence, or display formatting.
const DashboardIncome = typeof module !== "undefined" ? require("./income") : window.MercuryIncome;
const DashboardPlan = typeof module !== "undefined" ? require("./plan") : window.MercuryPlan;
const DashboardPortfolio = typeof module !== "undefined" ? require("./portfolio") : window.MercuryPortfolio;
const HISTORY_MINIMUM_DAYS = 1;

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

// The lifetime baseline is the first recorded investment value, independent of chart range.
function summarizeAllTimeChange(snapshots, currentValueCents) {
  const first = summarizeDashboardHistory(snapshots, "all").snapshots[0];
  const available = first && Number.isSafeInteger(currentValueCents) && currentValueCents >= 0;
  const changeCents = available ? currentValueCents - first.totalValueCents : null;
  return { startDate: first?.snapshotDate ?? null, changeCents,
    changeRate: available && first.totalValueCents > 0 ? changeCents / first.totalValueCents : null };
}

const dashboardContract = { HISTORY_MINIMUM_DAYS, investmentGroup, summarizeInvestmentGroups, summarizeHomeGroups, summarizePlanningPosition, summarizeHoldingAllocation, summarizeNetWorthAllocation, summarizeDashboardHistory, summarizeAllTimeChange };
if (typeof module !== "undefined") module.exports = dashboardContract;
if (typeof window !== "undefined") window.MercuryDashboard = dashboardContract;
