-- Mercury Asset Detail Page: persisted per-holding contribution plan.
alter table public.holdings
  add column if not exists contribution_cents bigint check (contribution_cents >= 0),
  add column if not exists contribution_frequency text check (contribution_frequency in ('weekly', 'monthly'));

alter table public.holdings
  drop constraint if exists holdings_contribution_requires_frequency;

alter table public.holdings
  add constraint holdings_contribution_requires_frequency
  check (contribution_cents is null or contribution_frequency is not null);
