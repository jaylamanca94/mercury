"use strict";

const PLAN_HORIZONS = Object.freeze([5, 10, 20]);
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
    mortgageBalanceCents: nonNegativeCents(input.mortgageBalanceCents, "mortgageBalanceCents"),
    annualAppreciationRate: optionalRate(input.annualAppreciationRate, "annualAppreciationRate"),
    includeInNetWorth: Boolean(input.includeInNetWorth),
  });
}

function propertyEquityCents(property) {
  const normalized = normalizeProperty(property);
  return normalized.currentValueCents - normalized.mortgageBalanceCents;
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

function resolvePlanAssumptions(settings, portfolioSummary) {
  const normalized = normalizePlanSettings(settings || {});
  return Object.freeze({
    expectedAnnualReturnRate: normalized.expectedAnnualReturnRate ?? portfolioSummary.expectedAnnualReturnRate ?? null,
    distributionYieldRate: normalized.distributionYieldRate ?? portfolioSummary.distributionYieldRate ?? null,
    distributionPolicy: normalized.distributionPolicy,
    usesReturnOverride: normalized.expectedAnnualReturnRate !== null,
    usesYieldOverride: normalized.distributionYieldRate !== null,
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
  propertyEquityCents,
  projectPortfolio,
  resolvePlanAssumptions,
  totalNetWorthCents,
  totalPropertyEquityCents,
};

if (typeof module !== "undefined") module.exports = planContract;
if (typeof window !== "undefined") window.MercuryPlan = planContract;
