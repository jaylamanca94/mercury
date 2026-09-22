-- Minimal Supabase platform contract for the isolated PostgreSQL rebuild only.
-- Do not apply this fixture to a hosted Supabase project.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
$$;
grant usage on schema auth, public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
-- Hosted Supabase defaults, before Mercury's explicit anon revocations.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
