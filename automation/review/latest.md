# Review Report: Mercury Product Recommendations

Run date: 2026-07-01
Automation: 02 Review
Input: `automation/research/latest.md`
Product: Mercury

## Review Lens

Mercury's core job is to help users understand current global economic conditions in less than 60 seconds using source-backed, neutral, public-data reads. Recommendations were approved only when they improve trust, accessibility, scan speed, source clarity, mobile usability, or maintainability without expanding Mercury into a trading, news, advice, alerting, or analysis platform.

## Executive Decision

Approve the research direction, but keep the next Design pass tightly scoped. The remaining issues are not a reason to add product surface area. They are reasons to make the existing unavailable-data experience more readable, accessible, and calm.

Highest-leverage approved outcome:

Mercury should make unavailable source-backed data feel settled, intentional, and easy to understand across desktop, mobile, and assistive-technology paths.

## Priority For Design Automation

1. Fix confirmed P1 defects first: Indicators lower-page readability and Data Coverage settled-state semantics.
2. Separate current source health from provider inventory on Data Coverage so provider names do not imply live availability.
3. Tighten outage recovery and repeated unavailable content without hiding useful source context.
4. Improve mobile unavailable-state scan order by reducing disabled shortcut dominance.
5. Treat live-data and keyboard checks as validation gates, not new feature work.

## Approved Work Packages

### A. Fix Confirmed Readability And Accessibility Defects

Approved recommendations: 1 and 2.

Rationale:
These are direct quality defects in existing in-scope surfaces. A collapsed Indicators card blocks comprehension on a focused detail page, and a visually settled Data Coverage provider list that remains busy for assistive technology undermines Mercury's source-trust promise. Both fixes improve the current product without expanding scope.

Acceptance criteria:

- On desktop widths, including the range captured in `11-indicators-desktop-lower.png`, the Indicators lower layout keeps both `Risk & Confidence` and `Economic Health` readable.
- The Economic Health unavailable card must not collapse into a narrow strip, force one-word lines, overlap neighboring content, or require horizontal scrolling.
- The fix works for unavailable, partial, and live card content without creating page-specific brittle layout exceptions.
- The solution should prefer shared grid/card constraints already used by Mercury and Acadia-style primitives over a one-off visual workaround.
- Data Coverage dynamic regions that have finished rendering must expose completed semantics. `coverage-summary-list`, `source-health-list`, and any rendered fallback/source inventory regions must not remain `aria-busy="true"` once their visible content is settled.
- Regression coverage should assert completed busy semantics after fallback render, including the Data Coverage coverage summary.

### B. Clarify Data Coverage Source Model

Approved recommendation: 3.

Rationale:
Data Coverage is Mercury's trust surface. Users should be able to distinguish "these are the configured public providers Mercury uses" from "these providers returned usable values for the current snapshot." This supports the mission and reduces confusion without adding data providers or new workflows.

Acceptance criteria:

- Data Coverage clearly separates current source health from provider inventory using labels, layout, or concise copy.
- When all live data is unavailable, provider names such as Yahoo Finance, FRED, and World Bank remain framed as configured/source-reference coverage, not as currently healthy live feeds.
- Current status language says which signal groups are unavailable, partial, delayed, stale, or current.
- Provider inventory remains concise and source-attribution oriented. Do not add long educational explanations, provider marketing, reliability claims, or new source categories.
- The dashboard Data Coverage summary and the dedicated Data Coverage page should use consistent terms for live health, provider inventory, freshness, and last checked state.

### C. Tighten Outage Recovery And Repeated Unavailable Content

Approved recommendations: 4 and 6.

Rationale:
Retry refresh is a valid recovery action, and detail sections can preserve source context. The problem is repeated low-value unavailable cards and a retry action that appears to return to the same state without confirming anything happened. The approved work should reduce uncertainty and scan burden, not create modals, onboarding, or new workflows.

Acceptance criteria:

- After a user retries refresh during an outage, the visible page confirms that Mercury checked again and whether the result changed.
- The confirmation can live in existing status surfaces, such as the timestamp/status pill, dashboard status text, source coverage copy, or refresh button state. Avoid toasts, dialogs, or a separate recovery flow.
- Refresh remains available as a retry action in unavailable states and remains accessible by name.
- Dashboard and detail pages should avoid long runs of repeated metric cards that only say unavailable after the page has already explained the outage.
- Keep one clear page-level unavailable explanation, then show only section-level unavailable cards where they add specific source or scope context.
- Preserve useful navigation into Markets, Market Supports, Indicators, and Data Coverage. Do not remove detail pages or collapse them into a single outage page.
- Prefer shared unavailable-state rendering and copy helpers so the design stays maintainable.

### D. Improve Mobile Unavailable-State Scan Order

Approved recommendation: 5.

Rationale:
Mobile users should reach Mercury's primary answer before unusable controls. Disabled region shortcuts are valid in live states, but in a complete unavailable state they should not dominate the first card or extend past the viewport before the user sees the source-backed status.

