const sampleMarketPulse = [
  {
    id: "us-markets",
    name: "U.S. markets",
    context: "Large-cap stocks",
    value: "+0.6%",
    trend: "Up",
    tone: "up",
    icon: "fa-chart-line",
    source: "Placeholder market provider",
    cadence: "Delayed market cadence TBD",
    previous: "+0.1%",
    change: "+0.5 pts",
    points: [24, 28, 27, 33, 35, 42, 46],
  },
  {
    id: "international",
    name: "International",
    context: "Developed markets",
    value: "+0.2%",
    trend: "Mixed",
    tone: "mixed",
    icon: "fa-earth-americas",
    source: "Placeholder market provider",
    cadence: "Delayed market cadence TBD",
    previous: "-0.1%",
    change: "+0.3 pts",
    points: [28, 31, 29, 30, 34, 32, 36],
  },
  {
    id: "bonds",
    name: "Bonds",
    context: "Broad bond index",
    value: "-0.1%",
    trend: "Stable",
    tone: "stable",
    icon: "fa-scale-balanced",
    source: "Placeholder market provider",
    cadence: "Delayed market cadence TBD",
    previous: "0.0%",
    change: "-0.1 pts",
    points: [36, 35, 36, 34, 35, 34, 35],
  },
  {
    id: "oil",
    name: "Oil",
    context: "Energy pressure",
    value: "+1.4%",
    trend: "Rising",
    tone: "caution",
    icon: "fa-gas-pump",
    source: "Placeholder commodity provider",
    cadence: "Delayed market cadence TBD",
    previous: "+0.8%",
    change: "+0.6 pts",
    points: [18, 20, 22, 26, 31, 35, 39],
  },
];

let marketPulse = sampleMarketPulse.map((indicator) => ({ ...indicator }));

const sampleEconomicHealth = [
  {
    id: "inflation",
    name: "Inflation",
    context: "Consumer prices",
    value: "3.2%",
    trend: "Elevated",
    tone: "caution",
    icon: "fa-receipt",
    source: "Candidate: BLS via FRED",
    cadence: "Monthly release",
    previous: "3.4%",
    change: "-0.2 pts",
    points: [44, 42, 40, 39, 38, 37, 37],
  },
  {
    id: "interest-rates",
    name: "Interest rates",
    context: "Policy rate",
    value: "5.25%",
    trend: "Stable",
    tone: "stable",
    icon: "fa-percent",
    source: "Candidate: Federal Reserve via FRED",
    cadence: "Policy meeting cadence",
    previous: "5.25%",
    change: "No change",
    points: [30, 30, 30, 30, 30, 30, 30],
  },
  {
    id: "unemployment",
    name: "Unemployment",
    context: "Labor market",
    value: "4.0%",
    trend: "Stable",
    tone: "stable",
    icon: "fa-briefcase",
    source: "Candidate: BLS via FRED",
    cadence: "Monthly release",
    previous: "3.9%",
    change: "+0.1 pts",
    points: [30, 29, 29, 30, 30, 31, 31],
  },
  {
    id: "gdp-growth",
    name: "GDP growth",
    context: "Quarterly pace",
    value: "2.1%",
    trend: "Positive",
    tone: "up",
    icon: "fa-seedling",
    source: "Candidate: BEA via FRED",
    cadence: "Quarterly release",
    previous: "1.8%",
    change: "+0.3 pts",
    points: [24, 25, 27, 29, 30, 31, 32],
  },
];

let economicHealth = sampleEconomicHealth.map((indicator) => ({ ...indicator }));

const sampleRiskIndicators = [
  {
    id: "volatility",
    name: "Volatility",
    copy: "Market uncertainty is below recent stress levels.",
    trend: "Contained",
    tone: "up",
    icon: "fa-wave-square",
    source: "Candidate: market volatility provider",
    cadence: "Delayed market cadence TBD",
  },
  {
    id: "dollar-strength",
    name: "Dollar strength",
    copy: "Currency pressure is steady against major peers.",
    trend: "Stable",
    tone: "stable",
    icon: "fa-dollar-sign",
    source: "Candidate: currency index provider",
    cadence: "Delayed market cadence TBD",
  },
  {
    id: "gold",
    name: "Gold",
    copy: "Safe-haven demand is modestly higher.",
    trend: "Rising",
    tone: "caution",
    icon: "fa-coins",
    source: "Candidate: commodity provider",
    cadence: "Delayed market cadence TBD",
  },
];

