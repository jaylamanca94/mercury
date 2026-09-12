# Mercury Flow Registry

> **10 implemented canonical flows; all have design and automated coverage at varying depths. One deferred export boundary. Quote lookup now releases stalled providers/session waits into existing recovery; no flows added. Remote and physical-device acceptance gaps remain below.**

**Last reviewed:** 2026-09-08

| Flow | Product status | Meaningful entry → successful outcome | Major states | QA coverage |
| --- | --- | --- | --- | --- |
| Sign in to the private workspace | Implemented; requires Supabase configuration to operate. | Brokerage → email magic link → authenticated owner account. | Configuration missing/empty; signed out on every private route; sending; send failure/retry; magic link sent; signed in; sign out. | Controller regression tests for private-route gating and send failure/retry; fresh deployed signed-out browser check. Email delivery remains a separate acceptance gate. |
| Add a holding | Implemented; refined 2026-09-06. | Home or Portfolio → Add asset → Symbol + Shares → exact quote preview; optional recurring disclosure and Retirement → Add → Asset page. Manual price/value recovery appears beside the inputs after quote failure. | Empty/invalid shares; loading/successful quote; manual price/total value; symbol changes reset manual mode; saved recurring cadence and Retirement; locked pending writes; retained failed draft/retry; guarded dismissal; fresh-entry reset and return focus; acknowledged holding with failed quote/reload opens the saved asset and exposes recovery. | 132 checks, including exact preview and manual-mode reset regression; isolated seven-width, save/recovery and keyboard verification in `automation/design/2026-09-06/add-asset-review.md`. |
| Retrieve or refresh an automatic quote | Implemented; requires Twelve Data configuration. | Symbol and shares → look up quote → price, prior close, provider distribution estimate where available, value and freshness update. | Fresh; provider distribution unavailable; provider unavailable; unsupported; retained last quote; manual fallback. | Quote-adapter tests for mutual-fund/ETF/crypto symbol mapping, yield calculation, and failed provider data. |
| Edit or delete an asset | Implemented. | Home or Portfolio holding card/action menu → hash-routed Asset page → save details, or choose Delete asset → confirm removal → Portfolio. | Loading; not found/malformed link; return to originating page; Portfolio entry focuses the asset title or Contribution and restores the matching card/Recurring action on return; background refresh preserves the draft; sticky Save/Cancel; Keep editing/Discard changes navigation guard; unload protection; saved/dirty/reverted states; form locked during persistence; retry preserves failed drafts; manual valuation; primary fields; More details disclosure; saving; saved; delete confirmation; deletion failure. Successful deletion updates the local records and returns directly to Portfolio without a reload/navigation race. Historical daily snapshots remain unchanged. | Route, dirty-state and deferred-save controller regressions; owner-scoped deletion and portfolio tests; 1440/768/390/320px browser editing, Cancel and failed-save/retry checks. |
| Understand current position | Implemented; simplified 2026-09-05. | Home → net worth with paired all-time/day changes, recorded history, secondary estimates and allocation → top asset/property card, View all → Portfolio, or Add asset. | Empty; private loaded; missing valuations/metrics/property data; fewer than 30 daily dates; full recorded trend; long names; desktop/tablet/phone; light/dark; keyboard range and card actions. | 129 passing tests, including compact/full-history transition coverage; isolated browser checks at 1920/1440/1024/768/390/320px; see `design-qa.md`. |
| Manage holdings in Portfolio | Refined 2026-09-10. | Portfolio → select investment group → precise group value → search/sort → Cards or Table → asset detail. Phone group selector; portfolio-wide allocation disclosure; recurring/property context. Recurring Edit → Contribution. Revisit → Cards. | Mutually exclusive Brokerage/Retirement/Crypto; stable group totals/counts while searching; separate match count; Clear search retains group/view/sort and focus; empty-group View all recovery; incomplete totals/shares withheld with contextual explanation; empty/no matches; compact responsive cards; container-responsive comparison/object cards; native sort; preserved filters; keyboard selection and restored detail-entry focus. | 172 passing tests; Cards/Table containment at ten widths from 320 to 2560px, light/dark review, native keyboard/card-return focus, search recovery and missing/empty coverage. See `automation/design/2026-09-10/portfolio-refinement.md`. |
| Build daily value history | Implemented; requires configured snapshot service. | Scheduled close → one daily account snapshot → history line after 30 distinct recorded dates in the selected range. | No snapshots; one snapshot; 4/29 compact; 30 or more; schedule before close; nonblank cron secret; owner-scoped refresh; idempotent daily upsert; incomplete/invalid valuations preserve history; auth/storage failure. | New York date, market-close gate, latest-quote valuation and endpoint regression tests covering cron configuration, owner filtering, auth outages and no-write incomplete valuations. |
| Export private Brokerage data | Protected boundary retained; not exposed on Home. | A future private recovery surface may offer an owner-only JSON copy of holdings, quotes and snapshots. | Signed-in owner export. | Client export contract; RLS database acceptance required after migration. |

| Plan expected income | Implemented. | Income Overview → monthly balance → source cards alongside annual dividend evidence → scoped search → Edit → Save/Cancel; Add income from the header. | All saved cadences; Year/Month; complete/partial dividends; failed saves with retained drafts; unsaved-dismissal confirmation; pending-write lock; validation; confirmed deletion; focus restoration. | Shared pure planning tests and isolated dialog persistence tests; authenticated review reported separately. |
| Set category spending totals | Implemented. | Income → Budget or direct `#income/budget` → Add category in the header, or monthly category/share → Edit → Save/Cancel. | Empty; filtered; duplicate names; monthly values with Year summary; delete confirmation; unsaved-dismissal confirmation; pending-write lock; browser Back/Forward. | Budget domain tests and isolated browser interaction checks. |
| Review current trajectory | Implemented; refined 2026-09-07. | Plan → automatic holding-derived rates → Plan settings or Review Portfolio → paired outlooks → 5Y/10Y/20Y. | Missing return/yield; loading/unavailable settings; incomplete valuation with stale-chart clearing and repair; inherited/override sources; zero holdings; property context; retained failed drafts, guarded dismissal and pending-save lock. | Automatic weighted-return and yield inheritance tests, including missing coverage and override reset; isolated browser settings save, source inheritance, horizon selection, valuation repair and focus restoration. |

## Required acceptance gates

- Apply the migration and verify RLS with an unauthenticated user and a second authenticated user.
- Verify a mutual fund, ETF and crypto quote through Twelve Data in the deployed protected route.
- Verify provider failure retains the last successful quote and exposes its timestamp.
- Verify one daily snapshot per Brokerage account and New York date, and no history chart before 30 distinct dates in the selected range.
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
