const QUOTE_CACHE_TTL_MS = 5 * 60 * 1000;
const DISTRIBUTION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const PERFORMANCE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const quoteCache = new Map();
const distributionCache = new Map();
const performanceCache = new Map();
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

function annualizedReturn(values) {
  const observations = (Array.isArray(values) ? values : [])
    .map((value) => ({ date: new Date(value?.datetime || value?.date), close: Number(value?.close) }))
    .filter(({ date, close }) => Number.isFinite(date.getTime()) && Number.isFinite(close) && close > 0)
    .sort((left, right) => left.date - right.date);
  if (observations.length < 2) return { annualizedReturnRate: null, annualizedReturnYears: null };

  const first = observations[0];
  const last = observations.at(-1);
  const years = (last.date - first.date) / (365.25 * 24 * 60 * 60 * 1000);
  if (!Number.isFinite(years) || years < 1) return { annualizedReturnRate: null, annualizedReturnYears: null };
  const rate = (last.close / first.close) ** (1 / years) - 1;
  return {
    annualizedReturnRate: Number.isFinite(rate) && rate >= -1 ? rate : null,
    annualizedReturnYears: Number.isFinite(rate) && rate >= -1 ? Math.round(years * 10) / 10 : null,
  };
}

function mapYahooDistribution(payload, priceCents) {
  const result = payload?.chart?.result?.[0];
  if (!result || !Number.isFinite(priceCents) || priceCents <= 0) {
    return { annualDividendCents: null, distributionYieldRate: null };
  }
  const dividends = Object.values(result.events?.dividends || {});
  const amounts = dividends.map((dividend) => Number(dividend?.amount));
  if (amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) {
    return { annualDividendCents: null, distributionYieldRate: null };
  }
  const annualDividendCents = Math.round(amounts.reduce((total, amount) => total + amount, 0) * 100);
  return { annualDividendCents, distributionYieldRate: annualDividendCents / priceCents };
}

function mapYahooPerformance(payload) {
  const result = payload?.chart?.result?.[0];
  const timestamps = result?.timestamp;
  const adjustedCloses = result?.indicators?.adjclose?.[0]?.adjclose;
  if (!Array.isArray(timestamps) || !Array.isArray(adjustedCloses)) {
    return { annualizedReturnRate: null, annualizedReturnYears: null };
  }
  return annualizedReturn(timestamps.map((timestamp, index) => ({
    datetime: new Date(timestamp * 1000).toISOString(),
    close: adjustedCloses[index],
  })));
}

async function getQuote({ symbol, instrumentType, includeMetrics = false }) {
  const normalisedSymbol = normaliseSymbol(symbol, instrumentType);
  const resolvedInstrumentType = isCryptoSymbol(normalisedSymbol, instrumentType) ? "crypto" : instrumentType || "other";
  const cacheKey = `${resolvedInstrumentType}:${normalisedSymbol}`;
  const cached = quoteCache.get(cacheKey);
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
      if (response.ok) {
        const value = mapDistribution(await response.json(), priceCents);
        if (value.annualDividendCents !== null || value.distributionYieldRate !== null) {
          distributionCache.set(providerSymbol, { value, savedAt: Date.now() });
          return value;
        }
      }
    } catch {
      // Statistics are optional; the cash-distribution history below is the live fallback.
    }

    try {
      const yahooSymbol = providerSymbol.replace("/USD", "-USD");
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1y&interval=1d&events=div`;
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "Mercury portfolio source bridge" },
      });
      if (!response.ok) return { annualDividendCents: null, distributionYieldRate: null };
      const value = mapYahooDistribution(await response.json(), priceCents);
      if (value.annualDividendCents !== null || value.distributionYieldRate !== null) {
        distributionCache.set(providerSymbol, { value, savedAt: Date.now() });
      }
      return value;
    } catch {
      return { annualDividendCents: null, distributionYieldRate: null };
    }
  }

  async function fetchPerformance(providerSymbol) {
    const cachedPerformance = performanceCache.get(providerSymbol);
    if (cachedPerformance && Date.now() - cachedPerformance.savedAt < PERFORMANCE_CACHE_TTL_MS) {
      return cachedPerformance.value;
    }
    try {
      const url = new URL("https://api.twelvedata.com/time_series");
      url.searchParams.set("symbol", providerSymbol);
      url.searchParams.set("interval", "1month");
      url.searchParams.set("outputsize", "61");
      url.searchParams.set("order", "asc");
      url.searchParams.set("adjust", "dividends");
      url.searchParams.set("apikey", process.env.TWELVE_DATA_API_KEY);
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (response.ok) {
        const value = annualizedReturn((await response.json())?.values);
        if (value.annualizedReturnRate !== null) {
          performanceCache.set(providerSymbol, { value, savedAt: Date.now() });
          return value;
        }
      }
    } catch {
      // Mutual-fund history is not available for every Twelve Data plan or symbol.
    }

    try {
      const yahooSymbol = providerSymbol.replace("/USD", "-USD");
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=5y&interval=1mo`;
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "Mercury portfolio source bridge" },
      });
      if (!response.ok) return { annualizedReturnRate: null, annualizedReturnYears: null };
      const value = mapYahooPerformance(await response.json());
      if (value.annualizedReturnRate !== null) performanceCache.set(providerSymbol, { value, savedAt: Date.now() });
      return value;
    } catch {
      return { annualizedReturnRate: null, annualizedReturnYears: null };
    }
  }

  async function enrichQuote(providerSymbol, resolvedType, baseQuote) {
    const quote = baseQuote || await fetchQuote(providerSymbol);
    const distribution = await fetchDistribution(providerSymbol, quote.priceCents, resolvedType);
    const performance = includeMetrics ? await fetchPerformance(providerSymbol) : {};
    return { ...quote, ...distribution, ...performance, instrumentType: resolvedType };
  }

  try {
    const cachedQuote = cached && Date.now() - cached.savedAt < QUOTE_CACHE_TTL_MS ? cached.value : null;
    const value = await enrichQuote(normalisedSymbol, resolvedInstrumentType, cachedQuote);
    if (!cachedQuote) quoteCache.set(cacheKey, { value, savedAt: Date.now() });
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
  PERFORMANCE_CACHE_TTL_MS,
  _internals: { annualizedReturn, dollarsToCents, isCryptoSymbol, mapDistribution, mapQuote, mapYahooDistribution, mapYahooPerformance, normaliseRate, normaliseSymbol },
  getQuote,
};
