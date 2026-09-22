-- Preserve provider-derived dividend information alongside the quote that supplied it.
-- Manual holding-level distribution yields remain the owner's authoritative override.
alter table public.holding_quotes
  add column if not exists annual_dividend_cents bigint check (annual_dividend_cents >= 0),
  add column if not exists distribution_yield_rate numeric(8, 6) check (distribution_yield_rate between 0 and 1);
