# Plan refinement — 6 September 2026

The supplied Plan screenshot showed two large empty chart panels repeating the same setup message, followed by repeated inputs and several identical Edit actions. The revised page makes the missing input clear, brings assumptions into reach and groups the available future values with their charts.

## Delivered composition

- A compact Acadia header retains Base plan, its illustrative nature and one primary Edit assumptions action. Current investments and annual recurring investments form a quiet two-input summary.
- One Acadia Status Row identifies missing return, missing yield, both missing, loading metrics or unavailable Plan settings. The Outlook section is hidden until it can be calculated; empty charts no longer consume space.
- Complete valuation coverage is required. If any holding loses its price/value, Plan clears both stale charts and withholds the current investment aggregate and future values. Review Portfolio leads to the existing asset-price repair flow. Known assumptions and recurring investments remain visible.
- The available Outlook places Portfolio outlook and Projected portfolio income side by side from tablet upward and stacks them on phones. Each Content Card leads with its future amount, horizon and compact chart, followed by the current amount. Annual distributions remain explicitly labelled. The shared 5Y/10Y/20Y pressed-button group updates both results; the chart axis shows the actual start and end years.
- Assumptions show return, dividend yield and distribution policy once, with Plan override/From Portfolio captions and one contextual Edit action. The existing dialog opens at Expected annual return and returns focus to its invoking action after Save/Cancel.
- Property equity is compact supporting context, clearly excluded from both projections, with Manage in Portfolio retained.

Composition uses existing Acadia Read Only, Card Metric Value, Title, Grid, Content Card, Card Trend, range endpoints, Status Row, controls and form/dialog patterns. The canonical stylesheet and font assets are unchanged. Obsolete local Plan layout and typography rules were removed; no new local CSS was introduced. Financial domain calculations, provider behaviour, schema and persistence paths are unchanged.

## Verification

Browser verification used current application code with a disposable in-memory adapter and visibly labelled test data. No owner records or remote writes were used. The supplied screenshot guided the same-state review; the local before/after setup screenshots use the same fixture at a requested 1920px width. Scrollbars may reserve 15px.

| Requested width | Outlook columns | Horizontal overflow |
| --- | --- | --- |
| 2560 | 2 | 0px |
| 1920 | 2 | 0px |
| 1440 | 2 | 0px |
| 1024 | 2 | 0px |
| 768 | 2 | 0px |
| 390 | 1 | 0px |
| 320 | 1 | 0px |

Light and dark appearance were inspected. At 320px, chart axis endpoints stay aligned, both cards and the assumption/property sections are reachable, and the assumption dialog has no horizontal overflow. Phone horizon controls measure 44px high. The existing Acadia pointer-responsive treatment remains in use for larger-screen controls.

Checked interactions and states:

1. **Complete missing assumptions:** saving a 5% return into the missing-return fixture reveals both outlooks. With $473,500 current investments, the fixture shows approximately $803k investments and $16k annual portfolio income at ten years. Focus returns to Edit assumptions.
2. **Horizon changes:** 5Y shows approximately $618k/$12k and 20Y approximately $1.3m/$27k. Both captions and accessible chart descriptions change with the selected, exclusively pressed button. Keyboard activation works. Concise chart summaries retain polite announcements without making the entire workspace a live region.
3. **Override and policy behaviour:** clearing the yield field and saving retains the derived 2% yield with From Portfolio. Saving Hold cash updates the policy and the ten-year investment outlook to approximately $665k. The underlying calculation rules are unchanged.
4. **Valuation recovery:** with one unvalued holding, the current aggregate reads Not set and the outlook is hidden. Review Portfolio → MISSING → save its $50 manual price → Plan restores $474k current investments and both charts. A controller regression separately covers ready → incomplete → repaired, including stale SVG/value clearing.
5. **Failure and dismissal:** a forced save failure retains the edited 6% return and an inline error. Cancel opens the discard guard; Keep editing retains the draft, while explicit discard returns safely. Both primary and contextual Edit entry focus the return field; cancellation restores the matching invoking control.
6. **Loading, unavailable and empty:** loading metrics have a specific status. Unavailable settings disable editing with plain recovery copy. Missing both assumptions shows one combined message. An empty portfolio with saved assumptions displays zero current and future amounts, without invalid chart coordinates.

`npm run check`: 131 tests pass, including existing projection arithmetic, planning settings and protected-dialog recovery. `git diff --check` passes. No browser warnings or errors were recorded in the final verification session.

## Screenshots

- [Before setup](plan/before-missing.png) and [refined setup](plan/missing-desktop.png), 1920px.
- [Desktop dark](plan/desktop-dark.png) and [desktop light](plan/desktop-light.png), 1920px.
- [Tablet](plan/tablet-dark.png), 768px.
- [Phone outlook](plan/phone-dark.png), [missing assumptions](plan/phone-missing.png), [assumptions](plan/phone-assumptions.png), [editing](plan/phone-edit.png) and [failed save](plan/phone-save-failure.png), 320px.

## Acceptance boundaries

This establishes local rendering and controller behaviour. Authenticated production owner-data writes, physical-device software-keyboard behaviour and VoiceOver acceptance are not newly established here. Publication and the existing Git-triggered deployment are verified separately after the final commit is pushed.
