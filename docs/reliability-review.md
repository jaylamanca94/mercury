# Mercury Reliability Review

**Reviewed:** 2026-08-10
**Scope:** source-backed public dashboard, Vercel serverless boundary, browser client, dependency surface, and delivery configuration.

## Risk Assessment

| Priority | Area | Evidence | Decision |
| --- | --- | --- | --- |
| High | Browser and API response security | No deployment header policy was present; all public routes can be framed or interpreted without an explicit browser policy. | Fixed with a Vercel-wide CSP, clickjacking protection, MIME-sniffing protection, least-privilege browser capabilities, and conservative referrer policy. |
| Medium | Upstream reliability and performance | One source snapshot fans out to Yahoo Finance, FRED, and World Bank with 8-second per-request timeouts. The groups start concurrently and return settled partial data, but a public data-provider outage or rate limit can still reduce coverage. | Preserved: this is a deliberate live-data trade-off already surfaced in the product. No unproven throttling or retry policy was added. |
| Medium | Observability | Fatal handler faults log to the Vercel runtime; partial provider failures intentionally resolve into a 200 response with source-health UI. No external log drain, error alert, or provider-health metric is configured. | Deferred: adding third-party telemetry would create an external operational commitment. |
| Medium | Data integrity | The handler validates usable source observations, applies cadence-aware freshness, preserves source status per item, and renders unavailable rather than fabricated values. Dynamic browser HTML is escaped before insertion. | Verified by the existing regression suite; no safe defect found. |
| Low | Dependencies and maintainability | The runtime has no installed package dependency tree. The app uses browser-native APIs and a remote Font Awesome stylesheet. | CSP allows only the existing CDN and same-origin scripts/connections; no dependency expansion required. |
| Low | Architecture and unnecessary complexity | The product is static HTML/CSS/JS plus a single Vercel data handler. Source groups remain parallel with per-item settling. | Retained: a refactor would add risk without a measured product or reliability gain. |

## Verification

- `npm run check` validates JavaScript syntax and all dependency-free regressions, including the Vercel response-security contract (82 passing tests).
- The policy permits only the current self-hosted scripts, same-origin data calls, local/static images, and the existing Font Awesome CDN style and font files.
- A local Vercel preview returned the configured CSP, permissions, referrer, MIME-sniffing, and frame-protection headers on `/`.
- The review does not claim deployed verification. Confirm deployed headers, cache behaviour, runtime error logs, and provider licensing before a public launch.
