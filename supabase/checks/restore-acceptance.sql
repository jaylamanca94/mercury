-- Validate the restored identities and rows through ordinary authenticated access.
begin;
set local role authenticated;
do $$
declare n integer; t text; visible integer; expected integer; affected integer;
  own_account uuid; foreign_account uuid; own_holding uuid; old_revision timestamptz;
begin
  for n in 1..2 loop
    perform set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-' || lpad(n::text, 12, '0'), true);
    own_account := ('91000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    foreign_account := ('91000000-0000-0000-0000-' || lpad((3-n)::text, 12, '0'))::uuid;
    own_holding := ('92000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid;
    foreach t in array array['accounts','holdings','holding_quotes','portfolio_snapshots','income_sources','budget_categories','plan_settings','home_properties'] loop
      expected := case when t = 'holdings' then 2 when t = 'holding_quotes' and n = 1 then 1001 else 1 end;
      execute format('select count(*) from public.%I', t) into visible;
      if visible <> expected then raise exception 'Restored owner visibility failed: %', t; end if;
    end loop;
    select count(*) into visible from public.holding_quotes q
      join public.holdings h on h.id = q.holding_id where h.account_id = foreign_account;
    if visible <> 0 then raise exception 'Restored quote join exposed foreign records'; end if;
    if not exists (select 1 from public.holdings where id = own_holding and account_id = own_account
        and shares = 123456789012.12345678 and manual_price_cents = 10001
        and updated_at = '2024-02-29 23:59:59.123456+00') then
      raise exception 'Restored shares, cents, parent or revision changed';
    end if;
    select updated_at into old_revision from public.holdings where id = own_holding;
    update public.holdings set name = 'Reviewed restored draft' where id = own_holding and updated_at = old_revision;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception 'Restored record cannot save'; end if;
    update public.holdings set name = 'Stale draft' where id = own_holding and updated_at = old_revision;
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Restored revision permits stale save'; end if;
    update public.accounts set name = 'Foreign change' where id = foreign_account;
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Restored foreign account writable'; end if;
  end loop;
end;
$$;
rollback;
