# Updated Portfolio responsive frames — 16 September 2026

## Reference and implementation

Re-read Figma section `110:10301`, Studio Display `227:9805` / header `227:9807`, phone header `226:8991` and recurring header `226:9291`, alongside the founder's latest screenshot. The later market-performance, automatic-value-order, whole-percent rings and hidden-caption decisions remain authoritative.

- Studio Display: five 331.2px cards within 1752px content at 2048px. Laptop: three 389.3px cards at 1512px. Tablet: two 381px cards at 834px. Phone: one column. Acadia's wide shell is applied consistently in both themes; minimum widths scale with text size and reserve empty columns under filtering.
- Phone header: ellipsis opens Add asset and group selection. Cards/Table precedes four visible period pills. Tablet keeps the compact period disclosure. Existing Acadia icons, surfaces, touch targets and menus are reused.
- Recurring Value/Name sort now uses Acadia's compact native disclosure, placed before Add recurring on phones. The illustrative New label is not a new date-sort requirement.
- Menu selection, dialog cancellation and missing-card recovery restore focus to the visible trigger. Both group-control copies expose the same selected state. The phone menu scrolls above the dock at enlarged text.

## Verification

- Full `npm run check`: **267 passed**, including syntax and the new shared-filter/mobile-focus regression. Signed-out creation checks include the phone action.
- Browser using synthetic local records: 2048/1512/834/400/320px checked; no horizontal overflow. Both themes reviewed, plus 320px at 200% root text.
- Phone Retirement filter synchronises both controls; 1M and Table retain selection. Add asset opens the existing dialog and focuses Symbol; Escape returns focus to the page menu.
- Recurring Name selection changes the order/label and returns focus to its disclosure.
- At 320px/200%, menu bottom is 692px and dock top is 730px; the last Crypto filter is scrollable and clickable. Period pills wrap without clipping.
- No browser errors; `git diff --check` clean.

## Evidence and limits

Attached images use synthetic values. Dark and light Studio Display screenshots, phone header and enlarged phone menu are included. Source/remote/deployment verification is reported separately at delivery. This change does not modify APIs, persistence, financial calculations or owner records, and does not claim physical-device or VoiceOver acceptance.
