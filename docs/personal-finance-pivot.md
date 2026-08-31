# Mercury personal-finance pivot

**Status:** Foundation in progress — no portfolio interface is implemented yet.

## Product boundary

Mercury is pivoting from a public global-economy dashboard to a private personal portfolio and
cash-flow tracker. Its first job is to let its owner understand what they hold, what it is worth,
how it is allocated, and what income or planned contributions it produces.

This is not a trading product, recommendation engine, tax adviser, or brokerage integration.

## V1 data contract

All currency is stored as integer USD cents. All rates are decimal fractions: `0.08` represents
8%. This avoids silent floating-point drift and makes CSV/import boundaries explicit.

Each asset requires an `id`, an `assetType`, and at least one of `symbol` or `name`. It chooses
exactly one valuation basis:

- `manual-value`: `manualValueCents` is authoritative. Use it when the known total is more
  accurate than a displayed or rounded price.
- `shares-and-price`: `shares` × `unitPriceCents` determines market value.

The two bases cannot be entered together. This protects against an import or edit silently
switching the value the owner regards as correct.

Optional portfolio-planning fields are:

- `expectedAnnualReturnRate` — an assumption for planning, not a quoted APY or prediction;
- `distributionYieldRate` — used to estimate annual income;
- `targetAllocationRate` and `weeklyContributionRate`;
- `dividendPolicy` and `capitalGainsPolicy`: `reinvest`, `transfer-to-bank`,
  `transfer-to-fund`, `hold-cash`, or `custom` with a written instruction;
- `previousValueCents` — the last trusted recorded portfolio value for day-movement calculation.

“Capital gains” instructions in the source spreadsheet are policies, not realised-gain records.
Realised gains, cost basis, tax lots, and tax reporting are explicitly deferred.

## Calculation contract

| Result | Rule |
| --- | --- |
| Market value | Manual value, or shares × price |
| Allocation | Asset value ÷ total portfolio value |
| Expected annual growth | Asset value × expected annual return |
| Estimated annual income | Asset value × distribution yield |
| Weekly contribution | Portfolio weekly contribution × asset contribution allocation |
| Day change | Current value − prior recorded value |

Portfolio-level day movement is unavailable until every tracked asset has a prior value. Mercury
must not display a partial total as if it covered the complete portfolio.

Targets and weekly allocations can be incomplete while the portfolio is being set up. Once all
assets have values, Mercury warns if either total is not 100%.

## Delivery stages

1. **Foundation:** maintain the calculation module, regression tests, and this contract.
2. **Import:** map a clean CSV export from the brokerage sheet into this contract. Import keeps
   a stated market value authoritative when source prices are rounded.
3. **Persistence:** choose local-only encrypted storage or authenticated sync before entering
   real data. Export and backup are required in either case.
4. **Portfolio workflow:** build the overview, asset table, and add/edit flow from this contract.
5. **Enrichment:** add manual snapshots first; consider an optional price provider only after
   source, privacy, licensing, freshness, and failure behaviour are settled.

## Legacy boundary

The existing public market, economy, market-context, indicator, and data-coverage routes remain
legacy interface code during the transition. They are not portfolio data sources and must not be
reused for personal financial storage. The responsive shell, theme handling, tests, and deployment
configuration remain reusable implementation infrastructure.
