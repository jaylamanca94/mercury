# Home layout delivery — 2026-09-14

Reference: the founder’s Home layout attachment. Current detailed QA and fidelity audit: `../../../../design-qa.md`.

Delivered: unboxed full-width portfolio history, 1D/1W/1M/1Y/All daily ranges, four independent amount/rate summary cards, full-width Top assets with price/share or purchase-price context. Allocation remains in Portfolio. Existing Acadia primitives, fonts, mark and styles are unchanged.

All 209 checks pass. Local 1440/768/320px, enlarged text, keyboard ranges, empty/one-point history, Home-to-asset Back focus, property dialog and Add asset checks pass. Screenshots contain synthetic data only. Final desktop cards fit within the 936px target viewport; first capture records the corrected vertical-spacing issue. No database changes or owner records modified. Source commit `a2858c0f294acdf797debe7bf9c14a92fa3ebf78` reached READY production deployment `mercury-3ero9aknz-jayson-lamanca-s-projects.vercel.app`. Hosted checks passed 209/209. The canonical Home markup, controller, portfolio calculation module and unchanged Acadia stylesheet matched the committed bytes.
