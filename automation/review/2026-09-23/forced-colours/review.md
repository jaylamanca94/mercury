# Mercury 0.2.12 — visible keyboard focus in forced colours

## Finding and change

Fresh Mercury `main` and `origin/main` matched `aed379f1242e17e9dc369b76d9ec48bdb4e560aa` (0.2.11). Earlier unchanged-source audits were not repeated. Acadia published a relevant patch since the previous run: 0.4.7 preserves system-colour focus outlines when forced palettes remove shadows.

The actual Mercury sign-in page reproduced an invisible focused Send magic link button: `:focus-visible` true, outline style none/width 0, and box shadow none. After adoption the same keyboard target has a solid 2px system `Highlight` outline with a 2px offset. The Email field also passes after genuine Tab/Shift+Tab traversal; merely setting focus in a newly navigated headless document did not activate its `:focus` state, so those preliminary observations were not accepted as results.

This release vendors the unchanged stylesheet from Acadia `03e977b8eb02778d015d38766b39164fd7af2235` (0.4.7). The other twelve assets are byte-identical to that source. The complete stylesheet diff contains the forced-colour rules and a compact Checklist composition rule; Mercury does not compose Checklist. Its local stylesheet contains no conflicting control-focus override. Cache URLs and the existing provenance assertion are updated. No new dependency, service cost, financial logic, persistence, schema, native project or workflow is introduced.

Upstream publication was checked live: `v0.4.7` published 2026-09-23T08:20:26Z, and GitHub Actions run `35836284068` succeeded on exact source `03e977b8`. Acadia's recorded package/production receipt is `../Acadia/docs/releases/0.4.7/receipt.json`.

## Verification

- `npm run check`: syntax and all 321 tests pass. Existing vendored-file hashes and active-selector coverage pass. No new source-mirroring test was added for this CSS adoption.
- Repeated-dialog screenshots were rejected where the captured state omitted the open dialog; some CLI animation-frame/screenshot requests stalled. A fresh explicit-headless, keyboard-driven phone capture visibly confirms the enlarged-text dialog and focus outline. Completed measurements are retained; rejected screenshots are removed. This limits automated visual acceptance, not the verified source change.
- Actual synthetic Mercury routes use the current controller, markup, local adapters and vendored stylesheet. Browser palettes are emulated in a dedicated Chromium process (`--force-high-contrast`); financial records remain in-memory synthetic fixtures. No production financial record or email was touched.
- Sign-in: real Tab/Shift+Tab traversal shows visible Email and Send magic link outlines. Recovery: Try again has a 2px outline and recovers a synthetic failed initial account read.
- 15 completed computed-style/geometry cases cover forced colours in both product themes at 1280/768/390px and 320px at 200% text, ordinary light at all four sizes, and ordinary dark at 1280/768/390px. All 105 sampled controls retain at least 44px height; all 56 forced-colour controls have a solid 2px outline. Measured page/dialog widths fit, and Escape restores Add income. The final CLI ordinary-dark 320px capture stalled and is not accepted. A separate in-app browser check then verified the 320px, 32px-root-text dialog in system dark: no page/dialog horizontal overflow, visible keyboard focus, Add reachable by Tab with native dialog scrolling, and Escape returning to Add income. Screenshots were directly inspected in the task. These measurements are not a claim of full visual acceptance for every case.
- Income form: native inputs, selects, close icon, Cancel and Add retain focus indicators and at least 44px height. Escape closes the native dialog and returns focus to Add income. Responsive measurements and palette cases are stored in `browser.json`; screenshots are stored alongside this report.
- Database/recovery checks are not applicable to this stylesheet-only behaviour change. Paid hosted restore remains deferred under the existing private-tool decision.

## Limits and next evidence

Browser palette emulation is not operating-system high-contrast, Firefox, VoiceOver or physical-device acceptance. Synthetic routes do not establish authenticated persistence. Existing deployed authenticated provider/scheduler evidence, real magic-link redemption, cross-device persistence and physical accessibility remain separate priorities. No new financial or hosted-recovery acceptance is claimed.

## Delivery

Release `28940d3441cc8c9fa9df21f35315b38f399e2b68` was pushed directly to `origin/main`. Vercel reported success at `https://vercel.com/jayson-lamanca-s-projects/mercury/59UrhSwV9t1CkD4mgeavnyMPDy5F`. Six canonical production responses match local bytes exactly and retain CSP/nosniff headers; see `production.json`. The early probe correctly rejected the previous index while deployment was pending, then passed after Vercel success. A fresh in-app production browser verified Email → Send magic link keyboard focus in ordinary dark mode and the new stylesheet cache URL, without entering an email or sending a message. The CLI production forced-palette capture stalled; live forced-palette interaction is not claimed. Local forced-palette behaviour plus exact deployed bytes remains the relevant correction evidence.

The previous Mercury revision `aed379f` remains the rollback source; no data migration is needed. The accompanying receipt commit contains documentation/evidence only.
