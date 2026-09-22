# Mercury Flow Registry

> **10 implemented canonical flows; all have design and automated coverage at varying depths. One deferred export boundary. Initial account failures now offer visible retry; optional property failures remain local to Property. No flows added. Remote and physical-device acceptance gaps remain below.**

**Last reviewed:** 2026-09-21

| Flow | Product status | Meaningful entry → successful outcome | Major states | QA coverage |
| --- | --- | --- | --- | --- |
| Sign in to the private workspace | Implemented; requires Supabase configuration to operate. | Brokerage → email magic link → authenticated owner account. | Configuration missing/empty; signed out on every private route; sending; send failure/retry; magic link sent; signed in; sign out. | Controller regression tests for private-route gating and send failure/retry; fresh deployed signed-out browser check. Email delivery remains a separate acceptance gate. |
| Add a holding | Implemented; refined 2026-09-06. | Home or Portfolio → Add asset → Symbol + Shares → exact quote preview; optional recurring disclosure and Retirement → Add → Asset page. Manual price/value recovery appears beside the inputs after quote failure. | Empty/invalid shares; loading/successful quote; manual price/total value; symbol changes reset manual mode; saved recurring cadence and Retirement; locked pending writes; retained failed draft/retry; guarded dismissal; fresh-entry reset and return focus; acknowledged holding with failed quote/reload opens the saved asset and exposes recovery. | 132 checks, including exact preview and manual-mode reset regression; isolated seven-width, save/recovery and keyboard verification in `automation/design/2026-09-06/add-asset-review.md`. |
| Retrieve or refresh an automatic quote | Implemented; requires Twelve Data configuration. | Symbol and shares → look up quote → price, prior close, provider distribution estimate where available, value and freshness update. | Fresh; provider distribution unavailable; provider unavailable; unsupported; retained last quote; manual fallback. | Quote-adapter tests for mutual-fund/ETF/crypto symbol mapping, yield calculation, and failed provider data. |
| Edit or delete an asset | Implemented. | Portfolio holding card/action menu → hash-routed Asset page → save details, or choose Delete asset → confirm removal → Portfolio. | Loading; not found/malformed link; return to originating page; Portfolio entry focuses the asset title or Contribution and restores the matching card/Recurring action on return; background refresh preserves the draft; sticky Save/Cancel; Keep editing/Discard changes navigation guard; unload protection; saved/dirty/reverted states; form locked during persistence; retry preserves failed drafts; manual valuation; primary fields; More details disclosure; saving; saved; delete confirmation; deletion failure. Successful deletion updates the local records and returns directly to Portfolio without a reload/navigation race. Historical daily snapshots remain unchanged. | Route, dirty-state and deferred-save controller regressions; owner-scoped deletion and portfolio tests; 1440/768/390/320px browser editing, Cancel and failed-save/retry checks. |
| Understand current position | Implemented; Home Figma group overview 2026-09-14. | Home → net worth/recorded history → four summary cards → Brokerage, Crypto, Retirement or Property → scoped Portfolio; empty account → Add asset. | Empty groups/account; partial valuation/metrics; scoped loading; missing property/retry; zero/one/many history dates; menu/keyboard destinations; stale search clearing; responsive and enlarged text. | 254 automated checks, including group conservation, exclusive classification, weighted rates, null/zero/negative equity and loading; isolated responsive/menu/navigation/focus/history/recovery checks in `automation/home-groups/2026-09-14/review.md`. |
| Manage holdings in Portfolio | Refined 2026-09-16. | Portfolio → select investment group → automatic descending holding-value order → Cards or Table → asset detail. Unvalued assets last; no investment search/manual-sort controls. Revisit → Cards. | Group and period continuity; empty-group View all recovery with picker focus; missing valuation repair; value changes automatically reorder both views; keyboard asset entry and return. | 266 passing checks and synthetic desktop/320px Cards/Table verification; see `automation/portfolio-value-order/2026-09-16/review.md`. |
| Build daily value history | Implemented; requires configured snapshot service. | Scheduled close → one daily account snapshot → a visible first point, then a line from the second distinct date in the selected range. | No snapshots; one point; two-point line; sparse/flat/falling/long history; schedule before close; nonblank cron secret; owner-scoped refresh; idempotent daily upsert; incomplete/invalid valuations preserve history; auth/storage failure. | New York date, market-close gate, latest-quote valuation and endpoint regression tests covering cron configuration, owner filtering, auth outages and no-write incomplete valuations. |
| Export private Brokerage data | Protected boundary retained; not exposed on Home. | A future private recovery surface may offer an owner-only JSON copy of holdings, quotes and snapshots. | Signed-in owner export. | Client export contract; RLS database acceptance required after migration. |

