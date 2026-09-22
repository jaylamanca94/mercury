#!/usr/bin/env python3
"""Rebuild Mercury in a disposable PostgreSQL 17 cluster, never a linked project."""
import argparse
import difflib
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
CHECKS = ROOT / 'supabase' / 'checks'


def run(args, **options):
    result = subprocess.run([str(a) for a in args], cwd=ROOT, text=True,
                            capture_output=True, timeout=120,
                            env={**os.environ, 'DO_NOT_TRACK': '1', 'SUPABASE_TELEMETRY_DISABLED': '1'},
                            **options)
    if result.returncode:
        raise RuntimeError(result.stdout + result.stderr)
    return result.stdout


def canonical(contract):
    # pg_get_functiondef preserves body indentation from the original SQL.
    # Ignore only line indentation/empty lines, not whitespace within literals.
    for function in contract['functions']:
        function['definition'] = '\n'.join(line.strip() for line in
            function['definition'].splitlines() if line.strip())
    return contract


def pg_tools():
    configured = os.environ.get('MERCURY_PG_BIN')
    detected = shutil.which('initdb')
    candidates = [configured, str(Path(detected).parent) if detected else None,
                  '/opt/homebrew/opt/postgresql@17/bin', '/usr/lib/postgresql/17/bin']
    for candidate in candidates:
        if candidate and all((Path(candidate) / name).is_file()
                             for name in ['initdb', 'pg_ctl', 'psql']):
            folder = Path(candidate)
            if ' 17.' not in run([folder / 'postgres', '--version']):
                raise RuntimeError('Use PostgreSQL 17 to match the hosted major version.')
            return folder
    raise RuntimeError('Install PostgreSQL 17 or set MERCURY_PG_BIN to its bin directory.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--compare-contract', type=Path, default=CHECKS / 'expected-schema.json',
                        help='Read-only schema-contract JSON, either plain or from Supabase db query.')
    parser.add_argument('--receipt', type=Path, help='Write a non-sensitive verification receipt.')
    args = parser.parse_args()
    pg = pg_tools()
    cli = shutil.which('supabase')
    if not cli:
        raise RuntimeError('Install the Supabase CLI to verify its actual migration runner.')
    migrations = sorted((ROOT / 'supabase' / 'migrations').glob('*.sql'))
    versions = [path.name.split('_', 1)[0] for path in migrations]
    if len(versions) != len(set(versions)):
        raise RuntimeError('Migration version prefixes must be unique.')
    expected = json.loads(args.compare_contract.read_text())
    if 'rows' in expected:
        expected = expected['rows'][0]['contract']
    expected = canonical(expected)
    # Private directory + Unix socket only; no network listener, production URL,
    # database password, application data or remote reset option is accepted.
    with tempfile.TemporaryDirectory(prefix='mercury-db-') as temporary:
        workspace = Path(temporary)
        socket = workspace / 'socket'
        socket.mkdir(mode=0o700)
        data = workspace / 'data'
        run([pg / 'initdb', '-D', data, '-U', 'postgres', '--auth=trust', '--no-locale', '-E', 'UTF8'])
        started = False
        try:
            run([pg / 'pg_ctl', '-D', data, '-l', workspace / 'server.log',
                 '-o', f"-h '' -k {socket}", '-w', 'start'])
            started = True
            psql = [pg / 'psql', '-X', '-h', socket, '-U', 'postgres', '-d', 'postgres',
                    '-At', '-v', 'ON_ERROR_STOP=1']
            run([*psql, '-f', CHECKS / 'platform-fixture.sql'])
            # localhost satisfies CLI URL validation; host query selects ONLY
            # the private Unix socket. No TCP server is started.
            url = 'postgresql://postgres@localhost/postgres?host=' + quote(str(socket), safe='') + '&sslmode=disable'
            run([cli, 'migration', 'up', '--db-url', url])
            actual = canonical(json.loads(run([*psql, '-f', CHECKS / 'schema-contract.sql'])))
            if actual != expected:
                diff = '\n'.join(difflib.unified_diff(
                    json.dumps(expected, sort_keys=True, indent=2).splitlines(),
                    json.dumps(actual, sort_keys=True, indent=2).splitlines(),
                    fromfile='expected', tofile='rebuilt'))
                raise RuntimeError('Schema contract differs:\n' + diff)
            applied = run([*psql, '-c', 'select version from supabase_migrations.schema_migrations order by version']).splitlines()
            if applied != versions:
                raise RuntimeError('Rebuilt ledger differs from the local migration files.')
            run([*psql, '-f', CHECKS / 'rebuild-acceptance.sql'])
            # SQL checks roll back all fixtures, then prove the product is empty.
            empty = run([*psql, '-c', 'select ' + ' + '.join(
                '(select count(*) from public.' + table['name'] + ')' for table in actual['tables'])])
            if empty.strip() != '0':
                raise RuntimeError('Disposable acceptance checks left application records behind.')
            before = run([*psql, '-c', 'select version, name, statements from supabase_migrations.schema_migrations order by version'])
            run([cli, 'migration', 'up', '--db-url', url])
            after = run([*psql, '-c', 'select version, name, statements from supabase_migrations.schema_migrations order by version'])
            if before != after:
                raise RuntimeError('A repeated migration run changed the applied ledger.')
            if canonical(json.loads(run([*psql, '-f', CHECKS / 'schema-contract.sql']))) != actual:
                raise RuntimeError('A repeated migration run changed the schema.')
            receipt = {
                'postgres': run([pg / 'postgres', '--version']).strip(),
                'versions': versions,
                'schema_objects': {key: len(value) for key, value in actual.items()},
                'schema_matches': True,
                'contract_sha256': hashlib.sha256(json.dumps(actual, sort_keys=True).encode()).hexdigest(),
                'two_user_rls_constraints_revisions_deletes': 'passed',
                'anonymous_reads': 'denied', 'second_migration_run': 'unchanged',
                'application_rows_after_checks': 0,
                'scope': 'Mercury schema on PostgreSQL 17 with a minimal Supabase auth/role fixture',
            }
        finally:
            if started:
                run([pg / 'pg_ctl', '-D', data, '-m', 'fast', '-w', 'stop'])
    receipt['temporary_cluster_removed'] = True
    if args.receipt:
        args.receipt.parent.mkdir(parents=True, exist_ok=True)
        args.receipt.write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    main()
