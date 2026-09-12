const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

// Exercise the actual browser controller with minimal DOM slots and a deferred
// provider. Browser layout/native-dialog behaviour is verified separately.
function controller() {
  const nodes = new Map();
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, {
      value: '', hidden: false, disabled: false, checked: false, textContent: '',
      validity: {valid: true}, elements: [], dataset: {}, listeners: {},
      classList: {toggle() {}, add() {}, remove() {}},
      addEventListener(type, callback) { this.listeners[type] = callback; },
      querySelectorAll() { return []; }, replaceChildren() {}, setAttribute() {}, hasAttribute() { return false; }, focus() {}, scrollIntoView() {},
      showModal() { this.open = true; }, close() { this.open = false; this.listeners.close?.(); },
    });
    return nodes.get(selector);
  }
  const document = {querySelector:node, querySelectorAll:()=>[], activeElement:null, listeners:{}, addEventListener(type, callback) { this.listeners[type] = callback; }};
  const window = {
    MercuryPortfolio: require('../portfolio'), MercuryIncome: require('../income'),
    MercuryPlan: require('../plan'), MercuryDashboard: require('../dashboard'),
    location:{hash:'#portfolio',origin:'https://example.invalid',pathname:'/index.html',search:''}, listeners:{}, addEventListener(type, callback) { this.listeners[type] = callback; },
  };
  window.history = {pushState(_state, _title, hash) { window.location.hash = hash.startsWith('#') ? hash : ''; }};
  const context = vm.createContext({window,document,Intl,Date,Number,Set,Map,console,
    buildCardTrendPath:require('../acadia-card-trend.mjs').buildCardTrendPath,
    setTimeout,clearTimeout,AbortController,crypto:require('node:crypto').webcrypto,
    FormData: class { constructor(form) { this.values = {...form.fields}; form.elements.filter(field => field.name && !field.disabled).forEach(field => { this.values[field.name] = field.value; }); } get(key) { return this.values[key] ?? null; } },
    fetch:async()=>({ok:false,json:async()=>({error:'provider unavailable'})}),
  });
  const source = fs.readFileSync(require.resolve('../brokerage.js'),'utf8').replace(/^import .*;\n/, '').replace('  initialise();',
    '  window.testController = {state,render,renderHomeChanges,renderHomeGrowth,renderIncomeRecovery,retryIncomeData,missingIncomeYieldRows,renderIncomeYieldRecovery,renderPlan,renderQuickQuotePreview,refreshCurrentAssetPrice,restorePortfolioAssetFocus,renderHistory,renderAsset,canQuote,lookupQuote,saveQuickAsset,navigateToAsset,navigateBackFromAsset,routeAssetId,openFormDialog,hasPendingWrite,hasUnsavedWork,matchingPortfolioHoldingRows,sortHoldingRows,holdingValueLabel,renderPortfolioView,renderPortfolioSummary,detailHolding};');
  vm.runInContext(source,context);
  const api=window.testController;
  api.state.client={auth:{getSession:async()=>({data:{session:{access_token:'isolated-test'}}})}};
  return {api,node,window,document,context};
}

test('signed-out route changes show only authentication and disable private creation',()=>{
  const {api,node,window,document}=controller();api.state.configured=true;
  for(const hash of ['#portfolio','#income','#income/budget','#plan','#asset/test']) {
    window.location.hash=hash;api.render();
    assert.equal(node('#auth-panel').hidden,false);
    for(const page of ['home','portfolio','income','plan','asset'])assert.equal(node(`#${page}-workspace`).hidden,true);
    assert.equal(node('#portfolio-add-asset').disabled,true);
    assert.equal(node('#home-add-asset').disabled,true);
    assert.equal(document.title,'Mercury | Sign in');
  }
});

test('quotes require entered, valid shares and reveal fallback on the first failure',async()=>{
  const {api,node}=controller();node('#asset-symbol').value='TEST';
  assert.equal(api.canQuote(),false);
  node('#asset-shares').value='2';assert.equal(api.canQuote(),true);
  node('#asset-shares').validity.valid=false;assert.equal(api.canQuote(),false);
  node('#asset-shares').validity.valid=true;node('#manual-fallback').hidden=true;
  await api.lookupQuote();
  assert.equal(node('#manual-fallback').hidden,false);
  assert.match(node('#quote-form-status').textContent,/Enter a manual price or total value/);
});

test('stale quote responses cannot replace a newer symbol or expose its fallback',async()=>{
  const {api,node}=controller();let resolveSession;
  api.state.client.auth.getSession=()=>new Promise(resolve=>{resolveSession=resolve});
  node('#asset-symbol').value='OLD';node('#asset-shares').value='2';node('#manual-fallback').hidden=true;
  const lookup=api.lookupQuote();api.state.quoteRequestId++;node('#asset-symbol').value='NEW';
  resolveSession({data:{session:{access_token:'test'}}});await lookup;
  assert.equal(node('#manual-fallback').hidden,true);assert.equal(api.state.pendingQuote,null);
});

test('asset Back preserves Home and Portfolio origins, and malformed ids remain recoverable',()=>{
  const {api,window}=controller();
  for(const hash of ['#portfolio','#']) {
    window.location.hash=hash;api.navigateToAsset('test');api.navigateBackFromAsset();
    assert.equal(window.location.hash,hash);
  }
  window.location.hash='#asset/%broken';assert.equal(api.routeAssetId(),'%broken');
});

test('background asset rendering preserves a draft; explicit reset reloads saved shares',()=>{
  const {api,node,window}=controller();window.location.hash='#asset/test';
  api.state.holdings=[{id:'test',symbol:'TEST',name:'Test',instrument_type:'stock',allocation_category:'other',valuation_basis:'shares-and-price',shares:10,manual_price_cents:10000,manual_value_cents:null,expected_annual_return_rate:null,distribution_yield_rate:null,target_allocation_rate:null,weekly_contribution_rate:null,contribution_cents:null,contribution_frequency:null}];
  api.renderAsset();assert.equal(node('#asset-detail-shares').value,10);
  node('#asset-detail-shares').value='17';api.renderAsset();assert.equal(node('#asset-detail-shares').value,'17');
  api.renderAsset({resetForm:true});assert.equal(node('#asset-detail-shares').value,10);
});

test('sign-in submission prevents duplicate sends and recovers from a thrown failure',async()=>{
  const {api,node}=controller();let finish,calls=0;
  api.state.client.auth.signInWithOtp=()=>{calls++;return new Promise((_,reject)=>{finish=reject})};
  node('#email').value='audit@example.invalid';
  const submit=node('#magic-link-form').listeners.submit;
  const first=submit({preventDefault(){}});await submit({preventDefault(){}});
  assert.equal(calls,1);assert.equal(node('#send-magic-link').disabled,true);
  finish(new Error('Connection unavailable'));await first;
  assert.equal(node('#send-magic-link').disabled,false);
  assert.equal(node('#auth-message').textContent,'Connection unavailable');
});


