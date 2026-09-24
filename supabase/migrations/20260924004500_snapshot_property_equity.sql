-- Null preserves the unknown property coverage of investment-only history.
-- Existing balances are deliberately not backfilled from current property values.
alter table public.portfolio_snapshots
  add column property_equity_cents bigint,
  add constraint portfolio_snapshots_property_equity_safe_check
    check (property_equity_cents between -9007199254740991 and 9007199254740991),
  add constraint portfolio_snapshots_net_worth_safe_check
    check (property_equity_cents is null or
      total_value_cents + property_equity_cents between -9007199254740991 and 9007199254740991);
