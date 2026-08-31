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
