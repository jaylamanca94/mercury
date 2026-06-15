function pendingMetric(name, context, icon, id, ticker) {
  return {
    ...(id ? { id } : {}),
    name,
    context,
    ...(ticker ? { ticker } : {}),
    value: "Loading",
    trend: "Pending",
    tone: "stable",
    icon,
    source: "Public data",
    cadence: "Checking update schedule",
    previous: "Loading",
    change: "Loading",
    points: [],
    sourceStatus: "Loading",
    freshness: {
      status: "loading",
      label: "Checking freshness",
      detail: "Waiting for the latest release date.",
    },
  };
}

function pendingIndicator(name, icon) {
  return {
    name,
    copy: "Checking the latest public release.",
    trend: "Pending",
    tone: "stable",
    icon,
    source: "Public data",
    cadence: "Checking update schedule",
    sourceStatus: "Loading",
    freshness: {
      status: "loading",
      label: "Checking freshness",
      detail: "Waiting for the latest release date.",
    },
  };
}

function pendingRegion(name) {
  return {
    name,
    copy: "Checking the latest growth release.",
    trend: "Pending",
    tone: "stable",
    source: "World Bank public data",
    cadence: "Checking update schedule",
    sourceStatus: "Loading",
    freshness: {
      status: "loading",
      label: "Checking freshness",
      detail: "Waiting for the latest release date.",
    },
  };
}

let marketPulse = [
  pendingMetric("S&P 500", "Vanguard S&P 500 ETF", "fa-chart-line", "us-equities", "VOO"),
  pendingMetric("Small Cap", "Vanguard Small-Cap Index Fund", "fa-chart-line", "us-small-cap", "VSMAX"),
  pendingMetric("Technology", "Vanguard Information Technology ETF", "fa-microchip", "us-technology", "VGT"),
  pendingMetric("Bonds", "Total bond market ETF", "fa-scale-balanced", "bonds", "BND"),
  pendingMetric("Oil", "WTI crude futures", "fa-gas-pump", "oil", "CL=F"),
  pendingMetric("U.S. dollar", "Dollar index fund proxy", "fa-dollar-sign", "dollar-index", "UUP"),
  pendingMetric("Euro", "EUR/USD exchange rate", "fa-euro-sign", "euro", "EUR/USD"),
  pendingMetric("Yen", "USD/JPY exchange rate", "fa-yen-sign", "yen", "USD/JPY"),
];

let economicHealth = [
  pendingMetric("Inflation", "Consumer prices", "fa-receipt", "inflation", "CPI"),
  pendingMetric("Interest rates", "Federal funds rate", "fa-percent", "interest-rates", "Fed funds"),
  pendingMetric("Unemployment", "Labor market", "fa-briefcase", "unemployment", "UNRATE"),
  pendingMetric("GDP growth", "Quarterly pace", "fa-seedling", "gdp-growth", "GDP"),
];

let riskIndicators = [
  pendingIndicator("Volatility", "fa-wave-square"),
  pendingIndicator("Credit stress", "fa-landmark"),
  pendingIndicator("Financial stress", "fa-gauge-high"),
];

let regions = [
  pendingRegion("United States"),
  pendingRegion("European Union"),
  pendingRegion("China"),
  pendingRegion("Low and middle income"),
];

const PERIOD_OPTIONS = {
  today: {
    label: "Today",
    dailyObservations: 1,
    weeklyObservations: 1,
    monthlyObservations: 1,
    quarterlyObservations: 1,
    annualObservations: 1,
  },
  week: {
    label: "Week",
    dailyObservations: 5,
    weeklyObservations: 1,
    monthlyObservations: 1,
    quarterlyObservations: 1,
    annualObservations: 1,
  },
  month: {
    label: "Month",
    dailyObservations: 21,
    weeklyObservations: 4,
    monthlyObservations: 1,
    quarterlyObservations: 1,
    annualObservations: 1,
  },
  year: {
    label: "Year",
    dailyObservations: 252,
    weeklyObservations: 52,
    monthlyObservations: 12,
    quarterlyObservations: 4,
    annualObservations: 1,
  },
};

const MARKET_ROLE_ORDER = ["large-cap", "small-cap", "technology", "bonds"];
let selectedEconomyPeriod = "week";
let selectedCurrencyPeriod = "week";
let selectedRegion = "Global";

function trendClass(tone) {
  return `trend-label trend-${tone}`;
}

function metricCardTone(metric) {
  if (metric.sourceStatus === "Unavailable" || metric.value === "Unavailable") {
    return "unavailable";
  }

  if (metric.periodTone) {
    return metric.periodTone;
  }

  if (metric.tone) {
    return metric.tone;
  }

  if (metric.change?.trim().startsWith("-")) {
    return "down";
  }

  if (metric.change?.trim().startsWith("+")) {
    return "up";
  }

  return metric.tone || "stable";
}

