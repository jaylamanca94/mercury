const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const marketsHtml = fs.readFileSync(path.join(__dirname, "..", "markets.html"), "utf8");
const supportsHtml = fs.readFileSync(path.join(__dirname, "..", "supports.html"), "utf8");
const indicatorsHtml = fs.readFileSync(path.join(__dirname, "..", "indicators.html"), "utf8");
const dataHtml = fs.readFileSync(path.join(__dirname, "..", "data.html"), "utf8");
const faviconSvg = fs.readFileSync(path.join(__dirname, "..", "assets", "favicon.svg"), "utf8");

function headerBrandIcon(html) {
  const match = html.match(
    /<span class="brand-mark acadia-mark"[^>]*>[\s\S]*?<i class="([^"]+)"/,
  );

  return match?.[1] ?? "";
}

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

function loadAppContext(page = "dashboard") {
  const elements = new Map();
  const document = {
    body: {
      ...createElement(),
      dataset: {
        mercuryPage: page,
      },
    },
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

test("focused regional markets expose region-specific economy lenses", () => {
  const context = loadAppContext();
  const cardsByRegion = vm.runInContext(
    `
      selectedRegion = "Europe";
      const europe = regionalMarketCards().map((card) => ({
        marketRole: card.marketRole,
        name: card.name,
        region: card.region,
        ticker: card.ticker,
      }));
      selectedRegion = "Asia";
      const asia = regionalMarketCards().map((card) => ({
        marketRole: card.marketRole,
        name: card.name,
        region: card.region,
        ticker: card.ticker,
      }));
      selectedRegion = "United States";
      const unitedStates = regionalMarketCards().map((card) => ({
        marketRole: card.marketRole,
        name: card.name,
        region: card.region,
        ticker: card.ticker,
      }));
      ({ asia, europe, unitedStates });
    `,
    context,
  );
  const normalizedCards = JSON.parse(JSON.stringify(cardsByRegion));

  assert.deepEqual(
    normalizedCards.unitedStates.map((card) => card.name),
    [
      "S&P 500",
      "Small Cap",
      "Technology",
      "Financials",
      "Industrials",
      "Bonds",
      "Energy",
      "REIT",
      "Healthcare",
      "Consumer",
      "Communications",
      "Growth",
      "Materials",
    ],
  );
  assert.deepEqual(
    normalizedCards.unitedStates.map((card) => card.ticker),
    ["VOO", "VSMAX", "VGT", "VFH", "VIS", "BND", "VDE", "VNQ", "VHT", "VCR", "VOX", "VUG", "VAW"],
  );
  assert.deepEqual(
    normalizedCards.europe.map((card) => card.name),
    ["Europe", "Financials", "Industrials", "Healthcare", "Consumer", "Energy"],
  );
  assert.deepEqual(
    normalizedCards.europe.map((card) => card.ticker),
    ["VGK", "SX7P", "SXNP", "SXDP", "SXQP", "SXEP"],
  );
  assert.deepEqual(
    normalizedCards.asia.map((card) => card.name),
    ["Japan", "China", "India", "Taiwan", "South Korea", "Asia Broad"],
  );
  assert.deepEqual(
    normalizedCards.asia.map((card) => card.ticker),
    ["EWJ", "MCHI", "INDA", "EWT", "EWY", "VPL"],
  );
  assert.equal(normalizedCards.europe.every((card) => card.region === "Europe"), true);
  assert.equal(normalizedCards.asia.every((card) => card.region === "Asia"), true);
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
      "Market proxy needs live data",
      "Market proxy needs live data",
    ],
  );
  assert.equal(normalizedCards.every((card) => card.sourceStatus === "Unavailable"), true);
  assert.deepEqual(
    normalizedCards.map((card) => card.icon),
    ["fa-earth-americas", "fa-globe", "fa-earth-americas", "fa-earth-europe", "fa-earth-asia"],
  );
});

