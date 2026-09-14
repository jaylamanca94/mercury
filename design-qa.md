# Home layout reference QA — 2026-09-14

final result: passed

Reference: founder attachment `f0fd726f-5e22-4147-aec9-b0fb3058dc8d/image-1.png`, 2952×1972 including design-canvas padding. App frame is approximately a 1440×936 CSS desktop at 2× density. Compared with 1440×936 local dark Home, populated synthetic records. Initial comparison opened both images together.

P2: the first implementation made the graph/panel too tall, putting Top assets below the initial viewport. Source puts the four summary cards and full Top assets row in view. Fix: use the existing 14rem trend-height ceiling and compact Acadia Field anatomy for chart endpoints/context, while retaining the full-width chart. Fixed in two spacing passes: the final 12rem ceiling, compact Field panel and inline dated endpoints bring the full Top assets row inside the viewport (bottom 883px at 936px height). Post-fix `desktop-1d.png` was opened alongside the reference again, including after amount/percentage pairing was added. No remaining P0/P1/P2 layout differences.

Intentional data boundaries: no fabricated benchmark or net-worth change percentage. These are not present in the saved-data model. S&P comparison preference was asked separately; layout work preserves recorded investment history, with deposits/withdrawals disclosure. The reference’s illustrated intraday curve is not a historical data source. Actual 1D/1W/1M/1Y/All controls filter daily snapshots; All preserves access to older records. Personal values in the attachment are not test fixtures. Existing Mercury logo/font assets and canonical Acadia tokens remain unchanged.

## Final fidelity review

- Typography: existing Geist body/expression and Syncopate wordmark are reused. Net worth leads; all four amount/rate pairs use the same readable role, with muted labels and small provenance/coverage text. Source’s illustrative font/brand treatment is adapted through Acadia, not redrawn.
- Spacing/layout: unboxed headline and chart, four separate summary cards, then four full-width Top assets cards match the reference hierarchy. At 1440px, both grids have four equal columns; at 768px they have two; at 320px one. Dated endpoints and coverage notes add purposeful information absent from the illustration.
- Colours/tokens: canonical dark/light surfaces, borders, radii, teal chart and controls remain unchanged. Acadia supplies the selection/focus states. No product CSS or shared asset modifications.
- Image quality/assets: the only image asset is the supplied product mark, reused without distortion; there are no missing raster illustrations. Font Awesome supplies controls. The plotted path is a real-data chart using the existing published Acadia utility, not a replacement image or invented market series.
- Copy/content: Day change, All-time change, Expected annual growth and Annual dividends retain exact existing semantics. Growth/dividend percentage pairs divide by current investment value and hide when unavailable or zero-based. Property cards explicitly identify equity and purchase price; investment cards show unit price and shares. Personal reference numbers were not copied to fixtures.

## Interaction and responsive evidence

- Local browser checks at 1440×936, 768×1024 and 320×780 pass containment. All five range controls have 44px height at ordinary size.
- 200% text at 768px and 320px keeps the page contained. The canonical range rail scrolls horizontally at the narrowest enlarged setting; Arrow navigation scrolls the selected/focused range into view (1Y visible at x62–159px in a 320px viewport).
- Keyboard 1M selection changes the graph and leaves the four summary amounts unchanged. 1D renders only the two saved daily records; empty and one-record cases show their explicit message/point without invented data.
- Keyboard entry to ALFA opens its asset heading; Back returns focus to its Home card. Property opens with the saved purchase price and returns focus to its card after closing. Add asset opens from Home with Symbol focused.
- All 209 automated checks pass, including cent-safe financial calculations, calendar-day/week/month windows, zero/missing growth-rate guards, coverage states, editor recovery and shared Acadia integrity.
- Local screenshots use isolated synthetic records and a synthetic provider; no owner data or production writes. Authenticated owner/device acceptance is separate.

## Completion audit

The layout reference is implemented in the existing Home route, with its wide chart, four amount/rate cards, four Top assets cards, purchase-price/share context, Add asset and working navigation/ranges. Existing persistence, net-worth calculation, asset market history and property gain/loss remain intact. The illustrative S&P line and net-worth percentage were not requested as new data-model features; they are withheld pending the separately asked preference. This is a layout implementation, not a claim of intraday or benchmark performance. Source and final 1D capture were compared together, with synthetic amounts and daily-only geometry explicitly accounted for. No remaining P0/P1/P2 findings. Physical device checks remain outside this browser evidence.

## Implementation checklist

- [x] Preserve actual saved-data semantics and financial calculations.
- [x] Apply the reference layout using Acadia.
- [x] Verify responsive layout, source comparison and core actions.
- [x] Pass all 209 automated checks.
- [ ] Verify the authorised main push and resulting deployment.
