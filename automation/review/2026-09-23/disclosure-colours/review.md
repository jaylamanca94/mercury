# Disclosure focus review — 2026-09-23

## Finding and decision

**P2: Portfolio filter and sort disclosures lose their keyboard focus indicator in forced colours.** Mercury remains at 0.2.13 with Acadia 0.4.8. Do not adopt Acadia 0.4.9 solely for this issue: its generic disclosure correction is overridden by the more specific Page Header sort-trigger focus rule.

On the actual synthetic Portfolio route, `#portfolio-group-picker > summary` matches `:focus-visible` but computes `outline: none 0px` and `box-shadow: none`. The same condition affects the tablet period picker and recurring sort. The existing `.acadia-page-header-pattern-sort-trigger:focus-visible` rule sets `outline: 0`; its class and pseudo-class specificity exceeds the new `details > summary:focus-visible` rule. Forced colours suppress the remaining shadow.

A local 0.4.9 adoption candidate reproduced the same failed focus state (`rejected-049.json`). All candidate runtime, version, cache, provenance, test-pin and release-document changes were removed. No new product version or runtime change is justified by this rejected adoption. Acadia's released source was verified as `7d823c5b9e0ed96ec8b6a4c6b6163ac3856ef589`, annotated tag v0.4.9 (published 10:15:15 UTC), with successful Actions run 35847562576.

## Evidence

- `current-048.json`: 12 synthetic route/viewport cases, 67 focused disclosure observations across Portfolio, Income and Plan at 1280, 768, 390 and 320px. The 320px case uses 200% root text. Seven observations lack an indicator: Portfolio Filter investments at desktop/tablet, Portfolio period at tablet, and Sort recurring investments at all four widths.
- Remaining visible tested summaries retain an indicator. Hidden disclosures are excluded. No document horizontal overflow was measured in these cases.
- These are Chromium forced-colour computed-style and actual DOM-focus checks using isolated in-memory financial fixtures. They are not OS contrast-theme, Firefox, VoiceOver, physical-device or authenticated persistence acceptance.
- The browser CLI screenshot command stalled after 25 seconds. The computed-style matrix completed after removing that capture step. A separate disposable headless Chromium capture subsequently succeeded; `filter-forced-before.png` was visually inspected and confirms the missing focus ring. Stalled task-owned browser sessions were closed.
- Desktop Filter investments intentionally has the existing 32px fine-pointer compact target. The initial candidate script's blanket 44px assertion was invalid for that target; the missing focus outline is independently reproduced. No touch-target regression is asserted.
- `npm run check` passed syntax and all 321 tests on the rejected stylesheet candidate. Its passing source tests did not establish browser acceptance; no financial, controller, database, recovery, provider or dependency change was made.

## Shared correction and next acceptance

The demonstrated reusable need was routed to the already-active **Acadia** task `01a0cdee-0a9a-78c0-a1f2-1d5465a61250` under the automation's existing authority. The request asks for a focused correction of the Page Header filter/sort focus selectors, canonical browser checks and normal shared release delivery; it explicitly leaves Mercury adoption to this task. Routing is not release evidence.

Acadia independently confirmed the defect on its canonical Page Header and is preparing 0.4.10. Its proposed source was exercised through disposable browser request routing, without changing Mercury files or its pin. Chromium passed 16 theme/palette/viewport cases and 84 focused summaries. A disposable Firefox contrast preference passed eight cases and 42 summaries. Native Enter/Space toggles, group/period/recurring-sort keyboard choices, focus return and no-overflow checks passed in both engines. Desktop and 320px/200%-text screenshots were inspected. Focus transitions must settle before measuring final styles. Evidence is under `preview-chromium/`, `preview-firefox/` and `preview-source.json`; these are unpublished candidate results, not delivered-product acceptance.

After a corrected Acadia release exists, review its full CSS diff and adopt unchanged assets only if actual Mercury filters and sort controls retain focus in forced colours. Recheck native Enter/Space toggles, chosen group/period/sort behaviour, ordinary themes, responsive layouts and enlarged text before publishing. Preserve the released 0.2.13 runtime until that verification passes.

Existing real magic-link redemption, authenticated deployed provider/scheduler, cross-device persistence and physical accessibility remain separate acceptance priorities. Paid hosted restoration remains explicitly deferred. No owner data, emails, paid calls or new resources were used.
