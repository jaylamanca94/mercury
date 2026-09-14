# Asset market history — 2026-09-14

## Scope

Founder request: asset detail should graph the asset’s market price rather than personal gain/loss. Added daily USD unit-price history to the lead card, 1M/3M/1Y/5Y ranges, period price movement, real dated endpoints, source and recovery states. Your holding value and valuation inputs remain below it. The optional property purchase-price feature from 0.0.4 is retained. No database writes/migration or additional credentials.

## Validation

- All 208 automated checks pass: market-price arithmetic independent of shares/cost/dividends; fractional, duplicate, invalid, future, stale, foreign-currency, one/empty/flat series; calendar-month bounds; authenticated endpoint and cache; stale asset/account responses and draft retention. Existing financial/editor checks remain passing.
- Direct existing-provider reads returned 1,255 VOO observations and 1,827 BTC/USD observations, with USD currency and real dated prices. This is public market data, not a personal holding fixture.
- Local browser QA uses synthetic holdings and synthetic historical prices only. Evidence images are synthetic and do not disclose personal finances.
- Browser checks passed at 320, 390, 768 and 1440px with no horizontal overflow; ranges retain at least 44px height. At 768px and 200% text they reflow and grow to 64px. Light/dark chart styling, native keyboard range activation, unsaved Contribution retention, Back navigation, retry retaining 5Y, one-point, empty and cash/unsupported states passed.
- Acadia stylesheet and curve utility are unchanged; the lead card uses existing supported tokens.
- Source commit `6bbeda598b3ef30bc951ed0f1f7ee674c187d784` reached READY production deployment `mercury-cictdi18p-jayson-lamanca-s-projects.vercel.app`; the hosted build passed all 208 checks. Canonical production `index.html`, `brokerage.js`, `market-history.js` and unchanged `acadia.css` matched the committed bytes.
- Live authenticated read-only requests on the authorised test account returned 1,255 VOO observations and 1,827 BTC/USD observations, sorted by date with positive USD prices and private/no-store response headers. An unauthenticated history request returned 401. No accounts or holdings were created or modified; the test account remained empty.

## Boundaries

Daily price history can include the current session; it is not an intraday feed. Price change excludes dividends and personal returns. Selected ranges show available observations, without invented history before a listing or across missing prices. Foreign currencies are withheld rather than relabelled USD. Physical device and assistive-technology acceptance remain separate.
