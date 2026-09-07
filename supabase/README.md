# Mercury Supabase setup

Apply every schema migration in `migrations/`, including `20260902_income_sources.sql`, `20260904_budget_categories.sql`, `20260902_base_plan.sql`, and `20260903202800_retirement_holdings.sql`, in the Supabase SQL editor (or through the Supabase CLI). They create the one-owner Brokerage, expected-income, monthly category spending-plan, Base-plan, optional home-equity, and per-holding retirement-classification data models with row-level security policies. The no-op `20260903004833_remote_baseline.sql` records the existing consolidated remote baseline, but older local files are not individually recorded remotely and some share version prefixes. Do not run a blanket `db push` until that history is reconciled against the actual schema and a clean rebuild is verified.

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
