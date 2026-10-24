/* OMS Compass automated checks (software behavior only — not clinical validation).
 Run: npm i -D playwright && npx playwright install chromium && node tests/run.cjs
 Loads index.html from disk in a phone-sized Chromium, no network. */
const path=require('path');const {chromium,devices}=require('playwright');
const FILE='file://'+path.resolve(__dirname,'..','index.html');
let pass=0,fail=0;const fails=[];
function ok(c,msg){if(c){pass++}else{fail++;fails.push(msg);console.log('  ✗ '+msg)}}
async function fresh(ctx){const page=await ctx.newPage();
 page.on('pageerror',e=>{fail++;fails.push('pageerror: '+e.message);console.log('  ✗ pageerror '+e.message)});
 await page.route(/^https?:\/\//,r=>r.abort());
 await page.goto(FILE);await page.waitForSelector('#in-q');return page}
const E=(page,fn,arg)=>page.evaluate(fn,arg);
const openSet=async page=>{if(!(await page.evaluate(()=>{const d=document.getElementById('settings');return !!(d&&d.open)})))await page.click('#settings summary')};

(async()=>{
 const browser=await chromium.launch();
 const ctx=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});
 await ctx.addInitScript(()=>{try{localStorage.setItem('omsCompassAck','1')}catch(e){}});
 let page=await fresh(ctx);

 console.log('1. Brand and generic searches reach the same guidance');
 const pairs=[['Eliquis','apixaban','doac'],['Xarelto','rivaroxaban','doac'],['Pradaxa','dabigatran','doac'],['Coumadin','warfarin','warfarin'],['Plavix','clopidogrel','antiplatelet'],['Brilinta','ticagrelor','antiplatelet'],['Prolia','denosumab','antires'],['Zometa','zoledronic acid','antires'],['Fosamax','alendronate','antires'],['Ozempic','semaglutide','glp1'],['Mounjaro','tirzepatide','glp1'],['Jardiance','empagliflozin','sglt2'],['Farxiga','dapagliflozin','sglt2'],['Medrol','methylprednisolone','steroid'],['HbA1c','A1C','a1c'],['PT/INR','INR','inr'],['platelets','thrombocytopenia','plt'],['eGFR','dialysis','renal'],['radiotherapy','osteoradionecrosis','rad']];
 for(const [a,b,id] of pairs){const r=await E(page,([a,b])=>[findHits(a).map(h=>h.f.id),findHits(b).map(h=>h.f.id)],[a,b]);
  ok(r[0][0]===id&&r[1][0]===id,`${a} / ${b} → ${id} (got ${r[0]} / ${r[1]})`)}
 for(const t of ['xeralto','eliqis','ozempick','plavics'])ok((await E(page,t=>findHits(t).length,t))>0,`typo “${t}” finds a finding`);
 for(const t of ['sinus','implant','extraction','infection','sedation','avulsion','Dantrium','biopsy','canine','nerve'])ok((await E(page,t=>findHits(t).length,t))===0,`“${t}” does not trigger a false finding`);
 await page.fill('#in-q','Eliquis');ok(await page.locator('#hits [data-find="doac"]').count()===1,'UI: Eliquis shows the DOAC finding (live-app regression)');
 await page.fill('#in-q','metoprolol');const nm=await page.locator('#hits .nomatch').innerText();ok(/not the same as “no surgical implications/.test(nm),'Unsupported query is explicit, not “no implications”');
 const same=await E(page,()=>{openFind('doac','Eliquis');const a=JSON.stringify(fPlan(FX.doac));newPatient();openFind('doac','apixaban');const b=JSON.stringify(fPlan(FX.doac));newPatient();return a===b});
 ok(same,'Brand and generic open identical DOAC plans (agent preset apixaban both ways)');

 console.log('2. Unknown never yields a negative finding or definitive clearance');
 const r2=await E(page,()=>{const bad=[];let n=0;
  for(const m of MODS){for(const [id,nd] of Object.entries(m.nodes)){if(!nd.q)continue;S.ans={};S.inp={};
    /* reach this node by walking, answering Unknown here */
    const path={};let cur=m.start,g=0;while(cur&&cur!==id&&g++<40){const x=m.nodes[cur];if(!x)break;if(x.note){cur=x.next;continue}if(x.out)break;
     const yes=x.yes,ok=(function reach(k,d){if(d>40||!k)return false;if(k===id)return true;const z=m.nodes[k];if(!z)return false;if(z.note)return reach(z.next,d+1);if(z.out)return false;return reach(z.yes,d+1)||reach(z.no,d+1)})(yes,0);path[cur]=ok;cur=ok?x.yes:x.no}
    if(cur!==id)continue;S.ans[m.id]={...path,[id]:'u'};const w=walk(m);n++;
    if(w.out||!w.unk)bad.push(m.id+'.'+id)}}
  S.ans={};return{n,bad}});
 ok(r2.bad.length===0,`Unknown halts every module path (${r2.n} questions checked; bad: ${r2.bad.join(',')})`);
 const r2b=await E(page,()=>{const bad=[];
  for(const f of FIND){for(let i=0;i<400;i++){newPatient();S.fid=f.id;
   for(let pass=0;pass<4;pass++)fQs(f).forEach(q=>{if(S.pf[q.k]!==undefined)return;const r=Math.random();
    if(q.type==='num'){if(r<.7)S.pf[q.k]=String(q.k==='plt'?Math.round(Math.random()*300):q.k==='a1c'?(5+Math.random()*6).toFixed(1):q.k==='age'?'50':(0.9+Math.random()*4).toFixed(1))}
    else if(r<.85)S.pf[q.k]=[...q.opts.map(o=>o[0]),'u'][Math.floor(Math.random()*(q.opts.length+1))]});
   prune();const p=fPlan(f);const open=fQs(f).some(q=>!q.optional&&!has(S.pf[q.k]));
   if(open&&!p.prov)bad.push(f.id+':not provisional '+JSON.stringify(S.pf));
   if(open&&p.d==='proceed'&&!p.prov)bad.push(f.id+':clearance');
   if(!DISP[p.d])bad.push(f.id+':bad disp '+p.d)}}
  newPatient();return bad.slice(0,5)});
 ok(r2b.length===0,'Findings: unanswered/Unknown always provisional (2,400 random cases) '+r2b.join(' | '));
 const r2c=await E(page,()=>{const t=[];const P=(id,pf)=>{newPatient();Object.assign(S.pf,pf);S.fid=id;prune();return fPlan(FX[id])};
  t.push(['glp1 GI unknown ≠ No',P('glp1',{anes:'sed',glpEsc:'n',glpGi:'u'}).d!=='proceed']);
  t.push(['warfarin INR date unknown → verify',P('warfarin',{proc:'low',inr:'2.1',inrAge:'u',ap:'n'}).d==='investigate']);
  t.push(['antires dosing unknown → verify, plan as oncologic',P('antires',{proc:'high',exposed:'n',arInd:'u'}).d==='investigate']);
  t.push(['DOAC procedure unknown → provisional',P('doac',{doacAg:'api'}).prov===true]);
  t.push(['module preop: Unknown on stent question gives no plan',(()=>{S.ans={preop:{a:'u'}};const w=walk(M('preop'));return!w.out&&!!w.unk})()]);
  newPatient();return t});
 r2c.forEach(([m,v])=>ok(v,m));

 console.log('3. Units, invalid values, dates and trends');
 const r3=await E(page,()=>{const P=(id,pf)=>{newPatient();Object.assign(S.pf,pf);S.fid=id;prune();return fPlan(FX[id])};const t=[];
  let p=P('warfarin',{proc:'low',inr:'25',inrAge:'d1',ap:'n'});t.push(['INR 25 treated as possibly real → urgent verification, no surgery',p.d==='refer'&&/verify urgently/.test(p.act)&&!/invalid/i.test(p.act)]);
  p=P('warfarin',{proc:'low',inr:'4.2',inrAge:'d1',ap:'n'});t.push(['INR 4.2 → defer',p.d==='defer']);
  p=P('warfarin',{proc:'high',inr:'3.6',inrAge:'d1',ap:'n'});t.push(['INR 3.6 → defer (author threshold 3.5, labeled)',p.d==='defer'&&p.basis==='au'&&/SDCEP allows/.test(p.steps.join(' '))]);
  p=P('warfarin',{proc:'high',inr:'3.4',inrAge:'d1',ap:'n'});t.push(['INR 3.4 recent → continue',p.d==='modify'&&/continue warfarin/.test(p.act)]);
  p=P('warfarin',{proc:'low',inr:'2.5',inrAge:'old',ap:'n'});t.push(['INR >72 h → repeat',p.d==='investigate'&&/Repeat within 24 h/.test(p.act)]);
  p=P('warfarin',{proc:'low',inr:'2.5',inrAge:'d3',stable:'y',ap:'n'});t.push(['INR 25–72 h stable → proceed',p.d==='proceed'&&!p.prov]);
  p=P('plt',{proc:'high',plt:'150000',pltU:'k',pltAge:'wk',pltTrend:'st',pltCause:'itp'});t.push(['raw count in ×10³ unit flagged',/raw count/.test(p.act)]);
  p=P('plt',{proc:'high',plt:'45000',pltU:'raw',pltAge:'wk',pltTrend:'st',pltCause:'itp'});t.push(['45,000/µL → 45 → refer for surgical',p.d==='refer'&&/45 ×10⁹/.test(p.act)]);
  p=P('plt',{proc:'low',plt:'45',pltU:'k',pltAge:'wk',pltTrend:'st',pltCause:'itp'});t.push(['45 for simple extraction → proceed with changes',p.d==='modify']);
  p=P('plt',{proc:'low',plt:'45',pltU:'k',pltAge:'wk',pltTrend:'fall',pltCause:'itp'});t.push(['falling trend → verify first',p.d==='investigate']);
  p=P('plt',{proc:'low',plt:'45',pltU:'k',pltAge:'old',pltTrend:'st',pltCause:'itp'});t.push(['old platelet result → verify first',p.d==='investigate']);
  p=P('a1c',{a1c:'75',a1cU:'mmol',a1cAge:'r3',urg:'el'});t.push(['75 mmol/mol → ≈9.0% → higher risk, not deferred on A1C alone',p.d==='modify'&&/≈9\.0\d?%/.test(p.act)&&/Not a stand-alone/.test(p.act)]);
  p=P('a1c',{a1c:'64',a1cU:'pct',a1cAge:'r3',urg:'el'});t.push(['64 entered as % flagged wrong unit',/mmol\/mol/.test(p.act)&&p.d==='investigate']);
  p=P('a1c',{a1c:'9.1',a1cU:'pct',a1cAge:'r3',urg:'urg'});t.push(['A1C 9.1 urgent → not deferred',p.d!=='defer']);
  p=P('a1c',{a1c:'7.1',a1cU:'pct',a1cAge:'old',urg:'el'});t.push(['A1C older than 3 months → verify',p.d==='investigate']);
  newPatient();return t});
 r3.forEach(([m,v])=>ok(v,m));
 // UI: typing a number keeps focus and updates the action live
 await E(page,()=>{newPatient();S.pf.proc='low';S.pf.inrAge='d1';S.pf.ap='n';openFind('warfarin','warfarin')});
 await page.click('#pf-inr');await page.keyboard.type('4.5');
 ok(await E(page,()=>document.activeElement&&document.activeElement.id==='pf-inr'),'Typing INR keeps the field focused (no re-render)');
 ok(/Defer/i.test(await page.locator('#ftop').innerText()),'Action updates live while typing (INR 4.5 → Defer)');
 ok(await E(page,()=>document.getElementById('pf-inr').getAttribute('inputmode')==='decimal'),'INR field uses a decimal keypad');

 console.log('4. Procedure and anesthesia questions only when relevant');
 const r4=await E(page,()=>{newPatient();const ks=id=>{S.fid=id;prune();return fQs(FX[id]).map(q=>q.k)};const t=[];
  t.push(['GLP-1 asks anesthesia, not procedure',ks('glp1').includes('anes')&&!ks('glp1').includes('proc')]);
  t.push(['GLP-1 GI questions hidden until sedation',!ks('glp1').includes('glpGi')]);S.pf.anes='sed';t.push(['GLP-1 GI questions shown for sedation',ks('glp1').includes('glpGi')]);
  newPatient();t.push(['DOAC asks procedure, not anesthesia',ks('doac').includes('proc')&&!ks('doac').includes('anes')]);
  S.pf.doacAg='riv';S.pf.proc='high';t.push(['No dose-timing question: DOAC continues uninterrupted (author decision)',!ks('doac').includes('doacTime')]);
  newPatient();t.push(['Kidney card asks no procedure/anesthesia',!ks('renal').some(k=>['proc','anes','urg'].includes(k))]);
  t.push(['HbA1c asks urgency only',ks('a1c').includes('urg')&&!ks('a1c').includes('proc')]);
  newPatient();return t});
 r4.forEach(([m,v])=>ok(v,m));

 console.log('5. Context changes recompute and drop stale answers');
 const r5=await E(page,()=>{newPatient();S.asmt=['glp1','doac'];const t=[];
  Object.assign(S.pf,{anes:'sed',glpEsc:'n',glpGi:'y'});prune();t.push(['GLP-1 + GI symptoms under sedation → defer',fPlan(FX.glp1).d==='defer']);
  S.pf.anes='la';prune();t.push(['Switch to local → GI answer dropped',S.pf.glpGi===undefined&&S.pf.glpEsc===undefined]);t.push(['…and plan recomputed (no deferral)',fPlan(FX.glp1).d!=='defer']);
  S.pf.anes='sed';prune();t.push(['Back to sedation → asked again, not remembered',S.pf.glpGi===undefined&&fPlan(FX.glp1).d==='investigate']);
  Object.assign(S.pf,{doacAg:'riv',proc:'high',ap:'n'});prune();t.push(['Rivaroxaban, higher risk → continue without interruption, labeled author’s practice',/without interruption/.test(fPlan(FX.doac).act)&&fPlan(FX.doac).basis==='au']);
  S.pf.proc='low';prune();t.push(['Low risk → continue without interruption',/Continue without interruption/.test(fPlan(FX.doac).act)]);
  newPatient();return t});
 r5.forEach(([m,v])=>ok(v,m));
 // UI: changing context in the assessment view updates the finding rows
 await E(page,()=>{newPatient();S.asmt=['doac'];S.pf.doacAg='api';S.pf.ap='n';S.ctxOpen=true;asmtView()});
 await page.click('[data-pf="proc"][data-pv="high"]');ok(/author’s practice/i.test(await page.locator('#arest').innerText()),'Assessment: choosing higher-risk procedure updates the DOAC row');
 await page.click('[data-pf="proc"][data-pv="low"]');ok(/Continue without interruption/i.test(await page.locator('#arest').innerText()),'Assessment: switching back updates it again');

 console.log('6. Combined findings expose supported conflicts and unresolved issues');
 const r6=await E(page,()=>{newPatient();S.asmt=['doac','antiplatelet','renal'];Object.assign(S.pf,{proc:'high',doacAg:'api',apReg:'asp',dial:'no',esrd:'n',ap:'y'});const m=asmtModel();newPatient();
  return{conf:m.conf.map(c=>c.t),worst:m.od,miss:m.miss}});
 ok(r6.conf.some(t=>/Anticoagulant \+ antiplatelet/.test(t)),'Conflict: anticoagulant + antiplatelet');
 ok(r6.conf.some(t=>/avoid NSAIDs/.test(t)),'Conflict: NSAID analgesia vs antithrombotic/kidney');
 ok(r6.conf.some(t=>/another bleeding risk/.test(t)),'Overlap: antithrombotic + renal impairment');
 ok(r6.worst==='investigate','Overall = most restrictive (verify first)');
 const r6d=await E(page,()=>{newPatient();S.asmt=['doac','antiplatelet'];Object.assign(S.pf,{proc:'low',doacAg:'api',apReg:'asp',ap:'n'});const m=asmtModel();newPatient();return{od:m.od,c:m.conf.map(c=>c.t)}});
 ok(r6d.od==='investigate'&&r6d.c.some(t=>/reconcile/.test(t)),'Contradictory entries (antiplatelet listed vs “no antiplatelet”) flagged and overall raised');
 const r6b=await E(page,()=>{newPatient();S.asmt=['glp1'];S.pf.anes='la';const m=asmtModel();newPatient();return m.conf.length});ok(r6b===0,'No invented conflicts for a single finding');
 const r6c=await E(page,()=>{newPatient();S.asmt=['doac','glp1'];const m=asmtModel();newPatient();return{miss:m.miss,prov:m.prov}});ok(r6c.prov&&r6c.miss.length>=2,'Unresolved items listed when context is missing');
 // copy text is de-identified and complete
 const txt=await E(page,()=>{newPatient();S.asmt=['doac'];Object.assign(S.pf,{age:'67',proc:'high',doacAg:'api',ap:'n'});const t=asmtText();newPatient();return t});
 ok(/age: 67 y|Age: 67 y/.test(txt)&&/DOAC/.test(txt)&&!/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(txt),'Copied note has context and findings, no dates');

 console.log('7. New patient clears all patient-specific state');
 await E(page,()=>{newPatient();S.lang='es';S.site='bayside';S.asmt=['doac'];S.pf={proc:'high',age:'70',doacAg:'api'};S.ans={preop:{a:false,b:true}};S.inp={preop:{sbTouched:true,sb_s:true}};S.wt=80;S.rcri={0:true};S.asa='3';S.q='eliquis';loadTri('CT1;preop:a0,b1;asa:3;sb:4');home()});
 ok(await page.locator('#abar:not([hidden])').count()===1,'Bottom bar visible once patient data exists');
 await page.click('#abar [data-newpt]');ok(/Tap again/.test(await page.locator('#abar .np').innerText()),'New patient asks for a second tap');
 await page.click('#abar [data-newpt]');
 const st=await E(page,()=>({pf:Object.keys(S.pf).length,asmt:S.asmt.length,ans:Object.keys(S.ans).length,inp:Object.keys(S.inp).length,tri:!!S.tri,wt:S.wt,rcri:Object.keys(S.rcri).length,asa:S.asa,q:S.q,lang:S.lang,site:S.site,has:hasPatient(),qval:document.getElementById('in-q').value,ls:Object.keys(localStorage),ss:Object.keys(sessionStorage),hash:location.hash}));
 ok(!st.pf&&!st.asmt&&!st.ans&&!st.inp&&!st.tri&&!st.wt&&!st.rcri&&!st.asa&&!st.q&&!st.has&&st.qval==='','All patient-specific state cleared '+JSON.stringify(st));
 ok(st.lang==='es'&&st.site==='bayside','Non-clinical preferences kept (language, site)');
 ok(st.ls.length===1&&st.ls[0]==='omsCompassAck'&&st.ss.length===0,'Storage holds only the disclaimer acknowledgement');
 ok(await page.locator('#abar[hidden]').count()===1,'Bottom bar hides after clearing');

 console.log('7b. No clinical data in URLs');
 await page.close();page=await ctx.newPage();await page.route(/^https?:\/\//,r=>r.abort());await page.goto(FILE+'#triage=CT1;preop:a0,b1;asa:3');await page.waitForSelector('.bar');
 const t7=await E(page,()=>({hash:location.hash,tri:!!S.tri,err:S.triErr}));
 ok(!/triage|CT1/i.test(t7.hash)&&!t7.tri&&/no longer carry data/.test(t7.err),'Old triage link is wiped unread and explains paste-only');
 await page.fill('#in-tri','CT1;preop:a0,b1;asa:3;sb:4');await page.click('[data-triload]');
 ok(await E(page,()=>!!S.tri&&!/CT1|triage/i.test(location.href)),'Pasted triage code loads without touching the URL');
 await E(page,()=>{newPatient();openFind('doac','Eliquis');S.pf.proc='high'});ok(await E(page,()=>!/eliquis|doac|high/i.test(location.href)),'Finding view keeps the URL clean');

 console.log('8. Existing modules, SOS, calculators, references, handouts');
 page=await fresh(ctx);
 const r8=await E(page,()=>{const bad=[];for(const m of MODS){try{open(m.id);if(!document.getElementById('flow').innerHTML)bad.push(m.id)}catch(e){bad.push(m.id+':'+e.message)}}
  for(const v of ['emergency','calc','ref','handouts','new']){try{view(v);if(!document.getElementById('vbody').innerHTML.length)bad.push(v)}catch(e){bad.push(v+':'+e.message)}}return{n:MODS.length,bad}});
 ok(r8.bad.length===0&&r8.n===36,`All ${r8.n} modules and 5 tabs render (bad: ${r8.bad})`);
 await E(page,()=>home());await page.fill('#in-q','Dantrium');ok(await page.locator('#hits [data-em]').count()>0,'Search still reaches SOS (Dantrium)');
 await page.fill('#in-q','avulsion');ok(await page.locator('#hits [data-open="dentotrauma"]').count()>0,'Search still reaches modules (avulsion)');
 await page.fill('#in-q','laceration');ok(await page.locator('#hits [data-open="lac"]').count()>0,'Search reaches facial laceration');
 await page.fill('#in-q','tooth removal');ok(await page.locator('#hits [data-ho]').count()>0,'Search still reaches handouts');

 console.log('9. Basis, assumptions and review status shown');
 await E(page,()=>{newPatient();open('preop')});for(const [id,v] of [['a',0],['b',0],['c',0],['d',0],['d2',0],['e',0]])await page.click(`.cur [data-a="${id}"][data-v="${v}"]`);
 const plan=await page.locator('.plan').innerText();
 ok(/Screen result · not a clearance/i.test(plan)&&/Not covered by this screen/.test(plan),'Short screen labelled “not a clearance” with what it did not cover');
 ok(await page.locator('.plan .bas').count()===1&&await page.locator('.plan .rev').count()===1,'Module plan shows basis chip and review line');
 await E(page,()=>{open('sed');S.ans.sed={a:false,b:true,c:false,d:true,e:false};refresh()});ok(/Author’s practice|Unverified draft/i.test(await page.locator('#flow').innerText()),'Personal sedation note labelled author’s practice / unverified');
 await E(page,()=>{newPatient();openFind('doac','Eliquis')});
 ok(await page.locator('#ftop .bas').count()===1,'Finding shows a basis chip');ok(/Provisional action/i.test(await page.locator('#ftop').innerText()),'Finding with missing context says “Provisional”');
 ok(/Missing: Planned procedure/.test(await page.locator('#ftop').innerText()),'Finding lists what it depends on');
 await page.click('#fwhy summary');ok(/Checked: 2026-10-23/.test(await page.locator('#fwhy').innerText())&&/clinician review not recorded/.test(await page.locator('#fwhy').innerText()),'Why shows source check date and honest review status');

 console.log('10. Phone controls with the keyboard open');
 await E(page,()=>{newPatient();S.asmt=['warfarin'];openFind('warfarin','warfarin')});
 ok(await page.locator('#abar:not([hidden])').count()===1,'Bar visible before typing');
 await page.click('[data-pf="proc"][data-pv="low"]');await page.click('#pf-inr');
 ok(await E(page,()=>document.body.classList.contains('kb')&&getComputedStyle(document.getElementById('abar')).display==='none'),'Bottom bar hides while a field has focus (keyboard open)');
 const tgt=await E(page,()=>[...document.querySelectorAll('.chips .tg,.abtn,.gobtn,.icon-btn')].filter(b=>b.offsetParent).map(b=>b.getBoundingClientRect().height).filter(h=>h<44).length);
 ok(tgt===0,'All finding/assessment controls ≥44 px tall');
 const ov=await E(page,()=>document.documentElement.scrollWidth<=window.innerWidth+1);ok(ov,'No horizontal scroll at phone width');

 console.log('11. v3.1 medical gate, on-call switch, intraop checklist');
 await E(page,()=>{newPatient();open('extraction')});
 ok(await page.locator('.mgate.g-none').count()===1,'Gate shows "not run" before pre-op answers');
 ok(await page.locator('.mgate [data-open="preop"]').count()===1,'Gate links to Pre-op clearance');
 ok(await E(page,()=>{open('preop');return true})&&await page.locator('.mgate').count()===0,'No gate on Pre-op clearance itself');
 const g=await E(page,()=>{const t=a=>{S.ans.preop=a;return gateModel().tone};
  return{red:t({a:true}),amberHit:t({a:false,b:false,c:true,d:false,d2:false,e:false}),unk:t({a:false,b:'u'}),inc:t({a:false}),ok:t({a:false,b:false,c:false,d:false,d2:false,e:false})}});
 ok(g.red==='def','Unstable condition → red gate');ok(g.amberHit==='mod','Antithrombotic → amber gate');
 ok(g.unk==='mod','Unknown on pre-op → amber (never green)');ok(g.inc==='mod','Incomplete pre-op → amber (never green)');ok(g.ok==='ok','Completed clean screen → green');
 await E(page,()=>{S.ans.preop={a:false,b:false,c:false,d:false,d2:false,e:false};open('implant')});
 ok(/not a clearance/.test(await page.locator('.mgate').innerText()),'Green gate says "not a clearance"');
 await E(page,()=>{newPatient();setOnCall(false);home()});
 ok(await page.locator('#groups [data-open="trauma"]').count()===0&&await page.locator('#groups [data-open="mandfx"]').count()===0,'On-call off hides trauma triage and mandible fracture');
 ok(await page.locator('#groups [data-open="lac"]').count()===0,'On-call off hides facial laceration');
 ok(await page.locator('#groups [data-open="dentotrauma"]').count()===1&&await page.locator('#groups [data-open="infection"]').count()===1,'On-call off keeps dentoalveolar trauma and infection');
 await openSet(page);await page.click('[data-oncall]');
 ok(await page.locator('[data-oncall][aria-checked="true"]').count()===1,'On-call switch turns on');
 ok(await E(page,()=>document.querySelector('#groups .lab.group').textContent==='Hospital on-call'),'On-call group listed first');
 ok(await E(page,()=>{const g=[...document.querySelectorAll('#groups .lab.group')].find(x=>x.textContent==='Hospital on-call');return !!g&&!!g.nextElementSibling.querySelector('[data-open="lac"]')}),'On-call on: facial laceration listed under Hospital on-call');
 ok(await page.locator('#groups [data-open]').count()===await E(page,()=>MODS.length),'On-call on: every module listed exactly once');
 ok(await E(page,()=>localStorage.getItem('omsCompassOnCall')==='1'),'On-call preference remembered');
 await E(page,()=>{delete S.oc;home()});/* re-read from storage (file:// reloads in headless Chromium can drop unflushed storage) */
 ok(await page.locator('[data-oncall][aria-checked="true"]').count()===1,'On-call preference re-read from storage');
 await openSet(page);await page.click('[data-oncall]');
 await E(page,()=>open('extraction'));
 ok(await page.locator('#abar:not([hidden]) [data-ioopen]').count()===1,'Intraop button in bottom bar inside a module');
 await page.click('#abar [data-ioopen]');
 ok(await page.locator('.atabs [data-atab="io"].on').count()===1&&await page.locator('.ioi').count()>15,'Drawer opens on the Intraop checklist tab');
 await page.click('[data-io="cnt"]');
 ok(await page.locator('[data-io="cnt"][aria-checked="true"]').count()===1,'Checklist item toggles');
 await page.click('[data-atab="find"]');ok(await page.locator('#arest').count()===1,'Findings tab still shows the assessment');
 await page.click('[data-atab="io"]');ok(await page.locator('[data-io="cnt"][aria-checked="true"]').count()===1,'Checklist state kept across tabs');
 await E(page,()=>newPatient());ok(await E(page,()=>!Object.values(S.io||{}).some(Boolean)),'New patient clears the checklist');
 ok(await E(page,()=>!Object.keys(localStorage).some(k=>/io|asmt|ans/i.test(k)&&k!=='omsCompassOnCall'&&k!=='omsCompassAck')),'Checklist not written to device storage');
 await E(page,()=>{S.atab='io';asmtView()});
 const t2=await E(page,()=>[...document.querySelectorAll('.ioi,.atabs button,.abtn')].filter(b=>b.offsetParent).map(b=>b.getBoundingClientRect().height).filter(h=>h<44).length);
 ok(t2===0,'Checklist controls ≥44 px tall');
 ok(await E(page,()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Checklist: no horizontal scroll');

 console.log('11b. Photo triage works without the author’s skill');
 const tp=await E(page,()=>({p:TRIAGE_PROMPT,ok:['preop','sed'].every(m=>TRI_STEPS[m].every(([k])=>M(m).nodes[k]&&M(m).nodes[k].q)),url:('https://claude.ai/new?q='+encodeURIComponent(TRIAGE_PROMPT)).length}));
 ok(tp.ok,'Every step id in the prompt is a real question in Pre-op clearance / Office sedation');
 ok(/If you have a pre-op triage skill, use it; otherwise/.test(tp.p)&&/CT1;preop:<answers>/.test(tp.p)&&/Never repeat a name/.test(tp.p)&&/never assume it is normal/.test(tp.p),'Prompt is self-contained: output format, de-identification, unknown ≠ normal');
 ok(tp.url<8000,'Hand-off link stays under 8,000 characters ('+tp.url+')');
 const rep='**Red flags:** apixaban; prosthetic aortic valve.\nASA III.\n\n```\nCT1;preop:a0,b1,c1,d0,d20,e1,f1,g0;sed:a0,b1,c1;asa:3;sb:4\n```\nAdvisory only — not a clearance.';
 const pr=await E(page,r=>{const t=parseTri(r);return{err:t.err||'',asa:t.asa,sb:t.sb,b:t.mods&&t.mods.preop&&t.mods.preop.b,d2:t.mods&&t.mods.preop&&t.mods.preop.d2,sb3:t.mods&&t.mods.sed&&t.mods.sed.c}},rep);
 ok(!pr.err&&pr.asa===3&&pr.sb===4&&pr.b===true&&pr.d2===false&&pr.sb3===true,'A whole pasted report (code in a code block) loads correctly');
 ok(/nothing could be read/.test(await E(page,()=>parseTri('Report… CT1;none').err)),'CT1;none explains that nothing was readable');
 await E(page,()=>{newPatient();open('preop')});await page.fill('#in-tri',rep);await page.click('[data-triload]');
 ok(await E(page,()=>!!S.tri&&S.tri.asa===3),'Report pasted into the box loads through the UI');
 await E(page,()=>newPatient());

 console.log('12. v3.3 quality gate');
 // Gate 1: pediatric safety
 await E(page,()=>{newPatient();view('calc')});
 await page.fill('#in-wt','70');ok(await page.locator('.ctab td:text("Precedex")').count()===1,'Adult: Precedex row shown on Calc');
 await page.click('#in-age');await page.keyboard.type('10');
 ok(await page.locator('#plock').count()===1&&/PEDIATRIC LOCKOUT \(<12 YO \/ <40 KG\)/.test(await page.locator('#plock').innerText()),'Age 10: lockout card shown');
 const calcTxt=await page.locator('#vbody').innerText();
 ok(!/Precedex|Ketamine|Midazolam|Propofol|Glycopyrrolate/.test(calcTxt.replace(/Adult non-pump IV sedation protocol[^.]*\./,'')),'Age 10: no adult sedation drug rows on Calc');
 ok(await E(page,()=>document.activeElement&&document.activeElement.id==='in-age'),'Typing age keeps the field focused');
 ok(/300 mg \(cap\)\s+8\.8\b/.test(calcTxt)&&/AAPD/.test(calcTxt),'Age 10: LA maximum uses AAPD mg/kg and the AAPD 300 mg cap (lidocaine 300 mg = 8.8 carps at 70 kg)');
 ok(/110 mL\/h/.test(await page.locator('#mfluid').textContent()),'Age 10: 4-2-1 fluids still calculated');
 await page.click('[data-view="emergency"]');ok(await page.locator('#peds-sos').count()===1&&await page.locator('details.em').count()===await E(page,()=>EMS.length),'Age 10: SOS active with pediatric banner');
 ok(/0\.5 mg/.test(await E(page,()=>EMS.find(e=>e.id==='anaph').steps().join(' '))),'SOS anaphylaxis repeat dose scales (0.01 mg/kg, max 0.5)');
 await E(page,()=>open('sed'));ok(await page.locator('#plock').count()===1&&await page.locator('.cur').count()===0,'Age 10: Office sedation screen locked out');
 const lk=await E(page,()=>{const r=[];newPatient();S.wt=35;r.push(pedsLock());S.pf.age='14';r.push(pedsLock());delete S.pf.age;S.wt=45;r.push(pedsLock());S.pf.age='11';r.push(pedsLock());newPatient();return r});
 ok(JSON.stringify(lk)==='[true,false,false,true]','Lockout trigger: no age & <40 kg → on; age 14 → off; 45 kg → off; age 11 → on');
 // Gate 2: lb → kg sync
 await E(page,()=>{newPatient();view('calc')});await page.click('#in-lb');await page.keyboard.type('154');
 const w2=await E(page,()=>S.wt);ok(w2===69.9,'154 lb → 69.9 kg (lb ÷ 2.20462, 1 decimal) got '+w2);
 ok(await E(page,()=>document.getElementById('in-wt').value==='69.9'&&document.activeElement.id==='in-lb'),'Calc kg field fills while lb keeps focus');
 ok(/69\.9 kg \(154 lb\)/.test(await page.locator('#wtx').innerText()),'Both units displayed');
 await page.click('[data-view="emergency"]');ok(await E(page,()=>document.getElementById('in-wt').value==='69.9'),'SOS shows the same weight');
 await E(page,()=>{S.ctxOpen=true;S.atab='find';asmtView()});ok(await E(page,()=>document.getElementById('in-wt2').value==='69.9'&&document.getElementById('in-lb2').value==='154'),'Assessment shows the same weight');
 await page.fill('#pf-age','45');await E(page,()=>view('calc'));ok(await E(page,()=>document.getElementById('in-age').value==='45'),'Age typed in the Assessment appears on Calc');
 await page.fill('#in-wt','80');ok(await E(page,()=>document.getElementById('in-lb').value==='176'),'kg → lb display (80 kg → 176 lb)');
 // Gate 3: colleague mode
 await E(page,()=>{newPatient();home()});await openSet(page);await page.click('[data-pm="colleague"]');
 ok(await E(page,()=>localStorage.getItem('oms_compass_practice_mode')==='colleague'),'Practice mode stored under oms_compass_practice_mode');
 await E(page,()=>{S.hoOpen='ext';view('handouts')});
 ok(await page.locator('[data-site]').count()===0&&/Oral & Maxillofacial Surgery — Patient Instructions/.test(await page.locator('#ho-neutral').textContent()),'Colleague: no Dr. Young/Bayside pills, neutral header');
 const ht=await E(page,()=>hoText(HO[0],'en'));ok(!/Young|Bayside|401|508|g\.page/.test(ht)&&/^Oral & Maxillofacial Surgery — Patient Instructions/.test(ht),'Colleague: shared handout has no practice name, phone or review link');
 await E(page,()=>view('calc'));ok(await page.locator('.audisc').count()>=1&&await E(page,()=>{const d=document.querySelector('.auhid');return d.hidden&&/Your sedation protocol/.test(d.textContent)}),'Colleague: Calc sedation protocol collapsed');
 await page.click('.audisc');ok(await E(page,()=>!document.querySelector('.auhid').hidden),'Disclosure opens the author protocol');
 await E(page,()=>{S.refq='socket shield';view('ref')});ok(await E(page,()=>{const d=document.querySelector('#vbody details.box .auhid');return!!d&&d.hidden}),'Colleague: author Ref card body collapsed');
 await E(page,()=>{newPatient();S.ans.sed={a:false,b:true,c:false,d:true,e:false};open('sed')});
 ok(await E(page,()=>{const h=[...document.querySelectorAll('.plan .auhid')];return h.length===1&&/Your card|Precedex/.test(h[0].textContent)&&!/Precedex/.test(document.querySelector('.plan').textContent.replace(h[0].textContent,''))}),'Colleague: author sedation note folded in the Decide plan');
 await E(page,()=>{setPmode('author');newPatient();S.ans.sed={a:false,b:true,c:false,d:true,e:false};open('sed')});
 ok(await page.locator('.plan .audisc').count()===0&&/Precedex/.test(await page.locator('.plan').innerText()),'Author mode: no disclosure, protocol visible');
 await E(page,()=>view('handouts'));ok(await page.locator('[data-site]').count()===2,'Author mode: Dr. Young / Bayside pills back');
 // Gate 4: EMR note
 const note=await E(page,()=>{newPatient();S.asmt=['doac','renal'];Object.assign(S.pf,{age:'72',proc:'high',doacAg:'api',ap:'n'});S.wt=70;S.ans.preop={a:false,b:false,c:true};const t=asmtText();newPatient();return t});
 const heads=['HISTORY:','FINDINGS & RISK:','ANESTHESIA & LIMITS:','PLAN & ALERTS:'],pos=heads.map(h=>note.indexOf('\n'+h));
 ok(pos.every(p=>p>0)&&pos.every((p,i)=>!i||p>pos[i-1]),'Note has the four headers in order');
 ok(/Lidocaine 2% \+ epi: 490 mg = 14\.4 carpules/.test(note)&&/Articaine 4% \+ epi: 490 mg = 7\.2 carpules/.test(note),'Note has calculated LA cartridge limits');
 ok(/ALERT - NSAID \/ anticoagulant conflict: avoid NSAIDs/.test(note),'Note has the NSAID–anticoagulant alert');
 ok(/Age: 72 y; Weight: 70 kg \(154 lb\)/.test(note)&&/Pre-op screen: /.test(note),'Note history has age, both weights and pre-op screen answers');
 ok(/^[\x09\x0a\x20-\x7e]*$/.test(note),'Note is plain ASCII (pastes cleanly into Dentrix/Epic)');
 ok(!/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(note),'Note has no dates');
 const kidNote=await E(page,()=>{newPatient();S.pf.age='9';S.wt=30;const t=asmtText();newPatient();return t});
 ok(/PEDIATRIC LOCKOUT/.test(kidNote)&&/Lidocaine 2% \+ epi: 132 mg = 3\.8 carpules/.test(kidNote)&&/Articaine 4% \+ epi: 210 mg/.test(kidNote),'Pediatric note: lockout line and AAPD-scaled LA (lidocaine 4.4 mg/kg)');
 await E(page,()=>{newPatient();S.pf.age='50';S.wt=70;S.atab='find';asmtView()});ok(await page.locator('[data-acopy]').count()===1,'Copy button available with context only (no findings)');
 // Gate 5: no regression + privacy
 await E(page,()=>{newPatient();S.pf.age='10';S.wt=30;S.wtIn={src:'lb',raw:'66'};home()});
 await page.click('#abar [data-newpt]');await page.click('#abar [data-newpt]');
 const st5=await E(page,()=>({wt:S.wt,wtIn:S.wtIn,age:S.pf.age,ls:Object.keys(localStorage).sort()}));
 ok(!st5.wt&&!st5.wtIn&&!st5.age,'New patient clears age, kg and lb');
 ok(st5.ls.every(k=>['omsCompassAck','omsCompassOnCall','oms_compass_practice_mode'].includes(k)),'Storage holds only device preferences '+st5.ls.join(','));
 await E(page,()=>view('calc'));const small=await E(page,()=>[...document.querySelectorAll('.pmode .tg,.wtbar input,.audisc,.toggles .tg')].filter(b=>b.offsetParent).map(b=>b.getBoundingClientRect().height).filter(h=>h<44).length);
 await E(page,()=>home());const small2=await E(page,()=>[...document.querySelectorAll('.pmode .tg')].filter(b=>b.offsetParent).map(b=>b.getBoundingClientRect().height).filter(h=>h<44).length);
 ok(small===0&&small2===0,'New controls ≥44 px tall');
 for(const v of ['calc','emergency','handouts','ref']){await E(page,v=>view(v),v);ok(await E(page,()=>document.documentElement.scrollWidth<=window.innerWidth+1),`${v}: no horizontal scroll`)}
 ok(await E(page,()=>new RegExp('DRAFT · v'+VER.replace(/\./g,'\\.')).test(document.querySelector('.top').textContent)),'Header shows DRAFT · current version');
 ok(await E(page,()=>{const o=document.getElementById('offl');return!!o&&o.hidden}),'Offline badge present, hidden until a service worker controls the page');

 console.log('13. v3.3.1 audit — reported defects, Unknown, units, boundaries, conflicts, modes, search, phone');
 await E(page,()=>{newPatient();setPmode('author')});
 // R1 pediatric SOS
 await E(page,()=>{S.pf.age='9';S.wt=30;view('emergency')});
 const sosTxt=await E(page,()=>{document.querySelectorAll('details.em').forEach(d=>d.open=true);return document.getElementById('vbody').innerText});
 ok(!/120–200 J|1 mg IV\/IO q3–5|amiodarone 300 mg|Aspirin 160–325|Nitroglycerin 0\.4|atropine 1 mg IV/i.test(sosTxt),'Age 9, 30 kg: no adult arrest doses, shock energies, aspirin, nitroglycerin or adult atropine on SOS');
 ok(/60 J/.test(sosTxt)&&/120 J/.test(sosTxt)&&/0\.3 mg IV\/IO/.test(sosTxt)&&/150 mg IV\/IO/.test(sosTxt),'Pediatric arrest: 2 J/kg = 60 J, 4 J/kg = 120 J, epinephrine 0.3 mg, amiodarone 150 mg at 30 kg');
 ok(/15:2/.test(sosTxt)&&/0\.5 mg IV\/IO|0\.5 mg\b/.test(sosTxt),'Pediatric CPR ratio and atropine capped at 0.5 mg (0.02 mg/kg = 0.6 → 0.5)');
 ok(/2 mg IV\/IO\/IM/.test(sosTxt)&&/flumazenil 0\.2 mg \(max\) IV over 15 s/.test(sosTxt),'Naloxone 2 mg (≥20 kg) and flumazenil 0.2 mg (cap) at 30 kg');
 ok(/1 mg IM/.test(sosTxt)&&/15–30 g/.test(sosTxt)&&/50 mg/.test(sosTxt),'Glucagon 1 mg (≥25 kg), dextrose 0.5–1 g/kg, hydrocortisone 50 mg (age 3–12)');
 ok((sosTxt.match(/adult card suppressed/g)||[]).length===3,'Chest pain, stroke and hypertensive crisis suppressed with pediatric referral guidance');
 ok(await E(page,()=>{S.pf.age='9';S.wt=null;rebody();return /Enter weight/.test(document.getElementById('peds-sos').textContent)&&/0\.01 mg\/kg/.test(PEDS.arrest.steps().join(' '))}),'Child, no weight: doses shown per kg with a prompt to enter weight');
 ok(await E(page,()=>{newPatient();S.pf.age='40';S.wt=80;return !sosKid()&&/120–200 J/.test(EMS[0].steps().join(' '))}),'Adult: adult algorithm unchanged');
 ok(await E(page,()=>{const r=[];newPatient();S.pf.age='15';S.wt=35;r.push(sosKid());S.wt=60;r.push(sosKid());delete S.pf.age;S.wt=38;r.push(sosKid());newPatient();return JSON.stringify(r)})==='[true,false,true]','SOS child rule: age 15/35 kg → child; age 15/60 kg → adult; no age/38 kg → child');
 // R2 LA age limits
 await E(page,()=>{newPatient();S.pf.age='9';S.wt=30;view('calc')});
 const laT=await page.locator('#vbody table.ctab').last().innerText();
 ok(/Bupivacaine[^\n]*\n?[^\n]*Not recommended under 12 y/.test(laT),'Age 9: bupivacaine blocked (label <12 y)');
 ok(/Articaine 4% \+ epi[\s\S]*210 mg/.test(laT),'Age 9: articaine allowed (≥4 y), 7 mg/kg');
 ok(await E(page,()=>{newPatient();S.pf.age='3';S.wt=15;const r=laRows(15,laKid());newPatient();return r.find(x=>/Articaine/.test(x.n)).blocked&&r.find(x=>/Bupi/.test(x.n)).blocked}),'Age 3: articaine and bupivacaine blocked');
 ok(await E(page,()=>{newPatient();S.pf.age='12';S.wt=45;const r=laRows(45,laKid());newPatient();return !r.find(x=>/Bupi/.test(x.n)).blocked}),'Age 12 boundary: bupivacaine allowed');
 ok(await E(page,()=>{newPatient();S.wt=30;const r=laRows(30,laKid());newPatient();return r.find(x=>/Bupi/.test(x.n)).ageQ}),'No age, 30 kg: bupivacaine row asks for age');
 ok(await E(page,()=>{newPatient();S.pf.age='9';S.wt=30;const t=asmtText();newPatient();return /Bupivacaine 0\.5% \+ epi: NOT RECOMMENDED under 12 y/.test(t)}),'Note marks bupivacaine not recommended at age 9');
 // R3 A1c / R4 steroids
 const cl=await E(page,()=>{const P=(id,pf)=>{newPatient();Object.assign(S.pf,pf);S.fid=id;prune();return fPlan(FX[id])};const o={};
  o.a1c85=P('a1c',{a1c:'8.5',a1cU:'pct',a1cAge:'r3',urg:'el'});o.a1c64=P('a1c',{a1c:'64',a1cU:'mmol',a1cAge:'r3',urg:'el'});o.a1c63=P('a1c',{a1c:'63',a1cU:'mmol',a1cAge:'r3',urg:'el'});o.a1cNoU=P('a1c',{a1c:'9',a1cAge:'r3',urg:'el'});o.a1cU=P('a1c',{a1c:'u',a1cAge:'r3',urg:'el'});
  o.stLow=P('steroid',{anes:'la',proc:'low',stAI:'n',stRisk:'n',stUnwell:'n'});o.stRisk=P('steroid',{anes:'la',proc:'low',stAI:'n',stRisk:'y',stRec:'n',stUnwell:'n'});o.stGA=P('steroid',{anes:'ga',proc:'high',stAI:'n',stRisk:'y',stRec:'n',stUnwell:'n'});o.stUnk=P('steroid',{anes:'la',proc:'low',stAI:'n',stRisk:'u',stUnwell:'n'});o.stAI=P('steroid',{anes:'la',proc:'low',stAI:'y',stUnwell:'n'});o.stRec=P('steroid',{anes:'la',proc:'low',stAI:'n',stRisk:'y',stRec:'y',stUnwell:'n'});
  newPatient();o.dmStart=M('dm').start;o.dmNoA1cGate=!JSON.stringify(M('dm').nodes).includes('A1C >8% (within 3 months)?');return o});
 ok(cl.a1c85.d!=='defer'&&/Not a stand-alone/.test(cl.a1c85.act),'A1C 8.5% elective: not deferred on A1C alone');
 ok(/≥8%/.test(cl.a1c64.act)&&!/≥8%/.test(cl.a1c63.act),'64 mmol/mol (8.006%, unrounded) counts as ≥8%; 63 does not');
 ok(cl.a1cNoU.d==='investigate'&&cl.a1cNoU.prov,'A1C without a unit is not interpreted');
 ok(cl.a1cU.d==='investigate'&&/not assumed normal/.test(cl.a1cU.act),'A1C Unknown is not assumed normal');
 ok(cl.dmStart==='nA1c'&&cl.dmNoA1cGate,'Diabetes module: A1C is context, not a yes/no gate');
 ok(cl.stLow.d==='proceed'&&cl.stRisk.d==='modify'&&/oral/.test(cl.stRisk.act)&&/parenteral/.test(cl.stGA.act),'Steroids: low risk → usual dose; at risk under local → oral cover; GA → parenteral');
 ok(cl.stUnk.d==='modify'&&/treat as at risk/.test(cl.stUnk.act)&&cl.stUnk.prov,'Steroids: unknown history treated as at risk, provisional');
 ok(/Adrenal insufficiency/.test(cl.stAI.act)&&cl.stRec.d==='proceed','Known AI → cover; documented recovery → usual dose');
 ok(await E(page,()=>{newPatient();S.ans.steroid={a:false,b:'u'};const w=walk(M('steroid'));newPatient();return !!w.unk&&!w.out}),'Steroid module: Unknown risk halts (never “no cover”)');
 // R5 labs
 const lb=await E(page,()=>{const P=(id,pf)=>{newPatient();Object.assign(S.pf,pf);S.fid=id;prune();return fPlan(FX[id])};const o={};
  o.inr18=P('warfarin',{proc:'low',inr:'18',inrAge:'d1',ap:'n'});o.inr10=P('warfarin',{proc:'low',inr:'10',inrAge:'d1',ap:'n'});o.inrU=P('warfarin',{proc:'low',inr:'u',inrAge:'d1',ap:'n'});o.inrBad=P('warfarin',{proc:'low',inr:'abc',inrAge:'d1',ap:'n'});
  o.inrLab7=P('inr',{proc:'low',inr:'7',inrOn:'none'});o.inrLabU=P('inr',{proc:'low',inr:'u',inrOn:'none'});
  o.plt304=P('plt',{proc:'low',plt:'30.4',pltU:'k',pltAge:'wk',pltTrend:'st',pltCause:'itp'});o.plt30=P('plt',{proc:'low',plt:'30',pltU:'k',pltAge:'wk',pltTrend:'st',pltCause:'itp'});o.pltNoU=P('plt',{proc:'high',plt:'45',pltAge:'wk',pltTrend:'st',pltCause:'itp'});o.pltU=P('plt',{proc:'high',plt:'u',pltAge:'wk',pltTrend:'st',pltCause:'itp'});
  newPatient();return o});
 ok(lb.inr18.d==='refer'&&/possibly real/.test(lb.inr18.act)&&lb.inr18.prov,'INR 18: possibly real, urgent verification, no surgery');
 ok(lb.inr10.d==='refer','INR 10 boundary → urgent verification');
 ok(lb.inrU.d==='investigate'&&/not assumed/.test(lb.inrU.act),'INR Unknown → verify, not normal');
 ok(lb.inrBad.d==='investigate'&&/not a usable number/.test(lb.inrBad.act),'Non-numeric INR flagged as entry error');
 ok(lb.inrLab7.d==='refer'&&lb.inrLabU.d==='investigate','INR lab card: 7 off warfarin → urgent; Unknown → verify');
 ok(lb.plt304.d==='modify'&&lb.plt30.d==='refer','Platelets compared unrounded: 30.4 above 30 for simple extraction; 30.0 at threshold → refer');
 ok(lb.pltNoU.d==='investigate'&&/unit/i.test(lb.pltNoU.act)&&lb.pltU.d==='investigate','Platelets: no unit → not interpreted; Unknown → verify');
 await E(page,()=>{newPatient();openFind('plt','platelets')});
 ok(await page.locator('#pf-pltU option[value=""]').count()===1&&await E(page,()=>document.getElementById('pf-pltU').value==='')&&await page.locator('[data-pf="plt"][data-pv="u"]').count()===1,'Numeric field: unit starts unset and Unknown button offered');
 await page.click('[data-pf="plt"][data-pv="u"]');ok(await E(page,()=>S.pf.plt==='u'&&document.getElementById('pf-plt').placeholder==='unknown'),'Tapping Unknown sets the value to Unknown');
 await page.fill('#pf-plt','40');ok(await E(page,()=>S.pf.plt==='40'),'Typing a value replaces Unknown');
 // R7 combined assessment
 const ca=await E(page,()=>{const o={};newPatient();S.asmt=['doac','renal'];Object.assign(S.pf,{proc:'high',doacAg:'api',ap:'n',dial:'hd'});let m=asmtModel();o.dr={od:m.od,prov:m.prov,miss:m.miss.some(x=>/^Resolve conflict/.test(x))};
  newPatient();S.asmt=['glp1','sglt2'];Object.assign(S.pf,{anes:'sed',glpGi:'n',glpEsc:'n'});m=asmtModel();o.gs=m.od;
  newPatient();S.asmt=['doac','renal'];Object.assign(S.pf,{proc:'high',doacAg:'api',ap:'n',dial:'hd'});S.wt=70;const t=asmtText();o.note={unres:/UNRESOLVED - Resolve conflict/.test(t),steps:/Local hemostatic bundle/.test(t),esc:/Escalate if/.test(t)};
  newPatient();S.asmt=['doac'];Object.assign(S.pf,{proc:'high',doacAg:'api',ap:'n'});m=asmtModel();o.single={od:m.od,res:m.miss.some(x=>/^Resolve/.test(x))};newPatient();return o});
 ok(ca.dr.od==='investigate'&&ca.dr.prov&&ca.dr.miss,'Antithrombotic + renal: overall raised to Verify first, conflict listed as unresolved');
 ok(await E(page,(od)=>DRANK[od]>=DRANK.modify,ca.gs),'GLP-1 + SGLT2 under sedation raises at least to Proceed with changes');
 ok(ca.note.unres&&ca.note.steps&&ca.note.esc,'Note carries unresolved conflicts, essential steps and escalation');
 ok(ca.single.od!=='investigate'&&!ca.single.res,'Single finding: no invented conflict');
 await E(page,()=>{newPatient();S.asmt=['doac','renal'];Object.assign(S.pf,{proc:'high',doacAg:'api',ap:'n',dial:'hd'});S.atab='find';asmtView()});
 const asTxt=await page.locator('#arest').innerText();
 ok(/hemostatic bundle/i.test(asTxt)&&/Follow-up \/ escalat(e if|ion)/i.test(asTxt)&&/Resolve conflict/i.test(asTxt),'Assessment screen shows steps, follow-up/escalation and the unresolved conflict');
 await page.click('[data-pf="proc"][data-pv="low"]');const cc=await E(page,()=>{const m=asmtModel();return{od:m.od,doac:fPlan(FX.doac).act,res:m.miss.some(x=>/^Resolve conflict/.test(x))}});
 ok(/Continue without interruption/.test(cc.doac)&&cc.od==='investigate'&&cc.res,'Context change (procedure → low) recomputes the DOAC plan; the renal conflict stays unresolved');
 // R8 practice modes
 const pm=await E(page,()=>{const P=(id,pf)=>{newPatient();Object.assign(S.pf,pf);S.fid=id;prune();return fPlan(FX[id])};const o={};
  setPmode('author');o.aw=P('warfarin',{proc:'high',inr:'3.7',inrAge:'d1',ap:'n'});o.aw33=P('warfarin',{proc:'high',inr:'3.3',inrAge:'d1',ap:'n'});o.ad=P('doac',{proc:'high',doacAg:'api',ap:'n'});o.preopA=M('preop').nodes.nBleed.x;
  setPmode('colleague');o.cw=P('warfarin',{proc:'high',inr:'3.7',inrAge:'d1',ap:'n'});o.cd=P('doac',{proc:'high',doacAg:'api',ap:'n'});o.cdq=(()=>{newPatient();Object.assign(S.pf,{proc:'high',doacAg:'riv'});S.fid='doac';return fQs(FX.doac).map(q=>q.k)})();o.preopC=M('preop').nodes.nBleed.x;
  newPatient();S.asmt=['doac'];Object.assign(S.pf,{proc:'high',doacAg:'api',ap:'n'});o.noteC=asmtText();
  setPmode('author');newPatient();S.asmt=['doac'];Object.assign(S.pf,{proc:'high',doacAg:'api',ap:'n'});o.noteA=asmtText();newPatient();return o});
 ok(pm.aw.d==='defer'&&pm.aw.author==='inr'&&pm.aw.basis==='au','Author: INR 3.7 → defer under author threshold 3.5, labeled author');
 ok(pm.aw33.author==='inr','Author: INR 3.3 (between 3 and 4) shows the author-protocol box');
 ok(pm.ad.author==='doac'&&/without interruption/.test(pm.ad.act),'Author: DOAC uninterrupted, labeled author');
 ok(pm.cw.d==='modify'&&!pm.cw.author&&pm.cd.act&&/skip the morning dose/.test(pm.cd.act)&&!pm.cd.author,'Colleague: SDCEP rules applied (INR 3.7 proceeds; DOAC one-dose retiming)');
 ok(pm.cdq.includes('doacTime'),'Colleague: once-daily DOAC asks dose time');
 ok(/<3\.5 \(author’s protocol/.test(pm.preopA)&&/<4 \(SDCEP\)/.test(pm.preopC),'Pre-op antithrombotic note follows the mode');
 ok(/Practice mode: Colleague/.test(pm.noteC)&&/Practice mode: Author/.test(pm.noteA)&&/Author protocol applied: DOACs/.test(pm.noteA)&&/Guidance instead/.test(pm.noteA),'Note records the mode and any author protocol with the guideline difference');
 await E(page,()=>{newPatient();S.pf.proc='high';S.pf.doacAg='api';S.pf.ap='n';openFind('doac','Eliquis')});
 ok(/Author’s protocol · differs from guidance/i.test(await page.locator('#ftop').innerText())&&/Applies to/.test(await page.locator('#ftop').innerText()),'Finding shows applicability and difference from guidance');
 await E(page,()=>home());await openSet(page);ok(await page.locator('[data-pm="author"]').innerText()==='Author','Mode label reads “Author”');
 ok(/guideline rules where a guideline exists/i.test(await E(page,()=>{setPmode('colleague');home();const t=document.getElementById('pmdesc').textContent;setPmode('author');return t})),'Colleague description states what changes');
 // R9 search
 await E(page,()=>{newPatient();S.pf.doacAg='api';openFind('doac','Xarelto')});
 ok(await E(page,()=>S.pf.doacAg==='api'&&!!S.lkc.doacAg)&&await page.locator('.lkc').count()===1,'Xarelto after apixaban: choice kept, conflict flagged');
 ok(await E(page,()=>{const p=fPlan(FX.doac);return p.prov&&p.d==='investigate'}),'Finding with a lookup conflict is provisional and Verify first');
 ok(await E(page,()=>{S.asmt=['doac'];const m=asmtModel();return m.od==='investigate'&&m.miss.some(x=>/Lookup conflict/.test(x))}),'Lookup conflict raises the assessment and stays unresolved');
 await page.click('[data-lkuse="doacAg"]');ok(await E(page,()=>S.pf.doacAg==='riv'&&!S.lkc.doacAg)&&await page.locator('.lkc').count()===0,'Resolving the conflict switches to rivaroxaban and clears it');
 for(const t of ['ASA','asa 81','Ecotrin','acetylsalicylic acid','Bayer aspirin'])ok(await E(page,t=>findHits(t)[0]&&findHits(t)[0].f.id==='antiplatelet',t),`“${t}” → antiplatelet`);
 ok(await E(page,()=>{newPatient();openFind('antiplatelet','ASA');const v=S.pf.apReg;newPatient();return v==='asp'}),'ASA preset = aspirin alone');
 // R10 add button near recommendation
 await E(page,()=>{newPatient();openFind('doac','Eliquis')});
 const gap=await E(page,()=>Math.round(document.querySelector('[data-addf]').getBoundingClientRect().top-document.querySelector('.disp').getBoundingClientRect().bottom));
 ok(gap>=0&&gap<40&&await E(page,()=>document.querySelector('[data-addf]').getBoundingClientRect().bottom<window.innerHeight),'Add to assessment sits right under the recommendation, on the first screen');
 await page.click('[data-addf]');ok(await E(page,()=>S.asmt.includes('doac'))&&/In assessment/.test(await page.locator('[data-addf]').innerText()),'Add button works from its new place');
 // reset & phone
 await E(page,()=>{newPatient();S.pf.doacAg='api';openFind('doac','Xarelto');S.pf.plt='u'});await E(page,()=>home());
 await page.click('#abar [data-newpt]');await page.click('#abar [data-newpt]');
 ok(await E(page,()=>!S.lkc&&!Object.keys(S.pf).length&&!hasPatient()),'New patient clears lookup conflicts and Unknown lab values');
 for(const v of ['emergency','calc']){await E(page,v=>{S.pf.age='9';S.wt=30;view(v)},v);ok(await E(page,()=>document.documentElement.scrollWidth<=window.innerWidth+1),`${v} (child): no horizontal scroll`)}
 await E(page,()=>{newPatient();openFind('plt','platelets')});
 ok(await E(page,()=>[...document.querySelectorAll('#fdyn button,#fdyn select,#fdyn input')].filter(b=>b.offsetParent).map(b=>b.getBoundingClientRect().height).filter(h=>h<44).length===0),'Finding controls ≥44 px (incl. Unknown, unit select, Add button)');
 await E(page,()=>newPatient());

 console.log('14. v3.3.3 audit fixes — doses, findings, home and SOS');
 page=await fresh(ctx);
 const d=await E(page,()=>{const t=x=>x.replace(/<[^>]+>/g,'');const r={};newPatient();
  S.wt=80;r.sux=t(EMS.find(e=>e.id==='lspasm').steps()[3]);
  r.lip80=t(EMS.find(e=>e.id==='last').steps().slice(2,4).join(' '));
  S.wt=60;r.lip60=t(EMS.find(e=>e.id==='last').steps().slice(2,4).join(' '));
  S.wt=10;S.pf.age='14';r.mz10=t(EMS.find(e=>e.id==='seizure').steps()[2]);
  S.wt=30;r.mz30=t(EMS.find(e=>e.id==='seizure').steps()[2]);
  S.wt=80;S.pf.age='16';r.la16=Object.fromEntries(laRows(80,laKid()).map(x=>[x.n,x.mg]));
  S.pf.age='40';r.la40=Object.fromEntries(laRows(80,laKid()).map(x=>[x.n,x.mg]));
  S.wt=null;S.pf={};r.lipNo=t(EMS.find(e=>e.id==='last').steps()[2]);return r});
 ok(/240–150|150 mg \(max\)|150 mg/.test(d.sux)&&!/320/.test(d.sux),'Adult IM succinylcholine capped at 150 mg (got '+d.sux+')');
 ok(/100 mL/.test(d.lip80)&&/250 mL over 15–20 min/.test(d.lip80)&&!/120 mL/.test(d.lip80),'LAST >70 kg: 100 mL bolus, 250 mL infusion');
 ok(/90 mL/.test(d.lip60)&&/15 mL\/min/.test(d.lip60),'LAST 60 kg: 1.5 mL/kg and 0.25 mL/kg/min');
 ok(/>70 kg/.test(d.lipNo),'LAST without weight shows both rules');
 ok(/2 mg/.test(d.mz10)&&!/5 mg/.test(d.mz10),'IM midazolam 10 kg = 0.2 mg/kg (got '+d.mz10+')');
 ok(/5 mg IM/.test(d.mz30),'IM midazolam 30 kg = 5 mg');
 ok(d.la16['Lidocaine 2% + epi']===300&&d.la16['Mepivacaine 3% plain']===300&&d.la16['Articaine 4% + epi']===500,'Under 18: AAPD caps 300/300/500 mg');
 ok(d.la40['Lidocaine 2% + epi']===500&&d.la40['Mepivacaine 3% plain']===400,'Adult caps unchanged');
 const fpairs=[['hemophilia','bleeddx'],['von Willebrand','bleeddx'],['TAVR','ie'],['prosthetic joint','ie'],['pacemaker','cied'],['ICD','cied'],['Suboxone','bupe'],['Sublocade','bupe'],['amitriptyline','epix'],['propranolol','epix'],['cocaine','epix'],['tacrolimus','tx'],['kidney transplant','tx']];
 for(const [q,id] of fpairs)ok((await E(page,q=>findHits(q).map(h=>h.f.id),q)).includes(id),`“${q}” finds ${id}`);
 for(const q of ['metoprolol','implant','sinus','sedation','extraction','canine'])ok(!(await E(page,q=>findHits(q).map(h=>h.f.id),q)).some(x=>['bleeddx','ie','cied','bupe','epix','tx'].includes(x)),`“${q}” does not hit a new finding`);
 const fp=await E(page,()=>{const o={};const P=(id,pf)=>{newPatient();Object.assign(S.pf,pf);return fPlan(FX[id])};
  o.bdHigh=P('bleeddx',{proc:'high',bdType:'ha'}).d;o.bdNone=P('bleeddx',{proc:'none',bdType:'vwd'}).d;
  o.ieHi=P('ie',{proc:'low',ieHi:'y'}).act;o.ieNo=P('ie',{proc:'high',ieHi:'n'}).d;o.ieU=P('ie',{proc:'high',ieHi:'u'}).d;
  o.cdMono=P('cied',{cdType:'icd',cdDep:'n',cdMono:'y'}).d;o.cdNo=P('cied',{cdType:'pm',cdDep:'n',cdMono:'n'}).d;
  o.bupe=P('bupe',{}).act;o.coc=P('epix',{epAg:'stim',ep24:'y'}).d;o.tca=P('epix',{epAg:'tca'}).d;o.epU=P('epix',{}).d;
  o.txR=P('tx',{txRecent:'y',txSteroid:'n'}).d;o.txU=P('tx',{}).prov;newPatient();return o});
 ok(fp.bdHigh==='refer'&&fp.bdNone==='proceed','Bleeding disorder: surgery → HTC; exam → proceed');
 ok(/amoxicillin 2 g/.test(fp.ieHi)&&fp.ieNo==='proceed'&&fp.ieU==='investigate','IE: high-risk gets prophylaxis; not high-risk none; Unknown not cleared');
 ok(fp.cdMono==='investigate'&&fp.cdNo==='proceed','CIED: monopolar → device clinic; none → proceed');
 ok(/Continue buprenorphine/.test(fp.bupe),'Buprenorphine: continue');
 ok(fp.coc==='defer'&&fp.tca==='modify'&&fp.epU==='investigate','Epinephrine interactions: cocaine <24 h defers; TCA modifies; unknown investigates');
 ok(fp.txR==='defer'&&fp.txU===true,'Transplant: recent defers; unanswered stays provisional');
 await E(page,()=>{newPatient();home()});
 ok(await page.locator('#settings').count()===1&&!(await E(page,()=>document.getElementById('settings').open)),'Home: settings collapsed by default');
 ok(/On-call off · Author mode/.test(await page.locator('#settings summary').innerText()),'Settings summary shows current state');
 const firstMod=await E(page,()=>document.querySelector('#groups .mod').getBoundingClientRect().top);ok(firstMod<700,'First module visible without scrolling (top '+Math.round(firstMod)+')');
 await E(page,()=>view('emergency'));ok(await page.locator('.jump [data-em]').count()===16,'SOS: one jump chip per card');
 await page.click('.jump [data-em="mh"]');ok(await E(page,()=>document.getElementById('em-mh').open),'SOS: jump chip opens its card');


 console.log('15. v3.4 review — reconciled plan, comparisons, change notices, consultation draft, a11y, phone, offline');
 const dupIds=()=>E(page,()=>{const c={};document.querySelectorAll('[id]').forEach(e=>{c[e.id]=(c[e.id]||0)+1});return Object.keys(c).filter(k=>c[k]>1)});
 const unnamed=()=>E(page,()=>[...document.querySelectorAll('#app button,#app input,#app select,#app textarea')].filter(e=>e.offsetParent!==null).filter(e=>{const t=(e.getAttribute('aria-label')||e.textContent||'').trim();if(e.matches('button'))return!t;const l=e.id&&document.querySelector(`label[for="${e.id}"]`);return!(l||e.getAttribute('aria-label')||e.closest('label'))}).map(e=>e.outerHTML.slice(0,80)));
 // Comparison through the UI: preview only, then explicit Apply
 await E(page,()=>{newPatient();S.asmt=['glp1'];Object.assign(S.pf,{anes:'sed',glpGi:'y',glpEsc:'n'});S.atab='find';asmtView()});
 ok(await page.locator('.reconciled').count()===1,'Assessment shows one reconciled plan');
 ok((await dupIds()).length===0,'Assessment page: no duplicate element IDs ('+(await dupIds()).join(',')+')');
 await page.click('#compare-panel summary');await page.click('[data-cmp="local"]');
 ok(await page.locator('.cmp-result').isVisible(),'Compare: Local-only preview renders');
 ok(await E(page,()=>S.pf.anes==='sed'&&/IV sedation/.test(asmtText())),'Compare: real context and copied note unchanged during preview');
 const tgt15=await E(page,()=>[...document.querySelectorAll('[data-cmp],[data-cmpapply],[data-consult-copy],[data-question]')].filter(e=>e.offsetParent!==null).map(e=>Math.round(e.getBoundingClientRect().height)));
 ok(tgt15.length>=3&&tgt15.every(h=>h>=44),'New controls are at least 44 px tall ('+tgt15.join(',')+')');
 await page.click('[data-cmpapply]');
 ok(await E(page,()=>S.pf.anes==='la'&&S.compare===undefined),'Compare: Apply changes the real context');
 ok(/Approach comparison applied/.test(await page.locator('.delta[role="status"]').first().innerText()),'Change notice names the reason for the change');
 // Staged comparison requires explicit qualification
 await E(page,()=>{newPatient();S.asmt=['doac'];Object.assign(S.pf,{proc:'high',doacAg:'api',ap:'n'});asmtView()});
 await page.click('#compare-panel summary');await page.click('[data-cmp="staged"]');
 ok(await page.locator('.cmp-result').count()===0&&await page.locator('[data-cmpapply]').count()===0,'Staged: no lower-risk result or Apply before qualification');
 await page.click('[data-cmpqualify]');
 ok(await page.locator('.cmp-result').count()===1&&await E(page,()=>S.pf.proc==='high'),'Staged: qualified preview shown; real procedure still high');
 // Context change through the UI records a reason
 await E(page,()=>{S.ctxOpen=true;delete S.compare;asmtView()});
 await page.click('#actxd [data-pf="proc"][data-pv="low"]');
 ok(/Changed because: Planned procedure/.test(await page.locator('.delta[role="status"]').first().innerText()),'Context edit shows a change explanation');
 // Consultation draft
 const cd=await E(page,()=>document.querySelector('textarea[aria-label="De-identified consultation draft"]').value);
 ok(/Decision requested:/.test(cd)&&!/@|DOB|MRN|Patient name/.test(cd)&&/does not send/.test(cd),'Consultation draft: decision requested, no identifier fields, not sent');
 await page.click('#app details:has([data-consult-copy]) summary');await page.click('[data-consult-copy]');
 ok(true,'Consultation copy button runs without page error');
 // Reconciled conflict in UI: buprenorphine + kidney disease
 await E(page,()=>{newPatient();S.asmt=['bupe','renal'];Object.assign(S.pf,{age:'60',proc:'low',dial:'no',esrd:'n'});asmtView()});
 const rp=await page.locator('.reconciled').innerText();
 ok(!/scheduled ibuprofen/.test(rp)&&/scheduled acetaminophen/.test(rp),'Reconciled plan hides the conflicting NSAID step, keeps acetaminophen');
 ok(await page.locator('summary:has-text("Advice suppressed")').count()===1,'Suppressed advice is disclosed with a reason');
 // Author protocol stays visible in the reconciled plan
 await E(page,()=>{setPmode('author');newPatient();S.asmt=['warfarin'];Object.assign(S.pf,{proc:'low',inr:'3.6',inrAge:'d1',ap:'n'});asmtView()});
 ok(/Author’s protocol/.test(await page.locator('.reconciled').innerText()),'Author protocol shown in the reconciled plan');
 // Accessibility across findings
 const fa=[];for(const id of await E(page,()=>FIND.map(f=>f.id))){await E(page,id=>{newPatient();openFind(id)},id);const d=await dupIds(),u=await unnamed();if(d.length||u.length)fa.push(id+':'+d.join(',')+u.join(','))}
 ok(fa.length===0,'All 18 finding pages: unique IDs, every visible control named '+fa.slice(0,3).join(' | '));
 await E(page,()=>{newPatient();S.asmt=['doac','renal','glp1'];Object.assign(S.pf,{proc:'high',anes:'sed'});asmtView()});
 ok((await unnamed()).length===0,'Assessment: every visible control has an accessible name');
 // Age field keeps focus while typing two digits
 await E(page,()=>{newPatient();openFind('bleeddx')});await page.click('#pf-age');await page.keyboard.type('65');
 ok(await E(page,()=>S.pf.age==='65'&&document.activeElement.id==='pf-age'),'Age field accepts a two-digit age without losing focus');
 // Phone widths: no horizontal overflow with every panel open
 for(const w of [320,390]){await page.setViewportSize({width:w,height:740});
  await E(page,()=>{newPatient();S.asmt=['doac','renal','bupe','glp1'];Object.assign(S.pf,{proc:'high',anes:'sed'});S.compare='local';S.ctxOpen=true;asmtView();document.querySelectorAll('#app details').forEach(d=>d.open=true)});
  ok(await E(page,()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),`No horizontal overflow at ${w} px with all panels open`)}
 await page.setViewportSize({width:390,height:664});
 // Reset through the bottom bar double tap
 await page.click('.abar [data-newpt]');await page.click('.abar [data-newpt]');
 ok(await E(page,()=>!hasPatient()&&!S.changes.length&&S.compare===undefined&&!document.querySelector('.delta')),'New patient (double tap) clears context, comparison, change history');
 ok(await E(page,()=>{const k=Object.keys(localStorage);return k.every(x=>['omsCompassAck','omsCompassOnCall','oms_compass_practice_mode'].includes(x))&&sessionStorage.length===0}),'Storage holds settings only, no patient data');

 // Offline and update behavior via a real service worker over HTTP
 {const fs=require('fs'),os=require('os'),http=require('http');const root=fs.mkdtempSync(path.join(os.tmpdir(),'compass-'));const app=path.join(root,'oms-compass');fs.mkdirSync(app);
  for(const f of fs.readdirSync(path.resolve(__dirname,'..')))if(/\.(html|js|png|webmanifest)$/.test(f))fs.copyFileSync(path.resolve(__dirname,'..',f),path.join(app,f));
  const T={html:'text/html',js:'text/javascript',png:'image/png',webmanifest:'application/manifest+json'};
  const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(root,u);if(!f.startsWith(root)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[f.split('.').pop()]||'application/octet-stream','cache-control':'no-cache'});fs.createReadStream(f).pipe(r)});
  await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${srv.address().port}/oms-compass/`;
  const oc=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});await oc.addInitScript(()=>{try{localStorage.setItem('omsCompassAck','1')}catch(e){}});
  const op=await oc.newPage();op.on('pageerror',e=>{fail++;fails.push('offline pageerror: '+e.message)});
  await op.goto(base);await op.evaluate(()=>navigator.serviceWorker.ready);await op.reload();await op.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const v1=await op.evaluate(()=>caches.keys());ok(v1.length===1&&v1[0].endsWith('v'+(await op.evaluate(()=>VER))),'Service worker installs one versioned cache ('+v1+')');
  await oc.setOffline(true);await op.reload();ok(await op.locator('#in-q').count()===1&&await op.evaluate(()=>VER)===await page.evaluate(()=>VER),'Offline reload serves the cached app');
  await op.evaluate(()=>{openFind('doac');S.pf.proc='high'});ok(await op.evaluate(()=>!!fPlan(FX.doac).act),'Offline: findings compute');
  await oc.setOffline(false);
  fs.writeFileSync(path.join(app,'sw.js'),fs.readFileSync(path.join(app,'sw.js'),'utf8').replace(/const VERSION = '[^']+'/,"const VERSION = 'compass-test-update'"));
  fs.writeFileSync(path.join(app,'index.html'),fs.readFileSync(path.join(app,'index.html'),'utf8').replace(/const VER='[^']+'/,"const VER='9.9.9-test'"));
  await op.reload();let upd=[];for(let i=0;i<30;i++){upd=await op.evaluate(()=>caches.keys()).catch(()=>[]);if(upd.length===1&&upd[0]==='compass-test-update')break;await op.waitForTimeout(500)}
  ok(JSON.stringify(upd)==='["compass-test-update"]','Update: new cache activates, old cache deleted ('+upd+')');
  await op.reload();ok(await op.evaluate(()=>VER)==='9.9.9-test','Update: online open serves the new version');
  await oc.setOffline(true);await op.reload();ok(await op.evaluate(()=>VER)==='9.9.9-test','Update: new version available offline');
  await oc.close();srv.close();fs.rmSync(root,{recursive:true,force:true})}


 await browser.close();
 
 console.log(`\n${pass} passed, ${fail} failed`);if(fail){console.log(fails.join('\n'));process.exit(1)}
})();
