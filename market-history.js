(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MercuryMarketHistory = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const PERIODS = { "1w": 0, "1m": 1, "3m": 3, "6m": 6, "1y": 12, "5y": 60 };

  function summarizeMarketHistory(history, period = "1m", now = Date.now()) {
    const cutoff = new Date(now);
    if (period === "1w") cutoff.setUTCDate(cutoff.getUTCDate() - 7);
    else {
      const day = cutoff.getUTCDate();
      cutoff.setUTCDate(1);
      cutoff.setUTCMonth(cutoff.getUTCMonth() - (PERIODS[period] || 1));
      const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate();
      cutoff.setUTCDate(Math.min(day, lastDay));
    }
    cutoff.setUTCHours(0, 0, 0, 0);
    const unique = new Map();
    if (history?.currency === "USD") {
      (Array.isArray(history.points) ? history.points : []).forEach(point => {
        const { time, price } = point || {};
        if (Number.isFinite(time) && time >= cutoff.getTime() && time <= now && Number.isFinite(price) && price > 0) {
          unique.set(time, { time, price });
        }
      });
    }
    const points = [...unique.values()].sort((a, b) => a.time - b.time);
    const first = points[0], last = points.at(-1);
    const change = points.length > 1 ? last.price - first.price : null;
    return { points, first, last, change, changeRate: change === null ? null : change / first.price };
  }

  // Price-only performance of today's holdings, on shared observed UTC dates.
  // Current quantities are held constant: deposits, withdrawals and past trades
  // are not reconstructed from account-value snapshots.
  function summarizePortfolioMarketHistory(rows, historyById, period = "1w", now = Date.now()) {
    const unavailable = reason => ({ changeCents: null, changeRate: null, startDate: null, endDate: null, sources: [], reason });
    const investments = [];
    let cash = 0;
    for (const { asset, marketValueCents } of rows) {
      if (asset.instrumentType === "cash") {
        if (!Number.isSafeInteger(marketValueCents) || marketValueCents < 0) return unavailable("A cash valuation is unavailable.");
        cash += marketValueCents / 100;
        continue;
      }
      if (asset.valuationBasis === "manual-value" || !Number.isFinite(asset.shares) || asset.shares < 0) {
        return unavailable("Share counts are needed for every investment.");
      }
      if (asset.shares === 0) continue;
      const history = historyById.get(asset.id);
      const { points } = summarizeMarketHistory(history, period, now);
      if (points.length < 2) return unavailable("At least two market prices are needed for every investment in this range.");
      const dates = new Map(points.map(point => [new Date(point.time).toISOString().slice(0, 10), point.price]));
      investments.push({ shares: asset.shares, dates, source: history.source || "Market history" });
    }
    if (!investments.length) return cash > 0
      ? { changeCents: 0, changeRate: 0, startDate: null, endDate: null, sources: [], reason: "USD cash has no price movement; interest is excluded." }
      : unavailable("No investments with a positive balance.");
    const commonDates = [...investments[0].dates.keys()].filter(date => investments.every(item => item.dates.has(date))).sort();
    if (commonDates.length < 2) return unavailable("Two shared market dates are not available for every investment in this range.");
    const startDate = commonDates[0], endDate = commonDates.at(-1);
    const baseline = cash + investments.reduce((sum, item) => sum + item.shares * item.dates.get(startDate), 0);
    const change = investments.reduce((sum, item) => sum + item.shares * (item.dates.get(endDate) - item.dates.get(startDate)), 0);
    const changeCents = Math.round(change * 100);
    if (!Number.isSafeInteger(changeCents) || !Number.isSafeInteger(Math.round(baseline * 100)) || baseline <= 0) return unavailable("Market values are outside the supported range.");
    return { changeCents, changeRate: change / baseline, startDate, endDate,
      sources: [...new Set(investments.map(item => item.source))], reason: "" };
  }

  return { PERIODS, summarizeMarketHistory, summarizePortfolioMarketHistory };
});
