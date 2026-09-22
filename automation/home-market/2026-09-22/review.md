# Home market movement — 22 September 2026

Scope: approved Home net-worth precision, value-weighted market chart, default 1M range, and secondary recorded-value view. Version 0.2.9. No database, provider credential or Acadia vendor change.

## Behaviour

- Million-scale net worth uses two decimal places ($1.23m); exact cents remain in title and accessible label. Property equity remains in net worth.
- Home plots every common market date for the current investment basket using Portfolio's existing constant-share, starting-value-weighted calculation. Percentages, real date endpoints, source and exclusions are explicit. This is not personal historical return.
- 1D/1W/1M/1Y/5Y market ranges; 1D means the latest two shared observations within seven days. Recorded value uses the original snapshot ranges including All. All-time value change remains independent of the chart.
- Whole-portfolio coverage is required. Missing share counts, unsupported/foreign currency, absent or one-point histories produce an explanation; provider failures offer Retry. Cash-only shows zero movement without fabricated chart dates.
- Home and Portfolio reuse the in-memory five-minute cache and three-read queue. Range switching does not fetch again. Auth/account/route changes cannot receive late UI updates.

## Validation

`npm run check`: 311 tests pass, including syntax validation. `git diff --check`: clean. Domain tests independently exercise weighted multi-point series, changing relative prices, mixed calendars, 1D weekend gaps, 5Y coverage, zero/cash/missing data and rounding. Controller tests cover default monthly scope, retrying only failed holdings, Portfolio cache reuse, filter-independent Home totals, two-decimal net worth/exact cents, and rejection of late replies after account/route replacement. Existing recorded-history and Portfolio tests remain passing.

Isolated local browser with synthetic in-memory account/holding/property data (no private owner records or remote writes):

- Desktop 1440px, tablet 768px and phone 390px render the new chart and view selector without horizontal overflow. Both colour themes checked.
- 320px at 200% root text size wraps controls and content without horizontal overflow; page scrolling keeps the selector and chart reachable. Short Market / Recorded option labels avoid clipping at enlarged text while the full heading describes the selected chart.
- 1M default, keyboard ArrowRight to 1Y with matching selection/focus, 1D actual dated endpoints, recorded All view, return to market 1M.
- Provider failure withholds the entire chart. Retry restores the line, hides Retry and moves keyboard focus to the recovered percentage.
- Browser error log empty during the checked flows.

Screenshots: [desktop dark](desktop-dark.png), [desktop light](desktop-light.png), [tablet](tablet.png), [phone](phone.png), [recorded value](recorded-value.png), [large text](phone-large-text.png), [large-text chart controls](phone-large-text-chart.png).

## Freshness and operating cost

Read-only live calls through the existing public-history adapter returned 1,253 VFIAX observations (latest 2026-09-21T13:30:00Z) and 1,827 BTC/USD observations (latest 2026-09-22T00:00:00Z). The source is Yahoo Finance. No new API, key, paid tier or scheduled traffic; Home now invokes the same on-demand history reads as Portfolio, bounded to three at once and reused between views for five minutes.

Source inspection confirms the snapshot writer uses saved prices/manual values and does not refresh provider quotes. Repeated inputs can explain a flat saved-value chart, but the owner's actual saved quote timestamps and production scheduler were not queried or repaired. New market history is fetched independently; saved snapshots are retained unchanged.

## Evidence limits

Populated browser verification uses synthetic data. Live public-source checks are separate from authenticated production provider/owner-data acceptance. Physical-device assistive technology and production scheduler freshness are not claimed. No persistence changes require a migration or recovery drill.

## Publication

The implementation and evidence are delivered on main through the authorised Git-triggered deployment. Exact commit, remote and canonical asset verification are recorded in the completion message after publication.
