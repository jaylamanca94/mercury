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
  assert.equal(styles, '@import url("acadia.css?v=20260902-home-frame-v2");\n');
  assert.match(acadiaStyles, /\.acadia-responsive-navbar/);
  assert.match(acadiaStyles, /\.acadia-card\.is-content/);
  assert.match(acadiaStyles, /\.acadia-dialog\.is-form-modal/);
  assert.match(acadiaStyles, /\.acadia-app[\s\S]*margin: 0/);
  assert.equal(fs.existsSync(path.join(root, "fonts", "Geist-Variable.woff2")), true);
  assert.match(indexHtml, /data-acadia-layout="wide"/);
  assert.match(indexHtml, /data-acadia-page-frame="spacious"/);
  assert.match(indexHtml, /id="main-content" class="acadia-shell acadia-mobile-dock-safe-area"/);
  assert.match(acadiaStyles, /\[data-acadia-page-frame="spacious"\]/);
  assert.match(acadiaStyles, /\.acadia-card\.is-dashboard-trend/);
  assert.doesNotMatch(indexHtml, /brokerage-/);
  assert.doesNotMatch(homeSource, /new window\.Chart|Chart\.js/);
});

test("Home follows the Figma composition with a focused Brokerage dashboard", () => {
  assert.match(indexHtml, /class="acadia-responsive-navbar"/);
  assert.match(indexHtml, /<section class="acadia-dashboard-main" aria-label="Brokerage dashboard">/);
  assert.match(indexHtml, /Portfolio value/);
  assert.match(indexHtml, /Selected-period change/);
  assert.match(indexHtml, /Expected annual return/);
  assert.match(indexHtml, /Annual dividends/);
  assert.match(indexHtml, />Performance</);
  assert.match(indexHtml, />Investments</);
  assert.match(indexHtml, /id="holding-sort"/);
  assert.match(indexHtml, /id="holding-filters"/);
  assert.match(indexHtml, /id="performance-periods"/);
  assert.match(indexHtml, /class="acadia-card is-content is-dashboard-trend"/);
  assert.doesNotMatch(indexHtml, /--acadia-card-trend-height: 16rem/);
  assert.match(indexHtml, /id="holdings-count"/);
  assert.match(indexHtml, /id="target-status"/);
  assert.match(indexHtml, /Portfolio targets/);
  assert.match(indexHtml, /--acadia-grid-columns: 4/);
  assert.doesNotMatch(indexHtml, /id="account-filter"/);
  assert.doesNotMatch(indexHtml, /Brokerage actions|Private workspace|refresh-quotes|refresh-history|export-data/);
  assert.doesNotMatch(indexHtml, /Net worth|Section Header|data-holding-filter="brokerage"|data-holding-filter="retirement"|>Explore<|>History</);
  assert.match(indexHtml, /aria-disabled="true"[^>]*>Plan/);
  assert.match(indexHtml, /aria-disabled="true"[^>]*>Income/);
  assert.match(indexHtml, /aria-disabled="true"[^>]*>Profile/);
  assert.match(indexHtml, /data-nav-page="portfolio"/);
  assert.match(indexHtml, /--acadia-mobile-tab-count: 5/);
  assert.match(indexHtml, /assets\/mercury-mark\.svg/);
});

test("Portfolio follows the Figma navigation order without reviving unavailable routes", () => {
  const desktopNav = indexHtml.match(/<div class="acadia-navbar-links">([\s\S]*?)<\/div>/)?.[1] || "";
  const labels = ["Home", "Portfolio", "Income", "Plan", "Profile"];
  let previous = -1;
  labels.forEach((label) => {
    const position = desktopNav.indexOf(`>${label}<`);
    assert.ok(position > previous, `${label} should follow the prior primary navigation item`);
    previous = position;
  });
  assert.doesNotMatch(desktopNav, /Explore|History/);
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
  assert.match(homeSource, /summarizePerformance/);
  assert.match(homeSource, /data-performance-period/);
  assert.match(homeSource, /control\.disabled = !hasHistory/);
  assert.match(homeSource, /TARGET_ALLOCATION_TOLERANCE = 0\.02/);
  assert.match(homeSource, /summarizeAllocationTargets/);
  assert.match(homeSource, /renderTargetStatus/);
  assert.doesNotMatch(homeSource, /S&P 500/);
  assert.match(homeSource, /Recently updated/);
  assert.match(homeSource, /Last successful quote remains in place/);
});

