# Research Report: Mercury Product UX Review

Run date: 2026-07-01
Automation: Research
Product: Mercury

## Summary

Mercury's unavailable-data experience is meaningfully clearer than the previous research run. The dashboard now explains that it cannot produce a source-backed read, avoids turning missing values into economic interpretation, disables unavailable period/region/sort controls, and gives users direct recovery paths to retry refresh or inspect Data Coverage.

The remaining product risks are narrower but still important. The Indicators page has a desktop layout failure that makes the Economic Health unavailable card collapse into an unreadable strip. Data Coverage visually settles but still exposes one completed provider list as busy to assistive technology. On mobile, unavailable region shortcuts crowd the first dashboard card before the user reaches the main message. Detail pages also repeat unavailable cards after the outage is already explained, which adds scanning work without adding much trust.

This run audited the local static product at `http://127.0.0.1:8765/`, where `/api/live-snapshot` is unavailable by design. Vercel CLI was not available locally, so production live-data behavior was not verified.

## Evidence Captured

Screenshots were captured in `automation/research/screenshots/`.

- `01-dashboard-desktop.png`: Dashboard, desktop, unavailable state.
- `02-markets-desktop.png`: Markets page, desktop, unavailable state.
- `03-supports-desktop.png`: Market Supports page, desktop, unavailable state.
- `04-indicators-desktop.png`: Indicators page, desktop, top of unavailable state.
- `05-data-desktop.png`: Data Coverage page, desktop, top of unavailable state.
- `06-dashboard-refresh-after.png`: Dashboard after using refresh.
- `07-dashboard-dark-mode.png`: Dashboard in dark mode.
- `08-dashboard-mobile-top.png`: Dashboard, mobile top viewport.
- `09-dashboard-mobile-bottom.png`: Dashboard, mobile lower viewport.
- `10-data-mobile-top.png`: Data Coverage, mobile top viewport.
- `11-indicators-desktop-lower.png`: Indicators lower desktop layout issue.
- `12-dashboard-mobile-focus.png`: Mobile keyboard-focus verification attempt.
- `13-data-coverage-lower.png`: Data Coverage lower provider/source summary.

## Primary User Flows Reviewed

1. Open the dashboard and understand the global read.
   - Health: Mostly clear. The source-backed unavailable state is direct and trustworthy, though lower dashboard sections still repeat low-value unavailable cards.

2. Use dashboard recovery actions.
   - Health: Mixed. Retry refresh is discoverable, but after retry the visible state does not clearly confirm that a new attempt completed.

3. Move from Dashboard to Markets.
   - Health: Clear. The page keeps controls disabled and explains that live data is required before comparing regions.

4. Move from Dashboard to Market Supports.
   - Health: Mostly clear. The page no longer interprets missing support data, but the page name still asks users to understand an abstract category.

5. Move from Dashboard to Indicators.
   - Health: Needs attention. The page copy is appropriately cautious, but the lower Economic Health card collapses at desktop width and becomes difficult to read.

6. Review Data Coverage.
   - Health: Strong but incomplete. The page clearly explains that all live groups are unavailable, but provider inventory and current source health are close enough visually to be confused.

7. Use Mercury on mobile.
   - Health: Mixed. The mobile dock has visible labels and no whole-page horizontal overflow was observed, but the region shortcut rail starts the card with disabled unavailable buttons and extends past the viewport.

8. Switch theme.
   - Health: Good. Dark mode remains coherent and preserves the unavailable-state hierarchy.

9. Verify keyboard and focus behavior.
   - Health: Not fully verified. Browser keypress attempts did not advance focus, so this run cannot confirm keyboard order or focus visibility.

## Recommendations

### 1. Make the Indicators lower layout readable at desktop widths

- User problem: On the Indicators page, the Economic Health unavailable card collapses into a narrow vertical strip on desktop, forcing text into hard-to-read fragments and making the section feel broken.
- Expected user benefit: Users can understand both Risk & Confidence and Economic Health unavailable states without layout distortion or extra effort.
- Priority: P1
- Estimated implementation complexity: Medium
- Evidence: `11-indicators-desktop-lower.png`, `04-indicators-desktop.png`

### 2. Finish the Data Coverage settled state for assistive technology

- User problem: Data Coverage visually shows a completed provider list, but the `Sources by signal` list still reports as busy after the fallback state has settled.
- Expected user benefit: Screen-reader and other assistive-technology users get the same completed-state message that sighted users see.
- Priority: P1
- Estimated implementation complexity: Low
- Evidence: `05-data-desktop.png`, `13-data-coverage-lower.png`

