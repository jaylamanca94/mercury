# Mercury 0.2.8 — migration reconciliation and clean rebuild

The repository now has a runnable bootstrap and seven unique active migration versions matching the hosted database. All original SQL remains preserved in a checksum-verified archive. No production schema, policy, application record or migration-ledger repair was needed.

## Finding and resolution

The previous active directory had fourteen files, including duplicate `20260901` and `20260902` version prefixes and a no-op `20260903004833_remote_baseline.sql`. Replaying that history with the actual Supabase CLI into a disposable PostgreSQL 17 database failed at `20260901_quote_dividend_data.sql`: PostgreSQL reported `duplicate key value violates unique constraint schema_migrations_pkey`, with version `20260901` already recorded. Static SQL text checks alone had not detected this release-readiness issue.

The linked hosted ledger has seven entries. Its first version, `20260903004833`, originally records Base Plan only; earlier/manual Brokerage, quote, contribution, Income, Property and Budget changes already existed without individual ledger entries. The local no-op baseline now contains the seven previously untracked scripts in dependency order. Their exact original bytes and SHA-256 hashes are retained under `supabase/archive/pre-baseline/`. The six later recorded migrations retain their original files and versions. The baseline is for an empty environment, not for replay over existing tables. The hosted ledger and its original statement text were not rewritten.

## Verification

- Started from clean, fetched main `d92340485aa0e160fd556bb331f474aac08b42c3`.
- Installed PostgreSQL 17.11 tooling; hosted metadata reports PostgreSQL 17.6. Temporary clusters used private Unix sockets with no TCP listener; no shared database service was started. All task-created clusters were stopped and removed.
- Actual Supabase CLI successfully applied all seven active migrations from empty PostgreSQL 17. The compared product contract contains eight tables, 87 columns, 73 constraints, 18 indexes, eight policies, six triggers, one timestamp helper and 168 effective role/privilege checks. All match hosted metadata. Only stored function-body line indentation is normalised.
- Local SQL acceptance passed for two identities in both directions: own access, foreign read/update/delete isolation, ownership transfer rejection, quote joins, anonymous denial, timestamp-based stale update rejection, duplicate Add identity, foreign-parent insertion, property/date/budget validation, snapshot browser read-only behaviour and acknowledged delete retry. Fixtures roll back; zero product rows remain.
- A second CLI migration run leaves both ledger and schema unchanged. `npm run check:database` reproduces this with no hosted credentials or target database URL. Its temporary Supabase auth/role fixture is test-only.
- `supabase migration list --linked` lists seven matching local/remote versions. `supabase db push --linked --dry-run` reports the remote database is up to date. Hosted metadata was captured before/after and remained identical. See `hosted-history.json` and `rebuild.json`.
- `npm run check`: 305 tests and all syntax checks pass. New normal-suite guards reject duplicate/nonstandard migration versions and verify archived bytes/provenance. `git diff --check` passes.
- The installed CLI once failed after successfully applying migrations because optional telemetry shutdown timed out. The repeatable local check now disables telemetry only in its subprocess environment; no global telemetry preference changed. Failures are still reported, not ignored.

## Scope and release

Patch version 0.2.8 addresses environment reproducibility. Browser/application code, layouts, Acadia assets and financial calculations are unchanged, so no new visual QA or hosted user-data mutations were required. Setup and the working agreement now require the database check for migration changes.

This closes Mercury's product-schema rebuild gate. The fixture is not a full Supabase stack: hosted Auth/Storage services, extension lifecycle, email/redirect configuration, provider/scheduler operation, physical-device acceptance and actual owner-data backup/restore remain separate. The original live two-user API isolation evidence remains in the 0.2.7 receipt.

Migration workflow references reviewed: [Supabase migrations](https://supabase.com/docs/guides/deployment/database-migrations) and [local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows). Production history must only be repaired when a verified mismatch requires it; this reconciliation required none.