let riskIndicators = sampleRiskIndicators.map((indicator) => ({ ...indicator }));
let latestLiveCheckedAt = null;

const regions = [
  {
    name: "United States",
    copy: "Growth positive, inflation still watched closely.",
    trend: "Steady",
    tone: "stable",
    source: "Sample regional composite",
    cadence: "Method pending",
  },
  {
    name: "Europe",
    copy: "Growth soft, rate pressure easing gradually.",
    trend: "Mixed",
    tone: "mixed",
    source: "Sample regional composite",
    cadence: "Method pending",
  },
  {
    name: "China",
    copy: "Demand signals remain uneven.",
    trend: "Caution",
    tone: "caution",
    source: "Sample regional composite",
    cadence: "Method pending",
  },
  {
    name: "Emerging markets",
    copy: "Conditions vary by currency and commodity exposure.",
    trend: "Mixed",
    tone: "mixed",
    source: "Sample regional composite",
    cadence: "Method pending",
  },
];

function trendClass(tone) {
  return `trend-label trend-${tone}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatReleaseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatObservationDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
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

function updateLatestLiveChecked(checkedAt) {
  const checkedDate = new Date(checkedAt);

  if (Number.isNaN(checkedDate.getTime())) {
    return;
  }

  if (!latestLiveCheckedAt || checkedDate > latestLiveCheckedAt) {
    latestLiveCheckedAt = checkedDate;
    setText("#live-last-checked", formatCheckedAt(checkedAt));
  }
}

function formatReleaseRange(range) {
  if (!range?.earliest || !range?.latest) {
    return "Unavailable";
  }

  const earliest = formatReleaseDate(range.earliest);
  const latest = formatReleaseDate(range.latest);

  if (earliest === latest) {
    return latest;
  }

  return `${earliest} to ${latest}`;
}

function formatObservationRange(range) {
  if (!range?.earliest || !range?.latest) {
    return "Unavailable";
  }

  const earliest = formatObservationDate(range.earliest);
  const latest = formatObservationDate(range.latest);

  if (earliest === latest) {
    return latest;
  }

  return `${earliest} to ${latest}`;
}

function summarizeSourceGaps(gaps = []) {
  if (!gaps.length) {
    return "None";
  }

  const names = gaps.map((gap) => gap.name || gap.id || "Source gap").filter(Boolean);
  const visibleNames = names.slice(0, 2).join(", ");
  const remainingCount = Math.max(0, names.length - 2);

  return remainingCount > 0 ? `${visibleNames} + ${remainingCount} more` : visibleNames;
}

function routeFailureDetail(error) {
  const rawMessage =
    error && typeof error.message === "string" ? error.message : typeof error === "string" ? error : "";
  const normalizedMessage = rawMessage.replace(/\s+/g, " ").trim();

  if (!normalizedMessage) {
    return null;
  }

  return normalizedMessage.length > 120 ? `${normalizedMessage.slice(0, 117)}...` : normalizedMessage;
}

function routeFallbackCopy(areaName, error) {
  const detail = routeFailureDetail(error);

  if (!detail) {
    return `${areaName} route unavailable in this view`;
  }

  return `${areaName} route unavailable: ${detail}`;
}

function sourceIssueStatus(issue) {
  if (issue?.status === "Unavailable") {
    return "Sample fallback";
  }

  return issue?.status || "Sample fallback";
}

function fallbackWithSourceIssue(fallbackIndicator, issue, defaultReason) {
  return {
    ...fallbackIndicator,
    source: issue?.source || fallbackIndicator.source,
    cadence: issue?.cadence || fallbackIndicator.cadence,
    sourceUnit: issue?.sourceUnit || fallbackIndicator.sourceUnit,
    sourceFrequency: issue?.sourceFrequency || fallbackIndicator.sourceFrequency,
    sourceStatus: sourceIssueStatus(issue),
    sourceIssue: issue?.reason || defaultReason,
  };
}

function metricPeriodLabel(metric, previous = false) {
  if (metric.periodLabel) {
    return previous ? `Previous ${metric.periodLabel.toLowerCase()}` : metric.periodLabel;
  }

  if (metric.cadence?.toLowerCase().includes("daily")) {
    return previous ? "Previous observation" : "Latest observation";
  }

  return previous ? "Previous release" : "Latest release";
}

function formatMetricPeriod(metric, value) {
  if (metric.cadence?.toLowerCase().includes("daily")) {
    return formatObservationDate(value);
  }

  return formatReleaseDate(value);
}

function renderMetricPeriod(metric) {
  if (metric.sourceStatus !== "Source-backed" || !metric.releaseDate) {
    return "";
  }

  return `<p class="metric-period">${escapeHtml(metricPeriodLabel(metric))}: ${escapeHtml(formatMetricPeriod(metric, metric.releaseDate))}</p>`;
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

function sourceStatusIcon(status) {
  if (status === "Source-backed") {
    return "fa-building-columns";
  }

  if (status === "Sample fallback" || status === "Unavailable") {
    return "fa-triangle-exclamation";
  }

  return "fa-flask";
}

function renderDataMeta(item) {
  const status = item.sourceStatus || "Sample";
  const periodKind = item.cadence?.toLowerCase().includes("daily") ? "latest observation" : "latest release";
  const cadence = item.releaseDate
    ? `${item.cadence}; ${periodKind} ${formatMetricPeriod(item, item.releaseDate)}`
    : item.cadence;
  const freshness = item.freshnessStatus
    ? `
      <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(item.freshnessStatus)}: ${escapeHtml(item.freshnessCopy)}</span>
    `
    : "";
  const issue = item.sourceIssue
    ? `
      <span><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> ${escapeHtml(item.sourceIssue)}</span>
    `
    : "";
  const unit = item.sourceUnit
    ? `
      <span><i class="fa-solid fa-ruler" aria-hidden="true"></i> Reported as: ${escapeHtml(item.sourceUnit)}</span>
    `
    : "";
  const frequency = item.sourceFrequency
    ? `
      <span><i class="fa-solid fa-rotate" aria-hidden="true"></i> Updates: ${escapeHtml(item.sourceFrequency)}</span>
    `
    : "";

  return `
    <div class="data-meta" aria-label="Indicator data details">
      <span><i class="fa-solid ${sourceStatusIcon(status)}" aria-hidden="true"></i> ${escapeHtml(status)}</span>
      <span><i class="fa-solid fa-database" aria-hidden="true"></i> ${escapeHtml(item.source)}</span>
      ${unit}
      ${frequency}
      <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHtml(cadence)}</span>
      ${freshness}
      ${issue}
    </div>
  `;
}

function renderSparkline(points, tone) {
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
    <svg class="sparkline trend-${tone}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Sample trend line">
      <path d="${d}"></path>
    </svg>
  `;
}

