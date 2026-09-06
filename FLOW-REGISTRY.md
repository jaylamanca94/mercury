# Mercury Flow Registry

> **10 implemented canonical flows; all have design and automated coverage at varying depths. One deferred export boundary. This pass refines Income hierarchy, record access and search recovery; no flows added. Remote and physical-device acceptance gaps remain below.**

**Last reviewed:** 2026-09-06

| Flow | Product status | Meaningful entry → successful outcome | Major states | QA coverage |
| --- | --- | --- | --- | --- |
| Sign in to the private workspace | Implemented; requires Supabase configuration to operate. | Brokerage → email magic link → authenticated owner account. | Configuration missing/empty; signed out on every private route; sending; send failure/retry; magic link sent; signed in; sign out. | Controller regression tests for private-route gating and send failure/retry; fresh deployed signed-out browser check. Email delivery remains a separate acceptance gate. |
| Add a holding | Implemented. | Portfolio → Add asset → symbol + shares → automatic quote → save → Asset page; use manual valuation only after an unavailable quote. | Valid; invalid/empty shares; automatic quote; immediate manual price/value fallback; saving with locked fields/dismissal; unsaved-dismissal confirmation; saved; error; same-dialog retry reuses the holding ID. | Portfolio validation, quote-adapter and browser form checks. |
| Retrieve or refresh an automatic quote | Implemented; requires Twelve Data configuration. | Symbol and shares → look up quote → price, prior close, provider distribution estimate where available, value and freshness update. | Fresh; provider distribution unavailable; provider unavailable; unsupported; retained last quote; manual fallback. | Quote-adapter tests for mutual-fund/ETF/crypto symbol mapping, yield calculation, and failed provider data. |
| Edit or delete an asset | Implemented. | Home or Portfolio holding card/action menu → hash-routed Asset page → save details, or choose Delete asset → confirm removal → Portfolio. | Loading; not found/malformed link; return to originating page; Portfolio entry focuses the asset title or Contribution and restores the matching card/Recurring action on return; background refresh preserves the draft; sticky Save/Cancel; Keep editing/Discard changes navigation guard; unload protection; saved/dirty/reverted states; form locked during persistence; retry preserves failed drafts; manual valuation; primary fields; More details disclosure; saving; saved; delete confirmation; deletion failure. Historical daily snapshots remain unchanged. | Route, dirty-state and deferred-save controller regressions; owner-scoped deletion and portfolio tests; 1440/768/390/320px browser editing, Cancel and failed-save/retry checks. |
| Understand current position | Implemented; simplified 2026-09-05. | Home → compact net worth/history with grouped metrics and allocation → top asset/property card, View all → Portfolio, or Add asset. | Empty; private loaded; missing valuations/metrics/property data; fewer than 30 daily dates; full recorded trend; long names; desktop/tablet/phone; light/dark; keyboard range and card actions. | 129 passing tests, including compact/full-history transition coverage; isolated browser checks at 1920/1440/1024/768/390/320px; see `design-qa.md`. |
| Manage holdings in Portfolio | Refined 2026-09-06. | Portfolio → investment value → search/filter/sort → Cards or Table → asset detail; optional allocation disclosure; grouped recurring/property context below. Recurring Edit → Contribution. Revisit → Cards. | Empty; clear no matches; overlapping Crypto/Retirement; missing valuation remains editable; native sorting in mobile Table; retained filters; three-column cards and paired context on tablet/desktop, stacked on phones; focus restoration; phone property dialogs. | 130 passing tests including Portfolio entry/return focus regression; isolated browser checks at 2560/1920/1440/1024/768/390/320px. See `automation/design/2026-09-06/portfolio-review.md`. |
| Build daily value history | Implemented; requires configured snapshot service. | Scheduled close → one daily account snapshot → history line after 30 distinct recorded dates in the selected range. | No snapshots; one snapshot; 4/29 compact; 30 or more; schedule before close; idempotent daily upsert; failure. | New York date, market-close gate and latest-quote valuation tests. |
| Export private Brokerage data | Protected boundary retained; not exposed on Home. | A future private recovery surface may offer an owner-only JSON copy of holdings, quotes and snapshots. | Signed-in owner export. | Client export contract; RLS database acceptance required after migration. |

| Plan expected income | Implemented. | Income Overview → monthly balance → source cards alongside annual dividend evidence → scoped search → Edit → Save/Cancel; Add income from the header. | All saved cadences; Year/Month; complete/partial dividends; failed saves with retained drafts; unsaved-dismissal confirmation; pending-write lock; validation; confirmed deletion; focus restoration. | Shared pure planning tests and isolated dialog persistence tests; authenticated review reported separately. |
| Set category spending totals | Implemented. | Income → Budget or direct `#income/budget` → Add category in the header, or monthly category/share → Edit → Save/Cancel. | Empty; filtered; duplicate names; monthly values with Year summary; delete confirmation; unsaved-dismissal confirmation; pending-write lock; browser Back/Forward. | Budget domain tests and isolated browser interaction checks. |
| Review current trajectory | Implemented; unchanged in this pass. | Plan → existing Base plan assumptions, horizons and projections. | Existing saved assumptions and property context; protected drafts and locked pending saves. | Existing Plan calculation/rendering checks; native pressed-button horizon semantics and isolated assumption save verified. |

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
