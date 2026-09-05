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
      setAttribute() {}, hasAttribute() { return false; }, focus() {},
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
    setTimeout,clearTimeout,crypto:require('node:crypto').webcrypto,
    FormData: class { constructor(form) { this.values = {...form.fields}; form.elements.filter(field => field.name && !field.disabled).forEach(field => { this.values[field.name] = field.value; }); } get(key) { return this.values[key] ?? null; } },
    fetch:async()=>({ok:false,json:async()=>({error:'provider unavailable'})}),
  });
  const source = fs.readFileSync(require.resolve('../brokerage.js'),'utf8').replace('  initialise();',
    '  window.testController = {state,render,renderAsset,canQuote,lookupQuote,saveQuickAsset,navigateToAsset,navigateBackFromAsset,routeAssetId,openFormDialog,hasPendingWrite,hasUnsavedWork};');
  vm.runInContext(source,context);
  const api=window.testController;
  api.state.client={auth:{getSession:async()=>({data:{session:{access_token:'isolated-test'}}})}};
  return {api,node,window,document};
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


test('retrying after a quote-write failure reuses the same holding id',async()=>{
  const {api,node}=controller();const writes=[];
  api.state.account={id:'account'};
  api.state.pendingQuote={priceCents:1234,priorCloseCents:1200,source:'Test',asOf:'2026-09-05T00:00:00Z',instrumentType:'stock'};
  node('#asset-form').fields={symbol:'TEST',shares:'2',valuationBasis:'shares-and-price'};
  api.state.client.from=(table)=>({upsert:async(payload)=>{
    writes.push({table,payload});return {error:table==='holding_quotes'?{message:'Quote storage unavailable'}:null};
  }});
  await api.saveQuickAsset({preventDefault(){}});
  await api.saveQuickAsset({preventDefault(){}});
  const holdings=writes.filter(w=>w.table==='holdings');
  assert.equal(holdings.length,2);assert.equal(holdings[0].payload.id,holdings[1].payload.id);
  assert.equal(node('#save-asset').disabled,false);
  assert.equal(node('#quote-form-status').textContent,'Quote storage unavailable');
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
