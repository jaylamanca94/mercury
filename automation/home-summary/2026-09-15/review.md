# Home summary text refinement — 2026-09-15

Implemented the founder's two screenshot references: Home currency values use Acadia Text Red/Green. The four percentage captions use Acadia Text Medium, 16px regular (400) against 20px bold currency, with no parentheses or positive plus sign. Negative captions retain their minus sign. Currency formatting, calculations and missing-data handling are preserved.

The pinned vendor stylesheet predates Acadia's Text aliases. Home-scoped fallbacks match source revision `55026a0` (dark red-50/green-40/cool-gray-40; light red-60/green-50/cool-gray-70), with native aliases preferred when available. Shared vendor files and other routes are unchanged.

Validation: `npm run check` passes all 254 tests. Existing controller expectations now assert plain signed percentage captions. Browser computed-style checks confirm colours, 20px/16px hierarchy and 400-weight captions in both themes. 834px, 400px, 320px and 320px/200% text show no horizontal overflow; no browser errors. `checks.json` contains the rendered values. [Dark](dark.png), [light](light.png), [phone](phone.png).

Browser evidence uses synthetic local values and does not establish deployed signed-in acceptance. No owner data was changed.
