# Mercury — Design Status

> **Active-flow headline:** Brokerage now has a form-first private workspace with value, allocation, income, and history visualisation. The visual contract is implemented; live authentication and quotes require the configured Supabase and Twelve Data environment.

**Last reviewed:** 2026-08-30

## Verified signals

| Signal | Current status |
| --- | --- |
| Active surface | One Brokerage workspace; legacy public-market navigation is removed from the entry point. |
| Data states | Honest sample, signed-out, quote unavailable/manual fallback, incomplete day baseline, and two-snapshot history threshold are present. |
| Visual language | Dense spreadsheet-derived table, warm paper canvas, dark utility chrome, restrained teal charts, and Acadia control/focus anatomy. |
| Responsive behaviour | Desktop uses four metrics/two chart columns; tablet reduces summary density; phone uses a single chart column and scrollable data table. |
| Accessibility | Semantic table, labelled form controls, visible focus, dialog labels, live status copy, and textual chart summaries are present. |

## Next design opportunities

1. **Credential-backed Brokerage QA.** Inspect magic-link, retained quote and manual fallback states with a real owner account.
2. **Empty first-run orientation.** Once the live account is connected, tune the empty holding state around the first asset form rather than the current sample canvas.
3. **History calibration.** Review a real first week of snapshots before adding date-range controls or more financial chart density.
