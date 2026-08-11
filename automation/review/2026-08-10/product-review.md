# Mercury Product Review

**Review date:** 2026-08-10
**Product:** Mercury
**Core job:** Help a curious, non-specialist user understand current global economic conditions quickly, neutrally, and with enough freshness context to trust the read.

## Verdict

The local Vercel-compatible preview completed the core source-backed Dashboard-to-Markets journey on desktop and at 390×844. Market Supports, Indicators, and Data Coverage also rendered healthy source-backed data on desktop. The iPhone-sized Dashboard clearly distinguished full, partial, delayed, stale, and unavailable data after two focused state-label fixes.

This is local release evidence, not production proof: it confirms the existing handler and client in a local serverless environment. It does not confirm deployed configuration, cache behaviour, or market-data licensing.

## Accepted Evidence

| Step | Capture | What it verifies |
| --- | --- | --- |
| 1 | `screenshots/01-dashboard-desktop-live.png` | Healthy source-backed Dashboard first scan and Data Coverage summary on desktop. |
| 2 | `screenshots/02-markets-desktop-live-europe-sorted.png` | Dashboard-to-Markets route, Europe region control, and return-low-to-high sorting. |
| 3 | `screenshots/03-market-supports-desktop-live.png` | Healthy currencies, commodities, and digital-asset context. |
| 4 | `screenshots/04-indicators-desktop-live.png` | Defect evidence: a healthy Indicators response incorrectly displayed `Unavailable`. |
| 5 | `screenshots/05-indicators-desktop-live-corrected.png` | Corrected Indicators hero announces `Current` with healthy source-backed cards. |
| 6 | `screenshots/06-data-coverage-desktop-live.png` | Four current data groups remain separate from configured provider inventory. |
| 7 | `screenshots/08-dashboard-mobile-live-viewport.png` | Healthy Dashboard first scan at 390×844. |
| 8 | `screenshots/09-markets-mobile-live-viewport.png` | Mobile Dashboard-to-Markets drill-down. |
| 9 | `screenshots/10-dashboard-mobile-unavailable-viewport.png` | Complete-outage explanation, Retry refresh, Data Coverage, and disabled controls. |
| 10 | `screenshots/11-dashboard-mobile-partial-fixture.png` | Partial coverage remains usable and visibly cautious. |
| 11 | `screenshots/12-dashboard-mobile-delayed-fixture.png` | Delayed freshness is now explicit. |
| 12 | `screenshots/13-dashboard-mobile-stale-fixture.png` | Stale freshness is explicit and visually distinct. |

## Verified Findings

- The core Dashboard-to-Markets journey succeeds on desktop and iPhone-sized viewports. Region selection and market-return sorting produce a matching updated title, cards, and live status announcement.
- Current source health distinguishes four live data groups from configured provider inventory. This avoids presenting source names as proof of a live response.
- Complete outage preserves the explanation, retry, Data Coverage route, and control availability state before non-essential content.
- The review found and fixed two trust failures: healthy Indicators data no longer labels itself unavailable; mobile delayed data no longer collapses into a generic partial label.

## Evidence Limits

- Healthy data came from the live public handler through local Vercel-compatible development. Partial, delayed, and stale captures use disposable response fixtures that only alter the returned state for browser QA; they do not claim those conditions occurred in public sources at review time.
- The unavailable capture uses the ordinary static fallback, proving client recovery behaviour but not a deployed outage.
- The browser’s full-page mobile screenshot distorted the 390px layout. It was rejected; accepted mobile evidence uses the stable viewport capture. DOM measurements confirmed the actual page width and mobile card stayed within the 390px viewport.
- Screenshot and DOM inspection do not establish keyboard order, screen-reader output, contrast, zoom/reflow, touch-device behaviour, production cache behaviour, or market-data licensing.
