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
