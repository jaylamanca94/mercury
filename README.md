# Mercury

Version **0.0.6** — Home adopts the new wide-chart layout with four summary cards and a full-width Top assets row. Asset market history and property purchase prices remain available. The product remains pre-1.0 until the documented authentication, migration and device acceptance gates pass.

Mercury is a private personal-finance workspace. Home answers where the owner stands and what deserves review: current net worth beside a full-width unboxed recorded-history chart, four separate cards for day change, all-time change, annual growth and dividend estimates, then four ranked assets with unit-price/share or property purchase-price context. The 1D/1W/1M/1Y/All controls filter saved daily records, relative to the latest saved date; they do not imply intraday observations. Allocation is available in Portfolio. Portfolio leads with the selected investment value and matching Cards or Table views. Shared native filter buttons select All investments, Brokerage, Retirement or Crypto on every screen, with a visible checkmark on the current group. Its precise value, count and percentage share stay together; retirement crypto belongs only to Retirement. An adaptive Acadia grid gives cards room on tablets and uses more columns on wider screens. The compact holdings toolbar wraps to its available width. Search shows a separate match count and Clear search preserves the selected group, view and sort; group counts stay beside unfiltered totals. Group selection and search affect records only; incomplete valuations withhold affected totals and every share. Allocation expands below investments, while property equity and weekly-equivalent Recurring totals sit beside their records. Add an optional purchase price in the property editor to see current market value minus purchase price, in dollars and percent. This value change excludes debt, costs and rental income; equity remains market value minus debt. Native filtering/sorting, no-results recovery and missing-valuation repair remain available across device sizes. Income opens a monthly planning Overview with a balance-led Acadia summary, gross recurring source cards alongside compact annual dividend estimates, and explicit Edit dialogs; `#income/budget` opens monthly category-level spending limits. Planned balance subtracts planned spending and investing from expected income and is never presented as spendable cash. Plan presents one illustrative Base plan with a compact missing-input state, paired investment-value and annual portfolio-income outlooks, and explicit assumption sources. Incomplete investment valuations withhold the outlook; property equity remains separate.

## Setup

1. Create a Supabase project and enable email magic-link authentication.
2. Follow [`supabase/README.md`](supabase/README.md) to reconcile the existing migration baseline before applying schema changes. Older filenames share version prefixes; do not run a blanket migration push.
3. Configure these Vercel environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `TWELVE_DATA_API_KEY` (server only)
   - `CRON_SECRET` (server only)
4. Add the deployment and local-preview URLs to Supabase Auth redirect URLs.

Missing configuration and failed account reads now show a dedicated recovery surface with Try again. Private workspaces stay hidden until the initial read succeeds; a failed read never appears as an empty account. Mercury never persists personal financial data locally or substitutes placeholder holdings.

Add asset keeps Symbol and Shares first, with optional recurring investments in a disclosure. Exact price/value previews and quote source/date appear when available; manual valuation recovery stays beside the required inputs. Once a holding is saved, quote-storage or account-reload failure opens its saved detail page with explicit recovery instead of offering Add again. Successful deletion returns directly to the updated Portfolio.

Asset detail shows daily USD market prices per share or unit with 1M, 3M, 1Y and 5Y ranges. The period movement compares the first and last available market observations in the selected calendar window; it is independent of owned shares, purchase price and contributions, and excludes dividends. Visible endpoints show actual coverage; newly listed or sparsely quoted assets may have less history than the selected range. Daily observations can include the current session and are not an intraday feed. An unsupported asset, empty range or failed provider read has an explicit state. Your holding value and saved valuation inputs remain separate below the chart.

## Runtime model

