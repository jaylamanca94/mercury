# Research Report: Mercury Product UX Review

Run date: 2026-07-07
Automation: Research
Product: Mercury

## Summary

Mercury is becoming a more trustworthy degraded-state product. In the current run, Dashboard, Markets, Market Supports, Indicators, and Data Coverage all keep their page identities when live data is unavailable. Market Supports is notably stronger than the prior Mercury review: its desktop outage state now uses the full page width and gives the user a clear current-conditions explanation instead of a narrow, awkward card. Data Coverage remains the strongest trust surface, with a clear separation between current source health and configured provider inventory.

The main user problem is that Mercury still cannot be judged against its core promise in this local review: a fast, source-backed answer to what is happening in the global economy right now. The observed product path is the complete live-data unavailable path. Within that path, the experience is honest but still heavy. Disabled controls, repeated outage copy, and persistent mobile chrome compete with the recovery path and the actual explanation.

This run audited the local static product at `http://127.0.0.1:8791/`. The static server cannot execute `/api/live-snapshot`, so evidence focuses on the unavailable-source journey. Production live-data success states, calculated contrast, screen-reader output, and a reliable browser-level Tab order still need separate verification.

## Evidence Captured

Screenshots were captured in `automation/research/screenshots/2026-07-07/`.

- `01-dashboard-desktop-top.png`: Dashboard, desktop, unavailable state.
- `02-dashboard-desktop-lower.png`: Dashboard lower desktop state.
- `03-dashboard-refresh-after.png`: Dashboard after refresh retry.
- `04-markets-desktop.png`: Markets page, desktop, unavailable state.
- `05-supports-desktop.png`: Market Supports page, desktop, unavailable state.
- `06-indicators-desktop.png`: Indicators page, desktop, unavailable state.
- `07-data-coverage-desktop.png`: Data Coverage page, desktop, unavailable state.
- `08-data-coverage-dark-mode.png`: Data Coverage in dark mode.
- `09-dashboard-keyboard-focus.png`: Dashboard after keyboard traversal attempt.
- `10-dashboard-mobile-top.png`: Dashboard mobile top viewport after theme switch.
- `11-dashboard-mobile-lower.png`: Dashboard mobile lower viewport after theme switch.
- `12-markets-mobile-top.png`: Markets mobile top viewport after theme switch.
- `13-supports-mobile-top.png`: Market Supports mobile top viewport after theme switch.
- `14-indicators-mobile-top.png`: Indicators mobile top viewport after theme switch.
- `15-data-coverage-mobile-top.png`: Data Coverage mobile top viewport after theme switch.
- `16-data-coverage-mobile-lower.png`: Data Coverage mobile lower viewport after theme switch.

## Primary User Flows Reviewed

1. Open the dashboard and understand the current global read.
   - Health: Mixed. The unavailable state is clear and honest, but the first screen still gives a large visual role to disabled Period and Region controls.

2. Recover from unavailable live data.
   - Health: Mostly clear. Retry and Data Coverage are present, but the strongest recovery buttons sit below the first dashboard card and the retry outcome is subtle.

3. Move from Dashboard to Markets.
   - Health: Needs attention. Page identity is preserved, but the outage-state page has a small driver card and substantial unused space, so it feels unfinished.

4. Move from Dashboard to Market Supports.
   - Health: Improved. Desktop and mobile now use the available width better, though the page still spends much of the first mobile viewport on unavailable controls.

5. Move from Dashboard to Indicators.
   - Health: Good. The page explains the missing economic releases and keeps the deeper read structured.

6. Review Data Coverage.
   - Health: Strong on desktop, mixed on mobile. The source-health model is understandable, but the long mobile page is crowded by persistent navigation.

7. Use Mercury on mobile.
   - Health: Mixed. Core content fits the viewport, but the sticky header and bottom dock can cover lower reading content on long pages.

8. Switch theme.
   - Health: Good. Dark mode preserved hierarchy and status readability in the reviewed states.

9. Verify keyboard and focus behavior.
   - Health: Not verified. Repeated Tab attempts left focus on the document body in this browser environment, so practical focus order and visibility remain an open risk.

## Recommendations

### 1. Verify the live-data success path before treating the primary journey as complete

- User problem: Mercury's core promise is a source-backed read of the global economy, but this audit could only observe complete live-data unavailability.
- Expected user benefit: Users get confidence that Mercury works as a 60-second current-economy read in the normal state, not only that it fails responsibly.
- Priority: P1
- Estimated implementation complexity: Medium
- Evidence: Local static run at `http://127.0.0.1:8791/` showed unavailable public-data states because `/api/live-snapshot` was not executable in the static server.

### 2. Make the unavailable first screen recovery-first

- User problem: The dashboard and detail-page first screens visually prioritize disabled Period, Region, or Period-only controls before the user reaches the clearest recovery actions.
- Expected user benefit: Users can immediately retry, open Data Coverage, or understand what is unavailable without first parsing controls that cannot change the current state.
- Priority: P1
- Estimated implementation complexity: Medium
- Evidence: `01-dashboard-desktop-top.png`, `04-markets-desktop.png`, `12-markets-mobile-top.png`, `13-supports-mobile-top.png`, `14-indicators-mobile-top.png`

### 3. Prevent mobile sticky chrome from covering reading content

