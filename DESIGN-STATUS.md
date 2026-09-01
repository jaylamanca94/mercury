# Mercury — Design Status

> **Active-flow headline:** Home now presents only authentic Brokerage data, and a selected holding opens an Acadia-native Asset page for details. Live authentication and quotes still require configured Supabase and Twelve Data environments.

**Last reviewed:** 2026-09-01

## Verified signals

| Signal | Current status |
| --- | --- |
| Active surface | Home dashboard and hash-routed Asset page backed by the Brokerage account; legacy public-market navigation is removed from the entry point. |
| Data states | Honest empty/configuration-unavailable, signed-out, automatic quote, unavailable/manual fallback, and the two-snapshot history threshold are present. |
| Visual language | Canonical Acadia only: responsive navigation, content cards, metrics, forms, dialogs, badges, status rows, and trend treatment. |
| Responsive behaviour | Acadia collapses the dashboard and card grids to one clear reading order on phone widths. |
| Accessibility | Semantic landmarks, labelled controls, visible Acadia focus, native dialog semantics, live status copy, and textual history summaries are present. |

## Next design opportunities

1. **Credential-backed Brokerage QA.** Inspect magic-link, retained quote and manual fallback states with a real owner account.
2. **Asset-detail calibration.** Review a real first holding through the primary and advanced detail fields before widening the page.
3. **History calibration.** Review a real first week of snapshots before adding date-range controls or more financial chart density.
