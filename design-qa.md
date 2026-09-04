# Home Overview Design QA

## Evidence

- Source visual truth: `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_PnUfHV/Screenshot 2026-09-04 at 3.45.10 PM.png`
- Implementation: `http://127.0.0.1:4199/` for the real empty/private-data state, plus the isolated populated-state rendering at `http://127.0.0.1:4220/`
- Implementation screenshot: Codex in-app browser capture requested as `/private/tmp/mercury-home-populated-desktop-v2.png`; focused ranked-list capture requested as `/private/tmp/mercury-home-top-assets-desktop.png`
- Mobile screenshot: Codex in-app browser capture requested as `/private/tmp/mercury-home-populated-mobile.png`
- Source pixels: 3024 × 1898 (`@2x` browser screenshot); comparison rendering: 1265 × 710 browser capture. The source raster was opened directly in the same in-app browser and scaled to the 1265 × 710 comparison surface. Browser chrome was excluded from layout judgements.
- Mobile CSS viewport: 375px content width inside a 390px frame; measured `scrollWidth: 375`, so no horizontal overflow.
- State: Dark, populated Home for primary comparison; dark mobile populated and light desktop empty states as supporting evidence.

## Full-view comparison

The source and revised implementation were opened together in one comparison pass. The implementation intentionally preserves the source shell, Acadia typography, chart card, navigation, and dark surface treatment while applying the approved structural changes: a visibly labelled Net worth headline, explicit selected-period portfolio movement, a shorter chart with real snapshot context, one shallow metric strip, and one ranked asset list.

The revised hierarchy is materially more concise than the source card catalogue. The chart remains the visual anchor, the metric strip forms a single secondary band, and Top assets introduces a distinct row-based rhythm without changing the overall page rail.

## Focused comparison

The ranked-list region was reviewed in a separate scrolled browser capture. All four rows retained consistent rank, identity, classification, value basis, supporting price/share or property figures, chevron affordance, and row dividers. The 375px mobile rendering stacks chart controls and context without horizontal overflow.

## Required fidelity surfaces

- Fonts and typography: canonical Acadia fonts, type roles, weights, line heights, and compact labels are retained. Net worth, movement, metric labels, and values have distinct hierarchy without introducing a new type system.
- Spacing and layout rhythm: desktop chart height is 14rem; supporting content uses Acadia 24px rhythm and internal rules. The metric strip is three columns on desktop and one column on phones. The list uses 44px-plus interactive rows.
- Colours and visual tokens: existing Acadia surface, border, text, Tiffany action, and danger tokens are used. Loss amount and percentage match in red; estimates remain neutral. Light and dark states were reviewed.
- Image quality and asset fidelity: no new raster or decorative assets were required. The existing Mercury brand mark and Font Awesome icon set are retained; the chart uses Mercury's existing data-rendered vector treatment.
- Copy and content: Net worth and portfolio history are explicitly separated. Prior-close and estimate bases, range dates, latest plotted value, history availability, truthful classifications, property figures, displayed count, and View portfolio action match the approved plan.

## Comparison history

1. Initial populated capture found one P2 issue: at 14rem, the chart-footer values fell below the clipped card edge while their labels remained visible.
2. The footer context was changed from stacked label/value groups to compact inline desktop groups, while retaining stacked mobile groups.
3. The revised capture shows Start, End, Latest portfolio value, and History available since within the chart card. No actionable P0, P1, or P2 issue remains.

## Interaction and accessibility checks

- Real Home empty state and populated visual state rendered in the in-app browser.
- Performance controls expose tablist, tab, and tabpanel semantics; source includes Arrow, Home, and End roving-focus handling over enabled tabs.
- Ranked assets are native buttons with visible focus treatment and meaningful accessible names.
- View portfolio remains a native hash link.
- Empty and unavailable financial states remain explicit.
- Browser console: no errors in the populated QA view.

## Follow-up polish

- P3: Revisit chart-footer label density only if longer localised date strings are introduced.

final result: passed
