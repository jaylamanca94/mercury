# Mercury

Mercury is pivoting into a private personal portfolio and cash-flow tracker. The non-visual
portfolio domain layer is in place; the existing global-economy pages remain legacy interface code
until the portfolio experience is designed and implemented.

## Portfolio foundation

`portfolio.js` validates assets, their explicit valuation basis, allocation, planning rates,
distribution policies, and portfolio calculations. It is not yet connected to a user interface,
persistence layer, CSV importer, or price provider. See
[`docs/personal-finance-pivot.md`](docs/personal-finance-pivot.md).

## Legacy interface status

Mercury has a source-backed dashboard baseline. The page loads market pulse, economic health,
risk, and regional growth from public data routes when `/api/live-snapshot` is available. If the
route is unavailable, the UI shows loading or unavailable source states instead of fabricated
figures. Data coverage shows the latest available source release window, page-load check time,
cadence-aware freshness state, and live indicator counts for partially available source groups.
The product now follows the same high-level information architecture direction as Apollo: the home
page is a compact at-a-glance command center, while deeper pages carry the richer detail surfaces
for Markets, Market context, Indicators, and Data Coverage.
Source-backed metric cards keep the visible surface focused on name, value, change, and trend.
Provider attribution, freshness, proxy tickers, and broader source context live in Data coverage or
hover/detail context. Delayed, stale, or slower-cadence indicators keep date context when it affects trust.
Economy and market-context sections include Today, Week, Month, Year, and 5-year controls; Economy
also supports United States, Europe, and Asia market-proxy views. Longer market-history sparklines
are smoothed so year and 5-year views read as trend lines rather than noisy raw traces. The hero
briefing includes a period-aware aggregate trend built from the currently visible score-eligible
cards, excluding context-only moves such as oil and FX from the global read.

## Tech Stack

Recommended starting stack:

- Static HTML, CSS, and JavaScript for the first prototype
- Acadia-aligned local CSS adapter for layout, surfaces, controls, states, and responsive behavior
- Font Awesome Free via CDN for utility icons
- Vercel Serverless Functions for live data proxies
- Yahoo Finance chart data for market pulse, Bitcoin/USD, and daily risk proxies, including enough
  daily history for 5-year dashboard comparisons
- Public market proxy funds for comparable U.S., Europe, and Asia Economy market cards
- Public FRED CSV releases for economic indicators and financial stress
- World Bank API releases for regional annual GDP growth
- Environment variables for future API keys

Keep the first build simple until live source requirements are clearer.

## Planned Data Areas

- Market Pulse
- Economic Health
- Global Snapshot
- Risk and Confidence

## Candidate Data Sources

Candidate sources should be reviewed before implementation:

- Federal Reserve Economic Data
- Bureau of Labor Statistics
- Bureau of Economic Analysis
- U.S. Treasury and central bank sources
- OECD, World Bank, IMF, and similar public institutions
- Trusted market data APIs for broad index, commodity, currency, digital asset, and volatility snapshots

Every source should be evaluated for trust, cost, licensing, rate limits, update frequency, global coverage, and implementation complexity.

## Local Setup

No install step is required for the first prototype.

Open `index.html` in a browser to see unavailable source states, or run/deploy the site through
Vercel to enable `/api/live-snapshot`.

Optional validation commands:

- `npm test` - run the dependency-free Node regression tests for live snapshot helpers
- `npm run check` - syntax-check the browser and serverless JavaScript, then run the tests

Current files:

- `index.html` - static dashboard entry
- `markets.html` - regional and focused market detail page
- `supports.html` - currency, commodity, and Bitcoin detail page
- `indicators.html` - economic health plus risk and confidence detail page
- `data.html` - data coverage, provider, and freshness detail page
- `styles.css` - Acadia-aligned Mercury adapter plus economic dashboard styling
- `theme.js` - system-first light/dark theme preference and browser chrome sync for the static pages
- `app.js` - live snapshot loading, fallback states, and dashboard rendering
- `portfolio.js` - UI-independent portfolio data validation and calculations
- `tests/portfolio.test.js` - portfolio calculation and integrity regression coverage
- `assets/favicon.svg` - vector money-bill-wave favicon/app icon with theme-aware gradient background
- `site.webmanifest` - browser app manifest pointing to the SVG icon
- `api/live-snapshot.js` - Vercel Serverless Function for public Yahoo Finance, FRED, and World Bank releases
- `api/fred-snapshot.js` - compatibility export for the live snapshot handler
- `vercel.json` - Vercel-wide browser and API response-security policy

## Environment Variables

No environment variables are required yet. Current source bridges use public Yahoo Finance chart
responses, public FRED CSV downloads, and the World Bank API.

Expected future variables may include API keys for market or economic data providers.

## File Overview

- `AGENT-README.md` - Mercury product-agent workflow, approval rules, work modes, and output format
- `PRODUCT-README.md` - Mercury mission, goals, scope, decisions, roadmap, and known limitations
- `DESIGN-README.md` - Mercury design standards, UI utilities, chart guidance, and interaction guidance
- `README.md` - setup, stack, source direction, and file overview

## Deployment

Mercury can deploy as a static site on Vercel. Push to `main` to update the production deployment.

Do not deploy a personal-data experience until storage, authentication or local-only operation,
backup, export, and recovery expectations have been decided.

## Important Boundary

Mercury records and explains the owner's portfolio; it does not tell them what to buy, sell, hold,
or trade.
