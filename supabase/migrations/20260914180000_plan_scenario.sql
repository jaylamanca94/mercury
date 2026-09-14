-- Optional overrides preserve the live link to source cash-flow records.
alter table public.plan_settings
  add column current_age smallint check (current_age between 0 and 120),
  add column age_reference_year smallint check (age_reference_year between 1900 and 2200),
  add column stop_investing_age smallint check (stop_investing_age between 0 and 120),
  add column retirement_age smallint check (retirement_age between 0 and 120),
  add column weekly_expenses_cents bigint check (weekly_expenses_cents between 0 and 100000000000),
  add column weekly_investment_cents bigint check (weekly_investment_cents between 0 and 100000000000),
  add column annual_income_cents bigint check (annual_income_cents between 0 and 5200000000000),
  add constraint plan_scenario_age_pair check ((current_age is null) = (age_reference_year is null)),
  add constraint plan_scenario_age_required check (current_age is not null or (stop_investing_age is null and retirement_age is null));

comment on column public.plan_settings.current_age is 'Age in age_reference_year; approximate age increments annually. No birth date is collected.';
comment on column public.plan_settings.annual_income_cents is 'Plan-only recurring income override. Null follows Income. Retirement retains the source mix proportion for benefits and other income.';
notify pgrst, 'reload schema';