function renderMetricCard(metric) {
  const previousPeriod = metric.previousReleaseDate
    ? `<small>${escapeHtml(formatMetricPeriod(metric, metric.previousReleaseDate))}</small>`
    : "";

  return `
    <article class="metric-card">
      <div class="metric-top">
        <div>
          <p class="metric-name">${escapeHtml(metric.name)}</p>
          <p class="metric-context">${escapeHtml(metric.context)}</p>
        </div>
        <span class="metric-icon" aria-hidden="true"><i class="fa-solid ${metric.icon}"></i></span>
      </div>
      <div>
        <p class="metric-value">${escapeHtml(metric.value)}</p>
        ${renderMetricPeriod(metric)}
        <span class="${trendClass(metric.tone)}">${escapeHtml(metric.trend)}</span>
      </div>
      <dl class="metric-comparison" aria-label="${metric.sourceStatus === "Source-backed" ? "Source period comparison" : "Sample period comparison"}">
        <div>
          <dt>${metric.sourceStatus === "Source-backed" ? metricPeriodLabel(metric, true) : "Previous sample"}</dt>
          <dd>${escapeHtml(metric.previous)}</dd>
          ${previousPeriod}
        </div>
        <div>
          <dt>Change</dt>
          <dd>${escapeHtml(metric.change)}</dd>
        </div>
      </dl>
      ${renderDataMeta(metric)}
      ${renderSparkline(metric.points, metric.tone)}
    </article>
  `;
}

