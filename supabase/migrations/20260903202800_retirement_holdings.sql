-- Mercury holding classification: retirement assets remain inside the private Brokerage account.
alter table public.holdings
  add column if not exists is_retirement boolean not null default false;
