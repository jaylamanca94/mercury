# Portfolio asset cards — 15 September 2026

## Delivered

Implemented Mercury Figma card `222:3187` using the approved decisions: one shared market period, per-share/unit price movement, and each holding’s allocation against Home’s complete net worth including property equity. Cards open existing details and editing; return/yield/classification badges and quick-action menus were removed from Cards only. Table, property and recurring workflows retain their existing presentation.

Acadia content cards, trend geometry, tokens and responsive control sizing are reused. Product adapters provide the allocation ring and header/footer composition. No vendor, API, schema or persistence changes. The ring arc follows the actual share rather than the Figma sample. Missing or non-positive net worth has no percentage; shares above 100% have an explanation without a ring.

## Verification

- `npm run check`: 258 passing tests. Added coverage for property-inclusive allocation, incomplete/non-positive totals, negative equity, signed/fractional unit-price changes, and missing/loading history.
- Browser checks used an isolated local server with synthetic holdings and daily prices; no owner data, remote provider requests or writes.
- Measured desktop card inset 32px, section gap 24px, ring 64px, chart 160px and tabs 32px. Phone tabs remain 44px.
- Shared range changed every card while allocation stayed stable. Group filters, search, sort and Cards/Table continuity passed. Keyboard card navigation exposed the existing editable shares field without submitting changes.
- One-point, flat, unavailable and retry states passed. Retry kept focus while pending and returned focus to the card after recovery. Missing property reads withheld all shares; negative equity above 100% retained the true percentage with explanatory text.
- Inspected desktop light/dark, 834px tablet, 400px/320px phone and 200% text at 320px. Enlarged text reflows the allocation ring below the identity instead of squeezing words into narrow columns. No horizontal page overflow or browser errors.

## Evidence and boundaries

`checks.json` records browser results. `dark.png` and `light.png` show the full synthetic page; `cards-detail.png`, `tablet.png`, `phone.png`, `phone-cards.png`, `narrow-phone.png` and `large-text.png` show targeted layouts. Figma’s static prices and curves were not copied into production data.

This is local automated and visual verification. Authenticated production rendering and physical-device acceptance were not independently exercised. Git delivery and any public deployment-source verification are reported separately.
