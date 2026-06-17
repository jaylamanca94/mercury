const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function createElement() {
  return {
    classList: {
      add() {},
      remove() {},
      toggle() {},
    },
    setAttribute() {},
    addEventListener() {},
    style: {
      setProperty() {},
    },
    value: "",
    textContent: "",
    innerHTML: "",
    hidden: false,
    disabled: false,
  };
}

function loadAppContext() {
  const elements = new Map();
  const document = {
    body: createElement(),
    querySelector(selector) {
      if (!elements.has(selector)) {
        elements.set(selector, createElement());
      }

      return elements.get(selector);
    },
    querySelectorAll() {
      return [];
    },
  };
  const context = {
    clearTimeout,
    console,
    document,
    fetch: async () => {
      throw new Error("No live route in app rendering test");
    },
    Intl,
    setTimeout,
    window: {
      location: {
        protocol: "file:",
      },
    },
  };

  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8"),
    context,
  );

  return context;
}

test("focused regional fallback does not reuse U.S. starter cards", () => {
  const context = loadAppContext();
  const cards = vm.runInContext(
    `
      selectedRegion = "Europe";
      regionalMarketCards().map((card) => ({
        context: card.context,
        name: card.name,
        region: card.region,
        sourceStatus: card.sourceStatus,
      }));
    `,
    context,
  );
  const normalizedCards = JSON.parse(JSON.stringify(cards));

  assert.deepEqual(
    normalizedCards.map((card) => card.name),
    ["Europe", "Small Cap", "Technology", "Bonds"],
  );
  assert.equal(normalizedCards.some((card) => card.name === "S&P 500"), false);
  assert.equal(normalizedCards.every((card) => card.region === "Europe"), true);
  assert.equal(normalizedCards.every((card) => card.sourceStatus === "Unavailable"), true);
});

test("global fallback cards explain missing market proxies", () => {
  const context = loadAppContext();
  const cards = vm.runInContext(
    `
      marketPulse = [];
      globalMarketCards().map((card) => ({
        context: card.context,
        name: card.name,
        sourceStatus: card.sourceStatus,
      }));
    `,
    context,
  );
  const normalizedCards = JSON.parse(JSON.stringify(cards));

  assert.deepEqual(
    normalizedCards.map((card) => card.context),
    [
      "Market proxy needs live data",
      "Market proxy needs live data",
      "Market proxy needs live data",
    ],
  );
  assert.equal(normalizedCards.every((card) => card.sourceStatus === "Unavailable"), true);
});