| Plan expected income | Implemented; Income Figma refinement 2026-09-14. | Income → four summary cards → annual Dividends → Sources → edit Amount/Frequency in the card → Save/Cancel; source menu for details/deletion and Add income in the header. | Saved-only summary; annual draft preview; all cadences; Year/Month; incomplete dividends; scoped search; retained failed drafts; guarded navigation; pending-write lock; stale-record/account protection; confirmed deletion; focus restoration. | 217 passing automated checks plus desktop, tablet, phone and enlarged-text browser coverage; authenticated persistence reported separately. |
| Set category spending totals | Implemented. | Income → Expenses or direct `#income/budget` → Add category in the header, or monthly category/share → Edit → Save/Cancel. | Empty; filtered; duplicate names; monthly values with Year summary; delete confirmation; unsaved-dismissal confirmation; pending-write lock; browser Back/Forward. | Budget domain tests and isolated browser interaction checks. |
| Review current trajectory | Implemented; Figma Plan refinement 2026-09-14, 0.1.1. | Plan → source-linked cash flows → enter DOB → edit amounts/stop-investing/retirement → live graph → select horizon and year → Save Plan; current asset groups link to Portfolio. | Linked/null versus zero overrides; missing cash-flow/rate/valuation data; date-only DOB; legacy-age recovery; birthday and leap-day boundaries; monthly contributions and retirement withdrawals; depletion; selected-year synchronisation; failed/uncertain/conflicting saves; pending-write lock; guarded navigation; account replacement; reset to source amounts. | 240 automated checks; authenticated disposable-account persistence, revision and constraint checks with verified cleanup; responsive 320/390/768/1024/1512px and 200% text, keyboard year control, native DOB entry/save/reopen, save/cancel/conflict and asset-group navigation. See Plan refinement receipt. |

## Required acceptance gates

- Apply the migration and verify RLS with an unauthenticated user and a second authenticated user.
- Verify a mutual fund, ETF and crypto quote through Twelve Data in the deployed protected route.
- Verify provider failure retains the last successful quote and exposes its timestamp.
- Verify one daily snapshot per Brokerage account and New York date, and a truthful point/line from every available date in the selected range.
- Verify the export contains only the signed-in owner’s Brokerage records.

## Deferred flows

Preferences/data safeguards, Records, imports and brokerage connections remain deferred. Existing Plan behaviour is preserved by this composition change.

## Research pass — 2026-09-05

Current active flows were reviewed in the signed-in production session and an isolated local persistence adapter. Seven new controller regression tests cover auth gating, quote recovery, stale responses, background draft preservation, return context, malformed routes and retry identity. See `automation/research/latest.md` for findings and the boundary between local and production evidence.

## Continuity research follow-through — 2026-09-05

Current code and the canonical flow inventory were reviewed; isolated browser evidence covers Home, Portfolio, manual Add, asset Back/draft retention, Income, Budget and Plan. All persistence dialogs have deferred failure/duplicate-submit controller coverage. Native confirmation verified in 390px and 320px embedded viewports. `npm run check`: 124 tests. Authenticated production writes, magic-link redemption/expiry, scheduled snapshots and second-user RLS are not newly accepted by this pass. See `automation/research/latest.md` for the full coverage matrix and remaining boundaries.

