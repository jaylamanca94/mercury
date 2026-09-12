# Mercury Design README

Use this file as the visual and interaction source of truth for Mercury. Keep this document updated as Mercury evolves.

> **Home simplification — 2026-09-05:** The original Figma dashboard hierarchy is restored on Home: headline/history, compact allocation, paired portfolio changes and two secondary estimates and four asset cards. The Portfolio, Income and Plan contracts below remain active. Legacy economy-dashboard guidance is historical reference.

## Acadia alignment — 2026-09-10

The active product follows published Acadia `d5408dd1df1840ff91727079f7270d6f9fd754ea`. This section supersedes older snapshot-specific class names, compact modal dimensions and adapters below. See `automation/design/2026-09-10/acadia-alignment.md` for the audited inventory and evidence.

- Vendor one unchanged stylesheet plus matching fonts and SVG assets; `acadia-vendor.json` owns provenance and integrity. Avoid extracted Table overrides and Acadia-prefixed local extensions.
- Compose static label/value groups using the existing Field layout, Grid and Lead/Title roles. The previous Read Only, Home Dashboard, Asset Preview Card, currency-affix and compact-modal extensions are absent from this published source. Home retains its financial hierarchy through Dashboard Layout, Content Card, Field, Cluster and shared grids. Currency belongs in the visible field label when no canonical prefix exists.
- Budget uses the same Table Responsive / Object Card contract as Portfolio: container widths at or below 32rem expose labelled cards, wider containers expose a real table with scoped headers, caption, focusable scroll region and scroll guidance. Both renderings share the exact filtered category rows and unfiltered allocation denominator. Re-rendering and viewport changes restore the corresponding visible action; deleting a record falls back to Add category.
- Form dialogs use current `is-form-modal` anatomy, its 44px controls, wrapping actions and internal scrolling. Remove the old `is-compact` modifier and Safari translation override. The discard confirmation remains the standard Dialog.
- Menus use native details/summary, close on Escape/outside pointer/action, and return keyboard focus appropriately. Close the source menu before opening a dialog; return to its visible summary. Modal triggers expose controls/haspopup/expanded. Sort disclosures use ordinary pressed buttons, without unimplemented application-menu keyboard semantics.
- Appearance uses Acadia native Select with System, Light and Dark in the desktop, tablet and phone account menus. Mercury retains its system default, theme metadata and blocked-storage recovery as the product adapter.
- **Local exceptions:** the asset editor's sticky actions clear the phone dock; the direct modal Form uses `box-sizing: border-box` because this Acadia revision adds focus-ring padding to an expanded content-box width, causing horizontal scroll. Remove the latter when the upstream width calculation includes padding. Both retain canonical anatomy, dimensions and tokens.
- Financial arithmetic, providers, account identity, durable storage and query/recovery policy remain Mercury-owned. Existing native fields, async draft retention, confirmation and guarded saves already compose the Form workflow; the new documentation does not require a wizard. Existing local record searches retain filters/view/return context under Search and results; no new search service is required.

## Active dashboard design contract

- Quote lookup must end in a usable price or existing retry/manual-valuation recovery. Preserve Symbol, Shares, other draft values and focus on timeout; do not add another dialog or replace an optional-data failure with a zero estimate. Browser quote work has a 25-second ceiling including session recovery.

