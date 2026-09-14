# Mercury 0.0.9 — Session privacy and Acadia audit

Reviewed 2026-09-14 from clean main `d567ca1`; fetched and confirmed origin/main before editing. The previous automation covered 0.0.2; current 0.0.8 Home, Portfolio, property, market-history and Income changes were inspected rather than repeated from that older report.

## Outcome

Fixed a P1 privacy gap: the controller had no auth subscription, so a workspace could remain visible after another tab signed out or changed identity. Mercury now registers one synchronous Supabase auth callback, establishes the initial identity, and leaves same-user refreshes alone. A changed identity immediately hides and makes the old document inert, invalidates startup/data/provider contexts, removes the active client/account/user references and reloads. The unload draft guard cannot block this privacy transition. A delayed session-token read cannot authorise a subsequent provider call. This deliberately discards the old private draft; a write already accepted by the backend may still commit and should be reviewed after signing in again.

Adopted the complete unchanged Acadia 0.3.2 stylesheet at published main `346c874f64b45262ae4d7d6089fa67a61b1da898` (remote verified during this run), including current Accordion and Breadcrumb definitions. Fonts, supporting assets and the Card Trend module retain their existing hashes/provenance. Cache keys and vendor integrity manifest updated. No shared stylesheet patches, new components, schema changes or financial calculations.

Fixed P1 enlarged-text compression discovered during this audit: at 320px and 200% root text, nested Plan dialog/accordion padding reduced the summary to a vertical column of letters. A small documented composition adapter bounds empty spacing and outer margins using existing Acadia tokens and viewport dimensions. Font size and touch targets remain unchanged. The final title wraps at words, Reinvest remains readable, and the dialog scrolls vertically with keyboard-accessible controls.

## Current flow matrix

Numbering describes the current audit steps, not new product flows. All ten implemented canonical flows were inspected through current source and the automated suite; current browser depth differs as listed. Export remains deferred.

| Step / canonical flow | Fresh evidence and result | Limit |
| --- | --- | --- |
| 1. Private sign-in/session | Production sign-in reachable. Synthetic same-user refresh preserved a $1,200 Income draft; cross-tab sign-out returned to sign-in. At 320px a dirty category dialog also disappeared without a discard veto. | Actual email delivery/redemption and real Supabase browser broadcast were not exercised. No email sent. |
| 2. Add holding | Opened Add, expanded Recurring, entered DEMO/2 shares, recovered from failed automatic price using $100 manual price, saved and landed on the $200 holding. | In-memory disposable adapter; no durable backend claim. |
| 3. Quote retrieval/recovery | Real controller exposed manual recovery after synthetic provider failure. Market charts rendered current synthetic daily-series results with distinct source/price semantics. | Real provider response, stale-price retention and scheduled freshness were checked by tests/source, not a new live provider call. |
| 4. Edit/delete asset | Changed the new holding from 2 to 3 shares, saved and observed $300. Opened Manual valuation/More details; native controls remained operable. | Deletion uses unchanged owner-scoped regression coverage; no new browser deletion. Other-editor revision protection remains open. |
| 5. Understand Home | Current net worth, investment-only history, unavailable growth and dividend evidence inspected. Missing metrics remain explicit. | Synthetic amounts/history, not owner financial data. |
| 6. Manage Portfolio/property | Cards, market periods, group/search/sort controls, recurring equivalents and property equity/purchase-price entry inspected. Desktop card view and phone Add tested. | Table/filter, property save/delete use existing automated coverage; no full fresh browser matrix of those paths. |
| 7. Daily history | Current Home rendered recorded two-point history; snapshot date/idempotency/auth/incomplete-valuation tests passed. | No new cron execution or database snapshot acceptance. |
| 8. Expected income | Source $1,100 → $1,200 saved; expected monthly recurring income became $2,600. Refresh preserved an unsaved draft. Missing yield recovery appeared for the newly added holding. | Synthetic persistence resets on reload. Source-detail modal concurrency remains open. |
| 9. Spending categories | Household $4,300 → $4,000 saved; summary/table reflected $4,000. At 320px Table adapted to cards; Add category was operable. Dirty modal sign-out tested. | Concurrent edit protection and durable persistence not revalidated. |
| 10. Plan trajectory | Incomplete inputs withheld projections. Saved 5% return/2% yield overrides; outlook appeared with explicit Plan override sources. Optional-rate disclosure, keyboard Tab and Cancel focus return tested at 320px/200% text in dark appearance. | Projection is illustrative. Physical assistive technology acceptance remains open. |
| Deferred export | Existing private export function/source boundary reviewed with endpoint and isolation-related tests. | Not exposed in the product; no fresh signed-in export acceptance. |

## Research and design decisions

[Supabase onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) documents the session event subscription. Its [deadlock guidance](https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0) supports keeping the callback synchronous and avoiding Supabase API calls inside it. A full document reload is the smallest reliable way to discard all existing private editor contexts; trying to maintain each editor through an identity change would add avoidable complexity. Same-user events preserve work.

