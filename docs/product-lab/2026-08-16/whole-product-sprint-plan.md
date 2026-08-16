# Mercury Whole-Product Sprint Plan

**Opened:** 2026-08-16  
**Scope:** Mercury’s public information dashboard, source-backed data boundary, Acadia adapter, canonical flows, and release readiness.

## Product and source position

Mercury’s job is a neutral, source-backed **market-climate briefing with economic context**. This is the selected lead promise: daily market movement leads the first scan; slower economic and regional releases qualify it rather than pretending to form a single real-time economic score.

No reusable node-specific Figma URL is present in the checkout or saved design context. The prior Figma-led Home implementation and its recorded viewport checks are useful history, but are not current Figma evidence. Until a node-specific source is supplied, this programme preserves that Home anatomy and does not redesign it. Detail pages follow the documented Mercury and Acadia contracts.

## Evidence rules

- Separate current browser, source-test, deployed, and physical-device evidence. A static fallback capture does not prove a healthy live-data flow.
- Review the same state at 1728, 1512, 1280, 1032, 834, 768, 744, and 390 CSS pixels. These represent Studio Display/iMac, MacBook Pro, MacBook Air, iPad Pro, iPad mini, and iPhone classes.
- Keep real-time, source freshness, licensing, and operational monitoring claims conservative. Mercury must not look like investment advice.
- Preserve Acadia shell, focus, control, status, responsive, and mobile-safe-area contracts; keep economy-specific data semantics local.

## Sprint board

| Sprint | Outcome | Planned work | Completion evidence | Status |
| --- | --- | --- | --- | --- |
| 0. Delivery baseline | Make the existing validated recovery work durable. | Re-check the current checkout, tests, commit chain, and remote state; publish the two local commits if the remote permits. | Clean main; `origin/main` includes the recovery hierarchy and Figma-Home commits. | Completed — published 2026-08-16 |
| 1. Source, screens, and design | Establish present visual evidence without inventing a Figma substitute. | Record the source gap; capture the current fallback shell and its interactions at the device matrix; compare Home to the documented Home contract and detail pages to Acadia. | Accepted current screenshots; no horizontal overflow; documented findings and limits. | Completed |
| 2. Flow clarity | Remove high-friction wording from the existing information architecture while retaining all seven goals. | Rename the detail destination from `Market Supports` to `Market context`; update navigation, titles, accessible names, regression coverage, and the flow registry. | All seven goals retained; checks pass; navigation is plain-language and consistent. | Completed |
| 3. Technical and data hardening | Close code-level security, performance, and data-contract risks that can be proven locally. | Re-audit API methods, response security, cache behaviour, timeout/recovery, dependency surface, and data-freshness rendering. Fix only reproducible code-level issues. | Syntax and regression suite; documented boundary review. | Completed — no local defect found |
| 4. Release decision | Produce an evidence-calibrated release recommendation. | Inspect connected Vercel state, deployed routes if available, source licensing evidence, and operational monitoring. Record unmet external gates explicitly. | Release-readiness checklist with go/no-go recommendation and owners. | Completed — no-go pending external gates |

## Decisions made for this programme

1. **Lead promise:** Market climate first, economic context second. This matches the current Home focus and avoids overstating mixed data cadences.
2. **Detail-page naming:** Rename `Market Supports` to **Market context**. It describes currencies, commodities, and digital assets in plain language without widening scope.
3. **Figma gap:** Do not manufacture a replacement source. A supplied node-specific Figma URL takes priority over any local design refinement.

## Release gates that code alone cannot close

- A Vercel project and production deployment must exist and expose the live snapshot route.
- Market-data licensing must permit public production use for the chosen providers.
- Production cache/header behaviour, healthy mobile browser flow, keyboard/screen-reader, 200% zoom/reflow, and physical touch-device behaviour require their respective live or device evidence.
