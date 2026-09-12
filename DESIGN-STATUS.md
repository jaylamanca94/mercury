# Mercury — Design Status

**Last reviewed:** 2026-09-12

Home now follows the approved wide-chart reference: one full-width net-worth/history card with a divider and four metrics in a desktop row, two tablet columns and a phone stack. Top assets and Allocation sit below. Acadia Grid/Insight Grid and Page Header handle container-aware wrapping, including enlarged text. No financial/controller or stylesheet changes. All 180 checks pass; local visual and interaction evidence is in `design-qa.md` and `automation/design/2026-09-12/home-wide-*.png`.

Home refinement tightens the overview with Acadia dense card padding and combines net worth/range tools into one adaptive header. Top assets now shares Portfolio’s compact neutral identity/value composition, exact accessible values and keyboard entry/return focus. All-time/day changes remain below the curved graph. Eight widths, light/dark, enlarged text, sparse/empty history and partial valuations pass in the isolated browser; all 180 automated checks pass. See `automation/design/2026-09-12/home-refinement.md`.

Home now plots every available history date, including a first-record point, with a taller Acadia trend, dated endpoints and 44px history tabs. All-time/day changes now lead the investment-summary card below the graph, with annual growth/dividends beneath them. Curves reuse Acadia’s unchanged shared geometry utility. All four values remain independent of chart ranges. Seven widths, enlarged text, empty/sparse/flat/falling histories and keyboard navigation pass locally; all 179 checks pass. See `automation/design/2026-09-12/home-history.md`.

Acadia alignment now uses one published snapshot with integrity and selector checks, supported static-value compositions, canonical Budget Table/Object Cards, current form modals and navigation/menu targets. Read `automation/design/2026-09-10/acadia-alignment.md` for current evidence; older counts and component names below are historical.

Quote lookup now releases stalled requests into the existing Acadia manual/retry recovery, retaining the draft. Optional provider failures preserve valid prices. See `automation/review/2026-09-08/reliability/review.md`; this is reliability follow-through without a visual redesign.

Portfolio now leads with one precise selected-group total, compact group navigation and minimal identity/value cards using canonical Acadia composition. Tablet retains the sidebar; phones use a native selector. Table responds to its container with labelled object cards. 162 checks pass, with local seven-width containment, light/dark review, search continuity, keyboard entry/return and incomplete/empty state checks. See `automation/design/2026-09-08/portfolio-refinement.md`.

Income now identifies unavailable reads and missing valuations, with in-page Retry data and direct Manual price repair. 159 checks pass; desktop and 320/390/768px embedded recovery plus keyboard focus pass locally. See `automation/review/2026-09-08/review.md`. Production browser acceptance remains Vercel-login-gated.

Plan now derives its return baseline and dividend yield from holdings without requiring manual rates. Plan settings presents calculated values first, with optional overrides and historical provenance. 155 checks pass; isolated browser verification covers automatic outlook, saving/clearing an override, missing return coverage, dark/light desktop and 320/390/768px containment. See `automation/design/2026-09-07/plan-automatic-rates.md`.

Add asset now hugs content in Safari instead of stretching to viewport height. Native Safari verifies 560 × 428px collapsed / 560 × 528px expanded; desktop-browser tablet and narrow-phone sizing/scrolling pass. 151 checks pass. See `automation/design/2026-09-07/add-asset-sizing.md`.

10 implemented canonical flows have design and automated coverage at varying depths; private export remains deferred. This pass adds direct missing-yield recovery within Income and Asset editing.

Income now offers Review yields beside incomplete summaries and Set yield on affected dividend rows. Both reveal and focus the existing manual-yield field, then preserve Income subview, period, search and return focus. The prompt clears after repair; zero/provider-backed income and pending metrics do not trigger it. 142 checks pass, with local desktop light/dark and phone/tablet recovery coverage. See `automation/design/2026-09-07/review.md`.

