-- Keep trigger helpers independent of caller-controlled schema search paths.
alter function public.set_updated_at() set search_path = pg_catalog;

-- Hosted projects may install this event-trigger helper. It is infrastructure,
-- not an RPC for browser roles; preserve its owner and event-trigger behaviour.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
