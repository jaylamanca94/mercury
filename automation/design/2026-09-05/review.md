# Mercury asset editing — 2026-09-05

Scope: one existing Asset editing flow; no added flows/screens. Classification: compose existing Acadia Form Actions, Card, Summary Measures and state hint; one phone-dock positioning adapter using Acadia's existing clearance token.

## Findings and result

1. Open a holding: existing entry works. Return/yield labels had no separation from their values; now use canonical Summary Measures.
2. Edit Details: Save/Cancel previously sat below the long form with no dirty indication. The form now contains the card and an external sticky action bar, avoiding the card's overflow clipping. Saved/edited/reverted states are explicit.
3. Save or recover: the controller previously disabled only Save, allowing new edits during a request to be overwritten on completion. It now captures FormData before locking the form, prevents simultaneous writes, and restores manual-field availability. A failed draft stays editable; retry succeeds.
4. Cancel: restores saved values and disables unchanged actions. Background refresh continues to preserve drafts.

## Verification

- `npm run check`: 116 passed; `git diff --check`: passed.
- In-app browser, isolated local data, no remote writes: 1440×1000, 768×1024, 390×844, 320×740. No document overflow. Phone buttons 44px high; bar clears navigation by 12px.
- Light and dark modes inspected. Edited shares remain after failure; retry displays Changes saved and disables Save. Cancel restores saved shares. Browser error log empty.
- Existing native accordion, keyboard inputs, focus styles and polite live status retained. Physical devices, software keyboards and full screen-reader acceptance were not tested.
- Screenshots: `/private/tmp/mercury-design-20260905/` (disposable fixture data). Source field shown as undefined in an early fixture capture is a fixture omission, not a new provider behaviour claim.

## Remaining boundaries

Back/navigation still discards a draft; protection against navigation was not included in this bounded action-state refinement. Email delivery, expired-session recovery, daily snapshot execution and cross-user RLS are separate acceptance work. The recent Home simplification and prior research recovery fixes remain intact.

Release verification is recorded in automation memory after push.
