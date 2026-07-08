# Review Report: Mercury Product Recommendations

Run date: 2026-07-07
Automation: 02 Review
Input: `automation/research/latest.md`
Product: Mercury
Current run time: 2026-07-07 11:02 EDT

## Review Lens

Mercury's core job is to help users understand current global economic conditions in less than 60 seconds through clear, neutral, source-backed public data. Recommendations were approved only when they improve first-scan comprehension, source trust, recovery clarity, mobile readability, accessibility verification, or maintainability inside the current MVP.

The July 7 research was limited to the local static unavailable-source path at `http://127.0.0.1:8791/` because `/api/live-snapshot` was not executable there. That evidence is valid for unavailable-state UX, but it cannot prove the normal live-data journey.

## Executive Decision

Approve the July 7 research direction with tight scope controls.

The latest run confirms Mercury is now source-honest and preserves page identity during complete live-data outages. The remaining work is not a product expansion; it is residual UX cleanup around priority, density, and verification. The first screen still gives too much visual weight to unavailable controls, Markets still feels sparse in a complete outage, dashboard outage messaging remains heavier than needed, and mobile persistent chrome can cover reading content.

Highest-leverage approved outcome:

Mercury should make unavailable data states recovery-first, compact, and readable across Dashboard, Markets, Market Supports, Indicators, and Data Coverage while preserving the existing live-data product model. Users should immediately understand that a source-backed read is unavailable, what they can do next, and where source health can be inspected, without new workflows, speculative content, or extra product scope.

## Priority For Design Automation

1. Verify a live or recorded-live success path before calling Mercury's primary 60-second journey complete.
2. Make unavailable first screens recovery-first before disabled controls.
3. Fix mobile sticky-header and bottom-dock clearance, especially on long Data Coverage content.
4. Repair the complete-outage Markets layout without adding new market features.
5. Reduce repeated dashboard outage copy and clarify disabled controls.
6. Tighten mobile route-page hierarchy and Data Coverage mobile scanning.
7. Clean up remaining unavailable vocabulary inconsistencies and retry feedback.
8. Complete keyboard and assistive-technology verification as a validation gate.

## Approved Work Packages

### A. Verify The Live-Data Success Path

Approved recommendation: 1.
Decision: Approved as validation only.

Rationale:
Mercury's mission is a current, source-backed global economy read, not merely a responsible outage state. The local static audit could not exercise `/api/live-snapshot`, so Design should not declare the primary journey complete until a live or recorded-live dashboard proves that the normal first scan works. This does not justify new providers, integrations, or reliability claims.

Acceptance criteria:

- Verify at least one live or recorded-live dashboard state before closing the design pass.
- Confirm the first scan answers what is up, what is down, where risk is increasing, where confidence is improving, and how fresh the read is.
- Confirm live and partial states still render metric groups, controls, source status, freshness, page identity, and navigation after unavailable-state layout changes.
- Use current public-source routes, existing fixtures, or recorded-live data; do not add providers or source categories.
- Create implementation work only for defects observed during verification.
- Do not add forecasts, alerts, accounts, personalization, data integrations, production uptime claims, or new chart/report workflows.

### B. Make Unavailable First Screens Recovery-First

Approved recommendation: 2.
Decision: Approved with constraints.

Rationale:
When no live data is available, the first screen should help users recover or inspect source health. The latest screenshots still show disabled Period, Region, and Period-only controls receiving prime placement before the user reaches the clearest actions. Reordering and de-emphasizing inactive controls improves clarity and source trust without expanding scope.

Acceptance criteria:

- On Dashboard, Markets, Market Supports, and Indicators, complete-outage first screens place the unavailable explanation, checked state, retry action, and Data Coverage route before disabled controls whenever space is constrained.
- Disabled controls may be moved below status/action content, visually de-emphasized, or hidden when they cannot affect unavailable content.
- Mobile users must not need to parse disabled controls before finding the primary recovery action.
- Live and partial states keep Period, Region, and Sort controls available when they change source-backed content.
- Disabled controls retain native `disabled`, `aria-disabled`, labels, and accessible names when shown.
- Do not add toasts, modals, onboarding, retry histories, countdowns, alerts, or a separate recovery workflow.

