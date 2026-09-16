# Automatic investment value ordering — 2026-09-16

## Change

Removed Portfolio investment search, its feedback/recovery controls, the page ellipsis menu and manual sorting, including interactive Table sort headers. Cards and Table share descending current holding value order; unvalued records appear last. Value retains an accessible descending-order annotation. Group, period, Cards/Table and asset details remain. Recurring and Property keep their existing separate sort controls.

## Verification

- `npm run check`: 266 passing checks, including syntax checks.
- After documentation and test-description updates: 113 focused rendering/controller checks pass; `git diff --check` passes.
- Synthetic local browser: Cards and Table both order FUND, WORLD, BOND, COIN, CASH, MISSING by their current holding values. Raising MISSING's quote moves it to the first position in both views; removing its quote/manual valuation places it last with Needs valuation.
- Retirement filter displays only FUND. Switching to 1M retains the filter and order. Removing synthetic retirement classification exposes the empty-group action; View all investments resets the group and returns focus to its picker.
- Screenshots reviewed at 1512×1000 and 320×900 in light theme. At 320px with 200% root text in dark theme, headings wrap and the page remains horizontally contained. No browser errors reported.
- Attached screenshots use synthetic holdings and prices, never owner records.

## Boundaries

This pass does not claim authenticated owner-data writes, physical-device or VoiceOver acceptance. Deployment source verification is reported separately after the authorised push.
