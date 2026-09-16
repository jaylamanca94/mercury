const test = require('node:test');
const assert = require('node:assert/strict');
const { summarizePlanningPosition: plan, summarizeHoldingAllocation: allocation, summarizeDashboardHistory: history } = require('../dashboard');
const source = (frequency, amountCents = 10001) => ({ id: frequency, name: frequency, incomeType: 'employment', frequency, amountCents });
const category = { id: 'bills', name: 'Bills', monthlyAmountCents: 50001 };

const { summarizeInvestmentGroups: investmentGroups } = require('../dashboard');
const groupRow = (instrumentType, isRetirement, marketValueCents) => ({ asset: { instrumentType, isRetirement }, marketValueCents });
test('investment groups reconcile cents and counts with retirement crypto counted once', () => {
  const groups = investmentGroups([
    groupRow('etf', false, 12345), groupRow('other', false, 102),
    groupRow('stock', true, 23456), groupRow('crypto', true, 789),
    groupRow('crypto', false, 4567), groupRow('cash', false, 0),
  ]);
  assert.deepEqual(groups.map(g => [g.id, g.count, g.valueCents]), [
    ['all', 6, 41259], ['brokerage', 3, 12447], ['retirement', 2, 24245], ['crypto', 1, 4567],
  ]);
  assert.equal(groups.slice(1).reduce((n,g) => n + g.valueCents, 0), groups[0].valueCents);
  assert.ok(Math.abs(groups.slice(1).reduce((n,g) => n + g.allocationRate, 0) - 1) < 1e-12);
});
test('missing group valuations withhold affected totals and every share, retaining complete group amounts', () => {
  const groups = investmentGroups([groupRow('stock', false, 10000), groupRow('crypto', true, null), groupRow('stock', true, 30000)]);
  assert.deepEqual(groups.map(g => g.valueCents), [null, 10000, null, 0]);
  assert.deepEqual(groups.map(g => g.missingCount), [1, 0, 1, 0]);
  assert.ok(groups.every(g => g.allocationRate === null));
  for (const rows of [[], [groupRow('cash', false, 0)]]) {
    const empty = investmentGroups(rows);
    assert.ok(empty.every(g => g.valueCents === 0 && g.allocationRate === null));
  }
});

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
test('history displays every available record and preserves sparse-range amounts', () => {
  for (const count of [0, 1, 4, 29, 30]) {
    const result = history(snapshots(count));
    assert.equal(result.recordedDays, count);
    assert.equal(result.showTrend, count >= 1);
    assert.equal(result.changeCents, count < 2 ? null : (count - 1) * 100);
  }
  const duplicate = [...snapshots(29), { ...snapshots(29)[0], total_value_cents: 99999 }];
  assert.equal(history(duplicate).showTrend, true);
  assert.equal(history(duplicate).recordedDays, 29);
});
test('history uses actual elapsed dates and displays a single record in a shorter range', () => {
  const result = history([{snapshot_date:'2026-01-01',total_value_cents:100}, {snapshot_date:'2026-01-02',total_value_cents:200}, {snapshot_date:'2026-01-11',total_value_cents:200}]);
  assert.deepEqual(result.positions, [0,10,100]);
  const data = [...snapshots(30), {snapshot_date:'2026-09-01',total_value_cents:12345}];
  assert.equal(history(data,'all').showTrend, true);
  assert.equal(history(data,'3m').showTrend, true);
  assert.equal(history(data,'3m').recordedDays, 1);
});


const { summarizeAllTimeChange: allTimeChange } = require('../dashboard');
test('all-time change compares current investments with the first distinct recorded date', () => {
  const snapshots = [
    {snapshot_date:'2026-09-02',total_value_cents:15000},
    {snapshot_date:'2026-01-01',total_value_cents:9000,recorded_at:'2026-01-01T21:00:00Z'},
    {snapshot_date:'2026-01-01',total_value_cents:10000,recorded_at:'2026-01-01T22:00:00Z'},
  ];
  for (const [current, change, rate] of [[11000,1000,0.1],[9000,-1000,-0.1],[10000,0,0],[0,-10000,-1]]) {
    assert.deepEqual(allTimeChange(snapshots,current),{startDate:'2026-01-01',changeCents:change,changeRate:rate});
  }
  assert.equal(allTimeChange([snapshots[2]],11000).changeCents,1000);
  assert.equal(allTimeChange([],11000).changeCents,null);
  for(const current of [null,undefined,NaN,-1]) assert.equal(allTimeChange(snapshots,current).changeCents,null);
  assert.deepEqual(allTimeChange([{snapshot_date:'2026-01-01',total_value_cents:0}],11000),
    {startDate:'2026-01-01',changeCents:11000,changeRate:null});
});

