# Property purchase price — 14 September 2026

Mercury 0.0.4 adds an optional Purchase price field to the existing property form. The Portfolio property card shows the precise purchase price, signed dollar gain/loss and signed percentage change. A missing price shows an Add purchase price shortcut that focuses the field. Clearing the price restores that unknown state.

Gain/loss is current market value minus purchase price; percentage divides that difference by purchase price. Debt affects equity only. The visible caption identifies the change as since purchase and excludes costs and rental income. This is not net profit or a tax calculation. Zero purchase prices have a dollar change and an explicit unavailable-percentage explanation.

The implementation uses existing Acadia Form, Field, Grid, Button and Card primitives. The published Acadia stylesheet, assets and local CSS are unchanged.

## Verification

- `npm run check`: syntax checks and 201 tests passed. Added calculation coverage for gain, loss, unchanged value, complete loss, missing price, zero price, invalid/unsafe amounts and independence from debt. The controller test verifies cent precision, save/reopen, clearing and retained drafts after a failed save.
- Local in-app browser checks used synthetic property data: $300,000 market value, $200,000 debt and $250,000 purchase price produced $100,000 equity and +$50,000 / +20% gain. Editing purchase price to $375,000 produced -$75,000 / -20% without changing equity. Reopening retained the saved price. Native validation rejected a negative input without closing the form.
- The optional field and property card were reviewed on desktop, tablet and phone. At 320px the dialog was 273px wide and the document remained within the viewport. Standard Acadia dialog scrolling keeps all fields and actions reachable.
- A regression test covers WebKit reporting rectangles for hidden items in closed menus. The property save renders the updated card before closing. Dialog focus recovery also falls back to the same record's visible menu when its Add purchase price shortcut disappears.

## Live database

Verified the linked project is Mercury, inspected the existing property columns/constraints and migration ledger, then applied only `20260914144500_property_purchase_price.sql`. The nullable bigint column and migration-ledger entry were committed atomically. No existing property values were backfilled and no historic migration was replayed.

Post-application checks confirmed the nullable column, non-negative safe-integer constraint, ledger entry and unchanged enabled row-level security. Authenticated tests used an empty disposable test account, created only synthetic account/property records, and verified omitted price, cent-accurate save/reread, loss price, zero, clear-to-null and rejection of negative/unsafe prices. Market value and debt remained unchanged throughout. Cleanup removed only the test-created records, and empty account/property state was verified afterwards.

## Publication

Pending Git-triggered publication and canonical-file verification.

## Evidence limits

Browser interaction evidence is from a local fixture; authenticated persistence was independently verified against the live API. No founder property value was changed or copied into evidence. Physical-device accessibility and the previously documented migration-baseline and other-editor concurrency gates remain separate.
