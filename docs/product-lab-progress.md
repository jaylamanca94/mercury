# Legacy Global Dashboard Progress

> **Archived 2026-08-30:** Mercury is now a private personal portfolio and cash-flow tracker.
> This file preserves the prior public global-dashboard delivery record only; it is not the active
> product plan. See [`personal-finance-pivot.md`](personal-finance-pivot.md) for the current
> product direction.

**Last reviewed:** 2026-08-16
**Scope:** Mercury's public dashboard, its live-data boundary, the Acadia adapter, and release readiness. This is the durable delivery record; `docs/tomorrow-lab-progress.md` retains the earlier milestone history.

## Goal

Keep Mercury a clear, neutral, source-backed view of global economic conditions while improving reliability and delivery safety without widening the product into an investing service or speculative platform rewrite.

## Current Milestone

**Release review complete: no-go.** The delivery plan and its completed local work are recorded in `docs/product-lab/2026-08-16/whole-product-sprint-plan.md`. Mercury uses a market-climate-first promise, preserves the existing Figma-led Home anatomy, and separates local source/browser evidence from release evidence.

## Evidence

- `npm run check` passed on 2026-08-10: syntax checks and 85 dependency-free regression tests completed with zero failures.
- The current in-progress change set verifies two safe edge cases: incomplete successful live snapshots resolve to the established unavailable state, and unsupported API methods receive explicit JSON/no-store semantics.
- The local flow record covers seven canonical user goals, including source-backed desktop and iPhone-sized Dashboard-to-Markets paths and deterministic full, partial, delayed, stale, and unavailable rendering states.
- Mercury continues to follow its Acadia adapter for shell, controls, focus, status, responsive spacing, and mobile dock behaviour. Domain-specific source-freshness language and economic visualisation remain local by design.
- Available-environment check: this checkout has no `.vercel` linkage, installed Vercel CLI, or Vercel credential. A local source-handler probe resolved to its explicit unavailable state; that proves the recovery contract, not a public-provider or deployed-service outage.

## Fixed / Validated

- Independent Yahoo Finance, FRED, and World Bank groups begin concurrently while retaining per-group settled fallbacks.
- Source state is explicit for full, partial, delayed, stale, and unavailable results; unavailable data is not represented as a live economic read.
- The public browser/API boundary has a restrictive response-security policy, and `405` responses are explicitly JSON, non-cacheable, and declare `Allow: GET`.
- Client loading now has a bounded 20-second wait and treats an incomplete `200` snapshot as unavailable rather than applying a partial shape.
- A complete source outage no longer receives the normal long-lived snapshot cache policy, so a later recovery is not hidden behind an old `200` unavailable response.

## Deferred

- Configure provider-health alerting or an error-log destination before treating the service as operationally monitored. This is an external operational commitment, not a safe local code tweak.
- Before a public release, verify the deployed Vercel route, cache behaviour, runtime logs, desktop and iPhone journeys, and public-data licensing. Local source-handler and fixture evidence does not establish those facts.

## Decisions Recorded

- Mercury leads with a source-backed **market-climate briefing with economic context**. Daily market movement is the first scan; slower releases qualify it rather than pretending to create a real-time global economic score.
- `Market Supports` is now **Market context**. This is a plain-language information-architecture change, not a new product surface.

## Next Safe Step

Create or connect a Mercury Vercel project, validate the deployed live-data route and headers, resolve provider licensing, and perform device-assisted accessibility testing before reconsidering release.

## Change-Control Note

The working tree contains the validated recovery/API-boundary changes described above. They remain uncommitted in this checkout and were not staged or altered by this record-keeping milestone.
