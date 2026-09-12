# Home refinement — 12 September 2026

## Delivered

- Net worth and history range share one adaptive Acadia header. The Portfolio history label remains directly above the graph; all-time/day changes stay in the summary below it.
- Overview cards use the supported Acadia dense padding token. Curved history, 10rem graph height, 44px range targets and all financial semantics remain unchanged.
- Top assets reuses Portfolio’s compact Field/Object Card Header composition. Neutral prominent values replace coloured captions; one secondary line carries classification and shares or property valuation. Exact values remain available in accessible names and tooltips.
- Home asset links focus the detail heading on entry. Back restores the originating card, or Add asset if the card is no longer ranked. Property keeps its existing editor and first-field focus.

## Validation

`npm run check`: 180 passing tests, including a new Home focus-return regression with reranking fallback. No custom stylesheet or vendor changes.

In-app browser, isolated synthetic account with remote writes disabled:

- Widths 2560, 1920, 1440, 1024, 834, 768, 390 and 320px: no document overflow; all range tabs at least 44px in both dimensions.
- Desktop light/dark and desktop/tablet/phone visual review. Screenshots: `home-refinement-desktop.png`, `home-refinement-tablet.png`, `home-refinement-phone.png`.
- 390px enlarged text and long property name: cards contained.
- Empty history, first recorded point, incomplete valuations and empty portfolio: applicable amounts withheld; no overflow.
- Keyboard Home key selects 3M without changing all-time/day values. Enter opens an investment and focuses its heading; Back restores the exact originating link. Space opens property editing with first-field focus.
- No browser console errors observed.

These are isolated local browser checks, not authenticated owner-account writes or physical-device/VoiceOver acceptance. Publication uses the authorised Git-triggered workflow; live asset matching is verified separately.
