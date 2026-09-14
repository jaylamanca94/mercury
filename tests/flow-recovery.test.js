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
      reset() {}, querySelector(child) { return node(selector + " " + child); }, querySelectorAll() { return []; }, replaceChildren() {}, setAttribute() {}, hasAttribute() { return false; }, focus() {}, scrollIntoView() {},
      showModal() { this.open = true; }, close() { this.open = false; this.listeners.close?.(); },
    });
    return nodes.get(selector);
  }
  const document = {body: node("body"),querySelector:node, querySelectorAll:()=>[], activeElement:null, listeners:{}, addEventListener(type, callback) { this.listeners[type] = callback; }};
  const window = {
    MercuryMarketHistory: require('../market-history'),
    MercuryPortfolio: require('../portfolio'), MercuryIncome: require('../income'),
    MercuryPlan: require('../plan'), MercuryDashboard: require('../dashboard'),
    location:{reload(){ window.reloads = (window.reloads || 0) + 1; },hash:'#portfolio',origin:'https://example.invalid',pathname:'/index.html',search:''}, listeners:{}, addEventListener(type, callback) { this.listeners[type] = callback; },
  };
  window.history = {pushState(_state, _title, hash) { window.location.hash = hash.startsWith('#') ? hash : ''; }};
  const context = vm.createContext({window,document,Intl,Date,Number,Set,Map,console,
    buildCardTrendPath:require('../acadia-card-trend.mjs').buildCardTrendPath,
    setTimeout,clearTimeout,AbortController,crypto:require('node:crypto').webcrypto,
    FormData: class { constructor(form) { this.values = {...form.fields}; form.elements.filter(field => field.name && !field.disabled).forEach(field => { this.values[field.name] = field.value; }); } get(key) { return this.values[key] ?? null; } },
    fetch:async()=>({ok:false,json:async()=>({error:'provider unavailable'})}),
  });
  const source = fs.readFileSync(require.resolve('../brokerage.js'),'utf8').replace(/^import .*;\n/, '').replace('  initialise();',
    '  window.testController = {editPlanScenario,savePlanScenario,planProjection,observeAuthSession,sessionToken,editIncomeSource,saveInlineIncomeSource,cancelInlineIncomeSource,incomeSourceDrafts,syncPortfolioMarketHistory,clearPortfolioMarketHistory,portfolioMarketHistory,renderRecurringInvestments,loadMarketHistory,renderMarketHistory,clearMarketHistory,initialise,loadData,readWithDeadline,retryPlanSettings,openPlanAssumptionsDialog,savePlanAssumptions,retryProperties,hydrateProviderMetrics,ensurePlanSettings,state,render,renderHomeChanges,renderHomeGrowth,renderIncomeRecovery,retryIncomeData,missingIncomeYieldRows,renderIncomeYieldRecovery,renderPlan,renderQuickQuotePreview,refreshCurrentAssetPrice,restorePortfolioAssetFocus,renderHistory,renderAsset,canQuote,lookupQuote,saveQuickAsset,navigateToAsset,navigateBackFromAsset,routeAssetId,openFormDialog,hasPendingWrite,hasUnsavedWork,matchingPortfolioHoldingRows,sortHoldingRows,holdingValueLabel,renderPortfolioView,renderPortfolioSummary,detailHolding,openPropertyDialog,saveProperty};');
  vm.runInContext(source,context);
  const api=window.testController;
  api.state.client={auth:{onAuthStateChange(callback){ window.authChanged = callback; return {data:{subscription:{unsubscribe(){}}}}; },getSession:async()=>({data:{session:{access_token:'isolated-test'}}})}};
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

test('same-user auth refresh preserves drafts and does not reload', () => {
  const {api,node,window,document}=controller();
  api.observeAuthSession({user:{id:'owner'}});
  api.incomeSourceDrafts.set('source',{amount:'123',pending:false});
  node('#asset-detail-shares').value='17';
  for(let i=0;i<3;i++) api.observeAuthSession({user:{id:'owner'},access_token:'refreshed'});
  assert.equal(window.reloads,undefined);
  assert.equal(document.body.hidden,false);
  assert.equal(api.incomeSourceDrafts.get('source').amount,'123');
  assert.equal(node('#asset-detail-shares').value,'17');
});

test('sign-out and identity replacement immediately conceal private drafts and bypass unload guard', () => {
  for(const next of [null,{user:{id:'different-owner'}}]) {
    const {api,window,document}=controller();
    api.state.user={id:'owner'};api.state.account={id:'account'};
    api.observeAuthSession({user:api.state.user});
    api.incomeSourceDrafts.set('source',{amount:'123',pending:true});
    const before=api.state.dataRequestId;
    api.observeAuthSession(next);
    assert.equal(document.body.hidden,true);
    assert.equal(document.body.inert,true);
    assert.equal(api.state.user,null);assert.equal(api.state.account,null);assert.equal(api.state.client,null);
    assert.equal(api.state.dataRequestId,before+1);
    assert.equal(window.reloads,1);
    let blocked=false;
    window.listeners.beforeunload({preventDefault(){blocked=true}});
    assert.equal(blocked,false);
    api.render();api.observeAuthSession(next);
    assert.equal(document.body.hidden,true);assert.equal(window.reloads,1);
  }
});

test('cross-tab sign-in reloads a signed-out page once without auth calls inside the callback', () => {
  const {api,window}=controller();
  api.observeAuthSession(null);
  api.state.client.auth.getSession=()=>{throw new Error('Callback must not request the session')};
  assert.equal(api.observeAuthSession({user:{id:'owner'}}),undefined);
  assert.equal(window.reloads,1);
});

test('a session read that completes after sign-out cannot authorise a provider request', async () => {
  const {api}=controller();let finish;
  api.observeAuthSession({user:{id:'owner'}});
  api.state.client.auth.getSession=()=>new Promise(resolve=>{finish=resolve});
  const pending=api.sessionToken();
  api.observeAuthSession(null);
  finish({data:{session:{access_token:'old-token'}}});
  await assert.rejects(pending,/session changed/);
});

