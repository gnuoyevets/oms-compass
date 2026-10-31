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
 ok(st.ls.every(k=>['omsCompassAck','oms_compass_practice_mode'].includes(k))&&st.ss.length===0,'Storage holds only the disclaimer acknowledgement and the migrated mode preference (v3.10)');
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
 ok(r8.bad.length===0&&r8.n===37,`All ${r8.n} modules and 5 tabs render (bad: ${r8.bad})`);
 await E(page,()=>home());await page.fill('#in-q','Dantrium');ok(await page.locator('#hits [data-em]').count()>0,'Search still reaches SOS (Dantrium)');
 await page.fill('#in-q','avulsion');ok(await page.locator('#hits [data-open="dentotrauma"]').count()>0,'Search still reaches modules (avulsion)');
 await page.fill('#in-q','laceration');ok(await page.locator('#hits [data-open="lac"]').count()>0,'Search reaches facial laceration');
 await page.fill('#in-q','tooth removal');ok(await page.locator('#hits [data-ho]').count()>0,'Search still reaches handouts');
 // Patient tab: renamed from Post-op; FAQs
 ok(await E(page,()=>{home();const t=document.querySelector('[data-view="handouts"]');return t&&t.textContent==='Patient'}),'Tab labelled “Patient”');
 const fq=await E(page,()=>{S.lang='en';view('handouts');return{n:FAQ.length,dom:FAQ.filter(f=>document.getElementById('ho-'+f.id)).length,proc:FAQ.filter(f=>f.k==='proc').length,dx:FAQ.filter(f=>f.k==='dx').length,
  par:FAQ.every(f=>f.t.en&&f.t.es&&f.i.en.length===f.i.es.length&&f.i.en.concat(f.i.es).every(x=>x.length===2&&x[0]&&x[1])),src:FAQ.every(f=>f.src.length&&f.src.every(k=>SRC[k])),uniq:new Set([...HO,...FAQ].map(x=>x.id)).size===HO.length+FAQ.length,heads:!!document.getElementById('ho-sec-proc')&&!!document.getElementById('ho-sec-dx')}});
 ok(fq.n===15&&fq.dom===15&&fq.proc===8&&fq.dx===7&&fq.heads,`Patient tab shows 8 procedure + 7 diagnosis FAQs (got ${fq.proc}+${fq.dx}, rendered ${fq.dom})`);
 ok(fq.par&&fq.src&&fq.uniq,'FAQs: EN/ES question counts match, sources resolve, ids unique');
 await E(page,()=>home());await page.fill('#in-q','dry socket');ok(await page.locator('#hits [data-ho="fao"]').count()===1,'Search reaches the dry socket FAQ');
 const ft=await E(page,()=>{S.site='young';return faqText(FAQ.find(f=>f.id==='fwis'),'es')});ok(/^Extracción de muelas del juicio/.test(ft)&&/Teléfono: \(401\) 273-7802$/.test(ft),'FAQ share text in Spanish with office phone');
 ok(await E(page,()=>Object.entries(FAQ_FOR).every(([m,f])=>M(m)&&FAQ.some(x=>x.id===f))&&FAQ.every(f=>Object.values(FAQ_FOR).includes(f.id))),'Every FAQ is linked from a real module');
 await E(page,()=>{newPatient();S.ans.ao={};open('ao');for(let i=0;i<12&&!document.querySelector('.plan');i++){const b=document.querySelector('.cur [data-a]');if(!b)break;b.click()}});
 const fb=page.locator('.plan [data-ho="fao"]');if(await fb.count()){await fb.click();ok(await E(page,()=>S.view==='handouts'&&document.getElementById('ho-fao').open),'Dry socket plan “Patient FAQ” opens the FAQ on the Patient tab')}else ok(false,'Dry socket plan shows a Patient FAQ button');
 // v3.8 Ref cards
 const rf=await E(page,()=>({n:REF.length,src:REF.every(r=>r.src.every(k=>SRC[k])),bad:REF.filter(r=>!r.t||!r.i.length).length}));
 ok(rf.n===17&&rf.src&&rf.bad===0,`Ref: 17 cards, every source resolves (got ${rf.n})`);
 for(const [q,t] of [['Nikolsky','Oral pathology chairside framework'],['hyaluronidase','Filler complications & vision loss'],['ameloblastoma','Odontogenic cysts & tumors: management'],['narrow ridge','GBR & narrow ridge'],['external hex','Implant biomechanics & restorative space'],['trigeminal','Orofacial pain red flags'],['amoxicillin','Implant antibiotic prophylaxis']])
  ok(await E(page,([q,t])=>{S.refq=q;view('ref');const s=[...document.querySelectorAll('#vbody details.box summary')].map(x=>x.textContent);S.refq='';return s.some(x=>x.includes(t))},[q,t]),`Ref search “${q}” finds ${t}`);
 ok(await E(page,()=>{S.refq='hyaluronidase';view('ref');const t=document.querySelector('#vbody details.box summary').textContent;S.refq='';return/Unverified draft/.test(t)}),'Ref card with a verify line is labelled Unverified draft');
 // Standalone patient page (/handouts/) mirrors Compass text
 const cmp=await E(page,()=>JSON.stringify({HO:HO.map(({id,t,i})=>({id,t,i})),FAQ:FAQ.map(({id,k,t,i})=>({id,k,t,i})),OG:OG.map(({id,t,o,r})=>({id,t,o,r}))}));
 const hp=await ctx.newPage();hp.on('pageerror',e=>{fail++;fails.push('handouts pageerror: '+e.message)});await hp.route(/^https?:\/\//,r=>r.abort());
 await hp.goto(FILE.replace(/index\.html$/,'handouts/index.html')+'#-en');await hp.waitForSelector('.card');
 ok(await E(hp,()=>JSON.stringify({HO:HO.map(({id,t,i})=>({id,t,i})),FAQ:FAQ.map(({id,k,t,i})=>({id,k,t,i})),OG:OG.map(({id,t,o,r})=>({id,t,o,r}))}))===cmp,'Handouts page: post-op, FAQ and option-grid text identical to Compass');
 ok(await hp.locator('.card').count()===23&&await hp.locator('h3.sec').count()===4,'Handouts page home lists 5 instructions + 15 FAQs + 3 option grids in 4 sections');
 await E(hp,()=>{location.hash='#ogimp-es'});await hp.waitForFunction(()=>/Reemplazar/.test(document.querySelector('h2')?.textContent||''));ok(await hp.locator('.og h3').count()===6&&/promedios/.test(await hp.locator('#app').innerText()),'Handouts page: #ogimp-es opens the Spanish implant/bridge grid with the caveat');
 await E(hp,()=>{location.hash='#oggraft-zh'});await hp.waitForFunction(()=>/拔牙后/.test(document.querySelector('h2')?.textContent||''));ok(await hp.locator('.og h3').count()===5,'Handouts page: 中文 graft grid');
 await E(hp,()=>{location.hash='#ogcoro-kea'});await hp.waitForFunction(()=>/juízu/.test(document.querySelector('h2')?.textContent||''));ok(await E(hp,()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Handouts page: Kriolu coronectomy grid, no horizontal scroll');await E(hp,()=>{location.hash='#-en'});await hp.waitForSelector('.card');
 await E(hp,()=>{location.hash='#fao-es'});await hp.waitForSelector('.qa');ok(/Alveolitis seca/.test(await hp.locator('h2').innerText())&&await hp.locator('.qa h3').count()===5,'Handouts page: FAQ link #fao-es opens Spanish dry socket FAQ');
 await E(hp,()=>{location.hash='#finf-zh'});await hp.waitForFunction(()=>/牙齿感染/.test(document.querySelector('h2')?.textContent||''));ok(!/英文和西班牙文/.test(await hp.locator('#app').innerText())&&await hp.locator('.qa p.warn').count()===1,'Handouts page: 中文 FAQ in Chinese, no fallback note; 911 answer highlighted');
 await E(hp,()=>{location.hash='#fao-kea'});await hp.waitForFunction(()=>/Alvéolu seku/.test(document.querySelector('h2')?.textContent||''));ok(await hp.locator('.qa h3').count()===5,'Handouts page: Kriolu dry socket FAQ link works');
 ok(await E(hp,()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Handouts page FAQ: no horizontal scroll');await hp.close();
 ok(await E(page,()=>{S.lang='zh';view('handouts');const ok=!/English shown/.test(document.getElementById('vbody').textContent)&&/拔除智齿/.test(document.getElementById('ho-fwis').textContent);S.lang='kea';view('handouts');const ok2=/Tira denti di juízu/.test(document.getElementById('ho-fwis').textContent);S.lang='en';return ok&&ok2}),'Kriolu and 中文 FAQs show in their own language, no fallback note');
 ok(await E(page,()=>FAQ.every(f=>['kea','zh'].every(l=>f.t[l]&&f.i[l].length===f.i.en.length&&f.i[l].every(x=>x.length===2&&x[0]&&x[1])))),'FAQs: Kriolu and 中文 complete, question counts match English');
 ok(await E(page,()=>/^拔除智齿/.test(faqText(FAQ.find(f=>f.id==='fwis'),'zh'))&&/电话: /.test(faqText(FAQ[0],'zh'))),'中文 FAQ share text in Chinese with phone label');

 console.log('9. Basis, assumptions and review status shown');
 await E(page,()=>{newPatient();open('preop')});for(const [id,v] of [['a',0],['b',0],['c',0],['d',0],['d2',0],['e',0]])await page.click(`.cur [data-a="${id}"][data-v="${v}"]`);
 const plan=await page.locator('.plan').innerText();
 ok(/Screen result · not a clearance/i.test(plan)&&/Not covered by this screen/.test(plan),'Short screen labelled “not a clearance” with what it did not cover');
 ok(await page.locator('.plan .bas').count()===1&&await page.locator('.plan .rev').count()===1,'Module plan shows basis chip and review line');
 await E(page,()=>{open('sed');S.ans.sed={a:false,b:true,c:false,d:true,e:false};refresh()});ok(/Author’s practice|Unverified draft/i.test(await page.locator('#flow').innerText()),'Personal sedation note labelled author’s practice / unverified');
 await E(page,()=>{newPatient();openFind('doac','Eliquis')});
 ok(await page.locator('#ftop .bas').count()===1,'Finding shows a basis chip');ok(/Provisional action/i.test(await page.locator('#ftop').innerText()),'Finding with missing context says “Provisional”');
 ok(/Planned procedure/.test(await page.locator('#ftop #unc').innerText()),'Finding lists what it depends on (v3.10 unresolved panel)');
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
 await openSet(page);await page.click('#settings [data-oncall]');
 ok(await page.locator('#settings [data-oncall][aria-checked="true"]').count()===1,'On-call switch turns on');
 ok(await E(page,()=>document.querySelector('#groups .lab.group').textContent==='Hospital on-call'),'On-call group listed first');
 ok(await E(page,()=>{const g=[...document.querySelectorAll('#groups .lab.group')].find(x=>x.textContent==='Hospital on-call');return !!g&&!!g.nextElementSibling.querySelector('[data-open="lac"]')}),'On-call on: facial laceration listed under Hospital on-call');
 ok(await page.locator('#groups [data-open]').count()===await E(page,()=>MODS.length),'On-call on: every module listed exactly once');
 ok(await E(page,()=>localStorage.getItem('omsCompassOnCall')==='1'),'On-call preference remembered');
 await E(page,()=>{delete S.oc;home()});/* re-read from storage (file:// reloads in headless Chromium can drop unflushed storage) */
 ok(await page.locator('#settings [data-oncall][aria-checked="true"]').count()===1,'On-call preference re-read from storage');
 await openSet(page);await page.click('#settings [data-oncall]');
 await E(page,()=>open('extraction'));
 ok(await page.locator('#fxsheet [data-atab="io"]').count()===1,'Intraop button in the module reference drawer (v3.6 focus mode replaces the bottom bar inside modules)');
 await page.click('#fxsheet .fx-handle');await page.click('#fxsheet [data-atab="io"]');
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
 await E(page,()=>{newPatient();open('preop')});await page.click('.fx-chip[data-drawer="tri"]');await page.fill('#in-tri',rep);await page.click('[data-triload]');
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
 ok(await E(page,()=>{const t=faqText(FAQ[0],'en');return/^Oral & Maxillofacial Surgery — Patient Instructions/.test(t)&&!/Young|Bayside|401|508/.test(t)}),'Colleague: shared FAQ has neutral header, no practice phone');
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

 console.log('16. v3.6 chairside focus mode — one decision per screen, header, drawer, back-step, latency, contrast');
 {const fc=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});await fc.addInitScript(()=>{try{localStorage.setItem('omsCompassAck','1')}catch(e){}});
  const fp=await fc.newPage();fp.on('pageerror',e=>{fail++;fails.push('focus pageerror: '+e.message)});await fp.route(/^https?:\/\//,r=>r.abort());await fp.goto(FILE);await fp.waitForSelector('#in-q');
  const reachAll=`(()=>{const out=[];for(const m of MODS){for(const [id,nd] of Object.entries(m.nodes)){if(!nd.q)continue;const path={};let cur=m.start,g=0;
   while(cur&&cur!==id&&g++<40){const x=m.nodes[cur];if(!x)break;if(x.note){cur=x.next;continue}if(x.out)break;
    const ok=(function reach(k,d){if(d>40||!k)return false;if(k===id)return true;const z=m.nodes[k];if(!z)return false;if(z.note)return reach(z.next,d+1);if(z.out)return false;return reach(z.yes,d+1)||reach(z.no,d+1)})(x.yes,0);path[cur]=ok;cur=ok?x.yes:x.no}
   if(cur===id)out.push([m.id,id,path])}}return out})()`;
  // Header
  await fp.evaluate(()=>{newPatient();open('preop')});
  const hd=await fp.evaluate(()=>{const h=document.querySelector('.fx-hd'),r=h.getBoundingClientRect(),cs=getComputedStyle(h);return{h:r.height,pos:cs.position,back:!!h.querySelector('[data-back]'),sos:!!h.querySelector('.fx-sos[data-view="emergency"]'),c:document.getElementById('fxc').textContent,title:h.querySelector('h2').textContent}});
  ok(hd.h===56&&hd.pos==='fixed'&&hd.back&&hd.sos&&/^Step 1 of \d/.test(hd.c)&&hd.title==='Pre-op clearance','Fixed 56 px header: back arrow, title, step counter, SOS badge '+JSON.stringify(hd));
  ok(await fp.evaluate(()=>getComputedStyle(document.querySelector('.fx-sos')).backgroundColor==='rgb(165, 0, 0)'),'SOS badge is solid red');
  // Binary screen
  const bs=await fp.evaluate(()=>{const c=document.querySelector('.cur'),q=c.querySelector('.q'),a=c.querySelector('.fx-a'),b=c.querySelector('.fx-b'),cs=getComputedStyle(q);
   return{n:document.querySelectorAll('.cur').length,qs:document.querySelectorAll('#flow .q').length,fs:parseFloat(cs.fontSize),fw:+cs.fontWeight,aw:a.getBoundingClientRect().width,bw:b.getBoundingClientRect().width,ah:a.getBoundingClientRect().height,bh:b.getBoundingClientRect().height,cw:c.clientWidth,abg:getComputedStyle(a).backgroundColor,bbg:getComputedStyle(b).backgroundColor,bbd:parseFloat(getComputedStyle(b).borderTopWidth),stack:b.getBoundingClientRect().top>a.getBoundingClientRect().bottom}});
  ok(bs.n===1&&bs.qs===1,'Exactly one question on screen');
  ok(bs.fs>=18&&bs.fs<=20&&bs.fw>=700,'Question bold 18–20 px '+bs.fs);
  ok(bs.ah>=48&&bs.bh>=48&&bs.stack&&Math.abs(bs.aw-bs.bw)<1&&bs.aw>=bs.cw-34,'Yes/No stacked, full width, ≥48 px '+JSON.stringify(bs));
  ok(bs.abg!=='rgba(0, 0, 0, 0)'&&bs.bbd>=2,'Yes filled, No outlined');
  // Every question screen fits one viewport at 360, 390 and 430 px widths
  const all=await fp.evaluate(reachAll);let bad=[],clip=[];
  for(const [W,H] of [[360,640],[390,664],[430,740]]){await fp.setViewportSize({width:W,height:H});
   const r=await fp.evaluate(([list,W,H])=>{const bad=[],clip=[];for(const [mid,id,path] of list){newPatient();S.ans[mid]={...path};open(mid);if(!document.querySelector(`.cur [data-a="${id}"]`)){if(!document.getElementById('plock'))bad.push(mid+'.'+id+':notshown');continue}
     const de=document.documentElement,a=document.querySelector('.fx-a'),u=document.querySelector('.fx-u'),qw=document.querySelector('.fx-qwrap');
     if(de.scrollHeight>innerHeight+1||de.scrollWidth>de.clientWidth)bad.push(mid+'.'+id+':pagescroll');
     if(u.getBoundingClientRect().bottom>innerHeight-56+1||a.getBoundingClientRect().top<56)bad.push(mid+'.'+id+':buttons');
     const q=document.querySelector('#fxq');if(q.getBoundingClientRect().bottom>qw.getBoundingClientRect().bottom+1)clip.push(mid+'.'+id)}
    newPatient();return{bad,clip}},[all,W,H]);
   bad.push(...r.bad.map(x=>W+':'+x));if(W===360)clip=r.clip}
  ok(bad.length===0,`All ${all.length} question screens: no page scroll, buttons in the thumb zone above the drawer at 360/390/430 px (bad: ${bad.slice(0,6)})`);
  ok(clip.length===0,`Question text never needs scrolling at 360×640 (clipped: ${clip.slice(0,6)})`);
  await fp.setViewportSize({width:390,height:664});
  // Back-step: arrow, swipe, system back
  await fp.evaluate(()=>{newPatient();open('preop')});
  await fp.click('.cur [data-a="a"][data-v="0"]');await fp.click('.cur [data-a="b"][data-v="0"]');
  const c2=await fp.textContent('#fxc');ok(/^Step 3 of/.test(c2),'Counter advances ('+c2+')');
  await fp.click('.fx-hd [data-back]');ok(await fp.evaluate(()=>S.ans.preop.b===undefined&&S.ans.preop.a===false&&/^Step 2 of/.test(document.getElementById('fxc').textContent)),'Back arrow undoes exactly one answer');
  await fp.click('.cur [data-a="b"][data-v="0"]');
  const swipe=(x0,x1)=>fp.evaluate(([x0,x1])=>{const el=document.querySelector('#flow .cur'),mk=x=>new Touch({identifier:1,target:el,clientX:x,clientY:300});
   el.dispatchEvent(new TouchEvent('touchstart',{touches:[mk(x0)],changedTouches:[mk(x0)],bubbles:true}));el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[mk(x1)],bubbles:true}))},[x0,x1]);
  await swipe(60,220);ok(await fp.evaluate(()=>S.ans.preop.b===undefined&&S.ans.preop.a===false),'Swipe right steps back one node');
  await swipe(220,60);ok(await fp.evaluate(()=>S.ans.preop.a===false&&S.view==='mod'),'Swipe left does nothing');
  await swipe(5,200);ok(await fp.evaluate(()=>S.ans.preop.a===false),'Edge swipe (x<16) left to the browser');
  await fp.evaluate(()=>history.back());await fp.waitForFunction(()=>S.ans.preop.a===undefined);
  ok(await fp.evaluate(()=>S.view==='mod'&&S.mod==='preop'&&history.state&&history.state.cs===1),'System back (popstate) steps back one node and stays in the module');
  await fp.evaluate(()=>history.back());await fp.waitForFunction(()=>S.view==='decide');ok(true,'System back on the first question returns to the module list');
  // Latency: full walk, no page reload
  await fp.evaluate(()=>{window.__noReload=1;newPatient();open('preop')});
  const lat=await fp.evaluate(()=>{const t=[];for(let i=0;i<12;i++){const b=document.querySelector('.cur .fx-b');if(!b)break;const t0=performance.now();b.click();t.push(performance.now()-t0)}return{t,max:Math.max(...t),out:!!document.querySelector('.plan .pact'),nav:performance.getEntriesByType('navigation').length,flag:window.__noReload}});
  ok(lat.max<100&&lat.t.length>=3&&lat.out,`Node-to-node update <100 ms (max ${lat.max.toFixed(1)} ms over ${lat.t.length} steps)`);
  ok(lat.nav===1&&lat.flag===1,'No page reload between nodes');
  // Terminal card
  const tc=await fp.evaluate(()=>{const p=document.querySelector('.plan'),pa=p.querySelector('.pact');return{copy:!!pa.querySelector('[data-copy]'),end:!!pa.querySelector('[data-endsess]'),vis:pa.getBoundingClientRect().bottom<=innerHeight-56+1,scroll:document.documentElement.scrollHeight<=innerHeight+1}});
  ok(tc.copy&&tc.end&&tc.vis&&tc.scroll,'Terminal card: Copy note and End session pinned on screen '+JSON.stringify(tc));
  await fp.click('.pact [data-endsess]');ok(await fp.evaluate(()=>S.view==='decide'&&!Object.keys(S.ans.preop||{}).length),'End session clears this decision and returns to the list');
  // Drawer
  await fp.evaluate(()=>{newPatient();open('extraction')});
  ok(await fp.evaluate(()=>{const b=document.getElementById('fxbody');return b.hasAttribute('inert')&&!document.getElementById('fxsheet').classList.contains('open')}),'Drawer starts collapsed and inert');
  const hand=await fp.evaluate(()=>{const h=document.querySelector('.fx-handle');const mk=y=>new Touch({identifier:2,target:h,clientX:200,clientY:y});h.dispatchEvent(new TouchEvent('touchstart',{touches:[mk(640)],changedTouches:[mk(640)],bubbles:true}));h.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[mk(520)],bubbles:true}));return S.drOpen});
  ok(hand===true,'Swipe up on the handle opens the reference drawer');
  ok(await fp.locator('#fxbody #fxpath').count()===1&&await fp.locator('#fxbody [data-reset]').count()===1&&await fp.locator('#fxbody details.box').count()>=1,'Drawer holds answers, sources/look-fors and reset');
  await fp.keyboard.press('Escape');ok(await fp.evaluate(()=>!S.drOpen),'Escape closes the drawer');
  const crit=await fp.evaluate(()=>{for(const m of MODS)for(const [id,n] of Object.entries(m.nodes))if(n.h&&m.start===id)return m.id;return null});
  if(crit){await fp.evaluate(id=>{newPatient();open(id)},crit);await fp.click('.cur .fx-crit');ok(await fp.evaluate(()=>S.drOpen&&document.querySelectorAll('#fxcrit .h li').length>0),'Criteria button opens the drawer at this step’s criteria')}
  ok(await fp.evaluate(()=>{const m=MODS.find(x=>x.inputs&&x.inputs.includes('cbct'));newPatient();open(m.id);return!!document.querySelector('.fx-chip[data-drawer="inputs"]')&&!!document.querySelector('#fxbody #in-rbh')}),'Data inputs (e.g. CBCT) live in the drawer, reached from a chip');
  // SOS from a module and back
  await fp.evaluate(()=>{newPatient();open('preop')});await fp.click('.cur [data-a="a"][data-v="0"]');await fp.click('.fx-sos');
  ok(await fp.evaluate(()=>S.view==='emergency'&&!!document.querySelector('.fx-ret[data-open="preop"]')),'SOS from a module offers a way back');
  await fp.click('.fx-ret');ok(await fp.evaluate(()=>S.view==='mod'&&S.ans.preop.a===false),'Back from SOS keeps the answers');
  // High contrast (AAA)
  await fp.evaluate(()=>{newPatient();home()});await fp.evaluate(()=>{toggleHC();open('preop')});
  const hc=await fp.evaluate(()=>{const cs=getComputedStyle(document.documentElement),v=k=>cs.getPropertyValue(k).trim();
   const L=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(x=>x<=.03928?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
   const cr=(a,b)=>{const x=L(a),y=L(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
   const P=[['--ink','--bg'],['--muted','--bg'],['--muted','--surface'],['--accent','--bg'],['--accent-ink','--accent'],['--chip-ink','--chip'],['--warn-ink','--warn-bg'],['--red-ink','--red-bg'],['--ok-ink','--ok-bg'],['--bg','--ink']];
   return{attr:document.documentElement.dataset.contrast,low:P.map(([a,b])=>[a,b,cr(v(a),v(b))]).filter(x=>x[2]<7).map(x=>x[0]+'/'+x[1]+' '+x[2].toFixed(2)),sos:cr('#ffffff','#a50000'),ls:localStorage.getItem('omsCompassContrast')}});
  ok(hc.attr==='high'&&hc.ls==='high','High-contrast toggle applies and is remembered (setting, not patient data)');
  ok(hc.low.length===0&&hc.sos>=7,'High-contrast tokens all ≥7:1 (WCAG AAA); SOS badge '+hc.sos.toFixed(2)+':1 '+hc.low);
  await fp.evaluate(()=>newPatient());ok(await fp.evaluate(()=>document.documentElement.dataset.contrast==='high'),'New patient keeps the contrast setting');
  await fc.close()}

 console.log('17. v3.10 encounter — actionable uncertainty, confirmed lab capture, encounter checklist, practice mode');
 {const c17=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});
  await c17.addInitScript(()=>{try{localStorage.setItem('omsCompassAck','1')}catch(e){}});
  const p=await fresh(c17);const X=(fn,a)=>p.evaluate(fn,a);
  // A. Lab capture requires confirmation; never infers unit, date or trend
  await X(()=>{newPatient();home()});await p.fill('#in-q','INR 2.6');
  ok(await p.locator('.labcap [data-labrec]').count()===1&&await X(()=>S.pf.inr===undefined),'“INR 2.6” shows a confirm card; nothing recorded before confirmation');
  await p.click('[data-labrec]');
  ok(await X(()=>S.pf.inr==='2.6'&&S.pf.inrAge===undefined&&S.view==='find'&&S.fid==='inr'),'Confirm records INR 2.6, opens the INR finding, date left unanswered');
  const rp=await X(()=>{newPatient();Object.assign(S.pf,{inr:'3.1',inrAge:'d1',inrRef:'n',inrOn:'none',proc:'low'});S.q='INR 2.6';home();const t=document.querySelector('.labcap').innerText;recordLab();return{t,pf:{...S.pf}}});
  ok(/Replaces INR 3\.1/.test(rp.t)&&/Clears/.test(rp.t)&&rp.pf.inr==='2.6'&&rp.pf.inrAge===undefined&&rp.pf.inrRef===undefined&&rp.pf.inrOn==='none'&&rp.pf.proc==='low','Replacing a result clears its date and range answer, keeps unrelated facts');
  ok(await X(()=>/New result: cleared/.test(document.querySelector('#ftop').innerText)),'Change notice says which answers were cleared');
  await X(()=>{newPatient();home()});await p.fill('#in-q','platelets 45');
  ok(await p.locator('[data-labrec][disabled]').count()===1&&await X(()=>S.pf.plt===undefined),'Platelets without a unit: record disabled until a unit is chosen');
  await X(()=>{S.pf.pltAge='wk';S.pf.pltTrend='st';S.pf.pltCause='itp';S.pf.plt='120';S.pf.pltU='k'});await p.fill('#in-q','platelets 45');
  await p.click('[data-labu="k"]');await p.click('[data-labrec]');
  ok(await X(()=>S.pf.plt==='45'&&S.pf.pltU==='k'&&S.pf.pltAge===undefined&&S.pf.pltTrend===undefined&&S.pf.pltCause==='itp'),'Platelet unit chosen explicitly; date and trend cleared on replacement; cause kept');
  const pu=await X(()=>[parseLab('platelets 45 k').unit,parseLab('plt 45000 /uL').unit,parseLab('A1c 8.2').unit,parseLab('a1c 8.2 %').unit,parseLab('HbA1c 64 mmol/mol').unit,!!parseLab('platelets 45,000').bad,parseLab('INR 2.6 today').extra,parseLab('eGFR 28 mL/min/1.73m2').extra,!!parseLab('CrCl 40').crcl,parseLab('Eliquis'),parseLab('dry socket 3')]);
  ok(pu[0]==='k'&&pu[1]==='raw'&&pu[2]===null&&pu[3]==='pct'&&pu[4]==='mmol'&&pu[5]&&pu[6]==='today'&&pu[7]===''&&pu[8]&&pu[9]===null&&pu[10]===null,'Lab parser: explicit units only, commas rejected, extra text not interpreted, non-labs ignored '+JSON.stringify(pu));
  await X(()=>{newPatient();home()});await p.fill('#in-q','INR 2.6 today');await p.click('[data-labrec]');
  ok(await X(()=>S.pf.inr==='2.6'&&S.pf.inrAge===undefined),'“today” in the query is not recorded as the result date');
  await X(()=>{newPatient();home()});await p.fill('#in-q','CrCl 40');
  ok(await p.locator('.labcap [data-labrec]').count()===0&&/never converts CrCl/.test(await p.locator('.labcap').innerText())&&await X(()=>Object.keys(S.pf).length===0),'CrCl is acknowledged, not stored and not converted');
  await X(()=>{newPatient();home()});await p.fill('#in-q','eGFR 28');await p.click('[data-labrec]');
  const eg=await X(()=>{const r={fid:S.fid,v:S.pf.egfr,txt:fPlan(FX.renal).steps.join(' ')};S.pf.dial='no';S.pf.esrd='n';const a=fPlan(FX.renal).d;delete S.pf.egfr;const b=fPlan(FX.renal).d;
   newPatient();S.asmt=['doac'];Object.assign(S.pf,{proc:'major',doacAg:'api',ap:'n',egfr:'28'});const d=asmtModel();r.same=a===b;r.crcl=d.miss.some(x=>/CrCl/.test(x))&&d.P[0].p.steps.some(x=>/not substituted for CrCl/.test(x));r.noKey=S.pf.crcl===undefined;return r});
  ok(eg.fid==='renal'&&eg.v==='28'&&/not a CrCl/i.test(eg.txt)&&eg.same,'eGFR 28 recorded on the kidney finding; documented, disposition unchanged');
  ok(eg.crcl&&eg.noKey,'DOAC interruption still asks for CrCl when eGFR is recorded (eGFR never substituted)');
  ok(await X(()=>{newPatient();S.fid='warfarin';Object.assign(S.pf,{proc:'low',inr:'2.1',inrAge:'d1'});openFind('warfarin');const i=document.getElementById('pf-inr');i.value='2.4';i.dispatchEvent(new Event('input',{bubbles:true}));return S.pf.inr==='2.4'&&S.pf.inrAge===undefined}),'Editing an entered INR on the finding clears its date');
  // B. Actionable uncertainty: one item per question, next action, provisional plan visible and copyable
  const un=await X(()=>{newPatient();S.asmt=['doac','warfarin','inr','renal'];S.pf.proc='high';const m=asmtModel(),o=openItems(m.A,m.miss),all=[...o.dec,...o.fin];
   const keys=all.filter(i=>i.q).map(i=>i.k),labs=all.map(itemLab);S.atab='find';asmtView();
   return{dup:keys.length!==new Set(keys).size,apOnce:keys.filter(k=>k==='ap').length,inrDup:labs.filter(l=>/^INR value and date/.test(l)).length,acts:all.every(i=>NACT[i.act[0]]),od:m.od,copy:!!document.querySelector('[data-acopy]'),disp:!!document.querySelector('#arest .disp'),txt:asmtText()}});
  ok(!un.dup&&un.apOnce===1&&un.inrDup===0,'Unresolved list: each question once across findings (antiplatelet once; INR not restated)');
  ok(un.acts&&/OPEN \(changes plan\) - (Ask patient|Obtain result|Check records|Decide plan)/.test(un.txt),'Each open item names a next action; copied note carries it');
  ok(un.copy&&un.disp&&!['defer','refer'].includes(un.od)&&/provisional/.test(un.txt),'Incomplete history: provisional plan stays visible and copyable, no automatic defer/refer');
  ok(await X(()=>FIND.every(f=>{newPatient();S.fid=f.id;return!['defer','refer'].includes(fPlan(f).d)})),'No finding defers or refers solely because nothing is entered');
  const keep=await X(()=>{const bad=[];for(let i=0;i<300;i++){newPatient();const ids=FIND.map(f=>f.id).filter(()=>Math.random()<.3);if(!ids.length)continue;S.asmt=ids;
    for(const id of ids)fQs(FX[id]).forEach(q=>{if(Math.random()<.5)S.pf[q.k]=q.type==='num'?(Math.random()<.2?'u':String(Math.round(Math.random()*60)/10)):[...q.opts.map(o=>o[0]),'u'][Math.floor(Math.random()*(q.opts.length+1))]});prune();
    const m=asmtModel(),o=openItems(m.A,m.miss),all=[...o.dec,...o.fin],ks=new Set(all.filter(x=>x.q).map(x=>x.k));
    m.miss.forEach(t=>{const tt=t.replace(/ — unknown$/,'');const hit=MISS_Q.find(([re])=>re.test(tt));const listed=all.some(x=>x.t===tt)||all.some(x=>x.q&&x.q.q===tt)||(hit&&hit[1].some(k=>ks.has(k)));if(!listed)bad.push(t)})}newPatient();return bad.slice(0,3)});
  ok(keep.length===0,'Consolidation never drops an unresolved item (300 random combined cases) '+keep.join(' | '));
  const gate=await X(()=>{newPatient();S.asmt=['warfarin'];S.pf.proc='high';const o=openItems(['warfarin'],asmtModel().miss);const ia=[...o.dec,...o.fin].find(x=>x.k==='inrAge');return{dec:ia.dec,t:condText(ia)}});
  ok(gate.dec&&/once “Most recent INR” is known/.test(gate.t),'INR date stays “changes the plan”, labelled as waiting on the INR value');
  // C. Practice mode
  const pm=await X(()=>{newPatient();setPmode('author');S.asmt=['doac','warfarin'];Object.assign(S.pf,{proc:'high',doacAg:'riv',doacTime:'am',ap:'n',inr:'3.7',inrAge:'d1'});S.atab='find';asmtView();
   const before=JSON.stringify(S.pf),a=asmtModel().od,an=asmtText();document.querySelector('[data-pmsw]').click();const after=JSON.stringify(S.pf),c=asmtModel().od,cn=asmtText();
   document.querySelector('[data-pmsw]').click();const back=JSON.stringify(S.pf);setPmode('author');
   return{same:before===after&&after===back,a,c,an,cn,mode:localStorage.getItem('oms_compass_practice_mode'),notice:/Practice mode/.test(document.querySelector('#arest').innerText)}});
  ok(pm.same,'Switching mode keeps every entered fact (including the Colleague-only DOAC dose-time answer)');
  ok(pm.a==='defer'&&pm.c!=='defer','Mode switch recomputes: INR 3.7 defers under Author (<3.5), not under Colleague (<4)');
  ok(/Practice mode: Author/.test(pm.an)&&/Departures from guidelines: Author protocol applied/.test(pm.an)&&/Practice mode: Colleague/.test(pm.cn)&&/Departures from guidelines: none flagged/.test(pm.cn),'Copied note names the active mode and departures from guidelines');
  ok(pm.notice,'Change notice records the mode switch');
  ok(await X(()=>{newPatient();open('extraction');return/Practice mode: (Author|Colleague)/.test(planText(M('extraction'),walk(M('extraction'))))}),'Module plan note names the practice mode');
  ok(await X(()=>{newPatient();setPmode('author');S.asmt=['doac'];S.pf.proc='high';const c=consultText(asmtModel());return/Practice mode: Author/.test(c)}),'Consultation draft names the practice mode');
  {const cn=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});const q=await cn.newPage();await q.route(/^https?:\/\//,r=>r.abort());await q.goto(FILE);
   const r=await q.evaluate(()=>({m:pmode(),ls:localStorage.getItem('oms_compass_practice_mode')}));ok(r.m==='colleague'&&r.ls===null,'New user (no prior use) starts in Colleague mode');await cn.close()}
  {const cn=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});await cn.addInitScript(()=>{try{if(!sessionStorage.getItem('x')){localStorage.setItem('omsCompassAck','1');sessionStorage.setItem('x','1')}}catch(e){}});const q=await cn.newPage();await q.route(/^https?:\/\//,r=>r.abort());await q.goto(FILE);await q.waitForSelector('#in-q');
   ok(await q.evaluate(()=>pmode()==='author'&&localStorage.getItem('oms_compass_practice_mode')==='author'),'Existing user without a stored mode keeps Author (migrated)');
   ok(await q.evaluate(()=>{setPmode('colleague');migratePmode();return pmode()==='colleague'&&localStorage.getItem('oms_compass_practice_mode')==='colleague'}),'A stored Colleague choice is preserved (migration never overrides it)');await cn.close()}
  // D. Encounter checklist
  const io=await X(()=>{newPatient();setPmode('author');S.asmt=['warfarin','renal'];Object.assign(S.pf,{proc:'high',anes:'sed'});S.atab='io';asmtView();
   const snap=()=>JSON.stringify([S.pf,S.ans,S.asmt,outcomeKey(asmtModel())]),s0=snap();
   document.querySelectorAll('[data-io]').forEach(b=>b.click());const s1=snap();document.querySelectorAll('[data-iost][data-v="na"]').forEach(b=>b.click());const s2=snap();
   const r={iso:s0===s1&&s1===s2,x:!!document.querySelector('[data-io="x_warfarin"]')&&!!document.querySelector('[data-io="x_renal"]'),open:!!document.querySelector('.ioopen')};
   S.io={};S.ioSig={};ioSet('mon','done');ioSet('cons','done');ioSet('cnt','pend');ioSet('id','na');
   r.tri=ioVal('mon')==='done'&&ioVal('cnt')==='pend'&&ioVal('id')==='na';
   S.pf.anes='ga';ioSync();r.monReset=ioVal('mon')===null&&ioVal('cnt')==='pend'&&ioVal('id')==='na';
   S.pf.dial='hd';ioSync();r.consReset=ioVal('cons')===null&&ioVal('id')==='na';
   S.pf.anes='la';asmtView();r.fold=!!document.querySelector('.iohid [data-io="mon"]')&&!document.querySelector('.io>.ioit [data-io="mon"]');
   S.pf.proc='low';asmtView();r.foldImpl=!!document.querySelector('.iohid [data-io="kit"]');r.resetMsg=/Reset because the plan changed/.test(document.getElementById('iobody').innerText);
   newPatient();r.cleared=!S.io||Object.keys(S.io).length===0;r.sig=!S.ioSig;return r});
  ok(io.iso,'Checklist isolation: Done/N/A on every item never changes facts, answers or the plan');
  ok(io.x&&io.open,'Checklist adds one check per assessment finding and lists unresolved questions (read-only)');
  ok(io.tri,'Checklist supports Done, Pending and N/A');
  ok(io.monReset&&io.consReset,'Checks reset when the facts they covered change (anesthesia → monitors; plan → consent); unrelated checks kept');
  ok(io.fold&&io.foldImpl,'Sedation and implant checks fold (not deleted) when local only / low-risk procedure is entered');
  ok(io.resetMsg,'Checklist says which checks were reset');
  ok(io.cleared&&io.sig,'New patient clears checklist statuses and their plan signatures');
  ok(await X(()=>{newPatient();S.atab='io';asmtView();return document.querySelectorAll('.iohid').length===0&&/not entered: all checks shown/.test(document.getElementById('iobody').innerText)}),'Unset context folds nothing and says so (never assumed)');
  ok(await X(()=>Object.keys(localStorage).every(k=>['omsCompassAck','omsCompassOnCall','oms_compass_practice_mode','omsCompassContrast'].includes(k))&&sessionStorage.length===0),'v3.10 state stays in memory (storage holds settings only)');
  // E. Phone layouts
  for(const w of [320,360,390,430]){await p.setViewportSize({width:w,height:780});
   const ov=await X(async()=>{const res=[];const chk=n=>{if(document.documentElement.scrollWidth>innerWidth+1)res.push(n)};
    newPatient();S.q='platelets 45';home();chk('labcap');
    S.asmt=['warfarin','renal','plt','doac'];S.pf.proc='high';openFind('plt');chk('finding');S.atab='find';asmtView();chk('assessment');S.atab='io';asmtView();chk('checklist');newPatient();home();return res});
   ok(ov.length===0,`No horizontal overflow at ${w}px: lab card, finding, assessment, checklist ${ov}`)}
  await p.setViewportSize({width:390,height:844});
  const small=await X(()=>{newPatient();S.q='platelets 45';home();const a=[...document.querySelectorAll('.labcap button')];S.asmt=['warfarin'];S.pf.proc='high';S.atab='find';asmtView();a.push(...document.querySelectorAll('.unc .go,.unc .tg,.mbar .tg'));S.atab='io';asmtView();a.push(...document.querySelectorAll('.iost .tg,.ioi,.ioopen .go'));
   return a.filter(b=>b.isConnected&&b.offsetParent).map(b=>b.getBoundingClientRect()).filter(r=>r.height<44||r.width<44).length});
  ok(small===0,'v3.10 controls are at least 44 px ('+small+' smaller)');
  await c17.close()}

 console.log('18. v3.11 fast path — pinned row, Today’s plan, equal Yes/No, step-1 chips, More fold');
 {const c18=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});
  await c18.addInitScript(()=>{try{localStorage.setItem('omsCompassAck','1')}catch(e){}});
  const p=await fresh(c18),X=f=>p.evaluate(f);
  ok(await p.locator('#pins .pin').count()===5,'Pinned row has 5 entries');
  ok(await X(()=>[...document.querySelectorAll('#pins .pin')].map(b=>b.dataset.open||b.dataset.view).join()==='preop,sed,implant,extraction,handouts'),'Pinned: pre-op, sedation, implants, extractions, handouts');
  ok(await X(()=>{const m=[...document.querySelectorAll('#groups .mods')].pop(),s=document.getElementById('settings');return !!(m.compareDocumentPosition(s)&Node.DOCUMENT_POSITION_FOLLOWING)}),'Settings sit below the module list');
  await p.fill('#in-q','Eliquis');ok(await X(()=>document.getElementById('pins').hidden),'Pinned row hides while searching');await p.fill('#in-q','');
  ok(await X(()=>{home();return document.getElementById('pins').hidden===false}),'Pinned row returns when search clears');
  await p.click('.pin[data-open="preop"]');
  const st=await X(()=>{const a=getComputedStyle(document.querySelector('.fx-a')),b=getComputedStyle(document.querySelector('.fx-b'));return a.backgroundColor===b.backgroundColor&&a.color===b.color});
  ok(st,'Yes and No have equal visual weight');
  ok(/Photo triage/.test(await p.locator('#fxchips').innerText()),'Photo triage chip on the first question');
  await p.click('.fx-b');
  ok(!/Photo triage|Data inputs/.test(await p.locator('#fxchips').innerText()),'Triage and inputs chips hidden after the first answer');
  ok(await p.locator('#sec-tri').count()===1&&await p.locator('#sec-inputs').count()===1,'Triage and inputs remain in the drawer');
  for(let i=0;i<5;i++)await p.click('.fx-b');
  ok(await p.locator('#today').count()===1,'Healthy local path ends on Today’s plan');
  ok(await X(()=>!!document.querySelector('.plan details.more .rev')&&!document.querySelector('.plan details.more').open),'Review status folded under More');
  ok(/Ibuprofen 400 mg/.test(await p.locator('#today').innerText()),'No antithrombotic: NSAID-first analgesia');
  ok(/Enter weight/.test(await p.locator('#today-la').innerText()),'LA maximum asks for weight');
  await p.fill('#in-wtt','70');
  ok(await X(()=>document.activeElement&&document.activeElement.id==='in-wtt'),'Typing weight keeps focus');
  const la=await p.locator('#today-la').innerText();
  ok(/Lidocaine 2% \+ epi: 490 mg · 14\.4 carps/.test(la),'70 kg lidocaine maximum matches Calc (490 mg, 14.4 carps)');
  ok(await X(()=>{view('calc');const t=document.body.innerText;S.mod=null;return /490 mg/.test(t)}),'Calc shows the same weight-based maximum');
  await X(()=>open('preop'));
  await p.click('[data-tasa="2"]');
  ok(await X(()=>S.today.asa===2&&S.asa==='12'),'ASA II recorded and Calc sedation card set to ASA I–II');
  const note=await X(()=>{const m=M('preop');return planText(m,walk(m))});
  ok(/ASA class: ASA II/.test(note)&&/LA maximum \(70 kg/.test(note)&&/Analgesia: Ibuprofen/.test(note),'Copy note carries ASA, LA maximum and analgesia');
  await p.click('[data-tasa="4"]');ok(/not an office sedation case/.test(await p.locator('#today').innerText()),'ASA IV shows the office-sedation exclusion');
  await p.click('[data-tasa="4"]');ok(await X(()=>S.today.asa===undefined),'Tapping the selected ASA clears it');
  await X(()=>newPatient());ok(await X(()=>S.today===undefined&&!S.wt),'New patient clears Today’s plan and weight');
  await X(()=>open('preop'));await p.click('.fx-b');await p.click('.fx-b');await p.click('.fx-a');for(let i=0;i<3;i++)await p.click('.fx-b');
  const t2=await p.locator('#today').innerText();
  ok(/^Acetaminophen 1000 mg/m.test(t2)&&!/Ibuprofen/.test(t2),'Anticoagulant/antiplatelet: acetaminophen, no NSAID');
  await X(()=>newPatient());await X(()=>open('preop'));for(let i=0;i<5;i++)await p.click('.fx-b');await p.click('.fx-a');
  ok(/Data inputs/.test(await p.locator('#fxchips').innerText()),'Inputs chip returns on the STOP-Bang step (reads entered data)');
  await p.click('.fx-b');await p.click('.fx-b');
  ok(/Before sedation/.test(await p.locator('#today .hob').innerText()),'Sedation path offers sedation handouts');
  await X(()=>newPatient());await X(()=>open('preop'));await p.click('.fx-a');
  ok(await p.locator('#today').count()===0,'Defer outcome shows no Today’s plan');
  await c18.close()}


 console.log('19. v3.12 patient side — red flags first, pictograms, teach-back, option grids, day-7, registry line');
 {const c19=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});
  await c19.addInitScript(()=>{try{localStorage.setItem('omsCompassAck','1')}catch(e){}});
  const p=await fresh(c19),X=f=>p.evaluate(f);await X(()=>setPmode('author'));
  ok(await X(()=>HO.every(h=>(HO_ICON[h.id]||[]).length===h.i.en.length)),'Every handout line has a pictogram');
  ok(await X(()=>HO.every(h=>['en','es','kea','zh'].every(l=>{const a=h.i[l].filter(HO_WARN).length,b=h.i.en.filter(HO_WARN).length;return a===b}))),'Red-flag lines detected in all four languages, same count as English');
  ok(await X(()=>{const it=hoItems(HO.find(h=>h.id==='ext'),'en');return it[0].w&&it[1].w&&/^Call us/.test(it[0].t)&&/911/.test(it[1].t)&&!it[2].w}),'Extraction handout: call-us and 911 lines first');
  ok(await X(()=>{const t=hoText(HO.find(h=>h.id==='ext'),'es');return t.indexOf('911')<t.indexOf('🩸')}),'Shared text (Español): red flags before bleeding care');
  ok(await X(()=>HO.every(h=>hoItems(h,'en').length===h.i.en.length)),'Reordering keeps every line');
  await X(()=>{view('handouts')});
  ok(await p.locator('#vbody ul.hol li.warn').count()>=5,'Patient tab highlights red-flag lines');
  ok(await p.locator('#vbody .tb').count()===5,'Teach-back under each of the 5 post-op handouts');
  ok(await X(()=>!/Teach-back|explained it well/.test(hoText(HO[0],'en'))),'Teach-back is not in shared handout text');
  ok(await p.locator('#vbody #ho-ogcoro').count()===1&&await p.locator('#vbody #ho-ogimp').count()===1&&await p.locator('#vbody #ho-oggraft').count()===1,'Three option grids on the Patient tab');
  ok(await X(()=>OG.every(g=>['en','es','kea','zh'].every(l=>g.r[l].length===g.r.en.length&&g.r[l].every(([q,a])=>q&&a.length===g.o[l].length&&a.every(x=>x&&x.length<260))))),'Option grids: all 4 languages complete, every row answers every option');
  ok(await X(()=>OG.every(g=>g.src.every(k=>SRC[k]))),'Option grids cite known sources');
  ok(await X(()=>/Numbers are averages/.test(ogText(OG[0],'en'))&&/promedios/.test(ogText(OG[0],'es'))&&/平均值/.test(ogText(OG[0],'zh'))),'Option grid share text carries the caveat in its language');
  ok(await X(()=>{S.lang='kea';view('handouts');const t=document.getElementById('ho-ogimp').textContent;S.lang='en';view('handouts');return/Implanti/.test(t)&&/Dexa spasu/.test(t)}),'Patient tab shows grids in the selected language (Kriolu)');
  ok(await p.locator('#vbody #ho-d7').count()===1&&/g\.page\/r\//.test(await X(()=>d7Text('en'))),'Day-7 message with review link (Author mode)');
  ok(await X(()=>{S.site='bayside';const t=d7Text('es');S.site='young';return/Bayside/.test(t)&&/508/.test(t)&&/Hola/.test(t)}),'Day-7 message follows site and language');
  ok(await X(()=>{const was=pmode();setPmode('colleague');view('handouts');const n=document.querySelectorAll('#vbody #ho-d7').length;setPmode('author');view('handouts');const m=document.querySelectorAll('#vbody #ho-d7').length;setPmode(was);return n===0&&m===1}),'Colleague mode hides the day-7 message');
  await X(()=>{newPatient();open('extraction')});
  ok(await X(()=>{S.ans.extraction={};const m=M('extraction');let w=walk(m),n=0;while(w.cur&&n<20){S.ans.extraction[w.cur.id]=false;w=walk(m);n++}refresh();return !!w.out}),'Extraction module reaches a plan');
  ok(await p.locator('.plan [data-ho="ogcoro"]').count()===1&&await p.locator('.plan [data-ho="oggraft"]').count()===1,'Extraction plan links both option grids');
  await p.click('.plan [data-ho="ogcoro"]');ok(await X(()=>S.view==='handouts'&&document.getElementById('ho-ogcoro').open),'Option-grid button opens that grid');
  await X(()=>{newPatient();open('preop');S.ans.preop={a:false,b:false,c:true,d:false,d2:false,e:true,f:false,g:false};S.today={asa:2};S.pf.age='52';open('implant');const m=M('implant');let w=walk(m),n=0;S.ans.implant={};while(w.cur&&n<20){S.ans.implant[w.cur.id]=false;w=walk(m);n++}refresh()});
  const line=await X(()=>{const m=M('implant');return regLine(m,walk(m))});
  ok(/^CR1;proc=(Implant%20placement|Immediate%20implant);anes=IV%20sedation;asa=II;age=45%E2%80%9364;rf=ac;plan=/.test(line),'Registry line: procedure, anesthesia, ASA, age band, anticoagulant, plan ('+line.slice(0,90)+')');
  ok(!/[A-Za-z]+%20\d{1,2}%2C|\d{4}-\d{2}-\d{2}/.test(line),'Registry line carries no dates');
  ok(await p.locator('.plan [data-reg]').count()===1,'Author mode: registry button on the plan');
  await p.click('.plan [data-reg]');await p.waitForTimeout(200);
  ok(await p.locator('#regl a[href*="CYcfCKQHUD67fTtnb9GF3g"]').count()===1,'Tapping the registry button shows the registry link');
  ok(await X(()=>{const b=document.querySelector('.plan [data-reg]'),x=document.getElementById('copybox');return /Copied/.test(b.textContent)||(x&&!x.hidden&&/^CR1;/.test(x.value))}),'Tapping the registry button copies the CR1 line (or shows it to copy)');
  await X(()=>home());
  ok(await p.locator('#pins .qset [data-oncall]').count()===1&&await p.locator('#pins .qset [data-pm]').count()===1,'Quick settings: on-call and mode switches above the pinned row');
  const oc0=await X(()=>onCall());await p.click('#pins .qset [data-oncall]');ok(await X(()=>onCall())!==oc0&&/On-call · (On|Off)/.test(await p.locator('#pins .qset [data-oncall]').innerText()),'Quick on-call switch toggles');await p.click('#pins .qset [data-oncall]');
  const m0=await X(()=>pmode());await p.click('#pins .qset [data-pm]');ok(await X(()=>pmode())!==m0,'Quick mode switch toggles Author/Colleague');await p.click('#pins .qset [data-pm]');ok(await X(()=>pmode())===m0,'and back');
  // v3.14 nerve-risk signs and phone triage
  await X(()=>{newPatient();open('extraction');S.ans.extraction={a:false,b:true};refresh()});
  ok(/Panoramic sign/.test(await p.locator('.cur').innerText()),'Extraction reaches the panoramic-sign step');
  await X(()=>{S.inp.extraction={rs_narr:true};refresh()});ok(/Panoramic sign/.test(await p.locator('.cur').innerText())&&/Weaker sign/.test(await X(()=>R('extraction').rsMsg)),'Weaker sign only: step left to judgment');
  await X(()=>{S.inp.extraction={rs_div:true};refresh()});ok(await X(()=>{const w=walk(M('extraction'));return w.steps.some(s=>s.id==='c'&&s.val===true&&s.auto)}),'Diversion of the canal answers the step Yes automatically');
  ok(/high-risk/.test(await X(()=>R('extraction').rsMsg))&&/CBCT/.test(await X(()=>R('extraction').rsMsg)),'Strong sign message suggests CBCT');
  await X(()=>{S.inp.extraction={rs_sup:true};refresh()});ok(await X(()=>!walk(M('extraction')).steps.some(s=>s.id==='c'&&s.auto))&&/does not rule out/.test(await X(()=>R('extraction').rsMsg)),'Overlap without a sign never auto-answers No');
  await X(()=>{newPatient();open('calltri')});
  ok(/breathing or swallowing/.test(await p.locator('.cur').innerText()),'Phone triage asks the emergency question first');
  await p.click('.fx-a');ok(/Call 911/.test(await p.locator('.plan').innerText()),'Emergency answer goes straight to 911');
  await X(()=>{newPatient();open('calltri');S.ans.calltri={a:false,b:true,b2:true};refresh()});ok(/Come in now/.test(await p.locator('.plan').innerText())&&await p.locator('.plan [data-open="bleed"]').count()===1,'Heavy bleeding or blood thinner: come in now, links Post-op bleeding');
  await X(()=>{newPatient();open('calltri');const m=M('calltri');S.ans.calltri={};let w=walk(m),n=0;while(w.cur&&n<20){S.ans.calltri[w.cur.id]=false;w=walk(m);n++}refresh()});
  ok(/Expected healing/.test(await p.locator('.plan').innerText())&&await p.locator('.plan [data-ho="ext"]').count()===1,'All No: reassure, with the handout button');
  ok(await X(()=>{setOnCall(true);home();const g=[...document.querySelectorAll('#groups .lab.group')].find(x=>x.textContent==='Hospital on-call');let n=g.nextElementSibling;const ok=!!n.querySelector('[data-open="calltri"]');setOnCall(false);home();return ok}),'Phone triage listed under Hospital on-call when on-call is on');
  await c19.close()}

 await browser.close();
 
 console.log(`\n${pass} passed, ${fail} failed`);if(fail){console.log(fails.join('\n'));process.exit(1)}
})();
