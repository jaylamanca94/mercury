const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

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
