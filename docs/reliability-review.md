# Mercury Reliability Review

**Reviewed:** 2026-08-10
**Scope:** source-backed public dashboard, Vercel serverless boundary, browser client, dependency surface, and delivery configuration.

## Risk Assessment

| Priority | User risk / likelihood | Affected flows | Maintenance cost | Evidence and decision |
| --- | --- | --- | --- |
| High | Browser compromise is high impact; likelihood reduced | All public pages and API routes | Low | Fixed previously with a Vercel-wide CSP, clickjacking protection, MIME-sniffing protection, least-privilege browser capabilities, and conservative referrer policy. |
| Medium | A malformed successful response could leave a user waiting indefinitely; unlikely but trust-damaging | First load and retry on all seven flows | Low | Fixed: the browser now requires the established snapshot shape, falls back to the explicit unavailable state for incomplete `200` responses, and aborts a stalled request after 20 seconds. |
| Medium | Public provider outage, rate limit, or stale cache can reduce coverage; plausible | Dashboard, Markets, Supports, Indicators, and Data Coverage | Medium | Preserved: source groups start concurrently, settle independently, and surface partial, delayed, stale, and unavailable states. No unproven retry, throttle, or caching redesign was added. |
| Medium | Provider failures can be user-visible before the team is alerted; plausible | All live-data flows | Medium / external commitment | Deferred: fatal handler faults log to Vercel, but no external log drain, alert, or provider-health metric is configured. |
| Medium | Incorrect upstream observations could distort the informational read; plausible at the source boundary | All live-data flows | Low | Verified: usable observations, cadence-aware freshness, per-item source status, and unavailable fallbacks are retained. Dynamic browser content is escaped before insertion. |
| Low | Unsupported API methods could be cached or parsed inconsistently; uncommon | API clients and operational probes | Low | Fixed: `405` responses now declare JSON, preserve `Allow: GET`, and use `Cache-Control: no-store`. |
| Low | Dependency or structural drift can increase maintenance risk | All flows | Low | Retained: no installed runtime dependency tree; static HTML/CSS/JS plus one serverless aggregation boundary remains proportionate. The existing remote Font Awesome stylesheet is confined by CSP. |

## Verification

- `npm run check` validates JavaScript syntax and all dependency-free regressions, including the Vercel response-security contract, incomplete-success recovery, and unsupported-method API response (84 passing tests).
- The policy permits only the current self-hosted scripts, same-origin data calls, local/static images, and the existing Font Awesome CDN style and font files.
- A local Vercel preview returned the configured CSP, permissions, referrer, MIME-sniffing, and frame-protection headers on `/`.
- The review does not claim deployed verification. Confirm deployed headers, cache behaviour, runtime error logs, real-device rendering, and provider licensing before a public launch.

## Remaining Risk

- **Deferred:** Configure an alerting/logging path before relying on this as a monitored public service; partial provider failures intentionally resolve into source-health UI and are not independently alerted.
- **Deferred:** Verify the deployed Vercel route, cache headers, desktop and iPhone rendering, and public-data licensing. Local checks cannot establish any of these release facts.
- **Founder decision needed:** Choose whether Mercury is primarily a near-real-time market-climate view with economic context or a multi-cadence global-conditions view. This affects the meaning of the aggregate score and should not be disguised as a reliability fix.