function quickSaveFixture({quoteFailure = false, readFailure = false, holdingFailure = false} = {}) {
  const view = controller(); const {api, node, window} = view; const writes = [];
  api.state.account = {id: 'account'};
  api.state.pendingQuote = {priceCents:1234,priorCloseCents:1200,source:'Test',asOf:'2026-09-07T00:00:00Z',instrumentType:'stock'};
  node('#asset-form').fields = {symbol:'TEST',shares:'2',valuationBasis:'shares-and-price'};
  api.openFormDialog('#asset-dialog');
  // Keep aggregate rendering on the minimal auth DOM; detail rendering is exercised explicitly.
  api.state.configured = true;
  const db = {holdings:[], holding_quotes:[], accounts:[api.state.account]};
  api.state.client.from = table => {
    const q = {select(){return q},eq(){return q},order(){return q},maybeSingle(){return q},
      then(resolve,reject){return Promise.resolve({data:db[table] || [],error:readFailure ? {message:'Read unavailable'} : null}).then(resolve,reject)},
      async upsert(payload) {
        writes.push({table,payload});
        if (table === 'holdings' && holdingFailure) return {error:{message:'Holding unavailable'}};
        if (table === 'holding_quotes' && quoteFailure) throw new Error('Quote storage unavailable');
        db[table].push(payload); return {error:null};
      }}; return q;
  };
  return {...view,writes,db};
}

test('partial Add completes once, opens the committed holding and exposes price recovery',async()=>{
  const {api,node,window,writes,db}=quickSaveFixture({quoteFailure:true});
  await api.saveQuickAsset({preventDefault(){}});
  assert.equal(writes.filter(w=>w.table==='holdings').length,1);
  assert.equal(db.holdings.length,1);
  assert.equal(node('#asset-dialog').open,false);
  assert.equal(api.state.holdings[0].id,db.holdings[0].id);
  assert.equal(api.state.quotes.length,0);
  // Native browser location normalises an assigned fragment with '#'.
  window.location.hash='#'+window.location.hash;
  api.renderAsset();
  assert.equal(node('#asset-recovery').hidden,false);
  assert.equal(node('#asset-recovery-title').textContent,'Asset saved');
  assert.match(node('#asset-recovery-copy').textContent,/automatic price could not be saved/);
  assert.equal(node('#asset-manual-valuation').hidden,false);
  assert.equal(node('#discard-changes-dialog').open,undefined);
});

test('failed account reload after Add preserves acknowledged holding and quote without offering Add again',async()=>{
  const {api,node,window}=quickSaveFixture({readFailure:true});
  await api.saveQuickAsset({preventDefault(){}});
  assert.equal(api.state.holdings.length,1);assert.equal(api.state.quotes.length,1);
  assert.equal(node('#asset-dialog').open,false);
  window.location.hash='#'+window.location.hash;api.renderAsset();
  assert.equal(node('#asset-price').textContent,'$12.34');
  assert.match(node('#asset-recovery-copy').textContent,/reload the page/);
  assert.equal(node('#asset-retry-price').hidden,true);
});

test('holding failure keeps the Add draft retryable and never stores its quote',async()=>{
  const {api,node,writes}=quickSaveFixture({holdingFailure:true});
  await api.saveQuickAsset({preventDefault(){}});
  await api.saveQuickAsset({preventDefault(){}});
  assert.equal(writes.length,2);assert.equal(writes[0].payload.id,writes[1].payload.id);
  assert.equal(node('#asset-dialog').open,true);assert.equal(api.state.holdings.length,0);
  assert.equal(node('#save-asset').disabled,false);
  assert.equal(node('#quote-form-status').textContent,'Holding unavailable');
});

test('price recovery prevents duplicate requests and never claims a nonexistent prior quote',async()=>{
  const {api,node,window}=quickSaveFixture({quoteFailure:true});
  await api.saveQuickAsset({preventDefault(){}});
  window.location.hash='#'+window.location.hash;api.renderAsset();
  let finish,calls=0;
  api.state.client.auth.getSession=()=>{calls++;return new Promise(resolve=>{finish=resolve})};
  const first=api.refreshCurrentAssetPrice();
  await api.refreshCurrentAssetPrice();
  assert.equal(calls,1);assert.equal(node('#asset-retry-price').disabled,true);
  finish({data:{session:{access_token:'test'}}});await first;
  assert.match(node('#asset-recovery-feedback').textContent,/No automatic price has been saved/);
  assert.doesNotMatch(node('#asset-recovery-feedback').textContent,/Last successful quote/);
  assert.equal(node('#asset-retry-price').disabled,false);
});

test('manual repair clears missing-price recovery while background rendering preserves a draft',async()=>{
  const {api,node,window}=quickSaveFixture({quoteFailure:true});
  await api.saveQuickAsset({preventDefault(){}});
  window.location.hash='#'+window.location.hash;api.renderAsset();
  node('#asset-detail-shares').value='7';api.renderAsset();
  assert.equal(node('#asset-detail-shares').value,'7');
  api.state.holdings[0].manual_price_cents=2500;api.renderAsset({resetForm:true});
  assert.equal(node('#asset-recovery').hidden,true);
});


function editableAsset() {
  const view=controller(); const {api,node,window}=view;
  window.location.hash='#asset/test';
  api.state.holdings=[{id:'test',symbol:'TEST',name:'Test',instrument_type:'stock',allocation_category:'other',valuation_basis:'shares-and-price',shares:10,manual_price_cents:10000,manual_value_cents:null,expected_annual_return_rate:null,distribution_yield_rate:null,target_allocation_rate:null,weekly_contribution_rate:null,contribution_cents:null,contribution_frequency:null}];
  const fields=[['shares','shares'],['manual-price','manualPrice'],['valuation-basis','valuationBasis'],['retirement','isRetirement']].map(([id,name])=>{
    const field=node(`#asset-detail-${id}`);field.name=name;field.type=id==='retirement'?'checkbox':'number';return field;
  });
  node('#asset-detail-form').elements=[...fields,node('#asset-save'),node('#asset-cancel')];
  api.state.configured=true; api.state.user={id:"owner"};
  api.render();
  return view;
}

test('asset edit actions distinguish saved, changed, reverted and cancelled values',()=>{
  const {node}=editableAsset();const changed=node('#asset-detail-form').listeners.input;
  assert.equal(node('#asset-save').disabled,true);
  node('#asset-detail-shares').value='11';changed();
  assert.equal(node('#asset-save').disabled,false);
  assert.equal(node('#asset-detail-status').textContent,'Unsaved changes');
  node('#asset-detail-shares').value='10';changed();
  assert.equal(node('#asset-save').disabled,true);
  assert.equal(node('#asset-detail-status').hidden,true);
  node('#asset-detail-retirement').checked=true;changed();
  assert.equal(node('#asset-save').disabled,false);
  node('#asset-cancel').listeners.click();
  assert.equal(node('#asset-detail-retirement').checked,false);
  assert.equal(node('#asset-save').disabled,true);
});

