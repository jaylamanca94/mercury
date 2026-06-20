const FRED_GRAPH_BASE_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";
const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2";
const UPSTREAM_TIMEOUT_MS = 8000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const YAHOO_HISTORY_RANGE = "5y";
const YAHOO_HISTORY_OBSERVATIONS = 1300;

const FRESHNESS_RULES = {
  daily: {
    currentDays: 5,
    delayedDays: 10,
    expectation: "usually updated within 5 days for daily market data",
  },
  weekly: {
    currentDays: 14,
    delayedDays: 28,
    expectation: "usually updated within 14 days for weekly releases",
  },
  monthly: {
    currentDays: 75,
    delayedDays: 120,
    expectation: "usually updated within 75 days for monthly releases",
  },
  quarterly: {
    currentDays: 210,
    delayedDays: 300,
    expectation: "usually updated within 210 days for quarterly releases",
  },
  annual: {
    currentDays: 900,
    delayedDays: 1200,
    expectation: "usually updated within 900 days for annual releases",
  },
};

const YAHOO_SERIES = [
  {
    id: "global-us-total",
    section: "marketPulse",
    name: "U.S. Total",
    context: "Vanguard Total Stock Market ETF",
    icon: "fa-earth-americas",
    symbol: "VTI",
    ticker: "VTI",
    source: "Yahoo Finance: Vanguard Total Stock Market ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Global",
    marketRole: "global-allocation",
    marketOrder: 5,
    weight: 1.25,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "global-international",
    section: "marketPulse",
    name: "International",
    context: "Vanguard Total International Stock ETF",
    icon: "fa-globe",
    symbol: "VXUS",
    ticker: "VXUS",
    source: "Yahoo Finance: Vanguard Total International Stock ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Global",
    marketRole: "global-allocation",
    marketOrder: 6,
    weight: 1.25,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-equities",
    section: "marketPulse",
    name: "S&P 500",
    context: "Vanguard S&P 500 ETF",
    icon: "fa-building",
    symbol: "VOO",
    ticker: "VOO",
    source: "Yahoo Finance: Vanguard S&P 500 ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "large-cap",
    marketOrder: 10,
    weight: 1.25,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-small-cap",
    section: "marketPulse",
    name: "Small Cap",
    context: "Vanguard Small-Cap Index Fund",
    icon: "fa-shop",
    symbol: "VSMAX",
    ticker: "VSMAX",
    source: "Yahoo Finance: Vanguard Small-Cap Index Fund Admiral Shares chart",
    cadence: "Daily fund close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "small-cap",
    marketOrder: 20,
    weight: 1,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-technology",
    section: "marketPulse",
    name: "Technology",
    context: "Vanguard Information Technology ETF",
    icon: "fa-microchip",
    symbol: "VGT",
    ticker: "VGT",
    source: "Yahoo Finance: Vanguard Information Technology ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "technology",
    marketOrder: 30,
    weight: 1,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "bonds",
    section: "marketPulse",
    name: "Bonds",
    context: "Total bond market ETF",
    icon: "fa-scale-balanced",
    symbol: "BND",
    ticker: "BND",
    source: "Yahoo Finance: Vanguard Total Bond Market ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "bonds",
    marketOrder: 60,
    weight: 0.75,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "bond-price",
  },
  {
    id: "us-financials",
    section: "marketPulse",
    name: "Financials",
    context: "Vanguard Financials ETF",
    icon: "fa-building-columns",
    symbol: "VFH",
    ticker: "VFH",
    source: "Yahoo Finance: Vanguard Financials ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "financials",
    marketOrder: 40,
    weight: 0.9,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-industrials",
    section: "marketPulse",
    name: "Industrials",
    context: "Vanguard Industrials ETF",
    icon: "fa-industry",
    symbol: "VIS",
    ticker: "VIS",
    source: "Yahoo Finance: Vanguard Industrials ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "industrials",
    marketOrder: 50,
    weight: 0.9,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-energy",
    section: "marketPulse",
    name: "Energy",
    context: "Vanguard Energy ETF",
    icon: "fa-bolt",
    symbol: "VDE",
    ticker: "VDE",
    source: "Yahoo Finance: Vanguard Energy ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "energy",
    marketOrder: 70,
    weight: 0.85,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-reit",
    section: "marketPulse",
    name: "REIT",
    context: "Vanguard Real Estate ETF",
    icon: "fa-city",
    symbol: "VNQ",
    ticker: "VNQ",
    source: "Yahoo Finance: Vanguard Real Estate ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "real-estate",
    marketOrder: 80,
    weight: 0.8,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-healthcare",
    section: "marketPulse",
    name: "Healthcare",
    context: "Vanguard Health Care ETF",
    icon: "fa-heart-pulse",
    symbol: "VHT",
    ticker: "VHT",
    source: "Yahoo Finance: Vanguard Health Care ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "healthcare",
    marketOrder: 90,
    weight: 0.9,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-consumer",
    section: "marketPulse",
    name: "Consumer",
    context: "Vanguard Consumer Discretionary ETF",
    icon: "fa-bag-shopping",
    symbol: "VCR",
    ticker: "VCR",
    source: "Yahoo Finance: Vanguard Consumer Discretionary ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "consumer",
    marketOrder: 100,
    weight: 0.85,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-communications",
    section: "marketPulse",
    name: "Communications",
    context: "Vanguard Communication Services ETF",
    icon: "fa-tower-broadcast",
    symbol: "VOX",
    ticker: "VOX",
    source: "Yahoo Finance: Vanguard Communication Services ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "communications",
    marketOrder: 110,
    weight: 0.85,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-growth",
    section: "marketPulse",
    name: "Growth",
    context: "Vanguard Growth ETF",
    icon: "fa-chart-line",
    symbol: "VUG",
    ticker: "VUG",
    source: "Yahoo Finance: Vanguard Growth ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "growth",
    marketOrder: 120,
    weight: 0.9,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "us-materials",
    section: "marketPulse",
    name: "Materials",
    context: "Vanguard Materials ETF",
    icon: "fa-flask",
    symbol: "VAW",
    ticker: "VAW",
    source: "Yahoo Finance: Vanguard Materials ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "United States",
    marketRole: "materials",
    marketOrder: 130,
    weight: 0.85,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "europe-equities",
    section: "marketPulse",
    name: "Europe",
    context: "Vanguard FTSE Europe ETF",
    icon: "fa-globe",
    symbol: "VGK",
    ticker: "VGK",
    source: "Yahoo Finance: Vanguard FTSE Europe ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Europe",
    marketRole: "large-cap",
    marketOrder: 10,
    weight: 1.25,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "europe-financials",
    section: "marketPulse",
    name: "Financials",
    context: "STOXX Europe banks index",
    icon: "fa-building-columns",
    symbol: "^SX7P",
    ticker: "SX7P",
    source: "Yahoo Finance: STOXX Europe 600 Banks index chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Europe",
    marketRole: "financials",
    marketOrder: 20,
    weight: 1,
    valueKind: "latest",
    valueFormat: "number",
    decimals: 1,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "europe-industrials",
    section: "marketPulse",
    name: "Industrials",
    context: "STOXX Europe industrials index",
    icon: "fa-industry",
    symbol: "^SXNP",
    ticker: "SXNP",
    source: "Yahoo Finance: STOXX Europe 600 Industrial Goods & Services index chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Europe",
    marketRole: "industrials",
    marketOrder: 30,
    weight: 1,
    valueKind: "latest",
    valueFormat: "number",
    decimals: 1,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "europe-healthcare",
    section: "marketPulse",
    name: "Healthcare",
    context: "STOXX Europe healthcare index",
    icon: "fa-heart-pulse",
    symbol: "^SXDP",
    ticker: "SXDP",
    source: "Yahoo Finance: STOXX Europe 600 Health Care index chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Europe",
    marketRole: "healthcare",
    marketOrder: 40,
    weight: 1,
    valueKind: "latest",
    valueFormat: "number",
    decimals: 1,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "europe-consumer",
    section: "marketPulse",
    name: "Consumer",
    context: "STOXX Europe consumer index",
    icon: "fa-bag-shopping",
    symbol: "^SXQP",
    ticker: "SXQP",
    source: "Yahoo Finance: STOXX Europe 600 Personal & Household Goods index chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Europe",
    marketRole: "consumer",
    marketOrder: 50,
    weight: 1,
    valueKind: "latest",
    valueFormat: "number",
    decimals: 1,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "europe-energy",
    section: "marketPulse",
    name: "Energy",
    context: "STOXX Europe energy index",
    icon: "fa-bolt",
    symbol: "^SXEP",
    ticker: "SXEP",
    source: "Yahoo Finance: STOXX Europe 600 Oil & Gas index chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Europe",
    marketRole: "energy",
    marketOrder: 60,
    weight: 1,
    valueKind: "latest",
    valueFormat: "number",
    decimals: 1,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "asia-japan",
    section: "marketPulse",
    name: "Japan",
    context: "iShares MSCI Japan ETF",
    icon: "fa-torii-gate",
    symbol: "EWJ",
    ticker: "EWJ",
    source: "Yahoo Finance: iShares MSCI Japan ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Asia",
    marketRole: "country",
    marketOrder: 10,
    weight: 1,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "asia-china",
    section: "marketPulse",
    name: "China",
    context: "iShares MSCI China ETF",
    icon: "fa-city",
    symbol: "MCHI",
    ticker: "MCHI",
    source: "Yahoo Finance: iShares MSCI China ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Asia",
    marketRole: "country",
    marketOrder: 20,
    weight: 1,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "asia-india",
    section: "marketPulse",
    name: "India",
    context: "iShares MSCI India ETF",
    icon: "fa-landmark-dome",
    symbol: "INDA",
    ticker: "INDA",
    source: "Yahoo Finance: iShares MSCI India ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Asia",
    marketRole: "country",
    marketOrder: 30,
    weight: 1,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "asia-taiwan",
    section: "marketPulse",
    name: "Taiwan",
    context: "iShares MSCI Taiwan ETF",
    icon: "fa-microchip",
    symbol: "EWT",
    ticker: "EWT",
    source: "Yahoo Finance: iShares MSCI Taiwan ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Asia",
    marketRole: "country",
    marketOrder: 40,
    weight: 1,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "asia-south-korea",
    section: "marketPulse",
    name: "South Korea",
    context: "iShares MSCI South Korea ETF",
    icon: "fa-industry",
    symbol: "EWY",
    ticker: "EWY",
    source: "Yahoo Finance: iShares MSCI South Korea ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Asia",
    marketRole: "country",
    marketOrder: 50,
    weight: 1,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "asia-equities",
    section: "marketPulse",
    name: "Asia Broad",
    context: "Vanguard FTSE Pacific ETF",
    icon: "fa-earth-asia",
    symbol: "VPL",
    ticker: "VPL",
    source: "Yahoo Finance: Vanguard FTSE Pacific ETF chart",
    cadence: "Daily market close",
    viewGroup: "economy",
    region: "Asia",
    marketRole: "large-cap",
    marketOrder: 60,
    weight: 1.25,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "dollar-index",
    section: "marketPulse",
    name: "U.S. dollar",
    context: "Dollar index fund proxy",
    icon: "fa-dollar-sign",
    symbol: "UUP",
    ticker: "UUP",
    source: "Yahoo Finance: Invesco DB U.S. Dollar Index Bullish Fund chart",
    cadence: "Daily market close",
    viewGroup: "currency",
    weight: 1,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "dollar",
  },
  {
    id: "oil",
    section: "marketPulse",
    name: "Oil",
    context: "WTI crude futures",
    icon: "fa-gas-pump",
    symbol: "CL=F",
    ticker: "CL=F",
    source: "Yahoo Finance: WTI crude futures chart",
    cadence: "Daily market close",
    viewGroup: "currency",
    weight: 1,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "commodity",
  },
  {
    id: "bitcoin",
    section: "marketPulse",
    name: "Bitcoin",
    context: "BTC/USD spot rate",
    icon: "fa-brands fa-bitcoin",
    symbol: "BTC-USD",
    ticker: "BTC",
    source: "Yahoo Finance: Bitcoin USD chart",
    cadence: "Daily crypto close",
    viewGroup: "currency",
    weight: 0.5,
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 0,
    comparison: "percent-change",
    trendModel: "market",
  },
  {
    id: "euro",
    section: "marketPulse",
    name: "Euro",
    context: "EUR/USD exchange rate",
    icon: "fa-euro-sign",
    symbol: "EURUSD=X",
    ticker: "EUR/USD",
    source: "Yahoo Finance: EUR/USD exchange rate",
    cadence: "Daily market close",
    viewGroup: "currency",
    weight: 1,
    valueKind: "latest",
    valueFormat: "number",
    decimals: 4,
    comparison: "percent-change",
    trendModel: "currency",
  },
  {
    id: "yen",
    section: "marketPulse",
    name: "Yen",
    context: "USD/JPY exchange rate",
    icon: "fa-yen-sign",
    symbol: "JPY=X",
    ticker: "USD/JPY",
    source: "Yahoo Finance: USD/JPY exchange rate",
    cadence: "Daily market close",
    viewGroup: "currency",
    weight: 1,
    valueKind: "latest",
    valueFormat: "number",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "currency",
  },
  {
    id: "volatility",
    section: "riskIndicators",
    name: "Volatility",
    icon: "fa-wave-square",
    symbol: "^VIX",
    source: "Yahoo Finance: CBOE Volatility Index chart",
    cadence: "Daily market close",
    valueKind: "latest",
    valueFormat: "number",
    decimals: 1,
    comparison: "point-change",
    trendModel: "volatility",
  },
  {
    id: "high-yield-credit",
    section: "riskIndicators",
    name: "Credit stress",
    icon: "fa-landmark",
    symbol: "HYG",
    source: "Yahoo Finance: iShares iBoxx High Yield Corporate Bond ETF chart",
    cadence: "Daily market close",
    valueKind: "latest",
    valueFormat: "currency",
    decimals: 2,
    comparison: "percent-change",
    trendModel: "credit-market",
  },
];

