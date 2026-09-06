# Mercury — Design Status

**Last reviewed:** 2026-09-06

10 implemented canonical flows have design and automated coverage at varying depths; private export remains deferred. This pass refines Plan hierarchy, assumption access and missing-input recovery without adding product flows.

Plan now leads with current investment inputs and pairs both available outlooks. One compact readiness message replaces empty chart panels; incomplete valuations withhold and clear projections until repaired. Assumptions identify Plan overrides and Portfolio inheritance, with one contextual Edit action. Seven widths from 320px to 2560px have no horizontal overflow. Local checks cover horizon selection, saves, inheritance, failed drafts, focus restoration, loading/unavailable/empty states and valuation repair. All 131 tests pass; see `automation/design/2026-09-06/plan-review.md`. The projection domain, providers and persistence paths are unchanged.

Income now leads with Planned balance and a grouped three-input summary. Source cards sit alongside compact annual dividend records on larger screens and stack on phones. Add income/category follows the active view; no-match recovery clears only the relevant search. First-field focus, saved edits, cancellation, failed drafts, category shares, Month/Year and route continuity were checked locally. All 130 tests pass; responsive containment was measured at 2560/1920/1440/1024/768/390/320px. See `automation/design/2026-09-06/income-review.md`. No new financial calculations or persistence paths.

Portfolio now uses a stronger investment headline and three-column Acadia asset cards with prominent values. Recurring forms one compact list alongside Property, with aligned section headers and equity-led property cards. Phone layouts stack naturally. Recurring Edit focuses Contribution; returning from asset details restores the corresponding Portfolio control.

Current isolated checks cover Cards/Table, filter continuity, allocation stability, no matches, empty holdings, long names, missing valuations, keyboard entry/return, property creation/sorting and Add asset entry. Responsive containment is verified at 2560/1920/1440/1024/768/390/320px, with light and dark visual review. `npm run check`: 130 passing tests. See `automation/design/2026-09-06/portfolio-review.md`. Authenticated production writes and physical-device/VoiceOver acceptance remain separate.

Home now groups investment metrics beneath a compact net-worth/history card, retains allocation alongside the overview, and offers View all beside Top assets. Existing Acadia utilities handle wrapping and adaptive metrics; no stylesheet changes. Local Home checks cover 1920/1440/1024/768/390/320px, light/dark, empty/partial/29/30-day history, and keyboard destinations. 129 tests pass; see `design-qa.md`. Production owner-data acceptance remains separate.

Income, Plan and the remaining deletion dialogs now use Acadia compact form composition. All nine form dialogs keep 44px targets and wrap long action labels inside their padding. Local checks cover 320/390/768/1440px, light/dark, Income/Plan/Budget saves, failed-save draft retention and confirmation cancellation. 129 tests pass; see `automation/design/2026-09-06/review.md`.

## Next design opportunities

1. **Recover from session expiry during edits.** Verify real magic-link redemption and expired-session recovery using a disposable authenticated account; preserve the task while respecting private-data boundaries.
2. **Clarify partial Add persistence.** Holding and quote writes remain separate. Same-dialog retry reuses identity, but cancellation after the holding succeeds and quote storage fails still needs a deliberate reconciliation flow.
3. **Review long forms with the software keyboard.** Responsive browser checks pass; verify focused-field visibility, scrolling and action reachability on a physical phone.
