# Mercury — Design Status

**Last reviewed:** 2026-09-05

10 implemented canonical flows have design and automated coverage at varying depths; private export remains deferred. This pass strengthens existing editors and navigation without adding product flows.

Asset Back and workspace navigation now protect unsaved edits with Keep editing / Discard changes. Add asset, Income, Budget, Plan and Property forms protect dismissal; all nine save/delete dialogs lock controls and Escape during persistence, prevent duplicate submissions and retain failed drafts. Skip to content retains the current route. Canonical Acadia styles are unchanged.

Current isolated browser checks cover manual holding creation, asset navigation, income/category/Plan saves, failure recovery, focus restoration and desktop dialog states. The new confirmation fits 390px and 320px embedded viewports; both actions are 44px high at 320px. `npm run check`: 124 passing tests. Production deployment browser access is Vercel-sign-in-gated; physical-device, VoiceOver, real email redemption/expiry and authenticated database acceptance remain separate.

## Next design opportunities

1. **Recover from session expiry during edits.** Verify real magic-link redemption and expired-session recovery using a disposable authenticated account; preserve the task while respecting private-data boundaries.
2. **Clarify partial Add persistence.** Holding and quote writes remain separate. Same-dialog retry reuses identity, but cancellation after the holding succeeds and quote storage fails still needs a deliberate reconciliation flow.
3. **Review existing form-dialog phone containment.** The shared non-compact form layout can exceed the viewport when padding is added outside its width. The new confirmation uses the standard dialog; existing editing dialogs need focused Acadia sizing review.