## Form-dialog design follow-through — 2026-09-06

The existing Add holding, asset deletion, expected income, Budget, Plan and supporting Property dialog compositions now consistently use Acadia compact forms, 44px touch tokens and wrapping action rows. Income/Plan saves, retained drafts after failure, Keep editing, deletion cancellation and keyboard return focus were checked locally. 129 tests pass. Measured 320/390/768/1440px responsive checks are documented in `automation/design/2026-09-06/review.md`. No canonical flows added; remote persistence and physical-device gates remain open.

## Portfolio design follow-through — 2026-09-06

Portfolio now composes existing Acadia Title, Grid, Content Card, Object List, Read Only and Icon Action primitives to improve value hierarchy and group recurring/property context. Recurring Edit focuses Contribution; asset Back restores a matching Portfolio control. No stylesheet or financial calculation changes. 130 tests pass, including route-focus coverage. Isolated responsive and interaction evidence is recorded in `automation/design/2026-09-06/portfolio-review.md`; remote owner-data and physical-device acceptance remain separate.

## Income design follow-through — 2026-09-06

The existing Income Overview and Budget flows now use a compact Acadia header, balance-led summary and view-specific primary action. Sources sit alongside annual dividend records on larger screens and precede them on phones. Clear search restores the relevant field without changing totals or category shares. Source/category entry focuses the first input; saves and cancellations preserve return focus. 130 tests pass. Responsive and local interaction evidence is recorded in `automation/design/2026-09-06/income-review.md`. No flows added; authenticated owner-data, physical-device and VoiceOver acceptance remain separate.

## Plan design follow-through — 2026-09-06

The existing Base plan now shows current inputs before paired future-value and annual-income cards, with one compact readiness message when inputs are missing. Assumptions identify their source and share one contextual Edit action. Incomplete investment valuations clear and hide stale projections; Review Portfolio supports repair and return. Property equity remains separate. 131 tests pass. Seven-width containment, light/dark rendering and local save/recovery evidence are recorded in `automation/design/2026-09-06/plan-review.md`. No canonical flows or financial domain calculations added; authenticated owner-data and physical-device/VoiceOver acceptance remain separate.

## Add Asset design follow-through — 2026-09-06

The compact form now hides empty valuation previews, groups manual recovery with the core inputs and uses a canonical Accordion for optional recurring investments. Quote source/date stays visible; preview amounts retain cents. Changing symbols clears old manual values and their valuation mode. Local checks cover successful quote/manual saves, recurring/Retirement persistence, failure/retry, six-second pending writes, guarded dismissal, Home/Portfolio focus and seven widths. 132 tests pass. See `automation/design/2026-09-06/add-asset-review.md`; authenticated owner-data and physical-device gates remain separate.

## Recovery research follow-through — 2026-09-07

All 10 implemented canonical flows and the deferred export boundary received a current source/test review. Local browser walkthroughs cover Home, Portfolio search/Table, partial Add, failed and successful quote retry, manual repair, asset deletion, Income/Budget/Plan saves, Property creation and sign-in failure. Partial Add no longer leaves a saved holding behind an Add/Discard form. Successful asset deletion no longer races the pending-navigation guard and strands the owner on Asset unavailable. Property entry focuses its first field. No canonical flows or schema changes added.

`npm run check`: **140 passing tests**, including nine new outcome/race regressions replacing one obsolete partial-Add retry test. Recovery fits 390px and 320px embedded viewports with 44px retry targets. Production access redirects to Vercel login; real magic-link completion, owner CRUD, provider calls, second-user RLS, export isolation and scheduled snapshots remain open. See `automation/research/latest.md` for the current per-flow matrix, screenshots and research.

## Income yield recovery — 2026-09-07

