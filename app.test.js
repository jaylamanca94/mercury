const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function createElement() {
  const classes = new Set();

  return {
    textContent: "",
    innerHTML: "",
    classList: {
      add(name) {
        classes.add(name);
      },
      remove(name) {
        classes.delete(name);
      },
      toggle(name, force) {
        if (force) {
          classes.add(name);
        } else {
          classes.delete(name);
        }
      },
      contains(name) {
        return classes.has(name);
      },
    },
  };
}

const elements = new Map(
  [
    "#market-grid",
    "#market-connection-pill",
    "#market-coverage-count",
    "#market-last-checked",
    "#market-release-range",
    "#market-gap-summary",
    "#market-source-detail",
    "#market-source-status",
    "#health-grid",
    "#risk-list",
    "#region-list",
    "#source-coverage-title",
    "#source-coverage-copy",
    "#risk-title",
    "#risk-coverage-count",
    "#risk-release-range",
    "#risk-last-checked",
    "#live-last-checked",
    "#refresh-schedule",
    "#risk-source-status",
    "#risk-source-detail",
    "#risk-source-note",
    "#risk-connection-pill",
  ].map((selector) => [selector, createElement()]),
);

const context = {
  Intl,
  console,
  document: {
    querySelector(selector) {
      return elements.get(selector) || null;
    },
  },
  window: {
    location: {
      protocol: "file:",
    },
  },
};

vm.createContext(context);
vm.runInContext(fs.readFileSync("app.js", "utf8"), context);

context.applyRiskSnapshot({
  checkedAt: "2026-06-11T12:00:00.000Z",
  sourceAudit: {
    checkedAt: "2026-06-12T12:05:00.000Z",
  },
  sourceHealth: {
    status: "ready",
    label: "FRED risk data current",
    coverage: {
      loaded: 3,
      total: 3,
    },
    releaseRange: {
      earliest: "2026-06-10",
      latest: "2026-06-12",
    },
  },
  indicators: [
    {
      id: "volatility",
      name: "Volatility",
      copy: "VIX is current.",
      trend: "Contained",
      tone: "up",
      icon: "fa-wave-square",
      source: "FRED: CBOE Volatility Index",
      cadence: "Daily close",
      value: "22.22",
      previous: "19.87",
      change: "+11.8%",
      releaseDate: "2026-06-10",
      previousReleaseDate: "2026-06-09",
      sourceUnit: "Index level",
      sourceFrequency: "Daily",
      sourceStatus: "Source-backed",
    },
    {
      id: "dollar-strength",
      name: "Dollar strength",
      copy: "Dollar index is current.",
      trend: "Stable",
      tone: "stable",
      icon: "fa-dollar-sign",
      source: "FRED: Nominal Broad U.S. Dollar Index",
      cadence: "Daily release",
      value: "123.45",
      previous: "123.20",
      change: "+0.2%",
      releaseDate: "2026-06-10",
      previousReleaseDate: "2026-06-09",
      sourceUnit: "Index level",
      sourceFrequency: "Daily",
      sourceStatus: "Source-backed",
    },
    {
      id: "gold",
      name: "Gold",
      copy: "Gold fixing is current.",
      trend: "Rising",
      tone: "caution",
      icon: "fa-coins",
      source: "FRED: Gold Fixing Price",
      cadence: "Daily fixing",
      value: "$3,350.00",
      previous: "$3,310.00",
      change: "+1.2%",
      releaseDate: "2026-06-10",
      previousReleaseDate: "2026-06-09",
      sourceUnit: "U.S. dollars per troy ounce",
      sourceFrequency: "Daily",
      sourceStatus: "Source-backed",
    },
  ],
});

const riskPill = elements.get("#risk-connection-pill");
assert.match(riskPill.innerHTML, /FRED risk data current/);
assert.equal(riskPill.classList.contains("status-pill-live"), true);
assert.equal(riskPill.classList.contains("status-pill-warning"), false);
assert.match(elements.get("#risk-last-checked").textContent, /Jun 12, 2026/);
assert.match(elements.get("#live-last-checked").textContent, /Jun 12, 2026/);
assert.match(elements.get("#risk-list").innerHTML, /Reported as: Index level/);
assert.match(elements.get("#risk-list").innerHTML, /Updates: Daily/);
assert.match(elements.get("#risk-list").innerHTML, /Source observation comparison/);
assert.match(elements.get("#risk-list").innerHTML, /Latest/);
assert.match(elements.get("#risk-list").innerHTML, /Previous/);
assert.match(elements.get("#risk-list").innerHTML, /22.22/);
assert.match(elements.get("#risk-list").innerHTML, /19.87/);

context.applyRouteCheck("#risk-last-checked", "2026-06-11T12:00:00.000Z");
assert.match(elements.get("#risk-last-checked").textContent, /Jun 11, 2026/);
assert.match(elements.get("#live-last-checked").textContent, /Jun 12, 2026/);

context.applyRouteCheck("#risk-last-checked", "2026-06-13T12:00:00.000Z");
assert.match(elements.get("#live-last-checked").textContent, /Jun 13, 2026/);

context.applyRiskFallback();

assert.match(riskPill.innerHTML, /Risk fallback visible/);
assert.equal(riskPill.classList.contains("status-pill-live"), false);
assert.equal(riskPill.classList.contains("status-pill-warning"), true);
assert.equal(elements.get("#risk-last-checked").textContent, "Route unavailable");

context.applyMarketFallback();

assert.equal(elements.get("#market-source-status").textContent, "Sample fallback");
assert.equal(elements.get("#source-coverage-title").textContent, "Source coverage updated");
