# Mercury Product

## Overview

Mercury is becoming a private personal portfolio and cash-flow tracker. It gives one owner a clear
view of what they hold, what it is worth, how it is allocated, and what expected growth, income,
and planned contributions it represents.

The product is in transition: the existing public global-economy pages are legacy interface code
until the portfolio workflow replaces them. They do not define the product's future scope.

## Mission

Make a personal portfolio understandable and maintainable in one calm, reliable workspace.

## Product discipline

- Keep the first release focused on recording, calculating, and understanding the owner's assets.
- Treat an entered manual value or a shares-and-price calculation as an explicit source of truth;
  do not silently reconcile the two.
- Present assumptions, income estimates, targets, and movements as descriptive planning data, not
  advice, recommendations, or predictions.
- Protect privacy and portability: do not add real-data storage, brokerage access, or data sharing
  without a deliberate security, backup, and export decision.
- Defer tax lots, realised gains, trading, recommendations, automatic brokerage import, and
  investment guidance.

## V1 scope

- One owner, one base currency, and manually entered or CSV-imported assets.
- An asset may be valued by either a stated total value or shares multiplied by a price.
- Portfolio value, allocation, targets, expected annual growth, estimated annual income, day
  movement once a complete baseline exists, and weekly contribution planning.
- Dividend and capital-gains handling as explicit policies: reinvest, transfer, hold cash, or a
  custom instruction.
- Export and backup before any real portfolio data is relied upon.

## Explicitly out of scope for V1

- Trading, buy/sell/hold recommendations, or personalised financial advice.
- Brokerage credentials or automatic brokerage connections.
- Tax calculations, realised-gain reporting, cost basis, or tax lots.
- A public market commentary dashboard.

## Current foundation

`portfolio.js` defines the portfolio data and calculation contract. It stores monetary values as
integer cents and rates as decimals, rejects ambiguous valuation inputs, and reports incomplete
day-movement or allocation data rather than inventing totals. See
[`docs/personal-finance-pivot.md`](docs/personal-finance-pivot.md) for the complete contract and
delivery sequence.

## Roadmap

1. Build and test the portfolio data layer. **In progress.**
2. Import a clean CSV export while preserving authoritative stated market values. **Next.**
3. Decide storage, backup, and synchronisation before entering real data. **Required before use.**
4. Build the portfolio interface against the settled contract. **Deferred pending design.**
5. Consider optional price data only after privacy, source, licensing, freshness, and fallback
   behaviour are defined. **Deferred.**