- Keep canonical `acadia.css` and font assets unchanged. Mercury owns page composition and financial semantics in `styles.css` and `dashboard.js`; use Acadia dashboard, progress, table, tabs, dialog, status, navigation and control patterns.
- Use 48px section spacing, 24px module padding, 16px record spacing and 8px label/value gaps. Page titles are 32px, section titles 24px, primary metrics 40px (32px on phones), object titles 16px and labels 12–14px. Put metric bands on the canvas with internal dividers; reserve borders for meaningful modules. Counts remain neutral. Pair movement colour with Up, Down or No change.
- Home uses only existing Acadia classes: Dashboard Layout/Main, Card Trend, Chart List/Progress, Content Card, Field, Grid, Cluster and Content Card. Use the existing responsive Grid for asset cards (two columns on larger screens, one on phones). Do not add Home overrides to `styles.css`. No visible Home title, monthly planning breakdown or review feed.
- Net worth combines current investments and property equity. Missing valuation or property coverage makes the headline unavailable. All-time change compares current investment value with the first distinct recorded snapshot; Day change compares current holdings with previous market-close prices. Both exclude property equity. All-time change includes deposits and withdrawals; it is not an investment return.
- Show all available history immediately: a single Acadia trend point for one recorded date, a line from two dates, and a short empty message with no countdown before the first record. Reuse Card Trend, Trend Axis, Field, Grid and the shared page-header tools. Set the supported trend-height token to 10rem and tab visual-height token to the shared touch target; let the content card size naturally. Keep the date/value endpoints visible, with timestamp-proportional spacing and an accessible dated description. Use the unchanged published Acadia `buildCardTrendPath` utility for gentle curves and matching area fills; its bounded tangents preserve observations without overshoot. The single-record point remains unchanged. Use the latest record for duplicate dates. The history selector sits beside its concise label on larger screens and wraps on phones. Put one short investment/deposit scope note below the chart. Do not invent history or benchmark series.
- Home and Portfolio share investment allocation arithmetic: four largest valued holdings, deterministic ties, then Other investments. Home shows compact Acadia progress bars and percentage shares rounded to whole numbers in both visible and accessible labels; Portfolio retains amounts. Shares exclude property equity and disclose missing valuations. Zero value has an empty state. Filtering never changes this allocation. Use existing progress bars because Acadia has no donut primitive.
- Home keeps net worth and recorded history in the lead card. A single investment-summary card below the graph places All-time change and Day change first, using equal prominent amount and percentage pairs with Up/Down/No change, the first recorded date, previous-market-close context and one visible scope note. History range controls affect only the recorded chart; they never change either headline movement. Missing valuations/baselines withhold affected changes; a zero baseline withholds its percentage with an explanation. The same card places two secondary estimates beneath the changes: Expected annual growth automatically calculated from each holding’s current value and provider historical annualised return, and Annual dividends as an estimate. Grid adapts the metrics to their available width; allocation sits alongside the overview on larger screens. The headline uses Acadia Title with Field anatomy. Place its range tools in the same Acadia Page Header Section, which stacks at narrow container widths; keep the Portfolio history label directly above the graph. Map the supported Content Card padding token to Acadia dense padding throughout the Home overview. Missing valuations make dependent totals unavailable and receive a visible explanation beside net worth; partial return/yield coverage must never be presented as a complete estimate. Growth uses the existing historical-growth aggregate, excludes property and ignores manually saved holding or Plan return assumptions. Show Loading while provider metrics are pending and Unavailable for missing valuation/history coverage; never ask for manual return entry on Home. Identify historical provenance and that the estimate is not a forecast. Loading dividends have a short explicit state.
- Top assets ranks holdings and property equity together in up to four compact cards. Reuse Portfolio’s dense Content Card, Field and Object Card Header composition with neutral identity/value emphasis and one muted classification/share or property-valuation caption. Keep exact currency in the accessible name and value tooltip. Enter/Space opens investment details or the existing property editor. Investment entry focuses the asset heading; Back restores the originating Home card, falling back to Add asset if it is no longer in the top four. View all opens Portfolio. Add asset reuses Portfolio’s quick-add dialog; financial persistence and calculation rules remain shared.
- Portfolio leads with its page title and Add asset action, followed by one precise selected-group value using Acadia Title and Field. Keep property equity and recurring weekly equivalents beside their own sections. Portfolio allocation is an initially collapsed native Acadia Accordion after the records; its amounts, shares and coverage remain portfolio-wide and unfiltered.
- Portfolio uses compact interactive Acadia Content Cards in Grid: map the supported content-padding token to Acadia dense padding, compose identity/value with Field and Object Card Header, and use a muted small classification/share or manual-valuation caption. Keep exact currency in the accessible link name and value tooltip. Omit the repeated classification inside a selected group. Price, Return, Yield and Updated remain in Table and asset detail. Use canonical Acadia Table Responsive composition: the table becomes labelled Object Cards when its container is 32rem or narrower. The horizontal table region is keyboard-focusable with visible focus and scroll guidance.
- Investment groups use canonical Acadia App Workspace and Side Nav beside the holdings from 768px. Field rows pair each group label and compact value on one row, with counts and percentage shares using Progress beneath; All investments omits the repeated total and 100% share. Below 768px use one labelled native selector. Selecting a group updates the heading, precise headline value and both Cards/Table views; search does not alter group values or shares. Brokerage, Retirement and Crypto remain mutually exclusive, with Retirement taking precedence over Crypto. Withhold affected totals and all percentages when any valuation is missing; keep complete group values and explain unavailable allocation beside the selected headline on every screen. No percentage appears for zero totals. Keep controls stable for keyboard focus; native Enter and explicit Space activate group choices. Reuse Acadia layout primitives without Portfolio-specific CSS. Cards and Table preserve search/filter/sort; revisits reset to Cards. Keep the selected group count beside its unfiltered value. Search, Cards/Table and sort share an Acadia Grid/Cluster toolbar that wraps with available space. Show a separate live match count and Clear search only while searching; clearing search preserves group, view and sort and restores search focus. An empty group offers View all investments; empty comparisons hide scroll guidance. Use an accessible name directly on the blank Actions table heading so an absolutely positioned hidden label cannot extend the document beyond its scroll region.
- Saved holdings without a valuation stay visible and editable in both views. Display Needs valuation rather than zero, explain missing coverage beside the investment total, and expose the existing manual-price/total-value fields when no price exists. Successful correction restores the aggregate; available provider quotes retain their existing editing boundary.
- Recurring schedules form one Acadia content card and Object List, retaining saved cadence with one adjacent Edit action per row. Recurring and Property share a two-column Acadia Grid on tablet/desktop and stack on phones. Keep their title/count and caption/action rows aligned using the existing touch-size token. Recurring Edit focuses Contribution in asset details; ordinary Portfolio asset entry focuses its title. Back restores the corresponding card or Recurring action, falling back to Add asset if the record is absent. Background refresh must not steal focus. Property remains card-only with Equity as the primary metric and Market value/Mortgage balance below. Use a labelled 44px Add property icon action and show sorting only with multiple properties. Its add/edit and deletion dialogs use Acadia’s current form-modal variant for phone containment. Vendor the canonical accordion plus/minus SVGs with the stylesheet so disclosures retain their affordance.
- Income has Overview/Budget tabs below the header; `#income` opens Overview and `#income/budget` opens Budget. Tabs support arrows/Home/End and browser Back/Forward. Month is the initial period, preserved across subviews with Year available.
- One header disclaimer identifies gross planning amounts, including estimated/reinvested dividends, rather than confirmed deposits or spendable cash. Shared planned balance = expected income − planned spending − planned investing. Annualise each component, convert to the displayed period, then subtract those displayed-period components. Show exact cents where present so components reconcile. Loaded empty collections contribute zero; missing required data makes dependent totals unavailable while preserving known components.
- Income uses Acadia Title for the unboxed Planned balance, followed by one Content Card with a three-column Grid for Expected income, Planned spending and Planned investing. Earned/other income and estimated dividends form a quiet breakdown beneath Expected income. The grid stacks on phones. Overview places Sources alongside Dividends on tablet/desktop, with Sources first on phones. Source Content Cards show selected-period income, saved amount/cadence and wrapping Edit/Delete actions. Dividends use one Content Card with compact Object List rows; keep annual income and yield explicitly labelled regardless of planning period, and avoid repeating an asset name as its subtitle. Budget uses canonical Table Responsive and Object Cards for monthly category amounts, share of all planned spending and actions. Do not introduce local Income layout or typography rules when these Acadia compositions suffice.
- Income readiness identifies unavailable sources/categories, missing valuations and loading/yield coverage separately. One Retry data action reloads only failed collections without resetting the view, period, search or unrelated drafts; display pending/failure status and restore keyboard focus after recovery. Review valuations opens the existing Manual price field and returns to the same Income subview. Reuse Acadia Cluster/Button and the summary status region.
- The primary page action is Add income in Overview and Add category in Budget. Source/category dialogs focus Name/Category on entry and use Save/Cancel with deletion confirmations; no inline autosave. Restore focus after a save or cancel, and return to Add if the invoking record was deleted. Keep separate dividend, source and category searches adjacent to their records; filtering affects counts/rows, never totals or percentages. No-match states offer Clear search and restore focus to the relevant search field. Counts use quiet live statuses. The fully empty planning state invites Add income instead of claiming that income is fully allocated.
- Plan uses a compact Acadia Field header with one primary Plan settings action, followed by current investment value and annual recurring investments. A single Status Row identifies missing portfolio data, loading settings or incomplete valuations; hide and clear both charts until the complete investment outlook is available. Review Portfolio leads to the existing valuation repair flow. Never project a partially valued portfolio as a complete total.
- The available Outlook pairs Portfolio outlook and Projected portfolio income in a shared two-column Acadia Grid, stacking on phones. Each Content Card leads with its future value, explicitly labels the selected horizon and retains the current value beneath its chart. Use existing Card Trend and range endpoint typography; horizon buttons retain native pressed semantics. Calculation inputs use one three-column read-only grid with a single contextual Edit action and explicit Plan override, historical-return or From Portfolio source captions. Property equity is compact, separate context with Manage in Portfolio; it stays excluded from both projections. Reuse Acadia layout and typography, with only the shared Safari content-height dialog adapter.
- Plan settings shows the automatically calculated return and dividend yield first, with historical provenance visible. Focus Distribution policy on entry. Put optional custom rates behind the Acadia Accordion; expand it when saved overrides exist. Blank rates restore Portfolio calculations when complete coverage exists. Return uses current-value weights and each holding’s saved assumption before its historical annualised return; missing data never becomes zero. Preserve explicit Save/Cancel, retained failed drafts, unsaved-discard confirmation, locked pending writes and return focus to the invoking control.
- Add asset retains the compact Acadia form composition from Figma node `82:1593`, with the 2026-09-06 refinement: Symbol and Shares lead, Recurring (optional) uses a native Acadia Accordion, and Retirement remains directly available below it. Reset the disclosure and fields on a new entry. Show the read-only Price per share/Asset value preview only when a value is available, with exact cents and visible quote source/date. Put lookup status and manual recovery directly beneath the required inputs. Total-value mode hides Shares and the irrelevant price preview; switching symbols clears manual inputs and returns to price-based valuation. Advanced details remain on Asset detail. Use canonical Accordion panel padding and existing form, read-only, currency-affix and choice classes; no local CSS.
- Retirement is an editable per-holding classification inside the sole Brokerage account. It determines the Retirement investment group, including retirement crypto, and does not introduce a separate account or change the underlying valuation calculations.
- Asset detail uses the Figma hierarchy of Back, asset identity, summary metrics, investment profile, and a primary Details form. Its advanced fields live in Acadia Accordion disclosure; do not create a Mercury-specific details panel.
- Home has no sample-data state. A missing private configuration presents an empty disabled workspace; any displayed holding, quote, or history point must be persisted owner data.

