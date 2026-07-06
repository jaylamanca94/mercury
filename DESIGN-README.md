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
- The first viewport should answer `how is the world doing?` with a short hero insight generated
  from visible live cards, not just a numeric score.
- Match Apollo's product-level structure: Mercury's home page should be a compact whole-product
  dashboard with top-level navigation and clear paths into deeper pages, while detail pages can
  carry fuller card treatments, source context, and focused controls.
- Period, region, freshness, and refresh controls belong inside the Global Economy hero so the
  selected scope and the resulting briefing read as one unit. On desktop, anchor them to the
  top-right of the hero card to reduce dead space above the briefing. On mobile, the period and
  region controls should stay in a two-column grid when space allows.
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
- Mercury's implemented adapter uses Acadia tokens for the app chrome, no-capsule desktop header navigation, floating glass mobile dock navigation, page shell, translucent surfaces, metric cards, native selects, icon actions, badges, focus rings, status rows, shadows, radius, system-first theme toggle behavior, and responsive page margins.
- Mercury's dashboard polish layer may add subtle economic-weather atmosphere, trust/source chips, chart wells, and state-tinted icons as long as the underlying Acadia surface, card, control, focus, and responsive contracts remain intact.
- Static pages with the floating mobile dock must opt into `viewport-fit=cover` and keep the
  browser `theme-color` synchronized with the effective Light or Dark theme, so iOS safe-area
  spacing and mobile browser chrome match the visible app canvas.
- Keep Mercury-specific economics language, source-trust rules, chart semantics, freshness labels, neutral financial tone, and public-data caveats in this document.
- Keep local exceptions narrow: source freshness semantics, market/economic movement colors, sparklines, score calculations, and dashboard content order may remain Mercury-specific.
- Do not use state-colored card borders, top rails, or outlines on metric cards. Match Acadia's neutral metric surface; show movement through text labels, deltas, and sparklines instead.
- Metric cards can use quiet state-tinted icon wells and chart backgrounds, but card borders should stay neutral until hover/focus so the dashboard does not read like a trading terminal.
- Ticker metric cards follow the Figma `Property 1=Default` component: white card, 4px radius,
  1px `#e2e3e5` border, 8px padding, subtle 2px/4px shadow, two compact 12px text rows, and a
  52px `#f8f9fa` graph well. Do not add an icon well to ticker cards.
- If a Mercury pattern becomes useful for another product, graduate the neutral part into Acadia and keep Mercury's economy-specific wording and data treatment here.

### Relay-Informed Mobile Standard

Relay is the current Acadia reference for mobile product judgment. Mercury should adopt the neutral lessons without copying Relay's media styling:

- Each phone screen should answer one economy question, such as what changed, where, and how fresh the source is.
- Keep indicator, region/period context, freshness, interpretation, and the next action attached in each signal row or card.
- Let focused filter, region, and indicator-detail flows use bottom-friendly controls and reduce competing chrome when it improves completion.
- On the mobile dashboard, the current read or unavailable-state explanation should appear before
  disabled region shortcuts; shortcuts can remain available in live and partial states when they
  change source-backed content.
- Never let sample, delayed, stale, unavailable, or fallback values look like live economic evidence.
- Keep mobile summaries calm and decision-oriented; deeper source diagnostics and model caveats belong on detail pages.

## Color

Mercury should avoid looking like a brokerage or trading app. Use measured, professional economic-dashboard color rather than aggressive default market styling.

### Initial Direction

- Page background: deep neutral or soft off-white depending on theme
- Content surface: quiet high-contrast panels
- Positive movement: Mercury's deeper Acadia green, shared with the product mark and primary live-data accents
- Negative movement: vibrant soft salmon that pairs with the green palette
- Neutral or mixed movement: gray or blue-gray
- Risk or caution: amber
- Confidence or stability: blue

Use movement color sparingly and always pair it with text labels so color is not the only signal.
Loading, stable, no-change, and mixed states should use neutral gray or blue-gray treatment, not
positive green.

## Layout

The first useful dashboard should support fast scanning in less than 60 seconds.

