# Portfolio refinement — 2026-09-10

## Result

Compact group label/value rows and 24px Acadia Content Cards reduce competing weight. The cards use Read Only and Object Card Header with a muted caption, retaining exact currency in their accessible names and tooltips. Normal fixture cards decreased from approximately 149px to 101px in height.

Search, Cards/Table and sort now share a Device Grid/Cluster toolbar; tablet search receives a full row when the controls cannot comfortably fit beside it. Group value and count remain stable during search. A separate live match count and Clear search preserve the selected group, view and sort, with focus returned to search. Empty groups offer View all investments. Empty tables omit scroll instructions.

The table's blank Actions heading now carries its accessible name directly. Its previous absolutely positioned hidden span escaped the horizontal scroll region and extended the page at 834px.

This is a reuse/compose change using canonical Acadia primitives and the supported Content Card padding token. No stylesheet, dependency, financial calculation, schema or provider change.

## Verification

- `npm run check`: 172 tests passed. Controller regressions cover stable group counts and search-clear continuity/focus; existing coverage includes missing valuations and group arithmetic.
- Cards and Table: no page overflow at 2560, 1920, 1440, 1199, 1024, 834, 768, 767, 390 and 320px. Desktop/tablet sidebar switches to the native selector below 768px. Intended table scrolling stays inside its labelled region.
- Native Space selects a group and retains focus. Arrow keys select Cards/Table. Enter opens a holding; Back restores its card focus.
- Search in Retirement retains its full value/count, reports zero matches separately, and Clear search retains Retirement and Table. Empty-group recovery returns to All investments. Empty portfolios show $0.00; incomplete portfolios withhold the value. Long names and missing valuations remain contained in both views at 320px.
- Light and dark visual review: [desktop dark](portfolio/desktop-dark.png), [desktop light](portfolio/desktop-light.png), [tablet comparison](portfolio/tablet-table.png), [phone cards](portfolio/phone-cards.png), [small phone](portfolio/small-phone.png).
- No browser application errors observed.

## Evidence boundary

Browser verification used a separate local session with explicitly labelled synthetic holdings and an isolated in-memory account. It cannot write remote personal data. This pass does not claim authenticated production persistence, physical-device or VoiceOver acceptance.