## Flow recovery contract — 2026-09-05

- Configured private routes remain on sign-in until an authenticated owner is available. Do not show an empty, editable portfolio beneath authentication. Sending a magic link has visible pending and failure states and prevents duplicate submissions.
- Quote lookup waits for entered valid shares. The first failed lookup reveals manual price/total-value recovery immediately. Changing shares preserves a manual fallback already being edited.
- Background quote/metric rendering may update summaries, but must not overwrite the current asset form. Explicit Cancel reloads saved values. The asset Back control returns to its entry route, defaulting to Portfolio for direct links.
- Use a native pressed-button group for Plan horizon choices, with `aria-pressed`. These choices change a projection parameter rather than select tab panels. Route titles reflect the current workspace or asset.
- Retrying a failed holding write within the same Add dialog reuses its identity. Once the holding write is acknowledged, close Add and open the saved asset even if quote storage or account reloading fails. Explain each outcome separately; never describe a committed holding as an unsaved draft. Missing prices expose Retry price and the existing manual valuation fields. Keep acknowledged values visible after reload failure, with an explicit sync message.

## Asset editing refinement — 2026-09-05

- Compose the Details card and Acadia Form Actions inside one form. Keep the sticky action bar outside the clipped card so Save/Cancel remain reachable during long edits. The only local layout adapter raises the bar above the existing phone navigation using `--acadia-mobile-dock-clearance`.
- Saved values have inactive Save/Cancel controls. Editing a field or classification shows the quiet `Unsaved changes` live status. Returning every field to its saved value clears that state. Cancel restores the saved record.
- Read the form before disabling controls during persistence. Keep fields and Cancel locked while saving, prevent duplicate writes, then show `Changes saved` or a recoverable error with the draft intact. Reapply manual-valuation field availability afterwards.
- Use Acadia Summary Measures for the investment profile so return/yield labels and values have distinct hierarchy. No financial calculations or Home composition changes.

