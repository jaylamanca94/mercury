"use strict";

const PLAN_HORIZONS = Object.freeze([1, 5, 10, 20]);
const PLAN_DISTRIBUTION_POLICIES = Object.freeze([
  "reinvest",
  "transfer-to-bank",
  "transfer-to-fund",
  "hold-cash",
]);
const PLAN_CONTRIBUTION_FREQUENCIES = Object.freeze({ weekly: 52, monthly: 12 });

class PlanValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "PlanValidationError";
  }
}

function optionalRate(value, field, { minimum = -1, maximum = 1 } = {}) {
  if (value === undefined || value === null || value === "") return null;
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new PlanValidationError(`${field} must be a decimal between ${minimum} and ${maximum}`);
  }
  return value;
}

function nonNegativeCents(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new PlanValidationError(`${field} must be a non-negative whole number of cents`);
  }
  return value;
}

function normalizePlanSettings(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new PlanValidationError("plan settings must be an object");
  }
  const distributionPolicy = input.distributionPolicy ?? "reinvest";
  if (!PLAN_DISTRIBUTION_POLICIES.includes(distributionPolicy)) {
    throw new PlanValidationError(`distributionPolicy must be one of: ${PLAN_DISTRIBUTION_POLICIES.join(", ")}`);
  }
  return Object.freeze({
    id: input.id ?? null,
    accountId: input.accountId ?? null,
    expectedAnnualReturnRate: optionalRate(input.expectedAnnualReturnRate, "expectedAnnualReturnRate"),
    distributionYieldRate: optionalRate(input.distributionYieldRate, "distributionYieldRate", { minimum: 0, maximum: 1 }),
    distributionPolicy,
  });
}

// Null monetary overrides stay linked to Mercury's source records.
function normalizePlanScenario(input = {}) {
  const integer = (value, field, min, max) => {
    if (value === null || value === undefined || value === "") return null;
    if (!Number.isSafeInteger(value) || value < min || value > max) throw new PlanValidationError(`${field} must be a whole number between ${min} and ${max}.`);
    return value;
  };
  const scenario = {
    currentAge: integer(input.currentAge, "Current age", 0, 120),
    ageReferenceYear: integer(input.ageReferenceYear, "Age reference year", 1900, 2200),
    stopInvestingAge: integer(input.stopInvestingAge, "Stop investing age", 0, 120),
    retirementAge: integer(input.retirementAge, "Retirement age", 0, 120),
    weeklyExpensesCents: integer(input.weeklyExpensesCents, "Weekly expenses", 0, 100000000000),
    weeklyInvestmentCents: integer(input.weeklyInvestmentCents, "Weekly investments", 0, 100000000000),
    annualIncomeCents: integer(input.annualIncomeCents, "Annual income", 0, 5200000000000),
  };
  if ((scenario.currentAge === null) !== (scenario.ageReferenceYear === null)) throw new PlanValidationError("Enter your current age to use age-based controls.");
  if (scenario.currentAge === null && (scenario.stopInvestingAge !== null || scenario.retirementAge !== null)) throw new PlanValidationError("Enter your current age in Plan settings to use age-based controls.");
  return Object.freeze(scenario);
}

// Fixed nominal monthly cash flow. Total return already includes distributions.
// Contributions use available income; spending shortfalls draw down investments.
function projectLifePlan({ currentValueCents, annualContributionCents = 0, annualExpensesCents = 0,
  annualIncomeCents = 0, continuingIncomeCents = 0, expectedAnnualReturnRate,
  distributionYieldRate, distributionPolicy = "reinvest", horizonYears = 5,
  currentAge = null, stopInvestingAge = null, retirementAge = null } = {}) {
  [currentValueCents, annualContributionCents, annualExpensesCents, annualIncomeCents, continuingIncomeCents].forEach(value => nonNegativeCents(value, "Cash flow"));
  if (continuingIncomeCents > annualIncomeCents) throw new PlanValidationError("Continuing income cannot exceed total income.");
  const validation = projectPortfolio({ currentValueCents, annualContributionCents: 0, expectedAnnualReturnRate, distributionYieldRate, distributionPolicy, horizonYears });
  if (!validation.available) return validation;
  normalizePlanScenario({ currentAge, ageReferenceYear: currentAge === null ? null : 2000, stopInvestingAge, retirementAge });
  const rate = validation.effectiveGrowthRate;
  const monthlyGrowth = Math.pow(1 + rate, 1 / 12) - 1;
  const portion = (annual, month) => Math.round(annual * month / 12) - Math.round(annual * (month - 1) / 12);
  let value = currentValueCents, depletionMonth = null, unfundedCents = 0, contributedCents = 0, withdrawnCents = 0;
  const point = month => ({ month, year: month / 12, age: currentAge === null ? null : currentAge + Math.floor(month / 12), investmentValueCents: value,
    projectedIncomeCents: Math.round(value * distributionYieldRate), expectedGrowthCents: Math.round(value * rate), contributedCents, withdrawnCents, unfundedCents });
  const points = [point(0)];
  for (let month = 1; month <= horizonYears * 12; month++) {
    const age = currentAge === null ? null : currentAge + Math.floor((month - 1) / 12);
    const retired = retirementAge !== null && age >= retirementAge;
    const stopped = stopInvestingAge !== null && age >= stopInvestingAge;
    const income = portion(retired ? continuingIncomeCents : annualIncomeCents, month);
    const distributions = distributionPolicy === "reinvest" ? 0 : Math.round(value * distributionYieldRate / 12);
    const balance = income + distributions - portion(annualExpensesCents, month);
    const cashFlow = Math.min(stopped ? 0 : portion(annualContributionCents, month), balance);
    const grown = Math.max(0, Math.round(value * (1 + monthlyGrowth)));
    contributedCents += Math.max(0, cashFlow);
    withdrawnCents += Math.min(grown, Math.max(0, -cashFlow));
    unfundedCents += Math.max(0, -(grown + cashFlow));
    value = Math.max(0, grown + cashFlow);
    if (!Number.isSafeInteger(value)) throw new PlanValidationError("This projection exceeds the supported amount range. Reduce the amounts or horizon.");
    if (value === 0 && cashFlow < 0 && depletionMonth === null) depletionMonth = month;
    points.push(point(month));
  }
  return { available: true, effectiveGrowthRate: rate, points, depletionMonth, unfundedCents };
}

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new PlanValidationError(`${field} is required`);
  }
  return value.trim();
}