test("large currency display values use the shared compact format", () => {
  assert.match(homeSource, /function displayCurrency\(value\)/);
  assert.match(homeSource, /Math\.abs\(value\) >= 10000/);
  assert.match(homeSource, /Math\.abs\(value\) >= 1000/);
  assert.match(homeSource, /compactCurrency\.format\(value\)/);
  assert.match(homeSource, /thousandCurrency\.format\(value\)/);
  assert.match(homeSource, /millionCurrency\.format\(value\)/);
  assert.match(homeSource, /\[KMBT\]/);
  assert.match(homeSource, /setText\("#metric-value", displayCurrency/);
  assert.match(homeSource, /setText\(\s*"#metric-change-value"/);
  assert.match(homeSource, /setDelta\("#metric-change-rate", performance\.changeRate/);
  assert.match(homeSource, /"#metric-expected-return"/);
  assert.match(homeSource, /summary\.expectedAnnualReturnRate/);
  assert.match(homeSource, /summary\.distributionYieldRate/);
  assert.match(homeSource, /annual_dividend_cents/);
  assert.match(homeSource, /valueBadge\(valueCents\)[\s\S]*displayCurrency/);
  assert.match(homeSource, /setText\("#asset-total-value", row \? displayCurrency/);
});

test("Home places target status after its four-card Investments preview", () => {
  const homeWorkspace = indexHtml.slice(
    indexHtml.indexOf('<section id="home-workspace"'),
    indexHtml.indexOf('<section id="portfolio-workspace"'),
  );
  assert.ok(homeWorkspace.indexOf('id="holdings-grid"') < homeWorkspace.indexOf('id="target-status"'));
});

test("holding cards use whole-dollar unit prices without rounding up", () => {
  assert.match(homeSource, /function displayCardPrice\(valueCents\)/);
  assert.match(homeSource, /Math\.trunc\(valueCents \/ 100\)/);
  assert.match(homeSource, /: displayCardPrice\(row\.asset\.unitPriceCents\)/);
});

test("the quick add dialog keeps manual recovery out of the initial path", () => {
  assert.match(indexHtml, /id="asset-symbol"/);
  assert.match(indexHtml, /id="asset-shares"/);
  assert.match(indexHtml, /id="manual-fallback" hidden/);
  assert.match(homeSource, /scheduleQuote/);
  assert.match(homeSource, /showManualFallback/);
  assert.match(homeSource, /Edit details/);
});

test("Home never falls back to fabricated assets and Portfolio is a functional route", () => {
  const portfolioWorkspace = indexHtml.slice(indexHtml.indexOf('<section id="portfolio-workspace"'), indexHtml.indexOf('<section id="asset-workspace"'));
  assert.doesNotMatch(homeSource, /sampleHoldings|sampleQuotes|sampleSnapshots|showPreview|Sample workspace/);
  assert.match(homeSource, /routeAssetId/);
  assert.match(homeSource, /navigateToAsset/);
  assert.match(homeSource, /routePortfolio/);
  assert.match(homeSource, /renderPortfolio/);
  assert.match(homeSource, /setActiveNavigation\("portfolio"\)/);
  assert.match(indexHtml, /id="portfolio-workspace" hidden/);
  assert.match(indexHtml, /id="portfolio-search"/);
  assert.match(indexHtml, /id="portfolio-add-asset"/);
  assert.match(indexHtml, /id="portfolio-holding-sort"/);
  assert.match(indexHtml, /data-portfolio-filter="all"/);
  assert.match(indexHtml, /data-portfolio-filter="brokerage"/);
  assert.match(indexHtml, /data-portfolio-filter="crypto"/);
  assert.match(indexHtml, /data-portfolio-filter="retirement"[^>]*disabled/);
  assert.match(indexHtml, /id="portfolio-holdings-grid"/);
  assert.match(homeSource, /portfolioFilter/);
  assert.match(homeSource, /portfolioSort/);
  assert.match(homeSource, /matchingPortfolioHoldingRows/);
  assert.match(homeSource, /renderPortfolioHoldings/);
  assert.doesNotMatch(portfolioWorkspace, /Holdings remain on Home for now|Portfolio workspace is on its way|acadia-card-trend|<svg/);
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

test("an owner can delete an asset only after an explicit Acadia confirmation", () => {
  assert.match(indexHtml, /id="asset-delete" class="acadia-action-menu-item is-danger"/);
  assert.match(indexHtml, /id="delete-asset-dialog" class="acadia-dialog is-form-modal"/);
  assert.match(indexHtml, /id="confirm-delete-asset" class="acadia-button acadia-button-danger"/);
  assert.match(indexHtml, /Historical portfolio snapshots stay unchanged/);
  assert.match(homeSource, /function openDeleteAssetDialog/);
  assert.match(homeSource, /async function deleteCurrentAsset/);
  assert.match(homeSource, /\.from\("holdings"\)\s*\.delete\(\)/);
  assert.match(homeSource, /\.eq\("id", holding\.id\)\s*\.eq\("account_id", state\.account\.id\)/);
  assert.match(homeSource, /window\.location\.hash = "portfolio"/);
});
