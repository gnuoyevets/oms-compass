/* v2 patient journey: link budget, zero-PHI link rules and deterministic composition.
   Software checks only; they do not establish clinical validity. No dependencies. */
const assert = require('node:assert/strict'), path = require('node:path');
const V = require(path.join(__dirname, '..', 'handouts', 'v2.js'));
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++ };
const BASE = 'https://gnuoyevets.github.io/oms-compass/handouts/';
const QS = ['', '?site=bayside', '?site=young', '?ph=4015551234'];

/* 1. Every valid combination: link under 150 characters and parses back to the same codes. */
const subsets = []; for (let m = 0; m < 1 << V.MODS.length; m++) subsets.push(V.MODS.filter((_, i) => m >> i & 1));
let combos = 0, longest = '';
for (const proc of V.PROCS) for (const stage of V.STAGES) for (const mods of subsets) for (const lang of V.LANGS) for (const draft of [false, true]) for (const q of QS) {
 const h = V.hashV2({ proc, stage, mods, lang, draft }), url = BASE + q + '#' + h;
 if (url.length > longest.length) longest = url;
 assert.ok(url.length < 150, url);
 assert.deepEqual(V.parseV2('#' + h), { proc, stage, mods, lang, draft });
 combos++;
}
ok(combos === 3 * 3 * 256 * 4 * 2 * 4, 'all combinations generated');
ok(longest.length < 150, `every link < 150 characters (longest ${longest.length}: ${longest})`);
ok(V.hashV2({ proc: 'ext3', stage: 'r', mods: ['ant', 'sed'], lang: 'en' }) === 'v-ext3-r-sed.ant-en', 'modifiers are written in canonical order');

/* 2. Strict link parsing: anything not built from the code lists is rejected (no free text, names, dates or tooth numbers). */
for (const bad of ['v-ext3-r-en-x', 'v-ext4-r-en', 'v-ext3-x-en', 'v-ext3-r-sed.sed-en', 'v-ext3-r-ant.sed-en', 'v-ext3-r-foo-en', 'v-ext3-r-fr', 'V-EXT3-R-EN',
 'v-ext3-r-en-d-d', 'v-ext3-r-sed.-en', 'v-ext3-r-jane-en', 'v-ext3-r-2026.11.19-en', 'v-ext3-r-t32-en', 'v-ext3-r-en?name=x', 'ext-en', '', 'v-ext3-r-sed.ant-en-d '])
 ok(V.parseV2(bad) === null, 'rejects link ' + JSON.stringify(bad));
assert.throws(() => V.hashV2({ proc: 'x', stage: 'r', mods: [], lang: 'en' }));
ok(V.hashV2({ proc: 'imp', stage: 'c', mods: ['jane', 'sed'], lang: 'es' }) === 'v-imp-c-sed-es', 'unknown modifier codes never reach the link');

/* 3. Zero-PHI query validator: only one ?site= or one 10-digit practice ?ph=. */
for (const good of ['', '?site=bayside', '?site=young', '?ph=4015551234']) ok(V.validateQuery(good).ok, 'accepts ' + JSON.stringify(good));
for (const bad of ['?name=Jane', '?site=bayside&dob=1990-01-01', '?ph=401', '?site=clinic', '?tooth=32', '?site=young&ph=4015551234', '?mrn=123', '?site=bayside&site=young', '?utm_source=x', '?ph=4015551234&appt=11-20'])
 ok(!V.validateQuery(bad).ok && V.validateQuery(bad).bad.length > 0, 'rejects ' + bad);
ok(V.validateQuery('?site=bayside&name=Jane').site === 'bayside', 'allowed part is kept when an unexpected parameter is dropped');

