# Income Figma implementation — 14 September 2026

## Scope and source

Figma Mercury section `129:4938`; desktop `202:11644` (1512 × 899), tablet `203:12261` (834 × 1132), phone `203:12765` (400 × 1719). All three design contexts and screenshots were inspected before implementation. Mercury 0.0.8 uses unchanged Acadia 0.3.2.

## Result

Four summary cards; Dividends before Sources; compact annual dividend rows with asset menus; direct source Amount/Frequency fields and annual planned income; Income/Expenses and Month/Year controls. Desktop sections are side by side, tablet/phone sections stack, phone summary and fields stack. Search and sort remain accessible from section controls. Source details/deletion remain in its native menu.

Source changes show an Unsaved annual preview and Save/Cancel. Summaries stay on saved values until persistence returns a record. The write filters by account, source ID and the baseline name/type/amount/frequency, uses a bounded request, rejects missing confirmations, retains failed/conflicting drafts and ignores replies after account changes. Navigation/unload is protected during dirty/pending states. Existing annualisation (52 weekly, 26 fortnightly, 24 twice monthly, 12 monthly) remains unchanged.

## Reference adaptations

- Expected income excludes the separately displayed dividends; exact total expected and planned investing explain the unchanged planned-balance arithmetic.
- Planned expenses replaces Average expenses: the available data is planned category spending, not actual transaction history.
- Annual dividend evidence remains explicitly annual across Month/Year selection. Exact source annual totals remain visible on phone.
- Native controls and 44px targets, planning qualifiers, search and recovery make the content taller than the static reference.
- Product layout adapters supply the requested columns/control order and bounded padding at 200% text. No shared Acadia file, provider, schema or financial-domain calculation was changed.

## Verification

`npm run check`: 217 tests passed, zero failures. Four new controller cases cover draft/saved separation, validation/revert/Cancel, single-flight persistence/failure/retry, original-baseline conflicts and account isolation. Existing planning, property and market-price tests continue to pass.

Local browser fixtures contain synthetic Cadmus $1,100 every two weeks, three dividend assets and $4,300 monthly category spending. Browser checks confirmed the $28,600 annual source total; changing to $1,200 monthly previews $14,400 while the summary stays saved; Save updates recurring income and reconciliation; failures retain entered values and retry succeeds. A simulated concurrent change retains the original draft and offers Cancel to review saved data. No owner records were changed.

Desktop 1512 × 899, tablet 834 × 1132, phone 400px and narrow 320px checked. At 320px/200% text the document scroll width equals its 305px content width (15px browser scrollbar). The initial cramped source header was corrected with wrapping actions and bounded padding. Native fields retain the shared touch minimum.

Search/no-match/Clear search restores focus to the now-visible search disclosure. Source details Cancel returns to the visible action summary. Dividend View asset focuses the asset title; Back returns to the same dividend menu. Income/Expenses routes and category amounts remain functional. Light and dark appearances reviewed.

## Evidence

Screenshots in this folder: desktop.png, desktop-light.png, tablet.png, phone.png, phone-sources.png, phone-large-text.png. Captures use local synthetic data and may show browser scrollbar/viewport crop. Full-page screenshots are bounded by the browser capture height.

## Acceptance boundary

Authenticated owner-data writes, physical devices and VoiceOver were not newly tested. Query scoping, acknowledgement/conflict handling and late-response isolation have controller coverage. Production publication and signed-out access are recorded below once verified.

## Production receipt

Source commit `e6aa50b30df12d0be6915681819dd776966b0279` was pushed to `origin/main` and verified remotely. Git-triggered deployment `mercury-1ywfskf6k-jayson-lamanca-s-projects.vercel.app` is READY; hosted checks passed 217/217 and deployment completed at 2026-09-14T19:03:43Z. Canonical `https://mercury-psi-six.vercel.app/` served byte-identical index.html, brokerage.js, styles.css, acadia.css and income.js, all HTTP 200.

Fresh canonical browser check at `#income`: Your private dashboard sign-in heading is visible and the private Income workspace is hidden. Authenticated owner-data writes were not exercised.
