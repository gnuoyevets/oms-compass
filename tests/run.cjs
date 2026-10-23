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
   prune();const p=fPlan(f);const open=fQs(f).some(q=>!has(S.pf[q.k]));
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
  let p=P('warfarin',{proc:'low',inr:'25',inrAge:'d1',ap:'n'});t.push(['INR 25 flagged invalid',/invalid/i.test(p.act)&&p.d==='investigate']);
  p=P('warfarin',{proc:'low',inr:'4.2',inrAge:'d1',ap:'n'});t.push(['INR 4.2 → defer',p.d==='defer']);
  p=P('warfarin',{proc:'low',inr:'2.5',inrAge:'old',ap:'n'});t.push(['INR >72 h → repeat',p.d==='investigate'&&/Repeat within 24 h/.test(p.act)]);
  p=P('warfarin',{proc:'low',inr:'2.5',inrAge:'d3',stable:'y',ap:'n'});t.push(['INR 25–72 h stable → proceed',p.d==='proceed'&&!p.prov]);
  p=P('plt',{proc:'high',plt:'150000',pltU:'k',pltAge:'wk',pltTrend:'st',pltCause:'itp'});t.push(['raw count in ×10³ unit flagged',/raw count/.test(p.act)]);
  p=P('plt',{proc:'high',plt:'45000',pltU:'raw',pltAge:'wk',pltTrend:'st',pltCause:'itp'});t.push(['45,000/µL → 45 → refer for surgical',p.d==='refer'&&/45 ×10⁹/.test(p.act)]);
  p=P('plt',{proc:'low',plt:'45',pltAge:'wk',pltTrend:'st',pltCause:'itp'});t.push(['45 for simple extraction → proceed with changes',p.d==='modify']);
  p=P('plt',{proc:'low',plt:'45',pltAge:'wk',pltTrend:'fall',pltCause:'itp'});t.push(['falling trend → verify first',p.d==='investigate']);
  p=P('plt',{proc:'low',plt:'45',pltAge:'old',pltTrend:'st',pltCause:'itp'});t.push(['old platelet result → verify first',p.d==='investigate']);
  p=P('a1c',{a1c:'75',a1cU:'mmol',a1cAge:'r3',urg:'el'});t.push(['75 mmol/mol → ≈9.0% → defer elective',p.d==='defer'&&/9(\.0)?%/.test(p.act)]);
  p=P('a1c',{a1c:'64',a1cU:'pct',a1cAge:'r3',urg:'el'});t.push(['64 entered as % flagged wrong unit',/mmol\/mol/.test(p.act)&&p.d==='investigate']);
  p=P('a1c',{a1c:'9.1',a1cU:'pct',a1cAge:'r3',urg:'urg'});t.push(['A1C 9.1 urgent → not deferred',p.d!=='defer']);
  p=P('a1c',{a1c:'7.1',a1cAge:'old',urg:'el'});t.push(['A1C older than 3 months → verify',p.d==='investigate']);
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
  S.pf.doacAg='riv';S.pf.proc='low';t.push(['Dosing-time hidden for low-risk',!ks('doac').includes('doacTime')]);S.pf.proc='high';t.push(['Dosing-time shown for once-daily + higher risk',ks('doac').includes('doacTime')]);
  newPatient();t.push(['Kidney card asks no procedure/anesthesia',!ks('renal').some(k=>['proc','anes','urg'].includes(k))]);
  t.push(['HbA1c asks urgency only',ks('a1c').includes('urg')&&!ks('a1c').includes('proc')]);
  newPatient();return t});
 r4.forEach(([m,v])=>ok(v,m));

 console.log('5. Context changes recompute and drop stale answers');
 const r5=await E(page,()=>{newPatient();S.asmt=['glp1','doac'];const t=[];
  Object.assign(S.pf,{anes:'sed',glpEsc:'n',glpGi:'y'});prune();t.push(['GLP-1 + GI symptoms under sedation → defer',fPlan(FX.glp1).d==='defer']);
  S.pf.anes='la';prune();t.push(['Switch to local → GI answer dropped',S.pf.glpGi===undefined&&S.pf.glpEsc===undefined]);t.push(['…and plan recomputed (no deferral)',fPlan(FX.glp1).d!=='defer']);
  S.pf.anes='sed';prune();t.push(['Back to sedation → asked again, not remembered',S.pf.glpGi===undefined&&fPlan(FX.glp1).d==='investigate']);
  Object.assign(S.pf,{doacAg:'riv',proc:'high',doacTime:'am',ap:'n'});prune();t.push(['Rivaroxaban AM, higher risk → delay morning dose',/delay that dose/.test(fPlan(FX.doac).act)]);
  S.pf.proc='low';prune();t.push(['Procedure → low risk drops dosing-time answer',S.pf.doacTime===undefined&&/Continue without interruption/.test(fPlan(FX.doac).act)]);
  newPatient();return t});
 r5.forEach(([m,v])=>ok(v,m));
 // UI: changing context in the assessment view updates the finding rows
 await E(page,()=>{newPatient();S.asmt=['doac'];S.pf.doacAg='api';S.pf.ap='n';S.ctxOpen=true;asmtView()});
 await page.click('[data-pf="proc"][data-pv="high"]');ok(/skip the morning dose/i.test(await page.locator('#arest').innerText()),'Assessment: choosing higher-risk procedure updates the DOAC row');
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
 ok(r8.bad.length===0&&r8.n===35,`All ${r8.n} modules and 5 tabs render (bad: ${r8.bad})`);
 await E(page,()=>home());await page.fill('#in-q','Dantrium');ok(await page.locator('#hits [data-em]').count()>0,'Search still reaches SOS (Dantrium)');
 await page.fill('#in-q','avulsion');ok(await page.locator('#hits [data-open="dentotrauma"]').count()>0,'Search still reaches modules (avulsion)');
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
 ok(await page.locator('#groups [data-open="dentotrauma"]').count()===1&&await page.locator('#groups [data-open="infection"]').count()===1,'On-call off keeps dentoalveolar trauma and infection');
 await page.click('[data-oncall]');
 ok(await page.locator('[data-oncall][aria-checked="true"]').count()===1,'On-call switch turns on');
 ok(await E(page,()=>document.querySelector('#groups .lab.group').textContent==='Hospital on-call'),'On-call group listed first');
 ok(await page.locator('#groups [data-open]').count()===await E(page,()=>MODS.length),'On-call on: every module listed exactly once');
 ok(await E(page,()=>localStorage.getItem('omsCompassOnCall')==='1'),'On-call preference remembered');
 await E(page,()=>{delete S.oc;home()});/* re-read from storage (file:// reloads in headless Chromium can drop unflushed storage) */
 ok(await page.locator('[data-oncall][aria-checked="true"]').count()===1,'On-call preference re-read from storage');
 await page.click('[data-oncall]');
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

 await browser.close();
 console.log(`\n${pass} passed, ${fail} failed`);if(fail){console.log(fails.join('\n'));process.exit(1)}
})();
