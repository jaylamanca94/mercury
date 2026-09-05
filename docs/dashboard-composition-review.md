# Dashboard composition review — 2026-09-04

The approved change gives Home a position/planning/review/evidence hierarchy, Portfolio a stable ownership/allocation view, and Income monthly planning before explicit editing. Plan's page markup, rendering and calculations are unchanged. Canonical Acadia CSS, providers and database migrations are unchanged.

## Local verification

- `npm run check`: 107 passing tests, including six new pure calculation tests covering all four source cadences, weekly/monthly investing, component rounding, deficits, loaded-empty versus unavailable inputs, incomplete dividends, allocation ties/remainder/zero/unvalued holdings, and 0/1/4/29/30 distinct history dates, duplicate dates, gaps and range changes.
- Isolated Chromium review of Home, Portfolio, Income Overview and Budget at 320, 390, 768, 1024, 1280, 1440 and 2560 CSS pixels, in light/dark themes. Populated, empty, partial-data and long-name scenarios passed horizontal-overflow checks (224 route/theme/width/state combinations). Desktop and phone captures were visually reviewed for hierarchy, comparison alignment, readable contrast and mobile navigation clearance. Reduced-motion preference was enabled during the matrix.
- Browser checks covered annual dividend values across Month/Year, source-scoped searching without total changes, Income arrow-key selection, browser Back/Forward, Portfolio filters across Cards/Table, Cards on revisit, range keyboard selection and unchanged Plan rendering.
- The isolated persistence adapter exercised source Save/Cancel, category save failure/retry, duplicate-name validation, deletion cancel/confirmation and focus restoration after saving/deleting. It performed no writes to the owner's account. Final source was separately checked to ensure missing valuations make net worth, investment totals and daily movement unavailable while retaining known planning components.
- The browser review exposed and resolved Portfolio toolbar box sizing, Income long-name table wrapping and Portfolio revisit state. Rapid matrix navigation was paced to avoid Chromium's navigation flood throttle; that test-runner limit did not require an application change.

## Saved-data and release evidence

Before release, the existing signed-in Safari session loaded the owner's saved Home and Income records, including existing sources and categories. This establishes account/data availability, separately from the isolated implementation checks above.

Implementation commit `b6c453a` was pushed to `origin/main`. The production URL served the new dashboard version and its `brokerage.js` SHA-256 matched the committed local asset.

The signed-in Safari deployment review confirmed:

- Home loads saved current investment/property values, the compact four-day history state, four-plus-remainder investment allocation and ranked assets.
- Home and Income show identical monthly planning components and balance after provider estimates finish loading. Pending coverage remains unavailable while known components stay visible.
- Income preserves the saved source amount/cadence in a read-mode row; Edit opens an explicit Save/Cancel dialog and Cancel returns without changing the saved values.
- `#income/budget` loads all existing monthly categories and their shares, with the same planning totals as Overview.
- Portfolio loads the saved investment and property records, switches to investment-only Table, and resets to Cards after leaving for Plan and revisiting.
- Plan still renders its existing assumptions and unavailable-projection states where no return assumption is saved.

Production save/delete writes were not performed; isolated persistence checks above cover those flows. Real-device VoiceOver and touch testing remain broader acceptance work; desktop browser viewport and keyboard checks do not establish physical-device acceptance.

## Repeatable acceptance path

1. In a signed-in owner session, open Home; confirm current net worth is distinct from recorded portfolio value and four recorded days occupy a compact state.
2. Follow Income, compare the monthly components with Planned balance, switch Year and verify dividend rows remain annual.
3. Open an existing source with Edit, inspect original cadence/amount, then Cancel. Open Budget directly, inspect monthly amounts/shares and a category Edit dialog, then Cancel.
4. Switch Portfolio to Table with a search/filter active; confirm matching records and stable allocation. Leave and revisit; Cards should be selected.
5. Review Plan's existing assumptions and projections without changing them. Perform any persistent CRUD acceptance in an authorised disposable account.
