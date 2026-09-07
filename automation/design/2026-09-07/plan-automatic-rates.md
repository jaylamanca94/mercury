# Plan automatic rates — 2026-09-07

The screenshot showed a blocked outlook despite available portfolio yield. Plan previously used only manually saved expected returns. It now weights each positive-value holding’s saved return assumption, falling back to its existing provider historical annualised return. This is an illustrative historical baseline, not a forecast. Dividend yield continues to inherit estimated annual dividends divided by investment value.

Every positive-value holding must have a finite supported return (-100% to 100%). Missing coverage or valuations withhold the outlook rather than becoming zero or renormalising a subset. Zero-value holdings do not affect weighting. Unsupported effective rates for cash distribution policies show a recoverable unavailable state instead of breaking rendering.

Plan settings displays calculated return/yield first, focuses Distribution policy, and puts custom rates behind the Acadia Accordion. Existing overrides remain authoritative; clearing and saving restores automatic calculations. The shared Safari content-height adapter also covers this form. No provider, database, account or financial write contract changes.

## Verification

- `npm run check`: 155 passing tests. Added coverage for weighting, changed weights, mixed historical/saved inputs, explicit zero, negative rates, missing/invalid data and unsupported policy recovery. Updated versioned source contracts.
- Isolated local browser fixture only: no remote account writes. Automatic outlook rendered without either override. Saving 6% changed the outlook and displayed Plan override; clearing it restored the calculated 4.56% baseline and historical source. Saved override reopened expanded.
- Missing historical coverage hid both charts and offered Review Portfolio while retaining the available 2% yield.
- Desktop light/dark inspected. Dialog 560px wide; 768px fixture 560 × 552px, 390px fixture 358 × 623.5px, 320px fixture 288 × 679px. Document and dialog horizontal scroll widths matched client widths. Expanded 320px form capped at 868px in a 900px viewport and scrolled vertically.
- Screenshots in `plan-automatic-rates/` show disposable test data. Browser interactions validate local behaviour, not production authentication or actual account provider coverage.
