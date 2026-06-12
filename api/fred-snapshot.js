const FRED_GRAPH_BASE_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";

const SERIES = [
  {
    id: "inflation",
    name: "Inflation",
    context: "Consumer prices",
    icon: "fa-receipt",
    seriesId: "CPIAUCSL",
    source: "FRED: Consumer Price Index for All Urban Consumers",
    cadence: "Monthly release",
    valueKind: "year-over-year",
    decimals: 1,
  },
  {
    id: "interest-rates",
    name: "Interest rates",
    context: "Federal funds rate",
    icon: "fa-percent",
    seriesId: "FEDFUNDS",
    source: "FRED: Effective Federal Funds Rate",
    cadence: "Monthly average",
    valueKind: "latest",
    decimals: 2,
  },
  {
    id: "unemployment",
    name: "Unemployment",
    context: "Labor market",
    icon: "fa-briefcase",
    seriesId: "UNRATE",
    source: "FRED: Unemployment Rate",
    cadence: "Monthly release",
    valueKind: "latest",
    decimals: 1,
  },
  {
    id: "gdp-growth",
    name: "GDP growth",
    context: "Quarterly pace",
    icon: "fa-seedling",
    seriesId: "A191RL1Q225SBEA",
    source: "FRED: Real GDP percent change at annual rate",
    cadence: "Quarterly release",
    valueKind: "latest",
    decimals: 1,
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

async function fetchSeries(series) {
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
  const values = buildValues(observations, series);

  if (values.length < 2) {
    throw new Error(`FRED series ${series.seriesId} did not include enough observations`);
  }

  const latest = values.at(-1);
  const previous = values.at(-2);
  const classification = classifyTrend(series.seriesId, latest.value, previous.value);

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
    previous: formatPercent(previous.value, series.decimals),
    change: formatPointChange(latest.value - previous.value),
    points: values.slice(-7).map((point) => Number(point.value.toFixed(2))),
    releaseDate: latest.date,
    sourceStatus: "Source-backed",
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
    const indicators = await Promise.all(SERIES.map(fetchSeries));
    const releaseDates = indicators.map((indicator) => indicator.releaseDate);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=21600");
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: "ready",
        checkedAt: new Date().toISOString(),
        source: "Federal Reserve Economic Data (FRED)",
        coverage: "Economic Health",
        releaseRange: {
          earliest: releaseDates.slice().sort()[0],
          latest: releaseDates.slice().sort().at(-1),
        },
        indicators,
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
        error: "FRED data is unavailable. Mercury is keeping the sample fallback visible.",
      }),
    );
  }
}

module.exports = handler;
module.exports._internals = {
  buildValues,
  classifyTrend,
  parseFredCsv,
};
