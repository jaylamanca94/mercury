**Comparison target**

- Source visual truth: Figma `CSCV8qZu9ryspC07K36vTg`, node `82:1863` (Home desktop dashboard).
- Intended implementation route: `http://127.0.0.1:4175/`.
- Intended state: authenticated Brokerage account with valued holdings and at least two New York daily snapshots, desktop dark theme.

**Evidence status**

- Figma design context was retrieved for node `82:1863`; it establishes the Dashboard header, four equal metric-card hierarchy, Performance card, and Investments preview.
- The Home route rendered in the in-app browser at `127.0.0.1:4175` in the available unconfigured private-sync state. Its accessibility tree confirms the four metric cards, disabled period controls, four-card Investments preview contract, and target status beneath Investments.
- A browser-rendered screenshot file could not be captured or persisted by the available browser session. The available state also has no authenticated portfolio data, so it cannot be matched against Figma's populated layout without inventing values.
- Automated syntax, calculation, and source-rendering contracts passed, but they do not substitute for a populated visual comparison.

**Findings**

- [P1] Populated visual comparison is blocked.
  Location: Home desktop and responsive breakpoints.
  Evidence: the available browser state is an unconfigured, truthful empty workspace; no persisted screenshot capture is available for side-by-side comparison with Figma.
  Impact: populated-card density, Performance fill sizing, responsive four-card wrapping, and target-status spacing remain unverified at the required visual level.
  Fix: open an authenticated Brokerage Home with holdings and two daily snapshots, capture it at the Figma desktop viewport, then compare it with node `82:1863` before marking this review passed.

**Required fidelity surfaces**

- Fonts and typography: Acadia's loaded Home structure was rendered, but populated card weights and wrapping are blocked pending a matching capture.
- Spacing and layout rhythm: the four metric cards, Performance, Investments, and target status rendered in the intended order; exact populated spacing remains blocked.
- Colors and visual tokens: the rendered empty state uses the Acadia dark theme; populated data-state contrast remains blocked.
- Image quality and asset fidelity: the Mercury mark is sourced from the existing product asset; visual placement remains blocked pending a screenshot.
- Copy and content: confirmed in the rendered tree as Portfolio value, Selected-period change, Expected annual return, and Annual dividends. The unconfigured state correctly avoids sample values.

**Implementation checklist**

1. Sign in to an account containing valued holdings and two persisted daily snapshots.
2. Capture desktop and phone Home at a matched Figma state.
3. Compare typography, four-column metric wrapping, Performance chart height, Investments controls, and target-status spacing; resolve any P0-P2 differences.

final result: blocked

---

## Add Asset retirement classification — 2026-09-03

**Comparison target**

- Source visual truth: `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_mBrgk1/Screenshot 2026-09-03 at 7.45.34 PM.png`.
- Browser-rendered implementation: `/tmp/mercury-retirement-modal-final.png`.
- Responsive capture: `/tmp/mercury-retirement-mobile.png`.
- Desktop viewport: 1440 × 1000 CSS pixels at device scale 1; modal capture: 560 × 497 pixels.
- Mobile viewport: 390 × 844 CSS pixels at device scale 1; modal: 358 × 738 pixels.
- Source raster: 1590 × 1412 pixels. The modal frame was compared by normalising its composition to the implementation's 560 × 497 CSS frame; browser chrome and background content were excluded from the fidelity judgement.
- State: dark theme, VOO / 417 shares / $713 / $297k / $100 weekly, Retirement unchecked.

**Full-view comparison evidence**

- The source and implementation were opened together at the same populated interaction state. The implementation retains the two 236px columns, 32px desktop inset, 24px vertical rhythm, 48px Retirement choice card, opposite-edge actions, liquid-glass surface, and 560px desktop width.
- The mobile capture collapses the two-column fields and read-only outputs to one column. The Retirement choice expands to the available 324px content width without horizontal or vertical clipping.

**Focused region comparison evidence**

- A separate crop was unnecessary because the component-only 560 × 497 capture keeps every label, control, glyph, border, and action legible at 1:1 scale.

**Findings**

- No actionable P0, P1, or P2 differences remain.
- The initial comparison found the Retirement label heavier than the source. It now uses Acadia's regular body weight; the final capture is the post-fix evidence.

**Interaction evidence**

- Verified unchecked and checked states, reset on reopen, Symbol autofocus, Escape dismissal, focus return to Add asset, responsive collapse, and the enabled Retirement filter's selected state.
- The page contains meaningful content, no framework error overlay, and no browser console errors.
- Authenticated Supabase insertion was not exercised in the local unconfigured state; payload, normalisation, schema, and update paths are covered by the automated suite.

**Implementation checklist**

- `20260903202800_retirement_holdings.sql` was applied to the Mercury Supabase project on 2026-09-03.
- Recheck one authenticated save and detail edit after the updated application is deployed.

final result: passed

---