function renderIndicatorRow(indicator) {
  const comparison =
    indicator.sourceStatus === "Source-backed" && indicator.value && indicator.previous && indicator.change
      ? `
        <dl class="row-comparison" aria-label="Source observation comparison">
          <div>
            <dt>Latest</dt>
            <dd>${escapeHtml(indicator.value)}</dd>
            ${
              indicator.releaseDate
                ? `<small>${escapeHtml(formatObservationDate(indicator.releaseDate))}</small>`
                : ""
            }
          </div>
          <div>
            <dt>Previous</dt>
            <dd>${escapeHtml(indicator.previous)}</dd>
            ${
              indicator.previousReleaseDate
                ? `<small>${escapeHtml(formatObservationDate(indicator.previousReleaseDate))}</small>`
                : ""
            }
          </div>
          <div>
            <dt>Change</dt>
            <dd>${escapeHtml(indicator.change)}</dd>
          </div>
        </dl>
      `
      : "";

  return `
    <article class="indicator-row">
      <i class="fa-solid ${indicator.icon}" aria-hidden="true"></i>
      <div>
        <p class="row-title">${escapeHtml(indicator.name)}</p>
        <p class="row-copy">${escapeHtml(indicator.copy)}</p>
        ${comparison}
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
        <p class="row-title">${escapeHtml(region.name)}</p>
        <p class="row-copy">${escapeHtml(region.copy)}</p>
        ${renderDataMeta(region)}
      </div>
      <span class="${trendClass(region.tone)}">${escapeHtml(region.trend)}</span>
    </article>
  `;
}

function renderDashboard() {
  document.querySelector("#market-grid").innerHTML = marketPulse.map(renderMetricCard).join("");
  document.querySelector("#health-grid").innerHTML = economicHealth.map(renderMetricCard).join("");
  document.querySelector("#risk-list").innerHTML = riskIndicators.map(renderIndicatorRow).join("");
  document.querySelector("#region-list").innerHTML = regions.map(renderRegionRow).join("");
}

function setCoverageSummary() {
  setText("#source-coverage-title", "Source coverage updated");
  setText(
    "#source-coverage-copy",
    "Mercury is tracking live coverage by dashboard area so source-backed cards, sample fallbacks, and unresolved source gaps stay visibly separated.",
  );
}

function applyRouteCheck(selector, checkedAt) {
  const checkedLabel = formatCheckedAt(checkedAt);

  setText(selector, checkedLabel);
  updateLatestLiveChecked(checkedAt);
}