## Form-dialog containment — updated 2026-09-10

- All entry/edit/delete forms use current Acadia `is-form-modal`, Dialog Form, Field Grid and Dialog Actions. The shared control target is 44px without a compact-token override.
- Use native scrolling for long forms; Close/Cancel, pending-write protection, unsaved confirmation and failed drafts remain available. Fields stack on phones, and actions wrap with available width.
- The only modal compatibility correction is border-box sizing on the direct Form child, as recorded in the alignment exceptions above.

## Brokerage MVP visual contract

- Use the provided Brokerage sheet as the information model: summary metrics first, then holdings-value, allocation, annual-income, and history charts, followed by the core calculation table.
- The product adapts Acadia through a calm warm-paper content layer, dark functional chrome, teal for actions/data grouping, and semantic text treatment for movement. This keeps the personal-finance context measured and avoids trading-terminal urgency.
- Use 44px form controls, visible focus, compact labels, a native dialog, and direct validation copy. Price lookup, manual price, and manual total value must remain distinguishable in the UI.
- Persisted history uses Acadia SVG trends with textual summaries and the available-history contract above; never simulate history to fill space.
- The Portfolio investment table preserves scan-friendly density on desktop and tablet without changing value or metric semantics. On phones, the same columns become compact Acadia object rows so every field and action remains available without horizontal scrolling.
- No visual treatment may make last-known quotes, manual values, or live provider quotes look interchangeable.

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