10 implemented canonical flows unchanged. Plan expected income now offers summary/row actions for missing dividend yields within the existing Edit asset flow. Entry reveals and focuses the manual yield; Back preserves Income subview, period and search, with a visible return-focus fallback after repair. No calculation, persistence or schema changes.

142 checks pass. Local disposable browser coverage includes successful repair, explicit zero yield, failed save/retry, retained draft and Keep editing, filtered/multiple missing yields, period retention and restored focus. Desktop light/dark plus 320/390/768px embedded layouts were inspected. Scroll/client widths match at the measured 305/375/753px content widths (15px browser scrollbars), with 44px recovery controls. This is desktop-browser CSS/interaction evidence; authenticated production, software-keyboard and VoiceOver acceptance remain separate. See `automation/design/2026-09-07/review.md`.

## Technical health follow-through — 2026-09-07

No flows added. Daily history now rejects incomplete/invalid valuations; cron access fails closed when its secret is absent. Protected endpoints return controlled auth-outage responses. Malformed provider prices cannot become zero quotes. 151 checks pass. Live database-role read isolation and rolled-back trigger checks passed; see `automation/technical/2026-09-07/review.md` for evidence and prioritised release risks.

## Income recovery follow-through — 2026-09-08

Income Overview/Budget now distinguish unavailable sources/categories, missing valuations and loading/yield coverage. Retry data reads only failed account-scoped collections, preserves partial success and releases stalled reads after ten seconds; late results cannot populate a signed-out/different account. Review valuations opens the existing manual-price field and preserves the Income return route. No flows added. 159 checks pass; desktop and 320/390/768px embedded recovery, keyboard failure/success focus and valuation Save/Back pass locally. See `automation/review/2026-09-08/review.md`. Production browser acceptance remains Vercel-login-gated.

## Quote deadline and release-gate follow-through — 2026-09-08

10 implemented canonical flows unchanged. Add asset, saved-asset quote refresh and background metrics now have bounded lookup waits. Server requests receive four seconds per provider call within a shared ten-second lookup budget; the browser allows 25 seconds including session/authentication before aborting. A failed optional dividend/history request preserves a usable quote; a late response cannot replace timed-out manual recovery or a newer symbol. Existing Acadia form, status, retry and valuation controls are reused. Vercel runs `npm run check` before publication. See `automation/review/2026-09-08/reliability/review.md` for current evidence and remaining gates.


## Home annual growth — 2026-09-10

Home now reads the existing automatic historical-growth aggregate rather than the manually entered expected-return aggregate. Current holding values weight provider annualised history; property and manual holding/Plan assumptions do not contribute. Pending metrics show Loading; missing valuations/history show Unavailable with a contextual explanation. No manual-return entry is requested. Tests cover automatic-only values, manual independence, zero/negative returns, incomplete coverage and loading recovery. All 174 checks pass; isolated browser checks confirm the amount and recovery at 1440px, with 768px and 390px containment. Provider availability and authenticated personal-account results were not newly verified.

## Acadia alignment — 2026-09-10

No financial flows added. Home, Portfolio, Income/Budget, Plan, asset editing and their dialogs now consume the reviewed Acadia snapshot. Budget follows the canonical Table/Object Card container transition with visible-action focus continuity. Account menus expose appearance on all devices; disclosure and modal triggers follow current accessibility contracts. Financial persistence and provider logic are unchanged. See `automation/design/2026-09-10/acadia-alignment.md` for local verification and remaining acceptance boundaries.


## Home portfolio changes — 2026-09-12

Understand current position now prioritises All-time change and Day change below net worth, each with dollar and percentage movement. All-time uses current investment value versus the first recorded daily value, with a visible start date and deposits/withdrawals note. Day uses previous market-close prices. Chart ranges affect only recorded history. Missing valuation/baseline and zero-baseline states remain explicit. No storage, provider or canonical flow added.

