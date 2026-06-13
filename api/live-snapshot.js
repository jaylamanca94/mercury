const FRED_GRAPH_BASE_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";
const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2";
const UPSTREAM_TIMEOUT_MS = 8000;

const YAHOO_SERIES = [
  {
    id: "us-equities",
    section: "marketPulse",
    name: "U.S. equities",
    context: "S&P 500 daily close",
    icon: "fa-chart-line",
    symbol: "^GSPC",
    source: "Yahoo Finance: S&P 500 chart",
    cadence: "Daily market close",
    valueKind: "latest",
    valueFormat: "number",
    decimals: 0,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "bonds",
    section: "marketPulse",
    name: "Bonds",
    context: "7-10 year Treasury ETF",
    icon: "fa-scale-balanced",
    symbol: "IEF",
    source: "Yahoo Finance: iShares 7-10 Year Treasury Bond ETF chart",
    cadence: "Daily market close",
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "bond-price",
  },
  {
    id: "dollar-index",
    section: "marketPulse",
    name: "U.S. dollar",
    context: "Dollar index ETF proxy",
    icon: "fa-dollar-sign",
    symbol: "UUP",
    source: "Yahoo Finance: Invesco DB U.S. Dollar Index Bullish Fund chart",
    cadence: "Daily market close",
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "dollar",
  },
  {
    id: "oil",
    section: "marketPulse",
    name: "Oil",
    context: "WTI crude futures",
    icon: "fa-gas-pump",
    symbol: "CL=F",
    source: "Yahoo Finance: WTI crude futures chart",
    cadence: "Daily market close",
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "commodity",
  },
  {
    id: "volatility",
    section: "riskIndicators",
    name: "Volatility",
    icon: "fa-wave-square",
    symbol: "^VIX",
    source: "Yahoo Finance: CBOE Volatility Index chart",
    cadence: "Daily market close",
    valueKind: "latest",
    valueFormat: "number",
    decimals: 1,
    comparison: "point-change",
    trendModel: "volatility",
  },
  {
    id: "high-yield-credit",
    section: "riskIndicators",
    name: "Credit stress",
    icon: "fa-landmark",
    symbol: "HYG",
    source: "Yahoo Finance: iShares iBoxx High Yield Corporate Bond ETF chart",
    cadence: "Daily market close",
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "credit-market",
  },
];

const FRED_SERIES = [
  {
    id: "inflation",
    section: "economicHealth",
    name: "Inflation",
    context: "Consumer prices",
    icon: "fa-receipt",
    seriesId: "CPIAUCSL",
    source: "FRED: Consumer Price Index for All Urban Consumers",
    cadence: "Monthly release",
    valueKind: "year-over-year",
    valueFormat: "percent",
    decimals: 1,
    comparison: "point-change",
    trendModel: "inflation",
  },
  {
    id: "interest-rates",
    section: "economicHealth",
    name: "Interest rates",
    context: "Federal funds rate",
    icon: "fa-percent",
    seriesId: "FEDFUNDS",
    source: "FRED: Effective Federal Funds Rate",
    cadence: "Monthly average",
    valueKind: "latest",
    valueFormat: "percent",
    decimals: 2,
    comparison: "point-change",
    trendModel: "policy-rate",
  },
  {
    id: "unemployment",
    section: "economicHealth",
    name: "Unemployment",
    context: "Labor market",
    icon: "fa-briefcase",
    seriesId: "UNRATE",
    source: "FRED: Unemployment Rate",
    cadence: "Monthly release",
    valueKind: "latest",
    valueFormat: "percent",
    decimals: 1,
    comparison: "point-change",
    trendModel: "unemployment",
  },
  {
    id: "gdp-growth",
    section: "economicHealth",
    name: "GDP growth",
    context: "Quarterly pace",
    icon: "fa-seedling",
    seriesId: "A191RL1Q225SBEA",
    source: "FRED: Real GDP percent change at annual rate",
    cadence: "Quarterly release",
    valueKind: "latest",
    valueFormat: "percent",
    decimals: 1,
    comparison: "point-change",
    trendModel: "gdp",
  },
  {
    id: "financial-stress",
    section: "riskIndicators",
    name: "Financial stress",
    icon: "fa-gauge-high",
    seriesId: "STLFSI4",
    source: "FRED: St. Louis Fed Financial Stress Index",
    cadence: "Weekly index",
    valueKind: "latest",
    valueFormat: "number",
    decimals: 2,
    comparison: "point-change",
    trendModel: "financial-stress",
  },
];