test("global supporting cards include Bitcoin after fiat and commodity indicators", () => {
  const context = loadAppContext();
  const cards = vm.runInContext(
    `
      marketPulse = [
        { id: "bitcoin", name: "Bitcoin", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
        { id: "oil", name: "Oil", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
        { id: "yen", name: "Yen", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
        { id: "dollar-index", name: "U.S. dollar", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
        { id: "euro", name: "Euro", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
      ];
      orderedGlobalCurrencyCards().map((card) => ({
        hideChart: card.hideChart,
        id: card.id,
        name: card.name,
      }));
    `,
    context,
  );
  const normalizedCards = JSON.parse(JSON.stringify(cards));

  assert.deepEqual(
    normalizedCards.map((card) => card.id),
    ["dollar-index", "euro", "yen", "oil", "bitcoin"],
  );
  assert.equal(normalizedCards.every((card) => card.hideChart === true), true);
  assert.match(styles, /\.dashboard-global \.economy-grid > \.metric-card:nth-child\(n \+ 7\)\s*{\s*grid-column: span 6;/);
});

test("global regional cards keep proxy tickers off the visible card face", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      marketPulse = [
        {
          id: "us-equities",
          name: "S&P 500",
          context: "Vanguard S&P 500 ETF",
          value: "$498.10",
          change: "+1.2%",
          previous: "$492.18",
          ticker: "VOO",
          viewGroup: "economy",
          region: "United States",
          marketRole: "large-cap",
          sourceStatus: "Source-backed",
          cadence: "Daily market close",
          freshness: { status: "current", label: "Current" },
          points: [492.18, 498.10],
          history: [{ value: 492.18 }, { value: 498.10 }],
          comparison: "percent-change",
        },
      ];
      globalMarketCards().map(renderMetricCard).join("");
    `,
    context,
  );

  assert.match(html, /title="United States - VOO"/);
  assert.doesNotMatch(html, /class="metric-ticker"/);
  assert.doesNotMatch(html, />VOO</);
  assert.doesNotMatch(html, /Vanguard S&amp;P 500 ETF<\/p>/);
});

test("hero insight explains sentiment and top movers", () => {
  const context = loadAppContext();
  const result = vm.runInContext(
    `
      const cards = [
        { name: "Asia", periodChange: "+8.5%", periodChangeValue: 8.5, comparison: "percent-change" },
        { name: "Europe", periodChange: "+3.6%", periodChangeValue: 3.6, comparison: "percent-change" },
        { id: "oil", name: "Oil", periodChange: "-15.9%", periodChangeValue: -15.9, comparison: "percent-change" },
      ];
      const change = { value: 0.5, label: "+0.5%", tone: "up" };
      ({
        badge: '<span>' + sentimentForChange(change).label + '</span><strong>' + change.label + '</strong>',
        insight: buildHeroInsight(change, heroMoverCards(cards), "week", "Global"),
        movers: renderHeroMovers(heroMoverCards(cards)),
        title: viewTitle("Global"),
      });
    `,
    context,
  );

  assert.equal(result.title, "Global Economy");
  assert.equal(result.badge, "<span>Healthy</span><strong>+0.5%</strong>");
  assert.equal(
    result.insight,
    "Broadly positive this week, led by Asia (+8.5%). Oil (-15.9%) moved sharply, which is a mixed signal for growth and input costs.",
  );
  assert.doesNotMatch(result.movers, /Top movers/);
  assert.match(result.movers, /hero-mover-mixed/);
  assert.match(styles, /\.hero-insight\s*{[^}]*max-width: 44rem;/s);
  assert.match(styles, /\.hero-condition\s*{[^}]*flex-direction: column;/s);
});

test("hero trend chart uses period-filtered visible cards", () => {
  const context = loadAppContext();
  const result = vm.runInContext(
    `
      const cards = [
        {
          name: "United States",
          comparison: "percent-change",
          periodPoints: [100, 102, 104],
          weight: 2,
        },
        {
          name: "Europe",
          comparison: "percent-change",
          periodPoints: [50, 51, 53],
          weight: 1,
        },
        {
          name: "GDP",
          comparison: "point-change",
          periodPoints: [2, 3, 4],
          weight: 1,
        },
      ];
      ({
        points: buildHeroTrendPoints(cards),
        html: renderHeroSparkline(cards, { tone: "up" }),
      });
    `,
    context,
  );

  assert.equal(result.points.length, 8);
  assert.equal(Number(result.points[0].toFixed(3)), 0);
  assert.equal(Number(result.points.at(-1).toFixed(3)), 4.667);
  assert.match(result.html, /class="sparkline trend-up"/);
  assert.match(styles, /\.page-title-group\s*{[^}]*gap: var\(--acadia-space-2\);/s);
  assert.match(styles, /\.hero-chart-panel\s*{[^}]*height: 4\.75rem;/s);
});

test("five-year period and long sparkline smoothing are available", () => {
  const context = loadAppContext();
  const result = vm.runInContext(
    `
      ({
        fiveYear: PERIOD_OPTIONS.fiveYear,
        monthPoints: smoothSparklineValues(Array.from({ length: 21 }, (_, index) => index)),
        yearPoints: smoothSparklineValues(Array.from({ length: 252 }, (_, index) => index % 2 === 0 ? 100 : 110)),
      });
    `,
    context,
  );

  assert.equal(result.fiveYear.label, "5 years");
  assert.equal(result.fiveYear.dailyObservations, 1260);
  assert.equal(result.monthPoints.length, 21);
  assert.equal(result.yearPoints.length, 96);
  assert.notEqual(result.yearPoints[1], 110);
  assert.match(indexHtml, /<option value="fiveYear">5 years<\/option>/);
  assert.match(styles, /\.hero-panel-row\s*{[^}]*grid-template-columns: minmax\(0, 1\.05fr\) minmax\(22rem, 0\.95fr\);/s);
});

test("slower-cadence metric cards keep release context without previous footers", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      renderMetricCard({
        name: "Inflation",
        context: "Consumer prices",
        value: "3.1%",
        change: "+0.20 pts",
        previous: "2.9%",
        tone: "caution",
        icon: "fa-receipt",
        source: "FRED: Consumer Price Index for All Urban Consumers",
        cadence: "Monthly release",
        releaseDate: "2026-05-01",
        previousReleaseDate: "2026-04-01",
        sourceStatus: "Source-backed",
        freshness: { status: "current", label: "Current" },
        points: [2.7, 2.9, 3.1],
        comparison: "point-change",
      });
    `,
    context,
  );

  assert.match(html, /May 2026/);
  assert.doesNotMatch(html, /Previous 2\.9%/);
  assert.doesNotMatch(html, /FRED/);
});