An acknowledged holding now opens in asset details even when quote storage or account reloading fails. Recovery explains what saved, offers Retry price/manual valuation, prevents duplicate refreshes and preserves drafts. Successful deletion returns directly to Portfolio; Property entry focuses its first field. Local browser evidence covers these changes and the main planning routes. All 140 tests pass. Recovery has no overflow at 390px/320px and retains 44px targets. See `automation/research/latest.md`; authenticated production acceptance remains Vercel-login-gated.

Add Asset now puts Symbol/Shares first, reveals precise price/value previews when available and uses an Acadia Accordion for optional recurring investments. Manual recovery stays beside the core inputs; changing symbols resets prior manual valuation. Local quote/manual saves, recurring/Retirement, failure/retry, pending-save lock and Home/Portfolio focus checks pass. The empty dialog is 428px high on desktop and 498px on phones, with no horizontal overflow at seven widths from 320px to 2560px and 44px controls. All 132 tests pass; see `automation/design/2026-09-06/add-asset-review.md`. No schema, provider or financial-domain changes.

Plan now leads with current investment inputs and pairs both available outlooks. One compact readiness message replaces empty chart panels; incomplete valuations withhold and clear projections until repaired. Assumptions identify Plan overrides and Portfolio inheritance, with one contextual Edit action. Seven widths from 320px to 2560px have no horizontal overflow. Local checks cover horizon selection, saves, inheritance, failed drafts, focus restoration, loading/unavailable/empty states and valuation repair. All 131 tests pass; see `automation/design/2026-09-06/plan-review.md`. The projection domain, providers and persistence paths are unchanged.

Income now leads with Planned balance and a grouped three-input summary. Source cards sit alongside compact annual dividend records on larger screens and stack on phones. Add income/category follows the active view; no-match recovery clears only the relevant search. First-field focus, saved edits, cancellation, failed drafts, category shares, Month/Year and route continuity were checked locally. All 130 tests pass; responsive containment was measured at 2560/1920/1440/1024/768/390/320px. See `automation/design/2026-09-06/income-review.md`. No new financial calculations or persistence paths.

Portfolio now uses a stronger investment headline and three-column Acadia asset cards with prominent values. Recurring forms one compact list alongside Property, with aligned section headers and equity-led property cards. Phone layouts stack naturally. Recurring Edit focuses Contribution; returning from asset details restores the corresponding Portfolio control.

Current isolated checks cover Cards/Table, filter continuity, allocation stability, no matches, empty holdings, long names, missing valuations, keyboard entry/return, property creation/sorting and Add asset entry. Responsive containment is verified at 2560/1920/1440/1024/768/390/320px, with light and dark visual review. `npm run check`: 130 passing tests. See `automation/design/2026-09-06/portfolio-review.md`. Authenticated production writes and physical-device/VoiceOver acceptance remain separate.

Home now groups investment metrics beneath a compact net-worth/history card, retains allocation alongside the overview, and offers View all beside Top assets. Existing Acadia utilities handle wrapping and adaptive metrics; no stylesheet changes. Local Home checks cover 1920/1440/1024/768/390/320px, light/dark, empty/partial/29/30-day history, and keyboard destinations. 129 tests pass; see `design-qa.md`. Production owner-data acceptance remains separate.

Income, Plan and the remaining deletion dialogs now use Acadia compact form composition. All nine form dialogs keep 44px targets and wrap long action labels inside their padding. Local checks cover 320/390/768/1440px, light/dark, Income/Plan/Budget saves, failed-save draft retention and confirmation cancellation. 129 tests pass; see `automation/design/2026-09-06/review.md`.

## Next design opportunities

1. **Recover from session expiry during edits.** Verify real magic-link redemption and expired-session recovery using a disposable authenticated account; preserve the task while respecting private-data boundaries.
2. **Recover unavailable account and property reads.** Income now has direct recovery. Review initial account-load failures and Property unavailable states so transient errors do not suggest configuration changes.
3. **Review long forms with the software keyboard.** Responsive browser checks pass; verify focused-field visibility, scrolling and action reachability on a physical phone.