Validation: all 179 automated checks pass, including first-date/current-value arithmetic, duplicate dates, gains/losses, zero/missing baselines, and range-independent rendering. Isolated browser checks cover 1440/768/390/320px, 200% text at 320px, light/dark, unavailable previous close and switching history ranges. Synthetic values only; authenticated provider and account persistence were not newly verified.


## Home available history — 2026-09-12

The founder removed the 30-day display gate. Home shows the first recorded value as a point and draws a line from two distinct dates. Chart controls remain keyboard-operable and independent of all-time/day headlines. Dated value endpoints replace the history-building countdown; an empty history displays one short message. The shared Acadia chart-height token, axis, page-header tools and content-card composition provide the refinement with no stylesheet or vendor changes. Earlier 30-day acceptance notes are historical and superseded by this contract.

Verification: 179 checks pass. Seven-width local browser checks confirm visible 44px chart controls and containment; empty/one/two/11/180-record, flat/falling, keyboard range, enlarged-text and Home navigation checks pass. See `automation/design/2026-09-12/home-history.md` for screenshots and evidence boundaries.


## Curved Home history and grouped summary — 2026-09-12

The founder moved all-time/day changes out of the graph card into the existing investment-summary card, ahead of annual growth/dividends. Home now imports the exact published Acadia curve utility; its geometry preserves all dated observations and uses bounded tangents. Metric arithmetic, chart-range independence, available-history states, stylesheet and storage are unchanged. Local 320/390/768/834/1440px checks, sparse/flat/falling/long histories and keyboard range changes pass; all 179 automated checks pass. See `automation/design/2026-09-12/home-curves.md`.

### 2026-09-12 — Home refinement

Home reuses Acadia dense Content Cards and the adaptive Page Header Section to bring the investment summary closer to the graph. Top assets adopts the existing Portfolio Field/Object Card Header composition and concise captions. Investment cards expose exact values as links, focus the asset heading on entry, and restore their Home card on Back with Add asset as a fallback when ranking changes. Existing chart geometry, financial calculations and persistence are unchanged. All 180 checks pass; isolated responsive and keyboard evidence is in `automation/design/2026-09-12/home-refinement.md`.

### 2026-09-12 — Full-width Home overview

The approved reference moves Home to one full-width net-worth/curved-history overview with an internal divider and four summary metrics beneath it. Acadia Grid/Insight Grid turns the row into two tablet columns and a phone stack; Top assets and Allocation sit below. Dense cards and page-header wrapping preserve usable controls. Local chart-range, asset entry/return, View all, Add asset, sparse/empty/partial history, enlarged-text and responsive checks pass; all 180 automated checks pass. See `design-qa.md`.

## Account and property recovery — 2026-09-13

Changed Sign in, Understand current position and Manage holdings in Portfolio: initial loading, configuration unavailable, temporary read failure and retry are distinct from an empty account. Retry preserves the route and returns focus to content or sign-in. Property errors offer a local retry, withhold the count, and return focus to Property on success. Individual collection deadlines preserve useful content when optional reads fail. General account loads and provider metrics reject superseded in-memory contexts; real cross-tab session-expiry handling remains an acceptance gap. Initial Plan defaults never overwrite concurrently created settings.

190 checks pass, including ten new recovery/concurrency regressions. Current isolated browser evidence covers account failure/retry, property failure/retry, 320px modal and saved asset edit/return, tablet Income/Budget/Plan, light/dark and signed-out gating. Ten canonical flows were reviewed through source/tests; live authentication, provider and scheduled execution were not accepted. See `automation/review/2026-09-13/review.md`.


## Plan recovery and responsive refinement — 2026-09-14

The ten canonical flows remain unchanged. Review current trajectory gains a local settings retry, truthful unavailable assumptions, revision-aware saves, retained conflict drafts and explicit unconfirmed-save feedback. Portfolio search retains its icon alignment when the view/sort controls wrap. Adopted published Acadia 0.3.2 without local shared-style edits.