function optionalText(value, field) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !value.trim()) {
    throw new PlanValidationError(`${field} must be text when supplied`);
  }
  return value.trim();
}

function normalizeProperty(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new PlanValidationError("property must be an object");
  }
  return Object.freeze({
    id: input.id ?? null,
    accountId: input.accountId ?? null,
    name: requiredText(input.name ?? "Home", "name"),
    location: optionalText(input.location, "location"),
    currentValueCents: nonNegativeCents(input.currentValueCents, "currentValueCents"),
    purchasePriceCents: input.purchasePriceCents == null || input.purchasePriceCents === ""
      ? null : nonNegativeCents(input.purchasePriceCents, "purchasePriceCents"),
    mortgageBalanceCents: nonNegativeCents(input.mortgageBalanceCents, "mortgageBalanceCents"),
    annualAppreciationRate: optionalRate(input.annualAppreciationRate, "annualAppreciationRate"),
    includeInNetWorth: Boolean(input.includeInNetWorth),
  });
}

function propertyEquityCents(property) {
  const normalized = normalizeProperty(property);
  return normalized.currentValueCents - normalized.mortgageBalanceCents;
}

function propertyGainLoss(property) {
  const normalized = normalizeProperty(property);
  if (normalized.purchasePriceCents === null) return null;
  const gainCents = normalized.currentValueCents - normalized.purchasePriceCents;
  return Object.freeze({
    gainCents,
    gainRate: normalized.purchasePriceCents === 0 ? null : gainCents / normalized.purchasePriceCents,
  });
}

function totalPropertyEquityCents(properties) {
  if (!Array.isArray(properties)) throw new PlanValidationError("properties must be an array");
  return properties.reduce((total, property) => total + propertyEquityCents(property), 0);
}

function totalNetWorthCents(portfolioValueCents, properties) {
  const investments = nonNegativeCents(portfolioValueCents, "portfolioValueCents");
  return investments + totalPropertyEquityCents(properties);
}

const normalizeHomeProperty = normalizeProperty;
const homeEquityCents = propertyEquityCents;

function annualRecurringContributionCents(holdings, {
  legacyWeeklyContributionCents = 0,
  legacyWeeklyAllocationRate = null,
} = {}) {
  if (!Array.isArray(holdings)) throw new PlanValidationError("holdings must be an array");
  nonNegativeCents(legacyWeeklyContributionCents, "legacyWeeklyContributionCents");
  if (legacyWeeklyAllocationRate !== null && (!Number.isFinite(legacyWeeklyAllocationRate) || legacyWeeklyAllocationRate < 0 || legacyWeeklyAllocationRate > 1)) {
    throw new PlanValidationError("legacyWeeklyAllocationRate must be a decimal between 0 and 1");
  }
  const explicit = holdings.filter((holding) => holding.contributionCents !== null && holding.contributionCents !== undefined);
  if (explicit.length) {
    return explicit.reduce((total, holding) => {
      const contribution = nonNegativeCents(holding.contributionCents, "contributionCents");
      const periods = PLAN_CONTRIBUTION_FREQUENCIES[holding.contributionFrequency];
      if (!periods) throw new PlanValidationError("contributionFrequency must be weekly or monthly");
      return total + (contribution * periods);
    }, 0);
  }
  return legacyWeeklyContributionCents > 0 && Math.abs((legacyWeeklyAllocationRate ?? 0) - 1) <= 0.0001
    ? legacyWeeklyContributionCents * 52
    : 0;
}

