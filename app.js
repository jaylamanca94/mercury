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
  pendingMetric("S&P 500", "Vanguard S&P 500 ETF", "fa-building", "us-equities", "VOO"),
  pendingMetric("Small Cap", "Vanguard Small-Cap Index Fund", "fa-shop", "us-small-cap", "VSMAX"),
  pendingMetric("Technology", "Vanguard Information Technology ETF", "fa-microchip", "us-technology", "VGT"),
  pendingMetric("Bonds", "Total bond market ETF", "fa-scale-balanced", "bonds", "BND"),
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

const MARKET_ROLE_ORDER = ["large-cap", "small-cap", "technology", "bonds"];
const CONTEXT_ONLY_METRIC_IDS = new Set(["oil", "dollar-index", "euro", "yen", "inflation", "interest-rates"]);
const CONTEXT_ONLY_TREND_MODELS = new Set(["commodity", "currency", "dollar", "inflation", "policy-rate"]);
const currentPage = document.body?.dataset?.mercuryPage || "dashboard";
let selectedEconomyPeriod = "week";
let selectedCurrencyPeriod = "week";
let selectedRegion = "Global";

function isDashboardPage() {
  return currentPage === "dashboard";
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

function marketDriverLabel(card) {
  if (selectedRegion === "Global") return "Region";
  if (card.marketRole === "large-cap") return "Core market";
  if (card.marketRole === "small-cap") return "Small cap";
  if (card.marketRole === "technology") return "Sector";
  if (card.marketRole === "bonds") return "Defensive asset";

  return "Driver";
}

function marketDriverCopy(card, index) {
  if (card.sourceStatus === "Unavailable" || card.value === "Unavailable") {
    return "Waiting for source-backed market data.";
  }

  const scope = selectedRegion === "Global" ? "global market read" : `${selectedRegion} market read`;
  const direction =
    card.periodChangeValue > 0.05
      ? index === 0
        ? "is the strongest contributor to"
        : "is supporting"
      : card.periodChangeValue < -0.05
        ? index === 0
          ? "is the primary pressure on"
          : "is weighing on"
        : "is holding steady inside";

  return `${displayMetricName(card)} ${direction} the ${scope} ${periodPhrase(selectedEconomyPeriod)}.`;
}

function renderMarketDriverCard(card, index) {
  const tone = card.sourceStatus === "Unavailable" || card.value === "Unavailable" ? "unavailable" : heroMoverTone(card);

  return `
    <article class="market-driver-card market-driver-card-${escapeHtml(tone)} acadia-surface acadia-panel-dense">
      <span class="market-driver-label">${escapeHtml(marketDriverLabel(card))}</span>
      <div class="market-driver-heading">
        <strong>${escapeHtml(displayMetricName(card))}</strong>
        <span>${escapeHtml(card.periodChange || metricDeltaLabel(card))}</span>
      </div>
      <p class="market-driver-copy">${escapeHtml(marketDriverCopy(card, index))}</p>
    </article>
  `;
}

function renderMarketDrivers(cards) {
  const driversGrid = document.querySelector("#market-drivers-grid");
  const driversKicker = document.querySelector("#market-drivers-kicker");

  if (!driversGrid) {
    return;
  }

  const drivers = heroMoverCards(cards);

  if (driversKicker) {
    driversKicker.textContent = selectedRegion === "Global" ? "Regions" : "Drivers";
  }

  driversGrid.innerHTML = drivers.length
    ? drivers.map(renderMarketDriverCard).join("")
    : '<article class="market-driver-card market-driver-card-unavailable acadia-surface acadia-panel-dense">Waiting for comparable market drivers.</article>';
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

  return `
    <article class="support-signal-card support-signal-card-${escapeHtml(profile.tone)} acadia-surface acadia-panel-dense">
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

  return sentences.slice(0, 2).join(" ") || "Support conditions are quiet right now, so Mercury is treating them as context rather than a primary driver.";
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

  setText("#hero-insight", buildSupportHeroInsight(cards));
  setText("#support-brief-copy", supportBriefCopy(cards));
  updateSupportBadge(supportScore(cards));

  if (signalsGrid) {
    signalsGrid.innerHTML = cards.length
      ? cards.map(renderSupportSignalCard).join("")
      : '<article class="support-signal-card support-signal-card-unavailable acadia-surface acadia-panel-dense">Waiting for support signals.</article>';
  }

  if (pressureList) {
    const pressureItems = buildSupportPressureItems(cards);

    pressureList.innerHTML = pressureItems.length
      ? pressureItems.map(briefListItem).join("")
      : '<li class="brief-list-item brief-list-item-stable"><strong>None elevated</strong><span>No major support pressure is standing out right now.</span></li>';
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

function updateHeroInsight(cards, change) {
  const movers = heroMoverCards(cards);

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
    element.textContent = "Unavailable";
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
  const hasChart = !metric.hideChart;
  const metricCaption = metricCaptionLabel(metric);
  const metricContext = displayMetricContext(metric);
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
    <article class="metric-card acadia-metric metric-card-${cardTone}${hasChart ? " metric-card-has-chart" : ""}${metric.isWide ? " metric-card-wide" : ""}" title="${escapeHtml(metricTooltip(metric))}">
      <div class="metric-top">
        <div>
          <div class="metric-title-line">
            <h3 class="metric-name">${escapeHtml(displayMetricName(metric))}</h3>
            ${metricCaption ? `<span class="metric-caption">${escapeHtml(metricCaption)}</span>` : ""}
          </div>
          ${metricContext ? `<p class="metric-context">${escapeHtml(metricContext)}</p>` : ""}
        </div>
        <span class="metric-icon acadia-metric-icon" aria-hidden="true"><i class="${escapeHtml(metricIconClasses(metric))} acadia-icon"></i></span>
      </div>
      <div class="metric-value-row">
        <p class="${metricValueClass(metric.value)} acadia-metric-value">${escapeHtml(metric.value)}</p>
        <span class="metric-delta acadia-metric-delta${deltaState} trend-text-${escapeHtml(cardTone)}">${escapeHtml(metricDeltaLabel(metric))}</span>
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
  return `
    <a class="overview-tile overview-tile-${escapeHtml(tile.tone || "stable")}" href="${escapeHtml(tile.href)}">
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

  overviewGrid.setAttribute("aria-busy", "false");
  overviewGrid.innerHTML = tiles.map(renderOverviewTile).join("");
}

function briefListItem(item) {
  return `
    <li class="brief-list-item brief-list-item-${escapeHtml(item.tone || "stable")}">
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

  if (inflation) {
    items.push({
      label: "Inflation",
      copy: `${inflation.value || "Loading"} with ${inflation.periodChange || metricDeltaLabel(inflation)} change.`,
      tone: metricCardTone(inflation),
    });
  }

  if (oil && !items.some((item) => item.label === "Oil")) {
    items.push({
      label: "Oil",
      copy: `${oil.periodChange || metricDeltaLabel(oil)} ${periodPhrase(selectedEconomyPeriod)}, a mixed signal for input costs.`,
      tone: "mixed",
    });
  }

  return items.slice(0, 5);
}

function buildRiskWatchItems(riskCards, healthCards) {
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

function buildEconomicBrief(change, movers, riskCards) {
  if (!change) {
    return "Mercury is waiting for enough live data to explain the current economic read.";
  }

  const summary = buildHeroInsight(change, movers, selectedEconomyPeriod, selectedRegion);
  const risk = riskCards.find((item) => item.name === "Volatility") || riskCards[0];
  const riskSentence = risk
    ? `${risk.name} is at ${risk.value || risk.trend || "a pending read"}, keeping risk context visible.`
    : "Mercury is watching risk, inflation, and support signals for the next shift.";

  return `${summary} ${riskSentence}`;
}

function renderEconomicBrief({ economyChange, heroCards, healthCards, commodityCardsForView }) {
  const movers = heroMoverCards(heroCards);
  const riskCards = riskMetricCards();
  const briefCopy = document.querySelector("#economic-brief-copy");
  const changedList = document.querySelector("#what-changed-list");
  const riskList = document.querySelector("#risk-watch-list");

  if (briefCopy) {
    briefCopy.textContent = buildEconomicBrief(economyChange, movers, riskCards);
  }

  if (changedList) {
    changedList.innerHTML = buildWhatChangedItems(movers, healthCards, commodityCardsForView).map(briefListItem).join("");
  }

  if (riskList) {
    riskList.innerHTML = buildRiskWatchItems(riskCards, healthCards).map(briefListItem).join("");
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
  if (region === "United States") return "fa-earth-americas";
  if (region === "Europe") return "fa-earth-europe";
  if (region === "Asia") return "fa-earth-asia";

  return "fa-earth-americas";
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
      context: "",
      icon: regionIconClass(name),
    }));

  if (cards.length) {
    return cards;
  }

  return ["United States", "Europe", "Asia"].map((name) => ({
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

function unavailableRegionalMarketCards(region) {
  return [
    { name: region, context: "Large-cap market proxy", marketRole: "large-cap" },
    { name: "Small Cap", context: `${region} small-cap proxy`, marketRole: "small-cap" },
    { name: "Technology", context: `${region} technology proxy`, marketRole: "technology" },
    { name: "Bonds", context: `${region} bond proxy`, marketRole: "bonds" },
  ].map((metric) => ({
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
  }));
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
  const currencyCardsForView = currencySupportCards();
  const commodityCardsForView = commodityCards();
  const healthCards = economicHealthCards();
  const marketHeroCards = marketHeroCardsForView(globalView, regionalCards, marketCards);
  const heroCards =
    currentPage === "indicators"
      ? [...healthCards, ...riskMetricCards()].filter(Boolean)
      : currentPage === "markets"
        ? marketHeroCards
        : globalView
          ? [...regionalCards, ...currencyCardsForView, ...commodityCardsForView]
          : [...regionalCards, ...healthCards].filter(Boolean);
  const economyChange = sectionChange(heroCards);

  document.body.classList.toggle("dashboard-global", globalView);
  document.body.classList.toggle("dashboard-focused", !globalView);
  if (currentPage === "markets" || currentPage === "dashboard") {
    setText("#view-title", currentPage === "markets" ? `${viewTitle(selectedRegion)} Markets` : viewTitle(selectedRegion));
  }
  setText("#economy-title", globalView ? "Regional Markets" : `${selectedRegion} Markets`);

  if (economyGrid) {
    economyGrid.innerHTML = regionalCards
      .map((item) => (isDashboardPage() ? { ...item, isOverview: true } : item))
      .map(renderMetricCard)
      .join("");
  }

  if (currencyGrid) {
    currencyGrid.innerHTML = currencyCardsForView
      .map((item) => (isDashboardPage() ? { ...item, hideChart: true, isOverview: true } : item))
      .map((item) => renderMetricCard(item))
      .join("");
  }

  if (commodityGrid) {
    const commodityGridCards =
      currentPage === "supports" && digitalAssetsGrid
        ? commodityCardsForView.filter((item) => item.id !== "bitcoin")
        : commodityCardsForView;

    commodityGrid.innerHTML = commodityGridCards
      .map((item) => (isDashboardPage() ? { ...item, hideChart: true, isOverview: true } : item))
      .map((item) => renderMetricCard(item))
      .join("");
  }

  if (digitalAssetsGrid) {
    digitalAssetsGrid.innerHTML = commodityCardsForView
      .filter((item) => item.id === "bitcoin")
      .map((item) => renderMetricCard(item))
      .join("");
  }

  if (economicHealthGrid) {
    economicHealthGrid.innerHTML = healthCards
      .map((item) => (isDashboardPage() ? { ...item, isOverview: true } : item))
      .map((item) => renderMetricCard(item))
      .join("");
  }

  updateSectionBadge("#economy-change-badge", economyChange, { includeSentiment: true });
  if (currentPage === "supports") {
    renderSupportBriefing([...currencyCardsForView, ...commodityCardsForView]);
  } else {
    updateHeroInsight(heroCards, economyChange);
    updateSectionBadge("#currency-change-badge", sectionChange(currencyCardsForView));
  }
  renderMarketDrivers(marketHeroCards);

  if (riskList) {
    riskList.innerHTML = riskMetricCards()
      .map((item) => (isDashboardPage() ? { ...item, isOverview: true } : item))
      .map(renderMetricCard)
      .join("");
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
      "Connected source freshness is summarized here so individual cards can stay compact.",
  );
  setText(
    "#source-provider-copy",
    "Financial data provided by Yahoo Finance. Economic releases provided by FRED. Regional growth provided by World Bank.",
  );
  setText("#latest-release-window", formatReleaseWindow(snapshot.releaseRange));
  setText("#live-last-checked", formatCheckedAt(snapshot.checkedAt));
  setText("#source-rail-checked", formatCheckedAt(snapshot.checkedAt));
  setText("#refresh-schedule", "On page load");
  setText("#source-rail-refresh", "On page load");
  setText("#market-source-status", sourceStatusLabel(snapshot.marketPulse, "Yahoo Finance"));
  setText("#market-source-detail", "Daily market, commodity, currency, and crypto data from Yahoo Finance");
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