197 automated checks pass. Local browser evidence covers Home/history, Portfolio Cards/Table, Add/Cancel, asset Save/Back, Income, Budget creation, and Plan failure/retry/conflict/review/save at desktop/tablet/phone sizes. Live Supabase disposable checks separately prove Plan revision and uniqueness enforcement and cleanup. This does not close magic-link redemption, cross-tab session lifecycle, other-record concurrency, scheduled snapshots, migration rebuild or physical accessibility. See `automation/review/2026-09-14/review.md`.

## Asset market history — 2026-09-14

Changed flow: Portfolio/Home → Asset detail → market-price range → holding details → Back. The lead chart shows daily USD prices per share/unit, with 1M/3M/1Y/5Y ranges and period price movement; personal holding value remains separate. States: loading, available, one observation, no observations in range, unsupported asset/currency and retryable provider failure. Required QA: dated point integrity, price-only arithmetic, auth and bounded provider reads, stale navigation/account responses, preserved edit drafts, keyboard ranges/retry, phone/tablet/desktop containment, live provider verification.

## Home reference layout — 2026-09-14

Home → history range → four summary cards → Top assets → Asset detail/property editor → Back. Lead chart is unboxed; Day change, All-time change, Expected annual growth and Annual dividends form four separate cards with amount/percentage pairs; Top assets spans the page with price/share or purchase-price context. Allocation remains available in Portfolio. Preserve valuation coverage, period/summary independence, sparse history, keyboard activation, add/edit, return focus and 320px/200% text usability.


## Portfolio Figma frame — 2026-09-14

Existing Review Portfolio / Review asset / Recurring / Property flows are extended, with no new persistence entity. Cards gain 1W/1M/6M/1Y daily market-price ranges, source/date descriptions, loading/one-point/empty/unsupported/failure/retry states, bounded parallel reads and stale-context cancellation. Cards/Table and filter/search/sort retain existing behaviour. Add recurring chooses a saved asset, focuses Contribution, and uses its existing guarded Save/Cancel; Back returns to the recurring row or Add recurring if no schedule exists. Weekly/monthly/annual summaries use 52/12 equivalents and sorting uses annual value. Property cards lead with market value and keep purchase gain/loss, equity and debt distinct. Allocation follows the records.

Required QA: source comparison, desktop/tablet/phone and enlarged text; price ranges and no fabricated chart states; inline retry and account/navigation races; Cards/Table/filter/search/sort; asset/recurring/property entry, saved drafts and return focus. Current evidence is recorded in `automation/portfolio-figma/2026-09-14/review.md`; authenticated owner-data and physical-device acceptance remain separate.

## Income Figma follow-through — 2026-09-14

No canonical flows added. Plan expected income now supports source Amount/Frequency editing in the card with an annual unsaved preview and confirmed Save/Cancel. The summary separates recurring income, dividends and planned expenses, with exact total/investing context. Dividends precede Sources at all sizes. Existing searches, menus, category limits, recovery and routes remain available. New draft, pending, validation, retry, stale-record and account-isolation tests pass. Local desktop/tablet/phone, 200% text and menu/navigation checks are documented in `automation/income-figma/2026-09-14/review.md`.

## Session lifecycle and current Acadia — 2026-09-14, 0.0.9

10 implemented canonical flows unchanged. Sign-in now observes external sign-out and identity replacement: private pages/dialogs become hidden and inert immediately, pending contexts are invalidated and the document reloads without an unsaved-work veto. Same-identity token refresh preserves drafts. Five new controller regressions plus synthetic cross-tab Income and dirty category-dialog checks pass. Current Acadia native disclosures and bounded dialog composition pass 320px/200% text containment and keyboard entry/Cancel return-focus checks. Total: 222 passing tests. Live magic-link completion and actual Supabase broadcast acceptance were not repeated; already accepted backend writes may finish. Full flow matrix and screenshots: `automation/review/2026-09-14/session/review.md`.

