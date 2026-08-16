# Mercury — Design Status

> **Active-flow headline:** the current Home unavailable-data journey is healthy from ultra desktop through iPhone; source-backed success remains regression-tested but is not current deployed-browser evidence.

**Last reviewed:** 2026-08-16
**Canonical sources:** `FLOW-REGISTRY.md`, `PRODUCT-README.md`, `DESIGN-README.md`, `automation/review/2026-08-10/product-review.md`

## Verified Signals

| Signal | Current status |
| --- | --- |
| User flows | Seven canonical flows; none removed or merged during this audit |
| Screens / views | Dashboard, Markets, Market context, Indicators, and Data Coverage inspected against a live local-serverless response |
| Flow gaps | Current healthy mobile capture covers Dashboard-to-Markets; Market context, Indicators, and Data Coverage are healthy-desktop verified but not re-captured on mobile in this pass |
| Design debt | Home recovery hierarchy corrected: complete-outage recovery now sits immediately beneath the unavailable chart rather than after unavailable market and signal cards |
| Complexity hotspots | Mixed-cadence source data and the Dashboard’s broad `Global Economy` framing remain the dominant product-comprehension risk |
| Dead ends | Complete-outage Home keeps its failure explanation, Retry refresh, and Data Coverage adjacent to the affected chart; none observed in the reviewed routes |
| Duplicate patterns | Complete-outage recovery is consistently compact and actionable; no new parallel state pattern added |
| Empty / error / loading gaps | Healthy, partial, delayed, stale, and unavailable Dashboard states captured; the last three degraded states use disposable response fixtures over the existing source-backed app |
| Responsive gaps | Figma-aligned Home checked at 1728, 1440, 1280, 834, 744, and 390 CSS pixels with no horizontal page overflow; other routes retain their existing mobile evidence boundary |
| Accessibility gaps | Semantics and dynamic status text are present in inspected DOM. Keyboard order, screen-reader announcements, contrast, zoom/reflow, and touch-device behaviour still require device-assisted testing |
| Acadia exceptions | Mercury keeps domain-specific freshness labels, economic movement colours, and charts local while using the existing Acadia shell, controls, badge, focus, and mobile-dock contracts |
| Acadia graduation candidates | None verified: the corrected state labels are domain-specific source-freshness semantics, not yet a proven neutral shared primitive |
| Unvalidated features | Deployed-environment configuration and market-data licensing are outside this local verification pass |

## Incomplete Flows And Missing States

- No implemented product flow is blocked in the inspected local-serverless environment.
- Healthy mobile captures for Market context, Indicators, and Data Coverage are not refreshed in this pass.
- Production/deployed verification remains unproven; the local Vercel-compatible preview does not establish deployment configuration, cache behaviour, or licensing clearance.

## Ranked Design Opportunities

1. **Verify healthy mobile detail states — highest impact, Market context, Indicators, and Data Coverage.** The current browser pass confirms Home’s unavailable-state shell; the three detail routes still need current healthy mobile captures before release.
2. **Keep freshness adjacent to the first desktop read — high impact, Dashboard, Markets, Market context, and Indicators.** Mobile makes its source state explicit in the first card; a similarly concise desktop cue would reduce the need to infer trust from a lower-page Data Coverage panel.
3. **Define the graph-stage success criterion — high impact, Home and Markets.** Keep it blank until source-backed data can answer one scoped question; do not fill the prominent Home stage with decorative charting.
