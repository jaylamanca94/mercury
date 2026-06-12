# Mercury Product

## Overview

Mercury is a live global economy dashboard that provides a simple, visual snapshot of the world's economic health.

Unlike investing platforms, trading tools, or portfolio trackers, Mercury is designed to answer a single question:

What is happening in the global economy right now?

Mercury aggregates market, economic, and global indicators into an easy-to-understand dashboard that helps users quickly understand trends, sentiment, and economic conditions.

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

Current scope is a static prototype foundation for a live global economy dashboard MVP with
source-backed FRED bridges for Economic Health, partial Market Pulse coverage, and Risk and
Confidence coverage.

In scope for the MVP:

- Market Pulse
- Economic Health
- Global Snapshot
- Risk and Confidence
- Clear source attribution
- Update timestamps
- Visible sample snapshot dates before live refresh exists
- Explainable sample score drivers
- Visible previous-sample comparisons for prototype metrics
- First source-backed Economic Health route using public FRED releases
- Partial source-backed Market Pulse route using public FRED daily market series
- Source-backed Risk and Confidence route using public FRED daily volatility, dollar, and gold series
- Partial, delayed, stale, and fallback states for source-backed Economic Health data
- Partial, delayed, stale, and fallback states for source-backed Market Pulse data
- Partial, delayed, stale, and fallback states for source-backed Risk and Confidence data
- Source-backed macro cards show latest and previous release periods beside comparison values
- Source-backed market cards show latest and previous observation dates beside comparison values
- Source-backed Risk and Confidence rows show latest, previous, and change values beside daily observation dates
- Source-backed Economic Health, Market Pulse, and Risk and Confidence show source audit metadata for loaded count, period or observation range, and route-level last check time
- Source-backed cards and rows show unit and frequency metadata from the source route when available
- Source coverage distinguishes route-level last check times for Market Pulse, Economic Health, and Risk and Confidence
- Source coverage keeps the shared live last checked time anchored to the newest valid route check, not async route completion order
- Route-level fallback states include a short status or network failure reason when a source route cannot load
- Market Pulse source audits summarize unresolved source gaps separately from loaded FRED observations
- Market Pulse sample fallback cards preserve source-gap metadata inline when a route names why a card is unresolved
- Header connection pills show Market Pulse, Risk and Confidence, and Economic Health source status as each bridge loads or falls back
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
- Federal Reserve Economic Data for U.S. macro indicators
- Bureau of Labor Statistics for labor and inflation data
- Bureau of Economic Analysis for GDP and national accounts
- OECD, World Bank, IMF, and similar public institutions for global indicators
- Treasury, central bank, or exchange-published rates where practical

Every live data surface should show source, freshness, and caveats when relevant.

## Design Decisions

- Use a dashboard pattern that feels like economic weather: quick, visual, and calm.
- Separate current condition, trend direction, and context so users can scan without over-reading.
- Use neutral language that explains conditions without implying investment advice.
- Prefer concise status labels over dense financial jargon.
- Use visual encoding for direction, risk, confidence, and freshness.
- Make source attribution visible enough to build trust without overwhelming the dashboard.
- Avoid inactive controls that imply unavailable workflows.
- Start with the smallest working dashboard before adding integrations.

## Roadmap

Recently completed:

- Created the first static dashboard scaffold with sample data and clear source/freshness placeholders.
- Added the first serverless API route for source-backed Economic Health releases from FRED.
- Added per-indicator freshness and partial fallback states around the FRED Economic Health bridge.
- Added release-period labels to source-backed Economic Health cards so previous-release comparisons show their time context.
- Added compact source audit metadata for FRED coverage count, release range, and check time.
- Added a partial Market Pulse FRED bridge for S&P 500, 10-year Treasury yield, and WTI oil observations while keeping unresolved market cards visibly labeled as sample fallback.
- Added a compact Market Pulse gap summary so unresolved source selections stay visible beside loaded FRED coverage.
- Preserved Market Pulse source-gap metadata on fallback cards so unresolved cards explain their source-selection state inline.
- Added a Risk and Confidence FRED bridge for VIX, broad dollar index, and gold observations while keeping sample fallback behavior available.
- Added route-level source check times to the coverage band so Market Pulse, Economic Health, and Risk and Confidence audits do not share one ambiguous timestamp.
- Added a Risk and Confidence header status pill so all current FRED-backed dashboard areas expose connection state in the first viewport.
- Added unit and frequency metadata to source-backed Market Pulse, Economic Health, and Risk and Confidence indicators so users can interpret the value basis without leaving the dashboard.
- Kept the shared live last checked timestamp tied to the newest valid route check so route load order does not make freshness look older.
- Added compact latest, previous, and change comparisons to source-backed Risk and Confidence rows.
- Added route failure details to source fallback copy so unavailable source routes are easier to diagnose.

Recommended next steps:

1. Select a durable source-backed approach for the International Market Pulse card.
2. Define the indicator scoring model for up/down, risk, confidence, and trend.
3. Expand source-backed period comparisons to additional indicators as new source routes come online.
4. Add manual fixtures for empty, partial, delayed, and stale source states.

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

- The first app scaffold still uses static sample data outside Economic Health, partial Market Pulse coverage, and Risk and Confidence coverage.
- Economic Health can load source-backed public FRED releases through `/api/fred-snapshot`.
- Market Pulse can load source-backed public FRED daily series through `/api/market-snapshot` for U.S. markets, the 10-year Treasury yield, and WTI oil.
- Risk and Confidence can load source-backed public FRED daily series through `/api/risk-snapshot` for VIX, the nominal broad U.S. dollar index, and gold.
- The header shows separate Market Pulse, Risk and Confidence, and Economic Health connection states, but regional coverage remains sample-only.
- Economic Health keeps sample fallback cards visible when individual FRED indicators are unavailable.
- Market Pulse keeps sample fallback cards visible when individual source-backed market indicators are unavailable or when no durable source has been selected for a card.
- Market Pulse fallback cards can show route-provided source-gap details such as pending source selection, unit availability, and cadence state.
- Risk and Confidence keeps sample fallback rows visible when individual FRED risk indicators are unavailable.
- FRED release freshness is classified with simple cadence thresholds and should be refined as source handling matures.
- Market observation freshness is classified with simple daily cadence thresholds and should be refined as source handling matures.
- Risk observation freshness is classified with simple daily cadence thresholds and should be refined as source handling matures.
- Source-backed Economic Health comparisons use the previous FRED observation period, not the static sample period.
- Source-backed Market Pulse comparisons use the previous FRED observation, not the static sample period.
- Source-backed Risk and Confidence rows use the previous FRED observation to describe the latest reading, not the static sample period.
- Source-backed Economic Health coverage counts only the configured FRED indicators in the current bridge.
- Market Pulse coverage counts the current four-card dashboard area, including source gaps such as International when no selected source exists yet.
- Market Pulse gap summaries name unresolved or unavailable cards, but they do not select or endorse a provider.
- Global Snapshot still uses sample data.
- No source scoring model exists yet.
- The current economy score is illustrative and must stay labeled until a formal scoring model is defined.
- Prototype sample values are illustrative and use a sample-set date, not a live refresh timestamp.
- Previous-sample comparisons outside source-backed Economic Health remain illustrative until live data exists.
- Some economic indicators update monthly or quarterly, not in real time.
- Market data licensing and rate limits may influence source choices.
- Mercury must avoid language that sounds like financial advice.