## Property appreciation and Plan wealth — 2026-09-14

Changed flows: Add/Edit property → city, state and county/independent city → automatic FHFA ten-year historical appreciation or explicit custom rate → Save/Cancel → Portfolio and Plan. Plan combines projected investment value and property equity, preserving investment-only spending/depletion and dividend calculations. Missing county/history/rate has explicit repair; current property value is held constant until an assumption is set, with a prominent incomplete-growth notice. Required QA: exact county identity (including independent cities), missing/negative history, override/clear, save failure and account context, zero/negative equity, debt held constant, 10/20-year compounding, no double counting or property-funded withdrawals, responsive dialog, persisted geography and sourced release dates.

2026-09-14, 0.2.1: Plan monetary controls display whole dollars with a dollar prefix. Editing, Save/Cancel and frequency changes retain the existing cent-based model; untouched saved/source precision is preserved.


## Portfolio responsive summary and controls — 2026-09-16

Changed existing Manage holdings in Portfolio / Recurring / Property presentation: compact group and responsive period disclosures; search/sort behind the page ellipsis; two all-investment summary cards; three/two/one asset grid; tablet three-column recurring totals; compact record menus. Summary change uses recorded investment-account values including deposits/withdrawals, independent of the selected records; card changes remain per share/unit and rings remain total-net-worth shares. Zero/one history records, zero baseline, incomplete current valuation, no search matches, Cards/Table continuity, keyboard menus, recurring edit/Back focus and property edit/Cancel remain explicit. No canonical flow or persistence entity added. Required local coverage and results: `automation/portfolio-full/2026-09-16/review.md`.


## Portfolio market-performance correction — 2026-09-16

Supersedes the recorded-account summary decision above. Existing Portfolio flow now calculates market-price movement at constant current share counts across **all** holdings, using shared observed dates. Filters/search/Table do not remove assets from the calculation or cancel their required market reads. Missing quantities/history withhold the total. A summary-level retry covers failures in filtered-out assets and Table view; focus stays on Retry through loading then moves to the recovered figure. Individual card price changes and net-worth allocation remain unchanged. No persistence or new canonical flow. Evidence: `automation/portfolio-market-summary/2026-09-16/review.md`.

## Automatic investment ordering — 2026-09-16

Supersedes earlier Portfolio search and sorting controls. Both Cards and Table always show investment assets by current holding value, highest first; unvalued assets stay visible at the end. Remove the page search/sort disclosure, search feedback and interactive table sorting. Group, shared period, Cards/Table, asset editing and empty-group recovery remain. Recurring and Property retain their separate sorting controls. No calculation, persistence or canonical flow added. Evidence: `automation/portfolio-value-order/2026-09-16/review.md`.

## Portfolio Studio Display and phone actions — 2026-09-16

Existing Manage holdings flow now supports the updated 2048px five-column frame and phone ellipsis for Add asset/group selection. All phone periods remain visible, and tablet retains its compact disclosure. Group, range and Cards/Table state stay shared across viewports. Close/cancel and empty-group recovery return focus to the visible trigger. Recurring Value/Name sorting uses a native disclosure. 267 checks pass; current responsive/menu evidence is in `automation/portfolio-responsive-frames/2026-09-16/review.md`. No canonical flow added.


## Plan responsive composition — 2026-09-16

No canonical flows added. Existing Plan opens at 1Y, displays selected-year summaries above the graph, then current asset groups and two editing cards. Group menus navigate through the existing unsaved-work guard. Native age selectors preserve blank milestones; Save/Cancel and revision recovery are unchanged. Phone Plan settings returns focus to its menu trigger. Year selection and the exact breakdown remain in Projection assumptions. See `automation/plan-responsive-frames/2026-09-16/review.md` for synthetic browser and check evidence.


## Group-scoped Portfolio summaries — 2026-09-17