test("current daily metric cards hide routine dates, previous values, tickers, and repeated source names", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      renderMetricCard({
        name: "United States",
        context: "Vanguard S&P 500 ETF",
        value: "$498.10",
        change: "+1.2%",
        previous: "$492.18",
        previousReleaseDate: "2026-06-12",
        tone: "up",
        icon: "fa-chart-line",
        ticker: "VOO",
        source: "Yahoo Finance: Vanguard S&P 500 ETF chart",
        cadence: "Daily market close",
        releaseDate: "2026-06-15",
        sourceStatus: "Source-backed",
        freshness: { status: "current", label: "Current" },
        points: [492.18, 498.10],
        comparison: "percent-change",
      });
    `,
    context,
  );

  assert.match(html, /title="United States - VOO - Vanguard S&amp;P 500 ETF"/);
  assert.doesNotMatch(html, /class="metric-ticker"/);
  assert.doesNotMatch(html, />VOO</);
  assert.doesNotMatch(html, /Previous \$492\.18/);
  assert.doesNotMatch(html, /Jun 15, 2026/);
  assert.doesNotMatch(html, /Yahoo Finance/);
});

test("stale daily metric cards keep date context without previous footers", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      renderMetricCard({
        name: "United States",
        context: "Vanguard S&P 500 ETF",
        value: "$498.10",
        change: "+1.2%",
        previous: "$492.18",
        previousReleaseDate: "2026-05-10",
        tone: "up",
        icon: "fa-chart-line",
        ticker: "VOO",
        source: "Yahoo Finance: Vanguard S&P 500 ETF chart",
        cadence: "Daily market close",
        releaseDate: "2026-05-12",
        sourceStatus: "Source-backed",
        freshness: { status: "stale", label: "Stale" },
        points: [492.18, 498.10],
        comparison: "percent-change",
      });
    `,
    context,
  );

  assert.match(html, /May 12, 2026/);
  assert.doesNotMatch(html, /Previous \$492\.18/);
  assert.doesNotMatch(html, /Yahoo Finance/);
});

test("metric cards show compact indicator context", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      renderMetricCard({
        name: "United States",
        context: "Vanguard S&P 500 ETF",
        value: "$498.10",
        change: "+1.2%",
        previous: "$492.18",
        tone: "up",
        icon: "fa-chart-line",
        ticker: "VOO",
        source: "Yahoo Finance: Vanguard S&P 500 ETF chart",
        cadence: "Daily market close",
        releaseDate: "2026-06-12",
        sourceStatus: "Source-backed",
        freshness: { status: "current", label: "Current" },
        points: [492.18, 498.10],
        comparison: "percent-change",
      });
    `,
    context,
  );

  assert.match(html, /Vanguard S&amp;P 500 ETF/);
});

test("empty sparklines use calm no-trend copy", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      renderMetricCard({
        name: "United States",
        context: "Market proxy needs live data",
        value: "Unavailable",
        change: "Unavailable",
        tone: "unavailable",
        icon: "fa-chart-line",
        source: "Public data",
        cadence: "Needs live data",
        sourceStatus: "Unavailable",
        freshness: { status: "unavailable", label: "Freshness unavailable" },
        points: [],
        comparison: "percent-change",
      });
    `,
    context,
  );

  assert.match(html, /No trend/);
  assert.doesNotMatch(html, /Line graph/);
});

