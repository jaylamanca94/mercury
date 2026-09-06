# Mercury — Design Status

**Last reviewed:** 2026-09-06

10 implemented canonical flows have design and automated coverage at varying depths; private export remains deferred. This pass completes form-dialog containment without adding product flows.

Portfolio now leads with investment value and compact Acadia asset cards. Allocation expands below investments; property/recurring totals remain beside their sections. Native filters remove the duplicate Brokerage option, sort stays available in mobile Table, and Clear filters restores the search field. Missing-price holdings remain visible and can be repaired in the existing editor. Property forms use Acadia’s compact variant and fit 320px.

Current isolated checks cover Cards/Table, overlapping filters, all sorts, allocation stability, no matches, empty holdings, keyboard entry/return, manual-price repair, property creation, Add asset entry and light/dark layouts. Responsive containment verified at 1920/1440/1024/768/390/320px. `npm run check`: 128 passing tests. See `automation/research/portfolio-2026-09-05.md`. Authenticated production writes and physical-device/VoiceOver acceptance remain separate.

Home now groups investment metrics beneath a compact net-worth/history card, retains allocation alongside the overview, and offers View all beside Top assets. Existing Acadia utilities handle wrapping and adaptive metrics; no stylesheet changes. Local Home checks cover 1920/1440/1024/768/390/320px, light/dark, empty/partial/29/30-day history, and keyboard destinations. 129 tests pass; see `design-qa.md`. Production owner-data acceptance remains separate.

Income, Plan and the remaining deletion dialogs now use Acadia compact form composition. All nine form dialogs keep 44px targets and wrap long action labels inside their padding. Local checks cover 320/390/768/1440px, light/dark, Income/Plan/Budget saves, failed-save draft retention and confirmation cancellation. 129 tests pass; see `automation/design/2026-09-06/review.md`.

## Next design opportunities

1. **Recover from session expiry during edits.** Verify real magic-link redemption and expired-session recovery using a disposable authenticated account; preserve the task while respecting private-data boundaries.
2. **Clarify partial Add persistence.** Holding and quote writes remain separate. Same-dialog retry reuses identity, but cancellation after the holding succeeds and quote storage fails still needs a deliberate reconciliation flow.
3. **Review long forms with the software keyboard.** Responsive browser checks pass; verify focused-field visibility, scrolling and action reachability on a physical phone.
