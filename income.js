"use strict";

const INCOME_SOURCE_TYPES = Object.freeze(["employment", "contract", "benefits", "other"]);
const INCOME_FREQUENCIES = Object.freeze({
  weekly: { label: "Weekly", periodsPerYear: 52 },
  biweekly: { label: "Every 2 weeks", periodsPerYear: 26 },
  twiceMonthly: { label: "Twice monthly", periodsPerYear: 24 },
  monthly: { label: "Monthly", periodsPerYear: 12 },
});

class IncomeValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "IncomeValidationError";
  }
}

function requiredBudgetMoney(value, field) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new IncomeValidationError(`${field} must be a positive whole number of cents`);
  }
  return value;
}

function requiredIncomeText(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new IncomeValidationError(`${field} is required`);
  return value.trim();
}

function requiredIncomeMoney(value, field) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new IncomeValidationError(`${field} must be a positive whole number of cents`);
  }
  return value;
}

function normalizeIncomeSource(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new IncomeValidationError("income source must be an object");
  }
  const incomeType = input.incomeType;
  const frequency = input.frequency;
  if (!INCOME_SOURCE_TYPES.includes(incomeType)) {
    throw new IncomeValidationError(`incomeType must be one of: ${INCOME_SOURCE_TYPES.join(", ")}`);
  }
  if (!Object.hasOwn(INCOME_FREQUENCIES, frequency)) {
    throw new IncomeValidationError(`frequency must be one of: ${Object.keys(INCOME_FREQUENCIES).join(", ")}`);
  }
  return Object.freeze({
    id: requiredIncomeText(input.id, "id"),
    name: requiredIncomeText(input.name, "name"),
    incomeType,
    amountCents: requiredIncomeMoney(input.amountCents, "amountCents"),
    frequency,
  });
}

function annualizedIncomeCents(source) {
  const normalized = normalizeIncomeSource(source);
  return normalized.amountCents * INCOME_FREQUENCIES[normalized.frequency].periodsPerYear;
}

function incomeForPeriodCents(source, period = "year") {
  const annual = annualizedIncomeCents(source);
  if (period === "year") return annual;
  if (period === "month") return Math.round(annual / 12);
  throw new IncomeValidationError("period must be year or month");
}

function summarizeIncomeSources(sources, period = "year") {
  if (!Array.isArray(sources)) throw new IncomeValidationError("sources must be an array");
  const rows = sources.map((source) => {
    const normalized = normalizeIncomeSource(source);
    const annualIncomeCents = annualizedIncomeCents(normalized);
    return Object.freeze({
      source: normalized,
      annualIncomeCents,
      periodIncomeCents: period === "year" ? annualIncomeCents : incomeForPeriodCents(normalized, period),
    });
  });
  return Object.freeze({
    rows: Object.freeze(rows),
    totalAnnualIncomeCents: rows.reduce((total, row) => total + row.annualIncomeCents, 0),
    totalPeriodIncomeCents: rows.reduce((total, row) => total + row.periodIncomeCents, 0),
  });
}

function normalizeBudgetCategory(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new IncomeValidationError("budget category must be an object");
  }
  return Object.freeze({
    id: requiredIncomeText(input.id, "id"),
    name: requiredIncomeText(input.name, "name"),
    monthlyAmountCents: requiredBudgetMoney(input.monthlyAmountCents, "monthlyAmountCents"),
  });
}

function summarizeBudgetCategories(categories, period = "year") {
  if (!Array.isArray(categories)) throw new IncomeValidationError("categories must be an array");
  if (period !== "year" && period !== "month") {
    throw new IncomeValidationError("period must be year or month");
  }
  const normalized = categories.map(normalizeBudgetCategory);
  const names = new Set();
  normalized.forEach((category) => {
    const key = category.name.toLocaleLowerCase("en-US");
    if (names.has(key)) throw new IncomeValidationError("category names must be unique");
    names.add(key);
  });
  const totalMonthlyAmountCents = normalized.reduce((total, category) => total + category.monthlyAmountCents, 0);
  const rows = normalized.map((category) => Object.freeze({
    category,
    allocationRate: totalMonthlyAmountCents ? category.monthlyAmountCents / totalMonthlyAmountCents : null,
  }));
  return Object.freeze({
    rows: Object.freeze(rows),
    totalMonthlyAmountCents,
    totalPeriodAmountCents: period === "year" ? totalMonthlyAmountCents * 12 : totalMonthlyAmountCents,
  });
}

const exported = {
  INCOME_FREQUENCIES,
  INCOME_SOURCE_TYPES,
  IncomeValidationError,
  annualizedIncomeCents,
  incomeForPeriodCents,
  normalizeBudgetCategory,
  normalizeIncomeSource,
  summarizeBudgetCategories,
  summarizeIncomeSources,
};

if (typeof module !== "undefined") module.exports = exported;
if (typeof window !== "undefined") window.MercuryIncome = exported;
