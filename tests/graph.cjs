/* Exercises the app script and all graph paths. Software checks,
   not clinical source validation. No network or third-party dependencies. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const noop=()=>{},elements=new Map(),listeners={};
const element=()=>({innerHTML:'',hidden:false,value:'',classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,querySelector:()=>null,querySelectorAll:()=>[],setAttribute:noop,insertAdjacentHTML:noop,focus:noop});
const document={getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(k,fn)=>{(listeners[k]??=[]).push(fn)},createElement:element,body:{classList:{add:noop,remove:noop,toggle:noop},appendChild:noop}};
const storage=new Map([['omsCompassAck','1']]),sandbox={console,document,navigator:{},window:{scrollTo:noop},location:{hash:'',pathname:'/',search:''},history:{replaceState:noop,pushState:noop},addEventListener:noop,setTimeout:noop,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
sandbox.storage=storage;vm.createContext(sandbox);const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
vm.runInContext([...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n'),sandbox);
const run=code=>vm.runInContext(code,sandbox);let checks=0;
function check(name,code){assert.ok(run('{'+code+'}'),name);checks++}
check('new patient resets draft mode and clinical overrides',`newPatient();S.draftMode=true;S.autoOverrides={x:{reason:'abc'}};newPatient();S.draftMode===false&&!S.autoOverrides`);
check('consultation workspace removed (v3.23.1); draft gate kept',`typeof cwRender==='undefined'&&typeof cwModel==='undefined'&&!tabsHTML('decide').includes('Consult')&&typeof cwDraftRequired==='function'`);
check('new implant nerve insult bypasses months',`newPatient();S.ans.nerve={implantEarly:true};/Immediate surgeon/.test(walk(M('nerve')).out.out)`);
check('mronj eligibility required before staging',`newPatient();S.ans.mronj={a:true,c:false,d:false};walk(M('mronj')).cur.id==='eligibleDrug'`);
check('mronj exclusions stop staging',`S.ans.mronj={eligibleDrug:true,eligibleExclusion:true};/not establish/.test(walk(M('mronj')).out.out)`);
check('chemo-only route reaches chemo without false radiation answer',`newPatient();S.ans.onc={therapy:false,c:true};/agree timing with oncology/.test(walk(M('onc')).out.out)`);
check('unanswered copied question never No',`newPatient();const t=planText(M('htn'),walk(M('htn')));t.includes('Not answered')&&!t.split(String.fromCharCode(10)).some(s=>s.endsWith('damage? No'))`);
check('office sedation requires known age 13 or older (Steven, Nov 6 2026)',`newPatient();!adultSedationEligible()&&(S.pf.age='12',!adultSedationEligible())&&(S.pf.age='13',adultSedationEligible())&&(S.wt=35,!adultSedationEligible())&&(S.wt=55,adultSedationEligible())&&teenSedationNote().includes('AAP/AAPD')&&(S.pf.age='18',teenSedationNote()==='')`);
check('draft gate follows the app basis label, not missing check dates',`newPatient();!cwDraftRequired(M('calltri'),{out:M('calltri').nodes.o911,steps:[]})&&!cwDraftRequired(M('pain'),{out:M('pain').nodes.oApap,steps:[]})&&cwDraftRequired(M('oac'),{out:Object.values(M('oac').nodes).find(n=>n.out),steps:[]})`);
check('urgent outcomes are never hidden by the draft gate',`newPatient();S.pf.age='40';const m=M('dns'),k=Object.keys(m.nodes).find(k=>m.nodes[k].out&&m.nodes[k].tone==='urgent');!planText(m,{out:m.nodes[k],steps:[]}).startsWith('SOURCE VERIFICATION INCOMPLETE')`);
check('sedation export cannot bypass age guard',`S.pf.age='12';S.ans.sed={a:false,b:false,c:false,d:true,e:false};/Office sedation pathway withheld/.test(planText(M('sed'),walk(M('sed'))))`);
check('strict finite numeric parser',`['Infinity','NaN','1e3','0x10','--2'].every(v=>num(v)===null)&&num('2,5')===2.5`);
check('negative CBCT produces no approach',`newPatient();S.inp.sinus={rbh:'-1'};walk(M('sinus')).invalid.includes('rbh')&&!walk(M('sinus')).out`);
check('manual answer conflict surfaced',`newPatient();S.ans.sinus={a:false,b:false,c:true};S.inp.sinus={rbh:'1'};!!walk(M('sinus')).conflict`);
check('override tied to current numeric facts',`const w=walk(M('sinus'));S.autoOverrides={'sinus:c':{reason:'Clinical reason',fact:JSON.stringify(w.r)}};!walk(M('sinus')).conflict&&(S.inp.sinus.rbh='2',!!walk(M('sinus')).conflict)`);
check('lithium reconciles today and direct pain result',`newPatient();S.pf={age:'44',rxLi:'y',rxMtx:'n',rxSsri:'n'};S.asmt=['rxint'];S.ans.pain={a:false,b:false};!/Ibuprofen|naproxen/.test(tdAnalg({}))&&!/Ibuprofen|naproxen/.test(walk(M('pain')).out.out)`);
check('pediatric today withholds adult dose',`newPatient();S.pf.age='8';!/Ibuprofen 400|naproxen sodium 440/.test(tdAnalg({}))`);
check('liver context withholds generic fixed analgesia',`newPatient();S.pf.age='44';S.ans.liver={a:false};S.ans.pain={a:false,b:false};patientMedicationRisk().organ&&!/Ibuprofen 400|Acetaminophen 1000/.test(tdAnalg({}))`);
check('off-anticoagulant INR has no borrowed 72-hour cutoff',`newPatient();S.pf={proc:'low',inr:'1.0',inrOn:'none',inrRef:'n',inrAge:'old',inrCurrent:'y'};S.draftMode=true;FX.inr.plan(S.pf).d==='proceed'&&!fQs(FX.inr).some(q=>q.k==='inrAge')`);
check('off-anticoagulant clinical currency remains required',`S.pf.inrCurrent='u';FX.inr.plan(S.pf).prov&&FX.inr.plan(S.pf).d==='investigate'`);
check('source gates render every finding without bypassing risk state',`FIND.every(f=>{newPatient();S.asmt=[f.id];const m=asmtModel(),p=fPlan(f);return DISP[m.od]&&DISP[p.d]})`);
check('unverified treatment gated without removing original',`newPatient();S.ans.oac={a:false,b:false,c:false};const m=M('oac');const w=walk(m);!w.out||flowHTML(m).includes('Enable draft material')`);
check('no clinical persistence introduced',`[...storage.keys()].every(k=>['omsCompassAck','oms_compass_practice_mode'].includes(k))`);

// v3.24.0 provisional safer assumption and SOAP note.
check('every CZ key is a real question node',`Object.entries(CZ).every(([mid,o])=>M(mid)&&Object.keys(o).every(id=>M(mid).nodes[id]&&M(mid).nodes[id].q))`);
check('Unknown still halts walk; provisional walk does not mutate answers',`newPatient();S.pf.age='40';S.ans.pain={a:'u'};const before=JSON.stringify(S.ans);const p=walkProv(M('pain'));!walk(M('pain')).out&&!!walk(M('pain')).unk&&JSON.stringify(S.ans)===before&&p.assumed[0].v===true&&/Acetaminophen/.test(p.out.out)`);
check('provisional walk restores an absent module key',`newPatient();walkProv(M('htn'));!('htn' in S.ans)`);
check('NSAID unknown assumes contraindicated; fasting unknown assumes not met',`czVal('pain','a')===true&&czVal('sed','d')===false&&czVal('pain','b')===false`);
check('measurement questions have no safer default and stay paused',`newPatient();S.ans.oac={a:false,b:'u'};const h=flowHTML(M('oac'));czVal('oac','b')===undefined&&walkProv(M('oac')).assumed.length===0&&(h.includes('cz-none')||h.includes('Enable draft material'))`);
check('pending panel shows both branches and the provisional path',`newPatient();S.pf.age='40';S.ans.htn={a:false,b:'u'};const h=flowHTML(M('htn'));h.includes('cz-decides')&&h.includes('cz-prov')&&h.includes('Defer elective')&&h.includes('Plan pending')`);
check('copied pending note keeps the pending line and adds verify list',`const t=planText(M('htn'),walk(M('htn')));t.includes('Plan pending')&&t.includes('PROVISIONAL (not a plan)')&&t.includes('Verify before finalizing')`);
check('provisional outcome respects the draft gate',`newPatient();S.pf.age='40';const m=M('lac');S.ans.lac={a:false,b:false,c:false,d:false,e:'u'};const p=walkProv(m);!!p.out&&czGated(m,p)&&!flowHTML(m).includes(p.out.out)`);
check('SOAP note has four sections, module outcomes and verify list',`newPatient();S.pf.age='40';S.ans.htn={a:false,b:'u'};S.ans.extraction={a:false,b:false};const t=soapText();['S - SUBJECTIVE','O - OBJECTIVE','A - ASSESSMENT','P - PLAN'].every(x=>t.includes(x))&&t.includes('Hypertension: PENDING')&&t.includes('VERIFY BEFORE FINALIZING')&&t.includes('Third molars & extractions:')&&asciiT(t)===t`);
check('SOAP note respects the draft gate',`newPatient();S.pf.age='40';const m=M('lac');S.ans.lac={a:false,b:false,c:false,d:false,e:false};const w=walk(m);const t=soapText();!!w.out&&!t.includes(asciiT(w.out.out))&&t.includes('SOURCE VERIFICATION INCOMPLETE')`);

check('branch preview applies age reconciliation (no adult dose for a child)',`newPatient();S.pf.age='8';S.ans.pain={a:'u'};const h=flowHTML(M('pain'));!h.includes('1000 mg')&&h.includes('generic adult regimen is withheld')`);
check('SOAP reports blocked modules (conflict, invalid data)',`newPatient();S.pf.age='40';S.ans.sinus={a:false,b:false,c:true};S.inp.sinus={rbh:'1'};const t1=soapText();newPatient();S.inp.sinus={rbh:'-1'};const t2=soapText();t1.includes('Sinus lift: BLOCKED')&&t1.includes('VERIFY BEFORE FINALIZING')&&t2.includes('invalid measurement')`);

// All original feature IDs/languages/helpers must remain reachable in the source.
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'feature-baseline.json'),'utf8'));sandbox.baseline=baseline;
check('every baseline module and node retained',`baseline.modules.every(b=>{const m=M(b.id);return m&&b.nodeIds.every(id=>m.nodes[id])})`);
check('every baseline finding/question retained',`baseline.findings.every(b=>{const f=FX[b.id];return f&&b.questionIds.every(id=>f.qs.some(q=>q.k===id))})`);
check('all emergency and pediatric cards retained',`baseline.emergency.every(e=>EMS.some(x=>x.id===e.id))&&baseline.pediatricEmergency.every(id=>PEDS[id])`);
check('all baseline patient materials/languages retained',`[[baseline.handouts,HO],[baseline.faqs,FAQ],[baseline.optionGrids,OG]].every(([bs,now])=>bs.every(b=>{const n=now.find(x=>x.id===b.id);return n&&b.languages.every(l=>n.t[l])}))`);
check('all reference, intraop and pinned features retained',`baseline.referenceCards.every(t=>REF.some(x=>x.t===t))&&baseline.intraop.every(g=>g.items.every(b=>IO.some(([,items])=>items.some(([id])=>id===b.id))))&&baseline.pins.every(b=>PINS.some(([id])=>id===b.id))`);
check('all original named functions remain callable',`baseline.functionNames.every(k=>typeof globalThis[k]==='function')`);

// Exhaustively exercise every terminal path and Unknown stop with the extension loaded.
const modules=run('MODS');let paths=0,unknown=0,nodes=0;
for(const m of modules){const terminals=[],seen=new Set();function dfs(id,answers,stack){assert.ok(m.nodes[id],m.id+': missing target '+id);assert.ok(!stack.includes(id),m.id+': cycle '+id);seen.add(id);const n=m.nodes[id];if(n.out){terminals.push(answers);return}if(n.note)dfs(n.next,answers,[...stack,id]);else{dfs(n.yes,[...answers,[id,true]],[...stack,id]);dfs(n.no,[...answers,[id,false]],[...stack,id])}}dfs(m.start,[],[]);nodes+=Object.keys(m.nodes).length;
 for(const a of terminals){sandbox.mid=m.id;sandbox.answers=Object.fromEntries(a);run(`newPatient();S.pf.age='40';S.ans[mid]=answers;S.draftMode=true`);assert.ok(run('walk(M(mid)).out'),m.id+' terminal path');assert.doesNotThrow(()=>run('flowHTML(M(mid));planText(M(mid),walk(M(mid)))'),m.id+' render/export');paths++}
 for(const [id,n] of Object.entries(m.nodes)){if(!n.q)continue;const p=terminals.find(a=>a.some(([k])=>k===id));assert.ok(p,m.id+'.'+id+' question reachable');const ix=p.findIndex(([k])=>k===id);sandbox.answers=Object.fromEntries([...p.slice(0,ix),[id,'u']]);sandbox.mid=m.id;run(`newPatient();S.pf.age='40';S.ans[mid]=answers`);assert.equal(run('walk(M(mid)).unk?.id'),id,m.id+'.'+id+' Unknown');unknown++}
}
console.log(`${checks} audit/gate/preservation checks passed; ${nodes} nodes, ${paths} terminal paths and ${unknown} Unknown stops exercised. Software behavior only, not clinical validation.`);
