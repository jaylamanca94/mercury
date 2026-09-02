const assert = require("node:assert/strict");
const test = require("node:test");

const {
  IncomeValidationError,
  annualizedIncomeCents,
  incomeForPeriodCents,
  normalizeIncomeSource,
  summarizeIncomeSources,
} = require("../income");

const baseSource = {
  id: "salary",
  name: "Work",
  incomeType: "employment",
  amountCents: 110_000,
  frequency: "biweekly",
};

test("recurring income annualises each supported cadence without calendar scheduling", () => {
  assert.equal(annualizedIncomeCents(baseSource), 2_860_000);
  assert.equal(annualizedIncomeCents({ ...baseSource, frequency: "weekly" }), 5_720_000);
  assert.equal(annualizedIncomeCents({ ...baseSource, frequency: "twiceMonthly" }), 2_640_000);
  assert.equal(annualizedIncomeCents({ ...baseSource, frequency: "monthly" }), 1_320_000);
});

test("monthly planning estimates are one twelfth of annualised expected income", () => {
  assert.equal(incomeForPeriodCents(baseSource, "year"), 2_860_000);
  assert.equal(incomeForPeriodCents(baseSource, "month"), 238_333);
});

test("income sources use positive whole-cent amounts and a fixed category/cadence contract", () => {
  assert.throws(() => normalizeIncomeSource({ ...baseSource, amountCents: 0 }), IncomeValidationError);
  assert.throws(() => normalizeIncomeSource({ ...baseSource, incomeType: "salary" }), IncomeValidationError);
  assert.throws(() => normalizeIncomeSource({ ...baseSource, frequency: "daily" }), IncomeValidationError);
});

test("income summaries add expected sources and allow an empty planning view", () => {
  const summary = summarizeIncomeSources([
    baseSource,
    { ...baseSource, id: "benefit", name: "Benefit", incomeType: "benefits", amountCents: 50_000, frequency: "monthly" },
  ]);
  assert.equal(summary.totalAnnualIncomeCents, 3_460_000);
  assert.equal(summary.totalPeriodIncomeCents, 3_460_000);
  assert.equal(summarizeIncomeSources([], "month").totalPeriodIncomeCents, 0);
});