/* 4. Composition: deterministic, pure, and modifiers land in the right day windows. */
for (const proc of V.PROCS) {
 const base = JSON.stringify(V.P[proc]);
 const a = V.composeProtocol({ proc, stage: 'a', mods: ['sin', 'sed', 'ant'], lang: 'en' }), b = V.composeProtocol({ proc, stage: 'a', mods: ['ant', 'sin', 'sed'], lang: 'en' });
 ok(JSON.stringify(a) === JSON.stringify(b), proc + ': same output whatever the chip order');
 ok(JSON.stringify(V.P[proc]) === base, proc + ': composing does not change the base module');
 ok(V.P[proc].en.triage_days.map(d => d.window_id).join() === V.WIN.join(), proc + ': four day windows in order');
 ok(V.P[proc].en.triage_days[0].do.includes(V.DOSE), proc + ': day 0 carries the pain-dose line');
 ok(V.P[proc].en.escalation.red_go_to_er.every(t => /911|emergency room/.test(t)), proc + ': every red line says 911 or emergency room');
 for (const k of V.MODS) {
  const c = V.composeProtocol({ proc, stage: 'r', mods: [k], lang: 'en' }), mo = V.M[k].en;
  for (const w of V.WIN) {
   const day = c.triage_days.find(d => d.window_id === w), plain = V.P[proc].en.triage_days.find(d => d.window_id === w);
   for (const f of ['normal', 'do', 'dont']) {
    const added = (mo.days[w] && mo.days[w][f]) || [];
    ok(day[f].length === plain[f].length + added.length && added.every(x => day[f].includes(x)), `${proc}+${k}: ${w}.${f} gets exactly its own items`);
   }
  }
  ok(mo.amber.every(x => c.escalation.amber_call_office.includes(x)) && mo.red.every(x => c.escalation.red_go_to_er.includes(x)), `${proc}+${k}: escalation lines appended`);
  ok(c.consent.applied_modifier_risks.length === mo.risks.length, `${proc}+${k}: "Applies to your surgery" risks`);
  ok(mo.faq.every((f, i) => c.faq[i].id === f.id), `${proc}+${k}: modifier FAQs come first`);
 }
 const all = V.composeProtocol({ proc, stage: 'a', mods: V.MODS, lang: 'en' });
 ok(new Set(all.faq.map(f => f.id)).size === all.faq.length, proc + ': FAQs deduplicated by id');
}
/* Dedup when a modifier repeats a procedure FAQ id. */
V.M.prf.en.faq.push({ id: 'why_remove', q: 'dup', a: 'dup' });
const d = V.composeProtocol({ proc: 'ext3', stage: 'r', mods: ['prf'], lang: 'en' });
ok(d.faq.filter(f => f.id === 'why_remove').length === 1 && d.faq.find(f => f.id === 'why_remove').q === 'dup', 'duplicate FAQ id kept once (modifier version first)');
V.M.prf.en.faq.pop();

/* 5. Pain doses: bleeding precaution (ant) or nd replaces the general dose line; nothing else does. */
for (const proc of V.PROCS) {
 ok(V.composeProtocol({ proc, stage: 'r', mods: ['sed', 'grf'], lang: 'en' }).triage_days[0].do.includes(V.DOSE), proc + ': doses shown without ant/nd');
 for (const k of ['ant', 'nd']) {
  const c = V.composeProtocol({ proc, stage: 'r', mods: [k], lang: 'en' });
  ok(c.nd && !JSON.stringify(c).includes(V.DOSE) && c.triage_days[0].do.includes(V.NODOSE), `${proc}+${k}: general doses withheld`);
 }
}

/* 6. Translation fallback is flagged; draft content is not live. */
ok(V.composeProtocol({ proc: 'imp', stage: 'r', mods: [], lang: 'zh' }).fallback === 'en', 'missing translation falls back to English and is flagged');
ok(V.V2_LIVE === false, 'v2 content stays a draft until approved (flip V2_LIVE after review)');

/* 7. Readability: average Flesch–Kincaid grade of the patient text, target ≤ 8. */
const texts = []; const walk = o => { if (typeof o === 'string') { if (!o.startsWith('§')) texts.push(o) } else if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => k !== 'meta' && k !== 'src' && k !== 'id' && k !== 'window_id' && walk(v)) };
V.PROCS.forEach(p => walk(V.P[p].en)); V.MODS.forEach(k => walk(V.M[k].en));
const syl = w => { w = w.toLowerCase().replace(/[^a-z]/g, ''); if (w.length <= 3) return 1; w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, ''); const m = w.match(/[aeiouy]{1,2}/g); return m ? m.length : 1 };
let W = 0, S = 0, Y = 0; for (const t of texts) { const ws = t.split(/\s+/).filter(x => /[a-z]/i.test(x)); if (!ws.length) continue; W += ws.length; S += Math.max(1, (t.match(/[.!?](\s|$)/g) || []).length); Y += ws.reduce((a, w) => a + syl(w), 0) }
const grade = 0.39 * W / S + 11.8 * Y / W - 15.59;
ok(grade <= 8, `reading grade ${grade.toFixed(1)} ≤ 8 (${texts.length} strings)`);

console.log(`${n} v2 checks passed (${combos} links; longest ${longest.length} characters; reading grade ${grade.toFixed(1)}). Software checks only, not clinical validation.`);
