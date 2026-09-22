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
