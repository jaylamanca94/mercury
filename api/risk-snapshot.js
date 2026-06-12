const FRED_GRAPH_BASE_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";
const DAY_MS = 24 * 60 * 60 * 1000;

const SERIES = [
  {
    id: "volatility",
    name: "Volatility",
    seriesId: "VIXCLS",
    source: "FRED: CBOE Volatility Index",
    cadence: "Daily close",
    sourceUnit: "Index level",
    sourceFrequency: "Daily",
    valueKind: "index",
    decimals: 2,
    delayedAfterDays: 4,
    staleAfterDays: 8,
  },
  {
    id: "dollar-strength",
    name: "Dollar strength",
    seriesId: "DTWEXBGS",
    source: "FRED: Nominal Broad U.S. Dollar Index",
    cadence: "Daily release",
    sourceUnit: "Index level",
    sourceFrequency: "Daily",
    valueKind: "index",
    decimals: 2,
    delayedAfterDays: 6,
    staleAfterDays: 12,
  },
  {
    id: "gold",
    name: "Gold",
    seriesId: "GOLDAMGBD228NLBM",
    source: "FRED: Gold Fixing Price",
    cadence: "Daily fixing",
    sourceUnit: "U.S. dollars per troy ounce",
    sourceFrequency: "Daily",
    valueKind: "price",
    decimals: 2,
    delayedAfterDays: 9,
    staleAfterDays: 16,
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

function formatValue(value, series) {
  if (series.valueKind === "price") {
    return `$${value.toLocaleString("en", {
      maximumFractionDigits: series.decimals,
      minimumFractionDigits: series.decimals,
    })}`;
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
      freshnessCopy: "Risk observation date could not be verified.",
      ageDays: null,
    };
  }

  if (ageDays > series.staleAfterDays) {
    return {
      freshnessStatus: "Stale risk data",
      freshnessTone: "caution",
      freshnessCopy: `Latest observation is ${ageDays} days old, beyond the expected ${series.cadence.toLowerCase()}.`,
      ageDays,
    };
  }

  if (ageDays > series.delayedAfterDays) {
    return {
      freshnessStatus: "Delayed risk data",
      freshnessTone: "mixed",
      freshnessCopy: `Latest observation is ${ageDays} days old and may be waiting on the next ${series.cadence.toLowerCase()}.`,
      ageDays,
    };
  }

  return {
    freshnessStatus: "Current risk data",
    freshnessTone: "stable",
    freshnessCopy: `Latest observation is ${ageDays} days old and within the expected ${series.cadence.toLowerCase()}.`,
    ageDays,
  };
}

function classifyTrend(seriesId, latest, previous) {
  const changePercent = percentChange(latest, previous) || 0;

  if (seriesId === "VIXCLS") {
    if (latest >= 25) {
      return { trend: "Elevated risk", tone: "caution" };
    }

    if (latest >= 15) {
      return { trend: "Watch", tone: "mixed" };
    }

    return { trend: "Contained", tone: "up" };
  }

  if (seriesId === "DTWEXBGS") {
    if (Math.abs(changePercent) < 0.15) {
      return { trend: "Stable", tone: "stable" };
    }

    return changePercent > 0
      ? { trend: "Dollar firmer", tone: "caution" }
      : { trend: "Dollar softer", tone: "mixed" };
  }

  if (seriesId === "GOLDAMGBD228NLBM") {
    if (Math.abs(changePercent) < 0.5) {
      return { trend: "Stable", tone: "stable" };
    }

    return changePercent > 0
      ? { trend: "Rising", tone: "caution" }
      : { trend: "Falling", tone: "mixed" };
  }

  return { trend: "Updated", tone: "stable" };
}

function buildRiskCopy(series, latest, previous) {
  const value = formatValue(latest, series);
  const change = formatSignedPercent(percentChange(latest, previous) || 0);

  if (series.seriesId === "VIXCLS") {
    if (latest >= 25) {
      return `VIX is ${value}, an elevated volatility reading versus the prior close.`;
    }

    if (latest >= 15) {
      return `VIX is ${value}, pointing to moderate market uncertainty.`;
    }

    return `VIX is ${value}, below recent stress levels.`;
  }

  if (series.seriesId === "DTWEXBGS") {
    return `Broad dollar index is ${value}, ${change} from the prior observation.`;
  }

  if (series.seriesId === "GOLDAMGBD228NLBM") {
    return `Gold is ${value} per ounce, ${change} from the prior fixing.`;
  }

  return `${series.name} is ${value}, ${change} from the prior observation.`;
}

function buildRiskIndicator(series, observations, checkedAt) {
  if (observations.length < 2) {
    throw new Error(`FRED series ${series.seriesId} did not include enough observations`);
  }

  const latest = observations.at(-1);
  const previous = observations.at(-2);
  const classification = classifyTrend(series.seriesId, latest.value, previous.value);
  const freshness = classifyFreshness(latest.date, checkedAt, series);

  return {
    id: series.id,
    name: series.name,
    copy: buildRiskCopy(series, latest.value, previous.value),
    trend: classification.trend,
    tone: classification.tone,
    icon:
      series.id === "volatility"
        ? "fa-wave-square"
        : series.id === "dollar-strength"
          ? "fa-dollar-sign"
          : "fa-coins",
    source: series.source,
    cadence: series.cadence,
    sourceUnit: series.sourceUnit,
    sourceFrequency: series.sourceFrequency,
    value: formatValue(latest.value, series),
    previous: formatValue(previous.value, series),
    change: formatSignedPercent(percentChange(latest.value, previous.value) || 0),
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

  return buildRiskIndicator(series, parseFredCsv(await response.text()), checkedAt);
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
      label: "Risk data unavailable",
      summary: "No Risk and Confidence indicators loaded; Mercury is keeping sample risk values visible.",
    };
  }

  if (issues.length > 0) {
    return {
      status: "partial",
      label: "Partial risk coverage",
      summary: `${indicators.length} of ${SERIES.length} Risk and Confidence indicators loaded from FRED; sample fallback remains visible for unavailable risk signals.`,
    };
  }

  const staleCount = indicators.filter((indicator) => indicator.freshnessStatus === "Stale risk data").length;
  const delayedCount = indicators.filter((indicator) => indicator.freshnessStatus === "Delayed risk data").length;

  if (staleCount > 0) {
    return {
      status: "stale",
      label: "Risk data stale",
      summary: `${staleCount} risk indicator${staleCount === 1 ? " is" : "s are"} older than Mercury's expected cadence.`,
    };
  }

  if (delayedCount > 0) {
    return {
      status: "delayed",
      label: "Risk data delayed",
      summary: `${delayedCount} risk indicator${delayedCount === 1 ? " is" : "s are"} past the usual observation window.`,
    };
  }

  return {
    status: "ready",
    label: "Risk data current",
    summary: "All Risk and Confidence indicators loaded from FRED within the expected observation cadence.",
  };
}

function buildSourceAudit(indicators, issues, checkedAt = null) {
  const releaseDates = indicators.map((indicator) => indicator.releaseDate).sort();

  return {
    checkedAt,
    coverage: {
      area: "Risk and Confidence",
      loaded: indicators.length,
      total: SERIES.length,
      unavailable: issues.length,
    },
    releaseRange: {
      earliest: releaseDates[0] || null,
      latest: releaseDates.at(-1) || null,
    },
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
      .filter(Boolean);

    if (indicators.length === 0) {
      throw new Error("No Risk and Confidence indicators loaded");
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
        coverage: "Risk and Confidence",
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
          label: "Risk data unavailable",
          summary: "No Risk and Confidence indicators loaded; Mercury is keeping sample risk values visible.",
        },
        error: "Risk data is unavailable. Mercury is keeping the sample fallback visible.",
      }),
    );
  }
}

module.exports = handler;
module.exports._internals = {
  buildRiskCopy,
  buildRiskIndicator,
  buildSourceAudit,
  classifyFreshness,
  classifyTrend,
  parseFredCsv,
  summarizeSourceHealth,
};