function applyMarketSnapshot(snapshot) {
  if (!snapshot?.indicators?.length) {
    applyMarketFallback();
    return;
  }

  const marketPill = document.querySelector("#market-connection-pill");
  const indicatorsById = new Map(snapshot.indicators.map((indicator) => [indicator.id, indicator]));
  const issuesById = new Map((snapshot.issues || []).map((issue) => [issue.id, issue]));
  const loadedCount = indicatorsById.size;
  const totalCount = sampleMarketPulse.length;
  const sourceHealth = snapshot.sourceHealth || {
    status: "partial",
    label: "Partial market coverage",
    summary: "Market Pulse partially loaded from public FRED series.",
  };
  const sourceCoverage = sourceHealth.coverage || snapshot.sourceAudit?.coverage || {
    loaded: loadedCount,
    total: totalCount,
    unavailable: totalCount - loadedCount,
  };
  const observationRange = sourceHealth.releaseRange || snapshot.releaseRange;
  const marketGaps = sourceHealth.gaps || snapshot.sourceAudit?.gaps || snapshot.issues || [];

  marketPulse = sampleMarketPulse.map((fallbackIndicator) => {
    const sourceIndicator = indicatorsById.get(fallbackIndicator.id);

    if (sourceIndicator) {
      return sourceIndicator;
    }

    const issue = issuesById.get(fallbackIndicator.id);

    return fallbackWithSourceIssue(
      fallbackIndicator,
      issue,
      "No source-backed market series is available yet, so Mercury kept the sample value visible.",
    );
  });
  renderDashboard();
  setCoverageSummary();

  setText(
    "#market-pulse-title",
    loadedCount === totalCount
      ? "Daily market signals are connected"
      : "Daily market signals are partially connected",
  );
  setText("#market-coverage-count", `${sourceCoverage.loaded} of ${sourceCoverage.total} loaded`);
  setText("#market-release-range", formatObservationRange(observationRange));
  setText("#market-gap-summary", summarizeSourceGaps(marketGaps));
  applyRouteCheck("#market-last-checked", snapshot.sourceAudit?.checkedAt || snapshot.checkedAt);
  setText("#refresh-schedule", "Checked on page load");
  setText("#market-source-status", sourceHealth.status === "ready" ? "FRED" : sourceHealth.label);
  setText(
    "#market-source-detail",
    loadedCount === totalCount
      ? "Daily Market Pulse observations are loaded through Mercury's FRED source bridge"
      : `${loadedCount} of ${totalCount} Market Pulse indicators loaded from FRED; unresolved cards keep sample fallback values`,
  );
  setHtml(
    "#market-source-note",
    `<i class="fa-solid fa-chart-line" aria-hidden="true"></i> ${escapeHtml(sourceHealth.label)}`,
  );
  setHtml(
    "#market-connection-pill",
    `<i class="fa-solid ${sourceHealth.status === "ready" ? "fa-plug-circle-check" : "fa-triangle-exclamation"}" aria-hidden="true"></i> ${escapeHtml(sourceHealth.label)}`,
  );

  if (marketPill) {
    marketPill.classList.toggle("status-pill-live", sourceHealth.status === "ready");
    marketPill.classList.toggle("status-pill-warning", sourceHealth.status !== "ready");
  }
}

function applyMarketFallback(error = null) {
  const marketPill = document.querySelector("#market-connection-pill");
  const fallbackCopy = routeFallbackCopy("Market Pulse", error);

  marketPulse = sampleMarketPulse.map((indicator) => ({
    ...indicator,
    sourceStatus: "Sample fallback",
    sourceIssue: `${fallbackCopy}, so Mercury kept the sample value visible.`,
  }));
  renderDashboard();

  setText("#market-coverage-count", "0 of 4 loaded");
  setText("#market-last-checked", "Route unavailable");
  setText("#market-release-range", "Unavailable");
  setText("#market-gap-summary", "Market route unavailable");
  setText(
    "#market-source-detail",
    `${fallbackCopy}; sample market indicators remain visible`,
  );
  setText("#market-source-status", "Sample fallback");
  setCoverageSummary();
  setHtml(
    "#market-connection-pill",
    '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Market fallback visible',
  );

  if (marketPill) {
    marketPill.classList.remove("status-pill-live");
    marketPill.classList.add("status-pill-warning");
  }
}

