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
    __elements: elements,
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
        icon: card.icon,
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
  assert.deepEqual(
    normalizedCards.map((card) => card.icon),
    ["fa-earth-americas", "fa-earth-europe", "fa-earth-asia"],
  );
});

test("global market support cards split currencies from commodities", () => {
  const context = loadAppContext();
  const result = vm.runInContext(
    `
      marketPulse = [
        { id: "bitcoin", name: "Bitcoin", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
        { id: "oil", name: "Oil", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
        { id: "yen", name: "Yen", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
        { id: "dollar-index", name: "U.S. dollar", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
        { id: "euro", name: "Euro", viewGroup: "currency", sourceStatus: "Source-backed", history: [] },
      ];
      ({
        combined: orderedGlobalCurrencyCards().map((card) => card.id),
        commodities: commodityCards().map((card) => card.id),
        currencies: currencySupportCards().map((card) => card.id),
        hideCharts: orderedGlobalCurrencyCards().every((card) => card.hideChart === true),
      });
    `,
    context,
  );
  const normalizedResult = JSON.parse(JSON.stringify(result));

  assert.deepEqual(normalizedResult.combined, ["dollar-index", "euro", "yen", "oil", "bitcoin"]);
  assert.deepEqual(normalizedResult.currencies, ["dollar-index", "euro", "yen"]);
  assert.deepEqual(normalizedResult.commodities, ["oil", "bitcoin"]);
  assert.equal(normalizedResult.hideCharts, true);
  assert.match(styles, /\.dashboard-global \.economy-grid\s*{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/s);
  assert.match(styles, /\.commodity-grid\s*{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/s);
});

test("dashboard renders editorial sections instead of one mixed grid", () => {
  const context = loadAppContext();

  vm.runInContext(
    `
      selectedRegion = "Global";
      marketPulse = [
        { id: "us-equities", name: "S&P 500", value: "$681.41", change: "+2.2%", ticker: "VOO", viewGroup: "economy", region: "United States", marketRole: "large-cap", sourceStatus: "Source-backed", freshness: { status: "current" }, points: [1, 2], history: [{ value: 1 }, { value: 2 }], comparison: "percent-change" },
        { id: "europe-equities", name: "Europe", value: "$89.23", change: "+2.9%", ticker: "VGK", viewGroup: "economy", region: "Europe", marketRole: "large-cap", sourceStatus: "Source-backed", freshness: { status: "current" }, points: [1, 2], history: [{ value: 1 }, { value: 2 }], comparison: "percent-change" },
        { id: "asia-equities", name: "Asia Pacific", value: "$117.16", change: "+7.5%", ticker: "VPL", viewGroup: "economy", region: "Asia", marketRole: "large-cap", sourceStatus: "Source-backed", freshness: { status: "current" }, points: [1, 2], history: [{ value: 1 }, { value: 2 }], comparison: "percent-change" },
        { id: "dollar-index", name: "U.S. dollar", value: "$28.18", change: "+0.5%", ticker: "UUP", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [] },
        { id: "euro", name: "Euro", value: "1.1509", change: "-0.2%", ticker: "EUR/USD", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [] },
        { id: "yen", name: "Yen", value: "160.61", change: "+0.1%", ticker: "USD/JPY", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [] },
        { id: "oil", name: "Oil", value: "$75.57", change: "-16.1%", ticker: "CL=F", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [] },
        { id: "bitcoin", name: "Bitcoin", value: "$64,291", change: "+1.2%", ticker: "BTC", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [] },
      ];
      economicHealth = [
        { id: "inflation", name: "Inflation", value: "4.3%", change: "-0.65 pts", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [], comparison: "point-change" },
      ];
      renderDashboard();
    `,
    context,
  );

  const economyHtml = context.__elements.get("#economy-grid").innerHTML;
  const currencyHtml = context.__elements.get("#currency-grid").innerHTML;
  const commodityHtml = context.__elements.get("#commodity-grid").innerHTML;
  const healthHtml = context.__elements.get("#economic-health-grid").innerHTML;

  assert.match(economyHtml, /United States/);
  assert.match(economyHtml, /Europe/);
  assert.match(economyHtml, /Asia/);
  assert.doesNotMatch(economyHtml, /U\.S\. Dollar/);
  assert.match(currencyHtml, /U\.S\. Dollar/);
  assert.match(currencyHtml, /Euro/);
  assert.match(currencyHtml, /Yen/);
  assert.doesNotMatch(currencyHtml, /Bitcoin/);
  assert.match(commodityHtml, /Oil/);
  assert.match(commodityHtml, /Bitcoin/);
  assert.match(healthHtml, /Inflation/);
});

test("global regional cards show proxy tickers as inline captions", () => {
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
  assert.match(html, /<span class="metric-caption">VOO<\/span>/);
  assert.doesNotMatch(html, /Vanguard S&amp;P 500 ETF<\/p>/);
});

test("global region cards use specific earth icons", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      marketPulse = [
        {
          id: "us-equities",
          name: "S&P 500",
          value: "$498.10",
          change: "+1.2%",
          ticker: "VOO",
          viewGroup: "economy",
          region: "United States",
          marketRole: "large-cap",
          sourceStatus: "Source-backed",
          freshness: { status: "current", label: "Current" },
          points: [492.18, 498.10],
          comparison: "percent-change",
        },
        {
          id: "europe-equities",
          name: "Europe",
          value: "$90.56",
          change: "+2.9%",
          ticker: "VGK",
          viewGroup: "economy",
          region: "Europe",
          marketRole: "large-cap",
          sourceStatus: "Source-backed",
          freshness: { status: "current", label: "Current" },
          points: [88, 90.56],
          comparison: "percent-change",
        },
        {
          id: "asia-equities",
          name: "Asia Pacific",
          value: "$117.16",
          change: "+7.5%",
          ticker: "VPL",
          viewGroup: "economy",
          region: "Asia",
          marketRole: "large-cap",
          sourceStatus: "Source-backed",
          freshness: { status: "current", label: "Current" },
          points: [109, 117.16],
          comparison: "percent-change",
        },
      ];
      globalMarketCards().map(renderMetricCard).join("");
    `,
    context,
  );

  assert.match(html, /fa-solid fa-earth-americas acadia-icon/);
  assert.match(html, /fa-solid fa-earth-europe acadia-icon/);
  assert.match(html, /fa-solid fa-earth-asia acadia-icon/);
});

test("core market cards use category icons and hide proxy subtitles", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      [
        renderMetricCard({
          name: "S&P 500",
          context: "Vanguard S&P 500 ETF",
          value: "$681.41",
          change: "+78.0%",
          tone: "up",
          ticker: "VOO",
          icon: "fa-business-time",
          marketRole: "large-cap",
          source: "Yahoo Finance: Vanguard S&P 500 ETF chart",
          cadence: "Daily market close",
          sourceStatus: "Source-backed",
          freshness: { status: "current", label: "Current" },
          points: [600, 681.41],
          comparison: "percent-change",
        }),
        renderMetricCard({
          name: "Small Cap",
          context: "Vanguard Small-Cap Index Fund",
          value: "$142.01",
          change: "+35.6%",
          tone: "up",
          ticker: "VSMAX",
          icon: "fa-shop",
          marketRole: "small-cap",
          source: "Yahoo Finance: Vanguard Small-Cap Index Fund Admiral Shares chart",
          cadence: "Daily fund close",
          sourceStatus: "Source-backed",
          freshness: { status: "current", label: "Current" },
          points: [110, 142.01],
          comparison: "percent-change",
        }),
      ].join("");
    `,
    context,
  );

  assert.match(html, /fa-business-time/);
  assert.match(html, /fa-shop/);
  assert.match(html, /title="S&amp;P 500 - VOO - Vanguard S&amp;P 500 ETF"/);
  assert.match(html, /title="Small Cap - VSMAX - Vanguard Small-Cap Index Fund"/);
  assert.match(html, /<span class="metric-caption">VOO<\/span>/);
  assert.match(html, /<span class="metric-caption">VSMAX<\/span>/);
  assert.doesNotMatch(html, /class="metric-context">Vanguard S&amp;P 500 ETF/);
  assert.doesNotMatch(html, /class="metric-context">Vanguard Small-Cap Index Fund/);
});