Current Acadia Accordion/Breadcrumb contracts were reviewed. The product continues to use native details/summary, semantic fields, native selects and shared cards/dialogs. No competitive feature was added: research into competitors would not change the auth correctness or narrow viewport findings. The new dialog spacing adapter is a candidate for Acadia graduation after shared-system coverage, not a claim that Acadia source was fixed.

## Validation

- `npm run check`: **222 passed**, no failures (217 baseline plus five auth lifecycle regressions). Updated the two existing literal cache-key assertions. Vendor hashes and active Acadia class coverage pass.
- New controller cases: same-user draft retention; sign-out/different-user concealment and pending-write unload bypass; signed-out → signed-in reload without auth calls in callback; late token rejection; initial account read invalidation and single subscription.
- Browser screenshots captured fresh through the Codex in-app browser with disposable in-memory fixtures. Checked desktop 1280px, tablet 768px, phone 390px and 320px; dark 200% text used a 32px root font. The 320px page scroll width was 305px with a 15px scrollbar; final dialog client/scroll width both 258px. At 390px Add dialog client/scroll width both 341px before the large-text adapter (normal-sized spacing remains unchanged).
- Native Tab moved from expanded Custom rates to the annual-return field; Cancel returned focus to Plan settings. Screenshots alone do not establish accessibility compliance, software-keyboard behaviour, safe areas or physical VoiceOver operation.
- No owner data, credentials, schema, auth configuration or external messages were changed. Local fixture changes were disposable and were not included in the release. Already-issued writes are not cancelled by a reload.

## Remaining priorities

- **P1:** Other editors (holding, source details, category, property) still have unguarded stale updates. Extend opening-revision/outcome protection already used by Plan and inline Income. Identity replacement is now handled, but same-account concurrent editing is a separate issue.
- **P1:** Reconcile duplicate migration prefixes and the consolidated remote baseline, then prove a clean rebuild and second-user isolation. Current files still show the duplicate prefixes; no blanket migration replay performed.
- **P1 release acceptance:** Actual magic-link arrival/return, real Supabase cross-tab session events, physical accessibility, authenticated provider/export/scheduler acceptance.
- **P2:** Large record pagination/latest quotes, CDN integrity, provider cache limits, sustained observability. Vercel connector returned empty projects/404 for the known deployment; publication verification uses GitHub integration status and canonical hosted bytes instead.
- **P2 design:** Tablet asset details leave a wide empty side column below the valuation card; review the responsive composition separately. Expenses shows a scroll hint even when all columns fit; a small future visibility refinement can remove that unnecessary instruction.

**1.0.0 is not warranted.** No new canonical flows were added. Release is a patch for privacy, accessibility and shared-system alignment.

## Captured evidence

### 1. Current Income and same-user refresh

![Income before](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/01-income-before.png)

![Draft retained after refresh](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/02-draft-after-refresh.png)

![External sign-out](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/03-signed-out.png)

### 2. Home and Portfolio

![Home](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/04-home.png)

![Portfolio](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/05-portfolio.png)

### 3. Add, save and edit a holding

![Recurring desktop](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/06-add-recurring-desktop.png)

![Recurring phone](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/07-add-recurring-phone.png)

![Saved asset phone](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/08-saved-asset-phone.png)

![Edited asset tablet](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/09-asset-details-tablet.png)

### 4. Plan readiness and saved overrides

![Plan readiness](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/10-plan-readiness.png)

![Saved Plan](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/11-plan-saved.png)

### 5. Categories and private-dialog sign-out

![Saved category](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/12-budget-saved-tablet.png)

![Narrow category entry](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/13-category-320.png)

![Dirty dialog cleared after sign-out](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/14-dialog-signout-320.png)

### 6. Enlarged text before and after the spacing correction

![Before: single-letter compression](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/15-plan-dark-large-320.png)

![After: readable wrapping](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/16-plan-dark-large-fixed.png)

## Production verification — 2026-09-14 19:50 UTC

Implementation `51d54ca285c5d45bb9c36ae8c9cc1ab551fb8c7f` was pushed directly to origin/main and the exact remote SHA verified. GitHub reports the Vercel production deployment successful: [deployment receipt](https://vercel.com/jayson-lamanca-s-projects/mercury/27hCAjDmYb4SmDyX9FtfTtMz4Ezk). Canonical production returned HTTP 200 and byte-identical `index.html`, `brokerage.js`, `styles.css` and `acadia.css`; CSP and nosniff headers were present on all four. Controller SHA-256: `dbcb391eba38ab1ef2dcc69da9908527c4d4e63e0c1eb660367ef138fdbc4433`. The refreshed production browser settled on sign-in with zero captured browser error logs. This is asset/browser verification, not sustained server observability or signed-in production acceptance.

![Verified production sign-in](/Users/jaylamanca/Library/Mobile Documents/com~apple~CloudDocs/Codex/Mercury/automation/review/2026-09-14/session/17-production-signin.png)
