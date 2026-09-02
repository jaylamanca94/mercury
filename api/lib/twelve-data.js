const QUOTE_CACHE_TTL_MS = 5 * 60 * 1000;
const DISTRIBUTION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const quoteCache = new Map();
const distributionCache = new Map();
const CRYPTO_TICKERS = new Set(["BTC", "ETH", "SOL", "LINK", "AVAX", "SHIB", "ETC"]);

function isCryptoSymbol(value, instrumentType) {
  return instrumentType === "crypto" || value.includes("/") || CRYPTO_TICKERS.has(value);
}

function normaliseSymbol(symbol, instrumentType) {
  const value = String(symbol || "").trim().toUpperCase().replace(/-USD$/, "/USD");
  if (!value) throw new Error("A symbol is required.");
  if (isCryptoSymbol(value, instrumentType) && !value.includes("/")) return `${value}/USD`;
  return value;
}

function dollarsToCents(value, field) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error(`Twelve Data returned no usable ${field}.`);
  return Math.round(amount * 100);
}

function mapQuote(payload, symbol) {
  if (payload.code || payload.status === "error") throw new Error(payload.message || "Twelve Data could not quote this symbol.");
  return {
    symbol,
    priceCents: dollarsToCents(payload.close ?? payload.price, "price"),
    priorCloseCents:
      payload.previous_close === undefined || payload.previous_close === null || payload.previous_close === ""
        ? null
        : dollarsToCents(payload.previous_close, "previous close"),
    asOf: payload.datetime ? new Date(payload.datetime).toISOString() : new Date().toISOString(),
    source: "Twelve Data",
  };
}

function optionalDollarsToCents(value) {
  if (value === undefined || value === null || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

function normaliseRate(value) {
  if (value === undefined || value === null || value === "") return null;
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate < 0) return null;
  if (rate <= 1) return rate;
  return rate <= 100 ? rate / 100 : null;
}

function mapDistribution(payload, priceCents) {
  if (!payload || payload.code || payload.status === "error") {
    return { annualDividendCents: null, distributionYieldRate: null };
  }

  const dividends =
    payload.statistics?.dividends_and_splits ||
    payload.meta?.dividends_and_splits ||
    payload.dividends_and_splits ||
    {};
  const annualDividendCents = optionalDollarsToCents(
    dividends.trailing_annual_dividend_rate ?? dividends.forward_annual_dividend_rate,
  );
  const providerDistributionYieldRate = normaliseRate(
    dividends.trailing_annual_dividend_yield ?? dividends.forward_annual_dividend_yield,
  );

  return {
    annualDividendCents,
    distributionYieldRate:
      annualDividendCents !== null && priceCents > 0
        ? annualDividendCents / priceCents
        : providerDistributionYieldRate,
  };
}

async function getQuote({ symbol, instrumentType }) {
  const normalisedSymbol = normaliseSymbol(symbol, instrumentType);
  const resolvedInstrumentType = isCryptoSymbol(normalisedSymbol, instrumentType) ? "crypto" : instrumentType || "other";
  const cacheKey = `${resolvedInstrumentType}:${normalisedSymbol}`;
  const cached = quoteCache.get(cacheKey);
  if (cached && Date.now() - cached.savedAt < QUOTE_CACHE_TTL_MS) return cached.value;
  if (!process.env.TWELVE_DATA_API_KEY) throw new Error("Quotes are not configured yet.");

  async function fetchQuote(providerSymbol) {
    const url = new URL("https://api.twelvedata.com/quote");
    url.searchParams.set("symbol", providerSymbol);
    url.searchParams.set("apikey", process.env.TWELVE_DATA_API_KEY);
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("The quote provider is unavailable. Your last successful quote is retained.");
    return mapQuote(await response.json(), providerSymbol);
  }

  async function fetchDistribution(providerSymbol, priceCents, resolvedType) {
    if (resolvedType === "crypto" || resolvedType === "cash") {
      return { annualDividendCents: null, distributionYieldRate: null };
    }

    const cachedDistribution = distributionCache.get(providerSymbol);
    if (cachedDistribution && Date.now() - cachedDistribution.savedAt < DISTRIBUTION_CACHE_TTL_MS) {
      return cachedDistribution.value;
    }

    try {
      const url = new URL("https://api.twelvedata.com/statistics");
      url.searchParams.set("symbol", providerSymbol);
      url.searchParams.set("apikey", process.env.TWELVE_DATA_API_KEY);
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) return { annualDividendCents: null, distributionYieldRate: null };
      const value = mapDistribution(await response.json(), priceCents);
      if (value.annualDividendCents !== null || value.distributionYieldRate !== null) {
        distributionCache.set(providerSymbol, { value, savedAt: Date.now() });
      }
      return value;
    } catch {
      return { annualDividendCents: null, distributionYieldRate: null };
    }
  }

  async function enrichQuote(providerSymbol, resolvedType) {
    const quote = await fetchQuote(providerSymbol);
    const distribution = await fetchDistribution(providerSymbol, quote.priceCents, resolvedType);
    return { ...quote, ...distribution, instrumentType: resolvedType };
  }

  try {
    const value = await enrichQuote(normalisedSymbol, resolvedInstrumentType);
    quoteCache.set(cacheKey, { value, savedAt: Date.now() });
    return value;
  } catch (error) {
    const canTryUsdPair = (!instrumentType || instrumentType === "other") && !normalisedSymbol.includes("/");
    if (!canTryUsdPair) throw error;
    const cryptoSymbol = `${normalisedSymbol}/USD`;
    const value = await enrichQuote(cryptoSymbol, "crypto");
    quoteCache.set(cacheKey, { value, savedAt: Date.now() });
    return value;
  }
}

module.exports = {
  QUOTE_CACHE_TTL_MS,
  DISTRIBUTION_CACHE_TTL_MS,
  _internals: { dollarsToCents, isCryptoSymbol, mapDistribution, mapQuote, normaliseRate, normaliseSymbol },
  getQuote,
};
