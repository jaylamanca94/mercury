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

  return { PERIODS, summarizeMarketHistory };
});
