# Mercury flow audit — 22 September 2026

Release **0.2.10**. Run completed after midnight UTC on 23 September (22 September local). Started from clean, refreshed main `35a8cbb`, version 0.2.9. Ten implemented canonical flows remain; private export remains deferred.

## Findings and changes

- **P1 — Profile could not be used visually.** Desktop and tablet navigation's scrolling containers clipped the embedded menu; the phone disclosure opened below the viewport. Screen-reader/DOM visibility alone had hidden the problem. An existing-style placement adapter lets open menus escape navigation clipping, puts navigation above page cards and opens the phone menu above its dock. Width/height are bounded, with internal scrolling at large text. Acadia still owns all menu surfaces, controls, focus and touch targets; vendor files are unchanged.
- **P1 — Authentication could stall without recovery.** A never-settling magic-link send left Sending disabled indefinitely. Sign-out had no deadline, did not catch thrown rejection and only reported returned errors to a screen-reader-only Home status. Both actions now use the existing ten-second deadline. Sending retains the email and explains that delivery is unconfirmed. Sign-out stays single flight and leaves Profile open with a visible status and a focusable retry action. Context changes invalidate UI replies; late promises cannot overwrite a retry. A late genuine auth change still hides the private document and reloads.
- **P3 — Unnecessary Portfolio guidance.** Removed the always-visible “Scroll to compare all details” hint, matching Expenses. The table keeps its named keyboard-focusable region and responsive cards.
- **Documentation drift.** README still led with 0.2.8 and recorded-only Home history. Updated its version and Home summary; current design telemetry now distinguishes current opportunities from historical lists.

## Current flow walkthrough

All populated browser evidence below is a loopback-only, in-memory synthetic fixture served with the actual current HTML/CSS/controllers. Reload removes synthetic edits. No owner data, remote writes, external email or paid infrastructure was used.

| Step | Flow and observed result | Health and limits |
| --- | --- | --- |
| 1 | Production signed-out entry; stalled synthetic magic-link request; deadline then successful retry response. | Fixed. Real email delivery/redemption not verified. Screenshots 01–03. |
| 2 | Home current net worth, default 1M market movement, then Recorded/All history. | Healthy in fixture. Source scope, dates, current-share market weighting and recorded-value exclusions remain explicit. Screenshots 11–12. |
| 3 | Portfolio Cards → Table → Add asset. Matching records and automatic value order; table fits. | Healthy in fixture. Screenshot 13. |
| 4 | Add QAONLY, two shares; unavailable automatic quote exposes manual price; $100 preview → acknowledged $200 asset. | Healthy fallback and Add path. Actual protected provider success/scheduler remain separate. Screenshot 14. |
| 5 | Edit QAONLY shares from 2 to 3 → Save → Changes saved; Back returns to Portfolio. | Healthy local confirmation. Delete timeout/absence/context behaviour is covered by the current controller suite, not a new production deletion. Screenshot 15. |
| 6 | Property menu → Edit → purchase price 250,000.25 → Save; exact price retained in the resulting caption. | Healthy fixture write; long modal still requires scrolling. Screenshot 16 shows entry, with geography and missing-appreciation states. |
| 7 | Income → Add QA salary, $1,200 every two weeks → $31,200/year and $2,600/month. | Healthy. New asset's missing yield honestly withholds dependent totals and offers repair. Screenshot 17. |
| 8 | Expenses → Add QA household at $4,000/month → one category, 100% share. | Healthy fixture write and totals. Screenshot 18. |
| 9 | Plan with missing asset return/yield coverage withholds projections; fresh complete fixture previews $900/week expenses and confirms Save Plan at $3,900/month. | Healthy readiness/save paths. Screenshot 19–20. DOB/milestone/concurrency cases covered by tests, not a fresh physical-device session. |
| 10 | Profile pending/error/retry; successful sign-out returns to sign-in. Escape closes the menu and returns focus. | Fixed desktop/tablet/phone. 320px with doubled root text and Light appearance fits. Screenshots 04–10. |

Daily snapshot creation is a backend step in the canonical registry. Its New York close gate, one-per-day upsert, account scope, latest complete quote reads and refusal to write incomplete values pass the current endpoint/domain suite; the browser walkthrough checks recorded-history presentation only. The protected export boundary is not a user-facing flow and remains deferred.

## Acadia and relevant research

Read current Acadia foundations, operating model, CSS and release notes. Published main is `c660e2073d78906ea708edfc47e451ba292611be`, 0.4.2; remote SHA matched the inspected local commit. SHA-256 comparison of every source asset confirms all **13** vendored files are identical. Updated manifest provenance only. The optional React map extraction and documentation changes do not require a Mercury runtime migration. Reviewed the new overlapping read/write guidance; existing revision/context checks remain, and this patch adds explicit auth-response ordering tests.