test("global market cards include total U.S. and international ETFs", () => {
  const context = loadAppContext();
  const cards = vm.runInContext(
    `
      globalMarketCards().map((card) => ({
        name: card.name,
        ticker: card.ticker,
      }));
    `,
    context,
  );
  const normalizedCards = JSON.parse(JSON.stringify(cards));

  assert.deepEqual(
    normalizedCards.slice(0, 2),
    [
      { name: "U.S. Total", ticker: "VTI" },
      { name: "International", ticker: "VXUS" },
    ],
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
  assert.match(styles, /\.dashboard-global \.economy-grid\s*{[^}]*grid-template-columns: repeat\(auto-fit, minmax\(14rem, 1fr\)\);/s);
  assert.match(styles, /\.commodity-grid\s*{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/s);
});

test("dashboard renders editorial sections instead of one mixed grid", () => {
  const context = loadAppContext();

  vm.runInContext(
    `
      selectedRegion = "Global";
      marketPulse = [
        { id: "global-us-total", name: "U.S. Total", value: "$311.10", change: "+2.4%", ticker: "VTI", viewGroup: "economy", region: "Global", marketRole: "global-allocation", sourceStatus: "Source-backed", freshness: { status: "current" }, points: [1, 2], history: [{ value: 1 }, { value: 2 }], comparison: "percent-change" },
        { id: "global-international", name: "International", value: "$71.20", change: "+1.9%", ticker: "VXUS", viewGroup: "economy", region: "Global", marketRole: "global-allocation", sourceStatus: "Source-backed", freshness: { status: "current" }, points: [1, 2], history: [{ value: 1 }, { value: 2 }], comparison: "percent-change" },
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
  assert.match(economyHtml, /U\.S\. Total/);
  assert.match(economyHtml, /VTI/);
  assert.match(economyHtml, /International/);
  assert.match(economyHtml, /VXUS/);
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

test("dashboard summary adds key signals and briefing sections", () => {
  assert.match(indexHtml, /id="overview-tiles-title" class="acadia-title">Key Signals<\/h2>/);
  assert.match(indexHtml, /<h2 class="acadia-title">Executive Summary<\/h2>/);
  assert.match(indexHtml, /id="economic-brief-copy"/);
  assert.match(indexHtml, /id="what-changed-list"/);
  assert.match(indexHtml, /id="risk-watch-list"/);
  assert.match(styles, /\.overview-tiles\s*{[^}]*gap: var\(--acadia-space-3\);/s);
  assert.match(styles, /\.section-heading h2,\s*\.brief-card h2\s*{[^}]*font-size: clamp\(1\.5rem, 2vw, 1\.75rem\);/s);
  assert.match(styles, /\.page-title-row h1\s*{[^}]*font-size: clamp\(1\.875rem, 3vw, 2\.5rem\);/s);
  assert.match(styles, /\.overview-tiles-grid\s*{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/s);
  assert.match(styles, /\.briefing-grid\s*{[^}]*grid-template-columns: minmax\(0, 1\.5fr\) minmax\(0, 1fr\) minmax\(0, 1fr\);/s);
  assert.match(
    styles,
    /@media \(min-width: 1180px\)[\s\S]*\.mercury-page-dashboard \.briefing-grid\s*{[^}]*grid-column: 1 \/ -1;/s,
  );
  assert.match(
    styles,
    /@media \(min-width: 1180px\)[\s\S]*\.mercury-page-dashboard \.dashboard-shell\s*{[^}]*gap: var\(--acadia-space-4\);/s,
  );
  assert.match(styles, /--acadia-content-max: 106\.25rem;/);
  assert.match(
    styles,
    /\.acadia-shell\s*{[^}]*width: min\(calc\(100% - \(var\(--acadia-page-margin\) \* 2\)\), var\(--acadia-content-max\)\);/s,
  );
  assert.match(
    styles,
    /@media \(min-width: 1180px\)[\s\S]*\.mercury-page-dashboard \.hero-chart-panel\s*{[^}]*height: clamp\(6rem, 7vw, 8\.5rem\);/s,
  );
  assert.match(
    styles,
    /@media \(min-width: 1600px\)[\s\S]*\.mercury-page-dashboard \.overview-tiles-grid\s*{[^}]*grid-template-columns: repeat\(8, minmax\(0, 1fr\)\);/s,
  );
  assert.match(
    styles,
    /@media \(min-width: 1600px\)[\s\S]*\.mercury-page-dashboard \.briefing-grid\s*{[^}]*grid-template-columns: minmax\(0, 2fr\) repeat\(2, minmax\(0, 1fr\)\);/s,
  );
  assert.match(
    styles,
    /@media \(min-width: 1600px\)[\s\S]*\.mercury-page-dashboard\.dashboard-focused \.economy-grid\s*{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/s,
  );
  assert.match(
    styles,
    /@media \(min-width: 1600px\)[\s\S]*\.mercury-page-dashboard \.hero-chart-panel\s*{[^}]*height: clamp\(8rem, 7\.5vw, 11\.25rem\);/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.mercury-page-dashboard \.dashboard-shell\s*{[^}]*gap: var\(--acadia-space-3\);/s,
  );
  assert.match(
    styles,
    /\.mercury-page-dashboard \.currency-section,\s*\.mercury-page-dashboard \.commodity-section,\s*\.mercury-page-dashboard \.lower-grid\s*{[^}]*display: none;/s,
  );
});

test("static pages reference the current mobile dock assets", () => {
  const pages = [indexHtml, marketsHtml, supportsHtml, indicatorsHtml, dataHtml];

  for (const html of pages) {
    assert.match(html, /styles\.css\?v=20260619-mobile-dock/);
    assert.match(html, /app\.js\?v=20260619-mobile-dock/);
    assert.match(html, /class="primary-nav acadia-nav acadia-mobile-dock"/);
  }
});

test("markets page adds contextual key drivers for global and focused regions", () => {
  assert.match(marketsHtml, /id="market-drivers-grid"/);
  assert.match(styles, /\.market-drivers-grid\s*{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/s);

  const context = loadAppContext("markets");
  const result = vm.runInContext(
    `
      selectedEconomyPeriod = "week";
      marketPulse = [
        { id: "us-equities", name: "S&P 500", value: "$681.41", change: "+2.2%", ticker: "VOO", viewGroup: "economy", region: "United States", marketRole: "large-cap", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 666 }, { value: 681.41 }], comparison: "percent-change" },
        { id: "us-small-cap", name: "Small Cap", value: "$142.01", change: "+1.7%", ticker: "VSMAX", viewGroup: "economy", region: "United States", marketRole: "small-cap", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 139.6 }, { value: 142.01 }], comparison: "percent-change" },
        { id: "us-technology", name: "Technology", value: "$116.93", change: "+4.1%", ticker: "VGT", viewGroup: "economy", region: "United States", marketRole: "technology", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 112.33 }, { value: 116.93 }], comparison: "percent-change" },
        { id: "us-financials", name: "Financials", value: "$108.12", change: "+1.1%", ticker: "VFH", viewGroup: "economy", region: "United States", marketRole: "financials", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 106.94 }, { value: 108.12 }], comparison: "percent-change" },
        { id: "us-industrials", name: "Industrials", value: "$238.33", change: "+0.9%", ticker: "VIS", viewGroup: "economy", region: "United States", marketRole: "industrials", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 236.2 }, { value: 238.33 }], comparison: "percent-change" },
        { id: "bonds", name: "Bonds", value: "$73.14", change: "+0.3%", ticker: "BND", viewGroup: "economy", region: "United States", marketRole: "bonds", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 72.92 }, { value: 73.14 }], comparison: "percent-change" },
        { id: "europe-equities", name: "Europe", value: "$89.23", change: "+2.9%", ticker: "VGK", viewGroup: "economy", region: "Europe", marketRole: "large-cap", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 86.74 }, { value: 89.23 }], comparison: "percent-change" },
        { id: "asia-equities", name: "Asia Broad", value: "$117.16", change: "+7.5%", ticker: "VPL", viewGroup: "economy", region: "Asia", marketRole: "large-cap", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 108.99 }, { value: 117.16 }], comparison: "percent-change" },
      ];
      selectedRegion = "Global";
      renderDashboard();
      const global = {
        title: document.querySelector("#view-title").textContent,
        driversTitle: document.querySelector("#market-drivers-title").textContent,
        kicker: document.querySelector("#market-drivers-kicker").textContent,
        drivers: document.querySelector("#market-drivers-grid").innerHTML,
        insight: document.querySelector("#hero-insight").textContent,
      };
      selectedRegion = "United States";
      renderDashboard();
      ({
        global,
        focused: {
          title: document.querySelector("#view-title").textContent,
          driversTitle: document.querySelector("#market-drivers-title").textContent,
          kicker: document.querySelector("#market-drivers-kicker").textContent,
          drivers: document.querySelector("#market-drivers-grid").innerHTML,
          insight: document.querySelector("#hero-insight").textContent,
          economyTitle: document.querySelector("#economy-title").textContent,
        },
      });
    `,
    context,
  );

  assert.equal(result.global.title, "Global Economy Markets");
  assert.equal(result.global.driversTitle, "Key Drivers This Week");
  assert.equal(result.global.kicker, "Regions");
  assert.match(result.global.drivers, /1st Region/);
  assert.match(result.global.drivers, /2nd Region/);
  assert.match(result.global.drivers, /3rd Region/);
  assert.match(result.global.drivers, /Region/);
  assert.match(result.global.drivers, /Asia/);
  assert.match(result.global.drivers, /Asia is the strongest contributor this week \(\+7\.5%\)/);
  assert.match(result.global.drivers, /Europe shows steady participation \(\+2\.9%\), supporting the broader trend/);
  assert.match(result.global.drivers, /United States is positive \(\+2\.3%\), but trailing Asia momentum/);
  assert.doesNotMatch(result.global.drivers, /Technology/);
  assert.match(result.global.insight, /led by Asia/);
  assert.equal(result.focused.title, "United States Economy Markets");
  assert.equal(result.focused.driversTitle, "Key Drivers This Week");
  assert.equal(result.focused.kicker, "Drivers");
  assert.equal(result.focused.economyTitle, "United States Markets");
  assert.match(result.focused.drivers, /1st Sector/);
  assert.match(result.focused.drivers, /2nd Core market/);
  assert.match(result.focused.drivers, /Sector/);
  assert.match(result.focused.drivers, /Technology/);
  assert.match(result.focused.drivers, /Technology is the strongest contributor this week \(\+4\.1%\)/);
  assert.match(result.focused.drivers, /S&amp;P 500 shows steady participation \(\+2\.3%\), supporting the broader trend/);
  assert.doesNotMatch(result.focused.drivers, /Asia/);
  assert.match(result.focused.insight, /led by Technology/);
});

test("dashboard briefing is generated from visible economy and risk signals", () => {
  const context = loadAppContext();
  const result = vm.runInContext(
    `
      selectedEconomyPeriod = "week";
      riskIndicators = [
        {
          name: "Volatility",
          value: "18.4",
          change: "+2.03 pts",
          tone: "caution",
          sourceStatus: "Source-backed",
          comparison: "point-change",
        },
      ];
      const heroCards = [
        { name: "Asia", periodChange: "+7.5%", periodChangeValue: 7.5, comparison: "percent-change" },
        { name: "Europe", periodChange: "+2.9%", periodChangeValue: 2.9, comparison: "percent-change" },
        { name: "United States", periodChange: "+2.2%", periodChangeValue: 2.2, comparison: "percent-change" },
      ];
      const healthCards = [
        {
          id: "inflation",
          name: "Inflation",
          value: "4.3%",
          periodChange: "+0.32 pts",
          periodChangeValue: 0.32,
          comparison: "point-change",
          tone: "caution",
        },
      ];
      const commodityCardsForView = [
        {
          id: "oil",
          name: "Oil",
          value: "$75.23",
          periodChange: "-16.4%",
          periodChangeValue: -16.4,
          comparison: "percent-change",
        },
      ];
      const economyChange = sectionChange(heroCards);
      renderEconomicBrief({ economyChange, heroCards, healthCards, commodityCardsForView });
      ({
        brief: document.querySelector("#economic-brief-copy").textContent,
        changed: document.querySelector("#what-changed-list").innerHTML,
        risk: document.querySelector("#risk-watch-list").innerHTML,
      });
    `,
    context,
  );

  assert.match(result.brief, /Global growth signals remain positive this week\./);
  assert.match(result.brief, /Asia led the move \(\+7\.5%\)\./);
  assert.match(result.brief, /Oil prices declined \(-16\.4%\), easing input-cost pressure/);
  assert.match(result.brief, /Market breadth remains healthy with all three major regions participating\./);
  assert.match(result.brief, /Volatility is at 18\.4, keeping the risk backdrop visible\./);
  assert.match(result.changed, /Asia/);
  assert.match(result.changed, /Inflation/);
  assert.match(result.changed, /Oil/);
  assert.match(result.risk, /Volatility/);
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
          icon: "fa-building",
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

  assert.match(html, /fa-building/);
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

test("supports page adds interpreted signals, context, and split asset sections", () => {
  assert.match(supportsHtml, /id="support-signals-grid"/);
  assert.match(supportsHtml, /id="support-brief-copy"/);
  assert.match(supportsHtml, /id="support-pressure-list"/);
  assert.match(supportsHtml, /id="digital-assets-grid"/);
  assert.match(supportsHtml, /Commodity Conditions/);
  assert.match(supportsHtml, /Digital Asset Conditions/);
  assert.match(styles, /\.support-signals-grid\s*{[^}]*grid-template-columns: repeat\(5, minmax\(0, 1fr\)\);/s);
  assert.match(styles, /\.supports-briefing-grid\s*{[^}]*grid-template-columns: minmax\(0, 1\.25fr\) minmax\(0, 0\.85fr\);/s);

  const context = loadAppContext("supports");
  const result = vm.runInContext(
    `
      selectedEconomyPeriod = "week";
      marketPulse = [
        { id: "dollar-index", name: "U.S. dollar", value: "$28.18", change: "+0.5%", ticker: "UUP", icon: "fa-dollar-sign", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 28.04 }, { value: 28.18 }], comparison: "percent-change", trendModel: "dollar" },
        { id: "euro", name: "Euro", value: "1.1523", change: "-0.1%", ticker: "EUR/USD", icon: "fa-euro-sign", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 1.1534 }, { value: 1.1523 }], comparison: "percent-change", trendModel: "currency" },
        { id: "yen", name: "Yen", value: "160.67", change: "+0.1%", ticker: "USD/JPY", icon: "fa-yen-sign", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 160.51 }, { value: 160.67 }], comparison: "percent-change", trendModel: "currency" },
        { id: "oil", name: "Oil", value: "$75.24", change: "-16.4%", ticker: "CL=F", icon: "fa-gas-pump", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 90 }, { value: 75.24 }], comparison: "percent-change", trendModel: "commodity" },
        { id: "bitcoin", name: "Bitcoin", value: "$64,617", change: "+1.7%", ticker: "BTC", icon: "fa-brands fa-bitcoin", viewGroup: "currency", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 63536 }, { value: 64617 }], comparison: "percent-change", trendModel: "market" },
      ];
      renderDashboard();
      ({
        badge: document.querySelector("#support-change-badge").textContent,
        insight: document.querySelector("#hero-insight").textContent,
        signals: document.querySelector("#support-signals-grid").innerHTML,
        brief: document.querySelector("#support-brief-copy").textContent,
        pressures: document.querySelector("#support-pressure-list").innerHTML,
        commodities: document.querySelector("#commodity-grid").innerHTML,
        digital: document.querySelector("#digital-assets-grid").innerHTML,
        badgeHtml: document.querySelector("#support-change-badge").innerHTML,
      });
    `,
    context,
  );

  assert.match(result.badgeHtml, /Support/);
  assert.match(result.badgeHtml, /Mixed/);
  assert.match(result.insight, /Mixed support conditions this week/);
  assert.match(result.insight, /U\.S\. Dollar \(\+0\.5%\) is the clearest positive signal/);
  assert.match(result.insight, /Oil \(-16\.4%\) moved sharply/);
  assert.match(result.signals, /U\.S\. Dollar/);
  assert.match(result.signals, /Positive/);
  assert.match(result.signals, /Oil/);
  assert.match(result.signals, /Falling sharply/);
  assert.match(result.brief, /Oil declined 16\.4% this week/);
  assert.match(result.brief, /A stronger dollar can help contain imported inflation/);
  assert.match(result.pressures, /Oil/);
  assert.match(result.commodities, /Oil/);
  assert.doesNotMatch(result.commodities, /Bitcoin/);
  assert.match(result.digital, /Bitcoin/);
  assert.doesNotMatch(result.digital, /Oil/);
});

test("indicators page adds economic read, drivers, and interpretation", () => {
  assert.match(indicatorsHtml, /id="indicator-read-copy"/);
  assert.match(indicatorsHtml, /id="indicator-drivers-list"/);
  assert.match(indicatorsHtml, /id="indicator-meaning-copy"/);
  assert.match(indicatorsHtml, /Economic Read/);
  assert.match(indicatorsHtml, /Key Drivers/);
  assert.match(indicatorsHtml, /Why It Matters/);
  assert.doesNotMatch(indicatorsHtml, /What It Means/);
  assert.match(
    styles,
    /\.indicator-briefing-grid\s*{[^}]*grid-template-columns: minmax\(0, 1\.35fr\) repeat\(2, minmax\(0, 1fr\)\);/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 1023\.98px\)[\s\S]*\.briefing-grid,\s*\.indicator-briefing-grid,\s*\.supports-briefing-grid\s*{[^}]*grid-template-columns: 1fr;/s,
  );

  const context = loadAppContext("indicators");
  const result = vm.runInContext(
    `
      selectedEconomyPeriod = "week";
      economicHealth = [
        { id: "inflation", name: "Inflation", value: "4.3%", change: "+0.32 pts", icon: "fa-receipt", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 4.0 }, { value: 4.3 }], comparison: "point-change", trendModel: "inflation" },
        { id: "interest-rates", name: "Interest rates", value: "3.63%", change: "-0.01 pts", icon: "fa-percent", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 3.64 }, { value: 3.63 }], comparison: "point-change", trendModel: "policy-rate" },
        { id: "unemployment", name: "Unemployment", value: "4.3%", change: "No change", icon: "fa-briefcase", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 4.3 }, { value: 4.3 }], comparison: "point-change" },
        { id: "gdp-growth", name: "GDP growth", value: "1.6%", change: "+1.10 pts", icon: "fa-seedling", sourceStatus: "Source-backed", freshness: { status: "current" }, history: [{ value: 0.5 }, { value: 1.6 }], comparison: "point-change" },
      ];
      riskIndicators = [
        { name: "Volatility", value: "18.4", change: "+2.03 pts", tone: "caution", sourceStatus: "Source-backed", freshness: { status: "current" }, comparison: "point-change" },
        { name: "Credit stress", value: "$79.73", change: "-0.4%", tone: "down", sourceStatus: "Source-backed", freshness: { status: "current" }, comparison: "percent-change" },
      ];
      renderDashboard();
      ({
        title: document.querySelector("#view-title").textContent,
        hero: document.querySelector("#hero-insight").textContent,
        read: document.querySelector("#indicator-read-copy").textContent,
        drivers: document.querySelector("#indicator-drivers-list").innerHTML,
        movers: document.querySelector("#hero-movers").innerHTML,
        meaning: document.querySelector("#indicator-meaning-copy").textContent,
      });
    `,
    context,
  );

  assert.equal(result.title, "Economic Indicators");
  assert.match(result.hero, /Economic releases are mixed\./);
  assert.match(result.read, /GDP growth improved to 1\.6%\./);
  assert.match(result.read, /Unemployment is unchanged at 4\.3%\./);
  assert.match(result.read, /Inflation rose to 4\.3%, keeping price pressure visible\./);
  assert.match(result.read, /Interest rates remain restrictive at 3\.63%\./);
  assert.match(result.drivers, /Growth support/);
  assert.match(result.drivers, /GDP Growth/);
  assert.match(result.drivers, /Price pressure/);
  assert.match(result.drivers, /Inflation/);
  assert.match(result.drivers, /Stable anchor/);
  assert.match(result.drivers, /Unemployment/);
  assert.match(result.movers, /GDP Growth/);
  assert.match(result.movers, /Inflation/);
  assert.match(result.meaning, /Inflation at 4\.3% and rates at 3\.63% define the constraint on growth/);
  assert.match(result.meaning, /volatility at 18\.4 shows how much market stress is attached to the macro data/);
});

test("indicators briefing does not interpret loading or unavailable data", () => {
  const context = loadAppContext("indicators");
  const result = vm.runInContext(
    `
      renderDashboard();
      ({
        hero: document.querySelector("#hero-insight").textContent,
        read: document.querySelector("#indicator-read-copy").textContent,
        drivers: document.querySelector("#indicator-drivers-list").innerHTML,
        meaning: document.querySelector("#indicator-meaning-copy").textContent,
      });
    `,
    context,
  );

  assert.match(result.hero, /waiting for live economic releases/i);
  assert.match(result.read, /waiting for live economic releases/i);
  assert.doesNotMatch(result.read, /mixed|improving|under pressure/i);
  assert.match(result.drivers, /Waiting for releases/);
  assert.doesNotMatch(result.drivers, /Stable anchor|Risk stable|Growth stable/);
  assert.match(result.meaning, /needs live economic releases and risk indicators/i);
});

test("data page summarizes source health and coverage", () => {
  assert.match(dataHtml, /<title>Data Status \| Mercury<\/title>/);
  assert.match(dataHtml, /id="view-title" class="acadia-title">Data Status<\/h1>/);
  assert.match(dataHtml, /id="source-health-score"/);
  assert.match(dataHtml, /id="source-health-list"/);
  assert.match(dataHtml, /id="coverage-summary-list"/);
  assert.match(dataHtml, /<dt>Markets<\/dt>\s*<dd>Yahoo Finance<\/dd>/);
  assert.match(dataHtml, /<dt>Inflation<\/dt>\s*<dd>FRED<\/dd>/);
  assert.match(dataHtml, /<dt>Regional Growth<\/dt>\s*<dd>World Bank<\/dd>/);
  assert.match(styles, /\.source-health-summary\s*{[^}]*grid-template-columns: minmax\(10rem, 0\.32fr\) minmax\(0, 1fr\);/s);
  assert.match(styles, /\.coverage-summary-list\s*{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/s);

  const context = loadAppContext("data");
  const result = vm.runInContext(
    `
      renderSourceHealth({
        status: "ready",
        marketPulse: [
          { sourceStatus: "Source-backed", freshness: { status: "current" } },
        ],
        economicHealth: [
          { sourceStatus: "Source-backed", freshness: { status: "current" } },
        ],
        riskIndicators: [
          { sourceStatus: "Source-backed", freshness: { status: "current" } },
        ],
        regions: [
          { sourceStatus: "Source-backed", freshness: { status: "current" } },
        ],
      });
      ({
        score: document.querySelector("#source-health-score").textContent,
        detail: document.querySelector("#source-health-detail").textContent,
        copy: document.querySelector("#source-coverage-copy").textContent,
        list: document.querySelector("#source-health-list").innerHTML,
      });
    `,
    context,
  );

  assert.equal(result.score, "4/4");
  assert.match(result.detail, /4 of 4 source groups operational/);
  assert.equal(result.copy, "All connected data sources are current.");
  assert.match(result.list, /Market data updated today/);
  assert.match(result.list, /Economic releases current/);
  assert.match(result.list, /Risk indicators current/);
  assert.match(result.list, /Regional coverage current/);
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

test("hero mover pills sit between the insight and chart", () => {
  for (const html of [indexHtml, marketsHtml, indicatorsHtml]) {
    assert.match(
      html,
      /id="hero-insight"[\s\S]*id="hero-movers"[\s\S]*id="hero-sparkline"/,
    );
    assert.doesNotMatch(
      html,
      /id="hero-sparkline"[\s\S]*id="hero-movers"/,
    );
  }
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
  assert.match(styles, /\.page-controls-row\s*{[^}]*align-self: start;/s);
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
  assert.match(
    styles,
    /@media \(min-width: 1180px\)[\s\S]*\.mercury-page-dashboard \.page-title-row\s*{[^}]*padding: var\(--acadia-space-3\);/s,
  );
  assert.match(styles, /\.page-title-group\s*{[^}]*grid-column: 1 \/ -1;[^}]*grid-row: 1;/s);
  assert.match(styles, /\.page-controls-row\s*{[^}]*justify-self: end;/s);
  assert.match(styles, /\.page-controls-row \.page-actions\s*{[^}]*align-items: start;/s);
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
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.page-title-row,\s*\.mercury-page-dashboard \.page-title-row\s*{[^}]*padding: 1rem;/s,
  );
});

test("markets hero controls avoid long regional titles at tablet desktop widths", () => {
  assert.match(
    styles,
    /@media \(min-width: 1024px\)[\s\S]*\.mercury-page-markets \.view-heading,\s*\.mercury-page-markets \.hero-insight\s*{[^}]*max-width: min\(100%, calc\(100% - 38rem\)\);/s,
  );
  assert.match(
    styles,
    /@media \(min-width: 1024px\) and \(max-width: 1380px\)[\s\S]*\.mercury-page-markets \.page-title-row h1\s*{[^}]*font-size: clamp\(1\.75rem, 2\.55vw, 2\.25rem\);/s,
  );
  assert.match(
    styles,
    /@media \(min-width: 1024px\) and \(max-width: 1240px\)[\s\S]*\.mercury-page-markets \.page-title-row\s*{[^}]*grid-template-columns: 1fr;/s,
  );
  assert.match(
    styles,
    /@media \(min-width: 1024px\) and \(max-width: 1240px\)[\s\S]*\.mercury-page-markets \.page-title-group,\s*\.mercury-page-markets \.page-controls-row\s*{[^}]*grid-column: 1;[^}]*grid-row: auto;/s,
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

test("Mercury brand and favicon use the money bill wave mark", () => {
  for (const html of [indexHtml, marketsHtml, supportsHtml, indicatorsHtml, dataHtml]) {
    assert.match(headerBrandIcon(html), /fa-money-bill-wave/);
    assert.doesNotMatch(headerBrandIcon(html), /fa-earth-americas/);
  }

  assert.match(styles, /\.brand-mark\s*{[^}]*color: var\(--acadia-color-brand\);/s);
  assert.match(faviconSvg, /Mercury money bill icon/);
  assert.match(faviconSvg, /M0 419\.6L0 109\.5/);
  assert.doesNotMatch(faviconSvg, /Mercury chart icon/);
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
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.page-actions \.section-select\s*{[^}]*font-size: 0\.9rem;[^}]*min-height: 2\.35rem;/s,
  );
  assert.match(styles, /@media \(max-width: 767\.98px\)[\s\S]*\.refresh-button\s*{[^}]*width: 2\.35rem;/s);
});

test("mobile dashboards use swipeable exploration rails", () => {
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.page-title-row > \.page-title-group > \.acadia-kicker,\s*\.section-heading \.acadia-kicker\s*{[^}]*display: none;/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.page-title-row h1\s*{[^}]*font-size: clamp\(1\.95rem, 8vw, 2\.35rem\);/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.hero-chart-panel\s*{[^}]*height: clamp\(5\.75rem, 28vw, 7\.25rem\);/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.hero-movers\s*{[^}]*flex-wrap: nowrap;[^}]*overflow-x: auto;/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.hero-movers::before\s*{[^}]*content: none;[^}]*display: none;/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.overview-tiles-grid,\s*\.mercury-page-markets \.market-drivers-grid,\s*\.dashboard-global \.economy-grid,[\s\S]*\.mercury-page-supports \.digital-assets-grid\s*{[^}]*display: flex;[^}]*overflow-x: auto;[^}]*scroll-snap-type: x mandatory;/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.overview-tiles-grid > \*,[\s\S]*\.mercury-page-supports \.digital-assets-grid > \*\s*{[^}]*flex: 0 0 min\(82vw, 21rem\);[^}]*scroll-snap-align: start;/s,
  );
});

test("mobile dock clears the device safe area", () => {
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.primary-nav\.acadia-mobile-dock,\s*\.acadia-nav\.acadia-mobile-dock\s*{[^}]*bottom: var\(--acadia-mobile-tabbar-bottom, 1\.25rem\);[^}]*bottom: calc\(var\(--acadia-mobile-tabbar-bottom, 1\.25rem\) \+ env\(safe-area-inset-bottom\)\);[^}]*top: auto;/s,
  );
  assert.doesNotMatch(styles, /bottom: max\(0\.75rem, env\(safe-area-inset-bottom\)\);/);
  assert.match(
    styles,
    /@media \(max-width: 767\.98px\)[\s\S]*\.dashboard-shell\s*{[^}]*padding-bottom: calc\(6\.5rem \+ env\(safe-area-inset-bottom\)\);/s,
  );
});
