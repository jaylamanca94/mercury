# Mercury Product

## Mission

Mercury is a private personal finance workspace. Its first shipped product surface is Brokerage: a calm, reliable place for one owner to record holdings and understand value, allocation, income, daily movement, and history without becoming a trading terminal or advice engine.

## Home / Brokerage MVP

- Email magic-link sign-in for one private owner, backed by Supabase Postgres and row-level security.
- One reusable `Brokerage` account, in USD, ready for future account aggregation without exposing other modules yet.
- Home answers “Where do I stand, and what deserves review?” with current net worth, monthly planned balance, factual review items, investment allocation and four ranked assets. Property equity is included only in current net worth; snapshot differences remain investment-only portfolio value change. The full trend requires 30 distinct daily snapshots in the selected range.
- Portfolio answers “What do I own, and where is it concentrated?” Its stable investment/property/recurring summary reports a weekly equivalent before an Investments-only toolbar; portfolio-wide allocation stays unfiltered. Cards and Table are peer views with preserved search/filter/sort state, and every revisit starts on Cards. Property and recurring schedules retain existing workflows. Income answers “What is expected, and how is it allocated?” with Overview/Budget routes, monthly-default planning, annual dividend evidence and explicit editing dialogs.
- The Add asset dialog asks for symbol, shares, an optional recurring contribution cadence, and whether the holding is a retirement asset. Automatic lookup runs once symbol and shares are valid, then previews the source-backed unit price and calculated holding value; unavailable quotes reveal a manual price or authoritative total-value fallback. A saved asset opens its dedicated detail page, where retirement classification, shares, dollar contribution/cadence, policies, planning, allocation, and yield fields can be maintained or the asset can be deleted after explicit confirmation. Deletion cascades to its quotes while historical account snapshots remain intact.
- Forms support mutual funds, ETFs, stocks, crypto, cash, and other assets.
- Automatic Twelve Data quotes for eligible symbols, with quote source, as-of time, prior close, provider annual-distribution data where available, short server-side caching, retained last successful quote, and an explicit manual price or total-value fallback.
- Calculated market value, allocation, target/weekly split, expected annual return, per-asset distribution yield, portfolio annual income/yield, policy fields, and day movement. A manual distribution yield remains an explicit owner override.
- Daily America/New_York snapshots run after market close. A history line appears only after 30 distinct daily snapshots in the selected range. The owner-only export boundary remains private and is not exposed on Home.

## Boundaries

- USD is the only MVP currency.
- Manual total value and shares × price remain mutually exclusive valuation bases. Mercury never silently chooses between them.
- A manual price or total value is authoritative when automatic quotes are unsupported or unavailable.
- Expected annual return is a planning assumption, not distribution yield or advice.
- Planned balance uses expected gross recurring sources plus estimated dividends (including reinvested distributions), less planned category spending and saved recurring investing. It is a planning calculation, never available cash or confirmed bank activity. Missing required coverage makes dependent totals unavailable. Budget remains category totals only, with canonical monthly amounts.
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
