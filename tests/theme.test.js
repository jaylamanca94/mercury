const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function createThemeContext({ systemDark = true } = {}) {
  let clickHandler = null;
  const rootAttributes = new Map([["data-bs-theme", ""]]);
  const root = {
    dataset: {
      acadiaThemeStorageKey: "acadia-theme",
    },
    getAttribute(name) {
      return rootAttributes.get(name) ?? null;
    },
    hasAttribute(name) {
      return rootAttributes.has(name);
    },
    setAttribute(name, value) {
      rootAttributes.set(name, value);
    },
  };
  const toggleClasses = new Set();
  const toggle = {
    dataset: {},
    classList: {
      toggle(name, force) {
        if (force) {
          toggleClasses.add(name);
        } else {
          toggleClasses.delete(name);
        }
      },
    },
    addEventListener(type, handler) {
      if (type === "click") {
        clickHandler = handler;
      }
    },
    querySelector() {
      return null;
    },
    setAttribute(name, value) {
      this[name] = value;
    },
  };
  const meta = {
    setAttribute(name, value) {
      this[name] = value;
    },
  };
  const document = {
    documentElement: root,
    readyState: "complete",
    querySelectorAll(selector) {
      if (selector === "[data-acadia-theme-toggle]") {
        return [toggle];
      }

      if (selector === "[data-acadia-theme-color]") {
        return [meta];
      }

      return [];
    },
  };
  const context = {
    document,
    window: {
      localStorage: {
        getItem() {
          throw new Error("localStorage blocked");
        },
        removeItem() {
          throw new Error("localStorage blocked");
        },
        setItem() {
          throw new Error("localStorage blocked");
        },
      },
      matchMedia() {
        return {
          matches: systemDark,
          addEventListener() {},
        };
      },
    },
  };

  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "..", "theme.js"), "utf8"),
    context,
  );

  return {
    clickToggle() {
      assert.equal(typeof clickHandler, "function");
      clickHandler();
    },
    getTheme() {
      return rootAttributes.get("data-acadia-theme");
    },
    toggle,
  };
}

test("theme toggle keeps working when localStorage is unavailable", () => {
  const context = createThemeContext({ systemDark: true });

  context.clickToggle();
  assert.equal(context.getTheme(), "light");
  assert.equal(context.toggle["aria-pressed"], "false");

  context.clickToggle();
  assert.equal(context.getTheme(), "dark");
  assert.equal(context.toggle["aria-pressed"], "true");
});