function applyFredSnapshot(snapshot) {
  if (!snapshot?.indicators?.length) {
    applyFredFallback();
    return;
  }

  const macroPill = document.querySelector("#macro-connection-pill");
  const indicatorsById = new Map(snapshot.indicators.map((indicator) => [indicator.id, indicator]));
  const issuesById = new Map((snapshot.issues || []).map((issue) => [issue.id, issue]));
  const loadedCount = indicatorsById.size;
  const totalCount = sampleEconomicHealth.length;
  const sourceHealth = snapshot.sourceHealth || {
    status: "ready",
    label: "FRED releases current",
    summary: "Economic Health loaded from public FRED releases.",
  };
  const sourceCoverage = sourceHealth.coverage || snapshot.sourceAudit?.coverage || {
    loaded: loadedCount,
    total: totalCount,
    unavailable: totalCount - loadedCount,
  };
  const releaseRange = sourceHealth.releaseRange || snapshot.releaseRange;

  economicHealth = sampleEconomicHealth.map((fallbackIndicator) => {
    const sourceIndicator = indicatorsById.get(fallbackIndicator.id);

    if (sourceIndicator) {
      return sourceIndicator;
    }

    const issue = issuesById.get(fallbackIndicator.id);

    return fallbackWithSourceIssue(
      fallbackIndicator,
      issue,
      issue
        ? `${issue.name} could not load from FRED, so Mercury kept the sample value visible.`
        : "FRED release unavailable, so Mercury kept the sample value visible.",
    );
  });
  renderDashboard();
  setCoverageSummary();

  setText(
    "#economic-health-title",
    loadedCount === totalCount
      ? "Official releases show uneven pressure"
      : "Official releases are partially connected",
  );
  applyRouteCheck("#macro-last-checked", snapshot.sourceAudit?.checkedAt || snapshot.checkedAt);
  setText("#refresh-schedule", "Checked on page load");
  setText("#macro-coverage-count", `${sourceCoverage.loaded} of ${sourceCoverage.total} loaded`);
  setText("#macro-release-range", formatReleaseRange(releaseRange));
  setText("#macro-source-status", sourceHealth.status === "ready" ? "FRED" : sourceHealth.label);
  setText(
    "#macro-source-detail",
    loadedCount === totalCount
      ? "Latest public FRED releases are loaded through Mercury's serverless source bridge"
      : `${loadedCount} of ${totalCount} Economic Health indicators loaded from FRED; unavailable indicators keep sample fallback values`,
  );
  setHtml(
    "#macro-source-note",
    `<i class="fa-solid fa-building-columns" aria-hidden="true"></i> ${escapeHtml(sourceHealth.label)}`,
  );
  setHtml(
    "#macro-connection-pill",
    `<i class="fa-solid ${sourceHealth.status === "ready" ? "fa-plug-circle-check" : "fa-triangle-exclamation"}" aria-hidden="true"></i> ${escapeHtml(sourceHealth.label)}`,
  );

  if (macroPill) {
    macroPill.classList.toggle("status-pill-live", sourceHealth.status === "ready");
    macroPill.classList.toggle("status-pill-warning", sourceHealth.status !== "ready");
  }
}

function applyFredFallback(error = null) {
  const macroPill = document.querySelector("#macro-connection-pill");
  const fallbackCopy = routeFallbackCopy("FRED", error);

  economicHealth = sampleEconomicHealth.map((indicator) => ({
    ...indicator,
    sourceStatus: "Sample fallback",
    sourceIssue: `${fallbackCopy}, so Mercury kept the sample value visible.`,
  }));
  renderDashboard();

  setText("#macro-source-status", "Sample fallback");
  setText("#macro-last-checked", "Route unavailable");
  setText("#macro-coverage-count", "0 of 4 loaded");
  setText("#macro-release-range", "Unavailable");
  setText(
    "#macro-source-detail",
    `${fallbackCopy}; sample macro indicators remain visible`,
  );
  setCoverageSummary();
  setHtml(
    "#macro-connection-pill",
    '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Macro fallback visible',
  );

  if (macroPill) {
    macroPill.classList.remove("status-pill-live");
    macroPill.classList.add("status-pill-warning");
  }
}

