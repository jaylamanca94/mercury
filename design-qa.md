# Home refinement QA — 5 September 2026

Final result: passed

## Scope

Refinement of the founder's supplied Home screenshot: retain the net-worth/history, allocation, investment summary and Top assets hierarchy while reducing competing surfaces and making the short-history state compact. This is an intentional refinement, not a pixel-for-pixel recreation. The supplied screenshot contains owner data and is not copied into the repository.

All implementation captures use disposable local test records and an isolated persistence adapter. No owner records or remote writes were involved.

## Changes

- Net worth uses canonical Acadia Title and Read Only anatomy, with a wrapping Cluster for the range controls. Missing valuations have a short visible explanation.
- Fewer than 30 distinct daily snapshots use a compact Content Card with one history-building message. At 30 dates the existing Dashboard Trend expands; switching back clears the chart and restores the compact card. The investment-only history semantics and calculation gate are unchanged.
- Three investment metrics share one Content Card beneath net worth. Acadia Rule Grid adapts to available space instead of compressing three columns. Annual dividends replaces the broader Passive income label; the estimate qualifier stays visible.
- Allocation remains alongside the overview at larger widths. Top assets follows with View all leading to Portfolio, plus the existing Add asset action. Cluster keeps these actions beside each other on small phones.
- Acadia styles, tokens, fonts, icons and asset cards are reused. Neither `acadia.css` nor `styles.css` changed.

## Flow checks

| Step | Result | Evidence |
| --- | --- | --- |
| 1. Read Home | Passed locally | Short-history overview, grouped metrics and ranked cards inspected at desktop, tablet and phone widths. |
| 2. Change history range | Passed locally | Keyboard Home selects 3M and moves focus; panel labelling updates. 29 days has no chart; 30 has the recorded trend. A controller regression also verifies complete → compact → empty transitions. |
| 3. Open an asset and return | Passed locally | Enter opens FUND; Back returns Home with its original route. |
| 4. View all assets | Passed locally | View all opens Portfolio with Cards selected and all six test investments; browser Back returns Home. |
| 5. Add or edit | Passed locally | Add asset opens the shared dialog with Symbol focused. Space opens the existing property editor. Both cancel successfully. No records were saved. |
| 6. Handle incomplete/empty data | Passed locally | Missing valuation leaves net worth unavailable with a reason; dependent growth/dividends remain unavailable. Empty holdings/property shows $0, disabled ranges and the existing first-asset state. |

## Responsive and visual checks

- Viewports: 1920, 1440, 1024, 768, 390 and 320px. Document scroll width equals client width; scrollbar reservation varies by viewport.
- Desktop retains four asset cards at 1920px. Device Grid adapts naturally through three/two/one columns as space decreases. Long property names wrap.
- Tablet range controls wrap within their card. Supporting metrics adapt to two or one columns as needed. Phone overview, summary, allocation and assets follow the same reading order.
- Phone range buttons and Add asset are 44px high; View all is at least 44px. Focus is visible on range and card entry. Fixed navigation stays within the viewport.
- Light and dark modes inspected. Acadia's existing teal treatment remains; no new colours, local component rules or decorative assets.
- Browser error log: no errors. `npm run check`: 129 passing tests. `git diff --check`: passed.

Local browser checks do not establish physical-device/VoiceOver acceptance, authenticated production CRUD, provider availability, magic-link delivery or database isolation. Those systems are unchanged by this work.

## Captures

![Desktop Home](automation/research/screenshots/2026-09-05-home/01-desktop.png)

![Tablet Home](automation/research/screenshots/2026-09-05-home/02-tablet.png)

![Phone Home](automation/research/screenshots/2026-09-05-home/03-phone.png)

![Phone full-history state](automation/research/screenshots/2026-09-05-home/04-phone-history.png)

![Missing valuation](automation/research/screenshots/2026-09-05-home/05-partial.png)

![Light appearance and long names](automation/research/screenshots/2026-09-05-home/06-light-history.png)

![Phone asset actions](automation/research/screenshots/2026-09-05-home/07-phone-assets.png)