Recommended dashboard order:

1. Slim app header with product identity and lightweight user/context affordance
2. Full-width hero insight with market sentiment, signed change, aggregate trend, top movers, and the period/region/freshness controls attached to the same surface
3. Overview tiles that link to Markets, Supports, Indicators, and Data
4. Compact home panels for Regional Markets, Currencies, Commodities, Risk & Confidence, Economic Health, and Data coverage
5. Deeper pages for the fuller focused views

### Desktop

- 12-column grid or equivalent wide dashboard shell
- Page margin: Acadia `128px` desktop frame, reducing to `64px` on small desktop
- Column gap: Acadia dense dashboard gap, usually `24px`
- Content padding: Acadia dense panel padding, `24px`
- The home dashboard may use tighter card padding and shorter sparkline panels so the main product
  surfaces fit into a single command-center view on wide desktop screens. Detail pages should keep
  the fuller Acadia card rhythm.
- The home hero should keep scope, source trust, freshness, and refresh controls attached to the current economic read so the first scan feels like one live object rather than a loose dashboard header.

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

- Pair every numeric movement with direction and timeframe when possible.
- Distinguish direction from economic interpretation. Some moves, such as oil prices falling, are
  contextual rather than automatically good or bad; hero copy should describe those as mixed signals
  instead of primary drags or wins.
- Exclude context-only indicators from the Global Economy badge, hero sparkline, and hero mover
  chips when their direction is not inherently good or bad for global conditions. Oil, FX crosses,
  inflation, and interest rates can remain visible cards, but they should not vote in the same
  directional score as regional market proxies or Bitcoin without an explicit interpretation model.
- Use sparklines for recent direction, not detailed analysis.
- Sparkline panels in metric cards should span the full card content width, including the right-side
  icon reserve, let the line enter and exit at the chart edges, and use smoothed curves instead of
  sharp segmented paths, including two-point Today charts.
- Longer-horizon sparklines such as Year and 5 years should apply a light smoothing/downsampling
  pass so dense daily market history reads as a calm trend instead of a jagged raw data trace.
- Sparkline movement should include a subtle low-opacity area fill under the line using the same
  movement color. Keep the fill quiet so it supports scan clarity without becoming a heavy area chart.
- Avoid chart types that require financial expertise to interpret.
- Prefer labels like `Rising`, `Falling`, `Mixed`, `Stable`, `Elevated risk`, or `Improving confidence`.
- Do not use language like `buy signal`, `sell signal`, `undervalued`, or `overvalued`.
- Section gain/loss badges should be computed from comparable visible percent-change cards and
  update when period or region filters change. Treat them as lightweight rollups, not formal
  economic scores.
- Make stale, delayed, sample, fallback, no-data, and unavailable data visually distinct.
- Source-backed sections must update their own freshness labels from the current source response, including source observation time and dashboard fetch timing when those are different.
- Data Coverage must keep current source health separate from configured provider inventory. Provider
  names such as Yahoo Finance, FRED, and World Bank describe source references unless the current
  source-health list says those groups returned usable values.
- Dynamic source-health and provider-inventory regions must clear `aria-busy` after fallback, partial,
  and live renders so assistive technology receives the settled state.
- Show exact daily release dates for daily market/risk data, month-level labels for monthly economic releases, and year-level labels for annual regional releases.
- In compact metric cards, omit routine dates for current daily market data. Show daily dates when
  freshness is delayed or stale, and keep month/year labels for slower official releases.
- Narrative indicator briefings must only interpret source-backed values. While economic releases
  or risk indicators are still loading or unavailable, use waiting/unavailable copy and do not
  describe the read as mixed, stable, improving, or under pressure.
- Pair source release dates with cadence-aware freshness labels: `Current`, `Delayed`, or `Stale`.
  Daily, weekly, monthly, quarterly, and annual data must use different thresholds so slower
  official releases are not treated like market charts.
