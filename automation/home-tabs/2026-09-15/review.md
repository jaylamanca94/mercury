# Home history tabs — 15 September 2026

The founder’s Acadia/Mercury comparison showed that Home’s history range tabs were too tall. Removed the Home-only inline override that forced Acadia’s 44px touch height on desktop. The unchanged shared component now supplies 32px desktop tabs, a 4px rail inset and a 42px total rail height; phone/coarse-pointer rules retain 44px tabs and a 54px rail.

Reuse classification: unchanged shared component adoption. No Acadia source or other route was changed. Updated the Home design contract to prevent reintroducing the override.

Validation used isolated synthetic data, not the owner’s portfolio. Desktop (1512px), tablet (834px), phone (400px) and narrow phone (320px) measurements passed without horizontal overflow. Home, ArrowRight and End selected the expected range. Light and dark screenshots were inspected; no browser errors occurred. All 254 existing checks passed with `npm run check`.

Evidence: `checks.json`, `dark.png`, `light.png`, `phone.png`. This is local browser verification; production rendering and physical-device acceptance were not independently checked.
