const test = require('node:test');
const assert = require('node:assert/strict');
const {normalizeProperty, propertyAppreciation, includePropertyInProjection, projectLifePlan} = require('../plan');
const markets = require('../data/property-markets');
const house = {name:'Synthetic home',currentValueCents:45000000,mortgageBalanceCents:20000000,annualAppreciationRate:0.03};
const cash = {currentValueCents:10000000,expectedAnnualReturnRate:0,distributionYieldRate:0,horizonYears:20,startDate:'2026-09-14'};
test('published county snapshot retains unique geography, provenance and one exact ten-year window',()=>{
 assert.equal(new Set(markets.counties.map(c=>c.fips)).size,markets.counties.length);
 assert.ok(markets.counties.length>2500);assert.match(markets.workbookSha256,/^[a-f0-9]{64}$/);
 assert.equal(markets.endYear-markets.startYear,10);
 const county=markets.counties.find(c=>c.fips==='51161');
 const city=markets.counties.find(c=>c.fips==='51770');
 assert.notEqual(county.name,city.name);
 const result=propertyAppreciation({stateCode:'VA',countyFips:county.fips});
 assert.equal(result.rate,Math.pow(county.endIndex/county.startIndex,0.1)-1);
 assert.match(result.source,/2015–2025/);
 assert.equal(propertyAppreciation({stateCode:'NY',countyFips:county.fips}).rate,null);
});
test('missing endpoints never borrow another period or geography; negative and zero history work',()=>{
 const data={startYear:2015,endYear:2025,released:'2026-03-31',counties:[{fips:'00001',state:'AA',name:'Synthetic',startIndex:100,endIndex:80}]};
 assert.ok(propertyAppreciation({countyFips:'00001',stateCode:'AA'},data).rate<0);
 data.counties[0].endIndex=100;assert.equal(propertyAppreciation({countyFips:'00001',stateCode:'AA'},data).rate,0);
 data.counties[0].endIndex=null;assert.equal(propertyAppreciation({countyFips:'00001',stateCode:'AA'},data).rate,null);
});
test('custom rates including zero take precedence; clearing restores county history',()=>{
 const property={stateCode:'VA',countyFips:'51161',annualAppreciationRate:0};
 assert.equal(propertyAppreciation(property).rate,0);assert.equal(propertyAppreciation(property).automatic,false);
 property.annualAppreciationRate=-0.02;assert.equal(propertyAppreciation(property).rate,-0.02);
 property.annualAppreciationRate=null;assert.equal(propertyAppreciation(property).automatic,true);
 assert.throws(()=>normalizeProperty({...house,stateCode:'VA',countyFips:'invalid'}),/county/);
 assert.throws(()=>normalizeProperty({...house,annualAppreciationRate:1.1}),/decimal/);
});
test('property grows gross market value for 10 and 20 years then subtracts unchanged debt',()=>{
 const result=includePropertyInProjection(projectLifePlan(cash),[house]);
 for(const year of [0,10,20]) {
  const p=result.points[year*12],value=Math.round(45000000*1.03**year);
  assert.equal(p.propertyEquityCents,value-20000000);
  assert.equal(p.totalValueCents,10000000+value-20000000);
  assert.equal(p.expectedGrowthCents,Math.round(value*.03));
 }
});
test('property wealth never funds withdrawals or creates dividends',()=>{
 const investment=projectLifePlan({...cash,annualExpensesCents:20000000});
 const combined=includePropertyInProjection(investment,[house]);
 assert.equal(combined.depletionMonth,investment.depletionMonth);
 assert.equal(combined.unfundedCents,investment.unfundedCents);
 for(let i=0;i<investment.points.length;i++) {
  assert.equal(combined.points[i].investmentValueCents,investment.points[i].investmentValueCents);
  assert.equal(combined.points[i].projectedIncomeCents,investment.points[i].projectedIncomeCents);
 }
 assert.ok(combined.points.at(-1).totalValueCents>0);
});
test('missing appreciation is counted and holds gross value constant; negative equity remains debt',()=>{
 const result=includePropertyInProjection(projectLifePlan(cash),[{...house,annualAppreciationRate:null,mortgageBalanceCents:50000000}]);
 assert.equal(result.missingPropertyRates,1);
 assert.equal(result.points[0].propertyEquityCents,-5000000);
 assert.equal(result.points.at(-1).propertyEquityCents,-5000000);
 const falling=includePropertyInProjection(projectLifePlan(cash),[{...house,annualAppreciationRate:-1}]);
 assert.equal(falling.points[0].propertyEquityCents,25000000);
 assert.equal(falling.points[1].propertyEquityCents,-20000000);
});
test('multiple properties combine once, purchase price does not affect future valuation, overflow is withheld',()=>{
 const result=includePropertyInProjection(projectLifePlan(cash),[house,{...house,purchasePriceCents:1}]);
 assert.equal(result.points[0].totalValueCents,60000000);
 assert.equal(result.points.at(-1).propertyEquityCents,2*(Math.round(45000000*1.03**20)-20000000));
 assert.throws(()=>includePropertyInProjection(projectLifePlan(cash),[{...house,currentValueCents:1e15,annualAppreciationRate:1}]),/supported range/);
});
