# Mercury Acadia alignment — 2026-09-10

## Baseline and scope

Reviewed Mercury's active private Home, Portfolio, Income/Overview, Income/Budget,
Plan and Asset routes, authentication, account menus and nine form dialogs against
published Acadia `d5408dd1df1840ff91727079f7270d6f9fd754ea`. The upstream main ref
was checked over the network. Acadia's unfinished local CSS/React edits were not
imported. Financial calculations, provider calls, schemas and real account data
were outside this presentation migration.

References: Acadia `OPERATING_MODEL.md`, `FOUNDATIONS.md`, `ADOPTION.md`,
`CHANGELOG.md`, canonical CSS, and Component/Pattern contracts for Form controls,
Menu, Table, Form workflow and Search and results. Existing Mercury product,
design and flow contracts constrained the composition. The old public economy
pages and `app.js` remain documented legacy material, outside the active private
product; this audit does not revive that retired product.

## Findings and changes

| Priority | Finding | Resolution |
| --- | --- | --- |
| P1 | The vendored stylesheet was stale and included Acadia-prefixed extensions absent from current published source. | Replaced it with the entire unchanged published stylesheet; migrated missing Read Only, dashboard header, preview-card, currency-affix and compact-dialog consumers to supported Field, Grid, Title/Lead, Content Card, Cluster and Form Modal compositions. |
| P1 | Tablet navigation and menu controls missed current target/wrapping improvements. | Adopted upstream 44px tablet links/menu actions, neutral navigation states, current label wrapping and responsive header behaviour. |
| P2 | A separately extracted Table stylesheet duplicated the canonical section; Budget still implemented its own responsive table CSS. | Removed the duplicate stylesheet and custom Budget presentation. Both Portfolio and Budget now use Table Responsive with labelled Object Cards in narrow containers. Budget's category rows, search and allocation denominator are unchanged. |
| P2 | Dialog invokers did not consistently expose relationships or close their source menus; native disclosures lacked Escape/outside dismissal. | Added trigger controls/haspopup/expanded state and delegated native disclosure behaviour. Return focus resolves the visible matching record after rendering or a Table/Card transition. Invoker capture supports pointer behaviour that does not focus buttons. |
| P2 | Sort disclosures advertised application-menu semantics without matching arrow-key behaviour. | Kept native disclosure/Tab behaviour with ordinary pressed buttons in labelled groups. |
| P2 | Appearance controls were confined to the desktop header. | Composed the existing Acadia Select in each account menu for System/Light/Dark, retaining Mercury's system default and theme metadata. Fixed current-choice recovery when storage reads work but writes fail. |
| P3 | Unused Mercury typography, allocation, metric and toolbar rules accumulated beside the active product. | Removed obsolete local rules and unsupported compact modifiers; documented the current snapshot and composition ownership. |
| P3 | Vendored provenance and unsupported selectors could silently drift. | Added `acadia-vendor.json`, exact asset-hash checks and active-template selector validation. Supporting fonts and accordion/auth SVGs match the same revision. |

## Reuse and exceptions

- Reuse: published styles, semantic tokens, type roles, fonts, buttons, native
  controls, navigation, menus, tables, cards, feedback, disclosures and dialogs.
- Compose: Home/Portfolio financial hierarchy, Budget Table/Object Cards, static
  Field + Grid label/value groups and the appearance select in account menus.
- Adapter: Mercury's product mark, financial semantics, theme default/metadata,
  documented density tokens and existing provider/storage behaviour.
- Local exception: the Asset editor's sticky actions clear the persistent phone
  dock. Acadia still owns the action-bar appearance and controls.
- Upstream correction candidate: Acadia's direct modal form adds focus-ring
  padding to an expanded content-box width, producing horizontal scroll. The
  narrow `box-sizing: border-box` rule lives in `styles.css`; remove it when
  upstream includes that padding in its width calculation. Do not patch the
  vendored stylesheet or restore the obsolete Safari translation workaround.

## Validation

- `npm run check`: 177 tests pass, including syntax, financial/recovery coverage,
  the new asset-integrity/selector checks and blocked-write theme recovery.
- Six active routes at 320, 390, 767, 768, 834, 1199, 1200 and 1440px: no document
  overflow; the expected navigation is active, and tablet links measure 44px.
- The same six routes at 200% text (32px root) at 320 and 834px also pass
  document and primary-control containment: 60 route/size combinations overall.
- Five entry/edit form families at 320, 390, 834 and 1440px plus 200% text at 320
  and 834px: 30 modal checks pass for viewport containment and no horizontal
  form/dialog scroll. Native vertical scrolling contains tall forms.
- Budget synthetic save, matching visible-action return after save and viewport
  change, property Menu → Modal → Escape → summary, menu Escape, and phone
  System/Light/Dark selection pass. No browser exceptions were reported.
- Light Home and Budget cards were visually inspected; dark Home and Add asset
  were also inspected. Full-size and narrow forms use current canonical padding.
- Header/Grid compositions replace auto-fit showcase grids whose fixed minimums
  clipped enlarged text. Long monetary headings use Acadia's wrapping title
  class; the performance tab rail remains horizontally scrollable.
- Runner note: the headless browser hid its page after a viewport change and
  delayed native close events. Activating the tab and using a fresh visible
  browser produced passing focus results; a stalled runner was restarted.

The browser uses an isolated in-memory account with synthetic holdings, sources,
categories and property; none of these interactions write to a real account.

## Acceptance boundaries

This pass verifies implementation and local browser behaviour. It does not newly
accept real magic-link redemption, cross-device financial persistence, provider
availability, VoiceOver, physical-device keyboards or native Safari. Previously
recorded financial/runtime gates remain in `FLOW-REGISTRY.md` and `DESIGN-STATUS.md`.
No financial feature, provider integration or database change was introduced.
