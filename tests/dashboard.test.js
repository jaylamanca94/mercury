const test = require('node:test');
const assert = require('node:assert/strict');
const { summarizePlanningPosition: plan, summarizeHoldingAllocation: allocation, summarizeDashboardHistory: history } = require('../dashboard');
const source = (frequency, amountCents = 10001) => ({ id: frequency, name: frequency, incomeType: 'employment', frequency, amountCents });
const category = { id: 'bills', name: 'Bills', monthlyAmountCents: 50001 };

test('planning uses all source cadences and reconciles converted components before subtraction', () => {
  const input = { sources: ['weekly', 'biweekly', 'twiceMonthly', 'monthly'].map(f => source(f)), categories: [category], passiveAnnualCents: 10001,
    holdings: [{ contributionCents: 10001, contributionFrequency: 'weekly' }, { contributionCents: 12345, contributionFrequency: 'monthly' }] };
  const annual = plan({ ...input, period: 'year' });
  assert.equal(annual.recurringCents, 10001 * 114);
  assert.equal(annual.spendingCents, 50001 * 12);
  assert.equal(annual.investingCents, 10001 * 52 + 12345 * 12);
  const monthly = plan(input);
  assert.equal(monthly.recurringCents, Math.round(10001 * 114 / 12));
  assert.equal(monthly.passiveCents, 833);
  assert.equal(monthly.expectedCents, monthly.recurringCents + monthly.passiveCents);
  assert.equal(monthly.balanceCents, monthly.expectedCents - monthly.spendingCents - monthly.investingCents);
  assert.ok(monthly.balanceCents < 0);
});

test('loaded empty plans contribute zero; unavailable inputs retain independent known values', () => {
  assert.equal(plan({ passiveAnnualCents: 0 }).balanceCents, 0);
  for (const unavailable of ['sourcesAvailable', 'categoriesAvailable', 'holdingsAvailable', 'passiveAvailable']) {
    const result = plan({ sources: [source('monthly')], categories: [category], passiveAnnualCents: 12000, [unavailable]: false });
    assert.equal(result.balanceCents, null, unavailable);
    if (unavailable !== 'categoriesAvailable') assert.equal(result.spendingCents, 50001);
    if (unavailable !== 'holdingsAvailable') assert.equal(result.investingCents, 0);
  }
  assert.equal(plan({ sources: [source('monthly')], passiveAnnualCents: null }).expectedCents, null);
  assert.throws(() => plan({ period: 'week' }));
});

const asset = (id, value) => ({ id, symbol: id, valuationBasis: 'manual-value', manualValueCents: value });
test('allocation ranks deterministically, groups remainder and conserves value and share', () => {
  const result = allocation(['F', 'E', 'D', 'C', 'B', 'A'].map(id => asset(id, 100)));
  assert.deepEqual(result.rows.map(row => row.name), ['A', 'B', 'C', 'D', 'Other investments']);
  assert.equal(result.totalValueCents, 600);
  assert.equal(result.rows.at(-1).valueCents, 200);
  assert.equal(result.rows.reduce((sum, row) => sum + row.valueCents, 0), result.totalValueCents);
  assert.ok(Math.abs(result.rows.reduce((sum, row) => sum + row.allocationRate, 0) - 1) < 1e-12);
  assert.equal(result.unvaluedCount, 0);
});
test('allocation never treats missing prices as zero or creates percentages for zero totals', () => {
  const result = allocation([asset('A', 0), { id: 'missing', valuationBasis: 'shares-and-price', shares: 10, unitPriceCents: null }, { id: 'B', symbol: 'B', valuationBasis: 'shares-and-price', shares: 1.5, unitPriceCents: 101 }]);
  assert.equal(result.totalValueCents, 152);
  assert.equal(result.unvaluedCount, 1);
  assert.equal(result.valuedCount, 2);
  assert.deepEqual(allocation([asset('A', 0)]).rows, []);
  assert.deepEqual(allocation([]).rows, []);
});

const snapshots = count => Array.from({ length: count }, (_, i) => ({ snapshot_date: new Date(Date.UTC(2026, 0, i + 1)).toISOString().slice(0, 10), total_value_cents: 100000 + i * 100 }));
test('history promotes exactly at 30 distinct dates and preserves sparse-range amounts', () => {
  for (const count of [0, 1, 4, 29, 30]) {
    const result = history(snapshots(count));
    assert.equal(result.recordedDays, count);
    assert.equal(result.showTrend, count >= 30);
    assert.equal(result.changeCents, count < 2 ? null : (count - 1) * 100);
  }
  const duplicate = [...snapshots(29), { ...snapshots(29)[0], total_value_cents: 99999 }];
  assert.equal(history(duplicate).showTrend, false);
  assert.equal(history(duplicate).recordedDays, 29);
});
test('history uses actual elapsed dates and gates the selected range independently', () => {
  const result = history([{snapshot_date:'2026-01-01',total_value_cents:100}, {snapshot_date:'2026-01-02',total_value_cents:200}, {snapshot_date:'2026-01-11',total_value_cents:200}]);
  assert.deepEqual(result.positions, [0,10,100]);
  const data = [...snapshots(30), {snapshot_date:'2026-09-01',total_value_cents:12345}];
  assert.equal(history(data,'all').showTrend, true);
  assert.equal(history(data,'3m').showTrend, false);
  assert.equal(history(data,'3m').recordedDays, 1);
});
