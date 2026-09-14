# Mercury Product

## Mission

Mercury is a private personal finance workspace. Its first shipped product surface is Brokerage: a calm, reliable place for one owner to record holdings and understand value, allocation, income, daily movement, and history without becoming a trading terminal or advice engine.

## Release state

0.0.6 applies the Home wide-chart/four-summary/four-asset layout, daily short ranges and purchase-price/share context. It retains the existing valuation and history semantics. 0.0.5 added daily asset market-price charts with 1M/3M/1Y/5Y ranges, independently of personal returns and holding size. 0.0.4 added optional property purchase prices and gain/loss in dollars and percent, retaining the Portfolio refinement and published Acadia 0.3.2. Plan retains revision-aware saves and recovery from 0.0.2. A failed settings read withholds the saved rates/policy and provides Retry settings. Live disposable-data checks confirm Plan revision and uniqueness enforcement; full browser authentication, other editor concurrency, migration-rebuild and physical-device acceptance remain open, so 1.0.0 is not warranted.

## Home / Brokerage MVP

- Email magic-link sign-in for one private owner, backed by Supabase Postgres and row-level security.
- One reusable `Brokerage` account, in USD, ready for future account aggregation without exposing other modules yet.
- Home answers “Where do I stand, and what deserves review?” with current net worth, recorded portfolio history with gentle curves, followed by a grouped summary of all-time/day changes and annual growth/dividend estimates, investment allocation and four ranked assets. Property equity is included only in current net worth; All-time change compares current investments with the first recorded snapshot and stays independent of the history range; Day change compares current holdings with previous market-close prices. Both show dollar and percentage movement. All-time value change includes deposits and withdrawals, rather than representing investment returns. Missing valuations/baselines withhold affected values; a zero baseline has no percentage. Home plots every available recorded date: a single point for one record, a line from two records, and an honest empty state before recording starts. Home’s Expected annual growth is calculated automatically as the sum of each investment’s current value multiplied by its provider historical annualised return. Manual return assumptions do not affect this metric. Pending or incomplete history/valuation coverage withholds the estimate; historical performance is not a forecast.
- Portfolio answers “What do I own, and where is it concentrated?” One precise selected-group value leads the holdings. Compact native filters for All investments, Brokerage, Retirement and Crypto share one layout across screen sizes; the selected group shows a checkmark and its value, count and allocation share together. Retirement takes precedence over Crypto; each holding belongs to one group. These are classifications inside the existing account, not connected account balances. The adaptive Acadia grid gives holdings the full content width and reduces columns as space becomes constrained. Search and sort act on the selected group, with Cards/Table continuity and unfiltered group totals and counts. Search reports matches separately; Clear search preserves the group, view and sort. Empty groups offer View all investments. Incomplete valuations withhold affected totals and all shares. Expandable portfolio-wide allocation stays unfiltered; property equity and weekly-equivalent recurring totals sit beside their respective sections. Unvalued holdings remain visible for correction. Cards and Table are peer views with preserved search/filter/sort state, and every revisit starts on Cards. Grouped recurring schedules sit alongside property on larger screens and stack on phones. Recurring Edit opens directly at Contribution; property cards lead with equity. An optional original purchase price enables value change since purchase (current market value minus purchase price), with percentage relative to purchase price. This excludes debt, fees, improvements, taxes and rental income; it is not net profit or a tax gain. Existing prices remain unknown until entered; zero purchase prices show a dollar change without a percentage. Income answers “What is expected, and how is it allocated?” with Overview/Budget routes, monthly-default planning, a balance-led summary and sources alongside annual dividend evidence. Add income/category is the primary page action for its respective view; explicit editing dialogs preserve saved cadences.
- Plan presents one illustrative Base plan from current investments and recurring contributions. A compact readiness state explains missing inputs before paired investment-value and annual portfolio-income outlooks appear. Complete valuation coverage is required. Plan automatically weights each valued holding’s saved return assumption or available historical annualised return by its current value, and inherits annual estimated dividends divided by portfolio value as yield. Historical returns are an illustrative baseline, not an expected future outcome. Every positive-value holding needs return coverage; missing or unsupported rates withhold the outlook. Optional saved return/yield overrides apply only to Plan, with sources identified explicitly; property equity stays separate from the projections. Named scenarios, salary, expense, tax and mortgage modelling remain outside this surface.
- The Add asset dialog asks for symbol, shares, an optional recurring contribution cadence behind a disclosure, and whether the holding is a retirement asset. Automatic lookup runs once symbol and shares are valid, then previews the exact unit price and calculated holding value with visible source/date; unavailable quotes reveal a manual price or authoritative total-value fallback beside the core inputs. Switching symbols clears the previous manual valuation. A saved asset opens its dedicated detail page, where retirement classification, shares, dollar contribution/cadence, policies, planning, allocation, and yield fields can be maintained or the asset can be deleted after explicit confirmation. Deletion cascades to its quotes while historical account snapshots remain intact.
- Forms support mutual funds, ETFs, stocks, crypto, cash, and other assets.
- Automatic Twelve Data quotes for eligible symbols, with quote source, as-of time, prior close, provider annual-distribution data where available, short server-side caching, retained last successful quote, and an explicit manual price or total-value fallback.
- Calculated market value, allocation, target/weekly split, expected annual return, per-asset distribution yield, portfolio annual income/yield, policy fields, and day movement. A manual distribution yield remains an explicit owner override.
- Daily America/New_York snapshots run after market close. Home shows a point from the first recorded date and a line from two dates in the selected range. The owner-only export boundary remains private and is not exposed on Home.

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

Follow [`supabase/README.md`](supabase/README.md) to reconcile the existing migration baseline before applying schema changes, then configure the documented environment variables and private authentication flow. Until configured, Mercury presents a dedicated configuration state with retry. Temporary account-read failures have their own recovery state; neither is shown as an empty portfolio.
