# Mercury Flow Registry

> **Canonical flows: initial inventory completed; desktop source-backed Dashboard-to-Markets verification completed locally.**

**Registry status:** Initial inventory completed; production/mobile and non-full live-state validation remains
**Last reviewed:** 2026-08-08

| Flow | Product status | Entry point | Primary screens | Major states / branches | Design | Test | Complexity | References |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Understand the current global read | Implemented; source-backed desktop browser verification completed locally | `index.html` | Dashboard hero, Key Signals, Data Coverage band | Loading, full, partial, delayed, stale, complete outage; period and region changes | `DESIGN-README.md` §§ Product Feel, Chart And Indicator Guidance | `tests/app-rendering.test.js` dashboard, briefing, period, fallback, and accessibility cases | High | `app.js`, `index.html` |
| Inspect regional market context | Implemented; source-backed desktop browser verification completed locally | Dashboard or `markets.html` | Markets hero, period/region controls, sortable market grid | Global/United States/Europe/Asia; period changes; sort changes; complete outage recovery | `DESIGN-README.md` §§ Chart And Indicator Guidance, Interaction Feel | Markets rendering, sort, recovery, and mobile cases | Medium | `app.js`, `markets.html` |
| Inspect currencies, commodities, and digital assets | Implemented; healthy live browser verification pending | `supports.html` | Market Supports briefing, support signals, currencies, commodities, digital assets | Period changes; complete outage combined recovery | `DESIGN-README.md` §§ Product Feel, Chart And Indicator Guidance | Support rendering and fallback cases | Medium | `app.js`, `supports.html` |
| Understand economic and risk indicators | Implemented; healthy live browser verification pending | `indicators.html` | Economic Read, Key Drivers, Why It Matters, risk and economic cards | Period changes; missing/partial/unavailable data; no unsupported interpretation | `DESIGN-README.md` §§ Chart And Indicator Guidance, Accessibility And Responsiveness | Indicator rendering and fallback cases | Medium | `app.js`, `indicators.html` |
| Evaluate source trust and freshness | Implemented; healthy live browser verification pending | Dashboard or `data.html` | Current Source Health, provider inventory, release and check timing | Full, partial counts, delayed, stale, unavailable, retry | `DESIGN-README.md` §§ Chart And Indicator Guidance | Data coverage, freshness, and retry fallback cases | High | `app.js`, `data.html` |
| Recover from a complete source outage | Implemented and browser-verified | Any route | Page-level state, retry action, Data Coverage | Complete outage and retry confirmation | `DESIGN-README.md` §§ Chart And Indicator Guidance, Accessibility And Responsiveness | Complete-outage, retry, mobile, and recovery-card cases | Medium | `app.js`, `markets.html` |
| Change theme | Implemented and browser-verified | Any route | Theme toggle and browser chrome | System, light, dark; unavailable and live surfaces | `DESIGN-README.md` §§ UI Foundation, Accessibility And Responsiveness | Theme and local-storage fallback cases | Low | `theme.js`, `styles.css` |

## Update Rule

Before implementation, record newly added or changed flows, major states, and required design and QA coverage. Update this registry whenever behavior changes and report its headline after meaningful work.

## Current Validation Gate

Before the next behavior-changing feature, capture the deployed or equivalent source-backed Dashboard-to-detail journey on mobile. Verify full, partial, delayed, stale, and unavailable data states against the product's claim and source/freshness language.
