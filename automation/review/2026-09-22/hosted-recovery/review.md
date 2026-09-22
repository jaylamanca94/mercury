# Mercury hosted backup inspection — 2026-09-22

## Verified inventory

Read-only Management API inspection at 01:20 UTC found Mercury `ACTIVE_HEALTHY` in `us-east-1`, running Supabase PostgreSQL `17.6.1.166`. Physical backups are enabled and point-in-time recovery is disabled. All seven returned backups are physical and `COMPLETED`, one per day from 15–21 September. The latest is dated **2026-09-21 07:27:40.737 UTC**, approximately 17.88 hours before inspection. See `inventory.json`; it contains metadata only, without record contents, credentials or backup download links.

The authenticated dashboard identifies the organisation as **Pro**. Its seven visible daily backups match the published seven-day Pro retention. This is an observed inventory plus a documented plan entitlement, not a guarantee that every future backup will succeed. With daily recovery points, changes since the selected backup would be absent from a restore. PITR is a separate paid add-on and was not enabled.

## Isolated restore prepared; approval pending

The authenticated Safari dashboard offers **Restore to new project** for the latest completed backup. The confirmation states:

- Same existing organisation and `us-east-1` region.
- Database schema, contents, indexes, roles, permissions and users are copied. Supabase's documentation also explicitly includes Auth user records and their hashed credentials.
- Same compute size, disk enlarged to 1.5 times the source for restoration.
- **$9.68 additional monthly compute; $0 additional monthly disk**, as quoted by the dashboard. This is a recurring rate while the project exists, not a verified final invoice or exact short-run cost.
- Storage, Edge Functions, Auth settings/API keys, extensions/settings and replicas require separate configuration where applicable.

Automatic approval review rejected the **Continue** action because explicit approval is needed for this concrete paid project and full database/user copy. No restore was started and no project was created. No production data, schema, policies, credentials, retention, billing or connection configuration changed. The modal is left open in the task-created Safari tab for review. Existing user tabs were preserved.

The CLI can list backups, but its restore command targets in-place PITR. The published Management API specification does not expose a clone endpoint. The official dashboard implementation uses a dashboard-session endpoint; a read-only call with the existing CLI token returned HTTP 401. An existing authenticated Safari session successfully exposed the supported UI. No session tokens were extracted and no in-place restore was attempted.

## Ready-to-run acceptance plan

After explicit approval, use a disposable project named `Mercury Recovery 2026-09-22` (or a current dated equivalent) within the same organisation/region. Keep the production app and jobs pointed at production. Complete any required new-password entry through the authorised credential workflow, then:

1. Record the selected backup timestamp, new project identity and elapsed restoration time. Confirm source project remains healthy.
2. Verify all eight Mercury tables, migration history, owner foreign keys, policies, grants, constraints and revision triggers against the reviewed product contract. Inspect complete counts and precise database-side values without publishing personal records.
3. Verify restored Auth identities are consistent with account ownership. Use disposable test identities for write/isolation probes, preserve recovered personal rows, and check anonymous denial and ordinary authenticated behaviour.
4. Treat data written or deleted since the backup as a time difference; do not claim the restored database must equal current production. Exact as-of content equivalence requires a trustworthy manifest from the selected recovery point, which this inspection does not provide.
5. Confirm the clone has no production job, email or application traffic attached. Document any hosted Auth configuration and magic-link acceptance still outstanding separately.
6. Remove the disposable recovery project and verify cleanup through an authorised deletion workflow, so its copied data and recurring resource charges do not persist unnecessarily. Never delete the source project.

Proposed operating targets for this manually maintained pre-1.0 product: at most one day of data loss and restoration within four hours. These are proposed targets, not measured guarantees or a reason to enable PITR without reviewing its cost. The restore exercise must measure the actual recovery time.

## Delivery and sources

Only evidence and operating documentation changed; version remains **0.2.8**. No runtime, database or UI change warrants a version bump or new visual QA. JSON validity and `git diff --check` were checked before publication. The existing Git-triggered deployment runs the normal application checks.

Sources: [Supabase managed backups and retention](https://supabase.com/docs/guides/platform/backups), [restore to a new project](https://supabase.com/docs/guides/platform/clone-project), [official clone API implementation](https://github.com/supabase/supabase/blob/master/apps/studio/data/projects/clone-mutation.ts), current Management API inventory and the authenticated project confirmation. The successful local synthetic recovery result remains separate at `../recovery/review.md`.