test('Home short ranges use recorded daily observations and calendar-month bounds', () => {
  const records = ['2026-02-27','2026-02-28','2026-03-23','2026-03-24','2026-03-30','2026-03-31'].map((date,index)=>({snapshot_date:date,total_value_cents:10000+index*100}));
  assert.deepEqual(history(records,'1d').snapshots.map(p=>p.snapshotDate), ['2026-03-30','2026-03-31']);
  assert.equal(history(records,'1w').startDate, '2026-03-24');
  assert.equal(history(records,'1m').startDate, '2026-02-28');
  assert.equal(history(records,'1d').changeCents, 100);
  assert.equal(history(records.slice(0,1),'1d').changeCents, null);
});

const homeGroups = require('../dashboard').summarizeHomeGroups;
const homeRow = (id, type, retirement, value, growth, income) => ({ asset: {id, instrumentType:type, isRetirement:retirement}, marketValueCents:value, estimatedAnnualGrowthCents:growth, estimatedAnnualIncomeCents:income });
const homeProperty = (value, debt, rate) => ({currentValueCents:value, mortgageBalanceCents:debt, annualAppreciationRate:rate});
test('Home groups conserve value, classify retirement crypto once and weight existing rounded estimates', () => {
  const groups = homeGroups([
    homeRow('a','stock',false,10000,1000,200), homeRow('b','etf',false,30000,-600,300),
    homeRow('c','crypto',false,5000,1000,0), homeRow('d','crypto',true,20000,2000,0),
  ], [homeProperty(50000,20000,.04),homeProperty(10000,15000,0)]);
  assert.deepEqual(groups.map(g=>[g.id,g.count,g.valueCents]), [['brokerage',2,40000],['crypto',1,5000],['retirement',1,20000],['property',2,25000]]);
  assert.equal(groups[0].growthRate,.01);
  assert.equal(groups[0].yieldRate,.0125);
  assert.equal(groups[2].growthRate,.1);
  assert.equal(groups[3].growthRate,2000/60000);
  assert.equal(groups[1].hasYield,false);
  assert.equal(groups[3].hasYield,false);
});
test('Home withholds incomplete group amounts and metrics without hiding known groups or asset counts', () => {
  const rows = [homeRow('a','stock',false,10000,1000,200),homeRow('b','stock',false,null,null,null),homeRow('c','crypto',false,5000,1000,0)];
  const groups = homeGroups(rows, [homeProperty(10000,0,.03)],{propertiesAvailable:false});
  assert.equal(groups[0].count,2);
  assert.equal(groups[0].valueCents,null);
  assert.equal(groups[0].growthRate,null);
  assert.equal(groups[0].yieldRate,null);
  assert.equal(groups[1].valueCents,5000);
  assert.equal(groups[1].growthRate,.2);
  assert.equal(groups[3].count,null);
  assert.equal(groups[3].valueCents,null);
  assert.equal(groups[3].growthRate,null);
});
test('Home pending estimates affect only their group and never fall back to Plan assumptions', () => {
  const a=homeRow('a','stock',false,10000,null,200);
  a.asset.expectedAnnualReturnRate=.99;
  const b=homeRow('b','crypto',false,10000,0,0);
  const groups=homeGroups([a,b],[],{pendingIds:new Set(['a'])});
  assert.equal(groups[0].pending,true);
  assert.equal(groups[0].growthRate,null);
  assert.equal(groups[0].yieldRate,null);
  assert.equal(groups[1].pending,false);
  assert.equal(groups[1].growthRate,0);
  assert.equal(homeGroups([a],[])[0].growthRate,null);
});
test('Home preserves empty, zero, negative equity and unknown appreciation distinctions', () => {
  const empty=homeGroups([],[]);
  assert.ok(empty.every(g=>g.count===0 && g.valueCents===0 && g.growthRate===null));
  assert.equal(homeGroups([], [homeProperty(10000,20000,0)])[3].valueCents,-10000);
  assert.equal(homeGroups([], [homeProperty(10000,20000,0)])[3].growthRate,0);
  assert.equal(homeGroups([], [homeProperty(10000,0,.04),homeProperty(10000,0,null)])[3].growthRate,null);
});

