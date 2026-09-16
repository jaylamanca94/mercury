# Plan responsive Figma implementation — 2026-09-16

Reference: Mercury section 129:5989, Studio 231:15610, laptop 129:4939, tablet 231:16236, phone 231:17019. Figma contexts and the founder screenshot were inspected before implementation.

## Delivered

- Summary cards before the unboxed 244px graph; four current groups including property equity; Weekly Spending and Retirement edit cards beneath.
- 1Y default, 1/5/10/20-year pills, phone settings menu, native age selectors with blank milestones and years-left hints.
- Acadia surfaces, typography, smaller muted captions and semantic movement colours. Tighter tablet group insets prevent heading/menu overlap. Phone and enlarged text reflow.
- Existing precise year slider/breakdown in Projection assumptions; live draft preview, Save/Cancel, source hints, revision conflicts and recovery preserved. No calculation, API or persistence changes.

## Verification

`npm run check`: syntax checks and all 268 tests pass. `git diff --check` passes. Added selected-year synchronisation/default coverage; existing projection, recovery, save/conflict and account-isolation tests pass.

Local browser uses an isolated synthetic account and fixture; no owner data was written. Reviewed dark 2048px Studio, 1512px laptop, 834px tablet and 400px phone layouts, light Studio/tablet/phone, and 320px with 200% root text. No horizontal document overflow in the measured tablet/phone/enlarged-text states. Native fields and longer accurate labels make the edit cards taller than the illustrative reference. Graph geometry follows the existing monthly model rather than invented market wiggles.

Interaction checks: all four horizons synchronise age, date and change label; the retained slider selects year 3 within 20Y; changing stop-investing age from 65 to 55 previews a draft and updates the years-left hint; Cancel restores 65, clears the draft and returns focus to Expenses. Phone settings opens and Escape returns focus to its summary trigger. Brokerage View routes with its filter; Property View routes and focuses the Property heading. No browser errors reported. Existing automated tests cover persisted Save/retry/conflict; authenticated owner persistence and physical-device/VoiceOver acceptance were not newly exercised.

Screenshots contain synthetic figures. Deployment verification is reported separately after publication.
