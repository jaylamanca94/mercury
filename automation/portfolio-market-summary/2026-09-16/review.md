# Portfolio market-performance correction — 16 September 2026

## Request and definition

The founder corrected the preceding summary choice: the two Portfolio cards must measure the assets' market performance, excluding deposits and withdrawals. This supersedes the same-day recorded-account-value summary; Home is unchanged.

The headline remains current holding value. Both percentage captions and the period dollar change now share one price-only calculation:

- Sum current shares × (last price − first price).
- Divide by sum current shares × first price, plus current USD cash.
- Use first/last shared observed UTC dates within the selected range. Stock and crypto calendars cannot silently contribute different endpoint dates.
- Hold today's quantities constant. Do not reconstruct trades, use account snapshots or claim this is the owner's historical personal return.
- Exclude dividends and property. Cash has zero USD price movement; interest is excluded.
- Preserve fractional unit-price precision until the final aggregate cent rounding.
- Withhold aggregate movement if any necessary quantities or history are missing, unsupported, stale within the range, limited to one observation, or lack two common dates. Never silently exclude a failed holding.

## Implementation

`market-history.js` supplies a pure aggregate helper. Portfolio loads all holdings' authenticated price histories regardless of group, search or Cards/Table; the existing three-request limit, account isolation, deadlines and stale-response protection remain. The summary has explicit loading, unavailable and retry states. A failed holding remains retryable when filtered out or Table is selected. Retry retains keyboard focus and moves it to the recovered figure when the button disappears.

No API, database, snapshot, persistence or Acadia visual changes.

## Verification

- Full `npm run check`: **266 passed, 0 failed**, including syntax.
- Aggregate regressions: weighted baseline, constant quantities, snapshot/deposit independence, differing trading calendars and disjoint dates, empty/one-point/foreign-currency history, missing units/manual totals, fractional prices, flat/negative movement and cash treatment.
- Actual controller regression: all-holding market totals remain independent of snapshots/filter/search/Table; one failed asset withholds both percentages and exposes retry.
- Isolated synthetic browser: period switching, filter/search/Table continuity, failure in a filtered-out holding, Table summary retry and focus recovery, unknown-quantity withholding, dark/light desktop and 320px containment, no browser errors.
- [Browser results](checks.json), [dark desktop](dark-1512.png), [light desktop](light-1512.png), [dark phone](dark-320.png), [light phone](light-320.png).
- `git diff --check`: clean.

Synthetic fixture amounts are not owner records. Commit/push and live served-source verification are reported separately. Authenticated owner writes and physical-device/VoiceOver acceptance were not part of this correction.
