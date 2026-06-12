const FRED_GRAPH_BASE_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";
const DAY_MS = 24 * 60 * 60 * 1000;
const DASHBOARD_MARKET_TOTAL = 4;

const SERIES = [
  {
    id: "us-markets",
    name: "U.S. markets",
    context: "S&P 500 close",
    icon: "fa-chart-line",
    seriesId: "SP500",
    source: "FRED: S&P 500",
    cadence: "Daily close",
    sourceUnit: "Index level",
    sourceFrequency: "Daily",
    valueKind: "index",
    decimals: 2,
    delayedAfterDays: 4,
    staleAfterDays: 8,
  },
  {
    id: "bonds",
    name: "10-year yield",
    context: "Treasury rate",
    icon: "fa-scale-balanced",
    seriesId: "DGS10",
    source: "FRED: 10-Year Treasury Constant Maturity Rate",
    cadence: "Daily release",
    sourceUnit: "Percent",
    sourceFrequency: "Daily",
    valueKind: "rate",
    decimals: 2,
    delayedAfterDays: 4,
    staleAfterDays: 8,
  },
  {
    id: "oil",
    name: "Oil",
    context: "WTI crude price",
    icon: "fa-gas-pump",
    seriesId: "DCOILWTICO",
    source: "FRED: WTI Crude Oil Price",
    cadence: "Daily release",
    sourceUnit: "U.S. dollars per barrel",
    sourceFrequency: "Daily",
    valueKind: "price",
    decimals: 2,
    delayedAfterDays: 9,
    staleAfterDays: 16,
  },
];

