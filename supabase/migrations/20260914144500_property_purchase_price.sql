-- Optional original purchase price; existing properties remain unknown, not zero.
alter table public.home_properties
  add column purchase_price_cents bigint
  constraint home_properties_purchase_price_valid
  check (purchase_price_cents between 0 and 9007199254740991);

comment on column public.home_properties.purchase_price_cents is
  'Optional original purchase price in USD cents. Value change excludes debt, costs and rental income; a zero price has no percentage change.';

notify pgrst, 'reload schema';
