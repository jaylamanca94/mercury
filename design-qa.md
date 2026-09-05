# Home refinement — design QA

Reviewed 2026-09-04 against the supplied Home screenshot (`image-1.png`). This is a focused hierarchy and responsive refinement, not a pixel-for-pixel recreation.

## Result

- Net worth uses Acadia's display typography and states its investments-plus-property-equity basis. Portfolio performance remains separately labelled beside its range tabs.
- The chart has a bounded plot height within a naturally sized card. Dates and latest snapshot value remain visible; SVG intrinsic sizing cannot expand the card.
- Prior-close movement is immediately distinguishable from selected-period movement. Annual estimates retain their existing data and basis labels.
- Top assets uses quiet counts and consistently aligned values, with supporting details beneath each row on phones. The mobile section title precedes its action.
- Empty holdings hide the otherwise unused list panel.
- Canonical Acadia CSS is unchanged. Narrow Home compositions use its tokens, type, cards, muted panels, tabs, icons, buttons, focus and responsive shell.

## Verification

- `npm run check`: 101 tests passed, including syntax and existing domain/rendering contracts.
- Actual unconfigured Home checked at `http://127.0.0.1:4199/`.
- Populated Home exercised through a temporary isolated review server at port 4200. Test data was supplied only to that browser review, never to application source or a private account.
- No horizontal overflow at 320, 390, 768, 1024, 1440 and 2560 CSS pixels. A long property name truncates inside its row without expanding the page.
- Keyboard: selecting 3M then ArrowRight selects 6M, moves focus, updates the labelled panel and leaves net worth unchanged.
- View portfolio opens the Portfolio workspace; the theme toggle switches both ways with accurate labels. Home investment row opens its Asset details route. Property row opens the existing populated property dialog; Escape closes it without saving.
- Unavailable property equity renders `Not set`. A single snapshot leaves all ranges disabled and shows the truthful chart empty state.
- Desktop dark and light plus mobile dark captures inspected. Final browser review reported no runtime errors.

## Local captures

- `/tmp/mercury-home-desktop-dark.png`
- `/tmp/mercury-home-desktop-light.png`
- `/tmp/mercury-home-mobile-dark-full.png`

These populated captures use isolated review fixtures. They do not establish authenticated production data, provider, migration, deployment or physical-device acceptance. No financial calculations or persistence paths were changed.

final result: passed