- `/api/config` exposes only Supabase's public URL and anonymous key. Configuration/session/account reads and each account collection have ten-second deadlines. Optional collection failures leave the loaded investment workspace usable. Plan recovery retries only settings and withholds unknown saved rates/policy. Plan edits compare the revision captured when the dialog opens; conflicts retain the draft and require closing/reopening to review the latest settings. A timed-out save is unconfirmed, never reported as saved. Property recovery retries only properties, preserves other state and restores keyboard focus. Superseded account reads and provider metric batches cannot overwrite a newer in-memory account context. Initial Plan defaults use insert-if-absent semantics so concurrent settings survive.
- `/api/portfolio/quotes` requires a signed-in user and calls Twelve Data server-side. It caches successful prices for five minutes and provider distribution data for one day; unavailable distribution data never invalidates a price quote. Twelve Data and Yahoo requests have four-second deadlines, including response bodies, within a shared ten-second lookup budget. Browser lookups allow 25 seconds for session recovery, authentication and provider work before aborting and exposing existing retry/manual-valuation recovery. Failed transport details are not returned to the browser.
- `/api/portfolio/snapshot` accepts the Vercel cron secret or a signed-in owner. Scheduled requests require a nonblank cron secret and upsert one daily account snapshot after the America/New_York market close. Missing or invalid holding valuations reject the write and preserve existing history. Authentication and snapshot storage requests time out after ten seconds; authentication outages return a retryable 503 response.
- Browser writes are limited by Supabase RLS. Provider and service-role credentials never reach the browser.

## Development and checks

No package installation is needed for the dependency-free checks.

- `npm test` — domain, quote-adapter, and snapshot behaviour.
- `npm run check` — syntax checks followed by the test suite. Vercel runs this command as its build gate for Git-triggered preview and production publication; failed checks prevent the new deployment from publishing. The output directory is explicitly `.` because this static application serves the repository-root assets and has no generated `public` folder.

## Key files

- `acadia-card-trend.mjs` — unchanged Acadia curve utility from published `686c30d3400a7d71554a8e50e09b6a54a8b6aa1a`, with per-file provenance in `acadia-vendor.json`. Home imports it through its module entry point; stylesheet provenance is tracked separately.
- `dashboard.js` — pure shared planning, investment allocation and distinct-date history calculations.
- `index.html`, `brokerage.js` — the private Home dashboard, hash-routed Portfolio, Income, and Plan workspaces, Asset pages, and simplified entry flows.
- `acadia.css`, `fonts/`, `assets/accordion-*.svg`, `assets/auth-divider.svg` — unchanged Acadia assets from published Acadia 0.3.1 revision `ebe4b47a582c8295fde5de1fe56bcce7181bd0a1`. `acadia-vendor.json` records their origin and hashes; the test suite checks integrity and that active Acadia class names have definitions. Table is included in the single stylesheet. `styles.css` contains only the phone editor action offset and the documented form box-sizing compatibility correction.
- `theme.js` — Acadia theme behaviour adapted for Mercury's System default and browser theme-colour metadata. Account menus expose System/Light/Dark at every navigation breakpoint.
- `portfolio.js`, `income.js`, `plan.js` — cent-based portfolio, recurring-income, monthly spending-plan, and Base-plan calculation contracts, also exposed to the browser.
- `api/portfolio/` — protected quote and snapshot endpoints.
- `supabase/migrations/` — account, holding, quote, snapshot, RLS, and per-asset contribution schema.
- `supabase/README.md` — Supabase and environment setup.

Mercury records and explains an owner’s portfolio; it does not offer investment advice, trading, or tax calculations.

## Updating Acadia

Use the published Acadia `main` revision, review its changelog and affected Component/Pattern contracts, then copy the complete stylesheet and its supporting assets without edits. Refresh `acadia-vendor.json` with the reviewed revision and hashes. Check for removed selectors and migrate their consumers before changing the pin; do not layer extracted component copies over an older stylesheet. Run `npm run check`, then verify the affected routes, themes, navigation boundaries, enlarged text, menus and forms in an isolated account. Record exceptions and evidence in `DESIGN-README.md` and the alignment review. Local unfinished Acadia edits are not a published dependency.

### Asset market history

`GET /api/portfolio/quotes?history=1&symbol=…&instrumentType=…` requires the existing authenticated session. It reuses the existing Yahoo Finance source bridge for up to five years of daily USD quote closes, excluding the dividend-adjusted series used by historical-return estimates. The response includes real observation timestamps, unit prices, currency and source. Provider reads have the existing four-second request deadline; the UI has a 20-second overall limit including session/authentication. A bounded five-minute server cache contains only public market prices; the browser keeps the current asset response in memory and clears it on exit/sign-out. No new credentials, persistence or migration. Range changes filter the already loaded history and preserve the holding form draft.
