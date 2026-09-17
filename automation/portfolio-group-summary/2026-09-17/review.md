# Portfolio group summary — 2026-09-17

The current-value and market-change cards now follow the same selected group as the asset cards/table. Current value uses the existing compact formatter, with exact value on hover. The label names the selected group; All investments remains the unfiltered label. Both percentage captions use the selected basket's market movement.

The existing market calculation is unchanged: current quantities held constant, first/last shared observed dates within the period, no account snapshots or cash flows. Cache/history fetching still spans all holdings; loading and failure aggregation now uses selected rows only. Allocation rings retain their complete net-worth denominator.

Validation: all 268 existing checks pass, with expanded regression coverage for compact $36k, group value despite unrelated missing valuations, Cards/Table, range changes, cached histories, unrelated pending/failed histories, selected failures, empty group and return to All. No new persistence or API contract.

Local synthetic browser checks at 1512px and 400px confirmed desktop Retirement selection, 1Y figures, Cards/Table continuity and phone Crypto selection. No horizontal phone overflow or browser errors. Screenshots use synthetic holdings. Existing editing and authenticated owner persistence were not changed or newly exercised. Production delivery is verified separately after push.