const SOURCE_GAPS = [
  {
    id: "international",
    name: "International",
    source: "Market Pulse source selection",
    cadence: "Provider selection pending",
    sourceUnit: "Not selected",
    sourceFrequency: "Not selected",
    status: "Sample fallback",
    reason: "No durable public source has been selected yet for the International market pulse card.",
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

function percentChange(current, previous) {
  if (!previous) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatSignedPercent(value, decimals = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

function formatPointChange(value) {
  if (Math.abs(value) < 0.005) {
    return "No change";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(2)} pts`;
}

function formatMarketValue(value, series) {
  if (series.valueKind === "price") {
    return `$${value.toFixed(series.decimals)}`;
  }

  if (series.valueKind === "rate") {
    return `${value.toFixed(series.decimals)}%`;
  }

  return value.toLocaleString("en", {
    maximumFractionDigits: series.decimals,
    minimumFractionDigits: series.decimals,
  });
}

function daysSinceRelease(releaseDate, checkedAt) {
  const releaseTime = new Date(`${releaseDate}T00:00:00Z`).getTime();
  const checkedTime = new Date(checkedAt).getTime();

  if (Number.isNaN(releaseTime) || Number.isNaN(checkedTime)) {
    return null;
  }

  return Math.max(0, Math.floor((checkedTime - releaseTime) / DAY_MS));
}

function classifyFreshness(releaseDate, checkedAt, series) {
  const ageDays = daysSinceRelease(releaseDate, checkedAt);

  if (ageDays === null) {
    return {
      freshnessStatus: "Unknown freshness",
      freshnessTone: "mixed",
      freshnessCopy: "Market observation date could not be verified.",
      ageDays: null,
    };
  }

  if (ageDays > series.staleAfterDays) {
    return {
      freshnessStatus: "Stale market data",
      freshnessTone: "caution",
      freshnessCopy: `Latest observation is ${ageDays} days old, beyond the expected ${series.cadence.toLowerCase()}.`,
      ageDays,
    };
  }

  if (ageDays > series.delayedAfterDays) {
    return {
      freshnessStatus: "Delayed market data",
      freshnessTone: "mixed",
      freshnessCopy: `Latest observation is ${ageDays} days old and may be waiting on the next ${series.cadence.toLowerCase()}.`,
      ageDays,
    };
  }

  return {
    freshnessStatus: "Current market data",
    freshnessTone: "stable",
    freshnessCopy: `Latest observation is ${ageDays} days old and within the expected ${series.cadence.toLowerCase()}.`,
    ageDays,
  };
}

function classifyTrend(series, latest, previous) {
  const delta = latest - previous;

  if (series.valueKind === "rate") {
    if (Math.abs(delta) < 0.03) {
      return { trend: "Stable", tone: "stable" };
    }

    return delta > 0
      ? { trend: "Yields rising", tone: "caution" }
      : { trend: "Yields falling", tone: "mixed" };
  }

  const changePercent = percentChange(latest, previous) || 0;

  if (series.valueKind === "price") {
    if (Math.abs(changePercent) < 0.5) {
      return { trend: "Stable", tone: "stable" };
    }

    return changePercent > 0
      ? { trend: "Rising", tone: "caution" }
      : { trend: "Falling", tone: "mixed" };
  }

  if (Math.abs(changePercent) < 0.2) {
    return { trend: "Stable", tone: "stable" };
  }

  return changePercent > 0 ? { trend: "Up", tone: "up" } : { trend: "Down", tone: "down" };
}

function buildMarketIndicator(series, observations, checkedAt) {
  if (observations.length < 2) {
    throw new Error(`FRED series ${series.seriesId} did not include enough observations`);
  }

  const latest = observations.at(-1);
  const previous = observations.at(-2);
  const classification = classifyTrend(series, latest.value, previous.value);
  const freshness = classifyFreshness(latest.date, checkedAt, series);
  const changePercent = percentChange(latest.value, previous.value);

  return {
    id: series.id,
    name: series.name,
    context: series.context,
    value: formatMarketValue(latest.value, series),
    trend: classification.trend,
    tone: classification.tone,
    icon: series.icon,
    source: series.source,
    cadence: series.cadence,
    sourceUnit: series.sourceUnit,
    sourceFrequency: series.sourceFrequency,
    previous: formatMarketValue(previous.value, series),
    change:
      series.valueKind === "rate"
        ? formatPointChange(latest.value - previous.value)
        : formatSignedPercent(changePercent || 0),
    points: observations.slice(-7).map((point) => Number(point.value.toFixed(2))),
    releaseDate: latest.date,
    previousReleaseDate: previous.date,
    sourceStatus: "Source-backed",
    ...freshness,
  };
}

async function fetchSeries(series, checkedAt) {
  const url = `${FRED_GRAPH_BASE_URL}?id=${series.seriesId}`;
  const response = await fetch(url, {
    headers: {
      accept: "text/csv",
    },
  });

  if (!response.ok) {
    throw new Error(`FRED returned ${response.status} for ${series.seriesId}`);
  }

  return buildMarketIndicator(series, parseFredCsv(await response.text()), checkedAt);
}

function serializeIssue(series, error) {
  return {
    id: series.id,
    name: series.name,
    source: series.source,
    cadence: series.cadence,
    sourceUnit: series.sourceUnit,
    sourceFrequency: series.sourceFrequency,
    status: "Unavailable",
    reason: error instanceof Error ? error.message : "Unknown FRED source error",
  };
}

function summarizeSourceHealth(indicators, issues) {
  if (indicators.length === 0) {
    return {
      status: "unavailable",
      label: "Market data unavailable",
      summary: "No Market Pulse indicators loaded; Mercury is keeping sample market values visible.",
    };
  }

  if (issues.length > 0 || indicators.length < DASHBOARD_MARKET_TOTAL) {
    return {
      status: "partial",
      label: "Partial market coverage",
      summary: `${indicators.length} of ${DASHBOARD_MARKET_TOTAL} Market Pulse indicators loaded from FRED; remaining cards keep sample fallback values.`,
    };
  }

  const staleCount = indicators.filter((indicator) => indicator.freshnessStatus === "Stale market data").length;
  const delayedCount = indicators.filter((indicator) => indicator.freshnessStatus === "Delayed market data").length;

  if (staleCount > 0) {
    return {
      status: "stale",
      label: "Market data stale",
      summary: `${staleCount} Market Pulse indicator${staleCount === 1 ? " is" : "s are"} older than Mercury's expected cadence.`,
    };
  }

  if (delayedCount > 0) {
    return {
      status: "delayed",
      label: "Market data delayed",
      summary: `${delayedCount} Market Pulse indicator${delayedCount === 1 ? " is" : "s are"} past the usual observation window.`,
    };
  }

  return {
    status: "ready",
    label: "Market data current",
    summary: "All Market Pulse indicators loaded from FRED within the expected observation cadence.",
  };
}

function buildSourceAudit(indicators, issues, checkedAt = null) {
  const releaseDates = indicators.map((indicator) => indicator.releaseDate).sort();

  return {
    checkedAt,
    coverage: {
      area: "Market Pulse",
      loaded: indicators.length,
      total: DASHBOARD_MARKET_TOTAL,
      unavailable: Math.max(0, DASHBOARD_MARKET_TOTAL - indicators.length),
    },
    releaseRange: {
      earliest: releaseDates[0] || null,
      latest: releaseDates.at(-1) || null,
    },
    gaps: issues,
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
    const checkedAt = new Date().toISOString();
    const results = await Promise.allSettled(SERIES.map((series) => fetchSeries(series, checkedAt)));
    const indicators = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    const issues = results
      .map((result, index) =>
        result.status === "rejected" ? serializeIssue(SERIES[index], result.reason) : null,
      )
      .filter(Boolean)
      .concat(SOURCE_GAPS);

    if (indicators.length === 0) {
      throw new Error("No Market Pulse indicators loaded");
    }

    const sourceHealth = summarizeSourceHealth(indicators, issues);
    const sourceAudit = buildSourceAudit(indicators, issues, checkedAt);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: sourceHealth.status,
        checkedAt,
        source: "Federal Reserve Economic Data (FRED)",
        coverage: "Market Pulse",
        sourceHealth: {
          ...sourceHealth,
          ...sourceAudit,
        },
        sourceAudit,
        releaseRange: sourceAudit.releaseRange,
        indicators,
        issues,
      }),
    );
  } catch (error) {
    console.error(error);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.statusCode = 502;
    res.end(
      JSON.stringify({
        status: "unavailable",
        sourceHealth: {
          status: "unavailable",
          label: "Market data unavailable",
          summary: "No Market Pulse indicators loaded; Mercury is keeping sample market values visible.",
        },
        error: "Market data is unavailable. Mercury is keeping the sample fallback visible.",
      }),
    );
  }
}

module.exports = handler;
module.exports._internals = {
  buildMarketIndicator,
  buildSourceAudit,
  classifyFreshness,
  classifyTrend,
  parseFredCsv,
  summarizeSourceHealth,
};
