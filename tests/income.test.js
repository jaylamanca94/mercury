const assert = require("node:assert/strict");
const test = require("node:test");

const {
  IncomeValidationError,
  annualizedIncomeCents,
  incomeForPeriodCents,
  normalizeBudgetCategory,
  normalizeIncomeSource,
  summarizeBudgetCategories,
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

const baseBudgetCategory = {
  id: "groceries",
  name: "Groceries",
  monthlyAmountCents: 75_000,
};

test("budget categories keep a positive cent-based monthly contract", () => {
  assert.deepEqual(normalizeBudgetCategory(baseBudgetCategory), baseBudgetCategory);
  assert.throws(() => normalizeBudgetCategory({ ...baseBudgetCategory, name: " " }), IncomeValidationError);
  assert.throws(() => normalizeBudgetCategory({ ...baseBudgetCategory, monthlyAmountCents: 0 }), IncomeValidationError);
  assert.throws(() => normalizeBudgetCategory({ ...baseBudgetCategory, monthlyAmountCents: 10.5 }), IncomeValidationError);
});

test("budget summaries annualise monthly limits and calculate share of planned spending", () => {
  const categories = [
    baseBudgetCategory,
    { id: "utilities", name: "Bills & Utilities", monthlyAmountCents: 50_000 },
  ];
  const annual = summarizeBudgetCategories(categories, "year");
  const monthly = summarizeBudgetCategories(categories, "month");
  assert.equal(annual.totalMonthlyAmountCents, 125_000);
  assert.equal(annual.totalPeriodAmountCents, 1_500_000);
  assert.equal(monthly.totalPeriodAmountCents, 125_000);
  assert.equal(annual.rows[0].allocationRate, 0.6);
  assert.equal(annual.rows[1].allocationRate, 0.4);
});

test("budget summaries allow an empty plan and reject duplicate category names", () => {
  assert.deepEqual(summarizeBudgetCategories([], "month"), {
    rows: [],
    totalMonthlyAmountCents: 0,
    totalPeriodAmountCents: 0,
  });
  assert.throws(() => summarizeBudgetCategories([
    baseBudgetCategory,
    { ...baseBudgetCategory, id: "duplicate", name: " groceries " },
  ]), /category names must be unique/);
  assert.throws(() => summarizeBudgetCategories([baseBudgetCategory], "week"), /period must be year or month/);
});
