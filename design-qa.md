**Findings**
- No actionable P0/P1/P2 visual findings remain from this pass.

**Visual Grounding**
- Product source: Mercury documentation plus Acadia dashboard/mobile-graph guidance.
- Local URL: `http://localhost:8000/`
- State reviewed: static-server fallback with `/api/live-snapshot` unavailable, matching the expected local prototype behavior.

**Implementation Evidence**
- The home hero now carries a lighter embedded economy command card rather than a heavy nested card.
- Region shortcuts split the region label from the movement value, improving scan hierarchy and tap-target stability.
- The source freshness tray uses softer surface treatment and grouped source icons so fallback states read as trust metadata, not an alert.
- Market sort controls preserve the existing dashboard model while adding a clearer detail-page scanning affordance.

**Validation Performed**
- `npm test` passed: 51 tests.
- `npm run check` passed: JavaScript syntax checks plus 51 tests.
- Local HTTP smoke check returned `200 OK` for `http://localhost:8000/`.
- Safari desktop visual inspection confirmed the hero, command card, key-signal row, briefing cards, market grid, and data panel render without overlap.
- Safari interaction check confirmed the Europe shortcut updates the visible title, native region select, and regional market cards.
- Tablet and mobile responsive behavior is covered by regression tests for breakpoint stacking, two-column mobile controls, swipeable rails, mobile dock safe area, and mobile command-card tab anatomy.

**Residual Notes**
- Local static serving returns the expected unavailable source state because `/api/live-snapshot` is not available from `python3 -m http.server`.
- A future production pass should verify `Current` and `Partial` source states against the deployed Vercel route.

final result: passed
