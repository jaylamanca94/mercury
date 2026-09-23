# Mercury 0.2.13 — navigation orientation in forced colours

## Finding and change

Started clean main `1ad146f9c8782f9d1bcaf87aafb9a08997531142`, equal to freshly fetched origin/main. Acadia 0.4.8 was published since the last run. Its exact-source CI run `35842008896` succeeded at `1df9f5889b9e826a9bc17f947b37f214f4a93a66`; the GitHub release was published 2026-09-23T09:18:59Z.

On Mercury's actual synthetic Income route, keyboard focus on the desktop Income link had `:focus-visible=true`, outline `none 0px` and shadow `none` under Chromium forced-colour emulation. The selected Month tab had no underline. After adoption the same navigation link has a solid 2px system-colour outline, inset 3px, and selected tabs have an independent underline.

Adopted the complete unchanged released stylesheet, updated the manifest/source pin and cache URLs, and versioned Mercury 0.2.13. Twelve other shared assets are byte-identical to the released source. Mercury has no competing navigation focus override and does not compose Side Navigation, whose upstream box-sizing/wrapping corrections are included but unused. No controller, financial, data, provider, schema, service or cost change. Ten canonical flows remain.

## Verification

- `npm run check`: syntax and all 321 tests passed. Existing vendor integrity and selector checks pass; no new source-mirroring test. `git diff --check` passed.
- `browser.json`: 16 cases (forced/ordinary palettes × light/dark product themes × 1280/768/390px and 320px at 200% text). All 84 sampled navigation targets retain keyboard focus and at least 44px height; all forced-colour targets retain solid 2px outlines. Page widths fit. Selected Income tabs alone carry the forced-colour underline. ArrowRight/ArrowLeft switch Month/Year and move focus correctly in every case.
- `routes.json`: Home market range, Portfolio Cards/Table and Asset market range show the selected underline with a separate focus outline. Portfolio arrow-key view activation preserves selected state. This covers both `aria-selected` tabs and Asset's `is-active`/`aria-pressed` range buttons.
- Profile opens with Enter and closes with Escape, restoring summary focus in ordinary desktop light mode. Desktop forced-colour and 320px/200%-text screenshots were inspected. Narrow tab rails scroll internally as designed.
- A repeated navigation to the identical URL initially retained the old browser document; checking the loaded stylesheet URL identified it. A fresh URL loaded the new cache chain and passed. Stale observations were not treated as candidate results.
- Fixtures use synthetic in-memory data and mock provider/configuration endpoints. No owner records, emails or paid calls were touched. No database/restore check is warranted by stylesheet adoption.

## Limits and delivery

Browser forced-colour emulation is separate from OS high-contrast, Firefox, VoiceOver and physical-device acceptance. Synthetic routes do not prove authenticated persistence. Existing real magic-link redemption, deployed authenticated provider/scheduler and cross-device acceptance remain separate priorities. Paid hosted restore remains deferred under the founder's explicit private-tool decision.

Publication follows the authorised main push and existing Git-triggered Vercel workflow. Exact revision and canonical public-file verification will be recorded after deployment. Previous main `1ad146f` remains the rollback source; no migration is needed.
