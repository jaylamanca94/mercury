# Full-width Home QA — 12 September 2026

final result: passed

## Target and evidence

Source: `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_4THWXr/Screenshot 2026-09-12 at 1.35.35 AM.png` (the supplied Dribbble screenshot; original filename uses a narrow space before AM). Source pixels: 3024 × 1898.

Approved translation: net worth above a full-width curved Acadia graph; all-time change, day change, growth and dividends below; Allocation and Top assets further down; four/two/one responsive metrics. This is a layout reference, not a clone of the green palette, tax metrics, branding, chart data or surrounding browser/Dribbble interface. No new image assets were required.

Implementation: isolated synthetic Home at `http://127.0.0.1:8797/?days=11&complete`. Captures: `automation/design/2026-09-12/home-wide-1440.png`, `home-wide-834.png`, `home-wide-390.png`. Desktop CSS viewport 1440 × 1100; returned content capture 1425 × 1089px. Tablet CSS viewport 834 × 1100; returned capture 819 × 1080px. Browser scrollbars/content capture account for the difference.

The supplied source and implementation captures were opened together in one comparison input. Comparison is of the app-owned composition, not browser chrome or pixel alignment across different products and data. Full-view review verifies the wide graph, internal horizontal divider, scannable metric row and supporting content below. Typography, labels and values are legible in these captures, so a separate magnified crop was unnecessary.

## Findings and fixes

- [P2, fixed] Enlarged tablet text exceeded fixed sidebar and metric tracks. Reused Acadia Insight Grid with Grid so groups adapt to their actual available width; the 834px enlarged-text check has no overflowing descendants.
- [P2, fixed] Top assets actions crowded the heading at 768px. Added the existing Page Header container; actions now wrap below the heading.
- [P2, fixed] Two narrow tablet asset cards broke WORLD across lines. Applied the same Grid/Insight Grid composition to the asset list; final tablet capture shows full-width readable cards.

Initial desktop/mobile review established the full-width composition. The combined source/implementation comparison then exposed cramped tablet asset cards; the final 834px capture was inspected after the card fix. Final desktop/tablet/phone screenshots were recaptured. No actionable P0/P1/P2 differences remain against the approved translation.

## Fidelity surfaces

- Typography: existing Acadia fonts, weights and type roles; net worth leads and the change amounts/percentages remain prominent. Tablet asset names no longer split unnecessarily.
- Spacing/layout: full content-width hero; supported trend height scales from 10rem to 14rem; canonical dense card padding, divider, gaps and wrapping. Four desktop metrics, two tablet columns, one phone column.
- Colours/tokens: canonical light/dark Acadia colours, surfaces, borders and chart fill; no stylesheet or vendor changes.
- Images: existing Mercury logo and icon assets preserved. The graph remains the shared Acadia curve utility with recorded observations; no decorative raster additions or imitated reference brand.
- Copy/content: existing investment scope, previous-close context, date baselines and estimate provenance remain visible. No new financial categories or invented data in product code.

## Verification

- Full-width hero measured equal to workspace width at 1920/1440/1200/1024/834/768/390/320px. Desktop metric values share a row; tablets have two columns; phones stack.
- No document overflow at these widths; final 1440/834/768/390px descendant checks pass after wrapping fixes. 320px layout reviewed. Enlarged text checked at 834/390/320px; tablet issue fixed and rechecked.
- Keyboard Home selects 3M and changes dated endpoints while all-time/day values stay fixed.
- Enter opens an investment; Back restores its Home link. View all opens Portfolio. Add asset opens the shared dialog with Symbol focused and Cancel works.
- First-record point, no-history, partial valuation and empty-portfolio states retain correct withheld amounts and fit a 390px viewport.
- Light/dark appearance inspected. No console errors observed.
- `npm run check`: 180 tests passed. `git diff --check`: passed.

Browser checks use isolated local records with no remote writes. Physical-device/VoiceOver and authenticated owner-account writes are outside this layout change. Publication is verified through the authorised Git-triggered workflow and live HTML matching.
