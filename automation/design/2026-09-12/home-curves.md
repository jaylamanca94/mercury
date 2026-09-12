# Home curves and summary — 2026-09-12

The founder requested curved Acadia graph lines and moving All-time change / Day change into the section beneath the graph beside the annual estimates.

- The lead card now contains net worth, the recorded graph, range tools and dated endpoints. All-time/day changes lead the single summary card below; annual growth/dividends follow. Acadia Grid/Field compositions preserve the scan order on desktop, tablet and phone.
- The chart imports Acadia's unchanged `src/card-trend.mjs`, verified against published main `686c30d3400a7d71554a8e50e09b6a54a8b6aa1a`. Its per-file revision/hash is recorded in `acadia-vendor.json`; the stylesheet and other asset pins are unchanged. The Home controller is loaded as a module to use the original exported helper directly.
- Both line and fill use the shared curve path. Mercury still owns date/value scaling; elapsed-date spacing, every recorded observation, accessible amounts, and first-record/empty states remain intact. Acadia's bounded tangents avoid overshoot.

## Verification

All 179 checks pass, including vendor integrity, controller recovery, single/sparse history and the summary-placement contract. Syntax checking includes the imported module. `git diff --check` passes.

The isolated in-app browser loads the module successfully. At 320, 390, 768, 834 and 1440px the document has no horizontal overflow and both change metrics sit below the graph card. Eleven records produce ten cubic segments. Empty, single, two-point, flat, falling and 180-record histories render correctly. Keyboard Home selects 3M, changes the dated graph range and preserves the all-time amount. No browser errors were captured.

Inspected final screenshots: `home-curves-desktop.png` (1440px) and `home-curves-phone.png` (390px). Both use labelled synthetic data, with the curved graph above the grouped summary. Real account/provider data and physical-device accessibility were not newly verified. Publication is verified separately against served files and origin/main.
