# Home dashboard simplification QA — 2026-09-05

Final result: passed

## Scope and comparison

Source: supplied original Figma image (`image-2.png`, 1614 × 1108, including its presentation frame). Implementation: isolated localhost Home preview at a 1562 × 950 CSS viewport; screenshots saved under `/private/tmp/mercury-home-simplify/`. The Figma content frame is approximately 1562px wide; browser scrollbar reduces available content width to 1547px (captured PNG 1547 × 941). Comparison used both images together, ignoring Figma's outer caption/frame. Preview values are disposable fixture data, never production data or writes. A full-history fixture permits comparison of the chart anatomy; production may correctly show history building.

## Resolved findings

- P2: Initial asset cards put value on a separate line and became too tall. Reused Acadia Content Card title row/caption with identity and value together. Final desktop comparison shows four compact cards beneath the summary strip.
- P2: Fixed four-column grid squeezed cards at 768px. Reused Acadia Device Grid: four columns on wide desktop, two on tablet and one on phones. Browser measurements confirm containment.
- Removed the former Home presentation rules, planning breakdown, review feed, allocation amounts and repeated visible history metadata. Existing Portfolio/Income/Plan styles and financial arithmetic remain shared.

## Required fidelity surfaces

- Typography: existing local Geist and Acadia expression styles; no font substitutions or overrides. Net worth leads, summary metrics remain subordinate, asset title/value share a row. Long names wrap without horizontal overflow.
- Spacing/layout: existing spacious app shell, Dashboard Layout/Trend, Metric Grid, Asset Preview Cards and responsive Device Grid. The hierarchy follows the reference with one hero, compact allocation, three metrics and four assets. No bespoke Home CSS. Content may grow for long names or five allocation rows.
- Colours/tokens: unchanged Acadia surface/border/shadow and Tiffany/teal brand tokens. Light and dark modes inspected; no purple/indigo additions. Text signs communicate movement independently of colour.
- Assets: existing Mercury mark and Font Awesome controls preserved. SVG is actual data visualisation using the existing Acadia trend classes; no decorative illustration or fabricated benchmark.
- Copy: concise labels distinguish net worth, recorded investment-value change, prior-close movement, saved return assumptions and estimated annual dividends. Property values are equity; card detail identifies market value and mortgage.

## Intentional differences from the reference

- Acadia has no donut primitive. Home reuses canonical progress bars for investment allocation rather than introducing a new chart implementation.
- No S&P benchmark is shown without a source. No history line before 30 distinct saved daily observations. Net worth includes property equity; the labelled history remains investment-only.
- Keep financial qualifiers and native range-tab order/behaviour. Exact figure values, line shape and the existing Mercury mark differ from the illustrative Figma content.

These differences follow the user's Acadia-only/reuse requirement and existing data-trust boundaries. No remaining actionable P0/P1/P2 finding within this Home scope.

## Verification

- `npm run check`: 114 passed; `git diff --check`: passed.
- Desktop 1562px: dark full-history and light long-name states; no horizontal overflow.
- Tablet 768px: two asset columns, no horizontal overflow.
- Phones 390px and 320px: stacked cards; no horizontal overflow; fixed navigation contained. Empty and partial valuation states checked.
- Empty: zero net worth, no holdings, disabled history ranges, no trend. Partial: net worth/growth/dividends unavailable, allocation explicitly identifies missing valuation.
- Enter opens holding details; Back returns Home. Space opens the existing property dialog. Add asset opens the existing quick-add dialog. Arrow key updates selected range, focus and panel labelling.
- Browser error log: no errors during these checks. No owner data created, edited or deleted.

Implementation checklist: reference comparison complete; responsive/data/keyboard checks complete; Acadia reuse complete. Production delivery is verified separately after push.
