# Provider quote date integrity — Mercury 0.2.11

Reviewed 2026-09-22 local / 2026-09-23 UTC. Base: `815a8f59c9b5ce5e9c6fa568c7025ace9e961d4b`, clean refreshed main.

## Finding and change

P1 data trust: the quote adapter used `new Date()` when the provider omitted `datetime`, presenting retrieval time as quote time. Date-only/exchange-local `datetime` was also parsed in the server timezone and ignored the provider's unambiguous Unix fields.

The adapter now prefers `last_quote_at`, then `timestamp`; explicit timezone-bearing ISO dates remain a compatibility fallback. Missing, ambiguous, malformed, nonpositive or future times fail into existing quote retry/manual valuation. Invalid present Unix fields fail closed. Cached responses retain the provider time. This makes no claim that a bar timestamp is an exact trade time.

[Twelve Data's official quote contract](https://twelvedata.com/docs#quote) defines `last_quote_at` as the last minute candle and `timestamp` as the opening candle. Its `datetime` can be exchange-local/date-only. The public AAPL demo response on this run had `datetime=2026-09-22`, `timestamp=1790083800`, `last_quote_at=1790107140`; the actual adapter correctly returned `2026-09-22T19:59:00.000Z`. No private API key or paid provider request was used.

## Verification

- `npm run check`: syntax and 321 tests pass (317 baseline plus four regressions). Tests cover timestamp precedence, explicit offsets, invalid/calendar/future dates and protected endpoint rejection → corrected retry → cached date preservation.
- The 33 provider/endpoint tests also pass with `TZ=America/Los_Angeles`, confirming date handling is independent of server timezone.
- Fresh canonical production browser entry remains gated on sign-in; no email was sent.
- Existing controller quote-failure/manual recovery and retained-quote checks pass within the full suite. No UI composition or layout changed.
- No table, ownership, money precision or recovery-tooling change, so database rebuild/restore was not repeated. No saved quotes, snapshots, accounts, credentials or provider configuration changed.
- Published Acadia 0.4.3 `209e1b3de52782a7ae17e4958add07ecfbb73e29` is documentation-only for Mercury; all 13 vendored files remain byte-identical. No gratuitous pin change.

## Limits and next evidence

The Vercel connector returns an empty project inventory and deployment 404; the in-app Vercel dashboard requires login. GitHub confirms the base production deployment succeeded, but runtime scheduler logs are not accessible through these sessions. Public demo evidence is not deployed authenticated fund/ETF/crypto acceptance. Real magic-link redemption, provider/scheduler operation, cross-device persistence and physical accessibility remain separate gates. The paid hosted-restore deferral remains in force.

## Delivery

Implementation `6c622b3405804d3ea8e4d1fcde5b2242779b2aa3` is on `origin/main`. GitHub's Vercel status reports successful production deployment [7L8AR31hJ4jtJ2RrmfvrVo6SJ3W3](https://vercel.com/jayson-lamanca-s-projects/mercury/7L8AR31hJ4jtJ2RrmfvrVo6SJ3W3). Five canonical production files match the released bytes, including the 0.2.11 README, with CSP/nosniff; protected quote/snapshot routes return 401. The browser's direct Portfolio route remains gated on sign-in. See `production.json`. This verifies release identity and public access protection, not an authenticated production quote lookup or scheduler invocation.
