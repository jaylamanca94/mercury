# Portfolio Dashboard Composition — Design QA

## Evidence

- Source screenshot: `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_yUgPr4/Screenshot 2026-09-04 at 2.54.23 PM.png` (`3024 × 1898` physical pixels, dark theme).
- Implementation captures: `/tmp/mercury-portfolio-populated-light.png`, `/tmp/mercury-portfolio-populated-dark.png`, and `/tmp/mercury-portfolio-lower-dark.png` (`1952 × 1344` browser-content pixels).
- Browser surface: Codex in-app Browser at `1967 × 1354` CSS pixels with device pixel ratio `2`.
- Populated review data was isolated in an untracked local visual fixture; the shipped application remained connected to its normal private Supabase flow.
- The supplied screenshot records the composition being refined rather than a pixel-identical target. The approved implementation plan is therefore the source of truth for intentional hierarchy changes: summary strip, attached toolbar, two-column cards, compact recurring rows, and labelled property fields.

## Full-view comparison

- The Mercury rail, typography, dark surfaces, section hierarchy, action placement, filter pills, and Cards/Table treatment remain consistent with the supplied page.
- The orphaned page-level search has moved into an Investments-only toolbar and now reads `Search assets`.
- The three-column card grid is intentionally replaced by two columns. Cards use less ornamental colour and name Price, Shares, Return, Yield, and Value directly.
- The summary strip answers total Investments, Property equity, and Recurring weekly before filtered content begins. Search and classification controls do not affect those figures.
- Recurring schedules use one shallow list surface rather than repeating card anatomy. Property remains card-only and exposes Market value, Mortgage balance, and Equity.

## Focused-state checks

- Populated Cards view: six investments, mixed positive/negative returns, crypto without yield, retirement marker, mixed weekly/monthly contributions, and a mortgaged property.
- Empty/unavailable view: `$0` Investments, `Not set` Property equity, `$0` Recurring weekly, honest empty recurring copy, and the existing property-migration recovery message.
- Themes: light and dark surfaces, borders, neutral metrics, Tiffany positive movement, red negative movement, and muted text remain legible.
- Interaction: Cards/Table switches correctly; `Home` activates the first tab; the selected tab retains `aria-selected` and roving `tabindex`; Cards-only sort remains hidden in Table view.
- Responsive rules: below `47.98rem`, the summary becomes one column, the toolbar reflows, the card grid uses Acadia's one-column rule, recurring actions stack, property metrics stack, and the table becomes the existing compact object list without horizontal scrolling.
- Console: no new application errors were observed after the final empty-state and interaction pass. One earlier visual-fixture error remained in the browser's retained log history and was removed before the final state check; it is not part of the repository or application runtime.

## Calculation and content checks

- Investment summary uses the complete unfiltered portfolio total, including retirement and crypto holdings.
- Property equity continues to allow zero, multiple properties, and negative equity through the existing property contract; inaccessible property data produces `Not set`.
- Weekly equivalent annualises each explicit holding contribution, divides the combined annual total by `52`, and rounds once to the nearest cent.
- Recurring rows derive from saved holdings independently of live-price availability, so a valid schedule is not hidden merely because its quote is unavailable.
- Search is scoped to Investments; Property and Recurring remain stable.

## Comparison history

1. The first implementation pass introduced the intended hierarchy and calculations.
2. Browser review exposed two integrity refinements: the toolbar's semantics were changed from `search` to a labelled control group, and Recurring was decoupled from the valued-portfolio rows so unavailable quotes cannot suppress schedules.
3. The final combined reference/implementation comparison found no remaining P0, P1, or P2 visual, content, accessibility, or interaction issue within the approved composition.

final result: passed
