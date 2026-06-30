# Implementation Report: Mercury Unavailable-State Design

Run date: 2026-06-30
Automation: 03 Design
Input: `automation/review/latest.md`
Branch: `main`

## Completed Implementation

- Added a central source-backed availability check in `app.js` so Mercury can distinguish loading, partial live data, and complete live-data unavailability.
- Reworked the dashboard complete-fallback state around one primary answer: live data is unavailable and Mercury cannot produce a source-backed read right now.
- Replaced repeated fallback metric grids with reusable unavailable-state cards for dashboard, Markets, Market Supports, Indicators, and Data Coverage surfaces.
- Removed fallback economic interpretation language for unavailable values, including oil as a mixed signal, support conditions as quiet/mixed/supportive, and pressure lists saying none elevated.
- Disabled period, region, mobile region shortcut, and sort controls when no source-backed values are available, with visible copy explaining that controls apply when live data is available.
- Kept refresh available as the explicit retry action and added a Data Coverage action in the dashboard unavailable card.
- Updated mobile navigation labels to visible task-facing labels: Dashboard, Markets, Market Supports, Indicators, and Data Coverage.
- Updated mobile dashboard shortcuts so regions such as Asia remain readable and show `Unavailable` rather than `Loading` after fallback renders.
- Clarified Data Coverage group labels for fully current, partial/delayed/stale, and whole-product unavailable states.
- Added regression coverage for dashboard fallback copy, Market Supports fallback copy, Data Coverage fallback semantics, disabled controls, mobile unavailable labels, and `aria-busy="false"` completion after fallback render.

## Validation Results

- `npm run check` passed.
- Browser verification passed against `http://localhost:4173` with `/api/live-snapshot` unavailable:
  - 375px mobile in dark mode and light mode.
  - 768px tablet in light mode.
  - 1280px desktop in dark mode and light mode.
  - 1280px desktop in light mode after browser zoom increase.
- Browser verification confirmed:
  - Dashboard first read says live data is unavailable and includes Retry refresh plus Data Coverage actions.
  - Period, region, and sort controls are disabled only in the complete unavailable state.
  - Mobile nav labels are visible and include Market Supports and Data Coverage.
  - Mobile region shortcuts show Global, U.S., Europe, and Asia with Unavailable states.
  - No checked text overflow in the touched fallback, mobile nav, action, title, or hero-copy surfaces.
  - Rendered fallback regions complete with `aria-busy="false"`.

## Follow-Up Items

- None.
