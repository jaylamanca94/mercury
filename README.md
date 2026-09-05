# Mercury

Mercury is a private personal-finance workspace. Home answers where the owner stands and what deserves review: current net worth, monthly planning, factual coverage/history items, investment allocation and four ranked assets. Portfolio presents an unfiltered investment/property/weekly-equivalent Recurring summary, allocation, and matching Cards or Table views for investments; search and filters affect records only. Income opens a monthly planning Overview with gross recurring sources, estimated dividends and explicit Edit dialogs; `#income/budget` opens monthly category-level spending limits. Planned balance subtracts planned spending and investing from expected income and is never presented as spendable cash. Plan remains a single illustrative Base plan with its existing assumptions and projections.

## Setup

1. Create a Supabase project and enable email magic-link authentication.
2. Apply every SQL file in [`supabase/migrations/`](supabase/migrations/), including the private Income source and budget-category migrations.
3. Configure these Vercel environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `TWELVE_DATA_API_KEY` (server only)
   - `CRON_SECRET` (server only)
4. Add the deployment and local-preview URLs to Supabase Auth redirect URLs.

Without those values, Mercury shows an empty, disabled Brokerage workspace. It never persists personal financial data locally or substitutes placeholder holdings.

## Runtime model

- `/api/config` exposes only Supabase's public URL and anonymous key.
- `/api/portfolio/quotes` requires a signed-in user and calls Twelve Data server-side. It caches successful prices for five minutes and provider distribution data for one day; unavailable distribution data never invalidates a price quote.
- `/api/portfolio/snapshot` accepts the Vercel cron secret or a signed-in owner. It upserts one daily account snapshot after the America/New_York market close.
- Browser writes are limited by Supabase RLS. Provider and service-role credentials never reach the browser.

## Development and checks

No package installation is needed for the dependency-free checks.

- `npm test` — domain, quote-adapter, and snapshot behaviour.
- `npm run check` — syntax checks followed by the test suite.

## Key files

- `dashboard.js` — pure shared planning, investment allocation and distinct-date history calculations.
- `index.html`, `brokerage.js` — the private Home dashboard, hash-routed Portfolio, Income, and Plan workspaces, Asset pages, and simplified entry flows.
- `acadia.css`, `fonts/` — the canonical Acadia stylesheet and font assets, vendored unchanged; `styles.css` adds only narrow Mercury page compositions. The shared `wide` plus `spacious` frame aligns Home, Portfolio and Asset desktop rails at 148px while retaining Acadia's smaller-device gutters.
- `portfolio.js`, `income.js`, `plan.js` — cent-based portfolio, recurring-income, monthly spending-plan, and Base-plan calculation contracts, also exposed to the browser.
- `api/portfolio/` — protected quote and snapshot endpoints.
- `supabase/migrations/` — account, holding, quote, snapshot, RLS, and per-asset contribution schema.
- `supabase/README.md` — Supabase and environment setup.

Mercury records and explains an owner’s portfolio; it does not offer investment advice, trading, or tax calculations.
