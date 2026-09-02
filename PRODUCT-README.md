# Mercury Product

## Mission

Mercury is a private personal finance workspace. Its first shipped product surface is Brokerage: a calm, reliable place for one owner to record holdings and understand value, allocation, income, daily movement, and history without becoming a trading terminal or advice engine.

## Home / Brokerage MVP

- Email magic-link sign-in for one private owner, backed by Supabase Postgres and row-level security.
- One reusable `Brokerage` account, in USD, ready for future account aggregation without exposing other modules yet.
- Home follows the Figma dashboard composition with four facts: current portfolio value, selected-period change, expected annual return, and annual dividends. The period change appears only after two authentic snapshots for the selected range. Expected annual return is value-weighted from recorded planning assumptions only when every valued holding has one; otherwise it is clearly shown as not set. Performance, the first four matching holdings, and target coverage/attention follow beneath. Its Investments preview can be searched, sorted by value/name/recent update, and filtered by instrument types that actually exist in the Brokerage account.
- Portfolio is the full authenticated holdings workspace: it has independent search and sorting, every matching holding, quick add, and Asset-detail navigation. Its filters are All, Brokerage, Crypto, and an unavailable Retirement placeholder. Income is an authenticated planning workspace for saved recurring gross sources and live portfolio dividends, with Year/Month estimates, source management, search, and dividend sorting. Plan remains unavailable.
- The Add asset dialog asks only for symbol and shares. Automatic lookup runs once both are valid; unavailable quotes reveal a manual price or authoritative total-value fallback. A saved asset opens its dedicated detail page, where shares, dollar contribution/cadence, policies, classification, planning, allocation, and yield fields can be maintained or the asset can be deleted after explicit confirmation. Deletion cascades to its quotes while historical account snapshots remain intact.
- Forms support mutual funds, ETFs, stocks, crypto, cash, and other assets.
- Automatic Twelve Data quotes for eligible symbols, with quote source, as-of time, prior close, provider annual-distribution data where available, short server-side caching, retained last successful quote, and an explicit manual price or total-value fallback.
- Calculated market value, allocation, target/weekly split, expected annual return, per-asset distribution yield, portfolio annual income/yield, policy fields, and day movement. A manual distribution yield remains an explicit owner override.
- Daily America/New_York snapshots run after market close. A history line appears only after two stored snapshots. The owner-only export boundary remains private and is not exposed on Home.

## Boundaries

- USD is the only MVP currency.
- Manual total value and shares × price remain mutually exclusive valuation bases. Mercury never silently chooses between them.
- A manual price or total value is authoritative when automatic quotes are unsupported or unavailable.
- Expected annual return is a planning assumption, not distribution yield or advice.
- Income source values are expected gross amounts at a recurring cadence, not received deposits, bank-linked activity, tax treatment, or a budget.
- No CSV import, brokerage credentials, cost basis, tax lots, realised gains, tax reporting, trading, alerts, advice, or projection calculator in this MVP.
- The prior public global-economy experience is legacy code only. It is not linked from the private product and must not provide portfolio data.
- Home uses only canonical Acadia styles, components, patterns, utilities, icons, responsive navigation, and font assets. Mercury does not maintain a local visual adapter or custom component styling.

## Roadmap

1. Brokerage account and daily snapshot reliability. **Current MVP.**
2. Preferences/data safeguards.
3. Income. **Current MVP.**
4. Plan.
5. Net Worth aggregation, retirement accounts, Property, and Records.
6. Projections.

## Operational setup

Apply [`supabase/migrations/20260830_brokerage_mvp.sql`](supabase/migrations/20260830_brokerage_mvp.sql), [`supabase/migrations/20260901_asset_contribution.sql`](supabase/migrations/20260901_asset_contribution.sql), [`supabase/migrations/20260901_quote_dividend_data.sql`](supabase/migrations/20260901_quote_dividend_data.sql), and [`supabase/migrations/20260902_income_sources.sql`](supabase/migrations/20260902_income_sources.sql), configure the environment variables described in [`supabase/README.md`](supabase/README.md), and then use the private authentication flow. Until that configuration is present, Mercury presents an empty disabled workspace rather than storing or fabricating personal financial data.
