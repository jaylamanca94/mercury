#!/usr/bin/env python3
"""Verify a real backup/restore using only disposable local Mercury records."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import tempfile

from mercury_database import CHECKS, canonical, disposable_database, pg_tools, run

COUNTS = {'accounts': 2, 'holdings': 4, 'holding_quotes': 1002,
          'portfolio_snapshots': 2, 'income_sources': 2, 'budget_categories': 2,
          'plan_settings': 2, 'home_properties': 2}


def snapshot(psql, tables):
    # Compare PostgreSQL's exact JSON text, never floating-point decoded amounts.
    # The fixture is quiescent and all tables are read in one SQL statement.
    query = 'select jsonb_build_object(' + ','.join(
        f"'{t}', (select coalesce(jsonb_agg(to_jsonb(r) order by id), '[]'::jsonb) "
        f'from public.{t} r)' for t in tables) + ')'
    return run([*psql, '-c', query]).strip()


def counts(snapshot_text):
    # Numeric strings preserve precision even in the count-only decoded view.
    return {t: len(rows) for t, rows in json.loads(snapshot_text, parse_float=str).items()}


def fingerprint(snapshot_text):
    return hashlib.sha256(snapshot_text.encode()).hexdigest()


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--receipt', type=Path, help='Write counts/check results only; never archive data.')
    args = parser.parse_args()
    pg = pg_tools()
    expected = canonical(json.loads((CHECKS / 'expected-schema.json').read_text()))
    tables = sorted(t['name'] for t in expected['tables'])
    require(set(tables) == set(COUNTS), 'Update restore fixtures/counts for the reviewed table contract.')

    def check_schema(psql):
        actual = canonical(json.loads(run([*psql, '-f', CHECKS / 'schema-contract.sql'])))
        require(actual == expected, 'Recovery schema differs from the reviewed product contract.')

    with tempfile.TemporaryDirectory(prefix='mercury-restore-') as temporary:
        archive = Path(temporary) / 'synthetic.dump'
        with disposable_database(pg) as (_, connection, psql, _):
            check_schema(psql)
            run([*psql, '-f', CHECKS / 'restore-fixture.sql'])
            original = snapshot(psql, tables)
            require(counts(original) == COUNTS, 'Recovery fixture is incomplete.')
            identities = run([*psql, '-c', 'select id from auth.users order by id']).splitlines()
            ledger = run([*psql, '-c', 'select version, name, statements from supabase_migrations.schema_migrations order by version'])
            run([pg / 'pg_dump', *connection, '--format=custom', '--data-only', '--strict-names',
                 *[f'--table=public.{t}' for t in tables], '--file', archive])
            archive.chmod(0o600)
        # The source is stopped and removed before we attempt any restoration.
        archive_hash = hashlib.sha256(archive.read_bytes()).hexdigest()
        contents = run([pg / 'pg_restore', '--list', archive])
        archived_tables = sorted(line.split('TABLE DATA public ', 1)[1].split()[0]
                                 for line in contents.splitlines() if 'TABLE DATA public ' in line)
        require(archived_tables == tables, 'Archive table inventory is incomplete.')
        with disposable_database(pg) as (_, connection, psql, _):
            check_schema(psql)
            empty = snapshot(psql, tables)
            require(all(n == 0 for n in counts(empty).values()), 'Restore target must start empty.')

            def restore(path):
                run([pg / 'pg_restore', *connection, '--data-only', '--no-owner', '--no-privileges',
                     '--single-transaction', '--exit-on-error', path])

            def rejected_restore(path, before, reason):
                try:
                    restore(path)
                except RuntimeError as error:
                    require(reason in str(error), 'Restore failed for an unexpected reason: ' + str(error))
                else:
                    raise RuntimeError('Expected restore rejection did not occur.')
                require(snapshot(psql, tables) == before, 'Rejected restore left partial or changed records.')

            # Product data cannot recreate missing Supabase identities. Keep FK
            # checks active; prove the dependency before supplying synthetic IDs.
            rejected_restore(archive, empty, 'accounts_user_id_fkey')
            require(len(identities) == 2, 'Expected exactly two synthetic identities.')
            run([*psql, '-c', 'insert into auth.users (id) values ' +
                 ','.join("('" + identity + "')" for identity in identities)])

            truncated = Path(temporary) / 'truncated.dump'
            truncated.write_bytes(archive.read_bytes()[:-20])
            truncated.chmod(0o600)
            # The header/TOC still parses: failure occurs while restoring data.
            require(run([pg / 'pg_restore', '--list', truncated]) == contents,
                    'Truncation must leave the archive table of contents intact.')
            rejected_restore(truncated, empty, 'could not read')
            require(hashlib.sha256(archive.read_bytes()).hexdigest() == archive_hash,
                    'Original archive changed before recovery.')
            restore(archive)
            restored = snapshot(psql, tables)
            require(restored == original, 'Restored records differ from the complete source snapshot.')
            rejected_restore(archive, restored, 'duplicate key')
            run([*psql, '-f', CHECKS / 'restore-acceptance.sql'])
            run([*psql, '-f', CHECKS / 'rebuild-acceptance.sql'])
            require(snapshot(psql, tables) == restored, 'Acceptance checks changed restored data.')
            check_schema(psql)
            require(run([*psql, '-c', 'select version, name, statements from supabase_migrations.schema_migrations order by version']) == ledger,
                    'Restore changed the migration ledger.')
        receipt = {
            'verified_at': datetime.now(timezone.utc).isoformat(),
            'postgres': run([pg / 'postgres', '--version']).strip(),
            'scope': 'Synthetic product-data restore into a migrated PostgreSQL 17 database with minimal auth/role fixtures',
            'rows_by_table': counts(original), 'total_rows': sum(COUNTS.values()),
            'archive_tables': archived_tables, 'archive_sha256': archive_hash,
            'source_rows_sha256': fingerprint(original), 'restored_rows_sha256': fingerprint(restored),
            'exact_all_column_comparison': 'passed', 'schema_and_migration_ledger': 'unchanged',
            'missing_auth_identity_restore': 'rejected; zero product rows',
            'truncated_data_restore': 'rejected; transaction rolled back; zero product rows',
            'duplicate_restore': 'rejected; restored records unchanged',
            'restored_owner_visibility_and_revision_writes': 'passed',
            'two_user_rls_anonymous_access_constraints': 'passed',
            'source_removed_before_restore': True, 'production_access': 'none',
            'excludes': ['hosted Auth credentials/sessions/email', 'Storage objects',
                         'managed backups/retention/PITR', 'production recovery time or data-loss guarantees'],
        }
    receipt['temporary_clusters_and_archives_removed'] = True
    if args.receipt:
        args.receipt.parent.mkdir(parents=True, exist_ok=True)
        args.receipt.write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    main()
