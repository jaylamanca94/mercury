# Portfolio refinement — 14 September 2026

## Result

Mercury 0.0.3 gives Portfolio one full-width, value-led hierarchy. Native Acadia filter buttons replace the investment sidebar and phone selector. The selected group retains its precise value, count and portfolio share; a checkmark makes selection clear in either appearance. Group balances are available on selection instead of repeated beside every group.

The existing adaptive Insight Grid reduces the card columns as space becomes constrained. Page Header Search and Section align the search, Cards/Table and native sort controls. The shorter “Last updated” option lets the phone toolbar fit more comfortably. Recurring and Property keep their existing context and editing flows.

Only published Acadia 0.3.2 classes and utilities were composed. The vendored stylesheet, assets, local stylesheet, domain calculations and persistence were unchanged. Unrelated in-progress Acadia repository changes were not adopted.

## Verification

- `npm run check`: all syntax checks and 197 tests passed. Existing rendering checks now require real pressed group buttons and the shared adaptive grid. Vendor integrity checks passed.
- In-app browser review with ten synthetic holdings, five recurring contributions and one property; no personal values from the founder's reference image were copied into evidence.
- Widths 320, 390, 768, 1024, 1440 and 2560px stayed within the viewport. Card columns were respectively 1, 1, 2, 3, 4 and 5. Both light and dark appearances were inspected.
- Native Space and Enter activated group buttons. The selected checkmark and heading updated. Controls remained present through viewport changes; no alternate hidden selector receives focus.
- Retirement search and Name A–Z sort survived keyboard switching from Cards to Table. Searching one holding kept the unfiltered group value and three-asset count, with a separate one-match status. Clear search restored search focus and retained group/view/sort.
- Phone Table used labelled object cards. No-results recovery retained the selected value. Empty groups offered View all investments, which returned to All investments and focused search.
- Asset entry focused its heading. Back retained the group and returned to Cards as specified by the existing revisit contract. Recurring Edit focused Contribution, and Back restored its Edit action. Add asset opened on a 320px viewport and closing restored its trigger.
- A valid holding awaiting a price withheld the affected total and displayed “1 asset needs a valuation”. Selecting a fully valued Retirement group retained its value while hiding portfolio share and explaining incomplete allocation.
- At 200% root text size and 320px, content reflowed without horizontal document overflow. Large headings wrapped and the page remained vertically scrollable. This is a browser reflow check, not a physical Dynamic Type or VoiceOver acceptance claim.

## Screenshots

1. `01-before-desktop.png`: previous sidebar layout, synthetic data.
2. `02-desktop-dark.png`: final 1440px dark layout.
3. `03-tablet-dark.png`: final 768px dark layout.
4. `04-phone-dark.png`: final 390px dark layout.
5. `05-phone-table.png`: phone comparison for Crypto.
6. `06-narrow-phone.png`: 320px filter wrapping.
7. `07-enlarged-text.png`: 320px, 200% root text.
8. `08-desktop-light.png`: final 1440px light layout.
9. `09-small-desktop.png`: 1024px light layout.
10. `10-large-desktop.png`: 2560px composition with Recurring and Property visible.

## Delivery

Pending source publication and canonical deployment verification.

## Limits

The browser fixture is local and resets on reload. This refinement does not add authenticated browser-persistence proof or close the previously documented authentication lifecycle, other-editor concurrency, migration-baseline or physical-device release gates. No backend changes were required.