const FRED_SERIES = [
  {
    id: "inflation",
    section: "economicHealth",
    name: "Inflation",
    context: "Consumer prices",
    icon: "fa-receipt",
    seriesId: "CPIAUCSL",
    ticker: "CPI",
    source: "FRED: Consumer Price Index for All Urban Consumers",
    cadence: "Monthly release",
    valueKind: "year-over-year",
    valueFormat: "percent",
    decimals: 1,
    comparison: "point-change",
    trendModel: "inflation",
  },
  {
    id: "interest-rates",
    section: "economicHealth",
    name: "Interest rates",
    context: "Federal funds rate",
    icon: "fa-percent",
    seriesId: "FEDFUNDS",
    ticker: "Fed funds",
    source: "FRED: Effective Federal Funds Rate",
    cadence: "Monthly average",
    valueKind: "latest",
    valueFormat: "percent",
    decimals: 2,
    comparison: "point-change",
    trendModel: "policy-rate",
  },
  {
    id: "unemployment",
    section: "economicHealth",
    name: "Unemployment",
    context: "Labor market",
    icon: "fa-briefcase",
    seriesId: "UNRATE",
    ticker: "UNRATE",
    source: "FRED: Unemployment Rate",
    cadence: "Monthly release",
    valueKind: "latest",
    valueFormat: "percent",
    decimals: 1,
    comparison: "point-change",
    trendModel: "unemployment",
  },
  {
    id: "gdp-growth",
    section: "economicHealth",
    name: "GDP growth",
    context: "Quarterly pace",
    icon: "fa-seedling",
    seriesId: "A191RL1Q225SBEA",
    ticker: "GDP",
    source: "FRED: Real GDP percent change at annual rate",
    cadence: "Quarterly release",
    valueKind: "latest",
    valueFormat: "percent",
    decimals: 1,
    comparison: "point-change",
    trendModel: "gdp",
  },
  {
    id: "financial-stress",
    section: "riskIndicators",
    name: "Financial stress",
    icon: "fa-gauge-high",
    seriesId: "STLFSI4",
    ticker: "STLFSI4",
    source: "FRED: St. Louis Fed Financial Stress Index",
    cadence: "Weekly index",
    valueKind: "latest",
    valueFormat: "number",
    decimals: 2,
    comparison: "point-change",
    trendModel: "financial-stress",
  },
];

