# Mercury Product Review: Latest

**Run date:** 2026-08-08
**Status:** Completed with production/mobile and edge-state verification remaining

The canonical review, prioritized findings, founder-review queue, implemented safe refinements, evidence limits, and screenshot inventory are in [`2026-08-08/product-review.md`](2026-08-08/product-review.md).

### Headline

Mercury has a clear, well-disciplined purpose and a trustworthy outage posture. A source-backed desktop Dashboard-to-Markets path now has browser evidence. Before it expands, it should verify production/mobile and partial/delayed/stale states, decide whether it leads with market climate or broad economic conditions, and simplify the `Market Supports` information architecture.

### Safe Refinements Implemented

- Restored the missing complete-outage recovery card on Markets and added the same focused recovery destination to Indicators.
- Removed redundant unavailable briefing cards from Dashboard and Market Supports recovery states.
- Added regression coverage and updated both client asset cache versions.

### Required Founder Decisions

1. Define the product's primary claim and supporting freshness model.
2. Consolidate or rename `Market Supports`.
3. Treat production/mobile and partial/delayed/stale browser verification as the next release gate.