### 3. Separate current source health from provider inventory on Data Coverage

- User problem: The page says live data is unavailable while also showing provider names such as Yahoo Finance, FRED, and World Bank in a coverage summary. Users may not know whether those sources are currently down, merely configured, or still trustworthy as provider references.
- Expected user benefit: Users can distinguish "Mercury knows which providers it uses" from "Mercury currently received usable values from those providers."
- Priority: P2
- Estimated implementation complexity: Low
- Evidence: `10-data-mobile-top.png`, `13-data-coverage-lower.png`

### 4. Confirm refresh attempts with a clearer visible result

- User problem: Retry refresh is easy to find, but after the user taps it during an outage, the visible page returns to the same unavailable state without a clear sense of whether a new check happened.
- Expected user benefit: Users understand that Mercury tried again and whether the result changed, which reduces repeated clicking and uncertainty.
- Priority: P2
- Estimated implementation complexity: Low
- Evidence: `06-dashboard-refresh-after.png`

### 5. Reduce mobile friction from disabled region shortcuts

- User problem: On mobile, the dashboard card opens with disabled region shortcut buttons before the main unavailable message. The row extends past the viewport, and the Europe/Asia options are partially or fully offscreen.
- Expected user benefit: Mobile users reach the source-backed status faster and do not start with unusable controls when no regional comparison is available.
- Priority: P2
- Estimated implementation complexity: Medium
- Evidence: `08-dashboard-mobile-top.png`

### 6. Reduce repeated unavailable cards after the outage is already explained

- User problem: Dashboard and detail pages explain the unavailable state at the top, then repeat additional unavailable cards in several sections. The repetition increases scan time without providing much new confidence.
- Expected user benefit: Users get a calmer outage experience that emphasizes what is known, what is unavailable, and where to check next.
- Priority: P2
- Estimated implementation complexity: Medium
- Evidence: `01-dashboard-desktop.png`, `02-markets-desktop.png`, `03-supports-desktop.png`, `09-dashboard-mobile-bottom.png`

### 7. Clarify the meaning of Market Supports for first-time users

- User problem: "Market Supports" is accurate but abstract. Users who are not finance-native may not immediately know it means currencies, commodities, and digital assets that shape the global read.
- Expected user benefit: Users can predict the destination before navigating and understand why those signals are separate from regional markets.
- Priority: P3
- Estimated implementation complexity: Low
- Evidence: `03-supports-desktop.png`, `08-dashboard-mobile-top.png`

### 8. Add a live-data audit pass before treating the dashboard experience as complete

- User problem: This run could only verify the designed unavailable state. The main product promise depends on how quickly users understand a live global read when source values are available.
- Expected user benefit: The Review automation can distinguish fallback quality from the normal live-data first scan and avoid optimizing only the outage path.
- Priority: P2
- Estimated implementation complexity: Medium
- Evidence: Local Vercel CLI was unavailable; static run showed `/api/live-snapshot` unavailable.

### 9. Verify keyboard focus order in a browser environment that can advance focus

- User problem: This run could not confirm keyboard traversal because Browser keypress attempts left focus on the document body. The DOM includes duplicate desktop and mobile navigation structures, disabled mobile region buttons, and bottom dock links, so actual focus order should be explicitly verified.
- Expected user benefit: Keyboard users can move through the dashboard, recovery actions, page navigation, and disabled states predictably.
- Priority: P2
- Estimated implementation complexity: Low
- Evidence: `12-dashboard-mobile-focus.png`

## Accessibility Risks And Verification Gaps

- Confirmed issue: Data Coverage leaves `coverage-summary-list` marked busy after fallback content is visible.
- Confirmed issue: Indicators desktop layout creates a narrow unreadable Economic Health card, which is both a usability and responsive-layout accessibility risk.
- Likely issue: Mobile disabled region shortcuts compete with the main unavailable message and may create unnecessary focus or reading-order noise.
- Not confirmed: Full keyboard order and visible focus traversal. Browser keypress attempts did not move focus, so this run cannot claim a pass or failure.
- Not checked: Full WCAG compliance, calculated color contrast, production live-data states, or external source reliability.
- Validation note: `npm test` passed 63 tests during this run.

## Recommendation For Review Automation

Start with the P1 items: Indicators lower-page layout and Data Coverage settled-state semantics. Then review the outage experience for mobile scan order and repeated unavailable content before adding any new surface area.