test('asset save captures enabled fields, locks editing, prevents duplicate writes and retains a failed draft',async()=>{
  const {api,node}=editableAsset();let finish,calls=0,payload;
  api.state.client.from=()=>({update(value){payload=value;calls++;return {eq(){return new Promise(resolve=>{finish=resolve})}}}});
  node('#asset-detail-shares').value='17';node('#asset-detail-form').listeners.input();
  const submit=node('#asset-detail-form').listeners.submit;
  const first=submit({preventDefault(){}});await submit({preventDefault(){}});
  assert.equal(calls,1);assert.equal(payload.shares,17);assert.equal(payload.manual_price_cents,10000);
  assert.equal(node('#asset-detail-shares').disabled,true);
  assert.equal(node('#asset-cancel').disabled,true);
  assert.equal(node('#asset-save').textContent,'Saving…');
  api.renderAsset();assert.equal(node('#asset-detail-shares').disabled,true);
  finish({error:{message:'Save failed; retry'}});await first;
  assert.equal(node('#asset-detail-shares').value,'17');
  assert.equal(node('#asset-detail-shares').disabled,false);
  assert.equal(node('#asset-save').disabled,false);
  assert.equal(node('#asset-detail-status').textContent,'Save failed; retry');
  assert.equal(node('#asset-detail-status').hidden,false);
});


test('changed asset navigation offers keep editing or discard; beforeunload warns only for unsaved work', () => {
  const {api,node,window}=editableAsset();
  let prevented=false;
  window.listeners.beforeunload({preventDefault(){prevented=true}});
  assert.equal(prevented,false);
  node('#asset-detail-shares').value='17';
  window.location.hash='#asset/missing'; api.render();
  assert.equal(window.location.hash,'#asset/test');
  assert.equal(node('#discard-changes-dialog').open,true);
  node('#keep-editing').listeners.click();
  assert.equal(node('#asset-detail-shares').value,'17');
  window.listeners.beforeunload({preventDefault(){prevented=true}});
  assert.equal(prevented,true);
  window.location.hash='#asset/missing'; api.render();
  node('#discard-changes').listeners.click();
  assert.equal(window.location.hash,'#asset/missing');
  assert.equal(api.hasUnsavedWork(),false);
});

test('pending asset writes block navigation without discarding the failed draft', async () => {
  const {api,node,window}=editableAsset();let finish;
  api.state.client.from=()=>({update:()=>({eq:()=>new Promise(resolve=>{finish=resolve})})});
  node('#asset-detail-shares').value='17';
  const save=node('#asset-detail-form').listeners.submit({preventDefault(){}});
  window.location.hash='#plan';api.render();
  assert.equal(window.location.hash,'#asset/test');
  assert.match(node('#asset-detail-status').textContent,/Please wait/);
  finish({error:{message:'Save failed'}});await save;
  assert.equal(api.hasUnsavedWork(),true);
});

test('modal drafts survive Escape and changed values are protected until explicitly discarded', () => {
  const {api,node}=controller();
  const form=node('#income-source-form'), dialog=node('#income-source-dialog');
  const name=node('#income-source-name');name.name='name';name.value='Salary';form.elements=[name];
  api.openFormDialog('#income-source-dialog');name.value='Draft salary';
  let prevented=false;
  dialog.listeners.cancel({preventDefault(){prevented=true},stopImmediatePropagation(){}});
  assert.equal(prevented,true);assert.equal(dialog.open,true);
  node('#keep-editing').listeners.click();assert.equal(name.value,'Draft salary');
  dialog.listeners.cancel({preventDefault(){},stopImmediatePropagation(){}});
  node('#discard-changes').listeners.click();assert.equal(dialog.open,false);
});

test('all modal writes lock dismissal and fields, reject duplicate submits and recover from failure', async () => {
  for (const [prefix, saveId, fields, stateId] of [
    ['income-source','save-income-source',{name:'Salary',incomeType:'employment',amount:'100',frequency:'monthly'},'incomeSourceDialogId'],
    ['budget-category','save-budget-category',{name:'Food',monthlyAmount:'100'},'budgetCategoryDialogId'],
    ['plan-assumptions','save-plan-assumptions',{expectedAnnualReturn:'5',distributionYield:'2',distributionPolicy:'reinvest'},null],
    ['property','save-property',{name:'Home',location:'Test',currentValue:'1000',mortgageBalance:'0'},'propertyDialogId'],
  ]) {
    const {api,node}=controller();let finish,calls=0;
    api.state.account={id:'account'};if(stateId)api.state[stateId]='existing';
    api.state.client.from=()=>{const q={update(){return q},upsert(){return q},insert(){return q},eq(){return q},select(){return q},single(){return q},then(resolve){calls++;return new Promise(r=>{finish=r}).then(resolve)}};return q};
    const form=node(`#${prefix}-form`), dialog=node(`#${prefix}-dialog`);
    form.fields=fields;
    const field={name:Object.keys(fields)[0],value:Object.values(fields)[0],disabled:false};
    form.elements=[field,node(`#${saveId}`)];api.openFormDialog(`#${prefix}-dialog`);
    const submit=form.listeners.submit;const event={preventDefault(){},stopImmediatePropagation(){}};
    const first=submit(event);await Promise.resolve();await submit(event);
    assert.equal(calls,1,prefix);assert.equal(field.disabled,true,prefix);
    let prevented=false;dialog.listeners.cancel({...event,preventDefault(){prevented=true}});
    assert.equal(prevented,true,prefix);assert.equal(api.hasPendingWrite(),true,prefix);
    finish({error:{message:'Test save failed'}});await first;
    assert.equal(field.disabled,false,prefix);assert.equal(dialog.open,true,prefix);
    assert.equal(api.hasPendingWrite(),false,prefix);assert.equal(node(`#${saveId}`).disabled,false,prefix);
  }
});

test('Quick Add retains form values across a deferred quote lookup while fields are locked', async () => {
  const {api,node}=controller();let finish;const writes=[];
  api.state.account={id:'account'};
  api.state.client.auth.getSession=()=>new Promise(resolve=>{finish=resolve});
  api.state.client.from=(table)=>({upsert:async(payload)=>{writes.push({table,payload});return {error:{message:'Stop after payload validation'}}}});
  const form=node('#asset-form');
  const symbol=node('#asset-symbol');symbol.name='symbol';symbol.value='TEST';
  const shares=node('#asset-shares');shares.name='shares';shares.value='3';
  const price=node('#asset-manual-price');price.name='manualPrice';price.value='';
  form.elements=[symbol,shares,price,node('#save-asset')];form.fields={valuationBasis:'shares-and-price'};
  api.openFormDialog('#asset-dialog');
  const first=form.listeners.submit({preventDefault(){}});
  assert.equal(shares.disabled,true);
  // A failed provider request must reveal manual recovery and unlock the original input.
  finish({data:{session:{access_token:'isolated'}}});await first;
  assert.equal(shares.disabled,false);assert.equal(shares.value,'3');
  assert.equal(node('#manual-fallback').hidden,false);assert.equal(writes.length,0);
  price.value='25';await form.listeners.submit({preventDefault(){}});
  assert.equal(writes[0].payload.shares,3);assert.equal(writes[0].payload.manual_price_cents,2500);
});

