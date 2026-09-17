# Property amount field formatting — 2026-09-17

Scope: current market value, purchase price and debt balance in Add/Edit property. Reuses Acadia input styling; native text + decimal input mode enables grouped numbers. Large amounts round for display only; exact grouped cents return on focus and remain in the title. Small fractional amounts retain up to two decimals. Formatting occurs on focus/blur, without rewriting text during entry.

Regression coverage verifies exact cents across focus/blur/untouched save, stable draft detection, grouped edits, optional clearing, small fractions, invalid grouping/negative/excess decimal/unsafe amounts, correction and new-property reset. Existing save-failure and account-isolation coverage remains.

Synthetic browser checks: 1512px dark property editor displays commas without trailing .00. Focus reveals exact cents; Tab restores rounded display. Cancel after focus/blur closes without a discard warning. A local stubbed save of 1,234,567.89 produced current_value_cents 123456789 and preserved untouched purchase/debt cents; reopening showed 1,234,568. At 320px neither the page nor the open dialog has horizontal overflow. The existing bottom dock overlapped the underlying property menu action at the page end, so the editor was entered by keyboard for this narrow check; that pre-existing menu/dock positioning was outside the amount-field change. No browser errors. Screenshots and stubbed writes use synthetic data; no owner records or production persistence were changed during verification. Physical keyboard/VoiceOver and authenticated owner saves were not newly tested.

Full syntax checks and all 269 tests pass; `git diff --check` passes. Deployment results are reported separately in the delivery response.
