# Mercury Product

## Mission

Mercury is a private personal finance workspace. Its first shipped product surface is Brokerage: a calm, reliable place for one owner to record holdings and understand value, allocation, income, daily movement, and history without becoming a trading terminal or advice engine.

## Home / Brokerage MVP

- Email magic-link sign-in for one private owner, backed by Supabase Postgres and row-level security.
- One reusable `Brokerage` account, in USD, ready for future account aggregation without exposing other modules yet.
- Home answers “Where do I stand, and what deserves review?” with current net worth, recorded portfolio history, three grouped investment metrics, investment allocation and four ranked assets. Property equity is included only in current net worth; snapshot differences remain investment-only portfolio value change. The full trend requires 30 distinct daily snapshots in the selected range.
- Portfolio answers “What do I own, and where is it concentrated?” One precise selected-group value leads the holdings, with a compact sidebar for All investments, Brokerage, Retirement and Crypto showing values, counts and allocation shares. Retirement takes precedence over Crypto; each holding belongs to one group. These are classifications inside the existing account, not connected account balances. A compact native selector replaces the sidebar below 768px. Search and sort act on the selected group, with Cards/Table continuity and unfiltered group totals and counts. Search reports matches separately; Clear search preserves the group, view and sort. Empty groups offer View all investments. Incomplete valuations withhold affected totals and all shares. Expandable portfolio-wide allocation stays unfiltered; property equity and weekly-equivalent recurring totals sit beside their respective sections. Unvalued holdings remain visible for correction. Cards and Table are peer views with preserved search/filter/sort state, and every revisit starts on Cards. Grouped recurring schedules sit alongside property on larger screens and stack on phones. Recurring Edit opens directly at Contribution; property cards lead with equity. Income answers “What is expected, and how is it allocated?” with Overview/Budget routes, monthly-default planning, a balance-led summary and sources alongside annual dividend evidence. Add income/category is the primary page action for its respective view; explicit editing dialogs preserve saved cadences.
- Plan presents one illustrative Base plan from current investments and recurring contributions. A compact readiness state explains missing inputs before paired investment-value and annual portfolio-income outlooks appear. Complete valuation coverage is required. Plan automatically weights each valued holding’s saved return assumption or available historical annualised return by its current value, and inherits annual estimated dividends divided by portfolio value as yield. Historical returns are an illustrative baseline, not an expected future outcome. Every positive-value holding needs return coverage; missing or unsupported rates withhold the outlook. Optional saved return/yield overrides apply only to Plan, with sources identified explicitly; property equity stays separate from the projections. Named scenarios, salary, expense, tax and mortgage modelling remain outside this surface.
- The Add asset dialog asks for symbol, shares, an optional recurring contribution cadence behind a disclosure, and whether the holding is a retirement asset. Automatic lookup runs once symbol and shares are valid, then previews the exact unit price and calculated holding value with visible source/date; unavailable quotes reveal a manual price or authoritative total-value fallback beside the core inputs. Switching symbols clears the previous manual valuation. A saved asset opens its dedicated detail page, where retirement classification, shares, dollar contribution/cadence, policies, planning, allocation, and yield fields can be maintained or the asset can be deleted after explicit confirmation. Deletion cascades to its quotes while historical account snapshots remain intact.
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
- No CSV import, brokerage credentials, cost basis, tax lots, realised gains, tax reporting, trading, alerts, advice, or advanced scenario calculator in this MVP.
- The prior public global-economy experience is legacy code only. It is not linked from the private product and must not provide portfolio data.
- Home uses only canonical Acadia styles, components, patterns, utilities, icons, responsive navigation, and font assets. Mercury does not maintain a local visual adapter or custom component styling.

## Roadmap

1. Brokerage account and daily snapshot reliability. **Current MVP.**
2. Preferences/data safeguards.
3. Income. **Current MVP.**
4. Plan. **Single Base plan implemented.**
5. Net Worth aggregation, retirement accounts, Property, and Records.
6. Projections.

## Operational setup

Apply [`supabase/migrations/20260830_brokerage_mvp.sql`](supabase/migrations/20260830_brokerage_mvp.sql), [`supabase/migrations/20260901_asset_contribution.sql`](supabase/migrations/20260901_asset_contribution.sql), [`supabase/migrations/20260901_quote_dividend_data.sql`](supabase/migrations/20260901_quote_dividend_data.sql), and [`supabase/migrations/20260902_income_sources.sql`](supabase/migrations/20260902_income_sources.sql), configure the environment variables described in [`supabase/README.md`](supabase/README.md), and then use the private authentication flow. Until that configuration is present, Mercury presents an empty disabled workspace rather than storing or fabricating personal financial data.