### C. Prevent Mobile Sticky Chrome From Covering Content

Approved recommendation: 3.
Decision: Approved.

Rationale:
Mobile reading is part of the MVP, and the July 7 Data Coverage and dashboard screenshots show sticky chrome competing with lower content. This is a direct readability and accessibility issue, especially for source-health and provider-inventory rows.

Acceptance criteria:

- At 375px-wide mobile viewports, the sticky header does not overlap meaningful content during normal scroll.
- The bottom dock does not cover recovery actions, status text, source-health rows, provider inventory, or final meaningful page content.
- Page bottom padding, safe-area spacing, scroll padding, and focus scroll behavior account for the floating dock and sticky header.
- Verify Dashboard, Data Coverage, Markets, Market Supports, and Indicators in complete unavailable states.
- Preserve the compact five-destination mobile dock, current destination set, active state, and accessible navigation names.
- Do not redesign mobile navigation or add persistent text labels as a standalone fix.

### D. Make Markets Useful During A Complete Outage

Approved recommendation: 4.
Decision: Approved with constraints.

Rationale:
Markets is an in-scope detail page. The page keeps its identity, but the latest desktop and mobile outage screenshots still leave the main work area feeling sparse and unfinished. The fix should use existing source/status/recovery patterns, not new market analysis content.

Acceptance criteria:

- In a complete outage, Markets communicates the unavailable market read in one coherent first pass tied to existing market source context.
- The recovery card or status area uses available width appropriately on desktop and mobile rather than appearing as a stranded small card.
- Disabled sorting is hidden, moved, or visibly secondary when sorting cannot affect unavailable content.
- Existing page identity, retry action, checked state, and Data Coverage path remain available.
- Live and partial states continue to show source-backed market drivers, economy cards, region controls, and sort behavior.
- Do not add market categories, charts, filters, search, reports, educational market content, provider integrations, or investment-advice language.

### E. Reduce Repeated Dashboard Outage Messaging

Approved recommendation: 5.
Decision: Approved with constraints.

Rationale:
Mercury should be explicit when source-backed values are unavailable, but repeating the same outage idea across hero, Key Signals, summaries, pressure panels, and Source Health slows the 60-second scan. Consolidation supports clarity and maintainability while preserving source honesty.

Acceptance criteria:

- After one page-level unavailable explanation, repeat outage messages only when they add distinct source, freshness, provider, scope, or recovery information.
- Avoid long runs of cards whose only new information is that values are unavailable.
- Keep source attribution, checked time, retry action, and Data Coverage navigation visible.
- Lower dashboard panels should either provide distinct status context or be suppressed/reworded in complete outages.
- Live and partial states must still render relevant metric groups, cards, controls, summaries, and links.
- Do not substitute sample values, vague reassurance, or unsupported economic interpretation for unavailable data.

### F. Clarify Disabled Controls Across Unavailable States

Approved recommendation: 6.
Decision: Approved with constraints.

Rationale:
Disabled Period, Region, Sort, and Period-only controls remain visually prominent in the latest unavailable-state screenshots. That creates false affordances and conflicts with Mercury's design guidance to avoid inactive controls that imply unavailable workflows.

Acceptance criteria:

- Disabled controls look unmistakably inactive while preserving readable labels and sufficient contrast.
- Explanatory text appears near disabled controls when they remain visible.
- Controls that add no value during a complete outage may be hidden or moved below source-state explanation.
- Native disabled semantics and accessible names are preserved.
- Live and partial states keep controls available when they change source-backed content.
- Do not introduce new filters, sorting modes, workflows, control types, or settings.

### G. Shorten The Mobile Path To Page-Specific Explanations

