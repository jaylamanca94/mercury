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

test("Home follows the Figma composition with a focused Brokerage dashboard", () => {
  assert.match(indexHtml, /class="acadia-responsive-navbar"/);
  assert.match(indexHtml, /<section class="acadia-dashboard-main" aria-label="Brokerage dashboard">/);
  assert.match(indexHtml, /Portfolio value/);
  assert.match(indexHtml, /Annual distributions/);
  assert.match(indexHtml, />Performance</);
  assert.match(indexHtml, />Investments</);
  assert.match(indexHtml, /id="holding-sort"/);
  assert.match(indexHtml, /id="holding-filters"/);
  assert.match(indexHtml, /id="holdings-count"/);
  assert.doesNotMatch(indexHtml, /id="account-filter"/);
  assert.doesNotMatch(indexHtml, /Brokerage actions|Private workspace|refresh-quotes|refresh-history|export-data/);
  assert.doesNotMatch(indexHtml, /Net worth|Section Header|data-holding-filter="brokerage"|data-holding-filter="retirement"/);
  assert.match(indexHtml, /aria-disabled="true"[^>]*>Plan/);
  assert.match(indexHtml, /assets\/mercury-mark\.svg/);
});

test("Home uses genuine performance history, dynamic investment controls, and Acadia card actions", () => {
  assert.match(homeSource, /snapshots\.length < 2/);
  assert.match(homeSource, /slice\(0, 4\)/);
  assert.match(homeSource, /acadia-card-trend-chart/);
  assert.match(homeSource, /acadia-action-menu/);
  assert.match(homeSource, /holdingFilter/);
  assert.match(homeSource, /holdingSort/);
  assert.match(homeSource, /matchingHoldingRows/);
  assert.match(homeSource, /renderHoldingFilters/);
  assert.match(homeSource, /Recently updated/);
  assert.match(homeSource, /Last successful quote remains in place/);
});

test("large currency display values use the shared compact format", () => {
  assert.match(homeSource, /function displayCurrency\(value\)/);
  assert.match(homeSource, /Math\.abs\(value\) >= 100000/);
  assert.match(homeSource, /compactCurrency\.format\(value\)/);
  assert.match(homeSource, /\[KMBT\]/);
  assert.match(homeSource, /setText\("#metric-value", displayCurrency/);
  assert.match(homeSource, /valueBadge\(valueCents\)[\s\S]*displayCurrency/);
  assert.match(homeSource, /setText\("#asset-total-value", row \? displayCurrency/);
});

test("the quick add dialog keeps manual recovery out of the initial path", () => {
  assert.match(indexHtml, /id="asset-symbol"/);
  assert.match(indexHtml, /id="asset-shares"/);
  assert.match(indexHtml, /id="manual-fallback" hidden/);
  assert.match(homeSource, /scheduleQuote/);
  assert.match(homeSource, /showManualFallback/);
  assert.match(homeSource, /Edit details/);
});

test("Home never falls back to fabricated assets and the Asset page is route-based", () => {
  assert.doesNotMatch(homeSource, /sampleHoldings|sampleQuotes|sampleSnapshots|showPreview|Sample workspace/);
  assert.match(homeSource, /routeAssetId/);
  assert.match(homeSource, /navigateToAsset/);
  assert.match(indexHtml, /id="asset-workspace" hidden/);
  assert.match(indexHtml, /id="asset-back"/);
  assert.match(indexHtml, /id="asset-detail-form"/);
});

test("the Asset page uses Acadia primary details and an advanced disclosure", () => {
  assert.match(indexHtml, /id="asset-detail-contribution"/);
  assert.match(indexHtml, /id="asset-detail-frequency"/);
  assert.match(indexHtml, /id="asset-detail-dividend-policy"/);
  assert.match(indexHtml, /id="asset-detail-gains-policy"/);
  assert.match(indexHtml, /class="acadia-accordion-item"/);
  assert.match(indexHtml, />More details</);
  assert.match(homeSource, /contribution_cents/);
  assert.match(homeSource, /contribution_frequency/);
});
