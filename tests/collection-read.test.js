const assert = require("node:assert/strict");
const test = require("node:test");
const { readCompleteCollection } = require("../collection-read");

test("collection reads pass the 1,000-row boundary and honour a lower server cap", async () => {
  const records = Array.from({ length: 1201 }, (_, id) => ({ id: String(id) }));
  for (const cap of [500, 137]) {
    const offsets = [];
    const result = await readCompleteCollection(async (from, to) => {
      offsets.push(from);
      assert.equal(to, from + 499);
      return { data: records.slice(from, Math.min(to + 1, from + cap)), count: records.length };
    });
    assert.deepEqual(result.data, records);
    assert.ok(offsets.at(-1) >= 1000);
  }
});

test("empty collections are complete; unknown, changing and excessive counts fail closed", async () => {
  assert.deepEqual((await readCompleteCollection(async () => ({ data: [], count: 0 }))).data, []);
  for (const count of [null, undefined, -1, 1.5, 100001]) {
    await assert.rejects(readCompleteCollection(async () => ({ data: [], count })), /completely/);
  }
  await assert.rejects(readCompleteCollection(async from => ({ data: [{ id: String(from) }], count: from ? 3 : 2 })), /completely/);
});

test("incomplete, duplicated, malformed and failed later pages never return a partial collection", async () => {
  for (const second of [{ data: [], count: 2 }, { data: [{ id: 'first' }], count: 2 }, { data: null, count: 2 }, { error: new Error('Offline') }]) {
    await assert.rejects(readCompleteCollection(async from => from ? second : { data: [{ id: 'first' }], count: 2 }));
  }
});

test("aborting a read prevents the next page and rejects a late first page", async () => {
  const controller = new AbortController();
  let calls = 0;
  await assert.rejects(readCompleteCollection(async () => {
    calls++;
    controller.abort();
    return { data: [{ id: 'first' }], count: 2 };
  }, { signal: controller.signal }), /timed out/);
  assert.equal(calls, 1);
});
