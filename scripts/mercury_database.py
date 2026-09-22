"""Local-only PostgreSQL support for Mercury database acceptance checks."""
from contextlib import contextmanager
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
                            env={**{k: v for k, v in os.environ.items() if not k.startswith('PG')},
                                 'DO_NOT_TRACK': '1', 'SUPABASE_TELEMETRY_DISABLED': '1',
                                 'PGTZ': 'UTC', 'PGCLIENTENCODING': 'UTF8', 'LC_ALL': 'C'},
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



@contextmanager
def disposable_database(pg):
    """Create and remove an isolated migrated database; accept no remote target."""
    cli = shutil.which('supabase')
    if not cli:
        raise RuntimeError('Install the Supabase CLI to verify its actual migration runner.')
    with tempfile.TemporaryDirectory(prefix='mercury-db-') as temporary:
        workspace = Path(temporary)
        socket = workspace / 'socket'
        socket.mkdir(mode=0o700)
        data = workspace / 'data'
        run([pg / 'initdb', '-D', data, '-U', 'postgres', '--auth=trust', '--no-locale', '-E', 'UTF8'])
        try:
            run([pg / 'pg_ctl', '-D', data, '-l', workspace / 'server.log',
                 '-o', f"-h '' -k {socket}", '-w', 'start'])
            connection = ['-h', socket, '-U', 'postgres', '-d', 'postgres']
            psql = [pg / 'psql', '-X', *connection, '-At', '-v', 'ON_ERROR_STOP=1']
            run([*psql, '-f', CHECKS / 'platform-fixture.sql'])
            # localhost satisfies CLI URL validation; host query selects ONLY
            # the private Unix socket. No TCP server is started.
            url = 'postgresql://postgres@localhost/postgres?host=' + quote(str(socket), safe='') + '&sslmode=disable'
            migration_command = [cli, 'migration', 'up', '--db-url', url]
            run(migration_command)
            yield workspace, connection, psql, migration_command
        finally:
            if (data / 'postmaster.pid').exists():
                run([pg / 'pg_ctl', '-D', data, '-m', 'fast', '-w', 'stop'])
