# Mercury — Design Status

**Last reviewed:** 2026-09-05

10 implemented canonical flows have design and automated coverage at varying depths; private export remains deferred. This pass strengthens existing editors and navigation without adding product flows.

Portfolio now leads with investment value and compact Acadia asset cards. Allocation expands below investments; property/recurring totals remain beside their sections. Native filters remove the duplicate Brokerage option, sort stays available in mobile Table, and Clear filters restores the search field. Missing-price holdings remain visible and can be repaired in the existing editor. Property forms use Acadia’s compact variant and fit 320px.

Current isolated checks cover Cards/Table, overlapping filters, all sorts, allocation stability, no matches, empty holdings, keyboard entry/return, manual-price repair, property creation, Add asset entry and light/dark layouts. Responsive containment verified at 1920/1440/1024/768/390/320px. `npm run check`: 128 passing tests. See `automation/research/portfolio-2026-09-05.md`. Authenticated production writes and physical-device/VoiceOver acceptance remain separate.

## Next design opportunities

1. **Recover from session expiry during edits.** Verify real magic-link redemption and expired-session recovery using a disposable authenticated account; preserve the task while respecting private-data boundaries.
2. **Clarify partial Add persistence.** Holding and quote writes remain separate. Same-dialog retry reuses identity, but cancellation after the holding succeeds and quote storage fails still needs a deliberate reconciliation flow.
3. **Review remaining form-dialog phone containment.** Portfolio property forms now fit. Income, Budget and Plan still need the same focused review of existing non-compact Acadia form compositions.
