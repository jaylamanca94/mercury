# Plan date of birth — 0.1.1

2026-09-14. Founder correction to the Plan settings screenshot: enter DOB for better accuracy.

Replaced approximate age entry with a native date input, date bounds and a full written-date/current-age confirmation. The private `date_of_birth` field is the new source of truth. Existing approximate ages are not converted into guessed dates. Users with saved age milestones are prompted for DOB; confirmed DOB saves retain the milestones and clear legacy age columns. Revision-aware saves, draft retention and account isolation remain intact.

Age is calculated on actual calendar dates. Monthly points retain valid calendar anchors, including month ends. Retirement and contribution-stop birthdays split the containing month, prorating cash flows and growth across the boundary. For 29 February birthdays the explicit convention is 28 February in non-leap years. Date-only UTC arithmetic avoids DST/time-zone shifts; the projection start uses the user's local current date.

Validation:

- 240 passing automated checks. New cases cover before/on birthday, leap days, month ends, opposite time zones, birthday proration, exact boundary dates, legacy migration, DOB save/reopen, future dates and stale DOB saves.
- Browser: native date entry, confirmed save, derived age, reopening, legacy-age prompt, 320/390/768px and 320px at 200% text. Input targets at least 44px; no dialog/page overflow; full DOB/current-age readback remains visible. No runtime errors observed.
- Authenticated disposable account: exact date persistence, existing milestone preservation, stale-revision rejection, invalid/future/too-old dates, leap-day persistence, clearing after removing milestones. All disposable account/settings records removed and empty state verified.
- Additive migration `20260914221500_plan_date_of_birth` applied and recorded in a transaction. No birth dates backfilled, no ownership/RLS changes, no historical migrations replayed.

This corrects the age/DOB decision in the 0.1.0 Plan receipt. The rest of the financial model and its stated limits are unchanged. Browser fixtures and authenticated API evidence are separate; physical-device/VoiceOver acceptance was not newly performed. Production source parity is checked after the main push.
