-- Optional structured geography. Preserve legacy location text and manual rates.
-- Automatic rates are derived from the public, versioned FHFA county dataset;
-- annual_appreciation_rate remains an explicit owner override (null = automatic).
alter table public.home_properties
  add column if not exists city text,
  add column if not exists state_code text,
  add column if not exists county_fips text;
alter table public.home_properties
  add constraint home_properties_city_valid check (city is null or (length(btrim(city)) between 1 and 120)),
  add constraint home_properties_state_valid check (state_code is null or state_code ~ '^[A-Z]{2}$'),
  add constraint home_properties_county_valid check (county_fips is null or (county_fips ~ '^[0-9]{5}$' and state_code is not null));
comment on column public.home_properties.county_fips is 'Owner-selected US county or independent city FIPS; no inferred location backfill.';
comment on column public.home_properties.annual_appreciation_rate is 'Optional annual appreciation override; null uses selected county FHFA history when available.';
notify pgrst, 'reload schema';
