-- Synthetic records only; loaded exclusively into the private local source cluster.
-- Two identities deliberately differ from rebuild-acceptance.sql's identities.
begin;
insert into auth.users (id) values
  ('90000000-0000-0000-0000-000000000001'), ('90000000-0000-0000-0000-000000000002');
do $$
declare n integer; owner_id uuid; account uuid; holding uuid; manual_holding uuid;
  saved_at timestamptz := '2024-02-29 23:59:59.123456+00';
begin
  for n in 1..2 loop
    owner_id := ('90000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    account := ('91000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    holding := ('92000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    manual_holding := ('93000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    insert into public.accounts (id, user_id, name, account_type, weekly_contribution_cents, created_at, updated_at)
      values (account, owner_id, 'Recovery ' || n, 'brokerage', 10001, saved_at, saved_at);
    insert into public.holdings (id, account_id, symbol, name, instrument_type, allocation_category,
        valuation_basis, shares, manual_price_cents, expected_annual_return_rate, distribution_yield_rate,
        target_allocation_rate, weekly_contribution_rate, dividend_policy, capital_gains_policy,
        custom_policy_note, contribution_cents, contribution_frequency, is_retirement, created_at, updated_at)
      values (holding, account, 'TEST' || n, E'Synthetic café — "shares"\nSecond line', 'stock', 'domestic-equity',
        'shares-and-price', 123456789012.12345678, 10001, -0.123456, 0.012345,
        0.654321, 0.500001, 'custom', 'hold-cash', E'Fixture only\tNo real data', 101,
        'monthly', n = 1, saved_at, saved_at);
    insert into public.holdings (id, account_id, name, instrument_type, allocation_category,
        valuation_basis, manual_value_cents, created_at, updated_at)
      values (manual_holding, account, 'Zero cash', 'cash', 'cash', 'manual-value', 0, saved_at, saved_at);
    insert into public.holding_quotes (id, holding_id, price_cents, previous_close_cents, source,
        as_of, annual_dividend_cents, distribution_yield_rate, created_at)
      select md5('recovery-quote-' || n || '-' || g)::uuid, holding, 10000 + g,
        case when g % 2 = 0 then 0 else null end, 'Synthetic recovery fixture',
        saved_at + g * interval '1 minute', 123, 0.012345, saved_at
      from generate_series(1, case when n = 1 then 1001 else 1 end) g;
    insert into public.portfolio_snapshots (id, account_id, snapshot_date, total_value_cents, recorded_at)
      values (holding, account, '2024-02-29', 9007199254740991, saved_at);
    insert into public.income_sources (id, account_id, name, income_type, amount_cents, frequency, created_at, updated_at)
      values (holding, account, 'Synthetic income', 'contract', 123457, 'twiceMonthly', saved_at, saved_at);
    insert into public.budget_categories (id, account_id, name, monthly_amount_cents, created_at, updated_at)
      values (holding, account, 'Café & travel', 99999, saved_at, saved_at);
    insert into public.plan_settings (id, account_id, expected_annual_return_rate, distribution_yield_rate,
        date_of_birth, stop_investing_age, retirement_age, weekly_expenses_cents,
        weekly_investment_cents, annual_income_cents, created_at, updated_at)
      values (holding, account, 0.123456, 0, '1988-02-29', 60, 65,
        case when n = 1 then 0 else null end, 101, 5200000000000, saved_at, saved_at);
    insert into public.home_properties (id, account_id, name, location, current_value_cents, mortgage_balance_cents,
        annual_appreciation_rate, include_in_net_worth, purchase_price_cents, city, state_code, county_fips, created_at, updated_at)
      values (holding, account, 'Synthetic home', 'Fixture location', 10000001, 10000002, -0.012345, true,
        case when n = 1 then 9007199254740991 else null end, 'Test city', 'NY', '36061', saved_at, saved_at);
  end loop;
end;
$$;
commit;
