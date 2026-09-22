-- Mercury bootstrap baseline, reconciled against the hosted schema on 2026-09-22.
-- Version 20260903004833 is already recorded on the linked project. Its original
-- ledger statement contains Base Plan only; earlier/manual schema changes were
-- never separately recorded. This file replaces the local no-op so a NEW empty
-- database can reproduce the existing product schema. Do not replay it against
-- existing tables or alter the hosted ledger. Later recorded migrations remain.
-- Original scripts and their hashes: ../archive/pre-baseline/manifest.json.

-- Source: 20260830_brokerage_mvp.sql
-- Mercury Brokerage MVP: owner-scoped accounts, holdings, quotes, and daily snapshots.
create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null default 'Brokerage',
  account_type text not null check (account_type = 'brokerage'),
  currency char(3) not null default 'USD' check (currency = 'USD'),
  weekly_contribution_cents bigint not null default 0 check (weekly_contribution_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, account_type)
);

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  symbol text,
  name text,
  instrument_type text not null check (instrument_type in ('mutual-fund', 'etf', 'stock', 'crypto', 'cash', 'other')),
  allocation_category text not null check (allocation_category in ('domestic-equity', 'international-equity', 'bonds', 'crypto', 'cash', 'other')),
  valuation_basis text not null check (valuation_basis in ('manual-value', 'shares-and-price')),
  shares numeric(20, 8),
  manual_value_cents bigint check (manual_value_cents >= 0),
  manual_price_cents bigint check (manual_price_cents >= 0),
  expected_annual_return_rate numeric(8, 6) check (expected_annual_return_rate between -1 and 1),
  distribution_yield_rate numeric(8, 6) check (distribution_yield_rate between 0 and 1),
  target_allocation_rate numeric(8, 6) check (target_allocation_rate between 0 and 1),
  weekly_contribution_rate numeric(8, 6) check (weekly_contribution_rate between 0 and 1),
  dividend_policy text check (dividend_policy in ('reinvest', 'transfer-to-bank', 'transfer-to-fund', 'hold-cash', 'custom')),
  capital_gains_policy text check (capital_gains_policy in ('reinvest', 'transfer-to-bank', 'transfer-to-fund', 'hold-cash', 'custom')),
  custom_policy_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (symbol is not null or name is not null),
  check (
    (valuation_basis = 'manual-value' and manual_value_cents is not null and shares is null and manual_price_cents is null)
    or
    (valuation_basis = 'shares-and-price' and shares is not null and manual_value_cents is null)
  ),
  check (
    (dividend_policy != 'custom' and capital_gains_policy != 'custom') or custom_policy_note is not null
  )
);

create table if not exists public.holding_quotes (
  id uuid primary key default gen_random_uuid(),
  holding_id uuid not null references public.holdings(id) on delete cascade,
  price_cents bigint not null check (price_cents >= 0),
  previous_close_cents bigint check (previous_close_cents >= 0),
  source text not null,
  as_of timestamptz not null,
  created_at timestamptz not null default now(),
  unique (holding_id, as_of)
);

create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  snapshot_date date not null,
  total_value_cents bigint not null check (total_value_cents >= 0),
  recorded_at timestamptz not null default now(),
  unique (account_id, snapshot_date)
);

create index if not exists holdings_account_id_idx on public.holdings(account_id);
create index if not exists holding_quotes_holding_as_of_idx on public.holding_quotes(holding_id, as_of desc);
create index if not exists portfolio_snapshots_account_date_idx on public.portfolio_snapshots(account_id, snapshot_date desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists accounts_updated_at on public.accounts;
create trigger accounts_updated_at before update on public.accounts
for each row execute function public.set_updated_at();
drop trigger if exists holdings_updated_at on public.holdings;
create trigger holdings_updated_at before update on public.holdings
for each row execute function public.set_updated_at();

alter table public.accounts enable row level security;
alter table public.holdings enable row level security;
alter table public.holding_quotes enable row level security;
alter table public.portfolio_snapshots enable row level security;

create policy "Owners manage their brokerage account" on public.accounts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owners manage their brokerage holdings" on public.holdings
  for all using (exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()));
create policy "Owners read and write their holding quotes" on public.holding_quotes
  for all using (exists (
    select 1 from public.holdings h join public.accounts a on a.id = h.account_id
    where h.id = holding_id and a.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.holdings h join public.accounts a on a.id = h.account_id
    where h.id = holding_id and a.user_id = auth.uid()
  ));
create policy "Owners read their brokerage snapshots" on public.portfolio_snapshots
  for select using (exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()));

revoke all on public.accounts, public.holdings, public.holding_quotes, public.portfolio_snapshots from anon;
grant select, insert, update, delete on public.accounts, public.holdings, public.holding_quotes, public.portfolio_snapshots to authenticated;

-- Source: 20260901_asset_contribution.sql
-- Mercury Asset Detail Page: persisted per-holding contribution plan.
alter table public.holdings
  add column if not exists contribution_cents bigint check (contribution_cents >= 0),
  add column if not exists contribution_frequency text check (contribution_frequency in ('weekly', 'monthly'));

