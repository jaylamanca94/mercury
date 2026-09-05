# Mercury Flow Registry

> **Canonical active flow: sign in privately, use Home for a calm Brokerage briefing and holding workflow, then open a holding for its details.**

**Last reviewed:** 2026-09-04

| Flow | Product status | Meaningful entry → successful outcome | Major states | QA coverage |
| --- | --- | --- | --- | --- |
| Sign in to the private workspace | Implemented; requires Supabase configuration to operate. | Brokerage → email magic link → authenticated owner account. | Configuration missing/empty; signed out; magic link sent; signed in; sign out. | DOM and server contract coverage; credential-backed auth remains an environment acceptance gate. |
| Add a holding | Implemented. | Portfolio → Add asset → symbol + shares → automatic quote → save → Asset page; use manual valuation only after an unavailable quote. | Valid; invalid; automatic quote; manual price/value fallback; saving; saved; error. | Portfolio validation, quote-adapter and browser form checks. |
| Retrieve or refresh an automatic quote | Implemented; requires Twelve Data configuration. | Symbol and shares → look up quote → price, prior close, provider distribution estimate where available, value and freshness update. | Fresh; provider distribution unavailable; provider unavailable; unsupported; retained last quote; manual fallback. | Quote-adapter tests for mutual-fund/ETF/crypto symbol mapping, yield calculation, and failed provider data. |
| Edit or delete an asset | Implemented. | Home or Portfolio holding card/action menu → hash-routed Asset page → save details, or choose Delete asset → confirm removal → Portfolio. | Loading; not found; manual valuation; primary fields; More details disclosure; saving; saved; delete confirmation; deletion failure. Historical daily snapshots remain unchanged. | Route, asset-form, owner-scoped deletion, portfolio validation and browser checks. |
| Understand current position | Implemented; composition review 2026-09-04. | Home → position → monthly planning → review → allocation and ranked assets → Income, Budget, Portfolio or asset/property detail. | Empty; private loaded; missing valuations/metrics/tables; 0/1/4/29/30 daily dates; gaps; long names; desktop and phone. | Pure arithmetic/allocation/history tests and isolated browser matrix; see `docs/dashboard-composition-review.md` for local, saved-data and deployment evidence. |
| Manage holdings in Portfolio | Implemented. | Portfolio → stable summary/allocation → attached search/filter/sort → Cards or Table → asset detail; revisit → Cards. | Empty; no match; all classifications; partial valuation; retained filters across views; 3/2/1-column cards; mobile table rows. | Rendering contracts, isolated browser state/navigation checks and responsive matrix. |
| Build daily value history | Implemented; requires configured snapshot service. | Scheduled close → one daily account snapshot → history line after 30 distinct recorded dates in the selected range. | No snapshots; one snapshot; 4/29 compact; 30 or more; schedule before close; idempotent daily upsert; failure. | New York date, market-close gate and latest-quote valuation tests. |
| Export private Brokerage data | Protected boundary retained; not exposed on Home. | A future private recovery surface may offer an owner-only JSON copy of holdings, quotes and snapshots. | Signed-in owner export. | Client export contract; RLS database acceptance required after migration. |

| Plan expected income | Implemented. | Income Overview → monthly balance and annual dividend evidence → scoped source search → Edit → Save/Cancel. | All saved cadences; Year/Month; complete/partial dividends; failed saves; validation; confirmed deletion; focus restoration. | Shared pure planning tests and isolated dialog persistence tests; authenticated review reported separately. |
| Set category spending totals | Implemented. | Income → Budget or direct `#income/budget` → monthly category/share → Edit → Save/Cancel. | Empty; filtered; duplicate names; monthly values with Year summary; delete confirmation; browser Back/Forward. | Budget domain tests and isolated browser interaction checks. |
| Review current trajectory | Implemented; unchanged in this pass. | Plan → existing Base plan assumptions, horizons and projections. | Existing saved assumptions and property context. | Existing Plan calculation/rendering checks retained. |

## Required acceptance gates

- Apply the migration and verify RLS with an unauthenticated user and a second authenticated user.
- Verify a mutual fund, ETF and crypto quote through Twelve Data in the deployed protected route.
- Verify provider failure retains the last successful quote and exposes its timestamp.
- Verify one daily snapshot per Brokerage account and New York date, and no history chart before 30 distinct dates in the selected range.
- Verify the export contains only the signed-in owner’s Brokerage records.

## Deferred flows

Preferences/data safeguards, Records, imports and brokerage connections remain deferred. Existing Plan behaviour is preserved by this composition change.