function metricDeltaLabel(metric) {
  if (metric.periodChange) {
    return metric.periodChange;
  }

  if (metric.change && metric.change !== "Loading" && metric.change !== "Unavailable") {
    return metric.change;
  }

  return metric.trend || "Pending";
}

function metricValueClass(value) {
  return String(value).length > 8 ? "metric-value metric-value-long" : "metric-value";
}

function signalValueClass(value) {
  return String(value).length > 8 ? "signal-value signal-value-long" : "signal-value";
}

function periodOption(period) {
  return PERIOD_OPTIONS[period] || PERIOD_OPTIONS.today;
}

function periodObservationCount(metric, period) {
  const option = periodOption(period);
  const cadence = inferDisplayCadence(metric.cadence);

  if (cadence === "weekly") return option.weeklyObservations;
  if (cadence === "monthly") return option.monthlyObservations;
  if (cadence === "quarterly") return option.quarterlyObservations;
  if (cadence === "annual") return option.annualObservations;

  return option.dailyObservations;
}

function signedNumber(value, decimals = 1) {
  if (!Number.isFinite(value) || Math.abs(value) < 0.005) {
    return "0.0";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}`;
}

function formatDeltaLabel(value, comparison) {
  if (!Number.isFinite(value)) {
    return "Unavailable";
  }

  if (Math.abs(value) < 0.005) {
    return "No change";
  }

  if (comparison === "point-change") {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)} pts`;
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function periodTone(value) {
  if (!Number.isFinite(value) || Math.abs(value) < 0.005) {
    return "stable";
  }

  return value > 0 ? "up" : "down";
}

function metricPeriodDelta(metric, period) {
  const history = Array.isArray(metric.history) ? metric.history : [];

  if (metric.sourceStatus !== "Source-backed" || history.length < 2) {
    return null;
  }

  const latest = history.at(-1);
  const observationCount = periodObservationCount(metric, period);
  const baselineIndex = Math.max(0, history.length - 1 - observationCount);
  const baseline = history[baselineIndex];

  if (!latest || !baseline || !Number.isFinite(latest.value) || !Number.isFinite(baseline.value)) {
    return null;
  }

  const rawDelta = latest.value - baseline.value;
  const percentDelta = baseline.value ? (rawDelta / baseline.value) * 100 : rawDelta;
  const value = metric.comparison === "point-change" ? rawDelta : percentDelta;

  return {
    value,
    label: formatDeltaLabel(value, metric.comparison),
    tone: periodTone(value),
    points: history.slice(baselineIndex).map((point) => point.value),
  };
}

function withPeriodDelta(metric, period) {
  const delta = metricPeriodDelta(metric, period);

  if (!delta) {
    return metric;
  }

  return {
    ...metric,
    periodChange: delta.label,
    periodChangeValue: delta.value,
    periodTone: delta.tone,
    periodPoints: delta.points.length > 1 ? delta.points : metric.points,
  };
}

function sectionChange(cards) {
  const weighted = cards
    .filter((card) => card.comparison !== "point-change" && Number.isFinite(card.periodChangeValue))
    .map((card) => ({
      value: card.periodChangeValue,
      weight: Number.isFinite(card.weight) ? card.weight : 1,
    }));

  if (!weighted.length) {
    return null;
  }

  const totalWeight = weighted.reduce((total, item) => total + item.weight, 0);
  const value = weighted.reduce((total, item) => total + item.value * item.weight, 0) / totalWeight;

  return {
    value,
    label: `${signedNumber(value)}%`,
    tone: periodTone(value),
  };
}

function updateSectionBadge(selector, change) {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.classList.remove("trend-up", "trend-down", "trend-stable", "trend-mixed", "trend-caution", "trend-unavailable");

  if (!change) {
    element.textContent = "Unavailable";
    element.classList.add("trend-unavailable");
    return;
  }

  element.textContent = change.label;
  element.classList.add(`trend-${change.tone}`);
}

function syncControlValues() {
  const economyPeriodSelect = document.querySelector("#economy-period-select");
  const currencyPeriodSelect = document.querySelector("#currency-period-select");
  const economyRegionSelect = document.querySelector("#economy-region-select");

  if (economyPeriodSelect) {
    economyPeriodSelect.value = selectedEconomyPeriod;
  }

  if (currencyPeriodSelect) {
    currencyPeriodSelect.value = selectedCurrencyPeriod;
  }

  if (economyRegionSelect) {
    economyRegionSelect.value = selectedRegion;
  }
}

function bindDashboardControls() {
  document.querySelector("#economy-period-select")?.addEventListener("change", (event) => {
    selectedEconomyPeriod = event.target.value;
    renderDashboard();
    announceDashboardStatus(`Economy period changed to ${event.target.selectedOptions[0]?.textContent || event.target.value}.`);
  });

  document.querySelector("#currency-period-select")?.addEventListener("change", (event) => {
    selectedCurrencyPeriod = event.target.value;
    renderDashboard();
    announceDashboardStatus(`Currency period changed to ${event.target.selectedOptions[0]?.textContent || event.target.value}.`);
  });

  document.querySelector("#economy-region-select")?.addEventListener("change", (event) => {
    selectedRegion = event.target.value;
    renderDashboard();
    announceDashboardStatus(`Economy region changed to ${event.target.selectedOptions[0]?.textContent || event.target.value}.`);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inferDisplayCadence(cadence) {
  const normalizedCadence = String(cadence || "").toLowerCase();

  if (normalizedCadence.includes("daily")) return "daily";
  if (normalizedCadence.includes("weekly")) return "weekly";
  if (normalizedCadence.includes("monthly")) return "monthly";
  if (normalizedCadence.includes("quarterly")) return "quarterly";
  if (normalizedCadence.includes("annual")) return "annual";

  return null;
}

function formatReleaseDate(value, cadence) {
  if (!value) {
    return null;
  }

  if (/^\d{4}$/.test(value)) {
    return value;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const cadenceKey = inferDisplayCadence(cadence);
  const shouldShowExactDate =
    cadenceKey === "daily" ||
    cadenceKey === "weekly" ||
    (!cadenceKey && /^\d{4}-\d{2}-\d{2}$/.test(value) && !value.endsWith("-01"));

  if (shouldShowExactDate) {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatCheckedAt(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCheckedTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    timeStyle: "short",
  }).format(date);
}

function setText(selector, text) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = text;
  }
}

function setHtml(selector, html) {
  const element = document.querySelector(selector);

  if (element) {
    element.innerHTML = html;
  }
}

function announceDashboardStatus(message) {
  setText("#dashboard-status", message);
}

function setScoreVisual(score) {
  const element = document.querySelector(".score-panel");

  if (element && Number.isFinite(score)) {
    element.style.setProperty("--score", `${score}%`);
    element.setAttribute("aria-label", `Conditions score ${score} out of 100`);
  }
}

function sourceStatusLabel(items, sourceName) {
  if (!items?.length) {
    return "Unavailable";
  }

  const liveCount = items.filter((item) => item.sourceStatus === "Source-backed").length;
  const delayedCount = items.filter((item) => item.freshness?.status === "delayed").length;
  const staleCount = items.filter((item) => item.freshness?.status === "stale").length;

  if (liveCount === items.length) {
    if (staleCount > 0) {
      return `${sourceName} (${staleCount} stale)`;
    }

    if (delayedCount > 0) {
      return `${sourceName} (${delayedCount} delayed)`;
    }

    return sourceName;
  }

  if (liveCount > 0) {
    const freshnessLabel =
      staleCount > 0 ? ` (${staleCount} stale)` : delayedCount > 0 ? ` (${delayedCount} delayed)` : "";
    return `${liveCount} of ${items.length} live${freshnessLabel}`;
  }

  return "Unavailable";
}

function formatReleaseWindow(releaseRange) {
  const latest = formatReleaseDate(releaseRange?.latest, releaseRange?.latestCadence);
  const earliest = formatReleaseDate(releaseRange?.earliest, releaseRange?.earliestCadence);

  if (!latest) {
    return "Unavailable";
  }

  if (earliest && earliest !== latest) {
    return `${earliest} to ${latest}`;
  }

  return latest;
}

function displaySourceStatus(status) {
  if (status === "Source-backed") {
    return "Live";
  }

  return status || "Unavailable";
}

function freshnessIcon(status) {
  if (status === "current") return "fa-circle-check";
  if (status === "delayed") return "fa-clock";
  if (status === "stale") return "fa-triangle-exclamation";
  if (status === "loading") return "fa-spinner";
  return "fa-circle-exclamation";
}

function displayFreshness(freshness) {
  return freshness?.label || "Freshness unavailable";
}

function freshnessDetail(freshness) {
  if (!freshness?.detail) {
    return displayFreshness(freshness);
  }

  return `${displayFreshness(freshness)}; ${freshness.detail}`;
}

function signalFreshnessLabel(item) {
  const status = item.freshness?.status;

  if (status === "delayed" || status === "stale") {
    return displayFreshness(item.freshness);
  }

  return displaySourceStatus(item.sourceStatus);
}

function displayMetricName(metric) {
  const names = {
    "Asia Pacific": "Asia",
    "GDP growth": "GDP Growth",
    "Interest rates": "Interest Rates",
    "U.S. dollar": "U.S. Dollar",
  };

  return names[metric.name] || metric.name;
}

function metricTickerLabel(metric) {
  if (metric.ticker) {
    return metric.ticker;
  }

  if (metric.id === "dollar-index") return "UUP";
  if (metric.id === "oil") return "CL=F";

  return "";
}

function sourceShortName(source) {
  if (!source) {
    return "Source unavailable";
  }

  if (source.includes("Yahoo")) return "Yahoo Finance";
  if (source.includes("FRED")) return "FRED";
  if (source.includes("World Bank")) return "World Bank";
  if (source.includes("Mercury")) return "Public data";

  return source.split(":")[0];
}

function metricIconClass(metric) {
  if (metric.icon) {
    return metric.icon;
  }

  const normalizedName = String(metric.name || "").toLowerCase();

  if (normalizedName.includes("credit")) return "fa-credit-card";
  if (normalizedName.includes("stress")) return "fa-chart-line";
  if (normalizedName.includes("volatility")) return "fa-chart-line";
  if (normalizedName.includes("gdp")) return "fa-chart-line";
  if (normalizedName.includes("united states")) return "fa-flag-usa";
  if (normalizedName.includes("dollar")) return "fa-dollar-sign";
  if (normalizedName.includes("euro")) return "fa-euro-sign";
  if (normalizedName.includes("yen")) return "fa-yen-sign";
  if (normalizedName.includes("oil")) return "fa-gas-pump";

  return "fa-chart-line";
}

function metricReleaseLabel(metric) {
  if (metric.releaseDate) {
    return formatReleaseDate(metric.releaseDate, metric.cadence);
  }

  if (metric.sourceStatus === "Loading") {
    return "Loading";
  }

  return "Unavailable";
}

function displayMetricDetail(value) {
  if (!value) {
    return "Unavailable";
  }

  return value;
}

function renderMetricComparison(metric) {
  return `
    <dl class="metric-comparison" aria-label="${escapeHtml(displayMetricName(metric))} previous value comparison">
      <div>
        <dt>Previous value</dt>
        <dd>${escapeHtml(displayMetricDetail(metric.previous))}</dd>
      </div>
      <div>
        <dt>Change</dt>
        <dd>${escapeHtml(displayMetricDetail(metric.change))}</dd>
      </div>
    </dl>
  `;
}

function renderDataMeta(item) {
  const status = item.sourceStatus || "Unavailable";
  const cadence = item.releaseDate
    ? `${item.cadence}; latest release ${formatReleaseDate(item.releaseDate, item.cadence)}`
    : item.cadence;
  const statusMeta =
    status === "Source-backed"
      ? ""
      : `<span><i class="fa-solid ${status === "Loading" ? "fa-spinner" : "fa-triangle-exclamation"}" aria-hidden="true"></i> ${escapeHtml(displaySourceStatus(status))}</span>`;
  const freshness = item.freshness || {};
  const freshnessMeta =
    status === "Source-backed" || freshness.status === "loading"
      ? `<span class="data-freshness data-freshness-${escapeHtml(freshness.status || "unavailable")}"><i class="fa-solid ${freshnessIcon(freshness.status)}" aria-hidden="true"></i> ${escapeHtml(freshnessDetail(freshness))}</span>`
      : "";

  return `
    <div class="data-meta" aria-label="Indicator data details">
      ${statusMeta}
      ${freshnessMeta}
      <span><i class="fa-solid fa-database" aria-hidden="true"></i> ${escapeHtml(item.source)}</span>
      <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHtml(cadence)}</span>
    </div>
  `;
}

function renderSparkline(points, tone, label) {
  const accessibleLabel = escapeHtml(label || "Recent trend line");

  if (!points?.length) {
    return `<div class="sparkline sparkline-empty" role="img" aria-label="${accessibleLabel} unavailable">Line graph</div>`;
  }

  if (points.length === 1) {
    return `
      <svg class="sparkline trend-${tone}" viewBox="0 0 180 42" role="img" aria-label="${accessibleLabel}; one data point available">
        <circle cx="90" cy="21" r="4"></circle>
      </svg>
    `;
  }

  const width = 180;
  const height = 42;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const d = points
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point - min) / range) * (height - 8) - 4;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return `
    <svg class="sparkline trend-${tone}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${accessibleLabel}">
      <path d="${d}"></path>
    </svg>
  `;
}

function renderMetricCard(metric) {
  const cardTone = metricCardTone(metric);
  const sparklinePoints = metric.periodPoints || metric.points;
  const hasChart = !metric.hideChart;

  return `
    <article class="metric-card metric-card-${cardTone}${metric.isWide ? " metric-card-wide" : ""}">
      <div class="metric-top">
        <div>
          <div class="metric-title-line">
            <h3 class="metric-name">${escapeHtml(displayMetricName(metric))}</h3>
            ${
              metricTickerLabel(metric)
                ? `<p class="metric-ticker">${escapeHtml(metricTickerLabel(metric))}</p>`
                : ""
            }
          </div>
        </div>
        <span class="metric-icon" aria-hidden="true"><i class="fa-solid ${escapeHtml(metricIconClass(metric))}"></i></span>
      </div>
      <div class="metric-value-row">
        <p class="${metricValueClass(metric.value)}">${escapeHtml(metric.value)}</p>
        <span class="metric-delta trend-text-${escapeHtml(cardTone)}">${escapeHtml(metricDeltaLabel(metric))}</span>
      </div>
      ${
        hasChart
          ? `<div class="metric-chart-panel">
              ${renderSparkline(
                sparklinePoints,
                cardTone,
                `${displayMetricName(metric)} ${metricDeltaLabel(metric)} trend`,
              )}
            </div>`
          : ""
      }
      <div class="metric-footer" aria-label="Metric source details">
        <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHtml(metricReleaseLabel(metric))}</span>
        ${
          metric.cadence && inferDisplayCadence(metric.cadence) !== "daily"
            ? `<span><i class="fa-solid fa-rotate" aria-hidden="true"></i> ${escapeHtml(metric.cadence)}</span>`
            : ""
        }
        <span><i class="fa-solid fa-earth-americas" aria-hidden="true"></i> ${escapeHtml(sourceShortName(metric.source))}</span>
      </div>
    </article>
  `;
}

function isGlobalView() {
  return selectedRegion === "Global";
}

function findRegionalMarket(region) {
  return marketPulse.find(
    (item) => item.viewGroup === "economy" && item.region === region && item.marketRole === "large-cap",
  );
}

function globalMarketCards() {
  const cards = [
    ["United States", findRegionalMarket("United States")],
    ["Europe", findRegionalMarket("Europe")],
    ["Asia", findRegionalMarket("Asia")],
  ]
    .filter(([, metric]) => Boolean(metric))
    .map(([name, metric]) => ({
      ...withPeriodDelta(metric, selectedEconomyPeriod),
      name,
      context: metricTickerLabel(metric) || metric.context,
    }));

  if (cards.length) {
    return cards;
  }

  return ["United States", "Europe", "Asia"].map((name) => ({
    name,
    context: "Caption",
    value: "Unavailable",
    trend: "Unavailable",
    tone: "unavailable",
    source: "Public data",
    cadence: "Needs live data",
    sourceStatus: "Unavailable",
    freshness: {
      status: "unavailable",
      label: "Unavailable",
    },
    points: [],
  }));
}

function orderedGlobalCurrencyCards() {
  const order = ["dollar-index", "euro", "yen", "oil"];
  const grouped = currencyCards().map((item) => withPeriodDelta(item, selectedEconomyPeriod));

  return order
    .map((id) => grouped.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => ({ ...item, hideChart: true }));
}

function regionalValue(region) {
  const match = String(region.copy || "").match(/is\s+(-?\d+(?:\.\d+)?%)/i);

  return region.value || match?.[1] || (region.sourceStatus === "Unavailable" ? "Unavailable" : "Loading");
}

function regionalChange(region) {
  const match = String(region.copy || "").match(/([+-]\d+(?:\.\d+)?\s?pts?)/i);

  return region.change || match?.[1] || region.trend || "Pending";
}

function regionMetricCard(region, overrides = {}) {
  return {
    ...region,
    ...overrides,
    value: regionalValue(region),
    change: regionalChange(region),
    context: overrides.context || "GDP Growth",
    comparison: "point-change",
    hideChart: true,
  };
}

function focusedSupportCards() {
  const dollar = findMetric(marketPulse, "dollar-index", "U.S. dollar");
  const regionName = selectedRegion === "Asia" ? "China" : selectedRegion === "Europe" ? "European Union" : selectedRegion;
  const regionGrowth = regions.find((region) => region.name === regionName) || regions[0];

  return [
    dollar ? { ...withPeriodDelta(dollar, selectedEconomyPeriod), isWide: true, hideChart: true } : null,
    regionGrowth ? regionMetricCard(regionGrowth, { name: "GDP Growth", isWide: true }) : null,
  ].filter(Boolean);
}

function riskMetricCards() {
  return riskIndicators.map((indicator) => ({
    ...indicator,
    name: indicator.name === "Credit stress" ? "Credit" : indicator.name === "Financial stress" ? "Stress" : indicator.name,
    ticker: indicator.name === "Volatility" ? "VIX" : "",
    context: indicator.name,
    value: indicator.value || indicator.trend || "Loading",
    change: indicator.change || indicator.trend || "Pending",
    hideChart: true,
  }));
}

function signalItems() {
  const items = [
    marketPulse[0],
    economicHealth[0],
    economicHealth[1],
    economicHealth[2],
    economicHealth[3],
    riskIndicators[0],
  ].filter(Boolean);

  return items.map((item) => ({
    name: item.name,
    context: item.context || "Risk tone",
    value: item.value || (item.sourceStatus === "Unavailable" ? "Unavailable" : "Loading"),
    trend: item.trend || "Pending",
    tone: item.tone || "stable",
    sourceStatus: item.sourceStatus || "Loading",
    freshness: item.freshness,
  }));
}

function renderSignalTile(item) {
  const tone = item.tone || "stable";

  return `
    <article class="signal-tile signal-tile-${escapeHtml(tone)}">
      <div>
        <p class="signal-name">${escapeHtml(item.name)}</p>
        <p class="signal-context">${escapeHtml(item.context)}</p>
      </div>
      <p class="${signalValueClass(item.value)}">${escapeHtml(item.value)}</p>
      <div class="signal-footer">
        <span class="${trendClass(item.tone)}">${escapeHtml(item.trend)}</span>
        <small>${escapeHtml(signalFreshnessLabel(item))}</small>
      </div>
    </article>
  `;
}

function renderIndicatorRow(indicator) {
  return `
    <article class="indicator-row">
      <i class="fa-solid ${indicator.icon}" aria-hidden="true"></i>
      <div>
        <h3 class="row-title">${escapeHtml(indicator.name)}</h3>
        <p class="row-copy">${escapeHtml(indicator.copy)}</p>
        ${renderDataMeta(indicator)}
      </div>
      <span class="${trendClass(indicator.tone)}">${escapeHtml(indicator.trend)}</span>
    </article>
  `;
}

function renderRegionRow(region) {
  return `
    <article class="region-row">
      <span class="region-marker" aria-hidden="true"><i class="fa-solid fa-location-dot"></i></span>
      <div>
        <h3 class="row-title">${escapeHtml(region.name)}</h3>
        <p class="row-copy">${escapeHtml(region.copy)}</p>
        ${renderDataMeta(region)}
      </div>
      <span class="${trendClass(region.tone)}">${escapeHtml(region.trend)}</span>
    </article>
  `;
}

function findMetric(items, id, name) {
  return items.find((item) => item.id === id) || items.find((item) => item.name === name);
}

function marketRoleRank(metric) {
  const index = MARKET_ROLE_ORDER.indexOf(metric.marketRole);
  return index === -1 ? MARKET_ROLE_ORDER.length : index;
}

function regionalMarketCards() {
  const regionalCards = marketPulse
    .filter((item) => item.viewGroup === "economy" && item.region === selectedRegion)
    .sort((a, b) => marketRoleRank(a) - marketRoleRank(b));

  if (regionalCards.length) {
    return regionalCards;
  }

  return [
    findMetric(marketPulse, "us-equities", "S&P 500"),
    findMetric(marketPulse, "us-small-cap", "Small Cap"),
    findMetric(marketPulse, "us-technology", "Technology"),
    findMetric(marketPulse, "bonds", "Bonds"),
  ].filter(Boolean);
}

function currencyCards() {
  const grouped = marketPulse.filter((item) => item.viewGroup === "currency");

  if (grouped.length) {
    return grouped;
  }

  return [
    findMetric(marketPulse, "oil", "Oil"),
    findMetric(marketPulse, "dollar-index", "U.S. dollar"),
    findMetric(marketPulse, "euro", "Euro"),
    findMetric(marketPulse, "yen", "Yen"),
  ].filter(Boolean);
}

function renderDashboard() {
  const economyGrid = document.querySelector("#economy-grid");
  const currencyGrid = document.querySelector("#currency-grid");
  const riskList = document.querySelector("#risk-list");
  const regionList = document.querySelector("#region-list");
  const lowerGrid = document.querySelector(".lower-grid");
  const globalView = isGlobalView();
  const marketCards = regionalMarketCards().map((item) => withPeriodDelta(item, selectedEconomyPeriod));
  const economyCards = globalView
    ? [...globalMarketCards(), ...orderedGlobalCurrencyCards()]
    : [
        ...marketCards,
        ...economicHealth.map((item) => withPeriodDelta(item, selectedEconomyPeriod)),
      ].filter(Boolean);
  const supportCards = globalView
    ? regions.slice(0, 3).map((region) => regionMetricCard(region))
    : focusedSupportCards();

  document.body.classList.toggle("dashboard-global", globalView);
  document.body.classList.toggle("dashboard-focused", !globalView);
  setText("#view-title", selectedRegion);

  if (economyGrid) {
    economyGrid.innerHTML = economyCards.map(renderMetricCard).join("");
  }

  if (currencyGrid) {
    currencyGrid.innerHTML = supportCards.map((item) => renderMetricCard(item)).join("");
  }

  updateSectionBadge("#economy-change-badge", sectionChange(economyCards));
  updateSectionBadge("#currency-change-badge", sectionChange(supportCards));
  setText("#currency-title", globalView ? "GDP Growth" : "Supporting indicators");

  if (lowerGrid) {
    lowerGrid.hidden = globalView;
  }

  if (riskList) {
    riskList.innerHTML = riskMetricCards().map(renderMetricCard).join("");
  }

  if (regionList) {
    regionList.innerHTML = regions.map((region) => renderMetricCard(regionMetricCard(region))).join("");
  }
}

function renderSummaryDrivers(drivers) {
  return drivers
    .map(
      (driver) => `
        <div>
          <dt>${escapeHtml(driver.label)}</dt>
          <dd>${escapeHtml(driver.value)}</dd>
        </div>
      `,
    )
    .join("");
}

function snapshotItems(snapshot) {
  return [
    ...(snapshot.marketPulse || []),
    ...(snapshot.economicHealth || []),
    ...(snapshot.riskIndicators || []),
    ...(snapshot.regions || []),
  ];
}

function applySnapshotConnectionState(snapshot, sourcePill) {
  const hasLiveSources = snapshotItems(snapshot).some(
    (item) => item.sourceStatus === "Source-backed",
  );
  const isUnavailable = snapshot.status === "unavailable" || !hasLiveSources;
  const isPartial = snapshot.status === "partial";

  sourcePill?.classList.remove("status-pill-live", "status-pill-caution");

  if (isUnavailable) {
    setText("#source-coverage-title", "Live data unavailable");
    setText(
      "#source-coverage-copy",
      "Mercury checked the public data sources, but none returned usable values.",
    );
    setHtml(
      "#macro-connection-pill",
      '<i class="fa-solid fa-plug-circle-xmark" aria-hidden="true"></i> Live data unavailable',
    );
    sourcePill?.classList.add("status-pill-caution");
    return;
  }

  if (isPartial) {
    setHtml(
      "#macro-connection-pill",
      '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Some data sources connected',
    );
    sourcePill?.classList.add("status-pill-caution");
    return;
  }

  setHtml(
    "#macro-connection-pill",
    '<i class="fa-solid fa-plug-circle-check" aria-hidden="true"></i> Data sources connected',
  );
  sourcePill?.classList.add("status-pill-live");
}

function freshnessPillIcon(status) {
  if (status === "current" || status === "partial") return "fa-circle-check";
  if (status === "delayed") return "fa-clock";
  if (status === "stale") return "fa-triangle-exclamation";
  return "fa-circle-exclamation";
}

function applySnapshotFreshnessState(snapshot) {
  const freshnessPill = document.querySelector("#sample-set-date");
  const freshness = snapshot.freshness || {};

  freshnessPill?.classList.remove("status-pill-live", "status-pill-caution", "status-pill-stale");
  setText("#source-rail-freshness", displayFreshness(freshness));
  setText("#snapshot-freshness", displayFreshness(freshness));

  if (!freshnessPill) {
    return;
  }

  setHtml(
    "#sample-set-date",
    `<i class="fa-solid ${freshnessPillIcon(freshness.status)}" aria-hidden="true"></i> ${escapeHtml(displayFreshness(freshness))}`,
  );

  if (freshness.status === "current" || freshness.status === "partial") {
    freshnessPill.classList.add("status-pill-live");
    return;
  }

  if (freshness.status === "stale") {
    freshnessPill.classList.add("status-pill-stale");
    return;
  }

  freshnessPill.classList.add("status-pill-caution");
}

function applyLiveSnapshot(snapshot) {
  if (!snapshot?.marketPulse?.length || !snapshot?.economicHealth?.length) {
    return;
  }

  const sourcePill = document.querySelector("#macro-connection-pill");

  marketPulse = snapshot.marketPulse;
  economicHealth = snapshot.economicHealth;
  riskIndicators = snapshot.riskIndicators;
  regions = snapshot.regions;
  renderDashboard();

  setText("#global-status-title", snapshot.summary.title);
  setText("#summary-copy", snapshot.summary.copy);
  setText(".score-value", snapshot.summary.score);
  setText(".score-label", "Conditions score");
  setScoreVisual(snapshot.summary.score);
  setHtml(".score-drivers dl", renderSummaryDrivers(snapshot.summary.drivers));
  setText(".score-drivers p", "What shapes this score");
  setText(".score-drivers small", "Uses live indicators currently available.");
  setText("#last-updated-pill", `Checked ${formatCheckedTime(snapshot.checkedAt)}`);
  setText("#economy-title", "Economy");
  setText("#risk-title", "Risk and confidence");
  setText("#global-title", "Regional growth");
  setText("#source-coverage-title", "Data coverage");
  setText(
    "#source-coverage-copy",
    snapshot.freshness?.copy ||
      "Each section shows its source, latest release date, and freshness.",
  );
  setText("#latest-release-window", formatReleaseWindow(snapshot.releaseRange));
  setText("#live-last-checked", formatCheckedAt(snapshot.checkedAt));
  setText("#source-rail-checked", formatCheckedAt(snapshot.checkedAt));
  setText("#refresh-schedule", "On page load");
  setText("#source-rail-refresh", "On page load");
  setText("#market-source-status", sourceStatusLabel(snapshot.marketPulse, "Yahoo Finance"));
  setText("#market-source-detail", "Daily market, commodity, and currency data from Yahoo Finance");
  setText("#macro-source-status", sourceStatusLabel(snapshot.economicHealth, "FRED"));
  setText("#macro-source-detail", "Official economic releases from FRED");
  setText("#risk-source-status", sourceStatusLabel(snapshot.riskIndicators, "Yahoo Finance/FRED"));
  setText("#risk-source-detail", "Market risk from Yahoo Finance; stress index from FRED");
  setText("#regional-source-status", sourceStatusLabel(snapshot.regions, "World Bank"));
  setText("#regional-source-detail", "Annual GDP growth from World Bank");
  setHtml(
    "#macro-source-note",
    '<i class="fa-solid fa-building-columns" aria-hidden="true"></i> FRED economic releases',
  );
  setHtml(
    "#market-source-note",
    '<i class="fa-solid fa-building-columns" aria-hidden="true"></i> Yahoo daily charts',
  );
  applySnapshotFreshnessState(snapshot);
  applySnapshotConnectionState(snapshot, sourcePill);
  announceDashboardStatus(`Dashboard data updated. Latest check ${formatCheckedAt(snapshot.checkedAt)}.`);
}

function markUnavailable(items) {
  return items.map((item) => ({
    ...item,
    value: item.value === "Loading" ? "Unavailable" : item.value,
    trend: "Unavailable",
    sourceStatus: "Unavailable",
    freshness: {
      status: "unavailable",
      label: "Freshness unavailable",
      detail: "Current release timing requires live data.",
    },
    previous: item.previous === "Loading" ? "Unavailable" : item.previous,
    change: item.change === "Loading" ? "Unavailable" : item.change,
    copy: item.copy?.replace("Loading", "Unable to load") || item.copy,
    cadence: "Needs live data",
  }));
}

function applyLiveFallback() {
  const sourcePill = document.querySelector("#macro-connection-pill");

  marketPulse = markUnavailable(marketPulse);
  economicHealth = markUnavailable(economicHealth);
  riskIndicators = markUnavailable(riskIndicators);
  regions = markUnavailable(regions);
  renderDashboard();

  setText("#global-status-title", "Live data unavailable");
  setText(
    "#summary-copy",
    "Mercury cannot reach live data in this view. Values stay unavailable instead of using sample figures.",
  );
  setText(".score-value", "0");
  setText(".score-label", "Conditions score");
  setScoreVisual(0);
  setHtml(
    ".score-drivers dl",
    renderSummaryDrivers([
      { label: "Market pulse", value: "Unavailable" },
      { label: "Economic health", value: "Unavailable" },
      { label: "Risk tone", value: "Unavailable" },
      { label: "Regional growth", value: "Unavailable" },
    ]),
  );
  setText(".score-drivers p", "What shapes this score");
  setText(".score-drivers small", "Current values need live data.");
  setText("#last-updated-pill", "Live data unavailable");
  setText("#economy-title", "Economy");
  setText("#source-coverage-title", "Live data unavailable");
  setText(
    "#source-coverage-copy",
    "Live data is unavailable in this view. Current values will appear when public sources respond.",
  );
  setText("#latest-release-window", "Unavailable");
  setText("#live-last-checked", "Unavailable");
  setText("#source-rail-freshness", "Unavailable");
  setText("#snapshot-freshness", "Unavailable");
  setText("#source-rail-checked", "Unavailable");
  setText("#refresh-schedule", "Unavailable");
  setText("#source-rail-refresh", "Unavailable");
  setText("#market-source-status", "Unavailable");
  setText("#macro-source-status", "Unavailable");
  setText("#risk-source-status", "Unavailable");
  setText("#regional-source-status", "Unavailable");
  setText("#sample-set-date", "Data status");
  setHtml(
    "#macro-connection-pill",
    '<i class="fa-solid fa-plug-circle-xmark" aria-hidden="true"></i> Live data unavailable',
  );

  if (sourcePill) {
    sourcePill.classList.add("status-pill-caution");
  }

  announceDashboardStatus("Live dashboard data is unavailable in this view.");
}

async function loadLiveSnapshot() {
  const refreshButton = document.querySelector("#refresh-data-button");
  const dashboardShell = document.querySelector("#main-content");

  dashboardShell?.setAttribute("aria-busy", "true");
  announceDashboardStatus("Checking latest dashboard data.");

  if (refreshButton) {
    refreshButton.disabled = true;
    refreshButton.innerHTML = '<i class="fa-solid fa-spinner" aria-hidden="true"></i><span class="visually-hidden">Checking data</span>';
  }

  if (window.location.protocol === "file:") {
    applyLiveFallback();
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.innerHTML = '<i class="fa-solid fa-rotate" aria-hidden="true"></i><span class="visually-hidden">Refresh data</span>';
    }
    dashboardShell?.setAttribute("aria-busy", "false");
    return;
  }

  try {
    const response = await fetch("/api/live-snapshot", {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Live snapshot route unavailable");
    }

    const snapshot = await response.json();
    applyLiveSnapshot(snapshot);
  } catch (error) {
    applyLiveFallback();
  } finally {
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.innerHTML = '<i class="fa-solid fa-rotate" aria-hidden="true"></i><span class="visually-hidden">Refresh data</span>';
    }
    dashboardShell?.setAttribute("aria-busy", "false");
  }
}

syncControlValues();
bindDashboardControls();
renderDashboard();
loadLiveSnapshot();
document.querySelector("#refresh-data-button")?.addEventListener("click", loadLiveSnapshot);