test("support metric cards use clean inline captions instead of long subtitles", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      [
        renderMetricCard({
          id: "dollar-index",
          name: "U.S. dollar",
          context: "Dollar index fund proxy",
          value: "$28.18",
          change: "+0.5%",
          tone: "up",
          ticker: "UUP",
          sourceStatus: "Source-backed",
          freshness: { status: "current", label: "Current" },
          points: [],
          hideChart: true,
          comparison: "percent-change",
        }),
        renderMetricCard({
          id: "euro",
          name: "Euro",
          context: "EUR/USD exchange rate",
          value: "1.1509",
          change: "-0.2%",
          tone: "down",
          ticker: "EUR/USD",
          sourceStatus: "Source-backed",
          freshness: { status: "current", label: "Current" },
          points: [],
          hideChart: true,
          comparison: "percent-change",
        }),
        renderMetricCard({
          id: "yen",
          name: "Yen",
          context: "USD/JPY exchange rate",
          value: "160.61",
          change: "+0.1%",
          tone: "up",
          ticker: "USD/JPY",
          sourceStatus: "Source-backed",
          freshness: { status: "current", label: "Current" },
          points: [],
          hideChart: true,
          comparison: "percent-change",
        }),
      ].join("");
    `,
    context,
  );

  assert.match(html, /<span class="metric-caption">USD<\/span>/);
  assert.match(html, /<span class="metric-caption">EUR<\/span>/);
  assert.match(html, /<span class="metric-caption">JPY<\/span>/);
  assert.doesNotMatch(html, /Dollar index fund proxy<\/p>/);
  assert.doesNotMatch(html, /EUR\/USD exchange rate<\/p>/);
  assert.doesNotMatch(html, /USD\/JPY exchange rate<\/p>/);
});

test("bitcoin card uses the bitcoin brand icon", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      renderMetricCard({
        id: "bitcoin",
        name: "Bitcoin",
        context: "BTC/USD spot rate",
        value: "$64,291",
        change: "+1.2%",
        tone: "up",
        ticker: "BTC",
        icon: "fa-brands fa-bitcoin",
        sourceStatus: "Source-backed",
        freshness: { status: "current", label: "Current" },
        points: [],
        hideChart: true,
        comparison: "percent-change",
      });
    `,
    context,
  );

  assert.match(html, /class="fa-brands fa-bitcoin acadia-icon"/);
  assert.doesNotMatch(html, /fa-solid fa-brands/);
  assert.doesNotMatch(html, /fa-coins/);
});

