# Property-inclusive Home — 0.2.17

Founder correction: Home must include property in the streamlined balance experience. Its headline is now Net worth, calculated as current investments plus saved property value minus mortgage debt. The current chart endpoint and selected-period dollar/percentage change use the same scope. No layout, Acadia or provider changes.

## Historical truth and storage

- The previous daily snapshots stored investment totals only. Do not add today's property equity to past dates or silently assume missing property coverage means zero.
- Forward migration `20260924004500_snapshot_property_equity.sql` adds nullable signed property equity and safe-integer checks for property equity and combined net worth. No backfill, deleted data, access-policy change or rewritten investment history.
- The existing scheduled writer reads complete account properties, subtracts mortgages and stores both investment and property components together. Empty property collections record zero. Failed or invalid property reads prevent the write.
- Home compares only complete net-worth records. Legacy investment history remains intact for investment-only calculations. Until comparable days exist, the full current balance appears with a single point and “Net worth history is building”.
- Negative equity/net worth remain valid. Percent change is withheld for a non-positive starting balance. Missing current property or investment data withholds the full total and graph rather than showing a partial value.

## Verification

- `npm run check`: syntax and **329 passing tests**. Covers equity arithmetic, negative values, safe-integer limits, owner-scoped component reads/writes, failed property reads, legacy null versus recorded zero, full net-worth percentage denominators, unavailable properties and unchanged period/navigation behaviour.
- `npm run check:database`: disposable PostgreSQL 17 rebuild, exact expected schema, two-user RLS, anonymous denial, legacy nulls, negative net worth, unsafe equity/net-worth rejection, second-run idempotence and empty cleanup passed.
- `npm run check:restore`: exact synthetic backup/restore of 1,018 records, including nullable and negative snapshot property equity, passed. Temporary clusters/archives removed. No production restore performed.
- Linked migration dry run proposed only the new migration. Applied successfully. Fresh hosted metadata matches the tested contract (88 columns, 75 constraints); subsequent push dry run reports up to date. Existing grants/policies are unchanged.
- Synthetic browser: $143,500 investments + $100,000 property equity = $243,500 Home net worth. YTD -$6,500 / -2.6%; 1Y +$13,500 / +5.87%; All +$53,500 / +28.16%. Each uses the complete historical denominator. Legacy-only history shows the full current balance and no invented change.
- Desktop and 390px phone inspected. At 320px and 200% root text, keyboard End selects All with retained focus, document width remains 320px and chart/card widths remain contained. No local console errors observed.

No private screenshot values copied to test data. No new canonical flow, live quote refresh, property forecast or external service. Production asset/deployment verification is reported in the final response; real owner-history acceptance and physical-device/VoiceOver remain distinct from synthetic browser and local database evidence.
