# Design QA — Portfolio Figma section 110:10301

Portfolio now composes the two all-investment summary cards, compact responsive controls and three/two/one investment grid, followed by full-width Recurring and Property. The founder-selected recorded value change includes deposits/withdrawals; individual card movements remain per unit and allocation rings remain complete-net-worth shares with integer labels. 262 checks and isolated 1512/834/400/320px light/dark, enlarged-text, menu/focus and editing-navigation checks pass. Full evidence, reference mapping and acceptance boundaries: `automation/portfolio-full/2026-09-16/review.md`.

# Design QA — Home Figma section 98:5696

Home 0.2.4 follows the desktop/tablet/phone group-card reference using unchanged Acadia components and bounded composition adapters. Four portfolio groups replace Top assets; classification, source-backed rates, missing values, menu/keyboard navigation and focused Portfolio entry are verified locally. Desktop/tablet/phone, 320px and 200% text checks show no horizontal overflow. Existing real-history scope, dated endpoints and accurate estimate labels are preserved.

Evidence and differences from the static reference: [Home review](automation/home-groups/2026-09-14/review.md). The browser uses synthetic local data; deployed owner-data and physical-device acceptance remain separate.

---

# Design QA — Income Figma section 129:4938

Result: **passed** for the implemented Income composition and bounded local flow coverage.

Inspected all three source frames: desktop 202:11644, tablet 203:12261 and phone 203:12765. Four separate summary cards, Dividends before Sources, editable amount/frequency, annual planned income and responsive stacking now follow the reference. Existing Acadia components, glyphs and tokens are reused.

Intentional differences: actual saved arithmetic replaces illustrative balances; Planned expenses accurately names category limits; an exact total/investing reconciliation and annual dividend label remain visible; source annual totals remain available on phone; search/recovery, explicit dirty Save/Cancel and 44px actions remain operable. These increase the content height. Small product layout adapters provide intrinsic columns, phone ordering and enlarged-text padding; the shared Acadia files are unchanged.

217 automated checks pass. Local browser coverage includes desktop/tablet/400px and 320px phone, 200% text, light/dark, amount/cadence preview, confirmed Save, Cancel, failed-save retry, conflicting-record review, unsaved navigation, search recovery, Expenses continuity, source-dialog focus and dividend asset Back focus.

Evidence and publication receipt: [review.md](automation/income-figma/2026-09-14/review.md). Synthetic local data does not establish authenticated owner-data persistence or physical-device/VoiceOver acceptance.
