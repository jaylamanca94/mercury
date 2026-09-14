import { buildCardTrendPath } from "./acadia-card-trend.mjs";

(() => {
  "use strict";

  const {
    PERFORMANCE_PERIODS,
    VALUATION_BASES,
    calculateQuotePreviewValueCents,
    normalizeContributionPlan,
    summarizePerformance,
    summarizePortfolio,
  } = window.MercuryPortfolio;
  const {
    INCOME_FREQUENCIES,
    normalizeBudgetCategory,
    normalizeIncomeSource,
    summarizeBudgetCategories,
    summarizeIncomeSources,
  } = window.MercuryIncome;
  const {
    annualRecurringContributionCents,
    normalizeProperty,
    propertyEquityCents,
    propertyGainLoss,
    propertyAppreciation,
    includePropertyInProjection,
    totalPropertyEquityCents,
    normalizePlanSettings,
    projectLifePlan,
    ageOnDate,
    normalizeDateOfBirth,
    dateAtPlanMonth,
    planToday,
    normalizePlanScenario,
    resolvePlanAssumptions,
    totalNetWorthCents,
    weeklyEquivalentRecurringContributionCents,
  } = window.MercuryPlan;
  const { investmentGroup, summarizeInvestmentGroups, summarizePlanningPosition, summarizeHoldingAllocation, summarizeDashboardHistory, summarizeAllTimeChange } = window.MercuryDashboard;
  const { summarizeMarketHistory } = window.MercuryMarketHistory;
  const $ = (selector) => document.querySelector(selector);
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const compactCurrency = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 0,
  });
  const thousandCurrency = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1,
  });
  const millionCurrency = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1,
  });
  const preciseCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const percentage = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 });
  const wholePercentage = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
  const state = {
    client: null, user: null, account: null, accounts: [], holdings: [], quotes: [], snapshots: [], incomeSources: [], incomeSourcesAvailable: true, budgetCategories: [], budgetCategoriesAvailable: true, planSettings: null, properties: [], propertiesAvailable: true, planDataAvailable: true,
    startupStatus: null, startupMessage: "", startupRequestId: 0, dataRequestId: 0, metricsRequestId: 0, propertyReloadPending: false, planReloadPending: false, incomeReloadPending: false, incomeReloadFailed: false, providerMetrics: {}, providerMetricsPending: new Set(), configured: false, pendingQuote: null, quoteTimer: null, quoteRequestId: 0, portfolioFilter: "all", portfolioSort: "value", portfolioView: "cards", recurringSort: "value", propertySort: "value", performancePeriod: "all", incomePeriod: "month", incomeDividendSort: "value", planHorizon: 5, planSelectedYear: 5, incomeSourceDialogId: null, incomeSourceDeleteId: null, budgetCategoryDialogId: null, budgetCategoryDeleteId: null, propertyDialogId: null, propertyDeleteId: null,
  };
  let authSubscription = null;
  let observedAuthUserId;
  let authReloadPending = false;

  // Auth callbacks must stay synchronous: calling Supabase here can deadlock
  // its session lock. A new document also discards every private editor and
  // pending continuation instead of carrying them into another identity.
  function observeAuthSession(session) {
    const userId = session?.user?.id || null;
    if (authReloadPending || observedAuthUserId === userId) return;
    if (observedAuthUserId === undefined) {
      observedAuthUserId = userId;
      return;
    }
    authReloadPending = true;
    state.startupRequestId += 1;
    state.dataRequestId += 1;
    state.metricsRequestId += 1;
    state.quoteRequestId += 1;
    clearTimeout(state.quoteTimer);
    state.client = null;
    state.user = null;
    state.account = null;
    clearMarketHistory();
    clearPortfolioMarketHistory();
    // Hide dialogs as well as the workspace immediately, before navigation.
    // The old page stays inert even if a queued response settles first.
    document.body.hidden = true;
    document.body.setAttribute("style", "display: none !important");
    document.body.inert = true;
    window.location.reload();
  }

  function cents(value) {
    return value === null || value === undefined || value === "" ? null : Math.round(Number(value) * 100);
  }
  function rate(value) {
    return value === null || value === undefined || value === "" ? null : Number(value) / 100;
  }
  function setText(selector, value) { $(selector).textContent = value; }
  function setAccountMenuState(label, isSignedIn) {
    document.querySelectorAll("[data-account-label]").forEach((element) => {
      element.textContent = label;
    });
    document.querySelectorAll("[data-sign-out]").forEach((control) => {
      control.hidden = !isSignedIn;
    });
  }
  function displayCurrency(value) {
    if (!Number.isFinite(value)) return "—";
    const formatted = Math.abs(value) >= 1000000
      ? millionCurrency.format(value)
      : Math.abs(value) >= 10000
        ? compactCurrency.format(value)
        : Math.abs(value) >= 1000
          ? thousandCurrency.format(value)
        : currency.format(value);
    return formatted.replace(/[KMBT]/g, (suffix) => suffix.toLowerCase());
  }
  function displayCardPrice(valueCents) {
    return currency.format(Math.trunc(valueCents / 100));
  }
  function displayCardShares(value) {
    const shares = Number(value);
    if (!Number.isFinite(shares)) return "—";
    const absolute = Math.abs(shares);
    if (absolute < 1000) {
      return shares.toLocaleString("en-US", { maximumFractionDigits: 8 });
    }
    const [divisor, suffix] = absolute >= 1_000_000_000
      ? [1_000_000_000, "b"]
      : absolute >= 1_000_000
        ? [1_000_000, "m"]
        : [1_000, "k"];
    const compact = Math.trunc((shares / divisor) * 10) / 10;
    return `${compact.toLocaleString("en-US", { maximumFractionDigits: 1 })}${suffix}`;
  }
  function displaySignedPercentage(value) {
    const formatted = percentage.format(value);
    return value > 0 ? `+${formatted}` : formatted;
  }
  function displaySignedCurrency(valueCents) {
    const value = valueCents / 100;
    const formatted = displayCurrency(value);
    return value > 0 ? `+${formatted}` : formatted;
  }
  function setDelta(selector, value, formatter) {
    const element = $(selector);
    const isAvailable = Number.isFinite(value);
    element.hidden = !isAvailable;
    if (!isAvailable) return;
    element.textContent = formatter(value);
    element.classList.toggle("is-danger", value < 0);
    element.classList.remove("is-warning");
  }
  function setMovement(selector, value, formatter, { hideWhenUnavailable = false } = {}) {
    const element = $(selector);
    const isAvailable = Number.isFinite(value);
    element.hidden = hideWhenUnavailable && !isAvailable;
    element.textContent = isAvailable ? formatter(value) : "—";
    element.classList.toggle("is-positive", isAvailable && value > 0);
    element.classList.toggle("is-danger", isAvailable && value < 0);
    element.classList.toggle("is-neutral", !isAvailable || value === 0);
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    })[character]);
  }
  function dateLabel(value) {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00.000Z`) : new Date(value);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" }).format(date);
  }
  function historyDateLabel(value) {
    if (!value) return "—";
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00.000Z`) : new Date(value);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(date);
  }
  function routeAssetId() {
    const match = window.location.hash.match(/^#asset\/([^/]+)$/);
    if (!match) return null;
    try { return decodeURIComponent(match[1]); } catch { return match[1]; }
  }
  function routePortfolio() { return window.location.hash === "#portfolio"; }
  function routeIncome() { return ["#income", "#income/budget"].includes(window.location.hash); }
  function routePlan() { return window.location.hash === "#plan"; }
  let assetReturnHash = "#portfolio";
  let portfolioAssetNavigation = null;
  let incomeAssetNavigation = null;
  function navigateToAsset(id, { section = "details" } = {}) {
    if (!routeAssetId()) assetReturnHash = window.location.hash || "#";
    const fromHome = ["", "#"].includes(window.location.hash);
    portfolioAssetNavigation = routePortfolio() || fromHome ? { id, section, fromHome } : null;
    incomeAssetNavigation = routeIncome() ? { id, section, returnHash: window.location.hash, fromSummary: document.activeElement === $("#income-review-yields") } : null;
    window.location.hash = `asset/${encodeURIComponent(id)}`;
  }
  function restorePortfolioAssetFocus(previousHash) {
    if (incomeAssetNavigation && previousHash !== window.location.hash) {
      const { id, section, returnHash, fromSummary } = incomeAssetNavigation;
      if (routeAssetId() === id) {
        if (section !== "details" && state.holdings.some((holding) => holding.id === id)) {
          const field = $(section === "valuation" ? "#asset-detail-manual-price" : "#asset-detail-yield");
          const disclosure = field.closest("details");
          if (disclosure) disclosure.open = true;
          field.focus();
          field.scrollIntoView({ block: "center" });
        } else $("#asset-title").focus();
      } else if (window.location.hash === returnHash && previousHash.startsWith("#asset/")) {
        const target = section === "details" ? [...document.querySelectorAll("[data-income-dividend-id]")].find(element => element.dataset.incomeDividendId === id) : section === "valuation" ? $("#income-review-valuations") : fromSummary ? $("#income-review-yields") : [...document.querySelectorAll("[data-review-income-yield]")].find((element) => element.dataset.reviewIncomeYield === id);
        const returnTarget = target && !target.hidden ? target : $(returnHash === "#income/budget" ? "#income-budget-tab" : "#income-dividends-search");
        const menu = returnTarget.closest?.(".acadia-action-menu");
        if (menu && returnTarget.tagName !== "SUMMARY") menu.open = true;
        returnTarget.focus();
        returnTarget.scrollIntoView({ block: "center" });
      } else if (!routeAssetId()) incomeAssetNavigation = null;
    }
    if (!portfolioAssetNavigation || previousHash === window.location.hash) return;
    const { id, section, fromHome } = portfolioAssetNavigation;
    if (routeAssetId() === id) {
      const hasHolding = state.holdings.some((holding) => holding.id === id);
      $(section === "recurring" && hasHolding ? "#asset-detail-contribution" : "#asset-title").focus();
    } else if ((fromHome ? ["", "#"].includes(window.location.hash) : routePortfolio()) && previousHash.startsWith("#asset/")) {
      const selector = fromHome ? "#holdings-grid [data-holding-id]" : section === "recurring" ? "#portfolio-recurring-list [data-edit-id]" : "#portfolio-holdings-grid [data-holding-id]";
      const target = [...document.querySelectorAll(selector)].find((element) => (element.dataset.editId || element.dataset.holdingId) === id);
      (target || $(fromHome ? "#home-add-asset" : section === "recurring" ? "#portfolio-add-recurring summary" : "#portfolio-add-asset")).focus();
    } else if (!routeAssetId()) {
      portfolioAssetNavigation = null;
    }
  }
  function navigateBackFromAsset() { leaveWorkspace(() => { window.location.hash = assetReturnHash; }); }
  function navigateHome() { window.location.hash = ""; }
  function setActiveNavigation(page) {
    document.querySelectorAll("[data-nav-page]").forEach((control) => {
      const active = control.dataset.navPage === page;
      control.classList.toggle("is-active", active);
      if (active) control.setAttribute("aria-current", "page");
      else control.removeAttribute("aria-current");
    });
  }
  function latestQuotes() {
    return state.quotes.reduce((memo, quote) => (
      !memo[quote.holding_id] || new Date(quote.as_of) > new Date(memo[quote.holding_id].as_of)
        ? { ...memo, [quote.holding_id]: quote }
        : memo
    ), {});
  }
  function quoteDividendFields(holdingId, quote) {
    const previous = latestQuotes()[holdingId];
    return {
      annual_dividend_cents: quote.annualDividendCents ?? previous?.annual_dividend_cents ?? null,
      distribution_yield_rate: quote.distributionYieldRate ?? previous?.distribution_yield_rate ?? null,
    };
  }
  function holdingAsset(holding) {
    const quote = latestQuotes()[holding.id];
    const live = state.providerMetrics[holding.id];
    const hasLiveMetrics = Object.hasOwn(state.providerMetrics, holding.id);
    return {
      id: holding.id,
      symbol: holding.symbol,
      name: holding.name,
      assetType: holding.name || holding.symbol || "Asset",
      instrumentType: holding.instrument_type,
      allocationCategory: holding.allocation_category,
      valuationBasis: holding.valuation_basis,
      manualValueCents: holding.manual_value_cents,
      shares: holding.shares === null ? null : Number(holding.shares),
      unitPriceCents: quote?.price_cents ?? holding.manual_price_cents,
      quoteSource: quote?.source || (holding.manual_price_cents !== null ? "Manual price" : null),
      quoteAsOf: quote?.as_of || null,
      priorCloseCents: quote?.previous_close_cents ?? null,
      annualDividendCents: hasLiveMetrics ? live.annualDividendCents : null,
      providerDistributionYieldRate: hasLiveMetrics ? live.distributionYieldRate : null,
      expectedAnnualReturnRate: holding.expected_annual_return_rate === null ? null : Number(holding.expected_annual_return_rate),
      historicalAnnualizedReturnRate: hasLiveMetrics ? live.annualizedReturnRate : null,
      distributionYieldRate: holding.distribution_yield_rate === null ? null : Number(holding.distribution_yield_rate),
      targetAllocationRate: holding.target_allocation_rate === null ? null : Number(holding.target_allocation_rate),
      weeklyContributionRate: holding.weekly_contribution_rate === null ? null : Number(holding.weekly_contribution_rate),
      isRetirement: holding.is_retirement === true,
      contributionCents: holding.contribution_cents,
      contributionFrequency: holding.contribution_frequency,
      dividendPolicy: holding.dividend_policy,
      capitalGainsPolicy: holding.capital_gains_policy,
      customPolicyNote: holding.custom_policy_note,
    };
  }
  function portfolio() {
    return summarizePortfolio(
      state.holdings.map(holdingAsset).filter((asset) => (
        asset.valuationBasis === VALUATION_BASES.MANUAL_VALUE || asset.unitPriceCents !== null
      )),
      { weeklyContributionCents: state.account?.weekly_contribution_cents || 0 },
    );
  }
  function valueBadge(valueCents) {
    return `<span class="acadia-badge acadia-badge-grey acadia-badge-round">${displayCurrency(valueCents / 100)}</span>`;
  }
  function displayPolicy(value) {
    return value ? value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Not set";
  }
  function setControlsDisabled(disabled) {
    $("#portfolio-add-asset").disabled = disabled;
    $("#home-add-asset").disabled = disabled;
    $("#portfolio-add-property").disabled = disabled || !state.propertiesAvailable;
    $("#add-income").disabled = disabled || !state.incomeSourcesAvailable;
    $("#add-budget-category").disabled = disabled || !state.budgetCategoriesAvailable;
  }

  function renderPerformancePeriods() {
    document.querySelectorAll("[data-performance-period]").forEach((control) => {
      const period = control.dataset.performancePeriod;
      const hasHistory = summarizeDashboardHistory(state.snapshots, period).recordedDays > 0;
      const isActive = state.performancePeriod === period;
      control.disabled = !hasHistory;
      control.classList.toggle("is-active", isActive);
      control.setAttribute("aria-selected", String(isActive));
      control.tabIndex = isActive && hasHistory ? 0 : -1;
    });
    const activeTab = document.querySelector(`[data-performance-period="${state.performancePeriod}"]`);
    $("#history-panel").setAttribute("aria-labelledby", activeTab.id);
  }
  function selectPerformancePeriod(period, { focus = false } = {}) {
    const control = document.querySelector(`[data-performance-period="${period}"]`);
    if (!control || control.disabled) return;
    state.performancePeriod = period;
    render();
    if (focus) control.focus();
  }
  function handlePerformancePeriodKeydown(event) {
    const enabledTabs = [...document.querySelectorAll("[data-performance-period]:not(:disabled)")];
    const currentIndex = enabledTabs.indexOf(event.currentTarget);
    if (currentIndex < 0) return;
    let nextIndex = null;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (currentIndex + 1) % enabledTabs.length;
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = enabledTabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectPerformancePeriod(enabledTabs[nextIndex].dataset.performancePeriod, { focus: true });
  }
  function movementCurrency(value) {
    return `${value > 0 ? "Up" : value < 0 ? "Down" : "No change"} ${displayCurrency(Math.abs(value) / 100)}`;
  }
  function renderHistory() {
    const trend = $("#history-trend");
    const performance = summarizeDashboardHistory(state.snapshots, state.performancePeriod);
    renderPerformancePeriods();
    $("#history-building").hidden = performance.showTrend;
    trend.hidden = !performance.showTrend;
    setText("#history-building", "Your history will appear after the first recorded value.");
    const endpoints = $("#history-endpoints");
    endpoints.hidden = !performance.showTrend;
    if (!performance.showTrend) {
      trend.replaceChildren();
      endpoints.replaceChildren();
      trend.setAttribute("aria-label", "Portfolio value history unavailable");
      setText("#history-summary", "No recorded portfolio values in this range.");
      return performance;
    }
    const values = performance.snapshots.map((point) => point.totalValueCents / 100);
    const endpoint = (date, value) => `<span class="acadia-cluster"><span>${escapeHtml(displayCurrency(value))}</span><time datetime="${date}">${historyDateLabel(date)}</time></span>`;
    endpoints.innerHTML = endpoint(performance.startDate, values[0])
      + (values.length > 1 ? endpoint(performance.endDate, values.at(-1)) : "");
    if (values.length === 1) {
      trend.innerHTML = '<svg class="acadia-card-trend-chart is-primary" viewBox="0 0 100 100" aria-hidden="true"><circle class="acadia-card-trend-point" cx="50" cy="50" r="2.5"></circle></svg>';
      const summary = `First recorded portfolio value: ${currency.format(values[0])} on ${historyDateLabel(performance.startDate)}. A line will appear with the next recorded value. Property equity is excluded.`;
      trend.setAttribute("aria-label", summary);
      setText("#history-summary", summary);
      return performance;
    }
    const minimum = Math.min(...values), maximum = Math.max(...values);
    const range = maximum - minimum;
    const points = values.map((value, index) => ({
      x: performance.positions[index] * 10,
      y: range ? 96 - ((value - minimum) / range) * 84 : 50,
    }));
    const linePath = buildCardTrendPath(points);
    const areaPath = `${linePath} L 1000 100 L 0 100 Z`;
    trend.innerHTML = `<svg class="acadia-card-trend-chart is-primary" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><polyline class="acadia-card-trend-baseline" points="0,${points[0].y} 1000,${points[0].y}"></polyline><path class="acadia-card-trend-area" d="${areaPath}"></path><path class="acadia-card-trend-line" d="${linePath}"></path></svg>`;
    const summary = `${movementCurrency(performance.changeCents)}${performance.changeRate === null ? "" : ` (${displaySignedPercentage(performance.changeRate)})`} from ${historyDateLabel(performance.startDate)} to ${historyDateLabel(performance.endDate)}. Recorded portfolio value ${currency.format(values[0])} to ${currency.format(values.at(-1))}. Value changes include contributions and withdrawals; property equity is excluded.`;
    trend.setAttribute("aria-label", summary);
    setText("#history-summary", summary);
    return performance;
  }

  function instrumentLabel(value) {
    if (value === "etf") return "ETF";
    return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  function sortHoldingRows(rows, sort = "value") {
    return [...rows].sort((left, right) => {
      if (sort === "name") {
        const leftName = left.asset.symbol || left.asset.name || left.asset.instrumentType;
        const rightName = right.asset.symbol || right.asset.name || right.asset.instrumentType;
        return leftName.localeCompare(rightName);
      }
      if (sort === "updated") {
        const leftHolding = state.holdings.find((holding) => holding.id === left.asset.id);
        const rightHolding = state.holdings.find((holding) => holding.id === right.asset.id);
        return new Date(rightHolding?.updated_at || rightHolding?.created_at || 0) - new Date(leftHolding?.updated_at || leftHolding?.created_at || 0);
      }
      return (right.marketValueCents ?? -Infinity) - (left.marketValueCents ?? -Infinity);
    });
  }
  function holdingRecord(row) {
    return state.holdings.find((holding) => holding.id === row.asset.id);
  }
  function holdingPriceLabel(row) {
    if (row.asset.valuationBasis === VALUATION_BASES.MANUAL_VALUE) return "Manual value";
    return row.asset.unitPriceCents === null ? "Needs price" : displayCardPrice(row.asset.unitPriceCents);
  }
  function holdingSharesLabel(row, suffix = false) {
    if (row.asset.shares === null) return suffix ? "" : "—";
    const shares = displayCardShares(row.asset.shares);
    return suffix ? `${shares} shares` : shares;
  }
  function holdingUpdatedLabel(row) {
    const holding = holdingRecord(row);
    const value = holding?.updated_at || holding?.created_at;
    if (!value || Number.isNaN(new Date(value).getTime())) return { value: null, label: "Not set" };
    return {
      value,
      label: new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York",
      }).format(new Date(value)),
    };
  }
  function holdingMetricSummary(row) {
    const live = state.providerMetrics[row.asset.id] || {};
    const isLoading = state.providerMetricsPending.has(row.asset.id);
    const years = live.annualizedReturnYears;
    const returnLabel = Number.isFinite(years)
      ? `${years >= 4.75 ? "Five-year" : `${years}-year`} annualised return`
      : "Annualised return";
    const returnValue = Number.isFinite(live.annualizedReturnRate)
      ? percentage.format(live.annualizedReturnRate)
      : isLoading ? "Loading…" : "Not set";
    const hasYield = !["crypto", "cash"].includes(row.asset.instrumentType);
    const yieldRate = row.asset.distributionYieldRate ?? live.distributionYieldRate;
    const yieldValue = !hasYield
      ? "—"
      : Number.isFinite(yieldRate) ? percentage.format(yieldRate) : isLoading ? "Loading…" : "Not set";
    return {
      hasYield,
      returnRate: Number.isFinite(live.annualizedReturnRate) ? live.annualizedReturnRate : null,
      returnShortLabel: Number.isFinite(years)
        ? `${years >= 4.75 ? "5" : years}Y return`
        : "Return",
      returnLabel,
      returnValue,
      yieldLabel: hasYield ? "Trailing 12-month dividend yield" : "Dividend yield not applicable",
      yieldValue,
    };
  }
  function holdingIdentityMarkup(row) {
    const title = row.asset.symbol || row.asset.name;
    const instrument = instrumentLabel(row.asset.instrumentType || "other");
    const secondary = [row.asset.name && row.asset.name !== title ? row.asset.name : null, instrument]
      .filter(Boolean)
      .join(" · ");
    const retirement = row.asset.isRetirement
      ? '<span class="acadia-badge acadia-badge-grey acadia-badge-round acadia-badge-small">Retirement</span>'
      : "";
    return `<div class="acadia-field"><div class="acadia-cluster"><button class="acadia-button acadia-button-quiet" type="button" data-open-asset-id="${escapeHtml(row.asset.id)}">${escapeHtml(title)}</button>${retirement}</div><small class="acadia-text-muted">${escapeHtml(secondary)}</small></div>`;
  }
  function holdingActionMenuMarkup(row) {
    const title = row.asset.symbol || row.asset.name;
    return `<span class="acadia-row-actions"><details class="acadia-action-menu"><summary class="acadia-action-menu-trigger acadia-icon-action" aria-label="Actions for ${escapeHtml(title)}"><i class="fa-solid fa-ellipsis acadia-icon" aria-hidden="true"></i></summary><div class="acadia-action-menu-panel"><button class="acadia-action-menu-item" type="button" data-edit-id="${escapeHtml(row.asset.id)}">Edit details</button></div></details></span>`;
  }
  function bindPortfolioHoldingActions(container) {
    container.querySelectorAll("[data-open-asset-id]").forEach((button) => {
      button.addEventListener("click", () => navigateToAsset(button.dataset.openAssetId));
    });
    container.querySelectorAll("[data-edit-id]").forEach((button) => {
      button.addEventListener("click", () => navigateToAsset(button.dataset.editId, { section: button.dataset.assetSection || "details" }));
    });
  }
  function openHoldingFromEvent(event) {
    const card = event.currentTarget;
    if (event.target.closest("button, summary, a, input, select")) return;
    navigateToAsset(card.dataset.holdingId);
  }
  function keyOpenHolding(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToAsset(event.currentTarget.dataset.holdingId);
    }
  }
  function holdingValueLabel(row) {
    return row.marketValueCents === null ? "Needs valuation" : displayCurrency(row.marketValueCents / 100);
  }
  function renderHoldingCards(grid, rows) {
    grid.replaceChildren(...rows.map((row) => {
      const card = document.createElement("article");
      const title = row.asset.symbol || row.asset.name;
      const group = investmentGroup(row.asset);
      const classification = `${group[0].toUpperCase()}${group.slice(1)}`;
      const metrics = holdingMetricSummary(row);
      card.className = "acadia-card is-content is-interactive";
      card.style.setProperty("--acadia-card-trend-height", "10rem");
      card.style.setProperty("--acadia-card-trend-color", "var(--acadia-color-brand)");
      card.dataset.holdingId = row.asset.id;
      card.tabIndex = 0;
      card.setAttribute("role", "link");
      card.setAttribute("aria-label", `Open ${title} asset details, ${row.marketValueCents === null ? "Needs valuation" : preciseCurrency.format(row.marketValueCents / 100)}`);
      card.innerHTML = `<div class="acadia-card-actions">${holdingActionMenuMarkup(row)}</div><div class="acadia-field"><div class="acadia-cluster"><strong class="acadia-lead">${escapeHtml(title)}</strong><span style="color: var(--acadia-color-brand)" title="${escapeHtml(row.marketValueCents === null ? "Needs valuation" : preciseCurrency.format(row.marketValueCents / 100))}">${escapeHtml(holdingValueLabel(row))}</span></div><span class="acadia-text-muted">${escapeHtml(row.asset.name || instrumentLabel(row.asset.instrumentType))}</span></div><div class="acadia-cluster"><span class="acadia-icon-with-text acadia-icon-with-text-brand" title="${escapeHtml(metrics.returnLabel)}" aria-label="${escapeHtml(metrics.returnLabel)}: ${escapeHtml(metrics.returnValue)}"><i class="fa-solid fa-chart-line acadia-icon acadia-icon-with-text-icon" aria-hidden="true"></i>${escapeHtml(metrics.returnValue)}</span>${metrics.hasYield ? `<span class="acadia-icon-with-text acadia-icon-with-text-brand" title="${escapeHtml(metrics.yieldLabel)}" aria-label="${escapeHtml(metrics.yieldLabel)}: ${escapeHtml(metrics.yieldValue)}"><i class="fa-solid fa-coins acadia-icon acadia-icon-with-text-icon" aria-hidden="true"></i>${escapeHtml(metrics.yieldValue)}</span>` : ""}</div><div class="acadia-cluster"><span class="acadia-badge acadia-badge-grey acadia-badge-round">${classification}</span></div><div data-holding-market="${escapeHtml(row.asset.id)}" class="acadia-field"></div>`;
      card.addEventListener("click", openHoldingFromEvent);
      card.addEventListener("keydown", keyOpenHolding);
      return card;
    }));
    bindPortfolioHoldingActions(grid);
  }
  function renderHoldings(summary) {
    const grid = $("#holdings-grid");
    const candidates = [
      ...summary.rows.map((row) => ({ kind: "holding", valueCents: row.marketValueCents, row })),
      ...(state.propertiesAvailable ? state.properties.map((property) => {
        const model = propertyModel(property);
        return { kind: "property", valueCents: propertyEquityCents(model), model };
      }) : []),
    ].sort((left, right) => right.valueCents - left.valueCents);
    const topAssets = candidates.slice(0, 4);
    grid.replaceChildren(...topAssets.map((candidate) => {
      const item = document.createElement("article");
      item.className = "acadia-card is-content is-interactive";
      item.style.setProperty("--acadia-content-card-padding", "var(--acadia-section-padding-dense)");
      item.tabIndex = 0;
      const isHolding = candidate.kind === "holding";
      item.setAttribute("role", isHolding ? "link" : "button");
      const row = candidate.row;
      const title = isHolding ? row.asset.symbol || row.asset.name : candidate.model.name;
      const classification = isHolding
        ? row.asset.isRetirement ? "Retirement" : row.asset.instrumentType === "crypto" ? "Crypto" : "Brokerage"
        : "Property equity";
      const description = isHolding ? row.asset.name || instrumentLabel(row.asset.instrumentType) : classification;
      const detail = isHolding
        ? row.asset.valuationBasis === VALUATION_BASES.MANUAL_VALUE ? "Manual valuation"
          : `${row.asset.unitPriceCents === null ? "Price unavailable" : preciseCurrency.format(row.asset.unitPriceCents / 100)} · ${holdingSharesLabel(row, true)}`
        : candidate.model.purchasePriceCents === null ? "Purchase price not set" : `${preciseCurrency.format(candidate.model.purchasePriceCents / 100)} purchase price`;
      item.innerHTML = `<div class="acadia-field"><div class="acadia-object-card-header"><strong>${escapeHtml(title)}</strong><strong class="acadia-lead" title="${escapeHtml(preciseCurrency.format(candidate.valueCents / 100))}">${escapeHtml(displayCurrency(candidate.valueCents / 100))}</strong></div><span class="acadia-text-muted">${escapeHtml(description)}</span></div><small class="acadia-text-muted">${escapeHtml(detail)}</small>`;
      item.setAttribute("aria-label", `${isHolding ? `Open ${title} asset details` : `Edit ${title} property`}, ${preciseCurrency.format(candidate.valueCents / 100)}`);
      if (isHolding) item.dataset.holdingId = row.asset.id;
      else item.dataset.propertyId = candidate.model.id;
      const open = () => isHolding ? navigateToAsset(row.asset.id) : openPropertyDialog(candidate.model.id);
      item.addEventListener("click", open);
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
      const wrapper = document.createElement("div");
      wrapper.setAttribute("role", "listitem");
      wrapper.append(item);
      return wrapper;
    }));
    setText("#holdings-count", candidates.length
      ? candidates.length > 4 ? `4 of ${candidates.length} assets` : `${candidates.length} ${candidates.length === 1 ? "asset" : "assets"}`
      : "0 assets");
    grid.hidden = topAssets.length === 0;
    $("#holdings-empty").hidden = topAssets.length > 0;
  }

  function portfolioHoldingRows(summary) {
    // Keep saved holdings reachable even when their valuation is unavailable.
    const valued = new Map(summary.rows.map((row) => [row.asset.id, row]));
    return state.holdings.map((holding) => valued.get(holding.id)
      || { asset: holdingAsset(holding), marketValueCents: null });
  }
  function matchingPortfolioHoldingRows(summary) {
    const search = $("#portfolio-search").value.trim().toLowerCase();
    return portfolioHoldingRows(summary).filter((row) => {
      const matchesFilter = state.portfolioFilter === "all"
        || investmentGroup(row.asset) === state.portfolioFilter;
      const matchesSearch = `${row.asset.symbol || ""} ${row.asset.name || ""} ${row.asset.instrumentType}`.toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    });
  }
  function recurringPortfolioAssets() {
    return state.holdings
      .map(holdingAsset)
      .filter((asset) => asset.contributionCents !== null && asset.contributionFrequency);
  }
  function renderPortfolioSummary(summary) {
    const groups = summarizeInvestmentGroups(portfolioHoldingRows(summary));
    const group = groups.find((item) => item.id === state.portfolioFilter);
    const missingCount = group.missingCount;
    setText("#portfolio-holdings-count", `${group.count} ${group.count === 1 ? "asset" : "assets"}`);
    $("#portfolio-valuation-status").hidden = groups[0].missingCount === 0;
    setText("#portfolio-valuation-status", missingCount > 0
      ? `${missingCount} ${missingCount === 1 ? "asset needs" : "assets need"} a valuation`
      : "Complete portfolio valuations to see allocation.");
    setText("#portfolio-summary-investments", group.valueCents === null ? "—" : preciseCurrency.format(group.valueCents / 100));
    $("#portfolio-group-share").hidden = group.id === "all" || group.allocationRate === null;
    setText("#portfolio-group-share", group.allocationRate === null ? "" : `${(group.allocationRate * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}% of portfolio`);
    setText("#portfolio-summary-property-value", state.propertiesAvailable
      ? displayCurrency(state.properties.reduce((sum, property) => sum + propertyModel(property).currentValueCents, 0) / 100) : "Unavailable");
    setText("#portfolio-summary-property-equity", state.propertiesAvailable
      ? displayCurrency(totalPropertyEquity() / 100)
      : "Not set");
  }
  function renderRecurringInvestments(summary) {
    const assets = recurringPortfolioAssets().sort((a, b) => state.recurringSort === "name"
      ? (a.symbol || a.name).localeCompare(b.symbol || b.name)
      : annualRecurringContributionCents([b]) - annualRecurringContributionCents([a]));
    const annualCents = annualRecurringContributionCents(assets);
    const weeklyEquivalentCents = weeklyEquivalentRecurringContributionCents(assets);
    setText("#portfolio-recurring-count", `${assets.length} ${assets.length === 1 ? "asset" : "assets"}`);
    setText("#portfolio-recurring-weekly", currency.format(weeklyEquivalentCents / 100));
    setText("#portfolio-recurring-monthly", currency.format(Math.round(annualCents / 12) / 100));
    setText("#portfolio-recurring-annual", currency.format(annualCents / 100));
    setText("#portfolio-recurring-total", "Equivalent totals across saved schedules · 52 weeks / 12 months per year");
    $("#portfolio-recurring-sort").value = state.recurringSort;
    const choices = $("#portfolio-recurring-choices");
    choices.innerHTML = state.holdings.map(holding => `<button class="acadia-action-menu-item" type="button" data-edit-id="${escapeHtml(holding.id)}" data-asset-section="recurring">${escapeHtml(holding.symbol || holding.name)}</button>`).join("") || '<button class="acadia-action-menu-item" type="button" data-recurring-add-asset>Add an asset first</button>';
    bindPortfolioHoldingActions(choices);
    choices.querySelector("[data-recurring-add-asset]")?.addEventListener("click", () => $("#portfolio-add-asset").click());
    const list = $("#portfolio-recurring-list");
    list.innerHTML = assets.map((asset) => {
      const title = asset.symbol || asset.name;
      const cadence = asset.contributionFrequency === "monthly" ? "Monthly" : "Weekly";
      return `<article class="acadia-object-card-header" role="listitem"><div class="acadia-cluster"><strong class="acadia-lead">${escapeHtml(title)}</strong><span style="color: var(--acadia-color-brand)" title="${escapeHtml(preciseCurrency.format(asset.contributionCents / 100))}">${escapeHtml(displayCurrency(asset.contributionCents / 100))}</span><span class="acadia-text-muted">${cadence}</span></div><button class="acadia-button acadia-button-quiet" type="button" data-edit-id="${escapeHtml(asset.id)}" data-asset-section="recurring" aria-label="Edit recurring investment for ${escapeHtml(title)}">Edit</button></article>`;
    }).join("");
    bindPortfolioHoldingActions(list);
    $("#portfolio-recurring-empty").hidden = assets.length > 0;
  }
  function renderPortfolioHoldingSort() {
    $("#portfolio-holding-sort").value = state.portfolioSort;
    document.querySelectorAll("[data-portfolio-table-sort-heading]").forEach((heading) => {
      if (heading.dataset.portfolioTableSortHeading === state.portfolioSort) {
        heading.setAttribute("aria-sort", state.portfolioSort === "name" ? "ascending" : "descending");
      } else {
        heading.removeAttribute("aria-sort");
      }
    });
  }
  function renderPortfolioFilters(summary) {
    const groups = summarizeInvestmentGroups(portfolioHoldingRows(summary));
    for (const group of groups) {
      const selected = group.id === state.portfolioFilter;
      const button = $(`[data-investment-group="${group.id}"]`);
      button.setAttribute("aria-pressed", String(selected));
      button.querySelector(".acadia-icon").hidden = !selected;
      if (selected) setText("#portfolio-holdings-title", group.id === "all" ? "Investments" : group.name);
    }
  }
  function renderPortfolioView(hasRows) {
    document.querySelectorAll("[data-portfolio-view]").forEach((control) => {
      const selected = control.dataset.portfolioView === state.portfolioView;
      control.classList.toggle("is-active", selected);
      control.setAttribute("aria-selected", String(selected));
      control.tabIndex = selected ? 0 : -1;
    });
    const tableView = state.portfolioView === "table";
    $("#portfolio-cards-panel").hidden = tableView;
    $("#portfolio-table-panel").hidden = !tableView;
    $("#portfolio-holdings-grid").hidden = !hasRows;
    $("#portfolio-holdings-table-wrap").hidden = !hasRows;
    $("#portfolio-holdings-object-list").hidden = !hasRows;
    $("#portfolio-table-help").hidden = !hasRows;
  }
  function selectPortfolioView(view, { focus = false } = {}) {
    if (!["cards", "table"].includes(view)) return;
    state.portfolioView = view;
    render();
    if (focus) document.querySelector(`[data-portfolio-view="${view}"]`)?.focus();
  }
  function handlePortfolioViewKeydown(event) {
    const tabs = [...document.querySelectorAll("[data-portfolio-view]")];
    const currentIndex = tabs.indexOf(event.currentTarget);
    let nextIndex = currentIndex;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (currentIndex + 1) % tabs.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    selectPortfolioView(tabs[nextIndex].dataset.portfolioView, { focus: true });
  }
  function renderPortfolioTable(rows) {
    const tableBody = $("#portfolio-holdings-table-body");
    tableBody.innerHTML = rows.map((row) => {
      const metrics = holdingMetricSummary(row);
      const updated = holdingUpdatedLabel(row);
      const dateMarkup = updated.value
        ? `<time datetime="${escapeHtml(updated.value)}">${escapeHtml(updated.label)}</time>`
        : updated.label;
      return `<tr><td>${holdingIdentityMarkup(row)}</td><td>${escapeHtml(holdingPriceLabel(row))}</td><td>${escapeHtml(holdingSharesLabel(row))}</td><td aria-label="${escapeHtml(metrics.returnLabel)}: ${escapeHtml(metrics.returnValue)}">${escapeHtml(metrics.returnValue)}</td><td aria-label="${escapeHtml(metrics.yieldLabel)}: ${escapeHtml(metrics.yieldValue)}">${escapeHtml(metrics.yieldValue)}</td><td><strong>${escapeHtml(holdingValueLabel(row))}</strong></td><td>${dateMarkup}</td><td>${holdingActionMenuMarkup(row)}</td></tr>`;
    }).join("");
    const objectList = $("#portfolio-holdings-object-list");
    objectList.innerHTML = rows.map((row) => {
      const metrics = holdingMetricSummary(row);
      const updated = holdingUpdatedLabel(row);
      return `<article class="acadia-object-card"><div class="acadia-object-card-header">${holdingIdentityMarkup(row)}<div class="acadia-object-actions">${holdingActionMenuMarkup(row)}</div></div><div class="acadia-object-meta"><span>Updated ${escapeHtml(updated.label)}</span></div><div class="acadia-cluster"><div class="acadia-field"><span class="acadia-field-hint">Price</span><strong>${escapeHtml(holdingPriceLabel(row))}</strong></div><div class="acadia-field"><span class="acadia-field-hint">Shares</span><strong>${escapeHtml(holdingSharesLabel(row))}</strong></div><div class="acadia-field"><span class="acadia-field-hint">Return</span><strong aria-label="${escapeHtml(metrics.returnLabel)}: ${escapeHtml(metrics.returnValue)}">${escapeHtml(metrics.returnValue)}</strong></div><div class="acadia-field"><span class="acadia-field-hint">Yield</span><strong aria-label="${escapeHtml(metrics.yieldLabel)}: ${escapeHtml(metrics.yieldValue)}">${escapeHtml(metrics.yieldValue)}</strong></div><div class="acadia-field"><span class="acadia-field-hint">Value</span><strong>${escapeHtml(holdingValueLabel(row))}</strong></div></div></article>`;
    }).join("");
    bindPortfolioHoldingActions(tableBody);
    bindPortfolioHoldingActions(objectList);
  }
  function renderPortfolioHoldings(summary) {
    renderPortfolioHoldingSort();
    renderPortfolioFilters(summary);
    const matchingRows = matchingPortfolioHoldingRows(summary);
    const rows = sortHoldingRows(matchingRows, state.portfolioSort);
    const grid = $("#portfolio-holdings-grid");
    renderHoldingCards(grid, rows);
    renderPortfolioTable(rows);
    renderPortfolioView(rows.length > 0);
    syncPortfolioMarketHistory(rows);
    const searching = Boolean($("#portfolio-search").value.trim());
    $("#portfolio-search-feedback").hidden = !searching;
    setText("#portfolio-search-count", searching ? `${rows.length} ${rows.length === 1 ? "match" : "matches"}` : "");
    $("#portfolio-holdings-empty").hidden = rows.length > 0;
    $("#portfolio-reset-filters").hidden = rows.length > 0 || searching || state.portfolioFilter === "all";
    setText("#portfolio-reset-filters", "View all investments");
    if (!rows.length) {
      const hasAssets = state.holdings.length > 0;
      const groupName = summarizeInvestmentGroups(portfolioHoldingRows(summary)).find((group) => group.id === state.portfolioFilter).name;
      setText("#portfolio-holdings-empty-title", searching ? "No matching assets" : hasAssets ? `No ${groupName.toLowerCase()} assets` : "No assets yet");
      setText("#portfolio-holdings-empty-copy", searching
        ? `Try another name or symbol${state.portfolioFilter === "all" ? "." : ` in ${groupName.toLowerCase()}.`}`
        : hasAssets ? "Choose another group or add an asset." : "Add your first investment to get started.");
    }
  }

  function propertyModel(property) {
    return {
      id: property.id,
      accountId: property.account_id,
      name: property.name || "Home",
      location: property.location || null,
      city: property.city || null,
      stateCode: property.state_code || null,
      countyFips: property.county_fips || null,
      currentValueCents: Number(property.current_value_cents),
      purchasePriceCents: property.purchase_price_cents == null ? null : Number(property.purchase_price_cents),
      mortgageBalanceCents: Number(property.mortgage_balance_cents),
      annualAppreciationRate: property.annual_appreciation_rate == null ? null : Number(property.annual_appreciation_rate),
    };
  }
  function totalPropertyEquity() {
    return totalPropertyEquityCents(state.properties.map(propertyModel));
  }
  function currentNetWorthCents(summary) {
    if (!state.propertiesAvailable || summary.rows.length !== state.holdings.length) return null;
    return totalNetWorthCents(summary.totalMarketValueCents, state.properties.map(propertyModel));
  }
  function matchingProperties() {
    return state.properties;
  }
  function sortProperties(properties) {
    return [...properties].sort((left, right) => {
      if (state.propertySort === "name") return (left.name || "Home").localeCompare(right.name || "Home");
      return propertyModel(right).currentValueCents - propertyModel(left).currentValueCents;
    });
  }
  function renderPropertySort() {
    $("#portfolio-property-sort").hidden = state.properties.length < 2 || !state.propertiesAvailable;
    const labels = { value: "Value", name: "Name" };
    setText("#portfolio-property-sort-label", labels[state.propertySort]);
    document.querySelectorAll("[data-property-sort]").forEach((control) => {
      control.setAttribute("aria-pressed", String(control.dataset.propertySort === state.propertySort));
    });
  }
  function renderPropertyCards(properties) {
    const grid = $("#portfolio-properties-grid");
    grid.replaceChildren(...properties.map((property) => {
      const model = propertyModel(property);
      const equityCents = propertyEquityCents(model);
      const change = propertyGainLoss(model);
      const appreciation = propertyAppreciation(model);
      const gainLabel = change === null ? "" : `${change.gainCents > 0 ? "+" : ""}${preciseCurrency.format(change.gainCents / 100)}`;
      const rateLabel = change?.gainRate == null ? "" : new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2, signDisplay: "exceptZero" }).format(change.gainRate);
      const purchaseMarkup = change === null
        ? `<button class="acadia-button acadia-button-quiet" type="button" data-edit-property-id="${escapeHtml(model.id)}" data-property-field="purchase-price" aria-label="Add purchase price for ${escapeHtml(model.name)}">Add purchase price</button>`
        : `<div class="acadia-cluster"><strong style="color: var(${change.gainCents < 0 ? "--acadia-status-danger-text" : "--acadia-color-brand"})">${escapeHtml(rateLabel || "Percentage unavailable")} <span class="acadia-sr-only">gain / loss</span></strong><span class="acadia-text-muted">${escapeHtml(preciseCurrency.format(model.purchasePriceCents / 100))} purchase price</span><span class="acadia-text-muted">${escapeHtml(gainLabel)} gain / loss</span></div><small class="acadia-text-muted">Since purchase · excludes costs and rental income.${change.gainRate === null ? " Percentage unavailable for a zero purchase price." : ""}</small>`;
      const card = document.createElement("article");
      card.className = "acadia-card is-content";
      card.setAttribute("aria-label", `${model.name}${model.location ? `, ${model.location}` : ""}, market value ${displayCurrency(model.currentValueCents / 100)}, mortgage balance ${displayCurrency(model.mortgageBalanceCents / 100)}, equity ${displayCurrency(equityCents / 100)}`);
      card.innerHTML = `<div class="acadia-card-actions" role="group" aria-label="Actions for ${escapeHtml(model.name)}"><details class="acadia-action-menu"><summary class="acadia-action-menu-trigger acadia-icon-action" aria-label="Actions for ${escapeHtml(model.name)}"><i class="fa-solid fa-ellipsis acadia-icon" aria-hidden="true"></i></summary><div class="acadia-action-menu-panel"><button class="acadia-action-menu-item" type="button" data-edit-property-id="${escapeHtml(model.id)}">Edit property</button><div class="acadia-action-menu-divider"></div><button class="acadia-action-menu-item is-danger" type="button" data-delete-property-id="${escapeHtml(model.id)}">Delete property</button></div></details></div><div class="acadia-field"><div class="acadia-cluster"><h3 class="acadia-lead">${escapeHtml(model.name)}</h3><span style="color: var(--acadia-color-brand)" title="${escapeHtml(preciseCurrency.format(model.currentValueCents / 100))}">${escapeHtml(displayCurrency(model.currentValueCents / 100))}<span class="acadia-sr-only"> market value</span></span></div>${model.location ? `<span class="acadia-text-muted">${escapeHtml(model.location)}</span>` : ""}</div>${purchaseMarkup}<div class="acadia-field"><span>${appreciation.rate === null ? "Appreciation not set" : `${percentage.format(appreciation.rate)} annual appreciation`}</span><small class="acadia-text-muted">${escapeHtml(appreciation.source)}</small></div><div class="acadia-cluster"><small class="acadia-text-muted">Equity ${escapeHtml(preciseCurrency.format(equityCents / 100))}</small><small class="acadia-text-muted">Debt ${escapeHtml(preciseCurrency.format(model.mortgageBalanceCents / 100))}</small></div>`;
      return card;
    }));
    grid.querySelectorAll("[data-edit-property-id]").forEach((button) => {
      button.addEventListener("click", () => openPropertyDialog(button.dataset.editPropertyId, { focusPurchasePrice: button.dataset.propertyField === "purchase-price" }));
    });
    grid.querySelectorAll("[data-delete-property-id]").forEach((button) => {
      button.addEventListener("click", () => openDeletePropertyDialog(button.dataset.deletePropertyId));
    });
  }
  function renderProperties() {
    const hasProperties = state.properties.length > 0;
    const properties = sortProperties(matchingProperties());
    renderPropertySort();
    $("#property-retry-data").hidden = state.propertiesAvailable;
    $("#property-retry-data").disabled = state.propertyReloadPending || hasPendingWrite();
    setText("#property-retry-data", state.propertyReloadPending ? "Retrying…" : "Retry properties");
    setText("#portfolio-properties-count", state.propertiesAvailable ? `${properties.length} ${properties.length === 1 ? "property" : "properties"}` : "Unavailable");
    $("#portfolio-properties-grid").hidden = !state.propertiesAvailable;
    $("#portfolio-properties-empty").hidden = !state.propertiesAvailable || properties.length > 0;
    if (!state.propertiesAvailable) {
      setText("#portfolio-properties-empty-title", "Property unavailable");
      setText("#portfolio-properties-empty-copy", "Your properties could not be loaded. Try again.");
      $("#portfolio-properties-empty").hidden = false;
      return;
    }
    renderPropertyCards(properties);
    if (!properties.length) {
      setText("#portfolio-properties-empty-title", hasProperties ? "No matching properties" : "No properties yet");
      setText("#portfolio-properties-empty-copy", hasProperties
        ? "Adjust your search to see a different property."
        : "Add a property to include its equity in your net worth.");
    }
  }

  function planningPosition(summary, period) {
    const completeValuations = summary.rows.length === state.holdings.length;
    return summarizePlanningPosition({
      sources: state.incomeSources.map(incomeSourceModel), categories: state.budgetCategories.map(budgetCategoryModel),
      holdings: state.holdings.map(holdingAsset), passiveAnnualCents: summary.totalEstimatedAnnualIncomeCents,
      sourcesAvailable: state.configured && state.incomeSourcesAvailable, categoriesAvailable: state.configured && state.budgetCategoriesAvailable,
      holdingsAvailable: state.configured && Boolean(state.account), passiveAvailable: state.configured && Boolean(state.account) && completeValuations && state.providerMetricsPending.size === 0,
      period,
    });
  }
  function planningValue(value) { return Number.isSafeInteger(value) ? (value % 100 === 0 ? currency : preciseCurrency).format(value / 100) : "Not set"; }
  function renderAllocation(selector) {
    const allocation = summarizeHoldingAllocation(state.holdings.map(holdingAsset));
    const node = $(selector);
    const coverage = allocation.unvaluedCount ? `${allocation.unvaluedCount} ${allocation.unvaluedCount === 1 ? "holding has" : "holdings have"} no valuation. Shares use valued investments only.` : "Shares of investment value. Property equity is separate.";
    node.innerHTML = allocation.rows.length ? `<div class="acadia-chart-list">${allocation.rows.map((row) => `<div class="acadia-card-progress"><div class="acadia-card-progress-heading"><span>${escapeHtml(row.name)}</span><span class="acadia-cluster">${escapeHtml(planningValue(row.valueCents))}<span>${percentage.format(row.allocationRate)}</span></span></div><progress value="${row.valueCents}" max="${allocation.totalValueCents}" aria-label="${escapeHtml(row.name)}: ${percentage.format(row.allocationRate)} of valued investments"></progress></div>`).join("")}</div><p class="acadia-text-muted">${coverage}</p>` : `<p class="acadia-text-muted">No investment value to allocate.${allocation.unvaluedCount ? ` ${coverage}` : ""}</p>`;
    return allocation;
  }
  function renderHomeGrowth(summary) {
    const missingValuations = summary.rows.length !== state.holdings.length;
    const available = state.configured && Boolean(state.account) && !missingValuations;
    const loading = available && state.providerMetricsPending.size > 0;
    const growth = available && !loading ? summary.totalEstimatedAnnualGrowthCents : null;
    setMovement("#home-growth-rate", growth !== null && summary.totalMarketValueCents > 0 ? growth / summary.totalMarketValueCents : null, displaySignedPercentage, { hideWhenUnavailable: true });
    setText("#home-growth", loading ? "Loading…" : growth === null ? "Unavailable" : displayCurrency(growth / 100));
    setText("#home-growth-context", !state.configured || !state.account ? "Portfolio data unavailable"
      : missingValuations ? "Incomplete valuation coverage"
      : loading ? "Loading historical returns…"
      : !state.holdings.length ? "Add investments to see an estimate"
      : growth === null ? "Historical returns unavailable for some assets"
      : "Based on historical returns · Not a forecast");
  }

  function renderHomeChanges(summary) {
    const complete = state.configured && Boolean(state.account) && summary.rows.length === state.holdings.length;
    const lifetime = summarizeAllTimeChange(state.snapshots, complete ? summary.totalMarketValueCents : null);
    setMovement("#all-time-change-value", lifetime.changeCents, displaySignedCurrency);
    setMovement("#all-time-change-rate", lifetime.changeRate, value => `(${percentage.format(Math.abs(value))})`, { hideWhenUnavailable: true });
    setText("#all-time-change-context", !complete ? "Complete investment values unavailable"
      : !lifetime.startDate ? "Awaiting first recorded value"
      : lifetime.changeRate === null ? "Percentage unavailable from $0" : "");
    $("#all-time-change-context").hidden = complete && Number.isFinite(lifetime.changeCents) && Number.isFinite(lifetime.changeRate);
    const dayCents = complete ? summary.totalDayChangeCents : null;
    const dayRate = complete ? summary.totalDayChangeRate : null;
    setMovement("#metric-change-value", dayCents, displaySignedCurrency);
    setMovement("#metric-change-rate", dayRate, value => `(${percentage.format(Math.abs(value))})`, { hideWhenUnavailable: true });
    setText("#day-change-context", !complete ? "Complete investment values unavailable"
      : dayCents === null ? "Previous close unavailable for some investments"
      : dayRate === null ? "Percentage unavailable from $0"
      : "");
    $("#day-change-context").hidden = complete && Number.isFinite(dayCents) && Number.isFinite(dayRate);
    for (const [selector, value] of [["#all-time-change-value", lifetime.changeCents], ["#metric-change-value", dayCents]]) {
      $(selector).title = value === null ? "Change unavailable" : `${value > 0 ? "+" : ""}${preciseCurrency.format(value / 100)}`;
    }
  }

  function renderHome(summary) {
    $("#home-workspace").hidden = false;
    $("#portfolio-workspace").hidden = true;
    $("#income-workspace").hidden = true;
    $("#plan-workspace").hidden = true;
    $("#asset-workspace").hidden = true;
    setActiveNavigation("home");
    const netWorthCents = currentNetWorthCents(summary);
    setText("#metric-value", netWorthCents === null ? "Not set" : displayCurrency(netWorthCents / 100));
    $("#metric-value").title = netWorthCents === null ? "Complete valuations are unavailable" : currency.format(netWorthCents / 100);
    const missingValuations = state.holdings.length - summary.rows.length;
    $("#home-valuation-status").hidden = netWorthCents !== null;
    setText("#home-valuation-status", missingValuations
      ? `${missingValuations} ${missingValuations === 1 ? "asset needs" : "assets need"} a valuation. Review Portfolio.`
      : !state.propertiesAvailable ? "Property values unavailable" : "Account values unavailable");
    const estimatesComplete = state.configured && Boolean(state.account) && summary.rows.length === state.holdings.length;
    const passive = estimatesComplete && state.providerMetricsPending.size === 0 ? summary.totalEstimatedAnnualIncomeCents : null;
    renderHomeGrowth(summary);
    setMovement("#home-passive-rate", passive !== null && summary.totalMarketValueCents > 0 ? passive / summary.totalMarketValueCents : null, value => percentage.format(value), { hideWhenUnavailable: true });
    setText("#home-passive-income", passive === null ? "Not set" : displayCurrency(passive / 100));
    setText("#home-passive-context", missingValuations ? "Incomplete valuation coverage" : state.providerMetricsPending.size ? "Loading dividend estimates…" : passive === null ? "Incomplete dividend coverage" : "Estimated from saved yields");
    renderHistory();
    renderHomeChanges(summary);
    setText("#portfolio-warnings", state.holdings.length ? summary.warnings.join(" ") : "");
    renderHoldings(summary);
  }

  function renderPortfolio(summary) {
    $("#home-workspace").hidden = true;
    $("#portfolio-workspace").hidden = false;
    $("#income-workspace").hidden = true;
    $("#plan-workspace").hidden = true;
    $("#asset-workspace").hidden = true;
    setActiveNavigation("portfolio");
    renderPortfolioSummary(summary);
    renderAllocation("#portfolio-allocation");
    renderPortfolioHoldings(summary);
    renderRecurringInvestments(summary);
    renderProperties();
  }

  function incomeSourceModel(source) {
    return {
      id: source.id,
      name: source.name,
      incomeType: source.income_type,
      amountCents: Number(source.amount_cents),
      frequency: source.frequency,
    };
  }
  function incomeTypeLabel(type) {
    return `${type.replace(/\b\w/g, (letter) => letter.toUpperCase())} income`;
  }
  function incomePeriodLabel() { return state.incomePeriod === "year" ? "year" : "month"; }
  function incomePeriodCents(annualCents) {
    return state.incomePeriod === "year" ? annualCents : Math.round(annualCents / 12);
  }
  function matchingIncomeDividendRows(summary) {
    const search = $("#income-dividends-search").value.trim().toLowerCase();
    return summary.rows.filter((row) => {
      if (row.asset.instrumentType === "crypto") return false;
      const searchable = `${row.asset.symbol || ""} ${row.asset.name || ""} ${row.asset.instrumentType}`.toLowerCase();
      return !search || searchable.includes(search);
    });
  }
  function sortedIncomeDividendRows(rows) {
    return [...rows].sort((left, right) => {
      if (state.incomeDividendSort === "name") {
        return `${left.asset.symbol || left.asset.name}`.localeCompare(`${right.asset.symbol || right.asset.name}`);
      }
      if (state.incomeDividendSort === "yield") {
        return (right.distributionYieldRate ?? -Infinity) - (left.distributionYieldRate ?? -Infinity);
      }
      return (right.estimatedAnnualIncomeCents ?? -Infinity) - (left.estimatedAnnualIncomeCents ?? -Infinity);
    });
  }
  function renderIncomeDividendSort() {
    const labels = { value: "Value", name: "Name", yield: "Yield" };
    setText("#income-dividend-sort-label", labels[state.incomeDividendSort]);
    document.querySelectorAll("[data-income-dividend-sort]").forEach((control) => {
      control.setAttribute("aria-pressed", String(control.dataset.incomeDividendSort === state.incomeDividendSort));
    });
  }
  function missingIncomeYieldRows(summary) {
    return summary.rows.filter((row) => row.asset.instrumentType !== "crypto"
      && row.estimatedAnnualIncomeCents === null && !state.providerMetricsPending.has(row.asset.id));
  }
  function renderIncomeRecovery(summary) {
    const valuedIds = new Set(summary.rows.map((row) => row.asset.id));
    const missing = state.holdings.filter((holding) => !valuedIds.has(holding.id));
    const unavailable = [];
    if (!state.incomeSourcesAvailable) unavailable.push("Income sources");
    if (!state.budgetCategoriesAvailable) unavailable.push("Budget categories");
    const canRecover = state.configured && Boolean(state.user) && Boolean(state.account);
    const retry = $("#income-retry-data");
    retry.hidden = !canRecover || unavailable.length === 0;
    retry.disabled = state.incomeReloadPending;
    retry.textContent = state.incomeReloadPending ? "Retrying…" : "Retry data";
    const review = $("#income-review-valuations");
    review.hidden = !canRecover || missing.length === 0;
    review.onclick = () => {
      if (missing.length) navigateToAsset(missing[0].id, { section: "valuation" });
    };
    $("#income-data-recovery").hidden = retry.hidden && review.hidden;
    const reasons = unavailable.map((label) => `${label} ${state.incomeReloadPending ? "loading" : state.incomeReloadFailed ? "still unavailable; try again" : "unavailable"}`);
    if (missing.length) reasons.push(`${missing.length} ${missing.length === 1 ? "holding needs" : "holdings need"} a valuation`);
    if (state.providerMetricsPending.size) reasons.push("Dividend data loading");
    else if (missingIncomeYieldRows(summary).length) reasons.push("Dividend yields need review");
    return reasons.join(" · ") || "Complete income and allocation data is needed";
  }

  async function retryIncomeData() {
    if (state.incomeReloadPending || !state.configured || !state.user || !state.account || hasPendingWrite()) return;
    const collections = [
      ["income_sources", "incomeSources", "incomeSourcesAvailable"],
      ["budget_categories", "budgetCategories", "budgetCategoriesAvailable"],
    ].filter(([, , available]) => !state[available]);
    if (!collections.length) return;
    const account = state.account;
    const user = state.user;
    const client = state.client;
    const startedOnRetry = document.activeElement === $("#income-retry-data");
    state.incomeReloadPending = true;
    state.incomeReloadFailed = false;
    render();
    try {
      const results = await Promise.allSettled(collections.map(async ([table]) => {
        let timer;
        try {
          return await Promise.race([
            client.from(table).select("*").eq("account_id", account.id).order("created_at"),
            new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Read timed out")), 10000); }),
          ]);
        } finally { clearTimeout(timer); }
      }));
      // A late response must never populate a different or signed-out account.
      if (state.account !== account || state.user !== user || state.client !== client) return;
      results.forEach((result, index) => {
        const [, records, available] = collections[index];
        if (result.status === "fulfilled" && !result.value.error && Array.isArray(result.value.data)) {
          state[records] = result.value.data;
          state[available] = true;
        } else state.incomeReloadFailed = true;
      });
    } finally {
      const restoreFocus = document.activeElement === $("#income-retry-data") || (startedOnRetry && document.activeElement === document.body);
      state.incomeReloadPending = false;
      render();
      if (restoreFocus && routeIncome() && state.user === user && state.account === account) {
        $($("#income-retry-data").hidden ? "#income-summary" : "#income-retry-data").focus();
      }
    }
  }

  function renderIncomeYieldRecovery(summary) {
    const rows = missingIncomeYieldRows(summary);
    $("#income-yield-recovery").hidden = rows.length === 0;
    $("#income-review-yields").hidden = rows.length === 0;
    setText("#income-yield-recovery-copy", `${rows.length} ${rows.length === 1 ? "holding needs" : "holdings need"} a dividend yield.`);
    $("#income-review-yields").onclick = () => {
      if (rows.length) navigateToAsset(rows[0].asset.id, { section: "yield" });
    };
  }
  function renderIncomeDividends(summary) {
    renderIncomeDividendSort();
    const matchingRows = matchingIncomeDividendRows(summary);
    const rows = sortedIncomeDividendRows(matchingRows);
    const grid = $("#income-dividends-grid");
    grid.replaceChildren(...rows.map((row) => {
      const isLoading = state.providerMetricsPending.has(row.asset.id);
      const annualCents = row.estimatedAnnualIncomeCents;
      const amount = Number.isSafeInteger(annualCents)
        ? displayCurrency(annualCents / 100)
        : isLoading ? "Loading…" : "Not set";
      const yieldRate = row.distributionYieldRate;
      const yieldDisplay = Number.isFinite(yieldRate) ? percentage.format(yieldRate) : isLoading ? "Loading yield…" : "Yield not set";
      const card = document.createElement("article");
      card.className = "acadia-object-card-header";
      card.setAttribute("role", "listitem");
      card.innerHTML = `<div class="acadia-cluster"><strong title="${escapeHtml(row.asset.name)}">${escapeHtml(row.asset.symbol || row.asset.name)}</strong><strong style="color: var(--acadia-color-brand)" title="${Number.isSafeInteger(annualCents) ? escapeHtml(preciseCurrency.format(annualCents / 100)) : amount}">${amount}</strong><small class="acadia-text-muted">${yieldDisplay}</small></div><details class="acadia-action-menu"><summary class="acadia-icon-action" style="--acadia-icon-action-size: var(--acadia-target-size-touch)" data-income-dividend-id="${escapeHtml(row.asset.id)}" aria-label="Actions for ${escapeHtml(row.asset.symbol || row.asset.name)}"><i class="fa-solid fa-ellipsis acadia-icon" aria-hidden="true"></i></summary><div class="acadia-action-menu-panel"><button class="acadia-button acadia-button-quiet" type="button" data-open-dividend-asset>View asset</button></div></details>`;
      card.querySelector('[data-open-dividend-asset]').addEventListener("click", () => navigateToAsset(row.asset.id));
      if (annualCents === null && !isLoading) {
        card.classList.add("acadia-cluster");
        const action = document.createElement("button");
        action.type = "button";
        action.className = "acadia-button acadia-button-quiet";
        action.dataset.reviewIncomeYield = row.asset.id;
        action.textContent = "Set yield";
        action.setAttribute("aria-label", `Set dividend yield for ${row.asset.symbol || row.asset.name}`);
        action.addEventListener("click", () => navigateToAsset(row.asset.id, { section: "yield" }));
        card.append(action);
      }
      return card;
    }));
    setText("#income-dividends-count", `${matchingRows.length} ${matchingRows.length === 1 ? "asset" : "assets"}`);
    $("#income-dividends-empty").hidden = rows.length > 0;
    $("#income-dividends-records").hidden = rows.length === 0;
    $("#income-dividends-clear").hidden = rows.length > 0 || !$("#income-dividends-search").value.trim();
    if (!rows.length) {
      const hasEligible = summary.rows.some((row) => row.asset.instrumentType !== "crypto");
      $("#income-dividends-empty").querySelector("strong").textContent = hasEligible ? "No matching dividend sources" : "No dividend sources";
      $("#income-dividends-empty").querySelector("p").textContent = hasEligible ? "Try another search or clear it to see all sources." : "Add holdings with dividend data in Portfolio.";
    }
  }
  function matchingIncomeSources(rows) {
    const search = $("#income-sources-search").value.trim().toLowerCase();
    return rows.filter((row) => !search || `${row.source.name} ${row.source.incomeType}`.toLowerCase().includes(search));
  }
  const incomeSourceCards = new Map();
  const incomeSourceDrafts = new Map();
  let incomeEditorContext = null;
  function clearIncomeEditors() {
    incomeSourceDrafts.clear();
    incomeSourceCards.clear();
    incomeEditorContext = null;
  }
  function ensureIncomeEditorContext() {
    if (incomeEditorContext && !incomeEditorContext()) clearIncomeEditors();
    if (!incomeEditorContext) incomeEditorContext = accountContext();
  }
  function editIncomeSource(id, amount, frequency) {
    ensureIncomeEditorContext();
    const source = state.incomeSources.find(source => source.id === id);
    if (!source || incomeSourceDrafts.get(id)?.pending) return;
    const draft = incomeSourceDrafts.get(id) || { baseline: { ...source } };
    draft.amount = amount;
    draft.frequency = frequency;
    draft.status = "";
    if (cents(amount) === Number(draft.baseline.amount_cents) && frequency === draft.baseline.frequency) incomeSourceDrafts.delete(id);
    else incomeSourceDrafts.set(id, draft);
    syncIncomeSourceCard(id);
  }
  function syncIncomeSourceCard(id) {
    const card = incomeSourceCards.get(id);
    const source = state.incomeSources.find(source => source.id === id);
    if (!card || !source) return;
    const draft = incomeSourceDrafts.get(id);
    const amount = card.querySelector('[name="amount"]');
    const frequency = card.querySelector('[name="frequency"]');
    // Preserve the actual input nodes, value and caret during background renders.
    if (!draft) {
      amount.value = (Number(source.amount_cents) / 100).toFixed(2);
      frequency.value = source.frequency;
    }
    card.querySelector('[data-income-name]').textContent = source.name;
    card.querySelector('[data-income-type]').textContent = incomeTypeLabel(source.income_type);
    const annual = cents(draft ? draft.amount : amount.value) * (INCOME_FREQUENCIES[draft?.frequency || source.frequency]?.periodsPerYear || 0);
    card.querySelector('[data-income-annual]').textContent = Number.isSafeInteger(annual) && annual > 0 ? currency.format(annual / 100) : "—";
    card.querySelector('[data-income-preview-label]').textContent = draft ? "Planned income · Unsaved" : "Planned income";
    card.querySelector('[data-income-actions]').hidden = !draft;
    const status = card.querySelector('[data-income-status]');
    status.textContent = draft?.pending ? "Saving… Please wait before leaving." : draft?.status || "";
    status.hidden = !status.textContent;
    card.querySelectorAll('input, select, button').forEach(control => { control.disabled = Boolean(draft?.pending); });
    card.querySelector('[type="submit"]').textContent = draft?.pending ? "Saving…" : "Save";
    card.setAttribute("aria-busy", String(Boolean(draft?.pending)));
  }
  async function saveInlineIncomeSource(id) {
    if (hasPendingWrite() || !state.user || !state.account) return;
    const draft = incomeSourceDrafts.get(id);
    if (!draft) return;
    const current = accountContext();
    const { client, account } = state;
    try {
      const normalized = normalizeIncomeSource({ ...incomeSourceModel(draft.baseline), amountCents: cents(draft.amount), frequency: draft.frequency });
      draft.pending = true;
      draft.status = "";
      syncIncomeSourceCard(id);
      const { data, error } = await readWithDeadline(signal => client.from("income_sources")
        .update({ amount_cents: normalized.amountCents, frequency: normalized.frequency })
        .eq("id", id).eq("account_id", account.id)
        .eq("amount_cents", draft.baseline.amount_cents).eq("frequency", draft.baseline.frequency)
        .eq("name", draft.baseline.name).eq("income_type", draft.baseline.income_type)
        .select().maybeSingle().abortSignal(signal));
      if (!current() || incomeSourceDrafts.get(id) !== draft) return;
      if (error) throw error;
      if (!data) {
        const latest = await readWithDeadline(signal => client.from("income_sources").select("*").eq("id", id).eq("account_id", account.id).maybeSingle().abortSignal(signal));
        if (!current() || incomeSourceDrafts.get(id) !== draft) return;
        if (!latest.error && latest.data) {
          state.incomeSources = state.incomeSources.map(source => source.id === id ? latest.data : source);
          render();
        }
        throw new Error("This source changed or was removed elsewhere. Your draft is unchanged. Cancel to review the saved values, or reload if it was removed.");
      }
      state.incomeSources = state.incomeSources.map(source => source.id === id ? data : source);
      incomeSourceDrafts.delete(id);
      render();
      const card = incomeSourceCards.get(id);
      if (card) {
        card.querySelector('[data-income-status]').textContent = "Saved";
        card.querySelector('[data-income-status]').hidden = false;
        card.querySelector('[name="amount"]').focus();
      }
    } catch (error) {
      if (!current() || incomeSourceDrafts.get(id) !== draft) return;
      draft.status = error.message === "Read timed out"
        ? "Saving could not be confirmed. Your draft is unchanged. Try Save again to check it."
        : error.message || "This income source could not be saved. Try again.";
    } finally {
      draft.pending = false;
      if (current() && incomeSourceDrafts.get(id) === draft) syncIncomeSourceCard(id);
    }
  }
  function cancelInlineIncomeSource(id) {
    if (incomeSourceDrafts.get(id)?.pending) return;
    incomeSourceDrafts.delete(id);
    render();
    incomeSourceCards.get(id)?.querySelector('[name="amount"]').focus();
  }
  function renderIncomeSources(incomeSummary) {
    ensureIncomeEditorContext();
    const matchingRows = matchingIncomeSources(incomeSummary.rows);
    const grid = $("#income-sources-grid");
    for (const id of incomeSourceCards.keys()) {
      if (!state.incomeSources.some(source => source.id === id) && !incomeSourceDrafts.has(id)) incomeSourceCards.delete(id);
    }
    const cards = matchingRows.map(({ source }) => {
      if (!incomeSourceCards.has(source.id)) {
        const card = document.createElement("article");
        card.className = "acadia-card is-content";
        card.setAttribute("role", "listitem");
        const id = escapeHtml(source.id);
        card.innerHTML = `<form class="acadia-stack" aria-label="Income from ${escapeHtml(source.name)}">
          <div class="acadia-cluster" style="justify-content: space-between"><div class="acadia-field" style="min-width: min(100%, 10rem); flex: 1"><strong class="acadia-lead" data-income-name></strong><small class="acadia-text-muted" data-income-type></small></div><details class="acadia-action-menu"><summary class="acadia-icon-action" style="--acadia-icon-action-size: var(--acadia-target-size-touch)" aria-label="Actions for ${escapeHtml(source.name)}"><i class="fa-solid fa-ellipsis acadia-icon" aria-hidden="true"></i></summary><div class="acadia-action-menu-panel"><button class="acadia-button acadia-button-quiet" type="button" data-edit-income-source="${id}" aria-label="Edit ${escapeHtml(source.name)}">Edit details</button><button class="acadia-button acadia-button-quiet" type="button" data-delete-income-source="${id}" aria-label="Delete ${escapeHtml(source.name)}">Delete source</button></div></details></div>
          <div class="acadia-grid"><div class="acadia-form-control" data-acadia-form-variant="input"><label class="acadia-label" for="income-amount-${id}">Amount (USD)</label><input id="income-amount-${id}" class="acadia-control" name="amount" type="number" min="0.01" step="0.01" required style="min-height: var(--acadia-target-size-touch)"></div><div class="acadia-form-control" data-acadia-form-variant="select"><label class="acadia-label" for="income-frequency-${id}">Frequency</label><select id="income-frequency-${id}" class="acadia-control" name="frequency" style="min-height: var(--acadia-target-size-touch)">${Object.entries(INCOME_FREQUENCIES).map(([value, frequency]) => `<option value="${value}">${frequency.label}</option>`).join("")}</select></div></div>
          <div class="acadia-field"><span class="acadia-text-muted" data-income-preview-label>Planned income</span><div class="acadia-cluster"><strong class="acadia-lead" data-income-annual></strong><span class="acadia-text-muted">per year</span></div></div>
          <div class="acadia-cluster" data-income-actions hidden><button class="acadia-button acadia-button-secondary" type="button" data-income-cancel>Cancel</button><button class="acadia-button acadia-button-primary" type="submit">Save</button></div>
          <small class="acadia-field-hint" data-income-status role="status" aria-live="polite"></small>
        </form>`;
        const form = card.querySelector('form');
        const update = () => editIncomeSource(source.id, card.querySelector('[name="amount"]').value, card.querySelector('[name="frequency"]').value);
        form.addEventListener("input", update);
        form.addEventListener("change", update);
        form.addEventListener("submit", event => { event.preventDefault(); saveInlineIncomeSource(source.id); });
        card.querySelector('[data-income-cancel]').addEventListener("click", () => cancelInlineIncomeSource(source.id));
        card.querySelector('[data-edit-income-source]').addEventListener("click", () => leaveWorkspace(() => openIncomeSourceDialog(source.id)));
        card.querySelector('[data-delete-income-source]').addEventListener("click", () => leaveWorkspace(() => openDeleteIncomeSourceDialog(source.id)));
        incomeSourceCards.set(source.id, card);
      }
      syncIncomeSourceCard(source.id);
      return incomeSourceCards.get(source.id);
    });
    const existing = Array.from(grid.children || []);
    if (cards.length !== existing.length || cards.some((card, index) => card !== existing[index])) grid.replaceChildren(...cards);
    setText("#income-sources-count", `${matchingRows.length} ${matchingRows.length === 1 ? "source" : "sources"}`);
    $("#income-sources-empty").hidden = matchingRows.length > 0;
    $("#income-sources-clear").hidden = matchingRows.length > 0 || !$("#income-sources-search").value.trim();
    if (!matchingRows.length) {
      const title = $("#income-sources-empty").querySelector("strong");
      const copy = $("#income-sources-empty").querySelector("p");
      title.textContent = !state.incomeSourcesAvailable
        ? "Income sources are unavailable"
        : state.incomeSources.length ? "No matching income sources" : "No income sources yet";
      copy.textContent = !state.incomeSourcesAvailable
        ? (state.configured ? "Saved income sources could not be loaded. Use Retry data above." : "Private sync is not configured.")
        : state.incomeSources.length ? "Try another search or clear it to see all sources." : "Add expected recurring income to your plan.";
    }
  }
  function budgetCategoryModel(category) {
    return {
      id: category.id,
      name: category.name,
      monthlyAmountCents: Number(category.monthly_amount_cents),
    };
  }
  function assertBudgetCategoryNameAvailable(category, currentId = null) {
    const key = category.name.toLocaleLowerCase("en-US");
    const duplicate = state.budgetCategories.some((entry) => (
      entry.id !== currentId && entry.name.trim().toLocaleLowerCase("en-US") === key
    ));
    if (duplicate) throw new Error("Category names must be unique.");
  }
  function matchingBudgetCategories(rows) {
    const search = $("#income-budget-search").value.trim().toLowerCase();
    return rows.filter((row) => !search || row.category.name.toLowerCase().includes(search));
  }
  function renderBudgetCategories(budgetSummary) {
    const matchingRows = matchingBudgetCategories(budgetSummary.rows);
    const list = $("#income-budget-list");
    const cards = $("#income-budget-cards");
    const actions = (category) => `<span class="acadia-row-actions"><button class="acadia-button acadia-button-quiet" type="button" data-edit-budget-category="${escapeHtml(category.id)}" aria-label="Edit ${escapeHtml(category.name)}">Edit</button><button class="acadia-icon-action" style="--acadia-icon-action-size: var(--acadia-target-size-touch)" type="button" data-delete-budget-category="${escapeHtml(category.id)}" aria-label="Delete ${escapeHtml(category.name)}"><i class="fa-solid fa-trash acadia-icon" aria-hidden="true"></i></button></span>`;
    list.replaceChildren(...matchingRows.map((row) => {
      const category = row.category;
      const item = document.createElement("tr");
      item.innerHTML = `<th scope="row">${escapeHtml(category.name)}</th><td>${planningValue(category.monthlyAmountCents)}</td><td>${percentage.format(row.allocationRate)}</td><td>${actions(category)}</td>`;
      return item;
    }));
    cards.replaceChildren(...matchingRows.map((row) => {
      const category = row.category;
      const card = document.createElement("article");
      card.className = "acadia-object-card acadia-stack";
      card.setAttribute("aria-label", category.name);
      card.innerHTML = `<strong>${escapeHtml(category.name)}</strong><div class="acadia-grid"><div class="acadia-field"><span class="acadia-text-muted">Monthly amount</span><strong>${planningValue(category.monthlyAmountCents)}</strong></div><div class="acadia-field"><span class="acadia-text-muted">Share</span><strong>${percentage.format(row.allocationRate)}</strong></div></div>${actions(category)}`;
      return card;
    }));
    [list, cards].forEach((container) => {
      container.querySelectorAll("[data-edit-budget-category]").forEach((control) => control.addEventListener("click", () => openBudgetCategoryDialog(control.dataset.editBudgetCategory)));
      container.querySelectorAll("[data-delete-budget-category]").forEach((control) => control.addEventListener("click", () => openDeleteBudgetCategoryDialog(control.dataset.deleteBudgetCategory)));
    });
    setText("#income-budget-count", `${matchingRows.length} ${matchingRows.length === 1 ? "category" : "categories"}`);
    $("#income-budget-empty").hidden = matchingRows.length > 0;
    $("#income-budget-clear").hidden = matchingRows.length > 0 || !$("#income-budget-search").value.trim();
    $("#income-budget-results").hidden = matchingRows.length === 0;
    if (!matchingRows.length) {
      const title = $("#income-budget-empty").querySelector("strong");
      const copy = $("#income-budget-empty").querySelector("p");
      title.textContent = !state.budgetCategoriesAvailable
        ? "Budget categories are unavailable"
        : state.budgetCategories.length ? "No matching budget categories" : "No budget categories yet";
      copy.textContent = !state.budgetCategoriesAvailable
        ? (state.configured ? "Saved budget categories could not be loaded. Use Retry data above." : "Private sync is not configured.")
        : state.budgetCategories.length ? "Try another search or clear it to see all categories." : "Add monthly category limits to your spending plan.";
    }
  }
  function renderIncome(summary) {
    $("#home-workspace").hidden = true;
    $("#portfolio-workspace").hidden = true;
    $("#income-workspace").hidden = false;
    $("#plan-workspace").hidden = true;
    $("#asset-workspace").hidden = true;
    setActiveNavigation("income");
    const view = window.location.hash === "#income/budget" ? "budget" : "overview";
    $("#add-income").hidden = view !== "overview";
    $("#add-budget-category").hidden = view !== "budget";
    document.querySelectorAll("[data-income-view]").forEach((control) => {
      const active = control.dataset.incomeView === view;
      control.classList.toggle("is-active", active);
      control.setAttribute("aria-selected", String(active)); control.tabIndex = active ? 0 : -1;
      $(`#income-${control.dataset.incomeView}-panel`).hidden = !active;
    });
    document.querySelectorAll("[data-income-period]").forEach((control) => {
      const active = control.dataset.incomePeriod === state.incomePeriod;
      control.classList.toggle("is-active", active);
      control.setAttribute("aria-selected", String(active)); control.tabIndex = active ? 0 : -1;
      if (active) $("#income-summary").setAttribute("aria-labelledby", control.id);
    });
    const planning = planningPosition(summary, state.incomePeriod);
    for (const [id, key] of [["total", "expectedCents"], ["earned", "recurringCents"], ["passive", "passiveCents"], ["expenses", "spendingCents"], ["investing", "investingCents"], ["balance", "balanceCents"]]) setText(`#income-${id}`, planningValue(planning[key]));
    for (const [id, value] of [["balance", planning.balanceCents], ["earned", planning.recurringCents], ["passive", planning.passiveCents], ["expenses", planning.spendingCents === null ? null : planning.spendingCents === 0 ? 0 : -planning.spendingCents]]) {
      setText(`#income-${id}`, value === null ? "Not set" : displayCurrency(value / 100));
      $(`#income-${id}`).setAttribute("title", value === null ? "Not set" : preciseCurrency.format(value / 100));
    }
    setText("#income-balance-period", `/ ${incomePeriodLabel()}`);
    const recoveryMessage = renderIncomeRecovery(summary);
    renderIncomeYieldRecovery(summary);
    setText("#income-balance-status", planning.balanceCents === null ? recoveryMessage : planning.balanceCents < 0 ? "Planned allocations exceed expected income" : planning.balanceCents === 0 ? (planning.expectedCents === 0 && planning.spendingCents === 0 && planning.investingCents === 0 ? "Add income to start your plan" : "Expected income is fully allocated") : "After planned spending and investing");
    renderIncomeDividends(summary);
    renderIncomeSources(summarizeIncomeSources(state.incomeSources.map(incomeSourceModel), state.incomePeriod));
    renderBudgetCategories(summarizeBudgetCategories(state.budgetCategories.map(budgetCategoryModel), state.incomePeriod));
  }

  function planSettingsModel(settings) {
    return settings ? {
      id: settings.id,
      accountId: settings.account_id,
      expectedAnnualReturnRate: settings.expected_annual_return_rate === null ? null : Number(settings.expected_annual_return_rate),
      distributionYieldRate: settings.distribution_yield_rate === null ? null : Number(settings.distribution_yield_rate),
      distributionPolicy: settings.distribution_policy,
    } : null;
  }
  const scenarioColumns = { dateOfBirth: "date_of_birth", stopInvestingAge: "stop_investing_age", retirementAge: "retirement_age", weeklyExpensesCents: "weekly_expenses_cents", weeklyInvestmentCents: "weekly_investment_cents", annualIncomeCents: "annual_income_cents" };
  const scenarioControls = { weeklyExpensesCents: "#plan-weekly-expenses", weeklyInvestmentCents: "#plan-weekly-investments", stopInvestingAge: "#plan-stop-age", annualIncomeCents: "#plan-income", retirementAge: "#plan-retirement-age" };
  let planDraft = null;
  let planIncomeCadence = 52;
  function planScenarioModel(record = state.planSettings) {
    return Object.fromEntries(Object.entries(scenarioColumns).map(([key, column]) => [key, record?.[column] == null ? null : key === "dateOfBirth" ? record[column] : Number(record[column])]));
  }
  function currentPlanAge(scenario) {
    return ageOnDate(scenario.dateOfBirth);
  }
  function planProjection(summary) {
    const settings = planSettingsModel(state.planSettings);
    const assumptions = resolvePlanAssumptions(settings || {}, summary);
    const annualContributionCents = annualRecurringContributionCents(state.holdings.map(holding => ({ contributionCents: holding.contribution_cents == null ? null : Number(holding.contribution_cents), contributionFrequency: holding.contribution_frequency })), { legacyWeeklyContributionCents: Number(state.account?.weekly_contribution_cents || 0), legacyWeeklyAllocationRate: summary.weeklyContributionRate });
    const sourceIncome = summarizeIncomeSources(state.incomeSources.map(incomeSourceModel), "year");
    const annualExpensesCents = summarizeBudgetCategories(state.budgetCategories.map(budgetCategoryModel), "year").totalPeriodAmountCents;
    const sourceContinuing = sourceIncome.rows.filter(row => ["benefits", "other"].includes(row.source.incomeType)).reduce((sum, row) => sum + row.annualIncomeCents, 0);
    const scenario = planDraft?.scenario || planScenarioModel();
    const amounts = { annualContributionCents: scenario.weeklyInvestmentCents === null ? annualContributionCents : scenario.weeklyInvestmentCents * 52,
      annualExpensesCents: scenario.weeklyExpensesCents === null ? annualExpensesCents : scenario.weeklyExpensesCents * 52,
      annualIncomeCents: scenario.annualIncomeCents === null ? sourceIncome.totalAnnualIncomeCents : scenario.annualIncomeCents };
    amounts.continuingIncomeCents = sourceIncome.totalAnnualIncomeCents ? Math.round(amounts.annualIncomeCents * sourceContinuing / sourceIncome.totalAnnualIncomeCents) : 0;
    let projection;
    try {
      if (planDraft?.invalid) throw new Error(planDraft.invalid);
      normalizePlanScenario(scenario);
      projection = projectLifePlan({ currentValueCents: summary.totalMarketValueCents, ...amounts, ...assumptions, horizonYears: state.planHorizon,
        dateOfBirth: scenario.dateOfBirth, stopInvestingAge: scenario.stopInvestingAge, retirementAge: scenario.retirementAge });
      projection = includePropertyInProjection(projection, state.properties.map(propertyModel));
    } catch (error) {
      projection = { available: false, points: [], reason: error.message };
    }
    return { assumptions, scenario, amounts, annualContributionCents, projection };
  }
  function beginPlanDraft() {
    if (!planDraft) planDraft = { scenario: planScenarioModel(), baseline: state.planSettings ? { ...state.planSettings } : null, current: accountContext(), pending: false, status: "Unsaved Plan changes", invalid: "", raw: {} };
    return planDraft;
  }
  function editPlanScenario(key, value, valid = true) {
    if (!state.planDataAvailable || planDraft?.pending || !state.account) return;
    const draft = beginPlanDraft();
    draft.raw[key] = { value, valid };
    draft.invalid = "";
    for (const [field, raw] of Object.entries(draft.raw)) {
      if (!raw.valid || (raw.value !== "" && !Number.isFinite(Number(raw.value)))) { draft.invalid = "Enter valid amounts and whole ages to preview your Plan."; continue; }
      draft.scenario[field] = raw.value === "" ? null : field.endsWith("Cents") ? Math.round(Number(raw.value) * 100) * (field === "annualIncomeCents" ? planIncomeCadence : 1) : Number(raw.value);
    }
    draft.status = "Unsaved Plan changes";
    renderPlan(portfolio());
  }
  async function savePlanScenario(event) {
    event.preventDefault();
    const draft = planDraft;
    if (!draft || draft.pending || !draft.current()) return;
    try {
      if (draft.invalid) throw new Error(draft.invalid);
      const scenario = normalizePlanScenario(draft.scenario);
      const payload = Object.fromEntries(Object.entries(scenarioColumns).map(([key, column]) => [column, scenario[key]]));
      payload.account_id = state.account.id;
      if (draft.baseline && !draft.baseline.updated_at) throw new Error("Reload Plan before saving. Your draft has not been saved.");
      draft.pending = true; draft.status = "Saving… Please wait before leaving."; renderPlan(portfolio());
      const { client, account } = state;
      const result = await readWithDeadline(signal => {
        const query = draft.baseline ? client.from("plan_settings").update(payload).eq("account_id", account.id).eq("id", draft.baseline.id).eq("updated_at", draft.baseline.updated_at) : client.from("plan_settings").insert(payload);
        return query.select().maybeSingle().abortSignal(signal);
      });
      if (!draft.current() || planDraft !== draft) return;
      if (result.error?.code === "23505" || (!result.error && !result.data)) {
        const latest = await readWithDeadline(signal => client.from("plan_settings").select("*").eq("account_id", account.id).maybeSingle().abortSignal(signal));
        if (!draft.current() || planDraft !== draft) return;
        if (latest.error) throw new Error("Settings changed elsewhere. Latest settings could not be loaded. Try Save again to retry; your draft is retained.");
        state.planSettings = latest.data;
        throw new Error("Settings changed elsewhere. Cancel to review the latest settings before editing again. Your draft has not been saved.");
      }
      if (result.error) throw result.error;
      state.planSettings = result.data;
      planDraft = null;
      renderPlan(portfolio());
      setText("#plan-recovery-status", "Plan saved");
      $("#plan-weekly-expenses").focus();
    } catch (error) {
      if (draft.current() && planDraft === draft) draft.status = error.message === "Read timed out" ? "Saving could not be confirmed. Your draft is retained. Retry Save or reload to check the saved Plan." : error.message || "Plan could not be saved. Try again.";
    } finally {
      if (draft.current() && planDraft === draft) { draft.pending = false; renderPlan(portfolio()); }
    }
  }

  function policyLabel(value) {
    return ({
      reinvest: "Reinvest",
      "transfer-to-bank": "Transfer to bank",
      "transfer-to-fund": "Transfer to fund",
      "hold-cash": "Hold cash",
    })[value] || "Reinvest";
  }
  function renderPlanChart(points, selectedYear, unavailableText) {
    const chart = $("#plan-value-chart");
    if (!points.length) { chart.innerHTML = ""; chart.setAttribute("aria-label", unavailableText); setText("#plan-value-summary", unavailableText); return; }
    const values = points.map(point => point.totalValueCents);
    const min = Math.min(...values), max = Math.max(...values), range = max - min;
    const geometry = values.map((value, index) => ({ x: index / (values.length - 1) * 1000, y: range ? 92 - (value - min) / range * 80 : 50 }));
    const line = buildCardTrendPath(geometry);
    const selected = geometry[selectedYear * 12];
    chart.innerHTML = `<svg class="acadia-card-trend-chart is-primary" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><polyline class="acadia-card-trend-baseline" points="0,${geometry[0].y} 1000,${geometry[0].y}"></polyline><path class="acadia-card-trend-area" d="${line} L 1000 100 L 0 100 Z"></path><path class="acadia-card-trend-line" d="${line}"></path><line class="acadia-card-trend-baseline" x1="${selected.x}" x2="${selected.x}" y1="0" y2="100"></line></svg>`;
    const description = `Illustrative net worth (investments and property equity): ${preciseCurrency.format(values[0] / 100)} now; ${preciseCurrency.format(values[selectedYear * 12] / 100)} in year ${selectedYear}; ${preciseCurrency.format(values.at(-1) / 100)} in year ${state.planHorizon}.`;
    chart.setAttribute("aria-label", description); setText("#plan-value-summary", description);
  }
  function renderPlanAssets(summary) {
    const rows = portfolioHoldingRows(summary);
    const cards = summarizeInvestmentGroups(rows).filter(group => group.id !== "all").sort((a, b) => ["brokerage", "crypto", "retirement"].indexOf(a.id) - ["brokerage", "crypto", "retirement"].indexOf(b.id));
    $("#plan-asset-groups").innerHTML = cards.map(group => {
      const members = rows.filter(row => investmentGroup(row.asset) === group.id);
      const returns = resolvePlanAssumptions({}, { rows: members, totalMarketValueCents: group.valueCents }).expectedAnnualReturnRate;
      const yieldKnown = group.valueCents > 0 && members.every(row => Number.isFinite(row.asset.distributionYieldRate));
      const yieldRate = yieldKnown ? members.reduce((sum, row) => sum + row.marketValueCents * row.asset.distributionYieldRate, 0) / group.valueCents : null;
      return `<article class="acadia-card is-content"><div class="acadia-card-header"><div class="acadia-page-header-pattern-actions"><h3 class="acadia-lead">${group.name}</h3><a class="acadia-icon-action" href="#portfolio" data-plan-group="${group.id}" aria-label="View ${group.name} assets"><i class="fa-solid fa-chevron-right acadia-icon" aria-hidden="true"></i></a></div><span class="acadia-text-muted">${group.valueCents === null ? "Not set" : displayCurrency(group.valueCents / 100)}</span></div><strong style="color: var(--acadia-color-brand)">${group.count} ${group.count === 1 ? "asset" : "assets"}</strong><div class="acadia-cluster"><span title="Annual return assumption"><i class="fa-solid fa-chart-line acadia-icon" aria-hidden="true"></i> <span class="acadia-sr-only">Annual return: </span>${group.count && group.missingCount === 0 && Number.isFinite(returns) ? percentage.format(returns) : "Not set"}</span><span title="Distribution yield"><i class="fa-solid fa-coins acadia-icon" aria-hidden="true"></i> <span class="acadia-sr-only">Distribution yield: </span>${yieldRate === null ? "Not set" : percentage.format(yieldRate)}</span></div></article>`;
    }).join("");
    const count = state.properties.length;
    const properties = state.properties.map(propertyModel);
    const propertyTotal = properties.reduce((sum, property) => sum + property.currentValueCents, 0);
    const appreciation = propertyTotal > 0 && properties.every(property => propertyAppreciation(property).rate !== null) ? properties.reduce((sum, property) => sum + property.currentValueCents * propertyAppreciation(property).rate, 0) / propertyTotal : null;
    $("#plan-property-summary").innerHTML = `<article class="acadia-card is-content"><div class="acadia-card-header"><div class="acadia-page-header-pattern-actions"><h3 class="acadia-lead">Property</h3><a class="acadia-icon-action" href="#portfolio" aria-label="View properties"><i class="fa-solid fa-chevron-right acadia-icon" aria-hidden="true"></i></a></div><span class="acadia-text-muted">${state.propertiesAvailable ? displayCurrency(totalPropertyEquity() / 100) : "Unavailable"}</span></div><strong style="color: var(--acadia-color-brand)">${state.propertiesAvailable ? `${count} ${count === 1 ? "property" : "properties"}` : "Review Portfolio to retry"}</strong><span title="Annual appreciation assumption"><i class="fa-solid fa-chart-line acadia-icon" aria-hidden="true"></i> <span class="acadia-sr-only">Annual appreciation: </span>${appreciation === null ? "Not set" : percentage.format(appreciation)} annual appreciation</span><small class="acadia-text-muted">${properties.map(property => escapeHtml(`${property.name}: ${propertyAppreciation(property).source}`)).join("<br>")}</small></article>`;
    document.querySelectorAll("[data-plan-group]").forEach(link => link.addEventListener("click", () => { state.portfolioFilter = link.dataset.planGroup; }));
  }
  function renderPlan(summary) {
    if (planDraft && !planDraft.current()) planDraft = null;
    ["home", "portfolio", "income", "asset"].forEach(name => { $(`#${name}-workspace`).hidden = true; });
    $("#plan-workspace").hidden = false;
    setActiveNavigation("plan");
    const plan = planProjection(summary);
    const { assumptions, projection, amounts, scenario } = plan;
    const missingValuations = state.holdings.length - summary.rows.length;
    const valuationComplete = missingValuations === 0;
    const cashflowAvailable = state.incomeSourcesAvailable && state.budgetCategoriesAvailable;
    const ready = state.planDataAvailable && state.propertiesAvailable && valuationComplete && cashflowAvailable && projection.available;
    const points = ready ? projection.points : [];
    const year = Math.min(state.planHorizon, state.planSelectedYear);
    const selected = points[year * 12];
    const metricsLoading = state.providerMetricsPending.size > 0;
    const missingReturn = !Number.isFinite(assumptions.expectedAnnualReturnRate), missingYield = !Number.isFinite(assumptions.distributionYieldRate);
    const unavailableText = !state.planDataAvailable ? "Your saved settings could not be loaded. Retry to restore your outlook."
      : !state.propertiesAvailable ? "Properties could not be loaded. Review Portfolio and retry properties."
      : !valuationComplete ? `${missingValuations} ${missingValuations === 1 ? "asset needs" : "assets need"} a valuation before an outlook can be calculated.`
        : !cashflowAvailable ? "Income or expenses could not be loaded. Review Income and retry your data."
          : projection.reason || (metricsLoading && !projection.available ? "Loading current portfolio metrics…" : missingReturn && missingYield ? "Return and dividend data are missing for some holdings. Review Portfolio to complete coverage." : missingReturn ? "Annual return data is missing for some holdings. Review Portfolio to complete coverage." : "Dividend data is missing for some holdings. Review Portfolio to complete coverage.");
    $("#plan-readiness").hidden = ready;
    $("#plan-outlook").hidden = !ready;
    $("#plan-retry-data").hidden = state.planDataAvailable;
    $("#plan-retry-data").disabled = state.planReloadPending;
    setText("#plan-retry-data", state.planReloadPending ? "Retrying…" : "Retry settings");
    $("#plan-review-portfolio").hidden = state.propertiesAvailable && ((valuationComplete && !(missingReturn || missingYield)) || metricsLoading || !state.planDataAvailable);
    $("#plan-review-income").hidden = cashflowAvailable;
    setText("#plan-readiness-title", !state.planDataAvailable ? "Plan unavailable" : !valuationComplete ? "Complete your portfolio values" : metricsLoading && !projection.available ? "Loading your outlook" : projection.reason ? "Review your Plan inputs" : "Portfolio data incomplete");
    setText("#plan-readiness-copy", unavailableText);
    const projected = ready ? displayCurrency(selected.totalValueCents / 100) : "Not set";
    setText("#plan-hero-value", projected); setText("#plan-projected-value", projected);
    setText("#plan-hero-age", selected?.age == null ? "Projected net worth" : `Age ${selected.age}`);
    const date = new Date(`${selected?.date || dateAtPlanMonth(planToday(), year * 12)}T12:00:00`);
    setText("#plan-hero-date", date.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
    const baseline = summary.totalMarketValueCents + totalPropertyEquity();
    const change = ready ? selected.totalValueCents - baseline : null;
    setText("#plan-change", change === null ? "Not set" : displaySignedCurrency(change));
    setText("#plan-change-rate", ready && baseline > 0 ? displaySignedPercentage(change / baseline) : "");
    setText("#plan-change-label", `${year} year change`);
    setText("#plan-projected-income", ready ? displayCurrency(selected.projectedIncomeCents / 100) : "Not set");
    setText("#plan-income-rate", ready ? percentage.format(assumptions.distributionYieldRate) : "");
    setText("#plan-growth", ready ? displaySignedCurrency(selected.expectedGrowthCents) : "Not set");
    setText("#plan-growth-rate", ready && selected.totalValueCents > 0 ? displaySignedPercentage(selected.expectedGrowthCents / selected.totalValueCents) : "");
    $("#plan-selected-year").max = state.planHorizon;
    $("#plan-selected-year").value = year;
    $("#plan-selected-year").setAttribute("aria-valuetext", `${year === 0 ? "Now" : `Year ${year}`} · ${projected}${selected?.age == null ? "" : ` · Age ${selected.age}`}`);
    $("#plan-value-axis").innerHTML = `<span>Now</span><span>${state.planHorizon} years</span>`;
    document.querySelectorAll("[data-plan-horizon]").forEach(control => { const active = Number(control.dataset.planHorizon) === state.planHorizon; control.classList.toggle("is-active", active); control.setAttribute("aria-pressed", String(active)); });
    renderPlanChart(points, year, unavailableText);
    const depletion = ready && projection.depletionMonth !== null;
    $("#plan-projection-note").hidden = !ready || (!depletion && !projection.missingPropertyRates);
    setText("#plan-projection-note", [ready && projection.missingPropertyRates ? `${projection.missingPropertyRates} ${projection.missingPropertyRates === 1 ? "property needs" : "properties need"} an appreciation assumption. Their current values are held constant. Edit the property in Portfolio to complete projected growth.` : "", depletion ? `Investments run out in month ${projection.depletionMonth}. ${currency.format(projection.unfundedCents / 100)} of spending remains unfunded over ${state.planHorizon} years. Property equity is not available to cover spending.` : ""].filter(Boolean).join(" "));
    setText("#plan-value-breakdown", ready ? `Investments ${preciseCurrency.format(selected.investmentValueCents / 100)} · Property equity ${preciseCurrency.format(selected.propertyEquityCents / 100)}` : "");
    for (const [id, amount] of [["plan-projected-value", selected?.totalValueCents], ["plan-change", change], ["plan-projected-income", selected?.projectedIncomeCents], ["plan-growth", selected?.expectedGrowthCents]]) $("#" + id).setAttribute("title", Number.isSafeInteger(amount) ? preciseCurrency.format(amount / 100) : "Unavailable");
    const defaults = { weeklyExpensesCents: amounts.annualExpensesCents / 52, weeklyInvestmentCents: amounts.annualContributionCents / 52, annualIncomeCents: amounts.annualIncomeCents / planIncomeCadence };
    for (const [key, selector] of Object.entries(scenarioControls)) {
      const control = $(selector);
      if (!(key in (planDraft?.raw || {}))) control.value = key.endsWith("Cents") ? (defaults[key] / 100).toFixed(0) : scenario[key] ?? "";
      control.disabled = !state.planDataAvailable || !cashflowAvailable || Boolean(planDraft?.pending);
      if (!planDraft && (!state.planDataAvailable || !cashflowAvailable)) control.value = "";
    }
    $("#plan-income-cadence").value = planIncomeCadence;
    $("#plan-income-cadence").disabled = Boolean(planDraft?.pending);
    for (const [id, key, amount] of [["expenses", "weeklyExpensesCents", amounts.annualExpensesCents], ["investments", "weeklyInvestmentCents", amounts.annualContributionCents], ["income", "annualIncomeCents", amounts.annualIncomeCents]]) setText(`#plan-${id}-hint`, `${currency.format(amount / 1200)}/mo · ${scenario[key] === null ? "From Mercury" : "Plan override"}`);
    if (!state.planDataAvailable || !cashflowAvailable) ["expenses", "investments", "income"].forEach(id => setText(`#plan-${id}-hint`, "Saved inputs unavailable"));
    setText("#plan-input-source", `USD · ${currentPlanAge(scenario) === null ? "Set your date of birth in Plan settings." : `Current age ${currentPlanAge(scenario)}.`} Empty amounts follow Mercury.`);
    $("#plan-scenario-actions").hidden = !planDraft;
    setText("#plan-scenario-status", planDraft?.status || "");
    $("#plan-scenario-save").disabled = Boolean(planDraft?.pending);
    $("#plan-scenario-cancel").disabled = Boolean(planDraft?.pending);
    $("#plan-reset-amounts").disabled = !state.planDataAvailable || !cashflowAvailable || Boolean(planDraft?.pending);
    $("#edit-plan-assumptions").disabled = !state.planDataAvailable || Boolean(planDraft?.pending);
    setText("#plan-assumption-return", Number.isFinite(assumptions.expectedAnnualReturnRate) ? percentage.format(assumptions.expectedAnnualReturnRate) : "Not set");
    setText("#plan-assumption-yield", Number.isFinite(assumptions.distributionYieldRate) ? percentage.format(assumptions.distributionYieldRate) : "Not set");
    setText("#plan-assumption-policy", policyLabel(assumptions.distributionPolicy));
    setText("#plan-return-source", assumptions.usesReturnOverride ? "Plan override" : assumptions.usesHistoricalReturn ? "Value-weighted · historical returns" : "Value-weighted · holding assumptions");
    setText("#plan-yield-source", assumptions.usesYieldOverride ? "Plan override" : "From Portfolio");
    setText("#plan-cashflow-note", ready ? `Over ${state.planHorizon} years: ${currency.format(points.at(-1).contributedCents / 100)} contributed; ${currency.format(points.at(-1).withdrawnCents / 100)} withdrawn.${projection.depletionMonth === null ? "" : ` Portfolio depleted in month ${projection.depletionMonth}; ${currency.format(projection.unfundedCents / 100)} of spending could not be funded.`}` : unavailableText);
    if (!state.planDataAvailable) {
      ["return", "yield", "policy"].forEach(id => setText(`#plan-assumption-${id}`, "Unavailable"));
      ["return", "yield"].forEach(id => setText(`#plan-${id}-source`, "Saved settings unavailable"));
    }
    renderPlanAssets(summary);
  }

  function setDetailFormDisabled(disabled) {
    Array.from($("#asset-detail-form").elements).forEach((element) => { element.disabled = disabled; });
  }
  function syncDetailValuationFields() {
    const manualValue = $("#asset-detail-valuation-basis").value === VALUATION_BASES.MANUAL_VALUE;
    $("#asset-detail-manual-price-field").hidden = manualValue;
    $("#asset-detail-manual-value-field").hidden = !manualValue;
    $("#asset-detail-shares").disabled = manualValue;
  }
  function assetRow(holding, summary) {
    return summary.rows.find((row) => row.asset.id === holding.id) || null;
  }
  // Keep only the active Portfolio's public price series; never persist holdings or
  // let an old account/request update a replacement card. Three provider reads at a time.
  const portfolioMarketHistory = new Map();
  let portfolioMarketPeriod = "1w";
  let portfolioMarketRows = [];
  function clearPortfolioMarketHistory() {
    for (const entry of portfolioMarketHistory.values()) entry.controller?.abort();
    portfolioMarketHistory.clear();
    portfolioMarketRows = [];
  }
  async function fetchMarketHistoryData(holding, controller) {
    let timer;
    try {
      return await Promise.race([
        (async () => {
          const token = await sessionToken();
          if (controller.signal.aborted) throw new Error("Cancelled");
          const response = await fetch(`/api/portfolio/quotes?history=1&symbol=${encodeURIComponent(holding.symbol)}&instrumentType=${encodeURIComponent(holding.instrument_type)}`, {
            headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
          });
          const data = await response.json();
          if (!response.ok || data.currency !== "USD" || !Array.isArray(data.points)) throw new Error("Market history unavailable");
          return data;
        })(),
        new Promise((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(new Error("Market history timed out")); }, 20000);
        }),
      ]);
    } finally { clearTimeout(timer); }
  }
  function syncPortfolioMarketHistory(rows) {
    portfolioMarketRows = state.portfolioView === "cards" ? rows : [];
    const wanted = new Set(portfolioMarketRows.map(row => row.asset.id));
    for (const [id, entry] of portfolioMarketHistory) {
      const holding = state.holdings.find(item => item.id === id);
      if (!wanted.has(id) || !entry.accountIsCurrent() || !holding || holding.symbol !== entry.symbol || holding.instrument_type !== entry.type || (!entry.pending && !entry.error && Date.now() - entry.startedAt > 300000)) {
        entry.controller?.abort();
        portfolioMarketHistory.delete(id);
      }
    }
    renderPortfolioMarketCharts();
    pumpPortfolioMarketHistory();
  }
  function pumpPortfolioMarketHistory() {
    if (!state.user || !state.account || !routePortfolio() || state.portfolioView !== "cards") return;
    let pending = [...portfolioMarketHistory.values()].filter(entry => entry.pending).length;
    for (const row of portfolioMarketRows) {
      if (pending >= 3) break;
      const holding = state.holdings.find(item => item.id === row.asset.id);
      if (!holding?.symbol || holding.instrument_type === "cash" || portfolioMarketHistory.has(holding.id)) continue;
      pending++;
      const entry = { symbol: holding.symbol, type: holding.instrument_type, pending: true, error: false, data: null, controller: new AbortController(), accountIsCurrent: accountContext(), startedAt: Date.now() };
      portfolioMarketHistory.set(holding.id, entry);
      void fetchMarketHistoryData(holding, entry.controller).then(data => { entry.data = data; }).catch(() => { entry.error = true; }).finally(() => {
        entry.pending = false;
        if (portfolioMarketHistory.get(holding.id) !== entry || !entry.accountIsCurrent() || !routePortfolio()) return;
        renderPortfolioMarketCharts();
        pumpPortfolioMarketHistory();
      });
    }
  }
  function renderPortfolioMarketCharts() {
    document.querySelectorAll("[data-portfolio-market-period]").forEach(control => {
      const selected = control.dataset.portfolioMarketPeriod === portfolioMarketPeriod;
      control.classList.toggle("is-active", selected);
      control.setAttribute("aria-pressed", String(selected));
    });
    $("#portfolio-market-periods").hidden = state.portfolioView !== "cards";
    $("#portfolio-holdings-grid").querySelectorAll("[data-holding-market]").forEach(slot => {
      const holding = state.holdings.find(item => item.id === slot.dataset.holdingMarket);
      if (!holding) return;
      const entry = portfolioMarketHistory.get(holding.id);
      const supported = holding.symbol && holding.instrument_type !== "cash";
      const { points, first, last, change, changeRate } = summarizeMarketHistory(entry?.data, portfolioMarketPeriod);
      let chart = "";
      let description = "Market-price history unavailable";
      let caption = !supported ? "No market-price history" : !entry || entry.pending ? "Loading market prices…" : entry.error ? "Market prices unavailable" : !points.length ? "No prices in this range" : `${entry.data.source} · ${marketDate(last.time)}`;
      if (points.length) {
        const movement = change === null ? "One recorded price" : `${change > 0 ? "Up" : change < 0 ? "Down" : "No change"} ${percentage.format(Math.abs(changeRate))}`;
        description = `${holding.symbol} daily market price in USD, ${marketPrice.format(first.price)} on ${marketDate(first.time)} to ${marketPrice.format(last.price)} on ${marketDate(last.time)}. ${movement}. Starting-price baseline. Excludes dividends and personal gain or loss.`;
        if (points.length === 1) chart = '<svg class="acadia-card-trend-chart is-primary" viewBox="0 0 100 100" aria-hidden="true"><circle class="acadia-card-trend-point" cx="50" cy="50" r="2.5"></circle></svg>';
        else {
          const prices = points.map(point => point.price), min = Math.min(...prices), span = Math.max(...prices) - min;
          const geometry = points.map(point => ({ x: (point.time - first.time) / (last.time - first.time) * 1000, y: span ? 94 - (point.price - min) / span * 84 : 50 }));
          const path = buildCardTrendPath(geometry);
          chart = `<svg class="acadia-card-trend-chart ${change < 0 ? "is-negative" : "is-primary"}" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path class="acadia-card-trend-area" d="${path} L 1000 100 L 0 100 Z"></path><polyline class="acadia-card-trend-baseline" points="0,${geometry[0].y} 1000,${geometry[0].y}"></polyline><path class="acadia-card-trend-line" d="${path}"></path></svg>`;
        }
        caption = `${marketPrice.format(last.price)} · ${movement} · ${portfolioMarketPeriod.toUpperCase()}`;
      }
      // Skip identical content so unrelated completions cannot remove a focused retry.
      const markup = `<div class="${points.length ? "acadia-card-trend" : "acadia-card-trend acadia-card-trend-empty"}" role="img" aria-label="${escapeHtml(description)}">${chart || escapeHtml(caption)}</div>${points.length ? `<small class="acadia-text-muted" title="${escapeHtml(`${entry.data.source} · ${marketDate(first.time)} – ${marketDate(last.time)}`)}">${escapeHtml(caption)}</small>` : ""}${entry?.error ? `<button class="acadia-button acadia-button-quiet" type="button" data-retry-card-market aria-label="Retry market prices for ${escapeHtml(holding.symbol)}">Retry prices</button>` : ""}`;
      if (slot.innerHTML !== markup) {
        const restoreFocus = slot.contains(document.activeElement);
        slot.innerHTML = markup;
        slot.querySelector("[data-retry-card-market]")?.addEventListener("click", event => {
          event.stopPropagation();
          if (portfolioMarketHistory.get(holding.id)?.pending) return;
          portfolioMarketHistory.delete(holding.id);
          // Retain the retry button while pending so its keyboard focus survives.
          event.currentTarget.setAttribute("aria-disabled", "true");
          event.currentTarget.textContent = "Retrying…";
          pumpPortfolioMarketHistory();
        });
        if (restoreFocus) (slot.querySelector("button") || slot.closest("[data-holding-id]"))?.focus();
      }
    });
  }
  let marketHistory = null;
  let marketPeriod = "1m";
  const fractionalMarketPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 8 });
  const marketPrice = { format: value => Math.abs(value) >= 1 || value === 0 ? preciseCurrency.format(value) : fractionalMarketPrice.format(value) };
  const marketDate = (time) => new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  function clearMarketHistory() {
    marketHistory?.controller.abort();
    marketHistory = null;
    marketPeriod = "1m";
  }
  async function loadMarketHistory(holding) {
    const selectedPeriod = marketPeriod;
    clearMarketHistory();
    marketPeriod = selectedPeriod;
    const entry = { id: holding.id, symbol: holding.symbol, type: holding.instrument_type, pending: true, data: null, error: false, controller: new AbortController(), accountIsCurrent: accountContext() };
    marketHistory = entry;
    const current = () => marketHistory === entry && entry.accountIsCurrent() && routeAssetId() === entry.id &&
      state.holdings.some(item => item.id === entry.id && item.symbol === entry.symbol && item.instrument_type === entry.type);
    renderMarketHistory(holding);
    try {
      entry.data = await fetchMarketHistoryData({ symbol: entry.symbol, instrument_type: entry.type }, entry.controller);
    } catch {
      entry.error = true;
    } finally {
      entry.pending = false;
      if (current()) renderMarketHistory(holding);
    }
  }
  function renderMarketHistory(holding) {
    const supported = Boolean(holding.symbol) && holding.instrument_type !== "cash";
    const entry = marketHistory;
    document.querySelectorAll("[data-market-period]").forEach(control => {
      control.classList.toggle("is-active", control.dataset.marketPeriod === marketPeriod);
      control.setAttribute("aria-pressed", String(control.dataset.marketPeriod === marketPeriod));
      control.disabled = !supported;
    });
    const result = summarizeMarketHistory(entry?.data, marketPeriod);
    const { points, first, last, change, changeRate } = result;
    const chart = $("#asset-market-chart"), endpoints = $("#asset-market-endpoints");
    chart.hidden = endpoints.hidden = !points.length;
    chart.replaceChildren();
    endpoints.replaceChildren();
    const hasChange = change !== null;
    const movement = hasChange ? `${change > 0 ? "Up" : change < 0 ? "Down" : "No change"} ${marketPrice.format(Math.abs(change))} (${percentage.format(Math.abs(changeRate))})` : "";
    setText("#asset-market-price", last ? marketPrice.format(last.price) : "—");
    setText("#asset-market-change", hasChange ? `${movement} · ${marketPeriod.toUpperCase()}` : "");
    $("#asset-market-retry").hidden = !supported || !entry?.error;
    setText("#asset-market-status", !supported ? "Market-price history is not available for this asset." : entry?.pending ? "Loading market prices…" : entry?.error ? "Market history could not be loaded. Try again." : !points.length ? "No market prices are available in this range." :
      `${entry.data.source} · Daily prices · Latest point ${marketDate(last.time)}.${points.length === 1 ? " A line appears when a second price is available." : ""}`);
    chart.setAttribute("aria-label", points.length ? `${holding.symbol} market price per share or unit in USD: ${marketPrice.format(first.price)} on ${marketDate(first.time)}${hasChange ? ` to ${marketPrice.format(last.price)} on ${marketDate(last.time)}. ${movement}` : ""}. Excludes dividends and personal gain or loss.` : "Market-price history unavailable");
    if (!points.length) return;
    const endpoint = point => `<span>${escapeHtml(marketPrice.format(point.price))} · ${marketDate(point.time)}</span>`;
    endpoints.innerHTML = endpoint(first) + (hasChange ? endpoint(last) : "");
    if (!hasChange) {
      chart.innerHTML = '<svg class="acadia-card-trend-chart is-primary" viewBox="0 0 100 100" aria-hidden="true"><circle class="acadia-card-trend-point" cx="50" cy="50" r="2.5"></circle></svg>';
      return;
    }
    const values = points.map(point => point.price);
    const minimum = Math.min(...values), span = Math.max(...values) - minimum;
    const geometry = points.map(point => ({ x: (point.time - first.time) / (last.time - first.time) * 1000, y: span ? 94 - (point.price - minimum) / span * 84 : 50 }));
    const path = buildCardTrendPath(geometry);
    chart.innerHTML = `<svg class="acadia-card-trend-chart ${change < 0 ? "is-negative" : change > 0 ? "is-positive" : "is-neutral"}" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><polyline class="acadia-card-trend-baseline" points="0,${geometry[0].y} 1000,${geometry[0].y}"></polyline><path class="acadia-card-trend-line" d="${path}"></path></svg>`;
  }
  const assetSaveNotices = new Map();
  let refreshingAssetId = null;
  let renderedAssetId = null;
  let assetFormBaseline = "";
  let savingAssetId = null;
  function assetFormSnapshot() {
    return JSON.stringify(Array.from($("#asset-detail-form").elements)
      .filter((element) => element.name)
      .map((element) => [element.name, element.type === "checkbox" ? element.checked : String(element.value)]));
  }
  function setAssetRecoveryFeedback(message) {
    setText("#asset-recovery-feedback", message);
    $("#asset-recovery-feedback").hidden = !message;
  }
  function setAssetEditStatus(message) {
    setText("#asset-detail-status", message);
    $("#asset-detail-status").hidden = !message;
  }
  function syncAssetEditState({ announce = false } = {}) {
    const saving = savingAssetId === renderedAssetId && savingAssetId !== null;
    const dirty = assetFormSnapshot() !== assetFormBaseline;
    $("#asset-save").disabled = Boolean(savingAssetId) || !dirty;
    $("#asset-cancel").disabled = saving || !dirty;
    $("#asset-save").textContent = saving ? "Saving…" : "Save";
    $("#asset-detail-form").setAttribute("aria-busy", String(saving));
    if (announce) setAssetEditStatus(dirty ? "Unsaved changes" : "");
  }
  function renderAsset({ resetForm = false } = {}) {
    const id = routeAssetId();
    const holding = state.holdings.find((entry) => entry.id === id);
    const summary = portfolio();
    $("#home-workspace").hidden = true;
    $("#portfolio-workspace").hidden = true;
    $("#income-workspace").hidden = true;
    $("#plan-workspace").hidden = true;
    $("#asset-workspace").hidden = false;
    setActiveNavigation("portfolio");
    $("#asset-not-found").hidden = Boolean(holding);
    $("#asset-quote-card").hidden = !holding;
    $("#asset-content > .acadia-dashboard-main").hidden = !holding;
    $("#asset-recovery").hidden = true;
    $("#asset-market-card").hidden = !holding;
    if (!holding) {
      clearMarketHistory();
      setText("#asset-title", "Asset unavailable");
      setText("#asset-subtitle", "This asset is not available in your current Brokerage account.");
      setText("#asset-price", "—");
      setText("#asset-status", "Return to Portfolio to select an available asset.");
      return;
    }

    if (marketHistory && (!marketHistory.accountIsCurrent() || marketHistory.id !== id || marketHistory.symbol !== holding.symbol || marketHistory.type !== holding.instrument_type)) clearMarketHistory();
    if (!marketHistory && holding.symbol && holding.instrument_type !== "cash") void loadMarketHistory(holding);
    renderMarketHistory(holding);

    const row = assetRow(holding, summary);
    const asset = holdingAsset(holding);
    const quote = latestQuotes()[holding.id];
    const hasManualValuation = holding.valuation_basis === VALUATION_BASES.MANUAL_VALUE || holding.manual_price_cents !== null;
    const price = holding.valuation_basis === VALUATION_BASES.MANUAL_VALUE
      ? "Manual value"
      : asset.unitPriceCents === null
        ? "No current price"
        : preciseCurrency.format(asset.unitPriceCents / 100);
    setText("#asset-title", holding.symbol || holding.name || "Asset");
    setText("#asset-subtitle", holding.name || holding.instrument_type.replaceAll("-", " "));
    setText("#asset-price", price);
    setText("#asset-status", quote ? `${quote.source} quote as of ${dateLabel(quote.as_of)}.` : hasManualValuation ? "Manual valuation is authoritative." : "No price has been recorded for this asset.");
    setText("#asset-total-value", row ? displayCurrency(row.marketValueCents / 100) : "Unavailable");
    setText("#asset-income", row?.estimatedAnnualIncomeCents === null || !row ? "Not set" : displayCurrency(row.estimatedAnnualIncomeCents / 100));
    setText("#asset-return-stat", asset.expectedAnnualReturnRate === null ? "Not set" : percentage.format(asset.expectedAnnualReturnRate));
    setText("#asset-yield-stat", row?.distributionYieldRate === null || !row ? "Not set" : percentage.format(row.distributionYieldRate));
    setText("#asset-quote-source", quote?.source || (holding.manual_price_cents !== null ? "Manual price" : "No quote recorded."));
    setText("#asset-quote-asof", quote?.as_of ? `As of ${dateLabel(quote.as_of)}` : "No as-of time");

    const needsPrice = asset.unitPriceCents === null && !hasManualValuation;
    const notice = assetSaveNotices.get(id);
    $("#asset-recovery").hidden = !needsPrice && !notice?.reloadFailed;
    setText("#asset-recovery-title", notice ? "Asset saved" : "Price needed");
    setText("#asset-recovery-copy", [
      needsPrice ? (notice?.quoteFailed
        ? "Its automatic price could not be saved. Retry the price or enter a manual valuation in Details."
        : "Retry the automatic price or enter a manual valuation in Details.") : "",
      notice?.reloadFailed ? "Account data could not be reloaded. Your saved asset is shown; reload the page to retry syncing." : "",
    ].filter(Boolean).join(" "));
    $("#asset-retry-price").hidden = !needsPrice || !holding.symbol;
    $("#asset-retry-price").disabled = Boolean(refreshingAssetId);
    $("#asset-refresh-price").disabled = Boolean(refreshingAssetId);
    setText("#asset-retry-price", refreshingAssetId === id ? "Retrying…" : "Retry price");

    // Refresh the summary without replacing a draft while provider data arrives.
    if (renderedAssetId === id && !resetForm) return;
    renderedAssetId = id;
    setAssetRecoveryFeedback("");
    const setValue = (selector, value) => { $(selector).value = value ?? ""; };
    $("#asset-detail-form").hidden = false;
    setDetailFormDisabled(false);
    setValue("#asset-detail-shares", holding.shares);
    setValue("#asset-detail-contribution", holding.contribution_cents === null ? null : Number(holding.contribution_cents) / 100);
    setValue("#asset-detail-frequency", holding.contribution_frequency);
    $("#asset-detail-retirement").checked = holding.is_retirement === true;
    setValue("#asset-detail-dividend-policy", holding.dividend_policy);
    setValue("#asset-detail-gains-policy", holding.capital_gains_policy);
    setValue("#asset-detail-name", holding.name);
    setValue("#asset-detail-instrument", holding.instrument_type);
    setValue("#asset-detail-category", holding.allocation_category);
    setValue("#asset-detail-target", holding.target_allocation_rate === null ? null : Number(holding.target_allocation_rate) * 100);
    setValue("#asset-detail-weekly", holding.weekly_contribution_rate === null ? null : Number(holding.weekly_contribution_rate) * 100);
    setValue("#asset-detail-return", holding.expected_annual_return_rate === null ? null : Number(holding.expected_annual_return_rate) * 100);
    setValue("#asset-detail-yield", holding.distribution_yield_rate === null ? null : Number(holding.distribution_yield_rate) * 100);
    setValue("#asset-detail-policy-note", holding.custom_policy_note);
    $("#asset-manual-valuation").hidden = !hasManualValuation && asset.unitPriceCents !== null;
    setValue("#asset-detail-valuation-basis", holding.valuation_basis);
    setValue("#asset-detail-manual-price", holding.manual_price_cents === null ? null : Number(holding.manual_price_cents) / 100);
    setValue("#asset-detail-manual-value", holding.manual_value_cents === null ? null : Number(holding.manual_value_cents) / 100);
    syncDetailValuationFields();
    assetFormBaseline = assetFormSnapshot();
    setAssetEditStatus("");
    if (savingAssetId === id) setDetailFormDisabled(true);
    syncAssetEditState();
  }

  // Drafts remain in the current document only; never store private form data locally.
  const protectedDialogs = new Map();
  const pendingFormValues = new Map();
  let pendingDiscard = null;
  let lastRenderedHash = window.location.hash;
  function formSnapshot(form) {
    return JSON.stringify(Array.from(form.elements).filter((field) => field.name)
      .map((field) => [field.name, field.type === "checkbox" ? field.checked : String(field.value)]));
  }
  function assetHasDraft() {
    return renderedAssetId !== null && assetFormSnapshot() !== assetFormBaseline;
  }
  function dialogHasDraft(entry) {
    return entry.dialog.open && entry.baseline !== formSnapshot(entry.form);
  }
  function hasPendingWrite() {
    return Boolean(planDraft?.pending) || Array.from(incomeSourceDrafts.values()).some(draft => draft.pending) || Boolean(savingAssetId) || Array.from(protectedDialogs.values()).some((entry) => entry.pending);
  }
  function hasUnsavedWork() {
    return Boolean(planDraft) || incomeSourceDrafts.size > 0 || assetHasDraft() || Array.from(protectedDialogs.values()).some(dialogHasDraft);
  }
  function requestDiscard(action) {
    if (pendingDiscard) return;
    pendingDiscard = action;
    $("#discard-changes-dialog").hidden = false;
    $("#discard-changes-dialog").showModal();
    $("#keep-editing").focus();
  }
  function leaveWorkspace(action) {
    if (hasPendingWrite()) {
      if (savingAssetId) setAssetEditStatus("Saving changes… Please wait before leaving.");
      return;
    }
    const leave = () => {
      incomeSourceDrafts.clear();
      planDraft = null;
      for (const id of incomeSourceCards.keys()) syncIncomeSourceCard(id);
      assetFormBaseline = assetFormSnapshot();
      protectedDialogs.forEach((entry) => { if (entry.dialog.open) entry.dialog.close(); });
      action();
    };
    if (hasUnsavedWork()) requestDiscard(leave);
    else leave();
  }
  function openFormDialog(selector) {
    const dialog = $(selector);
    const entry = protectedDialogs.get(dialog);
    if (entry) entry.baseline = formSnapshot(entry.form);
    const trigger = entry?.openingTrigger || document.activeElement;
    if (entry) entry.openingTrigger = null;
    const menu = trigger?.closest?.(".acadia-action-menu");
    if (entry) {
      entry.returnFocus = menu?.querySelector("summary") || trigger;
      entry.returnToMenu = Boolean(menu);
      const attribute = ["data-edit-budget-category", "data-delete-budget-category", "data-edit-income-source", "data-delete-income-source", "data-edit-property-id", "data-delete-property-id"].find((name) => trigger?.hasAttribute(name));
      entry.returnSelector = attribute ? `[${attribute}="${CSS.escape(trigger.getAttribute(attribute))}"]` : null;
    }
    document.querySelectorAll(".acadia-action-menu[open]").forEach((openMenu) => { openMenu.open = false; });
    // Native dialogs restore to the visible summary, not a now-hidden action.
    if (menu) menu.querySelector("summary")?.focus();
    dialog.showModal();
    syncDialogTriggers();
  }

  const dialogTriggers = [
    ["#home-add-asset, #portfolio-add-asset", "asset-dialog"],
    ["#asset-delete", "delete-asset-dialog"],
    ["#add-income, [data-edit-income-source]", "income-source-dialog"],
    ["[data-delete-income-source]", "delete-income-source-dialog"],
    ["#add-budget-category, [data-edit-budget-category]", "budget-category-dialog"],
    ["[data-delete-budget-category]", "delete-budget-category-dialog"],
    ["#edit-plan-assumptions, [data-open-plan-assumptions]", "plan-assumptions-dialog"],
    ["#portfolio-add-property, [data-edit-property-id], [data-property-id]", "property-dialog"],
    ["[data-delete-property-id]", "delete-property-dialog"],
  ];
  function syncDialogTriggers() {
    dialogTriggers.forEach(([selector, id]) => {
      document.querySelectorAll(selector).forEach((trigger) => {
        trigger.setAttribute("aria-controls", id);
        trigger.setAttribute("aria-haspopup", "dialog");
        trigger.setAttribute("aria-expanded", String($("#" + id).open));
      });
    });
  }
  function protectDialog(dialogSelector, formSelector, submit) {
    const dialog = $(dialogSelector), form = $(formSelector);
    const entry = { dialog, form, baseline: "", pending: false };
    protectedDialogs.set(dialog, entry);
    dialog.addEventListener("close", () => {
      syncDialogTriggers();
      let trigger = entry.returnFocus;
      if (!trigger || document.querySelector("dialog[open]")) return;
      if (entry.returnSelector) {
        const matches = Array.from(document.querySelectorAll(entry.returnSelector));
        const candidates = matches.map((control) => entry.returnToMenu ? control.closest(".acadia-action-menu")?.querySelector("summary") : control);
        const menuFallback = matches.map((control) => control.closest(".acadia-action-menu")?.querySelector("summary"))
          .find((control) => control?.getClientRects().length);
        const visibleControl = candidates.find((control) => {
          const menu = control?.closest(".acadia-action-menu");
          // WebKit can report rectangles for content inside closed details.
          return control?.getClientRects().length && (!menu || menu.open || control === menu.querySelector("summary"));
        });
        trigger = visibleControl || menuFallback || trigger;
      }
      // The table and cards are peer renderings: restore only a visible control.
      if (trigger.isConnected && trigger.getClientRects().length && !trigger.disabled) trigger.focus();
      else if (dialog.id.includes("budget-category")) $("#add-budget-category").focus();
      else if (dialog.id.includes("income-source")) $("#add-income").focus();
      else if (dialog.id.includes("property")) $("#portfolio-add-property").focus();
    });
    const dismiss = (event) => {
      if (entry.pending || dialogHasDraft(entry)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!entry.pending) requestDiscard(() => dialog.close());
      }
    };
    dialog.addEventListener("cancel", dismiss);
    dialog.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (button && /^(close-|cancel-)/.test(button.id)) dismiss(event);
    }, true);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (entry.pending) return;
      const controls = Array.from(form.elements);
      const disabled = controls.map((control) => control.disabled);
      const focus = document.activeElement;
      entry.pending = true;
      // Retain successful form values while controls are disabled, including
      // Quick Add's asynchronous quote lookup before it constructs the holding.
      pendingFormValues.set(form, new FormData(form));
      try {
        const request = submit(event);
        controls.forEach((control) => { control.disabled = true; });
        form.setAttribute("aria-busy", "true");
        await request;
      } finally {
        entry.pending = false;
        pendingFormValues.delete(form);
        controls.forEach((control, index) => { control.disabled = disabled[index]; });
        form.setAttribute("aria-busy", "false");
        if (dialog.open && focus?.isConnected) focus.focus();
      }
    });
  }

  let renderedPortfolio = false;
  function render() {
    if (authReloadPending) return;
    if (planDraft && !planDraft.current()) planDraft = null;
    if (incomeEditorContext && !incomeEditorContext()) clearIncomeEditors();
    if (!state.user || !routeAssetId()) clearMarketHistory();
    if (!state.user || !routePortfolio() || state.startupStatus) clearPortfolioMarketHistory();
    $("#workspace-recovery").hidden = !state.startupStatus;
    if (state.startupStatus) {
      ["home", "portfolio", "income", "plan", "asset"].forEach((page) => { $(`#${page}-workspace`).hidden = true; });
      $("#auth-panel").hidden = true;
      const loading = state.startupStatus === "loading";
      setText("#workspace-recovery-title", loading ? "Loading your workspace…" : state.startupStatus === "unconfigured" ? "Private sync is not configured" : "Your workspace could not be loaded");
      setText("#workspace-recovery-copy", state.startupMessage);
      $("#workspace-retry").hidden = loading;
      $("#workspace-retry").disabled = loading;
      setControlsDisabled(true);
      // The live status stays outside a busy region so it can be announced.
      $("#main-content").setAttribute("aria-busy", "false");
      document.title = "Mercury | " + (loading ? "Loading" : "Connection unavailable");
      return;
    }
    if (state.configured && !state.user) {
      ["home", "portfolio", "income", "plan", "asset"].forEach((page) => { $(`#${page}-workspace`).hidden = true; });
      $("#auth-panel").hidden = false;
      setControlsDisabled(true);
      document.title = "Mercury | Sign in";
      $("#main-content").setAttribute("aria-busy", "false");
      return;
    }
    if (window.location.hash !== lastRenderedHash && (hasUnsavedWork() || hasPendingWrite())) {
      const destination = window.location.hash;
      window.history.pushState(null, "", lastRenderedHash || window.location.pathname + window.location.search);
      leaveWorkspace(() => { window.location.hash = destination; render(); });
      return;
    }
    const previousHash = lastRenderedHash;
    lastRenderedHash = window.location.hash;
    if (!routeAssetId()) renderedAssetId = null;
    const isPortfolio = routePortfolio();
    if (isPortfolio && !renderedPortfolio) state.portfolioView = "cards";
    renderedPortfolio = isPortfolio;
    const focused = document.activeElement;
    const focusAttribute = ["data-edit-income-source", "data-edit-budget-category", "data-delete-income-source", "data-delete-budget-category", "data-review-income-yield"].find((attribute) => focused?.hasAttribute(attribute));
    const focusValue = focusAttribute ? focused.getAttribute(focusAttribute) : null;
    setControlsDisabled(!state.configured);
    const summary = portfolio();
    if (routeAssetId()) renderAsset();
    else if (routePortfolio()) renderPortfolio(summary);
    else if (routeIncome()) renderIncome(summary);
    else if (routePlan()) renderPlan(summary);
    else renderHome(summary);
    syncDialogTriggers();
    const pageTitle = routeAssetId() ? $("#asset-title").textContent : routePortfolio() ? "Portfolio" : routeIncome() ? (window.location.hash === "#income/budget" ? "Budget" : "Income") : routePlan() ? "Plan" : "Home";
    document.title = `Mercury | ${pageTitle}`;
    restorePortfolioAssetFocus(previousHash);
    $("#main-content").setAttribute("aria-busy", "false");
    if (focusAttribute && !focused.isConnected) {
      const replacement = Array.from(document.querySelectorAll(`[${focusAttribute}="${CSS.escape(focusValue)}"]`)).find((control) => control.getClientRects().length);
      (replacement || $(focusAttribute === "data-review-income-yield" ? "#income-dividends-search" : focusAttribute.includes("budget") ? "#add-budget-category" : "#add-income")).focus();
    }
  }

  function getFormValue(form, key) {
    const value = (pendingFormValues.get(form) || new FormData(form)).get(key);
    return value === "" ? null : value;
  }
  function manualValuation() {
    return getFormValue($("#asset-form"), "valuationBasis") === VALUATION_BASES.MANUAL_VALUE;
  }
  function syncQuickValuationFields() {
    const manual = manualValuation();
    $("#manual-price-field").hidden = manual;
    $("#manual-value-field").hidden = !manual;
    $("#asset-shares").required = !manual;
    $("#asset-shares-field").hidden = manual;
    renderQuickQuotePreview();
  }
  function setQuickAddStatus(message) {
    const status = $("#quote-form-status");
    status.textContent = message || "";
    status.hidden = !message;
  }
  function quickPreviewPriceCents() {
    if (state.pendingQuote) return state.pendingQuote.priceCents;
    const manualPriceCents = cents(getFormValue($("#asset-form"), "manualPrice"));
    return Number.isSafeInteger(manualPriceCents) && manualPriceCents >= 0 ? manualPriceCents : null;
  }
  function renderQuickQuotePreview() {
    const manual = manualValuation();
    const priceCents = manual ? null : quickPreviewPriceCents();
    const valueCents = manual
      ? cents(getFormValue($("#asset-form"), "manualValue"))
      : calculateQuotePreviewValueCents($("#asset-shares").value, priceCents);
    const hasValue = Number.isSafeInteger(valueCents) && valueCents >= 0;
    $("#asset-quote-preview").hidden = priceCents === null && !hasValue;
    $("#asset-price-preview-field").hidden = manual;
    setText("#asset-price-preview", priceCents === null ? "—" : preciseCurrency.format(priceCents / 100));
    setText("#asset-value-preview", hasValue ? preciseCurrency.format(valueCents / 100) : "—");
  }
  function invalidateQuickQuote() {
    state.quoteRequestId += 1;
    state.pendingQuote = null;
    renderQuickQuotePreview();
  }
  function showManualFallback(message) {
    $("#manual-fallback").hidden = false;
    syncQuickValuationFields();
    if (message) setQuickAddStatus(message);
  }
  function clearManualFallback() {
    $("#manual-fallback").hidden = true;
    $("#asset-manual-price").value = "";
    $("#asset-manual-value").value = "";
    $("#asset-valuation-basis").value = "shares-and-price";
    syncQuickValuationFields();
  }
  let quickAssetId = null;
  function openQuickAdd() {
    if (protectedDialogs.get($("#asset-dialog"))?.pending) return;
    quickAssetId = crypto.randomUUID();
    const form = $("#asset-form");
    form.reset();
    $("#asset-recurring-options").open = false;
    clearTimeout(state.quoteTimer);
    invalidateQuickQuote();
    clearManualFallback();
    setQuickAddStatus("");
    syncQuickValuationFields();
    openFormDialog("#asset-dialog");
    $("#asset-symbol").focus();
  }

  async function sessionToken() {
    const client = state.client;
    if (authReloadPending || !client) throw new Error("Your session changed. Sign in again.");
    const { data } = await client.auth.getSession();
    if (authReloadPending || client !== state.client) throw new Error("Your session changed. Sign in again.");
    return data.session?.access_token;
  }
  async function requestQuote(symbol, instrumentType = "other", { includeMetrics = false } = {}) {
    const controller = new AbortController();
    let timer;
    try {
      return await Promise.race([
        (async () => {
          const token = await sessionToken();
          if (controller.signal.aborted) throw new Error("Quote lookup timed out.");
          const metricsQuery = includeMetrics ? "&includeMetrics=1" : "";
          const response = await fetch(`/api/portfolio/quotes?symbol=${encodeURIComponent(symbol)}&instrumentType=${encodeURIComponent(instrumentType)}${metricsQuery}`, {
            headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Quote lookup failed.");
          return data;
        })(),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            reject(new Error("Price lookup timed out. Try again or enter a manual valuation."));
            controller.abort();
          }, 25000);
        }),
      ]);
    } finally { clearTimeout(timer); }
  }
  function canQuote() {
    return Boolean($("#asset-symbol").value.trim())
      && $("#asset-shares").value.trim() !== ""
      && $("#asset-shares").validity.valid
      && Number.isFinite(Number($("#asset-shares").value))
      && Number($("#asset-shares").value) >= 0;
  }
  async function lookupQuote({ revealFallback = true } = {}) {
    if (!canQuote()) return null;
    const requestId = ++state.quoteRequestId;
    const requestedSymbol = $("#asset-symbol").value.trim().toUpperCase();
    setQuickAddStatus("Looking up price…");
    try {
      const quote = await requestQuote(requestedSymbol);
      if (
        requestId !== state.quoteRequestId
        || requestedSymbol !== $("#asset-symbol").value.trim().toUpperCase()
      ) return null;
      state.pendingQuote = quote;
      clearManualFallback();
      renderQuickQuotePreview();
      setQuickAddStatus(
        `${quote.source} · ${dateLabel(quote.asOf)}`,
      );
      return quote;
    } catch (error) {
      if (requestId !== state.quoteRequestId) return null;
      state.pendingQuote = null;
      renderQuickQuotePreview();
      const message = "Automatic price unavailable. Enter a manual price or total value.";
      if (revealFallback) showManualFallback(message);
      else setQuickAddStatus(message);
      return null;
    }
  }
  function scheduleQuote({ preserveQuote = false } = {}) {
    clearTimeout(state.quoteTimer);
    if (!preserveQuote) {
      invalidateQuickQuote();
      clearManualFallback();
      setQuickAddStatus("");
    } else {
      renderQuickQuotePreview();
    }
    if (state.pendingQuote || (preserveQuote && !$("#manual-fallback").hidden)) return;
    if (!canQuote()) return;
    state.quoteTimer = setTimeout(() => lookupQuote(), 450);
  }
  function quickHolding() {
    const form = $("#asset-form");
    const isManualValue = manualValuation();
    const contributionPlan = normalizeContributionPlan(
      getFormValue(form, "contribution"),
      getFormValue(form, "contributionFrequency"),
    );
    const holding = {
      id: quickAssetId ||= crypto.randomUUID(),
      account_id: state.account.id,
      symbol: getFormValue(form, "symbol")?.toUpperCase() || null,
      name: null,
      instrument_type: state.pendingQuote?.instrumentType || "other",
      allocation_category: "other",
      valuation_basis: isManualValue ? VALUATION_BASES.MANUAL_VALUE : VALUATION_BASES.SHARES_AND_PRICE,
      shares: isManualValue ? null : Number(getFormValue(form, "shares")),
      manual_value_cents: isManualValue ? cents(getFormValue(form, "manualValue")) : null,
      manual_price_cents: isManualValue ? null : cents(getFormValue(form, "manualPrice")),
      expected_annual_return_rate: null,
      distribution_yield_rate: null,
      target_allocation_rate: null,
      weekly_contribution_rate: null,
      is_retirement: $("#asset-retirement").checked,
      contribution_cents: contributionPlan.contributionCents,
      contribution_frequency: contributionPlan.contributionFrequency,
      dividend_policy: null,
      capital_gains_policy: null,
      custom_policy_note: null,
    };
    if (!holding.symbol) throw new Error("A symbol is required.");
    if (!isManualValue && (!Number.isFinite(holding.shares) || holding.shares < 0)) throw new Error("Shares are required for a price-based value.");
    if (isManualValue && (!Number.isSafeInteger(holding.manual_value_cents) || holding.manual_value_cents < 0)) throw new Error("A manual total value is required.");
    if (!isManualValue && holding.manual_price_cents === null && !state.pendingQuote) throw new Error("Automatic price lookup failed. Enter a manual price or total value.");
    return holding;
  }
  async function saveQuickAsset(event) {
    event.preventDefault();
    const save = $("#save-asset");
    if (save.disabled) return;
    clearTimeout(state.quoteTimer);
    try {
      save.disabled = true;
      save.textContent = "Adding…";
      if (!manualValuation() && !state.pendingQuote && !getFormValue($("#asset-form"), "manualPrice")) {
        await lookupQuote({ revealFallback: true });
      }
      const holding = quickHolding();
      const { error } = await state.client.from("holdings").upsert(holding, { onConflict: "id" });
      if (error) throw error;
      // The holding is committed. Quote storage and reloading are separate
      // outcomes and must never send the owner back through Add again.
      state.holdings = [...state.holdings.filter((entry) => entry.id !== holding.id), holding];
      const notice = { quoteFailed: false, reloadFailed: false };
      if (state.pendingQuote) {
        const savedQuote = {
          holding_id: holding.id,
          price_cents: state.pendingQuote.priceCents,
          previous_close_cents: state.pendingQuote.priorCloseCents,
          ...quoteDividendFields(holding.id, state.pendingQuote),
          source: state.pendingQuote.source,
          as_of: state.pendingQuote.asOf,
        };
        try {
          const { error: quoteError } = await state.client.from("holding_quotes")
            .upsert(savedQuote, { onConflict: "holding_id,as_of" });
          if (quoteError) throw quoteError;
          state.quotes = [...state.quotes.filter((quote) =>
            quote.holding_id !== holding.id || quote.as_of !== savedQuote.as_of), savedQuote];
        } catch {
          notice.quoteFailed = true;
        }
      }
      $("#asset-dialog").close();
      try { await loadData(); } catch { notice.reloadFailed = true; }
      if (notice.quoteFailed || notice.reloadFailed) assetSaveNotices.set(holding.id, notice);
      setText("#data-status", "Asset saved to your private Brokerage account.");
      navigateToAsset(holding.id);
    } catch (error) {
      setQuickAddStatus(error.message || "This asset could not be saved.");
    } finally {
      save.disabled = false;
      save.textContent = "Add";
    }
  }

  function detailHolding(holding) {
    const form = $("#asset-detail-form");
    const hasManualValuation = holding.valuation_basis === VALUATION_BASES.MANUAL_VALUE
      || holding.manual_price_cents !== null || holdingAsset(holding).unitPriceCents === null;
    const valuationBasis = hasManualValuation
      ? getFormValue(form, "valuationBasis") || holding.valuation_basis
      : holding.valuation_basis;
    const contributionCents = cents(getFormValue(form, "contribution"));
    const contributionFrequency = getFormValue(form, "contributionFrequency");
    if (contributionCents !== null && (!Number.isSafeInteger(contributionCents) || contributionCents < 0)) {
      throw new Error("Contribution must be a non-negative dollar amount.");
    }
    if (contributionCents !== null && !contributionFrequency) {
      throw new Error("Select a contribution frequency.");
    }
    const dividendPolicy = getFormValue(form, "dividendPolicy");
    const capitalGainsPolicy = getFormValue(form, "capitalGainsPolicy");
    const customPolicyNote = getFormValue(form, "customPolicyNote");
    if ((dividendPolicy === "custom" || capitalGainsPolicy === "custom") && !customPolicyNote) {
      throw new Error("A policy note is required for a custom policy.");
    }
    const updates = {
      symbol: holding.symbol,
      name: getFormValue(form, "name"),
      instrument_type: getFormValue(form, "instrumentType") || "other",
      allocation_category: getFormValue(form, "allocationCategory") || "other",
      expected_annual_return_rate: rate(getFormValue(form, "expectedAnnualReturn")),
      distribution_yield_rate: rate(getFormValue(form, "distributionYield")),
      target_allocation_rate: rate(getFormValue(form, "targetAllocation")),
      weekly_contribution_rate: rate(getFormValue(form, "weeklyAllocation")),
      is_retirement: $("#asset-detail-retirement").checked,
      contribution_cents: contributionCents,
      contribution_frequency: contributionFrequency,
      dividend_policy: dividendPolicy,
      capital_gains_policy: capitalGainsPolicy,
      custom_policy_note: customPolicyNote,
      valuation_basis: valuationBasis,
      shares: holding.shares,
      manual_price_cents: holding.manual_price_cents,
      manual_value_cents: holding.manual_value_cents,
    };
    if (valuationBasis === VALUATION_BASES.MANUAL_VALUE) {
      updates.shares = null;
      updates.manual_price_cents = null;
      updates.manual_value_cents = cents(getFormValue(form, "manualValue"));
      if (!Number.isSafeInteger(updates.manual_value_cents) || updates.manual_value_cents < 0) {
        throw new Error("An authoritative total value is required.");
      }
    } else {
      updates.shares = Number(getFormValue(form, "shares"));
      if (!Number.isFinite(updates.shares) || updates.shares < 0) throw new Error("Shares are required for a price-based value.");
      updates.manual_value_cents = null;
      if (hasManualValuation) {
        updates.manual_price_cents = cents(getFormValue(form, "manualPrice"));
        if (!Number.isSafeInteger(updates.manual_price_cents) || updates.manual_price_cents < 0) {
          throw new Error("A manual price is required.");
        }
      }
    }
    return updates;
  }
  async function saveAssetDetails(event) {
    event.preventDefault();
    const holding = state.holdings.find((entry) => entry.id === routeAssetId());
    if (!holding || savingAssetId || assetFormSnapshot() === assetFormBaseline) return;
    try {
      // Read enabled fields before locking the form; disabled fields are absent from FormData.
      const updates = detailHolding(holding);
      savingAssetId = holding.id;
      setDetailFormDisabled(true);
      syncAssetEditState();
      setAssetEditStatus("Saving changes…");
      const { error } = await state.client.from("holdings").update(updates).eq("id", holding.id);
      if (error) throw error;
      await loadData();
      if (routeAssetId() === holding.id) {
        renderAsset({ resetForm: true });
        setAssetEditStatus("Changes saved");
      }
      setText("#data-status", "Saved to your private Brokerage account.");
    } catch (error) {
      if (routeAssetId() === holding.id) setAssetEditStatus(error.message || "This asset could not be saved.");
    } finally {
      savingAssetId = null;
      if (routeAssetId() === holding.id) {
        setDetailFormDisabled(false);
        syncDetailValuationFields();
      }
      if (routeAssetId() === renderedAssetId) syncAssetEditState();
    }
  }

  function openDeleteAssetDialog() {
    if (protectedDialogs.get($("#delete-asset-dialog"))?.pending) return;
    const holding = state.holdings.find((entry) => entry.id === routeAssetId());
    if (!holding) return;
    const label = holding.symbol || holding.name || "this asset";
    setText("#delete-asset-title", `Delete ${label}?`);
    setText("#delete-asset-description", `This permanently removes ${label} and its saved quotes from your Brokerage account. Historical portfolio snapshots stay unchanged.`);
    setText("#delete-asset-status", "");
    $("#delete-asset-dialog").hidden = false;
    openFormDialog("#delete-asset-dialog");
  }
  function closeDeleteAssetDialog() {
    $("#delete-asset-dialog").close();
  }
  async function deleteCurrentAsset(event) {
    event.preventDefault();
    const holding = state.holdings.find((entry) => entry.id === routeAssetId());
    if (!holding || !state.account) return;
    const confirm = $("#confirm-delete-asset");
    try {
      confirm.disabled = true;
      confirm.textContent = "Deleting…";
      setText("#delete-asset-status", "Deleting asset…");
      const { data, error } = await state.client
        .from("holdings")
        .delete()
        .eq("id", holding.id)
        .eq("account_id", state.account.id)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("This asset could not be deleted.");
      assetFormBaseline = assetFormSnapshot();
      state.holdings = state.holdings.filter((entry) => entry.id !== holding.id);
      state.quotes = state.quotes.filter((quote) => quote.holding_id !== holding.id);
      closeDeleteAssetDialog();
      // The acknowledged deletion is already reflected locally. A reload here
      // would render the new route before the dialog pending guard unlocks.
      window.location.hash = "portfolio";
      setText("#data-status", `${holding.symbol || holding.name || "Asset"} deleted from your private Brokerage account.`);
    } catch (error) {
      setText("#delete-asset-status", error.message || "This asset could not be deleted.");
    } finally {
      confirm.disabled = false;
      confirm.textContent = "Delete asset";
    }
  }

  function incomeSourcePayload(form, id) {
    const source = normalizeIncomeSource({
      id,
      name: getFormValue(form, "name"),
      incomeType: getFormValue(form, "incomeType"),
      amountCents: cents(getFormValue(form, "amount")),
      frequency: getFormValue(form, "frequency"),
    });
    return {
      id: source.id,
      account_id: state.account.id,
      name: source.name,
      income_type: source.incomeType,
      amount_cents: source.amountCents,
      frequency: source.frequency,
    };
  }
  function openIncomeSourceDialog(id = null) {
    if (protectedDialogs.get($("#income-source-dialog"))?.pending) return;
    const form = $("#income-source-form");
    const existing = id ? state.incomeSources.find((source) => source.id === id) : null;
    state.incomeSourceDialogId = existing?.id || null;
    form.reset();
    setText("#income-source-dialog-title", existing ? "Edit income source" : "Add income");
    setText("#save-income-source", existing ? "Save" : "Add");
    setText("#income-source-form-status", "");
    if (existing) {
      $("#income-source-name").value = existing.name;
      $("#income-source-type").value = existing.income_type;
      $("#income-source-amount").value = (Number(existing.amount_cents) / 100).toFixed(2);
      $("#income-source-frequency").value = existing.frequency;
    }
    $("#income-source-dialog").hidden = false;
    openFormDialog("#income-source-dialog");
  }
  function closeIncomeSourceDialog() { $("#income-source-dialog").close(); }
  async function saveIncomeSource(event) {
    event.preventDefault();
    const save = $("#save-income-source");
    try {
      save.disabled = true;
      save.textContent = state.incomeSourceDialogId ? "Saving…" : "Adding…";
      const id = state.incomeSourceDialogId || crypto.randomUUID();
      const payload = incomeSourcePayload($("#income-source-form"), id);
      const request = state.incomeSourceDialogId
        ? state.client.from("income_sources").update(payload).eq("id", id).eq("account_id", state.account.id)
        : state.client.from("income_sources").insert(payload);
      const { error } = await request;
      if (error) throw error;
      closeIncomeSourceDialog();
      await loadData();
    } catch (error) {
      setText("#income-source-form-status", error.message || "This income source could not be saved.");
    } finally {
      save.disabled = false;
      save.textContent = state.incomeSourceDialogId ? "Save" : "Add";
    }
  }
  function openDeleteIncomeSourceDialog(id) {
    if (protectedDialogs.get($("#delete-income-source-dialog"))?.pending) return;
    const source = state.incomeSources.find((entry) => entry.id === id);
    if (!source) return;
    state.incomeSourceDeleteId = id;
    setText("#delete-income-source-title", `Delete ${source.name}?`);
    setText("#delete-income-source-description", `This permanently removes ${source.name} from your expected income plan.`);
    setText("#delete-income-source-status", "");
    $("#delete-income-source-dialog").hidden = false;
    openFormDialog("#delete-income-source-dialog");
  }
  function closeDeleteIncomeSourceDialog() { $("#delete-income-source-dialog").close(); }
  async function deleteIncomeSource(event) {
    event.preventDefault();
    const id = state.incomeSourceDeleteId;
    if (!id || !state.account) return;
    const confirm = $("#confirm-delete-income-source");
    try {
      confirm.disabled = true;
      confirm.textContent = "Deleting…";
      const { data, error } = await state.client.from("income_sources")
        .delete().eq("id", id).eq("account_id", state.account.id).select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("This income source could not be deleted.");
      closeDeleteIncomeSourceDialog();
      await loadData();
    } catch (error) {
      setText("#delete-income-source-status", error.message || "This income source could not be deleted.");
    } finally {
      confirm.disabled = false;
      confirm.textContent = "Delete source";
    }
  }

  function budgetCategoryPayload(form, id) {
    const category = normalizeBudgetCategory({
      id,
      name: getFormValue(form, "name"),
      monthlyAmountCents: cents(getFormValue(form, "monthlyAmount")),
    });
    assertBudgetCategoryNameAvailable(category, state.budgetCategoryDialogId);
    return {
      id: category.id,
      account_id: state.account.id,
      name: category.name,
      monthly_amount_cents: category.monthlyAmountCents,
    };
  }
  function openBudgetCategoryDialog(id = null) {
    if (protectedDialogs.get($("#budget-category-dialog"))?.pending) return;
    if (!state.budgetCategoriesAvailable) return;
    const form = $("#budget-category-form");
    const existing = id ? state.budgetCategories.find((category) => category.id === id) : null;
    state.budgetCategoryDialogId = existing?.id || null;
    form.reset();
    setText("#budget-category-dialog-title", existing ? "Edit category" : "Add category");
    setText("#save-budget-category", existing ? "Save" : "Add");
    setText("#budget-category-form-status", "");
    if (existing) {
      $("#budget-category-name").value = existing.name;
      $("#budget-category-amount").value = (Number(existing.monthly_amount_cents) / 100).toFixed(2);
    }
    $("#budget-category-dialog").hidden = false;
    openFormDialog("#budget-category-dialog");
  }
  function closeBudgetCategoryDialog() { $("#budget-category-dialog").close(); }
  async function saveBudgetCategory(event) {
    event.preventDefault();
    if (!state.account) return;
    const save = $("#save-budget-category");
    try {
      save.disabled = true;
      save.textContent = state.budgetCategoryDialogId ? "Saving…" : "Adding…";
      const id = state.budgetCategoryDialogId || crypto.randomUUID();
      const payload = budgetCategoryPayload($("#budget-category-form"), id);
      const request = state.budgetCategoryDialogId
        ? state.client.from("budget_categories").update(payload).eq("id", id).eq("account_id", state.account.id)
        : state.client.from("budget_categories").insert(payload);
      const { error } = await request;
      if (error) throw error;
      closeBudgetCategoryDialog();
      await loadData();
    } catch (error) {
      setText("#budget-category-form-status", error.message || "This budget category could not be saved.");
    } finally {
      save.disabled = false;
      save.textContent = state.budgetCategoryDialogId ? "Save" : "Add";
    }
  }
  function openDeleteBudgetCategoryDialog(id) {
    if (protectedDialogs.get($("#delete-budget-category-dialog"))?.pending) return;
    const category = state.budgetCategories.find((entry) => entry.id === id);
    if (!category) return;
    state.budgetCategoryDeleteId = id;
    setText("#delete-budget-category-title", `Delete ${category.name}?`);
    setText("#delete-budget-category-description", `This permanently removes ${category.name} from your spending plan.`);
    setText("#delete-budget-category-status", "");
    $("#delete-budget-category-dialog").hidden = false;
    openFormDialog("#delete-budget-category-dialog");
  }
  function closeDeleteBudgetCategoryDialog() { $("#delete-budget-category-dialog").close(); }
  async function deleteBudgetCategory(event) {
    event.preventDefault();
    const id = state.budgetCategoryDeleteId;
    if (!id || !state.account) return;
    const confirm = $("#confirm-delete-budget-category");
    try {
      confirm.disabled = true;
      confirm.textContent = "Deleting…";
      const { data, error } = await state.client.from("budget_categories")
        .delete().eq("id", id).eq("account_id", state.account.id).select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("This budget category could not be deleted.");
      closeDeleteBudgetCategoryDialog();
      await loadData();
    } catch (error) {
      setText("#delete-budget-category-status", error.message || "This budget category could not be deleted.");
    } finally {
      confirm.disabled = false;
      confirm.textContent = "Delete category";
    }
  }

  function renderBirthDatePreview() {
    try {
      const dob = normalizeDateOfBirth($("#plan-date-of-birth").value);
      const label = dob ? new Date(`${dob}T12:00:00`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "";
      setText("#plan-birth-date-preview", dob ? `${label} · Age ${ageOnDate(dob)}` : "");
    } catch { setText("#plan-birth-date-preview", "Enter a valid date of birth, no later than today."); }
  }
  let planEditorRecord = null;
  function openPlanAssumptionsDialog() {
    if (protectedDialogs.get($("#plan-assumptions-dialog"))?.pending) return;
    if (!state.planDataAvailable) return;
    if (planDraft) { leaveWorkspace(openPlanAssumptionsDialog); return; }
    const settings = planSettingsModel(state.planSettings);
    planEditorRecord = state.planSettings ? { ...state.planSettings } : null;
    const form = $("#plan-assumptions-form");
    form.reset();
    $("#plan-date-of-birth").value = planScenarioModel().dateOfBirth ?? "";
    $("#plan-date-of-birth").max = planToday();
    renderBirthDatePreview();
    const summary = portfolio();
    const automatic = resolvePlanAssumptions({}, summary);
    const complete = summary.rows.length === state.holdings.length;
    setText("#plan-calculated-return", complete && automatic.expectedAnnualReturnRate !== null ? percentage.format(automatic.expectedAnnualReturnRate) : "Unavailable");
    setText("#plan-calculated-yield", complete && automatic.distributionYieldRate !== null ? percentage.format(automatic.distributionYieldRate) : "Unavailable");
    setText("#plan-calculated-return-source", automatic.usesHistoricalReturn ? "Value-weighted historical returns; not a forecast." : "Value-weighted holding assumptions.");
    $("#plan-rate-overrides").open = settings?.expectedAnnualReturnRate != null || settings?.distributionYieldRate != null;
    $("#plan-expected-return").value = settings?.expectedAnnualReturnRate === null || !settings
      ? ""
      : settings.expectedAnnualReturnRate * 100;
    $("#plan-distribution-yield").value = settings?.distributionYieldRate === null || !settings
      ? ""
      : settings.distributionYieldRate * 100;
    $("#plan-distribution-policy").value = settings?.distributionPolicy || "reinvest";
    setText("#plan-assumptions-form-status", "");
    $("#plan-assumptions-form-status").hidden = true;
    $("#plan-assumptions-dialog").hidden = false;
    openFormDialog("#plan-assumptions-dialog");
  }
  function closePlanAssumptionsDialog() { $("#plan-assumptions-dialog").close(); }
  async function savePlanAssumptions(event) {
    event.preventDefault();
    if (!state.account) return;
    const save = $("#save-plan-assumptions");
    const current = accountContext();
    const { client, account } = state;
    try {
      save.disabled = true;
      save.textContent = "Saving…";
      const settings = normalizePlanSettings({
        accountId: state.account.id,
        expectedAnnualReturnRate: rate(getFormValue($("#plan-assumptions-form"), "expectedAnnualReturn")),
        distributionYieldRate: rate(getFormValue($("#plan-assumptions-form"), "distributionYield")),
        distributionPolicy: getFormValue($("#plan-assumptions-form"), "distributionPolicy"),
      });
      const scenario = normalizePlanScenario({ ...planScenarioModel(planEditorRecord), dateOfBirth: getFormValue($("#plan-assumptions-form"), "dateOfBirth") });
      const payload = {
        date_of_birth: scenario.dateOfBirth,
        current_age: null,
        age_reference_year: null,
        account_id: account.id,
        expected_annual_return_rate: settings.expectedAnnualReturnRate,
        distribution_yield_rate: settings.distributionYieldRate,
        distribution_policy: settings.distributionPolicy,
      };
      // Compare the revision captured when this draft opened, even if a
      // background read has since replaced state.planSettings.
      if (planEditorRecord && !planEditorRecord.updated_at) throw new Error("Reload Plan settings before saving. Your changes have not been saved.");
      const { data, error } = await readWithDeadline(signal => {
        const query = planEditorRecord
          ? client.from("plan_settings").update(payload).eq("account_id", account.id).eq("id", planEditorRecord.id).eq("updated_at", planEditorRecord.updated_at)
          : client.from("plan_settings").insert(payload);
        return query.select().maybeSingle().abortSignal(signal);
      });
      if (!current()) return;
      if (error?.code === "23505" || (!error && !data)) {
        // Keep the draft and its old revision. Repeated Save must never turn
        // into an implicit overwrite; closing/reopening reviews the new record.
        const latest = await readWithDeadline(signal => client.from("plan_settings").select("*").eq("account_id", account.id).maybeSingle().abortSignal(signal));
        if (!current()) return;
        if (latest.error) throw new Error("Settings changed elsewhere, but the latest version could not be loaded. Your draft is unchanged. Try Save again to retry the read.");
        state.planSettings = latest.data;
        render();
        throw new Error("Settings changed elsewhere. Your draft has not been saved. Close and reopen Plan settings to review the latest version.");
      }
      if (error) throw error;
      state.planSettings = data;
      closePlanAssumptionsDialog();
      render();
    } catch (error) {
      if (!current()) return;
      setText("#plan-assumptions-form-status", error.message === "Read timed out"
        ? "Saving could not be confirmed. Your draft is unchanged. Try Save again, or close and reopen to check saved settings."
        : error.message || "The Base plan assumptions could not be saved. Try again.");
      $("#plan-assumptions-form-status").hidden = false;
    } finally {
      save.disabled = false;
      save.textContent = "Save";
    }
  }

  const propertyMarkets = window.MercuryPropertyMarkets;
  function renderPropertyCounties(selected = "") {
    const stateCode = $("#property-state").value;
    const counties = (propertyMarkets?.counties || []).filter(county => county.state === stateCode).sort((a, b) => a.name.localeCompare(b.name));
    $("#property-county").innerHTML = '<option value="">Select county / not listed</option>' + counties.map(county => `<option value="${county.fips}">${escapeHtml(county.name)}</option>`).join("");
    $("#property-county").value = selected;
    $("#property-county").disabled = !stateCode;
  }
  function renderPropertyAppreciation() {
    const value = $("#property-appreciation").value;
    try {
      const assumption = propertyAppreciation({ stateCode: $("#property-state").value, countyFips: $("#property-county").value, annualAppreciationRate: value === "" ? null : Number(value) / 100 });
      setText("#property-appreciation-preview", `${assumption.rate === null ? "Appreciation not set" : `${percentage.format(assumption.rate)} / year`} · ${assumption.source}`);
    } catch (error) { setText("#property-appreciation-preview", error.message); }
  }
  let propertyEditContext = null;
  function openPropertyDialog(id = null, { focusPurchasePrice = false } = {}) {
    if (protectedDialogs.get($("#property-dialog"))?.pending) return;
    if (!state.propertiesAvailable) return;
    const form = $("#property-form");
    const property = state.properties.find((entry) => entry.id === id);
    state.propertyDialogId = property?.id || null;
    form.reset();
    propertyEditContext = accountContext();
    $("#property-state").innerHTML = '<option value="">Select state / outside US</option>' + [...new Set((propertyMarkets?.counties || []).map(county => county.state))].sort().map(code => `<option value="${code}">${code}</option>`).join("");
    $("#property-state").value = property?.state_code || "";
    $("#property-city").value = property?.city || "";
    $("#property-appreciation").value = property?.annual_appreciation_rate == null ? "" : String(Number(property.annual_appreciation_rate) * 100);
    renderPropertyCounties(property?.county_fips || "");
    renderPropertyAppreciation();
    setText("#property-legacy-location", property?.location && !property.city ? `Previously saved location: ${property.location}. Confirm city, state and county below.` : "");
    setText("#property-dialog-title", property ? "Edit property" : "Add property");
    setText("#save-property", property ? "Save property" : "Add property");
    setText("#property-form-status", "");
    if (property) {
      const model = propertyModel(property);
      $("#property-name").value = model.name;
      $("#property-current-value").value = (model.currentValueCents / 100).toFixed(2);
      $("#property-purchase-price").value = model.purchasePriceCents === null ? "" : (model.purchasePriceCents / 100).toFixed(2);
      $("#property-debt-balance").value = (model.mortgageBalanceCents / 100).toFixed(2);
    }
    $("#property-dialog").hidden = false;
    openFormDialog("#property-dialog");
    $(focusPurchasePrice ? "#property-purchase-price" : "#property-name").focus();
  }
  function closePropertyDialog() { $("#property-dialog").close(); }
  async function saveProperty(event) {
    event.preventDefault();
    if (!state.account || (propertyEditContext && !propertyEditContext())) return;
    const current = propertyEditContext || accountContext();
    const { client, account, propertyDialogId } = state;
    const save = $("#save-property");
    try {
      save.disabled = true;
      save.textContent = "Saving…";
      const property = normalizeProperty({
        accountId: state.account.id,
        name: getFormValue($("#property-form"), "name"),
        location: getFormValue($("#property-form"), "location"),
        city: getFormValue($("#property-form"), "city"),
        stateCode: getFormValue($("#property-form"), "stateCode"),
        countyFips: getFormValue($("#property-form"), "countyFips"),
        annualAppreciationRate: getFormValue($("#property-form"), "appreciation") === null || getFormValue($("#property-form"), "appreciation") === "" ? null : Number(getFormValue($("#property-form"), "appreciation")) / 100,
        currentValueCents: cents(getFormValue($("#property-form"), "currentValue")),
        purchasePriceCents: cents(getFormValue($("#property-form"), "purchasePrice")),
        mortgageBalanceCents: cents(getFormValue($("#property-form"), "mortgageBalance")) ?? 0,
      });
      if (property.countyFips && !propertyMarkets?.counties.some(county => county.fips === property.countyFips && county.state === property.stateCode)) throw new Error("Select a county in the property’s state.");
      const payload = {
        account_id: state.account.id,
        name: property.name,
        location: [property.city, property.stateCode, propertyMarkets?.counties.find(county => county.fips === property.countyFips)?.name].filter(Boolean).join(", ") || property.location || state.properties.find(entry => entry.id === propertyDialogId)?.location || null,
        city: property.city,
        state_code: property.stateCode,
        county_fips: property.countyFips,
        annual_appreciation_rate: property.annualAppreciationRate,
        current_value_cents: property.currentValueCents,
        purchase_price_cents: property.purchasePriceCents,
        mortgage_balance_cents: property.mortgageBalanceCents,
      };
      const query = propertyDialogId
        ? client.from("home_properties").update(payload).eq("id", propertyDialogId).eq("account_id", account.id)
        : client.from("home_properties").insert(payload);
      const { data, error } = await readWithDeadline(signal => query.select().single().abortSignal(signal));
      if (!current()) return;
      if (error) throw error;
      state.properties = state.propertyDialogId
        ? state.properties.map((entry) => entry.id === data.id ? data : entry)
        : [...state.properties, data];
      render();
      closePropertyDialog();
    } catch (error) {
      if (current()) setText("#property-form-status", error.message === "Read timed out" ? "Saving could not be confirmed. Your draft is retained. Reload to check before adding again." : error.message || "The property could not be saved.");
    } finally {
      save.disabled = false;
      save.textContent = state.propertyDialogId ? "Save property" : "Add property";
    }
  }
  function openDeletePropertyDialog(id) {
    if (protectedDialogs.get($("#delete-property-dialog"))?.pending) return;
    const property = state.properties.find((entry) => entry.id === id);
    if (!property) return;
    state.propertyDeleteId = id;
    setText("#delete-property-description", `This removes ${property.name || "this property"} and its equity from your net worth.`);
    setText("#delete-property-status", "");
    $("#delete-property-dialog").hidden = false;
    openFormDialog("#delete-property-dialog");
  }
  function closeDeletePropertyDialog() { $("#delete-property-dialog").close(); }
  async function deleteProperty(event) {
    event.preventDefault();
    if (!state.propertyDeleteId) return;
    const button = $("#confirm-delete-property");
    try {
      button.disabled = true;
      button.textContent = "Deleting…";
      const { error } = await state.client.from("home_properties").delete().eq("id", state.propertyDeleteId);
      if (error) throw error;
      state.properties = state.properties.filter((property) => property.id !== state.propertyDeleteId);
      state.propertyDeleteId = null;
      closeDeletePropertyDialog();
      render();
    } catch (error) {
      setText("#delete-property-status", error.message || "The property could not be deleted.");
    } finally {
      button.disabled = false;
      button.textContent = "Delete property";
    }
  }

  async function readWithDeadline(operation) {
    const controller = new AbortController();
    let timer;
    try {
      return await Promise.race([
        Promise.resolve().then(() => operation(controller.signal)),
        new Promise((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(new Error("Read timed out")); }, 10000);
        }),
      ]);
    } finally { clearTimeout(timer); }
  }

  function accountContext() {
    const { client, user, account } = state;
    return () => state.client === client && state.user === user && state.account === account;
  }

  async function retryPlanSettings() {
    if (state.planReloadPending || state.planDataAvailable || !state.user || !state.account || hasPendingWrite()) return;
    const current = accountContext();
    const { client, account } = state;
    const focused = document.activeElement === $("#plan-retry-data");
    state.planReloadPending = true;
    setText("#plan-recovery-status", "Retrying settings…");
    render();
    try {
      const result = await readWithDeadline(signal => client.from("plan_settings").select("*").eq("account_id", account.id).maybeSingle().abortSignal(signal));
      if (!current()) return;
      if (result.error) throw new Error("Plan read failed");
      state.planSettings = result.data;
      state.planDataAvailable = true;
      await ensurePlanSettings();
      if (!current()) return;
      if (!state.planDataAvailable || !state.planSettings) throw new Error("Plan setup failed");
      setText("#plan-recovery-status", "Settings loaded.");
    } catch {
      if (current()) {
        state.planDataAvailable = false;
        setText("#plan-recovery-status", "Settings are still unavailable. Try again.");
      }
    } finally {
      if (current()) {
        state.planReloadPending = false;
        render();
        if (focused && (document.activeElement === $("#plan-retry-data") || document.activeElement === document.body)) {
          $(state.planDataAvailable ? "#edit-plan-assumptions" : "#plan-retry-data").focus();
        }
      }
    }
  }

  async function retryProperties() {
    if (state.propertyReloadPending || state.propertiesAvailable || !state.user || !state.account || hasPendingWrite()) return;
    const current = accountContext();
    const { client, account } = state;
    const focused = document.activeElement === $("#property-retry-data");
    state.propertyReloadPending = true;
    setText("#property-recovery-status", "Retrying properties…");
    render();
    try {
      const result = await readWithDeadline(signal => client.from("home_properties").select("id, account_id, name, location, city, state_code, county_fips, current_value_cents, purchase_price_cents, mortgage_balance_cents, annual_appreciation_rate, created_at").eq("account_id", account.id).order("created_at").abortSignal(signal));
      if (!current()) return;
      if (result.error || !Array.isArray(result.data)) throw new Error("Property read failed");
      state.properties = result.data;
      state.propertiesAvailable = true;
      setText("#property-recovery-status", "Properties loaded.");
    } catch {
      if (current()) setText("#property-recovery-status", "Properties are still unavailable. Try again.");
    } finally {
      if (current()) {
        state.propertyReloadPending = false;
        render();
        if (focused && (document.activeElement === $("#property-retry-data") || document.activeElement === document.body)) {
          $(state.propertiesAvailable ? "#portfolio-properties-title" : "#property-retry-data").focus();
        }
      }
    }
  }

  async function loadData() {
    const current = accountContext();
    const { client, account } = state;
    const requestId = ++state.dataRequestId;
    const results = await Promise.allSettled([
      signal => client.from("accounts").select("*").order("created_at").abortSignal(signal),
      signal => client.from("holdings").select("*").eq("account_id", account.id).order("created_at").abortSignal(signal),
      signal => client.from("holding_quotes").select("*").order("as_of", { ascending: false }).abortSignal(signal),
      signal => client.from("portfolio_snapshots").select("*").eq("account_id", account.id).order("snapshot_date").abortSignal(signal),
      signal => client.from("income_sources").select("*").eq("account_id", account.id).order("created_at").abortSignal(signal),
      signal => client.from("budget_categories").select("*").eq("account_id", account.id).order("created_at").abortSignal(signal),
      signal => client.from("plan_settings").select("*").eq("account_id", account.id).maybeSingle().abortSignal(signal),
      signal => client.from("home_properties").select("id, account_id, name, location, city, state_code, county_fips, current_value_cents, purchase_price_cents, mortgage_balance_cents, annual_appreciation_rate, created_at").eq("account_id", account.id).order("created_at").abortSignal(signal),
    ].map(operation => readWithDeadline(operation)));
    if (!current() || requestId !== state.dataRequestId) return false;
    const [accounts, holdings, quotes, snapshots, incomeSources, budgetCategories, planSettings, properties] = results.map(result => result.status === "fulfilled" ? result.value : { error: result.reason });
    if (accounts.error || holdings.error || quotes.error || snapshots.error) {
      throw accounts.error || holdings.error || quotes.error || snapshots.error;
    }
    state.accounts = accounts.data || [];
    state.holdings = holdings.data || [];
    state.quotes = quotes.data || [];
    state.snapshots = snapshots.data || [];
    state.incomeSourcesAvailable = !incomeSources.error;
    state.incomeSources = incomeSources.data || [];
    state.budgetCategoriesAvailable = !budgetCategories.error;
    state.budgetCategories = budgetCategories.data || [];
    state.planDataAvailable = !planSettings.error;
    state.planSettings = planSettings.data || null;
    state.propertiesAvailable = !properties.error;
    state.properties = properties.data || [];
    render();
    return true;
  }
  async function ensurePlanSettings() {
    if (!state.planDataAvailable || state.planSettings || !state.account) return;
    const current = accountContext();
    const { client, account } = state;
    let { data, error } = await readWithDeadline(signal => client.from("plan_settings").upsert({
      account_id: account.id,
      distribution_policy: "reinvest",
    }, { onConflict: "account_id", ignoreDuplicates: true }).select().maybeSingle().abortSignal(signal));
    if (!current()) return;
    if (!error && !data) {
      ({ data, error } = await readWithDeadline(signal => client.from("plan_settings").select("*").eq("account_id", account.id).maybeSingle().abortSignal(signal)));
      if (!current()) return;
    }
    if (error) {
      state.planDataAvailable = false;
      state.planSettings = null;
      render();
      return;
    }
    state.planSettings = data;
    render();
  }
  async function ensureAccount(isCurrent = () => true) {
    const client = state.client;
    const existing = await readWithDeadline(signal => client.from("accounts").select("*").eq("account_type", "brokerage").maybeSingle().abortSignal(signal));
    if (!isCurrent()) return null;
    if (existing.error) throw existing.error;
    if (existing.data) return existing.data;
    const created = await readWithDeadline(signal => client.from("accounts").insert({ name: "Brokerage", account_type: "brokerage" }).select().single().abortSignal(signal));
    if (created.error) throw created.error;
    return created.data;
  }
  async function refreshCurrentAssetPrice() {
    const holding = state.holdings.find((entry) => entry.id === routeAssetId());
    if (refreshingAssetId) return;
    if (!holding || holding.valuation_basis !== VALUATION_BASES.SHARES_AND_PRICE || !holding.symbol) {
      return setAssetEditStatus("This asset does not have an automatic price to refresh.");
    }
    const focusOnRetry = document.activeElement === $("#asset-retry-price");
    try {
      refreshingAssetId = holding.id;
      renderAsset();
      setAssetEditStatus("Refreshing price…");
      setAssetRecoveryFeedback("Refreshing price…");
      const quote = await requestQuote(holding.symbol, holding.instrument_type);
      const savedQuote = {
        holding_id: holding.id,
        price_cents: quote.priceCents,
        previous_close_cents: quote.priorCloseCents,
        ...quoteDividendFields(holding.id, quote),
        source: quote.source,
        as_of: quote.asOf,
      };
      const { error } = await state.client.from("holding_quotes").upsert(savedQuote, { onConflict: "holding_id,as_of" });
      if (error) throw error;
      state.quotes = [...state.quotes.filter((entry) =>
        entry.holding_id !== holding.id || entry.as_of !== savedQuote.as_of), savedQuote];
      let reloaded = true;
      try { await loadData(); } catch { reloaded = false; }
      if (reloaded) assetSaveNotices.delete(holding.id);
      else assetSaveNotices.set(holding.id, { quoteFailed: false, reloadFailed: true });
      if (routeAssetId() === holding.id) {
        setAssetEditStatus(reloaded ? "Price refreshed." : "Price saved. Reload the page to retry syncing account data.");
        setAssetRecoveryFeedback("");
      }
    } catch (error) {
      if (routeAssetId() === holding.id) {
        const recovery = latestQuotes()[holding.id]
          ? "Last successful quote remains in place."
          : "No automatic price has been saved. Retry or enter a manual valuation.";
        const message = `${error.message || "Price refresh failed."} ${recovery}`;
        setAssetEditStatus(message);
        setAssetRecoveryFeedback(message);
      }
    } finally {
      refreshingAssetId = null;
      if (routeAssetId()) {
        renderAsset();
        if (routeAssetId() === holding.id && focusOnRetry && $("#asset-recovery").hidden) $("#asset-title").focus();
      }
    }
  }
  async function hydrateProviderMetrics() {
    const current = accountContext();
    const requestId = ++state.metricsRequestId;
    const candidates = state.holdings.filter((holding) => (
      holding.valuation_basis === VALUATION_BASES.SHARES_AND_PRICE &&
      holding.symbol &&
      holding.instrument_type !== "cash"
    ));
    state.providerMetricsPending = new Set(candidates.map((holding) => holding.id));
    render();
    const results = await Promise.allSettled(candidates.map(async (holding) => ({
      holdingId: holding.id,
      quote: await requestQuote(holding.symbol, holding.instrument_type, { includeMetrics: true }),
    })));
    if (!current() || requestId !== state.metricsRequestId) return;
    const metrics = results.reduce((next, result) => {
      if (result.status !== "fulfilled") return next;
      const { holdingId, quote } = result.value;
      const original = candidates.find(holding => holding.id === holdingId);
      if (!state.holdings.some(holding => holding.id === holdingId && holding.symbol === original.symbol && holding.instrument_type === original.instrument_type)) return next;
      next[holdingId] = {
        annualizedReturnRate: quote.annualizedReturnRate,
        annualizedReturnYears: quote.annualizedReturnYears,
        annualDividendCents: quote.annualDividendCents,
        distributionYieldRate: quote.distributionYieldRate,
      };
      return next;
    }, {});
    state.providerMetrics = { ...state.providerMetrics, ...metrics };
    state.providerMetricsPending = new Set();
    render();
  }
  async function initialise() {
    if (authReloadPending || state.startupStatus === "loading") return;
    const requestId = ++state.startupRequestId;
    const current = () => requestId === state.startupRequestId;
    const focused = document.activeElement === $("#workspace-retry");
    state.startupStatus = "loading";
    state.startupMessage = "Connecting to your private account.";
    render();
    try {
      const config = await readWithDeadline(async signal => {
        const response = await fetch("/api/config", { cache: "no-store", signal });
        const config = await response.json();
        if (!response.ok && !(response.status === 503 && config.configured === false)) throw new Error("Configuration read failed");
        return config;
      });
      if (!current()) return;
      if (!config.configured) {
        state.configured = false;
        state.startupStatus = "unconfigured";
        state.startupMessage = "Private account access is unavailable until Supabase is configured.";
        return;
      }
      state.configured = true;
      state.client ||= window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      authSubscription ||= state.client.auth.onAuthStateChange((_event, session) => observeAuthSession(session)).data.subscription;
      const result = await readWithDeadline(() => state.client.auth.getSession());
      if (!current()) return;
      if (result.error) throw result.error;
      const session = result.data.session;
      observeAuthSession(session);
      if (!current()) return;
      state.user = session?.user || null;
      if (!session) {
        state.startupStatus = null;
        setAccountMenuState("Sign in", false);
        return;
      }
      setAccountMenuState(state.user.email, true);
      const account = await ensureAccount(current);
      if (!current()) return;
      state.account = account;
      if (!await loadData() || !current()) return;
      // Optional plan setup failure must not hide successfully loaded holdings.
      try { await ensurePlanSettings(); } catch { state.planDataAvailable = false; }
      if (!current()) return;
      state.startupStatus = null;
      setText("#data-status", "Private Brokerage account loaded.");
      void hydrateProviderMetrics();
    } catch {
      if (!current()) return;
      state.startupStatus = "error";
      state.startupMessage = "Check your connection and try again. You can retry from this page.";
    } finally {
      if (current()) {
        render();
        if (focused && (document.activeElement === $("#workspace-retry") || document.activeElement === document.body)) $(state.startupStatus ? "#workspace-retry" : state.user ? "#main-content" : "#email").focus({ preventScroll: true });
      }
    }
  }

  document.querySelectorAll("[data-portfolio-market-period]").forEach(control => {
    control.addEventListener("click", () => {
      portfolioMarketPeriod = control.dataset.portfolioMarketPeriod;
      renderPortfolioMarketCharts();
    });
  });
  document.querySelectorAll("[data-market-period]").forEach(control => {
    control.addEventListener("click", () => {
      marketPeriod = control.dataset.marketPeriod;
      const holding = state.holdings.find(item => item.id === routeAssetId());
      if (holding) renderMarketHistory(holding);
    });
  });
  $("#asset-market-retry").addEventListener("click", () => {
    const holding = state.holdings.find(item => item.id === routeAssetId());
    if (holding && !marketHistory?.pending) void loadMarketHistory(holding);
  });
  $("#workspace-retry").addEventListener("click", initialise);
  $("#property-retry-data").addEventListener("click", retryProperties);
  $("#plan-retry-data").addEventListener("click", retryPlanSettings);

  $("#income-retry-data").addEventListener("click", retryIncomeData);

  $("#magic-link-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.client) return;
    const send = $("#send-magic-link");
    if (send.disabled) return;
    send.disabled = true;
    send.textContent = "Sending…";
    setText("#auth-message", "Sending your sign-in link…");
    try {
      const { error } = await state.client.auth.signInWithOtp({
        email: $("#email").value.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setText("#auth-message", "Check your email for a sign-in link. If it does not arrive, check spam or try again.");
    } catch (error) {
      setText("#auth-message", error.message || "The link could not be sent. Check your connection and try again.");
    } finally {
      send.disabled = false;
      send.textContent = "Send magic link";
    }
  });
  document.querySelectorAll("[data-sign-out]").forEach((control) => {
    control.addEventListener("click", () => leaveWorkspace(async () => {
      const { error } = await state.client.auth.signOut();
      if (error) { setText("#data-status", error.message || "Sign out failed. Try again."); return; }
      if (!authReloadPending) window.location.reload();
    }));
  });
  $("#portfolio-add-asset").addEventListener("click", openQuickAdd);
  $("#home-add-asset").addEventListener("click", openQuickAdd);
  $("#close-dialog").addEventListener("click", () => $("#asset-dialog").close());
  $("#cancel-dialog").addEventListener("click", () => $("#asset-dialog").close());
  $("#asset-dialog").addEventListener("close", () => {
    clearTimeout(state.quoteTimer);
    state.quoteRequestId += 1;
  });
  protectDialog("#asset-dialog", "#asset-form", saveQuickAsset);
  $("#asset-valuation-basis").addEventListener("change", syncQuickValuationFields);
  $("#asset-symbol").addEventListener("input", () => scheduleQuote());
  $("#asset-shares").addEventListener("input", () => scheduleQuote({ preserveQuote: true }));
  $("#asset-manual-price").addEventListener("input", renderQuickQuotePreview);
  $("#asset-manual-value").addEventListener("input", renderQuickQuotePreview);
  $("#portfolio-search").addEventListener("input", render);
  ["#income-dividends-search", "#income-sources-search", "#income-budget-search"].forEach((selector) => $(selector).addEventListener("input", render));
  ["dividends", "sources", "budget"].forEach((section) => $(`#income-${section}-clear`).addEventListener("click", () => {
    const search = $(`#income-${section}-search`);
    search.value = "";
    render();
    const menu = search.closest?.(".acadia-action-menu");
    if (menu) menu.open = true;
    search.focus();
  }));
  $("#add-income").addEventListener("click", () => openIncomeSourceDialog());
  $("#close-income-source-dialog").addEventListener("click", closeIncomeSourceDialog);
  $("#cancel-income-source-dialog").addEventListener("click", closeIncomeSourceDialog);
  $("#income-source-dialog").addEventListener("close", () => { $("#income-source-dialog").hidden = true; });
  protectDialog("#income-source-dialog", "#income-source-form", saveIncomeSource);
  $("#cancel-delete-income-source").addEventListener("click", closeDeleteIncomeSourceDialog);
  $("#delete-income-source-dialog").addEventListener("close", () => { $("#delete-income-source-dialog").hidden = true; });
  protectDialog("#delete-income-source-dialog", "#delete-income-source-form", deleteIncomeSource);
  $("#add-budget-category").addEventListener("click", () => openBudgetCategoryDialog());
  $("#close-budget-category-dialog").addEventListener("click", closeBudgetCategoryDialog);
  $("#cancel-budget-category-dialog").addEventListener("click", closeBudgetCategoryDialog);
  $("#budget-category-dialog").addEventListener("close", () => { $("#budget-category-dialog").hidden = true; });
  protectDialog("#budget-category-dialog", "#budget-category-form", saveBudgetCategory);
  $("#cancel-delete-budget-category").addEventListener("click", closeDeleteBudgetCategoryDialog);
  $("#delete-budget-category-dialog").addEventListener("close", () => { $("#delete-budget-category-dialog").hidden = true; });
  protectDialog("#delete-budget-category-dialog", "#delete-budget-category-form", deleteBudgetCategory);
  $("#portfolio-holding-sort").addEventListener("change", (event) => {
    state.portfolioSort = event.target.value;
    render();
  });
  document.querySelectorAll("[data-portfolio-table-sort]").forEach((control) => {
    control.addEventListener("click", () => {
      state.portfolioSort = control.dataset.portfolioTableSort;
      render();
    });
  });
  document.querySelectorAll("[data-portfolio-view]").forEach((control) => {
    control.addEventListener("click", () => selectPortfolioView(control.dataset.portfolioView));
    control.addEventListener("keydown", handlePortfolioViewKeydown);
  });
  document.querySelectorAll("[data-investment-group]").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      state.portfolioFilter = control.dataset.investmentGroup;
      render();
    });
  });
  $("#portfolio-clear-search").addEventListener("click", () => {
    $("#portfolio-search").value = "";
    render();
    $("#portfolio-search").focus();
  });
  $("#portfolio-reset-filters").addEventListener("click", () => {
    state.portfolioFilter = "all";
    $("#portfolio-search").value = "";
    render();
    $("#portfolio-search").focus();
  });
  document.querySelectorAll("[data-performance-period]").forEach((control) => {
    control.addEventListener("click", () => {
      selectPerformancePeriod(control.dataset.performancePeriod);
    });
    control.addEventListener("keydown", handlePerformancePeriodKeydown);
  });
  function moveTabFocus(event, selector) {
    const tabs = [...document.querySelectorAll(selector)];
    const index = tabs.indexOf(event.currentTarget);
    const next = ["ArrowRight", "ArrowDown"].includes(event.key) ? (index + 1) % tabs.length
      : ["ArrowLeft", "ArrowUp"].includes(event.key) ? (index - 1 + tabs.length) % tabs.length
      : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); tabs[next].click(); tabs[next].focus();
  }
  document.querySelectorAll("[data-income-view]").forEach((control) => {
    control.addEventListener("click", () => { window.location.hash = control.dataset.incomeView === "budget" ? "income/budget" : "income"; });
    control.addEventListener("keydown", (event) => moveTabFocus(event, "[data-income-view]"));
  });
  document.querySelectorAll("[data-income-period]").forEach((control) => {
    control.addEventListener("click", () => {
      state.incomePeriod = control.dataset.incomePeriod;
      render();
    });
  });
  document.querySelectorAll("[data-income-period]").forEach((control) => control.addEventListener("keydown", (event) => moveTabFocus(event, "[data-income-period]")));
  document.querySelectorAll("[data-income-dividend-sort]").forEach((control) => {
    control.addEventListener("click", () => {
      state.incomeDividendSort = control.dataset.incomeDividendSort;
      $("#income-dividend-sort").open = false;
      render();
    });
  });
  document.querySelectorAll("[data-plan-horizon]").forEach((control) => {
    control.addEventListener("click", () => {
      state.planHorizon = Number(control.dataset.planHorizon);
      state.planSelectedYear = state.planHorizon;
      render();
    });
  });
  for (const [key, selector] of Object.entries(scenarioControls)) $(selector).addEventListener("input", event => editPlanScenario(key, event.target.value, event.target.validity.valid));
  $("#plan-selected-year").addEventListener("input", event => { state.planSelectedYear = Number(event.target.value); renderPlan(portfolio()); });
  $("#plan-scenario-form").addEventListener("submit", savePlanScenario);
  $("#plan-scenario-cancel").addEventListener("click", () => { if (planDraft?.pending) return; planDraft = null; renderPlan(portfolio()); $("#plan-weekly-expenses").focus(); });
  $("#plan-reset-amounts").addEventListener("click", () => {
    if (planDraft?.pending) return;
    const draft = beginPlanDraft();
    for (const key of ["weeklyExpensesCents", "weeklyInvestmentCents", "annualIncomeCents"]) { draft.scenario[key] = null; delete draft.raw[key]; }
    draft.invalid = ""; draft.status = "Mercury amounts restored · Save to keep this change"; renderPlan(portfolio());
  });
  $("#plan-income-cadence").addEventListener("change", event => {
    planIncomeCadence = Number(event.target.value);
    if (planDraft?.raw.annualIncomeCents) delete planDraft.raw.annualIncomeCents;
    renderPlan(portfolio());
  });
  $("#edit-plan-assumptions").addEventListener("click", openPlanAssumptionsDialog);
  document.querySelectorAll("[data-open-plan-assumptions]").forEach((control) => {
    control.addEventListener("click", openPlanAssumptionsDialog);
  });
  $("#plan-date-of-birth").addEventListener("input", renderBirthDatePreview);
  $("#close-plan-assumptions-dialog").addEventListener("click", closePlanAssumptionsDialog);
  $("#cancel-plan-assumptions").addEventListener("click", closePlanAssumptionsDialog);
  $("#plan-assumptions-dialog").addEventListener("close", () => { $("#plan-assumptions-dialog").hidden = true; });
  protectDialog("#plan-assumptions-dialog", "#plan-assumptions-form", savePlanAssumptions);
  $("#portfolio-add-property").addEventListener("click", () => openPropertyDialog());
  $("#close-property-dialog").addEventListener("click", closePropertyDialog);
  $("#cancel-property-dialog").addEventListener("click", closePropertyDialog);
  $("#property-dialog").addEventListener("close", () => { $("#property-dialog").hidden = true; });
  $("#property-state").addEventListener("change", () => { renderPropertyCounties(); renderPropertyAppreciation(); });
  $("#property-county").addEventListener("change", renderPropertyAppreciation);
  $("#property-appreciation").addEventListener("input", renderPropertyAppreciation);
  protectDialog("#property-dialog", "#property-form", saveProperty);
  $("#cancel-delete-property").addEventListener("click", closeDeletePropertyDialog);
  $("#delete-property-dialog").addEventListener("close", () => { $("#delete-property-dialog").hidden = true; });
  protectDialog("#delete-property-dialog", "#delete-property-form", deleteProperty);
  $("#portfolio-recurring-sort").addEventListener("change", () => {
    state.recurringSort = $("#portfolio-recurring-sort").value;
    renderRecurringInvestments(portfolio());
  });
  document.querySelectorAll("[data-property-sort]").forEach((control) => {
    control.addEventListener("click", () => {
      state.propertySort = control.dataset.propertySort;
      $("#portfolio-property-sort").open = false;
      render();
    });
  });
  $("#asset-back").addEventListener("click", navigateBackFromAsset);
  $("#asset-cancel").addEventListener("click", () => renderAsset({ resetForm: true }));
  $("#asset-detail-form").addEventListener("submit", saveAssetDetails);
  $("#asset-detail-form").addEventListener("input", () => syncAssetEditState({ announce: true }));
  $("#asset-detail-form").addEventListener("change", () => syncAssetEditState({ announce: true }));
  $("#asset-detail-valuation-basis").addEventListener("change", syncDetailValuationFields);
  $("#asset-refresh-price").addEventListener("click", refreshCurrentAssetPrice);
  $("#asset-retry-price").addEventListener("click", refreshCurrentAssetPrice);
  $("#asset-delete").addEventListener("click", openDeleteAssetDialog);
  $("#cancel-delete-asset").addEventListener("click", closeDeleteAssetDialog);
  $("#delete-asset-dialog").addEventListener("close", () => { $("#delete-asset-dialog").hidden = true; });
  protectDialog("#delete-asset-dialog", "#delete-asset-form", deleteCurrentAsset);
  $("#keep-editing").addEventListener("click", () => {
    pendingDiscard = null;
    $("#discard-changes-dialog").close();
  });
  $("#discard-changes-dialog").addEventListener("cancel", () => { pendingDiscard = null; });
  $("#discard-changes").addEventListener("click", () => {
    const action = pendingDiscard;
    pendingDiscard = null;
    $("#discard-changes-dialog").close();
    action?.();
  });
  $("#discard-changes-dialog").addEventListener("close", () => {
    // Native close events are queued; a subsequent navigation may already
    // have reopened this dialog by the time the earlier event arrives.
    if ($("#discard-changes-dialog").open) return;
    pendingDiscard = null;
    $("#discard-changes-dialog").hidden = true;
  });
  // Capture the actual invoker: Safari does not focus every clicked button.
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.('[aria-haspopup="dialog"][aria-controls]');
    if (!trigger || trigger.disabled) return;
    const entry = protectedDialogs.get($("#" + trigger.getAttribute("aria-controls")));
    if (entry) entry.openingTrigger = trigger;
  }, true);
  document.addEventListener("click", (event) => {
    closeDisclosureAfterAction(event);
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
    const href = link.getAttribute("href");
    if (href === "#main-content") {
      event.preventDefault();
      $("#main-content").focus();
      $("#main-content").scrollIntoView();
      return;
    }
    if (!hasUnsavedWork() && !hasPendingWrite()) return;
    event.preventDefault();
    leaveWorkspace(() => {
      if (href.startsWith("#")) window.location.hash = href;
      else window.location.assign(link.href);
    });
  });
  window.addEventListener("beforeunload", (event) => {
    if (authReloadPending) return;
    if (!hasUnsavedWork() && !hasPendingWrite()) return;
    event.preventDefault();
    event.returnValue = "";
  });
  window.addEventListener("hashchange", render);
  // Acadia's native disclosure contract, delegated for rendered record menus.
  document.addEventListener("pointerdown", (event) => {
    document.querySelectorAll(".acadia-action-menu[open], .acadia-page-header-pattern-sort[open]").forEach((menu) => {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.key !== "Escape") return;
    const activeDialog = event.target.closest?.("dialog[open]");
    document.querySelectorAll(".acadia-action-menu[open], .acadia-page-header-pattern-sort[open]").forEach((menu) => {
      if (menu.closest("dialog[open]") !== activeDialog) return;
      menu.open = false;
      menu.querySelector("summary")?.focus();
      event.preventDefault();
    });
  });
  function closeDisclosureAfterAction(event) {
    const action = event.target.closest?.(".acadia-action-menu-panel button, .acadia-action-menu-panel a, .acadia-page-header-pattern-sort-option");
    if (!action || action.disabled || event.defaultPrevented) return;
    const menu = action.closest?.("details");
    if (!menu) return;
    const hadFocus = document.activeElement === action;
    menu.open = false;
    if (hadFocus && !document.querySelector("dialog[open]")) menu.querySelector("summary")?.focus();
  }
  syncDialogTriggers();
  initialise();
})();
