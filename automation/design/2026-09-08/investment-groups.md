# Portfolio investment groups — 2026-09-08

The approved Vanguard-inspired breakdown is implemented using Acadia Side Nav, Read Only, Progress, native Select and the existing Cards/Table views. Desktop places a 256px group sidebar beside holdings and allocation; tablet/phone (below 1024px) use a compact selector with group values and selected count/share. Recurring and Property remain below the investment workspace. Two-column cards become three on wide desktops and one on phones.

## Group contract

- All investments is the complete holdings set. Retirement takes precedence; Crypto includes only non-retirement crypto; Brokerage contains the remaining holdings. These are saved-holding groups inside the current account, not connected financial accounts.
- Exact cent-based group amounts and counts reconcile. Percentages use all investment value, are rounded to one decimal and remain independent of search/view/sort. Property equity is excluded.
- An incomplete group says Needs valuation. Complete group amounts remain available, while every share is withheld until the total is complete. Empty/zero totals have no percentages. Unvalued assets remain editable.
- Selection updates both record views and the section heading, preserving search and sort. Sidebar buttons retain keyboard focus and expose pressed state. Decorative progress is hidden from assistive technology because the same percentage is given in text.

## Verification

- `npm run check`: 161 tests pass. New domain cases cover count/value reconciliation, retirement crypto without double-counting, incomplete coverage and zero/empty values. Updated controller coverage verifies the mutually exclusive filters preserve unvalued holdings.
- Isolated browser Cards and Table containment: 320, 390, 768, 1024, 1440, 1920 and 2560px, light and dark. Sidebar/select visibility switches correctly. Narrow-desktop table positioning now contains its absolute screen-reader label inside the scroll wrapper.
- Browser interactions: Retirement selects two fixture assets including retirement crypto; Crypto selects only its non-retirement fixture asset. Search retains group totals; switching to a group without matches exposes Clear filters, which preserves Table/sort and returns focus to search. Enter selects a sidebar group without losing focus. Asset detail/Back preserves the group and returns focus to its card after the route renders. Mobile Table displays the selected group.
- Partial, fully empty and zero-value fixture states pass. No page JavaScript errors were reported. The temporary browser fixture is clearly labelled isolated test data, uses no remote writes, and is not part of production.
- Visual evidence: `investment-groups/desktop-dark.png`, `desktop-light.png`, `phone-dark.png`, `phone-missing-light.png`.

No schema, authentication, provider or persistence changes. Local browser evidence does not claim authenticated production or physical-device acceptance.