function weeklyEquivalentRecurringContributionCents(holdings) {
  return Math.round(annualRecurringContributionCents(holdings) / 52);
}

function resolvePlanAssumptions(settings, portfolioSummary) {
  const normalized = normalizePlanSettings(settings || {});
  const valuedRows = (portfolioSummary.rows || []).filter((row) => row.marketValueCents > 0);
  let portfolioReturn = portfolioSummary.expectedAnnualReturnRate ?? null;
  let usesHistoricalReturn = false;
  if (portfolioReturn === null && valuedRows.length) {
    const rates = valuedRows.map((row) => row.asset.expectedAnnualReturnRate ?? row.asset.historicalAnnualizedReturnRate ?? null);
    if (rates.every((rate) => Number.isFinite(rate) && rate >= -1 && rate <= 1)) {
      const totalValue = valuedRows.reduce((total, row) => total + row.marketValueCents, 0);
      portfolioReturn = valuedRows.reduce((total, row, index) => total + row.marketValueCents * rates[index], 0) / totalValue;
      usesHistoricalReturn = valuedRows.some((row) => row.asset.expectedAnnualReturnRate == null);
    }
  }
  return Object.freeze({
    expectedAnnualReturnRate: normalized.expectedAnnualReturnRate ?? portfolioReturn,
    distributionYieldRate: normalized.distributionYieldRate ?? portfolioSummary.distributionYieldRate ?? null,
    distributionPolicy: normalized.distributionPolicy,
    usesReturnOverride: normalized.expectedAnnualReturnRate !== null,
    usesYieldOverride: normalized.distributionYieldRate !== null,
    usesHistoricalReturn: normalized.expectedAnnualReturnRate === null && usesHistoricalReturn,
  });
}

function projectPortfolio({
  currentValueCents,
  annualContributionCents,
  expectedAnnualReturnRate,
  distributionYieldRate,
  distributionPolicy = "reinvest",
  horizonYears = 10,
}) {
  nonNegativeCents(currentValueCents, "currentValueCents");
  nonNegativeCents(annualContributionCents, "annualContributionCents");
  if (!PLAN_HORIZONS.includes(horizonYears)) {
    throw new PlanValidationError(`horizonYears must be one of: ${PLAN_HORIZONS.join(", ")}`);
  }
  const expectedRate = optionalRate(expectedAnnualReturnRate, "expectedAnnualReturnRate");
  const yieldRate = optionalRate(distributionYieldRate, "distributionYieldRate", { minimum: 0, maximum: 1 });
  if (expectedRate === null || yieldRate === null) {
    return Object.freeze({ available: false, points: Object.freeze([]), effectiveGrowthRate: null });
  }
  if (!PLAN_DISTRIBUTION_POLICIES.includes(distributionPolicy)) {
    throw new PlanValidationError(`distributionPolicy must be one of: ${PLAN_DISTRIBUTION_POLICIES.join(", ")}`);
  }
  const effectiveGrowthRate = distributionPolicy === "reinvest" ? expectedRate : expectedRate - yieldRate;
  if (effectiveGrowthRate < -1) {
    throw new PlanValidationError("return minus yield cannot be less than -100% for a cash distribution policy");
  }
  const points = [{
    year: 0,
    investmentValueCents: currentValueCents,
    projectedIncomeCents: Math.round(currentValueCents * yieldRate),
  }];
  for (let year = 1; year <= horizonYears; year += 1) {
    const previous = points.at(-1).investmentValueCents;
    const investmentValueCents = Math.round((previous * (1 + effectiveGrowthRate)) + annualContributionCents);
    points.push({
      year,
      investmentValueCents,
      projectedIncomeCents: Math.round(investmentValueCents * yieldRate),
    });
  }
  return Object.freeze({ available: true, effectiveGrowthRate, points: Object.freeze(points) });
}

const planContract = {
  PLAN_CONTRIBUTION_FREQUENCIES,
  PLAN_DISTRIBUTION_POLICIES,
  PLAN_HORIZONS,
  PlanValidationError,
  annualRecurringContributionCents,
  homeEquityCents,
  normalizeHomeProperty,
  normalizeProperty,
  normalizePlanSettings,
  normalizePlanScenario,
  propertyEquityCents,
  propertyGainLoss,
  projectPortfolio,
  projectLifePlan,
  resolvePlanAssumptions,
  totalNetWorthCents,
  totalPropertyEquityCents,
  weeklyEquivalentRecurringContributionCents,
};

if (typeof module !== "undefined") module.exports = planContract;
if (typeof window !== "undefined") window.MercuryPlan = planContract;
