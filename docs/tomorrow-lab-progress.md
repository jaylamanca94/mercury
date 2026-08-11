# Product Overhaul Progress

## Goal

Bring Mercury to a verified, cohesive, maintainable, release-ready state while preserving its narrow, neutral purpose: help people understand current global economic conditions without becoming an investing product.

## Current Milestone

Release-evidence follow-through: retain the local evidence record and obtain deployed-environment confirmation only when release configuration and market-data licensing are ready for review.

## Completed

- [x] Established the durable overhaul record and reviewed the current repository, product documentation, canonical flows, existing product review, and automated checks (2026-08-09).
- [x] Assessed the applicable review areas. Product, scope, design, flows, technical quality, responsiveness, UXQA, release readiness, and Acadia alignment are represented in the repository evidence. Native tvOS does not apply to this static web product; iOS remains part of the responsive browser release gate.
- [x] Re-ran `npm run check`: JavaScript syntax checks and 78 dependency-free regression tests passed with zero failures (2026-08-09).
- [x] Verified the serverless handler against its live public sources: it returned a `ready` snapshot with 43 current releases across 32 market, 4 economic, 3 risk, and 4 regional items (2026-08-09).
- [x] Added regression coverage ensuring delayed and stale source windows stay explicit and settled in the dashboard freshness status; the suite now has 79 passing tests (2026-08-09).
- [x] Started Yahoo Finance, FRED, and World Bank request groups concurrently, reducing the live-snapshot wait from three sequential source-group windows to one shared window. A behavioural regression test verifies all groups begin before the Yahoo group settles; the live handler still returned a complete current snapshot (2026-08-09).
- [x] Ran the local Vercel-compatible serverless preview through the live public handler, capturing a healthy desktop Dashboard-to-Markets journey, healthy desktop Market Supports, Indicators, and Data Coverage, plus the healthy 390px Dashboard-to-Markets journey (2026-08-10).
- [x] Captured 390px partial, delayed, stale, and unavailable Dashboard states using disposable response fixtures over the existing source-backed preview. The fixtures are QA-only evidence, not production data or a product feature (2026-08-10).
- [x] Corrected two state-label defects found in that pass: a healthy Indicators read no longer announces `Unavailable`, and the mobile dashboard now keeps `Delayed` distinct from `Partial`. `npm run check` passed with 81 tests (2026-08-10).
- [x] Completed the initial canonical flow and design-status audit; the seven user-goal flows remain intact and their current browser/test coverage is recorded (2026-08-10).

## Next

1. When preparing a public release, validate the deployed serverless configuration, cache behaviour, and iPhone journey; resolve market-data licensing before representing Yahoo Finance as launch-ready.

## Deferred / Founder Decisions

- The top-level promise must be chosen before further score or hero changes: either a near-real-time **Global market climate** with economic context, or multi-cadence **Global economic conditions** with stronger confidence and inclusion disclosure. Current mixed-cadence sources make this a product decision, not a safe copy tweak.
- Decide whether to consolidate `Market Supports` into `Markets` or rename it to a plain-language equivalent such as `Market context`. The existing route is functional, but its label is specialist language and the navigation is broader than the core job requires.
- Production market-data licensing and reliability remain a launch decision. Yahoo Finance is currently a public bridge and must not be treated as cleared for a public release without review.

## Evidence

- `npm run check` completed successfully on 2026-08-09: 78 tests passed; syntax checks covered `app.js`, `theme.js`, and both serverless handlers.
- `automation/review/2026-08-08/product-review.md` records local browser evidence for source-backed desktop Dashboard-to-Markets, outage recovery, mobile unavailable states, and theme switching.
- `FLOW-REGISTRY.md` inventories seven canonical flows. It identifies production/mobile and full, partial, delayed, and stale live-state verification as the active validation gap.
- Local serverless testing returned a fully source-backed `ready` response with 43 current releases. The available in-app browser can load the local static shell but does not execute its client interaction layer in this environment, so it cannot provide credible device-level evidence for the live-state gate.
- The deterministic rendering suite now verifies ready, partial, delayed, stale, and unavailable state handling; `npm run check` passed with 79 tests on 2026-08-09.
- After the concurrency update, the local serverless-equivalent handler returned `ready` and `current` with 32 market, 4 economic, 3 risk, and 4 regional items; `npm run check` passed with 80 tests on 2026-08-09.
- The repository began with a related staged review/refinement set. It was included with this record in the focused in-scope milestone commit after the full validation suite passed.
- Milestone commit `071f787` was validated with `npm run check` after commit and pushed to `origin/main` on 2026-08-09.
- `automation/review/2026-08-10/product-review.md` and its accepted screenshots record the 2026-08-10 local-serverless audit. A rejected full-page mobile capture is not part of the evidence set because the capture surface distorted the otherwise valid 390px layout.
