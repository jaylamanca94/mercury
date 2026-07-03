# Mercury Product

## Overview

Mercury is a live global economy dashboard that provides a simple, visual snapshot of the world's economic health.

Unlike investing platforms, trading tools, or portfolio trackers, Mercury is designed to answer a single question:

What is happening in the global economy right now?

Mercury aggregates market, economic, and global indicators into an easy-to-understand dashboard that helps users quickly understand trends, sentiment, and economic conditions.

Mercury's product shape should mirror Apollo's successful information architecture: a dense home
dashboard that summarizes the whole product in one scan, backed by focused pages for deeper
market, support-signal, indicator, and source-coverage review.

## Mission

Make the global economy understandable through clear, real-time data visualization.

## Vision

Become the simplest way for anyone to understand the current state of the world economy.

Mercury should feel like checking the weather, but for economic conditions.

## Product Discipline

Mercury must stay focused on its core job: helping users understand current global economic conditions in less than 60 seconds.

- Do not broaden Mercury into an investing platform, trading tool, portfolio tracker, stock picker, financial advice product, general news site, or personal finance app unless the founder explicitly changes the product direction.
- Prefer focused economic clarity over feature volume.
- Say no or defer when a feature is interesting but does not strengthen the current global economy dashboard mission.
- Keep scope decisions grounded in user understanding, source trust, update freshness, global relevance, maintainability, and neutrality.
- Keep the product informative, not advisory. Mercury can explain what changed and why it may matter, but it should not tell users what to buy, sell, hold, or trade.

## Core Principles

### Simple

Present complex economic data in a way that is approachable and easy to understand.

### Real-Time

Surface live and frequently updated indicators from trusted sources.

### Global

Focus on worldwide economic conditions rather than individual investments.

### Informative

Provide context and trends without giving financial advice.

### Neutral

Help users understand what is happening, not what they should buy or sell.

## Target Audience

### Curious Individuals

People who want to better understand the economy without becoming investors.

### Professionals

Users who follow economic trends for work, business, or personal interest.

### Students

Individuals learning about markets, economics, and global events.

### News Readers

People who want a quick economic snapshot without reading multiple articles.

## Product Goal

Allow users to understand the state of the global economy in less than 60 seconds.

A user should be able to open Mercury and immediately understand:

- What is up
- What is down
- Where risk is increasing
- Where confidence is improving
- How the global economy is trending

## Scope

Current scope is a live global economy dashboard MVP with public source-backed coverage for Market
Pulse, Economic Health, Risk and Confidence, and Global Snapshot.

In scope for the MVP:

- Market Pulse
- Economic Health
- Global Snapshot
- Risk and Confidence
- A compact home dashboard with deeper detail pages for Markets, Market Supports, Indicators, and
  Data Coverage
- Clear source attribution
- Update timestamps
- Visible source freshness and last-checked states
- Cadence-aware current, delayed, and stale labels for live source releases
- Exact source release-date labels that preserve each indicator's cadence
- Explainable source-backed breadth score drivers
- Weighted section gain/loss badges for the cards currently in view
- Simple live metric cards focused on name, value, movement, and trend
- Source-backed Today, Week, Month, Year, and 5-year comparison controls for Economy and Currency cards
- Region-aware market proxy cards for United States, Europe, and Asia in the Economy section
- Source-backed Economic Health route using public FRED releases
- Plain-language labels and context
- Neutral, non-advisory dashboard language
- Responsive dashboard experience

Out of scope for the MVP:

- Trading tools
- Portfolio tracking
- Watchlists
- Buy, sell, hold, or timing recommendations
- Personalized financial advice
- Account-backed investing workflows
- Brokerage integrations
- Paid research
- Complex technical analysis
- Unverified or opaque data sources

## MVP Features

### Market Pulse

A high-level view of major market categories.

Examples:

- U.S. Markets
- International Markets
- Technology
- Small Cap Stocks
- Bonds
- Gold
- Oil

### Economic Health

Key indicators that influence economic conditions.

Examples:

- Inflation
- Interest Rates
- Unemployment
- GDP Growth
- Consumer Sentiment

### Global Snapshot

A quick look at major regions around the world.

Examples:

- United States
- Europe
- China
- Japan
- Emerging Markets

### Risk And Confidence

Indicators that reflect market sentiment and uncertainty.

Examples:

- Volatility Index (VIX)
- Treasury Yields
- Dollar Strength
- Gold
- Oil

## Data Source Direction

Prefer official, trusted, and durable sources before niche third-party APIs.

Candidate source categories:

