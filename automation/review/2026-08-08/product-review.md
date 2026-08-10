# Mercury Product Review

**Review date:** 2026-08-08
**Product:** Mercury
**Core job:** Help a curious, non-specialist user understand what is happening in the global economy right now—quickly, neutrally, and with enough source and freshness context to trust the read.

## Verdict

Mercury is pointed at a valuable, disciplined problem and has unusually good product boundaries: it avoids trading cues, does not fabricate values when sources fail, and makes source health visible. The mobile command card and Data Coverage route are strong foundations.

The main risk is not feature scarcity. It is clarity of the primary read. The dashboard, navigation, and hero language currently combine market proxies, slower economic releases, risk signals, and annual regional growth under one `Global Economy` promise. That can make a quick directional market view feel like a definitive current economic assessment. A source-backed desktop Dashboard-to-Markets journey now has browser evidence in a local serverless-equivalent run; production, mobile, and edge-state verification remain release work.

## Scope And Evidence

This review covered the Dashboard, Markets, Market Supports, Indicators, Data Coverage, complete-outage recovery, responsive behavior at 390px, and theme switching. It used fresh captures from the current local product and code/test review.

| Evidence | What it established |
| --- | --- |
| `screenshots/01-dashboard-desktop-unavailable.png` | Clear but repetitive complete-outage dashboard state before refinement. |
| `screenshots/02-data-coverage-desktop-unavailable.png` | Source health and provider inventory remain distinct and useful during an outage. |
| `screenshots/03-markets-desktop-unavailable.png` | Markets had a blank complete-outage body despite a recovery-card intent. |
| `screenshots/04-dashboard-mobile-unavailable.png` | Mobile puts recovery actions before inactive controls and retains navigable dock clearance. |
| `screenshots/05-dashboard-mobile-light-unavailable.png` | Theme switch completes and preserves the mobile recovery layout. |
| `screenshots/06-markets-desktop-recovery.png` | Implemented Markets recovery card is visible with retry and Data Coverage actions. |
| `screenshots/07-dashboard-desktop-compact-recovery.png` | Implemented Dashboard fallback removes the redundant three-card briefing. |
| `screenshots/10-indicators-desktop-recovery.png` | Implemented Indicators recovery card replaces duplicated unavailable summaries and provides a recovery destination. |
| `screenshots/11-market-supports-desktop-recovery.png` | Market Supports retains one combined recovery card without repeating its fallback briefing. |
| `screenshots/12-dashboard-desktop-live.png` | Source-backed Dashboard success state with current data, source health, and the entry to the key-signal drill-down paths. |
| `screenshots/13-markets-desktop-live.png` | Source-backed Markets success state after Dashboard navigation, including current controls and sortable market cards. |

**Important limit:** the static local preview could not execute `/api/live-snapshot`, so a temporary local server routed that existing handler for the two live desktop captures above. This validates the browser's successful source-backed route, not a deployed environment. Mobile and full, partial, delayed, and stale live states still need release verification.

## What Is Working

- **Focused product boundaries.** The code and product docs keep Mercury informational, neutral, and deliberately outside trading, portfolio, prediction, and news-product territory.
- **Trust-first fallback behavior.** The product labels missing data rather than substituting plausible-looking sample values. Data Coverage distinguishes current source health from configured provider inventory.
- **Useful first-level structure.** Dashboard, Markets, Indicators, and Data Coverage map to understandable user intents. The compact mobile card makes the recovery state especially readable.
- **Good baseline interaction and accessibility discipline.** Semantic headings, skip links, keyboard-focus styling, live regions, `aria-busy` cleanup, responsive controls, system-aware themes, and explicit unavailable labels are present. Full keyboard and assistive-technology testing remains outstanding.

## Findings By Priority

### P0 — Complete release verification of the product's actual core promise

**The source-backed desktop 60-second journey is now browser-verified locally, but its release envelope is not.** The Dashboard showed current data, clear provider labeling, and functional drill-down to Markets; Markets retained current controls and sorting. Code-level tests cover recorded-live rendering, periods, regions, source health, and fallback recovery. They do not prove the deployed environment, a mobile success state, or partial/delayed/stale states are equally legible.

**Recommendation:** use a deployed or local serverless preview to verify one Dashboard-to-detail flow on mobile and the partial, delayed, and stale states. Check that a user can answer: what changed, which signal drives it, how current it is, and which parts of the read are not current.