test('deletion dialogs prevent duplicate writes and Escape until errors restore Cancel', async () => {
  for (const [prefix,stateKey] of [['delete-asset',null],['delete-income-source','incomeSourceDeleteId'],['delete-budget-category','budgetCategoryDeleteId'],['delete-property','propertyDeleteId']]) {
    const {api,node,window}=controller();let finish,calls=0;
    api.state.account={id:'account'};
    api.state.holdings=[{id:'test'}];window.location.hash='#asset/test';
    if(stateKey)api.state[stateKey]='test';
    api.state.client.from=()=>{const q={delete(){return q},eq(){return q},select(){return q},maybeSingle(){return q},then(resolve){calls++;return new Promise(r=>{finish=r}).then(resolve)}};return q};
    const form=node(`#${prefix}-form`),dialog=node(`#${prefix}-dialog`);
    api.openFormDialog(`#${prefix}-dialog`);
    const event={preventDefault(){},stopImmediatePropagation(){}};
    const first=form.listeners.submit(event);await Promise.resolve();await form.listeners.submit(event);
    assert.equal(calls,1,prefix);
    let prevented=false;dialog.listeners.cancel({...event,preventDefault(){prevented=true}});
    assert.equal(prevented,true,prefix);
    finish({error:{message:'Deletion failed'}});await first;
    assert.equal(dialog.open,true,prefix);assert.equal(api.hasPendingWrite(),false,prefix);
  }
});

test('Skip to content focuses the current workspace without changing route or discarding a draft', () => {
  const {node,window,document}=editableAsset();let focused=false,scrolled=false,prevented=false;
  node('#asset-detail-shares').value='17';
  node('#main-content').focus=()=>{focused=true};node('#main-content').scrollIntoView=()=>{scrolled=true};
  const link={getAttribute:()=> '#main-content'};
  document.listeners.click({target:{closest:()=>link},preventDefault(){prevented=true}});
  assert.equal(focused,true);assert.equal(scrolled,true);assert.equal(prevented,true);
  assert.equal(window.location.hash,'#asset/test');assert.equal(node('#asset-detail-shares').value,'17');
  assert.equal(node('#discard-changes-dialog').open,undefined);
});

test('a queued close event cannot hide a newly reopened discard confirmation', () => {
  const {api,node}=editableAsset();const dialog=node('#discard-changes-dialog');
  node('#asset-detail-shares').value='17';
  api.navigateBackFromAsset();
  dialog.close=function(){this.open=false};
  node('#keep-editing').listeners.click();
  api.navigateBackFromAsset();
  dialog.listeners.close();
  assert.equal(dialog.open,true);assert.equal(dialog.hidden,false);
  node('#discard-changes').listeners.click();
  assert.equal(api.hasUnsavedWork(),false);
});


test('Portfolio retains unvalued holdings in search and mutually exclusive investment groups',()=>{
  const {api,node}=controller();
  const base={instrument_type:'stock',valuation_basis:'shares-and-price',shares:10,manual_price_cents:null,manual_value_cents:null};
  api.state.holdings=[{...base,id:'known',symbol:'KNOWN'}, {...base,id:'missing',symbol:'MISSING',instrument_type:'crypto',is_retirement:true}];
  const known={asset:{id:'known',symbol:'KNOWN',instrumentType:'stock'},marketValueCents:20000};
  const summary={rows:[known]};
  let rows=api.matchingPortfolioHoldingRows(summary);
  assert.equal(rows.length,2);
  assert.equal(rows[1].marketValueCents,null);
  assert.equal(api.holdingValueLabel(rows[1]),'Needs valuation');
  assert.equal(api.sortHoldingRows(rows)[0].asset.id,'known');
  assert.equal(api.sortHoldingRows(rows,'name')[1].asset.id,'missing');
  api.state.portfolioFilter='brokerage';
  assert.equal(api.matchingPortfolioHoldingRows(summary)[0].asset.id,'known');
  api.state.portfolioFilter='crypto';
  assert.equal(api.matchingPortfolioHoldingRows(summary).length,0);
  api.state.portfolioFilter='retirement';
  assert.equal(api.matchingPortfolioHoldingRows(summary)[0].asset.id,'missing');
  node('#portfolio-search').value='known';
  assert.equal(api.matchingPortfolioHoldingRows(summary).length,0);
  api.state.portfolioFilter='all';
  assert.equal(api.matchingPortfolioHoldingRows(summary)[0].asset.id,'known');
  assert.equal(summary.rows.length,1, 'display recovery must not manufacture a valuation');
});

test('Portfolio view switches preserve sort and filters and keep mobile sorting available',()=>{
  const {api,node}=controller();
  api.state.portfolioFilter='retirement';api.state.portfolioSort='name';
  node('#portfolio-search').value='fund';
  for(const view of ['table','cards']) {
    api.state.portfolioView=view;api.renderPortfolioView(true);
    assert.equal(node('#portfolio-holding-sort').hidden,false);
    assert.equal(node('#portfolio-table-panel').hidden,view!=='table');
    assert.equal(node('#portfolio-cards-panel').hidden,view!=='cards');
    assert.equal(api.state.portfolioFilter,'retirement');
    assert.equal(api.state.portfolioSort,'name');
    assert.equal(node('#portfolio-search').value,'fund');
  }
});

test('Portfolio incomplete valuation is explained without showing a partial total',()=>{
  const {api,node}=controller();api.state.holdings=[{id:'known'},{id:'missing'}];
  api.renderPortfolioSummary({rows:[{asset:{id:'known'},marketValueCents:20000}],totalMarketValueCents:20000});
  assert.equal(node('#portfolio-summary-investments').textContent,'—');
  assert.equal(node('#portfolio-valuation-status').hidden,false);
  assert.equal(node('#portfolio-valuation-status').textContent,'1 asset needs a valuation');
  api.renderPortfolioSummary({rows:[{asset:{id:'known'},marketValueCents:20000},{asset:{id:'missing'},marketValueCents:20000}],totalMarketValueCents:40000});
  assert.equal(node('#portfolio-valuation-status').hidden,true);
  assert.equal(node('#portfolio-summary-investments').textContent,'$400.00');
});

test('selected Portfolio group keeps its complete value through search and explains incomplete portfolio allocation',()=>{
  const {api,node}=controller();
  api.state.holdings=[{id:'retirement',is_retirement:true},{id:'missing'}];
  api.state.portfolioFilter='retirement';
  node('#portfolio-search').value='no match';
  api.renderPortfolioSummary({rows:[{asset:{id:'retirement',isRetirement:true},marketValueCents:29500000}]});
  assert.equal(node('#portfolio-summary-investments').textContent,'$295,000.00');
  assert.equal(node('#portfolio-holdings-count').textContent,'1 asset');
  assert.equal(node('#portfolio-group-share').hidden,true);
  assert.equal(node('#portfolio-valuation-status').hidden,false);
  assert.equal(node('#portfolio-valuation-status').textContent,'Complete portfolio valuations to see allocation.');
  api.renderPortfolioSummary({rows:[{asset:{id:'retirement',isRetirement:true},marketValueCents:29500000},{asset:{id:'missing'},marketValueCents:20500000}]});
  assert.equal(node('#portfolio-summary-investments').textContent,'$295,000.00');
  assert.equal(node('#portfolio-holdings-count').textContent,'1 asset');
  assert.equal(node('#portfolio-group-share').textContent,'59% of portfolio');
  assert.equal(node('#portfolio-valuation-status').hidden,true);
});


