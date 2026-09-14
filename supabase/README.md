# Mercury Supabase setup

Reconcile migration history against the actual schema before applying changes. The files in `migrations/` define the private Brokerage, income, budget, Base plan, property and retirement models. The no-op `20260903004833_remote_baseline.sql` records a consolidated remote baseline; older local files are not individually recorded remotely and some share version prefixes. Do not replay all files in the SQL editor or run a blanket `db push`. A reconciled baseline and verified clean rebuild remain a release gate.

Plan settings use the existing `id`, unique `account_id` and `updated_at` trigger for revision-aware writes. No schema change is required for 0.0.2. On 2026-09-14, a disposable test account verified advancing revisions, zero-row stale updates, retained winning settings and rejection of duplicate first creation. All created account/settings rows were removed and empty test-account state rechecked.

Enable **Email** authentication with magic links, then set these Vercel environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `TWELVE_DATA_API_KEY` (server only)
- `CRON_SECRET` (server only)

Set the Supabase Auth site URL and redirect URLs to Mercury's deployed URL and local preview URL. The browser receives only `SUPABASE_URL` and `SUPABASE_ANON_KEY` through `/api/config`; it never receives provider or service-role credentials.

The snapshot endpoint is called hourly by Vercel. It writes only after 4 PM America/New_York, and its unique `(account_id, snapshot_date)` constraint makes each daily Brokerage snapshot idempotent. A signed-in owner can also call the same endpoint from the Refresh history control.

The `20260907133000_function_security.sql` migration fixes the timestamp trigger search path and removes browser-role execution grants from the optional hosted RLS event-trigger helper. It was applied and recorded on the linked project on 2026-09-07; disposable transaction checks verified both triggers.

Snapshots reject incomplete or invalid valuations before writing, leaving previous history intact. A cron request requires a configured nonblank secret. Authentication and storage reads/writes have ten-second deadlines.

## Property purchase prices — 0.0.4

`20260914144500_property_purchase_price.sql` adds nullable `purchase_price_cents` to `home_properties`, with a non-negative safe-integer constraint. It was applied to the linked Mercury project and recorded in the migration ledger in one transaction on 2026-09-14. No old migrations were replayed, existing values were not backfilled, and row-level security remains enabled. Apply this one forward migration before deploying the new client to another environment.

Authenticated disposable-account checks verified omitted/null values, exact cent precision, updates, zero, clearing, rejection of negative/unsafe values, and unchanged equity inputs. All test records were removed and the empty test-account state rechecked. The general migration-baseline/rebuild gate above remains separate.

## Plan scenario — 0.1.0

`20260914180000_plan_scenario.sql` adds seven nullable scenario fields and age/money constraints to `plan_settings`. It was applied and recorded atomically on 2026-09-14. Existing records retain null overrides; RLS, ownership and the revision trigger remain unchanged. Authenticated disposable-account checks verified all seven fields, exact cents, fresh rereads, stale updates, invalid-age/money rejection, clearing overrides and complete cleanup. The historical baseline/rebuild and second-user acceptance gates remain separate.
