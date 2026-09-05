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
    totalPropertyEquityCents,
    normalizePlanSettings,
    projectPortfolio,
    resolvePlanAssumptions,
    totalNetWorthCents,
    weeklyEquivalentRecurringContributionCents,
  } = window.MercuryPlan;
  const { summarizePlanningPosition, summarizeHoldingAllocation, summarizeDashboardHistory } = window.MercuryDashboard;
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
    providerMetrics: {}, providerMetricsPending: new Set(), configured: false, pendingQuote: null, quoteTimer: null, quoteRequestId: 0, portfolioFilter: "all", portfolioSort: "value", portfolioView: "cards", propertySort: "value", performancePeriod: "all", incomePeriod: "month", incomeDividendSort: "value", planHorizon: 10, incomeSourceDialogId: null, incomeSourceDeleteId: null, budgetCategoryDialogId: null, budgetCategoryDeleteId: null, propertyDialogId: null, propertyDeleteId: null,
  };

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
  function navigateToAsset(id) {
    if (!routeAssetId()) assetReturnHash = window.location.hash || "#";
    window.location.hash = `asset/${encodeURIComponent(id)}`;
  }
  function navigateBackFromAsset() { window.location.hash = assetReturnHash; }
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
    $("#portfolio-add-property").disabled = disabled || !state.propertiesAvailable;
    $("#add-income").disabled = disabled || !state.incomeSourcesAvailable;
    $("#add-budget-category").disabled = disabled || !state.budgetCategoriesAvailable;
  }

  function renderPerformancePeriods() {
    const periodLabels = { all: "All time", "1y": "1 year", "6m": "6 months", "3m": "3 months" };
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
    setText("#performance-context", `Portfolio value change · ${periodLabels[state.performancePeriod]}`);
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
    const allHistory = summarizeDashboardHistory(state.snapshots, "all");
    renderPerformancePeriods();
    setMovement("#performance-rate", performance.changeRate, (value) => `(${displaySignedPercentage(value)})`, { hideWhenUnavailable: true });
    setMovement("#performance-amount", performance.changeCents, movementCurrency, { hideWhenUnavailable: true });
    setText("#history-start-date", historyDateLabel(performance.startDate));
    setText("#history-end-date", historyDateLabel(performance.endDate));
    setText("#history-latest-value", Number.isSafeInteger(performance.latestValueCents) ? displayCurrency(performance.latestValueCents / 100) : "—");
    setText("#history-available-since", allHistory.startDate ? `Recording since ${historyDateLabel(allHistory.startDate)}` : "No recorded history yet");
    $("#history-building").hidden = performance.showTrend;
    trend.hidden = !performance.showTrend;
    setText("#history-building", `History building · ${performance.recordedDays} ${performance.recordedDays === 1 ? "day" : "days"} recorded`);
    if (!performance.showTrend) {
      trend.replaceChildren();
      setText("#history-summary", `${performance.recordedDays} distinct daily snapshots in this range. The full trend appears after 30 recorded days. Portfolio snapshots exclude property equity.`);
      return performance;
    }
    const values = performance.snapshots.map((point) => point.totalValueCents / 100);
    const minimum = Math.min(...values), maximum = Math.max(...values);
    const range = maximum - minimum;
    const points = values.map((value, index) => `${performance.positions[index]},${range ? 96 - ((value - minimum) / range) * 84 : 50}`);
    const area = `0,100 ${points.join(" ")} 100,100`;
    const startY = points[0].split(",")[1];
    trend.innerHTML = `<svg class="acadia-card-trend-chart is-primary" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline class="acadia-card-trend-baseline" points="0,${startY} 100,${startY}"></polyline><polygon class="acadia-card-trend-area" points="${area}"></polygon><polyline class="acadia-card-trend-line" points="${points.join(" ")}"></polyline></svg>`;
    const summary = `${movementCurrency(performance.changeCents)}${performance.changeRate === null ? "" : ` (${displaySignedPercentage(performance.changeRate)})`} from ${historyDateLabel(performance.startDate)} to ${historyDateLabel(performance.endDate)}. Recorded portfolio value ${currency.format(values[0])} to ${currency.format(values.at(-1))}. Value changes include contributions and withdrawals; property equity is excluded.`;
    trend.setAttribute("aria-label", summary);
    setText("#history-summary", summary);
    return performance;
  }

  function instrumentLabel(value) {
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
      return right.marketValueCents - left.marketValueCents;
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
    return `<div class="mercury-portfolio-asset-identity"><div class="acadia-cluster"><button class="acadia-button acadia-button-quiet mercury-portfolio-asset-link" type="button" data-open-asset-id="${escapeHtml(row.asset.id)}">${escapeHtml(title)}</button>${retirement}</div><span class="acadia-text-muted">${escapeHtml(secondary)}</span></div>`;
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
      button.addEventListener("click", () => navigateToAsset(button.dataset.editId));
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
  function holdingCardMetrics(row) {
    const metrics = holdingMetricSummary(row);
    const price = row.asset.valuationBasis === VALUATION_BASES.MANUAL_VALUE ? "Manual value" : displayCardPrice(row.asset.unitPriceCents);
    const shares = row.asset.shares === null ? "—" : displayCardShares(row.asset.shares);
    return `<dl class="mercury-holding-comparison"><div><dt>Price</dt><dd>${escapeHtml(price)}</dd></div><div><dt>Shares</dt><dd>${escapeHtml(shares)}</dd></div><div><dt title="${escapeHtml(metrics.returnLabel)}">${escapeHtml(metrics.returnShortLabel)}</dt><dd>${escapeHtml(metrics.returnValue)}</dd></div><div><dt title="${escapeHtml(metrics.yieldLabel)}">Yield</dt><dd>${escapeHtml(metrics.yieldValue)}</dd></div></dl>`;
  }
  function renderHoldingCards(grid, rows) {
    grid.replaceChildren(...rows.map((row) => {
      const holding = state.holdings.find((entry) => entry.id === row.asset.id);
      const retirement = row.asset.isRetirement
        ? '<span class="acadia-badge acadia-badge-grey acadia-badge-round acadia-badge-small">Retirement</span>'
        : "";
      const card = document.createElement("article");
      card.className = "acadia-card is-content is-interactive mercury-holding-card";
      card.dataset.holdingId = holding.id;
      card.tabIndex = 0;
      card.setAttribute("aria-label", `Open ${row.asset.symbol || row.asset.name}`);
      card.innerHTML = `<div class="acadia-card-actions" role="group" aria-label="Actions for ${escapeHtml(row.asset.symbol || row.asset.name)}"><details class="acadia-action-menu"><summary class="acadia-action-menu-trigger acadia-icon-action" aria-label="Actions for ${escapeHtml(row.asset.symbol || row.asset.name)}"><i class="fa-solid fa-ellipsis acadia-icon" aria-hidden="true"></i></summary><div class="acadia-action-menu-panel"><button class="acadia-action-menu-item" type="button" data-edit-id="${escapeHtml(holding.id)}">Edit details</button></div></details></div><div class="acadia-card-header"><div class="acadia-card-content-title-row"><h3>${escapeHtml(row.asset.symbol || row.asset.name)}</h3>${retirement}</div><p>${escapeHtml(row.asset.name || instrumentLabel(row.asset.instrumentType))}</p></div><div class="acadia-card-content"><p class="mercury-holding-card-value"><span>Value</span><strong>${escapeHtml(displayCurrency(row.marketValueCents / 100))}</strong></p>${holdingCardMetrics(row)}</div>`;
      card.addEventListener("click", openHoldingFromEvent);
      card.addEventListener("keydown", keyOpenHolding);
      return card;
    }));
    grid.querySelectorAll("[data-edit-id]").forEach((button) => {
      button.addEventListener("click", () => navigateToAsset(button.dataset.editId));
    });
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
    grid.replaceChildren(...topAssets.map((candidate, index) => {
      const item = document.createElement("article");
      item.className = "mercury-home-asset-row";
      item.setAttribute("role", "listitem");
      const button = document.createElement("button");
      button.className = "mercury-home-asset-action";
      button.type = "button";
      if (candidate.kind === "holding") {
        const { row } = candidate;
        const holding = state.holdings.find((entry) => entry.id === row.asset.id);
        const title = row.asset.symbol || row.asset.name;
        const accountClassification = row.asset.isRetirement
          ? "Retirement"
          : row.asset.instrumentType === "crypto"
            ? "Crypto"
            : "Brokerage";
        const specificInstrument = row.asset.instrumentType === "other"
          || instrumentLabel(row.asset.instrumentType).toLowerCase() === accountClassification.toLowerCase()
          ? ""
          : instrumentLabel(row.asset.instrumentType);
        const classification = [accountClassification, specificInstrument].filter(Boolean).join(" · ");
        const detail = row.asset.valuationBasis === VALUATION_BASES.MANUAL_VALUE
          ? "Manual valuation"
          : row.asset.unitPriceCents === null
            ? "Price not set"
            : `${displayCardPrice(row.asset.unitPriceCents)} price · ${displayCardShares(row.asset.shares)} shares`;
        button.dataset.homeHoldingId = holding.id;
        button.setAttribute("aria-label", `Open ${title} asset details`);
        button.innerHTML = `<span class="mercury-home-asset-rank" aria-hidden="true">${index + 1}</span><span class="mercury-home-asset-identity"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(classification)}</small></span><span class="mercury-home-asset-value"><strong>${escapeHtml(displayCurrency(row.marketValueCents / 100))}</strong><small>Current value</small></span><span class="mercury-home-asset-detail">${escapeHtml(detail)}</span><i class="fa-solid fa-chevron-right acadia-icon" aria-hidden="true"></i>`;
        button.addEventListener("click", () => navigateToAsset(holding.id));
        item.append(button);
        return item;
      }
      const { model } = candidate;
      button.dataset.homePropertyId = model.id;
      button.setAttribute("aria-label", `Edit ${model.name} property`);
      button.innerHTML = `<span class="mercury-home-asset-rank" aria-hidden="true">${index + 1}</span><span class="mercury-home-asset-identity"><strong>${escapeHtml(model.name)}</strong><small>Property</small></span><span class="mercury-home-asset-value"><strong>${escapeHtml(displayCurrency(candidate.valueCents / 100))}</strong><small>Equity</small></span><span class="mercury-home-asset-detail">Market value ${escapeHtml(displayCurrency(model.currentValueCents / 100))} · Mortgage ${escapeHtml(displayCurrency(model.mortgageBalanceCents / 100))}</span><i class="fa-solid fa-chevron-right acadia-icon" aria-hidden="true"></i>`;
      button.addEventListener("click", () => openPropertyDialog(model.id));
      item.append(button);
      return item;
    }));
    setText("#holdings-count", candidates.length
      ? `${topAssets.length} of ${candidates.length} shown`
      : "0 assets");
    grid.hidden = topAssets.length === 0;
    $("#holdings-empty").hidden = topAssets.length > 0;
  }

  function matchingPortfolioHoldingRows(summary) {
    const search = $("#portfolio-search").value.trim().toLowerCase();
    return summary.rows.filter((row) => {
      const matchesFilter = state.portfolioFilter === "all"
        || state.portfolioFilter === "brokerage"
        || (state.portfolioFilter === "crypto" && row.asset.instrumentType === "crypto")
        || (state.portfolioFilter === "retirement" && row.asset.isRetirement);
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
    const recurringAssets = recurringPortfolioAssets();
    const weeklyEquivalentCents = weeklyEquivalentRecurringContributionCents(recurringAssets);
    setText("#portfolio-summary-investments", summary.rows.length === state.holdings.length ? displayCurrency(summary.totalMarketValueCents / 100) : "Not set");
    setText("#portfolio-summary-property-equity", state.propertiesAvailable
      ? displayCurrency(totalPropertyEquity() / 100)
      : "Not set");
    setText("#portfolio-summary-recurring-weekly", displayCurrency(weeklyEquivalentCents / 100));
  }
  function renderRecurringInvestments(summary) {
    const assets = recurringPortfolioAssets();
    const weeklyEquivalentCents = weeklyEquivalentRecurringContributionCents(assets);
    setText("#portfolio-recurring-count", `${assets.length} ${assets.length === 1 ? "asset" : "assets"}`);
    setText("#portfolio-recurring-total", `${displayCurrency(weeklyEquivalentCents / 100)} weekly equivalent`);
    const list = $("#portfolio-recurring-list");
    list.innerHTML = assets.map((asset) => {
      const title = asset.symbol || asset.name;
      const detail = asset.name && asset.name !== title
        ? asset.name
        : instrumentLabel(asset.instrumentType);
      const cadence = asset.contributionFrequency === "monthly" ? "Monthly" : "Weekly";
      const retirement = asset.isRetirement
        ? '<span class="acadia-badge acadia-badge-grey acadia-badge-round acadia-badge-small">Retirement</span>'
        : "";
      return `<article class="mercury-recurring-row" role="listitem"><div class="mercury-recurring-identity"><div class="acadia-cluster"><button class="acadia-button acadia-button-quiet mercury-portfolio-asset-link" type="button" data-open-asset-id="${escapeHtml(asset.id)}">${escapeHtml(title)}</button>${retirement}</div><span class="acadia-text-muted">${escapeHtml(detail)}</span></div><div class="mercury-recurring-amount"><strong>${escapeHtml(displayCurrency(asset.contributionCents / 100))}</strong><span>${cadence}</span></div><button class="acadia-button acadia-button-quiet" type="button" data-edit-id="${escapeHtml(asset.id)}">Edit details</button></article>`;
    }).join("");
    bindPortfolioHoldingActions(list);
    $("#portfolio-recurring-empty").hidden = assets.length > 0;
  }
  function renderPortfolioHoldingSort() {
    const labels = { value: "Value", name: "Name", updated: "Recently updated" };
    setText("#portfolio-holding-sort-label", labels[state.portfolioSort]);
    document.querySelectorAll("[data-portfolio-holding-sort]").forEach((control) => {
      control.setAttribute("aria-checked", String(control.dataset.portfolioHoldingSort === state.portfolioSort));
    });
    document.querySelectorAll("[data-portfolio-table-sort-heading]").forEach((heading) => {
      if (heading.dataset.portfolioTableSortHeading === state.portfolioSort) {
        heading.setAttribute("aria-sort", state.portfolioSort === "name" ? "ascending" : "descending");
      } else {
        heading.removeAttribute("aria-sort");
      }
    });
  }
  function renderPortfolioFilters() {
    document.querySelectorAll("[data-portfolio-filter]").forEach((control) => {
      const isCurrent = control.dataset.portfolioFilter === state.portfolioFilter;
      control.setAttribute("aria-pressed", String(isCurrent));
    });
  }
  function renderPortfolioView(hasRows) {
    document.querySelectorAll("[data-portfolio-view]").forEach((control) => {
      const selected = control.dataset.portfolioView === state.portfolioView;
      control.classList.toggle("is-active", selected);
      control.setAttribute("aria-selected", String(selected));
      control.tabIndex = selected ? 0 : -1;
    });
    const tableView = state.portfolioView === "table";
    $("#portfolio-holding-sort").hidden = tableView;
    if (tableView) $("#portfolio-holding-sort").open = false;
    $("#portfolio-cards-panel").hidden = tableView;
    $("#portfolio-table-panel").hidden = !tableView;
    $("#portfolio-holdings-grid").hidden = !hasRows;
    $("#portfolio-holdings-table-wrap").hidden = !hasRows;
    $("#portfolio-holdings-object-list").hidden = !hasRows;
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
      return `<tr><td>${holdingIdentityMarkup(row)}</td><td>${escapeHtml(holdingPriceLabel(row))}</td><td>${escapeHtml(holdingSharesLabel(row))}</td><td aria-label="${escapeHtml(metrics.returnLabel)}: ${escapeHtml(metrics.returnValue)}">${escapeHtml(metrics.returnValue)}</td><td aria-label="${escapeHtml(metrics.yieldLabel)}: ${escapeHtml(metrics.yieldValue)}">${escapeHtml(metrics.yieldValue)}</td><td><strong>${escapeHtml(displayCurrency(row.marketValueCents / 100))}</strong></td><td>${dateMarkup}</td><td>${holdingActionMenuMarkup(row)}</td></tr>`;
    }).join("");
    const objectList = $("#portfolio-holdings-object-list");
    objectList.innerHTML = rows.map((row) => {
      const metrics = holdingMetricSummary(row);
      const updated = holdingUpdatedLabel(row);
      return `<article class="acadia-object-card"><div class="acadia-object-card-header">${holdingIdentityMarkup(row)}<div class="acadia-object-actions">${holdingActionMenuMarkup(row)}</div></div><div class="acadia-object-meta"><span>Updated ${escapeHtml(updated.label)}</span></div><dl class="mercury-portfolio-object-metrics"><div><dt>Price</dt><dd>${escapeHtml(holdingPriceLabel(row))}</dd></div><div><dt>Shares</dt><dd>${escapeHtml(holdingSharesLabel(row))}</dd></div><div><dt>Return</dt><dd aria-label="${escapeHtml(metrics.returnLabel)}: ${escapeHtml(metrics.returnValue)}">${escapeHtml(metrics.returnValue)}</dd></div><div><dt>Yield</dt><dd aria-label="${escapeHtml(metrics.yieldLabel)}: ${escapeHtml(metrics.yieldValue)}">${escapeHtml(metrics.yieldValue)}</dd></div><div><dt>Value</dt><dd><strong>${escapeHtml(displayCurrency(row.marketValueCents / 100))}</strong></dd></div></dl></article>`;
    }).join("");
    bindPortfolioHoldingActions(tableBody);
    bindPortfolioHoldingActions(objectList);
  }
  function renderPortfolioHoldings(summary) {
    renderPortfolioHoldingSort();
    renderPortfolioFilters();
    const matchingRows = matchingPortfolioHoldingRows(summary);
    const rows = sortHoldingRows(matchingRows, state.portfolioSort);
    const grid = $("#portfolio-holdings-grid");
    renderHoldingCards(grid, rows);
    renderPortfolioTable(rows);
    renderPortfolioView(rows.length > 0);
    setText("#portfolio-holdings-count", `${matchingRows.length} ${matchingRows.length === 1 ? "asset" : "assets"}`);
    $("#portfolio-holdings-empty").hidden = rows.length > 0;
    if (!rows.length) {
      const hasAssets = state.holdings.length > 0;
      setText("#portfolio-holdings-empty-title", hasAssets ? "No matching assets" : "No assets yet");
      setText("#portfolio-holdings-empty-copy", hasAssets
        ? "Adjust your search or filter to see a different investment."
        : "Add an asset to begin your private Brokerage workspace.");
    }
  }

  function propertyModel(property) {
    return {
      id: property.id,
      accountId: property.account_id,
      name: property.name || "Home",
      location: property.location || null,
      currentValueCents: Number(property.current_value_cents),
      mortgageBalanceCents: Number(property.mortgage_balance_cents),
      annualAppreciationRate: property.annual_appreciation_rate === null ? null : Number(property.annual_appreciation_rate),
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
      return propertyEquityCents(propertyModel(right)) - propertyEquityCents(propertyModel(left));
    });
  }
  function renderPropertySort() {
    const labels = { value: "Value", name: "Name" };
    setText("#portfolio-property-sort-label", labels[state.propertySort]);
    document.querySelectorAll("[data-property-sort]").forEach((control) => {
      control.setAttribute("aria-checked", String(control.dataset.propertySort === state.propertySort));
    });
  }
  function renderPropertyCards(properties) {
    const grid = $("#portfolio-properties-grid");
    grid.replaceChildren(...properties.map((property) => {
      const model = propertyModel(property);
      const equityCents = propertyEquityCents(model);
      const card = document.createElement("article");
      card.className = "acadia-card is-content mercury-property-card";
      card.setAttribute("aria-label", `${model.name}${model.location ? `, ${model.location}` : ""}, market value ${displayCurrency(model.currentValueCents / 100)}, mortgage balance ${displayCurrency(model.mortgageBalanceCents / 100)}, equity ${displayCurrency(equityCents / 100)}`);
      card.innerHTML = `<div class="acadia-card-actions" role="group" aria-label="Actions for ${escapeHtml(model.name)}"><details class="acadia-action-menu"><summary class="acadia-action-menu-trigger acadia-icon-action" aria-label="Actions for ${escapeHtml(model.name)}"><i class="fa-solid fa-ellipsis acadia-icon" aria-hidden="true"></i></summary><div class="acadia-action-menu-panel"><button class="acadia-action-menu-item" type="button" data-edit-property-id="${escapeHtml(model.id)}">Edit property</button><div class="acadia-action-menu-divider"></div><button class="acadia-action-menu-item is-danger" type="button" data-delete-property-id="${escapeHtml(model.id)}">Delete property</button></div></details></div><div class="acadia-card-header"><h3>${escapeHtml(model.name)}</h3>${model.location ? `<p>${escapeHtml(model.location)}</p>` : ""}</div><div class="acadia-card-content"><dl class="mercury-property-metrics"><div><dt>Market value</dt><dd>${escapeHtml(displayCurrency(model.currentValueCents / 100))}</dd></div><div><dt>Mortgage balance</dt><dd>${escapeHtml(displayCurrency(model.mortgageBalanceCents / 100))}</dd></div><div><dt>Equity</dt><dd><strong>${escapeHtml(displayCurrency(equityCents / 100))}</strong></dd></div></dl></div>`;
      return card;
    }));
    grid.querySelectorAll("[data-edit-property-id]").forEach((button) => {
      button.addEventListener("click", () => openPropertyDialog(button.dataset.editPropertyId));
    });
    grid.querySelectorAll("[data-delete-property-id]").forEach((button) => {
      button.addEventListener("click", () => openDeletePropertyDialog(button.dataset.deletePropertyId));
    });
  }
  function renderProperties() {
    const hasProperties = state.properties.length > 0;
    const properties = sortProperties(matchingProperties());
    renderPropertySort();
    setText("#portfolio-properties-count", `${properties.length} ${properties.length === 1 ? "property" : "properties"}`);
    $("#portfolio-properties-grid").hidden = !state.propertiesAvailable;
    $("#portfolio-properties-empty").hidden = !state.propertiesAvailable || properties.length > 0;
    if (!state.propertiesAvailable) {
      setText("#portfolio-properties-empty-title", "Property unavailable");
      setText("#portfolio-properties-empty-copy", "Apply the latest private property migration to add and view properties.");
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
    node.innerHTML = allocation.rows.length ? `<div class="mercury-allocation-rows">${allocation.rows.map((row) => `<div class="acadia-card-progress"><div class="acadia-card-progress-heading"><span>${escapeHtml(row.name)}</span><span class="mercury-allocation-amount">${escapeHtml(planningValue(row.valueCents))}<span>${percentage.format(row.allocationRate)}</span></span></div><progress value="${row.valueCents}" max="${allocation.totalValueCents}" aria-label="${escapeHtml(row.name)}: ${percentage.format(row.allocationRate)} of valued investments"></progress></div>`).join("")}</div><p class="mercury-caption">${coverage}</p>` : `<p class="mercury-caption">No investment value to allocate.${allocation.unvaluedCount ? ` ${coverage}` : ""}</p>`;
    return allocation;
  }
  function renderReview(summary, allocation) {
    const reviews = [];
    const unavailable = [[!state.configured || !state.account, "account", "#portfolio"], [!state.propertiesAvailable, "property equity", "#portfolio"], [!state.incomeSourcesAvailable, "income sources", "#income"], [!state.budgetCategoriesAvailable, "budget categories", "#income/budget"]].filter(([missing]) => missing);
    if (unavailable.length) reviews.push({ title: `${unavailable.length} ${unavailable.length === 1 ? "data source unavailable" : "data sources unavailable"}`, detail: unavailable.map(([, label]) => label).join(", "), href: unavailable[0][2], action: "Review setup" });
    const missingMetrics = summary.rows.filter((row) => row.estimatedAnnualGrowthCents === null || row.estimatedAnnualIncomeCents === null).length;
    if (allocation.unvaluedCount || (missingMetrics && !state.providerMetricsPending.size)) reviews.push({ title: "Incomplete portfolio coverage", detail: [allocation.unvaluedCount ? `${allocation.unvaluedCount} missing valuations` : null, missingMetrics ? (state.providerMetricsPending.size ? "Metrics loading" : `${missingMetrics} holdings with incomplete estimates`) : null].filter(Boolean).join(" · "), href: "#portfolio", action: "Review holdings" });
    const history = summarizeDashboardHistory(state.snapshots, "all");
    if (!history.showTrend) reviews.push({ title: "History is building", detail: `${history.recordedDays} of 30 daily observations recorded. No action needed.`, href: null });
    if (summary.rows.length === state.holdings.length && summary.totalDayChangeCents < 0) reviews.push({ title: "Portfolio value decreased", detail: `${movementCurrency(summary.totalDayChangeCents)} since prior close.`, href: "#portfolio", action: "View portfolio" });
    $("#home-review-list").innerHTML = reviews.length ? reviews.slice(0, 4).map((item) => `<li><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p>${item.href ? `<a class="acadia-button acadia-button-quiet" href="${item.href}">${item.action}<i class="fa-solid fa-arrow-right acadia-icon" aria-hidden="true"></i></a>` : ""}</li>`).join("") : '<li><p>No review items</p></li>';
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
    setText("#home-investments", summary.rows.length === state.holdings.length ? planningValue(summary.totalMarketValueCents) : "Not set");
    setText("#home-property-equity", state.propertiesAvailable ? planningValue(totalPropertyEquity()) : "Not set");
    const planning = planningPosition(summary, "month");
    for (const [id, key] of [["income", "expectedCents"], ["spending", "spendingCents"], ["investing", "investingCents"], ["balance", "balanceCents"]]) setText(`#home-planning-${id}`, planningValue(planning[key]));
    renderHistory();
    const dailyMovementComplete = summary.rows.length === state.holdings.length;
    setMovement("#metric-change-value", dailyMovementComplete ? summary.totalDayChangeCents : null, movementCurrency);
    setMovement("#metric-change-rate", dailyMovementComplete ? summary.totalDayChangeRate : null, displaySignedPercentage, { hideWhenUnavailable: true });
    setText("#portfolio-warnings", state.holdings.length ? summary.warnings.join(" ") : "");
    renderHoldings(summary);
    renderReview(summary, renderAllocation("#home-allocation"));
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
      control.setAttribute("aria-checked", String(control.dataset.incomeDividendSort === state.incomeDividendSort));
    });
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
      const yieldDisplay = Number.isFinite(yieldRate) ? percentage.format(yieldRate) : isLoading ? "Loading…" : "Not set";
      const card = document.createElement("tr");
      card.innerHTML = `<th scope="row"><strong>${escapeHtml(row.asset.symbol || row.asset.name)}</strong><small>${escapeHtml(row.asset.name || instrumentLabel(row.asset.instrumentType))}</small></th><td data-label="Estimated annual income">${amount}</td><td data-label="Annual yield">${yieldDisplay}</td>`;
      return card;
    }));
    setText("#income-dividends-count", `${matchingRows.length} ${matchingRows.length === 1 ? "source" : "sources"}`);
    $("#income-dividends-empty").hidden = rows.length > 0;
    grid.closest(".mercury-income-table-wrap").hidden = rows.length === 0;
    if (!rows.length) {
      const hasEligible = summary.rows.some((row) => row.asset.instrumentType !== "crypto");
      $("#income-dividends-empty").querySelector("strong").textContent = hasEligible ? "No matching dividend sources" : "No dividend sources";
    }
  }
  function matchingIncomeSources(rows) {
    const search = $("#income-sources-search").value.trim().toLowerCase();
    return rows.filter((row) => !search || `${row.source.name} ${row.source.incomeType}`.toLowerCase().includes(search));
  }
  function renderIncomeSources(incomeSummary) {
    const matchingRows = matchingIncomeSources(incomeSummary.rows);
    const grid = $("#income-sources-grid");
    grid.replaceChildren(...matchingRows.map((row) => {
      const source = row.source;
      const card = document.createElement("article");
      card.className = "mercury-income-source-row";
      card.setAttribute("role", "listitem");
      card.innerHTML = `<div class="mercury-record-identity"><strong>${escapeHtml(source.name)}</strong><small>${escapeHtml(incomeTypeLabel(source.incomeType))}</small></div><div class="mercury-record-cadence"><strong>${planningValue(source.amountCents)}</strong><small>${INCOME_FREQUENCIES[source.frequency].label}</small></div><div class="mercury-record-total"><strong>${planningValue(row.periodIncomeCents)}</strong><small>per ${incomePeriodLabel()}</small></div><div class="acadia-row-actions"><button class="acadia-button acadia-button-quiet" type="button" data-edit-income-source="${escapeHtml(source.id)}" aria-label="Edit ${escapeHtml(source.name)}">Edit</button><button class="acadia-icon-action" type="button" data-delete-income-source="${escapeHtml(source.id)}" aria-label="Delete ${escapeHtml(source.name)}"><i class="fa-solid fa-trash acadia-icon" aria-hidden="true"></i></button></div>`;
      return card;
    }));
    grid.querySelectorAll("[data-edit-income-source]").forEach((control) => control.addEventListener("click", () => openIncomeSourceDialog(control.dataset.editIncomeSource)));
    grid.querySelectorAll("[data-delete-income-source]").forEach((control) => control.addEventListener("click", () => openDeleteIncomeSourceDialog(control.dataset.deleteIncomeSource)));
    setText("#income-sources-count", `${matchingRows.length} ${matchingRows.length === 1 ? "source" : "sources"}`);
    $("#income-sources-empty").hidden = matchingRows.length > 0;
    if (!matchingRows.length) {
      const title = $("#income-sources-empty").querySelector("strong");
      const copy = $("#income-sources-empty").querySelector("p");
      title.textContent = !state.incomeSourcesAvailable
        ? "Income sources are unavailable"
        : state.incomeSources.length ? "No matching income sources" : "No income sources yet";
      copy.textContent = !state.incomeSourcesAvailable
        ? "Saved income sources could not be loaded. Try reloading the page."
        : "Add expected recurring income to include it in your planning totals.";
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
    list.replaceChildren(...matchingRows.map((row) => {
      const category = row.category;
      const item = document.createElement("tr");
      item.innerHTML = `<th scope="row">${escapeHtml(category.name)}</th><td data-label="Monthly amount">${planningValue(category.monthlyAmountCents)}</td><td data-label="Share">${percentage.format(row.allocationRate)}</td><td data-label="Actions"><span class="acadia-row-actions"><button class="acadia-button acadia-button-quiet" type="button" data-edit-budget-category="${escapeHtml(category.id)}" aria-label="Edit ${escapeHtml(category.name)}">Edit</button><button class="acadia-icon-action" type="button" data-delete-budget-category="${escapeHtml(category.id)}" aria-label="Delete ${escapeHtml(category.name)}"><i class="fa-solid fa-trash acadia-icon" aria-hidden="true"></i></button></span></td>`;
      return item;
    }));
    list.querySelectorAll("[data-edit-budget-category]").forEach((control) => control.addEventListener("click", () => openBudgetCategoryDialog(control.dataset.editBudgetCategory)));
    list.querySelectorAll("[data-delete-budget-category]").forEach((control) => control.addEventListener("click", () => openDeleteBudgetCategoryDialog(control.dataset.deleteBudgetCategory)));
    setText("#income-budget-count", `${matchingRows.length} ${matchingRows.length === 1 ? "category" : "categories"}`);
    $("#income-budget-empty").hidden = matchingRows.length > 0;
    list.closest(".mercury-income-table-wrap").hidden = matchingRows.length === 0;
    if (!matchingRows.length) {
      const title = $("#income-budget-empty").querySelector("strong");
      const copy = $("#income-budget-empty").querySelector("p");
      title.textContent = !state.budgetCategoriesAvailable
        ? "Budget categories are unavailable"
        : state.budgetCategories.length ? "No matching budget categories" : "No budget categories yet";
      copy.textContent = !state.budgetCategoriesAvailable
        ? "Saved budget categories could not be loaded. Try reloading the page."
        : "Add monthly category limits to build your spending plan.";
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
    setText("#income-balance-period", `/ ${incomePeriodLabel()}`);
    setText("#income-balance-status", planning.balanceCents === null ? "Complete income and allocation data is needed" : planning.balanceCents < 0 ? "Planned allocations exceed expected income" : planning.balanceCents === 0 ? "Expected income is fully allocated" : "After planned spending and investing");
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
  function planProjection(summary) {
    const settings = planSettingsModel(state.planSettings);
    const assumptions = resolvePlanAssumptions(settings || {} , summary);
    const annualContributionCents = annualRecurringContributionCents(
      state.holdings.map((holding) => ({
        contributionCents: holding.contribution_cents === null ? null : Number(holding.contribution_cents),
        contributionFrequency: holding.contribution_frequency,
      })),
      {
        legacyWeeklyContributionCents: Number(state.account?.weekly_contribution_cents || 0),
        legacyWeeklyAllocationRate: summary.weeklyContributionRate,
      },
    );
    return {
      assumptions,
      annualContributionCents,
      projection: projectPortfolio({
        currentValueCents: summary.totalMarketValueCents,
        annualContributionCents,
        expectedAnnualReturnRate: assumptions.expectedAnnualReturnRate,
        distributionYieldRate: assumptions.distributionYieldRate,
        distributionPolicy: assumptions.distributionPolicy,
        horizonYears: state.planHorizon,
      }),
    };
  }
  function policyLabel(value) {
    return ({
      reinvest: "Reinvest",
      "transfer-to-bank": "Transfer to bank",
      "transfer-to-fund": "Transfer to fund",
      "hold-cash": "Hold cash",
    })[value] || "Reinvest";
  }
  function renderPlanChart({ chartSelector, axisSelector, endpointsSelector, summarySelector, points, key, label, unavailableText }) {
    const chart = $(chartSelector);
    const axis = $(axisSelector);
    const endpoints = $(endpointsSelector);
    const summary = $(summarySelector);
    if (!points.length) {
      chart.innerHTML = `<span class="acadia-card-trend-empty">${unavailableText}</span>`;
      chart.setAttribute("aria-label", `${label} unavailable until return and yield assumptions are set`);
      axis.replaceChildren();
      endpoints.textContent = "Not set";
      summary.textContent = `${label}: ${unavailableText}`;
      return;
    }
    const values = points.map((point) => point[key] / 100);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const range = maximum - minimum || 1;
    const pointsString = values.map((value, index) => `${(index / (values.length - 1)) * 100},${96 - ((value - minimum) / range) * 84}`).join(" ");
    const area = `0,100 ${pointsString} 100,100`;
    chart.innerHTML = `<svg class="acadia-card-trend-chart is-primary" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon class="acadia-card-trend-area" points="${area}"></polygon><polyline class="acadia-card-trend-line" points="${pointsString}"></polyline></svg>`;
    const first = points[0];
    const last = points.at(-1);
    const firstValue = displayCurrency(first[key] / 100);
    const lastValue = displayCurrency(last[key] / 100);
    chart.setAttribute("aria-label", `${label}: ${firstValue} now to ${lastValue} in year ${last.year}.`);
    axis.innerHTML = `<span>Now</span><span>Year ${Math.round(last.year / 2)}</span><span>Year ${last.year}</span>`;
    endpoints.innerHTML = `<span><small>Now</small><strong>${firstValue}</strong></span><span><small>Year ${last.year}</small><strong>${lastValue}</strong></span>`;
    summary.textContent = `${label}: ${firstValue} now and ${lastValue} in year ${last.year}.`;
  }
  function renderPlan(summary) {
    $("#home-workspace").hidden = true;
    $("#portfolio-workspace").hidden = true;
    $("#income-workspace").hidden = true;
    $("#plan-workspace").hidden = false;
    $("#asset-workspace").hidden = true;
    setActiveNavigation("plan");
    const plan = planProjection(summary);
    const { assumptions, projection } = plan;
    const points = state.planDataAvailable ? projection.points : [];
    const finalPoint = points.at(-1);
    const metricsLoading = state.providerMetricsPending.size > 0;
    const unavailableText = !state.planDataAvailable
      ? "Apply the latest private Plan schema migration to view this workspace."
      : metricsLoading
        ? "Loading current portfolio metrics…"
        : "Set return and yield assumptions to view this projection.";
    setText("#plan-current-value", displayCurrency(summary.totalMarketValueCents / 100));
    setText("#plan-projected-value-label", `Projected in ${state.planHorizon} years`);
    setText("#plan-projected-value", state.planDataAvailable && projection.available ? displayCurrency(finalPoint.investmentValueCents / 100) : metricsLoading ? "Loading…" : "Not set");
    setText("#plan-projected-income", state.planDataAvailable && projection.available ? displayCurrency(finalPoint.projectedIncomeCents / 100) : metricsLoading ? "Loading…" : "Not set");
    document.querySelectorAll("[data-plan-horizon]").forEach((control) => {
      const active = Number(control.dataset.planHorizon) === state.planHorizon;
      control.classList.toggle("is-active", active);
      control.setAttribute("aria-pressed", String(active));
    });
    renderPlanChart({ chartSelector: "#plan-value-chart", axisSelector: "#plan-value-axis", endpointsSelector: "#plan-value-endpoints", summarySelector: "#plan-value-summary", points, key: "investmentValueCents", label: "Projected investment value", unavailableText });
    renderPlanChart({ chartSelector: "#plan-income-chart", axisSelector: "#plan-income-axis", endpointsSelector: "#plan-income-endpoints", summarySelector: "#plan-income-summary", points, key: "projectedIncomeCents", label: "Projected portfolio income", unavailableText });
    setText("#plan-assumption-current-value", displayCurrency(summary.totalMarketValueCents / 100));
    setText("#plan-assumption-contributions", `${displayCurrency(plan.annualContributionCents / 100)} / year`);
    setText("#plan-assumption-return", Number.isFinite(assumptions.expectedAnnualReturnRate) ? percentage.format(assumptions.expectedAnnualReturnRate) : "Not set");
    setText("#plan-assumption-yield", Number.isFinite(assumptions.distributionYieldRate) ? percentage.format(assumptions.distributionYieldRate) : metricsLoading ? "Loading…" : "Not set");
    setText("#plan-assumption-policy", policyLabel(assumptions.distributionPolicy));
    const missingReturn = !Number.isFinite(assumptions.expectedAnnualReturnRate);
    const missingYield = !Number.isFinite(assumptions.distributionYieldRate);
    setText("#plan-assumptions-status", !state.planDataAvailable
      ? "Apply the latest private Plan schema migration to save assumptions and home details."
      : projection.available ? "Plan-only overrides take precedence over Portfolio values."
        : metricsLoading ? "Loading current Portfolio yield coverage."
          : missingReturn && missingYield ? "Set a return and yield assumption to create a projection."
            : missingReturn ? "Set a Base plan return assumption to create a projection."
              : "Set a Base plan yield assumption to create a projection.");
    $("#edit-plan-assumptions").disabled = !state.planDataAvailable;
    document.querySelectorAll("[data-open-plan-assumptions]").forEach((button) => { button.disabled = !state.planDataAvailable; });
    const propertyCount = state.properties.length;
    $("#plan-property-equity").hidden = !state.propertiesAvailable || propertyCount === 0;
    if (propertyCount > 0) {
      setText("#plan-property-equity-value", displayCurrency(totalPropertyEquity() / 100));
      setText("#plan-property-equity-count", `${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`);
    }
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
  let renderedAssetId = null;
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
    if (!holding) {
      setText("#asset-title", "Asset unavailable");
      setText("#asset-subtitle", "This asset is not available in your current Brokerage account.");
      setText("#asset-price", "—");
      setText("#asset-status", "Return to Portfolio to select an available asset.");
      return;
    }

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

    // Refresh the summary without replacing a draft while provider data arrives.
    if (renderedAssetId === id && !resetForm) return;
    renderedAssetId = id;
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
    $("#asset-manual-valuation").hidden = !hasManualValuation;
    setValue("#asset-detail-valuation-basis", holding.valuation_basis);
    setValue("#asset-detail-manual-price", holding.manual_price_cents === null ? null : Number(holding.manual_price_cents) / 100);
    setValue("#asset-detail-manual-value", holding.manual_value_cents === null ? null : Number(holding.manual_value_cents) / 100);
    syncDetailValuationFields();
    setText("#asset-detail-status", "");
  }

  let renderedPortfolio = false;
  function render() {
    if (state.configured && !state.user) {
      ["home", "portfolio", "income", "plan", "asset"].forEach((page) => { $(`#${page}-workspace`).hidden = true; });
      $("#auth-panel").hidden = false;
      setControlsDisabled(true);
      document.title = "Mercury | Sign in";
      $("#main-content").setAttribute("aria-busy", "false");
      return;
    }
    if (!routeAssetId()) renderedAssetId = null;
    const isPortfolio = routePortfolio();
    if (isPortfolio && !renderedPortfolio) state.portfolioView = "cards";
    renderedPortfolio = isPortfolio;
    const focused = document.activeElement;
    const focusAttribute = ["data-edit-income-source", "data-edit-budget-category", "data-delete-income-source", "data-delete-budget-category"].find((attribute) => focused?.hasAttribute(attribute));
    const focusValue = focusAttribute ? focused.getAttribute(focusAttribute) : null;
    setControlsDisabled(!state.configured);
    const summary = portfolio();
    if (routeAssetId()) renderAsset();
    else if (routePortfolio()) renderPortfolio(summary);
    else if (routeIncome()) renderIncome(summary);
    else if (routePlan()) renderPlan(summary);
    else renderHome(summary);
    const pageTitle = routeAssetId() ? $("#asset-title").textContent : routePortfolio() ? "Portfolio" : routeIncome() ? (window.location.hash === "#income/budget" ? "Budget" : "Income") : routePlan() ? "Plan" : "Home";
    document.title = `Mercury | ${pageTitle}`;
    $("#main-content").setAttribute("aria-busy", "false");
    if (focusAttribute && !focused.isConnected) {
      const replacement = document.querySelector(`[${focusAttribute}="${CSS.escape(focusValue)}"]`);
      (replacement || $(focusAttribute.includes("budget") ? "#add-budget-category" : "#add-income")).focus();
    }
  }

  function getFormValue(form, key) {
    const value = new FormData(form).get(key);
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
    renderQuickQuotePreview();
  }
  function setQuickAddStatus(message, { quiet = false } = {}) {
    const status = $("#quote-form-status");
    status.textContent = message || "";
    status.hidden = !message;
    status.classList.toggle("acadia-sr-only", Boolean(message) && quiet);
  }
  function quickPreviewPriceCents() {
    if (state.pendingQuote) return state.pendingQuote.priceCents;
    const manualPriceCents = cents(getFormValue($("#asset-form"), "manualPrice"));
    return Number.isSafeInteger(manualPriceCents) && manualPriceCents >= 0 ? manualPriceCents : null;
  }
  function renderQuickQuotePreview() {
    if (manualValuation()) {
      const manualValueCents = cents(getFormValue($("#asset-form"), "manualValue"));
      setText("#asset-price-preview", "—");
      setText(
        "#asset-value-preview",
        Number.isSafeInteger(manualValueCents) && manualValueCents >= 0
          ? displayCurrency(manualValueCents / 100)
          : "—",
      );
      return;
    }
    const priceCents = quickPreviewPriceCents();
    const valueCents = calculateQuotePreviewValueCents($("#asset-shares").value, priceCents);
    setText("#asset-price-preview", priceCents === null ? "—" : displayCurrency(priceCents / 100));
    setText("#asset-value-preview", valueCents === null ? "—" : displayCurrency(valueCents / 100));
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
  }
  let quickAssetId = null;
  function openQuickAdd() {
    quickAssetId = crypto.randomUUID();
    const form = $("#asset-form");
    form.reset();
    clearTimeout(state.quoteTimer);
    invalidateQuickQuote();
    clearManualFallback();
    setQuickAddStatus("");
    syncQuickValuationFields();
    $("#asset-dialog").showModal();
    $("#asset-symbol").focus();
  }

  async function sessionToken() {
    const { data } = await state.client.auth.getSession();
    return data.session?.access_token;
  }
  async function requestQuote(symbol, instrumentType = "other", { includeMetrics = false } = {}) {
    const token = await sessionToken();
    const metricsQuery = includeMetrics ? "&includeMetrics=1" : "";
    const response = await fetch(`/api/portfolio/quotes?symbol=${encodeURIComponent(symbol)}&instrumentType=${encodeURIComponent(instrumentType)}${metricsQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Quote lookup failed.");
    return data;
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
        `${preciseCurrency.format(quote.priceCents / 100)} from ${quote.source}. As of ${dateLabel(quote.asOf)}.`,
        { quiet: true },
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
      if (state.pendingQuote) {
        const { error: quoteError } = await state.client.from("holding_quotes").upsert({
          holding_id: holding.id,
          price_cents: state.pendingQuote.priceCents,
          previous_close_cents: state.pendingQuote.priorCloseCents,
          ...quoteDividendFields(holding.id, state.pendingQuote),
          source: state.pendingQuote.source,
          as_of: state.pendingQuote.asOf,
        }, { onConflict: "holding_id,as_of" });
        if (quoteError) throw quoteError;
      }
      $("#asset-dialog").close();
      await loadData();
      setText("#data-status", "Saved to your private Brokerage account.");
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
    const hasManualValuation = holding.valuation_basis === VALUATION_BASES.MANUAL_VALUE || holding.manual_price_cents !== null;
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
    if (!holding) return;
    const save = $("#asset-save");
    try {
      save.disabled = true;
      save.textContent = "Saving…";
      const { error } = await state.client.from("holdings").update(detailHolding(holding)).eq("id", holding.id);
      if (error) throw error;
      await loadData();
      if (routeAssetId() === holding.id) renderAsset({ resetForm: true });
      setText("#asset-detail-status", "Details saved.");
      setText("#data-status", "Saved to your private Brokerage account.");
    } catch (error) {
      setText("#asset-detail-status", error.message || "This asset could not be saved.");
    } finally {
      save.disabled = false;
      save.textContent = "Save";
    }
  }

  function openDeleteAssetDialog() {
    const holding = state.holdings.find((entry) => entry.id === routeAssetId());
    if (!holding) return;
    const label = holding.symbol || holding.name || "this asset";
    setText("#delete-asset-title", `Delete ${label}?`);
    setText("#delete-asset-description", `This permanently removes ${label} and its saved quotes from your Brokerage account. Historical portfolio snapshots stay unchanged.`);
    setText("#delete-asset-status", "");
    $("#delete-asset-dialog").hidden = false;
    $("#delete-asset-dialog").showModal();
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
      state.holdings = state.holdings.filter((entry) => entry.id !== holding.id);
      state.quotes = state.quotes.filter((quote) => quote.holding_id !== holding.id);
      closeDeleteAssetDialog();
      window.location.hash = "portfolio";
      await loadData();
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
    $("#income-source-dialog").showModal();
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
    const source = state.incomeSources.find((entry) => entry.id === id);
    if (!source) return;
    state.incomeSourceDeleteId = id;
    setText("#delete-income-source-title", `Delete ${source.name}?`);
    setText("#delete-income-source-description", `This permanently removes ${source.name} from your expected income plan.`);
    setText("#delete-income-source-status", "");
    $("#delete-income-source-dialog").hidden = false;
    $("#delete-income-source-dialog").showModal();
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
    $("#budget-category-dialog").showModal();
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
    const category = state.budgetCategories.find((entry) => entry.id === id);
    if (!category) return;
    state.budgetCategoryDeleteId = id;
    setText("#delete-budget-category-title", `Delete ${category.name}?`);
    setText("#delete-budget-category-description", `This permanently removes ${category.name} from your spending plan.`);
    setText("#delete-budget-category-status", "");
    $("#delete-budget-category-dialog").hidden = false;
    $("#delete-budget-category-dialog").showModal();
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

  function openPlanAssumptionsDialog() {
    if (!state.planDataAvailable) return;
    const settings = planSettingsModel(state.planSettings);
    const form = $("#plan-assumptions-form");
    form.reset();
    $("#plan-expected-return").value = settings?.expectedAnnualReturnRate === null || !settings
      ? ""
      : settings.expectedAnnualReturnRate * 100;
    $("#plan-distribution-yield").value = settings?.distributionYieldRate === null || !settings
      ? ""
      : settings.distributionYieldRate * 100;
    $("#plan-distribution-policy").value = settings?.distributionPolicy || "reinvest";
    setText("#plan-assumptions-form-status", "");
    $("#plan-assumptions-dialog").hidden = false;
    $("#plan-assumptions-dialog").showModal();
  }
  function closePlanAssumptionsDialog() { $("#plan-assumptions-dialog").close(); }
  async function savePlanAssumptions(event) {
    event.preventDefault();
    if (!state.account) return;
    const save = $("#save-plan-assumptions");
    try {
      save.disabled = true;
      save.textContent = "Saving…";
      const settings = normalizePlanSettings({
        accountId: state.account.id,
        expectedAnnualReturnRate: rate(getFormValue($("#plan-assumptions-form"), "expectedAnnualReturn")),
        distributionYieldRate: rate(getFormValue($("#plan-assumptions-form"), "distributionYield")),
        distributionPolicy: getFormValue($("#plan-assumptions-form"), "distributionPolicy"),
      });
      const { data, error } = await state.client.from("plan_settings").upsert({
        account_id: state.account.id,
        expected_annual_return_rate: settings.expectedAnnualReturnRate,
        distribution_yield_rate: settings.distributionYieldRate,
        distribution_policy: settings.distributionPolicy,
      }, { onConflict: "account_id" }).select().single();
      if (error) throw error;
      state.planSettings = data;
      closePlanAssumptionsDialog();
      render();
    } catch (error) {
      setText("#plan-assumptions-form-status", error.message || "The Base plan assumptions could not be saved.");
    } finally {
      save.disabled = false;
      save.textContent = "Save";
    }
  }

  function openPropertyDialog(id = null) {
    if (!state.propertiesAvailable) return;
    const form = $("#property-form");
    const property = state.properties.find((entry) => entry.id === id);
    state.propertyDialogId = property?.id || null;
    form.reset();
    setText("#property-dialog-title", property ? "Edit property" : "Add property");
    setText("#save-property", property ? "Save property" : "Add property");
    setText("#property-form-status", "");
    if (property) {
      const model = propertyModel(property);
      $("#property-name").value = model.name;
      $("#property-location").value = model.location || "";
      $("#property-current-value").value = (model.currentValueCents / 100).toFixed(2);
      $("#property-debt-balance").value = (model.mortgageBalanceCents / 100).toFixed(2);
    }
    $("#property-dialog").hidden = false;
    $("#property-dialog").showModal();
  }
  function closePropertyDialog() { $("#property-dialog").close(); }
  async function saveProperty(event) {
    event.preventDefault();
    if (!state.account) return;
    const save = $("#save-property");
    try {
      save.disabled = true;
      save.textContent = "Saving…";
      const property = normalizeProperty({
        accountId: state.account.id,
        name: getFormValue($("#property-form"), "name"),
        location: getFormValue($("#property-form"), "location"),
        currentValueCents: cents(getFormValue($("#property-form"), "currentValue")),
        mortgageBalanceCents: cents(getFormValue($("#property-form"), "mortgageBalance")) ?? 0,
      });
      const payload = {
        account_id: state.account.id,
        name: property.name,
        location: property.location,
        current_value_cents: property.currentValueCents,
        mortgage_balance_cents: property.mortgageBalanceCents,
      };
      const query = state.propertyDialogId
        ? state.client.from("home_properties").update(payload).eq("id", state.propertyDialogId)
        : state.client.from("home_properties").insert(payload);
      const { data, error } = await query.select().single();
      if (error) throw error;
      state.properties = state.propertyDialogId
        ? state.properties.map((entry) => entry.id === data.id ? data : entry)
        : [...state.properties, data];
      closePropertyDialog();
      render();
    } catch (error) {
      setText("#property-form-status", error.message || "The property could not be saved.");
    } finally {
      save.disabled = false;
      save.textContent = state.propertyDialogId ? "Save property" : "Add property";
    }
  }
  function openDeletePropertyDialog(id) {
    const property = state.properties.find((entry) => entry.id === id);
    if (!property) return;
    state.propertyDeleteId = id;
    setText("#delete-property-description", `This removes ${property.name || "this property"} and its equity from your net worth.`);
    setText("#delete-property-status", "");
    $("#delete-property-dialog").hidden = false;
    $("#delete-property-dialog").showModal();
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

  async function loadData() {
    const [accounts, holdings, quotes, snapshots, incomeSources, budgetCategories, planSettings, properties] = await Promise.all([
      state.client.from("accounts").select("*").order("created_at"),
      state.client.from("holdings").select("*").eq("account_id", state.account.id).order("created_at"),
      state.client.from("holding_quotes").select("*").order("as_of", { ascending: false }),
      state.client.from("portfolio_snapshots").select("*").eq("account_id", state.account.id).order("snapshot_date"),
      state.client.from("income_sources").select("*").eq("account_id", state.account.id).order("created_at"),
      state.client.from("budget_categories").select("*").eq("account_id", state.account.id).order("created_at"),
      state.client.from("plan_settings").select("*").eq("account_id", state.account.id).maybeSingle(),
      state.client.from("home_properties").select("id, account_id, name, location, current_value_cents, mortgage_balance_cents, annual_appreciation_rate, created_at").eq("account_id", state.account.id).order("created_at"),
    ]);
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
  }
  async function ensurePlanSettings() {
    if (!state.planDataAvailable || state.planSettings || !state.account) return;
    const { data, error } = await state.client.from("plan_settings").upsert({
      account_id: state.account.id,
      distribution_policy: "reinvest",
    }, { onConflict: "account_id" }).select().single();
    if (error) {
      state.planDataAvailable = false;
      state.planSettings = null;
      render();
      return;
    }
    state.planSettings = data;
    render();
  }
  async function ensureAccount() {
    const existing = await state.client.from("accounts").select("*").eq("account_type", "brokerage").maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) return existing.data;
    const created = await state.client.from("accounts").insert({ name: "Brokerage", account_type: "brokerage" }).select().single();
    if (created.error) throw created.error;
    return created.data;
  }
  async function refreshCurrentAssetPrice() {
    const holding = state.holdings.find((entry) => entry.id === routeAssetId());
    if (!holding || holding.valuation_basis !== VALUATION_BASES.SHARES_AND_PRICE || !holding.symbol) {
      return setText("#asset-detail-status", "This asset does not have an automatic price to refresh.");
    }
    try {
      setText("#asset-detail-status", "Refreshing price…");
      const quote = await requestQuote(holding.symbol, holding.instrument_type);
      const { error } = await state.client.from("holding_quotes").upsert({
        holding_id: holding.id,
        price_cents: quote.priceCents,
        previous_close_cents: quote.priorCloseCents,
        ...quoteDividendFields(holding.id, quote),
        source: quote.source,
        as_of: quote.asOf,
      }, { onConflict: "holding_id,as_of" });
      if (error) throw error;
      await loadData();
      setText("#asset-detail-status", "Price refreshed.");
    } catch (error) {
      setText("#asset-detail-status", `${error.message} Last successful quote remains in place.`);
    }
  }
  async function hydrateProviderMetrics() {
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
    const metrics = results.reduce((next, result) => {
      if (result.status !== "fulfilled") return next;
      const { holdingId, quote } = result.value;
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
  function showUnconfigured(message) {
    state.configured = false;
    state.account = { id: "unconfigured", name: "Brokerage", weekly_contribution_cents: 0 };
    state.accounts = [state.account];
    state.holdings = [];
    state.quotes = [];
    state.snapshots = [];
    state.incomeSources = [];
    state.budgetCategories = [];
    state.budgetCategoriesAvailable = false;
    state.planSettings = null;
    state.properties = [];
    state.propertiesAvailable = false;
    state.planDataAvailable = false;
    $("#auth-panel").hidden = true;
    $("#home-workspace").hidden = false;
    setAccountMenuState("Private sync unavailable", false);
    setText("#data-status", message);
    render();
  }
  async function initialise() {
    try {
      const response = await fetch("/api/config", { cache: "no-store" });
      const config = response.ok ? await response.json() : { configured: false };
      if (!config.configured) return showUnconfigured("Private sync is not configured. Configure Supabase before adding holdings.");
      state.configured = true;
      state.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      const { data: { session } } = await state.client.auth.getSession();
      if (!session) {
        render();
        return;
      }
      state.user = session.user;
      state.account = await ensureAccount();
      setAccountMenuState(state.user.email, true);
      $("#home-workspace").hidden = false;
      await loadData();
      await ensurePlanSettings();
      void hydrateProviderMetrics();
      setText("#data-status", "Private Brokerage account loaded.");
    } catch (error) {
      showUnconfigured(`Private sync is unavailable: ${error.message}`);
    }
  }

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
    control.addEventListener("click", async () => {
      await state.client.auth.signOut();
      window.location.reload();
    });
  });
  $("#portfolio-add-asset").addEventListener("click", openQuickAdd);
  $("#close-dialog").addEventListener("click", () => $("#asset-dialog").close());
  $("#cancel-dialog").addEventListener("click", () => $("#asset-dialog").close());
  $("#asset-dialog").addEventListener("close", () => {
    clearTimeout(state.quoteTimer);
    state.quoteRequestId += 1;
  });
  $("#asset-form").addEventListener("submit", saveQuickAsset);
  $("#asset-valuation-basis").addEventListener("change", syncQuickValuationFields);
  $("#asset-symbol").addEventListener("input", () => scheduleQuote());
  $("#asset-shares").addEventListener("input", () => scheduleQuote({ preserveQuote: true }));
  $("#asset-manual-price").addEventListener("input", renderQuickQuotePreview);
  $("#asset-manual-value").addEventListener("input", renderQuickQuotePreview);
  $("#portfolio-search").addEventListener("input", render);
  ["#income-dividends-search", "#income-sources-search", "#income-budget-search"].forEach((selector) => $(selector).addEventListener("input", render));
  $("#add-income").addEventListener("click", () => openIncomeSourceDialog());
  $("#close-income-source-dialog").addEventListener("click", closeIncomeSourceDialog);
  $("#cancel-income-source-dialog").addEventListener("click", closeIncomeSourceDialog);
  $("#income-source-dialog").addEventListener("close", () => { $("#income-source-dialog").hidden = true; });
  $("#income-source-form").addEventListener("submit", saveIncomeSource);
  $("#cancel-delete-income-source").addEventListener("click", closeDeleteIncomeSourceDialog);
  $("#delete-income-source-dialog").addEventListener("close", () => { $("#delete-income-source-dialog").hidden = true; });
  $("#delete-income-source-form").addEventListener("submit", deleteIncomeSource);
  $("#add-budget-category").addEventListener("click", () => openBudgetCategoryDialog());
  $("#close-budget-category-dialog").addEventListener("click", closeBudgetCategoryDialog);
  $("#cancel-budget-category-dialog").addEventListener("click", closeBudgetCategoryDialog);
  $("#budget-category-dialog").addEventListener("close", () => { $("#budget-category-dialog").hidden = true; });
  $("#budget-category-form").addEventListener("submit", saveBudgetCategory);
  $("#cancel-delete-budget-category").addEventListener("click", closeDeleteBudgetCategoryDialog);
  $("#delete-budget-category-dialog").addEventListener("close", () => { $("#delete-budget-category-dialog").hidden = true; });
  $("#delete-budget-category-form").addEventListener("submit", deleteBudgetCategory);
  document.querySelectorAll("[data-portfolio-holding-sort]").forEach((control) => {
    control.addEventListener("click", () => {
      state.portfolioSort = control.dataset.portfolioHoldingSort;
      $("#portfolio-holding-sort").open = false;
      render();
    });
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
  document.querySelectorAll("[data-portfolio-filter]").forEach((control) => {
    control.addEventListener("click", () => {
      if (control.disabled) return;
      state.portfolioFilter = control.dataset.portfolioFilter;
      render();
    });
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
      render();
    });
  });
  $("#edit-plan-assumptions").addEventListener("click", openPlanAssumptionsDialog);
  document.querySelectorAll("[data-open-plan-assumptions]").forEach((control) => {
    control.addEventListener("click", openPlanAssumptionsDialog);
  });
  $("#close-plan-assumptions-dialog").addEventListener("click", closePlanAssumptionsDialog);
  $("#cancel-plan-assumptions").addEventListener("click", closePlanAssumptionsDialog);
  $("#plan-assumptions-dialog").addEventListener("close", () => { $("#plan-assumptions-dialog").hidden = true; });
  $("#plan-assumptions-form").addEventListener("submit", savePlanAssumptions);
  $("#portfolio-add-property").addEventListener("click", () => openPropertyDialog());
  $("#close-property-dialog").addEventListener("click", closePropertyDialog);
  $("#cancel-property-dialog").addEventListener("click", closePropertyDialog);
  $("#property-dialog").addEventListener("close", () => { $("#property-dialog").hidden = true; });
  $("#property-form").addEventListener("submit", saveProperty);
  $("#cancel-delete-property").addEventListener("click", closeDeletePropertyDialog);
  $("#delete-property-dialog").addEventListener("close", () => { $("#delete-property-dialog").hidden = true; });
  $("#delete-property-form").addEventListener("submit", deleteProperty);
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
  $("#asset-detail-valuation-basis").addEventListener("change", syncDetailValuationFields);
  $("#asset-refresh-price").addEventListener("click", refreshCurrentAssetPrice);
  $("#asset-delete").addEventListener("click", openDeleteAssetDialog);
  $("#cancel-delete-asset").addEventListener("click", closeDeleteAssetDialog);
  $("#delete-asset-dialog").addEventListener("close", () => { $("#delete-asset-dialog").hidden = true; });
  $("#delete-asset-form").addEventListener("submit", deleteCurrentAsset);
  window.addEventListener("hashchange", render);
  initialise();
})();