test('a missing quote can be repaired with manual price or total value, without replacing an available quote',()=>{
  const {api,node}=controller();
  const holding={id:'missing',symbol:'MISSING',valuation_basis:'shares-and-price',shares:25,manual_price_cents:null,manual_value_cents:null};
  api.state.holdings=[holding];
  node('#asset-detail-form').fields={shares:'25',valuationBasis:'shares-and-price',manualPrice:'50'};
  assert.equal(api.detailHolding(holding).manual_price_cents,5000);
  node('#asset-detail-form').fields.manualPrice='';
  assert.throws(()=>api.detailHolding(holding),/manual price is required/);
  node('#asset-detail-form').fields={valuationBasis:'manual-value',manualValue:'1250'};
  const total=api.detailHolding(holding);
  assert.equal(total.manual_value_cents,125000);assert.equal(total.shares,null);
  api.state.quotes=[{holding_id:'missing',price_cents:6000,as_of:'2026-09-05T00:00:00Z'}];
  node('#asset-detail-form').fields={shares:'25',valuationBasis:'shares-and-price',manualPrice:'50'};
  assert.equal(api.detailHolding(holding).manual_price_cents,null);
});

test('Home shows sparse history immediately and clears it when records are unavailable',()=>{
  const {api,node}=controller();
  node('#history-trend').replaceChildren=()=>{node('#history-trend').innerHTML=''};
  const snapshots=Array.from({length:30},(_,i)=>({snapshot_date:new Date(Date.UTC(2026,7,i+1)).toISOString().slice(0,10),total_value_cents:100000+i*100}));
  for(const [records,expected] of [[snapshots.slice(0,1),true],[snapshots.slice(0,2),true],[snapshots.slice(0,11),true],[snapshots,true],[[],false]]) {
    api.state.snapshots=records;
    api.renderHistory();
    assert.equal(node('#history-trend').hidden,!expected);
    assert.equal(node('#history-building').hidden,expected);
    assert.equal(node('#history-endpoints').hidden,!expected);
    if(!expected)assert.equal(node('#history-trend').innerHTML,'');
    else if(records.length===1) {
      assert.match(node('#history-trend').innerHTML,/<circle/);
      assert.doesNotMatch(node('#history-trend').innerHTML,/polyline|polygon/);
      assert.match(node('#history-summary').textContent,/First recorded portfolio value/);
    } else {
      assert.match(node('#history-trend').innerHTML,/<path class="acadia-card-trend-line" d="M [^"]* C /);
      assert.match(node('#history-endpoints').innerHTML,/datetime=/);
    }
  }
});

test('Portfolio asset entry focuses its task and restores the originating card or recurring action',()=>{
  for (const section of ['details','recurring']) {
    const {api,node,window,document}=controller();
    api.state.holdings=[{id:'test'}];
    const focused=[];
    node('#asset-title').focus=()=>focused.push('title');
    node('#asset-detail-contribution').focus=()=>focused.push('contribution');
    node('#portfolio-add-asset').focus=()=>focused.push('add');
    const card={dataset:{holdingId:'test'},focus:()=>focused.push('card')};
    const recurring={dataset:{editId:'test'},focus:()=>focused.push('recurring')};
    document.querySelectorAll=(selector)=>selector.includes('recurring-list')?[recurring]:[card];
    api.navigateToAsset('test',{section});
    window.location.hash='#asset/test'; // Native Location normalises the leading hash.
    api.restorePortfolioAssetFocus('#portfolio');
    assert.deepEqual(focused,[section==='recurring'?'contribution':'title']);
    api.restorePortfolioAssetFocus(window.location.hash);
    assert.equal(focused.length,1,'background refresh must not steal focus');
    window.location.hash='#portfolio';
    api.restorePortfolioAssetFocus('#asset/test');
    assert.equal(focused.at(-1),section==='recurring'?'recurring':'card');
    document.querySelectorAll=()=>[];
    api.restorePortfolioAssetFocus('#asset/test');
    assert.equal(focused.at(-1),'add','removed or filtered records have a safe return target');
  }
});

test('Plan clears stale projections when valuation coverage is incomplete and recovers after repair',()=>{
  const {api,node}=controller();
  api.state.planDataAvailable=true;
  api.state.holdings=[{contribution_cents:null},{contribution_cents:null}];
  api.state.planSettings={expected_annual_return_rate:.05,distribution_yield_rate:.02,distribution_policy:'reinvest'};
  for(const id of ['#plan-value-axis','#plan-income-axis']) node(id).replaceChildren=()=>{node(id).innerHTML=''};
  const summary={rows:[{},{}],totalMarketValueCents:5000000,weeklyContributionRate:0};
  api.renderPlan(summary);
  assert.equal(node('#plan-outlook').hidden,false);
  assert.match(node('#plan-value-chart').innerHTML,/<svg/);
  const completeValue=node('#plan-projected-value').textContent;
  api.renderPlan({...summary,rows:[{}]});
  assert.equal(node('#plan-outlook').hidden,true);
  assert.equal(node('#plan-value-chart').innerHTML,'');
  assert.equal(node('#plan-income-chart').innerHTML,'');
  assert.equal(node('#plan-current-value').textContent,'Not set');
  assert.equal(node('#plan-projected-value').textContent,'Not set');
  assert.equal(node('#plan-review-portfolio').hidden,false);
  assert.match(node('#plan-readiness-copy').textContent,/1 asset needs a valuation/);
  api.renderPlan(summary);
  assert.equal(node('#plan-outlook').hidden,false);
  assert.equal(node('#plan-readiness').hidden,true);
  assert.equal(node('#plan-projected-value').textContent,completeValue);
  api.state.planSettings.expected_annual_return_rate=null;
  api.renderPlan(summary);
  assert.equal(node('#plan-outlook').hidden,true);
  assert.equal(node('#plan-readiness-copy').textContent,'Annual return data is missing for some holdings. Review Portfolio to complete coverage.');
  assert.equal(node('#plan-review-portfolio').hidden,false);
  api.state.planDataAvailable=false;
  api.renderPlan(summary);
  assert.equal(node('#edit-plan-assumptions').disabled,true);
  assert.equal(node('#plan-readiness-title').textContent,'Plan unavailable');
});

test('Plan contains unsupported historical rates for cash distribution policies and recovers',()=>{
  const {api,node}=controller();
  api.state.planDataAvailable=true;
  api.state.holdings=[{contribution_cents:null}];
  api.state.planSettings={expected_annual_return_rate:null,distribution_yield_rate:null,distribution_policy:'hold-cash'};
  for(const id of ['#plan-value-axis','#plan-income-axis']) node(id).replaceChildren=()=>{node(id).innerHTML=''};
  const summary={rows:[{marketValueCents:10000,asset:{historicalAnnualizedReturnRate:-.99}}],totalMarketValueCents:10000,distributionYieldRate:.02,weeklyContributionRate:0};
  api.renderPlan(summary);
  assert.equal(node('#plan-outlook').hidden,true);
  assert.equal(node('#plan-readiness-title').textContent,'Outlook unavailable');
  assert.match(node('#plan-readiness-copy').textContent,/selected distribution policy/);
  api.state.planSettings.distribution_policy='reinvest';
  api.renderPlan(summary);
  assert.equal(node('#plan-outlook').hidden,false);
  assert.equal(node('#plan-readiness').hidden,true);
});


