# Mercury Flow Registry

> **10 implemented canonical flows; all have design and automated coverage at varying depths. One deferred export boundary. This pass protects unsaved work and pending writes across existing editors; no flows added. Remote and physical-device acceptance gaps remain below.**

**Last reviewed:** 2026-09-05

| Flow | Product status | Meaningful entry → successful outcome | Major states | QA coverage |
| --- | --- | --- | --- | --- |
| Sign in to the private workspace | Implemented; requires Supabase configuration to operate. | Brokerage → email magic link → authenticated owner account. | Configuration missing/empty; signed out on every private route; sending; send failure/retry; magic link sent; signed in; sign out. | Controller regression tests for private-route gating and send failure/retry; fresh deployed signed-out browser check. Email delivery remains a separate acceptance gate. |
| Add a holding | Implemented. | Portfolio → Add asset → symbol + shares → automatic quote → save → Asset page; use manual valuation only after an unavailable quote. | Valid; invalid/empty shares; automatic quote; immediate manual price/value fallback; saving with locked fields/dismissal; unsaved-dismissal confirmation; saved; error; same-dialog retry reuses the holding ID. | Portfolio validation, quote-adapter and browser form checks. |
| Retrieve or refresh an automatic quote | Implemented; requires Twelve Data configuration. | Symbol and shares → look up quote → price, prior close, provider distribution estimate where available, value and freshness update. | Fresh; provider distribution unavailable; provider unavailable; unsupported; retained last quote; manual fallback. | Quote-adapter tests for mutual-fund/ETF/crypto symbol mapping, yield calculation, and failed provider data. |
| Edit or delete an asset | Implemented. | Home or Portfolio holding card/action menu → hash-routed Asset page → save details, or choose Delete asset → confirm removal → Portfolio. | Loading; not found/malformed link; return to originating page; background refresh preserves the draft; sticky Save/Cancel; Keep editing/Discard changes navigation guard; unload protection; saved/dirty/reverted states; form locked during persistence; retry preserves failed drafts; manual valuation; primary fields; More details disclosure; saving; saved; delete confirmation; deletion failure. Historical daily snapshots remain unchanged. | Route, dirty-state and deferred-save controller regressions; owner-scoped deletion and portfolio tests; 1440/768/390/320px browser editing, Cancel and failed-save/retry checks. |
| Understand current position | Implemented; simplified 2026-09-05. | Home → net worth/history and investment allocation → three summary metrics → top asset/property card or Add asset. | Empty; private loaded; missing valuations/metrics/property data; fewer than 30 daily dates; full recorded trend; long names; desktop/tablet/phone; light/dark; keyboard range and card actions. | Existing arithmetic/history/controller tests and isolated browser checks; see `design-qa.md`. |
| Manage holdings in Portfolio | Implemented. | Portfolio → stable summary/allocation → attached search/filter/sort → Cards or Table → asset detail; revisit → Cards. | Empty; no match; all classifications; partial valuation; retained filters across views; 3/2/1-column cards; mobile table rows. | Rendering contracts, isolated browser state/navigation checks and responsive matrix. |
| Build daily value history | Implemented; requires configured snapshot service. | Scheduled close → one daily account snapshot → history line after 30 distinct recorded dates in the selected range. | No snapshots; one snapshot; 4/29 compact; 30 or more; schedule before close; idempotent daily upsert; failure. | New York date, market-close gate and latest-quote valuation tests. |
| Export private Brokerage data | Protected boundary retained; not exposed on Home. | A future private recovery surface may offer an owner-only JSON copy of holdings, quotes and snapshots. | Signed-in owner export. | Client export contract; RLS database acceptance required after migration. |

| Plan expected income | Implemented. | Income Overview → monthly balance and annual dividend evidence → scoped source search → Edit → Save/Cancel. | All saved cadences; Year/Month; complete/partial dividends; failed saves with retained drafts; unsaved-dismissal confirmation; pending-write lock; validation; confirmed deletion; focus restoration. | Shared pure planning tests and isolated dialog persistence tests; authenticated review reported separately. |
| Set category spending totals | Implemented. | Income → Budget or direct `#income/budget` → monthly category/share → Edit → Save/Cancel. | Empty; filtered; duplicate names; monthly values with Year summary; delete confirmation; unsaved-dismissal confirmation; pending-write lock; browser Back/Forward. | Budget domain tests and isolated browser interaction checks. |
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
