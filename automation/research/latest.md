# Mercury flow research — 2026-09-05

This run replaces the July research baseline for the retired public economy dashboard. The active product is Home, Portfolio, Income Overview/Budget, Plan and private asset/property editing.

## Findings resolved

1. **P1 — Signed-out navigation exposed enabled creation controls.** A fresh production browser could show the sign-in form and an empty editable Portfolio together. Private routes now remain at sign-in, with disabled private creation controls. Magic-link submission has pending, success and recoverable error feedback and prevents simultaneous sends.
2. **P1 — Quote failure instructed an impossible next step.** In production, Add asset asked for manual valuation while its fields remained hidden until another Add attempt. The first failure now reveals those fields. Lookup requires entered valid shares, and subsequent share edits preserve manual input.
3. **P1 — Background rendering could replace an asset draft.** Source tracing and isolated controller/browser checks confirmed that provider hydration called the same render that populated all form values. Summary refresh now preserves the current form; Cancel and a completed Save explicitly reload saved values.
4. **P1 — Partial Add retries could create duplicate holdings.** Holding creation preceded quote persistence, with a new UUID on every attempt. The dialog now keeps one holding ID and upserts its holding and quote on retry. A regression test forces repeated quote-storage failures and verifies one identity.
5. **P2 — Asset Back always returned Home.** Confirmed by opening an asset from Portfolio in production. Back now returns to the entry route; direct links default to Portfolio. Invalid encoded IDs reach the unavailable state instead of throwing.
6. **P2 — Route identity and horizon semantics were inconsistent.** The browser title remained Home across workspaces, and Plan applied `aria-selected` to ordinary buttons. Titles now follow the route, and the horizon is a labelled group of native pressed buttons.

## Flow coverage

| Step | Journey | Result and evidence boundary |
| --- | --- | --- |
| 1 | Open private workspace and sign in | Production signed-out boundary reproduced; local send/failure/retry verified without sending email. |
| 2 | Read Home position, planning, history and allocation | Saved production data rendered; current value and recorded history stayed distinct. Local 390px light-theme capture had no horizontal overflow. |
| 3 | Portfolio Cards/Table, filters and recurring holdings | Production controls inspected; local populated route and detail return verified. Existing rendering/state tests retained. |
| 4 | Add asset, quote failure, manual valuation, save | Production recovery defect reproduced; local manual creation completed; late responses and partial-write retries covered by controller tests. |
| 5 | Asset details, Cancel, background refresh and Back | Saved production details inspected. Local draft remained 9 shares after refresh and restored its saved 3 on Cancel; Back returned Portfolio. |
| 6 | Income source editing and Budget | Production saved sources/categories inspected. Local source save restored focus; category failure preserved form/error; confirmed deletion returned focus to Add and an empty state. |
| 7 | Plan assumptions and horizon | Production missing-assumption state inspected. Local assumption save and 20-year projection exercised; pressed-button state verified. |
| 8 | Property entry | Production saved property inspected. Local form exercised with database defaults; property calculations remain covered by domain tests. |
| 9 | Theme, responsive navigation and account actions | Desktop dark and 390px light Home/Income/Budget/Plan captures reviewed; sign-in failure fits phone width. Existing signed-in session preserved. |
| 10 | Background history and recovery/export | Source and existing tests reviewed. Cron execution, actual mail delivery, second-user RLS and owner export acceptance were not executed in this run. Export is a deferred UI boundary, not a visible broken control. |

## Research applied

- [W3C modal dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) supports keeping focus in the dialog and restoring it to the invoking control or a logical successor. Existing source/category Save/Cancel/deletion behaviour was retained and checked.
- [W3C tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) distinguishes tabs with associated panels from other choices. Plan uses native pressed buttons for its projection parameter; Income and Portfolio retain their actual tabs.
- [Nielsen Norman Group: preventing slips](https://www.nngroup.com/articles/slips/) informed preserving entered work and preventing repeated submissions. [Confirmation-dialog guidance](https://www.nngroup.com/articles/confirmation-dialog/) supports reserving confirmation for consequential removal rather than adding prompts to ordinary navigation.
- [Monarch manual-balance editing](https://help.monarch.com/hc/en-us/articles/32368722344212-Manually-Edit-an-Account-Balance) provides a relevant explicit Edit/Save pattern. Mercury retains explicit manual valuation and Save/Cancel without importing account aggregation, transaction entry or balance-history editing.

## Validation and remaining limits

`npm run check`: 114 passing tests, including seven new behavioural controller regressions. Tests are dependency-free. Isolated browser writes use an in-memory adapter and never touch the owner's records. Local fixture setup initially omitted database defaults and shared array references; those harness issues were corrected before accepting property evidence.

This is a broad flow audit with focused recovery fixes, not a claim that every remote failure and physical-device state has passed. Full email-link redemption, expired-session recovery, scheduled snapshot execution, cross-user database isolation and physical-device assistive technology remain acceptance work. Long-form navigation still discards unsaved edits; this pass specifically protects against unsolicited background resets. Holding and quote persistence remains two requests: same-dialog retry is idempotent, but closing during a partial save does not roll back the holding. No schema, provider configuration or financial values were changed.

Screenshots containing private saved values stay in the automation's local evidence folder; they are not committed or published. The local audit includes the screenshots and their source/state labels.
