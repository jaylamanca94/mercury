function pendingMetric(name, context, icon) {
  return {
    name,
    context,
    value: "Loading",
    trend: "Pending",
    tone: "stable",
    icon,
    source: "Mercury live data",
    cadence: "Loading source cadence",
    previous: "Loading",
    change: "Loading",
    points: [],
    sourceStatus: "Loading",
    freshness: {
      status: "loading",
      label: "Checking freshness",
      detail: "Waiting for the live source release date.",
    },
  };
}

function pendingIndicator(name, icon) {
  return {
    name,
    copy: "Loading the latest public data release.",
    trend: "Pending",
    tone: "stable",
    icon,
    source: "Mercury live data",
    cadence: "Loading source cadence",
    sourceStatus: "Loading",
    freshness: {
      status: "loading",
      label: "Checking freshness",
      detail: "Waiting for the live source release date.",
    },
  };
}

function pendingRegion(name) {
  return {
    name,
    copy: "Loading the latest public growth release.",
    trend: "Pending",
    tone: "stable",
    source: "World Bank public data",
    cadence: "Loading source cadence",
    sourceStatus: "Loading",
    freshness: {
      status: "loading",
      label: "Checking freshness",
      detail: "Waiting for the live source release date.",
    },
  };
}

let marketPulse = [
  pendingMetric("U.S. equities", "S&P 500 daily close", "fa-chart-line"),
  pendingMetric("Bonds", "7-10 year Treasury ETF", "fa-scale-balanced"),
  pendingMetric("U.S. dollar", "Dollar index ETF proxy", "fa-dollar-sign"),
  pendingMetric("Oil", "WTI crude futures", "fa-gas-pump"),
];

