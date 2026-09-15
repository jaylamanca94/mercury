# Home Figma portfolio-group implementation

## Result

Implemented Home section [98:5696](https://www.figma.com/design/CSCV8qZu9ryspC07K36vTg/Mercury?node-id=98-5696) as Mercury 0.2.4. Read the design context for desktop `194:1955`, tablet `218:25404` and phone `218:26779`, alongside the supplied reference image. Top assets is replaced by Brokerage, Crypto, Retirement and Property group cards. No canonical flows added: the existing Understand current position flow now enters scoped Portfolio destinations.

## Implementation

- Reuse unchanged Acadia 0.3.2 stylesheet/fonts, Content Card, Menu, Icon with Text, Page Header, Grid, Chart, Tabs and navigation. Existing Font Awesome chart-line, coins and ellipsis glyphs match the reference.
- Four/two/one summary and group columns at desktop/tablet/phone; 24px gaps, 32px card padding, 117px summary and 209px group minimum heights. Cards grow with exceptional text. A 32px headline and 244px/169px chart use existing typography and chart tokens. Tablet navigation is centred; 400px phone content has 24px insets. Enlarged text retains its scale and controls wrap.
- Investment groups share Portfolio classification, including retirement precedence over crypto. Their amounts include all saved members and withhold incomplete valuations. Growth/yield use the existing rounded, historical/provider/manual-yield row estimates. Pending estimates affect only their group. No Plan return override is presented as historical growth.
- Property shows equity, including negative equity, and separately labelled market-value-weighted appreciation. Its source is in the accessible label/tooltip. Failed property loading shows Unavailable and links to Portfolio retry; no stale amount or invented zero appears.
- Card click/Enter/Space and menu links open the matching group or Property. Entry clears stale Portfolio search, preserves sort, and focuses the destination heading/retry. View portfolio selects All. Empty accounts retain Add asset. Unchanged data preserves an open group menu/focused card.

## Source differences with reasons

- Real stored values and actual asset counts replace illustration numbers; four group cards do not mean four assets.
- Net worth includes current property equity; recorded history is investments only. Keep dated endpoints, the investment-scope note and All range. There is no historical property series from which to calculate the illustrated net-worth delta, and no benchmark source for the illustrated S&P 500 series. Neither is fabricated.
- Retain labels Expected annual growth and Annual dividends, rather than implying a guaranteed APY or cash received. Routine source descriptions remain available to assistive technology and in tooltips; missing-data explanations remain visible.
- Acadia's current segmented controls, fonts, semantic colours, 44px targets, working routes and fixed safe-area phone dock remain canonical. Native OS status bars and placeholder tablet routes are not website content. These differences and real history captions make the total page height differ from the static reference.

## Validation

- `npm run check`: 254 tests (syntax, domain, controller/recovery, component integrity and rendering contracts).
- Four new domain tests exercise group conservation/exclusive classification, weighted rounded estimates, partial valuations, isolated pending state, zero/negative equity and unknown appreciation.
- Browser: 1512×1034 desktop, 834×1321 tablet, 400px phone, 320px phone, 1200px small desktop; no horizontal overflow. All group cards measure 209px in populated normal-text states. At 320px with 200% text, controls wrap and remain at least 44px. See `checks.json`.
- Browser interactions: group menu; unchanged background render; Brokerage/Retirement/Property and View portfolio entry; keyboard activation; stale-search clearing; destination focus; daily range and End-key navigation; actual one-point history; incomplete valuation and Property retry; empty groups and Add asset dialog. No browser errors.
- [Desktop](desktop.png), [tablet](tablet.png), [phone](phone.png), [light theme](desktop-light.png), [enlarged text](phone-large-text.png), [incomplete data](phone-incomplete.png).

## Evidence boundary

Browser checks used synthetic local data with remote reads/writes disabled. No private owner data was changed. Authenticated production persistence, real provider responses, physical-device/VoiceOver acceptance and deployed-page rendering are not newly verified by this presentation task. No migrations, secrets, vendor refresh or API changes are required. The ordinary Git-triggered deployment follows the authorised push to main.
