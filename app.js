function pendingMetric(name, context, icon, id, ticker, options = {}) {
  return {
    ...(id ? { id } : {}),
    name,
    context,
    ...(ticker ? { ticker } : {}),
    ...options,
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
  pendingMetric("U.S. Total", "Vanguard Total Stock Market ETF", "fa-earth-americas", "global-us-total", "VTI", {
    marketOrder: 5,
    marketRole: "global-allocation",
    region: "Global",
    viewGroup: "economy",
  }),
  pendingMetric("International", "Vanguard Total International Stock ETF", "fa-globe", "global-international", "VXUS", {
    marketOrder: 6,
    marketRole: "global-allocation",
    region: "Global",
    viewGroup: "economy",
  }),
  pendingMetric("S&P 500", "Vanguard S&P 500 ETF", "fa-building", "us-equities", "VOO", {
    marketOrder: 10,
    marketRole: "large-cap",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Small Cap", "Vanguard Small-Cap Index Fund", "fa-shop", "us-small-cap", "VSMAX", {
    marketOrder: 20,
    marketRole: "small-cap",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Technology", "Vanguard Information Technology ETF", "fa-microchip", "us-technology", "VGT", {
    marketOrder: 30,
    marketRole: "technology",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Financials", "Vanguard Financials ETF", "fa-building-columns", "us-financials", "VFH", {
    marketOrder: 40,
    marketRole: "financials",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Industrials", "Vanguard Industrials ETF", "fa-industry", "us-industrials", "VIS", {
    marketOrder: 50,
    marketRole: "industrials",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Bonds", "Total bond market ETF", "fa-scale-balanced", "bonds", "BND", {
    marketOrder: 60,
    marketRole: "bonds",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Energy", "Vanguard Energy ETF", "fa-bolt", "us-energy", "VDE", {
    marketOrder: 70,
    marketRole: "energy",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("REIT", "Vanguard Real Estate ETF", "fa-city", "us-reit", "VNQ", {
    marketOrder: 80,
    marketRole: "real-estate",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Healthcare", "Vanguard Health Care ETF", "fa-heart-pulse", "us-healthcare", "VHT", {
    marketOrder: 90,
    marketRole: "healthcare",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Consumer", "Vanguard Consumer Discretionary ETF", "fa-bag-shopping", "us-consumer", "VCR", {
    marketOrder: 100,
    marketRole: "consumer",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Communications", "Vanguard Communication Services ETF", "fa-tower-broadcast", "us-communications", "VOX", {
    marketOrder: 110,
    marketRole: "communications",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Growth", "Vanguard Growth ETF", "fa-chart-line", "us-growth", "VUG", {
    marketOrder: 120,
    marketRole: "growth",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Materials", "Vanguard Materials ETF", "fa-flask", "us-materials", "VAW", {
    marketOrder: 130,
    marketRole: "materials",
    region: "United States",
    viewGroup: "economy",
  }),
  pendingMetric("Europe", "Vanguard FTSE Europe ETF", "fa-earth-europe", "europe-equities", "VGK", {
    marketOrder: 10,
    marketRole: "large-cap",
    region: "Europe",
    viewGroup: "economy",
  }),
  pendingMetric("Financials", "iShares STOXX Europe 600 Banks UCITS ETF", "fa-building-columns", "europe-financials", "EXV1.DE", {
    marketOrder: 20,
    marketRole: "financials",
    region: "Europe",
    viewGroup: "economy",
  }),
  pendingMetric("Industrials", "iShares STOXX Europe 600 Industrial Goods & Services UCITS ETF", "fa-industry", "europe-industrials", "EXH4.DE", {
    marketOrder: 30,
    marketRole: "industrials",
    region: "Europe",
    viewGroup: "economy",
  }),
  pendingMetric("Healthcare", "iShares STOXX Europe 600 Health Care UCITS ETF", "fa-heart-pulse", "europe-healthcare", "EXV4.DE", {
    marketOrder: 40,
    marketRole: "healthcare",
    region: "Europe",
    viewGroup: "economy",
  }),
  pendingMetric("Consumer", "iShares STOXX Europe 600 Retail UCITS ETF", "fa-bag-shopping", "europe-consumer", "EXH8.DE", {
    marketOrder: 50,
    marketRole: "consumer",
    region: "Europe",
    viewGroup: "economy",
  }),
  pendingMetric("Energy", "iShares STOXX Europe 600 Oil & Gas UCITS ETF", "fa-bolt", "europe-energy", "EXH1.DE", {
    marketOrder: 60,
    marketRole: "energy",
    region: "Europe",
    viewGroup: "economy",
  }),
  pendingMetric("Japan", "iShares MSCI Japan ETF", "fa-torii-gate", "asia-japan", "EWJ", {
    marketOrder: 10,
    marketRole: "country",
    region: "Asia",
    viewGroup: "economy",
  }),
  pendingMetric("China", "iShares MSCI China ETF", "fa-city", "asia-china", "MCHI", {
    marketOrder: 20,
    marketRole: "country",
    region: "Asia",
    viewGroup: "economy",
  }),
  pendingMetric("India", "iShares MSCI India ETF", "fa-landmark-dome", "asia-india", "INDA", {
    marketOrder: 30,
    marketRole: "country",
    region: "Asia",
    viewGroup: "economy",
  }),
  pendingMetric("Taiwan", "iShares MSCI Taiwan ETF", "fa-microchip", "asia-taiwan", "EWT", {
    marketOrder: 40,
    marketRole: "country",
    region: "Asia",
    viewGroup: "economy",
  }),
  pendingMetric("South Korea", "iShares MSCI South Korea ETF", "fa-industry", "asia-south-korea", "EWY", {
    marketOrder: 50,
    marketRole: "country",
    region: "Asia",
    viewGroup: "economy",
  }),
  pendingMetric("Asia Broad", "Vanguard FTSE Pacific ETF", "fa-earth-asia", "asia-equities", "VPL", {
    marketOrder: 60,
    marketRole: "large-cap",
    region: "Asia",
    viewGroup: "economy",
  }),
  pendingMetric("U.S. dollar", "Dollar index fund proxy", "fa-dollar-sign", "dollar-index", "UUP"),
  pendingMetric("Euro", "EUR/USD exchange rate", "fa-euro-sign", "euro", "EUR/USD"),
  pendingMetric("Yen", "USD/JPY exchange rate", "fa-yen-sign", "yen", "USD/JPY"),
  pendingMetric("Oil", "WTI crude futures", "fa-gas-pump", "oil", "CL=F"),
  pendingMetric("Bitcoin", "BTC/USD spot rate", "fa-brands fa-bitcoin", "bitcoin", "BTC"),
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
  fiveYear: {
    label: "5 years",
    dailyObservations: 1260,
    weeklyObservations: 260,
    monthlyObservations: 60,
    quarterlyObservations: 20,
    annualObservations: 5,
  },
};

const MARKET_ROLE_ORDER = [
  "large-cap",
  "small-cap",
  "technology",
  "financials",
  "industrials",
  "healthcare",
  "consumer",
  "energy",
  "real-estate",
  "communications",
  "growth",
  "materials",
  "country",
  "bonds",
];
const CONTEXT_ONLY_METRIC_IDS = new Set(["oil", "dollar-index", "euro", "yen", "inflation", "interest-rates"]);
const CONTEXT_ONLY_TREND_MODELS = new Set(["commodity", "currency", "dollar", "inflation", "policy-rate"]);
const currentPage = document.body?.dataset?.mercuryPage || "dashboard";
let selectedEconomyPeriod = "week";
let selectedCurrencyPeriod = "week";
let selectedRegion = "Global";
let selectedMarketSort = "relevance";

function isDashboardPage() {
  return currentPage === "dashboard";
}

function hasSourceBackedValue(item) {
  return Boolean(
    item &&
      item.sourceStatus === "Source-backed" &&
      item.value &&
      item.value !== "Loading" &&
      item.value !== "Unavailable",
  );
}

function hasAnySourceBackedValue(items) {
  return items.some(hasSourceBackedValue);
}

function isUnavailableItem(item) {
  return Boolean(item && (item.sourceStatus === "Unavailable" || item.value === "Unavailable"));
}

function isCompleteUnavailable(items) {
  return items.length > 0 && !hasAnySourceBackedValue(items) && items.every(isUnavailableItem);
}

function currentSnapshotItems() {
  return snapshotItems({ marketPulse, economicHealth, riskIndicators, regions });
}

function isCompleteLiveUnavailable() {
  return isCompleteUnavailable(currentSnapshotItems());
}

function unavailableStateCopy() {
  return {
    title: "Live data unavailable",
    badge: "Unavailable",
    summary: "Mercury cannot produce a source-backed read right now.",
    detail: "Public sources did not return usable values. Existing source names and coverage rules remain trustworthy; economic interpretation will return when the sources respond.",
    actions: "Retry refresh, check Data Coverage, or wait for public sources to respond.",
  };
}

const PROVIDER_INVENTORY = [
  ["Markets", "Yahoo Finance"],
  ["Commodities", "Yahoo Finance"],
  ["Currencies", "Yahoo Finance"],
  ["Inflation", "FRED"],
  ["GDP", "FRED"],
  ["Unemployment", "FRED"],
  ["Regional Growth", "World Bank"],
];

function renderProviderInventory() {
  return PROVIDER_INVENTORY.map(
    ([signal, provider]) => `
      <div>
        <dt>${escapeHtml(signal)}</dt>
        <dd>${escapeHtml(provider)}</dd>
      </div>
    `,
  ).join("");
}

function renderProviderInventorySummary() {
  setHtml("#coverage-summary-list", renderProviderInventory());
}

function primaryViewTitle() {
  if (currentPage === "markets") return "Markets";
  if (currentPage === "supports") return "Market Supports";
  if (currentPage === "indicators") return "Indicators";
  if (currentPage === "data") return "Data Coverage";
  return "Global Economy";
}

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

function isEconomyScoreInput(card) {
  if (card.comparison === "point-change" || !Number.isFinite(card.periodChangeValue)) {
    return false;
  }

  if (CONTEXT_ONLY_METRIC_IDS.has(card.id) || CONTEXT_ONLY_TREND_MODELS.has(card.trendModel)) {
    return false;
  }

  return true;
}

function sectionChange(cards) {
  const weighted = cards
    .filter(isEconomyScoreInput)
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

function sentimentForChange(change) {
  const value = change?.value;

  if (!Number.isFinite(value)) {
    return { label: "Unavailable", tone: "unavailable", phrase: "waiting on live data" };
  }

  if (value >= 2) {
    return { label: "Strong", tone: "up", phrase: "strongly positive" };
  }

  if (value > 0.15) {
    return { label: "Healthy", tone: "up", phrase: "broadly positive" };
  }

  if (value <= -2) {
    return { label: "Weak", tone: "down", phrase: "under pressure" };
  }

  if (value < -0.15) {
    return { label: "Mixed", tone: "down", phrase: "slightly softer" };
  }

  return { label: "Mixed", tone: "stable", phrase: "mixed" };
}

function periodPhrase(period) {
  if (period === "today") return "today";
  if (period === "year") return "this year";
  if (period === "fiveYear") return "over five years";

  return `this ${periodOption(period).label.toLowerCase()}`;
}

function sentenceCase(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "";
}

function humanList(items) {
  if (items.length <= 1) {
    return items[0] || "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function viewTitle(scope) {
  return scope === "Global" ? "Global Economy" : `${scope} Economy`;
}

function heroMoverCards(cards) {
  return cards
    .filter(isEconomyScoreInput)
    .sort((a, b) => Math.abs(b.periodChangeValue) - Math.abs(a.periodChangeValue))
    .slice(0, 3);
}

function heroMoverLabel(card) {
  const name = displayMetricName(card);
  const label = card.periodChange || metricDeltaLabel(card);

  return `${name} (${label})`;
}

function isContextualMover(card) {
  return card?.id === "oil" || displayMetricName(card).toLowerCase() === "oil";
}

function heroMoverTone(card) {
  return isContextualMover(card) ? "mixed" : periodTone(card.periodChangeValue);
}

function buildHeroInsight(change, movers, period, scope) {
  if (isCompleteUnavailable(movers) || (isCompleteLiveUnavailable() && !change)) {
    const copy = unavailableStateCopy();

    return `${copy.summary} ${copy.actions}`;
  }

  if (!change) {
    return "Waiting for enough live market data to explain the current global read.";
  }

  const sentiment = sentimentForChange(change);
  const leader = movers.find((card) => card.periodChangeValue > 0.05);
  const drag = movers.find((card) => card.periodChangeValue < -0.05);
  const leadPhrase = leader ? `, led by ${heroMoverLabel(leader)}` : "";
  const dragPhrase = drag ? ` ${heroMoverLabel(drag)} remains the primary drag.` : "";

  return `${sentenceCase(sentiment.phrase)} ${periodPhrase(period)}${leadPhrase}.${dragPhrase}`.trim();
}

function renderHeroMovers(movers) {
  if (!movers.length) {
    return "";
  }

  return `
    ${movers
      .map((card) => {
        const tone = heroMoverTone(card);

        return `
          <span class="hero-mover hero-mover-${escapeHtml(tone)}">
            <span>${escapeHtml(displayMetricName(card))}</span>
            <strong>${escapeHtml(card.periodChange || metricDeltaLabel(card))}</strong>
          </span>
        `;
      })
      .join("")}
  `;
}

function marketHeroCardsForView(globalView, regionalCards, marketCards) {
  return globalView ? regionalCards : marketCards;
}

function ordinalLabel(index) {
  return ["1st", "2nd", "3rd"][index] || `${index + 1}th`;
}

function periodTitlePhrase(period) {
  if (period === "today") return "Today";
  if (period === "week") return "This Week";
  if (period === "month") return "This Month";
  if (period === "year") return "This Year";
  if (period === "fiveYear") return "Over Five Years";

  return sentenceCase(periodPhrase(period));
}

function marketDriverTitle() {
  return `Key Drivers ${periodTitlePhrase(selectedEconomyPeriod)}`;
}

function marketDriverCategory(card) {
  if (selectedRegion === "Global") return card.marketRole === "global-allocation" ? "Allocation" : "Region";
  if (card.marketRole === "large-cap") return "Core market";
  if (card.marketRole === "small-cap") return "Small cap";
  if (card.marketRole === "technology") return "Sector";
  if (card.marketRole === "financials") return "Financial system";
  if (card.marketRole === "industrials") return "Production";
  if (card.marketRole === "healthcare") return "Defensive sector";
  if (card.marketRole === "consumer") return "Demand signal";
  if (card.marketRole === "energy") return "Input costs";
  if (card.marketRole === "real-estate") return "Rate sensitive";
  if (card.marketRole === "communications") return "Services";
  if (card.marketRole === "growth") return "Growth style";
  if (card.marketRole === "materials") return "Materials";
  if (card.marketRole === "country") return "Country";
  if (card.marketRole === "bonds") return "Defensive asset";

  return "Driver";
}

function marketDriverLabel(card, index) {
  return `${ordinalLabel(index)} ${marketDriverCategory(card)}`;
}

function marketDriverCopy(card, index, drivers = []) {
  if (card.sourceStatus === "Unavailable" || card.value === "Unavailable") {
    return "Waiting for source-backed market data.";
  }

  const scope = selectedRegion === "Global" ? "global market read" : `${selectedRegion} market read`;
  const period = periodPhrase(selectedEconomyPeriod);
  const name = displayMetricName(card);
  const change = card.periodChange || metricDeltaLabel(card);
  const leader = drivers[0];
  const leaderName = leader ? displayMetricName(leader) : "";

  if (card.periodChangeValue > 0.05) {
    if (index === 0) {
      return `${name} is the strongest contributor ${period} (${change}), setting the pace for the ${scope}.`;
    }

    if (index === 1) {
      return `${name} shows steady participation (${change}), supporting the broader trend.`;
    }

    return `${name} is positive (${change}), but trailing ${leaderName || "the leading driver"} momentum.`;
  }

  if (card.periodChangeValue < -0.05) {
    if (index === 0) {
      return `${name} is the primary pressure ${period} (${change}), shaping the weaker side of the ${scope}.`;
    }

    return `${name} is weighing on the ${scope} (${change}), behind the primary pressure.`;
  }

  return `${name} is holding steady (${change}), adding little directional pressure ${period}.`;
}

function renderMarketDriverCard(card, index, drivers) {
  const tone = card.sourceStatus === "Unavailable" || card.value === "Unavailable" ? "unavailable" : heroMoverTone(card);
  const summary = sentenceSummary([
    marketDriverLabel(card, index),
    displayMetricName(card),
    card.periodChange || metricDeltaLabel(card),
    marketDriverCopy(card, index, drivers),
  ]);

  return `
    <article class="market-driver-card market-driver-card-${escapeHtml(tone)} acadia-surface acadia-panel-dense" aria-label="${escapeHtml(summary)}">
      <span class="market-driver-label">${escapeHtml(marketDriverLabel(card, index))}</span>
      <div class="market-driver-heading">
        <strong>${escapeHtml(displayMetricName(card))}</strong>
        <span>${escapeHtml(card.periodChange || metricDeltaLabel(card))}</span>
      </div>
      <p class="market-driver-copy">${escapeHtml(marketDriverCopy(card, index, drivers))}</p>
    </article>
  `;
}

function renderMarketDrivers(cards) {
  const driversGrid = document.querySelector("#market-drivers-grid");
  const driversKicker = document.querySelector("#market-drivers-kicker");
  const driversTitle = document.querySelector("#market-drivers-title");

  if (!driversGrid) {
    return;
  }

  const drivers = heroMoverCards(cards);

  if (driversKicker) {
    driversKicker.textContent = selectedRegion === "Global" ? "Regions" : "Drivers";
  }

  if (driversTitle) {
    driversTitle.textContent = marketDriverTitle();
  }

  if (isCompleteLiveUnavailable() && currentPage === "markets") {
    setDynamicContent(
      driversGrid,
      renderUnavailableActionCard(
        "The market read needs live source-backed values before Mercury can compare drivers, regions, or returns.",
        {
          source: "Configured source group: Yahoo Finance market data",
          className: "market-driver-card market-driver-card-unavailable market-driver-card-combined acadia-surface acadia-panel-dense unavailable-state-card",
        },
      ),
    );
    return;
  }

  setDynamicContent(driversGrid, drivers.length
    ? drivers.map((card, index) => renderMarketDriverCard(card, index, drivers)).join("")
    : renderUnavailableCard(
        "Market drivers unavailable",
        "Comparable market drivers need live source-backed values.",
        "Yahoo Finance market data",
        "market-driver-card market-driver-card-unavailable acadia-surface acadia-panel-dense",
      ));
}

function supportSignalProfile(card) {
  const value = card?.periodChangeValue;
  const unavailable = !card || card.sourceStatus === "Unavailable" || card.value === "Unavailable" || !Number.isFinite(value);

  if (unavailable) {
    return {
      label: "Awaiting data",
      tone: "unavailable",
      impact: "unavailable",
      copy: "Waiting for source-backed support data.",
    };
  }

  const name = displayMetricName(card);
  const magnitude = Math.abs(value);

  if (card.id === "oil") {
    if (value <= -5) {
      return {
        label: "Falling sharply",
        tone: "mixed",
        impact: "mixed",
        copy: "Lower oil can ease inflation pressure, but sharp declines can also point to softer demand.",
      };
    }

    if (value >= 5) {
      return {
        label: "Input-cost pressure",
        tone: "caution",
        impact: "pressure",
        copy: "Rising oil can push input costs higher and keep inflation pressure visible.",
      };
    }

    return {
      label: "Stable",
      tone: "stable",
      impact: "neutral",
      copy: "Oil is not sending a strong input-cost signal right now.",
    };
  }

  if (card.id === "dollar-index") {
    if (value > 0.15) {
      return {
        label: "Positive",
        tone: "up",
        impact: "positive",
        copy: "Dollar strength can help contain imported inflation, though it may weigh on exports.",
      };
    }

    if (value < -0.15) {
      return {
        label: "Softening",
        tone: "down",
        impact: "pressure",
        copy: "Dollar weakness can ease global dollar pressure but may lift import costs.",
      };
    }
  }

  if (card.id === "bitcoin") {
    if (value > 0.15) {
      return {
        label: "Positive",
        tone: "up",
        impact: "positive",
        copy: "Bitcoin strength can point to better risk appetite in speculative assets.",
      };
    }

    if (value < -0.15) {
      return {
        label: "Risk appetite weaker",
        tone: "down",
        impact: "pressure",
        copy: "Bitcoin weakness can point to softer risk appetite in speculative assets.",
      };
    }
  }

  if (card.id === "euro" || card.id === "yen") {
    if (magnitude < 0.5) {
      return {
        label: "Neutral",
        tone: "stable",
        impact: "neutral",
        copy: `${name} is moving lightly enough to read as background currency context.`,
      };
    }

    return {
      label: value > 0 ? "Firming" : "Softening",
      tone: "mixed",
      impact: "neutral",
      copy: `${name} is moving, but Mercury treats this as context rather than a direct growth score input.`,
    };
  }

  if (value > 0.15) {
    return {
      label: "Positive",
      tone: "up",
      impact: "positive",
      copy: `${name} is adding support ${periodPhrase(selectedEconomyPeriod)}.`,
    };
  }

  if (value < -0.15) {
    return {
      label: "Pressure",
      tone: "down",
      impact: "pressure",
      copy: `${name} is adding pressure ${periodPhrase(selectedEconomyPeriod)}.`,
    };
  }

  return {
    label: "Neutral",
    tone: "stable",
    impact: "neutral",
    copy: `${name} is steady enough to read as background context.`,
  };
}

function supportScore(cards) {
  const profiles = cards.map((card) => supportSignalProfile(card)).filter((profile) => profile.impact !== "unavailable");

  if (!profiles.length) {
    return {
      label: "Unavailable",
      tone: "unavailable",
      phrase: "Waiting for support conditions",
      detail: "Support",
    };
  }

  const positives = profiles.filter((profile) => profile.impact === "positive").length;
  const pressures = profiles.filter((profile) => profile.impact === "pressure").length;
  const mixed = profiles.filter((profile) => profile.impact === "mixed").length;

  if (pressures > positives) {
    return {
      label: "Pressured",
      tone: "down",
      phrase: "Support conditions are under pressure",
      detail: `${pressures} pressure${pressures === 1 ? "" : "s"}`,
    };
  }

  if (positives > 0 && (pressures > 0 || mixed > 0)) {
    return {
      label: "Mixed",
      tone: "mixed",
      phrase: "Mixed support conditions",
      detail: `${positives} positive`,
    };
  }

  if (positives > 0) {
    return {
      label: "Supportive",
      tone: "up",
      phrase: "Supportive conditions",
      detail: `${positives} positive`,
    };
  }

  if (mixed > 0) {
    return {
      label: "Mixed",
      tone: "mixed",
      phrase: "Mixed support conditions",
      detail: "Contextual",
    };
  }

  return {
    label: "Stable",
    tone: "stable",
    phrase: "Stable support conditions",
    detail: "Neutral",
  };
}

function strongestSupportCard(cards, impact) {
  return cards
    .filter((card) => supportSignalProfile(card).impact === impact && Number.isFinite(card.periodChangeValue))
    .sort((a, b) => Math.abs(b.periodChangeValue) - Math.abs(a.periodChangeValue))[0];
}

function supportMovementLabel(card) {
  return `${displayMetricName(card)} (${card.periodChange || metricDeltaLabel(card)})`;
}

function buildSupportHeroInsight(cards) {
  const score = supportScore(cards);

  if (score.tone === "unavailable") {
    return "Waiting for enough live support data to explain currencies, commodities, and digital assets.";
  }

  const dollar = cards.find((card) => card.id === "dollar-index" && supportSignalProfile(card).impact === "positive");
  const positive = dollar || strongestSupportCard(cards, "positive");
  const pressure = strongestSupportCard(cards, "pressure");
  const mixed = strongestSupportCard(cards, "mixed");
  const primaryContext = pressure || mixed;
  const positivePhrase = positive ? ` ${supportMovementLabel(positive)} is the clearest positive signal.` : "";
  const contextPhrase = primaryContext
    ? primaryContext.id === "oil"
      ? ` ${supportMovementLabel(primaryContext)} moved sharply, which is a mixed signal for input costs and demand.`
      : ` ${supportMovementLabel(primaryContext)} is the main pressure.`
    : "";

  return `${score.phrase} ${periodPhrase(selectedEconomyPeriod)}.${positivePhrase}${contextPhrase}`.trim();
}

function renderSupportSignalCard(card) {
  const profile = supportSignalProfile(card);
  const summary = sentenceSummary([
    displayMetricName(card),
    metricCaptionLabel(card) || card.context || "Support signal",
    profile.label,
    card.periodChange || metricDeltaLabel(card),
    profile.copy,
  ]);

  return `
    <article class="support-signal-card support-signal-card-${escapeHtml(profile.tone)} acadia-surface acadia-panel-dense" aria-label="${escapeHtml(summary)}">
      <div class="support-signal-heading">
        <span class="support-signal-icon" aria-hidden="true"><i class="${escapeHtml(metricIconClasses(card))} acadia-icon"></i></span>
        <div>
          <h3>${escapeHtml(displayMetricName(card))}</h3>
          <p>${escapeHtml(metricCaptionLabel(card) || card.context || "Support signal")}</p>
        </div>
      </div>
      <div class="support-signal-status">
        <strong>${escapeHtml(profile.label)}</strong>
        <span>${escapeHtml(card.periodChange || metricDeltaLabel(card))}</span>
      </div>
      <p class="support-signal-copy">${escapeHtml(profile.copy)}</p>
    </article>
  `;
}

function supportBriefCopy(cards) {
  if (!hasAnySourceBackedValue(cards)) {
    return "Mercury cannot interpret support conditions until live currency, commodity, and digital asset values are available.";
  }

  const oil = cards.find((card) => card.id === "oil");
  const dollar = cards.find((card) => card.id === "dollar-index");
  const bitcoin = cards.find((card) => card.id === "bitcoin");
  const sentences = [];

  if (oil && Number.isFinite(oil.periodChangeValue) && Math.abs(oil.periodChangeValue) >= 5) {
    const verb = oil.periodChangeValue < 0 ? "declined" : "rose";
    const implication =
      oil.periodChangeValue < 0
        ? "which can reduce inflation pressure but may also signal weaker demand expectations"
        : "which can raise input-cost pressure across the economy";

    sentences.push(`Oil ${verb} ${String(oil.periodChange || metricDeltaLabel(oil)).replace("-", "")} ${periodPhrase(selectedEconomyPeriod)}, ${implication}.`);
  }

  if (dollar && Number.isFinite(dollar.periodChangeValue) && Math.abs(dollar.periodChangeValue) >= 0.15) {
    sentences.push(
      dollar.periodChangeValue > 0
        ? "A stronger dollar can help contain imported inflation, but it may weigh on exports and global borrowers."
        : "A softer dollar can ease global dollar pressure, but it may lift import costs.",
    );
  }

  if (bitcoin && Number.isFinite(bitcoin.periodChangeValue) && Math.abs(bitcoin.periodChangeValue) >= 0.15) {
    sentences.push(
      bitcoin.periodChangeValue > 0
        ? "Bitcoin strength adds a risk-appetite signal, but Mercury keeps it separate from core economic health."
        : "Bitcoin weakness points to softer risk appetite, but Mercury keeps it separate from core economic health.",
    );
  }

  return sentences.slice(0, 2).join(" ") || "Source-backed support values are available, but none are large enough to interpret as a primary support driver.";
}

function buildSupportPressureItems(cards) {
  return cards
    .map((card) => ({
      card,
      profile: supportSignalProfile(card),
    }))
    .filter(({ profile }) => profile.impact === "pressure" || profile.impact === "mixed")
    .sort((a, b) => Math.abs(b.card.periodChangeValue || 0) - Math.abs(a.card.periodChangeValue || 0))
    .slice(0, 3)
    .map(({ card, profile }) => ({
      label: displayMetricName(card),
      copy: `${profile.label}: ${card.periodChange || metricDeltaLabel(card)} ${periodPhrase(selectedEconomyPeriod)}.`,
      tone: profile.tone,
    }));
}

function updateSupportBadge(score) {
  const element = document.querySelector("#support-change-badge");

  if (!element) {
    return;
  }

  element.classList.remove("trend-up", "trend-down", "trend-stable", "trend-mixed", "trend-caution", "trend-unavailable");
  element.innerHTML = `<span>Support</span><strong>${escapeHtml(score.label)}</strong>`;
  element.setAttribute("aria-label", `Support conditions ${score.label}`);
  element.classList.add(`trend-${score.tone}`);
}

function renderSupportBriefing(cards) {
  const signalsGrid = document.querySelector("#support-signals-grid");
  const pressureList = document.querySelector("#support-pressure-list");
  const hasSupportValues = hasAnySourceBackedValue(cards);

  setText("#hero-insight", buildSupportHeroInsight(cards));
  setText("#support-brief-copy", supportBriefCopy(cards));
  updateSupportBadge(supportScore(cards));

  if (signalsGrid) {
    setDynamicContent(signalsGrid, hasSupportValues && cards.length
      ? cards.map(renderSupportSignalCard).join("")
      : renderUnavailableActionCard(
          "Currencies, commodities, and digital assets need source-backed values before Mercury can interpret support conditions.",
          {
            source: "Configured source group: Yahoo Finance market support data",
            className: "support-signal-card support-signal-card-unavailable support-signal-card-combined acadia-surface acadia-panel-dense unavailable-state-card",
          },
        ));
  }

  if (pressureList) {
    const pressureItems = buildSupportPressureItems(cards);

    setDynamicContent(pressureList, pressureItems.length
      ? pressureItems.map(briefListItem).join("")
      : '<li class="brief-list-item brief-list-item-unavailable"><strong>No source-backed pressure read</strong><span>Mercury will identify support pressures when live values are available.</span></li>');
  }
}

function resampledPoint(points, index, targetLength) {
  if (targetLength <= 1 || points.length <= 1) {
    return points[0];
  }

  const sourcePosition = (index / (targetLength - 1)) * (points.length - 1);
  const lowerIndex = Math.floor(sourcePosition);
  const upperIndex = Math.min(points.length - 1, Math.ceil(sourcePosition));
  const progress = sourcePosition - lowerIndex;

  return points[lowerIndex] + (points[upperIndex] - points[lowerIndex]) * progress;
}

function buildHeroTrendPoints(cards) {
  const trendSeries = cards
    .filter(isEconomyScoreInput)
    .map((card) => ({
      points: Array.isArray(card.periodPoints) ? card.periodPoints.filter(Number.isFinite) : [],
      weight: Number.isFinite(card.weight) ? card.weight : 1,
    }))
    .filter((series) => series.points.length > 1 && Number.isFinite(series.points[0]) && series.points[0] !== 0);

  if (!trendSeries.length) {
    return [];
  }

  const longestSeries = Math.max(...trendSeries.map((series) => series.points.length));
  const targetLength = Math.min(Math.max(longestSeries, 8), 96);

  return Array.from({ length: targetLength }, (_, index) => {
    let weightedTotal = 0;
    let weightTotal = 0;

    trendSeries.forEach((series) => {
      const baseline = series.points[0];
      const value = resampledPoint(series.points, index, targetLength);

      if (!Number.isFinite(value) || !Number.isFinite(baseline) || baseline === 0) {
        return;
      }

      weightedTotal += ((value - baseline) / baseline) * 100 * series.weight;
      weightTotal += series.weight;
    });

    return weightTotal ? weightedTotal / weightTotal : 0;
  });
}

function renderHeroSparkline(cards, change) {
  const points = buildHeroTrendPoints(cards);

  if (points.length < 2) {
    return "";
  }

  return renderSparkline(
    points,
    change?.tone || "stable",
    `${viewTitle(selectedRegion)} ${periodOption(selectedEconomyPeriod).label} trend`,
  );
}

const MOBILE_REGION_TABS = [
  { value: "Global", label: "Global" },
  { value: "United States", label: "U.S." },
  { value: "Europe", label: "Europe" },
  { value: "Asia", label: "Asia" },
];

function regionalMarketCardsForScope(region) {
  if (region === "Global") {
    return globalMarketCards();
  }

  const scopedCards = marketPulse
    .filter((item) => item.viewGroup === "economy" && item.region === region)
    .sort((a, b) => marketRoleRank(a) - marketRoleRank(b));

  if (scopedCards.length) {
    return scopedCards.map((item) => withPeriodDelta(item, selectedEconomyPeriod));
  }

  return unavailableRegionalMarketCards(region).map((item) => withPeriodDelta(item, selectedEconomyPeriod));
}

function economyHeroCardsForScope(region) {
  const regionalCards = regionalMarketCardsForScope(region);

  if (region === "Global") {
    return [...regionalCards, ...currencySupportCards(), ...commodityCards()];
  }

  return [...regionalCards, ...economicHealthCards()].filter(Boolean);
}

function mobileTabChangeLabel(region) {
  const change = sectionChange(economyHeroCardsForScope(region));

  if (isCompleteLiveUnavailable()) {
    return "Unavailable";
  }

  if (!change) {
    return "Loading";
  }

  return change.label;
}

function renderMobileRegionTabs() {
  const controlsUnavailable = isCompleteLiveUnavailable();

  return MOBILE_REGION_TABS.map((tab) => {
    const isActive = tab.value === selectedRegion;
    const changeLabel = mobileTabChangeLabel(tab.value);

    return `
      <button
        class="mobile-dashboard-tab${isActive ? " is-active" : ""}"
        type="button"
        data-region="${escapeHtml(tab.value)}"
        aria-pressed="${isActive ? "true" : "false"}"
        aria-disabled="${controlsUnavailable ? "true" : "false"}"
        ${controlsUnavailable ? "disabled" : ""}
        aria-label="${escapeHtml(`${tab.label} economy, ${changeLabel}`)}"
      >
        <span class="mobile-dashboard-tab-name">${escapeHtml(tab.label)}</span>
        <strong>${escapeHtml(changeLabel)}</strong>
      </button>
    `;
  }).join("");
}

function mobileAxisLabels(period) {
  if (period === "today") return ["Open", "Midday", "Now"];
  if (period === "month") return ["4 weeks ago", "2 weeks", "Now"];
  if (period === "year") return ["Jan", "Midyear", "Now"];
  if (period === "fiveYear") return ["5 years", "2.5 years", "Now"];

  return ["5 days ago", "Midweek", "Now"];
}

function mobileFreshnessSummary() {
  const items = snapshotItems({ marketPulse, economicHealth, riskIndicators, regions });
  const liveCount = items.filter((item) => item.sourceStatus === "Source-backed").length;
  const delayedCount = items.filter((item) => item.freshness?.status === "delayed").length;
  const staleCount = items.filter((item) => item.freshness?.status === "stale").length;

  if (!items.length || liveCount === 0) {
    return { label: "Unavailable", tone: "unavailable" };
  }

  if (staleCount > 0) {
    return { label: "Stale", tone: "stale" };
  }

  if (delayedCount > 0 || liveCount < items.length) {
    return { label: "Partial", tone: "caution" };
  }

  return { label: "Current", tone: "current" };
}

function mobileSourceGroups() {
  return sourceHealthGroups({ marketPulse, economicHealth, riskIndicators, regions });
}

function renderMobileSourceDots(groups) {
  return groups
    .map(
      (group) => `
        <span class="mobile-source-dot mobile-source-${escapeHtml(group.health)}"></span>
      `,
    )
    .join("");
}

function renderMobileSourceIcons(groups) {
  const icons = {
    markets: "fa-chart-line",
    "economic-releases": "fa-building-columns",
    "risk-indicators": "fa-gauge-high",
    "regional-coverage": "fa-earth-americas",
  };

  return groups
    .map(
      (group) => `
        <i class="fa-solid ${icons[group.id] || "fa-database"} mobile-source-${escapeHtml(group.health)}" aria-hidden="true"></i>
      `,
    )
    .join("");
}

function renderMobileDashboardCard(cards, change) {
  const card = document.querySelector("#mobile-dashboard-card");

  if (!card) {
    return;
  }

  const movers = heroMoverCards(cards);
  const sentiment = sentimentForChange(change);
  const periodLabel = periodOption(selectedEconomyPeriod).label;
  const freshness = mobileFreshnessSummary();
  const sourceGroups = mobileSourceGroups();
  const axisLabels = mobileAxisLabels(selectedEconomyPeriod);
  const completeUnavailable = isCompleteLiveUnavailable();
  const title =
    completeUnavailable
      ? unavailableStateCopy().title
      : change && sentiment.label !== "Unavailable"
        ? `${sentiment.label} conditions`
        : "Checking conditions";
  const comparison =
    completeUnavailable
      ? "No source-backed read"
      : change && sentiment.label !== "Unavailable"
        ? `${change.label} - ${periodLabel} view`
        : "Waiting for comparable live inputs";
  const copy = buildHeroInsight(change, movers, selectedEconomyPeriod, selectedRegion);
  const chart = renderHeroSparkline(cards, change);
  const actions = document.querySelector("#mobile-dashboard-actions");

  card.classList.remove(
    "mobile-dashboard-card-up",
    "mobile-dashboard-card-down",
    "mobile-dashboard-card-stable",
    "mobile-dashboard-card-mixed",
    "mobile-dashboard-card-unavailable",
    "mobile-dashboard-card-caution",
  );
  card.classList.add(`mobile-dashboard-card-${change?.tone || "unavailable"}`);
  card.setAttribute("data-freshness", freshness.tone);
  setHtml("#mobile-dashboard-tabs", completeUnavailable ? "" : renderMobileRegionTabs());
  if (actions) {
    actions.hidden = !completeUnavailable;
    setDynamicContent(
      actions,
      completeUnavailable
        ? `
          <button type="button" class="unavailable-state-action" data-refresh-retry>
            <i class="fa-solid fa-rotate acadia-icon" aria-hidden="true"></i>
            <span>Retry refresh</span>
          </button>
          <a class="unavailable-state-action" href="data.html">
            <i class="fa-solid fa-table acadia-icon" aria-hidden="true"></i>
            <span>Data Coverage</span>
          </a>
        `
        : "",
    );
  }
  setText("#mobile-dashboard-title", title);
  setText("#mobile-dashboard-comparison", comparison);
  setText("#mobile-dashboard-copy", copy);
  setHtml("#mobile-dashboard-chart", chart || renderSparkline([], "unavailable", `${viewTitle(selectedRegion)} trend`));
  setText("#mobile-axis-start", axisLabels[0]);
  setText("#mobile-axis-middle", axisLabels[1]);
  setText("#mobile-axis-end", axisLabels[2]);
  setText("#mobile-dashboard-freshness", freshness.label);
  setHtml("#mobile-source-dots", renderMobileSourceDots(sourceGroups));
  setHtml("#mobile-source-icons", renderMobileSourceIcons(sourceGroups));
}

function updateHeroInsight(cards, change) {
  const movers = heroMoverCards(cards);
  const completeUnavailable = isCompleteLiveUnavailable();

  if (completeUnavailable) {
    const copy = unavailableStateCopy();

    setText("#hero-insight", `${copy.summary} ${copy.detail} ${copy.actions}`);
    setHtml("#hero-sparkline", "");
    setHtml("#hero-movers", "");
    return;
  }

  setText("#hero-insight", buildHeroInsight(change, movers, selectedEconomyPeriod, selectedRegion));
  setHtml("#hero-sparkline", renderHeroSparkline(cards, change));
  setHtml("#hero-movers", renderHeroMovers(movers));
}

function updateSectionBadge(selector, change, options = {}) {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.classList.remove("trend-up", "trend-down", "trend-stable", "trend-mixed", "trend-caution", "trend-unavailable");

  if (!change) {
    element.textContent = isCompleteLiveUnavailable() ? unavailableStateCopy().badge : "Unavailable";
    element.classList.add("trend-unavailable");
    return;
  }

  if (options.includeSentiment) {
    const sentiment = sentimentForChange(change);

    element.innerHTML = `<span>${escapeHtml(sentiment.label)}</span><strong>${escapeHtml(change.label)}</strong>`;
    element.setAttribute("aria-label", `${sentiment.label} ${change.label}`);
  } else {
    element.textContent = change.label;
  }
  element.classList.add(`trend-${change.tone}`);
}

function dashboardControls() {
  return {
    economyPeriod: document.querySelector("#economy-period-select"),
    currencyPeriod: document.querySelector("#currency-period-select"),
    economyRegion: document.querySelector("#economy-region-select"),
    marketSort: document.querySelector("#market-sort-select"),
  };
}

function presentControls(controls) {
  return Object.values(controls).filter(Boolean);
}

function setControlUnavailableState(control, unavailable) {
  control.disabled = unavailable;
  control.setAttribute("aria-disabled", unavailable ? "true" : "false");
}

function syncControlValues() {
  const controls = dashboardControls();

  if (controls.economyPeriod) {
    controls.economyPeriod.value = selectedEconomyPeriod;
  }

  if (controls.currencyPeriod) {
    controls.currencyPeriod.value = selectedCurrencyPeriod;
  }

  if (controls.economyRegion) {
    controls.economyRegion.value = selectedRegion;
  }

  if (controls.marketSort) {
    controls.marketSort.value = selectedMarketSort;
  }
}

function syncControlAvailability() {
  const controlsUnavailable = isCompleteLiveUnavailable();
  const controls = dashboardControls();

  presentControls(controls).forEach((control) => setControlUnavailableState(control, controlsUnavailable));

  document.querySelectorAll?.(".mobile-dashboard-tab").forEach((tab) => {
    setControlUnavailableState(tab, controlsUnavailable);
  });

  const note = document.querySelector("#control-availability-note");

  if (note) {
    const affectedControls = [
      controls.economyPeriod || controls.currencyPeriod ? "period" : "",
      controls.economyRegion ? "region" : "",
      controls.marketSort ? "sort" : "",
    ].filter(Boolean);

    note.hidden = !controlsUnavailable;
    note.textContent = `${sentenceCase(humanList(affectedControls))} controls apply when live data is available.`;
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

  document.querySelector("#mobile-dashboard-tabs")?.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-region]");

    if (!tab || tab.disabled || tab.getAttribute("aria-disabled") === "true") {
      return;
    }

    selectedRegion = tab.dataset.region || "Global";
    syncControlValues();
    renderDashboard();
    announceDashboardStatus(`Economy region changed to ${tab.textContent.trim()}.`);
  });

  document.querySelector("#market-sort-select")?.addEventListener("change", (event) => {
    selectedMarketSort = event.target.value;
    renderDashboard();
    announceDashboardStatus(`Market sort changed to ${event.target.selectedOptions[0]?.textContent || event.target.value}.`);
  });

  document.addEventListener?.("click", (event) => {
    const retry = event.target.closest?.("[data-refresh-retry]");

    if (retry) {
      loadLiveSnapshot({ isRetry: true });
    }
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

function sentenceSummary(parts) {
  return parts
    .map((part) => String(part || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(". ");
}

const STATUS_PILL_CLASSES = ["status-pill-live", "status-pill-caution", "status-pill-stale", "status-pill-loading"];
const SOURCE_STATUS_CLASSES = [
  "source-status-live",
  "source-status-caution",
  "source-status-unavailable",
  "source-status-loading",
];

function resetStatusPillClasses(element) {
  element?.classList.remove(...STATUS_PILL_CLASSES);
}

function statusPillClass(state) {
  if (state === "live" || state === "current") return "status-pill-live";
  if (state === "stale") return "status-pill-stale";
  if (state === "loading") return "status-pill-loading";
  return "status-pill-caution";
}

function setStatusPillState(selector, state) {
  const element = typeof selector === "string" ? document.querySelector(selector) : selector;

  resetStatusPillClasses(element);
  element?.classList.add(statusPillClass(state));
}

function freshnessStatusPillState(status) {
  if (status === "current" || status === "partial") return "live";
  if (status === "stale") return "stale";
  if (status === "loading") return "loading";
  return "caution";
}

function sourceStatusTone(items) {
  const health = sourceGroupHealth(items);

  if (health === "current") return "live";
  if (health === "caution") return "caution";
  return "unavailable";
}

function setSourceStatusBadge(selector, label, tone) {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.textContent = label;
  element.classList.remove(...SOURCE_STATUS_CLASSES);
  element.classList.add("source-status-badge", `source-status-${tone || "loading"}`);
}

function metricAccessibleSummary(metric) {
  const details = [
    displayMetricName(metric),
    metricCaptionLabel(metric),
    displayMetricContext(metric),
    `Value ${displayMetricDetail(metric.value)}`,
    `Change ${metricDeltaLabel(metric)}`,
  ];

  if (metric.trend && metric.trend !== metricDeltaLabel(metric)) {
    details.push(`Trend ${metric.trend}`);
  }

  if (metric.sourceStatus && metric.sourceStatus !== "Source-backed") {
    details.push(`Source ${displaySourceStatus(metric.sourceStatus)}`);
  }

  if (metric.freshness?.label && metric.freshness.status !== "loading") {
    details.push(metric.freshness.label);
  }

  return sentenceSummary(details);
}

function setDynamicContent(element, html) {
  if (!element) {
    return;
  }

  element.setAttribute("aria-busy", "true");
  element.innerHTML = html;
  element.setAttribute("aria-busy", "false");
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

  setDynamicContent(element, html);
}

function renderUnavailableCard(title, copy, source, className = "metric-card metric-card-unavailable acadia-metric unavailable-state-card") {
  return `
    <article class="${escapeHtml(className)}" aria-label="${escapeHtml(sentenceSummary([title, copy, source]))}">
      <div class="unavailable-state-icon" aria-hidden="true"><i class="fa-solid fa-circle-exclamation acadia-icon"></i></div>
      <div class="unavailable-state-copy">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(copy)}</p>
        <small>${escapeHtml(source)}</small>
      </div>
    </article>
  `;
}

function renderUnavailableActionCard(copy, options = {}) {
  const state = unavailableStateCopy();
  const title = options.title || state.title;
  const source = options.source || "Configured public source groups";
  const className = options.className || "overview-unavailable-card unavailable-state-card acadia-surface acadia-panel-dense";

  return `
    <article class="${escapeHtml(className)}" aria-label="${escapeHtml(sentenceSummary([title, copy, source, state.actions]))}">
      <div class="unavailable-state-icon" aria-hidden="true"><i class="fa-solid fa-plug-circle-xmark acadia-icon"></i></div>
      <div class="unavailable-state-copy">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(copy)}</p>
        <small>${escapeHtml(source)}</small>
        <div class="unavailable-state-actions">
          <button type="button" class="unavailable-state-action" data-refresh-retry>
            <i class="fa-solid fa-rotate acadia-icon" aria-hidden="true"></i>
            <span>Retry refresh</span>
          </button>
          <a class="unavailable-state-action" href="data.html">
            <i class="fa-solid fa-table acadia-icon" aria-hidden="true"></i>
            <span>Data Coverage</span>
          </a>
        </div>
      </div>
    </article>
  `;
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

function sourceGroupHealth(items) {
  if (!items?.length) {
    return "unavailable";
  }

  const liveCount = items.filter((item) => item.sourceStatus === "Source-backed").length;
  const delayedCount = items.filter((item) => item.freshness?.status === "delayed").length;
  const staleCount = items.filter((item) => item.freshness?.status === "stale").length;

  if (liveCount === 0) {
    return "unavailable";
  }

  if (liveCount < items.length || delayedCount > 0 || staleCount > 0) {
    return "caution";
  }

  return "current";
}

function sourceHealthGroups(snapshot) {
  return [
    {
      id: "markets",
      label: "Market data",
      current: "Market data fully current",
      caution: "Market data partially available or delayed",
      unavailable: "Market data is not responding",
      items: snapshot.marketPulse || [],
    },
    {
      id: "economic-releases",
      label: "Economic releases",
      current: "Economic releases fully current",
      caution: "Economic releases partially available, delayed, or stale",
      unavailable: "Economic releases are not responding",
      items: snapshot.economicHealth || [],
    },
    {
      id: "risk-indicators",
      label: "Risk indicators",
      current: "Risk indicators fully current",
      caution: "Risk indicators partially available, delayed, or stale",
      unavailable: "Risk indicators are not responding",
      items: snapshot.riskIndicators || [],
    },
    {
      id: "regional-coverage",
      label: "Regional coverage",
      current: "Regional coverage fully current",
      caution: "Regional coverage partially available, delayed, or stale",
      unavailable: "Regional coverage is not responding",
      items: snapshot.regions || [],
    },
  ].map((group) => ({
    ...group,
    health: sourceGroupHealth(group.items),
  }));
}

function sourceHealthCopy(groups, snapshot) {
  const unavailableCount = groups.filter((group) => group.health === "unavailable").length;
  const cautionCount = groups.filter((group) => group.health === "caution").length;
  const unavailableLabels = groups
    .filter((group) => group.health === "unavailable")
    .map((group) => group.label.toLowerCase());

  if (unavailableCount === groups.length) {
    return "Current source health: all live data groups are unavailable, so Mercury cannot produce a source-backed read right now.";
  }

  if (snapshot?.status === "partial" || unavailableCount > 0 || cautionCount > 0) {
    const unavailableDetail = unavailableLabels.length ? ` Unavailable groups: ${humanList(unavailableLabels)}.` : "";
    return `Current source health: some data groups are available while others are delayed, stale, or unavailable.${unavailableDetail}`;
  }

  return "Current source health: all connected data groups are current.";
}

function renderSourceHealth(snapshot) {
  const groups = sourceHealthGroups(snapshot);
  const operationalCount = groups.filter((group) => group.health !== "unavailable").length;
  const cautionCount = groups.filter((group) => group.health === "caution").length;
  const detail =
    cautionCount > 0
      ? `${operationalCount} of ${groups.length} data groups available; ${cautionCount} need attention`
      : `${operationalCount} of ${groups.length} data groups available`;

  setText("#source-health-score", `${operationalCount}/${groups.length}`);
  setText("#source-health-detail", detail);
  setHtml(
    "#source-health-list",
    groups
      .map((group) => {
        const label = group[group.health] || group.current;

        return `
          <li class="source-health-item source-health-${group.health}">
            <i class="fa-solid ${group.health === "current" ? "fa-circle-check" : group.health === "caution" ? "fa-clock" : "fa-circle-exclamation"} acadia-icon" aria-hidden="true"></i>
            <span>${escapeHtml(label)}</span>
          </li>
        `;
      })
      .join(""),
  );
  setText("#source-coverage-copy", sourceHealthCopy(groups, snapshot));
  renderProviderInventorySummary();
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

function shouldShowMetricContext(metric) {
  return false;
}

function displayMetricContext(metric) {
  if (!shouldShowMetricContext(metric)) {
    return "";
  }

  return metric.context || "";
}

function metricTickerLabel(metric) {
  if (metric.ticker) {
    return metric.ticker;
  }

  if (metric.id === "dollar-index") return "UUP";
  if (metric.id === "oil") return "CL=F";

  return "";
}

function metricCaptionLabel(metric) {
  const captionsById = {
    "dollar-index": "USD",
    euro: "EUR",
    yen: "JPY",
    oil: "CL=F",
    bitcoin: "BTC",
    inflation: "CPI",
    "interest-rates": "FED",
    unemployment: "UNRATE",
    "gdp-growth": "GDP",
    volatility: "VIX",
    "high-yield-credit": "HYG",
    "financial-stress": "STLFSI4",
  };
  const normalizedName = String(metric.name || "").toLowerCase();
  const captionsByName = {
    "u.s. dollar": "USD",
    euro: "EUR",
    yen: "JPY",
    oil: "CL=F",
    bitcoin: "BTC",
    inflation: "CPI",
    "interest rates": "FED",
    unemployment: "UNRATE",
    "gdp growth": "GDP",
    volatility: "VIX",
    credit: "HYG",
    stress: "STLFSI4",
  };

  if (captionsById[metric.id]) {
    return captionsById[metric.id];
  }

  if (captionsByName[normalizedName]) {
    return captionsByName[normalizedName];
  }

  if (String(metric.context || "").toLowerCase() === "gdp growth") {
    return "GDP";
  }

  return metricTickerLabel(metric);
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

  if (metric.marketRole === "large-cap") return "fa-building";
  if (metric.marketRole === "small-cap") return "fa-shop";
  if (metric.marketRole === "technology") return "fa-microchip";
  if (metric.marketRole === "financials") return "fa-building-columns";
  if (metric.marketRole === "industrials") return "fa-industry";
  if (metric.marketRole === "healthcare") return "fa-heart-pulse";
  if (metric.marketRole === "consumer") return "fa-bag-shopping";
  if (metric.marketRole === "energy") return "fa-bolt";
  if (metric.marketRole === "real-estate") return "fa-city";
  if (metric.marketRole === "communications") return "fa-tower-broadcast";
  if (metric.marketRole === "growth") return "fa-chart-line";
  if (metric.marketRole === "materials") return "fa-flask";
  if (metric.marketRole === "global-allocation") return "fa-globe";
  if (metric.marketRole === "country") return "fa-earth-asia";
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

function metricIconClasses(metric) {
  const iconClass = metricIconClass(metric);

  if (/\bfa-(solid|regular|brands)\b/.test(iconClass)) {
    return iconClass;
  }

  return `fa-solid ${iconClass}`;
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

function shouldShowMetricDate(metric) {
  if (!metric.releaseDate && !metric.previousReleaseDate) {
    return false;
  }

  const freshnessStatus = metric.freshness?.status;
  const cadence = inferDisplayCadence(metric.cadence);

  if (freshnessStatus === "delayed" || freshnessStatus === "stale") {
    return true;
  }

  return cadence !== "daily";
}

function displayMetricDetail(value) {
  if (!value) {
    return "Unavailable";
  }

  return value;
}

function metricPreviousLabel(metric) {
  const previous = displayMetricDetail(metric.previous);

  if (previous === "Loading" || previous === "Unavailable") {
    return "";
  }

  const previousDate = shouldShowMetricDate(metric)
    ? formatReleaseDate(metric.previousReleaseDate, metric.cadence)
    : null;

  if (previousDate) {
    return `Previous ${previous} (${previousDate})`;
  }

  return `Previous ${previous}`;
}

function metricTooltip(metric) {
  const details = [displayMetricName(metric)];
  const ticker = metricTickerLabel(metric);

  if (ticker) {
    details.push(ticker);
  }

  if (metric.context && metric.context !== ticker) {
    details.push(metric.context);
  }

  return details.join(" - ");
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
    return `<div class="sparkline sparkline-empty" role="img" aria-label="${accessibleLabel} unavailable">No trend</div>`;
  }

  if (points.length === 1) {
    return `
      <svg class="sparkline trend-${tone}" viewBox="0 0 180 42" preserveAspectRatio="none" role="img" aria-label="${accessibleLabel}; one data point available">
        <circle cx="90" cy="21" r="4"></circle>
      </svg>
    `;
  }

  const chartPoints = smoothSparklineValues(points);
  const width = 180;
  const height = 42;
  const min = Math.min(...chartPoints);
  const max = Math.max(...chartPoints);
  const range = max - min || 1;
  const step = width / (chartPoints.length - 1);
  const coordinates = chartPoints.map((point, index) => ({
    x: index * step,
    y: height - ((point - min) / range) * (height - 8) - 4,
  }));
  const d = smoothSparklinePath(coordinates);
  const areaD = sparklineAreaPath(d, coordinates, height);
  const baselineY = coordinates[0].y.toFixed(1);

  return `
    <svg class="sparkline trend-${tone}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${accessibleLabel}">
      <line class="sparkline-baseline" x1="0" y1="${baselineY}" x2="${width}" y2="${baselineY}" aria-hidden="true"></line>
      <path class="sparkline-area" d="${areaD}" aria-hidden="true"></path>
      <path class="sparkline-line" d="${d}"></path>
    </svg>
  `;
}

function sparklineAreaPath(linePath, points, height) {
  if (!linePath || points.length < 2) {
    return "";
  }

  const start = points[0];
  const end = points.at(-1);

  return `${linePath} L ${end.x.toFixed(1)} ${height.toFixed(1)} L ${start.x.toFixed(1)} ${height.toFixed(1)} Z`;
}

function smoothSparklineValues(points) {
  if (points.length <= 90) {
    return points;
  }

  const windowSize = points.length >= 500 ? 21 : 9;
  const radius = Math.floor(windowSize / 2);
  const smoothed = points.map((point, index) => {
    if (index === 0 || index === points.length - 1) {
      return point;
    }

    const start = Math.max(0, index - radius);
    const end = Math.min(points.length - 1, index + radius);
    let weightedTotal = 0;
    let weightTotal = 0;

    for (let cursor = start; cursor <= end; cursor += 1) {
      const distance = Math.abs(cursor - index);
      const weight = radius + 1 - distance;

      weightedTotal += points[cursor] * weight;
      weightTotal += weight;
    }

    return weightedTotal / weightTotal;
  });

  return downsampleSparklineValues(smoothed, 96);
}

function downsampleSparklineValues(points, maxPoints) {
  if (points.length <= maxPoints) {
    return points;
  }

  return Array.from({ length: maxPoints }, (_, index) => {
    if (index === 0) return points[0];
    if (index === maxPoints - 1) return points.at(-1);

    const sourceIndex = Math.round((index / (maxPoints - 1)) * (points.length - 1));

    return points[sourceIndex];
  });
}

function smoothSparklinePath(points) {
  if (!points.length) {
    return "";
  }

  const start = points[0];
  const commands = [`M ${start.x.toFixed(1)} ${start.y.toFixed(1)}`];

  if (points.length === 2) {
    const end = points[1];
    const controlOne = {
      x: start.x + (end.x - start.x) / 3,
      y: start.y,
    };
    const controlTwo = {
      x: end.x - (end.x - start.x) / 3,
      y: end.y,
    };

    commands.push(
      `C ${controlOne.x.toFixed(1)} ${controlOne.y.toFixed(1)} ${controlTwo.x.toFixed(1)} ${controlTwo.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
    );
    return commands.join(" ");
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] || points[index];
    const current = points[index];
    const next = points[index + 1];
    const following = points[index + 2] || next;
    const controlOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlTwo = {
      x: next.x - (following.x - current.x) / 6,
      y: next.y - (following.y - current.y) / 6,
    };

    commands.push(
      `C ${controlOne.x.toFixed(1)} ${controlOne.y.toFixed(1)} ${controlTwo.x.toFixed(1)} ${controlTwo.y.toFixed(1)} ${next.x.toFixed(1)} ${next.y.toFixed(1)}`,
    );
  }

  return commands.join(" ");
}

function renderMetricCard(metric) {
  const cardTone = metricCardTone(metric);
  const sparklinePoints = metric.periodPoints || metric.points;
  const hasChart = true;
  const metricCaption = metricCaptionLabel(metric);
  const metricContext = displayMetricContext(metric);
  const accessibleSummary = metricAccessibleSummary(metric);
  const releaseLabel = shouldShowMetricDate(metric) ? metricReleaseLabel(metric) : "";
  const cadenceLabel = metric.cadence && inferDisplayCadence(metric.cadence) !== "daily" ? metric.cadence : "";
  const footerItems = [
    releaseLabel
      ? `<span><i class="fa-regular fa-calendar acadia-icon" aria-hidden="true"></i> ${escapeHtml(releaseLabel)}</span>`
      : "",
    cadenceLabel
      ? `<span><i class="fa-solid fa-rotate acadia-icon" aria-hidden="true"></i> ${escapeHtml(cadenceLabel)}</span>`
      : "",
  ].filter(Boolean);
  const deltaState =
    cardTone === "down" || cardTone === "caution" || cardTone === "unavailable"
      ? " is-danger"
      : cardTone === "mixed"
        ? " is-warning"
        : "";

  return `
    <article class="metric-card acadia-metric metric-card-${cardTone}${hasChart ? " metric-card-has-chart" : ""}${metric.isWide ? " metric-card-wide" : ""}" title="${escapeHtml(metricTooltip(metric))}" aria-label="${escapeHtml(accessibleSummary)}">
      <div class="metric-content">
        <div class="metric-row metric-title-line">
          <h3 class="metric-name">${escapeHtml(displayMetricName(metric))}</h3>
          ${metricCaption ? `<span class="metric-caption">${escapeHtml(metricCaption)}</span>` : ""}
        </div>
        <div class="metric-row metric-detail-line">
          <span class="metric-delta acadia-metric-delta${deltaState} trend-text-${escapeHtml(cardTone)}">${escapeHtml(metricDeltaLabel(metric))}</span>
          <p class="${metricValueClass(metric.value)} acadia-metric-value">${escapeHtml(metric.value)}</p>
        </div>
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
      ${
        footerItems.length
          ? `<div class="metric-footer" aria-label="Metric data details">${footerItems.join("")}</div>`
          : ""
      }
    </article>
  `;
}

function sourceSummary(items, fallback = "Loading") {
  const total = items.filter(Boolean).length;

  if (!total) {
    return fallback;
  }

  const backed = items.filter((item) => item.sourceStatus === "Source-backed").length;

  if (backed === total) {
    return "Live";
  }

  if (backed > 0) {
    return `${backed}/${total} live`;
  }

  if (items.some((item) => item.sourceStatus === "Unavailable")) {
    return "Unavailable";
  }

  return fallback;
}

function overviewTileTone(value, fallback = "stable") {
  if (value === "Unavailable") return "unavailable";
  if (value === "Live" || String(value).includes("live")) return "up";
  return fallback;
}

function renderOverviewTile(tile) {
  const summary = sentenceSummary([tile.label, tile.value, tile.detail]);

  return `
    <a class="overview-tile overview-tile-${escapeHtml(tile.tone || "stable")}" href="${escapeHtml(tile.href)}" aria-label="${escapeHtml(summary)}">
      <span class="overview-tile-icon" aria-hidden="true"><i class="fa-solid ${escapeHtml(tile.icon)} acadia-icon"></i></span>
      <span class="overview-tile-copy">
        <span class="overview-tile-label">${escapeHtml(tile.label)}</span>
        <strong>${escapeHtml(tile.value)}</strong>
        <small>${escapeHtml(tile.detail)}</small>
      </span>
    </a>
  `;
}

function overviewMetricTile(metric, options) {
  const value = metric?.periodChange || metric?.change || metric?.trend || metric?.value || "Loading";
  const detail = metric?.value ? `${displayMetricName(metric)} ${metric.value}` : options.detail;

  return {
    label: options.label,
    value,
    detail: detail || "Checking live data",
    href: options.href,
    icon: options.icon || metric?.icon || "fa-chart-line",
    tone: metric ? metricCardTone(metric) : "stable",
  };
}

function marketBreadthTile(regionalCards, economyChange) {
  const scoreInputs = regionalCards.filter(isEconomyScoreInput);
  const positiveCount = scoreInputs.filter((item) => item.periodChangeValue > 0.05).length;
  const value = scoreInputs.length ? `${positiveCount}/${scoreInputs.length} positive` : economyChange?.label || "Loading";

  return {
    label: "Market breadth",
    value,
    detail: "Regional market participation",
    href: "markets.html",
    icon: "fa-chart-pie",
    tone: economyChange?.tone || "stable",
  };
}

function renderOverviewTiles({ economyChange, regionalCards, currencyCardsForView, commodityCardsForView, healthCards }) {
  const overviewGrid = document.querySelector("#overview-tiles-grid");

  if (!overviewGrid) {
    return;
  }

  if (isCompleteLiveUnavailable()) {
    const copy = unavailableStateCopy();

    setDynamicContent(
      overviewGrid,
      `
        <article class="overview-unavailable-card unavailable-state-card acadia-surface acadia-panel-dense" aria-label="${escapeHtml(sentenceSummary([copy.title, copy.summary, copy.actions]))}">
          <div class="unavailable-state-icon" aria-hidden="true"><i class="fa-solid fa-plug-circle-xmark acadia-icon"></i></div>
          <div class="unavailable-state-copy">
            <h3>${escapeHtml(copy.title)}</h3>
            <p>${escapeHtml(copy.detail)}</p>
            <div class="unavailable-state-actions">
              <button type="button" class="unavailable-state-action" data-refresh-retry>
                <i class="fa-solid fa-rotate acadia-icon" aria-hidden="true"></i>
                <span>Retry refresh</span>
              </button>
              <a class="unavailable-state-action" href="data.html">
                <i class="fa-solid fa-table acadia-icon" aria-hidden="true"></i>
                <span>Data Coverage</span>
              </a>
            </div>
          </div>
        </article>
      `,
    );
    return;
  }

  const sentiment = sentimentForChange(economyChange);
  const inflation = findMetric(healthCards, "inflation", "Inflation");
  const unemployment = findMetric(healthCards, "unemployment", "Unemployment");
  const gdp = findMetric(healthCards, "gdp-growth", "GDP growth");
  const volatility = riskMetricCards().find((item) => item.name === "Volatility");
  const oil = commodityCardsForView.find((item) => item.id === "oil");
  const dollar = currencyCardsForView.find((item) => item.id === "dollar-index");
  const tiles = [
    {
      label: "Global score",
      value: economyChange?.label || sentiment.label,
      detail: sentiment.phrase === "waiting on live data" ? "Waiting on comparable live inputs" : sentiment.phrase,
      href: "markets.html",
      icon: "fa-earth-americas",
      tone: sentiment.tone,
    },
    overviewMetricTile(inflation, {
      label: "Inflation",
      href: "indicators.html",
      icon: "fa-receipt",
      detail: "Consumer prices",
    }),
    overviewMetricTile(unemployment, {
      label: "Unemployment",
      href: "indicators.html",
      icon: "fa-briefcase",
      detail: "Labor market",
    }),
    overviewMetricTile(volatility, {
      label: "Volatility",
      href: "indicators.html",
      icon: "fa-wave-square",
      detail: "Risk tone",
    }),
    overviewMetricTile(oil, {
      label: "Oil",
      href: "supports.html",
      icon: "fa-gas-pump",
      detail: "Input costs",
    }),
    overviewMetricTile(dollar, {
      label: "Dollar",
      href: "supports.html",
      icon: "fa-dollar-sign",
      detail: "Currency pressure",
    }),
    overviewMetricTile(gdp, {
      label: "GDP trend",
      href: "indicators.html",
      icon: "fa-seedling",
      detail: "Growth pace",
    }),
    marketBreadthTile(regionalCards, economyChange),
  ];

  setDynamicContent(overviewGrid, tiles.map(renderOverviewTile).join(""));
}

function briefListItem(item) {
  const role = item.role ? `<small>${escapeHtml(item.role)}</small>` : "";

  return `
    <li class="brief-list-item brief-list-item-${escapeHtml(item.tone || "stable")}">
      ${role}
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.copy)}</span>
    </li>
  `;
}

function buildWhatChangedItems(movers, healthCards, commodityCardsForView) {
  const items = movers.map((card) => ({
    label: displayMetricName(card),
    copy: `moved ${card.periodChange || metricDeltaLabel(card)} ${periodPhrase(selectedEconomyPeriod)}.`,
    tone: heroMoverTone(card),
  }));
  const inflation = findMetric(healthCards, "inflation", "Inflation");
  const oil = commodityCardsForView.find((item) => item.id === "oil");

  if (isInterpretableIndicatorCard(inflation)) {
    items.push({
      label: "Inflation",
      copy: `${inflation.value || "Loading"} with ${inflation.periodChange || metricDeltaLabel(inflation)} change.`,
      tone: metricCardTone(inflation),
    });
  }

  if (hasSourceBackedValue(oil) && Number.isFinite(oil.periodChangeValue) && !items.some((item) => item.label === "Oil")) {
    items.push({
      label: "Oil",
      copy: `${oil.periodChange || metricDeltaLabel(oil)} ${periodPhrase(selectedEconomyPeriod)}, a mixed signal for input costs.`,
      tone: "mixed",
    });
  }

  return items.length
    ? items.slice(0, 5)
    : [
        {
          label: "No source-backed change",
          copy: "Mercury will summarize changes when live values are available.",
          tone: "unavailable",
        },
      ];
}

function buildRiskWatchItems(riskCards, healthCards) {
  if (!hasAnySourceBackedValue([...riskCards, ...healthCards])) {
    return [
      {
        label: "No source-backed risk read",
        copy: "Risk and rates need live values before Mercury can identify current pressures.",
        tone: "unavailable",
      },
    ];
  }

  const volatility = riskCards.find((item) => item.name === "Volatility") || riskCards[0];
  const credit = riskCards.find((item) => item.name === "Credit");
  const stress = riskCards.find((item) => item.name === "Stress");
  const rates = findMetric(healthCards, "interest-rates", "Interest rates");

  return [
    volatility
      ? {
          label: "Volatility",
          copy: `${volatility.value || volatility.trend || "Loading"} with ${metricDeltaLabel(volatility)} change.`,
          tone: metricCardTone(volatility),
        }
      : null,
    credit
      ? {
          label: "Credit",
          copy: `${credit.value || credit.trend || "Loading"} with ${metricDeltaLabel(credit)} movement.`,
          tone: metricCardTone(credit),
        }
      : null,
    stress
      ? {
          label: "Stress",
          copy: `${stress.value || stress.trend || "Loading"} with ${metricDeltaLabel(stress)} movement.`,
          tone: metricCardTone(stress),
        }
      : null,
    rates
      ? {
          label: "Rates",
          copy: `${rates.value || "Loading"} with ${rates.periodChange || metricDeltaLabel(rates)} change.`,
          tone: metricCardTone(rates),
        }
      : null,
  ]
    .filter(Boolean)
    .slice(0, 3);
}

function numericDeltaValue(card) {
  if (Number.isFinite(card?.periodChangeValue)) {
    return card.periodChangeValue;
  }

  const value = Number.parseFloat(String(card?.periodChange || card?.change || "").replace(/,/g, ""));

  return Number.isFinite(value) ? value : 0;
}

function indicatorReadSentence(card) {
  if (!isInterpretableIndicatorCard(card)) {
    return "";
  }

  const value = card.value || "Loading";
  const delta = card.periodChange || metricDeltaLabel(card);
  const numericDelta = numericDeltaValue(card);

  if (card.id === "gdp-growth") {
    if (numericDelta > 0.05) {
      return `GDP growth improved to ${value}.`;
    }

    if (numericDelta < -0.05) {
      return `GDP growth softened to ${value}.`;
    }

    return `GDP growth is steady at ${value}.`;
  }

  if (card.id === "unemployment") {
    if (numericDelta < -0.05) {
      return `Unemployment improved to ${value}.`;
    }

    if (numericDelta > 0.05) {
      return `Unemployment rose to ${value}, adding labor-market pressure.`;
    }

    return `Unemployment is unchanged at ${value}.`;
  }

  if (card.id === "inflation") {
    if (numericDelta < -0.05) {
      return `Inflation cooled to ${value}, but still matters for household purchasing power.`;
    }

    if (numericDelta > 0.05) {
      return `Inflation rose to ${value}, keeping price pressure visible.`;
    }

    return `Inflation is steady at ${value}, keeping price pressure in view.`;
  }

  if (card.id === "interest-rates") {
    if (numericDelta < -0.05) {
      return `Interest rates eased to ${value}, but policy is still restrictive.`;
    }

    if (numericDelta > 0.05) {
      return `Interest rates moved higher to ${value}, keeping policy restrictive.`;
    }

    return `Interest rates remain restrictive at ${value}.`;
  }

  return `${displayMetricName(card)} is ${value} with ${delta} change.`;
}

function isInterpretableIndicatorCard(card) {
  return Boolean(
    card &&
      card.sourceStatus === "Source-backed" &&
      card.value &&
      card.value !== "Unavailable" &&
      card.value !== "Loading",
  );
}

function buildIndicatorRead(healthCards) {
  const gdp = findMetric(healthCards, "gdp-growth", "GDP growth");
  const unemployment = findMetric(healthCards, "unemployment", "Unemployment");
  const inflation = findMetric(healthCards, "inflation", "Inflation");
  const rates = findMetric(healthCards, "interest-rates", "Interest rates");
  const directionalCards = [gdp, unemployment, inflation, rates].filter(isInterpretableIndicatorCard);

  if (!directionalCards.length) {
    return "Mercury is waiting for live economic releases before interpreting this read.";
  }

  const supportCount = directionalCards.filter((card) => indicatorSignalRole(card).kind === "support").length;
  const pressureCount = directionalCards.filter((card) => indicatorSignalRole(card).kind === "pressure").length;
  const lead =
    supportCount > pressureCount
      ? "Economic releases are improving."
      : pressureCount > supportCount
        ? "Economic releases are under pressure."
        : "Economic releases are mixed.";
  const sentences = [
    lead,
    indicatorReadSentence(gdp),
    indicatorReadSentence(unemployment),
    indicatorReadSentence(inflation),
    indicatorReadSentence(rates),
  ].filter(Boolean);

  return sentences.join(" ");
}

function indicatorDriverCopy(card) {
  const name = displayMetricName(card);
  const delta = card.periodChange || metricDeltaLabel(card);
  const numericDelta = numericDeltaValue(card);

  if (card.id === "inflation") {
    return numericDelta > 0
      ? `Price pressure increased by ${delta}, making inflation the release to watch.`
      : `Price pressure cooled by ${delta}, easing part of the economic read.`;
  }

  if (card.id === "interest-rates") {
    return numericDelta > 0
      ? `Policy moved tighter by ${delta}, which can pressure credit-sensitive activity.`
      : `Policy eased by ${delta}, reducing some rate pressure.`;
  }

  if (card.id === "unemployment") {
    return Math.abs(numericDelta) <= 0.05
      ? `Labor conditions were unchanged, keeping employment risk stable.`
      : `Labor conditions moved ${delta}, changing the employment backdrop.`;
  }

  if (card.id === "gdp-growth") {
    return numericDelta >= 0
      ? `Growth improved by ${delta}, adding support to the economic read.`
      : `Growth softened by ${delta}, weighing on the economic read.`;
  }

  if (name === "Volatility") {
    return `Market volatility moved ${delta}, shaping the risk backdrop.`;
  }

  return `${name} moved ${delta}, adding context to the latest release read.`;
}

function indicatorSignalRole(card) {
  const name = displayMetricName(card);
  const numericDelta = numericDeltaValue(card);
  const absDelta = Math.abs(numericDelta);
  const tone = metricCardTone(card);
  const stable = absDelta <= 0.05;

  if (card.id === "inflation") {
    if (numericDelta > 0.05) {
      return { label: "Price pressure", kind: "pressure", tone: "down", priority: 1 };
    }

    if (numericDelta < -0.05) {
      return { label: "Inflation relief", kind: "support", tone: "up", priority: 2 };
    }

    return { label: "Price anchor", kind: "stable", tone: "stable", priority: 6 };
  }

  if (card.id === "interest-rates") {
    if (numericDelta > 0.05) {
      return { label: "Policy pressure", kind: "pressure", tone: "down", priority: 3 };
    }

    if (numericDelta < -0.05) {
      return { label: "Rate relief", kind: "support", tone: "up", priority: 4 };
    }

    return { label: "Policy anchor", kind: "stable", tone: "stable", priority: 7 };
  }

  if (card.id === "unemployment") {
    if (numericDelta > 0.05) {
      return { label: "Labor pressure", kind: "pressure", tone: "down", priority: 3 };
    }

    if (numericDelta < -0.05) {
      return { label: "Labor support", kind: "support", tone: "up", priority: 4 };
    }

    return { label: "Stable anchor", kind: "stable", tone: "stable", priority: 5 };
  }

  if (card.id === "gdp-growth") {
    if (numericDelta > 0.05) {
      return { label: "Growth support", kind: "support", tone: "up", priority: 1 };
    }

    if (numericDelta < -0.05) {
      return { label: "Growth drag", kind: "pressure", tone: "down", priority: 2 };
    }

    return { label: "Growth stable", kind: "stable", tone: "stable", priority: 6 };
  }

  if (name === "Volatility") {
    if (numericDelta > 0.05) {
      return { label: "Risk pressure", kind: "pressure", tone: "caution", priority: 2 };
    }

    if (numericDelta < -0.05) {
      return { label: "Risk relief", kind: "support", tone: "up", priority: 4 };
    }

    return { label: "Risk stable", kind: "stable", tone: "stable", priority: 7 };
  }

  if (name === "Credit" || name === "Stress") {
    if (tone === "down" || tone === "caution") {
      return { label: `${name} pressure`, kind: "pressure", tone: "down", priority: 5 };
    }

    if (tone === "up") {
      return { label: `${name} support`, kind: "support", tone: "up", priority: 5 };
    }
  }

  return { label: "Context signal", kind: stable ? "stable" : "support", tone, priority: 8 };
}

function buildIndicatorDriverItems(healthCards, riskCards) {
  const candidates = [...healthCards, ...riskCards]
    .filter(isInterpretableIndicatorCard)
    .map((card) => ({
      card,
      role: indicatorSignalRole(card),
      magnitude: Math.abs(numericDeltaValue(card)),
    }))
    .filter((item) => item.magnitude > 0 || item.role.kind === "stable");
  const sortBySignal = (a, b) => a.role.priority - b.role.priority || b.magnitude - a.magnitude;
  const strongestSupport = candidates.filter((item) => item.role.kind === "support").sort(sortBySignal)[0];
  const strongestPressure = candidates.filter((item) => item.role.kind === "pressure").sort(sortBySignal)[0];
  const stableAnchor = candidates.filter((item) => item.role.kind === "stable").sort(sortBySignal)[0];
  const remaining = candidates
    .filter((item) => ![strongestSupport, strongestPressure, stableAnchor].includes(item))
    .sort(sortBySignal);
  const selected = [strongestSupport, strongestPressure, stableAnchor, ...remaining].filter(Boolean).slice(0, 3);

  return selected.map(({ card, role }) => ({
    card,
    role: role.label,
    label: displayMetricName(card),
    copy: indicatorDriverCopy(card),
    tone: role.tone,
  }));
}

function buildIndicatorMeaning(healthCards, riskCards) {
  const inflation = findMetric(healthCards, "inflation", "Inflation");
  const rates = findMetric(healthCards, "interest-rates", "Interest rates");
  const unemployment = findMetric(healthCards, "unemployment", "Unemployment");
  const volatility = riskCards.find((item) => item.name === "Volatility");
  const interpretableCards = [inflation, rates, unemployment, volatility].filter(isInterpretableIndicatorCard);

  if (!interpretableCards.length) {
    return "Mercury needs live economic releases and risk indicators before explaining what matters in this read.";
  }

  const inflationValue = inflation?.value && inflation.value !== "Unavailable" ? inflation.value : "inflation";
  const ratesValue = rates?.value && rates.value !== "Unavailable" ? rates.value : "policy rates";
  const unemploymentValue =
    unemployment?.value && unemployment.value !== "Unavailable" ? unemployment.value : "the labor market";
  const volatilityValue = volatility?.value && volatility.value !== "Unavailable" ? volatility.value : "market risk";

  return `Inflation at ${inflationValue} and rates at ${ratesValue} define the constraint on growth. Unemployment at ${unemploymentValue} keeps the labor read stable, while volatility at ${volatilityValue} shows how much market stress is attached to the economic data.`;
}

function renderIndicatorBriefing(healthCards, riskCards) {
  const driversList = document.querySelector("#indicator-drivers-list");
  const drivers = buildIndicatorDriverItems(healthCards, riskCards);

  setText("#view-title", primaryViewTitle());
  setText("#hero-insight", buildIndicatorRead(healthCards));
  setHtml("#hero-movers", renderHeroMovers(drivers.map((item) => item.card).filter(Boolean)));
  setHtml("#hero-sparkline", "");
  setText("#indicator-read-copy", buildIndicatorRead(healthCards));
  setText("#indicator-meaning-copy", buildIndicatorMeaning(healthCards, riskCards));

  if (driversList) {
    setDynamicContent(driversList, drivers.length
      ? drivers.map(briefListItem).join("")
      : '<li class="brief-list-item brief-list-item-unavailable"><strong>Waiting for releases</strong><span>Indicator drivers will appear when source data is available.</span></li>');
  }
}

function buildBreadthSentence(cards) {
  const breadthCards =
    selectedRegion === "Global"
      ? cards.filter((card) => ["United States", "Europe", "Asia"].includes(displayMetricName(card)))
      : cards.filter(isEconomyScoreInput);
  const usableCards = breadthCards.filter((card) => Number.isFinite(card.periodChangeValue));

  if (!usableCards.length) {
    return "";
  }

  const positiveCount = usableCards.filter((card) => card.periodChangeValue > 0.05).length;

  if (selectedRegion === "Global") {
    if (positiveCount === usableCards.length) {
      const countLabel = usableCards.length === 3 ? "three" : usableCards.length;

      return `Market breadth remains healthy with all ${countLabel} major regions participating.`;
    }

    return `Market breadth is mixed, with ${positiveCount} of ${usableCards.length} major regions positive.`;
  }

  if (positiveCount === usableCards.length) {
    return `Participation is broad, with all ${usableCards.length} visible segments positive.`;
  }

  return `Participation is mixed, with ${positiveCount} of ${usableCards.length} visible segments positive.`;
}

function buildOilContextSentence(commodityCardsForView) {
  const oil = commodityCardsForView.find((card) => card.id === "oil");

  if (!oil || !Number.isFinite(oil.periodChangeValue)) {
    return "";
  }

  const change = oil.periodChange || metricDeltaLabel(oil);

  if (oil.periodChangeValue < -0.05) {
    return `Oil prices declined (${change}), easing input-cost pressure but also hinting at softer demand expectations.`;
  }

  if (oil.periodChangeValue > 0.05) {
    return `Oil prices rose (${change}), adding input-cost pressure to the broader read.`;
  }

  return `Oil is little changed (${change}), so input-cost pressure is not the main story.`;
}

function buildEconomicBrief(change, movers, riskCards, heroCards = [], commodityCardsForView = []) {
  if (isCompleteLiveUnavailable()) {
    return "Mercury cannot produce a source-backed economic read right now. Public sources did not return usable values.";
  }

  if (!change) {
    return "Mercury is waiting for enough live data to explain the current economic read.";
  }

  const sentiment = sentimentForChange(change);
  const scope = selectedRegion === "Global" ? "Global growth signals" : `${selectedRegion} market signals`;
  const direction =
    sentiment.tone === "up"
      ? "remain positive"
      : sentiment.tone === "down"
        ? "are under pressure"
        : "are mixed";
  const leader = movers.find((card) => card.periodChangeValue > 0.05);
  const leaderSentence = leader
    ? `${displayMetricName(leader)} led the move (${leader.periodChange || metricDeltaLabel(leader)}).`
    : "";
  const oilSentence = buildOilContextSentence(commodityCardsForView);
  const breadthSentence = buildBreadthSentence(heroCards);
  const risk = riskCards.find((item) => item.name === "Volatility") || riskCards[0];
  const riskSentence = risk
    ? `${risk.name} is at ${risk.value || risk.trend || "a pending read"}, keeping the risk backdrop visible.`
    : "Mercury is watching risk, inflation, and support signals for the next shift.";

  return [`${scope} ${direction} ${periodPhrase(selectedEconomyPeriod)}.`, leaderSentence, oilSentence, breadthSentence, riskSentence]
    .filter(Boolean)
    .join(" ");
}

function renderEconomicBrief({ economyChange, heroCards, healthCards, commodityCardsForView }) {
  const movers = heroMoverCards(heroCards);
  const riskCards = riskMetricCards();
  const briefCopy = document.querySelector("#economic-brief-copy");
  const changedList = document.querySelector("#what-changed-list");
  const riskList = document.querySelector("#risk-watch-list");

  if (briefCopy) {
    briefCopy.textContent = buildEconomicBrief(economyChange, movers, riskCards, heroCards, commodityCardsForView);
  }

  if (changedList) {
    setDynamicContent(changedList, buildWhatChangedItems(movers, healthCards, commodityCardsForView).map(briefListItem).join(""));
  }

  if (riskList) {
    setDynamicContent(riskList, buildRiskWatchItems(riskCards, healthCards).map(briefListItem).join(""));
  }
}

function isGlobalView() {
  return selectedRegion === "Global";
}

function findRegionalMarket(region) {
  return marketPulse.find(
    (item) => item.viewGroup === "economy" && item.region === region && item.marketRole === "large-cap",
  );
}

function regionIconClass(region) {
  if (region === "U.S. Total") return "fa-earth-americas";
  if (region === "International") return "fa-globe";
  if (region === "United States") return "fa-earth-americas";
  if (region === "Europe") return "fa-earth-europe";
  if (region === "Asia") return "fa-earth-asia";

  return "fa-earth-americas";
}

function globalMarketCards() {
  const globalAllocationCards = [
    ["U.S. Total", findMetric(marketPulse, "global-us-total", "U.S. Total")],
    ["International", findMetric(marketPulse, "global-international", "International")],
  ];
  const cards = [
    ...globalAllocationCards,
    ["United States", findRegionalMarket("United States")],
    ["Europe", findRegionalMarket("Europe")],
    ["Asia", findRegionalMarket("Asia")],
  ]
    .filter(([, metric]) => Boolean(metric))
    .map(([name, metric]) => ({
      ...withPeriodDelta(metric, selectedEconomyPeriod),
      name,
      context: "",
      icon: regionIconClass(name),
    }));

  if (cards.length) {
    return cards;
  }

  return ["U.S. Total", "International", "United States", "Europe", "Asia"].map((name) => ({
    name,
    context: "Market proxy needs live data",
    icon: regionIconClass(name),
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

const CURRENCY_SUPPORT_CARD_IDS = ["dollar-index", "euro", "yen"];
const COMMODITY_CARD_IDS = ["oil", "bitcoin"];

function orderedMarketSupportCards(order) {
  const grouped = currencyCards().map((item) => withPeriodDelta(item, selectedEconomyPeriod));

  return order
    .map((id) => grouped.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => ({ ...item, hideChart: true }));
}

function orderedGlobalCurrencyCards() {
  return orderedMarketSupportCards([...CURRENCY_SUPPORT_CARD_IDS, ...COMMODITY_CARD_IDS]);
}

function currencySupportCards() {
  return orderedMarketSupportCards(CURRENCY_SUPPORT_CARD_IDS);
}

function commodityCards() {
  return orderedMarketSupportCards(COMMODITY_CARD_IDS);
}

function economicHealthCards() {
  return economicHealth.map((item) => ({ ...withPeriodDelta(item, selectedEconomyPeriod), hideChart: true }));
}

function riskMetricCards() {
  return riskIndicators.map((indicator) => ({
    ...indicator,
    name: indicator.name === "Credit stress" ? "Credit" : indicator.name === "Financial stress" ? "Stress" : indicator.name,
    ticker: indicator.name === "Volatility" ? "VIX" : indicator.ticker || "",
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
  const summary = sentenceSummary([
    item.name,
    item.context,
    item.value,
    item.trend,
    signalFreshnessLabel(item),
  ]);

  return `
    <article class="signal-tile signal-tile-${escapeHtml(tone)}" aria-label="${escapeHtml(summary)}">
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
  const summary = sentenceSummary([
    indicator.name,
    indicator.copy,
    `Trend ${indicator.trend}`,
    indicator.freshness?.label,
  ]);

  return `
    <article class="indicator-row" aria-label="${escapeHtml(summary)}">
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
  const summary = sentenceSummary([
    region.name,
    region.copy,
    `Trend ${region.trend}`,
    region.freshness?.label,
  ]);

  return `
    <article class="region-row" aria-label="${escapeHtml(summary)}">
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
  if (Number.isFinite(metric.marketOrder)) {
    return metric.marketOrder;
  }

  const index = MARKET_ROLE_ORDER.indexOf(metric.marketRole);
  return index === -1 ? MARKET_ROLE_ORDER.length : index;
}

function unavailableRegionalMetric(metric, region) {
  return {
    ...metric,
    value: "Unavailable",
    trend: "Unavailable",
    tone: "unavailable",
    source: "Public data",
    cadence: "Needs live data",
    sourceStatus: "Unavailable",
    freshness: {
      status: "unavailable",
      label: "Freshness unavailable",
      detail: "Regional market proxy data requires live sources.",
    },
    change: "Unavailable",
    previous: "Unavailable",
    points: [],
    history: [],
    comparison: "percent-change",
    region,
  };
}

function unavailableRegionalMarketCards(region) {
  if (region === "Europe") {
    return [
      { name: "Europe", context: "Broad Europe proxy", marketRole: "large-cap", marketOrder: 10 },
      { name: "Financials", context: "Europe financial system proxy", marketRole: "financials", marketOrder: 20 },
      { name: "Industrials", context: "Europe production proxy", marketRole: "industrials", marketOrder: 30 },
      { name: "Healthcare", context: "Europe defensive sector proxy", marketRole: "healthcare", marketOrder: 40 },
      { name: "Consumer", context: "Europe demand proxy", marketRole: "consumer", marketOrder: 50 },
      { name: "Energy", context: "Europe energy proxy", marketRole: "energy", marketOrder: 60 },
    ].map((metric) => unavailableRegionalMetric(metric, region));
  }

  if (region === "Asia") {
    return [
      { name: "Japan", context: "Japan market proxy", marketRole: "country", marketOrder: 10 },
      { name: "China", context: "China market proxy", marketRole: "country", marketOrder: 20 },
      { name: "India", context: "India market proxy", marketRole: "country", marketOrder: 30 },
      { name: "Taiwan", context: "Taiwan market proxy", marketRole: "country", marketOrder: 40 },
      { name: "South Korea", context: "South Korea market proxy", marketRole: "country", marketOrder: 50 },
      { name: "Asia Broad", context: "Broad Asia-Pacific proxy", marketRole: "large-cap", marketOrder: 60 },
    ].map((metric) => unavailableRegionalMetric(metric, region));
  }

  return [
    { name: "S&P 500", context: "Broad U.S. economy proxy", marketRole: "large-cap", marketOrder: 10 },
    { name: "Small Cap", context: "Domestic growth sensitivity proxy", marketRole: "small-cap", marketOrder: 20 },
    { name: "Technology", context: "Innovation and risk appetite proxy", marketRole: "technology", marketOrder: 30 },
    { name: "Financials", context: "Credit and banking proxy", marketRole: "financials", marketOrder: 40 },
    { name: "Industrials", context: "Production and capex proxy", marketRole: "industrials", marketOrder: 50 },
    { name: "Bonds", context: "Interest rate environment proxy", marketRole: "bonds", marketOrder: 60 },
    { name: "Energy", context: "U.S. energy sector proxy", marketRole: "energy", marketOrder: 70 },
    { name: "REIT", context: "U.S. real estate proxy", marketRole: "real-estate", marketOrder: 80 },
    { name: "Healthcare", context: "U.S. healthcare sector proxy", marketRole: "healthcare", marketOrder: 90 },
    { name: "Consumer", context: "U.S. consumer discretionary proxy", marketRole: "consumer", marketOrder: 100 },
    { name: "Communications", context: "U.S. communication services proxy", marketRole: "communications", marketOrder: 110 },
    { name: "Growth", context: "U.S. growth style proxy", marketRole: "growth", marketOrder: 120 },
    { name: "Materials", context: "U.S. materials sector proxy", marketRole: "materials", marketOrder: 130 },
  ].map((metric) => unavailableRegionalMetric(metric, region));
}

function regionalMarketCards() {
  const regionalCards = marketPulse
    .filter((item) => item.viewGroup === "economy" && item.region === selectedRegion)
    .sort((a, b) => marketRoleRank(a) - marketRoleRank(b));

  if (regionalCards.length) {
    return regionalCards;
  }

  if (!isGlobalView()) {
    return unavailableRegionalMarketCards(selectedRegion);
  }

  return [
    findMetric(marketPulse, "us-equities", "S&P 500"),
    findMetric(marketPulse, "us-small-cap", "Small Cap"),
    findMetric(marketPulse, "us-technology", "Technology"),
    findMetric(marketPulse, "bonds", "Bonds"),
  ].filter(Boolean);
}

function marketSortValue(card) {
  return Number.isFinite(card.periodChangeValue) ? card.periodChangeValue : null;
}

function sortMarketCardsForDisplay(cards) {
  if (selectedMarketSort === "relevance") {
    return cards;
  }

  const direction = selectedMarketSort === "return-asc" ? 1 : -1;

  return [...cards].sort((a, b) => {
    const aValue = marketSortValue(a);
    const bValue = marketSortValue(b);

    if (aValue === null && bValue === null) {
      return marketRoleRank(a) - marketRoleRank(b);
    }

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    return (aValue - bValue) * direction || marketRoleRank(a) - marketRoleRank(b);
  });
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
    findMetric(marketPulse, "bitcoin", "Bitcoin"),
  ].filter(Boolean);
}

function renderDashboard() {
  const economyGrid = document.querySelector("#economy-grid");
  const currencyGrid = document.querySelector("#currency-grid");
  const commodityGrid = document.querySelector("#commodity-grid");
  const digitalAssetsGrid = document.querySelector("#digital-assets-grid");
  const riskList = document.querySelector("#risk-list");
  const economicHealthGrid = document.querySelector("#economic-health-grid");
  const globalView = isGlobalView();
  const marketCards = regionalMarketCards().map((item) => withPeriodDelta(item, selectedEconomyPeriod));
  const regionalCards = globalView ? globalMarketCards() : marketCards;
  const displayedMarketCards = sortMarketCardsForDisplay(regionalCards);
  const currencyCardsForView = currencySupportCards();
  const commodityCardsForView = commodityCards();
  const healthCards = economicHealthCards();
  const riskCardsForView = riskMetricCards();
  const marketHeroCards = marketHeroCardsForView(globalView, regionalCards, marketCards);
  const heroCards =
    currentPage === "indicators"
      ? [...healthCards, ...riskCardsForView].filter(Boolean)
      : currentPage === "markets"
        ? marketHeroCards
        : globalView
          ? [...regionalCards, ...currencyCardsForView, ...commodityCardsForView]
          : [...regionalCards, ...healthCards].filter(Boolean);
  const economyChange = sectionChange(heroCards);
  const completeUnavailable = isCompleteLiveUnavailable();

  document.body.classList.toggle("dashboard-global", globalView);
  document.body.classList.toggle("dashboard-focused", !globalView);
  document.body.classList.toggle("dashboard-unavailable", completeUnavailable);
  setText("#view-title", primaryViewTitle());
  setText("#economy-title", globalView ? "Regional Markets" : `${selectedRegion} Markets`);

  if (economyGrid) {
    setDynamicContent(economyGrid, completeUnavailable
      ? isDashboardPage() || currentPage === "markets"
        ? ""
        : renderUnavailableCard(
          "Regional markets unavailable",
          "Market cards need live public market values before Mercury can compare regions.",
          "Yahoo Finance market data",
        )
      : displayedMarketCards
        .map((item) => (isDashboardPage() ? { ...item, isOverview: true } : item))
        .map(renderMetricCard)
        .join(""));
  }

  if (currencyGrid) {
    setDynamicContent(currencyGrid, completeUnavailable
      ? isDashboardPage() || currentPage === "supports"
        ? ""
        : renderUnavailableCard(
          "Currency data unavailable",
          "Currency support cards need live source-backed values before Mercury can interpret them.",
          "Yahoo Finance currency data",
        )
      : currencyCardsForView
        .map((item) => (isDashboardPage() ? { ...item, hideChart: true, isOverview: true } : item))
        .map((item) => renderMetricCard(item))
        .join(""));
  }

  if (commodityGrid) {
    const commodityGridCards =
      currentPage === "supports" && digitalAssetsGrid
        ? commodityCardsForView.filter((item) => item.id !== "bitcoin")
        : commodityCardsForView;

    setDynamicContent(commodityGrid, completeUnavailable
      ? isDashboardPage() || currentPage === "supports"
        ? ""
        : renderUnavailableCard(
          "Commodity data unavailable",
          "Commodity support cards need live source-backed values before Mercury can interpret them.",
          "Yahoo Finance commodity data",
        )
      : commodityGridCards
        .map((item) => (isDashboardPage() ? { ...item, hideChart: true, isOverview: true } : item))
        .map((item) => renderMetricCard(item))
        .join(""));
  }

  if (digitalAssetsGrid) {
    setDynamicContent(digitalAssetsGrid, completeUnavailable
      ? currentPage === "supports"
        ? ""
        : renderUnavailableCard(
          "Digital asset data unavailable",
          "Bitcoin support context needs live source-backed values before Mercury can interpret it.",
          "Yahoo Finance digital asset data",
        )
      : commodityCardsForView
        .filter((item) => item.id === "bitcoin")
        .map((item) => renderMetricCard(item))
        .join(""));
  }

  if (economicHealthGrid) {
    setDynamicContent(economicHealthGrid, completeUnavailable
      ? isDashboardPage()
        ? ""
        : renderUnavailableCard(
          "Economic releases unavailable",
          "Economic indicator cards need live official releases before Mercury can interpret them.",
          "FRED economic releases",
        )
      : healthCards
        .map((item) => (isDashboardPage() ? { ...item, isOverview: true } : item))
        .map((item) => renderMetricCard(item))
        .join(""));
  }

  updateSectionBadge("#economy-change-badge", economyChange, { includeSentiment: true });
  if (currentPage === "supports") {
    renderSupportBriefing([...currencyCardsForView, ...commodityCardsForView]);
  } else if (currentPage === "indicators") {
    renderIndicatorBriefing(healthCards, riskCardsForView);
  } else {
    updateHeroInsight(heroCards, economyChange);
    updateSectionBadge("#currency-change-badge", sectionChange(currencyCardsForView));
  }
  renderMobileDashboardCard(heroCards, economyChange);
  renderMarketDrivers(marketHeroCards);

  if (riskList) {
    setDynamicContent(riskList, completeUnavailable
      ? isDashboardPage()
        ? ""
        : renderUnavailableCard(
          "Risk indicators unavailable",
          "Risk cards need live public values before Mercury can identify current pressures.",
          "Yahoo Finance and FRED risk data",
        )
      : riskCardsForView
        .map((item) => (isDashboardPage() ? { ...item, isOverview: true } : item))
        .map(renderMetricCard)
        .join(""));
  }

  renderOverviewTiles({
    economyChange,
    regionalCards,
    currencyCardsForView,
    commodityCardsForView,
    healthCards,
  });
  renderEconomicBrief({
    economyChange,
    heroCards,
    healthCards,
    commodityCardsForView,
  });
  syncControlAvailability();
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
    setStatusPillState(sourcePill, "caution");
    return;
  }

  if (isPartial) {
    setHtml(
      "#macro-connection-pill",
      '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Some data sources connected',
    );
    setStatusPillState(sourcePill, "caution");
    return;
  }

  setHtml(
    "#macro-connection-pill",
    '<i class="fa-solid fa-plug-circle-check" aria-hidden="true"></i> Data sources connected',
  );
  setStatusPillState(sourcePill, "live");
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

  setText("#source-rail-freshness", displayFreshness(freshness));
  setText("#snapshot-freshness", displayFreshness(freshness));

  if (!freshnessPill) {
    return;
  }

  setHtml(
    "#sample-set-date",
    `<i class="fa-solid ${freshnessPillIcon(freshness.status)}" aria-hidden="true"></i> ${escapeHtml(displayFreshness(freshness))}`,
  );
  setStatusPillState(freshnessPill, freshnessStatusPillState(freshness.status));
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
  setStatusPillState("#last-updated-pill", snapshot.status === "partial" ? "caution" : "live");
  setText("#economy-title", "Economy");
  setText("#risk-title", "Risk and confidence");
  setText("#global-title", "Regional growth");
  setText("#source-coverage-title", "Current Source Health");
  renderSourceHealth(snapshot);
  setText(
    "#source-provider-copy",
    "Configured provider inventory: financial data references Yahoo Finance, economic releases reference FRED, and regional growth references World Bank.",
  );
  setText("#latest-release-window", formatReleaseWindow(snapshot.releaseRange));
  setText("#live-last-checked", formatCheckedAt(snapshot.checkedAt));
  setText("#source-rail-checked", formatCheckedAt(snapshot.checkedAt));
  setText("#refresh-schedule", "On page load");
  setText("#source-rail-refresh", "On page load");
  setSourceStatusBadge(
    "#market-source-status",
    sourceStatusLabel(snapshot.marketPulse, "Yahoo Finance"),
    sourceStatusTone(snapshot.marketPulse),
  );
  setText("#market-source-detail", "Daily market, commodity, currency, and crypto data from Yahoo Finance");
  setSourceStatusBadge(
    "#macro-source-status",
    sourceStatusLabel(snapshot.economicHealth, "FRED"),
    sourceStatusTone(snapshot.economicHealth),
  );
  setText("#macro-source-detail", "Official economic releases from FRED");
  setSourceStatusBadge(
    "#risk-source-status",
    sourceStatusLabel(snapshot.riskIndicators, "Yahoo Finance/FRED"),
    sourceStatusTone(snapshot.riskIndicators),
  );
  setText("#risk-source-detail", "Market risk from Yahoo Finance; stress index from FRED");
  setSourceStatusBadge(
    "#regional-source-status",
    sourceStatusLabel(snapshot.regions, "World Bank"),
    sourceStatusTone(snapshot.regions),
  );
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

function applyLiveFallback(options = {}) {
  const sourcePill = document.querySelector("#macro-connection-pill");
  const freshnessPill = document.querySelector("#sample-set-date");
  const checkedAt = options.checkedAt || new Date().toISOString();
  const checkedTime = formatCheckedTime(checkedAt);
  const checkedLabel = options.isRetry ? `Checked again ${checkedTime}: unavailable` : `Checked ${checkedTime}: unavailable`;

  resetStatusPillClasses(sourcePill);
  resetStatusPillClasses(freshnessPill);
  marketPulse = markUnavailable(marketPulse);
  economicHealth = markUnavailable(economicHealth);
  riskIndicators = markUnavailable(riskIndicators);
  regions = markUnavailable(regions);
  renderDashboard();

  setText("#global-status-title", "Live data unavailable");
  setText(
    "#summary-copy",
    "Mercury cannot reach live data right now. Values stay unavailable instead of using sample figures.",
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
  setText("#last-updated-pill", checkedLabel);
  setStatusPillState("#last-updated-pill", "caution");
  setText("#economy-title", "Economy");
  setText("#source-coverage-title", "Current Source Health");
  setText(
    "#source-coverage-copy",
    "Current source health: all live data groups are unavailable. Current values will appear when public sources respond.",
  );
  setText("#source-health-score", "0/4");
  setText("#source-health-detail", "Data groups unavailable");
  setHtml(
    "#source-health-list",
    [
      "Market data is not responding",
      "Economic releases are not responding",
      "Risk indicators are not responding",
      "Regional coverage is not responding",
    ]
      .map(
        (label) => `
          <li class="source-health-item source-health-unavailable">
            <i class="fa-solid fa-circle-exclamation acadia-icon" aria-hidden="true"></i>
            <span>${escapeHtml(label)}</span>
          </li>
        `,
      )
      .join(""),
  );
  setText("#latest-release-window", "Unavailable");
  setText("#live-last-checked", options.isRetry ? `Checked again ${formatCheckedAt(checkedAt)}` : formatCheckedAt(checkedAt));
  setText("#source-rail-freshness", "Unavailable");
  setText("#snapshot-freshness", "Unavailable");
  setText("#source-rail-checked", formatCheckedAt(checkedAt));
  setText("#refresh-schedule", "Unavailable");
  setText("#source-rail-refresh", "Unavailable");
  setSourceStatusBadge("#market-source-status", "Unavailable", "unavailable");
  setText("#market-source-detail", "Configured provider: Yahoo Finance market, commodity, currency, and crypto data");
  setSourceStatusBadge("#macro-source-status", "Unavailable", "unavailable");
  setText("#macro-source-detail", "Configured provider: FRED official economic releases");
  setSourceStatusBadge("#risk-source-status", "Unavailable", "unavailable");
  setText("#risk-source-detail", "Configured providers: Yahoo Finance market risk and FRED stress index");
  setSourceStatusBadge("#regional-source-status", "Unavailable", "unavailable");
  setText("#regional-source-detail", "Configured provider: World Bank annual GDP growth");
  setText(
    "#source-provider-copy",
    "Configured provider inventory: Yahoo Finance, FRED, and World Bank remain the source references, not currently healthy live feeds.",
  );
  renderProviderInventorySummary();
  setText("#sample-set-date", "Data status");
  setStatusPillState(freshnessPill, "caution");
  setHtml(
    "#macro-connection-pill",
    '<i class="fa-solid fa-plug-circle-xmark" aria-hidden="true"></i> Live data unavailable',
  );
  setStatusPillState(sourcePill, "caution");

  announceDashboardStatus(`${checkedLabel}. Mercury cannot produce a source-backed read right now.`);
}

async function loadLiveSnapshot(options = {}) {
  const refreshButton = document.querySelector("#refresh-data-button");
  const dashboardShell = document.querySelector("#main-content");
  const checkedAt = new Date().toISOString();
  const isRetry = Boolean(options.isRetry);

  dashboardShell?.setAttribute("aria-busy", "true");
  announceDashboardStatus(isRetry ? "Checking latest dashboard data again." : "Checking latest dashboard data.");

  if (refreshButton) {
    refreshButton.disabled = true;
    refreshButton.innerHTML = '<i class="fa-solid fa-spinner" aria-hidden="true"></i><span class="visually-hidden">Checking data</span>';
  }

  if (window.location.protocol === "file:") {
    applyLiveFallback({ checkedAt, isRetry });
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
    applyLiveFallback({ checkedAt, isRetry });
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
document.querySelector("#refresh-data-button")?.addEventListener("click", () => loadLiveSnapshot({ isRetry: true }));
