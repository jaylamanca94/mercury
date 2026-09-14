const test = require('node:test');
const assert = require('node:assert/strict');
const {projectLifePlan,normalizePlanScenario} = require('../plan');
const base = {currentValueCents:1000000,annualContributionCents:120000,annualExpensesCents:240000,annualIncomeCents:480000,continuingIncomeCents:120000,expectedAnnualReturnRate:0,distributionYieldRate:0,horizonYears:5,currentAge:35,stopInvestingAge:37,retirementAge:38};

test('contributions stop at the chosen age and retirement draws the income shortfall',()=>{
 const result=projectLifePlan(base);
 assert.equal(result.points[24].investmentValueCents,1240000);
 assert.equal(result.points[36].investmentValueCents,1240000);
 assert.equal(result.points[48].investmentValueCents,1120000);
 assert.equal(result.points[60].investmentValueCents,1000000);
 assert.equal(result.points[60].contributedCents,240000);
 assert.equal(result.points[60].withdrawnCents,240000);
 assert.equal(result.points[60].age,40);
});

test('planned investments cannot exceed disposable income and uninvested surplus is excluded',()=>{
 assert.equal(projectLifePlan({...base,horizonYears:1,annualIncomeCents:300000,continuingIncomeCents:0}).points.at(-1).investmentValueCents,1060000);
 assert.equal(projectLifePlan({...base,horizonYears:1,annualIncomeCents:1000000}).points.at(-1).investmentValueCents,1120000);
});

test('depletion is clamped at zero and unfunded spending is reported separately',()=>{
 const result=projectLifePlan({...base,currentValueCents:10000,currentAge:40,horizonYears:1});
 assert.equal(result.depletionMonth,1);assert.equal(result.points.at(-1).investmentValueCents,0);
 assert.equal(result.unfundedCents,110000);assert.equal(result.points.at(-1).withdrawnCents,10000);
 assert.equal(result.points.at(-1).projectedIncomeCents,0);
});

test('reinvested yield is not added twice and distributed yield funds spending first',()=>{
 const input={...base,currentValueCents:100000000,annualContributionCents:0,annualIncomeCents:0,continuingIncomeCents:0,annualExpensesCents:0,expectedAnnualReturnRate:.1,distributionYieldRate:.1,horizonYears:1,currentAge:null,stopInvestingAge:null,retirementAge:null};
 assert.ok(Math.abs(projectLifePlan(input).points.at(-1).investmentValueCents-110000000)<=12);
 const distributed=projectLifePlan({...input,distributionPolicy:'hold-cash',annualExpensesCents:10000000});
 assert.ok(Math.abs(distributed.points.at(-1).investmentValueCents-100000000)<=12);
 assert.ok(distributed.points.at(-1).withdrawnCents<=12);
});

test('one-year monthly cash-flow rounding preserves whole annual cents',()=>{
 const r=projectLifePlan({...base,annualContributionCents:101,annualExpensesCents:0,annualIncomeCents:101,continuingIncomeCents:0,horizonYears:1});
 assert.equal(r.points.at(-1).investmentValueCents,1000101);
});

test('ages need an explicit starting age, zero overrides remain distinct from linked nulls',()=>{
 assert.equal(normalizePlanScenario({}).weeklyExpensesCents,null);
 assert.equal(normalizePlanScenario({weeklyExpensesCents:0}).weeklyExpensesCents,0);
 assert.throws(()=>normalizePlanScenario({retirementAge:65}),/current age/);
 for(const value of [-1,121,35.5,NaN])assert.throws(()=>normalizePlanScenario({currentAge:value,ageReferenceYear:2026}));
 assert.throws(()=>normalizePlanScenario({weeklyInvestmentCents:Number.MAX_SAFE_INTEGER}),/Weekly investments/);
});

test('missing rates withhold projections and unsupported returns fail explicitly',()=>{
 assert.equal(projectLifePlan({...base,expectedAnnualReturnRate:null}).available,false);
 assert.throws(()=>projectLifePlan({...base,expectedAnnualReturnRate:-.99,distributionYieldRate:.02,distributionPolicy:'hold-cash'}),/cash distribution/);
 assert.throws(()=>projectLifePlan({...base,annualIncomeCents:0}),/Continuing income/);
});