const { summarizeNetWorthAllocation: netWorthAllocation } = require('../dashboard');
const { totalNetWorthCents } = require('../plan');
test('card allocation includes property equity and uses the complete denominator for any visible holding', () => {
  const property = { id: 'home', name: 'Home', currentValueCents: 30000000, mortgageBalanceCents: 10000000 };
  const netWorth = totalNetWorthCents(20000000, [property]);
  assert.equal(netWorthAllocation(10000000, netWorth).rate, .25);
  assert.equal(netWorthAllocation(10000000, netWorth).showRing, true);
  // A filtered card receives the same complete net worth, never the visible group sum.
  assert.deepEqual([10000000].map(value => netWorthAllocation(value, netWorth)),
    [10000000, 10000000].map(value => netWorthAllocation(value, netWorth)).slice(0, 1));
  assert.equal(netWorthAllocation(0, netWorth).rate, 0);
  assert.equal(netWorthAllocation(netWorth, netWorth).rate, 1);
});
test('card allocation withholds unavailable and non-positive denominators without clamping negative equity', () => {
  for (const total of [null, undefined, NaN, 0, -100]) {
    assert.equal(netWorthAllocation(100, total).rate, null);
    assert.equal(netWorthAllocation(100, total).showRing, false);
  }
  for (const value of [null, undefined, NaN, -1]) assert.equal(netWorthAllocation(value, 100).rate, null);
  const netWorth = totalNetWorthCents(10000, [{ id: 'home', name: 'Home', currentValueCents: 5000, mortgageBalanceCents: 10000 }]);
  const result = netWorthAllocation(10000, netWorth);
  assert.equal(result.rate, 2);
  assert.equal(result.showRing, false);
  assert.match(result.reason, /property equity is negative/);
});

const { holdingAssetTypeLabel: assetTypeLabel } = require('../dashboard');
test('asset-card types identify verified fund exposure despite legacy Other metadata and saved names', () => {
  const expected = {VFIAX:'S&P 500',VOO:'S&P 500',VSMAX:'Small-Cap',VB:'Small-Cap',VTIAX:'International',VXUS:'International',VBTLX:'Bonds',VGT:'Technology'};
  for (const [symbol,label] of Object.entries(expected)) {
    const asset = {symbol: ` ${symbol.toLowerCase()} `,instrumentType:'other',allocationCategory:'other',name:'Other',isRetirement:true};
    const before = {...asset};
    assert.equal(assetTypeLabel(asset),label);
    assert.deepEqual(asset,before,'display classification must not mutate saved metadata');
  }
});
test('asset-card types use available classifications without guessing unknown symbols or fund names', () => {
  assert.equal(assetTypeLabel({symbol:'BTC',instrumentType:'crypto'}),'Crypto');
  assert.equal(assetTypeLabel({symbol:'VFIAX',instrumentType:'cash'}),'Cash');
  assert.equal(assetTypeLabel({symbol:'UNKNOWN',allocationCategory:'bonds',instrumentType:'etf'}),'Bonds');
  assert.equal(assetTypeLabel({allocationCategory:'international-equity'}),'International');
  assert.equal(assetTypeLabel({allocationCategory:'domestic-equity'}),'U.S. Stocks');
  assert.equal(assetTypeLabel({symbol:'UNKNOWN',instrumentType:'etf'}),'ETF');
  assert.equal(assetTypeLabel({symbol:'UNKNOWN',instrumentType:'stock'}),'Stocks');
  assert.equal(assetTypeLabel({symbol:'UNKNOWN',instrumentType:'mutual-fund'}),'Mutual Fund');
  assert.equal(assetTypeLabel({symbol:'VFIAX.EXTRA',name:'S&P 500',instrumentType:'other'}),'Unclassified');
  assert.equal(assetTypeLabel({symbol:'constructor',allocationCategory:'constructor',instrumentType:'constructor'}),'Unclassified');
  assert.equal(assetTypeLabel(), 'Unclassified');
});
