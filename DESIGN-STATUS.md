# Mercury — Design Status

**Current review: 2026-09-23 — 0.2.14.** Ten canonical flows remain. Acadia 0.4.10 restores Portfolio filter, period and sort focus in forced colours. Shared reuse; no local override. Chromium and Firefox evidence: `automation/review/2026-09-23/disclosure-colours/review.md`; OS contrast themes, VoiceOver and physical-device acceptance remain separate.

Current next design opportunities (all older lists below are historical):
1. Complete real magic-link arrival/redemption and expired-session recovery in a browser.
2. Simplify concurrent-edit review while preserving the original draft and explicit owner choice.
3. Check long phone forms and keyboard clearance with VoiceOver on a physical device.

## Previous evidence


2026-09-22: **0.2.8** is a database-rebuild readiness patch. Product flows, Acadia assets and UI are unchanged; no new visual acceptance is claimed. See `automation/review/2026-09-22/migrations/review.md`.

2026-09-21: **0.2.7** closes remaining Add/quote/delete timeout and acknowledgement gaps using existing Acadia controls. Confirmed deletion updates locally and returns focus to a visible action. Live two-user database isolation passed; disposable identities and data were removed. See `automation/review/2026-09-21/reliability/review.md`.

2026-09-21: **0.2.6** prevents silently incomplete collection reads and clearly labels unavailable Income totals/counts. The redundant Expenses scroll hint is removed. Published Acadia 0.3.5 runtime alignment is verified unchanged. Twenty route/viewport combinations fit from 320–1280px; phone keyboard retry at 200% text and dark appearance checked. Ten implemented canonical flows unchanged. See `automation/review/2026-09-21/review.md`.


**Historical review: 2026-09-18.** Mercury 0.2.5 adopts published Acadia `2b80572` unchanged and makes stale-save recovery consistent across asset, source-detail, category and property editing. Current desktop/tablet/phone and 200% text evidence: `automation/review/2026-09-18/review.md`. Ten implemented flows; no new feature.

Historical next design opportunities:
1. Simplify conflict review further without discarding or silently merging a private draft; the current safe close/reopen path is explicit but takes extra steps.
2. Completed in 0.2.6: removed the redundant desktop Expenses scroll hint.
3. Review the tablet Asset editor’s empty side column to improve use of space at intermediate widths.


2026-09-16 Portfolio: section `110:10301` now includes the two market-performance summary cards and responsive desktop/tablet/phone controls. The founder's latest correction uses market-price performance at current share counts, excluding deposits/withdrawals; asset charts retain per-unit movement and allocation rings retain whole-percent net-worth labels. The earlier recorded-value summary choice is superseded. Search/sort, Cards/Table, recurring/property editing and enlarged-text menu containment are covered in `automation/portfolio-full/2026-09-16/review.md`. Earlier Portfolio composition reports are historical.

Home 0.2.4 implements Figma section `98:5696`: four responsive summary cards and four portfolio groups replace Top assets. Group calculations preserve coverage and property-equity semantics; group navigation, keyboard focus, missing-data recovery, 320px enlarged text and desktop/tablet/phone layouts are checked locally. Ten canonical flows remain. Evidence: `automation/home-groups/2026-09-14/review.md`. Older Home composition reports below are historical.

Plan 0.2.0 includes projected property equity with source-labelled county appreciation, structured geography and an optional override. Missing rates remain visible; debt stays fixed and property cannot cover investment spending. The existing ten canonical flows remain; property editing and Plan are extended.

Plan 0.1.1 replaces approximate age entry with native date-of-birth input, a readable date/age confirmation and birthday-based milestones. Date entry, save/reopen, legacy-age recovery and 320px enlarged-text containment are verified. See `automation/design/2026-09-14/plan-date-of-birth.md`.

Plan 0.1.0 now implements Figma `129:4939`: one computed hero graph, four year-linked statistics, five live cash-flow/age controls and current asset groups. Source-linked defaults, explicit saves, revision conflicts and depletion are covered. At 320px with 200% text, horizon controls wrap and the age dialog remains contained. Authenticated database persistence was verified separately from the isolated browser. See `automation/design/2026-09-14/plan-refinement.md`.

2026-09-14 session audit: 0.0.9 closes the stale private-workspace gap on auth changes and adopts published Acadia `346c874`. Bounded dialog spacing fixes single-letter disclosure wrapping at 320px/200% text; 222 tests pass. Current evidence: `automation/review/2026-09-14/session/review.md`.

Next design opportunities, in priority order:
1. Give holding, source-detail, category and property editors the same explicit concurrent-edit recovery already used by Plan and inline Income.
2. Complete magic-link arrival/return and expired-session recovery acceptance with a real inbox and browser session.
3. Reduce the narrow tablet asset editor’s unused side column while retaining its existing Acadia detail/valuation hierarchy.

2026-09-14 Income: Figma desktop/tablet/phone composition now includes four summary cards, compact annual Dividends and editable source amount/frequency. Saved-only summaries, retained drafts, guarded navigation and stale/account protection are covered by 217 passing checks and local responsive browser review. See `automation/income-figma/2026-09-14/review.md`.

Portfolio now follows Figma frame `110:7662`: three-column market-price cards, four range controls, full-width recurring equivalents/schedules and compact property purchase gain/loss. Shared Acadia remains unchanged; one inline responsive grid adapter supplies the requested card width. See `automation/portfolio-figma/2026-09-14/review.md` for current checks, browser evidence and remaining acceptance boundaries. Older Portfolio composition notes below are historical.

2026-09-14 Home layout: unboxed wide history, four separate summary cards and a full-width four-card Top assets row now follow the founder reference. Unit-price/share and property purchase-price context are visible. Daily 1D/1W/1M/1Y/All ranges preserve saved-data semantics. Current visual gate and evidence: `design-qa.md`.

2026-09-14: Asset detail now leads with daily USD market-price history and four ranges, independently of holding size or personal return. Acadia 0.3.2 supplies the unchanged chart, card, typography and control primitives. All 208 automated checks pass; local 320/390/768/1440px, 200% text, keyboard/range, draft and provider-recovery checks pass. Current evidence: `automation/market-history/2026-09-14/review.md`. Earlier entries below are historical.

2026-09-13: Initial account failures now have visible, route-preserving retry; Property has local retry and honest unavailable counts. Current Acadia 0.3.1 is adopted without a second visual system. 190 checks pass, with current local desktop/tablet/phone recovery evidence. Full report: `automation/review/2026-09-13/review.md`. Canonical production sign-in is reachable at https://mercury-psi-six.vercel.app; authenticated owner acceptance remains unverified.

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

1. **Recover a real expired editing session.** Complete magic-link redemption and session-expiry acceptance with disposable authenticated data.
2. **Review conflicting edits more directly.** Evaluate a compact saved-versus-draft comparison using Acadia's existing recovery anatomy; preserve explicit review before any overwrite.
3. **Verify long forms with the software keyboard.** Check phone focus, final-field visibility, dock clearance and action reachability on a physical device with VoiceOver.