let economicHealth = [
  pendingMetric("Inflation", "Consumer prices", "fa-receipt"),
  pendingMetric("Interest rates", "Federal funds rate", "fa-percent"),
  pendingMetric("Unemployment", "Labor market", "fa-briefcase"),
  pendingMetric("GDP growth", "Quarterly pace", "fa-seedling"),
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

function trendClass(tone) {
  return `trend-label trend-${tone}`;
}

function metricCardTone(metric) {
  if (metric.change?.trim().startsWith("-")) {
    return "down";
  }

  if (metric.change?.trim().startsWith("+")) {
    return "up";
  }

  return metric.tone || "stable";
}

function metricDeltaLabel(metric) {
  if (metric.change && metric.change !== "Loading" && metric.change !== "Unavailable") {
    return metric.change;
  }

  return metric.trend || "Pending";
}

function metricValueClass(value) {
  return String(value).length > 8 ? "metric-value metric-value-long" : "metric-value";
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

  if (/^\d{4}$/.test(value)) {
    return value;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value) && !value.endsWith("-01")) {
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

function setScoreVisual(score) {
  const element = document.querySelector(".summary-score");

  if (element && Number.isFinite(score)) {
    element.style.setProperty("--score", `${score}%`);
    element.setAttribute("aria-label", `Breadth score ${score} out of 100`);
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
      return `${sourceName}; ${staleCount} stale`;
    }

    if (delayedCount > 0) {
      return `${sourceName}; ${delayedCount} delayed`;
    }

    return sourceName;
  }

  if (liveCount > 0) {
    const freshnessLabel =
      staleCount > 0 ? `; ${staleCount} stale` : delayedCount > 0 ? `; ${delayedCount} delayed` : "";
    return `${liveCount} of ${items.length} live${freshnessLabel}`;
  }

  return "Unavailable";
}

function formatReleaseWindow(releaseRange) {
  const latest = formatReleaseDate(releaseRange?.latest);
  const earliest = formatReleaseDate(releaseRange?.earliest);

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
    return "Live source";
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

function renderDataMeta(item) {
  const status = item.sourceStatus || "Unavailable";
  const cadence = item.releaseDate
    ? `${item.cadence}; latest release ${formatReleaseDate(item.releaseDate)}`
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

function renderSparkline(points, tone) {
  if (!points?.length) {
    return '<div class="sparkline sparkline-empty" aria-label="Trend line loading">Line graph</div>';
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
    <svg class="sparkline trend-${tone}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Recent trend line">
      <path d="${d}"></path>
    </svg>
  `;
}

function renderMetricCard(metric) {
  const cardTone = metricCardTone(metric);

  return `
    <article class="metric-card metric-card-${cardTone}">
      <div class="metric-top">
        <div>
          <p class="metric-name">${escapeHtml(metric.name)}</p>
          <p class="metric-context">${escapeHtml(metric.context)}</p>
        </div>
        <span class="metric-icon" aria-hidden="true"><i class="fa-solid ${metric.icon}"></i></span>
      </div>
      <div class="metric-value-row">
        <p class="${metricValueClass(metric.value)}">${escapeHtml(metric.value)}</p>
        <span class="${trendClass(cardTone)} metric-delta">${escapeHtml(metricDeltaLabel(metric))}</span>
      </div>
      <div class="metric-chart-panel">
        ${renderSparkline(metric.points, cardTone)}
      </div>
      <dl class="metric-comparison" aria-label="Latest period comparison">
        <div>
          <dt>Previous release</dt>
          <dd>${escapeHtml(metric.previous)}</dd>
        </div>
        <div>
          <dt>Change</dt>
          <dd>${escapeHtml(metric.change)}</dd>
        </div>
      </dl>
      ${renderDataMeta(metric)}
    </article>
  `;
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
  return `
    <article class="signal-tile">
      <div>
        <p class="signal-name">${escapeHtml(item.name)}</p>
        <p class="signal-context">${escapeHtml(item.context)}</p>
      </div>
      <p class="signal-value">${escapeHtml(item.value)}</p>
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
        <p class="row-title">${escapeHtml(indicator.name)}</p>
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
        <p class="row-title">${escapeHtml(region.name)}</p>
        <p class="row-copy">${escapeHtml(region.copy)}</p>
        ${renderDataMeta(region)}
      </div>
      <span class="${trendClass(region.tone)}">${escapeHtml(region.trend)}</span>
    </article>
  `;
}

function renderDashboard() {
  document.querySelector("#signal-grid").innerHTML = signalItems().map(renderSignalTile).join("");
  document.querySelector("#market-grid").innerHTML = marketPulse.map(renderMetricCard).join("");
  document.querySelector("#health-grid").innerHTML = economicHealth.map(renderMetricCard).join("");
  document.querySelector("#risk-list").innerHTML = riskIndicators.map(renderIndicatorRow).join("");
  document.querySelector("#region-list").innerHTML = regions.map(renderRegionRow).join("");
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
    setText(".score-label", "Source status");
    setText("#signal-strip-title", "Current signals unavailable");
    setText("#source-coverage-title", "Live data unavailable");
    setText(
      "#source-coverage-copy",
      "Mercury reached the live snapshot route, but no upstream public sources returned usable values.",
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
      '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Some public sources connected',
    );
    sourcePill?.classList.add("status-pill-caution");
    return;
  }

  setHtml(
    "#macro-connection-pill",
    '<i class="fa-solid fa-plug-circle-check" aria-hidden="true"></i> Public sources connected',
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
  setText(".summary-copy p:last-child", snapshot.summary.copy);
  setText(".score-value", snapshot.summary.score);
  setText(".score-label", "Breadth score");
  setScoreVisual(snapshot.summary.score);
  setHtml(".score-drivers dl", renderSummaryDrivers(snapshot.summary.drivers));
  setText(".score-drivers p", "Score inputs");
  setText(".score-drivers small", "Based on visible live indicators.");
  setText("#market-pulse-title", "Markets from daily public charts");
  setText("#economic-health-title", "Economic indicators from official releases");
  setText("#signal-strip-title", "Current signals at a glance");
  setText("#risk-title", "Risk and confidence from public releases");
  setText("#global-title", "Regional growth from World Bank data");
  setText("#source-coverage-title", "Source coverage");
  setText(
    "#source-coverage-copy",
    snapshot.freshness?.copy ||
      "Each section lists its source, latest release date, and refresh state.",
  );
  setText("#latest-release-window", formatReleaseWindow(snapshot.releaseRange));
  setText("#live-last-checked", formatCheckedAt(snapshot.checkedAt));
  setText("#source-rail-checked", formatCheckedAt(snapshot.checkedAt));
  setText("#refresh-schedule", "Checked on page load");
  setText("#source-rail-refresh", "Checked on page load");
  setText("#market-source-status", sourceStatusLabel(snapshot.marketPulse, "Yahoo"));
  setText("#market-source-detail", "Daily market series are loaded through Yahoo Finance charts");
  setText("#macro-source-status", sourceStatusLabel(snapshot.economicHealth, "FRED"));
  setText("#macro-source-detail", "Official economic releases are loaded through FRED");
  setText("#risk-source-status", sourceStatusLabel(snapshot.riskIndicators, "Yahoo/FRED"));
  setText("#risk-source-detail", "Risk indicators are loaded through Yahoo Finance and FRED");
  setText("#regional-source-status", sourceStatusLabel(snapshot.regions, "World Bank"));
  setText("#regional-source-detail", "Annual regional growth releases are loaded from the World Bank");
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
      detail: "Live data is required for source freshness.",
    },
    previous: item.previous === "Loading" ? "Unavailable" : item.previous,
    change: item.change === "Loading" ? "Unavailable" : item.change,
    copy: item.copy?.replace("Loading", "Unable to load") || item.copy,
    cadence: "Requires Mercury's live data",
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
    ".summary-copy p:last-child",
    "This view cannot reach Mercury's live data. Values are marked unavailable instead of using sample figures.",
  );
  setText(".score-value", "0");
  setText(".score-label", "Source status");
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
  setText(".score-drivers p", "Score inputs");
  setText(".score-drivers small", "Live data is required for current values.");
  setText("#signal-strip-title", "Current signals unavailable");
  setText("#source-coverage-title", "Live data unavailable");
  setText(
    "#source-coverage-copy",
    "Live data is unavailable in this view. Current values will appear when the source responds.",
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
  setText("#sample-set-date", "Source status");
  setHtml(
    "#macro-connection-pill",
    '<i class="fa-solid fa-plug-circle-xmark" aria-hidden="true"></i> Live data unavailable',
  );

  if (sourcePill) {
    sourcePill.classList.add("status-pill-caution");
  }
}

async function loadLiveSnapshot() {
  if (window.location.protocol === "file:") {
    applyLiveFallback();
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
  }
}

renderDashboard();
loadLiveSnapshot();
