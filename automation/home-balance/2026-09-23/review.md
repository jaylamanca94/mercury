# Home balance simplification — 0.2.16

The founder supplied a private Vanguard screenshot and requested a single realistic balance/history experience. Mercury now shows exact investment value, matching dollar/percentage value change, one balance graph, and YTD / 1Y / All. The former Market / Recorded choice and four summary cards are removed. Net worth, property equity, day/lifetime changes and annual illustrations remain in Values and calculations. Existing group destinations remain.

## Value integrity

- Every historical point is an observed saved investment snapshot. Today's endpoint uses the same complete investment valuation as the headline, replacing a same-day snapshot only in the read model. No saved data is changed.
- No historical balances are reconstructed from today's share counts. No missing history is backfilled. Straight segments connect dated observations.
- YTD uses an observed prior December 31 baseline; 1Y uses the calendar-year boundary with leap-day handling. Without that observation, the first in-range date becomes the explicit “since” label. All uses the first saved value.
- A single point shows no claimed change. A zero baseline has no percent. Missing investment valuations hide affected figures and graph; missing property values do not suppress complete investments.
- Changes include cash flows and holding edits, so the UI says value change rather than investment return. Prices remain saved prices, with genuine available quote dates shown in New York time. This release does not add live quote refresh or a cash-flow ledger.
- Home no longer requests reconstructed historical price baskets. Portfolio retains its existing price-change charts and guarded shared request/cache behaviour. A one-year handoff retains the period and explains the different measure.

## Validation

- `npm run check`: syntax and **326 tests passed**. Removed obsolete Home-market/four-summary UI assertions; retained core financial model coverage and replaced affected controller scenarios with the new balance contract.
- New cases cover the $1,000,000 → $990,000 (-1%) example, a subsequent value increase, all three boundaries, partial records, duplicate dates, future records, same-day current replacement without persistence, sparse elapsed-date spacing, zero/missing values, leap day, first point, exact million-scale display, property exclusion and late Portfolio responses after navigation/account replacement.
- Isolated synthetic browser: YTD -$6,500/-4.33%, 1Y +$13,500/+10.38%, All +$53,500/+59.44%, with the same $143,500 headline/current endpoint throughout. Arrow/End keyboard control updates selection and preserves focus. Complete and partial interval captions verified.
- Local responsive checks: desktop 1440px, tablet 768px, phone 390px, and 320px at 200% root text. Light/dark appearance, disclosure access, first-record state, missing valuation and Portfolio handoff inspected. Enlarged-text focus checks inspect parent bounds and horizontal scroll as well as page width.
- Local browser console: no errors observed. Synthetic fixtures only; no personal values from the supplied screenshot copied into code, tests or screenshots.
- Unchanged Acadia 0.4.10 vendor assets. No schema, migration, provider, persistent write or new flow. The registry remains at ten flows.

Authenticated production owner-data acceptance and physical-device/VoiceOver checks are separate from this local synthetic browser evidence. Delivery uses the existing Git-triggered Vercel workflow; the final response reports its verified status.