- Market index and asset category data from reliable market data providers
- Federal Reserve Economic Data for U.S. economic indicators
- Bureau of Labor Statistics for labor and inflation data
- Bureau of Economic Analysis for GDP and national accounts
- OECD, World Bank, IMF, and similar public institutions for global indicators
- Treasury, central bank, or exchange-published rates where practical

Every live data surface should show source, freshness, and caveats when relevant.

## Design Decisions

- Use a dashboard pattern that feels like economic weather: quick, visual, and calm.
- Separate current condition, trend direction, and context so users can scan without over-reading.
- Use neutral language that explains conditions without implying investment advice.
- Distinguish movement from interpretation when an indicator can cut both ways. For example, lower
  oil prices can ease costs while pressuring energy markets, so Mercury should not automatically
  frame the move as good or bad.
- Keep context-only indicators, such as oil, FX, inflation, and interest rates, out of hero scoring
  unless Mercury has an explicit model for whether the move is constructive or harmful.
- Prefer concise status labels over dense financial jargon.
- Use visual encoding for direction, risk, confidence, and freshness.
- Make source attribution visible enough to build trust without overwhelming the dashboard.
- Avoid inactive controls that imply unavailable workflows.
- Show scope notes instead of filters when a dashboard section mixes several source-backed
  geographies or asset categories without a source-backed filtering model.
- Region controls may use clearly labeled ETF or fund proxies for comparable market categories, but
  must not imply investment advice, complete regional coverage, or official economic equivalence.
- Start with the smallest working dashboard before adding integrations.

## Roadmap

Recently completed:

- Created the first static dashboard scaffold with sample data and clear source/freshness placeholders.
- Added the first serverless API route for source-backed Economic Health releases from FRED.
- Replaced rendered placeholder values with a live snapshot route spanning Yahoo Finance, FRED, and
  World Bank public data.
- Added cadence-aware freshness guardrails so connected daily, weekly, monthly, quarterly, and
  annual releases can be labeled current, delayed, or stale.
- Added active period controls, including a 5-year horizon, and region-aware Economy market proxies
  for United States, Europe, and Asia.
- Reframed Mercury from a single-page report into an Apollo-style overview dashboard with focused
  deeper pages.

Recommended next steps:

1. Review production licensing and reliability for market-data providers.
2. Refine the breadth score model for up/down, risk, confidence, and trend.
3. Add source-backed period comparisons that match each indicator's real release cadence.
4. Add automated regression coverage for source freshness and fallback states.

Future opportunities:

- Historical trends across weeks, months, and years
- Plain-language explanations for indicators and movements
- Upcoming economic reports and announcements
- Alerts for meaningful economic changes
- Concise daily or weekly economic briefings

## Tagline Options

- The global economy at a glance.
- A live snapshot of the world's economy.
- Economic insight without the noise.
- Understand the economy in seconds.
- Your window into the global economy.

## Known Limitations

- Market Pulse uses Yahoo Finance chart data as a public market-data bridge; production licensing
  should be reviewed before a public launch.
- Regional Economy controls use public market proxy funds to keep the comparison source-backed.
  These proxies are not investment recommendations and do not represent complete regional economic
  coverage.
- Economic Health loads source-backed public FRED releases through `/api/live-snapshot`.
- Risk and Confidence combines Yahoo Finance daily proxies with the FRED Financial Stress Index.
- Global Snapshot uses World Bank annual GDP growth releases, which update less frequently than
  market or economic indicators.
- Data coverage labels show partial live groups as live indicator counts so users can distinguish
  limited source availability from a fully unavailable section.
- Data Coverage separates current source health from configured provider inventory so provider names
  do not imply live availability during an outage.
- During a complete live-data outage, Mercury keeps refresh available and confirms each retry through
  the visible checked/unavailable status instead of adding a separate recovery flow.
- Complete live-data outages preserve page identity across Dashboard, Markets, Market Supports,
  Indicators, and Data Coverage; `Live data unavailable` is a source state, not the destination.
- Market Supports consolidates complete-outage copy into one combined currencies, commodities, and
  digital-assets status pass instead of repeating near-identical unavailable support sections.
- Freshness labels are rule-based guardrails by cadence, not official release calendars. They should
  be refined when Mercury adopts provider-specific release schedules.
- The current breadth score is a simple visible-indicator aggregation and should be refined before
  being treated as a formal economic scoring model.
- Some economic indicators update monthly or quarterly, not in real time.
- Market data licensing and rate limits may influence source choices.
- Mercury must avoid language that sounds like financial advice.
