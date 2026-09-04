const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const migration = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "20260830_brokerage_mvp.sql"),
  "utf8",
);
const contributionMigration = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "20260901_asset_contribution.sql"),
  "utf8",
);
const dividendMigration = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "20260901_quote_dividend_data.sql"),
  "utf8",
);
const incomeMigration = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "20260902_income_sources.sql"),
  "utf8",
);
const budgetMigration = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "20260904_budget_categories.sql"),
  "utf8",
);
const planMigration = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "20260902_base_plan.sql"),
  "utf8",
);
const propertyMigration = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "20260903_property_portfolio.sql"),
  "utf8",
);
const retirementMigration = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "20260903202800_retirement_holdings.sql"),
  "utf8",
);

test("the Brokerage schema keeps valuation bases explicit and supports the requested instruments", () => {
  assert.match(migration, /instrument_type in \('mutual-fund', 'etf', 'stock', 'crypto', 'cash', 'other'\)/);
  assert.match(migration, /valuation_basis in \('manual-value', 'shares-and-price'\)/);
  assert.match(migration, /manual-value' and manual_value_cents is not null and shares is null/);
  assert.match(migration, /shares-and-price' and shares is not null and manual_value_cents is null/);
});

test("the Brokerage schema has owner-scoped RLS and idempotent daily snapshots", () => {
  ["accounts", "holdings", "holding_quotes", "portfolio_snapshots"].forEach((table) => {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  });
  assert.match(migration, /unique \(user_id, account_type\)/);
  assert.match(migration, /unique \(account_id, snapshot_date\)/);
  assert.match(migration, /revoke all on public\.accounts, public\.holdings, public\.holding_quotes, public\.portfolio_snapshots from anon/);
});

test("the Asset page contribution migration is idempotent and remains on owner-scoped holdings", () => {
  assert.match(contributionMigration, /add column if not exists contribution_cents bigint/);
  assert.match(contributionMigration, /contribution_frequency text check \(contribution_frequency in \('weekly', 'monthly'\)\)/);
  assert.match(contributionMigration, /holdings_contribution_requires_frequency/);
  assert.match(migration, /Owners manage their brokerage holdings/);
});

test("retirement classification is idempotent and defaults existing holdings to false", () => {
  assert.match(retirementMigration, /alter table public\.holdings/);
  assert.match(retirementMigration, /add column if not exists is_retirement boolean not null default false/);
  assert.match(migration, /Owners manage their brokerage holdings/);
});

test("provider dividend quote fields are idempotent and keep the existing quote RLS boundary", () => {
  assert.match(dividendMigration, /alter table public\.holding_quotes/);
  assert.match(dividendMigration, /add column if not exists annual_dividend_cents bigint/);
  assert.match(dividendMigration, /add column if not exists distribution_yield_rate numeric\(8, 6\)/);
  assert.match(migration, /Owners read and write their holding quotes/);
});

test("Income sources are private account-scoped recurring planning data", () => {
  assert.match(incomeMigration, /create table if not exists public\.income_sources/);
  assert.match(incomeMigration, /account_id uuid not null references public\.accounts\(id\) on delete cascade/);
  assert.match(incomeMigration, /income_type in \('employment', 'contract', 'benefits', 'other'\)/);
  assert.match(incomeMigration, /frequency in \('weekly', 'biweekly', 'twiceMonthly', 'monthly'\)/);
  assert.match(incomeMigration, /amount_cents bigint not null check \(amount_cents > 0\)/);
  assert.match(incomeMigration, /alter table public\.income_sources enable row level security/);
  assert.match(incomeMigration, /Owners manage their income sources/);
  assert.match(incomeMigration, /revoke all on public\.income_sources from anon/);
});

test("Budget categories are private monthly account-scoped spending limits", () => {
  assert.match(budgetMigration, /create table if not exists public\.budget_categories/);
  assert.match(budgetMigration, /account_id uuid not null references public\.accounts\(id\) on delete cascade/);
  assert.match(budgetMigration, /monthly_amount_cents bigint not null check \(monthly_amount_cents > 0\)/);
  assert.match(budgetMigration, /budget_categories\(account_id, lower\(trim\(name\)\)\)/);
  assert.match(budgetMigration, /alter table public\.budget_categories enable row level security/);
  assert.match(budgetMigration, /Owners manage their budget categories/);
  assert.match(budgetMigration, /revoke all on public\.budget_categories from anon/);
  assert.match(budgetMigration, /grant select, insert, update, delete on public\.budget_categories to authenticated/);
  assert.match(budgetMigration, /notify pgrst, 'reload schema'/);
});

test("Base Plan settings and optional home property remain private account-scoped data", () => {
  assert.match(planMigration, /create table if not exists public\.plan_settings/);
  assert.match(planMigration, /account_id uuid not null unique references public\.accounts\(id\) on delete cascade/);
  assert.match(planMigration, /expected_annual_return_rate numeric\(8, 6\) check \(expected_annual_return_rate between -1 and 1\)/);
  assert.match(planMigration, /distribution_yield_rate numeric\(8, 6\) check \(distribution_yield_rate between 0 and 1\)/);
  assert.match(planMigration, /distribution_policy text not null default 'reinvest'/);
  assert.match(planMigration, /create table if not exists public\.home_properties/);
  assert.match(planMigration, /current_value_cents bigint not null check \(current_value_cents >= 0\)/);
  assert.match(planMigration, /mortgage_balance_cents bigint not null default 0 check \(mortgage_balance_cents >= 0\)/);
  assert.match(planMigration, /annual_appreciation_rate numeric\(8, 6\) check \(annual_appreciation_rate between -1 and 1\)/);
  ["plan_settings", "home_properties"].forEach((table) => {
    assert.match(planMigration, new RegExp(`alter table public\\.${table} enable row level security`));
  });
  assert.match(planMigration, /Owners manage their plan settings/);
  assert.match(planMigration, /Owners manage their home properties/);
  assert.match(planMigration, /revoke all on public\.plan_settings, public\.home_properties from anon/);
});

test("property portfolio migration preserves the private property table while allowing multiple records", () => {
  assert.match(propertyMigration, /drop constraint if exists home_properties_account_id_key/);
  assert.match(propertyMigration, /add column if not exists name text/);
  assert.match(propertyMigration, /add column if not exists location text/);
  assert.match(propertyMigration, /set name = 'Home'/);
  assert.match(propertyMigration, /alter column name set not null/);
  assert.match(propertyMigration, /home_properties_name_not_blank/);
  assert.match(propertyMigration, /home_properties_location_not_blank/);
  assert.match(propertyMigration, /notify pgrst, 'reload schema'/);
});
