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

const exported = {
  INCOME_FREQUENCIES,
  INCOME_SOURCE_TYPES,
  IncomeValidationError,
  annualizedIncomeCents,
  incomeForPeriodCents,
  normalizeIncomeSource,
  summarizeIncomeSources,
};

if (typeof module !== "undefined") module.exports = exported;
if (typeof window !== "undefined") window.MercuryIncome = exported;