Approved recommendation: 7.
Decision: Approved with constraints.

Rationale:
Mobile detail pages should answer one economy question quickly. The latest route-page screenshots show long unavailable summaries, timestamps, refresh icons, and disabled controls before the user reaches the page-specific explanation. Tightening this hierarchy improves scan speed without adding content.

Acceptance criteria:

- On Markets, Market Supports, and Indicators mobile views, the first viewport surfaces the page identity, source state, checked/retry path, Data Coverage path, and the page-specific unavailable explanation with minimal duplication.
- Timestamp, refresh, and disabled control blocks are compact enough not to crowd out the main explanation.
- Page-specific cards should not be hidden behind long generic outage copy unless they add no distinct value in the complete outage.
- Keep copy neutral, source-backed, and non-advisory.
- Preserve the existing page model and navigation.
- Do not add new drill-downs, mobile menus, onboarding, explanations, educational sections, charts, or filters.

### H. Make Data Coverage Easier To Scan On Mobile

Approved recommendation: 8.
Decision: Approved with constraints.

Rationale:
Data Coverage is the strongest trust surface, but the mobile page becomes a long stack of source-health and provider rows, with the dock covering the lower reading area. Improving hierarchy and spacing helps users understand source health without changing the source model.

Acceptance criteria:

- Mobile Data Coverage clearly separates current source health from configured provider inventory.
- The source-health summary appears before provider inventory and remains readable without dock overlap.
- Provider inventory rows are compact and scannable using existing Mercury/Acadia row or card patterns.
- The final meaningful Data Coverage content clears the bottom dock at 375px-wide viewports.
- Desktop Data Coverage hierarchy remains intact.
- Do not add new providers, source categories, health calculations, accordions that hide required trust information by default, or explanatory methodology content.

### I. Unify Unavailable-State Vocabulary

Approved recommendation: 9.
Decision: Approved as narrow cleanup.

Rationale:
The product already has the right vocabulary direction, but the July 7 screenshots still show drift such as `Support Unavailable` beside `Live data unavailable`, `Unavailable`, and provider `not responding` rows. A small cleanup strengthens the user's source-state mental model.

Acceptance criteria:

- Page-level complete outages use `Live data unavailable`.
- Compact badges use `Unavailable`.
- Provider/source-health rows may use `not responding` only for concrete source-attempt context.
- Remove divergent labels such as `Support Unavailable` when they describe the same complete-outage state.
- Ensure Dashboard, Markets, Market Supports, Indicators, and Data Coverage follow the same vocabulary map.
- Update `DESIGN-README.md` only if the current documented rule needs refinement; do not create a broader content system.

### J. Make Refresh Retry Feedback More Conclusive

Approved recommendation: 10.
Decision: Approved with constraints.

Rationale:
The existing `Checked again ... unavailable` pattern is directionally correct but too subtle in the latest retry screenshot. A slightly more conclusive confirmation inside existing status surfaces can reduce repeat clicking without creating a notification system.

Acceptance criteria:

- A retry visibly confirms that Mercury attempted a fresh check and whether the result is still unavailable, partial, or live.
- Confirmation may appear in the checked-state pill, refresh button state, source-health copy, dashboard status text, or Data Coverage timestamp.
- The retry button remains accessible by name and usable in unavailable states.
- Do not imply that a source responded when it did not.
- Do not add toasts, dialogs, banners, retry histories, countdowns, notifications, or separate recovery flows.

### K. Complete Keyboard And Assistive-Technology Verification

Approved recommendation: 11.
Decision: Approved as validation only.

Rationale:
The research environment could not confirm practical Tab order, focus visibility, or screen-reader announcements. Mercury has duplicate desktop/mobile navigation, dynamic regions, disabled controls, refresh actions, recovery links, and sticky mobile chrome, so verification is necessary before closing the design pass. This is not approval for speculative accessibility features.

Acceptance criteria:

