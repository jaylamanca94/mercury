const test = require('node:test');
const assert = require('node:assert/strict');
const {projectLifePlan,normalizePlanScenario} = require('../plan');
const base = {currentValueCents:1000000,annualContributionCents:120000,annualExpensesCents:240000,annualIncomeCents:480000,continuingIncomeCents:120000,expectedAnnualReturnRate:0,distributionYieldRate:0,horizonYears:5,dateOfBirth:"1991-09-14",startDate:"2026-09-14",stopInvestingAge:37,retirementAge:38};

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
 const result=projectLifePlan({...base,currentValueCents:10000,dateOfBirth:"1986-09-14",horizonYears:1});
 assert.equal(result.depletionMonth,1);assert.equal(result.points.at(-1).investmentValueCents,0);
 assert.equal(result.unfundedCents,110000);assert.equal(result.points.at(-1).withdrawnCents,10000);
 assert.equal(result.points.at(-1).projectedIncomeCents,0);
});

test('reinvested yield is not added twice and distributed yield funds spending first',()=>{
 const input={...base,currentValueCents:100000000,annualContributionCents:0,annualIncomeCents:0,continuingIncomeCents:0,annualExpensesCents:0,expectedAnnualReturnRate:.1,distributionYieldRate:.1,horizonYears:1,dateOfBirth:null,stopInvestingAge:null,retirementAge:null};
 assert.ok(Math.abs(projectLifePlan(input).points.at(-1).investmentValueCents-110000000)<=12);
 const distributed=projectLifePlan({...input,distributionPolicy:'hold-cash',annualExpensesCents:10000000});
 assert.ok(Math.abs(distributed.points.at(-1).investmentValueCents-100000000)<=12);
 assert.ok(distributed.points.at(-1).withdrawnCents<=12);
});

test('one-year monthly cash-flow rounding preserves whole annual cents',()=>{
 const r=projectLifePlan({...base,annualContributionCents:101,annualExpensesCents:0,annualIncomeCents:101,continuingIncomeCents:0,horizonYears:1});
 assert.equal(r.points.at(-1).investmentValueCents,1000101);
});

test('ages need an explicit date of birth, zero overrides remain distinct from linked nulls',()=>{
 assert.equal(normalizePlanScenario({}).weeklyExpensesCents,null);
 assert.equal(normalizePlanScenario({weeklyExpensesCents:0}).weeklyExpensesCents,0);
 assert.throws(()=>normalizePlanScenario({retirementAge:65}),/date of birth/);
 for(const value of ["2026-02-30","2027-01-01","1899-12-31","not-a-date"])assert.throws(()=>normalizePlanScenario({dateOfBirth:value},"2026-09-14"));
 assert.throws(()=>normalizePlanScenario({weeklyInvestmentCents:Number.MAX_SAFE_INTEGER}),/Weekly investments/);
});

test('missing rates withhold projections and unsupported returns fail explicitly',()=>{
 assert.equal(projectLifePlan({...base,expectedAnnualReturnRate:null}).available,false);
 assert.throws(()=>projectLifePlan({...base,expectedAnnualReturnRate:-.99,distributionYieldRate:.02,distributionPolicy:'hold-cash'}),/cash distribution/);
 assert.throws(()=>projectLifePlan({...base,annualIncomeCents:0}),/Continuing income/);
});

test('calendar age changes on the birthday, with an explicit leap-day convention',()=>{
 const {ageOnDate}=require('../plan');
 assert.equal(ageOnDate('1995-10-01','2026-09-30'),30);
 assert.equal(ageOnDate('1995-10-01','2026-10-01'),31);
 assert.equal(ageOnDate('2000-02-29','2025-02-27'),24);
 assert.equal(ageOnDate('2000-02-29','2025-02-28'),25);
 assert.equal(ageOnDate('2000-02-29','2024-02-28'),23);
 assert.equal(ageOnDate('2000-02-29','2024-02-29'),24);
});

test('contribution stop is prorated at the actual birthday inside a month',()=>{
 const result=projectLifePlan({...base,dateOfBirth:'1991-09-29',stopInvestingAge:35,retirementAge:null,horizonYears:1});
 // Sep 14 to Oct 14 is 30 days: invest for the 15 days before Sep 29.
 assert.equal(result.points[1].contributedCents,5000);
 assert.equal(result.points.at(-1).contributedCents,5000);
 assert.equal(result.points[0].age,34);assert.equal(result.points[1].age,35);
});

test('retirement and contribution milestones in one month use their own dates',()=>{
 const result=projectLifePlan({...base,dateOfBirth:'1991-09-29',stopInvestingAge:35,retirementAge:35,horizonYears:1});
 assert.equal(result.points[1].contributedCents,5000);
 assert.equal(result.points[1].withdrawnCents,5000);
 assert.equal(result.points[1].investmentValueCents,1000000);
});

test('milestones exactly at period boundaries have no off-by-one month',()=>{
 const before=projectLifePlan({...base,dateOfBirth:'1991-10-14',stopInvestingAge:35,retirementAge:null,horizonYears:1});
 assert.equal(before.points[1].contributedCents,10000);
 assert.equal(before.points[2].contributedCents,10000);
 const today=projectLifePlan({...base,stopInvestingAge:35,retirementAge:null,horizonYears:1});
 assert.equal(today.points.at(-1).contributedCents,0);
});

test('end-of-month anchors stay valid across leap years and time zones',()=>{
 const {dateAtPlanMonth}=require('../plan');
 assert.equal(dateAtPlanMonth('2024-01-31',1),'2024-02-29');
 assert.equal(dateAtPlanMonth('2024-01-31',2),'2024-03-31');
 assert.equal(dateAtPlanMonth('2024-02-29',12),'2025-02-28');
 const {execFileSync}=require('node:child_process');
 for(const TZ of ['Pacific/Honolulu','Pacific/Kiritimati']) {
  const result=execFileSync(process.execPath,['-e',"const p=require('./plan'); console.log(p.ageOnDate('1995-09-14','2026-09-14'),p.dateAtPlanMonth('2024-02-29',12))"],{cwd:require('node:path').join(__dirname,'..'),env:{...process.env,TZ},encoding:'utf8'});
  assert.equal(result.trim(),'31 2025-02-28');
 }
});