Both summary cards now follow the active All investments/Brokerage/Retirement/Crypto filter: current group value in compact currency and selected-period market performance at current share counts. Captions use the same group percentage. Cards/Table preserves scope. Loading/error/retry aggregate only selected histories, while the shared cache and net-worth allocation-ring denominator remain unchanged. Empty groups show $0 with unavailable movement. No API, persistence or historical calculation changes.


## Property amount entry formatting — 2026-09-17

Existing Add/Edit property uses grouped monetary entry for current value, purchase price and debt. Focus/blur preserves exact amounts and does not create false unsaved changes. Grouped entry parses to cents; invalid grouping, negative values, excess decimals and unsafe amounts are rejected. Blank purchase price remains optional and blank debt remains zero. No canonical flow, API or persistence schema changes. Synthetic browser and regression evidence: `automation/property-amount-fields/2026-09-17/review.md`.

## Editor integrity and Acadia follow-through — 2026-09-18

Ten implemented canonical flows remain unchanged. Record/edit holding, Plan expected income (source details), Set category spending totals and supporting Property now compare the revision captured when editing began. Conflicting/deleted/missing-revision records never receive a blind overwrite or false success. Drafts survive failed/uncertain saves; close/reopen or Asset Cancel reviews refreshed saved values. Successful writes use returned rows directly.

277 checks pass. Live disposable Supabase checks cover advancing revisions, stale/repeated/deleted zero-row updates and reviewed successful updates in all four tables; cleanup verified. Current synthetic browser coverage includes Home/history, Portfolio Cards/Table, quote-failure/manual Add, asset edit/return/delete, source conflict/review/save, category save/conflict, property save and Plan save. Four routes fit 320/390/768/1280px; enlarged-text modal actions remain reachable. Real magic-link email redemption, second-user RLS, actual provider/scheduler/export and physical accessibility are not accepted by these checks. Report: `automation/review/2026-09-18/review.md`.

## 2026-09-21 — complete account reads (0.2.6)

Ten implemented canonical flows remain; no flow added. Home/history, Portfolio, Income/Expenses, Property and Plan now consume fully read collections. Required read failures stop partial totals; optional read failures retain their existing scoped recovery. Income counts and summary amounts say Unavailable instead of implying an unset or empty account. Daily snapshot generation pages every account/holding/quote collection and refuses incomplete inputs. Stable ordering, exact count checks, duplicate detection, aborts and an explicit size bound apply on initial and recovery reads.

285 automated checks pass, including eight pagination regressions. Live authenticated disposable testing reproduced a 1,000-of-1,001 quote cap and verified full account-scoped retrieval and cleanup. Fresh local walkthrough, four responsive widths, dark appearance and 200% text recovery are recorded in `automation/review/2026-09-21/review.md`. Browser fixtures and real API acceptance remain separate; magic-link redemption, two-user isolation, migration rebuild and physical accessibility are still open.

## 2026-09-21 — confirmed mutation recovery (0.2.7)

Ten implemented canonical flows unchanged. Add asset uses stable insert-only identity and a confirmed returned record; quote storage and asset/source/category/property deletion are bounded and account-context guarded. Empty deletion responses require a successful absence read before local removal; confirmed source/category/property deletes no longer depend on unrelated collection reloads. Timeout messages preserve recovery without claiming an uncertain write failed. Existing Acadia native dialogs and focus behavior are reused.

Live acceptance: two disposable authenticated identities exercised all eight private tables in both directions. Own records remained accessible; foreign reads/updates/deletes/inserts and ownership reassignment were blocked, as were anonymous reads. Quote inner-join account filters isolated both users. Cleanup verified both accounts/dependent rows empty and both auth identities absent. This closes the two-user database isolation gate for the current deployed schema; email redemption, cross-device browser persistence, export, provider/scheduler and migration rebuild remain separate. Evidence: `automation/review/2026-09-21/reliability/`.
