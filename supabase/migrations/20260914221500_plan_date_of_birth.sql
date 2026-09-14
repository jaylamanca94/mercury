-- Do not infer a birth date from the old approximate age.
alter table public.plan_settings
  add column date_of_birth date
    check (date_of_birth between date '1900-01-01' and current_date),
  drop constraint plan_scenario_age_required,
  add constraint plan_scenario_age_required check (
    date_of_birth is not null or current_age is not null
    or (stop_investing_age is null and retirement_age is null)
  );

comment on column public.plan_settings.date_of_birth is
  'Private owner-entered calendar date used for exact age and birthday-based Plan milestones. Never inferred from legacy age fields.';
comment on column public.plan_settings.current_age is
  'Legacy approximate age retained for older clients. New clients use date_of_birth and clear this field when saving DOB.';
notify pgrst, 'reload schema';
