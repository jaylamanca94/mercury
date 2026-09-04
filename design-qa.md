# Portfolio Cards and Table Views — Design QA

## Evidence

- Source visual truth:
  - `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_NyxJtw/Screenshot 2026-09-04 at 12.54.26 PM.png` — Mercury Portfolio composition, 3024 × 1898 pixels.
  - `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_1Qwi2A/Screenshot 2026-09-04 at 12.54.36 PM.png` — Acadia Table pattern, 3024 × 1898 pixels.
  - `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_5EKboC/Screenshot 2026-09-04 at 12.54.45 PM.png` — Acadia Tabs component, 3024 × 1898 pixels.
- Browser-rendered implementation:
  - `http://127.0.0.1:4199/?portfolio-view=20260904-v2#portfolio` — actual local Mercury route, dark theme, desktop in-app Browser capture; local Supabase was unavailable, so this was the genuine empty state.
  - `http://127.0.0.1:4200/` — temporary focused QA rendering of the production Table markup and CSS with representative holdings matching the supplied state.
  - `http://127.0.0.1:4200/mobile-frame.html?v=2` — temporary focused rendering at an explicitly measured 390 CSS px inner viewport.
- The in-app Browser exposes captures inline rather than as filesystem screenshot files. Desktop captures were reviewed at the Browser's 1280 × 720 canvas. The mobile frame measured `clientWidth: 390` and `scrollWidth: 390`; no horizontal overflow was present. Device pixel density was not exposed, so comparisons used CSS dimensions and component-level normalization rather than pixel-density assertions.

## State and Interaction Checks

- Cards was selected on a fresh load.
- Clicking Table selected its tab, hid the Cards sort badge and preserved the shared empty state.
- Arrow Left returned focus and selection to Cards; roving `tabindex`, `aria-selected`, `aria-controls` and named tab panels were present.
- The final empty-state accessibility tree exposed the selected Table panel rather than removing it.
- The focused populated rendering showed Asset, Price, Shares, Return, Yield, Value, Updated and Actions in the Acadia compact native table.
- The 390px rendering replaced the table with complete object rows, including Retirement classification and the crypto yield dash.
- Browser console after the final interaction pass: no errors.

## Full-view Comparison

- The Portfolio title, search, Investments hierarchy, Add asset action, filters and Property section retain the supplied Mercury composition.
- Cards/Table uses the supplied Acadia compact glass rail and neutral active pill, positioned after the Investments filters as a peer-view switch.
- Property remains visually and behaviourally outside the view switch.
- The local route lacked authenticated holdings, so populated data density was checked in the focused production-markup rendering rather than represented as live persistence evidence.

## Focused Comparison

- Table typography, muted header treatment, row dividers, compact vertical density and selected sort-header treatment match the Acadia Table reference.
- Asset identity uses a strong primary label, quieter instrument metadata and a compact Retirement badge without displacing financial columns.
- Mobile rows retain the same content hierarchy with two-column metric pairs and no clipped controls or horizontal scroll.

## Required Fidelity Surfaces

- Fonts and typography: Mercury continues using the bundled Acadia Geist roles; table headers, values, metadata and tabs retain canonical weights and line heights.
- Spacing and layout rhythm: the switch shares the existing header tool row; the compact table and mobile object rows use Acadia padding, gaps, borders and radii. No page-frame spacing changed.
- Colours and tokens: all surfaces, text, borders, badges, focus and selected states use existing Acadia variables and classes; no new colour token was introduced.
- Image quality and assets: no new raster, illustration, logo or custom-drawn icon was required. Existing Mercury and Font Awesome assets remain unchanged.
- Copy and content: Cards, Table and the eight column labels match the approved plan. Existing loading, unavailable, manual-price and classification language is preserved by the shared renderer.

## Comparison History

1. Initial empty-state pass found one P2 accessibility issue: selecting Table hid both tab panels when there were no rows.
2. The renderer was corrected to keep the selected panel exposed while hiding only its empty content surfaces.
3. The post-fix accessibility tree showed `portfolio-table-panel` as the selected panel with the existing empty-state message, and keyboard switching still worked.
4. Focused populated desktop and 390px passes found no remaining P0, P1 or P2 visual or responsive issues.

## Follow-up Polish

- P3: repeat the populated interaction pass against an authenticated local or deployed Mercury session after delivery, because the local static server cannot prove live holding navigation or menu persistence.

final result: passed
