# Page Header and menu focus — Mercury 0.2.14

## Change

Portfolio investment filters, the tablet period picker and recurring sort now retain visible keyboard focus in forced colours. Menu items receive the same inset system-colour outline; pressed Page Header filters retain a separate underline. Mercury adopts the complete unchanged Acadia 0.4.10 stylesheet from released source `6c3703d680c1f8bed23348148570eb095f4a4b60`. The other twelve shared assets match that source byte for byte. Cache URLs, the vendor manifest and existing provenance assertion are updated.

No local component override, financial calculation, provider, persistence, schema or cost change. Ten canonical flows remain. Ordinary menu focus continues to use its established background highlight; forced colours use the new 2px outline.

## Reproduced defect and shared delivery

The previous Portfolio Filter investments summary matched `:focus-visible` with no visible outline or shadow. Acadia 0.4.9's generic summary correction was overridden by `.acadia-page-header-pattern-sort-trigger:focus-visible`, so its initial adoption was rejected. `current-048.json` records twelve synthetic route/viewport cases and 67 focused summaries, with seven missing-indicator observations. `rejected-049.json` records the failed candidate, and `filter-forced-before.png` confirms the visual defect.

The demonstrated shared need was routed to the existing Acadia task. Acadia independently reproduced it and released the specific Page Header correction alongside menu-item focus and selected-filter treatment. Its annotated v0.4.10 tag and exact-source CI run 35854203596 were verified. Upstream publication is recorded in Acadia's `docs/releases/0.4.10/receipt.json`. Earlier `preview-*` evidence remains explicitly pre-release; it is superseded for Mercury acceptance by the actual vendored-asset results below.

## Verification

- `npm run check`: syntax and all 321 tests pass. Vendor integrity checks cover all thirteen assets; no database or recovery check is warranted for stylesheet-only adoption.
- `released-chromium/accepted-browser.json`: 16 cases across ordinary/forced colours, light/dark product themes, 1280/768/390px and 320px at 200% text; 84 focused summaries.
- `released-firefox/accepted-browser.json`: eight cases and 42 summaries in a disposable Firefox contrast-preference profile. The browser's contrast palette takes precedence over product theme colours.
- All tested disclosures retain focus; forced-colour outlines are solid 2px. Enter/Space toggles work. Investment-group, tablet-period and recurring-sort keyboard choices update their labels and return focus to their triggers.
- Enabled property menu items retain visible focus; Escape closes the menu and restores its summary. Pressed visible Page Header filters retain underlines in forced colours. No action that changes or deletes a record was invoked.
- No document horizontal overflow across the matrix. Existing 32px fine-pointer desktop/tablet filters are preserved; phone controls meet the existing 44px target. Desktop and enlarged-phone screenshots were inspected in both engines.
- Source checks cannot substitute for browser acceptance: the rejected 0.4.9 candidate also passed 321 tests. Focus transitions must settle before style measurement. Browser CLI captures stalled; isolated headless Chromium and Firefox produced the accepted screenshots and closed after each run.

All records are synthetic and in memory. Browser contrast emulation/preferences do not establish operating-system contrast themes, stock Firefox, VoiceOver, physical-device acceptance or authenticated persistence. Existing real magic-link, deployed provider/scheduler and cross-device evidence remain separate priorities. Paid hosted restore stays deferred. No owner records, email or paid calls were used.

## Delivery

Release publication and exact production verification are recorded after the authorised Git-triggered deployment. Previous Mercury main `7d213e5` is the rollback source; no migration is required.
