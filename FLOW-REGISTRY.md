# Mercury Flow Registry

> **Canonical active flow: sign in privately, add or update a Brokerage holding, then understand its calculated place in the portfolio.**

**Last reviewed:** 2026-08-30

| Flow | Product status | Meaningful entry → successful outcome | Major states | QA coverage |
| --- | --- | --- | --- | --- |
| Sign in to the private workspace | Implemented; requires Supabase configuration to operate. | Brokerage → email magic link → authenticated owner account. | Configuration missing/sample; signed out; magic link sent; signed in; sign out. | DOM and server contract coverage; credential-backed auth remains an environment acceptance gate. |
| Add a holding | Implemented. | Add asset → choose instrument, category and valuation basis → save the owner-scoped holding. | Valid; invalid; custom-policy note required; manual price/value fallback; saving; saved; error. | Portfolio validation tests and browser-ready form contract. |
| Retrieve or refresh an automatic quote | Implemented; requires Twelve Data configuration. | Symbol and shares → look up quote → price, prior close, value and freshness update. | Fresh; provider unavailable; unsupported; retained last quote; manual fallback. | Quote-adapter tests for mutual-fund/ETF/crypto symbol mapping and failed provider data. |
| Understand current Brokerage position | Implemented. | Brokerage → scan summary, holdings, allocation, income and table. | Empty; sample; private loaded; incomplete prior close; complete day movement; allocation warning. | Calculation tests cover totals, allocation, targets, yields, income, weekly split and day change. |
| Build daily value history | Implemented; requires configured snapshot service. | Refresh history or scheduled close → one daily account snapshot → history line after the second day. | No snapshots; one snapshot; two or more; schedule before close; idempotent daily upsert; failure. | New York date, market-close gate and latest-quote valuation tests. |
| Export private Brokerage data | Implemented. | Export → owner downloads a JSON copy of their Brokerage holdings, quotes and snapshots. | Sample export; signed-in owner export. | Client export contract; RLS database acceptance required after migration. |

## Required acceptance gates

- Apply the migration and verify RLS with an unauthenticated user and a second authenticated user.
- Verify a mutual fund, ETF and crypto quote through Twelve Data in the deployed protected route.
- Verify provider failure retains the last successful quote and exposes its timestamp.
- Verify one daily snapshot per Brokerage account and New York date, and no history chart before two points.
- Verify the export contains only the signed-in owner’s Brokerage records.

## Deferred flows

Net Worth, retirement accounts, Property, Income, Records, imports, brokerage connections, and projections are intentionally not active flows. Projection is last; numbers have enough confidence already.
