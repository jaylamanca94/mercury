# Mercury 0.2.7 — confirmed mutations and account isolation

Approved follow-through: finish remaining bounded save/delete recovery and verify two-user isolation. No new feature, financial calculation, shared Acadia asset, schema or policy change. Ten implemented canonical flows remain.

## Changes

- Add asset now uses a stable insert ID and verifies the returned record. A timeout retains the draft; a repeat insert cannot overwrite an already-saved asset. Duplicate identity explains how to check the saved record. Quote storage remains a separate recoverable outcome after a confirmed holding save.
- Holding/quote writes and all four deletes use the existing ten-second request deadline. Confirmed quote rows supply local state. Empty or timed-out acknowledgements never claim success or imply definite failure.
- Asset, income-source, budget-category and property deletion require a matching returned ID, or a successful scoped absence read for an empty response. This supports safe retry after a lost response. Confirmed source/category/property deletions update local collections without unrelated account reloads.
- Each path captures account/session context and ignores late acknowledgements after replacement. Existing Acadia dialogs, pending-write locks, native confirmation and return focus are reused. Cache URL and product version advance together.

## Verification

`npm run check`: 303 tests plus all syntax checks pass. Eighteen additional controller regressions cover scoped acknowledgement, deletion timeouts and late results, absence-read failure, already-deleted retries, account replacement, stable Add identity/duplicate rejection, empty acknowledgements and quote uncertainty. Four old source-shape checks were repaired by removing brittle expression assertions; their persistence guarantees are now exercised by actual-controller tests. `git diff --check` passes.

Live Supabase: two new disposable password-authenticated identities, with separate Brokerage accounts. All eight private tables passed both directions of own-read and cross-user read/update/delete isolation. Foreign-parent inserts and ownership changes were rejected; anonymous reads exposed no records. Snapshots retained browser read-only access. Account-filtered quote inner joins returned only the requested owner's quote. Ordinary user tokens performed the probes; administrative access only created/deleted temporary identities and seeded their read-only snapshot fixture. Both accounts and dependent records were removed, all test-user collections rechecked empty, and both auth users confirmed absent. No real owner records were read or altered. See `isolation.json`.

Local disposable browser walkthrough, using current source and an in-memory Supabase-shaped adapter:

- 320px dark: source deletion commits in the fixture but loses its response. After ten seconds the native dialog explains that deletion is unconfirmed and unlocks. Keyboard retry confirms absence, removes the source, recomputes totals and returns focus to Add income. Category deletion immediately reaches zero categories/expenses and focuses Add category.
- 768px dark: property deletion immediately reaches zero properties and recalculates allocation; focus returns to Add property.
- 1280px dark: malformed Add acknowledgement preserves entered symbol/shares/manual price and shows unconfirmed recovery. After resetting the disposable adapter, valid returned insertion opens QAONLY, with 2 shares at $100 and holding value $200; focus reaches the asset heading.
- No horizontal document overflow at these three widths: client/scroll pairs 305/305, 753/753 and 1265/1265. Browser override reset and own tab closed. Local server stopped.

Screenshots: `delete-timeout-320.png`, `property-deleted-768.png`, `add-unconfirmed-1280.png`, `add-confirmed-1280.png`. Some screenshots show the scrolled action/route context; values and focus were checked separately in the accessibility tree. The Add uncertainty screenshot exposed an incorrect row returned by the disposable adapter; the client correctly refused it, and the adapter was corrected before verifying successful Add. Browser evidence is synthetic interaction evidence, distinct from live database isolation.

## Release and remaining boundaries

Patch release 0.2.7; validation complete before the authorised main commit/push. Production receipt is recorded after Git-triggered deployment.

No schema changes were needed. Historical duplicate migration prefixes and clean rebuild remain the highest-priority release-readiness work. Real magic-link delivery/redemption, physical-device accessibility, provider/scheduler operation, export and cross-device browser persistence remain separate acceptance gates. A client deadline does not roll back a write that may already have committed; recovery copy and stable identity account for that uncertainty. Multi-collection reads are not a transactional snapshot.

## Production receipt

Release commit `19a7c88d158be5cfcd3bce2ca1cfb00d9788f6b5` was pushed to `origin/main` and remote SHA verified. Git-triggered Vercel deployment succeeded: https://vercel.com/jayson-lamanca-s-projects/mercury/2b6ReFYbGwdhEii1BbeWCMppDKED . Production `https://mercury-psi-six.vercel.app` returned HTTP 200 with exact local byte matches for index, controller, collection reader, product CSS, Acadia CSS and canonical Home icon. CSP and nosniff were present. Unauthenticated quote and snapshot endpoints returned 401. See `hosted-receipt.json`. This documentation receipt is committed separately after deployment verification; runtime files are unchanged.