test('quick-add previews exact amounts and discards manual valuation mode for a new symbol',()=>{
  const {api,node}=controller();
  const basis=node('#asset-valuation-basis');basis.name='valuationBasis';basis.value='shares-and-price';
  const price=node('#asset-manual-price');price.name='manualPrice';price.value='100.23';
  const value=node('#asset-manual-value');value.name='manualValue';
  node('#asset-form').elements=[basis,price,value];
  node('#asset-shares').value='2.5';
  api.renderQuickQuotePreview();
  assert.equal(node('#asset-price-preview').textContent,'$100.23');
  assert.equal(node('#asset-value-preview').textContent,'$250.58');
  assert.equal(node('#asset-quote-preview').hidden,false);
  basis.value='manual-value';value.value='12500.50';
  api.renderQuickQuotePreview();
  assert.equal(node('#asset-price-preview-field').hidden,true);
  assert.equal(node('#asset-value-preview').textContent,'$12,500.50');
  node('#asset-valuation-basis').value='manual-value';
  node('#asset-manual-value').value='12500.50';
  node('#asset-symbol').value='NEW';
  node('#asset-shares').value='';
  node('#asset-symbol').listeners.input();
  assert.equal(node('#asset-valuation-basis').value,'shares-and-price');
  assert.equal(node('#asset-manual-value').value,'');
  assert.equal(node('#manual-fallback').hidden,true);
  assert.equal(node('#asset-quote-preview').hidden,true);
  assert.equal(node('#asset-value-preview').textContent,'—');
});


test('successful price retry writes only a quote and hides recovery without replacing a draft',async()=>{
  const {api,node,window,context,writes,db}=quickSaveFixture({quoteFailure:true});
  await api.saveQuickAsset({preventDefault(){}});
  window.location.hash='#'+window.location.hash;api.renderAsset();
  node('#asset-detail-shares').value='7';
  context.fetch=async()=>({ok:true,json:async()=>({priceCents:2500,source:'Test',asOf:'2026-09-07T12:00:00Z'})});
  const originalFrom=api.state.client.from;
  api.state.client.from=table=>{
    const q=originalFrom(table);
    if(table==='holding_quotes')q.upsert=async payload=>{db.holding_quotes.push(payload);return {error:null}};
    return q;
  };
  await api.refreshCurrentAssetPrice();
  assert.equal(writes.filter(w=>w.table==='holdings').length,1);
  assert.equal(node('#asset-recovery').hidden,true);
  assert.equal(node('#asset-detail-shares').value,'7');
  assert.equal(node('#asset-price').textContent,'$25.00');
  assert.equal(node('#asset-detail-status').textContent,'Price refreshed.');
});

test('a failed refresh on a departed asset cannot write feedback into the next asset',async()=>{
  const {api,node,window,context}=quickSaveFixture({quoteFailure:true});
  await api.saveQuickAsset({preventDefault(){}});
  window.location.hash='#'+window.location.hash;api.renderAsset();
  let finish,started;const requested=new Promise(resolve=>{started=resolve});
  context.fetch=()=>new Promise(resolve=>{finish=resolve;started()});
  const refresh=api.refreshCurrentAssetPrice();await requested;
  api.state.holdings.push({...api.state.holdings[0],id:'another',symbol:'NEXT'});
  window.location.hash='#asset/another';api.renderAsset();
  finish({ok:false,json:async()=>({error:'Old asset request failed'})});await refresh;
  assert.equal(node('#asset-title').textContent,'NEXT');
  assert.equal(node('#asset-recovery-feedback').textContent,'');
  assert.equal(node('#asset-detail-status').textContent,'');
});


test('a saved retry quote remains visible if account reloading fails afterwards',async()=>{
  const {api,node,window,context}=quickSaveFixture({readFailure:true});
  await api.saveQuickAsset({preventDefault(){}});
  window.location.hash='#'+window.location.hash;api.renderAsset();
  context.fetch=async()=>({ok:true,json:async()=>({priceCents:2500,source:'Test',asOf:'2026-09-07T12:00:00Z'})});
  await api.refreshCurrentAssetPrice();
  assert.equal(node('#asset-price').textContent,'$25.00');
  assert.match(node('#asset-detail-status').textContent,/Price saved/);
  assert.match(node('#asset-recovery-copy').textContent,/reload the page/);
  assert.equal(node('#asset-retry-price').hidden,true);
});


test('acknowledged asset deletion returns to Portfolio without a reload racing the pending guard',async()=>{
  const {api,node,window}=editableAsset();let reads=0;
  api.state.account={id:'account'};
  api.state.quotes=[{holding_id:'test',price_cents:10000}];
  api.state.client.from=()=>({delete(){return this},eq(){return this},select(){return this},
    maybeSingle:async()=>({data:{id:'test'},error:null}),order(){reads++;throw new Error('Unexpected reload')}});
  api.openFormDialog('#delete-asset-dialog');
  await node('#delete-asset-form').listeners.submit({preventDefault(){}});
  assert.equal(reads,0);
  assert.equal(api.state.holdings.length,0);assert.equal(api.state.quotes.length,0);
  assert.equal(node('#delete-asset-dialog').open,false);
  assert.equal(api.hasPendingWrite(),false);
  assert.equal(window.location.hash,'portfolio');
  window.location.hash='#portfolio';api.render();
  assert.equal(window.location.hash,'#portfolio');
  assert.equal(node('#portfolio-workspace').hidden,false);
});


test('Income yield recovery excludes complete, zero, crypto and still-loading estimates',()=>{
  const {api,node}=controller();
  const row=(id,income,type='stock')=>({asset:{id,instrumentType:type},estimatedAnnualIncomeCents:income});
  api.state.providerMetricsPending.add('loading');
  const summary={rows:[row('missing',null),row('zero',0),row('complete',100),row('crypto',null,'crypto'),row('loading',null)]};
  assert.deepEqual(Array.from(api.missingIncomeYieldRows(summary),r=>r.asset.id),['missing']);
  node('#income-dividends-search').value='unrelated';
  api.renderIncomeYieldRecovery(summary);
  assert.equal(node('#income-review-yields').hidden,false);
  assert.equal(node('#income-yield-recovery-copy').textContent,'1 holding needs a dividend yield.');
  api.renderIncomeYieldRecovery({rows:[row('zero',0)]});
  assert.equal(node('#income-yield-recovery').hidden,true);
  assert.equal(node('#income-review-yields').hidden,true);
});

