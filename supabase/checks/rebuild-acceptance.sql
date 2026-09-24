-- Disposable data only. The rebuild runner creates its own local database.
begin;
insert into auth.users (id) values
  ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
insert into public.accounts (id, name, account_type)
values ('10000000-0000-0000-0000-000000000001', 'Rebuild A', 'brokerage');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
insert into public.accounts (id, name, account_type)
values ('10000000-0000-0000-0000-000000000002', 'Rebuild B', 'brokerage');
reset role;

do $$
declare n integer; account uuid; record_id uuid;
begin
  for n in 1..2 loop
    account := ('10000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    record_id := ('20000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    insert into public.holdings (id, account_id, symbol, instrument_type, allocation_category, valuation_basis, manual_value_cents, updated_at)
      values (record_id, account, 'REBUILD', 'other', 'other', 'manual-value', 12345, '2000-01-01');
    insert into public.holding_quotes (id, holding_id, price_cents, source, as_of)
      values (record_id, record_id, 12345, 'Rebuild fixture', '2026-09-22');
    insert into public.portfolio_snapshots (id, account_id, snapshot_date, total_value_cents)
      values (record_id, account, '2026-09-22', 12345);
    insert into public.income_sources (id, account_id, name, income_type, amount_cents, frequency)
      values (record_id, account, 'Rebuild income', 'other', 12345, 'monthly');
    insert into public.budget_categories (id, account_id, name, monthly_amount_cents)
      values (record_id, account, 'Rebuild budget', 12345);
    insert into public.plan_settings (id, account_id, date_of_birth, retirement_age)
      values (record_id, account, '1990-01-01', 65);
    insert into public.home_properties (id, account_id, name, current_value_cents, purchase_price_cents, city, state_code, county_fips)
      values (record_id, account, 'Rebuild property', 12345, 10001, 'Test city', 'NY', '36061');
  end loop;
end;
$$;

set local role authenticated;
do $$
declare n integer; t text; visible integer; affected integer;
  own_account uuid; foreign_account uuid; own_record uuid; foreign_record uuid; foreign_user uuid;
begin
  for n in 1..2 loop
    perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-' || lpad(n::text, 12, '0'), true);
    own_account := ('10000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    foreign_account := ('10000000-0000-0000-0000-' || lpad((3-n)::text, 12, '0'))::uuid;
    own_record := ('20000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    foreign_record := ('20000000-0000-0000-0000-' || lpad((3-n)::text, 12, '0'))::uuid;
    foreign_user := ('00000000-0000-0000-0000-' || lpad((3-n)::text, 12, '0'))::uuid;
    foreach t in array array['accounts','holdings','holding_quotes','portfolio_snapshots','income_sources','budget_categories','plan_settings','home_properties'] loop
      execute format('select count(*) from public.%I', t) into visible;
      if visible <> 1 then raise exception 'RLS visible count failed: %', t; end if;
      execute format('update public.%I set id = id where id = $1', t)
        using case when t = 'accounts' then foreign_account else foreign_record end;
      get diagnostics affected = row_count;
      if affected <> 0 then raise exception 'Foreign update permitted: %', t; end if;
      execute format('delete from public.%I where id = $1', t)
        using case when t = 'accounts' then foreign_account else foreign_record end;
      get diagnostics affected = row_count;
      if affected <> 0 then raise exception 'Foreign delete permitted: %', t; end if;
      if t <> 'portfolio_snapshots' then
        begin
          execute format('update public.%I set %I = $1 where id = $2', t,
            case when t = 'accounts' then 'user_id' when t = 'holding_quotes' then 'holding_id' else 'account_id' end)
            using case when t = 'accounts' then foreign_user when t = 'holding_quotes' then foreign_record else foreign_account end,
              case when t = 'accounts' then own_account else own_record end;
          raise exception 'Foreign ownership transfer permitted: %', t;
        exception when insufficient_privilege then null;
        end;
      end if;
    end loop;
    select count(*) into visible from public.holding_quotes q join public.holdings h on h.id=q.holding_id where h.account_id=own_account;
    if visible <> 1 then raise exception 'Own quote join failed'; end if;
    select count(*) into visible from public.holding_quotes q join public.holdings h on h.id=q.holding_id where h.account_id=foreign_account;
    if visible <> 0 then raise exception 'Foreign quote join leaked'; end if;

    update public.holdings set name='Reviewed' where id=own_record and updated_at='2000-01-01';
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception 'Current revision update failed'; end if;
    update public.holdings set name='Stale' where id=own_record and updated_at='2000-01-01';
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Timestamp trigger did not protect stale revision'; end if;

    begin
      insert into public.holdings (id, account_id, symbol, instrument_type, allocation_category, valuation_basis, manual_value_cents)
        values (own_record, own_account, 'DUPLICATE', 'other', 'other', 'manual-value', 999);
      raise exception 'Duplicate Add identity accepted';
    exception when unique_violation then null;
    end;
    begin
      insert into public.income_sources (account_id, name, income_type, amount_cents, frequency)
        values (foreign_account, 'Foreign insert', 'other', 100, 'monthly');
      raise exception 'Foreign parent insert accepted';
    exception when insufficient_privilege then null;
    end;
    begin
      update public.home_properties set purchase_price_cents=-1 where id=own_record;
      raise exception 'Invalid purchase price accepted';
    exception when check_violation then null;
    end;
    begin
      update public.plan_settings set date_of_birth=current_date+1 where id=own_record;
      raise exception 'Future birth date accepted';
    exception when check_violation then null;
    end;
    begin
      insert into public.budget_categories (account_id, name, monthly_amount_cents)
        values (own_account, ' REBUILD BUDGET ', 100);
      raise exception 'Duplicate normalised budget name accepted';
    exception when unique_violation then null;
    end;
    begin
      insert into public.portfolio_snapshots (account_id, snapshot_date, total_value_cents)
        values (own_account, '2026-09-23', 999);
      raise exception 'Browser snapshot insertion permitted';
    exception when insufficient_privilege then null;
    end;
    -- Confirmed deletes return a row once and zero rows on an already-deleted retry.
    delete from public.home_properties where id=own_record and account_id=own_account;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception 'Own scoped delete failed'; end if;
    delete from public.home_properties where id=own_record and account_id=own_account;
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Delete retry was not empty'; end if;
    -- Restore the local fixture for the other direction of the isolation checks.
    insert into public.home_properties (id, account_id, name, current_value_cents) values (own_record,own_account,'Rebuild property',12345);
  end loop;
end;
$$;
reset role;
set local role anon;
do $$
declare t text;
begin
  foreach t in array array['accounts','holdings','holding_quotes','portfolio_snapshots','income_sources','budget_categories','plan_settings','home_properties'] loop
    begin
      execute format('select 1 from public.%I limit 1', t);
      raise exception 'Anonymous access allowed: %', t;
    exception when insufficient_privilege then null;
    end;
  end loop;
end;
$$;
reset role;
-- New net worth coverage remains nullable for legacy records; negative equity is valid.
do $$
begin
  if exists (select 1 from public.portfolio_snapshots where property_equity_cents is not null) then
    raise exception 'Legacy snapshots unexpectedly gained property coverage';
  end if;
  update public.portfolio_snapshots set property_equity_cents = -30000;
  if exists (select 1 from public.portfolio_snapshots where total_value_cents + property_equity_cents <> -17655) then
    raise exception 'Negative net worth was not preserved';
  end if;
  begin
    update public.portfolio_snapshots set property_equity_cents = 9007199254740992;
    raise exception 'Unsafe property equity accepted';
  exception when check_violation then null;
  end;
  begin
    update public.portfolio_snapshots set property_equity_cents = 9007199254740991;
    raise exception 'Unsafe combined net worth accepted';
  exception when check_violation then null;
  end;
  update public.portfolio_snapshots set property_equity_cents = 0;
  update public.portfolio_snapshots set property_equity_cents = null;
end;
$$;
rollback;
