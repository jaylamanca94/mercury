# Mercury Design README

Use this file as the visual and interaction source of truth for Mercury. Keep this document updated as Mercury evolves.

This file is intentionally separate because design standards, chart language, and reusable dashboard utilities will grow over time.

## Product Feel

Mercury should feel like checking the weather, but for the global economy: clear, calm, current, and easy to scan.

- Prefer familiar dashboard patterns before custom UI patterns.
- Keep visual decisions simple enough for a solo product builder to maintain.
- Prioritize clarity, trust, speed, and neutrality over visual novelty.
- Avoid finance-terminal density unless the user needs it to understand the current condition.
- Avoid trading-app cues that imply action, speculation, or urgency.
- Make direction, risk, confidence, source, freshness, and region easy to find.
- Use plain-language status labels alongside numbers.
- Use charts and sparklines only when they clarify trend or movement.
- Use calm warning states for risk, uncertainty, stale data, and unavailable sources.

## UI Foundation

Use this file as the visual source of truth for `Mercury`. Update it whenever spacing, color, typography, icon sizing, chart treatments, interaction feel, accessibility, or reusable utilities change.

## Color

Mercury should avoid looking like a brokerage or trading app. Use measured, professional economic-dashboard color rather than aggressive red/green market styling.

### Initial Direction

- Page background: deep neutral or soft off-white depending on theme
- Content surface: quiet high-contrast panels
- Positive movement: restrained green
- Negative movement: restrained red
- Neutral or mixed movement: gray or blue-gray
- Risk or caution: amber
- Confidence or stability: blue

Use red/green direction sparingly and always pair it with text labels so color is not the only signal.

## Layout

The first useful dashboard should support fast scanning in less than 60 seconds.

Recommended dashboard order:

1. Global economy status summary
2. Market Pulse
3. Economic Health
4. Risk and Confidence
5. Global Snapshot
6. Source coverage and freshness

### Desktop

- 12-column grid
- Page margin: `24px`
- Column gap: `24px`
- Content padding: `24px`

### Tablet

- 8-column grid
- Page margin: `16px`
- Column gap: `16px`
- Content padding: `16px`

### Mobile

- 4-column grid
- Page margin: `16px`
- Column gap: `16px`
- Content padding: `16px`

## Spacing Scale

Use 8px spacing increments whenever possible.

- XS: `8px`
- SM: `16px`
- MD: `24px`
- LG: `32px`
- XL: `40px`
- XXL: `48px`
- XXXL: `64px`

## Typography

Typography values are defined as font size and line height.

| Style | Font Size | Line Height |
| --- | ---: | ---: |
| Display | `48px` | `56px` |
| Page Title | `40px` | `48px` |
| Large Heading | `32px` | `40px` |
| Heading | `24px` | `32px` |
| Lead | `20px` | `24px` |
| Body | `16px` | `24px` |
| Small | `14px` | `16px` |
| Caption | `12px` | `16px` |

Use compact, scannable typography inside dashboard cards. Reserve display-sized type for the primary economic status, not every metric.

## Radius

- XS: `2px`
- SM: `4px`
- MD: `8px`
- LG: `16px`
- XL: `24px`

Use `8px` or less for normal cards and repeated list items unless a larger container treatment is explicitly requested.

## Chart And Indicator Guidance

- Pair every numeric movement with direction, timeframe, source, and update time when possible.
- Use sparklines for recent direction, not detailed analysis.
- Avoid chart types that require financial expertise to interpret.
- Prefer labels like `Rising`, `Falling`, `Mixed`, `Stable`, `Elevated risk`, or `Improving confidence`.
- Do not use language like `buy signal`, `sell signal`, `undervalued`, or `overvalued`.
- Make stale, delayed, sample, fallback, and unavailable data visually distinct.

## Icons

- Use simple economic, globe, trend, alert, clock, source, and region icons when needed.
- Standard spacing between utility icons and text: `8px`.
- Icons should clarify category or status; avoid decorative icon clutter.

## Favicon And App Icon

- Every web or mobile product should eventually have a simple recognizable favicon/app icon.
- Use a Font Awesome Free icon as the preferred starting point when it fits the product.
- Pick an icon that represents the product mission, not a generic decoration.
- Keep the icon simple enough to work at small sizes.
- Include standard browser favicon support when the product has a web app scaffold.
- Add mobile/app touch icon support when the product is ready for mobile polish.
- Document the icon choice in `DESIGN-README.md` or `README.md`.

## Interaction Feel

- Dashboard cards should be easy to scan without requiring interaction.
- Interactions should reveal context, source details, explanations, or historical trend depth.
- Avoid controls that imply trading, ordering, transactions, portfolio management, or alerts before those workflows are approved.
- Clickable rows and cards should have clear pointer, hover, and keyboard focus states.
- Loading, no-data, stale-data, and error states should be plain, calm, and useful.

## Accessibility And Responsiveness

- Support keyboard navigation for interactive controls.
- Preserve visible focus states.
- Use semantic HTML whenever practical.
- Keep text readable in both light and dark mode.
- Ensure layouts work across desktop, tablet, and mobile.
- Avoid text overflow, cramped controls, and overlapping UI.
- Do not rely on color alone for positive/negative/risk/confidence states.

## Utility Guidance

Add reusable utilities here when a pattern is reusable across Mercury.

Good utility candidates:

- Metric card layouts
- Trend indicator rows
- Source/freshness rows
- Status chips
- Region summary rows
- Sparkline and chart wrappers
- Empty, loading, stale, fallback, and error state patterns
- Light and dark mode helpers

Current prototype utilities:

- Repeated metric cards use `8px` radius, compact labels, source context, status chips, and small sparklines.
- Every sample indicator includes an inline metadata row for sample status, candidate source, and expected update cadence so users do not mistake prototype values for live data.
- Region and risk rows use icon, title, short context, and a plain-language trend label.
- Sample data must be visibly labeled in the header and source/freshness areas until live integrations exist.
- Summary scores must include concise visible drivers and stay explicitly illustrative until Mercury has a formal scoring model.

Avoid utilities for:

- One-off dashboard experiments
- Trading-specific controls
- Temporary workarounds
- Visual treatments that only make sense for one indicator

## Maintenance Rule

This file is the living design standards README for Mercury.

When a UX detail, UI pattern, visual utility, chart treatment, component behavior, accessibility expectation, responsive rule, or product-specific design convention changes, update this file in the same work.
