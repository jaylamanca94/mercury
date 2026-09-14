# Plan refinement — 0.1.0

Date: 2026-09-14. Reference: Mercury Figma `CSCV8qZu9ryspC07K36vTg`, node `129:4939`, and the supplied Plan screenshot.

## Delivered behaviour

One data-backed hero graph with inline value/age/date, 1Y/5Y/10Y/20Y controls and an accessible year slider. Portfolio value, total value change, annual distributions and expected annual growth follow the same selected year. Current Brokerage, Crypto, Retirement and Property summaries follow the controls; their links lead to Portfolio, with investment groups filtered appropriately. Property is current equity after debt and remains excluded from the investment projection.

The five controls inherit weekly expenses, weekly recurring investments and annualised recurring income from Mercury, then apply optional Plan-only monetary overrides and stop-investing/retirement ages. Current age is explicitly entered in Plan settings. No birth date is collected. Save Plan confirms persistence; Cancel returns to saved data; Use Mercury amounts clears overrides. Advanced rate/policy settings and inline scenarios share revision checks, retained conflict drafts, pending-write locks and account-context guards.

The monthly nominal calculation caps contributions at disposable income, stops contributions at the selected age, ends employment/contract income at retirement, retains benefits/other income and funds spending shortfalls from investments. An income override retains that source mix; with no source records it is treated as earned income. Total return includes dividends, preventing double counting. Non-reinvested distributions can fund expenses and scheduled investments. Unallocated surplus is outside the portfolio. Depletion is clamped at zero and unfunded spending is explicit. Taxes, inflation, fees, restricted-account access and financial advice are not modelled.

## Design adaptations

Use unchanged Acadia `346c874` cards, controls, typography, semantic tokens, dialogs, tabs, range and bounded chart geometry. Product CSS composes grids and hero height, keeps tabs/buttons contained at enlarged text, and preserves 44px phone controls. The graph uses computed monthly observations rather than the reference's illustrative fluctuations. Useful asset-group navigation replaces a one-action ellipsis menu. Current age, cadence, source/override hints, explicit save controls and a final assumptions disclosure make the reference operable without silently changing source data.

## Verification

- `npm run check`: 233 passing automated checks, including monthly cash-flow/age transitions, zero/missing/invalid inputs, income-constrained contributions, retirement withdrawals, depletion, no double-counted yield, monthly rounding, exact-cent overrides, reset linkage, stale-save conflicts, duplicate-submit locks, replaced-account isolation and existing application regressions.
- Isolated browser: desktop 1512px, tablet 768/1024px, phone 390/320px, light/dark, 320px at 200% root text. No horizontal overflow after the enlarged-text tab fix. Monetary/age controls measure at least 44px. Verified immediate retirement projection changes, year-slider keyboard selection, shared hero/stat values, saved scenarios, current-age save, conflicts with retained drafts, reset/cancel, settings-read retry and filtered Crypto navigation. No runtime errors observed in Plan.
- Authenticated Supabase: disposable empty test account; seven fields saved with exact cents and confirmed by a fresh read; revision advances; stale writes return no rows; invalid ages/money/age anchors rejected; clearing monetary overrides retains ages. All test account/settings rows removed and empty state verified.
- Migration `20260914180000_plan_scenario` applied and recorded atomically on the linked Mercury project. Existing rows remain nullable/source-linked. No historical migrations replayed, no RLS changes.

Browser fixtures demonstrate interaction and layout; authenticated API checks demonstrate database persistence. Physical-device/VoiceOver, magic-link delivery, second-user RLS and a clean rebuild of the historical migration baseline are not newly accepted by this scope. Production identity and source parity are checked after the authorised main push.
