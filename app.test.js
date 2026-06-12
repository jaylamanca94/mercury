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

context.applyRiskFallback();

assert.match(riskPill.innerHTML, /Risk fallback visible/);
assert.equal(riskPill.classList.contains("status-pill-live"), false);
assert.equal(riskPill.classList.contains("status-pill-warning"), true);
assert.equal(elements.get("#risk-last-checked").textContent, "Route unavailable");
