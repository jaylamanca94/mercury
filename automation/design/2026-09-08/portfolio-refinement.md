# Portfolio refinement — 2026-09-08

## Result

One precise selected-group value replaces the repeated page/sidebar totals. Compact group navigation and identity/value cards reduce repeated labels and quote detail. Selected groups omit redundant classifications; comparison details remain available in Table and asset detail. Portfolio allocation is explicitly portfolio-wide.

All Portfolio presentation uses existing canonical Acadia classes: App Workspace, Side Nav, Read Only, Title, Content Card, Device Grid, Table Responsive, Object Card, Cluster and Accordion. Removed the Portfolio-specific CSS adapters. The unmodified Table section from Acadia `3d29f94` is vendored separately as `acadia-table.css`; the existing base stylesheet remains intact.

## Verification

- `npm run check`: 162 passing tests, including selected-group totals independent of search and complete-group values when another group lacks valuations.
- Local isolated test data only; fixture persistence and quotes cannot write remote personal data.
- Cards and Table have no page overflow at 2560, 1920, 1440, 1024, 768, 390 and 320px. Table becomes labelled object cards at a container width of 32rem. The sidebar becomes a native group selector below 768px.
- Light/dark desktop and dark tablet/mobile visually reviewed. Long names remain contained at 320px in both views.
- Space selects the focused desktop group with pressed state and focus retained. Mobile selection and search preserve the group total. Enter opens asset details, focuses the title, and Back restores the matching card.
- Missing valuations withhold affected totals and allocation shares; complete selected groups retain their precise value with an allocation explanation. Empty holdings show $0.00 and No assets yet.
- No browser console errors observed.
- Screenshots: [desktop dark](portfolio-refinement/desktop-dark.png), [desktop light](portfolio-refinement/desktop-light.png), [tablet comparison](portfolio-refinement/tablet-dark.png), [mobile cards](portfolio-refinement/mobile-dark.png), [mobile comparison](portfolio-refinement/mobile-table-dark.png).

## Evidence boundary

This verifies isolated local layout and controller behaviour. Authenticated production persistence, physical devices and VoiceOver were not exercised in this refinement. No schema, provider, account or financial calculation changes were introduced.
