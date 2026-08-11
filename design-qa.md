**Comparison Target**

- Source visual truth: `/var/folders/bw/21lzcjwj7rlfsqtjbtn56vbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_RfWeUm/Screenshot 2026-08-11 at 7.33.01 PM.png` — the Markets hero graph.
- Implementation evidence: `/tmp/mercury-home-graph-qa.png` — the repaired Home graph.
- State: light theme, Global, Week, source-backed public snapshot.
- Viewport: 2048 × 1152 CSS pixels. The source was 5120 × 2880 pixels (2.5× density) and normalized to 2048 × 1152 for comparison; the implementation capture was 2048 × 1152 at 1×.

**Findings**

- No actionable P0/P1/P2 differences remain within the requested Home graph region.
- Intentional scope difference: Home retains its focused navigation, segmented controls, and four summary cards. Only the market graph treatment is shared with Markets.

**Fidelity Review**

- Fonts and typography: the Home legend reuses the exact Markets graph legend, including ticker emphasis, supporting labels, weight, and compact scale.
- Spacing and layout rhythm: the Home chart preserves the Markets chart’s plot, baseline, line spacing, and legend alignment while scaling only the containing Home stage.
- Colours and visual tokens: both use the same VOO, VXUS, VB, and VGT line colours; solid and dashed series conventions are unchanged.
- Image and asset fidelity: no raster or custom-drawn assets are used in the graph; the existing semantic SVG data visualization is reused directly.
- Copy and content: the same four ticker labels and descriptions appear, with live Yahoo Finance histories providing the plotted values.

**Validation Performed**

- Browser-rendered Home capture verified four visible lines and the VOO, VXUS, VB, and VGT legend entries.
- Browser check found no error overlay or console errors.
- Week and Global controls remained visible and the live source-backed snapshot rendered the current chart.
- `npm run check` passed: JavaScript syntax validation and 86 regression tests.

**Comparison History**

1. The first Home implementation rendered a separate chart treatment. The supplied Markets screenshot identified the visual mismatch.
2. Home now calls the existing `renderHeroComparisonChart()` component, removing the duplicate renderer and its divergent styles.
3. The post-fix browser capture shows the requested Markets graph treatment on Home with all four series.

**Implementation Checklist**

1. Reuse the Markets multi-series comparison renderer on Home. Complete.
2. Preserve an explicit loading/unavailable state when market histories are absent. Complete.
3. Verify the source-backed Home state in a browser. Complete.

**Follow-up Polish**

- None for this scoped graph change.

final result: passed
