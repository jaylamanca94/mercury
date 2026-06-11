const marketPulse = [
  {
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

const economicHealth = [
  {
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

const riskIndicators = [
  {
    name: "Volatility",
    copy: "Market uncertainty is below recent stress levels.",
    trend: "Contained",
    tone: "up",
    icon: "fa-wave-square",
    source: "Candidate: market volatility provider",
    cadence: "Delayed market cadence TBD",
  },
  {
    name: "Dollar strength",
    copy: "Currency pressure is steady against major peers.",
    trend: "Stable",
    tone: "stable",
    icon: "fa-dollar-sign",
    source: "Candidate: currency index provider",
    cadence: "Delayed market cadence TBD",
  },
  {
    name: "Gold",
    copy: "Safe-haven demand is modestly higher.",
    trend: "Rising",
    tone: "caution",
    icon: "fa-coins",
    source: "Candidate: commodity provider",
    cadence: "Delayed market cadence TBD",
  },
];

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

function renderDataMeta(source, cadence) {
  return `
    <div class="data-meta" aria-label="Prototype data details">
      <span><i class="fa-solid fa-flask" aria-hidden="true"></i> Sample</span>
      <span><i class="fa-solid fa-database" aria-hidden="true"></i> ${source}</span>
      <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${cadence}</span>
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
  return `
    <article class="metric-card">
      <div class="metric-top">
        <div>
          <p class="metric-name">${metric.name}</p>
          <p class="metric-context">${metric.context}</p>
        </div>
        <span class="metric-icon" aria-hidden="true"><i class="fa-solid ${metric.icon}"></i></span>
      </div>
      <div>
        <p class="metric-value">${metric.value}</p>
        <span class="${trendClass(metric.tone)}">${metric.trend}</span>
      </div>
      <dl class="metric-comparison" aria-label="Sample period comparison">
        <div>
          <dt>Previous sample</dt>
          <dd>${metric.previous}</dd>
        </div>
        <div>
          <dt>Change</dt>
          <dd>${metric.change}</dd>
        </div>
      </dl>
      ${renderDataMeta(metric.source, metric.cadence)}
      ${renderSparkline(metric.points, metric.tone)}
    </article>
  `;
}

function renderIndicatorRow(indicator) {
  return `
    <article class="indicator-row">
      <i class="fa-solid ${indicator.icon}" aria-hidden="true"></i>
      <div>
        <p class="row-title">${indicator.name}</p>
        <p class="row-copy">${indicator.copy}</p>
        ${renderDataMeta(indicator.source, indicator.cadence)}
      </div>
      <span class="${trendClass(indicator.tone)}">${indicator.trend}</span>
    </article>
  `;
}

function renderRegionRow(region) {
  return `
    <article class="region-row">
      <span class="region-marker" aria-hidden="true"><i class="fa-solid fa-location-dot"></i></span>
      <div>
        <p class="row-title">${region.name}</p>
        <p class="row-copy">${region.copy}</p>
        ${renderDataMeta(region.source, region.cadence)}
      </div>
      <span class="${trendClass(region.tone)}">${region.trend}</span>
    </article>
  `;
}

document.querySelector("#market-grid").innerHTML = marketPulse.map(renderMetricCard).join("");
document.querySelector("#health-grid").innerHTML = economicHealth.map(renderMetricCard).join("");
document.querySelector("#risk-list").innerHTML = riskIndicators.map(renderIndicatorRow).join("");
document.querySelector("#region-list").innerHTML = regions.map(renderRegionRow).join("");
