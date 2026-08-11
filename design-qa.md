**Comparison Target**

- Source visual truth: [Mercury Figma Home, node 47:379](https://www.figma.com/design/CSCV8qZu9ryspC07K36vTg/Mercury?node-id=47-379&m=dev).
- Implementation evidence: `/tmp/mercury-figma-home-47-379.png`.
- State: light theme, Global, Week, source-backed public snapshot.
- Viewport: 1024 × 662 CSS pixels. The Figma frame and implementation capture use the same desktop viewport; no density normalization was required.

**Findings**

- No actionable P0/P1/P2 differences remain for the requested Home frame.
- Intentional data difference: Figma supplies illustrative card values and a static chart image. Mercury keeps the exact layout treatment but renders the live comparison chart and current source-backed values.

**Fidelity Review**

- Fonts and typography: preserved the project’s existing system-font adapter while matching the compact hierarchy, weight, and uppercase-style ticker treatment in the Figma frame.
- Spacing and layout rhythm: matched the Figma sequence of controls, wide chart, four compact market cards, and four compact economic signals. The 1024px layout holds four cards per row; it only collapses below 900px.
- Colours and visual tokens: mapped Figma’s neutral grey gradient, white elevated surfaces, charcoal active pills, teal underline, green positive values, and red negative values to Mercury’s existing Acadia tokens.
- Image and asset fidelity: the Figma chart is a screenshot reference. It is implemented as Mercury’s existing live SVG comparison chart so it remains accurate for the selected period rather than becoming a stale image. Existing Font Awesome glyphs visibly match the supplied Figma icon roles.
- Copy and content: Home now follows Figma’s VOO, VB, VXUS, VGT primary row plus Bonds, Interest Rates, Inflation, and Unemployment signal row. The new International control shows VXUS, VGK, VPL, and EWJ.

**Validation Performed**

- Browser capture at 1024 × 662 confirmed four chart lines, four primary cards, four economic signal cards, and three scope controls.
- Browser interaction confirmed International selects correctly and updates the cards to VXUS, VGK, VPL, and EWJ.
- Browser console contained no errors or framework overlay.
- Responsive browser checks at 1728, 1440, 1280, 834, 744, and 390 CSS pixels confirmed the appropriate desktop, tablet, and phone compositions without horizontal page overflow.
- A disposable unavailable-data response confirmed that Home keeps the failure explanation, direct Retry refresh, and Data Coverage link immediately beneath the chart, before unavailable cards; the selected scope and period remain preserved and disabled until a usable response arrives.
- `npm run check` passed: JavaScript syntax validation and 87 regression tests.

**Comparison History**

1. The initial 1024px capture used two card columns, diverging from Figma’s four-card rows.
2. Moved the compact-grid breakpoint from 1100px to 900px.
3. The final capture preserves both four-card rows at the Figma reference width.

**Implementation Checklist**

1. Map the Figma Home hierarchy onto existing live Mercury surfaces. Complete.
2. Add the compact economic signal row and International scope behaviour. Complete.
3. Verify desktop fidelity and scope interaction in a browser. Complete.

**Follow-up Polish**

- The Figma healthy-state frame remains matched. The only additional Home refinement is failure-state hierarchy: recovery now appears beside the unavailable chart rather than after eight unavailable cards.

final result: passed
