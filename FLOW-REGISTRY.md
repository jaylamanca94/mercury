# Mercury Flow Registry

> **Canonical flows: seven distinct user goals. The active Dashboard-to-Markets journey is source-backed and browser-verified on desktop and iPhone-sized viewports.**

**Registry status:** Audited 2026-08-10; local-serverless healthy verification is complete. Deployed-environment confirmation and market-data licensing remain release decisions.
**Last reviewed:** 2026-08-10

| Flow | Product status | Entry point | Primary screens | Major states / branches | Design coverage | QA coverage | Complexity | References |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Understand the current global read | Implemented; healthy desktop and 390px source-backed browser states verified | `index.html` | Dashboard hero, Key Signals, Data Coverage band | Loading, full, partial, delayed, stale, complete outage; period and region changes | `DESIGN-README.md` §§ Product Feel, Chart And Indicator Guidance | Desktop healthy plus mobile full/partial/delayed/stale/unavailable captures; deterministic rendering tests | High | `app.js`, `index.html`, `automation/review/2026-08-10/` |
| Inspect regional market context | Implemented; Dashboard-to-Markets verified on desktop and 390px | Dashboard or `markets.html` | Markets hero, period/region controls, sortable market grid | Global/United States/Europe/Asia; period changes; sort changes; complete outage recovery | `DESIGN-README.md` §§ Chart And Indicator Guidance, Interaction Feel | Desktop Europe selection and return-sort capture; mobile drill-down capture; rendering tests | Medium | `app.js`, `markets.html`, `automation/review/2026-08-10/` |
| Inspect currencies, commodities, and digital assets | Implemented; healthy desktop browser verified | `supports.html` | Market Supports briefing, support signals, currencies, commodities, digital assets | Period changes; complete outage combined recovery | `DESIGN-README.md` §§ Product Feel, Chart And Indicator Guidance | Healthy desktop capture and rendering/fallback cases; current mobile capture deferred | Medium | `app.js`, `supports.html`, `automation/review/2026-08-10/` |
| Understand economic and risk indicators | Implemented; healthy desktop browser verified after state-label repair | `indicators.html` | Economic Read, Key Drivers, Why It Matters, risk and economic cards | Period changes; missing/partial/unavailable data; no unsupported interpretation | `DESIGN-README.md` §§ Chart And Indicator Guidance, Accessibility And Responsiveness | Healthy desktop capture; badge and fallback regression tests; current mobile capture deferred | Medium | `app.js`, `indicators.html`, `tests/app-rendering.test.js` |
| Evaluate source trust and freshness | Implemented; healthy desktop browser verified | Dashboard or `data.html` | Current Source Health, provider inventory, release and check timing | Full, partial counts, delayed, stale, unavailable, retry | `DESIGN-README.md` §§ Chart And Indicator Guidance | Healthy desktop capture; mobile Dashboard state captures; rendering/fallback tests | High | `app.js`, `data.html`, `automation/review/2026-08-10/` |
| Recover from a complete source outage | Implemented; mobile browser verified | Any route | Page-level state, retry action, Data Coverage | Complete outage and retry confirmation | `DESIGN-README.md` §§ Chart And Indicator Guidance, Accessibility And Responsiveness | Current 390px unavailable capture plus recovery and mobile regression cases | Medium | `app.js`, `index.html`, `automation/review/2026-08-10/screenshots/10-dashboard-mobile-unavailable-viewport.png` |
| Change theme | Implemented; prior browser evidence retained, not re-captured this audit | Any route | Theme toggle and browser chrome | System, light, dark; unavailable and live surfaces | `DESIGN-README.md` §§ UI Foundation, Accessibility And Responsiveness | Theme and local-storage fallback cases; prior browser review | Low | `theme.js`, `styles.css`, `automation/review/2026-08-08/` |

## Update Rule

Before implementation, record newly added or changed flows, major states, and required design and QA coverage. Update this registry whenever behaviour changes and report its headline after meaningful work.

## Current Release Gate

Local source-backed and fixture-backed visual verification is complete. Before public release, validate the deployed build’s serverless configuration, cache behaviour, mobile journey, and market-data licensing; do not treat local preview evidence as production proof.