test("hero insight explains sentiment and top movers", () => {
  const context = loadAppContext();
  const result = vm.runInContext(
    `
      const cards = [
        { name: "Asia", periodChange: "+8.5%", periodChangeValue: 8.5, comparison: "percent-change" },
        { name: "Europe", periodChange: "+3.6%", periodChangeValue: 3.6, comparison: "percent-change" },
        { id: "oil", name: "Oil", periodChange: "-15.9%", periodChangeValue: -15.9, comparison: "percent-change" },
        { id: "bitcoin", name: "Bitcoin", periodChange: "-2.5%", periodChangeValue: -2.5, comparison: "percent-change" },
      ];
      const change = sectionChange(cards);
      ({
        badge: '<span>' + sentimentForChange(change).label + '</span><strong>' + change.label + '</strong>',
        insight: buildHeroInsight(change, heroMoverCards(cards), "week", "Global"),
        movers: renderHeroMovers(heroMoverCards(cards)),
        moverNames: heroMoverCards(cards).map((card) => card.name),
        title: viewTitle("Global"),
      });
    `,
    context,
  );

  assert.equal(result.title, "Global Economy");
  assert.equal(result.badge, "<span>Strong</span><strong>+3.2%</strong>");
  assert.equal(
    result.insight,
    "Strongly positive this week, led by Asia (+8.5%). Bitcoin (-2.5%) remains the primary drag.",
  );
  assert.doesNotMatch(result.movers, /Top movers/);
  assert.deepEqual(JSON.parse(JSON.stringify(result.moverNames)), ["Asia", "Europe", "Bitcoin"]);
  assert.doesNotMatch(result.movers, /Oil/);
  assert.match(result.movers, /hero-mover-down/);
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
          periodChangeValue: 4,
          weight: 2,
        },
        {
          name: "Europe",
          comparison: "percent-change",
          periodPoints: [50, 51, 53],
          periodChangeValue: 6,
          weight: 1,
        },
        {
          id: "oil",
          name: "Oil",
          comparison: "percent-change",
          periodPoints: [80, 70, 60],
          periodChangeValue: -25,
          weight: 5,
        },
        {
          name: "GDP",
          comparison: "point-change",
          periodPoints: [2, 3, 4],
          periodChangeValue: 2,
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
  assert.match(indexHtml, /class="page-title-row[^"]*"[\s\S]*class="page-controls-row"[\s\S]*economy-period-select/s);
  assert.match(styles, /\.page-controls-row\s*{[^}]*justify-content: flex-end;/s);
  assert.match(styles, /\.page-controls-row\s*{[^}]*grid-column: 2;/s);
  assert.match(styles, /\.page-controls-row\s*{[^}]*grid-row: 1;/s);
  assert.doesNotMatch(indexHtml, /page-actions-card/);
  assert.doesNotMatch(styles, /\.hero-panel-row/);
});

