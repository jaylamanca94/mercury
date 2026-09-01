(() => {
  "use strict";

  const { VALUATION_BASES, summarizePortfolio } = window.MercuryPortfolio;
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
  const state = {
    client: null, user: null, account: null, accounts: [], holdings: [], quotes: [], snapshots: [],
    configured: false, pendingQuote: null, quoteTimer: null, holdingFilter: "all", holdingSort: "value",
  };

  function cents(value) {
    return value === null || value === undefined || value === "" ? null : Math.round(Number(value) * 100);
  }
  function rate(value) {
    return value === null || value === undefined || value === "" ? null : Number(value) / 100;
  }
  function setText(selector, value) { $(selector).textContent = value; }
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
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    })[character]);
  }
  function dateLabel(value) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" }).format(new Date(value));
  }
  function routeAssetId() {
    const match = window.location.hash.match(/^#asset\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  }
  function navigateToAsset(id) { window.location.hash = `asset/${encodeURIComponent(id)}`; }
  function navigateHome() { window.location.hash = ""; }
  function latestQuotes() {
    return state.quotes.reduce((memo, quote) => (
      !memo[quote.holding_id] || new Date(quote.as_of) > new Date(memo[quote.holding_id].as_of)
        ? { ...memo, [quote.holding_id]: quote }
        : memo
    ), {});
  }
  function holdingAsset(holding) {
    const quote = latestQuotes()[holding.id];
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
      expectedAnnualReturnRate: holding.expected_annual_return_rate === null ? null : Number(holding.expected_annual_return_rate),
      distributionYieldRate: holding.distribution_yield_rate === null ? null : Number(holding.distribution_yield_rate),
      targetAllocationRate: holding.target_allocation_rate === null ? null : Number(holding.target_allocation_rate),
      weeklyContributionRate: holding.weekly_contribution_rate === null ? null : Number(holding.weekly_contribution_rate),
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
    $("#add-asset").disabled = disabled;
  }

  function renderHistory() {
    const trend = $("#history-trend");
    const snapshots = [...state.snapshots].sort((left, right) => left.snapshot_date.localeCompare(right.snapshot_date));
    if (snapshots.length < 2) {
      trend.innerHTML = '<span class="acadia-card-trend-empty">History appears after two New York daily snapshots.</span>';
      trend.setAttribute("aria-label", "Portfolio performance unavailable until two daily snapshots exist");
      setText("#history-summary", "A performance trend appears after two New York daily snapshots.");
      return;
    }
    const values = snapshots.map((snapshot) => snapshot.total_value_cents / 100);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const range = maximum - minimum || 1;
    const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${96 - ((value - minimum) / range) * 84}`);
    const area = `0,100 ${points.join(" ")} 100,100`;
    trend.innerHTML = `<svg class="acadia-card-trend-chart is-primary" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon class="acadia-card-trend-area" points="${area}"></polygon><polyline class="acadia-card-trend-line" points="${points.join(" ")}"></polyline></svg>`;
    const summary = `${dateLabel(snapshots[0].snapshot_date)} ${currency.format(values[0])} to ${dateLabel(snapshots.at(-1).snapshot_date)} ${currency.format(values.at(-1))}`;
    trend.setAttribute("aria-label", `Portfolio performance: ${summary}.`);
    setText("#history-summary", summary);
  }

  function instrumentLabel(value) {
    return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  function holdingFilters() {
    return [...new Set(state.holdings.map((holding) => holding.instrument_type).filter(Boolean))]
      .sort((left, right) => instrumentLabel(left).localeCompare(instrumentLabel(right)));
  }
  function renderHoldingFilters() {
    const filters = holdingFilters();
    if (state.holdingFilter !== "all" && !filters.includes(state.holdingFilter)) state.holdingFilter = "all";
    const controls = $("#holding-filters");
    controls.replaceChildren(...["all", ...filters].map((filter) => {
      const control = document.createElement("button");
      control.type = "button";
      control.className = "acadia-badge acadia-badge-grey acadia-badge-round acadia-page-header-pattern-filter";
      control.dataset.holdingFilter = filter;
      control.setAttribute("aria-pressed", String(state.holdingFilter === filter));
      control.textContent = filter === "all" ? "All" : instrumentLabel(filter);
      control.addEventListener("click", () => {
        state.holdingFilter = filter;
        render();
      });
      return control;
    }));
  }
  function matchingHoldingRows(summary) {
    const search = $("#holding-search").value.trim().toLowerCase();
    return summary.rows.filter((row) => {
      const matchesFilter = state.holdingFilter === "all" || row.asset.instrumentType === state.holdingFilter;
      const matchesSearch = `${row.asset.symbol || ""} ${row.asset.name || ""} ${row.asset.instrumentType}`.toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    });
  }
  function sortHoldingRows(rows) {
    return [...rows].sort((left, right) => {
      if (state.holdingSort === "name") {
        const leftName = left.asset.symbol || left.asset.name || left.asset.instrumentType;
        const rightName = right.asset.symbol || right.asset.name || right.asset.instrumentType;
        return leftName.localeCompare(rightName);
      }
      if (state.holdingSort === "updated") {
        const leftHolding = state.holdings.find((holding) => holding.id === left.asset.id);
        const rightHolding = state.holdings.find((holding) => holding.id === right.asset.id);
        return new Date(rightHolding?.updated_at || rightHolding?.created_at || 0) - new Date(leftHolding?.updated_at || leftHolding?.created_at || 0);
      }
      return right.marketValueCents - left.marketValueCents;
    });
  }
  function renderHoldingSort() {
    const labels = { value: "Value", name: "Name", updated: "Recently updated" };
    setText("#holding-sort-label", labels[state.holdingSort]);
    document.querySelectorAll("[data-holding-sort]").forEach((control) => {
      control.setAttribute("aria-checked", String(control.dataset.holdingSort === state.holdingSort));
    });
  }
  function openHoldingFromEvent(event) {
    const card = event.currentTarget;
    if (event.target.closest("button, summary, a, input, select")) return;
    navigateToAsset(card.dataset.holdingId);
  }
  function keyOpenHolding(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToAsset(event.currentTarget.dataset.holdingId);
    }
  }
  function renderHoldings(summary) {
    renderHoldingFilters();
    renderHoldingSort();
    const matchingRows = matchingHoldingRows(summary);
    const rows = sortHoldingRows(matchingRows).slice(0, 4);
    const grid = $("#holdings-grid");
    grid.replaceChildren(...rows.map((row) => {
      const holding = state.holdings.find((entry) => entry.id === row.asset.id);
      const price = row.asset.valuationBasis === VALUATION_BASES.MANUAL_VALUE
        ? "Manual value"
        : row.asset.unitPriceCents === null
          ? "Needs price"
          : preciseCurrency.format(row.asset.unitPriceCents / 100);
      const shares = row.asset.shares === null ? "" : `${Number(row.asset.shares).toLocaleString()} shares`;
      const card = document.createElement("article");
      card.className = "acadia-card is-content is-interactive";
      card.dataset.holdingId = holding.id;
      card.tabIndex = 0;
      card.setAttribute("aria-label", `Open ${row.asset.symbol || row.asset.name}`);
      card.innerHTML = `<div class="acadia-card-actions" role="group" aria-label="Actions for ${escapeHtml(row.asset.symbol || row.asset.name)}"><details class="acadia-action-menu"><summary class="acadia-action-menu-trigger acadia-icon-action" aria-label="Actions for ${escapeHtml(row.asset.symbol || row.asset.name)}"><i class="fa-solid fa-ellipsis acadia-icon" aria-hidden="true"></i></summary><div class="acadia-action-menu-panel"><button class="acadia-action-menu-item" type="button" data-edit-id="${escapeHtml(holding.id)}">Edit details</button></div></details></div><div class="acadia-card-header"><div class="acadia-card-content-title-row"><h3>${escapeHtml(row.asset.symbol || row.asset.name)}</h3><span class="acadia-card-content-caption">${escapeHtml(row.asset.name || row.asset.instrumentType.replaceAll("-", " "))}</span></div></div><div class="acadia-card-content"><div class="acadia-card-content-blurbs"><strong>${price}</strong><span>${shares}</span></div><div class="acadia-card-content-badges">${valueBadge(row.marketValueCents)}</div></div>`;
      card.addEventListener("click", openHoldingFromEvent);
      card.addEventListener("keydown", keyOpenHolding);
      return card;
    }));
    setText("#holdings-count", `${matchingRows.length} ${matchingRows.length === 1 ? "asset" : "assets"}`);
    $("#holdings-empty").hidden = rows.length > 0;
    if (!rows.length) {
      const hasAssets = state.holdings.length > 0;
      setText("#holdings-empty-title", hasAssets ? "No matching assets" : "No assets yet");
      setText("#holdings-empty-copy", hasAssets
        ? "Adjust your search or filter to see a different investment."
        : "Add an asset to begin your private Brokerage workspace.");
    }
    document.querySelectorAll("[data-edit-id]").forEach((button) => {
      button.addEventListener("click", () => navigateToAsset(button.dataset.editId));
    });
  }

  function renderHome(summary) {
    $("#home-workspace").hidden = false;
    $("#asset-workspace").hidden = true;
    setText("#metric-value", displayCurrency(summary.totalMarketValueCents / 100));
    setText("#metric-income", displayCurrency(summary.totalEstimatedAnnualIncomeCents / 100));
    setText("#portfolio-warnings", state.holdings.length ? summary.warnings.join(" ") : "");
    renderHistory();
    renderHoldings(summary);
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
  function renderAsset() {
    const id = routeAssetId();
    const holding = state.holdings.find((entry) => entry.id === id);
    const summary = portfolio();
    $("#home-workspace").hidden = true;
    $("#asset-workspace").hidden = false;
    $("#asset-not-found").hidden = Boolean(holding);
    $("#asset-quote-card").hidden = !holding;
    $("#asset-content > .acadia-dashboard-main").hidden = !holding;
    if (!holding) {
      setText("#asset-title", "Asset unavailable");
      setText("#asset-subtitle", "This asset is not available in your current Brokerage account.");
      setText("#asset-price", "—");
      setText("#asset-status", "Return Home to select an available asset.");
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
    setText("#asset-yield-stat", asset.distributionYieldRate === null ? "Not set" : percentage.format(asset.distributionYieldRate));
    setText("#asset-quote-source", quote?.source || (holding.manual_price_cents !== null ? "Manual price" : "No quote recorded."));
    setText("#asset-quote-asof", quote?.as_of ? `As of ${dateLabel(quote.as_of)}` : "No as-of time");

    const setValue = (selector, value) => { $(selector).value = value ?? ""; };
    $("#asset-detail-form").hidden = false;
    setDetailFormDisabled(false);
    setValue("#asset-detail-shares", holding.shares);
    setValue("#asset-detail-contribution", holding.contribution_cents === null ? null : Number(holding.contribution_cents) / 100);
    setValue("#asset-detail-frequency", holding.contribution_frequency);
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

  function render() {
    setControlsDisabled(!state.configured);
    const summary = portfolio();
    if (routeAssetId()) renderAsset();
    else renderHome(summary);
    $("#main-content").setAttribute("aria-busy", "false");
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
  }
  function showManualFallback(message) {
    $("#manual-fallback").hidden = false;
    syncQuickValuationFields();
    if (message) setText("#quote-form-status", message);
  }
  function clearManualFallback() {
    $("#manual-fallback").hidden = true;
    $("#asset-manual-price").value = "";
    $("#asset-manual-value").value = "";
  }
  function openQuickAdd() {
    const form = $("#asset-form");
    form.reset();
    state.pendingQuote = null;
    clearManualFallback();
    setText("#quote-form-status", "");
    syncQuickValuationFields();
    $("#asset-dialog").hidden = false;
    $("#asset-dialog").showModal();
  }

  async function sessionToken() {
    const { data } = await state.client.auth.getSession();
    return data.session?.access_token;
  }
  async function requestQuote(symbol, instrumentType = "other") {
    const token = await sessionToken();
    const response = await fetch(`/api/portfolio/quotes?symbol=${encodeURIComponent(symbol)}&instrumentType=${encodeURIComponent(instrumentType)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Quote lookup failed.");
    return data;
  }
  function canQuote() {
    return Boolean($("#asset-symbol").value.trim())
      && Number.isFinite(Number($("#asset-shares").value))
      && Number($("#asset-shares").value) >= 0;
  }
  async function lookupQuote({ revealFallback = false } = {}) {
    if (!canQuote()) return null;
    setText("#quote-form-status", "Looking up price…");
    try {
      state.pendingQuote = await requestQuote($("#asset-symbol").value.trim());
      setText("#quote-form-status", `${preciseCurrency.format(state.pendingQuote.priceCents / 100)} from ${state.pendingQuote.source}. As of ${dateLabel(state.pendingQuote.asOf)}.`);
      return state.pendingQuote;
    } catch (error) {
      state.pendingQuote = null;
      const message = `${error.message} Enter a manual authoritative price or total value.`;
      if (revealFallback) showManualFallback(message);
      else setText("#quote-form-status", message);
      return null;
    }
  }
  function scheduleQuote() {
    clearTimeout(state.quoteTimer);
    if (!canQuote()) return;
    state.quoteTimer = setTimeout(() => lookupQuote(), 450);
  }
  function quickHolding() {
    const form = $("#asset-form");
    const isManualValue = manualValuation();
    const holding = {
      id: crypto.randomUUID(),
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
      contribution_cents: null,
      contribution_frequency: null,
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
    try {
      save.disabled = true;
      save.textContent = "Adding…";
      if (!manualValuation() && !state.pendingQuote && !getFormValue($("#asset-form"), "manualPrice")) {
        await lookupQuote({ revealFallback: true });
      }
      const holding = quickHolding();
      const { error } = await state.client.from("holdings").insert(holding);
      if (error) throw error;
      if (state.pendingQuote) {
        const { error: quoteError } = await state.client.from("holding_quotes").insert({
          holding_id: holding.id,
          price_cents: state.pendingQuote.priceCents,
          previous_close_cents: state.pendingQuote.priorCloseCents,
          source: state.pendingQuote.source,
          as_of: state.pendingQuote.asOf,
        });
        if (quoteError) throw quoteError;
      }
      $("#asset-dialog").close();
      await loadData();
      setText("#data-status", "Saved to your private Brokerage account.");
      navigateToAsset(holding.id);
    } catch (error) {
      setText("#quote-form-status", error.message || "This asset could not be saved.");
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
      setText("#asset-detail-status", "Details saved.");
      setText("#data-status", "Saved to your private Brokerage account.");
    } catch (error) {
      setText("#asset-detail-status", error.message || "This asset could not be saved.");
    } finally {
      save.disabled = false;
      save.textContent = "Save";
    }
  }

  async function loadData() {
    const [accounts, holdings, quotes, snapshots] = await Promise.all([
      state.client.from("accounts").select("*").order("created_at"),
      state.client.from("holdings").select("*").eq("account_id", state.account.id).order("created_at"),
      state.client.from("holding_quotes").select("*").order("as_of", { ascending: false }),
      state.client.from("portfolio_snapshots").select("*").eq("account_id", state.account.id).order("snapshot_date"),
    ]);
    if (accounts.error || holdings.error || quotes.error || snapshots.error) {
      throw accounts.error || holdings.error || quotes.error || snapshots.error;
    }
    state.accounts = accounts.data || [];
    state.holdings = holdings.data || [];
    state.quotes = quotes.data || [];
    state.snapshots = snapshots.data || [];
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
  function showUnconfigured(message) {
    state.configured = false;
    state.account = { id: "unconfigured", name: "Brokerage", weekly_contribution_cents: 0 };
    state.accounts = [state.account];
    state.holdings = [];
    state.quotes = [];
    state.snapshots = [];
    $("#auth-panel").hidden = true;
    $("#home-workspace").hidden = false;
    setText("#account-label", "Private sync unavailable");
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
        $("#auth-panel").hidden = false;
        $("#main-content").setAttribute("aria-busy", "false");
        return;
      }
      state.user = session.user;
      state.account = await ensureAccount();
      $("#account-label").textContent = state.user.email;
      $("#sign-out").hidden = false;
      $("#home-workspace").hidden = false;
      await loadData();
      setText("#data-status", "Private Brokerage account loaded.");
    } catch (error) {
      showUnconfigured(`Private sync is unavailable: ${error.message}`);
    }
  }

  $("#magic-link-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.client) return;
    const { error } = await state.client.auth.signInWithOtp({
      email: $("#email").value,
      options: { emailRedirectTo: window.location.origin },
    });
    setText("#auth-message", error ? error.message : "Check your email for a sign-in link.");
  });
  $("#sign-out").addEventListener("click", async () => {
    await state.client.auth.signOut();
    window.location.reload();
  });
  $("#add-asset").addEventListener("click", openQuickAdd);
  $("#close-dialog").addEventListener("click", () => $("#asset-dialog").close());
  $("#cancel-dialog").addEventListener("click", () => $("#asset-dialog").close());
  $("#asset-dialog").addEventListener("close", () => { $("#asset-dialog").hidden = true; });
  $("#asset-form").addEventListener("submit", saveQuickAsset);
  $("#asset-valuation-basis").addEventListener("change", syncQuickValuationFields);
  $("#asset-symbol").addEventListener("input", scheduleQuote);
  $("#asset-shares").addEventListener("input", scheduleQuote);
  $("#holding-search").addEventListener("input", render);
  document.querySelectorAll("[data-holding-sort]").forEach((control) => {
    control.addEventListener("click", () => {
      state.holdingSort = control.dataset.holdingSort;
      $("#holding-sort").open = false;
      render();
    });
  });
  $("#asset-back").addEventListener("click", navigateHome);
  $("#asset-cancel").addEventListener("click", renderAsset);
  $("#asset-detail-form").addEventListener("submit", saveAssetDetails);
  $("#asset-detail-valuation-basis").addEventListener("change", syncDetailValuationFields);
  $("#asset-refresh-price").addEventListener("click", refreshCurrentAssetPrice);
  window.addEventListener("hashchange", render);
  initialise();
})();
