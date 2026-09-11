# Mercury

Mercury is a private personal-finance workspace. Home answers where the owner stands and what deserves review: current net worth, recorded portfolio history, three grouped investment metrics, investment allocation and four ranked assets. Portfolio leads with investment value and an interactive Brokerage/Retirement/Crypto breakdown alongside matching Cards or Table views. The groups show exact values, counts and percentage shares; retirement crypto belongs only to Retirement. A compact selector replaces the sidebar below 768px. The compact holdings toolbar wraps to its available width. Search shows a separate match count and Clear search preserves the selected group, view and sort; group counts stay beside unfiltered totals. Group selection and search affect records only; incomplete valuations withhold affected totals and every share. Allocation expands below investments, while property equity and weekly-equivalent Recurring totals sit beside their records. Native filtering/sorting, no-results recovery and missing-valuation repair remain available across device sizes. Income opens a monthly planning Overview with a balance-led Acadia summary, gross recurring source cards alongside compact annual dividend estimates, and explicit Edit dialogs; `#income/budget` opens monthly category-level spending limits. Planned balance subtracts planned spending and investing from expected income and is never presented as spendable cash. Plan presents one illustrative Base plan with a compact missing-input state, paired investment-value and annual portfolio-income outlooks, and explicit assumption sources. Incomplete investment valuations withhold the outlook; property equity remains separate.

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

Add asset keeps Symbol and Shares first, with optional recurring investments in a disclosure. Exact price/value previews and quote source/date appear when available; manual valuation recovery stays beside the required inputs. Once a holding is saved, quote-storage or account-reload failure opens its saved detail page with explicit recovery instead of offering Add again. Successful deletion returns directly to the updated Portfolio.

## Runtime model

- `/api/config` exposes only Supabase's public URL and anonymous key.
- `/api/portfolio/quotes` requires a signed-in user and calls Twelve Data server-side. It caches successful prices for five minutes and provider distribution data for one day; unavailable distribution data never invalidates a price quote. Twelve Data and Yahoo requests have four-second deadlines, including response bodies, within a shared ten-second lookup budget. Browser lookups allow 25 seconds for session recovery, authentication and provider work before aborting and exposing existing retry/manual-valuation recovery. Failed transport details are not returned to the browser.
- `/api/portfolio/snapshot` accepts the Vercel cron secret or a signed-in owner. Scheduled requests require a nonblank cron secret and upsert one daily account snapshot after the America/New_York market close. Missing or invalid holding valuations reject the write and preserve existing history. Authentication and snapshot storage requests time out after ten seconds; authentication outages return a retryable 503 response.
- Browser writes are limited by Supabase RLS. Provider and service-role credentials never reach the browser.

## Development and checks

No package installation is needed for the dependency-free checks.

- `npm test` — domain, quote-adapter, and snapshot behaviour.
- `npm run check` — syntax checks followed by the test suite. Vercel runs this command as its build gate for Git-triggered preview and production publication; failed checks prevent the new deployment from publishing. The output directory is explicitly `.` because this static application serves the repository-root assets and has no generated `public` folder.

## Key files

- `dashboard.js` — pure shared planning, investment allocation and distinct-date history calculations.
- `index.html`, `brokerage.js` — the private Home dashboard, hash-routed Portfolio, Income, and Plan workspaces, Asset pages, and simplified entry flows.
- `acadia.css`, `fonts/`, `assets/accordion-*.svg`, `assets/auth-divider.svg` — unchanged Acadia assets from published revision `d5408dd1df1840ff91727079f7270d6f9fd754ea`. `acadia-vendor.json` records their origin and hashes; the test suite checks integrity and that active Acadia class names have definitions. Table is included in the single stylesheet. `styles.css` contains only the phone editor action offset and the documented form box-sizing compatibility correction.
- `theme.js` — Acadia theme behaviour adapted for Mercury's System default and browser theme-colour metadata. Account menus expose System/Light/Dark at every navigation breakpoint.
- `portfolio.js`, `income.js`, `plan.js` — cent-based portfolio, recurring-income, monthly spending-plan, and Base-plan calculation contracts, also exposed to the browser.
- `api/portfolio/` — protected quote and snapshot endpoints.
- `supabase/migrations/` — account, holding, quote, snapshot, RLS, and per-asset contribution schema.
- `supabase/README.md` — Supabase and environment setup.

Mercury records and explains an owner’s portfolio; it does not offer investment advice, trading, or tax calculations.

## Updating Acadia

Use the published Acadia `main` revision, review its changelog and affected Component/Pattern contracts, then copy the complete stylesheet and its supporting assets without edits. Refresh `acadia-vendor.json` with the reviewed revision and hashes. Check for removed selectors and migrate their consumers before changing the pin; do not layer extracted component copies over an older stylesheet. Run `npm run check`, then verify the affected routes, themes, navigation boundaries, enlarged text, menus and forms in an isolated account. Record exceptions and evidence in `DESIGN-README.md` and the alignment review. Local unfinished Acadia edits are not a published dependency.
