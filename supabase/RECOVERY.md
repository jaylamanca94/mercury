# Mercury recovery verification

## Verified boundary

`npm run check:restore` proves a logical backup of all eight Mercury product tables can recover into a fresh, migrated PostgreSQL 17 database. It uses only synthetic records and minimal local Supabase roles/identity fixtures. It accepts no database URL, credentials or external archive, starts no TCP listener, and never accesses the linked project. This is a recovery acceptance test, not a scheduled production backup or a user-facing export.

Prerequisites match `npm run check:database`: Python 3, Supabase CLI and PostgreSQL 17 including `pg_dump` and `pg_restore`. Set `MERCURY_PG_BIN` if the tools are outside the recognised locations. PostgreSQL needs local process/shared-memory permissions; run in an environment that permits a disposable database process, without starting a shared database service.

```sh
npm run check:restore
# Optional receipt contains counts, hashes and results, never record contents:
npm run check:restore -- --receipt /tmp/mercury-recovery.json
```

The drill:

1. Rebuilds the product schema using the actual migration runner and checks the reviewed schema contract.
2. Seeds two synthetic identities and 1,018 product records: two accounts, four holdings, 1,002 quotes and two rows in each remaining table. Inputs cover eight-decimal shares, exact cents, large integers, rates, zero/null distinctions, multiline Unicode text, leap-day dates, parent IDs and microsecond revisions.
3. Takes a custom-format, data-only `pg_dump` covering every product table, records its SHA-256 and inventory, then stops and removes the source database.
4. Rebuilds an independent empty target. A restore without the original owner UUIDs fails its foreign key checks and leaves zero product records. Only the two synthetic identity UUIDs are then provisioned; this does not model Auth credentials or sessions.
5. Truncates a copy of the archive after its readable table of contents. `pg_restore --single-transaction --exit-on-error` rejects the incomplete data and rolls back all product writes.
6. Restores the intact archive. Every column of every row is compared in stable ID order using PostgreSQL's exact JSON text, without converting money or shares to floating-point values. Both complete record hashes must match.
7. Repeats the restore to exercise duplicate rejection and verifies the recovered records are unchanged. Checks restored owner visibility, quote isolation and revision-aware edits, then reruns two-user policy, anonymous-access and constraint acceptance. Schema and migration ledger must remain identical.
8. Stops/removes both temporary clusters and deletes both archives, including on ordinary exceptions. Only the optional non-sensitive receipt remains. Abrupt operating-system termination can prevent normal cleanup; any interrupted temporary cluster is local and must be identified before removing its directory.

The test uses database-owner access for backup/restore while retaining foreign keys and triggers. Ordinary `authenticated`/`anon` roles are used for access assertions. No `--clean`, trigger disabling, account reassignment or production reset is involved.

Latest acceptance: [`automation/review/2026-09-22/recovery/restore.json`](../automation/review/2026-09-22/recovery/restore.json). Repeat after changes to product tables, ownership, precision or recovery tooling; update fixture coverage deliberately when the reviewed table contract changes.

## Hosted recovery remains a separate gate

Read-only inspection on **2026-09-22** verified seven completed physical daily backups (15–21 September), a healthy Pro project in `us-east-1`, and PITR disabled. The latest backup was dated **21 September, 07:27:40 UTC**. The observed inventory matches the documented seven-day Pro retention. The isolated restore confirmation quotes **$9.68/month** additional compute and **$0/month** additional disk, with a full database/user copy in the same organisation and region. Creation is pending explicit approval after automatic approval review blocked Continue; no restore project exists. See [hosted inspection and the prepared acceptance plan](../automation/review/2026-09-22/hosted-recovery/review.md). No hosted restore has passed yet.

This drill establishes the product-data path. The separate hosted inspection above establishes the available backup metadata. Successful recovery, elapsed recovery time and full Supabase restoration still require the isolated hosted exercise. The existing private Brokerage export boundary is still deferred and covers fewer tables; it is not an all-product backup.

Before relying on hosted recovery for real financial records:

- Inspect the project's actual backup inventory, successful timestamps, retention and PITR configuration. Record the observed recovery window; do not infer it from generic plan documentation.
- Choose and document an acceptable data-loss window and recovery-time target. Keep backup access restricted and any downloaded data encrypted outside the repository, deployment output and review attachments. A checksum detects accidental changes; it does not replace trusted provenance or encryption.
- Restore a trusted managed backup into an isolated authorised environment, using Supabase's supported recovery process. Preserve the corresponding Auth users and their UUIDs before checking account relationships. Never relabel accounts to make a foreign-key error disappear.
- Verify the correct migration/schema version, complete counts and precise values, authenticated access, owner isolation, revision-aware writes, magic-link/redirect behaviour and application configuration. Storage object recovery requires its own plan if Storage is introduced.
- Re-enable writes and external jobs only after the restored environment passes acceptance. Any production cutover needs a concrete target and verified rollback/recovery point; this local command cannot perform one.

No hosted retention or backup policy was changed by this work. No real owner data was downloaded or restored.

## References

PostgreSQL documents [consistent custom-format backups and table-filter limitations](https://www.postgresql.org/docs/17/app-pgdump.html) and [atomic restoration with `--single-transaction`](https://www.postgresql.org/docs/17/app-pgrestore.html). Supabase's [backup guidance](https://supabase.com/docs/guides/platform/backups) describes managed backup access and notes that database backups exclude Storage objects. Project-specific availability still requires inspection.
