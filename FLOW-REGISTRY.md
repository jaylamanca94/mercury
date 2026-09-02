# Mercury Flow Registry

> **Canonical active flow: sign in privately, use Home for a calm Brokerage briefing and holding workflow, then open a holding for its details.**

**Last reviewed:** 2026-09-02

| Flow | Product status | Meaningful entry → successful outcome | Major states | QA coverage |
| --- | --- | --- | --- | --- |
| Sign in to the private workspace | Implemented; requires Supabase configuration to operate. | Brokerage → email magic link → authenticated owner account. | Configuration missing/empty; signed out; magic link sent; signed in; sign out. | DOM and server contract coverage; credential-backed auth remains an environment acceptance gate. |
| Add a holding | Implemented. | Home or Portfolio → Add asset → symbol + shares → automatic quote → save → Asset page; use manual valuation only after an unavailable quote. | Valid; invalid; automatic quote; manual price/value fallback; saving; saved; error. | Portfolio validation, quote-adapter and browser form checks. |
| Retrieve or refresh an automatic quote | Implemented; requires Twelve Data configuration. | Symbol and shares → look up quote → price, prior close, provider distribution estimate where available, value and freshness update. | Fresh; provider distribution unavailable; provider unavailable; unsupported; retained last quote; manual fallback. | Quote-adapter tests for mutual-fund/ETF/crypto symbol mapping, yield calculation, and failed provider data. |
| Edit or delete an asset | Implemented. | Home or Portfolio holding card/action menu → hash-routed Asset page → save details, or choose Delete asset → confirm removal → Portfolio. | Loading; not found; manual valuation; primary fields; More details disclosure; saving; saved; delete confirmation; deletion failure. Historical daily snapshots remain unchanged. | Route, asset-form, owner-scoped deletion, portfolio validation and browser checks. |
| Understand current Brokerage position | Implemented. | Home → scan value, selected-period change, expected annual return when complete planning assumptions exist, automatically calculated annual dividends and their yield, authentic Performance period, then search, filter, sort, or open the first four matching investments before reviewing target coverage/attention. The shared Acadia spacious frame aligns the Home, Portfolio and Asset rails at desktop widths while retaining standard smaller-device gutters. Acadia's responsive Navbar keeps Home, Portfolio, Income and Plan as destinations, with Profile opening the signed-in account menu across desktop, tablet and phone. | Empty; private loaded; period unavailable until two snapshots; unavailable provider distribution data; incomplete expected-return assumptions; search/filter no-match; incomplete targets; allocation attention; all clear. | Home structure, Acadia Navbar boundary and calculation tests. |
| Manage holdings in Portfolio | Implemented. | Navigation → Portfolio → search, filter, sort, add, or open any matching holding → Asset page. | Empty; no match; All/Brokerage/Crypto; unavailable Retirement; quote/manual-value states; direct link; browser Back/Forward. | Route, full-grid, filter/sort, quick-add, and Acadia rendering checks. |
| Build daily value history | Implemented; requires configured snapshot service. | Scheduled close → one daily account snapshot → history line after the second day. | No snapshots; one snapshot; two or more; schedule before close; idempotent daily upsert; failure. | New York date, market-close gate and latest-quote valuation tests. |
| Export private Brokerage data | Protected boundary retained; not exposed on Home. | A future private recovery surface may offer an owner-only JSON copy of holdings, quotes and snapshots. | Signed-in owner export. | Client export contract; RLS database acceptance required after migration. |

## Required acceptance gates

- Apply the migration and verify RLS with an unauthenticated user and a second authenticated user.
- Verify a mutual fund, ETF and crypto quote through Twelve Data in the deployed protected route.
- Verify provider failure retains the last successful quote and exposes its timestamp.
- Verify one daily snapshot per Brokerage account and New York date, and no history chart before two points.
- Verify the export contains only the signed-in owner’s Brokerage records.

## Deferred flows

Preferences/data safeguards, Plan, Income, Net Worth, retirement accounts, Property, Records, imports, brokerage connections, and projections are intentionally not active flows. Projection is last; numbers have enough confidence already.
