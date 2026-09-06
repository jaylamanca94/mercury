# Portfolio refinement — 6 September 2026

The founder's Portfolio screenshot showed a weak investment-value hierarchy, a long horizontal asset row, and recurring controls separated from their records across the page. This pass strengthens the existing Portfolio composition using Acadia primitives and preserves the private, manual-first product model.

## Result

- Investment value uses Acadia Title. Asset cards retain identity, classification and valuation detail, with a prominent neutral value beneath the header.
- The shared Grid gives investments three columns from tablet upward and one on phones. The existing page width constraint remains in force.
- Recurring uses one Content Card and Object List. Saved amounts and cadence remain visible; duplicate retirement badges are removed from these rows.
- Recurring and Property share two columns on larger screens, with aligned title/count and caption/action rows. They stack on phones. Property cards lead with equity, followed by market value and mortgage balance.
- Add property is a labelled 44px Icon Action. Sorting appears only when there are multiple properties.
- Portfolio asset entry focuses the asset title. Recurring Edit focuses Contribution directly. Back restores the corresponding card or Recurring action; absent records fall back to Add asset. Returning from Table follows the existing Cards-on-revisit rule and focuses the matching card. Same-route refreshes do not steal focus.

No stylesheet, financial calculation, provider, schema or persistence changes. The implementation reuses Acadia Title, Grid, Content Card, Asset Preview Card, Card Metric Value, Read Only, Cluster, Object List, Object Card Header, Icon Action and page-header patterns. Inline composition uses existing grid-column and touch-size tokens.

## Verification

The local browser used current application code with a disposable in-memory persistence adapter. All displayed holdings and properties are explicitly labelled test data; no owner records or remote financial writes were used. The founder screenshot informed the hierarchy review; the saved before/after desktop captures use the same local fixture at 1920px in light mode.

| Viewport width | Investment columns | Context columns | Page horizontal overflow |
| --- | --- | --- | --- |
| 2560 | 3 | 2 | 0px |
| 1920 | 3 | 2 | 0px |
| 1440 | 3 | 2 | 0px |
| 1024 | 3 | 2 | 0px |
| 768 | 3 | 2 | 0px |
| 390 | 1 | 1 | 0px |
| 320 | 1 | 1 | 0px |

Light and dark layouts were visually reviewed. At 320px, Table also has no horizontal overflow, native sorting remains available, and the toolbar controls retain 44px height. Long asset/property names and missing valuations remain contained at 768px; long asset cards also have no overflow at 320px. Incomplete valuation coverage shows “Not set” with a count, while the affected card says “Needs valuation”. Empty holdings, recurring and property states remain clear.

Interaction checks covered retirement filtering, name sorting retained between Cards/Table, no-match recovery returning focus to Search, and unchanged portfolio-wide allocation after filtering. Card keyboard entry, return from Table, Recurring entry/return and Add asset's Symbol focus were checked. A local property save updated count and total equity, exposed sorting, and returned focus to Add property. Name sorting reordered the two records correctly. The revised tablet context cards start on the same baseline, including the two-property state.

`npm run check`: 130 tests pass, including the new Portfolio focus regression for ordinary/Recurring entry, return, absent records and background refresh. `git diff --check` passes.

The browser log contained one earlier MutationObserver error at 20:15:24 UTC without a source location; no MutationObserver exists in Mercury or the local fixture. No subsequent errors appeared during the final navigation and layout checks. This is retained as an instrumentation observation rather than attributed to application code.

## Evidence

- [Before, desktop light](portfolio/before-desktop.png) and [after, desktop light](portfolio/desktop-light.png), both 1920px.
- [Desktop dark](portfolio/desktop-dark.png), 2560px, complete Portfolio composition.
- [Tablet context](portfolio/tablet-context.png), 768px, two properties and aligned headers.
- [Tablet long/partial state](portfolio/tablet-long-partial.png), 768px.
- [Phone](portfolio/phone.png) and [phone context](portfolio/phone-context.png), 320px.

## Acceptance boundaries

These checks establish local layout and controller behaviour. Authenticated deployed owner-data persistence, physical-device software-keyboard behaviour and VoiceOver acceptance are not newly established by this pass. Publication and deployment status are reported separately after pushing the final commit.