function applyRiskSnapshot(snapshot) {
  if (!snapshot?.indicators?.length) {
    applyRiskFallback();
    return;
  }

  const riskPill = document.querySelector("#risk-connection-pill");
  const indicatorsById = new Map(snapshot.indicators.map((indicator) => [indicator.id, indicator]));
  const issuesById = new Map((snapshot.issues || []).map((issue) => [issue.id, issue]));
  const loadedCount = indicatorsById.size;
  const totalCount = sampleRiskIndicators.length;
  const sourceHealth = snapshot.sourceHealth || {
    status: "partial",
    label: "Partial risk coverage",
    summary: "Risk and Confidence partially loaded from public FRED series.",
  };
  const sourceCoverage = sourceHealth.coverage || snapshot.sourceAudit?.coverage || {
    loaded: loadedCount,
    total: totalCount,
    unavailable: totalCount - loadedCount,
  };
  const observationRange = sourceHealth.releaseRange || snapshot.releaseRange;

  riskIndicators = sampleRiskIndicators.map((fallbackIndicator) => {
    const sourceIndicator = indicatorsById.get(fallbackIndicator.id);

    if (sourceIndicator) {
      return sourceIndicator;
    }

    const issue = issuesById.get(fallbackIndicator.id);

    return fallbackWithSourceIssue(
      fallbackIndicator,
      issue,
      "Risk source unavailable, so Mercury kept the sample value visible.",
    );
  });
  renderDashboard();
  setCoverageSummary();

  setText(
    "#risk-title",
    loadedCount === totalCount
      ? "Risk signals are connected"
      : "Risk signals are partially connected",
  );
  setText("#risk-coverage-count", `${sourceCoverage.loaded} of ${sourceCoverage.total} loaded`);
  setText("#risk-release-range", formatObservationRange(observationRange));
  applyRouteCheck("#risk-last-checked", snapshot.sourceAudit?.checkedAt || snapshot.checkedAt);
  setText("#refresh-schedule", "Checked on page load");
  setText("#risk-source-status", sourceHealth.status === "ready" ? "FRED" : sourceHealth.label);
  setText(
    "#risk-source-detail",
    loadedCount === totalCount
      ? "Risk and Confidence observations are loaded through Mercury's FRED source bridge"
      : `${loadedCount} of ${totalCount} Risk and Confidence indicators loaded from FRED; unavailable indicators keep sample fallback values`,
  );
  setHtml(
    "#risk-source-note",
    `<i class="fa-solid fa-shield-halved" aria-hidden="true"></i> ${escapeHtml(sourceHealth.label)}`,
  );
  setHtml(
    "#risk-connection-pill",
    `<i class="fa-solid ${sourceHealth.status === "ready" ? "fa-plug-circle-check" : "fa-triangle-exclamation"}" aria-hidden="true"></i> ${escapeHtml(sourceHealth.label)}`,
  );

  if (riskPill) {
    riskPill.classList.toggle("status-pill-live", sourceHealth.status === "ready");
    riskPill.classList.toggle("status-pill-warning", sourceHealth.status !== "ready");
  }
}

function applyRiskFallback(error = null) {
  const riskPill = document.querySelector("#risk-connection-pill");
  const fallbackCopy = routeFallbackCopy("Risk", error);

  riskIndicators = sampleRiskIndicators.map((indicator) => ({
    ...indicator,
    sourceStatus: "Sample fallback",
    sourceIssue: `${fallbackCopy}, so Mercury kept the sample value visible.`,
  }));
  renderDashboard();

  setText("#risk-source-status", "Sample fallback");
  setText("#risk-last-checked", "Route unavailable");
  setText("#risk-coverage-count", "0 of 3 loaded");
  setText("#risk-release-range", "Unavailable");
  setText(
    "#risk-source-detail",
    `${fallbackCopy}; sample risk indicators remain visible`,
  );
  setCoverageSummary();
  setHtml(
    "#risk-connection-pill",
    '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Risk fallback visible',
  );

  if (riskPill) {
    riskPill.classList.remove("status-pill-live");
    riskPill.classList.add("status-pill-warning");
  }
}

async function loadFredSnapshot() {
  if (window.location.protocol === "file:") {
    return;
  }

  try {
    const response = await fetch("/api/fred-snapshot", {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`FRED snapshot route returned ${response.status}`);
    }

    const snapshot = await response.json();
    applyFredSnapshot(snapshot);
  } catch (error) {
    applyFredFallback(error);
  }
}

async function loadMarketSnapshot() {
  if (window.location.protocol === "file:") {
    return;
  }

  try {
    const response = await fetch("/api/market-snapshot", {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Market snapshot route returned ${response.status}`);
    }

    const snapshot = await response.json();
    applyMarketSnapshot(snapshot);
  } catch (error) {
    applyMarketFallback(error);
  }
}

async function loadRiskSnapshot() {
  if (window.location.protocol === "file:") {
    return;
  }

  try {
    const response = await fetch("/api/risk-snapshot", {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Risk snapshot route returned ${response.status}`);
    }

    const snapshot = await response.json();
    applyRiskSnapshot(snapshot);
  } catch (error) {
    applyRiskFallback(error);
  }
}

renderDashboard();
loadMarketSnapshot();
loadFredSnapshot();
loadRiskSnapshot();
