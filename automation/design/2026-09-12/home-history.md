# Home available-history refinement — 2026-09-12

The founder asked to show the graph using available data and refine Home within Acadia, keeping content minimal and the experience consistent across desktop, tablet and phone. The supplied screenshot showed 11 recorded days hidden by the 30-day gate.

## Outcome

- Every recorded date is usable immediately: one point for one date, a line from two, and one short empty message before recording begins. Duplicate dates use the latest record; spacing reflects actual elapsed dates. No interpolated history or benchmarks are fabricated.
- Net worth and paired all-time/day changes retain their hierarchy and calculations. Chart range selection affects recorded history only.
- The chart uses Acadia Card Trend at the supported 10rem height, Trend Axis for dated value endpoints, the page-header pattern for wrapping tools, and the shared 44px touch token for tabs. The repeated range label and countdown are removed. One concise investment/deposit scope note sits below the graph.
- No stylesheet, vendored asset, provider, schema or persistence change. The current design/product/flow contracts supersede the old 30-day display requirement.

## Review and verification

1. **Read Home.** Inspected the supplied screenshot and the current in-app browser rendering. The revised hierarchy retains net worth, separates headline movements from recorded history, and places secondary estimates below. Dark desktop/tablet/phone screenshots are saved alongside this note; light mode was inspected too. These are explicitly labelled synthetic local data.
2. **Read available history.** Browser checks cover 0, 1, 2, 11, and 180 records, plus flat and falling series. The first record renders only a point. Empty data clears the prior graph/axis. Domain/controller tests cover duplicate dates, elapsed spacing, range filtering, first/current-value arithmetic and recovery.
3. **Change range.** Keyboard Home selects 3M and retains focus; the 180-day graph's start date changes while the all-time amount stays unchanged. Existing arrow/End handling remains covered by the controller. View all reaches Portfolio; Home Add asset opens the existing dialog and Close dismisses it.
4. **Resize/read.** 320, 390, 768, 834, 1024, 1440 and 1920px checks have no horizontal document overflow, every history tab remains fully visible and at least 44px high, and the main card regions do not overlap. 200% root text at 320px preserves containment and vertical scrolling; the canonical tab rail supports horizontal scrolling at enlarged sizes. No browser errors were captured.

`npm run check`: **179 passing checks**. Acadia integrity and active-selector checks pass. `git diff --check` passes.

The initial tablet composition clipped the All tab; replacing the equal-column toolbar with Acadia's responsive section header resolved it. Final desktop/tablet images were recaptured and inspected after that correction.

## Evidence

- `home-history-desktop.png` — 1440px dark Home, 11 recorded days.
- `home-history-tablet.png` — 834px dark Home with fully visible wrapped chart controls.
- `home-history-phone.png` — 390px dark Home with stacked metrics and the available chart.

The task changes Home presentation and its history display gate. Local browser verification uses synthetic account data; real provider availability, owner persistence and physical-device/VoiceOver acceptance were not newly verified. Publication is checked separately against the final served files and origin/main.
