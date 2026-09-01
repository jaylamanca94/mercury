# Mercury

Mercury is a private personal-finance workspace. Home is the only active product surface: it presents the owner's Brokerage account with value, income, authentic daily history, and the four largest holdings.

## Setup

1. Create a Supabase project and enable email magic-link authentication.
2. Apply [`supabase/migrations/20260830_brokerage_mvp.sql`](supabase/migrations/20260830_brokerage_mvp.sql).
3. Configure these Vercel environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `TWELVE_DATA_API_KEY` (server only)
   - `CRON_SECRET` (server only)
4. Add the deployment and local-preview URLs to Supabase Auth redirect URLs.

Without those values, the app deliberately opens a labelled sample workspace. It does not persist personal financial data locally.

## Runtime model

- `/api/config` exposes only Supabase's public URL and anonymous key.
- `/api/portfolio/quotes` requires a signed-in user and calls Twelve Data server-side. It caches successful quotes for five minutes.
- `/api/portfolio/snapshot` accepts the Vercel cron secret or a signed-in owner. It upserts one daily account snapshot after the America/New_York market close.
- Browser writes are limited by Supabase RLS. Provider and service-role credentials never reach the browser.

## Development and checks

No package installation is needed for the dependency-free checks.

- `npm test` — domain, quote-adapter, and snapshot behaviour.
- `npm run check` — syntax checks followed by the test suite.

## Key files

- `index.html`, `brokerage.js` — the private Home dashboard and simplified asset-entry flow.
- `acadia.css`, `fonts/` — the canonical Acadia stylesheet and font assets, vendored unchanged; `styles.css` only imports this system asset.
- `portfolio.js` — cent-based calculation and validation contract, also exposed to the browser.
- `api/portfolio/` — protected quote and snapshot endpoints.
- `supabase/migrations/20260830_brokerage_mvp.sql` — account, holding, quote, snapshot and RLS schema.
- `supabase/README.md` — Supabase and environment setup.

Mercury records and explains an owner’s portfolio; it does not offer investment advice, trading, or tax calculations.