[Apple's progress guidance](https://developer.apple.com/design/human-interface-guidelines/progress-indicators) supports explaining stalled activity and offering a next action. [W3C status-message guidance](https://www.w3.org/WAI/WCAG21/Understanding/status-messages) and [form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) support visible, programmatically available feedback. Mercury reuses its existing status hints and native menu controls. A competitor-led redesign would add little to these concrete defects and was not introduced.

## Verification

- `npm run check`: **317/317 tests**, all syntax checks pass; baseline was 311. Six added actual-controller tests exercise deadline release, retained email, duplicate suppression, late replies during retry, replaced auth contexts, thrown/returned sign-out errors, identity-change reload ownership and keeping feedback visible. Existing schema, recovery, collections, revisions, calculations, endpoints and deployment assertions remain passing.
- `git diff --check`: passed.
- Twenty settled routes/viewports: Home, Portfolio, Income, Expenses and Plan at 320/390/768/1280px; zero horizontal document overflow. See `responsive.json`. Route headings were awaited before measurement.
- Profile visually inspected in 1280px desktop, 768px tablet, 390px phone and 320px with 200% root text. Phone keyboard retry retains focus; Escape returns to Profile. System dark and Light checked; restored System afterwards. Screenshots are exact captures saved and opened before acceptance.
- No schema, migration, credential, dependency, provider contract, financial calculation or scheduling change. Database rebuild/restore was therefore not rerun for this UI/auth patch. Previous evidence remains explicitly historical.
- Current public production entry was captured separately. Hosted byte hashes and deployment state are recorded in `production.json` after publication.

## Remaining acceptance and priorities

Real magic-link delivery/redemption and expired-session browser recovery; deployed mutual-fund/ETF/crypto provider and scheduler operation; cross-device durable persistence; physical-device software-keyboard/VoiceOver review remain open. Keep Mercury pre-1.0. Existing local recovery evidence is not hosted restoration proof; no paid restore clone was created. Larger UX opportunities are simpler conflict review and long-form keyboard clearance. This pass does not claim every production state or full accessibility compliance.

## Screenshot evidence

01 — Current production entry.

![Production sign-in](01-production-sign-in.png)

02–03 — Reproduced stalled sending, then bounded recovery.

![Stalled before](02-sign-in-stalled-before.png)
![Recovered sending](03-sign-in-recovered.png)

04–05 — Before: Profile children exist in the accessibility tree but are visually clipped/offscreen.

![Phone menu before](04-phone-profile-clipped-before.png)
![Desktop menu before](05-desktop-profile-clipped-before.png)

06–10 — After: visible desktop, phone, tablet, retry and enlarged-text menus.

![Desktop Profile](06-desktop-profile-fixed.png)
![Phone Profile](07-phone-profile-fixed.png)
![Tablet Profile](08-tablet-profile.png)
![Phone recovery](09-phone-sign-out-recovery.png)
![Large text](10-phone-large-text-profile.png)

11–13 — Current Home and Portfolio views.

![Home market](11-home-market.png)
![Recorded history](12-recorded-history.png)
![Portfolio Table](13-portfolio-table.png)

14–16 — Add/manual recovery, confirmed asset edit and property form. The saved-asset capture is intentionally scrolled to its saved fields/status; the property form is scrollable.

![Add/manual recovery](14-add-manual-recovery.png)
![Saved asset](15-asset-saved.png)
![Property editor](16-property-editor.png)

17–20 — Income, Expenses and Plan. Plan's saved capture is intentionally scrolled to its edited controls; no fabricated chart values replace missing coverage.

![Income](17-income-saved.png)
![Expenses](18-expenses-saved.png)
![Plan readiness](19-plan-readiness.png)
![Saved Plan](20-plan-saved.png)

## Publication receipt — 23 September, 00:08 UTC

Code commit `32278da852614cf6d43ea995e1a1adab15679593` was pushed to `origin/main`; remote exact SHA verified. [Vercel deployment](https://vercel.com/jayson-lamanca-s-projects/mercury/C3UqGhdJebPG3RNY6Rtd1JkzmTgR) reports success. Eight canonical public files return HTTP 200 and match the released local bytes (`production.json`); CSP and `nosniff` are present. Quote and snapshot endpoints reject unauthenticated requests with 401. A fresh production phone session shows the fixed Profile menu above the dock. No production email was sent. Local review tabs were closed, viewport overrides reset, and local appearance restored to System. Final local error log was empty.

![Published phone Profile](21-production-phone-profile.png)