alter table public.holdings
  drop constraint if exists holdings_contribution_requires_frequency;

alter table public.holdings
  add constraint holdings_contribution_requires_frequency
  check (contribution_cents is null or contribution_frequency is not null);

-- Source: 20260901_quote_dividend_data.sql
-- Preserve provider-derived dividend information alongside the quote that supplied it.
-- Manual holding-level distribution yields remain the owner's authoritative override.
alter table public.holding_quotes
  add column if not exists annual_dividend_cents bigint check (annual_dividend_cents >= 0),
  add column if not exists distribution_yield_rate numeric(8, 6) check (distribution_yield_rate between 0 and 1);

-- Source: 20260902_base_plan.sql
-- Mercury Base Plan: one private projection configuration and optional home record per Brokerage account.
create table if not exists public.plan_settings (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts(id) on delete cascade,
  expected_annual_return_rate numeric(8, 6) check (expected_annual_return_rate between -1 and 1),
  distribution_yield_rate numeric(8, 6) check (distribution_yield_rate between 0 and 1),
  distribution_policy text not null default 'reinvest' check (distribution_policy in ('reinvest', 'transfer-to-bank', 'transfer-to-fund', 'hold-cash')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_properties (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts(id) on delete cascade,
  current_value_cents bigint not null check (current_value_cents >= 0),
  mortgage_balance_cents bigint not null default 0 check (mortgage_balance_cents >= 0),
  annual_appreciation_rate numeric(8, 6) check (annual_appreciation_rate between -1 and 1),
  include_in_net_worth boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists plan_settings_updated_at on public.plan_settings;
create trigger plan_settings_updated_at before update on public.plan_settings
for each row execute function public.set_updated_at();

drop trigger if exists home_properties_updated_at on public.home_properties;
create trigger home_properties_updated_at before update on public.home_properties
for each row execute function public.set_updated_at();

alter table public.plan_settings enable row level security;
alter table public.home_properties enable row level security;

create policy "Owners manage their plan settings" on public.plan_settings
  for all using (exists (
    select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()
  ));

create policy "Owners manage their home properties" on public.home_properties
  for all using (exists (
    select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()
  ));

revoke all on public.plan_settings, public.home_properties from anon;
grant select, insert, update, delete on public.plan_settings, public.home_properties to authenticated;

-- Source: 20260902_income_sources.sql
-- Mercury Income workspace: owner-scoped recurring expected income planning sources.
create table if not exists public.income_sources (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  income_type text not null check (income_type in ('employment', 'contract', 'benefits', 'other')),
  amount_cents bigint not null check (amount_cents > 0),
  frequency text not null check (frequency in ('weekly', 'biweekly', 'twiceMonthly', 'monthly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists income_sources_account_id_idx on public.income_sources(account_id);

drop trigger if exists income_sources_updated_at on public.income_sources;
create trigger income_sources_updated_at before update on public.income_sources
for each row execute function public.set_updated_at();

alter table public.income_sources enable row level security;

create policy "Owners manage their income sources" on public.income_sources
  for all using (exists (
    select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()
  ));

revoke all on public.income_sources from anon;
grant select, insert, update, delete on public.income_sources to authenticated;

-- Source: 20260903_property_portfolio.sql
-- Generalise the existing private home record into a multi-property collection.
alter table public.home_properties
  drop constraint if exists home_properties_account_id_key;

alter table public.home_properties
  add column if not exists name text,
  add column if not exists location text;

update public.home_properties
set name = 'Home'
where name is null or btrim(name) = '';

alter table public.home_properties
  alter column name set default 'Home',
  alter column name set not null;

alter table public.home_properties
  drop constraint if exists home_properties_name_not_blank,
  add constraint home_properties_name_not_blank check (length(btrim(name)) > 0),
  drop constraint if exists home_properties_location_not_blank,
  add constraint home_properties_location_not_blank check (location is null or length(btrim(location)) > 0);

-- Make the newly added columns available to the PostgREST API immediately.
notify pgrst, 'reload schema';

-- Source: 20260904_budget_categories.sql
-- Mercury Income budget: owner-scoped monthly spending-plan categories.
create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  monthly_amount_cents bigint not null check (monthly_amount_cents > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budget_categories_account_id_idx
  on public.budget_categories(account_id);
create unique index if not exists budget_categories_account_name_idx
  on public.budget_categories(account_id, lower(trim(name)));

drop trigger if exists budget_categories_updated_at on public.budget_categories;
create trigger budget_categories_updated_at before update on public.budget_categories
for each row execute function public.set_updated_at();

alter table public.budget_categories enable row level security;

drop policy if exists "Owners manage their budget categories" on public.budget_categories;
create policy "Owners manage their budget categories" on public.budget_categories
  for all using (exists (
    select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()
  ));

revoke all on public.budget_categories from anon;
grant select, insert, update, delete on public.budget_categories to authenticated;

notify pgrst, 'reload schema';