### Acadia foundation

Mercury treats `../Acadia` as its complete coded design-system boundary. Before adding a UI surface, use Acadia's live docs, operating model, foundations, templates, patterns, and CSS primitives.

- Use Acadia primitives for shared product language: control anatomy, select arrows, search inputs, focus rings, raised rows, table/form behavior, dashboard status rows, command search, sheets, dialogs, and responsive spacing.
- Do not map, adapt, or override Acadia tokens in Mercury. `styles.css` only imports the canonical Acadia stylesheet.
- Mercury consumes Acadia directly for chrome, responsive navigation, page shell, content cards, metrics, controls, badges, focus, status, dialog, typography, and spacing.
- If a neutral primitive is missing, extend Acadia before using it in Mercury; do not create a Mercury equivalent.
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
- The Dashboard and Markets page heroes compare VOO (U.S. large cap), VXUS (international equities),
  VB (U.S. small cap), and VGT (U.S. technology). Index every series to 0% at the start of the
  selected period, use a shared percentage scale and a visible legend with distinct brand-consistent
  colors. VOO and VXUS use solid strokes; VB and VGT use dashed strokes. Render the lines at 72%
  opacity so overlaps visibly blend, and do not use area fills. This comparison remains fixed when
  the region filter changes.
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
- The mobile dashboard complete-outage card must include the source-backed-read explanation, retry
  action, and Data Coverage route before disabled Period or Region controls. If disabled controls
  remain visible, order and style them as secondary controls with nearby explanatory copy.
- Page `h1` labels remain destination identities in live, partial, and unavailable states:
  `Global Economy`, `Markets`, `Market context`, `Indicators`, and `Data Coverage`. Source-state
  copy belongs in badges, status cards, source-health rows, or explanatory copy, not as a page title.