test("sparklines render as smooth full-width card charts", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      renderMetricCard({
        name: "Europe",
        context: "VGK",
        value: "$90.56",
        change: "+4.5%",
        tone: "up",
        icon: "fa-globe",
        source: "Yahoo Finance: Vanguard FTSE Europe ETF chart",
        cadence: "Daily market close",
        sourceStatus: "Source-backed",
        freshness: { status: "current", label: "Current" },
        points: [87, 88.5, 89, 90.2, 90.1, 90.56],
        comparison: "percent-change",
      });
    `,
    context,
  );

  assert.match(html, /metric-card[^"]*metric-card-has-chart/);
  assert.match(html, /preserveAspectRatio="none"/);
  assert.match(html, /class="sparkline-baseline" x1="0" y1="38\.0" x2="180" y2="38\.0"/);
  assert.match(html, /class="sparkline-area" d="M [^"]* Z"/);
  assert.match(html, /class="sparkline-line" d="M [^"]* C /);
  assert.doesNotMatch(html.match(/class="sparkline-line" d="([^"]+)"/)[1], / L /);
  assert.match(
    vm.runInContext(
      "sparklineAreaPath('M 0.0 38.0 C 60.0 38.0 120.0 4.0 180.0 4.0', [{ x: 0, y: 38 }, { x: 180, y: 4 }], 42)",
      context,
    ),
    /^M 0\.0 38\.0 C 60\.0 38\.0 120\.0 4\.0 180\.0 4\.0 L 180\.0 42\.0 L 0\.0 42\.0 Z$/,
  );
  assert.match(
    vm.runInContext("smoothSparklinePath([{ x: 0, y: 38 }, { x: 180, y: 4 }])", context),
    /^M 0\.0 38\.0 C 60\.0 38\.0 120\.0 4\.0 180\.0 4\.0$/,
  );
  assert.match(styles, /\.metric-chart-panel\s*{[^}]*background: transparent;/s);
  assert.match(styles, /\.metric-chart-panel\s*{[^}]*border: 0;/s);
  assert.match(styles, /\.metric-chart-panel\s*{[^}]*height: 4\.25rem;/s);
  assert.match(styles, /\.metric-chart-panel\s*{[^}]*margin: 0\.125rem 0 0;/s);
  assert.match(styles, /\.metric-chart-panel\s*{[^}]*width: 100%;/s);
  assert.doesNotMatch(styles, /padding-right: calc\(var\(--acadia-section-padding-dense\) \+ var\(--metric-icon-reserve\)\);/);
  assert.match(styles, /\.metric-top\s*{[^}]*padding-right: var\(--metric-icon-reserve\);/s);
  assert.match(styles, /\.metric-card-has-chart \.metric-footer\s*{[^}]*border-top: 0;/s);
  assert.match(styles, /\.sparkline\s*{[^}]*height: 100%;/s);
  assert.match(styles, /\.sparkline-line\s*{[^}]*stroke-width: 2\.25;/s);
  assert.match(styles, /\.sparkline-baseline\s*{[^}]*stroke-dasharray: 1 5;/s);
  assert.match(styles, /\.sparkline-area\s*{[^}]*opacity: 0\.16;/s);
});

test("metric cards do not expose unavailable previous values", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      renderMetricCard({
        name: "Inflation",
        context: "Consumer prices",
        value: "Unavailable",
        change: "Unavailable",
        previous: "Unavailable",
        tone: "unavailable",
        icon: "fa-receipt",
        source: "FRED: Consumer Price Index for All Urban Consumers",
        cadence: "Needs live data",
        sourceStatus: "Unavailable",
        freshness: { status: "unavailable", label: "Freshness unavailable" },
        points: [],
        comparison: "point-change",
      });
    `,
    context,
  );

  assert.doesNotMatch(html, /Previous Unavailable/);
});

test("stable and mixed visual states stay neutral", () => {
  assert.match(styles, /--acadia-color-brand: #007b78;/);
  assert.match(styles, /--mercury-positive: var\(--acadia-color-action\);/);
  assert.match(styles, /--mercury-negative: #d96f66;/);
  assert.doesNotMatch(styles, /--green:/);
  assert.doesNotMatch(styles, /--red:/);
  assert.match(styles, /\.metric-card-up\s*{\s*--metric-state: var\(--mercury-positive\);/);
  assert.match(styles, /\.metric-card-stable,\s*\.metric-card-mixed\s*{\s*--metric-state: var\(--neutral-state\);/);
  assert.match(styles, /\.trend-stable,\s*\.trend-mixed\s*{\s*color: var\(--muted\);/);
  assert.match(styles, /\.acadia-metric-delta\.is-danger\s*{\s*color: var\(--mercury-negative\);/);
  assert.match(styles, /\.view-change\.trend-up\s*{[^}]*background: color-mix\(in srgb, var\(--mercury-positive\) 14%, transparent\);/s);
  assert.match(styles, /\.view-change\.trend-down,\s*\.view-change\.trend-caution\s*{[^}]*background: color-mix\(in srgb, var\(--mercury-negative\) 14%, transparent\);/s);
});

test("metric cards use Acadia surfaces instead of state-colored borders", () => {
  assert.doesNotMatch(styles, /\.metric-card::before/);
  assert.doesNotMatch(styles, /border-color: color-mix\(in srgb, var\(--metric-state\)/);
  assert.match(styles, /\.metric-icon,\s*\.acadia-metric-icon\s*{[^}]*var\(--acadia-color-text-muted\)/s);
});

test("Acadia header wrapper preserves balanced desktop layout", () => {
  assert.match(styles, /\.app-header-inner\s*{[^}]*display: flex;/s);
  assert.match(styles, /\.app-header-inner\s*{[^}]*justify-content: space-between;/s);
  assert.match(styles, /@media \(max-width: 640px\)[\s\S]*\.app-header-inner\s*{[^}]*flex-direction: column;/);
});
