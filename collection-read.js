(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MercuryCollectionRead = factory();
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  // Both the browser and snapshot job must finish a collection before using it
  // in money calculations. A short page can be a server cap, not the last page.
  async function readCompleteCollection(readPage, { signal } = {}) {
    const rows = [];
    const ids = new Set();
    let expectedCount;
    do {
      if (signal?.aborted) throw new Error("Collection read timed out.");
      const result = await readPage(rows.length, rows.length + 499);
      if (signal?.aborted) throw new Error("Collection read timed out.");
      if (result.error) throw result.error;
      const { data, count } = result;
      if (!Array.isArray(data) || !Number.isSafeInteger(count) || count < 0 || count > 100000
        || (expectedCount !== undefined && expectedCount !== count)
        || rows.length + data.length > count || data.length > 500
        || (!data.length && rows.length < count)) {
        throw new Error("Collection could not be read completely. Try again.");
      }
      expectedCount = count;
      for (const row of data) {
        if (!row?.id || ids.has(row.id)) throw new Error("Collection changed while loading. Try again.");
        ids.add(row.id);
        rows.push(row);
      }
    } while (rows.length < expectedCount);
    return { data: rows, error: null };
  }

  return { readCompleteCollection };
});