- User problem: On mobile, the sticky header can overlap content during scroll and the bottom dock covers lower page content, especially in Data Coverage.
- Expected user benefit: Mobile users can read source-health rows and provider inventory without content being hidden behind persistent navigation.
- Priority: P1
- Estimated implementation complexity: Low
- Evidence: `11-dashboard-mobile-lower.png`, `16-data-coverage-mobile-lower.png`

### 4. Make Markets useful during a complete outage

- User problem: The Markets page keeps its title, but the outage state still leaves a large empty work area and only one small driver card.
- Expected user benefit: Users understand what market comparison is unavailable and what remains trustworthy without the page feeling like it failed to load.
- Priority: P2
- Estimated implementation complexity: Medium
- Evidence: `04-markets-desktop.png`, `12-markets-mobile-top.png`

### 5. Reduce repeated outage messaging on the dashboard

- User problem: The dashboard repeats the same unavailable idea across the hero, Key Signals, Executive Summary, This Week, Current Pressures, and Source Health areas.
- Expected user benefit: Users can scan faster and distinguish the main outage explanation from truly different status details.
- Priority: P2
- Estimated implementation complexity: Medium
- Evidence: `01-dashboard-desktop-top.png`, `02-dashboard-desktop-lower.png`, `11-dashboard-mobile-lower.png`

### 6. Clarify disabled controls across unavailable states

- User problem: Disabled Period, Region, Sort, and Period-only controls still look structurally important even though they cannot affect the current state.
- Expected user benefit: Users avoid trying unavailable filters and understand that these controls are temporarily inactive, not broken.
- Priority: P2
- Estimated implementation complexity: Low
- Evidence: `01-dashboard-desktop-top.png`, `04-markets-desktop.png`, `05-supports-desktop.png`, `06-indicators-desktop.png`, `12-markets-mobile-top.png`

### 7. Shorten the mobile path to each page's main explanation

- User problem: On mobile route pages, the first viewport often combines a long unavailable summary, timestamp, refresh icon, and disabled control block before the user reaches the page-specific explanation.
- Expected user benefit: Mobile users get to the useful answer faster on Markets, Market Supports, and Indicators.
- Priority: P2
- Estimated implementation complexity: Medium
- Evidence: `12-markets-mobile-top.png`, `13-supports-mobile-top.png`, `14-indicators-mobile-top.png`

### 8. Make Data Coverage easier to scan on mobile

- User problem: Data Coverage has the right information, but the mobile page becomes a long stack of source-health and provider rows, with the dock covering the bottom of the reading area.
- Expected user benefit: Users can understand source health and provider inventory on a phone without excessive vertical scanning.
- Priority: P2
- Estimated implementation complexity: Medium
- Evidence: `15-data-coverage-mobile-top.png`, `16-data-coverage-mobile-lower.png`

### 9. Unify unavailable-state vocabulary

- User problem: Similar states use several labels, including `Unavailable`, `Support Unavailable`, `Live data unavailable`, `No source-backed read`, and `not responding`.
- Expected user benefit: Users build one clear mental model for page state, source health, and provider status.
- Priority: P3
- Estimated implementation complexity: Low
- Evidence: `01-dashboard-desktop-top.png`, `05-supports-desktop.png`, `07-data-coverage-desktop.png`, `13-supports-mobile-top.png`

### 10. Make refresh retry feedback more conclusive

- User problem: After retry, the visible change is mainly `Checked again 9:04 AM: unavailable`, while the rest of the screen remains nearly identical.
- Expected user benefit: Users know the retry completed and are less likely to repeat the action out of uncertainty.
- Priority: P3
- Estimated implementation complexity: Low
- Evidence: `03-dashboard-refresh-after.png`

### 11. Complete keyboard and assistive-technology verification

- User problem: This run could not confirm Tab order, focus visibility, or screen-reader announcements because repeated Tab attempts left focus on the document body and the browser DOM snapshot API failed.
- Expected user benefit: Keyboard and assistive-technology users can navigate duplicate desktop/mobile navigation, disabled controls, refresh actions, recovery links, and persistent mobile navigation predictably.
- Priority: P2
- Estimated implementation complexity: Low
- Evidence: `09-dashboard-keyboard-focus.png`; focused keyboard pass left `document.activeElement` on `BODY` after repeated Tab attempts.

## Accessibility Risks And Verification Gaps

- Confirmed responsive risk: Mobile sticky header and bottom dock can obscure content during scroll.
- Confirmed usability risk: Disabled controls occupy prime space in unavailable states, which may confuse keyboard and screen-reader users if their state is not announced clearly.
- Likely accessibility risk: Repeated unavailable headings and labels can make the page structure noisier for assistive-technology users.
- Positive note: Page titles, active navigation, skip links, icon button labels, dark mode readability, and settled `aria-busy="false"` states were visible in the reviewed run.
- Not confirmed: Practical Tab order, focus visibility, screen-reader announcements, production live-data states, and calculated color contrast.

## Recommendation For Review Automation

Start with the P1 items: verify the live-data success path, make unavailable first screens recovery-first, and prevent mobile sticky chrome from covering content. Then address the P2 clarity and density issues across Markets, dashboard repetition, disabled controls, mobile route-page hierarchy, Data Coverage mobile scanning, and keyboard/accessibility verification.
