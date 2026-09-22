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
