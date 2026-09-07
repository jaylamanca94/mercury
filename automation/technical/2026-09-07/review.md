# Mercury technical health — 7 September 2026

## Assessment

The existing 142 tests passed, but lacked handler-level security and snapshot failure coverage. This pass fixes a cron-authorisation configuration edge case, incomplete snapshot totals, malformed provider prices, and uncontrolled authentication failures. No product scope or visual changes. All 151 tests now pass.

## Fixed

- **P1 — Cron authorisation:** an unset `CRON_SECRET` previously matched the literal `Bearer undefined`. Scheduled service-role access now requires a configured nonblank secret. Ordinary requests still require a validated Supabase user ID and owner-filtered account reads.
- **P1 — History integrity:** missing prices previously contributed zero to persisted daily totals. Incomplete, negative, nonfinite and unsafe-cent valuations now reject the snapshot before its upsert, preserving existing history. Explicit zero, fractional shares, manual values and empty accounts remain supported.
- **P1 — Quote integrity:** blank/null/boolean provider prices could be coerced to zero. Required prices now reject missing or malformed inputs and unsafe cent values; a numeric zero remains valid.
- **P2 — Reliability:** auth and snapshot storage requests have ten-second timeouts. Both protected endpoints return retryable JSON 503 responses for auth transport/provider failures without returning upstream diagnostics. Invalid sessions remain 401.
- **P2 — Database hardening:** applied and recorded migration `20260907133000`: fix `set_updated_at` search path to `pg_catalog`; remove public/anon/authenticated execute grants from the hosted `rls_auto_enable` helper when present. The latter is an event-trigger function, so the advisor warning is excess privilege, not evidence of a demonstrated callable browser exploit.

## Evidence

- `npm run check`: **151 passed**, no failures. New behaviour tests exercise actual endpoint handlers, missing/blank cron secrets, auth outage responses, invalid identity payloads, owner-scoped upserts, no-write valuation failures, and before/after-close cron execution.
- `git diff --check`: passed before publication.
- Live Supabase metadata: RLS enabled on all eight product tables. A transaction under `authenticated` with an unrelated synthetic subject could read zero rows from all eight tables. Anonymous SELECT grants are absent on all eight. This is database-role read-isolation evidence, not a complete two-account browser/write test.
- Live stored coverage at audit: six snapshots, latest date **2026-09-06**, and eleven quote rows. No account values or identities were copied into this report. Stored dates do not independently prove every scheduled invocation or provider freshness.
- Both hardened trigger functions passed an insert/update/automatic-RLS check on a disposable table inside a fully rolled-back transaction. No owner records were changed.
- Before-release GitHub deployment record for `2de7bb6` reported Production success. Final commit/deployment evidence is reported in the automation result.

## Prioritised follow-up

1. **P1 — Migration reproducibility.** Local migration files reuse `20260901` and `20260902` version prefixes. The linked remote tracks a consolidated `20260903004833` baseline plus retirement and this new security migration; older individual files are not individually tracked. Reconcile a verified schema baseline with unique versions and prove a clean database rebuild before the next schema feature. Do not blindly replay non-idempotent baseline policies. The existing Supabase README's suggestion that the no-op baseline kept future CLI checks aligned was inaccurate and is corrected in this pass. [Supabase migration guidance](https://supabase.com/docs/guides/deployment/database-migrations).
2. **P2 — Data growth and consistency.** Browser and snapshot REST collection reads are unpaginated. Supabase defaults to a 1,000-row response limit; unbounded quote history can eventually omit a holding's current price, and oldest-first history can omit recent dates. Current stored counts are below that threshold. Introduce owner-scoped latest-quote retrieval and pagination with over-limit fixtures; consider an atomic server-side snapshot read if concurrent writes become material. [Supabase row limits](https://supabase.com/docs/reference/javascript/v1/select).
3. **P2 — Provider reliability and observability.** Twelve Data/Yahoo requests still have no explicit fetch deadlines, caches have no size cap, and there is no durable snapshot-failure alert in repository configuration. Add bounded provider requests and measurable failure/freshness signals. The Vercel connector lists no accessible projects for the available team, so runtime logs could not be reviewed through it; GitHub deployment records remain accessible.
4. **P2 — Release gates and dependency supply.** No repository CI workflow runs the checks before Git-triggered production publication. The browser Supabase client is pinned to `2.112.3`, but loaded from a CDN without SRI. There are no npm runtime dependencies or lockfile to audit. Evaluate a validated browser bundle/SRI and a production check gate separately; this pass does not claim a vulnerability scan of the external bundle.
5. **P3 — Auth configuration.** Supabase flags disabled leaked-password protection. Mercury currently uses magic links; verify whether password sign-in is enabled before changing this setting. Email delivery/redemption, authenticated browser writes, and device/accessibility acceptance remain separate gates.

The large browser controller is a maintenance concentration, but a broad refactor would add risk without addressing the concrete issues above. Keep future extraction driven by tested behaviour.