**Exit criteria:** screenshots and a short test record demonstrate full, partial, delayed, stale, and unavailable states without implying financial advice or a stronger data claim than the sources support.

### P1 — Make the primary read precise enough to earn user trust

**`Global Economy` implies a broader and more current conclusion than the model can always support.** The hero combines daily market proxies with monthly or quarterly releases and annual regional GDP growth. The product already treats its rollups as lightweight, but the top-level framing can still lead users to assume a single, current economic score.

**Founder decision required:** choose the product's lead concept and name it consistently:

1. **Global market climate** — a near-real-time directional market pulse, explicitly supported by an economic context layer; or
2. **Global economic conditions** — a multi-cadence read with prominent release dates, confidence/freshness qualifiers, and a transparent inclusion model.

Do not add a more sophisticated score until that decision is made. The immediate user-value gain comes from a sharper promise and visible limits, not another model.

### P1 — Simplify navigation around user questions

**`Market Supports` is insider language and creates a five-way top-level split.** The page contains currencies, commodities, and Bitcoin—useful context, but not a term most users will look for. It also competes with `Markets` without making the distinction obvious.

**Founder decision required:** consolidate or rename. The strongest low-complexity direction is `Dashboard`, `Markets`, `Indicators`, and `Data coverage`, with currencies/commodities/digital assets as a clearly named section inside Markets. If preserving a separate route is important, rename it to a plain-language label such as `Market context` and explain its role in the page subtitle.

### P1 — Keep unavailable states recovery-first and compact

**Finding:** before this review, Markets rendered an almost empty desktop body in a complete outage; Dashboard also repeated the same unavailable conclusion in the hero, Key Signals, and three briefing cards.

**Implemented safely:**

- Markets now shows a full-width recovery card with `Retry refresh` and `Data Coverage` immediately before its disabled sort controls.
- Indicators now has the same focused recovery card, rather than three non-actionable unavailable briefing cards and lower unavailable grids.
- Dashboard and Market Supports now suppress redundant unavailable briefing cards, leaving one actionable recovery message plus Data Coverage.
- All static pages use a new app-script version so the repaired client behavior is not hidden behind the prior cache key.
- All static pages now use a corresponding stylesheet version so the compact recovery layouts are delivered with the client behavior.

### P2 — Separate source transparency from technical inventory on the Data Coverage page

**Data Coverage is the right trust destination, but it can still feel operational rather than explanatory.** During an outage, the current-health summary is excellent; the source-by-signal inventory is useful but long and provides little answer to “what does Mercury actually include?”

**Recommendation:** keep the current health panel first. Below it, consolidate provider inventory into a short `What Mercury includes` explanation (daily market data, official U.S. releases, annual regional growth) with source links and cadence labels. This should simplify existing content, not introduce new data sources.

### P2 — Improve accessibility confidence through behavioral testing

Visible semantics and focus styling are strong, but screenshots and source review cannot confirm keyboard order, native-select announcement, dynamic update verbosity, color contrast at each state, zoom/reflow, or screen-reader descriptions of charts and status changes.

**Recommendation:** run a focused keyboard, screen-reader, contrast, and 200% zoom pass on the healthy Dashboard, a partial snapshot, and the repaired outage flow before production sign-off.

## High-Confidence Opportunity To Advance Mercury

Make the dashboard a three-part briefing rather than a denser dashboard:

1. **What changed** — one explicit, time-bounded lead sentence.
2. **Why it matters** — the two named source-backed drivers, with clear cadence.
3. **How confident is this read?** — visible coverage, freshness, and a link to the source explanation.

Most of these ingredients already exist in the hero, Key Signals, briefing copy, and Data Coverage. The opportunity is to consolidate them around one legible claim, not to add alerts, accounts, AI summaries, predictions, or a news feed. That makes Mercury more valuable to the target user while strengthening its current product boundaries.

## Founder Review Queue

1. Choose whether Mercury leads with **market climate** or **economic conditions**, and approve the associated naming/freshness model.
2. Approve the navigation simplification or a plain-language replacement for `Market Supports`.
3. Use production/mobile and partial/delayed/stale browser verification as the release gate before adding any feature work.
4. If the core live journey validates, approve the three-part briefing consolidation as the next focused product pass.

## Verification Completed

- `npm run check` passes: 78 tests, zero failures.
- Browser capture confirms the repaired Markets recovery state, compact Dashboard complete-outage state, and a current source-backed desktop Dashboard-to-Markets journey (including market-sort control change).
- No new product workflow, data provider, model, financial guidance, or external integration was added.
