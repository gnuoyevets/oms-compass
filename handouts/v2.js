/* OMS Compass v2 patient journey (Consult → Risks → Recovery).
   Deterministic: no network calls, no AI, no storage. The link holds only codes:
   procedure, stage, modifier chips, language, and optionally a draft flag. Never patient data.
   English content is an UNVERIFIED DRAFT written from the existing approved handouts and FAQs,
   pending Dr. Young's review. Until V2_LIVE is true, patient QR codes open the approved handout
   and only a "-d" preview link shows this draft. */
(function (G) {
'use strict';
const V2_LIVE = false;
const V2_VERSION = '2.0.0-draft';
const PROCS = ['ext3', 'imp', 'aox'];
const STAGES = ['c', 'r', 'a'];
/* Canonical order: modifiers always merge in this order, whatever the link order. nd = no general pain doses. */
const MODS = ['sed', 'grf', 'sin', 'ner', 'ant', 'prf', 'imm', 'nd'];
const LANGS = ['en', 'es', 'kea', 'zh'];
const WIN = ['day0', 'd12', 'd35', 'd614'];
const LEGACY = { ext3: 'ext', imp: 'imp', aox: 'arch' };
const DOSE = '§dose', NODOSE = '§nodose';

/* ---------- Procedure modules (English draft) ---------- */
const P = {
ext3: { en: {
 meta: { id: 'ext3', version: V2_VERSION, lang: 'en', clinical_owner: 'Dr. Steven Young, DDS', last_reviewed: '', reading_grade_target: 8, src: ['mcgill', 'coro22'] },
 consult: {
  headline: 'Wisdom tooth or surgical tooth removal',
  summary: 'The tooth is taken out through a small opening in the gum. Sometimes a little bone is removed or the tooth is taken out in pieces. Most people go back to school or work in 3–5 days.',
  decision_options: [
   { option: 'Remove the tooth now', pros: ['Ends pain or infection from the tooth', 'Protects the tooth next to it', 'Healing is usually faster at a younger age'], tradeoffs: ['A few days of swelling and soreness', 'Small chance of dry socket or numbness'] },
   { option: 'Watch it for now', pros: ['No surgery now', 'Reasonable for a healthy tooth that is fully in and easy to clean'], tradeoffs: ['Needs checkups and X-rays', 'Problems can start later, when healing is slower'] }
  ],
  expectation_strip: { chair_time: '30–60 min', social_downtime: '3–5 days', full_bone_healing: 'Socket fills in about 1 month' }
 },
 consent: {
  expected_effects: ['Swelling that is worst on day 2–3', 'Some bruising on the cheek or neck', 'Oozing of blood for 1–2 days', 'A stiff jaw and sore throat for a few days', 'Sharp bony edges you can feel with your tongue'],
  material_risks: [
   { risk: 'Dry socket', plain_english: 'The blood clot is lost too early. Pain gets worse on day 2–4 and may spread to the ear. It is treated in the office and heals in 1–2 weeks.' },
   { risk: 'Infection', plain_english: 'Swelling, pus or fever that starts or gets worse after day 3. It is treated with cleaning and sometimes antibiotics.' },
   { risk: 'Numbness (lower teeth)', plain_english: 'A nerve near lower teeth can be bruised. Numbness of the lip, chin or tongue is usually temporary. Rarely it is permanent.' },
   { risk: 'Sinus opening (upper teeth)', plain_english: 'Upper back roots can sit next to the sinus. A small opening usually closes on its own; a larger one may need a small repair.' },
   { risk: 'Bleeding', plain_english: 'Most bleeding stops with firm pressure on gauze. Rarely, we need to see you to stop it.' },
   { risk: 'Damage nearby', plain_english: 'Rarely, a nearby tooth, filling or crown is chipped or loosened, or the jaw is weakened.' }
  ],
  alternatives: ['Watch the tooth with checkups and X-rays', 'For a lower tooth touching the nerve: remove only the top of the tooth (coronectomy)', 'No treatment']
 },
 triage_days: [
  { window_id: 'day0', label: 'Day 0 — surgery day', normal: ['Oozing of blood', 'Numbness for several hours until the numbing medicine wears off'], do: ['Bite firmly on the gauze for 30 minutes', 'Ice the cheek: 20 minutes on, 20 minutes off', 'Keep your head raised, also when you sleep', DOSE, 'Cool, soft food once the numbness is gone'], dont: ['No rinsing, spitting or straws', 'No smoking or vaping', 'No hard exercise', 'No hot drinks while you are numb'] },
  { window_id: 'd12', label: 'Days 1–2', normal: ['Swelling grows and is worst on day 2–3', 'Bruising', 'Stiff jaw and sore throat'], do: ['From day 2: rinse gently with warm salt water (½ teaspoon in 1 cup) after meals and at bedtime', 'Brush gently, also near the site', 'Soft food with protein, and plenty of fluids', 'Switch from ice to moist heat after 36 hours'], dont: ['No smoking or vaping for at least 72 hours (1 week is best)', 'No chewing on the surgery side', 'No hard, crunchy or seedy food'] },
  { window_id: 'd35', label: 'Days 3–5', normal: ['Swelling starts to go down', 'Bruises turn yellow', 'Opening wider gets easier'], do: ['Keep rinsing after meals', 'Open and close gently to stretch the jaw', 'Most people go back to school or work'], dont: ['No nuts, chips or popcorn yet'] },
  { window_id: 'd614', label: 'Days 6–14', normal: ['The socket is still a small hole that fills in over about a month', 'Food can get stuck in the socket', 'Stitches dissolve or come out'], do: ['Rinse after meals to clear food', 'Add more normal food little by little', 'Keep your follow-up visit if one is scheduled'], dont: ['No hard, crunchy or seedy food until 3 weeks'] }
 ],
 escalation: {
  amber_call_office: ['Bleeding that firm pressure on gauze does not stop', 'Pain or swelling that gets worse after day 3', 'Throbbing pain toward the ear (possible dry socket)', 'Fever over 100.4°F (38°C)', 'Pus or a bad taste', 'Numbness still there the next day'],
  red_go_to_er: ['Trouble breathing or swallowing: call 911', 'Swelling under the tongue or in the neck, or an eye swelling shut: go to the emergency room', 'High fever and feeling very ill: go to the emergency room']
 },
 faq: [
  { id: 'why_remove', q: 'Why remove a wisdom tooth?', a: 'Wisdom teeth often lack room to come in. They can cause infection, decay or gum disease in the tooth next to them, or cysts. We recommend removal when there is a problem now or a high chance of one later.' },
  { id: 'awake', q: 'Will I be awake?', a: 'You choose with us: local numbing only, or IV sedation so you are relaxed and remember little.' },
  { id: 'white_stuff_socket', q: 'Is the white or yellow layer in the socket pus?', a: 'Usually not. A soft white or yellow layer is normal healing tissue. Call us if it comes with more swelling, worse pain, fever or a bad taste.' },
  { id: 'dry_socket', q: 'What is a dry socket?', a: 'The blood clot breaks down or is lost too early, leaving bone exposed. Pain gets worse instead of better, usually 2–4 days after surgery, often toward the ear. We clean the socket and may place a soothing dressing. It is not an infection.' },
  { id: 'sharp_edge', q: 'I feel something sharp in the socket. Is that a piece of tooth?', a: 'Usually it is the edge of the bone. It often smooths over in a few weeks. Call us if it keeps hurting your tongue.' },
  { id: 'back_to_work', q: 'When can I go back to school, work or exercise?', a: 'Most people go back in 3–5 days. Wait about a week for hard exercise.' }
 ]
}},
imp: { en: {
 meta: { id: 'imp', version: V2_VERSION, lang: 'en', clinical_owner: 'Dr. Steven Young, DDS', last_reviewed: '', reading_grade_target: 8, src: ['mcgill', 'pjet07'] },
 consult: {
  headline: 'Dental implant',
  summary: 'An implant is a small titanium or zirconia post placed in the jawbone. It acts like a tooth root and holds a crown. Sometimes bone is added first or at the same time.',
  decision_options: [
   { option: 'Implant', pros: ['The teeth next to the gap are not touched', 'About 9 in 10 implant crowns are still in place after 10 years'], tradeoffs: ['Minor surgery, sometimes with bone grafting', 'Several months before the final tooth', 'Usually the highest cost'] },
   { option: 'Bridge', pros: ['No surgery', 'About 9 in 10 bridges are still in place after 10 years'], tradeoffs: ['The teeth next to the gap are shaped for crowns', 'Cleaning under the false tooth takes extra care'] },
   { option: 'Leave the space', pros: ['No cost or treatment now'], tradeoffs: ['Nearby or opposite teeth may shift over years', 'The bone can shrink, making later treatment harder'] }
  ],
  expectation_strip: { chair_time: '45–90 min', social_downtime: '1–3 days', full_bone_healing: 'About 2–6 months before the final tooth' }
 },
 consent: {
  expected_effects: ['Mild to moderate swelling for 2–3 days', 'Some bruising', 'Oozing of blood for 1–2 days', 'Soreness that over-the-counter medicine usually controls'],
  material_risks: [
   { risk: 'Implant does not join the bone', plain_english: 'Sometimes an implant does not bond to the bone and must be removed. It can often be placed again after healing.' },
   { risk: 'Infection', plain_english: 'Swelling, pus or fever after day 3. It is treated with cleaning and sometimes antibiotics.' },
   { risk: 'Numbness (lower jaw)', plain_english: 'A nerve in the lower jaw can be bruised. Numbness of the lip or chin is usually temporary. Rarely it is permanent.' },
   { risk: 'Sinus problems (upper jaw)', plain_english: 'An upper implant sits close to the sinus. Sinus irritation or infection can happen.' },
   { risk: 'Longer-term problems', plain_english: 'Gum disease around the implant, a loose screw or a chipped crown. Cleaning and checkups lower the risk.' }
  ],
  alternatives: ['A bridge', 'A removable partial denture', 'Leaving the space']
 },
 triage_days: [
  { window_id: 'day0', label: 'Day 0 — surgery day', normal: ['Oozing of blood', 'Numbness for several hours'], do: ['Bite on the gauze for 30 minutes', 'Ice: 20 minutes on, 20 minutes off', 'Keep your head raised', DOSE, 'Soft, cool food on the other side'], dont: ['No rinsing or spitting today', 'Do not touch the site with your tongue or fingers, or pull your lip to look', 'No smoking or vaping'] },
  { window_id: 'd12', label: 'Days 1–2', normal: ['Swelling and bruising', 'Mild soreness'], do: ['From the next morning: prescribed rinse for 30 seconds twice a day, plus warm salt water after meals', 'Brush gently', 'Switch to moist heat after 36 hours'], dont: ['Do not chew on the implant side', 'Denture or flipper: leave it out as much as possible, and never let it press on the site'] },
  { window_id: 'd35', label: 'Days 3–5', normal: ['Swelling goes down', 'A small metal healing cap may show through the gum'], do: ['Keep rinsing and brushing gently'], dont: ['No hard or crunchy food', 'Do not eat with a denture or flipper until we adjust it'] },
  { window_id: 'd614', label: 'Days 6–14', normal: ['The gum looks pink and settled', 'Stitches dissolve or come out'], do: ['Keep your follow-up visit'], dont: ['No chewing on the implant side for 3–4 weeks, or longer if we say', 'No smoking or vaping for at least 2 weeks (quitting is best)'] }
 ],
 escalation: {
  amber_call_office: ['Bleeding that firm pressure does not stop', 'Pain or swelling that gets worse after day 3', 'Fever or pus', 'A loose healing cap or implant', 'Numbness still there the next day'],
  red_go_to_er: ['Trouble breathing or swallowing: call 911', 'Swelling under the tongue or in the neck, or an eye swelling shut: go to the emergency room']
 },
 faq: [
  { id: 'imp_hurt', q: 'Does it hurt?', a: 'Most people say it hurts less than a tooth removal. Over-the-counter pain medicine is usually enough for 2–3 days.' },
  { id: 'imp_when_tooth', q: 'How long until I get my tooth?', a: 'The bone usually needs about 2–6 months to bond to the implant. Sometimes a temporary tooth is placed the same day.' },
  { id: 'imp_last', q: 'How long do implants last?', a: 'Most last many years. Daily cleaning, regular checkups and not smoking give the best chance.' },
  { id: 'imp_risk', q: 'Who is at higher risk of problems?', a: 'People who smoke, have poorly controlled diabetes, grind their teeth, or have had gum disease. Tell us about bone or cancer medicines and head and neck radiation.' },
  { id: 'healing_cap', q: 'What is the metal piece in my gum?', a: 'A healing cap. It shapes the gum for the crown. Call us if it feels loose.' }
 ]
}},
aox: { en: {
 meta: { id: 'aox', version: V2_VERSION, lang: 'en', clinical_owner: 'Dr. Steven Young, DDS', last_reviewed: '', reading_grade_target: 8, src: ['mcgill'] },
 consult: {
  headline: 'Full-arch implants (fixed teeth in a day)',
  summary: 'Failing teeth are removed and usually 4–6 implants are placed. In most cases a fixed temporary bridge is attached the same day. The final bridge is made after the implants heal.',
  decision_options: [
   { option: 'Fixed full-arch bridge on implants', pros: ['Teeth that stay in and do not come out', 'Chewing and speech closer to natural teeth'], tradeoffs: ['Bigger surgery and a soft diet for months', 'Daily cleaning under the bridge and regular maintenance', 'Higher cost'] },
   { option: 'Removable denture on implants', pros: ['Fewer implants may be needed', 'Easier to clean'], tradeoffs: ['Comes out for cleaning', 'Attachments wear and need replacing'] },
   { option: 'Regular denture', pros: ['No implant surgery', 'Lowest cost'], tradeoffs: ['Can be loose, especially on the lower jaw', 'The bone keeps shrinking over time'] }
  ],
  expectation_strip: { chair_time: '3–5 hours', social_downtime: '7–10 days', full_bone_healing: 'About 3–6 months before the final bridge' }
 },
 consent: {
  expected_effects: ['Swelling and bruising that may spread to the cheeks and neck', 'Soreness for about a week', 'Speech and bite feel different for a few weeks', 'Liquid and very soft diet at first'],
  material_risks: [
   { risk: 'Implant does not join the bone', plain_english: 'One or more implants may not bond and need to be replaced. The plan may change.' },
   { risk: 'Broken or loose temporary bridge', plain_english: 'Biting hard food can crack or loosen the temporary bridge. It can usually be repaired.' },
   { risk: 'Infection', plain_english: 'Swelling, pus or fever after the first few days. It is treated with cleaning and sometimes antibiotics.' },
   { risk: 'Numbness', plain_english: 'Numbness of the lip or chin, usually temporary. Rarely permanent.' },
   { risk: 'Sinus problems (upper jaw)', plain_english: 'Upper implants sit near the sinus. Sinus irritation or infection can happen.' },
   { risk: 'Longer-term problems', plain_english: 'Gum disease around implants, worn or chipped teeth, or loose screws. Maintenance visits lower the risk.' }
  ],
  alternatives: ['A removable denture held by implants', 'A regular denture', 'Saving some teeth with other treatment, when possible']
 },
 triage_days: [
  { window_id: 'day0', label: 'Day 0 — surgery day', normal: ['Oozing of blood', 'Numbness for several hours', 'Your new teeth feel bulky'], do: ['Gauze, ice and keep your head raised', DOSE, 'Liquids and very soft food only'], dont: ['Do not try to remove the new teeth', 'No smoking or vaping', 'No straws'] },
  { window_id: 'd12', label: 'Days 1–2', normal: ['Swelling and bruising grow, worst on day 2–3', 'Speech feels different'], do: ['Use the prescribed rinse', 'Liquids and very soft food', 'Switch to moist heat after 36 hours'], dont: ['Do not bite hard food with your front teeth'] },
  { window_id: 'd35', label: 'Days 3–5', normal: ['Swelling starts to go down', 'Bruises may move down to the neck'], do: ['Keep to liquids and very soft food'], dont: ['No chewy or hard food'] },
  { window_id: 'd614', label: 'Days 6–14', normal: ['Speech and bite keep getting easier'], do: ['From about day 7: clean under the bridge twice a day with a water flosser on its lowest setting', 'Keep your follow-up visit'], dont: ['Soft food only for the first 2 weeks, then fork-tender food until we clear you (usually about 3 months)', 'No smoking or vaping'] }
 ],
 escalation: {
  amber_call_office: ['A loose, cracked or moving bridge', 'An uneven bite or one sore spot', 'Swelling, pus or fever', 'Bleeding that firm pressure does not stop'],
  red_go_to_er: ['Trouble breathing or swallowing: call 911', 'Swelling under the tongue or in the neck, or an eye swelling shut: go to the emergency room']
 },
 faq: [
  { id: 'aox_remove', q: 'Can I take the teeth out?', a: 'No. They are fixed to the implants. Only we remove them, for checks and cleaning.' },
  { id: 'aox_final', q: 'When do I get my final teeth?', a: 'After the implants heal, usually about 3–6 months. Until then, follow the soft diet so the implants are not overloaded.' },
  { id: 'aox_natural', q: 'Will it look and feel natural?', a: 'Speech and bite feel different for a few weeks, then most people adapt. The final bridge is shaped to your face and smile.' },
  { id: 'aox_life', q: 'How do I keep them for life?', a: 'Clean under the bridge daily, wear a night guard if we give you one, do not smoke, and keep every maintenance visit.' }
 ]
}}
};

/* ---------- Modifier overlays (English draft) ---------- */
const M = {
sed: { en: { label: 'IV sedation', src: ['hsdm', 'fast'],
 risks: [{ risk: 'Sedation', plain_english: 'Drowsiness, nausea or a bruise at the IV site are common. Breathing problems are rare; you are monitored the whole time.' }],
 days: { day0: { normal: ['Feeling sleepy or forgetful today'], do: ['A responsible adult takes you home and stays with you for the rest of the day', 'Start with sips of clear fluids, then light food'], dont: ['For 24 hours: no driving, machinery, stove cooking, important decisions or signing documents', 'No alcohol for 24 hours', 'Do not care for young children alone today'] } },
 amber: ['A red, painful streak or swelling in the arm at the IV site'],
 red: ['Cannot be woken, or chest pain: call 911'],
 faq: [{ id: 'sed_ga', q: 'Is IV sedation general anesthesia?', a: 'No. Medicine through a small IV makes you deeply relaxed and drowsy. You breathe on your own, and most people remember little.' }, { id: 'sed_driver', q: 'Why do I need a driver?', a: 'Sedation affects judgment and reaction time for the rest of the day, even if you feel fine.' }] } },
grf: { en: { label: 'Bone graft', src: ['tan12', 'avila19'],
 risks: [{ risk: 'Bone graft', plain_english: 'A few graft grains may come out. Rarely the graft gets infected or the cover is exposed, and more graft may be needed later.' }],
 days: { d12: { normal: ['A few sand-like grains in your mouth'], dont: ['Do not pull your lip to look at the site'] }, d614: { normal: ['The graft is under the gum and keeps healing for months'] } },
 amber: ['A large amount of graft grains coming out, or the site opening wide', 'A membrane or graft material showing'],
 red: [],
 faq: [{ id: 'grf_grains', q: 'Is it normal for grains to come out?', a: 'Yes. A few sand-like grains in the first days are normal. Call us if a large amount comes out or the site opens wide.' }, { id: 'grf_source', q: 'Where does the graft come from?', a: 'It may be your own bone, donor bone, animal bone or a synthetic material. Donor and animal grafts are processed and sterilized.' }] } },
sin: { en: { label: 'Sinus precautions', src: ['mcgill'],
 risks: [{ risk: 'Sinus', plain_english: 'A stuffy nose or a little blood from the nose is common. Rarely the sinus gets infected or a small opening forms between the mouth and sinus.' }],
 days: { day0: { dont: ['Do not blow your nose', 'Sneeze with your mouth open', 'No straws'] }, d12: { normal: ['A stuffy nose or a little blood from the nose'] }, d614: { dont: ['Do not blow your nose until day 7', 'No flying for 2 weeks unless we say it is OK'] } },
 amber: ['Fever, or sinus pain or pressure getting worse after day 3', 'Thick, bad-smelling drainage from the nose', 'Graft grains coming from your nose', 'Liquid coming out of your nose when you drink'],
 red: [],
 faq: [{ id: 'sin_what', q: 'What is a sinus lift?', a: 'The sinus is an air space above the upper back teeth. When bone there is too thin, we gently lift the sinus lining and add bone graft so an implant has enough support.' }] } },
ner: { en: { label: 'Close to a nerve', src: ['coro22', 'coro25'],
 risks: [{ risk: 'Nerve close to the surgery', plain_english: 'Your X-rays show the roots close to a nerve. The chance of numbness is higher than usual. Most numbness gets better over weeks to months; a few people keep some.' }],
 days: { day0: { do: ['Be careful not to bite or burn your lip or tongue while numb'] }, d12: { do: ['Check that the feeling in your lip, chin and tongue has come back'] } },
 amber: ['Numbness, tingling or burning still there the next day: call us right away so we can test it'],
 red: [],
 faq: [{ id: 'ner_coronectomy', q: 'Could you remove only the top of the tooth?', a: 'For some lower wisdom teeth touching the nerve, yes (coronectomy). In studies, about 1 in 100 had numbness, compared with about 8 in 100 for full removal. About 4 in 100 later need the roots taken out.' }, { id: 'ner_back', q: 'Will the feeling come back?', a: 'Most numbness improves over weeks to months. If it is not improving, we may refer you to a nerve specialist; earlier is better.' }] } },
ant: { en: { label: 'Bleeding precaution', src: ['sdcepFull'], nd: true,
 risks: [{ risk: 'Bleeding precaution', plain_english: 'You may ooze or bruise more than usual. Bleeding can usually be controlled with pressure; rarely we need to see you.' }],
 days: { day0: { do: ['Keep firm pressure on gauze for 30–60 minutes, longer if still bleeding', 'Take your blood thinner exactly as your doctor and surgeon told you'], dont: ['Do not stop your blood thinner on your own', 'No aspirin, ibuprofen or naproxen unless your doctors say so'] } },
 amber: ['Bleeding that does not slow after 30 minutes of firm pressure'],
 red: ['Bleeding that will not stop after 1 hour of firm pressure, or you feel faint: go to the emergency room'],
 faq: [{ id: 'ant_stop', q: 'Should I stop my blood thinner?', a: 'Do not stop it on your own. Most people keep taking it for this surgery. Your doctor and surgeon will tell you what to do.' }] } },
prf: { en: { label: 'PRF (your own blood)', src: [],
 risks: [{ risk: 'PRF', plain_english: 'A small amount of your blood is drawn and spun to make a healing layer. A small bruise where the blood was drawn is common.' }],
 days: { d12: { normal: ['A rubbery yellow-white layer over the site: this is the PRF, leave it alone'] } },
 amber: [], red: [],
 faq: [{ id: 'prf_what', q: 'What is PRF?', a: 'Platelet-rich fibrin, made from a small sample of your own blood. It is placed in the site to support healing.' }] } },
imm: { en: { label: 'Same-day temporary tooth', src: [],
 risks: [{ risk: 'Temporary tooth', plain_english: 'The temporary tooth is for looks while you heal. Biting on it can loosen the implant or break the tooth.' }],
 days: { day0: { dont: ['Do not bite or chew on the temporary tooth'] }, d614: { dont: ['Still no biting on the temporary tooth until we say so'] } },
 amber: ['The temporary tooth is loose, cracked or comes off'],
 red: [],
 faq: [{ id: 'imm_chew', q: 'Can I chew with the temporary tooth?', a: 'No. It is there for looks. Chew on the other side until we place the final tooth.' }] } },
nd: { en: { label: 'Use the written medication plan', src: [], nd: true, risks: [], days: {}, amber: [], red: [], faq: [] } }
};

/* ---------- Link: parse and build ---------- */
/* v2 hash: v-{proc}-{stage}[-{mod.mod…}]-{lang}[-d]. Strict: unknown, repeated or out-of-order codes are rejected. */
const RE = new RegExp('^v-(' + PROCS.join('|') + ')-(' + STAGES.join('|') + ')(?:-((?:' + MODS.join('|') + ')(?:\\.(?:' + MODS.join('|') + '))*))?-(' + LANGS.join('|') + ')(-d)?$');
function parseV2(hash) {
 const m = String(hash || '').replace(/^#/, '').match(RE);
 if (!m) return null;
 const mods = m[3] ? m[3].split('.') : [];
 const canon = MODS.filter(x => mods.includes(x));
 if (canon.length !== mods.length || canon.join('.') !== mods.join('.')) return null;
 return { proc: m[1], stage: m[2], mods: canon, lang: m[4], draft: !!m[5] };
}
function hashV2(o) {
 const mods = MODS.filter(x => (o.mods || []).includes(x));
 if (!PROCS.includes(o.proc) || !STAGES.includes(o.stage) || !LANGS.includes(o.lang)) throw new Error('invalid v2 link');
 return 'v-' + o.proc + '-' + o.stage + (mods.length ? '-' + mods.join('.') : '') + '-' + o.lang + (o.draft ? '-d' : '');
}
/* Query string: only ?site=young|bayside or ?ph=10 digits (a practice phone) are allowed. Anything else is rejected. */
function validateQuery(search) {
 const q = new URLSearchParams(String(search || '').replace(/^\?/, '')), bad = [], out = {};
 for (const [k, v] of q) {
  if (k === 'site' && /^(young|bayside)$/.test(v) && !('site' in out) && !('ph' in out)) out.site = v;
  else if (k === 'ph' && /^\d{10}$/.test(v) && !('ph' in out) && !('site' in out)) out.ph = v;
  else bad.push(k);
 }
 return { ok: bad.length === 0, bad, ...out };
}

/* ---------- Deterministic composition ---------- */
const clone = o => JSON.parse(JSON.stringify(o));
function composeProtocol({ proc, stage, mods, lang }) {
 if (!P[proc]) throw new Error('unknown procedure');
 const base = P[proc][lang] || P[proc].en, fallback = !P[proc][lang];
 const out = clone(base);
 const order = MODS.filter(x => (mods || []).includes(x));
 out.applied = order.slice();
 out.fallback = fallback ? 'en' : null;
 out.stage = stage;
 out.consent.applied_modifier_risks = [];
 let nd = false;
 const preFaq = [];
 for (const k of order) {
  const mo = (M[k][lang] || M[k].en);
  if (mo.nd) nd = true;
  out.consent.applied_modifier_risks.push(...mo.risks.map(r => ({ ...r, mod: k })));
  for (const w of WIN) {
   const add = mo.days[w]; if (!add) continue;
   const day = out.triage_days.find(d => d.window_id === w);
   for (const f of ['normal', 'do', 'dont']) if (add[f]) day[f].push(...add[f]);
  }
  out.escalation.amber_call_office.push(...mo.amber);
  out.escalation.red_go_to_er.push(...mo.red);
  preFaq.push(...mo.faq);
 }
 const seen = new Set();
 out.faq = [...preFaq, ...out.faq].filter(f => !seen.has(f.id) && seen.add(f.id));
 if (nd) out.triage_days.forEach(d => { d.do = d.do.map(x => x === DOSE ? NODOSE : x) });
 out.nd = nd;
 return out;
}

const api = { V2_LIVE, V2_VERSION, PROCS, STAGES, MODS, LANGS, WIN, LEGACY, DOSE, NODOSE, P, M, parseV2, hashV2, validateQuery, composeProtocol };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
G.V2 = api;
})(typeof window !== 'undefined' ? window : globalThis);