const WORLD_BANK_REGIONS = [
  {
    id: "united-states",
    name: "United States",
    countryCode: "USA",
    source: "World Bank: GDP growth (annual %)",
  },
  {
    id: "european-union",
    name: "European Union",
    countryCode: "EUU",
    source: "World Bank: GDP growth (annual %)",
  },
  {
    id: "china",
    name: "China",
    countryCode: "CHN",
    source: "World Bank: GDP growth (annual %)",
  },
  {
    id: "low-middle-income",
    name: "Low and middle income",
    countryCode: "LMY",
    source: "World Bank: GDP growth (annual %)",
  },
];

function parseFredCsv(csv) {
  const rows = csv.trim().split(/\r?\n/).slice(1);

  return rows
    .map((row) => {
      const [date, rawValue] = row.split(",");
      const value = Number.parseFloat(rawValue);

      if (!date || Number.isNaN(value)) {
        return null;
      }

      return { date, value };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchWithTimeout(url, options = {}) {
  const { timeoutMs = UPSTREAM_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function percentChange(current, previous) {
  if (!previous) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatNumber(value, decimals) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

function formatValue(value, series) {
  if (series.valueFormat === "currency") {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      maximumFractionDigits: series.decimals,
      minimumFractionDigits: series.decimals,
      style: "currency",
    }).format(value);
  }

  if (series.valueFormat === "percent") {
    return `${value.toFixed(series.decimals)}%`;
  }

  return formatNumber(value, series.decimals);
}

function formatPercentChange(value) {
  if (value === null || Math.abs(value) < 0.05) {
    return "No change";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatPointChange(value) {
  if (Math.abs(value) < 0.005) {
    return "No change";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(2)} pts`;
}

function buildValues(observations, series) {
  if (series.valueKind === "year-over-year") {
    return observations
      .map((observation, index) => {
        const previousYear = observations[index - 12];
        const value = percentChange(observation.value, previousYear?.value);

        if (value === null) {
          return null;
        }

        return { date: observation.date, value };
      })
      .filter(Boolean);
  }

  return observations;
}

function classifyTrend(series, latest, previous) {
  const delta = latest - previous;
  const pctDelta = percentChange(latest, previous) || 0;

  if (series.trendModel === "market") {
    if (Math.abs(pctDelta) < 0.1) return { trend: "Little changed", tone: "stable" };
    return pctDelta > 0 ? { trend: "Higher", tone: "up" } : { trend: "Lower", tone: "down" };
  }

  if (series.trendModel === "bond-price") {
    if (Math.abs(pctDelta) < 0.1) return { trend: "Little changed", tone: "stable" };
    return pctDelta > 0 ? { trend: "Higher", tone: "up" } : { trend: "Lower", tone: "mixed" };
  }

  if (series.trendModel === "dollar") {
    if (Math.abs(pctDelta) < 0.15) return { trend: "Stable", tone: "stable" };
    return pctDelta > 0 ? { trend: "Stronger", tone: "mixed" } : { trend: "Softer", tone: "stable" };
  }

  if (series.trendModel === "commodity") {
    if (Math.abs(pctDelta) < 0.5) return { trend: "Stable", tone: "stable" };
    return pctDelta > 0 ? { trend: "Rising", tone: "caution" } : { trend: "Falling", tone: "mixed" };
  }

  if (series.trendModel === "inflation") {
    if (latest >= 3) return { trend: delta < -0.05 ? "Cooling" : "Elevated", tone: "caution" };
    return { trend: "Contained", tone: "stable" };
  }

  if (series.trendModel === "policy-rate") {
    if (Math.abs(delta) < 0.05) return { trend: "Stable", tone: "stable" };
    return delta > 0 ? { trend: "Rising", tone: "caution" } : { trend: "Falling", tone: "mixed" };
  }

  if (series.trendModel === "unemployment") {
    if (latest >= 4.8 || delta > 0.2) return { trend: "Softening", tone: "caution" };
    return { trend: "Stable", tone: "stable" };
  }

  if (series.trendModel === "gdp") {
    if (latest >= 1.5) return { trend: "Positive", tone: "up" };
    if (latest >= 0) return { trend: "Slow", tone: "mixed" };
    return { trend: "Contracting", tone: "caution" };
  }

  if (series.trendModel === "volatility") {
    if (latest < 18) return { trend: "Contained", tone: "up" };
    if (latest < 25) return { trend: "Watch", tone: "mixed" };
    return { trend: "Elevated", tone: "caution" };
  }

  if (series.trendModel === "credit-market") {
    if (Math.abs(pctDelta) < 0.15) return { trend: "Stable", tone: "stable" };
    return pctDelta > 0 ? { trend: "Improving", tone: "up" } : { trend: "Softer", tone: "caution" };
  }

  if (series.trendModel === "financial-stress") {
    if (latest < 0) return { trend: "Below average", tone: "up" };
    if (latest < 1) return { trend: "Normal", tone: "stable" };
    return { trend: "Elevated", tone: "caution" };
  }

  return { trend: "Updated", tone: "stable" };
}

function buildRiskCopy(series, value, change) {
  if (value === "Unavailable") {
    return `${series.name} could not be loaded from its public source.`;
  }

  if (series.trendModel === "volatility") {
    return `The VIX is ${value}, with a ${change.toLowerCase()} move from the prior close.`;
  }

  if (series.trendModel === "credit-market") {
    return `Credit markets are ${value}, with a ${change.toLowerCase()} move from the prior close.`;
  }

  return `Financial stress is ${value}, ${change.toLowerCase()} from the prior weekly reading.`;
}

function unavailableFredItem(series) {
  const base = {
    id: series.id,
    section: series.section,
    name: series.name,
    context: series.context,
    value: "Unavailable",
    trend: "Unavailable",
    tone: "stable",
    icon: series.icon,
    source: series.source,
    cadence: series.cadence,
    previous: "Unavailable",
    change: "Unavailable",
    points: [],
    sourceStatus: "Unavailable",
  };

  if (series.section === "riskIndicators") {
    return {
      ...base,
      copy: buildRiskCopy(series, base.value, base.change),
    };
  }

  return base;
}

async function fetchFredSeries(series) {
  const url = `${FRED_GRAPH_BASE_URL}?id=${series.seriesId}`;
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "text/csv",
    },
  });

  if (!response.ok) {
    throw new Error(`FRED returned ${response.status} for ${series.seriesId}`);
  }

  const observations = parseFredCsv(await response.text());
  const values = buildValues(observations, series);

  if (values.length < 2) {
    throw new Error(`FRED series ${series.seriesId} did not include enough observations`);
  }

  const latest = values.at(-1);
  const previous = values.at(-2);
  const classification = classifyTrend(series, latest.value, previous.value);
  const change =
    series.comparison === "percent-change"
      ? formatPercentChange(percentChange(latest.value, previous.value))
      : formatPointChange(latest.value - previous.value);
  const displayValue = formatValue(latest.value, series);

  const base = {
    id: series.id,
    section: series.section,
    name: series.name,
    context: series.context,
    value: displayValue,
    trend: classification.trend,
    tone: classification.tone,
    icon: series.icon,
    source: series.source,
    cadence: series.cadence,
    previous: formatValue(previous.value, series),
    change,
    points: values.slice(-7).map((point) => Number(point.value.toFixed(2))),
    releaseDate: latest.date,
    sourceStatus: "Source-backed",
  };

  if (series.section === "riskIndicators") {
    return {
      ...base,
      copy: buildRiskCopy(series, displayValue, change),
    };
  }

  return base;
}

async function fetchYahooSeries(series) {
  const url = `${YAHOO_CHART_BASE_URL}/${encodeURIComponent(series.symbol)}?range=15d&interval=1d`;
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Mercury dashboard source bridge",
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance returned ${response.status} for ${series.symbol}`);
  }

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const closes = result?.indicators?.quote?.[0]?.close || [];
  const values = timestamps
    .map((timestamp, index) => {
      const value = closes[index];

      if (!Number.isFinite(value)) {
        return null;
      }

      return {
        date: new Date(timestamp * 1000).toISOString().slice(0, 10),
        value,
      };
    })
    .filter(Boolean);

  if (values.length < 2) {
    throw new Error(`Yahoo Finance did not include enough observations for ${series.symbol}`);
  }

  const latest = values.at(-1);
  const previous = values.at(-2);
  const classification = classifyTrend(series, latest.value, previous.value);
  const change =
    series.comparison === "percent-change"
      ? formatPercentChange(percentChange(latest.value, previous.value))
      : formatPointChange(latest.value - previous.value);
  const displayValue = formatValue(latest.value, series);

  const base = {
    id: series.id,
    section: series.section,
    name: series.name,
    context: series.context,
    value: displayValue,
    trend: classification.trend,
    tone: classification.tone,
    icon: series.icon,
    source: series.source,
    cadence: series.cadence,
    previous: formatValue(previous.value, series),
    change,
    points: values.slice(-7).map((point) => Number(point.value.toFixed(2))),
    releaseDate: latest.date,
    sourceStatus: "Source-backed",
  };

  if (series.section === "riskIndicators") {
    return {
      ...base,
      copy: buildRiskCopy(series, displayValue, change),
    };
  }

  return base;
}

function unavailableRegion(region) {
  return {
    id: region.id,
    name: region.name,
    copy: `${region.name} growth could not be loaded from its public source.`,
    trend: "Unavailable",
    tone: "stable",
    source: region.source,
    cadence: "Annual release",
    sourceStatus: "Unavailable",
  };
}

function classifyRegionalGrowth(latest, previous) {
  const delta = latest - previous;

  if (latest >= 3) return { trend: delta >= 0 ? "Accelerating" : "Positive", tone: "up" };
  if (latest >= 1) return { trend: "Moderate", tone: "stable" };
  if (latest >= 0) return { trend: "Slow", tone: "mixed" };
  return { trend: "Contracting", tone: "caution" };
}

async function fetchWorldBankRegion(region) {
  const url = `${WORLD_BANK_BASE_URL}/country/${region.countryCode}/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=80`;
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`World Bank returned ${response.status} for ${region.countryCode}`);
  }

  const payload = await response.json();
  const rows = Array.isArray(payload?.[1]) ? payload[1] : [];
  const observations = rows
    .filter((row) => row?.date && typeof row.value === "number")
    .map((row) => ({ date: row.date, value: row.value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (observations.length < 2) {
    throw new Error(`World Bank did not include enough GDP observations for ${region.countryCode}`);
  }

  const latest = observations.at(-1);
  const previous = observations.at(-2);
  const classification = classifyRegionalGrowth(latest.value, previous.value);
  const value = `${latest.value.toFixed(1)}%`;
  const change = formatPointChange(latest.value - previous.value);

  return {
    id: region.id,
    name: region.name,
    copy: `Latest annual GDP growth is ${value}, ${change.toLowerCase()} from ${previous.date}.`,
    trend: classification.trend,
    tone: classification.tone,
    source: region.source,
    cadence: "Annual release",
    releaseDate: latest.date,
    sourceStatus: "Source-backed",
  };
}

function sectionScore(items) {
  const toneScores = {
    up: 78,
    stable: 64,
    mixed: 52,
    caution: 38,
    down: 30,
  };

  const scores = items
    .filter((item) => item.sourceStatus === "Source-backed")
    .map((item) => toneScores[item.tone])
    .filter((score) => Number.isFinite(score));

  if (!scores.length) {
    return null;
  }

  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

function sectionLabel(score) {
  if (score === null) return "Unavailable";
  if (score >= 70) return "Firm";
  if (score >= 58) return "Steady";
  if (score >= 46) return "Mixed";
  return "Under pressure";
}

function buildSummary(sections) {
  const marketScore = sectionScore(sections.marketPulse);
  const economicScore = sectionScore(sections.economicHealth);
  const riskScore = sectionScore(sections.riskIndicators);
  const regionalScore = sectionScore(sections.regions);
  const scores = [marketScore, economicScore, riskScore, regionalScore].filter(Number.isFinite);
  const score = scores.length
    ? Math.round(scores.reduce((total, item) => total + item, 0) / scores.length)
    : null;

  let title = "Live data unavailable";
  if (score !== null) {
    title = "Mixed but steady";
    if (score >= 70) title = "Broadly firm";
    if (score < 56) title = "Uneven conditions";
    if (score < 45) title = "Pressure building";
  }

  return {
    score: score ?? 0,
    title,
    copy:
      "Mercury is using public market, economic, risk, and regional releases to summarize the current global economy without investment advice.",
    drivers: [
      { label: "Market pulse", value: sectionLabel(marketScore) },
      { label: "Economic health", value: sectionLabel(economicScore) },
      { label: "Risk tone", value: sectionLabel(riskScore) },
      { label: "Regional growth", value: sectionLabel(regionalScore) },
    ],
  };
}

function groupBySection(items, regions) {
  return {
    marketPulse: items.filter((item) => item.section === "marketPulse"),
    economicHealth: items.filter((item) => item.section === "economicHealth"),
    riskIndicators: items.filter((item) => item.section === "riskIndicators"),
    regions,
  };
}

async function buildSnapshot() {
  const yahooResults = await Promise.allSettled(YAHOO_SERIES.map(fetchYahooSeries));
  const yahooItems = yahooResults.map((result, index) =>
    result.status === "fulfilled" ? result.value : unavailableFredItem(YAHOO_SERIES[index]),
  );
  const fredResults = await Promise.allSettled(FRED_SERIES.map(fetchFredSeries));
  const fredItems = fredResults.map((result, index) =>
    result.status === "fulfilled" ? result.value : unavailableFredItem(FRED_SERIES[index]),
  );
  const regionResults = await Promise.allSettled(WORLD_BANK_REGIONS.map(fetchWorldBankRegion));
  const regions = regionResults.map((result, index) =>
    result.status === "fulfilled" ? result.value : unavailableRegion(WORLD_BANK_REGIONS[index]),
  );
  const sourceItems = [...yahooItems, ...fredItems];
  const sections = groupBySection(sourceItems, regions);
  const releaseDates = [
    ...sourceItems.map((item) => item.releaseDate),
    ...regions.map((region) => region.releaseDate),
  ].filter(Boolean);
  const unavailableCount = [...sourceItems, ...regions].filter(
    (item) => item.sourceStatus !== "Source-backed",
  ).length;

  return {
    status: unavailableCount ? "partial" : "ready",
    checkedAt: new Date().toISOString(),
    source: "Yahoo Finance, FRED, and World Bank public data",
    coverage: "Market Pulse, Economic Health, Risk and Confidence, Global Snapshot",
    releaseRange: {
      earliest: releaseDates.slice().sort()[0] || null,
      latest: releaseDates.slice().sort().at(-1) || null,
    },
    summary: buildSummary(sections),
    ...sections,
  };
}

async function handler(req, res) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const snapshot = await buildSnapshot();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=21600");
    res.statusCode = 200;
    res.end(JSON.stringify(snapshot));
  } catch (error) {
    console.error(error);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.statusCode = 502;
    res.end(
      JSON.stringify({
        status: "unavailable",
        error: "Live public data is unavailable. Mercury is showing source status instead of sample figures.",
      }),
    );
  }
}

module.exports = handler;
module.exports._internals = {
  buildSummary,
  buildValues,
  classifyRegionalGrowth,
  classifyTrend,
  fetchWorldBankRegion,
  parseFredCsv,
};
