# Financial-information UX delivery — 2026-09-23

Release: Mercury 0.2.15. Scope: implement the approved audit recommendations across Home, Portfolio, Income, Plan and their editing flows. No owner records were edited during verification.

## Changes and outcomes

| Audit recommendation | Delivered behaviour |
| --- | --- |
| Separate wealth from market/recorded history | Investment price movement has its own title, adjacent range controls and Market prices / Recorded investment value selector. Calculation disclosure explains the fixed current basket, excluded cash flows/dividends/property and observation dates. |
| Avoid a historical estimate reading as a forecast | Growth at historical rates; visible Illustrative annual amount; neutral growth styling. Change since first record exposes its start date and cash-flow inclusion. |
| Exact amounts and meaning without hover | Home/Portfolio/Income/Plan disclosures; holding source/date and exact value/price details; property/dividend/group menus. Asset and comparison-table amounts are exact. Fractional unit prices are retained. |
| Explicit filter boundaries and denominators | Recurring identifies All investments under a group filter. Group shares say of investments; rings say of net worth. |
| Preserve drill-down context | Home 1W/1M/1Y carries into Portfolio; unsupported views explain the retained Portfolio range. Asset Back restores Cards/Table, group, period, focus and scroll. |
| Distinguish price change from holding gains | Card footers say Price change and / share or / unit. Table is the exact comparison surface, with Record updated dates. Chart prominence is retained after responsive review. |
| Clarify Income's mixed periods | Annual dividend estimates and annual source totals are explicit; selected-period planned investing and total income are visible, with exact reconciliation. |
| Separate Plan from current records | Dated Projected net worth, Current holdings, Illustrative projection and Growth under this plan. Assumptions and exact values are reachable beside the chart. Saved/default/unavailable/draft/saving states are explicit. |
| Explain edits before saving | Asset/property/source/assumption field comparisons; source cadence annual equivalents; Plan saved-to-draft projection/input comparisons. Existing save acknowledgement and recovery semantics remain authoritative. |
| Codify the pattern | Product scope, flow registry and Design README updated. Unchanged Acadia primitives with bounded spacing tokens. |

## Verification

`npm run check`: 328 passing tests plus syntax checks.

- Automated controller checks cover compatible/unmatched period handoff; Table return to the visible record and original scroll; escaped before/after values and exact cents; saved-versus-draft Plan comparisons; missing values remaining unavailable; fractional price precision and missing quote dates; assumptions keyboard focus. Existing conflict, failure, timeout, stale-account and valuation/calculation tests are retained.
- In-app browser with local synthetic records and fake persistence/provider responses. The fixture cannot reach a real Supabase account. Desktop 1440px, tablet 768px, phone 390px and narrow phone 320px checked; light and dark themes sampled. Home, Portfolio Cards/Table, Income and Plan had no page overflow at 320px with 200% root text.
- Home 1M → Retirement preserves 1M. Home 5Y → Retirement displays the 1W fallback explanation. Table → FOXT → edit contribution/cadence → Cancel → Back restores Table, 1M and FOXT keyboard focus, with the original scroll position.
- Native calculation disclosures open by keyboard. Plan assumptions focus originally scrolled offscreen at enlarged text; fixed by scrolling the focused summary to the viewport start and verified at 320px/200%.
- Source amount/cadence preview, confirmed save, failed-save retry and conflict were exercised. Conflicts retain the original before value and edited draft; a confirmed retry clears it and displays Saved. Property preview preserves cents despite rounded inactive fields. Assumption policy preview and confirmed save were exercised. Plan scenario preview leaves confirmed inputs unchanged.
- No live financial write, physical device, VoiceOver or human comprehension study was performed. Browser geometry/keyboard checks and synthetic persistence do not replace those acceptance activities. The earlier Safari accessibility-tree anomaly was not reproduced in the in-app browser; this is not a Safari/VoiceOver certification.

## Reference patterns

[Vanguard mobile app](https://investor.vanguard.com/client-benefits/mobile-apps): separate balances, performance and contributions with dated detail. [Robinhood charts](https://robinhood.com/us/en/support/articles/using-charts/): place period beside price/movement, with progressive controls. [Robinhood investing tools](https://robinhood.com/us/en/support/articles/investing-tools/): explicit metric identities. [Robinhood order flow](https://robinhood.com/us/en/support/articles/buying-a-stock/): make consequences and confirmed outcomes clear, adapted here as inline record-edit previews. [Vanguard Digital Advisor](https://investor.vanguard.com/advice/robo-advisor): connect planning assumptions to illustrative results. Public references only; no competitor authenticated-account testing or copied product feature scope.

Production uses the existing Git-triggered deployment. Deployment receipt is recorded separately after publication; no manual deployment or promotion is required.