test("hero controls anchor to the top right on desktop and stack on smaller screens", () => {
  assert.match(
    styles,
    /\.page-title-row\s*{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\) auto;/s,
  );
  assert.match(styles, /\.page-title-group\s*{[^}]*grid-column: 1 \/ -1;[^}]*grid-row: 1;/s);
  assert.match(styles, /\.page-controls-row\s*{[^}]*justify-self: end;/s);
  assert.match(
    styles,
    /@media \(max-width: 1023\.98px\)[\s\S]*\.page-title-row\s*{[^}]*grid-template-columns: 1fr;/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 1023\.98px\)[\s\S]*\.page-title-group,\s*\.page-controls-row\s*{[^}]*grid-column: 1;[^}]*grid-row: auto;/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.page-controls-row\s*{[^}]*border-top: 1px solid var\(--acadia-color-border\);/s,
  );
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

test("current daily metric cards hide routine dates, previous values, subtitles, and repeated source names", () => {
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
  assert.match(html, /<span class="metric-caption">VOO<\/span>/);
  assert.doesNotMatch(html, /Vanguard S&amp;P 500 ETF<\/p>/);
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

test("metric cards show compact indicator captions when they clarify the label", () => {
  const context = loadAppContext();
  const html = vm.runInContext(
    `
      renderMetricCard({
        name: "Inflation",
        context: "Consumer prices",
        value: "4.3%",
        change: "-0.65 pts",
        tone: "down",
        icon: "fa-receipt",
        source: "FRED: Consumer Price Index",
        cadence: "Daily market close",
        releaseDate: "2026-06-12",
        sourceStatus: "Source-backed",
        freshness: { status: "current", label: "Current" },
        points: [],
        hideChart: true,
        comparison: "point-change",
      });
    `,
    context,
  );

  assert.match(html, /<span class="metric-caption">CPI<\/span>/);
  assert.doesNotMatch(html, /Consumer prices<\/p>/);
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

test("tablet dashboard stacks lower context sections before cards get cramped", () => {
  assert.match(
    styles,
    /@media \(max-width: 1439\.98px\)[\s\S]*\.lower-grid\s*{[^}]*grid-template-columns: 1fr;/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 1120px\)[\s\S]*\.economic-health-grid\s*{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/s,
  );
});

test("mobile page controls keep period and region in two columns", () => {
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.page-actions\s*{[^}]*display: grid;[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.section-select,\s*\.section-select-label,\s*\.section-select-label-region \.section-select\s*{[^}]*min-width: 0;[^}]*width: 100%;/s,
  );
  assert.match(styles, /@media \(max-width: 767\.98px\)[\s\S]*\.refresh-button\s*{[^}]*width: 2\.5rem;/s);
});
