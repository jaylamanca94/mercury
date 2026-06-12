# Mercury

Mercury is a live global economy dashboard that makes the current state of the world economy easy to understand.

Tagline direction: The global economy at a glance.

## Product Status

Mercury has an initial static dashboard prototype with its first source-backed macro data bridge.
The page starts from clearly labeled sample data, then upgrades the Economic Health section to
public FRED releases when `/api/fred-snapshot` is available. Individual macro indicators can fall
back to labeled sample values when a FRED series is unavailable, delayed, or stale. Market, risk,
and regional data remain sample placeholders.

## Tech Stack

Recommended starting stack:

- Static HTML, CSS, and JavaScript for the first prototype
- Bootstrap 5 via CDN for layout and familiar UI patterns
- Font Awesome Free via CDN for utility icons
- Vercel Serverless Functions for live data proxies
- Public FRED CSV releases for the first Economic Health source bridge
- Environment variables for future API keys

Keep the first build simple until live source requirements are clearer.

## Planned Data Areas

- Market Pulse
- Economic Health
- Global Snapshot
- Risk and Confidence

## Candidate Data Sources

Candidate sources should be reviewed before implementation:

- Federal Reserve Economic Data
- Bureau of Labor Statistics
- Bureau of Economic Analysis
- U.S. Treasury and central bank sources
- OECD, World Bank, IMF, and similar public institutions
- Trusted market data APIs for broad index, commodity, currency, and volatility snapshots

Every source should be evaluated for trust, cost, licensing, rate limits, update frequency, global coverage, and implementation complexity.

## Local Setup

No install step is required for the first prototype.

Open `index.html` in a browser for the sample fallback, or run/deploy the site through Vercel to
enable `/api/fred-snapshot`.

Current files:

- `index.html` - static dashboard entry
- `styles.css` - Mercury dashboard styling
- `app.js` - sample indicator data and rendering
- `api/fred-snapshot.js` - Vercel Serverless Function for public FRED Economic Health releases
- `api/fred-snapshot.test.js` - Node assertions for FRED source freshness and coverage states

## Environment Variables

No environment variables are required yet. The current FRED source bridge uses public CSV downloads.

Expected future variables may include API keys for market or economic data providers.

## File Overview

- `AGENT-README.md` - Mercury product-agent workflow, approval rules, work modes, and output format
- `PRODUCT-README.md` - Mercury mission, goals, scope, decisions, roadmap, and known limitations
- `DESIGN-README.md` - Mercury design standards, UI utilities, chart guidance, and interaction guidance
- `README.md` - setup, stack, source direction, and file overview

## Deployment

Mercury can deploy as a static site on Vercel. Push to `main` to update the production deployment.

Recommended next deployment path:

1. Keep remaining sample data clearly labeled until live sources are connected.
2. Expand source-backed coverage one route at a time.
3. Keep extending validation and fallback states as each source-backed route is added.

## Important Boundary

Mercury is informational. It should help users understand economic conditions, not tell them what to buy, sell, hold, or trade.