test('Income yield entry opens the advanced field and returns focus without changing period or search',()=>{
  for(const origin of ['#income','#income/budget']) {
    const {api,node,window,document}=controller();
    window.location.hash=origin;api.state.holdings=[{id:'test'}];api.state.incomePeriod='year';
    node('#income-dividends-search').value='FUND';
    const focused=[],disclosure={open:false};
    node('#asset-detail-yield').closest=()=>disclosure;
    node('#asset-detail-yield').focus=()=>focused.push('yield');
    node('#income-review-yields').focus=()=>focused.push('summary');
    node('#income-dividends-search').focus=()=>focused.push('search');
    node('#income-budget-tab').focus=()=>focused.push('budget');
    document.activeElement=node('#income-review-yields');
    api.navigateToAsset('test',{section:'yield'});window.location.hash='#asset/test';
    api.restorePortfolioAssetFocus(origin);
    assert.equal(disclosure.open,true);assert.deepEqual(focused,['yield']);
    api.restorePortfolioAssetFocus('#asset/test');assert.equal(focused.length,1);
    api.navigateBackFromAsset();assert.equal(window.location.hash,origin);
    api.restorePortfolioAssetFocus('#asset/test');assert.equal(focused.at(-1),'summary');
    node('#income-review-yields').hidden=true;api.restorePortfolioAssetFocus('#asset/test');
    assert.equal(focused.at(-1),origin==='#income'?'search':'budget');
    assert.equal(api.state.incomePeriod,'year');assert.equal(node('#income-dividends-search').value,'FUND');
  }
});


test('Income explains missing valuations independently of dividend yields and opens the repair field', () => {
  const {api, node, window, document} = controller();
  api.state.configured = true; api.state.user = {id:'owner'}; api.state.account = {id:'account'};
  api.state.holdings = [{id:'missing'}, {id:'valued'}];
  window.location.hash = '#income/budget';
  const summary = {rows:[{asset:{id:'valued',instrumentType:'stock'},estimatedAnnualIncomeCents:100}]};
  assert.equal(api.renderIncomeRecovery(summary), '1 holding needs a valuation');
  assert.equal(node('#income-retry-data').hidden, true);
  assert.equal(node('#income-review-valuations').hidden, false);
  node('#income-review-valuations').onclick();
  window.location.hash = '#asset/missing';
  let focused = '';
  node('#asset-detail-manual-price').closest = () => null;
  node('#asset-detail-manual-price').focus = () => {focused = 'price';};
  api.restorePortfolioAssetFocus('#income/budget');
  assert.equal(focused, 'price');
  api.state.holdings = [{id:'valued'}];
  api.renderIncomeRecovery(summary);
  assert.equal(node('#income-review-valuations').hidden, true);
  node('#income-budget-tab').focus = () => {focused = 'budget';};
  api.navigateBackFromAsset();
  api.restorePortfolioAssetFocus('#asset/missing');
  assert.equal(window.location.hash, '#income/budget');
  assert.equal(focused, 'budget');
});

function incomeReadRecoveryController() {
  const harness = controller();
  const {api, window} = harness;
  api.state.configured = true; api.state.user = {id:'owner'}; api.state.account = {id:'account'};
  api.state.incomeSourcesAvailable = false; api.state.budgetCategoriesAvailable = false;
  // Keep rendering on a different route to exercise late reads without navigating back to Income.
  window.location.hash = '#asset/missing';
  const calls = [];
  const pending = [];
  api.state.client.from = table => {
    const query = {select:()=>query, order:()=>query, eq(key,value) {calls.push({table,key,value});return query;},
      then(resolve,reject) {return new Promise((done,fail)=>pending.push({table,done,fail})).then(resolve,reject);}};
    return query;
  };
  return {...harness,calls,pending};
}

test('Income retry reads only failed account collections, blocks duplicates and preserves successful partial recovery', async () => {
  const {api,node,window,calls,pending} = incomeReadRecoveryController();
  node('#income-sources-search').value = 'salary'; api.state.incomePeriod = 'year';
  const first = api.retryIncomeData(); await Promise.resolve();
  await api.retryIncomeData();
  assert.equal(calls.length, 2);
  assert.equal(calls.every(call=>call.key==='account_id' && call.value==='account'), true);
  assert.equal(api.state.incomeReloadPending, true);
  pending.find(p=>p.table==='income_sources').done({data:[{id:'salary'}],error:null});
  pending.find(p=>p.table==='budget_categories').fail(new Error('Offline'));
  await first;
  assert.equal(api.state.incomeSourcesAvailable, true);
  assert.equal(api.state.incomeSources[0].id, 'salary');
  assert.equal(api.state.budgetCategoriesAvailable, false);
  assert.equal(api.state.incomeReloadFailed, true);
  assert.equal(api.state.incomeReloadPending, false);
  const retry = api.retryIncomeData(); await Promise.resolve();
  assert.equal(calls.length, 3);
  assert.equal(calls[2].table, 'budget_categories');
  pending[2].done({data:[],error:null}); await retry;
  assert.equal(api.state.budgetCategoriesAvailable, true);
  assert.equal(api.state.incomeReloadFailed, false);
  assert.equal(node('#income-sources-search').value, 'salary');
  assert.equal(api.state.incomePeriod, 'year');
  assert.equal(window.location.hash, '#asset/missing');
});

test('Income retry retains unavailable state for API failures and refuses late cross-account data', async () => {
  const {api,pending} = incomeReadRecoveryController();
  const first = api.retryIncomeData(); await Promise.resolve();
  pending.forEach(p=>p.done({data:null,error:{message:'Not authorised'}})); await first;
  assert.equal(api.state.incomeSourcesAvailable, false);
  assert.equal(api.state.budgetCategoriesAvailable, false);
  assert.equal(api.state.incomeReloadFailed, true);
  const second = api.retryIncomeData(); await Promise.resolve();
  api.state.user = null;
  pending.slice(2).forEach(p=>p.done({data:[{id:'private'}],error:null})); await second;
  assert.equal(api.state.incomeSources.length, 0);
  assert.equal(api.state.budgetCategories.length, 0);
  assert.equal(api.state.incomeReloadPending, false);
});

test('Income retry times out stalled reads and ignores their later result', async () => {
  const {api,pending,context} = incomeReadRecoveryController();
  const timers = [];
  context.setTimeout = callback => {timers.push(callback);return timers.length;};
  context.clearTimeout = () => {};
  const retry = api.retryIncomeData(); await Promise.resolve();
  timers.forEach(callback=>callback()); await retry;
  assert.equal(api.state.incomeReloadPending, false);
  assert.equal(api.state.incomeReloadFailed, true);
  pending.forEach(p=>p.done({data:[{id:'late'}],error:null})); await Promise.resolve();
  assert.equal(api.state.incomeSources.length, 0);
  assert.equal(api.state.incomeSourcesAvailable, false);
});

function timedQuoteController() {
  const view = controller();
  let expire;
  view.context.setTimeout = (callback, ms) => {assert.equal(ms, 25000); expire = callback; return 1;};
  view.context.clearTimeout = () => {};
  view.node('#asset-symbol').value = 'TIMEOUT';
  view.node('#asset-shares').value = '2';
  view.node('#manual-fallback').hidden = true;
  return {...view, expire:()=>expire()};
}

test('quote timeout releases a stalled session and prevents its late provider request', async () => {
  const {api,node,context,expire} = timedQuoteController();
  let finishSession, calls = 0;
  api.state.client.auth.getSession = () => new Promise(resolve => {finishSession = resolve;});
  context.fetch = async () => {calls++; return {ok:true,json:async()=>({priceCents:100})};};
  const pending = api.lookupQuote();
  expire(); await pending;
  assert.equal(node('#manual-fallback').hidden, false);
  assert.equal(node('#asset-symbol').value, 'TIMEOUT');
  assert.equal(node('#asset-shares').value, '2');
  finishSession({data:{session:{access_token:'late-local-test'}}});
  await Promise.resolve(); await Promise.resolve();
  assert.equal(calls, 0);
  assert.equal(api.state.pendingQuote, null);
});

