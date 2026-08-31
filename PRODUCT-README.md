# Mercury Product

## Mission

Mercury is a private personal finance workspace. Its first shipped product surface is Brokerage: a calm, reliable place for one owner to record holdings and understand value, allocation, income, daily movement, and history without becoming a trading terminal or advice engine.

## Brokerage MVP

- Email magic-link sign-in for one private owner, backed by Supabase Postgres and row-level security.
- One reusable `Brokerage` account, in USD, ready for future account aggregation without exposing other modules yet.
- Forms for mutual funds, ETFs, stocks, crypto, cash, and other assets.
- Automatic Twelve Data quotes for eligible symbols, with quote source, as-of time, prior close, short server-side caching, retained last successful quote, and an explicit manual price or total-value fallback.
- Calculated market value, allocation, target/weekly split, expected annual return, distribution yield, annual income, policy fields, and day movement.
- Owner-only JSON export and daily America/New_York snapshots after market close. A history line appears only after two stored snapshots.

## Boundaries

- USD is the only MVP currency.
- Manual total value and shares × price remain mutually exclusive valuation bases. Mercury never silently chooses between them.
- A manual price or total value is authoritative when automatic quotes are unsupported or unavailable.
- Expected annual return is a planning assumption, not distribution yield or advice.
- No CSV import, brokerage credentials, cost basis, tax lots, realised gains, tax reporting, trading, alerts, advice, or projection calculator in this MVP.
- The prior public global-economy experience is legacy code only. It is not linked from the private product and must not provide portfolio data.

## Roadmap

1. Brokerage account and daily snapshot reliability. **Current MVP.**
2. Net Worth aggregation.
3. Retirement accounts.
4. Property.
5. Income.
6. Records.
7. Projections.

## Operational setup

Apply [`supabase/migrations/20260830_brokerage_mvp.sql`](supabase/migrations/20260830_brokerage_mvp.sql), configure the environment variables described in [`supabase/README.md`](supabase/README.md), and then use the private authentication flow. Until that configuration is present, Mercury intentionally presents a clearly labelled sample workspace rather than storing personal financial data.
