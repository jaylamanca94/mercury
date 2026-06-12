const FRED_GRAPH_BASE_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";
const DAY_MS = 24 * 60 * 60 * 1000;

const SERIES = [
  {
    id: "inflation",
    name: "Inflation",
    context: "Consumer prices",
    icon: "fa-receipt",
    seriesId: "CPIAUCSL",
    source: "FRED: Consumer Price Index for All Urban Consumers",
    cadence: "Monthly release",
    sourceUnit: "Year-over-year percent change",
    sourceFrequency: "Monthly",
    valueKind: "year-over-year",
    decimals: 1,
    delayedAfterDays: 50,
    staleAfterDays: 85,
  },
  {
    id: "interest-rates",
    name: "Interest rates",
    context: "Federal funds rate",
    icon: "fa-percent",
    seriesId: "FEDFUNDS",
    source: "FRED: Effective Federal Funds Rate",
    cadence: "Monthly average",
    sourceUnit: "Percent",
    sourceFrequency: "Monthly",
    valueKind: "latest",
    decimals: 2,
    delayedAfterDays: 50,
    staleAfterDays: 85,
  },
  {
    id: "unemployment",
    name: "Unemployment",
    context: "Labor market",
    icon: "fa-briefcase",
    seriesId: "UNRATE",
    source: "FRED: Unemployment Rate",
    cadence: "Monthly release",
    sourceUnit: "Percent",
    sourceFrequency: "Monthly",
    valueKind: "latest",
    decimals: 1,
    delayedAfterDays: 50,
    staleAfterDays: 85,
  },
  {
    id: "gdp-growth",
    name: "GDP growth",
    context: "Quarterly pace",
    icon: "fa-seedling",
    seriesId: "A191RL1Q225SBEA",
    source: "FRED: Real GDP percent change at annual rate",
    cadence: "Quarterly release",
    sourceUnit: "Annualized percent change",
    sourceFrequency: "Quarterly",
    valueKind: "latest",
    decimals: 1,
    delayedAfterDays: 125,
    staleAfterDays: 190,
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

function formatPercent(value, decimals) {
  return `${value.toFixed(decimals)}%`;
}

function formatPointChange(value) {
  if (Math.abs(value) < 0.05) {
    return "No change";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)} pts`;
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
      freshnessCopy: "Release date could not be verified.",
      ageDays: null,
    };
  }

  if (ageDays > series.staleAfterDays) {
    return {
      freshnessStatus: "Stale release",
      freshnessTone: "caution",
      freshnessCopy: `Latest release is ${ageDays} days old, beyond the expected ${series.cadence.toLowerCase()}.`,
      ageDays,
    };
  }

  if (ageDays > series.delayedAfterDays) {
    return {
      freshnessStatus: "Delayed release",
      freshnessTone: "mixed",
      freshnessCopy: `Latest release is ${ageDays} days old and may be waiting on the next ${series.cadence.toLowerCase()}.`,
      ageDays,
    };
  }

  return {
    freshnessStatus: "Current release",
    freshnessTone: "stable",
    freshnessCopy: `Latest release is ${ageDays} days old and within the expected ${series.cadence.toLowerCase()}.`,
    ageDays,
  };
}

function buildValues(observations, series) {
  if (series.valueKind === "year-over-year") {
    const values = observations
      .map((observation, index) => {
        const previousYear = observations[index - 12];
        const value = percentChange(observation.value, previousYear?.value);

        if (value === null) {
          return null;
        }

        return { date: observation.date, value };
      })
      .filter(Boolean);

    return values;
  }

  return observations;
}

function classifyTrend(seriesId, latest, previous) {
  const delta = latest - previous;

  if (seriesId === "CPIAUCSL") {
    if (latest >= 3) {
      return { trend: delta < -0.05 ? "Cooling" : "Elevated", tone: "caution" };
    }

    return { trend: "Contained", tone: "stable" };
  }

  if (seriesId === "FEDFUNDS") {
    if (Math.abs(delta) < 0.05) {
      return { trend: "Stable", tone: "stable" };
    }

    return delta > 0
      ? { trend: "Rising", tone: "caution" }
      : { trend: "Falling", tone: "mixed" };
  }

  if (seriesId === "UNRATE") {
    if (latest >= 4.8 || delta > 0.2) {
      return { trend: "Softening", tone: "caution" };
    }

    return { trend: "Stable", tone: "stable" };
  }

  if (seriesId === "A191RL1Q225SBEA") {
    if (latest >= 1.5) {
      return { trend: "Positive", tone: "up" };
    }

    if (latest >= 0) {
      return { trend: "Slow", tone: "mixed" };
    }

    return { trend: "Contracting", tone: "caution" };
  }

  return { trend: "Updated", tone: "stable" };
}

function buildSeriesIndicator(series, observations, checkedAt) {
  const values = buildValues(observations, series);

  if (values.length < 2) {
    throw new Error(`FRED series ${series.seriesId} did not include enough observations`);
  }

  const latest = values.at(-1);
  const previous = values.at(-2);
  const classification = classifyTrend(series.seriesId, latest.value, previous.value);
  const freshness = classifyFreshness(latest.date, checkedAt, series);

  return {
    id: series.id,
    name: series.name,
    context: series.context,
    value: formatPercent(latest.value, series.decimals),
    trend: classification.trend,
    tone: classification.tone,
    icon: series.icon,
    source: series.source,
    cadence: series.cadence,
    sourceUnit: series.sourceUnit,
    sourceFrequency: series.sourceFrequency,
    previous: formatPercent(previous.value, series.decimals),
    change: formatPointChange(latest.value - previous.value),
    points: values.slice(-7).map((point) => Number(point.value.toFixed(2))),
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

  const observations = parseFredCsv(await response.text());

  return buildSeriesIndicator(series, observations, checkedAt);
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
      label: "FRED unavailable",
      summary: "No FRED indicators loaded; Mercury is keeping the sample fallback visible.",
    };
  }

  if (issues.length > 0) {
    return {
      status: "partial",
      label: "Partial FRED coverage",
      summary: `${indicators.length} of ${SERIES.length} FRED indicators loaded; sample fallback remains visible for unavailable releases.`,
    };
  }

  const staleCount = indicators.filter((indicator) => indicator.freshnessStatus === "Stale release").length;
  const delayedCount = indicators.filter((indicator) => indicator.freshnessStatus === "Delayed release").length;

  if (staleCount > 0) {
    return {
      status: "stale",
      label: "FRED releases stale",
      summary: `${staleCount} FRED indicator${staleCount === 1 ? " is" : "s are"} older than Mercury's expected cadence.`,
    };
  }

  if (delayedCount > 0) {
    return {
      status: "delayed",
      label: "FRED releases delayed",
      summary: `${delayedCount} FRED indicator${delayedCount === 1 ? " is" : "s are"} past the usual release window.`,
    };
  }

  return {
    status: "ready",
    label: "FRED releases current",
    summary: "All Economic Health indicators loaded from FRED within the expected release cadence.",
  };
}

function buildSourceAudit(indicators, issues, checkedAt = null) {
  const releaseDates = indicators.map((indicator) => indicator.releaseDate).sort();

  return {
    checkedAt,
    coverage: {
      area: "Economic Health",
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
      throw new Error("No FRED indicators loaded");
    }

    const sourceHealth = summarizeSourceHealth(indicators, issues);
    const sourceAudit = buildSourceAudit(indicators, issues, checkedAt);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=21600");
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: sourceHealth.status,
        checkedAt,
        source: "Federal Reserve Economic Data (FRED)",
        coverage: "Economic Health",
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
          label: "FRED unavailable",
          summary: "No FRED indicators loaded; Mercury is keeping the sample fallback visible.",
        },
        error: "FRED data is unavailable. Mercury is keeping the sample fallback visible.",
      }),
    );
  }
}

module.exports = handler;
module.exports._internals = {
  buildValues,
  buildSeriesIndicator,
  buildSourceAudit,
  classifyFreshness,
  classifyTrend,
  parseFredCsv,
  summarizeSourceHealth,
};
