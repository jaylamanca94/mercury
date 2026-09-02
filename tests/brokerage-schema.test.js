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

test("provider dividend quote fields are idempotent and keep the existing quote RLS boundary", () => {
  assert.match(dividendMigration, /alter table public\.holding_quotes/);
  assert.match(dividendMigration, /add column if not exists annual_dividend_cents bigint/);
  assert.match(dividendMigration, /add column if not exists distribution_yield_rate numeric\(8, 6\)/);
  assert.match(migration, /Owners read and write their holding quotes/);
});
