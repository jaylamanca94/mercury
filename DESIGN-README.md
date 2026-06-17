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
- Use audience-facing labels in the UI: prefer `economic indicators`, `data status`,
  `what shapes this score`, and `live data` over internal terms like `macro`, `source posture`,
  `source drivers`, or `serverless route`.
- Name dashboard surfaces around the user's task before the product shell. Prefer `Global economy
  at a glance`, `Data coverage`, `Conditions score`, and `What shapes this score` over duplicate
  product labels or model-heavy language such as `Mercury Dashboard`, `Source coverage`,
  `Economy Score`, or `Score inputs`.
- Use charts and sparklines only when they clarify trend or movement.
- Use calm warning states for risk, uncertainty, stale data, and unavailable sources.

## Visual References

Mercury's look and feel can draw product-quality inspiration from Robinhood, Vanguard, and
Coinbase, but should apply principles rather than copy their visual systems.

- From Robinhood: simple first-scan financial cards, clear trend states, and low-friction scanning.
- From Vanguard: trust, restraint, source seriousness, and long-term financial credibility.
- From Coinbase: modern dark surfaces, compact account-style panels, and confident information
  density.

Use these references to guide polish, hierarchy, density, and trust signals while keeping Mercury
informational, source-backed, and explicitly not a trading or investment-advice product.

## UI Foundation

Use this file as the visual source of truth for `Mercury`. Update it whenever spacing, color, typography, icon sizing, chart treatments, interaction feel, accessibility, or reusable utilities change.

### Acadia Adapter

Mercury now treats `../Acadia` as the shared coded design-system baseline. Before adding a local UI style, check Acadia's live docs, operating model, foundations, templates, patterns, and CSS primitives for the needed layout, control, surface, state, icon, chart, or responsive behavior.

- Use Acadia primitives for shared product language: control anatomy, select arrows, search inputs, focus rings, raised rows, table/form behavior, dashboard status rows, command search, sheets, dialogs, and responsive spacing.
- Map Mercury variables onto Acadia-style adapter variables in `styles.css` before creating a new one-off component rule.
- Mercury's implemented adapter uses Acadia tokens for the app chrome, page shell, translucent surfaces, metric cards, native selects, icon actions, badges, focus rings, status rows, shadows, radius, theme behavior, and responsive page margins.
- Keep Mercury-specific economics language, source-trust rules, chart semantics, freshness labels, neutral financial tone, and public-data caveats in this document.
- Keep local exceptions narrow: source freshness semantics, market/economic movement colors, sparklines, score calculations, and dashboard content order may remain Mercury-specific.
- Do not use state-colored card borders, top rails, or outlines on metric cards. Match Acadia's neutral metric surface; show movement through text labels, deltas, and sparklines instead.
- If a Mercury pattern becomes useful for another product, graduate the neutral part into Acadia and keep Mercury's economy-specific wording and data treatment here.

## Color

Mercury should avoid looking like a brokerage or trading app. Use measured, professional economic-dashboard color rather than aggressive default market styling.

### Initial Direction

- Page background: deep neutral or soft off-white depending on theme
- Content surface: quiet high-contrast panels
- Positive movement: Acadia Tiffany-family movement color, using the accessible action/brand range
- Negative movement: soft salmon that pairs with the Tiffany palette
- Neutral or mixed movement: gray or blue-gray
- Risk or caution: amber
- Confidence or stability: blue

Use movement color sparingly and always pair it with text labels so color is not the only signal.
Loading, stable, no-change, and mixed states should use neutral gray or blue-gray treatment, not
positive Tiffany.

## Layout

The first useful dashboard should support fast scanning in less than 60 seconds.

Recommended dashboard order:

1. Slim app header with product identity and lightweight user/context affordance
2. Page title row with latest-check timestamp and refresh action
3. Current-conditions summary with a compact conditions score panel
4. Grouped metric sections for Economy and Currency
5. Risk and Confidence plus Global Snapshot
6. Data coverage and freshness

### Desktop

- 12-column grid or equivalent wide dashboard shell
- Page margin: Acadia `128px` desktop frame, reducing to `64px` on small desktop
- Column gap: Acadia dense dashboard gap, usually `24px`
- Content padding: Acadia dense panel padding, `24px`

### Tablet

- 8-column grid
- Page margin: Acadia `32px` tablet frame
- Column gap: `16px` to `24px`
- Content padding: `16px` to `24px`

### Mobile

- 4-column grid
- Page margin: Acadia `16px` mobile frame
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
- Sparkline panels in metric cards should span the full card content width, including the right-side
  icon reserve, let the line enter and exit at the chart edges, and use smoothed curves instead of
  sharp segmented paths, including two-point Today charts.
- Sparkline movement should include a subtle low-opacity area fill under the line using the same
  movement color. Keep the fill quiet so it supports scan clarity without becoming a heavy area chart.
- Avoid chart types that require financial expertise to interpret.
- Prefer labels like `Rising`, `Falling`, `Mixed`, `Stable`, `Elevated risk`, or `Improving confidence`.
- Do not use language like `buy signal`, `sell signal`, `undervalued`, or `overvalued`.
- Section gain/loss badges should be computed from comparable visible percent-change cards and
  update when period or region filters change. Treat them as lightweight rollups, not formal
  economic scores.
- Make stale, delayed, sample, fallback, no-data, and unavailable data visually distinct.
- Source-backed sections must update their own freshness labels from the current source response, including source observation time, previous-release comparison timing, and dashboard fetch timing when those are different.
- Show exact daily release dates for daily market/risk data, month-level labels for monthly economic releases, and year-level labels for annual regional releases.
- Pair source release dates with cadence-aware freshness labels: `Current`, `Delayed`, or `Stale`.
  Daily, weekly, monthly, quarterly, and annual data must use different thresholds so slower
  official releases are not treated like market charts.
- Static sample sections must show both the sample-set date and the live refresh state so users do not confuse prototype values with current data.
- Live-source sections must update their own freshness labels without implying that unrelated sample sections are live.
- If `/api/live-snapshot` is unavailable, the dashboard should show unavailable source states instead of sample economic values.

## Icons

- Use simple economic, globe, trend, alert, clock, source, and region icons when needed.
- Standard spacing between utility icons and text: `8px`.
- Icons should clarify category or status; avoid decorative icon clutter.

## Favicon And App Icon

- Mercury uses a Font Awesome chart-line mark for its favicon/app icon because it represents a source-backed global economy dashboard.
- App icons and favicons must be vector-first, not screenshots.
- The icon background uses a theme-aware vertical gradient: Dark Mode moves from slightly lighter gray on top to very dark black on bottom; Light Mode moves from very light gray on top to slightly darker light gray on bottom.
- The centered chart mark uses Mercury blue in Light Mode and white in Dark Mode for contrast.
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
- Use compact scope notes instead of dropdowns or segmented controls when a section is not yet
  filterable by source-backed data. Controls must visibly change the dashboard content when present.
- Period dropdowns use `Today`, `Week`, `Month`, and `Year` labels and should update card deltas,
  sparklines, and section rollups together.
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

Current source-backed utilities:

- The dashboard uses a calm command-center structure inspired by analytics dashboards: compact header, status summary, primary panels, and source freshness. Keep this hierarchy, but avoid sidebar-heavy app chrome, decorative banners, and trading-terminal density.
- The latest dashboard shell follows the Figma section model: a slim top nav, dark gray page
  canvas, centered `1160px` content column, title/action row, large current-conditions card, and
  stacked section panels for grouped metric cards.
- Primary metric groups should be organized by audience-facing categories such as `Economy` and
  `Currency`. Economy combines the top market/ticker cards with core macro indicators; Currency
  holds oil, dollar, and FX cards. Preserve risk, regional, and freshness context elsewhere on the
  page.
- Repeated metric cards should show a readable card name plus a compact ticker or series label in
  the header, for example `Technology` + `VGT` or `Inflation` + `CPI`.
- Any first-scan metric grouping should reuse live dashboard data rather than introduce a separate
  dataset. It is a presentation layer, not a new scoring model.
- Primary Market Pulse and Economic Health sections may use larger panel treatment to make the main data areas feel more substantial, while repeated metric tiles remain compact and source-aware.
- Repeated metric cards use `8px` radius, compact labels, source context, status chips, and small sparklines.
- The global Economy grid uses a deliberate desktop rhythm: three regional market cards on the
  first row and four secondary currency/oil cards on the second row. Collapse this to two columns
  near tablet widths and one column on mobile rather than leaving orphaned cards.
- Section headers may pair a title with a compact signed badge and right-aligned native selects,
  matching the latest Figma dashboard direction while preserving keyboard and screen-reader access.
- Metric cards and key signal tiles should use soft neutral surfaces with thin tone accents instead
  of saturated full borders, so direction remains visible without making Mercury feel like a
  trading interface.
- Sparkline panels should read as quiet chart wells: subtle neutral backgrounds, light grid
  texture, compact height, and restrained line weight rather than heavy gray blocks. Empty
  sparkline states should use calm labels such as `No trend`, not placeholder-like chart labels.
- Metric cards include their short indicator context and compact previous-release comparisons with
  prior observation dates, so users can understand direction without relying only on the sparkline
  or ticker.
- Every live indicator card includes compact source metadata for source, cadence, freshness, latest
  release timing, and caveats when relevant so users can judge trust without reading
  implementation details.
- Data coverage uses a compact snapshot metadata block for latest dashboard check, section-level source state, and upstream source links.
- Freshness metadata belongs alongside source metadata on metric cards, risk rows, region rows, the
  source rail, and the data coverage band. Treat delayed and stale labels as calm trust signals,
  not urgent trading-style alerts.
- Region and risk rows use icon, title, short context, and a plain-language trend label.
- Sample data must be visibly labeled in the header and source/freshness areas until live integrations exist.
- Mixed source states should use explicit labels such as `Live`, `Live source`, `Delayed`, `Stale`, `No data`, `Unavailable`, `Fallback`, `Sample`, and `Sample fallback` at the section or indicator level.
- Partial live source groups should show the count of live indicators, such as `3 of 4 live`, rather than a generic `Partial` label.
- Summary scores must include concise visible drivers and stay explicitly model-limited and illustrative until Mercury has a formal economic scoring framework.

Avoid utilities for:

- One-off dashboard experiments
- Trading-specific controls
- Temporary workarounds
- Visual treatments that only make sense for one indicator

## Maintenance Rule

This file is the living design standards README for Mercury.

When a UX detail, UI pattern, visual utility, chart treatment, component behavior, accessibility expectation, responsive rule, or product-specific design convention changes, update this file in the same work.
