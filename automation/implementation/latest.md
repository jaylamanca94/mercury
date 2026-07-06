# Implementation Report: July 6 Unavailable-State Design Pass

Run date: 2026-07-06
Automation: 03 Design
Input: `automation/review/latest.md`
Branch: `main`

## Completed Implementation

- Implemented the approved July 6 Work Packages A, B, D, E, F, G, H, I, and J without adding rejected product scope.
- Treated Work Packages C and K as validation gates only.
- Made the mobile Dashboard complete-outage first pass action-first:
  - The mobile source-backed-read explanation now includes retry and Data Coverage actions before disabled Period or Region controls.
  - Complete-outage mobile controls reorder checked state and refresh before disabled selects, with stronger disabled styling and nearby explanatory copy.
- Consolidated complete-outage copy and vocabulary:
  - `Live data unavailable` is the primary complete-outage state.
  - `Unavailable` is the compact badge label.
  - `not responding` remains limited to provider/source-health rows that describe source-attempt context.
- Reduced repeated unavailable cards:
  - Dashboard keeps one recovery-oriented unavailable card and suppresses low-value duplicate metric grids in complete outages.
  - Markets now uses one recovery card for the unavailable market read and suppresses lower regional market cards while sorting cannot affect unavailable content.
  - Market Supports uses the same recovery card pattern for currencies, commodities, and digital assets.
- Fixed responsive layout issues:
  - Mobile Dashboard, Data Coverage, Markets, and Market Supports now have stronger header/dock scroll clearance.
  - Complete-outage Markets and Market Supports recovery cards use the available mobile content width instead of narrow carousel tile widths.
  - Desktop Dashboard complete-outage source/freshness rows use the available grid instead of compressing provider statuses into a narrow column.
- Updated `DESIGN-README.md`, `PRODUCT-README.md`, `tests/app-rendering.test.js`, `index.html`, `app.js`, and `styles.css`.

## Validation Results

- `npm run check` passed:
  - `node --check app.js`
  - `node --check theme.js`
  - `node --check api/live-snapshot.js`
  - `node --test`
  - 68 tests passed.
- Browser validation passed against local static server `http://127.0.0.1:8780` using bundled Chromium:
  - Complete unavailable mobile Dashboard at 375px: retry/Data Coverage actions appeared before disabled controls, controls retained native disabled and `aria-disabled` state, and `aria-busy` settled.
  - Complete unavailable Data Coverage at 375px: source-health, provider inventory, and snapshot metadata cleared the floating dock.
  - Complete unavailable Market Supports and Markets at 375px: recovery cards were full-width and used `Live data unavailable`.
  - Recorded-live Dashboard at 1440px: first scan included score, movement, risk signal, freshness, enabled controls, and settled dynamic regions.
  - Recorded-partial Dashboard at 1024px: partial source status kept controls enabled and all dynamic regions settled.
  - Keyboard validation at 390px: Tab and Shift+Tab advanced focus through skip link, header controls, mobile dock, retry, and Data Coverage; non-dock focus targets were not covered by the sticky header or floating dock.

## Follow-Up Items

- No implementation follow-up items are required for the approved July 6 design scope.