const WORLD_BANK_REGIONS = [
  {
    id: "united-states",
    name: "United States",
    countryCode: "USA",
    source: "World Bank: GDP growth (annual %)",
  },
  {
    id: "european-union",
    name: "European Union",
    countryCode: "EUU",
    source: "World Bank: GDP growth (annual %)",
  },
  {
    id: "china",
    name: "China",
    countryCode: "CHN",
    source: "World Bank: GDP growth (annual %)",
  },
  {
    id: "low-middle-income",
    name: "Low and middle income",
    countryCode: "LMY",
    source: "World Bank: GDP growth (annual %)",
  },
];

function parseFredCsv(csv) {
  const rows = csv.trim().split(/\r?\n/).slice(1);

  return rows
    .map((row) => {
      const [date, rawValue] = row.split(",");
      const value = Number.parseFloat(rawValue);

      if (!date || Number.isNaN(value)) {
        return null;
      }

      return { date, value };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchWithTimeout(url, options = {}) {
  const { timeoutMs = UPSTREAM_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function percentChange(current, previous) {
  if (!previous) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatNumber(value, decimals) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

function formatValue(value, series, currency = "USD") {
  if (series.valueFormat === "currency") {
    return new Intl.NumberFormat("en-US", {
      currency,
      maximumFractionDigits: series.decimals,
      minimumFractionDigits: series.decimals,
      style: "currency",
    }).format(value);
  }

  if (series.valueFormat === "percent") {
    return `${value.toFixed(series.decimals)}%`;
  }

  return formatNumber(value, series.decimals);
}

function formatPercentChange(value) {
  if (value === null || Math.abs(value) < 0.05) {
    return "No change";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatPointChange(value) {
  if (Math.abs(value) < 0.005) {
    return "No change";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(2)} pts`;
}

function inferFreshnessCadence(cadence) {
  const normalizedCadence = String(cadence || "").toLowerCase();

  if (normalizedCadence.includes("daily")) return "daily";
  if (normalizedCadence.includes("weekly")) return "weekly";
  if (normalizedCadence.includes("monthly")) return "monthly";
  if (normalizedCadence.includes("quarterly")) return "quarterly";
  if (normalizedCadence.includes("annual")) return "annual";

  return "monthly";
}

function normalizeFreshnessDate(value) {
  if (!value) {
    return null;
  }

  if (/^\d{4}$/.test(value)) {
    return `${value}-12-31`;
  }

  return value;
}

function pluralizeDays(days) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function classifyReleaseFreshness(releaseDate, cadence, checkedAt = new Date()) {
  const normalizedDate = normalizeFreshnessDate(releaseDate);
  const releaseTime = normalizedDate ? new Date(`${normalizedDate}T00:00:00Z`).getTime() : NaN;
  const checkedTime = checkedAt instanceof Date ? checkedAt.getTime() : new Date(checkedAt).getTime();

  if (!normalizedDate || Number.isNaN(releaseTime) || Number.isNaN(checkedTime)) {
    return {
      status: "unavailable",
      label: "Freshness unavailable",
      detail: "No source release date was available.",
      ageDays: null,
    };
  }

  const cadenceKey = inferFreshnessCadence(cadence);
  const rule = FRESHNESS_RULES[cadenceKey] || FRESHNESS_RULES.monthly;
  const ageDays = Math.max(0, Math.floor((checkedTime - releaseTime) / MS_PER_DAY));
  const base = {
    ageDays,
    cadence: cadenceKey,
    expectation: rule.expectation,
  };

  if (ageDays <= rule.currentDays) {
    return {
      ...base,
      status: "current",
      label: "Current",
      detail: `${pluralizeDays(ageDays)} old; ${rule.expectation}.`,
    };
  }

  if (ageDays <= rule.delayedDays) {
    return {
      ...base,
      status: "delayed",
      label: "Delayed",
      detail: `${pluralizeDays(ageDays)} old; ${rule.expectation}.`,
    };
  }

  return {
    ...base,
    status: "stale",
    label: "Stale",
    detail: `${pluralizeDays(ageDays)} old; ${rule.expectation}.`,
  };
}

function withFreshness(item, checkedAt) {
  return {
    ...item,
    freshness: classifyReleaseFreshness(item.releaseDate, item.cadence, checkedAt),
  };
}

function buildFreshnessSummary(items) {
  const counts = {
    current: 0,
    delayed: 0,
    stale: 0,
    unavailable: 0,
  };

  items.forEach((item) => {
    const status = item.freshness?.status || "unavailable";
    counts[status] = (counts[status] || 0) + 1;
  });

  const connectedCount = counts.current + counts.delayed + counts.stale;

  if (!connectedCount) {
    return {
      status: "unavailable",
      label: "Freshness unavailable",
      copy: "No public source returned a usable release date.",
      counts,
    };
  }

  if (counts.stale > 0) {
    return {
      status: "stale",
      label: `${counts.stale} stale ${counts.stale === 1 ? "release" : "releases"}`,
      copy: "Some releases are stale for their update schedule. Mercury keeps values visible and labels the freshness risk.",
      counts,
    };
  }

  if (counts.delayed > 0) {
    return {
      status: "delayed",
      label: `${counts.delayed} delayed ${counts.delayed === 1 ? "release" : "releases"}`,
      copy: "Some releases are late for their usual update schedule. Mercury labels them delayed instead of current.",
      counts,
    };
  }

  if (counts.unavailable > 0) {
    return {
      status: "partial",
      label: "Connected releases current",
      copy: "Connected releases are current; unavailable sources remain called out separately.",
      counts,
    };
  }

  return {
    status: "current",
    label: "Release cadence current",
    copy: "Connected public data is within expected update windows.",
    counts,
  };
}

function buildValues(observations, series) {
  if (series.valueKind === "year-over-year") {
    return observations
      .map((observation, index) => {
        const previousYear = observations[index - 12];
        const value = percentChange(observation.value, previousYear?.value);

        if (value === null) {
          return null;
        }

        return { date: observation.date, value };
      })
      .filter(Boolean);
  }

  return observations;
}

function classifyTrend(series, latest, previous) {
  const delta = latest - previous;
  const pctDelta = percentChange(latest, previous) || 0;

  if (series.trendModel === "market") {
    if (Math.abs(pctDelta) < 0.1) return { trend: "Little changed", tone: "stable" };
    return pctDelta > 0 ? { trend: "Higher", tone: "up" } : { trend: "Lower", tone: "down" };
  }

  if (series.trendModel === "bond-price") {
    if (Math.abs(pctDelta) < 0.1) return { trend: "Little changed", tone: "stable" };
    return pctDelta > 0 ? { trend: "Higher", tone: "up" } : { trend: "Lower", tone: "mixed" };
  }

  if (series.trendModel === "dollar") {
    if (Math.abs(pctDelta) < 0.15) return { trend: "Stable", tone: "stable" };
    return pctDelta > 0 ? { trend: "Stronger", tone: "mixed" } : { trend: "Softer", tone: "stable" };
  }

  if (series.trendModel === "currency") {
    if (Math.abs(pctDelta) < 0.15) return { trend: "Stable", tone: "stable" };
    return pctDelta > 0 ? { trend: "Higher", tone: "mixed" } : { trend: "Lower", tone: "stable" };
  }

  if (series.trendModel === "commodity") {
    if (Math.abs(pctDelta) < 0.5) return { trend: "Stable", tone: "stable" };
    return pctDelta > 0 ? { trend: "Rising", tone: "caution" } : { trend: "Falling", tone: "mixed" };
  }

  if (series.trendModel === "inflation") {
    if (latest >= 3) {
      if (delta < -0.05) return { trend: "Cooling", tone: "mixed" };
      return { trend: "Elevated", tone: "caution" };
    }
    return { trend: "Contained", tone: "stable" };
  }

  if (series.trendModel === "policy-rate") {
    if (Math.abs(delta) < 0.05) return { trend: "Stable", tone: "stable" };
    return delta > 0 ? { trend: "Rising", tone: "caution" } : { trend: "Falling", tone: "mixed" };
  }

  if (series.trendModel === "unemployment") {
    if (latest >= 4.8 || delta > 0.2) return { trend: "Softening", tone: "caution" };
    return { trend: "Stable", tone: "stable" };
  }

  if (series.trendModel === "gdp") {
    if (latest >= 1.5) return { trend: "Positive", tone: "up" };
    if (latest >= 0) return { trend: "Slow", tone: "mixed" };
    return { trend: "Contracting", tone: "caution" };
  }

  if (series.trendModel === "volatility") {
    if (latest < 18) return { trend: "Contained", tone: "up" };
    if (latest < 25) return { trend: "Watch", tone: "mixed" };
    return { trend: "Elevated", tone: "caution" };
  }

  if (series.trendModel === "credit-market") {
    if (Math.abs(pctDelta) < 0.15) return { trend: "Stable", tone: "stable" };
    return pctDelta > 0 ? { trend: "Improving", tone: "up" } : { trend: "Softer", tone: "caution" };
  }

  if (series.trendModel === "financial-stress") {
    if (latest < 0) return { trend: "Below average", tone: "up" };
    if (latest < 1) return { trend: "Normal", tone: "stable" };
    return { trend: "Elevated", tone: "caution" };
  }

  return { trend: "Updated", tone: "stable" };
}

function buildRiskCopy(series, value, change) {
  if (value === "Unavailable") {
    return `${series.name} is unavailable from its public source.`;
  }

  if (series.trendModel === "volatility") {
    return `The VIX is ${value}, with a ${change.toLowerCase()} move from the prior close.`;
  }

  if (series.trendModel === "credit-market") {
    return `The credit stress proxy is ${value}, with a ${change.toLowerCase()} move from the prior close.`;
  }

  return `Financial stress is ${value}, ${change.toLowerCase()} from the prior weekly reading.`;
}

function unavailableFredItem(series) {
  const base = {
    id: series.id,
    section: series.section,
    name: series.name,
    context: series.context,
    value: "Unavailable",
    trend: "Unavailable",
    tone: "stable",
    icon: series.icon,
    ticker: series.ticker || series.symbol || series.seriesId,
    source: series.source,
    cadence: series.cadence,
    viewGroup: series.viewGroup,
    region: series.region,
    marketRole: series.marketRole,
    weight: series.weight || 1,
    comparison: series.comparison,
    previous: "Unavailable",
    change: "Unavailable",
    points: [],
    history: [],
    sourceStatus: "Unavailable",
  };

  if (series.section === "riskIndicators") {
    return {
      ...base,
      copy: buildRiskCopy(series, base.value, base.change),
    };
  }

  return base;
}

async function fetchFredSeries(series) {
  const url = `${FRED_GRAPH_BASE_URL}?id=${series.seriesId}`;
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "text/csv",
    },
  });

  if (!response.ok) {
    throw new Error(`FRED returned ${response.status} for ${series.seriesId}`);
  }

  const observations = parseFredCsv(await response.text());
  const values = buildValues(observations, series);

  if (values.length < 2) {
    throw new Error(`FRED series ${series.seriesId} did not include enough observations`);
  }

  const latest = values.at(-1);
  const previous = values.at(-2);
  const classification = classifyTrend(series, latest.value, previous.value);
  const change =
    series.comparison === "percent-change"
      ? formatPercentChange(percentChange(latest.value, previous.value))
      : formatPointChange(latest.value - previous.value);
  const displayValue = formatValue(latest.value, series);

  const base = {
    id: series.id,
    section: series.section,
    name: series.name,
    context: series.context,
    value: displayValue,
    trend: classification.trend,
    tone: classification.tone,
    icon: series.icon,
    ticker: series.ticker || series.symbol || series.seriesId,
    source: series.source,
    cadence: series.cadence,
    viewGroup: series.viewGroup,
    region: series.region,
    marketRole: series.marketRole,
    weight: series.weight || 1,
    comparison: series.comparison,
    previous: formatValue(previous.value, series),
    previousReleaseDate: previous.date,
    change,
    points: values.slice(-7).map((point) => Number(point.value.toFixed(2))),
    history: values.slice(-60).map((point) => ({
      date: point.date,
      value: Number(point.value.toFixed(4)),
    })),
    releaseDate: latest.date,
    sourceStatus: "Source-backed",
  };

  if (series.section === "riskIndicators") {
    return {
      ...base,
      copy: buildRiskCopy(series, displayValue, change),
    };
  }

  return base;
}

async function fetchYahooSeries(series) {
  const url = `${YAHOO_CHART_BASE_URL}/${encodeURIComponent(series.symbol)}?range=${YAHOO_HISTORY_RANGE}&interval=1d`;
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Mercury dashboard source bridge",
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance returned ${response.status} for ${series.symbol}`);
  }

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const currency = result?.meta?.currency || "USD";
  const timestamps = result?.timestamp || [];
  const closes = result?.indicators?.quote?.[0]?.close || [];
  const values = timestamps
    .map((timestamp, index) => {
      const value = closes[index];

      if (!Number.isFinite(value)) {
        return null;
      }

      return {
        date: new Date(timestamp * 1000).toISOString().slice(0, 10),
        value,
      };
    })
    .filter(Boolean);

  if (values.length < 2) {
    throw new Error(`Yahoo Finance did not include enough observations for ${series.symbol}`);
  }

  const latest = values.at(-1);
  const previous = values.at(-2);
  const classification = classifyTrend(series, latest.value, previous.value);
  const change =
    series.comparison === "percent-change"
      ? formatPercentChange(percentChange(latest.value, previous.value))
      : formatPointChange(latest.value - previous.value);
  const displayValue = formatValue(latest.value, series, currency);

  const base = {
    id: series.id,
    section: series.section,
    name: series.name,
    context: series.context,
    value: displayValue,
    trend: classification.trend,
    tone: classification.tone,
    icon: series.icon,
    ticker: series.ticker || series.symbol || series.seriesId,
    source: series.source,
    cadence: series.cadence,
    viewGroup: series.viewGroup,
    region: series.region,
    marketRole: series.marketRole,
    weight: series.weight || 1,
    comparison: series.comparison,
    previous: formatValue(previous.value, series, currency),
    previousReleaseDate: previous.date,
    change,
    points: values.slice(-7).map((point) => Number(point.value.toFixed(2))),
    history: values.slice(-YAHOO_HISTORY_OBSERVATIONS).map((point) => ({
      date: point.date,
      value: Number(point.value.toFixed(4)),
    })),
    releaseDate: latest.date,
    sourceStatus: "Source-backed",
  };

  if (series.section === "riskIndicators") {
    return {
      ...base,
      copy: buildRiskCopy(series, displayValue, change),
    };
  }

  return base;
}

function unavailableRegion(region) {
  return {
    id: region.id,
    name: region.name,
    copy: `${region.name} growth could not be loaded from its public source.`,
    trend: "Unavailable",
    tone: "stable",
    source: region.source,
    cadence: "Annual release",
    sourceStatus: "Unavailable",
  };
}

function classifyRegionalGrowth(latest, previous) {
  const delta = latest - previous;

  if (latest >= 3) return { trend: delta >= 0 ? "Accelerating" : "Positive", tone: "up" };
  if (latest >= 1) return { trend: "Moderate", tone: "stable" };
  if (latest >= 0) return { trend: "Slow", tone: "mixed" };
  return { trend: "Contracting", tone: "caution" };
}

async function fetchWorldBankRegion(region) {
  const url = `${WORLD_BANK_BASE_URL}/country/${region.countryCode}/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=80`;
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`World Bank returned ${response.status} for ${region.countryCode}`);
  }

  const payload = await response.json();
  const rows = Array.isArray(payload?.[1]) ? payload[1] : [];
  const observations = rows
    .filter((row) => row?.date && typeof row.value === "number")
    .map((row) => ({ date: row.date, value: row.value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (observations.length < 2) {
    throw new Error(`World Bank did not include enough GDP observations for ${region.countryCode}`);
  }

  const latest = observations.at(-1);
  const previous = observations.at(-2);
  const classification = classifyRegionalGrowth(latest.value, previous.value);
  const value = `${latest.value.toFixed(1)}%`;
  const change = formatPointChange(latest.value - previous.value);

  return {
    id: region.id,
    name: region.name,
    copy: `Latest annual GDP growth is ${value}, ${change.toLowerCase()} from ${previous.date}.`,
    trend: classification.trend,
    tone: classification.tone,
    source: region.source,
    cadence: "Annual release",
    releaseDate: latest.date,
    previous: `${previous.value.toFixed(1)}%`,
    previousReleaseDate: previous.date,
    change,
    sourceStatus: "Source-backed",
  };
}

function sectionScore(items) {
  const toneScores = {
    up: 78,
    stable: 64,
    mixed: 52,
    caution: 38,
    down: 30,
  };

  const scores = items
    .filter((item) => item.sourceStatus === "Source-backed")
    .map((item) => toneScores[item.tone])
    .filter((score) => Number.isFinite(score));

  if (!scores.length) {
    return null;
  }

  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

function sectionLabel(score) {
  if (score === null) return "Unavailable";
  if (score >= 70) return "Firm";
  if (score >= 58) return "Steady";
  if (score >= 46) return "Mixed";
  return "Under pressure";
}

function buildSummary(sections) {
  const marketScore = sectionScore(sections.marketPulse);
  const economicScore = sectionScore(sections.economicHealth);
  const riskScore = sectionScore(sections.riskIndicators);
  const regionalScore = sectionScore(sections.regions);
  const scores = [marketScore, economicScore, riskScore, regionalScore].filter(Number.isFinite);
  const score = scores.length
    ? Math.round(scores.reduce((total, item) => total + item, 0) / scores.length)
    : null;

  let title = "Live data unavailable";
  if (score !== null) {
    title = "Mixed but steady";
    if (score >= 70) title = "Broadly firm";
    if (score < 56) title = "Uneven conditions";
    if (score < 45) title = "Pressure building";
  }

  return {
    score: score ?? 0,
    title,
    copy:
      "Public market, economic, risk, and regional data shape this quick read on global conditions. Mercury does not provide investment advice.",
    drivers: [
      { label: "Market pulse", value: sectionLabel(marketScore) },
      { label: "Economic health", value: sectionLabel(economicScore) },
      { label: "Risk tone", value: sectionLabel(riskScore) },
      { label: "Regional growth", value: sectionLabel(regionalScore) },
    ],
  };
}

function groupBySection(items, regions) {
  return {
    marketPulse: items.filter((item) => item.section === "marketPulse"),
    economicHealth: items.filter((item) => item.section === "economicHealth"),
    riskIndicators: items.filter((item) => item.section === "riskIndicators"),
    regions,
  };
}

async function buildSnapshot() {
  const checkedAt = new Date();
  const yahooResults = await Promise.allSettled(YAHOO_SERIES.map(fetchYahooSeries));
  const yahooItems = yahooResults
    .map((result, index) =>
      result.status === "fulfilled" ? result.value : unavailableFredItem(YAHOO_SERIES[index]),
    )
    .map((item) => withFreshness(item, checkedAt));
  const fredResults = await Promise.allSettled(FRED_SERIES.map(fetchFredSeries));
  const fredItems = fredResults
    .map((result, index) =>
      result.status === "fulfilled" ? result.value : unavailableFredItem(FRED_SERIES[index]),
    )
    .map((item) => withFreshness(item, checkedAt));
  const regionResults = await Promise.allSettled(WORLD_BANK_REGIONS.map(fetchWorldBankRegion));
  const regions = regionResults
    .map((result, index) =>
      result.status === "fulfilled" ? result.value : unavailableRegion(WORLD_BANK_REGIONS[index]),
    )
    .map((item) => withFreshness(item, checkedAt));
  const sourceItems = [...yahooItems, ...fredItems];
  const sections = groupBySection(sourceItems, regions);
  const freshness = buildFreshnessSummary([...sourceItems, ...regions]);
  const releaseEntries = [...sourceItems, ...regions]
    .filter((item) => item.releaseDate)
    .map((item) => ({
      date: item.releaseDate,
      cadence: item.cadence,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const earliestRelease = releaseEntries[0] || {};
  const latestRelease = releaseEntries.at(-1) || {};
  const unavailableCount = [...sourceItems, ...regions].filter(
    (item) => item.sourceStatus !== "Source-backed",
  ).length;
  const totalSourceCount = sourceItems.length + regions.length;
  const availableCount = totalSourceCount - unavailableCount;

  return {
    status: unavailableCount === 0 ? "ready" : availableCount === 0 ? "unavailable" : "partial",
    checkedAt: checkedAt.toISOString(),
    source: "Yahoo Finance, FRED, and World Bank public data",
    coverage: "Market Pulse, Economic Health, Risk and Confidence, Global Snapshot",
    freshness,
    releaseRange: {
      earliest: earliestRelease.date || null,
      earliestCadence: earliestRelease.cadence || null,
      latest: latestRelease.date || null,
      latestCadence: latestRelease.cadence || null,
    },
    summary: buildSummary(sections),
    ...sections,
  };
}

async function handler(req, res) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const snapshot = await buildSnapshot();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=21600");
    res.statusCode = 200;
    res.end(JSON.stringify(snapshot));
  } catch (error) {
    console.error(error);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.statusCode = 502;
    res.end(
      JSON.stringify({
        status: "unavailable",
        error: "Live public data is unavailable. Mercury is showing unavailable source states instead of sample figures.",
      }),
    );
  }
}

module.exports = handler;
module.exports._internals = {
  YAHOO_HISTORY_OBSERVATIONS,
  YAHOO_HISTORY_RANGE,
  YAHOO_SERIES,
  buildFreshnessSummary,
  buildSummary,
  buildValues,
  classifyReleaseFreshness,
  classifyRegionalGrowth,
  classifyTrend,
  fetchWorldBankRegion,
  parseFredCsv,
};
