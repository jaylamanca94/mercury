# Product Lab Progress

**Last reviewed:** 2026-08-10
**Scope:** Mercury's public dashboard, its live-data boundary, the Acadia adapter, and release readiness. This is the durable delivery record; `docs/tomorrow-lab-progress.md` retains the earlier milestone history.

## Goal

Keep Mercury a clear, neutral, source-backed view of global economic conditions while improving reliability and delivery safety without widening the product into an investing service or speculative platform rewrite.

## Current Milestone

**Release-readiness boundary.** Local behaviour and the existing in-progress recovery changes are validated. The next work requires release-owner decisions or deployed-environment access, not another unproven local refactor.

## Evidence

- `npm run check` passed on 2026-08-10: syntax checks and 84 dependency-free regression tests completed with zero failures.
- The current in-progress change set verifies two safe edge cases: incomplete successful live snapshots resolve to the established unavailable state, and unsupported API methods receive explicit JSON/no-store semantics.
- The local flow record covers seven canonical user goals, including source-backed desktop and iPhone-sized Dashboard-to-Markets paths and deterministic full, partial, delayed, stale, and unavailable rendering states.
- Mercury continues to follow its Acadia adapter for shell, controls, focus, status, responsive spacing, and mobile dock behaviour. Domain-specific source-freshness language and economic visualisation remain local by design.

## Fixed / Validated

- Independent Yahoo Finance, FRED, and World Bank groups begin concurrently while retaining per-group settled fallbacks.
- Source state is explicit for full, partial, delayed, stale, and unavailable results; unavailable data is not represented as a live economic read.
- The public browser/API boundary has a restrictive response-security policy, and `405` responses are explicitly JSON, non-cacheable, and declare `Allow: GET`.
- Client loading now has a bounded 20-second wait and treats an incomplete `200` snapshot as unavailable rather than applying a partial shape.

## Deferred

- Configure provider-health alerting or an error-log destination before treating the service as operationally monitored. This is an external operational commitment, not a safe local code tweak.
- Before a public release, verify the deployed Vercel route, cache behaviour, runtime logs, desktop and iPhone journeys, and public-data licensing. Local source-handler and fixture evidence does not establish those facts.

## Founder Decision Needed

- Choose Mercury's lead promise: a near-real-time **global market climate** with economic context, or a multi-cadence **global economic conditions** view with stronger disclosure. The existing aggregate framing mixes source cadences, so this is product strategy rather than copy polish.
- Decide whether `Market Supports` should remain, be consolidated into Markets, or be renamed in plain language (for example, `Market context`). Its current label is functional but specialist.

## Next Safe Step

When release configuration and licensing are available, run a deployed verification pass against each public route and capture the desktop/iPhone result. If no deployment is being prepared, keep the validated local changes bounded and avoid expanding scope.

## Change-Control Note

The working tree contains the validated recovery/API-boundary changes described above. They remain uncommitted in this checkout and were not staged or altered by this record-keeping milestone.
