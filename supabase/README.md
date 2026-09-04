# Mercury Supabase setup

Apply every schema migration in `migrations/`, including `20260902_income_sources.sql`, `20260902_base_plan.sql`, and `20260903202800_retirement_holdings.sql`, in the Supabase SQL editor (or through the Supabase CLI). They create the one-owner Brokerage, expected-income, Base-plan, optional home-equity, and per-holding retirement-classification data models with row-level security policies. The no-op `20260903004833_remote_baseline.sql` mirrors Mercury's existing consolidated remote migration record so future CLI checks remain aligned.

Enable **Email** authentication with magic links, then set these Vercel environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `TWELVE_DATA_API_KEY` (server only)
- `CRON_SECRET` (server only)

Set the Supabase Auth site URL and redirect URLs to Mercury's deployed URL and local preview URL. The browser receives only `SUPABASE_URL` and `SUPABASE_ANON_KEY` through `/api/config`; it never receives provider or service-role credentials.

The snapshot endpoint is called hourly by Vercel. It writes only after 4 PM America/New_York, and its unique `(account_id, snapshot_date)` constraint makes each daily Brokerage snapshot idempotent. A signed-in owner can also call the same endpoint from the Refresh history control.
