const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const acadiaStyles = fs.readFileSync(path.join(root, "acadia.css"), "utf8");
const homeSource = fs.readFileSync(path.join(root, "brokerage.js"), "utf8");
const planSource = fs.readFileSync(path.join(root, "plan.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const designReadme = fs.readFileSync(path.join(root, "DESIGN-README.md"), "utf8");
const productReadme = fs.readFileSync(path.join(root, "PRODUCT-README.md"), "utf8");
const personalFinancePivot = fs.readFileSync(path.join(root, "docs", "personal-finance-pivot.md"), "utf8");

test("Home consumes Acadia without a Mercury presentation layer", () => {
  assert.match(styles, /^@import url\("acadia\.css\?v=20260903-home-overview-v1"\);/);
  assert.match(acadiaStyles, /\.acadia-responsive-navbar/);
  assert.match(acadiaStyles, /\.acadia-card\.is-content/);
  assert.match(acadiaStyles, /\.acadia-dialog\.is-form-modal/);
  assert.match(acadiaStyles, /\.acadia-app[\s\S]*margin: 0/);
  assert.equal(fs.existsSync(path.join(root, "fonts", "Geist-Variable.woff2")), true);
  assert.equal(fs.existsSync(path.join(root, "fonts", "Syncopate-Regular.ttf")), true);
  assert.equal(fs.existsSync(path.join(root, "fonts", "Syncopate-Bold.ttf")), true);
  assert.match(acadiaStyles, /url\("\.\/fonts\/Syncopate-Regular\.ttf"\)/);
  assert.match(acadiaStyles, /url\("\.\/fonts\/Syncopate-Bold\.ttf"\)/);
  assert.doesNotMatch(acadiaStyles, /fonts\.gstatic\.com\/s\/syncopate/);
  assert.match(indexHtml, /rel="preload" href="fonts\/Syncopate-Regular\.ttf" as="font"/);
  assert.match(indexHtml, /rel="preload" href="fonts\/Syncopate-Bold\.ttf" as="font"/);
  assert.match(indexHtml, /data-acadia-layout="wide"/);
  assert.match(indexHtml, /data-acadia-page-frame="spacious"/);
  assert.match(indexHtml, /id="main-content" class="acadia-shell acadia-mobile-dock-safe-area"/);
  assert.match(indexHtml, /id="home-workspace" class="acadia-stack acadia-home-dashboard" hidden/);
  assert.match(indexHtml, /id="portfolio-workspace" class="acadia-stack mercury-workspace" hidden aria-live="polite"/);
  assert.match(indexHtml, /id="income-workspace" class="acadia-stack mercury-workspace" hidden/);
  assert.match(indexHtml, /id="plan-workspace" class="acadia-stack mercury-workspace" hidden aria-live="polite"/);
  assert.match(indexHtml, /id="asset-workspace" class="acadia-stack mercury-workspace" hidden aria-live="polite"/);
  assert.match(acadiaStyles, /\[data-acadia-page-frame="spacious"\]/);
  assert.match(acadiaStyles, /\.acadia-card\.is-dashboard-trend/);
  assert.doesNotMatch(indexHtml, /brokerage-/);
  assert.doesNotMatch(homeSource, /new window\.Chart|Chart\.js/);
});

test("Mercury preserves the Acadia 24px page-header and Portfolio content rhythm", () => {
  assert.match(acadiaStyles, /--acadia-space-3: 1\.5rem;/);
  assert.match(acadiaStyles, /\.acadia-stack \{\s*display: flex;\s*flex-direction: column;\s*gap: var\(--acadia-space-3\);/);
  assert.doesNotMatch(styles, /\.mercury-workspace > \.acadia-page-header/);
  assert.match(styles, /#portfolio-workspace \.mercury-portfolio-view-panel,[\s\S]*margin-block-start: var\(--acadia-space-3\);/);
  assert.doesNotMatch(acadiaStyles, /\.mercury-workspace/);
});

test("Home composes a minimal Acadia dashboard", () => {
  assert.match(indexHtml, /class="acadia-responsive-navbar"/);
  assert.match(indexHtml, /class="acadia-dashboard-layout"/);
  assert.match(indexHtml, /id="metric-value"/);
  assert.match(indexHtml, /id="net-worth-label"[^>]*>Net worth</);
  assert.match(indexHtml, /id="performance-amount"/);
  assert.match(indexHtml, /id="performance-rate"/);
  assert.match(indexHtml, /id="performance-context"[^>]*>Portfolio value change · All time</);
  assert.doesNotMatch(indexHtml, /id="home-planning-balance"|id="home-review-list"/);
  assert.match(indexHtml, /id="home-growth"/);
  assert.match(indexHtml, /id="home-passive-income"/);
  assert.match(indexHtml, />Estimated annual income</);
  assert.match(indexHtml, />Top assets</);
  assert.doesNotMatch(indexHtml, />Dashboard</);
  assert.doesNotMatch(indexHtml, /id="holding-search"|id="holding-sort"|id="holding-filters"/);
  assert.match(indexHtml, /id="performance-periods" class="acadia-tabs" role="tablist"/);
  assert.match(indexHtml, /data-performance-period="3m"[\s\S]*data-performance-period="6m"[\s\S]*data-performance-period="1y"[\s\S]*data-performance-period="all"/);
  assert.match(indexHtml, /id="history-panel"[^>]*role="tabpanel"/);
  assert.match(indexHtml, /class="acadia-card is-content is-dashboard-trend"/);

  assert.match(indexHtml, /id="home-allocation"/);
  assert.match(indexHtml, /id="holdings-grid" class="acadia-device-grid"[^>]*role="list"/);
  assert.match(indexHtml, /id="history-building"/);
  assert.doesNotMatch(indexHtml, /--acadia-card-trend-height: 16rem/);
  assert.match(indexHtml, /id="holdings-count"/);
  assert.doesNotMatch(indexHtml.slice(indexHtml.indexOf('id="home-workspace"'), indexHtml.indexOf('id="portfolio-workspace"')), /id="add-asset"/);
  assert.doesNotMatch(indexHtml, /id="target-status"|Portfolio targets/);
  assert.doesNotMatch(indexHtml, /id="account-filter"/);
  assert.doesNotMatch(indexHtml, /Brokerage actions|Private workspace|refresh-quotes|refresh-history|export-data/);
  assert.doesNotMatch(indexHtml, /Section Header|data-holding-filter="brokerage"|data-holding-filter="retirement"|>Explore<|>History</);
  assert.match(indexHtml, /href="#plan" data-nav-page="plan">Plan/);
  assert.match(indexHtml, /href="#income" data-nav-page="income">Income/);
  assert.match(indexHtml, /acadia-action-menu-trigger acadia-navbar-link" aria-label="Profile account actions">Profile/);
  assert.match(indexHtml, /data-nav-page="portfolio"/);
  assert.match(indexHtml, /--acadia-mobile-tab-count: 5/);
  assert.match(indexHtml, /assets\/mercury-mark\.svg/);
});

test("Mercury follows the Figma navigation order with the active Plan workspace", () => {
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

test("Mercury composes the complete Acadia responsive Navbar", () => {
  assert.match(indexHtml, /<div class="acadia-responsive-navbar">/);
  assert.match(indexHtml, /<nav class="acadia-navbar" aria-label="Primary desktop navigation">/);
  assert.match(indexHtml, /<nav class="acadia-tablet-navigation" aria-label="Primary tablet navigation">/);
  assert.match(indexHtml, /<nav class="acadia-mobile-tabbar is-fixed" aria-label="Primary phone navigation" style="--acadia-mobile-tab-count: 5">/);
  assert.match(indexHtml, /class="acadia-mobile-tab is-active" href="index\.html" data-nav-page="home" aria-current="page" aria-label="Home"/);
  assert.match(indexHtml, /class="acadia-mobile-tab" href="#portfolio" data-nav-page="portfolio" aria-label="Portfolio"/);
  assert.match(indexHtml, /class="acadia-mobile-tab" href="#income" data-nav-page="income" aria-label="Income"/);
  assert.match(indexHtml, /class="acadia-mobile-tab" href="#plan" data-nav-page="plan" aria-label="Plan"/);
  assert.equal((indexHtml.match(/data-account-label/g) || []).length, 3);
  assert.equal((indexHtml.match(/data-sign-out/g) || []).length, 3);
  assert.doesNotMatch(indexHtml, /fa-circle-user[^>]*acadia-icon[^>]*><\/i><\/summary><div id="account-menu"/);
  assert.match(indexHtml, /class="[^"]*acadia-mobile-dock-safe-area/);
  assert.match(homeSource, /document\.querySelectorAll\("\[data-nav-page\]"\)/);
  assert.match(homeSource, /control\.classList\.toggle\("is-active", active\)/);
  assert.match(homeSource, /control\.setAttribute\("aria-current", "page"\)/);
  assert.match(homeSource, /function setAccountMenuState\(label, isSignedIn\)/);
  assert.match(homeSource, /document\.querySelectorAll\("\[data-sign-out\]"\)/);
});

test("Home uses genuine performance history and ranks holdings with properties", () => {
  assert.match(homeSource, /if \(!performance\.showTrend\)/);
  assert.match(homeSource, /slice\(0, 4\)/);
  assert.match(homeSource, /acadia-card-trend-chart/);
  assert.match(homeSource, /acadia-card-trend-baseline/);
  assert.match(homeSource, /kind: "property"/);
  assert.match(homeSource, /propertyEquityCents\(model\)/);
  assert.match(homeSource, /acadia-asset-preview-card/);
  assert.doesNotMatch(styles, /#home-workspace|mercury-home|mercury-command-grid/);
  assert.match(indexHtml, /id="home-add-asset"/);
  assert.match(homeSource, /Retirement/);
  assert.match(homeSource, /Crypto/);
  assert.match(homeSource, /Brokerage/);
  assert.match(homeSource, /Manual valuation/);
  assert.match(homeSource, /Market value/);
  assert.match(homeSource, /Mortgage/);
  assert.doesNotMatch(homeSource, /holdingFilter|holdingSort|matchingHoldingRows|renderHoldingFilters/);
  assert.match(homeSource, /summarizePerformance/);
  assert.match(homeSource, /data-performance-period/);
  assert.match(homeSource, /control\.disabled = !hasHistory/);
  assert.match(homeSource, /function handlePerformancePeriodKeydown\(event\)/);
  assert.match(homeSource, /\["ArrowRight", "ArrowDown"\]/);
  assert.match(homeSource, /event\.key === "Home"/);
  assert.match(homeSource, /event\.key === "End"/);
  assert.match(homeSource, /historyDateLabel\(performance\.startDate\)/);
  assert.doesNotMatch(homeSource, /S&P 500/);
  assert.match(homeSource, /summary\.totalDayChangeCents/);
  assert.match(homeSource, /summary\.totalDayChangeRate/);
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
  assert.match(homeSource, /function currentNetWorthCents\(summary\)/);
  assert.match(homeSource, /if \(!state\.propertiesAvailable \|\| summary\.rows\.length !== state\.holdings\.length\) return null/);
  assert.match(homeSource, /totalNetWorthCents\(summary\.totalMarketValueCents, state\.properties\.map\(propertyModel\)\)/);
  assert.match(homeSource, /netWorthCents === null \? "Not set" : displayCurrency\(netWorthCents \/ 100\)/);
  assert.match(homeSource, /setMovement\("#metric-change-value", dailyMovementComplete \? summary\.totalDayChangeCents/);
  assert.match(homeSource, /setMovement\("#metric-change-rate", dailyMovementComplete \? summary\.totalDayChangeRate/);
  assert.match(homeSource, /function planningPosition/);
  assert.match(homeSource, /summarizePlanningPosition/);
  assert.match(homeSource, /row\.distributionYieldRate/);
  assert.match(homeSource, /annual_dividend_cents/);
  assert.match(homeSource, /valueBadge\(valueCents\)[\s\S]*displayCurrency/);
  assert.match(homeSource, /setText\("#asset-total-value", row \? displayCurrency/);
});

test("Home leaves Portfolio target status to the Portfolio workspace", () => {
  const homeWorkspace = indexHtml.slice(
    indexHtml.indexOf('<section id="home-workspace"'),
    indexHtml.indexOf('<section id="portfolio-workspace"'),
  );
  assert.doesNotMatch(homeWorkspace, /id="target-status"|Portfolio targets/);
});

test("holding cards use whole-dollar unit prices without rounding up", () => {
  assert.match(homeSource, /function displayCardPrice\(valueCents\)/);
  assert.match(homeSource, /Math\.trunc\(valueCents \/ 100\)/);
  assert.match(homeSource, /: displayCardPrice\(row\.asset\.unitPriceCents\)/);
});

test("holding cards compact large share counts while preserving fractional shares", () => {
  assert.match(homeSource, /function displayCardShares\(value\)/);
  assert.match(homeSource, /if \(absolute < 1000\)/);
  assert.match(homeSource, /Math\.trunc\(\(shares \/ divisor\) \* 10\) \/ 10/);
  assert.match(homeSource, /displayCardShares\(row\.asset\.shares\)/);
});

test("Portfolio cards show the Figma return and dividend-yield metrics without changing Home cards", () => {
  const homeRenderer = homeSource.slice(
    homeSource.indexOf("function renderHoldings(summary)"),
    homeSource.indexOf("function matchingPortfolioHoldingRows(summary)"),
  );
  const portfolioRenderer = homeSource.slice(
    homeSource.indexOf("function renderPortfolioHoldings(summary)"),
    homeSource.indexOf("function renderHome(summary)"),
  );

  assert.match(homeSource, /function holdingCardMetrics\(row\)/);
  assert.match(homeSource, /state\.providerMetrics\[row\.asset\.id\]/);
  assert.match(homeSource, /annualizedReturnRate/);
  assert.match(homeSource, /Trailing 12-month dividend yield/);
  assert.match(homeSource, /\["crypto", "cash"\]/);
  assert.match(homeSource, /isLoading \? "Loading…" : "Not set"/);
  assert.doesNotMatch(homeSource, /fa-chart-line/);
  assert.doesNotMatch(homeSource, /fa-coins/);
  assert.match(homeSource, /returnShortLabel/);
  assert.match(homeSource, />Yield<\/dt><dd>\$\{escapeHtml\(metrics\.yieldValue\)\}/);
  assert.doesNotMatch(homeRenderer, /showMetrics: true/);
  assert.match(portfolioRenderer, /renderHoldingCards\(grid, rows\)/);
  assert.match(homeSource, /function hydrateProviderMetrics\(\)/);
  assert.match(homeSource, /includeMetrics: true/);
  assert.match(homeSource, /providerMetricsPending/);
});

test("Income is a functional planning workspace with live dividend coverage and saved recurring sources", () => {
  const incomeWorkspace = indexHtml.slice(indexHtml.indexOf('<section id="income-workspace"'), indexHtml.indexOf('<section id="plan-workspace"'));
  assert.match(incomeWorkspace, /Planning estimates: expected gross amounts/);
  assert.match(incomeWorkspace, /id="income-periods"/);
  assert.match(incomeWorkspace, /data-income-period="year"/);
  assert.match(incomeWorkspace, /data-income-period="month"/);
  assert.match(incomeWorkspace, /id="income-expenses"/);
  assert.match(incomeWorkspace, /Planned spending/);
  assert.match(incomeWorkspace, /Expected income/);
  assert.match(incomeWorkspace, /Earned &amp; other income/);
  assert.match(incomeWorkspace, /Estimated dividends/);
  assert.match(incomeWorkspace, /id="income-dividend-sort"/);
  assert.match(incomeWorkspace, /id="income-dividends-grid"/);
  assert.match(incomeWorkspace, /id="income-sources-grid"/);
  assert.match(incomeWorkspace, /id="income-budget-panel"/);
  assert.match(incomeWorkspace, /id="income-budget-list"/);
  assert.match(incomeWorkspace, /Monthly amount/);
  assert.match(incomeWorkspace, /id="add-budget-category"/);
  assert.match(indexHtml, /id="income-source-dialog"/);
  assert.match(indexHtml, /id="delete-income-source-dialog"/);
  assert.match(indexHtml, /id="budget-category-dialog"/);
  assert.match(indexHtml, /id="delete-budget-category-dialog"/);
  assert.match(indexHtml, /<script src="income\.js\?v=20260904-budget-v1"><\/script>/);
  assert.match(homeSource, /function routeIncome\(\)/);
  assert.match(homeSource, /function renderIncome\(summary\)/);
  assert.match(homeSource, /summary\.totalEstimatedAnnualIncomeCents/);
  assert.match(homeSource, /state\.providerMetricsPending/);
  assert.match(homeSource, /state\.client\.from\("income_sources"\)/);
  assert.match(homeSource, /state\.client\.from\("budget_categories"\)/);
  assert.match(homeSource, /summarizeBudgetCategories/);
  assert.doesNotMatch(homeSource, /saveBudgetCategoryInline|saveIncomeSourceInline/);
  assert.match(homeSource, /data-edit-income-source/);
  assert.match(homeSource, /data-edit-budget-category/);
  assert.match(incomeWorkspace, /id="income-view-tabs"[^>]*role="tablist"/);
  assert.match(homeSource, /#income\/budget/);
  assert.doesNotMatch(incomeWorkspace, /id="income-search"/);
  assert.match(homeSource, /openDeleteBudgetCategoryDialog/);
  assert.match(homeSource, /openDeleteIncomeSourceDialog/);
  assert.match(homeSource, /data-income-dividend-sort/);
  assert.match(styles, /\.mercury-comparison-table/);
  assert.match(styles, /\.mercury-income-source-row/);
  assert.match(styles, /@media \(max-width: 47\.98rem\)/);
  assert.match(readme, /monthly category-level spending limits/);
  assert.match(personalFinancePivot, /category-level only/);
});

test("Plan is a separate Base-plan projection workspace with aligned portfolio charts", () => {
  const planWorkspace = indexHtml.slice(indexHtml.indexOf('<section id="plan-workspace"'), indexHtml.indexOf('<section id="asset-workspace"'));
  assert.match(planWorkspace, /Base plan/);
  assert.match(planWorkspace, /id="edit-plan-assumptions"/);
  assert.match(planWorkspace, /Illustrative—not a forecast/);
  assert.match(planWorkspace, /id="plan-current-value"/);
  assert.match(planWorkspace, /id="plan-projected-value"/);
  assert.match(planWorkspace, /Projected portfolio income/);
  assert.match(planWorkspace, /data-plan-horizon="5"/);
  assert.match(planWorkspace, /data-plan-horizon="10"/);
  assert.match(planWorkspace, /data-plan-horizon="20"/);
  assert.match(planWorkspace, /id="plan-value-chart"/);
  assert.match(planWorkspace, /id="plan-value-endpoints"/);
  assert.match(planWorkspace, /id="plan-income-chart"/);
  assert.match(planWorkspace, /id="plan-income-endpoints"/);
  assert.match(planWorkspace, /id="plan-property-equity"/);
  assert.match(planWorkspace, /Included in net worth, not in investment or portfolio-income projections/);
  assert.match(indexHtml, /id="plan-assumptions-dialog"/);
  assert.match(indexHtml, /id="property-dialog"/);
  assert.match(indexHtml, /<script src="plan\.js\?v=20260904-portfolio-dashboard-v1"><\/script>/);
  assert.match(indexHtml, /<script src="brokerage\.js\?v=20260905-home-minimal-v1"><\/script>/);
  assert.match(homeSource, /function routePlan\(\)/);
  assert.match(homeSource, /function renderPlan\(summary\)/);
  assert.match(homeSource, /function renderPlanChart/);
  assert.match(homeSource, /state\.client\.from\("plan_settings"\)/);
  assert.match(homeSource, /state\.client\.from\("home_properties"\)/);
  assert.match(homeSource, /annualRecurringContributionCents/);
  assert.match(homeSource, /resolvePlanAssumptions/);
  assert.match(planSource, /const planContract =/);
  assert.doesNotMatch(planSource, /const exported =/);
});

test("the quick add dialog matches the compact Figma flow and keeps manual recovery secondary", () => {
  assert.match(indexHtml, /id="asset-dialog" class="acadia-dialog is-form-modal is-compact"/);
  assert.match(acadiaStyles, /\.acadia-dialog\.is-form-modal:not\(\[open\]\) \{\s*display: none;/);
  assert.match(indexHtml, /id="asset-symbol"/);
  assert.match(indexHtml, /id="asset-symbol"[^>]*autofocus/);
  assert.match(indexHtml, /id="asset-shares"/);
  assert.match(indexHtml, /id="asset-quote-preview"/);
  assert.match(indexHtml, /id="asset-price-preview"/);
  assert.match(indexHtml, /id="asset-value-preview"/);
  assert.match(indexHtml, /id="asset-recurring" name="contribution"/);
  assert.match(indexHtml, /class="acadia-control-leading-affix"[^>]*>\$<\/span>/);
  assert.match(indexHtml, /id="asset-frequency" name="contributionFrequency"/);
  assert.match(indexHtml, /class="acadia-choice acadia-dialog-choice"/);
  assert.match(indexHtml, /id="asset-retirement" name="isRetirement" type="checkbox"/);
  assert.doesNotMatch(indexHtml, /id="asset-dialog-description"/);
  assert.match(indexHtml, /id="manual-fallback"[^>]* hidden/);
  assert.match(acadiaStyles, /\.acadia-dialog\.is-form-modal\.is-compact[\s\S]*padding: calc\(2rem - 1px\);[\s\S]*width: min\(35rem/);
  assert.match(acadiaStyles, /\.acadia-read-only-grid[\s\S]*grid-template-columns: repeat\(2/);
  assert.match(acadiaStyles, /\.acadia-dialog-field-grid,\s*\.acadia-read-only-grid \{\s*grid-template-columns: 1fr;/);
  assert.match(acadiaStyles, /\.acadia-dialog-choice[\s\S]*width: calc\(\(100% - 1\.5rem\) \/ 2\)/);
  assert.match(acadiaStyles, /@media[\s\S]*\.acadia-dialog-choice \{\s*width: 100%;/);
  assert.match(homeSource, /scheduleQuote/);
  assert.match(homeSource, /showManualFallback/);
  assert.match(homeSource, /requestId !== state\.quoteRequestId/);
  assert.match(homeSource, /setQuickAddStatus\(error\.message \|\| "This asset could not be saved\."\)/);
  assert.match(homeSource, /normalizeContributionPlan/);
  assert.match(homeSource, /calculateQuotePreviewValueCents/);
  assert.match(indexHtml, /<script src="portfolio\.js\?v=20260904-home-overview-v2"><\/script>/);
  assert.match(homeSource, /is_retirement: \$\("#asset-retirement"\)\.checked/);
  assert.match(homeSource, /\$\("#asset-symbol"\)\.focus\(\)/);
  assert.match(homeSource, /Edit details/);
});

test("Home never falls back to fabricated assets and Portfolio is a functional route", () => {
  const portfolioWorkspace = indexHtml.slice(indexHtml.indexOf('<section id="portfolio-workspace"'), indexHtml.indexOf('<section id="income-workspace"'));
  assert.doesNotMatch(homeSource, /sampleHoldings|sampleQuotes|sampleSnapshots|showPreview|Sample workspace/);
  assert.match(homeSource, /routeAssetId/);
  assert.match(homeSource, /navigateToAsset/);
  assert.match(homeSource, /routePortfolio/);
  assert.match(homeSource, /renderPortfolio/);
  assert.match(homeSource, /setActiveNavigation\("portfolio"\)/);
  assert.match(indexHtml, /id="portfolio-workspace" class="acadia-stack mercury-workspace" hidden/);
  assert.match(indexHtml, /id="portfolio-search"/);
  assert.match(indexHtml, /id="portfolio-add-asset"/);
  assert.match(indexHtml, /id="portfolio-holding-sort"/);
  assert.match(indexHtml, /data-portfolio-filter="all"/);
  assert.match(indexHtml, /data-portfolio-filter="brokerage"/);
  assert.match(indexHtml, /data-portfolio-filter="crypto"/);
  assert.match(indexHtml, /data-portfolio-filter="retirement" aria-pressed="false"/);
  assert.doesNotMatch(indexHtml, /data-portfolio-filter="retirement"[^>]*(?:disabled|aria-disabled)/);
  assert.match(indexHtml, /id="portfolio-holdings-grid"/);
  assert.match(indexHtml, /id="portfolio-add-property"/);
  assert.match(indexHtml, /id="portfolio-property-sort"/);
  assert.match(indexHtml, /id="portfolio-properties-grid"/);
  assert.match(indexHtml, /id="property-dialog"/);
  assert.match(indexHtml, /id="delete-property-dialog"/);
  assert.match(homeSource, /portfolioFilter/);
  assert.match(homeSource, /portfolioSort/);
  assert.match(homeSource, /matchingPortfolioHoldingRows/);
  assert.match(homeSource, /state\.portfolioFilter === "retirement" && row\.asset\.isRetirement/);
  assert.match(homeSource, /renderPortfolioHoldings/);
  assert.match(homeSource, /function renderProperties\(\)/);
  assert.match(homeSource, /function saveProperty\(event\)/);
  assert.match(homeSource, /function deleteProperty\(event\)/);
  assert.match(homeSource, /totalPropertyEquity\(\)/);
  assert.doesNotMatch(portfolioWorkspace, /Holdings remain on Home for now|Portfolio workspace is on its way|acadia-card-trend|<svg/);
  assert.match(indexHtml, /id="asset-workspace" class="acadia-stack mercury-workspace" hidden/);
  assert.match(indexHtml, /id="asset-back"/);
  assert.match(indexHtml, /id="asset-detail-form"/);
});

test("Portfolio investments switch between shared Cards and Table presentations", () => {
  const portfolioWorkspace = indexHtml.slice(indexHtml.indexOf('<section id="portfolio-workspace"'), indexHtml.indexOf('<section id="income-workspace"'));
  const propertySection = portfolioWorkspace.slice(portfolioWorkspace.indexOf('aria-labelledby="portfolio-properties-title"'));

  assert.match(portfolioWorkspace, /id="portfolio-view-tabs" class="acadia-tabs acadia-page-header-pattern-switch" role="tablist"/);
  assert.match(portfolioWorkspace, /id="portfolio-cards-tab"[^>]*role="tab"[^>]*data-portfolio-view="cards"[^>]*aria-controls="portfolio-cards-panel"[^>]*aria-selected="true"[^>]*tabindex="0"/);
  assert.match(portfolioWorkspace, /id="portfolio-table-tab"[^>]*role="tab"[^>]*data-portfolio-view="table"[^>]*aria-controls="portfolio-table-panel"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
  assert.match(portfolioWorkspace, /id="portfolio-cards-panel"[^>]*role="tabpanel"[^>]*aria-labelledby="portfolio-cards-tab"/);
  assert.match(portfolioWorkspace, /id="portfolio-table-panel"[^>]*role="tabpanel"[^>]*aria-labelledby="portfolio-table-tab"[^>]*hidden/);
  assert.match(portfolioWorkspace, /id="portfolio-holdings-table" class="acadia-table is-compact"/);
  assert.match(portfolioWorkspace, /id="portfolio-holdings-table-body"/);
  assert.match(portfolioWorkspace, /id="portfolio-holdings-object-list" class="acadia-object-list mercury-portfolio-object-list"/);
  ["Asset", "Price", "Shares", "Return", "Yield", "Value", "Updated", "Actions"].forEach((label) => {
    assert.match(portfolioWorkspace, new RegExp(`>${label}(?: |<)`));
  });
  assert.doesNotMatch(propertySection, /data-portfolio-view|portfolio-holdings-table/);

  assert.match(homeSource, /portfolioView: "cards"/);
  assert.match(homeSource, /function renderPortfolioView\(hasRows\)/);
  assert.match(homeSource, /function renderPortfolioTable\(rows\)/);
  assert.match(homeSource, /renderHoldingCards\(grid, rows\);\s*renderPortfolioTable\(rows\);/);
  assert.match(homeSource, /state\.portfolioView === "table"/);
  assert.match(homeSource, /data-portfolio-table-sort-heading/);
  assert.match(homeSource, /state\.portfolioSort === "name" \? "ascending" : "descending"/);
  assert.match(homeSource, /\["ArrowRight", "ArrowDown"\]/);
  assert.match(homeSource, /\["ArrowLeft", "ArrowUp"\]/);
  assert.match(homeSource, /event\.key === "Home"/);
  assert.match(homeSource, /event\.key === "End"/);
  assert.match(homeSource, /Dividend yield not applicable/);
  assert.match(homeSource, /acadia-object-card/);
  assert.match(styles, /\.mercury-portfolio-view-panel\[hidden\]/);
  assert.match(styles, /\.mercury-portfolio-table-wrap \.acadia-table/);
  assert.match(styles, /@media \(max-width: 47\.98rem\)[\s\S]*\.mercury-portfolio-table-wrap \{\s*display: none;/);
  assert.match(styles, /@media \(max-width: 47\.98rem\)[\s\S]*\.mercury-portfolio-object-list \{\s*display: grid;/);
  assert.match(readme, /matching Cards or Table views for investments/);
  assert.match(designReadme, /Page Header peer-view Tabs/);
  assert.match(productReadme, /Cards and Table are peer views/);
});

test("Portfolio uses a concise ownership summary, attached investment toolbar, recurring rows, and labelled property values", () => {
  const portfolioWorkspace = indexHtml.slice(indexHtml.indexOf('<section id="portfolio-workspace"'), indexHtml.indexOf('<section id="income-workspace"'));

  assert.match(portfolioWorkspace, /id="portfolio-summary" class="mercury-portfolio-summary mercury-metric-band"/);
  assert.match(portfolioWorkspace, /id="portfolio-summary-investments"/);
  assert.match(portfolioWorkspace, /id="portfolio-summary-property-equity"/);
  assert.match(portfolioWorkspace, /id="portfolio-summary-recurring-weekly"/);
  assert.match(portfolioWorkspace, /id="portfolio-investments-toolbar" class="acadia-toolbar acadia-muted-panel mercury-portfolio-toolbar"/);
  assert.match(portfolioWorkspace, /id="portfolio-search" type="search" placeholder="Search assets"/);
  assert.match(portfolioWorkspace, /id="portfolio-holdings-grid" class="acadia-grid mercury-portfolio-card-grid"/);
  assert.match(portfolioWorkspace, /id="portfolio-recurring"/);
  assert.match(portfolioWorkspace, /id="portfolio-recurring-total"/);
  assert.match(portfolioWorkspace, /id="portfolio-recurring-list"/);
  assert.match(portfolioWorkspace, /id="portfolio-recurring-empty"/);

  assert.match(homeSource, /function renderPortfolioSummary\(summary\)/);
  assert.match(homeSource, /function renderRecurringInvestments\(summary\)/);
  assert.match(homeSource, /weeklyEquivalentRecurringContributionCents/);
  assert.match(homeSource, /function matchingProperties\(\) \{\s*return state\.properties;/);
  assert.match(homeSource, />Market value</);
  assert.match(homeSource, />Mortgage balance</);
  assert.match(homeSource, />Equity</);
  assert.match(homeSource, /returnShortLabel: Number\.isFinite\(years\)/);
  assert.match(homeSource, /\? "5" : years\}Y return/);
  assert.match(homeSource, />Yield<\/dt>/);
  assert.match(styles, /\.mercury-portfolio-summary[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(styles, /\.mercury-portfolio-toolbar[\s\S]*grid-template-columns: minmax\(14rem, 1fr\) auto/);
  assert.match(styles, /@media \(max-width: 47\.98rem\)[\s\S]*\.mercury-portfolio-summary \{\s*grid-template-columns: 1fr;/);
  assert.match(readme, /weekly-equivalent Recurring summary/);
  assert.match(designReadme, /weekly equivalent of every saved recurring investment/);
  assert.match(productReadme, /weekly equivalent before an Investments-only toolbar/);
  assert.match(personalFinancePivot, /Weekly-equivalent recurring total/);
});

test("the Asset page uses Acadia primary details and an advanced disclosure", () => {
  assert.match(indexHtml, /id="asset-detail-contribution"/);
  assert.match(indexHtml, /id="asset-detail-frequency"/);
  assert.match(indexHtml, /id="asset-detail-retirement" name="isRetirement" type="checkbox"/);
  assert.match(indexHtml, /id="asset-detail-dividend-policy"/);
  assert.match(indexHtml, /id="asset-detail-gains-policy"/);
  assert.match(indexHtml, /class="acadia-accordion-item"/);
  assert.match(indexHtml, />More details</);
  assert.match(homeSource, /contribution_cents/);
  assert.match(homeSource, /contribution_frequency/);
  assert.match(homeSource, /\$\("#asset-detail-retirement"\)\.checked = holding\.is_retirement === true/);
  assert.match(homeSource, /is_retirement: \$\("#asset-detail-retirement"\)\.checked/);
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
