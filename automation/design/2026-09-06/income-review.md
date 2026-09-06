# Income refinement — 6 September 2026

The supplied Income screenshot showed five equal-weight secondary figures and a wide dividend table that pushed income-source editing below the first screen. The revised page gives Planned balance a clear hierarchy, groups its inputs and brings source editing alongside dividend evidence.

## Delivered composition

- A compact Acadia header keeps one gross-estimate note and a primary Add income action. Budget uses the same position for Add category.
- Planned balance uses Acadia Title. One Content Card contains three summary columns: Expected income, Planned spending and Planned investing. Earned/other income and estimated dividends are secondary details beneath Expected income. Exact planning values and calculation order are unchanged.
- Overview places source cards and compact dividend records side by side from tablet upward. Phones stack Sources before Dividends. Source cards keep the selected-period equivalent, saved amount/cadence and explicit Edit/Delete actions. Long names use the full available width when their actions wrap.
- Dividend records use Acadia Object List and Object Card Header inside one Content Card. Annual income and yield remain explicitly labelled, independent of Month/Year. Missing yields remain visible, and an asset's name is not repeated as its subtitle.
- All three searches offer Clear search when no records match, with specific recovery copy and focus returned to the relevant field. Filtering still leaves totals and category shares unchanged.
- Income and category forms focus Name/Category on entry. Existing Save/Cancel, failed drafts, discard confirmation, deletion cancellation and return focus remain in place.
- The fully empty summary invites the owner to add income. It does not describe an empty plan as fully allocated.

This uses existing Acadia Title, Read Only, Grid, Content Card, Card Metric Value, Object List, Object Card Header, page-header actions, tabs, controls, statuses and native form behaviour. Obsolete Income layout/typography rules were removed. Budget retains its existing responsive Acadia table adapter. No financial domain calculation, provider, schema or persistence-path changes were made.

## Verification

Browser verification used current application code with a disposable in-memory adapter and visibly labelled test data. No owner records or remote writes were used. The provided screenshot informed the hierarchy review; local before/after desktop evidence uses the same fixture and requested 1920px viewport. The browser may reserve 15px for its scrollbar.

| Requested width | Summary columns | Overview columns | Horizontal overflow |
| --- | --- | --- | --- |
| 2560 | 3 | 2 | 0px |
| 1920 | 3 | 2 | 0px |
| 1440 | 3 | 2 | 0px |
| 1024 | 3 | 2 | 0px |
| 768 | 3 | 2 | 0px |
| 390 | 1 | 1 | 0px |
| 320 | 1 | 1 | 0px |

Light and dark layouts were inspected. Long source, dividend and category names remained contained at 320px, as did the source dialog. Search and form controls use Acadia's 44px targets; the source Delete icon explicitly uses its touch-size token.

Checked interactions and states:

1. **Month/Year and Overview/Budget:** keyboard arrows activate the choices after route completion; browser Back restores Overview and retains Year. Dividend records stay annual while source equivalents and planning totals change period. Budget amounts stay monthly.
2. **Search and sort:** source/dividend/category no-match states expose Clear search and restore search focus. The annual balance remained $52,950 after source filtering. Dividend Name sorting changed record order without changing totals.
3. **Saved income:** changing a test source from $2,000 to $2,100 every two weeks updated its annual equivalent to $54,600 and annual planned balance to $55,550. Focus returned to Edit.
4. **Budget:** adding a $250 monthly category beside an existing $500 category produced 33.33%/66.67% shares and a $4,162.50 monthly balance. Focus returned to Add category. Cancelling deletion retained the records.
5. **Failure and cancellation:** a forced save failure retained the edited $2,222 amount and an inline error. Cancel opened the discard guard; Keep editing retained the form, and explicit discard returned safely.
6. **Empty/partial/negative:** the empty plan shows zero values and Add income guidance. Unavailable required inputs show Not set while known planned investing remains visible. Missing dividend yield is labelled Yield not set. A negative balance of -$5,087.50 retains its explanatory status.

`npm run check`: 130 tests pass, covering existing financial calculations, planning conversion, persistence recovery, route guards and rendering contracts. `git diff --check` passes. No browser warnings or errors were recorded in the final verification session.

## Screenshots

- [Before](income/before.png), [desktop light](income/desktop-light.png) and [desktop dark](income/desktop-dark.png), 1920px.
- [Tablet](income/tablet-dark.png), 768px.
- [Phone overview](income/phone-dark.png), [long source](income/phone-source-long.png), [Budget](income/phone-budget-final.png) and [failed save](income/phone-save-failure.png), 320px.

## Acceptance boundaries

The evidence establishes local rendering and controller behaviour. Authenticated production owner-data writes, physical-device software-keyboard behaviour and VoiceOver acceptance are not newly established here. Publication and the Git-triggered deployment are checked separately after the final commit is pushed.
