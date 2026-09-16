# Portfolio responsive page — 16 September 2026

## Reference and scope

Figma file `CSCV8qZu9ryspC07K36vTg`, section `110:10301`: desktop `110:7662`, tablet `226:8198`, phone `226:8989`. Read the section metadata and detailed header, summary, recurring-list and property-card contexts. Compared the supplied full-page reference with the local page at 1512px, 834px and 400px, plus a 320px boundary and 200% text.

This extends the existing Portfolio page. Preserve the later clean card, asset-exposure subtitle and whole-percent ring decisions. Founder clarified that the new summary measures recorded portfolio value change **including deposits and withdrawals**. No persistence, API, schema or private-record changes.

## Requirement-by-requirement check

| Requirement | Implementation and evidence |
| --- | --- |
| Portfolio heading/Add asset | Acadia Page Header, desktop inline and phone stacked; page ellipsis retains search and native sort. |
| Compact group/time/view controls | All/group disclosure; separate 32px desktop period pills; tablet/phone period disclosure; Cards/Table retained. Phone period/group triggers are at least 44px. |
| Two summary cards | Current all-investment value plus selected-period recorded account change. Regular smaller percentage captions. Positive/negative/zero use Acadia semantic colours. |
| Recorded change meaning | Same deduplicated daily snapshots and first/last range calculations as Home. Actual available dates and deposit/withdrawal/property scope visible. Current value and recorded endpoints remain distinct. |
| Filter independence | Summary and ring denominator stable through group, search, sort and Table/Cards switching. Selected-group value/count remain visible when scoped. |
| Shared period | 1W default, 1M/6M/1Y retained. Updates summary and each visible asset chart. Period remains available in Table view. |
| Asset cards | 32px padding, 24px gaps, 64px actual-share ring, 160px Acadia chart; three/two/one columns. Existing exposure labels and integer visible ring labels retained; tooltip/arc keep precision. |
| Recurring | Three summary columns on desktop/tablet, phone stack; saved 52/12 schedule equivalents; ellipsis opens Contribution editing. Back reveals and focuses the matching action. |
| Property | Compact identity/value/location and purchase-price movement. Existing details/actions disclosure retains exact movement, exclusions, equity/debt and appreciation/source. Edit/Cancel returns focus to the visible summary. Missing purchase price keeps repair. |
| State/recovery | One market observation stays a point; retry focus survives completion. Zero/one account snapshots withhold change; zero baseline withholds percentage. Existing broader missing valuation, allocation and provider checks remain passing. |
| Responsive/accessibility | Both themes at 1512/834/400/320px. Large-text tabs and opened menus fit 320px. Native menu Escape/focus and card Enter navigation checked. |
| Acadia and data boundaries | Shared Acadia source unchanged. Scoped composition adapters only. No source/private records reused as fixtures. |

## Verification

- `npm run check`: **262 passed, 0 failed**; syntax and full existing suite included.
- Two new controller regressions cover recorded-summary ranges, independence from holdings/search/view, missing observations, zero baseline, flat and negative change.
- Synthetic browser checks in `checks.json`: full interaction sequence, exact card geometry, both themes and four widths, enlarged-text containment and no browser errors.
- Final phone follow-up confirmed 44px minimum group/period targets after compact sizing was limited to desktop/tablet pointer use.
- `git diff --check`: clean.

## Visual comparison

- [Dark desktop](dark-desktop.png), [tablet](dark-tablet.png), [phone](dark-phone.png), [320px](dark-narrow-phone.png).
- [Light desktop](light-desktop.png), [tablet](light-tablet.png), [phone](light-phone.png), [320px](light-narrow-phone.png).
- [Phone card detail](dark-phone-cards.png), [large-text header](large-text-header.png), [large-text card](large-text-card.png).

Synthetic holdings/values intentionally differ from the Figma examples. Required metric-scope/date notes, recurring cadence explanation, allocation disclosure, natural text wrapping and accessible action targets add height beyond the illustrative reference. The existing web navigation is retained; native status-bar chrome is not simulated. Full-page phone captures position the fixed bottom navigation relative to the capture viewport.

## Delivery boundary

Local implementation, tests and synthetic browser evidence are complete. Commit/push, remote hash and live static-source verification are reported separately in the task delivery. This pass does not claim authenticated production writes, real provider responses, physical-device or VoiceOver acceptance.