- Use `Live data unavailable` for the page-level complete-outage state and `Unavailable` for compact
  badges. Reserve `not responding` wording for provider/source-health rows that describe a concrete
  source-attempt result.
- Data Coverage should distinguish the destination title from the current health section. The
  current health section may explain that live data is unavailable, but its heading should stay
  source-health oriented and the configured provider inventory should remain separate.
- Market context should use one combined unavailable-state pass for currencies, commodities, and
  digital assets during a complete outage; lower support grids return only when source-backed values
  are available.
- Markets should use one coherent complete-outage recovery card before disabled sorting controls;
  lower market grids return only when source-backed values can be sorted or compared.

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
- In complete outages, mobile Markets and Market context recovery cards should use the full content
  width rather than carousel tile widths when they are the only meaningful content in the section.
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
  `Market context`. Economy combines the top regional market cards with core economic indicators;
  Market context holds dollar, FX, oil, and Bitcoin cards. Preserve risk, regional, and freshness
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

## Draft and pending-write protection — 2026-09-05

- Changed asset details and open entry/edit dialogs require a deliberate Keep editing or Discard changes choice before leaving. Use Acadia's standard native dialog with labelled header/body/footer; Keep editing receives initial focus, and narrow layouts allow footer actions to wrap.
- Protect page Back, workspace links, modal Close/Cancel/Escape and browser unload. Pristine forms do not prompt. Browser unload protection is best effort and does not preserve drafts after a forced close or mobile process termination. Private drafts stay in memory only.
- All nine persistence dialogs reject duplicate submissions, disable their fields and dismissal controls during the request, expose busy state, and restore controls after failure. Read the submitted form values before disabling fields, including Add asset's asynchronous quote fallback. Do not reopen a dialog while its previous request is still settling.
- Skip to content moves focus and scrolls the current main region without changing the workspace route.

## Saved-asset recovery — 2026-09-07

- Use an existing Acadia warning Status Row above asset details for missing-price recovery. Say Asset saved after partial Add, with Retry price and manual-valuation guidance; otherwise say Price needed. Do not treat a missing price as zero or alter valuation arithmetic.
- Lock both price-refresh entry points during a request. Feedback stays with the requested asset; late responses never write messages into another asset. Preserve edited fields. Successful retry removes the warning and restores focus to the asset title when the initiating retry button disappears.
- Retain acknowledged holding/quote writes in memory if the subsequent account reload fails. Explain that saving succeeded and syncing needs a page reload. Do not offer Add again for a committed holding.
- A successful deletion updates the local holding/quote collections and returns directly to Portfolio; do not run a redundant read while the deletion dialog's navigation guard is still pending.
- Property add/edit starts at Property name, consistent with Income and Budget first-field focus. Existing dismissal, pending-write and return-focus protections remain active.

## Income yield recovery — 2026-09-07

- When a valued, non-crypto holding has no annual dividend estimate and its provider metrics are no longer loading, show a quiet missing-yield count and Review yields action beneath the shared Income summary. Count the full portfolio regardless of dividend search. Keep unavailable totals honest; never infer a zero yield.
- Review yields opens the first affected holding; each affected dividend row also offers Set yield with the holding in its accessible name. Reuse Acadia Cluster, quiet Button, Read Only and the existing asset Accordion; no new styles or dialog.
- Open More details and focus Manual distribution yield on entry. Centre the focused field and return control in view to avoid the phone dock. Preserve Income Overview/Budget, Month/Year and search state; Back restores the invoking action or the relevant search/tab if the action is gone after repair. Background renders preserve row-action focus without reopening the asset field.
- Valid zero income, available provider estimates, crypto and still-loading provider metrics do not prompt for a missing yield. Missing valuations and unavailable source/category collections remain separate recovery concerns. Saving still uses the existing explicit Save/Cancel, failure retention and unsaved-navigation protection.

## Add asset intrinsic sizing — historical 2026-09-07

The previous compact-grid modal required a Safari translation adapter. The 2026-09-10 alignment replaces that obsolete modifier with the current Acadia flex modal and removes the translation. Earlier 560px measurements describe the retired snapshot, not the current acceptance target.