## Income Budget categories — 2026-09-04

**Comparison target**

- Source visual truth: `/Users/jaylamanca/Desktop/Mercury/Income - Macbook 14_.png` and Figma `CSCV8qZu9ryspC07K36vTg`, node `115:3248`.
- Browser-rendered implementation: a temporary populated QA fixture using the production `index.html` composition and `styles.css`, plus `http://127.0.0.1:4199/#income` for the truthful unavailable-schema state.
- Desktop viewport: 1512px, matching the supplied 3024px-wide raster at 2x density. Responsive Budget inspection: 390px.
- State: dark theme; the populated fixture uses the supplied illustrative categories only for layout comparison. The application itself continues to render private owner data.

**Full-view comparison evidence**

- The desktop implementation follows the target hierarchy: Income header and search, Year/Month control, four equal Summary cards with Expenses first, Dividends, Sources, then the inline Budget section.
- The Budget card renders at a 596px outer maximum width with Acadia liquid-glass treatment, 32px padding, compact controls, and the target heading and add action.
- At 390px, each category's name and amount stack to full width while its allocation and action menu remain on a compact final row. The card stays within the mobile viewport.

**Focused region comparison evidence**

- The Budget region was inspected separately at desktop and 390px widths. Its row rhythm, control heights, typography, surface, border, and action alignment remain legible without clipping.
- Allocation values intentionally differ from the illustrative Figma values: the implementation displays the approved share of total planned spending (43%, 29%, 29% for the fixture's $750/$500/$500 values).
- The discreet row action menu is an intentional addition required by the approved edit/delete behaviour.

**Interaction and recovery evidence**

- The clean local browser tab reports no console errors. In the unapplied-migration state, Expenses renders `Not set`, the Budget section explains that categories are unavailable, and mutations are disabled without affecting the rest of Income.
- Creation, inline update, confirmed deletion, duplicate-name validation, period annualisation, zero totals, search matching, and persistence failure recovery are covered by the automated suite.
- Applying the new private Supabase migration and exercising an authenticated save remain separate from this local implementation review.

**Findings**

- [P2 resolved] The first responsive pass exposed that the card's declared 596px width excluded its padding. Adding border-box sizing now makes 596px the true outer width and prevents mobile overflow.
- No actionable P0, P1, or P2 visual differences remain.
- P3: the existing truthful planning subtitle remains above Summary although the supplied frame omits it; removing it would weaken the established expected-versus-received income boundary.

**Implementation checklist**

- Apply `20260904_budget_categories.sql` before authenticated category mutations are expected to work.
- Recheck one signed-in create, edit, delete, Year/Month total, and search flow after the migration is applied.
- Keep transaction tracking, actual-spend progress, and bank activity outside this spending-plan surface.

final result: passed

---

## Refined Home overview — 2026-09-03

**Comparison target**

- Source visual truth: `/Users/jaylamanca/Desktop/Mercury/Home - Macbook 14_.png` and Figma `CSCV8qZu9ryspC07K36vTg`, node `82:1863`.
- Populated visual comparison: a temporary local QA fixture at `http://127.0.0.1:4199/home-qa.html` in the Codex in-app Browser (removed after the inline comparison capture).
- Production-state check: `http://127.0.0.1:4199/` in the truthful unconfigured state.
- Desktop viewport: 1512 × 981 CSS pixels at device scale 1.
- Mobile viewport: 390 × 844 CSS pixels at device scale 1.
- Source raster: 3024 × 1962 pixels at device scale 2, normalised to the 1512 × 981 CSS viewport for comparison.
- State: dark theme; populated comparison uses the supplied illustrative values only to exercise the production markup and CSS, while the application continues to render persisted owner data in normal use.

**Full-view comparison evidence**

- The implementation matches the source's 148px desktop rail, 48px content inset below the 80px Navbar, 320px chart card, 24px primary rhythm, three equal supporting metrics, Top Assets hierarchy, and four equal 160px asset cards.
- The 390px pass collapses the chart header, legend, period controls, supporting metrics, and asset grid without horizontal clipping. The fixed Acadia phone navigation remains available.
- Mercury intentionally omits the source's illustrative S&P 500 curve and legend because the current data model has no date-aligned benchmark series. The portfolio line, filled area, selected-range change, and start-value reference remain source-backed.

**Focused region comparison evidence**

- The chart header and supporting metric row were inspected at 1:1 CSS scale. Value hierarchy is 32px / 20px / 16px as in Figma, the selected period retains Acadia's pill treatment, and supporting cards use the source's compact title-to-label gap.
- The Top Assets region was inspected at 1:1 CSS scale. Holding and property cards share the same title, accent value, category, and lower detail rhythm; property uses the truthful `Equity` label instead of the screenshot's placeholder share count.

**Comparison history**

- [P2 resolved] The first implementation pass let the metric-card content gap expand the cards to 139px. The supporting-card content gap was reduced to 4px, producing the source-aligned 119px rendered row.
- [P2 resolved] The initial movement rates inherited red/green semantic colours and 24px metric values. The refined pass maps the overview's rates to the Figma Tiffany accent and uses 20px metric values without changing the underlying calculations.
- [P2 resolved] The first mobile pass was checked for chart-control and card overflow. Responsive stacking now preserves readable controls and full-width cards at 390px.

**Required fidelity surfaces**

- Fonts and typography: local Syncopate and Geist assets render the existing Mercury wordmark and Acadia hierarchy; sizes, weights, wrapping, and compact labels match the Figma roles.
- Spacing and layout rhythm: desktop rails, 32px card padding, 24px gaps, card heights, grid tracks, radii, and responsive collapse were measured against the source.
- Colors and visual tokens: surfaces, borders, shadows, page gradient, text hierarchy, and Tiffany data accents use Acadia tokens; no new Mercury colour system was introduced.
- Image quality and asset fidelity: the existing vector Mercury mark and Font Awesome glyphs are retained. The chart remains a live data visualisation rather than a static Figma export.
- Copy and content: Portfolio change, Expected annual growth, Passive income, Top Assets, period labels, property equity, and Add asset match the refined hierarchy while preserving truthful data semantics.

**Interaction evidence**

- Period controls retain their selected, disabled-without-history, and keyboard-operable button states. Home holding cards still navigate to Asset Details; property cards open the existing editor; Add asset retains the existing quick-add flow.
- The production empty state correctly disables unavailable actions and does not invent portfolio history or holdings.
- The in-app Browser reported no console warnings or errors in the populated visual comparison.

**Findings**

- No actionable P0, P1, or P2 differences remain.
- P3: a genuine S&P 500 comparison can be added later once Mercury has a date-aligned benchmark contract; displaying it now would misrepresent illustrative Figma data as live financial history.

**Implementation checklist**

- Keep portfolio history and selected-range change sourced from persisted daily snapshots.
- Keep Portfolio as the full search, sort, filter, and detailed-metric workspace.
- Recheck the populated authenticated Home after deployment because deployment and local design acceptance are separate claims.

final result: passed

---

## Home net-worth headline — 2026-09-03

**Comparison target**

- Source visual truth: `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_q4pkJb/Screenshot 2026-09-03 at 9.59.42 PM.png`.
- Browser-rendered implementation: `http://127.0.0.1:4199/` in the Codex in-app Browser; the capture was reviewed inline because the browser surface did not expose a filesystem screenshot path.
- Desktop viewport: 1512 × 949 CSS pixels at device scale 1, matching the 3024 × 1898 source raster at 2× density.
- Mobile viewport: 390 × 844 CSS pixels at device scale 1.
- State: dark theme. The source is an authenticated populated state; the local route is truthfully unconfigured and therefore exercises the required `Not set` net-worth recovery state.

**Full-view comparison evidence**

- No layout rules changed. The headline remains in the same 32px Acadia display role, and both `Not set` and compact currency values fit the existing desktop and mobile header composition without clipping or displacement.
- The Portfolio legend, period controls, history region, supporting metric cards, Top Assets hierarchy, and responsive stacking remain visually unchanged.

**Focused region comparison evidence**

- The top-left chart header was inspected against the source at the same normalised desktop width. The implementation now exposes `Net worth` to assistive technology while retaining the source's compact visible number-only treatment.
- The populated calculation is covered separately from the unconfigured browser state: every holding contributes to portfolio value regardless of retirement or crypto classification, and property equity is then added to the headline total.

**Required fidelity surfaces**

- Fonts and typography: unchanged Acadia/Geist roles, weights, line heights, and compact currency formatting.
- Spacing and layout rhythm: unchanged chart dimensions, 32px card padding, header alignment, period-control spacing, and responsive collapse.
- Colors and visual tokens: unchanged Acadia surfaces, border, text, and Tiffany chart tokens.
- Image quality and asset fidelity: the existing vector Mercury mark and Font Awesome glyphs remain unchanged; no new visual assets were introduced.
- Copy and content: the headline now means net worth, while visible `Portfolio` labelling continues to identify the historical line and adjacent movement.

**Interaction evidence**

- Desktop and mobile period controls retain their selected and disabled-without-history states.
- The local unavailable-property state renders `Not set`, preventing an incomplete holdings-only total from being mislabelled as net worth.
- The in-app Browser reported no console warnings or errors.

**Findings**

- No actionable P0, P1, or P2 visual differences were introduced.
- Authenticated populated persistence was not re-exercised locally; calculation, classification inclusion, property aggregation, unavailable recovery, and rendering contracts are covered by the automated suite.

**Implementation checklist**

- Keep the headline current-only until property-inclusive historical snapshots exist.
- Keep the chart line and selected-period movement portfolio-only.
- Recheck the authenticated populated headline after deployment; deployment remains a separate claim.

final result: passed