- Static sample sections must show both the sample-set date and the live refresh state so users do not confuse prototype values with current data.
- Live-source sections must update their own freshness labels without implying that unrelated sample sections are live.
- If `/api/live-snapshot` is unavailable, the dashboard should show unavailable source states instead of sample economic values.
- In a complete live-data outage, the dashboard should lead with one page-level unavailable
  explanation, keep retry and Data Coverage available, and avoid repeating low-value unavailable
  metric grids after that explanation.
- Page `h1` labels remain destination identities in live, partial, and unavailable states:
  `Global Economy`, `Markets`, `Market Supports`, `Indicators`, and `Data Coverage`. Source-state
  copy belongs in badges, status cards, source-health rows, or explanatory copy, not as a page title.
- Data Coverage should distinguish the destination title from the current health section. The
  current health section may explain that live data is unavailable, but its heading should stay
  source-health oriented and the configured provider inventory should remain separate.
- Market Supports should use one combined unavailable-state pass for currencies, commodities, and
  digital assets during a complete outage; lower support grids return only when source-backed values
  are available.

## Icons

- Use simple economic, globe, trend, alert, clock, source, and region icons when needed.
- Standard spacing between utility icons and text: `8px`.
- Icons should clarify category or status; avoid decorative icon clutter.

## Favicon And App Icon

- Mercury uses a Font Awesome money-bill-wave mark for its favicon/app icon because it represents a source-backed economy briefing centered on money flows and market movement.
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
- Period dropdowns use `Today`, `Week`, `Month`, `Year`, and `5 years` labels and should update card deltas,
  sparklines, and section rollups together.
- Clickable rows and cards should have clear pointer, hover, and keyboard focus states.
- Repeated dashboard links, header navigation, icon actions, and mobile region tabs should keep the
  Acadia focus halo and a restrained pressed state; focus should read stronger than hover without
  changing layout.
- Loading, no-data, stale-data, and error states should be plain, calm, and useful.

## Accessibility And Responsiveness

- Support keyboard navigation for interactive controls.
- Preserve visible focus states.
- Use semantic HTML whenever practical.
- Dynamic dashboard regions that rerender from live data should expose `aria-live` and `aria-busy`
  states, and generated cards should include concise accessible summaries for name, value,
  movement, trend, and source state.
- Keep text readable in both light and dark mode.
- Ensure layouts work across desktop, tablet, and mobile.
- Avoid text overflow, cramped controls, and overlapping UI.
- Mobile persistent chrome must not cover recovery actions, Data Coverage links, source-health
  status, provider inventory, or final cards; keep bottom padding and scroll padding aligned with
  the floating dock and safe-area inset.
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
  `Market supports`. Economy combines the top regional market cards with core economic indicators;
  Market supports hold dollar, FX, oil, and Bitcoin cards. Preserve risk, regional, and freshness
  context elsewhere on the page.
- Repeated metric cards should show a readable card name on the visible surface. Hide tickers,
  proxy codes, and series identifiers from the card face unless they are the user's primary label;
  keep them available through hover/detail/source context instead.
- Any first-scan metric grouping should reuse live dashboard data rather than introduce a separate
  dataset. It is a presentation layer, not a new scoring model.
- Primary Market Pulse and Economic Health sections may use larger panel treatment to make the main data areas feel more substantial, while repeated metric tiles remain compact and source-aware.
- Repeated metric cards use `8px` radius, compact labels, source context, status chips, and small sparklines.
- The global Economy grid uses a deliberate desktop rhythm: three regional market cards on the
  first row, three fiat/currency cards on the second row, and oil plus Bitcoin as a wider
  commodity/digital-asset support pair. Collapse this to two columns near tablet widths and one
  column on mobile rather than leaving orphaned cards.
- Period, region, freshness timestamp, and refresh action should live inside the hero card, anchored
  to the top-right on desktop and left-aligned when the controls wrap. Do not put them above the hero
  as a separate page-level row or in a competing top-right card. On mobile, keep Period and Region in
  a two-column row so controls do not dominate the first viewport.
- Mobile economy command cards should read as embedded instrument panels, not separate heavy cards:
  keep region shortcuts split into a compact label plus movement value, use a single calm trend
  chart, and group source freshness in a soft tray.