test('startup subscribes once and a sign-out invalidates a pending initial account read', async () => {
  const {api,window,context}=controller();let finish,subscriptions=0;
  context.fetch=async()=>({ok:true,json:async()=>({configured:true})});
  api.state.client.auth.onAuthStateChange=callback=>{subscriptions++;window.authChanged=callback;return {data:{subscription:{unsubscribe(){}}}}};
  api.state.client.auth.getSession=async()=>({data:{session:{user:{id:'owner'}}}});
  api.state.client.from=()=>{const q={select(){return q},eq(){return q},maybeSingle(){return q},abortSignal(){return q},then(resolve){finish=resolve}};return q};
  const pending=api.initialise();
  for(let i=0;i<20&&!finish;i++)await new Promise(resolve=>setImmediate(resolve));
  assert.equal(typeof finish,'function');
  window.authChanged('SIGNED_OUT',null);
  finish({data:{id:'old-account'}});await pending;
  assert.equal(api.state.account,null);assert.equal(window.reloads,1);
  await api.initialise();assert.equal(subscriptions,1);
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

test('Home asset entry and Back restore keyboard focus, with a fallback for reranked cards',()=>{
  const {api,node,window,document}=controller();
  const focused=[];
  const card={dataset:{holdingId:'test'},focus(){focused.push('card')}};
  document.querySelectorAll=selector=>selector==='#holdings-grid [data-holding-id]'?[card]:[];
  node('#asset-title').focus=()=>focused.push('title');
  node('#home-add-asset').focus=()=>focused.push('add');
  for(const origin of ['', '#']) {
    window.location.hash=origin;api.navigateToAsset('test');window.location.hash='#asset/test';
    api.restorePortfolioAssetFocus(origin);assert.equal(focused.at(-1),'title');
    window.location.hash=origin;api.restorePortfolioAssetFocus('#asset/test');assert.equal(focused.at(-1),'card');
  }
  document.querySelectorAll=()=>[];
  api.restorePortfolioAssetFocus('#asset/test');assert.equal(focused.at(-1),'add');
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
    const q = {select(){return q},eq(){return q},order(){return q},abortSignal(){return q},maybeSingle(){return q},
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
    api.state.client.from=()=>{const q={update(){return q},upsert(){return q},insert(){return q},eq(){return q},select(){return q},single(){return q},maybeSingle(){return q},abortSignal(){return q},then(resolve){calls++;return new Promise(r=>{finish=r}).then(resolve)}};return q};
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
    node('#portfolio-add-recurring summary').focus=()=>focused.push('add-recurring');
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
    assert.equal(focused.at(-1),section==='recurring'?'add-recurring':'add','removed or filtered records have a safe return target');
  }
});

test('Plan clears stale projections when valuation coverage is incomplete and recovers after repair',()=>{
  const {api,node}=controller();
  api.state.planDataAvailable=true;
  api.state.holdings=[{contribution_cents:null},{contribution_cents:null}];
  api.state.planSettings={expected_annual_return_rate:.05,distribution_yield_rate:.02,distribution_policy:'reinvest'};
  for(const id of ['#plan-value-axis','#plan-income-axis']) node(id).replaceChildren=()=>{node(id).innerHTML=''};
  const summary={rows:[{asset:{id:'one'}},{asset:{id:'two'}}],totalMarketValueCents:5000000,weeklyContributionRate:0};
  api.renderPlan(summary);
  assert.equal(node('#plan-outlook').hidden,false);
  assert.match(node('#plan-value-chart').innerHTML,/<svg/);
  const completeValue=node('#plan-projected-value').textContent;
  api.renderPlan({...summary,rows:[{asset:{id:'one'}}]});
  assert.equal(node('#plan-outlook').hidden,true);
  assert.equal(node('#plan-value-chart').innerHTML,'');
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
  assert.equal(node('#plan-readiness-title').textContent,'Review your Plan inputs');
  assert.match(node('#plan-readiness-copy').textContent,/cash distribution policy/);
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
  api.renderHomeGrowth({...complete,totalMarketValueCents:123000});
  assert.equal(node('#home-growth-rate').textContent,'+10%');
  api.renderHomeGrowth({...complete,totalMarketValueCents:0});
  assert.equal(node('#home-growth-rate').hidden,true);
  api.renderHomeGrowth({...complete,totalEstimatedAnnualGrowthCents:null});
  assert.equal(node('#home-growth').textContent,'Unavailable');
  assert.equal(node('#home-growth-rate').hidden,true);
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

function readFixture(view, read) {
  view.api.state.configured = true;
  view.api.state.user = {id:'owner',email:'fixture'};
  view.api.state.account = {id:'account',name:'Brokerage'};
  view.api.state.client.from = table => {
    const query = {select(){return this},eq(){return this},order(){return this},maybeSingle(){return this},single(){return this},upsert(){return this},insert(){return this},abortSignal(signal){this.signal=signal;return this},then(resolve,reject){return Promise.resolve().then(()=>read(table,this.signal)).then(resolve,reject)}};
    return query;
  };
  return view;
}

function accountRead(table) {
  return {data:table === 'accounts' ? [{id:'account',name:'Brokerage'}] : table==='plan_settings' ? {account_id:'account'} : []};
}

test('initial account failure stays distinct from empty/configuration and retries the current route',async()=>{
  const view=readFixture(controller(),table=>failed&&table==='accounts'?{error:{message:'private diagnostic'}}:accountRead(table));
  const {api,node,context,document,window}=view; let failed=true;
  context.fetch=async()=>({ok:true,json:async()=>({configured:true})});
  api.state.client.auth.getSession=async()=>({data:{session:{user:api.state.user}}});
  window.location.hash='#income/budget';
  await api.initialise();
  assert.equal(api.state.configured,true);
  assert.equal(api.state.startupStatus,'error');
  assert.equal(node('#workspace-recovery').hidden,false);
  assert.equal(node('#income-workspace').hidden,true);
  assert.equal(node('#home-add-asset').disabled,true);
  assert.doesNotMatch(node('#workspace-recovery-copy').textContent,/private diagnostic|configure|No assets/);
  failed=false; document.activeElement=node('#workspace-retry');let focus=0;node('#main-content').focus=()=>focus++;
  await api.initialise();
  assert.equal(api.state.startupStatus,null);
  assert.equal(node('#workspace-recovery').hidden,true);
  assert.equal(window.location.hash,'#income/budget');
  assert.equal(node('#income-workspace').hidden,false);
  assert.equal(focus,1);
});

test('missing configuration has visible recovery and never shows an empty portfolio',async()=>{
  const {api,node,context}=controller();
  context.fetch=async()=>({ok:false,status:503,json:async()=>({configured:false})});
  await api.initialise();
  assert.equal(api.state.startupStatus,'unconfigured');
  assert.match(node('#workspace-recovery-title').textContent,/not configured/);
  assert.equal(node('#home-workspace').hidden,true);
  assert.equal(node('#workspace-retry').hidden,false);
});

test('startup prevents duplicate retries and bounds a stalled response body',async()=>{
  const {api,node,context}=controller();let deadline,signal,calls=0,finish;
  context.setTimeout=callback=>{deadline=callback;return 1};context.clearTimeout=()=>{};
  context.fetch=async(_url,options)=>{calls++;signal=options.signal;return {ok:true,json:()=>new Promise(resolve=>{finish=resolve})}};
  const first=api.initialise();await api.initialise();await Promise.resolve();await Promise.resolve();
  assert.equal(calls,1);assert.equal(node('#home-workspace').hidden,true);
  deadline();await first;
  assert.equal(signal.aborted,true);assert.equal(api.state.startupStatus,'error');
  finish({configured:true});await Promise.resolve();
  assert.equal(api.state.startupStatus,'error');assert.equal(api.state.client.auth!==undefined,true);
});

test('late account reads cannot overwrite a newer read or another identity',async()=>{
  for(const change of ['newer','user','account','client']) {
    let finish,hold=true;
    const view=readFixture(controller(),table=>table==='holdings'&&hold?new Promise(resolve=>{finish=resolve}):accountRead(table));
    const {api}=view;const old=api.loadData();await new Promise(setImmediate);
    if(change==='newer') {hold=false;await api.loadData();}
    else api.state[change]=change==='user'?null:{id:'replacement'};
    finish({data:[{id:'older'}]});assert.equal(await old,false);
    assert.equal(api.state.holdings.length,0);
  }
});

test('load deadline aborts requests and leaves previous records intact after late success',async()=>{
  const deadlines=new Set();let finish,signal;
  const view=readFixture(controller(),(table,s)=>{if(table==='holdings'){signal=s;return new Promise(resolve=>{finish=resolve})}return accountRead(table)});
  const {api,context}=view;api.state.holdings=[{id:'saved'}];
  context.setTimeout=callback=>{deadlines.add(callback);return callback};context.clearTimeout=callback=>deadlines.delete(callback);
  const request=api.loadData();await new Promise(setImmediate);for(const deadline of deadlines)deadline();
  await assert.rejects(request,/timed out/);assert.equal(signal.aborted,true);
  finish({data:[{id:'late'}]});await new Promise(setImmediate);
  assert.equal(api.state.holdings[0].id,'saved');
});

test('optional property rejection preserves holdings and retries only properties with focus recovery',async()=>{
  let failed=true,calls=[];
  const view=readFixture(controller(),table=>{calls.push(table);if(table==='home_properties'){if(failed)throw Error('network');return {data:[]}}return accountRead(table)});
  const {api,node,document}=view;
  await api.loadData();assert.equal(api.state.propertiesAvailable,false);
  assert.match(node('#portfolio-properties-empty-copy').textContent,/could not be loaded/);
  assert.doesNotMatch(node('#portfolio-properties-empty-copy').textContent,/migration/);
  calls=[];failed=false;document.activeElement=node('#property-retry-data');let focused=0;node('#portfolio-properties-title').focus=()=>focused++;
  await api.retryProperties();
  assert.deepEqual(calls,['home_properties']);assert.equal(api.state.propertiesAvailable,true);
  assert.equal(node('#property-retry-data').hidden,true);assert.equal(focused,1);
});

test('property retry guards duplicate requests, failed recovery and late identity changes',async()=>{
  let finish,calls=0;
  const view=readFixture(controller(),()=>{calls++;return new Promise(resolve=>{finish=resolve})});
  const {api,node}=view;api.state.propertiesAvailable=false;
  const request=api.retryProperties();await new Promise(setImmediate);await api.retryProperties();
  assert.equal(calls,1);assert.equal(node('#property-retry-data').disabled,true);
  finish({error:{message:'private diagnostic'}});await request;
  assert.equal(api.state.propertiesAvailable,false);assert.equal(api.state.propertyReloadPending,false);
  assert.doesNotMatch(node('#property-recovery-status').textContent,/private diagnostic/);
  const late=api.retryProperties();await new Promise(setImmediate);api.state.user=null;
  finish({data:[{id:'private'}]});await late;
  assert.equal(api.state.properties.length,0);
});

test('a stalled optional property read becomes recoverable without losing the loaded workspace',async()=>{
  const deadlines=new Set();
  const {api,context}=readFixture(controller(),table=>table==='home_properties'?new Promise(()=>{}):accountRead(table));
  context.setTimeout=callback=>{deadlines.add(callback);return callback};context.clearTimeout=callback=>deadlines.delete(callback);
  const request=api.loadData();await new Promise(setImmediate);
  assert.equal(deadlines.size,1);for(const deadline of deadlines)deadline();
  assert.equal(await request,true);assert.equal(api.state.propertiesAvailable,false);
  assert.equal(api.state.accounts[0].id,'account');
});

test('late provider metrics cannot populate a signed-out account',async()=>{
  const {api,context}=readFixture(controller(),accountRead);let finish;
  // Keep the render on the guarded loading surface; exercise the actual provider lifecycle.
  api.state.startupStatus='loading';
  api.state.holdings=[{id:'old',symbol:'OLD',instrument_type:'stock',valuation_basis:'shares-and-price'}];
  context.fetch=()=>new Promise(resolve=>{finish=resolve});
  const request=api.hydrateProviderMetrics();await new Promise(setImmediate);
  api.state.user=null;
  finish({ok:true,json:async()=>({priceCents:100,annualizedReturnRate:0.2})});await request;
  assert.equal(Object.keys(api.state.providerMetrics).length,0);
});

test('initial plan defaults never overwrite a concurrently created plan',async()=>{
  const {api}=readFixture(controller(),accountRead);api.state.planSettings=null;
  let conflictOptions,reads=0;
  api.state.client.from=()=>{const query={select(){return this},eq(){return this},maybeSingle(){return this},abortSignal(){return this},upsert(_value,options){conflictOptions=options;return this},then(resolve){reads++;return Promise.resolve({data:reads===1?null:{account_id:'account',distribution_policy:'cash'}}).then(resolve)}};return query};
  await api.ensurePlanSettings();
  assert.equal(conflictOptions.ignoreDuplicates,true);
  assert.equal(api.state.planSettings.distribution_policy,'cash');
});

test('Plan read failure withholds assumed settings and retries only Plan with focus recovery', async () => {
  let failed = true; const calls = [];
  const { api, node, window, document } = readFixture(controller(), table => {
    calls.push(table);
    return table === 'plan_settings' ? failed ? {error:{message:'private diagnostic'}} : {data:{id:'plan',account_id:'account',updated_at:'v1',expected_annual_return_rate:null,distribution_yield_rate:null,distribution_policy:'hold-cash'}} : accountRead(table);
  });
  window.location.hash = '#plan';
  await api.loadData();
  assert.equal(node('#plan-retry-data').hidden, false);
  for (const id of ['return','yield','policy']) assert.equal(node('#plan-assumption-'+id).textContent, 'Unavailable');
  assert.equal(node('#plan-outlook').hidden, true);
  calls.length=0; failed=false;
  document.activeElement=node('#plan-retry-data'); let focus=0;
  node('#edit-plan-assumptions').focus=()=>focus++;
  api.state.planHorizon=20;
  await api.retryPlanSettings();
  assert.deepEqual(calls,['plan_settings']);
  assert.equal(api.state.planSettings.distribution_policy,'hold-cash');
  assert.equal(node('#plan-assumption-policy').textContent,'Hold cash');
  assert.equal(node('#plan-retry-data').hidden,true);
  assert.equal(api.state.planHorizon,20); assert.equal(focus,1);
});

test('Plan retry deduplicates, aborts stalled reads, and rejects late identity results', async () => {
  let finish, signal, calls=0; const timers=new Set();
  const {api,context,node,window}=readFixture(controller(),(_table,abortSignal)=>{calls++;signal=abortSignal;return new Promise(r=>finish=r)});
  context.setTimeout=callback=>{timers.add(callback);return callback}; context.clearTimeout=callback=>timers.delete(callback);
  api.state.planDataAvailable=false; window.location.hash='#plan';
  const pending=api.retryPlanSettings(); await new Promise(setImmediate); await api.retryPlanSettings();
  assert.equal(calls,1);assert.equal(node('#plan-retry-data').disabled,true);
  for(const expire of timers)expire(); await pending;
  assert.equal(signal.aborted,true);assert.equal(api.state.planReloadPending,false);
  assert.equal(api.state.planDataAvailable,false);
  assert.match(node('#plan-recovery-status').textContent,/still unavailable/);
  finish({data:{id:'late'}});await new Promise(setImmediate);assert.equal(api.state.planSettings,null);
  const other=api.retryPlanSettings();await new Promise(setImmediate);api.state.user=null;
  finish({data:{id:'different-owner'}});await other;assert.equal(api.state.planSettings,null);
});

test('Plan retry preserves loaded investments when initial settings creation fails', async () => {
  const {api,node}=readFixture(controller(),()=>({data:null}));api.state.planDataAvailable=false;
  api.state.holdings=[{id:'kept'}];api.state.startupStatus='loading';let writes=0;
  api.state.client.from=()=>{const q={select(){return this},eq(){return this},maybeSingle(){return this},abortSignal(){return this},upsert(){writes++;return this},then(resolve){return Promise.resolve(writes?{error:{message:'setup failed'}}:{data:null}).then(resolve)}};return q};
  await api.retryPlanSettings();
  assert.equal(writes,1);assert.equal(api.state.planDataAvailable,false);assert.equal(api.state.holdings[0].id,'kept');
  assert.equal(node('#plan-retry-data').disabled,false);
});

function planEditorFixture() {
  const view=readFixture(controller(),accountRead);
  let remote={id:'plan',account_id:'account',updated_at:'v1',expected_annual_return_rate:0.04,distribution_yield_rate:0,distribution_policy:'reinvest'};
  const writes=[]; let failRead=false;
  view.api.state.planSettings={...remote};
  view.api.state.client.from=table=>{
    assert.equal(table,'plan_settings');let values,operation='read';const filters=[];
    const q={select(){return this},maybeSingle(){return this},abortSignal(){return this},eq(k,v){filters.push([k,v]);return this},update(p){operation='update';values=p;return this},insert(p){operation='insert';values=p;return this},then(resolve){
      if(operation==='read')return Promise.resolve(failRead?{error:{message:'offline'}}:{data:remote?{...remote}:null}).then(resolve);
      writes.push({operation,filters,values});
      if(operation==='insert'&&remote)return Promise.resolve({error:{code:'23505'}}).then(resolve);
      if(operation==='update'&&(!remote||!filters.every(([k,v])=>remote[k]===v)))return Promise.resolve({data:null}).then(resolve);
      remote={...remote,...values,id:'plan',updated_at:'v'+(writes.length+1)};
      return Promise.resolve({data:{...remote}}).then(resolve);
    }};return q;
  };
  view.node('#plan-assumptions-form').fields={expectedAnnualReturn:'5',distributionYield:'2',distributionPolicy:'hold-cash'};
  return {...view,writes,getRemote:()=>remote,setRemote:r=>{remote=r},setFailRead:v=>{failRead=v}};
}

test('Plan saves compare the opening revision and preserve a conflicting draft until reopened', async () => {
  const {api,node,writes,getRemote,setRemote}=planEditorFixture();
  api.openPlanAssumptionsDialog();
  const newer={...getRemote(),updated_at:'v2',distribution_policy:'transfer-to-bank'};
  setRemote(newer);api.state.planSettings={...newer}; // Background reads must not rebase the draft.
  await api.savePlanAssumptions({preventDefault(){}});
  assert.equal(getRemote().distribution_policy,'transfer-to-bank');
  assert.equal(node('#plan-assumptions-dialog').open,true);
  assert.equal(node('#plan-assumptions-form').fields.distributionPolicy,'hold-cash');
  assert.match(node('#plan-assumptions-form-status').textContent,/changed elsewhere/);
  assert.deepEqual(writes[0].filters.map(([k,v])=>[k,v]),[['account_id','account'],['id','plan'],['updated_at','v1']]);
  await api.savePlanAssumptions({preventDefault(){}});assert.equal(getRemote().updated_at,'v2');
  node('#plan-assumptions-dialog').close();api.openPlanAssumptionsDialog();
  assert.equal(node('#plan-distribution-policy').value,'transfer-to-bank');
  await api.savePlanAssumptions({preventDefault(){}});
  assert.equal(getRemote().distribution_policy,'hold-cash');assert.equal(node('#plan-assumptions-dialog').open,false);
});

test('concurrent first Plan settings creation cannot overwrite the winning record', async () => {
  const {api,node,getRemote}=planEditorFixture();api.state.planSettings=null;api.openPlanAssumptionsDialog();
  await api.savePlanAssumptions({preventDefault(){}});
  assert.equal(getRemote().distribution_policy,'reinvest');
  assert.match(node('#plan-assumptions-form-status').textContent,/changed elsewhere/);
  assert.equal(node('#plan-assumptions-dialog').open,true);
});

test('Plan conflict read failures retain the original revision and support retry', async () => {
  const {api,node,getRemote,setRemote,setFailRead}=planEditorFixture();api.openPlanAssumptionsDialog();
  setRemote({...getRemote(),updated_at:'v2'});setFailRead(true);
  await api.savePlanAssumptions({preventDefault(){}});
  assert.match(node('#plan-assumptions-form-status').textContent,/latest version could not be loaded/);
  setFailRead(false);await api.savePlanAssumptions({preventDefault(){}});
  assert.equal(getRemote().updated_at,'v2');assert.equal(api.state.planSettings.updated_at,'v2');
  assert.match(node('#plan-assumptions-form-status').textContent,/Close and reopen/);
});

test('a stalled Plan save unlocks the draft and never reports an unconfirmed write as saved', async () => {
  const {api,node,context}=planEditorFixture();api.openPlanAssumptionsDialog();
  const timers=new Set();let finish,signal;
  context.setTimeout=callback=>{timers.add(callback);return callback};context.clearTimeout=callback=>timers.delete(callback);
  api.state.client.from=()=>{const q={update(){return this},eq(){return this},select(){return this},maybeSingle(){return this},abortSignal(s){signal=s;return this},then(resolve){return new Promise(r=>finish=r).then(resolve)}};return q};
  const request=node('#plan-assumptions-form').listeners.submit({preventDefault(){}});
  await new Promise(setImmediate);assert.equal(api.hasPendingWrite(),true);
  for(const expire of timers)expire();await request;
  assert.equal(signal.aborted,true);assert.equal(api.hasPendingWrite(),false);
  assert.equal(node('#plan-assumptions-dialog').open,true);
  assert.match(node('#plan-assumptions-form-status').textContent,/could not be confirmed/);
  finish({data:{id:'plan',updated_at:'late'}});await new Promise(setImmediate);
  assert.equal(api.state.planSettings.updated_at,'v1');assert.equal(node('#plan-assumptions-dialog').open,true);
});


test('property purchase price survives save and reopen, can be cleared, and failed saves retain the draft', async () => {
  const {api,node}=controller();
  api.state.account={id:'account'};
  api.state.properties=[{id:'property',account_id:'account',name:'Test house',location:'Test region',current_value_cents:45000000,mortgage_balance_cents:20000000,purchase_price_cents:null,annual_appreciation_rate:null}];
  let payload,fail=false;
  api.state.client.from=table=>{
    assert.equal(table,'home_properties');
    return {update(value){payload=value;return this},eq(){return this},select(){return this},async single(){return fail?{error:new Error('Save unavailable')}:{data:{...api.state.properties[0],...payload}}}};
  };
  api.openPropertyDialog('property',{focusPurchasePrice:true});
  assert.equal(node('#property-purchase-price').value,'');
  node('#property-form').fields={name:'Test house',location:'Test region',currentValue:'450000',mortgageBalance:'200000',purchasePrice:'300000.25'};
  await api.saveProperty({preventDefault(){}});
  assert.equal(payload.purchase_price_cents,30000025);
  api.openPropertyDialog('property');
  assert.equal(node('#property-purchase-price').value,'300000.25');
  node('#property-form').fields.purchasePrice='';
  await api.saveProperty({preventDefault(){}});
  assert.equal(api.state.properties[0].purchase_price_cents,null);
  api.openPropertyDialog('property');
  node('#property-form').fields.purchasePrice='280000';node('#property-purchase-price').value='280000';fail=true;
  await api.saveProperty({preventDefault(){}});
  assert.equal(api.state.properties[0].purchase_price_cents,null);
  assert.equal(node('#property-purchase-price').value,'280000');
  assert.equal(node('#property-dialog').open,true);
  assert.equal(node('#property-form-status').textContent,'Save unavailable');
  assert.equal(node('#save-property').disabled,false);
});

test('removing the purchase-price shortcut returns focus to its visible menu even when closed menu items report rectangles', () => {
  const {api,node,document,context}=controller();
  context.CSS={escape:value=>value};
  let focused=null;
  const summary={isConnected:true,disabled:false,getClientRects:()=>[{}],focus(){focused='summary'},closest:()=>menu};
  const menu={open:false,querySelector:()=>summary};
  const hiddenEdit={isConnected:true,disabled:false,getClientRects:()=>[{}],closest:()=>menu,focus(){focused='hidden edit'}};
  const shortcut={isConnected:true,disabled:false,closest:()=>null,hasAttribute:name=>name==='data-edit-property-id',getAttribute:()=> 'property',getClientRects:()=>[{}],focus(){focused='shortcut'}};
  document.querySelector=selector=>selector==='dialog[open]'?null:node(selector);
  document.activeElement=shortcut;
  api.openFormDialog('#property-dialog');
  shortcut.isConnected=false;
  document.querySelectorAll=selector=>selector==='[data-edit-property-id="property"]'?[hiddenEdit]:[];
  node('#property-dialog').close();
  assert.equal(focused,'summary');
});

test('market history rejects stale asset responses and keeps an unsaved holding draft', async () => {
  const { api, node, window, context } = editableAsset();
  api.clearMarketHistory();
  const holding = api.state.holdings[0];
  node('#asset-detail-shares').value = '27';
  let finish;
  context.fetch = async () => new Promise(resolve => { finish = resolve; });
  const request = api.loadMarketHistory(holding);
  await new Promise(resolve => setImmediate(resolve));
  window.location.hash = '#portfolio';
  api.clearMarketHistory();
  node('#asset-market-price').textContent = 'different asset';
  finish({ ok: true, json: async () => ({ currency:'USD',source:'Test prices',points:[{time:Date.now()-86400000,price:100},{time:Date.now(),price:120}] }) });
  await request;
  assert.equal(node('#asset-market-price').textContent, 'different asset');
  assert.equal(node('#asset-detail-shares').value, '27');
  window.location.hash = '#asset/test';
  context.fetch = async () => ({ ok: true, json: async () => ({ currency:'USD',source:'Test prices',points:[{time:Date.now()-86400000,price:100},{time:Date.now(),price:120}] }) });
  await api.loadMarketHistory(holding);
  assert.equal(node('#asset-market-price').textContent, '$120.00');
  assert.match(node('#asset-market-change').textContent, /Up \$20.00 \(20%\)/);
  assert.equal(node('#asset-detail-shares').value, '27');
});

test('market history retries failed reads without writes and ignores a replaced account', async () => {
  const { api, node, context } = editableAsset();
  api.clearMarketHistory();
  const holding = api.state.holdings[0];
  context.fetch = async () => { throw new Error('private diagnostic'); };
  await api.loadMarketHistory(holding);
  assert.equal(node('#asset-market-retry').hidden, false);
  assert.match(node('#asset-market-status').textContent, /could not be loaded/);
  assert.doesNotMatch(node('#asset-market-status').textContent, /private diagnostic/);
  let finish;
  context.fetch = async () => new Promise(resolve => { finish = resolve; });
  const request = api.loadMarketHistory(holding);
  await new Promise(resolve => setImmediate(resolve));
  api.state.account = { id:'another-account' };
  node('#asset-market-price').textContent = 'new account';
  finish({ ok:true,json:async()=>({currency:'USD',points:[{time:Date.now(),price:999}]}) });
  await request;
  assert.equal(node('#asset-market-price').textContent, 'new account');
});

test('Portfolio market cards limit concurrent reads, reuse ranges and discard departed-card responses', async () => {
  const { api, context, window } = editableAsset();
  api.clearMarketHistory(); api.state.account={id:'test-account'};
  window.location.hash = '#portfolio';
  const base = api.state.holdings[0];
  api.state.holdings = Array.from({length:5}, (_,i) => ({...base,id:`card-${i}`,symbol:`FUND${i}`,instrument_type:'etf'}));
  const rows = api.state.holdings.map(holding => ({asset:{id:holding.id}}));
  const requests = [];
  context.fetch = async (url, options) => new Promise(resolve => requests.push({url,options,resolve}));
  api.syncPortfolioMarketHistory(rows);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 3);
  api.syncPortfolioMarketHistory(rows);
  assert.equal(requests.length, 3, 're-render cannot launch duplicate reads');
  requests[0].resolve({ok:true,json:async()=>({currency:'USD',points:[{time:Date.now(),price:100}]})});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 4, 'the next queued card starts when a slot is free');
  assert.equal(api.portfolioMarketHistory.get('card-0').data.points[0].price,100);
  api.clearPortfolioMarketHistory();
  assert.equal(api.portfolioMarketHistory.size,0);
  requests.slice(1).forEach(request => {
    assert.equal(request.options.signal.aborted,true);
    request.resolve({ok:true,json:async()=>({currency:'USD',points:[{time:Date.now(),price:999}]})});
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(api.portfolioMarketHistory.size,0,'late results cannot revive an old Portfolio');
  assert.equal(requests.length,4,'cleared queues cannot restart');
});

test('Portfolio history rejects replaced accounts and retries only explicitly after failure', async () => {
  const { api, context, window } = editableAsset();
  api.clearMarketHistory(); api.state.account={id:'test-account'}; window.location.hash='#portfolio';
  const holding=api.state.holdings[0];
  const rows=[{asset:{id:holding.id}}];
  let calls=0;
  context.fetch=async()=>{calls++;throw new Error('provider failed')};
  api.syncPortfolioMarketHistory(rows);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(api.portfolioMarketHistory.get(holding.id).error,true);
  api.syncPortfolioMarketHistory(rows);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls,1,'ordinary rerenders must not create a retry loop');
  const old=api.portfolioMarketHistory.get(holding.id);
  api.state.account={id:'new-account'};
  api.syncPortfolioMarketHistory(rows);
  await new Promise(resolve=>setImmediate(resolve));
  assert.notEqual(api.portfolioMarketHistory.get(holding.id),old);
  assert.equal(old.controller.signal.aborted,true);
  api.clearPortfolioMarketHistory();
});

test('recurring equivalents reconcile weekly and monthly schedules', () => {
  const {api,node}=editableAsset();api.clearMarketHistory();
  const base=api.state.holdings[0];
  api.state.holdings=[{...base,id:'weekly',contribution_cents:10000,contribution_frequency:'weekly'},{...base,id:'monthly',contribution_cents:20000,contribution_frequency:'monthly'}];
  node('#portfolio-recurring-choices').querySelector=()=>null;
  api.renderRecurringInvestments();
  assert.equal(node('#portfolio-recurring-weekly').textContent,'$146');
  assert.equal(node('#portfolio-recurring-monthly').textContent,'$633');
  assert.equal(node('#portfolio-recurring-annual').textContent,'$7,600');
});

test('inline income drafts retain saved summary inputs, validate, and cancel without a write', async () => {
  const {api}=controller();
  const source={id:'salary',account_id:'account',name:'Salary',income_type:'employment',amount_cents:110000,frequency:'biweekly'};
  api.state.user={id:'owner'}; api.state.account={id:'account'}; api.state.incomeSources=[source];
  let writes=0; api.state.client.from=()=>{writes++;throw new Error('Unexpected write')};
  api.editIncomeSource('salary','1200','monthly');
  assert.equal(api.hasUnsavedWork(),true);
  assert.equal(api.state.incomeSources[0].amount_cents,110000);
  assert.equal(require('../income').summarizeIncomeSources(api.state.incomeSources.map(s=>({id:s.id,name:s.name,incomeType:s.income_type,amountCents:s.amount_cents,frequency:s.frequency})),'year').totalAnnualIncomeCents,2860000);
  api.editIncomeSource('salary','0','monthly'); await api.saveInlineIncomeSource('salary');
  assert.match(api.incomeSourceDrafts.get('salary').status,/positive/); assert.equal(writes,0);
  api.cancelInlineIncomeSource('salary'); assert.equal(api.hasUnsavedWork(),false);
  api.editIncomeSource('salary','1200','monthly'); api.editIncomeSource('salary','1100','biweekly');
  assert.equal(api.hasUnsavedWork(),false);
});

test('inline income save is single flight, scoped, confirmed, and leaves failed drafts retryable', async () => {
  const {api}=controller();
  const source={id:'salary',account_id:'account',name:'Salary',income_type:'employment',amount_cents:110000,frequency:'biweekly'};
  api.state.user={id:'owner'}; api.state.account={id:'account'}; api.state.incomeSources=[source];
  let finish,writes=0,payload; const filters=[];
  api.state.client.from=table=>{assert.equal(table,'income_sources');return {update(value){payload=value;writes++;return this},eq(k,v){filters.push([k,v]);return this},select(){return this},maybeSingle(){return this},abortSignal(){return new Promise(resolve=>{finish=resolve})}}};
  api.editIncomeSource('salary','1200','monthly'); const saving=api.saveInlineIncomeSource('salary');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(api.hasPendingWrite(),true); api.cancelInlineIncomeSource('salary');
  await api.saveInlineIncomeSource('salary'); assert.equal(writes,1);
  finish({error:{message:'Offline'}}); await saving;
  assert.equal(api.hasPendingWrite(),false); assert.equal(api.incomeSourceDrafts.get('salary').amount,'1200');
  assert.match(api.incomeSourceDrafts.get('salary').status,/Offline/);
  assert.deepEqual(filters.slice(0,4),[['id','salary'],['account_id','account'],['amount_cents',110000],['frequency','biweekly']]);
  const retry=api.saveInlineIncomeSource('salary'); await new Promise(resolve=>setImmediate(resolve));
  finish({data:{...source,...payload}}); await retry;
  assert.equal(api.state.incomeSources[0].amount_cents,120000);
  assert.equal(api.state.incomeSources[0].frequency,'monthly');
  assert.equal(api.hasUnsavedWork(),false); assert.equal(api.hasPendingWrite(),false);
});

test('inline income conflicts retain the original baseline until Cancel reviews the latest source', async () => {
  const {api}=controller();
  const source={id:'salary',account_id:'account',name:'Salary',income_type:'employment',amount_cents:110000,frequency:'biweekly'};
  api.state.user={id:'owner'}; api.state.account={id:'account'}; api.state.incomeSources=[source];
  const compared=[];
  api.state.client.from=()=>{let write=false;return {update(){write=true;return this},eq(k,v){if(write&&k==='amount_cents')compared.push(v);return this},select(){return this},maybeSingle(){return this},abortSignal(){return Promise.resolve({data:write?null:{...source,amount_cents:125000}})}}};
  api.editIncomeSource('salary','1200','monthly'); await api.saveInlineIncomeSource('salary');
  assert.equal(api.state.incomeSources[0].amount_cents,125000);
  assert.match(api.incomeSourceDrafts.get('salary').status,/changed or was removed/);
  await api.saveInlineIncomeSource('salary'); assert.deepEqual(compared,[110000,110000]);
  api.cancelInlineIncomeSource('salary'); assert.equal(api.hasUnsavedWork(),false);
});

test('an old account income save cannot populate another account or leave its draft visible', async () => {
  const {api}=controller();
  const source={id:'salary',account_id:'account',name:'Salary',income_type:'employment',amount_cents:110000,frequency:'biweekly'};
  api.state.user={id:'owner'}; api.state.account={id:'account'}; api.state.incomeSources=[source];
  let finish;
  api.state.client.from=()=>({update(){return this},eq(){return this},select(){return this},maybeSingle(){return this},abortSignal(){return new Promise(resolve=>{finish=resolve})}});
  api.editIncomeSource('salary','1200','monthly'); const saving=api.saveInlineIncomeSource('salary');
  await new Promise(resolve=>setImmediate(resolve));
  api.state.account={id:'another-account'}; api.state.incomeSources=[]; api.render();
  assert.equal(api.hasUnsavedWork(),false);
  finish({data:{...source,amount_cents:120000,frequency:'monthly'}}); await saving;
  assert.equal(api.state.incomeSources.length,0); assert.equal(api.hasPendingWrite(),false);
});

test('Plan scenario saves remain account scoped, retain conflicting drafts and cancel to the winner', async()=>{
 const {api,node,getRemote,setRemote,writes}=planEditorFixture();
 api.editPlanScenario('weeklyExpensesCents','50');
 assert.equal(api.hasUnsavedWork(),true);
 const newer={...getRemote(),updated_at:'new',weekly_expenses_cents:7000};setRemote(newer);
 await api.savePlanScenario({preventDefault(){}});
 assert.equal(getRemote().weekly_expenses_cents,7000);
 assert.match(node('#plan-scenario-status').textContent,/changed elsewhere/);
 assert.equal(api.hasUnsavedWork(),true);
 assert.equal(writes[0].values.weekly_expenses_cents,5000);
 assert.deepEqual(writes[0].filters,[['account_id','account'],['id','plan'],['updated_at','v1']]);
 await api.savePlanScenario({preventDefault(){}});
 assert.equal(getRemote().weekly_expenses_cents,7000);
 node('#plan-scenario-cancel').listeners.click();
 assert.equal(api.hasUnsavedWork(),false);
 assert.equal(node('#plan-weekly-expenses').value,'70.00');
});

test('Plan scenario saves exact cents and reset restores linked source amounts without editing sources',async()=>{
 const {api,node,getRemote,writes}=planEditorFixture();
 api.state.incomeSources=[{id:'income',name:'Job',income_type:'employment',amount_cents:12345,frequency:'weekly'}];
 api.editPlanScenario('annualIncomeCents','200.01');
 await api.savePlanScenario({preventDefault(){}});
 assert.equal(getRemote().annual_income_cents,1040052);
 assert.equal(api.state.incomeSources[0].amount_cents,12345);
 assert.equal(api.hasUnsavedWork(),false);
 node('#plan-reset-amounts').listeners.click();
 await api.savePlanScenario({preventDefault(){}});
 assert.equal(getRemote().annual_income_cents,null);
 assert.equal(node('#plan-income').value,'123.45');
 assert.equal(writes.length,2);
});

test('Plan scenario duplicates are blocked and late writes cannot enter a replacement account',async()=>{
 const {api,node}=planEditorFixture();let finish,calls=0;
 api.state.client.from=()=>{const q={update(){return this},eq(){return this},select(){return this},maybeSingle(){return this},abortSignal(){return this},then(resolve){calls++;return new Promise(r=>finish=r).then(resolve)}};return q};
 api.editPlanScenario('weeklyExpensesCents','100');
 const pending=api.savePlanScenario({preventDefault(){}});await new Promise(setImmediate);
 assert.equal(api.hasPendingWrite(),true);await api.savePlanScenario({preventDefault(){}});assert.equal(calls,1);
 api.state.account={id:'replacement'};api.state.planSettings={id:'replacement-plan'};
 finish({data:{id:'old-plan',weekly_expenses_cents:10000}});await pending;
 assert.equal(api.state.planSettings.id,'replacement-plan');
 api.render();assert.equal(api.hasUnsavedWork(),false);
});

test('Plan invalid ages and failed cash-flow reads withhold the entire projection',()=>{
 const {api,node}=planEditorFixture();
 api.editPlanScenario('retirementAge','65');
 assert.match(node('#plan-readiness-copy').textContent,/date of birth/);
 assert.equal(node('#plan-outlook').hidden,true);
 node('#plan-scenario-cancel').listeners.click();
 api.state.incomeSourcesAvailable=false;api.renderPlan({rows:[],totalMarketValueCents:0});
 assert.equal(node('#plan-outlook').hidden,true);
 assert.equal(node('#plan-review-income').hidden,false);
 assert.equal(node('#plan-income').disabled,true);
});

test('Plan DOB replaces legacy age only after a confirmed save and survives reopen',async()=>{
 const {api,node,getRemote,setRemote}=planEditorFixture();
 setRemote({...getRemote(),current_age:31,age_reference_year:2026,retirement_age:40,stop_investing_age:65});api.state.planSettings={...getRemote()};
 api.openPlanAssumptionsDialog();assert.equal(node('#plan-date-of-birth').value,'');
 node('#plan-assumptions-form').fields.dateOfBirth='1995-10-01';
 await api.savePlanAssumptions({preventDefault(){}});
 assert.equal(getRemote().date_of_birth,'1995-10-01');assert.equal(getRemote().current_age,null);assert.equal(getRemote().age_reference_year,null);
 assert.equal(getRemote().retirement_age,40);assert.equal(getRemote().stop_investing_age,65);
 api.openPlanAssumptionsDialog();assert.equal(node('#plan-date-of-birth').value,'1995-10-01');
 assert.match(node('#plan-birth-date-preview').textContent,/October 1, 1995/);
});

test('DOB saves reject future dates and preserve the entered draft after conflicts',async()=>{
 const {api,node,getRemote,setRemote,writes}=planEditorFixture();
 api.openPlanAssumptionsDialog();node('#plan-assumptions-form').fields.dateOfBirth='2999-01-01';
 await api.savePlanAssumptions({preventDefault(){}});assert.equal(writes.length,0);assert.match(node('#plan-assumptions-form-status').textContent,/today/);
 node('#plan-assumptions-form').fields.dateOfBirth='1995-10-01';
 setRemote({...getRemote(),date_of_birth:'1990-03-01',updated_at:'v2'});
 await api.savePlanAssumptions({preventDefault(){}});
 assert.equal(getRemote().date_of_birth,'1990-03-01');assert.equal(node('#plan-assumptions-form').fields.dateOfBirth,'1995-10-01');
 assert.match(node('#plan-assumptions-form-status').textContent,/changed elsewhere/);
});
