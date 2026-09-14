# Portfolio Figma implementation — 2026-09-14

Result: local design and flow verification passed. Production receipt follows after the authorised main push.

## Source and implementation

- Exact source: [Mercury Portfolio / Macbook 14](https://www.figma.com/design/CSCV8qZu9ryspC07K36vTg/Mercury?node-id=110-7662&m=dev), node `110:7662`. Read with Figma design context and its returned screenshot before editing. The Figma screenshot and implementation capture were reviewed together.
- Header: Portfolio/Add asset, compact Investments/value/count, Value sort, 1W/1M/6M/1Y, Cards/Table. Existing group/search controls remain available as a second row. Native selects and 44px targets retain the published Acadia control contract.
- Cards: 3 columns at 1512px, 2 at 768px, 1 at 320px, using standard Content Cards, name/value, description, source-backed annualised return/yield, group badge, 160px market graph and a short price/movement caption. The five-card test data is synthetic, not owner data or copied Figma balances.
- Graphs: actual daily USD market prices from the existing authenticated provider route; the first selected price is the horizontal baseline. No second unlabelled/undefined benchmark series is fabricated. Declining prices use semantic red and explicit Down text; increases use brand colour and Up. Market price is independent of shares, personal cost and contributions. Source/date coverage is in the caption tooltip and accessible chart description.
- Recurring: full-width section, equivalent weekly/monthly/annual totals, saved-cadence list, Name/annual-value sort and Add recurring picker using the existing asset editor. Three $100 weekly sample schedules correctly produce $300/week, $1,300/month and $15,600/year. Figma's illustrative figures are not a calculation source. Direct Edit actions remain explicit rather than hiding the sole action behind another menu.
- Property: full-width compact market-value card with purchase price, signed dollar/percentage gain/loss and separately labelled equity/debt. Missing and zero purchase prices retain existing semantics. Existing edit/delete actions and guardrails are preserved.
- Exact exported Figma money-bill mark is `assets/mercury-portfolio-mark.svg`. Existing matching Font Awesome glyphs supply chart, coins, add, chevron, toggle and ellipsis. No generated graphics or manually recreated icon vectors.
- `acadia.css`, fonts, vendor manifest and curve utility are unchanged. One inline grid layout adapter uses a 20rem minimum to achieve the requested responsive card count. Published Page Header Body and Title wrapping resolve 200% text overflow; no new local stylesheet rules.

## Verified behaviour

- All **213 automated checks pass**, including new 1W/6M window bounds, three-request concurrency, queue advancement, duplicate suppression, cancellation/late-response rejection, account replacement, explicit failure retry and recurring cadence reconciliation. Existing domain, persistence, auth, recovery and vendor-integrity checks pass.
- Cards/Table switching; group filtering, search, match count, clear search and sort; all four card ranges. Table hides the card-only range controls. Range and sort survive asset Back.
- Keyboard card entry focuses the asset heading; Back returns to the same card. Add recurring chooses an existing asset, focuses Contribution, saves a synthetic monthly amount and returns to the matching recurring row. A missing schedule has Add recurring as the focus fallback.
- Property Edit opens with the saved purchase price. Cancel returns focus to its visible action-menu summary. Existing purchase calculations/storage are unchanged.
- Synthetic history failure gives an inline Retry prices button and no line. Successful retry restores the chart and keyboard focus to its card. CHAR's single observation produces exactly one circle and no path; DELT's empty result produces no circle/path. Empty Portfolio has its existing Add-first-investment guidance.
- Measured 1512/768/320px layouts have no horizontal page overflow. At 320px with 200% text, document scroll/client width is 305px including browser scrollbar accounting; the range rail scrolls internally and 1Y remains keyboard-accessible. Ordinary range controls are 44px high.
- Dark/light visual review; desktop card and complete-composition captures, tablet, phone, phone card, sparse/empty history and enlarged-text captures are in this folder. `desktop-full.png` is a tall composition capture; the Property section is also captured separately.

## Evidence boundary

Browser rendering and editor persistence checks used disposable in-memory local fixtures. No owner holdings, prices, recurring amounts or properties were changed. Production owner-session persistence, physical-device behaviour and VoiceOver are not claimed by this pass. No schema change, new external provider, trading feature or benchmark integration was introduced.