Acceptance criteria:

- On a 375px-wide viewport, the mobile first card prioritizes the current read or the unavailable-state explanation before disabled region shortcut controls.
- Disabled region shortcuts must not create horizontal page overflow, clipped labels, or partially hidden options such as Europe or Asia.
- In complete unavailable states, consider hiding, moving, or visually de-emphasizing region shortcuts as long as the live-state region workflow remains intact.
- In live and partial-data states, region shortcuts still behave as real controls when they can update source-backed content.
- Keyboard and screen-reader semantics for disabled mobile controls remain correct.

### E. Validation Gates For The Next Design Pass

Approved as validation only: recommendations 8 and 9.

Rationale:
The research run could not verify production/live-data behavior or keyboard traversal. Those are important gaps, but they are not standalone product features. They should be required checks for the next Design pass and should produce implementation work only if they reveal a concrete defect.

Acceptance criteria:

- Verify the updated dashboard against at least one source-backed live or recorded-live state, one partial state when practical, and the complete unavailable state.
- In the live/source-backed state, confirm the first scan answers what is up, what is down, where risk is increasing, where confidence is improving, and how fresh the read is.
- Verify keyboard focus order in an environment that can advance focus with Tab and Shift+Tab.
- Confirm focus order and visible focus across desktop and mobile-width layouts, including header navigation, mobile dock links, refresh, period/region/sort controls, disabled controls, and Data Coverage links.
- If live-data or keyboard verification uncovers a product defect, document or fix the concrete defect. Do not add speculative accessibility or live-data features without evidence.

## Not Approved As Standalone Work

### Market Supports Copy Expansion

Recommendation 7 is not approved as a standalone work package.

Rationale:
The product already uses `Market Supports` in primary navigation, and the Market Supports page already explains that it covers currencies, commodities, and digital assets that shape the global read. More explanation may help slightly, but as a standalone task it risks adding copy density to solve an issue that is already mostly addressed.

Allowed scope if touched by approved work:

- Keep the existing `Market Supports` destination and route.
- If copy in the touched unavailable or navigation surfaces can become clearer with a short phrase, use wording like `currencies, commodities, and digital assets that shape the global read`.
- Do not create new support-signal categories, new pages, tooltips, onboarding, or educational blocks for this item.

## Recommendation Decisions

| # | Research recommendation | Decision | Rationale | Acceptance criteria |
| ---: | --- | --- | --- | --- |
| 1 | Make the Indicators lower layout readable at desktop widths | Approved | A broken detail-page layout blocks comprehension and makes an in-scope source-backed page feel unreliable. | Work Package A |
| 2 | Finish the Data Coverage settled state for assistive technology | Approved | Data Coverage must communicate completed source state equally to assistive-technology users. | Work Package A |
| 3 | Separate current source health from provider inventory on Data Coverage | Approved | This improves source trust and prevents provider inventory from being mistaken for live availability. | Work Package B |
| 4 | Confirm refresh attempts with a clearer visible result | Approved with constraints | Retry is useful, but the result should be confirmed through existing status surfaces, not a new recovery workflow. | Work Package C |
| 5 | Reduce mobile friction from disabled region shortcuts | Approved with constraints | Mobile scan speed is central to the less-than-60-second goal; disabled controls should not lead the unavailable state. | Work Package D |
| 6 | Reduce repeated unavailable cards after the outage is already explained | Approved with constraints | Simplifying repeated fallback cards improves clarity, but detail pages should still preserve useful source and scope context. | Work Package C |
| 7 | Clarify the meaning of Market Supports for first-time users | Not approved as standalone | The current page already explains the concept; extra standalone copy would add density for limited value. | Allowed only as small opportunistic copy inside touched surfaces |
| 8 | Add a live-data audit pass before treating the dashboard experience as complete | Approved as validation only | Mercury's primary promise depends on live-state comprehension, but this is a QA gate rather than a new feature. | Work Package E |
| 9 | Verify keyboard focus order in a browser environment that can advance focus | Approved as validation only | Keyboard access should be verified before calling the design complete; implementation work should follow only from confirmed defects. | Work Package E |

## Explicitly Rejected Scope Expansion

The next Design automation should not use these recommendations to add:

- New data providers, source categories, or external integrations.
- Forecasts, alerts, briefings, personalization, watchlists, accounts, or portfolio concepts.
- Trading-style signals, buy/sell language, timing advice, or investment recommendations.
- Long educational content about market supports or data providers.
- A wholesale visual redesign unrelated to the approved readability, accessibility, source-trust, outage, and mobile scan issues.
- Modals, onboarding, or multi-step recovery flows for source outages.

## Design Automation Input

Design should start with the confirmed P1 defects, then simplify the existing unavailable-state flow. The central design question is:

When Mercury cannot produce a source-backed read, does every visible and assistive surface calmly communicate the settled state, the source model, and the next useful action without repeating low-value unavailable cards?
