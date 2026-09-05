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
    });
    return nodes.get(selector);
  }
  const document = {querySelector:node, querySelectorAll:()=>[], activeElement:null};
  const window = {
    MercuryPortfolio: require('../portfolio'), MercuryIncome: require('../income'),
    MercuryPlan: require('../plan'), MercuryDashboard: require('../dashboard'),
    location:{hash:'#portfolio',origin:'https://example.invalid'}, addEventListener() {},
  };
  const context = vm.createContext({window,document,Intl,Date,Number,Set,Map,console,
    setTimeout,clearTimeout,crypto:require('node:crypto').webcrypto,
    FormData: class { constructor(form) { this.form = form; } get(key) { const field = this.form.elements.find(element => element.name === key && !element.disabled); return field ? field.value : this.form.fields?.[key] ?? null; } },
    fetch:async()=>({ok:false,json:async()=>({error:'provider unavailable'})}),
  });
  const source = fs.readFileSync(require.resolve('../brokerage.js'),'utf8').replace('  initialise();',
    '  window.testController = {state,render,renderAsset,canQuote,lookupQuote,saveQuickAsset,navigateToAsset,navigateBackFromAsset,routeAssetId};');
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
  api.renderAsset();
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
