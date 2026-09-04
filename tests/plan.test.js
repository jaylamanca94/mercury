const assert = require("node:assert/strict");
const test = require("node:test");

const {
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
  weeklyEquivalentRecurringContributionCents,
} = require("../plan");

test("Plan annualises direct holding contributions before using a complete legacy allocation", () => {
  assert.equal(annualRecurringContributionCents([
    { contributionCents: 20_000, contributionFrequency: "weekly" },
    { contributionCents: 50_000, contributionFrequency: "monthly" },
  ], {
    legacyWeeklyContributionCents: 100_000,
    legacyWeeklyAllocationRate: 1,
  }), 1_640_000);

  assert.equal(annualRecurringContributionCents([], {
    legacyWeeklyContributionCents: 100_000,
    legacyWeeklyAllocationRate: 1,
  }), 5_200_000);
  assert.equal(annualRecurringContributionCents([], {
    legacyWeeklyContributionCents: 100_000,
    legacyWeeklyAllocationRate: 0.99995,
  }), 5_200_000);
  assert.equal(annualRecurringContributionCents([], {
    legacyWeeklyContributionCents: 100_000,
    legacyWeeklyAllocationRate: 0.9,
  }), 0);
});

test("Portfolio recurring summary converts mixed cadences to one weekly equivalent", () => {
  assert.equal(weeklyEquivalentRecurringContributionCents([
    { contributionCents: 20_000, contributionFrequency: "weekly" },
    { contributionCents: 50_000, contributionFrequency: "monthly" },
  ]), 31_538);
  assert.equal(weeklyEquivalentRecurringContributionCents([]), 0);
});

test("Plan settings override Portfolio assumptions only inside the Base plan", () => {
  const resolved = resolvePlanAssumptions(normalizePlanSettings({
    expectedAnnualReturnRate: 0.08,
    distributionYieldRate: null,
    distributionPolicy: "hold-cash",
  }), {
    expectedAnnualReturnRate: 0.06,
    distributionYieldRate: 0.02,
  });
  assert.equal(resolved.expectedAnnualReturnRate, 0.08);
  assert.equal(resolved.distributionYieldRate, 0.02);
  assert.equal(resolved.distributionPolicy, "hold-cash");
  assert.equal(resolved.usesReturnOverride, true);
  assert.equal(resolved.usesYieldOverride, false);
});

test("Plan produces annual portfolio-value and income points for every supported horizon", () => {
  [5, 10, 20].forEach((horizonYears) => {
    const projection = projectPortfolio({
      currentValueCents: 100_000_00,
      annualContributionCents: 10_000_00,
      expectedAnnualReturnRate: 0.1,
      distributionYieldRate: 0.02,
      distributionPolicy: "reinvest",
      horizonYears,
    });
    assert.equal(projection.available, true);
    assert.equal(projection.points.length, horizonYears + 1);
    assert.equal(projection.points.at(-1).projectedIncomeCents,
      Math.round(projection.points.at(-1).investmentValueCents * 0.02));
  });
});

test("cash-distribution policies reduce compounding by yield while leaving projected income explicit", () => {
  const reinvest = projectPortfolio({
    currentValueCents: 100_000_00,
    annualContributionCents: 0,
    expectedAnnualReturnRate: 0.1,
    distributionYieldRate: 0.02,
    distributionPolicy: "reinvest",
    horizonYears: 5,
  });
  const cash = projectPortfolio({
    currentValueCents: 100_000_00,
    annualContributionCents: 0,
    expectedAnnualReturnRate: 0.1,
    distributionYieldRate: 0.02,
    distributionPolicy: "transfer-to-bank",
    horizonYears: 5,
  });
  assert.equal(cash.effectiveGrowthRate, 0.08);
  assert.ok(cash.points.at(-1).investmentValueCents < reinvest.points.at(-1).investmentValueCents);
  assert.equal(cash.points[0].projectedIncomeCents, 200_000);
});

test("zero assumptions are valid, while missing coverage and invalid effective rates are explicit", () => {
  const zero = projectPortfolio({
    currentValueCents: 100_000_00,
    annualContributionCents: 0,
    expectedAnnualReturnRate: 0,
    distributionYieldRate: 0,
    horizonYears: 10,
  });
  assert.equal(zero.available, true);
  assert.equal(zero.points.at(-1).investmentValueCents, 100_000_00);
  assert.equal(zero.points.at(-1).projectedIncomeCents, 0);
  assert.equal(projectPortfolio({
    currentValueCents: 100_000_00,
    annualContributionCents: 0,
    expectedAnnualReturnRate: null,
    distributionYieldRate: 0.02,
    horizonYears: 10,
  }).available, false);
  assert.throws(() => projectPortfolio({
    currentValueCents: 100_000_00,
    annualContributionCents: 0,
    expectedAnnualReturnRate: -1,
    distributionYieldRate: 0.02,
    distributionPolicy: "hold-cash",
    horizonYears: 10,
  }), PlanValidationError);
});

test("home equity remains a separately normalised stored value", () => {
  const property = normalizeHomeProperty({
    currentValueCents: 600_000_00,
    mortgageBalanceCents: 385_000_00,
    annualAppreciationRate: 0.03,
    includeInNetWorth: true,
  });
  assert.equal(homeEquityCents(property), 215_000_00);
  assert.equal(property.includeInNetWorth, true);
  assert.throws(() => normalizeHomeProperty({ currentValueCents: -1, mortgageBalanceCents: 0 }), PlanValidationError);
});

test("properties retain identity and aggregate equity for net worth", () => {
  const house = normalizeProperty({
    name: "House",
    location: "Roanoke, VA",
    currentValueCents: 447_000_00,
    mortgageBalanceCents: 232_000_00,
  });
  const cabin = normalizeProperty({
    name: "Cabin",
    location: "Floyd, VA",
    currentValueCents: 180_000_00,
    mortgageBalanceCents: 195_000_00,
  });
  assert.equal(propertyEquityCents(house), 215_000_00);
  assert.equal(totalPropertyEquityCents([house, cabin]), 200_000_00);
  assert.throws(() => normalizeProperty({
    name: "",
    currentValueCents: 1,
    mortgageBalanceCents: 0,
  }), PlanValidationError);
});

test("net worth combines investment value with all property equity", () => {
  const properties = [
    {
      name: "House",
      currentValueCents: 447_000_00,
      mortgageBalanceCents: 232_000_00,
    },
    {
      name: "Cabin",
      currentValueCents: 180_000_00,
      mortgageBalanceCents: 195_000_00,
    },
  ];

  assert.equal(totalNetWorthCents(756_000_00, []), 756_000_00);
  assert.equal(totalNetWorthCents(756_000_00, properties), 956_000_00);
  assert.equal(totalNetWorthCents(0, [properties[1]]), -15_000_00);
  assert.throws(() => totalNetWorthCents(-1, []), PlanValidationError);
});
