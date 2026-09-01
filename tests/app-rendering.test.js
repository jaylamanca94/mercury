const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const acadiaStyles = fs.readFileSync(path.join(root, "acadia.css"), "utf8");
const homeSource = fs.readFileSync(path.join(root, "brokerage.js"), "utf8");

test("Home consumes Acadia without a Mercury presentation layer", () => {
  assert.equal(styles, '@import url("acadia.css");\n');
  assert.match(acadiaStyles, /\.acadia-responsive-navbar/);
  assert.match(acadiaStyles, /\.acadia-card\.is-content/);
  assert.match(acadiaStyles, /\.acadia-dialog\.is-form-modal/);
  assert.equal(fs.existsSync(path.join(root, "fonts", "Geist-Variable.woff2")), true);
  assert.doesNotMatch(indexHtml, /brokerage-/);
  assert.doesNotMatch(homeSource, /new window\.Chart|Chart\.js/);
});

test("Home retains the Acadia navigation, dashboard, and private brokerage boundary", () => {
  assert.match(indexHtml, /class="acadia-responsive-navbar"/);
  assert.match(indexHtml, /class="acadia-dashboard-layout"/);
  assert.match(indexHtml, /Portfolio value/);
  assert.match(indexHtml, /Annual distributions/);
  assert.match(indexHtml, /id="account-filter"/);
  assert.match(indexHtml, /aria-disabled="true"[^>]*>Plan/);
  assert.match(indexHtml, /assets\/mercury-mark\.svg/);
});

test("Home uses genuine snapshots, four holdings, and Acadia card actions", () => {
  assert.match(homeSource, /snapshots\.length < 2/);
  assert.match(homeSource, /slice\(0, 4\)/);
  assert.match(homeSource, /acadia-card-trend-chart/);
  assert.match(homeSource, /acadia-action-menu/);
  assert.match(homeSource, /Last successful provider values are retained/);
});

test("the quick add dialog keeps advanced fields and fallback recovery out of the initial path", () => {
  assert.match(indexHtml, /id="asset-symbol"/);
  assert.match(indexHtml, /id="asset-shares"/);
  assert.match(indexHtml, /id="manual-fallback" hidden/);
  assert.match(indexHtml, /id="asset-details" hidden/);
  assert.match(homeSource, /scheduleQuote/);
  assert.match(homeSource, /showManualFallback/);
  assert.match(homeSource, /Edit details/);
});
