const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

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

test("metric cards show source previous values when available", () => {
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

  assert.match(html, /Previous 2\.9% \(Apr 2026\)/);
  assert.match(html, /FRED/);
});

test("daily metric cards show exact previous observation dates", () => {
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

  assert.match(html, /Previous \$492\.18 \(Jun 12, 2026\)/);
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

  assert.match(html, /preserveAspectRatio="none"/);
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
  assert.match(styles, /\.metric-chart-panel\s*{[^}]*width: calc\(100% \+ var\(--metric-icon-reserve\)\);/s);
  assert.match(styles, /\.metric-chart-panel\s*{[^}]*padding: 0\.625rem 0;/s);
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
  assert.match(styles, /--mercury-positive: var\(--acadia-color-action\);/);
  assert.match(styles, /--mercury-negative: #c96861;/);
  assert.doesNotMatch(styles, /--green:/);
  assert.doesNotMatch(styles, /--red:/);
  assert.match(styles, /\.metric-card-up\s*{\s*--metric-state: var\(--mercury-positive\);/);
  assert.match(styles, /\.metric-card-stable,\s*\.metric-card-mixed\s*{\s*--metric-state: var\(--neutral-state\);/);
  assert.match(styles, /\.trend-stable,\s*\.trend-mixed\s*{\s*color: var\(--muted\);/);
  assert.match(styles, /\.acadia-metric-delta\.is-danger\s*{\s*color: var\(--mercury-negative\);/);
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
