# Mercury product review — 2026-08-16

## Verdict

Mercury retains a calm, premium unavailable-data experience and the core recovery path is clear at the current screen sizes. The information architecture is now plainer: **Market context** names the currencies, commodities, and digital-assets destination without changing its route or scope.

The release recommendation is **no-go**. Code-level quality is healthy, but no Mercury Vercel project is connected, production behaviour and provider licensing are unverified, and device-assisted accessibility has not been performed.

## Current visual evidence

This pass used the local static fallback only, so it verifies interface behaviour during a complete source outage rather than healthy live-data rendering. Accepted screenshots are in `screenshots/`.

| Step | Evidence | Health | Observation |
| --- | --- | --- | --- |
| 1 | `01-home-1728-unavailable.png` | Healthy | The ultra-desktop Home retains a bounded reading canvas, clear recovery card, and restrained data density. |
| 2 | `02-home-834-unavailable.png` | Healthy | The iPad Pro class keeps controls, recovery, and two-column cards legible without horizontal overflow. |
| 3 | `03-home-390-unavailable.png` | Healthy | The iPhone class stacks scope controls, keeps recovery actions reachable, and removes unavailable desktop-only navigation. |
| 4 | `04-market-context-390-unavailable.png` | Healthy | The renamed detail route exposes its title, status, controls, source group, and mobile dock without horizontal overflow. |
| 5 | Current DOM interaction | Healthy | Account menu opens with the correct expanded state and Escape returns focus to its trigger. |
| 6 | Current DOM interaction | Healthy | Retry refresh preserves the truthful unavailable state and its recovery actions when the local route cannot provide source-backed data. |

The Home fallback was also checked at 1512, 1280, 1032, 768, and 744 CSS pixels. Each matched viewport width with no horizontal page overflow.

## Flow and design findings

- **Completed:** The seven canonical goals remain intact. `Market Supports` is now `Market context` across detail navigation, page title, document title, accessible labels, recovery language, and the flow registry.
- **Completed:** Mercury now has a declared market-climate-first lead promise. This is more honest than presenting its mixed-cadence sources as one real-time economic score.
- **Limit:** There is no current node-specific Figma source in the checkout or saved design context. The existing Home composition was preserved; no ungrounded visual redesign was introduced.
- **Limit:** Current screenshots cover only complete outage behaviour. Healthy, partial, delayed, stale, and successful-retry browser states remain test-backed, not freshly browser-captured.

## Technical review

| Area | Result | Evidence |
| --- | --- | --- |
| Regression and syntax | Pass | `npm run check`: 87 tests passed. |
| Public response security | Pass in configuration | Restrictive CSP, frame denial, MIME-sniffing prevention, referrer policy, and permissions policy are covered by deployment-config tests. |
| Source resilience | Pass in code | Independent provider groups settle concurrently; upstream fetches use bounded aborts; malformed success and full outage resolve to an explicit unavailable state. |
| Cache safety | Pass in code | Complete source outage and unsupported methods are non-cacheable; usable snapshots receive bounded shared-cache policy. |
| Dependency surface | Low | The project has no installed application dependency tree; it uses browser-native code plus the pinned Font Awesome CDN reference. |
| Deployment and monitoring | Not proven | Connected Vercel account returned no Mercury project. No deployment, runtime logs, provider-health alerting, or production cache evidence exists. |
| Data licensing | Not proven | Public use of the selected Yahoo Finance bridge remains unverified for production licensing. |

## Release gates

| Gate | Status | Required closure |
| --- | --- | --- |
| Correctness and fallback handling | Ready locally | Maintain the passing suite. |
| Responsive unavailable state | Ready locally | Recheck after any Home or dock change. |
| Figma provenance | Open | Supply a node-specific source before the next visual redesign. |
| Production deployment | Blocked | Create or connect the Mercury Vercel project and deploy the current `main`. |
| Production data and cache | Blocked | Exercise `/api/live-snapshot` on the deployed route and inspect headers/logs. |
| Provider licensing | Blocked | Approve public-production licensing for each market-data provider or replace the bridge. |
| Accessibility and device evidence | Open | Run keyboard, screen-reader, 200% zoom/reflow, and touch-device checks on healthy and unavailable states. |

## Recommended release decision

**Do not publish Mercury as a public production service yet.** The app is locally stable, but shipping before the deployment, data-licensing, monitoring, and device gates are closed would turn a well-behaved preview into an unsubstantiated public claim.