- Verify Tab and Shift+Tab in an environment where keyboard focus actually advances.
- Confirm visible focus and logical order across skip link, header navigation, theme toggle, mobile dock links, refresh, Period/Region/Sort controls, disabled controls, recovery actions, and Data Coverage links.
- Confirm skip-link and focused-element scrolling do not hide targets under the sticky header or bottom dock.
- Confirm dynamic source-health and dashboard regions clear `aria-busy` after live, partial, and fallback renders.
- Confirm important status changes are announced through existing live regions or equivalent semantics.
- Create implementation work only for confirmed defects. Do not add keyboard shortcuts, new navigation modes, speculative ARIA, or screen-reader-only content that duplicates visible content.

## Recommendation Decisions

| # | Research recommendation | Decision | Rationale | Acceptance criteria |
| ---: | --- | --- | --- | --- |
| 1 | Verify the live-data success path before treating the primary journey as complete | Approved as validation only | Required to prove Mercury's normal source-backed 60-second promise; not a feature request. | Work Package A |
| 2 | Make the unavailable first screen recovery-first | Approved with constraints | Improves recovery clarity and reduces disabled-control competition in the core outage path. | Work Package B |
| 3 | Prevent mobile sticky chrome from covering reading content | Approved | Confirmed mobile readability/accessibility defect. | Work Package C |
| 4 | Make Markets useful during a complete outage | Approved with constraints | Markets is in scope, but the fix must use existing source/status content only. | Work Package D |
| 5 | Reduce repeated outage messaging on the dashboard | Approved with constraints | Speeds scanning and reduces copy maintenance without hiding source honesty. | Work Package E |
| 6 | Clarify disabled controls across unavailable states | Approved with constraints | Reduces false affordances while preserving live/partial controls. | Work Package F |
| 7 | Shorten the mobile path to each page's main explanation | Approved with constraints | Improves mobile scan speed inside existing route pages. | Work Package G |
| 8 | Make Data Coverage easier to scan on mobile | Approved with constraints | Strengthens the trust surface without changing the source model. | Work Package H |
| 9 | Unify unavailable-state vocabulary | Approved as narrow cleanup | Removes remaining label drift and reinforces a single source-state model. | Work Package I |
| 10 | Make refresh retry feedback more conclusive | Approved with constraints | Useful trust polish inside existing status surfaces only. | Work Package J |
| 11 | Complete keyboard and assistive-technology verification | Approved as validation only | Required completion gate; implementation work only for observed defects. | Work Package K |

## Explicitly Rejected Scope Expansion

The next Design automation should not use these recommendations to add:

- New data providers, source categories, integrations, production reliability claims, or provider-status models.
- Forecasts, alerts, briefings beyond the current dashboard model, personalization, watchlists, accounts, saved views, portfolio concepts, or trading workflows.
- Buy/sell/hold language, timing advice, valuation calls, investment recommendations, or urgency cues.
- Long educational content about markets, assets, source methodology, providers, or economic theory.
- New charting, filtering, sorting, search, drill-down, reports, analytics workflows, or detail pages to compensate for unavailable data.
- Modals, onboarding, toast systems, retry histories, countdowns, notifications, or multi-step source recovery.
- A mobile navigation redesign, persistent dock text-label expansion, drawer navigation, or extra nav destinations.
- A wholesale visual redesign unrelated to unavailable-state priority, mobile clearance, scan density, vocabulary consistency, and validation.

## Design Automation Input

Design should focus on one question:

Can Mercury make its existing dashboard and focused pages feel compact, recognizable, source-honest, and action-oriented when live data is unavailable, while also verifying that the live-data path still delivers a trustworthy 60-second global-economy read?

Start with the validation gates and P1 residuals: live/recorded-live success verification, recovery-first unavailable screens, and mobile chrome clearance. Then address Markets outage layout, repeated dashboard copy, disabled-control clarity, mobile route hierarchy, Data Coverage mobile scanning, vocabulary cleanup, and retry feedback using existing Mercury/Acadia patterns.
