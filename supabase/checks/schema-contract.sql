-- Read-only structural contract: no application records or credentials.
-- Supabase-owned auth/storage infrastructure is outside Mercury's migrations.
with owned_tables as (
  select c.oid, c.relname, c.relrowsecurity, c.relforcerowsecurity
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
    and c.relname in ('accounts', 'holdings', 'holding_quotes', 'portfolio_snapshots',
      'income_sources', 'budget_categories', 'plan_settings', 'home_properties')
), objects as (
  select 'tables' as kind, t.relname as key, jsonb_build_object(
    'name', t.relname, 'rls', t.relrowsecurity, 'force_rls', t.relforcerowsecurity) as value
  from owned_tables t
  union all
  select 'columns', t.relname || '.' || a.attname, jsonb_build_object(
    'table', t.relname, 'name', a.attname, 'type', format_type(a.atttypid, a.atttypmod),
    'not_null', a.attnotnull, 'default', pg_get_expr(d.adbin, d.adrelid),
    'identity', a.attidentity, 'generated', a.attgenerated)
  from owned_tables t join pg_attribute a on a.attrelid = t.oid
  left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
  where a.attnum > 0 and not a.attisdropped
  union all
  select 'constraints', t.relname || '.' || c.conname, jsonb_build_object(
    'table', t.relname, 'name', c.conname, 'definition', pg_get_constraintdef(c.oid),
    'validated', c.convalidated, 'deferrable', c.condeferrable, 'deferred', c.condeferred)
  from owned_tables t join pg_constraint c on c.conrelid = t.oid
  union all
  select 'indexes', t.relname || '.' || i.relname, jsonb_build_object(
    'table', t.relname, 'name', i.relname, 'definition', pg_get_indexdef(x.indexrelid),
    'valid', x.indisvalid)
  from owned_tables t join pg_index x on x.indrelid = t.oid
  join pg_class i on i.oid = x.indexrelid
  union all
  select 'policies', p.tablename || '.' || p.policyname, jsonb_build_object(
    'table', p.tablename, 'name', p.policyname, 'permissive', p.permissive,
    'roles', p.roles, 'command', p.cmd, 'using', p.qual, 'check', p.with_check)
  from pg_policies p join owned_tables t on t.relname = p.tablename where p.schemaname = 'public'
  union all
  select 'triggers', t.relname || '.' || g.tgname, jsonb_build_object(
    'table', t.relname, 'name', g.tgname, 'definition', pg_get_triggerdef(g.oid), 'enabled', g.tgenabled)
  from owned_tables t join pg_trigger g on g.tgrelid = t.oid where not g.tgisinternal
  union all
  select 'functions', p.proname, jsonb_build_object('name', p.proname,
    'definition', pg_get_functiondef(p.oid), 'security_definer', p.prosecdef, 'config', p.proconfig)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'set_updated_at'
  union all
  select 'grants', t.relname || '.' || r.rolname || '.' || priv.name, jsonb_build_object(
    'table', t.relname, 'role', r.rolname, 'privilege', priv.name,
    'allowed', has_table_privilege(r.oid, t.oid, priv.name))
  from owned_tables t cross join pg_roles r
  cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) priv(name)
  where r.rolname in ('anon', 'authenticated', 'service_role')
), grouped as (
  select kind, jsonb_agg(value order by key) as entries from objects group by kind
)
select jsonb_object_agg(kind, entries) as contract from grouped;
