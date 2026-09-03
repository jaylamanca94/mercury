-- Generalise the existing private home record into a multi-property collection.
alter table public.home_properties
  drop constraint if exists home_properties_account_id_key;

alter table public.home_properties
  add column if not exists name text,
  add column if not exists location text;

update public.home_properties
set name = 'Home'
where name is null or btrim(name) = '';

alter table public.home_properties
  alter column name set default 'Home',
  alter column name set not null;

alter table public.home_properties
  drop constraint if exists home_properties_name_not_blank,
  add constraint home_properties_name_not_blank check (length(btrim(name)) > 0),
  drop constraint if exists home_properties_location_not_blank,
  add constraint home_properties_location_not_blank check (location is null or length(btrim(location)) > 0);
