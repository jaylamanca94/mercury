# Mercury product-data recovery drill — 2026-09-22

Implemented the approved next step: verify backup and restore with disposable records. This is development acceptance tooling and documentation; product version remains **0.2.8**. No browser flow, Acadia asset, calculation, production data/schema, backup policy or environment configuration changed.

## Results

- Started from clean main `6932bc20351edebd357379d5c406c655bd46e79f` and fetched/fast-forwarded before edits.
- New `npm run check:restore` uses PostgreSQL 17.11 `pg_dump`/`pg_restore`, two independent temporary clusters and the actual Supabase migration runner. A shared local helper now supports both rebuild and recovery checks; it removes inherited libpq settings, fixes UTC/UTF-8 output, accepts no external database target and binds only private Unix sockets.
- All **1,018 records across eight product tables** restored exactly after the source database was removed. This includes 1,002 quotes, eight-decimal shares, large exact cent values, zero/null differences, rates, Unicode/multiline text, leap-day dates, parent IDs and microsecond timestamps. Comparison uses complete ordered PostgreSQL JSON text, never floating-point decoded amounts. Source and restored hashes match; see `restore.json`.
- Missing Auth identity UUIDs, a truncated archive whose table of contents still parses, and a repeated restore all failed as expected. Atomic restoration left zero rows after the first two failures and unchanged recovered rows after the duplicate attempt. Foreign keys and triggers stayed enabled.
- Restored owners see only their own records, including 1,001 quotes for one and one for the other. Exact shares/cents/revisions survive; fresh edits succeed and stale edits fail. Existing two-user RLS, anonymous-denial, parent/constraint and snapshot read-only acceptance also passes in the restored database.
- Schema and migration ledger are unchanged. Both temporary clusters and archives were removed. No real records, credentials, Auth sessions or backups were accessed.
- `npm run check:database`: reviewed schema contract matches, two-user checks pass, second migration run unchanged, zero fixture rows remain. See `rebuild.json`.
- `npm run check`: all syntax checks and **305 tests pass**. `git diff --check` passes. The initial sandbox execution could not allocate PostgreSQL shared memory; the authorised local-only execution completed successfully.

## Operating guidance

`supabase/RECOVERY.md` documents repeatable execution, prerequisites, failure checks and the separate hosted recovery gate. The working agreement now requires this drill for product-table, ownership, precision or recovery-tooling changes. README, Supabase setup, product release evidence and the flow registry point to the same boundary. No canonical user flow was added or changed; the deferred Brokerage export remains separate.

References reviewed: official [PostgreSQL 17 pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html), [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html), and [Supabase backup guidance](https://supabase.com/docs/guides/platform/backups). The first two inform archive format, dependency preservation and atomic failure handling. The Supabase guidance informs the distinction between product data, hosted Auth/configuration and Storage object recovery.

## Remaining release evidence

Hosted backup availability/retention/PITR and a complete Supabase restore have not been verified. The highest-value next step is read-only inspection of the actual hosted backup inventory and recovery window, followed by a separate isolated managed-restore exercise. Real email/redirect, physical-device and provider/scheduler acceptance also remain open. This local result does not establish a production recovery-time or data-loss guarantee.

## Publication

Commit `532ecbb198948036cdf0aa22a9b1c3ea539d26c9` is on `origin/main`. Its Git-triggered [Vercel deployment](https://vercel.com/jayson-lamanca-s-projects/mercury/87t6LQ98sczzu6FXZ6sGHxbypM7b) succeeded. Canonical production returns HTTP 200 and exact checkout bytes for the app document/controller, README and recovery runbook, with CSP and nosniff headers. See `production.json`. This receipt is committed separately; it changes no runtime or recovery code.
