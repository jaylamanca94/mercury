# Portfolio Header Spacing — Design QA

## Evidence

- Figma source: Mercury node `110:7662` (`Mercury / Portfolio - Macbook 14'`). Design context defines the Header as a vertical stack with a 24px gap and the following content container with `padding-top: 24px`.
- Annotated reference: `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_SAw7wk/Screenshot 2026-09-04 at 2.25.14 PM.png`.
- Browser-rendered implementation: `http://127.0.0.1:4317/?portfolio-spacing=20260904-v1#portfolio`, checked in the Codex in-app Browser in light and dark themes.
- The local Supabase environment was unavailable, so the browser showed Mercury's genuine empty state. The corrected geometry applies to the shared Cards/Table panels and Property content surfaces and does not depend on populated data.

## Runtime Measurements

- Portfolio page header bottom to Portfolio content top: `24px`.
- Investments control row bottom to active Cards panel top: `24px`.
- The active empty state begins at the same panel boundary, retaining the intended `24px` rhythm.
- Stylesheet cache key resolved to `styles.css?v=20260904-portfolio-spacing-v1`.
- Browser console after the final pass: no errors.

## Comparison

- The obsolete Mercury `-8px` page-header margin correction was removed. The workspace now inherits Acadia's canonical `--acadia-space-3` (`1.5rem`, 24px) stack gap.
- Portfolio content surfaces use the same Acadia spacing token, matching the annotated Figma boundary without changing card anatomy, filters, tabs, table behaviour, Property content, or responsive rules.
- Both light and dark themes retain the expected surfaces, borders, typography, focusable controls and content hierarchy.
- No new asset, icon, colour or layout primitive was introduced.

## Comparison History

1. Before the correction, the page-header boundary measured `16px`; the Investments header met its content panel with no vertical separation.
2. After removing the negative margin and applying the existing dense-section token to Portfolio content surfaces, both requested boundaries measured `24px`.
3. No P0, P1 or P2 visual, accessibility or interaction issue remained in the focused pass.

final result: passed