test('quote timeout aborts transport, ignores late success and keeps manual recovery usable', async () => {
  const {api,node,context,expire} = timedQuoteController();
  let finish, signal;
  let started;
  const ready = new Promise(resolve => {started=resolve;});
  context.fetch = (_url, options) => {signal = options.signal; started(); return new Promise(resolve => {finish=resolve;});};
  const pending = api.lookupQuote();
  await ready;
  expire(); await pending;
  assert.equal(signal.aborted, true);
  assert.equal(node('#manual-fallback').hidden, false);
  finish({ok:true,json:async()=>({priceCents:99900})});
  await Promise.resolve(); await Promise.resolve();
  assert.equal(api.state.pendingQuote, null);
  assert.match(node('#quote-form-status').textContent, /Enter a manual price or total value/);
});

test('a stalled quote response body times out without exposing a superseded symbol fallback', async () => {
  const {api,node,context,expire} = timedQuoteController();
  let started;
  const ready = new Promise(resolve => {started=resolve;});
  context.fetch = async () => ({ok:true,json:()=>{started(); return new Promise(()=>{});}});
  const pending = api.lookupQuote();
  await ready;
  api.state.quoteRequestId++; node('#asset-symbol').value='NEW';
  expire(); await pending;
  assert.equal(node('#manual-fallback').hidden, true);
  assert.equal(api.state.pendingQuote, null);
});


test('clearing Portfolio search preserves selected group, view and sort and returns to search',()=>{
  const {api,node}=controller();
  api.render();
  api.state.portfolioFilter='retirement';
  api.state.portfolioView='table';
  api.state.portfolioSort='name';
  node('#portfolio-search').value='no match';
  let focused=false;node('#portfolio-search').focus=()=>{focused=true};
  node('#portfolio-clear-search').listeners.click();
  assert.equal(node('#portfolio-search').value,'');
  assert.equal(api.state.portfolioFilter,'retirement');
  assert.equal(api.state.portfolioView,'table');
  assert.equal(api.state.portfolioSort,'name');
  assert.equal(focused,true);
});


test('Home growth automatically uses historical returns and ignores manual return assumptions',()=>{
  const {api,node}=controller();
  api.state.configured=true;api.state.account={id:'account'};
  const assets=[
    {id:'a',symbol:'A',assetType:'Fund',valuationBasis:'manual-value',manualValueCents:750000,historicalAnnualizedReturnRate:0.08,expectedAnnualReturnRate:0.5},
    {id:'b',symbol:'B',assetType:'Fund',valuationBasis:'manual-value',manualValueCents:250000,historicalAnnualizedReturnRate:0.04,expectedAnnualReturnRate:0.5},
  ];
  api.state.holdings=assets;
  const summary=require('../portfolio').summarizePortfolio(assets);
  assert.equal(summary.totalEstimatedAnnualGrowthCents,70000);
  assert.equal(summary.totalExpectedAnnualGrowthCents,500000);
  api.renderHomeGrowth(summary);
  assert.equal(node('#home-growth').textContent,'$700');
  assert.equal(node('#home-growth-context').textContent,'Based on historical returns · Not a forecast');
  api.renderHomeGrowth(require('../portfolio').summarizePortfolio(assets.map(a=>({...a,expectedAnnualReturnRate:null}))));
  assert.equal(node('#home-growth').textContent,'$700');
  for(const rate of [0,-0.05]) {
    api.renderHomeGrowth(require('../portfolio').summarizePortfolio(assets.map(a=>({...a,historicalAnnualizedReturnRate:rate}))));
    assert.equal(node('#home-growth').textContent,rate===0?'$0':'-$500');
  }
});

test('Home growth withholds incomplete history and valuations and recovers after loading',()=>{
  const {api,node}=controller();
  api.state.configured=true;api.state.account={id:'account'};api.state.holdings=[{id:'a'},{id:'b'}];
  const complete={rows:[{},{}],totalEstimatedAnnualGrowthCents:12300};
  api.state.providerMetricsPending.add('a');api.renderHomeGrowth(complete);
  assert.equal(node('#home-growth').textContent,'Loading…');
  api.state.providerMetricsPending.clear();api.renderHomeGrowth(complete);
  assert.equal(node('#home-growth').textContent,'$123');
  api.renderHomeGrowth({...complete,totalEstimatedAnnualGrowthCents:null});
  assert.equal(node('#home-growth').textContent,'Unavailable');
  assert.match(node('#home-growth-context').textContent,/Historical returns unavailable/);
  api.renderHomeGrowth({...complete,rows:[{}]});
  assert.equal(node('#home-growth').textContent,'Unavailable');
  assert.equal(node('#home-growth-context').textContent,'Incomplete valuation coverage');
  api.state.holdings=[];api.renderHomeGrowth({rows:[],totalEstimatedAnnualGrowthCents:null});
  assert.equal(node('#home-growth-context').textContent,'Add investments to see an estimate');
  api.state.account=null;api.renderHomeGrowth(complete);
  assert.equal(node('#home-growth').textContent,'Unavailable');
  assert.equal(node('#home-growth-context').textContent,'Portfolio data unavailable');
});


test('Home lifetime and day changes stay independent of chart range and recover from missing valuations',()=>{
  const {api,node}=controller();
  api.state.configured=true; api.state.account={id:'test'}; api.state.holdings=[{id:'test'}];
  api.state.snapshots=[{snapshot_date:'2025-01-01',total_value_cents:100000},{snapshot_date:'2026-09-01',total_value_cents:120000}];
  const summary={rows:[{}],totalMarketValueCents:110000,totalDayChangeCents:-1000,totalDayChangeRate:-1000/111000};
  for(const period of ['all','3m','6m','1y']) {
    api.state.performancePeriod=period; api.renderHomeChanges(summary);
    assert.equal(node('#all-time-change-value').textContent,'Up $100');
    assert.equal(node('#all-time-change-rate').textContent,'+10%');
    assert.equal(node('#metric-change-value').textContent,'Down $10');
    assert.equal(node('#metric-change-rate').textContent,'-0.9%');
    assert.match(node('#all-time-change-context').textContent,/Jan 1, 2025/);
  }
  api.renderHomeChanges({...summary,rows:[]});
  assert.equal(node('#all-time-change-value').textContent,'—');
  assert.equal(node('#all-time-change-rate').hidden,true);
  assert.equal(node('#metric-change-value').textContent,'—');
  api.renderHomeChanges({...summary,totalDayChangeCents:null,totalDayChangeRate:null});
  assert.equal(node('#all-time-change-value').textContent,'Up $100');
  assert.equal(node('#metric-change-rate').hidden,true);
  assert.match(node('#day-change-context').textContent,/Previous close unavailable/);
  api.state.snapshots=[];api.renderHomeChanges(summary);
  assert.equal(node('#all-time-change-value').textContent,'—');
  assert.match(node('#all-time-change-context').textContent,/Awaiting first/);
  assert.equal(node('#metric-change-value').textContent,'Down $10');
});