- The global briefing hero should span the dashboard width as one Acadia surface for `Global
  economy at a glance`, sentiment, explanatory copy, aggregate trend, and top movers.
- Section headers may pair a title with a compact signed badge and right-aligned native selects,
  matching the latest Figma dashboard direction while preserving keyboard and screen-reader access.
- The hero badge should combine sentiment and movement, such as `Healthy +0.5%`, and the hero copy
  should explain the biggest visible drivers in one sentence. Give the sentiment and signed move
  enough visual weight to feel like a briefing lead, then show a period-aware aggregate sparkline
  built from the same visible score-eligible cards. Use compact mover chips as supporting evidence
  rather than a separately labeled widget. Use visible metric cards for top movers and the hero trend,
  but only when their movement direction has a clear score interpretation.
- The hero briefing card needs clear vertical rhythm. Keep at least `16px` between title, insight,
  aggregate chart, and mover chips unless the layout is deliberately compressed on small screens.
- Metric cards and key signal tiles should use soft neutral surfaces with thin tone accents instead
  of saturated full borders, so direction remains visible without making Mercury feel like a
  trading interface.
- Sparkline panels should read as embedded movement marks on the metric card surface, not as nested
  mini-cards. Keep chart starts and ends aligned to the card's content padding, avoid separate chart
  backgrounds, borders, and shadows, and include a quiet dotted baseline for the starting/no-change
  level. Use a lightweight line with low-opacity area fill so movement is visible without becoming
  a heavy area chart. The chart and footer content should span to the normal card content padding;
  reserve space for the top-right icon only in the card header. Empty sparkline states should use
  calm labels such as `No trend`, not placeholder-like chart labels.
- Metric cards should pair the title with one compact inline code, such as `VOO`, `USD`, `EUR`,
  `CPI`, or `GDP`, instead of a second-line subtitle. Keep longer proxy details available through
  hover/source context. Do not show previous-value footers in the scannable card grid when the
  visible percent or point change already explains the comparison.
- Core market cards such as `S&P 500`, `Small Cap`, and `Technology` should stay category-led. Use
  `business-time` for S&P 500, `shop` for Small Cap, and `microchip` for Technology.
- Region cards should use specific earth icons: `earth-americas` for United States,
  `earth-europe` for Europe, and `earth-asia` for Asia.
- Bitcoin should use the Font Awesome brand Bitcoin mark rather than a generic coin stack.
- Avoid repeating provider names such as `Yahoo Finance` inside every metric card. Use the Data
  coverage section for provider attribution, source freshness, and caveats; use card-level metadata
  only when a date or cadence materially affects trust.
- Data coverage uses a compact snapshot metadata block for latest dashboard check, section-level source state, and upstream source links.
- Freshness metadata belongs in the data coverage band by default. Treat delayed and stale labels as
  calm trust signals, not urgent trading-style alerts, and surface date context on cards only when
  freshness is not current or the source cadence is slower than daily.
- Region and risk rows use icon, title, short context, and a plain-language trend label.
- Sample data must be visibly labeled in the header and source/freshness areas until live integrations exist.
- Mixed source states should use explicit labels such as `Live`, `Live source`, `Delayed`, `Stale`, `No data`, `Unavailable`, `Fallback`, `Sample`, and `Sample fallback` at the section or indicator level.
- Partial live source groups should show the count of live indicators, such as `3 of 4 live`, rather than a generic `Partial` label.
- Source, freshness, and last-checked badges should use neutral loading, live/current, caution, and
  unavailable treatments intentionally. Unavailable source labels must not reuse the primary/live
  teal treatment.
- Summary scores must include concise visible drivers and stay explicitly model-limited and illustrative until Mercury has a formal economic scoring framework.

Avoid utilities for:

- One-off dashboard experiments
- Trading-specific controls
- Temporary workarounds
- Visual treatments that only make sense for one indicator

## Maintenance Rule

This file is the living design standards README for Mercury.

When a UX detail, UI pattern, visual utility, chart treatment, component behavior, accessibility expectation, responsive rule, or product-specific design convention changes, update this file in the same work.
