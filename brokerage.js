(() => {
  "use strict";

  const { VALUATION_BASES, summarizePortfolio } = window.MercuryPortfolio;
  const $ = (selector) => document.querySelector(selector);
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const preciseCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const state = { client: null, user: null, account: null, accounts: [], holdings: [], quotes: [], snapshots: [], preview: false, pendingQuote: null, quoteTimer: null, editMode: false };

  const sampleHoldings = [
    { id: "preview-voo", symbol: "VOO", name: "S&P 500", instrument_type: "etf", allocation_category: "domestic-equity", valuation_basis: "shares-and-price", shares: 417, manual_price_cents: null, expected_annual_return_rate: 0.08, distribution_yield_rate: 0.0106, target_allocation_rate: 0.35, weekly_contribution_rate: 0.05, dividend_policy: "reinvest", capital_gains_policy: "transfer-to-fund", custom_policy_note: null },
    { id: "preview-vtiax", symbol: "VTIAX", name: "International", instrument_type: "mutual-fund", allocation_category: "international-equity", valuation_basis: "shares-and-price", shares: 3266, manual_price_cents: null, expected_annual_return_rate: 0.06, distribution_yield_rate: 0.0255, target_allocation_rate: 0.25, weekly_contribution_rate: 0.45, dividend_policy: "reinvest", capital_gains_policy: "reinvest", custom_policy_note: null },
    { id: "preview-vbtlx", symbol: "VBTLX", name: "Bonds", instrument_type: "mutual-fund", allocation_category: "bonds", valuation_basis: "shares-and-price", shares: 15339, manual_price_cents: null, expected_annual_return_rate: 0.04, distribution_yield_rate: 0.0406, target_allocation_rate: 0.25, weekly_contribution_rate: 0.45, dividend_policy: "transfer-to-bank", capital_gains_policy: "transfer-to-bank", custom_policy_note: null },
    { id: "preview-vsmax", symbol: "VSMAX", name: "Small Cap", instrument_type: "mutual-fund", allocation_category: "domestic-equity", valuation_basis: "shares-and-price", shares: 955, manual_price_cents: null, expected_annual_return_rate: 0.07, distribution_yield_rate: 0.0121, target_allocation_rate: 0.13, weekly_contribution_rate: 0.05, dividend_policy: "transfer-to-fund", capital_gains_policy: "transfer-to-fund", custom_policy_note: null },
  ];
  const sampleQuotes = [
    { holding_id: "preview-voo", price_cents: 71300, previous_close_cents: 71128, source: "Sample data", as_of: "2026-08-30T20:30:00.000Z" },
    { holding_id: "preview-vtiax", price_cents: 4700, previous_close_cents: 4724, source: "Sample data", as_of: "2026-08-30T20:30:00.000Z" },
    { holding_id: "preview-vbtlx", price_cents: 950, previous_close_cents: 953, source: "Sample data", as_of: "2026-08-30T20:30:00.000Z" },
    { holding_id: "preview-vsmax", price_cents: 14400, previous_close_cents: 14571, source: "Sample data", as_of: "2026-08-30T20:30:00.000Z" },
  ];
  const sampleSnapshots = [{ snapshot_date: "2026-08-27", total_value_cents: 74900000 }, { snapshot_date: "2026-08-28", total_value_cents: 75540000 }, { snapshot_date: "2026-08-29", total_value_cents: 75910000 }, { snapshot_date: "2026-08-30", total_value_cents: 76393700 }];

  function cents(value) { return value === null || value === undefined || value === "" ? null : Math.round(Number(value) * 100); }
  function rate(value) { return value === null || value === undefined || value === "" ? null : Number(value) / 100; }
  function setText(selector, value) { $(selector).textContent = value; }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]); }
  function dateLabel(value) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" }).format(new Date(value)); }
  function latestQuotes() { return state.quotes.reduce((memo, quote) => (!memo[quote.holding_id] || new Date(quote.as_of) > new Date(memo[quote.holding_id].as_of) ? { ...memo, [quote.holding_id]: quote } : memo), {}); }
  function holdingAsset(holding) {
    const quote = latestQuotes()[holding.id];
    return { id: holding.id, symbol: holding.symbol, name: holding.name, assetType: holding.name || holding.symbol || "Asset", instrumentType: holding.instrument_type, allocationCategory: holding.allocation_category, valuationBasis: holding.valuation_basis, manualValueCents: holding.manual_value_cents, shares: holding.shares === null ? null : Number(holding.shares), unitPriceCents: quote?.price_cents ?? holding.manual_price_cents, quoteSource: quote?.source || (holding.manual_price_cents !== null ? "Manual price" : null), quoteAsOf: quote?.as_of || null, priorCloseCents: quote?.previous_close_cents ?? null, expectedAnnualReturnRate: holding.expected_annual_return_rate === null ? null : Number(holding.expected_annual_return_rate), distributionYieldRate: holding.distribution_yield_rate === null ? null : Number(holding.distribution_yield_rate), targetAllocationRate: holding.target_allocation_rate === null ? null : Number(holding.target_allocation_rate), weeklyContributionRate: holding.weekly_contribution_rate === null ? null : Number(holding.weekly_contribution_rate), dividendPolicy: holding.dividend_policy, capitalGainsPolicy: holding.capital_gains_policy, customPolicyNote: holding.custom_policy_note };
  }
  function portfolio() { return summarizePortfolio(state.holdings.map(holdingAsset).filter((asset) => asset.valuationBasis === VALUATION_BASES.MANUAL_VALUE || asset.unitPriceCents !== null), { weeklyContributionCents: state.account?.weekly_contribution_cents || 0 }); }
  function valueBadge(valueCents) { return `<span class="acadia-badge acadia-badge-grey acadia-badge-round">${currency.format(valueCents / 100)}</span>`; }

  function renderAccountFilter() {
    const filter = $("#account-filter");
    filter.replaceChildren(...state.accounts.map((account) => {
      const option = document.createElement("option"); option.value = account.id; option.textContent = account.name; option.selected = account.id === state.account?.id; return option;
    }));
  }

  function renderHistory() {
    const trend = $("#history-trend");
    const snapshots = [...state.snapshots].sort((left, right) => left.snapshot_date.localeCompare(right.snapshot_date));
    if (snapshots.length < 2) {
      trend.innerHTML = '<span class="acadia-card-trend-empty">History appears after two New York daily snapshots.</span>';
      trend.setAttribute("aria-label", "Portfolio value history unavailable until two daily snapshots exist");
      setText("#history-summary", "A history trend appears after two New York daily snapshots.");
      return;
    }
    const values = snapshots.map((snapshot) => snapshot.total_value_cents / 100);
    const minimum = Math.min(...values); const maximum = Math.max(...values); const range = maximum - minimum || 1;
    const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${96 - ((value - minimum) / range) * 84}`);
    const area = `0,100 ${points.join(" ")} 100,100`;
    trend.innerHTML = `<svg class="acadia-card-trend-chart is-primary" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon class="acadia-card-trend-area" points="${area}"></polygon><polyline class="acadia-card-trend-line" points="${points.join(" ")}"></polyline></svg>`;
    const summary = `${dateLabel(snapshots[0].snapshot_date)} ${currency.format(values[0])} to ${dateLabel(snapshots.at(-1).snapshot_date)} ${currency.format(values.at(-1))}`;
    trend.setAttribute("aria-label", `Portfolio value history: ${summary}.`);
    setText("#history-summary", summary);
  }

  function renderHoldings(summary) {
    const search = $("#holding-search").value.trim().toLowerCase();
    const rows = summary.rows.filter((row) => `${row.asset.symbol || ""} ${row.asset.name || ""} ${row.asset.instrumentType}`.toLowerCase().includes(search)).sort((left, right) => right.marketValueCents - left.marketValueCents).slice(0, 4);
    const grid = $("#holdings-grid");
    grid.replaceChildren(...rows.map((row) => {
      const holding = state.holdings.find((entry) => entry.id === row.asset.id);
      const price = row.asset.valuationBasis === VALUATION_BASES.MANUAL_VALUE ? "Manual value" : row.asset.unitPriceCents === null ? "Needs price" : preciseCurrency.format(row.asset.unitPriceCents / 100);
      const shares = row.asset.shares === null ? "" : `${Number(row.asset.shares).toLocaleString()} shares`;
      const card = document.createElement("article"); card.className = "acadia-card is-content"; card.setAttribute("aria-labelledby", `holding-${holding.id}`);
      card.innerHTML = `<div class="acadia-card-actions" role="group" aria-label="Actions for ${escapeHtml(row.asset.symbol || row.asset.name)}"><details class="acadia-action-menu"><summary class="acadia-action-menu-trigger acadia-icon-action" aria-label="Actions for ${escapeHtml(row.asset.symbol || row.asset.name)}"><i class="fa-solid fa-ellipsis acadia-icon" aria-hidden="true"></i></summary><div class="acadia-action-menu-panel"><button class="acadia-action-menu-item" type="button" data-edit-id="${escapeHtml(holding.id)}">Edit details</button></div></details></div><div class="acadia-card-header"><div class="acadia-card-content-title-row"><h3 id="holding-${escapeHtml(holding.id)}">${escapeHtml(row.asset.symbol || row.asset.name)}</h3><span class="acadia-card-content-caption">${escapeHtml(row.asset.name || row.asset.instrumentType.replaceAll("-", " "))}</span></div></div><div class="acadia-card-content"><div class="acadia-card-content-blurbs"><strong>${price}</strong><span>${shares}</span></div><div class="acadia-card-content-badges">${valueBadge(row.marketValueCents)}</div></div>`;
      return card;
    }));
    $("#holdings-empty").hidden = rows.length > 0;
    document.querySelectorAll("[data-edit-id]").forEach((button) => button.addEventListener("click", () => openAsset(state.holdings.find((holding) => holding.id === button.dataset.editId))));
  }

  function render() {
    const summary = portfolio();
    setText("#metric-value", currency.format(summary.totalMarketValueCents / 100));
    setText("#metric-income", currency.format(summary.totalEstimatedAnnualIncomeCents / 100));
    setText("#portfolio-warnings", summary.warnings.join(" "));
    renderAccountFilter(); renderHistory(); renderHoldings(summary);
    $("#main-content").setAttribute("aria-busy", "false");
  }

  function getFormValue(form, key) { const value = new FormData(form).get(key); return value === "" ? null : value; }
  function manualValuation() { return getFormValue($("#asset-form"), "valuationBasis") === "manual-value"; }
  function syncValuationFields() {
    const manual = manualValuation();
    $("#manual-price-field").hidden = manual; $("#manual-value-field").hidden = !manual;
    $("#asset-shares").required = !manual;
  }
  function showManualFallback(message) { $("#manual-fallback").hidden = false; syncValuationFields(); if (message) setText("#quote-form-status", message); }
  function clearManualFallback() { $("#manual-fallback").hidden = true; $("#asset-manual-price").value = ""; $("#asset-manual-value").value = ""; }

  function openAsset(holding) {
    const form = $("#asset-form"); form.reset(); state.pendingQuote = null; state.editMode = Boolean(holding); clearManualFallback(); setText("#quote-form-status", "");
    $("#asset-dialog-title").textContent = holding ? "Edit details" : "Add asset";
    $("#asset-dialog-description").textContent = holding ? "Update the details used to calculate this holding." : "Enter a symbol and shares. Mercury will look up the price automatically.";
    $("#asset-details").hidden = !holding; $("#save-asset").textContent = holding ? "Save details" : "Add";
    if (holding) {
      const set = (selector, value) => { if (value !== null && value !== undefined) $(selector).value = value; };
      set("#asset-id", holding.id); set("#asset-symbol", holding.symbol); set("#asset-shares", holding.shares); set("#asset-name", holding.name); set("#asset-instrument", holding.instrument_type); set("#asset-category", holding.allocation_category); set("#asset-return", holding.expected_annual_return_rate === null ? null : Number(holding.expected_annual_return_rate) * 100); set("#asset-yield", holding.distribution_yield_rate === null ? null : Number(holding.distribution_yield_rate) * 100); set("#asset-target", holding.target_allocation_rate === null ? null : Number(holding.target_allocation_rate) * 100); set("#asset-weekly", holding.weekly_contribution_rate === null ? null : Number(holding.weekly_contribution_rate) * 100); set("#asset-dividend-policy", holding.dividend_policy); set("#asset-gains-policy", holding.capital_gains_policy); set("#asset-policy-note", holding.custom_policy_note);
      if (holding.valuation_basis === "manual-value" || holding.manual_price_cents !== null) { showManualFallback(); $("#asset-valuation-basis").value = holding.valuation_basis; set("#asset-manual-price", holding.manual_price_cents === null ? null : holding.manual_price_cents / 100); set("#asset-manual-value", holding.manual_value_cents === null ? null : holding.manual_value_cents / 100); }
    }
    syncValuationFields(); $("#asset-dialog").hidden = false; $("#asset-dialog").showModal();
  }

  async function sessionToken() { const { data } = await state.client.auth.getSession(); return data.session?.access_token; }
  async function requestQuote(symbol, instrumentType = "other") { const token = await sessionToken(); const response = await fetch(`/api/portfolio/quotes?symbol=${encodeURIComponent(symbol)}&instrumentType=${encodeURIComponent(instrumentType)}`, { headers: { Authorization: `Bearer ${token}` } }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Quote lookup failed."); return data; }
  function canQuote() { return Boolean($("#asset-symbol").value.trim()) && Number.isFinite(Number($("#asset-shares").value)) && Number($("#asset-shares").value) >= 0; }
  async function lookupQuote({ revealFallback = false } = {}) {
    if (!canQuote()) return null;
    const symbol = $("#asset-symbol").value.trim(); const instrumentType = $("#asset-instrument").value || "other";
    setText("#quote-form-status", "Looking up price…");
    try {
      if (state.preview) {
        const match = sampleQuotes.find((quote) => state.holdings.find((holding) => holding.id === quote.holding_id)?.symbol === symbol.toUpperCase());
        if (!match) throw new Error("Sample workspace cannot quote that symbol.");
        state.pendingQuote = { priceCents: match.price_cents, priorCloseCents: match.previous_close_cents, source: "Sample quote", asOf: match.as_of, instrumentType: "other" };
      } else state.pendingQuote = await requestQuote(symbol, instrumentType);
      setText("#quote-form-status", `${preciseCurrency.format(state.pendingQuote.priceCents / 100)} from ${state.pendingQuote.source}. As of ${dateLabel(state.pendingQuote.asOf)}.`);
      return state.pendingQuote;
    } catch (error) {
      state.pendingQuote = null;
      const message = `${error.message} Enter a manual authoritative price or total value.`;
      if (revealFallback) showManualFallback(message); else setText("#quote-form-status", message);
      return null;
    }
  }
  function scheduleQuote() { clearTimeout(state.quoteTimer); if (!canQuote() || state.editMode) return; state.quoteTimer = setTimeout(() => lookupQuote(), 450); }

  function formHolding() {
    const form = $("#asset-form"); const isManualValue = manualValuation(); const existing = getFormValue(form, "id");
    const holding = { id: existing || crypto.randomUUID(), account_id: state.account?.id || "preview", symbol: getFormValue(form, "symbol")?.toUpperCase() || null, name: getFormValue(form, "name"), instrument_type: getFormValue(form, "instrumentType") || state.pendingQuote?.instrumentType || "other", allocation_category: getFormValue(form, "allocationCategory") || "other", valuation_basis: isManualValue ? "manual-value" : "shares-and-price", shares: isManualValue ? null : Number(getFormValue(form, "shares")), manual_value_cents: isManualValue ? cents(getFormValue(form, "manualValue")) : null, manual_price_cents: isManualValue ? null : cents(getFormValue(form, "manualPrice")), expected_annual_return_rate: rate(getFormValue(form, "expectedAnnualReturn")), distribution_yield_rate: rate(getFormValue(form, "distributionYield")), target_allocation_rate: rate(getFormValue(form, "targetAllocation")), weekly_contribution_rate: rate(getFormValue(form, "weeklyAllocation")), dividend_policy: getFormValue(form, "dividendPolicy"), capital_gains_policy: getFormValue(form, "capitalGainsPolicy"), custom_policy_note: getFormValue(form, "customPolicyNote") };
    if (!holding.symbol) throw new Error("A symbol is required.");
    if (!isManualValue && (!Number.isFinite(holding.shares) || holding.shares < 0)) throw new Error("Shares are required for a price-based value.");
    if (isManualValue && holding.manual_value_cents === null) throw new Error("A manual total value is required.");
    if (!isManualValue && holding.manual_price_cents === null && !state.pendingQuote && !existing) throw new Error("Automatic price lookup failed. Enter a manual price or total value.");
    if ((holding.dividend_policy === "custom" || holding.capital_gains_policy === "custom") && !holding.custom_policy_note) throw new Error("A policy note is required for a custom policy.");
    return holding;
  }

  async function saveAsset(event) {
    event.preventDefault(); const save = $("#save-asset");
    try {
      save.disabled = true; save.textContent = state.editMode ? "Saving…" : "Adding…";
      if (!state.editMode && !manualValuation() && !state.pendingQuote && !getFormValue($("#asset-form"), "manualPrice")) await lookupQuote({ revealFallback: true });
      const holding = formHolding();
      if (state.preview) {
        const index = state.holdings.findIndex((entry) => entry.id === holding.id); if (index >= 0) state.holdings[index] = holding; else state.holdings.push(holding);
        if (state.pendingQuote) state.quotes = [...state.quotes.filter((quote) => quote.holding_id !== holding.id), { holding_id: holding.id, price_cents: state.pendingQuote.priceCents, previous_close_cents: state.pendingQuote.priorCloseCents, source: state.pendingQuote.source, as_of: state.pendingQuote.asOf }];
        $("#asset-dialog").close(); render(); setText("#data-status", "Sample workspace updated. Configure private sync before entering real data."); return;
      }
      const { error } = await state.client.from("holdings").upsert(holding); if (error) throw error;
      if (state.pendingQuote) { const { error: quoteError } = await state.client.from("holding_quotes").upsert({ holding_id: holding.id, price_cents: state.pendingQuote.priceCents, previous_close_cents: state.pendingQuote.priorCloseCents, source: state.pendingQuote.source, as_of: state.pendingQuote.asOf }, { onConflict: "holding_id,as_of" }); if (quoteError) throw quoteError; }
      $("#asset-dialog").close(); await loadData(); setText("#data-status", "Saved to your private Brokerage account.");
    } catch (error) { setText("#quote-form-status", error.message || "This asset could not be saved."); } finally { save.disabled = false; save.textContent = state.editMode ? "Save details" : "Add"; }
  }

  async function loadData() {
    const [accounts, holdings, quotes, snapshots] = await Promise.all([state.client.from("accounts").select("*").order("created_at"), state.client.from("holdings").select("*").eq("account_id", state.account.id).order("created_at"), state.client.from("holding_quotes").select("*").order("as_of", { ascending: false }), state.client.from("portfolio_snapshots").select("*").eq("account_id", state.account.id).order("snapshot_date")]);
    if (accounts.error || holdings.error || quotes.error || snapshots.error) throw accounts.error || holdings.error || quotes.error || snapshots.error;
    state.accounts = accounts.data || []; state.holdings = holdings.data || []; state.quotes = quotes.data || []; state.snapshots = snapshots.data || []; render();
  }
  async function ensureAccount() { const existing = await state.client.from("accounts").select("*").eq("account_type", "brokerage").maybeSingle(); if (existing.error) throw existing.error; if (existing.data) return existing.data; const created = await state.client.from("accounts").insert({ name: "Brokerage", account_type: "brokerage" }).select().single(); if (created.error) throw created.error; return created.data; }
  async function refreshPrices() { if (state.preview) return setText("#data-status", "Sample data has no live price connection. Configure Twelve Data to refresh quotes."); const holdings = state.holdings.filter((holding) => holding.valuation_basis === "shares-and-price" && holding.symbol); setText("#data-status", `Refreshing ${holdings.length} price${holdings.length === 1 ? "" : "s"}…`); for (const holding of holdings) { try { const quote = await requestQuote(holding.symbol, holding.instrument_type); await state.client.from("holding_quotes").upsert({ holding_id: holding.id, price_cents: quote.priceCents, previous_close_cents: quote.priorCloseCents, source: quote.source, as_of: quote.asOf }, { onConflict: "holding_id,as_of" }); } catch (error) { setText("#data-status", `${error.message} Last successful quotes remain in place.`); } } await loadData(); setText("#data-status", "Prices refreshed. Last successful provider values are retained if a lookup fails."); }
  async function refreshHistory() { if (state.preview) return setText("#data-status", "History refresh needs the private snapshot service. Sample snapshots remain visible."); const token = await sessionToken(); const response = await fetch("/api/portfolio/snapshot", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); const data = await response.json(); if (!response.ok) return setText("#data-status", data.error || "History refresh failed."); await loadData(); setText("#data-status", `History refreshed for ${data.snapshotDate}.`); }
  function exportData() { const payload = { exportedAt: new Date().toISOString(), account: { name: state.account?.name || "Brokerage", currency: "USD" }, holdings: state.holdings, quotes: state.quotes, snapshots: state.snapshots }; const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = `mercury-brokerage-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); setText("#data-status", state.preview ? "Sample export downloaded." : "Your private Brokerage export downloaded."); }
  async function showPreview() { state.preview = true; state.account = { id: "preview", name: "Brokerage", weekly_contribution_cents: 50000 }; state.accounts = [state.account]; state.holdings = structuredClone(sampleHoldings); state.quotes = structuredClone(sampleQuotes); state.snapshots = structuredClone(sampleSnapshots); $("#account-label").textContent = "Preview"; $("#home-workspace").hidden = false; setText("#data-status", "Sample workspace — not synced. Configure Supabase to keep private data."); render(); }
  async function initialise() { try { const response = await fetch("/api/config", { cache: "no-store" }); const config = response.ok ? await response.json() : { configured: false }; if (!config.configured) return showPreview(); state.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey); const { data: { session } } = await state.client.auth.getSession(); if (!session) { $("#auth-panel").hidden = false; $("#main-content").setAttribute("aria-busy", "false"); return; } state.user = session.user; state.account = await ensureAccount(); $("#account-label").textContent = state.user.email; $("#sign-out").hidden = false; $("#home-workspace").hidden = false; await loadData(); setText("#data-status", "Private Brokerage account loaded."); } catch (error) { await showPreview(); setText("#data-status", `Private sync is unavailable: ${error.message}. Showing sample data only.`); } }

  $("#magic-link-form").addEventListener("submit", async (event) => { event.preventDefault(); const { error } = await state.client.auth.signInWithOtp({ email: $("#email").value, options: { emailRedirectTo: window.location.origin } }); setText("#auth-message", error ? error.message : "Check your email for a sign-in link."); });
  $("#sign-out").addEventListener("click", async () => { await state.client.auth.signOut(); window.location.reload(); });
  $("#add-asset").addEventListener("click", () => openAsset(null)); $("#close-dialog").addEventListener("click", () => $("#asset-dialog").close()); $("#cancel-dialog").addEventListener("click", () => $("#asset-dialog").close()); $("#asset-dialog").addEventListener("close", () => { $("#asset-dialog").hidden = true; }); $("#asset-form").addEventListener("submit", saveAsset); $("#asset-valuation-basis").addEventListener("change", syncValuationFields); $("#asset-symbol").addEventListener("input", scheduleQuote); $("#asset-shares").addEventListener("input", scheduleQuote); $("#holding-search").addEventListener("input", render); $("#account-filter").addEventListener("change", async (event) => { const account = state.accounts.find((entry) => entry.id === event.target.value); if (account) { state.account = account; await loadData(); } }); $("#refresh-quotes").addEventListener("click", refreshPrices); $("#refresh-history").addEventListener("click", refreshHistory); $("#export-data").addEventListener("click", exportData);
  initialise();
})();
