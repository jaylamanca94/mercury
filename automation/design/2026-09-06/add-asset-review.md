# Add Asset refinement — 6 September 2026

The supplied screenshot showed a very tall dialog with large empty gaps. Current main already used Acadia's compact form modifier, reducing that layout to roughly 509px high at desktop. This pass refines the interaction further: the initial form is 428px high, with Symbol/Shares first and optional inputs kept out of the primary path.

## Delivered composition

- Symbol and Shares remain the first inputs, with one short example and an empty numeric placeholder. Symbol entry retains automatic lookup, native search clearing, keyboard focus and mobile character capitalisation.
- Empty Price/Value placeholders are hidden. Available previews use explicit Price per share and Asset value labels, exact cents and a visible quote source/date. Lookup progress remains a short live status.
- Manual-price/total-value recovery sits immediately after the core inputs. The select uses Value using, Price per share and Total asset value. Manual currency fields reuse Acadia affixes. Total-value mode hides the irrelevant Shares field and price preview.
- Changing the symbol clears the previous manual amounts and returns to price-based valuation. Previously, a hidden total-value selection could remain active for the next symbol. Regression coverage now checks this reset and stale preview clearing.
- Recurring (optional) uses Acadia's native Accordion summary and padded panel. Amount/Frequency remain the same persisted contribution plan. Retirement stays directly available below it. Every new entry resets the disclosure and draft.
- Existing native dialog scrolling, 44px fields/actions, Add/Cancel, guarded dismissal, retained failed drafts, pending-write lock and focus restoration remain intact.

Only existing Acadia form/dialog, Accordion, Read Only, currency-affix, choice and control classes are used. No CSS, canonical stylesheet, fonts, provider contracts, schema, persistence paths or financial-domain calculations changed.

## Verification

Browser evidence uses current application code with a disposable in-memory adapter and explicit isolated test data. No owner records or remote writes were used. Quote success, failure and latency were controlled in that adapter; they establish controller behaviour, not live-provider availability. The supplied screenshot guided the review; the local before/after screenshots compare the same fixture at 1920px.

| Requested width | Dialog width | Initial height | Input columns | Horizontal overflow |
| --- | --- | --- | --- | --- |
| 2560 | 560px | 428px | 2 | 0px |
| 1920 | 560px | 428px | 2 | 0px |
| 1440 | 560px | 428px | 2 | 0px |
| 1024 | 560px | 428px | 2 | 0px |
| 768 | 560px | 428px | 2 | 0px |
| 390 | 358px | 498px | 1 | 0px |
| 320 | 288px | 498px | 1 | 0px |

All measured visible inputs, selects, buttons and disclosures meet the 44px target. Both appearances were inspected. At 320×844, a populated quote remains contained; expanded recurring and manual recovery states use native dialog scrolling with reachable actions. Canonical Accordion panel padding was visually checked at tablet and phone widths. The browser can reserve 15px for its scrollbar.

Verified interactions:

1. **Automatic quote:** entered Symbol/Shares produce Looking up price, followed by the labelled isolated quote source/date, $123.45 per share and $308.63 for 2.5 shares.
2. **Failure and retry:** a forced write failure retains TEST/2.5 and an inline error. Retrying Add succeeds and opens the saved asset with its title focused. Existing controller tests retain same-dialog identity after partial quote persistence.
3. **Manual price:** $100.23 × 2.5 previews $250.58. Saving with a $25 monthly recurring amount and Retirement preserves all four inputs in Asset detail.
4. **Total value:** $12,500.50 hides Shares and the irrelevant price preview. Changing symbols clears that value, hides the stale preview and restores price-based entry. Entering a fresh total then saving preserves the authoritative total and leaves detail Shares disabled.
5. **Pending write:** during a controlled six-second save, inputs, selects and dismissal controls are disabled and Add reads Adding. Completion opens the saved SLOW asset with its title focused.
6. **Dismissal and entry:** Escape from Shares opens the unsaved guard; Keep editing retains the symbol and returns focus. Explicit discard returns to Portfolio Add asset. Home uses the same form and returns to its own Add asset action on cancellation. Native Escape in a populated search field first clears that field. New entries reset Symbol, preview, recurring disclosure and Retirement.
7. **Disclosure:** Enter expands Recurring; Amount/Frequency remain editable and contained. Long forms scroll inside the dialog without horizontal overflow.

`npm run check`: 132 passing tests, including the new exact-preview/manual-mode reset regression and existing quote, validation, duplicate-submit and persistence-recovery tests. `git diff --check` passes. No browser warnings or errors were recorded in the final session.

## Screenshots

- [Before](add-asset/before.png), [desktop entry](add-asset/desktop-empty.png), [desktop light](add-asset/desktop-light.png) and [quote preview](add-asset/desktop-quote.png), 1920px.
- [Tablet recurring](add-asset/tablet-recurring.png), 768px.
- [Phone entry](add-asset/phone-empty.png), [quote](add-asset/phone-quote.png), [recurring](add-asset/phone-recurring.png) and [manual recovery](add-asset/phone-recovery.png), 320px.

## Acceptance boundaries

Local rendering and controller behaviour are verified. Authenticated production owner-data writes, physical-device software-keyboard behaviour and VoiceOver acceptance are not newly established here. Publication and the existing Git-triggered deployment are verified separately after the final commit is pushed.
