# OMS Compass — Change log

Newest first. Every change is reviewed by Steven before publishing. The app shows the same list under the version number (top right).

## v3.25.0 — Nov 12, 2026 (approved by Steven Nov 12, 2026) — Author-mode gate, healthy-adult shortcut, Ask-Claude handoff

From the Nov 12 audit. Steven's choices: optimize for himself and office staff; remove the draft gate in Author mode; build the Ask-Claude handoff first; include the "No to all six" shortcut.

- Author mode: source-unverified content shows without the "Enable draft material" tap (module plans, finding plans, the 5 Unverified-draft Ref cards). The Unverified draft label stays, and the copied note carries one line: "Draft content: source not independently verified." Colleague mode is unchanged: same gate, same withheld note.
- Pre-op clearance, Author mode, first question only: "Healthy adult 18+ · No to all 6" answers the six screen questions No in one tap and lists them on the button. It answers only steps waiting for a manual answer; a data input that auto-answers a step, or a loaded photo triage, is never overridden (the button is hidden once triage is loaded or anything is answered). When all six end No it records ASA I and treats the patient as an adult for the analgesia age hold. An entered age under 18 or weight under 50 kg still withholds the adult plan. Changing any answer to Yes clears the ASA I and the adult assertion. The note records "Clinician confirmed in one tap".
- Not changed: the analgesic contraindication and interaction screen. After the shortcut the analgesia line still asks for that screen; no regimen is chosen for the clinician.
- Ask Claude: a chip on module screens and a button on plan, finding and Ref card screens. It opens a sheet for the question and copies a prompt holding the module, answers, open question and criteria, age and weight if entered, the Compass text shown, and answer rules (answer first, cite primary sources, do not recalculate doses). Links are https://claude.ai/new and https://chatgpt.com/ with no query string; clinical text travels by clipboard only. Not on SOS.
- Copied note: the "LA maximum: weight not entered" line is omitted when no weight is entered.
- Fix (v3.24.0 regression): the module top bar had three grid columns for four buttons after Home was added, so SOS dropped onto the chip row and covered the first chip. Now four columns.
- Label: the two Pre-op results "No exclusion found by this screen" (local anesthesia; office sedation) carried "Unverified draft" only because no source key is attached. They are now labelled Screen result with no draft chip, gate or note line, in both modes (Steven, Nov 12, 2026). Any [verify] text or cited source restores the normal label.
- Kept at Steven's choice: the analgesic contraindication screen guard after the shortcut.
- Tests: browser 720 (26 new or changed: section 33 plus one Ref-gate check split into Author and Colleague; the service-worker update check failed once in four runs and passed on rerun); graph 29; reconciliation 78; clinical workflow 39. Software behavior only, not clinical validation. Not tested on a real iPhone or installed PWA.

## v3.24.0 — Nov 12, 2026 (approved by Steven Nov 12, 2026) — obese sedation scaling

- Sedation card: when weight >120% of ideal or BMI ≥30 (height and sex from the Body weight card), Precedex load, re-bolus and fast load use adjusted body weight; ASA I–II ketamine uses ideal body weight. Midazolam, propofol touches, Decadron and glycopyrrolate stay fixed. Never above actual weight. Steven's choices, Nov 12, 2026.
- Actual-weight doses kept under "More", plus a 1:1 ketofol line (propofol 10 mg/mL 10 mL + ketamine 50 mg/mL 2 mL = 12 mL, ≈8.3 mg/mL each).
- Without height or sex, the card shows actual-weight doses and a one-line prompt. Typing height updates the table live.
- New source: dexmedetomidine on adjusted weight in obese ICU patients (Atyia 2023; Robertson 2025) — infusion data, not office bolus; ketamine on ideal weight is convention. Tagged verify.
- Height in cm or feet + inches (Body weight card); the fields mirror each other and feed BMI, ideal/lean weight and the sedation table. Weight already takes kg or lb.
- Home button (⌂) on every page: top bar of SOS, Calc, Ref, Patient and What's new; module, finding and assessment headers (finding/assessment ‹ now shows ⌂ — same action). The standalone patient page already returns to its topic list on every page.
- Before-sedation handout: no smoking or vaping for at least 2 days before (was 12 hours); cannabis 3 days unchanged. EN/ES/Kriolu/中文, app and standalone page. Translations pending native-speaker review, as before.
- Tests: browser 694 (23 new, sections 31–32); graph 29; reconciliation 78; clinical workflow 39.

## v3.23.1 — Nov 6, 2026 (approved by Steven Nov 6, 2026)

- Consultation workspace removed at Steven's request: the Consult tab, its Home card, “Return to consultation” and “Review all symptom groups” buttons, `consultation.js`, `consultation.css` and the consultation browser suite. The original post-op call triage is unchanged.
- Kept from v3.23.0: all audit corrections, the draft gate (now inline in `index.html`), office sedation from age 13 and every earlier feature. The graph/preservation suite is now `tests/graph.cjs` (29 checks; the 29 workspace-only checks were removed with the workspace).

## v3.23.0 — Nov 6, 2026 (approved by Steven Nov 6, 2026) — consultation workspace and audit corrections

- Add an EMR-neutral consultation workspace for initial evaluation, before-booking readiness and surgery-day confirmation, with reviewed structured/text intake and a concise note/task handoff.
- Separate implant/full-arch planning, mucosal/jaw pathology, specific cancer/immunosuppressive therapies and anesthesia suitability. Add surgeon-selected medical/prosthetic requests and a full postoperative symptom review; retain the original quick tools and all v3.22.0 feature IDs.
- Correct airway/imaging order, analgesic reconciliation, adult sedation scope, unanswered exports, ongoing implant nerve injury, jaw differential/biopsy routing, MRONJ eligibility, avulsion dry time, BMJ attribution, qualifying IE procedure, dialysis scheduling, numeric conflicts and off-anticoagulant INR currency. Keep detailed source-unverified recommendations behind explicit encounter draft selection.
- Add distinct NY/CT/RI/MA/NH source/verification prompts without claiming compliance. Keep clinical data session-only and EMR continuity vendor-neutral.
- Preserve current handouts, languages, sharing, QR assets, calculations, SOS, intraoperative records and exports. Version and cache the additive assets; wait for existing clients to close before worker activation.
- Add full graph/preservation and browser acceptance checks. See IMPLEMENTATION-REVIEW.md for evidence, exact scope and pending independent source/clinical/state/device review. No full-text or clinical validation of all cited books/apps is claimed.

Independent validation before merge (Claude, Nov 6, 2026):
- **Draft gate narrowed (defect fixed).** As delivered, the gate hid content whenever a cited source had no “checked” date in the source list. That hid 37 of 39 modules by default, all 25 Ref cards and 10 of 22 findings, including the ADA 2024 analgesic guidance, AHA 2021, ITI consensus content and the call-triage 911 script. Now gated: the 12 listed specialty modules, the dysplasia branch, and content the app already labels “Unverified draft” ([verify] text, binder source, or none). Default now: 5 Ref cards, 3 findings and some non-urgent outcomes in those modules.
- **Urgent outcomes always shown in full**, with the source warning above them (previously replaced by a generic “prompt assessment” line).
- **Author content keeps its existing handling.** Your sedation card and author Ref cards show in Author mode; Colleague mode folds them behind “Show Author’s Clinical Protocol”, as before. They are not draft-gated.
- **Office sedation from age 13** (Steven, Nov 6, 2026; was ≥18 in the delivered patch, <12 lockout before). An entered weight under 40 kg still closes the gate. Ages 13–17 show an adolescent note (AAP/AAPD guidance; check fixed doses against weight-based limits).
- Audit docs (docs/audit-2026-11-06) kept out of the public repo at Steven's request: they hold interview answers and practice context. Inherited public content (office phones, binder link, personal-note Ref cards) approved by Steven to remain.
- Tests: reconciliation 78; clinical workflow 39; consultation 55 (3 new, 1 retargeted from age 15 to 12); browser 671 (8 new, section 30); consultation browser 31.

## v3.22.1 — Nov 6, 2026 (approved by Steven Nov 6, 2026)

Patient handouts condensed without losing information.

- Post-op and sedation handouts: English 1,433 → 1,306 words (9%); Español 6%, Kriolu 5%, 中文 5% (characters). The handouts were already cut 22% in v2.13.1, so the remaining savings are mostly wording.
- **Pain Medication Instructions** (extraction, implant/graft, full-arch; all four languages) about a third shorter. Kept: Advil 400 mg (two 200 mg) + Tylenol 500 mg (one Extra Strength) together every 6 hours for the first 24–48 hours, with food or a snack, ideally before the numbness wears off; then as needed; daily maximums ibuprofen 2,400 mg (only if directed) and acetaminophen 3,000 mg; no other ibuprofen/NSAID/acetaminophen products without asking; call if pain worsens after improving or relief is inadequate. Dropped only “(conservative limit)”.
- English lines tightened (contractions, merged sentences); same content. Spanish, Kriolu and 中文 changed only in the pain block and the Spanish/中文 bleeding line.
- Checked by script: every number in each shortened line is still present; every “Call us” and 911 line keeps its flag; item order unchanged (pictograms and medication-precaution swap still line up). Compass and the patient page carry identical text.
- **Added:** “Trouble breathing or swallowing: call 911” to the implant, bone graft and sinus lift handout (EN/ES/Kriolu/中文, same wording as the extraction handout), shown first with the call-us line. Steven approved Nov 6, 2026.

## v3.22.0 — Nov 6, 2026 (approved by Steven Nov 6, 2026)

Send to patient without exposing your number; office phone always; new pain-medication wording.

- **QR on the share card.** The patient scans it chairside; it opens that handout in their language on the patient page (`/handouts/`). No phone number or account is exchanged. The link holds only the practice (`?site=bayside` or a colleague's `?ph=` office number), the handout id and the language; never patient data.
- **Short text for the front desk.** “Copy text for front desk” copies: title, “📞 Call the office: (number)”, the call-us and 911 lines, and “All instructions and FAQs: link”. About 400 characters. “Share from my phone” remains and is labelled as sending from your own number.
- **Rendered card instead of a text box.** Big tappable Call button, warning lines, QR; full text folded under “Show full text”.
- **Medication precaution or age/weight limit:** no QR or link, because the patient page shows the general pain doses. Copy/share use the full text, which withholds them.
- **Office phone always.** Colleague mode asks once for the office phone (Settings or the card), saved on this device only; until set, the card asks for it and offers no send button. Shared full text now ends with “📞 Phone: (number)” in both modes.
- **Review request** removed from post-op text and the patient page's post-op view; it stays in the day-7 message and on the patient page home.
- **Patient page:** sticky “Call the office” bar at the top; “All instructions and FAQs” link at the bottom of each page; `?ph=` support for colleagues.
- **Pain instructions** (extraction, implant/graft, full-arch; EN/ES/Kriolu/中文) replaced with Steven's wording: “Pain Medication Instructions” — Advil (ibuprofen) 400 mg (two 200 mg tablets) plus Tylenol (acetaminophen) 500 mg (one Extra Strength) together every 6 hours for the first 24–48 hours, with food, before the local wears off; then as needed. Daily maximums: ibuprofen 2,400 mg (only if directed), acetaminophen 3,000 mg (conservative). No extra ibuprofen/NSAID/acetaminophen products without checking. Call if pain worsens after improving or relief is inadequate. Removed from the old line: Tylenol 500–1,000 mg, “never exceed 4,000 mg from all medicines”, “for 2–3 days”, “use a prescribed opioid only if needed”. The separate “Skip ibuprofen with kidney disease…” line is unchanged. Translations machine-drafted, pending native-speaker review.
- QR codes are made in the app (offline; no library). Output checked module-for-module against the reportlab QR encoder: 112 matrices, all 8 masks, versions 1–10, 0 differences.
- Tests: 662 browser checks (17 new, section 29); clinical workflow 39 (5 new, 3 updated for the new pain text); reconciliation 78.

## v3.21.1 — Nov 4, 2026 (approved by Steven Nov 4, 2026)

Fix for "some calculators don't work" (ideal body weight, maintenance fluids, creatinine clearance: result never appeared).

- **Cause:** every keystroke in the age/weight bar redrew the whole Calc tab, including the field being typed in. On a phone that closes the keyboard. Typing the first digit of a weight (e.g. "8" of 80 kg) also briefly met the under-40 kg pediatric lockout, which changed the layout and forced a full redraw. Weight often never registered, so these calculators kept waiting for it. The same applied to the SOS weight bar.
- **Fix:** redraws now keep the block being typed in and replace everything around it; the kg/lb pair and the weight line still update live.
- Comma decimals accepted for weight and calculator numbers (80,5; 1,0). Missing-input messages now say "bar at top" for age and weight.
- Tests: 645 browser checks (8 new, section 28); reconciliation 78; clinical workflow 34.

## v3.21.0 — Nov 4, 2026 (approved by Steven Nov 4, 2026)

- **Pathology & pain, 8 → 6 entries.** No clinical rule changed; the nodes are copied from the original pathways, so each answer gives the same plan as before.
  - *Oral mucosal lesion & dysplasia:* new first question "Biopsy report already shows epithelial dysplasia or carcinoma in situ?" No → the mucosal-lesion steps; Yes → the dysplasia steps.
  - *Jaw lesion & radiolucency:* aggressive signs → established diagnosis → non-vital tooth, then the radiolucency differential, whose outcomes now add "Next: aspirate, then incisional biopsy (or excisional if small)".
  - The old Jaw radiolucency and Dysplasia pathways still open from old links but no longer appear on Home or in search.
- **Pinned row:** Photo triage (opens Claude with the triage prompt) replaces Sedation plan, which stays under Anesthesia & medical.
- Tests: 637 browser checks (9 new, section 27); reconciliation 78; clinical workflow 34.

## v3.20.0 — Nov 4, 2026 (approved by Steven Nov 4, 2026)

- **Keyword search:** a new "Keyword matches" list shows the sentence that matched (module questions, plans and notes; SOS steps; Ref items; handouts) with the words highlighted, each opening its topic. Topic results and the "No Compass entry" message are unchanged.
- **Starts on Decide:** opening the app with a leftover module address (#extraction etc.) goes to Decide and clears it. Deliberate tab links (#handouts, #emergency, #calc, #ref) and old triage links still work.
- **Photo triage prompt:** asks for red flags, ASA, recommendations and a proceed read, in that order, and requires the CT1 code as the last line even when a triage skill is used, nothing is found, or the photo is unreadable. Your Claude "preop-triage" skill itself was not edited.
- **Intraop checklist, All-on-X group** (folds for no-bleeding or simple procedures): prosthetic plan; fiducials and pre-op scans; bone reduction and restorative space, with your low-sinus technique; guide seating; insertion torque (bury or delay if inadequate; posterior ≥4 mm diameter); multi-unit abutments; conversion (passive fit, sealed channels, no cantilever contact); post-placement scan, PRF/grafts, masseter toxin if planned; records, soft diet and no clenching. From your Bayside All-on-X protocol, Implant Ninja notes and journal; not a cited guideline.
- **Ref, 8 new cards** from your Drive notes (OMS Lecture Pearls; Surgical pearls exported from Apple Notes; Oral pathology & imaging) and Readwise (All-on-X, micromotion): asthma & COPD; pediatric & geriatric anesthesia; sedation pharmacology; neuromodulators & Kybella; radiograph interpretation; non-odontogenic jaw lesions; oral cancer workup & neck (notes cite AJCC 7th edition — flagged); full-arch & digital workflow. Labeled as your notes; doses not label-verified.
- **Calc, 6 new calculators:** creatinine clearance (Cockcroft-Gault, with adjusted weight when >120% of ideal); BMI, ideal, lean and adjusted body weight; modified PADSS (item wording [verify]); DOAC time since last dose (half-lives [verify]; the timing rule stays in the DOAC finding); ASA class helper (suggestion from ASA examples); fasting insulin dose (ADA 2026 ranges already in the app).
- **Translations:** Google Translate could not be used from this environment (Google returned its automated-traffic page; no API credentials). Instead, every number was compared across English, Spanish, Kriolu and Chinese handouts and FAQs: no dose, time or temperature differs; the only differences are words written as digits.
- Tests: 628 browser checks (16 new, section 26); reconciliation 78; clinical workflow 34. Software checks only; not clinical validation.

## v3.19.0 — Nov 3, 2026 (approved by Steven Nov 3, 2026)

Four new decision pathways (41 total), from an external patch built on v3.16.0 and reconciled onto v3.18.1. Topic selection informed by the Laskin & Abubaker table of contents; chapters not consulted.

- **Salivary and submandibular swelling:** airway/deep-space/systemic → emergency (EMS for threatened airway); discrete or persistent mass, fixation or facial weakness → expedited head-and-neck assessment and imaging; dental source → Odontogenic infection pathway (linked); acute tender gland with duct pus → same-day assessment for suppurative sialadenitis; meal-related recurrent swelling → evaluate for duct obstruction, consider ultrasound and specialist referral; otherwise focused evaluation. Source: NSW Health adult salivary referral criteria.
- **Suspected jaw osteomyelitis:** deep-space spread, airway or instability → emergency; prior radiation or antiresorptive exposure → evaluate for ORN/MRONJ (MRONJ pathway linked); unexplained sensory loss, mass or atypical destructive lesion → expedited lesion workup with imaging and tissue diagnosis; drainage, nonhealing socket or bone changes → dental source and extent of bone involvement, cross-sectional imaging, deep tissue or bone for culture and histopathology when indicated. Sources: SABR adult chronic nonspinal osteomyelitis consensus (general, not jaw-specific), AAOMS 2022, ISOO-MASCC-ASCO 2024.
- **Suspected odontogenic sinusitis:** vision change, diplopia, painful eye movement or neurologic signs → emergency; ENT-confirmed sinusitis + confirmed ipsilateral dental source → coordinated source control and sinus management; unilateral purulence, foul smell or maxillary symptoms with a plausible dental source → dental evaluation and ENT confirmation (typically nasal endoscopy); otherwise other causes (mucosal thickening alone is insufficient). Sources: international consensus statements on diagnosis and management.
- **Adult OSA referral:** known OSA → obtain study and treatment history; suspected → sleep referral; prior negative/inadequate home study or complicating condition → in-lab polysomnography. Kept separate from Office sedation plan. Source: AASM adult diagnostic testing guideline.
- **Steven's review answers (Nov 3, 2026), applied:**
  - Osteomyelitis: the atypical-lesion question (numb lip/chin, mass, destructive lesion) now comes before radiation/antiresorptive history, so possible recurrence or malignancy is never routed to ORN/MRONJ first. It shows as an expedited action (amber), not the emergency box.
  - Osteomyelitis: antiresorptive exposure defined (any current or past bisphosphonate, denosumab or antiangiogenic). Workup adds a jaw imaging sequence labeled author's practice in the text (panoramic → CBCT/CT → MRI as needed; kept visible in Colleague mode), host factors, and antibiotic timing (stable: sample before antibiotics where feasible; unstable/spreading: empiric antibiotics without waiting).
  - Salivary: new branch for bilateral or diffuse swelling with fever/viral prodrome or systemic disease → medical evaluation. Source relabeled as referral criteria, not a clinical guideline.
  - Odontogenic sinusitis: new branch for a recent sinus opening, graft or implant → Oroantral communication. Dental-first sequencing allowed when the source is clear and symptoms mild, ENT first when severe or foreign material is present [verify].
  - Sources: citation details added (AASM 2017; sinusitis consensus 2020 and 2021); all five marked not checked from this environment, with no check date.
- Reconciliation: test counts updated to 41 pathways and 22 findings; links to Odontogenic infection, MRONJ staging and Oroantral communication.
- Tests: 612 browser checks (29 new, section 25); reconciliation 78; clinical workflow 34. Software checks only; not clinical validation.

## v3.18.1 — Nov 3, 2026 (approved by Steven Nov 3, 2026)

Safety fix found by the code review of v3.18.0 after merge.

- **Top open question, number entry:** each keystroke re-rendered the panel, so the field vanished after the first digit. Typing an INR of 3.6 recorded 3 (in Author mode: Proceed instead of Defer). The field now stays while typing; the panel advances when the entry is finished. The overall chip still updates live.
- Tests: 2 new browser checks.

## v3.18.0 — Nov 3, 2026 (approved by Steven Nov 3, 2026)

Handoff items: one chairside decision, fewer taps.

- **One disposition everywhere.** The pre-op screen is now a disposition source like any finding. Assessment, the procedure view (chip and gate box) and the copied note show the same overall disposition, the reason ("most restrictive source") and a "Next action" line.
  - Unstable or unoptimized condition + elective → Defer elective care. + urgent → Refer / change setting (monitored or hospital setting; do not defer). Urgency unknown → Defer, provisional, with the urgency question listed.
  - Unknown or incomplete pre-op screen → Verify first. Gate findings (IE prophylaxis, antithrombotic, airway) → Proceed with changes, with the items named.
  - Fixed: with no findings, a STOP on the pre-op screen gave no disposition on Assessment; urgent cases were told to defer.
- **SGLT2 readiness.** New inputs: fasting under local; dose-free days before the procedure day (an interval, not a date); timing confirmed.
  - Hold needed for sedation/GA, major surgery or fasting: confirmed ≥3 dose-free days (≥4 ertugliflozin) → Proceed (ADA 2026, FDA labeling).
  - Missed hold, elective → Defer and reschedule; any exception agreed with anesthesia and the prescriber (missed-hold handling is not settled: APSF 2025).
  - Missed hold, urgent → Proceed; monitor closely for ketoacidosis after surgery, including with normal glucose (ADA 2026). Pre-op ketone check marked [verify].
  - Unconfirmed or unknown timing → Verify first. Agent unknown with exactly 3 days → identify the agent.
  - Local anesthesia with normal eating: ADA 2026 and FDA labeling address scheduled surgery, not minor local-only care; stated as a guidance gap (SPAQI 2026 consensus reportedly suggests continuing; [verify]).
- **Top open question in the procedure view.** One line ("Changes the plan: …") that expands to answer the highest-ranked open question in place, with what each answer changes. Reuses the existing ranking.
- **Biopsy result follow-up.** Copy-ready EHR block: result owner (role), expected turnaround in days, overdue action (suggested workflow), patient told, discordant-result step. Unset fields are flagged. New patient clears it.
- Tests: 579 browser checks (19 new); reconciliation 78. Software checks only; not clinical validation.

## v3.17.0 — Nov 3, 2026 (approved by Steven Nov 3, 2026)

Wider drug coverage, chosen by how common a drug is and how much harm it can do in oral surgery. Three new findings (22 total).

- **Sedation interactions:** daily opioids, benzodiazepines and gabapentin/pregabalin stack with sedation (FDA 2016 boxed warning; FDA 2019 gabapentinoid warning). Unknown breathing risk keeps the plan unresolved. Paxlovid or another strong CYP3A4 inhibitor: no oral midazolam; IV midazolam only with close monitoring and a lower dose (UK label; US label marked [verify]).
- **Post-op prescribing check:** SSRI/SNRI → no tramadol (serotonin syndrome, seizures; label). Lithium → no NSAIDs (NHS safety notice). Methotrexate → NSAIDs and penicillins only with the prescriber (label; [verify] US wording). Lithium or methotrexate now suppresses routine ibuprofen advice from other findings and raises a conflict; patient handouts also withhold NSAID dosing unless both are answered No. All three answered No resolves the check.
- **Insulin & sulfonylureas:** local with normal eating → usual doses; fasting → written plan from the diabetes prescriber, with the ADA 2026 dose ranges already in the Diabetes module. Pump, premixed/concentrated insulin or recurrent hypoglycemia → individualized plan first. "Mealtime insulin not taken while fasting" is marked [verify].
- **Post-op analgesia pathway:** lithium/methotrexate added to "NSAID contraindicated?"; tramadol caution with SSRIs/SNRIs.
- **Source limits:** this environment could not open DailyMed, FDA, PubMed or ADA journal pages. New sources record that in their check note. Please review every [verify] line before approving.
- Tests: 560 browser checks (20 new); reconciliation 78. Software checks only; not clinical validation.

## v3.16.1 — Nov 3, 2026 (approved by Steven Nov 3, 2026)

Layout fixes from an audit against a page-design checklist, limited to what helps at the chair. No clinical content or rule changed.

- **Finding header:** the title wraps to two lines and the status pill wraps, instead of both being cut off at phone width.
- **Unresolved panel:** each answer's outcome is its own row with a colored disposition pill, replacing one run-on line. The panel note is shortened to "Provisional until these are answered. Unknown is never read as normal." Copied notes keep the same outcome text.
- **Practice-mode bar:** shown on a finding or the assessment only when switching Author/Colleague changes a plan or a question there. Home keeps the switch.
- Not changed, on purpose: the many small type sizes, the all-caps badges (each carries distinct safety information), the module subtitles on Home and the app's own colors.
- Tests: 540 browser checks (8 new); reconciliation 78. Software checks only; not clinical validation.

## v3.16.0 — Nov 2, 2026 (approved by Steven Nov 2, 2026)

- Acetaminophen: recommend 3,000 mg/day; absolute adult ceiling 4,000 mg/day from all products, lower individual limits apply. All four patient languages and standalone page synchronized.
- Fasting insulin guidance now separates basal analogs from NPH, retains type 1 basal safeguards and avoids automatic fasting reductions under local anesthesia with normal eating. Primary ADA 2026 source review recorded.
- GLP-1 escalation, GI symptoms and maintenance risk use consistent policy text across pre-op, sedation and findings; unknown risk remains unresolved.
- Case parser leaves negated/past context unticked and presents competing lab values for explicit single-result selection with date verification.
- First acknowledgment no longer changes Colleague to Author on reload; explicit saved modes remain intact.
- Patient exports preview current text, carry medication precautions/version/translation status, and withhold generic adult analgesic schedules when recorded risks apply.
- Decision criteria shown inline; redundant criteria control removed. Sedation instructions use elapsed 24 hours; unreachable opioid-step wording removed.
- Validation: 78 reconciliation checks (720 combined cases), 34 clinical-workflow checks, 532 browser checks; all passed. Software checks, not clinical validation. See CLINICAL-WORKFLOW-REVIEW.md for sources, limits and remaining review.

## v3.15.0 — Nov 2, 2026 (approved by Steven Nov 2, 2026; merged to main)

Two bridges prompted by a market comparison: free-text input and imaging AI output.

- **Read as a case.** Type or paste a short history in search, e.g. "72M on Eliquis, INR 2.6, 3 simple extractions under IV sedation". Compass proposes each finding, lab and context item as a tick box. Nothing is recorded until you tap Add, and only ticked items are recorded.
  - Fixed rules on the phone, not AI: nothing is sent anywhere. The typed text is never stored in the assessment or copied into notes.
  - Negated drugs ("denies blood thinners") and held drugs ("stopped Plavix") start unticked. Past antiresorptive or radiation exposure stays ticked, because it still counts.
  - Lab units are never assumed; a platelet count without a unit is not recorded. Replacing a lab clears answers about the old result, as in v3.10.
  - An existing answer is never overwritten unless you tick the replacement. An extraction count without "simple" is not ticked.
  - Unrecognized drugs are listed ("No Compass entry for: metformin"), not silently ignored. Dates and long numbers trigger an identifier warning.
- **Free-text questions.** When no module matches every word, the closest modules are shown instead of "no entry".
- **Imaging AI flag finding.** Record what radiograph or CBCT software flagged: periapical radiolucency, impaction, IAN proximity, sinus change, possible carotid calcification, TMJ change or other lesion.
  - The plan waits for your own read: "I see it too", "I do not see it" or "Unsure".
  - Each flag links to the matching module (Third molars panoramic-sign step, Odontogenic infection, Jaw radiolucency, Sinus lift, TMD and others).
  - Compass does not read images and connects to no vendor; vendor names are search terms only.
  - Carotid: refer to the physician with the image; panoramic films are not vascular screening tools. Source: a case-based review (PMC12614913). The look-alike list is marked [verify].
  - Other flag types are labelled Unverified draft until reviewed.
- **Automated tests on GitHub.** A GitHub Actions workflow (`.github/workflows/tests.yml`) runs both suites on every pull request and push to main, so a failing change can be blocked from merging.
- Tests: 515 browser checks (35 new); reconciliation 78 (3 new), with the 720 combined cases now including the imaging finding. Software checks only; not clinical validation.

## v3.14.1 — Nov 2, 2026 (approved by Steven Nov 2, 2026; merged to main)

- **Bottom bar fits narrow phones.** At 400 px and below the three buttons use 14 px text and tighter padding, so “Assessment” is no longer cut off at 320 px. A count (e.g. “· 12”) wraps to a second line instead of clipping. Layout only; no clinical content changed.

## v3.14.0 — Oct 31, 2026 (approved by Steven Oct 31, 2026; merged to main)

Two features prompted by DSN (AI phone agent; nerve detection), adapted to Compass: no server, no patient data.

- **New module: Post-op phone call triage** (Post-op & complications; also under Hospital on-call). For the person answering the phone. Emergencies first, then in order: bleeding (with pressure coaching; blood thinner or heavy → come in now), infection signs (same day; surgeon reviews before antibiotics), dry socket (within 24 h), numbness next day (call back today; exam this week), sinus signs (1–2 days; sinus precautions), full-arch bridge problems (1–2 days), rash or vomiting (call back today), otherwise reassure with the handout. Each outcome links the matching module; thresholds match the post-op handouts (fever over 100.4°F). Author's draft built from the handouts and textbooks already cited; clinician review needed.
- **Third molars & extractions: Nerve-risk X-ray signs** (Rood & Shehab's seven panoramic signs, plus "overlap, no sign"). Any of the three strongest (darkening of the root, interruption of the white line, diversion of the canal; Su 2017 meta-analysis: one sign ≈ five-fold risk) answers the panoramic-sign step Yes and suggests CBCT if it would change the approach. Weaker signs or overlap alone never auto-answer; overlap without a sign does not rule out contact (JOMS 2008).
- **Post-op call triage pinned** on Decide, between Extractions and Post-op handouts (six pins, two columns).
- Tests: 480 browser checks (10 new; module count 36 → 37); reconciliation 75. Software checks only; not clinical validation.

## v3.13.1 — Oct 31, 2026 (approved by Steven Oct 31, 2026; merged to main)

- **Fix:** "Log to outcomes registry" did nothing when tapped (the click check read the button's empty data value as "no"). It now copies the CR1 line and shows the registry link. The v3.12 test only checked that the button existed; two new tests tap it.

## v3.13.0 — Oct 31, 2026 (approved by Steven Oct 31, 2026; merged to main)

- **Option grids translated** into Español, Kriolu and 中文 (machine-drafted by Claude; pending native-speaker review, like the other translations). Same rows, numbers and sources as English. On the Patient tab they follow the selected language, and Share sends that language.
- **Patient page:** new 4th section, "Choosing a treatment", with the three grids in all four languages. Direct links work (e.g. `#ogimp-es`, `#oggraft-zh`). The caveat ("numbers are averages from studies, not a promise for you") shows on every grid.
- Front-desk QR sheets unchanged (they list post-op instructions and FAQs only).
- Tests: 464 browser checks (4 new; the patient-page mirror test now also compares option-grid text); reconciliation 75. Software checks only; not clinical validation.

## v3.12.0 — Oct 31, 2026 (approved by Steven Oct 31, 2026; merged to main)

Patient side, from the Oct 30–31 audit.

- **Red flags first.** In every post-op handout, the "call us" and 911 lines now come first and are highlighted, on the Patient tab, in shared text and on the patient page, in all four languages. No wording changed.
- **Pictograms.** One icon per handout line (bleeding, ice, no straws, no smoking, diet, pain medicines, phone, 911…). Hidden from screen readers.
- **Teach-back.** Three questions under each post-op handout for the clinician ("I want to be sure I explained it well. Can you tell me…"). Not in shared text. AHRQ Health Literacy Toolkit, Tool 5.
- **Option grids (English).** One-page, side-by-side answers to patients' common questions, Option Grid format:
  - Lower wisdom tooth near the nerve: remove the whole tooth vs coronectomy (Peixoto 2023 meta-analysis via Dental Elf; Di Spirito 2025).
  - Missing tooth: implant vs bridge vs leave the space (Pjetursson 2007; BDJ 2005 correspondence on over-eruption).
  - After extraction: socket graft vs healing on its own (Tan 2012; Avila-Ortiz 2019; Couso-Queiruga 2022).
  - On the Patient tab with a Share button; linked from the Extractions, Implants and Ridge augmentation plans. Each grid says numbers are averages, not a promise.
- **Day-7 check-in message** (English, Español) with the selected site's phone and Google review link; Copy or Share. Author mode only.
- **Patient page:** the Google review request is now a small link at the very bottom, below the note.
- **Registry link (Author mode).** "Log to outcomes registry" on plan cards copies a CR1 line: procedure (from the module), anesthesia and anticoagulant flag (from Pre-op answers), ASA (from Today's plan), age band and the plan. No identifiers or dates. The Surgical Outcomes Registry has a new "From Compass" box that fills the form from it; sex, date and outcome stay manual.
- Tests: 460 browser checks (21 new in section 19); reconciliation suite 75. Software checks only; not clinical validation.
- Not yet: option grids in Español/Kriolu/中文 and on the patient page; teach-back in other languages.

## v3.11.0 — Oct 31, 2026 (approved by Steven Oct 31, 2026; merged to main)

Fast path and clean-up from the Oct 30–31 audit. Goal: a healthy patient to a copied note in about 30 seconds.

- **Pinned row** on Decide: Pre-op clearance, Sedation plan, Implants, Extractions, Post-op handouts (Steven's five most-opened). Hidden while searching. Settings moved below the module list.
- **Today's plan** on Pre-op clearance. Every non-urgent pre-op result (local, sedation, airway plan) ends on one panel:
  - ASA class, one tap (I–IV). III and IV show the existing Office sedation plan wording. Choosing I–III also sets the Calc sedation card's ASA toggle.
  - Local anesthetic maximum for the weight typed there (same table and AAPD/age rules as Calc).
  - Analgesia, reused from the Post-op analgesia module: NSAID first, or acetaminophen when an anticoagulant or antiplatelet was answered Yes (SDCEP).
  - Handout buttons: extraction, implant/graft, and before/after sedation when sedation is planned.
  - Copy note now includes ASA class, LA maximum and analgesia.
  - No new dose, threshold or disposition rule. Held in memory only; New patient clears it.
- **Yes and No carry equal weight.** Yes was a filled button, No outlined; No is the usual answer.
- **Photo triage and Data inputs chips** show on the first question only, unless triage is loaded, inputs are set, or the current step reads entered data (e.g., STOP-Bang). Both stay in the drawer.
- **Plan cards:** source links and the review-status line are folded under "More · sources and review status".
- Healthy local pre-op: 10 interactions from the home screen to a copied note (pin, 6 answers, ASA, weight, Copy).
- Tests: 439 browser checks (25 new in section 18); reconciliation suite 75 checks. Software checks only; not clinical validation.
- Not in this build (next): option grids (extraction vs coronectomy; implant vs bridge vs nothing; graft vs no graft), teach-back prompts, pictograms and red flags first in handouts, a small review link plus a day-7 message, the registry link.

## v3.10.0 — Oct 27, 2026 (approved by Steven Oct 28, 2026; merged to main)

- **Actionable uncertainty.** Assessment and finding screens show one "Before finalizing · unresolved" panel. Each open question appears once per encounter, even when several findings ask it (e.g., "Also on an antiplatelet" for DOAC, warfarin and INR; "INR value and date" no longer repeats "Most recent INR"). Two groups: **Changes the plan** and **Also needed to finalize**. Each item names the next action: Ask patient, Examine, Check records, Obtain result, Contact clinician (radiation oncology, cardiology/device clinic, transplant team where specific) or Decide plan. Where existing branches differ, the item shows what each answer leads to for its own finding (e.g., "Hemodialysis / Not on dialysis → Proceed with changes · Peritoneal dialysis → Verify first"). Facts that wait on a missing result (e.g., INR date before the INR value) are kept under "Changes the plan" and labelled with what they wait on. The separate "Next decisive question" card is merged into this panel; the first decisive question can still be answered inline.
- **Provisional plans stay visible.** No finding defers or refers because inputs are empty (tested across all 18). Copied notes list each open item as `OPEN (changes plan) - <action>: <item>` and say the plan is provisional.
- **Confirmed lab capture from search.** Typing "INR 2.6", "eGFR 28", "platelets 45 k" or "A1c 8.2 %" shows a confirm card; nothing is recorded until "Record … and open". Units are taken only when typed explicitly or chosen on the card (platelets and A1C cannot be recorded without one). Result date and trend are never read from text ("INR 2.6 today" does not set the date). Replacing a value clears the answers about the old result (INR: date, stability, reference range; platelets: date, trend; A1C: date) and the change notice lists what was cleared. The same rule applies when an entered INR, platelet or A1C value is edited on its finding. Commas are rejected rather than misread ("45,000").
- **eGFR.** New optional field on the Kidney disease finding. Documented in the plan and note with its unit and "date not recorded"; below 60 it repeats the existing NKF NSAID line. It never changes the disposition, never relaxes NSAID avoidance, and is never used as CrCl: DOAC interruption still asks for CrCl, with a line saying eGFR is not substituted. "CrCl 40" in search is acknowledged but not stored or converted.
- **Encounter checklist (Intraop).** Each item: Done, Pending or N/A. Sedation checks fold when Local only is entered; implant/graft lot checks fold at no/low bleeding-risk tiers; imaging, fragment and specimen checks fold when no procedure is entered. Folded items stay one tap away; with procedure or anesthesia unset, everything shows and the screen says so. One check per assessment finding ("Warfarin: plan steps from the assessment ready or done", with Open finding). Unresolved questions are listed read-only with Answer buttons. Each status remembers the plan facts it covered and resets when they change (anesthesia → monitors, IV, discharge; plan or findings → consent, medical gate, hemostasis, instructions; weight/age → LA total); the screen names what was reset. Checklist statuses never feed the clinical model (tested).
- **Practice mode.** New users start in Colleague. Existing users keep their stored mode; anyone who used the app before without choosing (disclaimer already accepted) is kept on Author, the previous default. A one-line mode bar on finding and assessment screens switches mode in place; entered facts are kept, including answers only shown in the other mode (the Colleague DOAC dose-time question), and the change notice records the switch. Copied assessment notes and consultation drafts name the mode and list departures from guidelines (Author protocols applied, or "none flagged"); module plan notes name the mode and flag author's-practice content.
- Pre-existing fix: platelet units in copied notes lost the "³" ("x10/mcL"); now "x10^3/mcL".
- Assessment renders faster than v3.9.2 (one ranking pass instead of two): 18 findings 139 ms vs 168 ms at 4× CPU throttle.
- Tests: 414 browser checks (41 new in section 17; two existing assertions updated for the new wording and the migrated mode key); reconciliation suite 75 checks (6 new). Software checks only; not clinical validation.
- Source check (Oct 27, 2026): FDA and NKF pages were not reachable from the build environment. Search results for the Eliquis prescribing guides confirm apixaban dose reduction uses age, weight and serum creatinine, not CrCl, so the DOAC line avoids claiming all DOAC labels use CrCl. No dose, threshold or disposition rule was added.

## v3.9.2 — Oct 27, 2026 (approved by Steven Oct 27, 2026; merged to main)

- **Search box examples:** the placeholder now reads "Drug, lab or topic: Eliquis, INR, dry socket" (was "· e.g. Eliquis"). Fits a 375 px phone screen without cutting off.

## v3.9.1 — Oct 27, 2026 (approved by Steven Oct 27, 2026; merged to main)

- **TMJ arthrocentesis Ref card** revised after feedback from a senior OMS faculty reviewer (email, Oct 27, 2026):
  - The old line "finish with steroid or hyaluronic acid" is now three lines. Steroid: use sparingly, one or two injections per joint. Hyaluronic acid: not FDA-approved for the TMJ (off-label) and causes significant inflammation at first; the avian-allergy caution stays. PRP: an alternative, often given at arthroscopy.
  - Reviewer practice noted on the card: arthroscopy with PRP.
  - New source: Haddad et al., J Oral Rehabil 2023, a systematic review of PRP for TMJ disorders (small, heterogeneous trials). Search now finds the card under "PRP", "platelet-rich plasma", "hyaluronic acid" and "steroid".
- The reviewer is not named in the app.

## v3.9.0 — Oct 27, 2026 (approved by Steven Oct 27, 2026; merged to main)

- **Kriolu and 中文 patient FAQs:** all 15 FAQs translated, on the Compass Patient tab and /handouts/ (links like `#fao-kea`, `#finf-zh`). The "English shown" fallback no longer appears. Machine-drafted by Claude (Kriolu: Santiago variant, same spelling as the handouts); pending native-speaker review.
- **QR sheets rebuilt** after reports of the wrong code scanning: 4 codes per row (was 5), each in its own outlined box, ~0.8 in clear space between codes, codes slightly larger (1.05 in). Two pages per language (post-op + procedures; diagnoses) and Kriolu and 中文 pages added: 8 pages per practice. Each page says to hold the phone close so one code fills the screen. All 168 codes decoded and matched to their pages.
- Tests: 373 browser checks (FAQ translations complete, question counts match English, Kriolu/中文 links on /handouts/); reconciliation suite passes.

## v3.8.0 — Oct 26, 2026 (approved by Steven Oct 26, 2026; merged to main)

- **Seven new Ref cards** (Ref now has 17):
  - Filler complications & vision loss: hyaluronidase on hand; arterial vs venous occlusion; published hyaluronidase doses as a range (≥200 to ~1,500 U per area, tagged verify); nitroglycerin paste optional (weak evidence); vision change = immediate ED/ophthalmology transfer; retrobulbar hyaluronidase unproven.
  - Oral pathology chairside framework (from the Oral Pathology Pearls deck): Rule of 7s (labelled a heuristic), 10–14 day biopsy rule, gauze test, diascopy, Michel's for DIF, MACHO + malignancy, Vincent's sign.
  - Odontogenic cysts & tumors: decompression protocol, Gorlin workup, ameloblastoma/myxoma/CEOT margins, AOT, cementoblastoma, WHO 2022 note.
  - GBR & narrow ridge (Readwise GBR protocol and Dr. Cho lecture); 1.8 mm buccal threshold tagged verify.
  - Implant biomechanics & restorative space (Lecture Pearls Videos 10–12).
  - Orofacial pain red flags: trigeminal neuralgia, giant cell arteritis, atypical odontalgia, burning mouth, cluster (oxygen flow tagged verify), splints.
  - Implant antibiotic prophylaxis: Cochrane 2 g amoxicillin (NNT 25) alongside the EAO 2015 consensus against routine use.
- New sources: Oral Pathology Pearls deck, Readwise Quick Passages, WHO 2022 summary, filler occlusion review, filler vision-loss consensus (2021), Cochrane CD004152, EAO summary. "Your OMS Lecture Pearls" source renamed (no longer limited to infections and fractures).
- Ref cards containing a verify line now show the Unverified draft label (same rule as plans).
- Left out on purpose: the 2015 complications deck's bisphosphonate drug holiday (superseded by AAOMS 2022); AJCC 7th-edition staging from Lecture Pearls (outdated).
- Tests: 370 browser checks (9 new); reconciliation suite passes.

## v3.7.0 — Oct 26, 2026 (approved by Steven Oct 26, 2026; merged to main)

- **Tab renamed** "Post-op" → "Patient" (Decide · SOS · Calc · Ref · Patient). Post-op instructions unchanged, now under a "Post-op instructions" heading.
- **Procedure FAQs (8):** wisdom teeth removal, dental implants, bone grafting/socket preservation, sinus lift, full-arch (teeth in a day), IV sedation, biopsy, exposure of an impacted canine.
- **Diagnosis FAQs (7):** dry socket, tooth infection/facial swelling, numbness after surgery, sinus opening after upper extraction, TMD, MRONJ (bone medicines), peri-implantitis.
- English and Español (drafted by Claude; Spanish pending review). Kriolu and 中文 show English with a note. Share by text like the handouts: practice phone appended, no review link; Colleague mode uses the neutral header. Each FAQ cites existing Compass sources. Search finds them.
- **Patient page (/handouts/)** renamed "Patient information"; home lists After surgery · About your procedure · About your diagnosis. Each FAQ has its own link for texting or QR codes (e.g. `#fwis-en`, `#fao-es`); `?site=bayside` works as before. Kriolu/中文 show English FAQs with a note (section labels and note machine-drafted, pending native review). Emergency answers highlighted in red. No review request on FAQ pages.
- **Patient FAQ button** on the plan screen of 16 modules (third molars, impacted canine, implants, ridge augmentation, sinus lift, full-arch, office sedation, biopsy, oral mucosal lesion, dry socket, odontogenic infection, nerve injury, oroantral communication, TMD, MRONJ, peri-implantitis); opens the matching FAQ on the Patient tab, next to the existing Patient handout button.
- Tests: 361 browser checks (14 new), including a check that post-op and FAQ text on /handouts/ is identical to Compass; reconciliation suite passes.

## v3.6.0 — Oct 25, 2026 (approved by Steven Oct 25, 2026; merged to main)

- **Chairside focus mode** (all 36 decision modules). One question per screen; question 20 px bold (18 px when long); Yes = filled, No = outlined, both full width, stacked, 56 px tall, in the thumb zone. Unknown kept as a smaller third button (Unknown is never read as No — Oct 23 decision).
- **Fixed 56 px header:** back one step · title · step counter · red SOS badge. Counter shows a range ("Step 2 of 3–5") because branches differ in length. SOS from a module shows "‹ Back to <module>" with answers kept.
- **Back one node:** header arrow, swipe right on the screen (edge strip left to the browser), or the system back gesture/button (popstate). Undoes the last answer you gave; auto-answered steps recompute. On the first question, back returns to the module list.
- **Reference drawer** (tap or swipe up the bottom handle): this step's criteria, your answers (tap to change), medical gate, red flags, photo triage paste, data inputs (CBCT, STOP-Bang, TMD scores), look-fors, sources, caveat, reset, Assessment/Intraop/New patient, high contrast. On-screen chips (gate, red flags, triage, inputs) open the matching section. The bottom Assessment bar is hidden inside modules; the drawer replaces it.
- **Plan screen:** high-contrast card; long plans scroll inside the card; Copy note and End session (clears this decision, returns to the list) pinned at the bottom.
- **High-contrast mode (WCAG AAA):** black on white; every text token ≥7:1 (tested); SOS badge 8.8:1. Toggle in Settings and the drawer; follows the phone's "Increase contrast" setting unless switched off. Stored as a setting (`omsCompassContrast`), not patient data.
- Column capped at 430 px; laid out for 360–430 px phones.
- Tests: 347 browser checks (30 new: header, one question per screen, all 142 question screens fit one viewport at 360/390/430 px with no page scroll, back arrow/swipe/system back, node update <100 ms with no reload, drawer, SOS return, AAA contrast). Two older tests updated to open the drawer (Intraop button, triage paste).

## v3.5.1 — Oct 25, 2026 (branch `fix/min-font-12px`, pending Steven's review)

- **Readability.** Smallest text — verify tags, source badges, section labels, table headers, offline badge — raised from 10–11 px to 12 px (8 CSS rules) for chairside glare. No content or logic changes.
- Contrast audit: all text/background tokens pass WCAG AA (≥5.2:1 light, ≥6.7:1 dark).
- Tests: 317 browser checks and reconciliation suite pass.

## v3.5.0 — Oct 25, 2026 (branch `feat/facial-laceration`, pending Steven's review)

- **New module: Facial laceration** (Trauma; listed under Hospital on-call, hidden when on-call is off like trauma triage and mandible fracture; search always finds it). Bigger injury first → deep structures (facial nerve, parotid duct, canaliculus, lid margin/globe) → bites (antibiotics, rabies, facial closure) → contaminated/late wounds → lip, ear, eyelid, nose → simple layered closure. Tetanus look-fors per CDC (reviewed Sep 8, 2026). Sources: AAFP 2017 laceration repair, CDC tetanus, facial nerve review (abstract), WikEM bites summary. Author-drafted or secondary-source lines tagged verify.
- Tests: 317 browser checks (3 new); reconciliation suite updated to 36 modules.

## v3.4.0 — Oct 24, 2026 (approved by Steven after independent review; INR recency and NSAID suppression kept as is)

- Reconcile combined findings into one grouped plan; disclose suppressed conflicting instructions and unresolved alternatives.
- Keep missing/unknown INR and age-dependent precautions provisional; flag pre-op screen contradictions.
- Rank unanswered questions using existing branches; preview approach changes in isolated state with explicit Apply.
- Add in-memory change explanations and a de-identified, copy-only consultation draft.
- Preserve Author/Colleague protocols, existing modules, calculations, handouts and offline support.
- Add deterministic software checks; see RECONCILIATION-REVIEW.md for clinical scope and limitations.
- Independent review fixes: age-restricted LA advice withholds only the restricted drug (hemophilia intraligamentary alternative and buprenorphine acetaminophen kept); missing age no longer escalates; age field keeps focus; no duplicate IDs; Author protocol visible in the reconciled plan; Context panel no longer collapses on New patient; INR recency window off anticoagulants tagged verify. Browser suite 314/314 including new offline/update, accessibility and phone-width checks.

## v3.3.3 — Oct 24, 2026 (approved by Steven after the Oct 24 audit)
- **Dose fixes.** Adult laryngospasm IM succinylcholine capped at 150 mg total (Anectine label). LAST lipid emulsion split at 70 kg per ASRA (>70 kg: 100 mL bolus over 2–3 min, then 250 mL over 15–20 min; ≤70 kg: 1.5 mL/kg, then 0.25 mL/kg/min). Seizure IM midazolam under 13 kg: 0.2 mg/kg, max 10 mg (tagged verify). Under-18 local anesthetic maximums now use AAPD absolute caps (lidocaine and mepivacaine 300 mg, articaine 500 mg, bupivacaine 90 mg) instead of adult caps.
- **Six new findings.** Inherited bleeding disorders (WFH dental guideline: HTC planning, factor cover before IAN block or lingual infiltration, TXA, acetaminophen); heart valve / endocarditis risk / prosthetic joint (AHA 2021, ADA); pacemaker or ICD (APSF 2020 summary of ASA advisory); buprenorphine (Kohan 2021 multisociety panel: continue, multimodal analgesia); epinephrine interactions (TCAs, nonselective β-blockers, cocaine/methamphetamine; Malamed); organ transplant and immunosuppressants (Cobo-Vázquez 2024 review; interaction and timing lines tagged verify).
- **Faster home and SOS.** Hospital on-call and Mode moved into one collapsed Settings row that shows current state. SOS has jump chips to every card. Shorter search placeholder.
- Tests: updated for the Settings row; new checks for the dose fixes, findings and search.

## v3.3.2 — Oct 24, 2026 (branch `feat/universal-triage-prompt`, pending review)
- **Photo triage without the skill.** The “Photo triage in Claude” hand-off (link and clipboard) now sends a self-contained prompt: report sections (red flags, ASA, optimization, advisory read — not a clearance), de-identification, unknown ≠ normal, and the exact `CT1;…` format with every Pre-op clearance and Office sedation step defined. If the reader’s account has a pre-op triage skill, Claude uses it; otherwise the prompt alone produces the code. Step ids are checked against the modules by tests, so the prompt cannot drift from the app.
- **Paste the whole report.** The paste box is now multi-line and pulls the `CT1;…` line out of any surrounding text or code block. `CT1;none` explains nothing was readable.
- Tests: 248 checks (6 new).

## v3.3.1 — Oct 24, 2026 (branch `fix/v3.3.1-audit`, pending Steven's review — not merged)
Audit of reported v3.3.0 defects. Each was reproduced on main before editing (tests section 13).
- **Pediatric SOS.** Child = age <12; or age <18 and weight <40 kg; or no age and weight <40 kg. Adult cardiac-arrest doses and shock energies are no longer shown to children. Pediatric algorithms: cardiac arrest (AHA PALS 2025: CPR ≥⅓ chest depth, 15:2 two-rescuer pre-puberty, 2 J/kg → 4 J/kg → ≥4 J/kg max 10 J/kg or adult dose, epinephrine 0.01 mg/kg max 1 mg q3–5 min, amiodarone 5 mg/kg max 300 mg up to 3 doses or lidocaine 1 mg/kg), bradycardia (PALS 2025: CPR if HR <60 with compromise, epinephrine 0.01 mg/kg, atropine 0.02 mg/kg min 0.1 mg max 0.5 mg), oversedation (naloxone 0.1 mg/kg if <20 kg/<5 y, else 2 mg; flumazenil 0.01 mg/kg max 0.2 mg, total ≤0.05 mg/kg or 1 mg), hypoglycemia (glucagon 0.5/1 mg by weight, nasal 3 mg ≥4 y, dextrose 0.5–1 g/kg as D10), adrenal crisis (hydrocortisone 25/50/100 mg by age band — verify), laryngospasm (succinylcholine 1–2 mg/kg IV / 4 mg/kg IM — verify), bronchospasm (puff count by age — verify). Chest pain, stroke and hypertensive crisis: adult card suppressed, pediatric referral guidance shown.
- **LA age limits.** Articaine blocked under 4 y (AAPD/label); dental bupivacaine blocked under 12 y (Vivacaine label). Missing age with pediatric weight → row asks for age. Copied note says NOT RECOMMENDED.
- **Diabetes.** A1C-alone deferral removed (module and finding). A1C ≥8% (unrounded) flags risk and prompts optimization when timing allows; day-of glucose, symptoms, procedure size and urgency decide. ADA 2026 Section 16 full text could not be retrieved — wording tagged verify.
- **Chronic steroids.** Automatic “no extra cover” replaced with adrenal-risk assessment per ESE/Endocrine Society 2024 (Beuschlein, JCEM): risk with ≥3–4 weeks above ~15–25 mg/day hydrocortisone-equivalent, or other routes; untested at-risk patients get cover — oral for minor stress, parenteral for GA/regional/major/unwell (R3.1A/B); unknown history = at risk; documented recovery = usual dose. Primary AI: cover before and 24 h after oral surgery (NHS SPS). IV sedation not named in the guideline (tagged verify). No fixed stress doses — prescriber sets them.
- **Labs.** Unit must be chosen (A1C, platelets); every numeric field has Unknown; Unknown and missing values never read as normal. Comparisons unrounded (platelets 30.4 > 30; 64 mmol/mol = 8.01% ≥ 8). INR ≥10 on warfarin, or ≥5 off warfarin: “possibly real — verify urgently today, no surgery” instead of “invalid”; only non-numeric or <0.5 entries are entry errors.
- **Assessment.** Decision-changing conflicts raise the overall action (antithrombotic + other bleeding risk, antiresorptive + radiation, GLP-1 + SGLT2 under sedation, lookup conflicts, existing medication-list mismatches) and stay listed as “Resolve conflict” until inputs change. Each finding shows steps and follow-up/escalation on screen; the note carries UNRESOLVED lines, steps and escalation.
- **Practice modes.** Mode label now “Author”. Author applies INR <3.5 and uninterrupted DOACs for dentoalveolar surgery, showing applicability and the guideline difference on the finding, the pre-op note and the copied note. Colleague applies SDCEP rules (INR <4; one-dose DOAC retiming with the dose-time question) and states that author-only content without a guideline equivalent (sedation card, personal Ref notes) is folded, not replaced.
- **Search/mobile.** Preset conflicts (e.g., Xarelto after apixaban) keep the earlier choice and show an unresolved conflict with Use/Keep buttons. Aspirin aliases: ASA, ASA 81, acetylsalicylic acid, Ecotrin, Bayer aspirin, Bufferin, low-dose/81 mg aspirin. “Add to assessment” moved under the recommendation. Link buttons raised to 44 px.
- Tests: 242 checks (66 new). Software checks only; not clinical validation.

## v3.3.0 — Oct 24, 2026
- **Age + weight bar** on Calc and SOS (age · kg · lb), synced with the Assessment Context drawer. kg = lb ÷ 2.20462, rounded to 1 decimal (154 lb → 69.9 kg); both units shown.
- **Pediatric lockout.** Age <12, or no age and weight <40 kg: Calc hides the adult no-pump IV sedation table and shows the PEDIATRIC LOCKOUT card (AAP/AAPD 2019, PALS sizing); the Office sedation module is locked too. LA maximums, 4-2-1 fluids and SOS stay on. SOS shows a pediatric banner listing fixed adult doses that do not apply. Under 18, LA maximums switch to the AAPD pediatric table (lidocaine/mepivacaine 4.4 mg/kg, articaine 7, bupivacaine 1.3; prilocaine not listed — label value kept and flagged; articaine not under age 4).
- **Practice mode** on Home next to Hospital on-call, stored as `oms_compass_practice_mode` (default `author`). Colleague: no Dr. Young/Bayside pills; handouts carry a neutral header and no phone or review link; author's-practice content (Calc sedation protocol, author Ref cards, author notes and plans in Decide) folds behind "+ Show Author's Clinical Protocol".
- **Copy de-identified note** → four plain-ASCII blocks: HISTORY · FINDINGS & RISK · ANESTHESIA & LIMITS · PLAN & ALERTS. Includes pre-op screen answers, medical gate, LA mg and carpule limits by weight, maintenance fluids when sedating, pediatric lockout line, and an NSAID–anticoagulant ALERT. Copy is available with context alone (no findings needed).
- **Content (Task 4):**
  - IE prophylaxis: pediatric doses added (amoxicillin/cephalexin 50 mg/kg, azithro/clarithro 15 mg/kg, doxycycline 2.2 mg/kg <45 kg); clindamycin removed (C. difficile); prosthetic joints alone — no routine prophylaxis. AHA 2021.
  - GLP-1 RA (Office sedation + finding): day-of GI symptoms → defer elective sedation; higher-risk features (escalation, high dose, weekly, gastroparesis) without symptoms → 24 h clear liquids or local ± N₂O; no routine 1-week hold. Source added: Kindel et al., Surg Obes Relat Dis 2024.
  - Antithrombotics: shared local hemostatic bundle (oxidized cellulose/collagen plug, figure-of-8 sutures, 30 min pressure, TXA 4.8–5% rinse/gauze; 500 mg tab in 10 mL ≈ 5%). Warfarin: proceed only if INR <3.5 (author's threshold; SDCEP allows <4). DOACs: no interruption for extractions, alveoloplasty or routine implants (author's practice; CHEST 2022 covers minor dental work; SDCEP one-dose retiming noted as reference). Both labeled Author's practice in the app.
  - MRONJ: incidence by regimen (bisphosphonate ~0.02–0.05%, denosumab ~0.3%, oncologic ~1%+), ≥4 y and steroids raise risk, denosumab timing 3–4 mo after last dose / resume 6–8 wk (tagged verify), CTX not indicated, bisphosphonate holidays unproven.
  - Odontogenic infection: three-tier outpatient empiric box. Checked against the ADA 2019 chairside guide on Oct 24, 2026: amoxicillin, penicillin VK, cephalexin, azithromycin and clindamycin are ADA regimens; cefuroxime, amoxicillin-clavulanate 875/125 BID, up-front metronidazole, azithromycin + metronidazole and moxifloxacin are not, and are labeled so. Warning against oral clindamycin alone.
- **Offline Ready** badge in the header once the service worker controls the page. `sw.js` VERSION → `compass-2026-10-24-v3.3.0`.
- Small controls (`.tg` toggles) raised to 44 px.
- Tests: 176 checks.
- Reviewed by Steven, Oct 24, 2026: AAPD pediatric LA table and SOS pediatric banner approved; warfarin INR <3.5 and uninterrupted DOACs chosen; denosumab timing per literature (6–8 weeks, still tagged verify); AAOMS incidence figures approved; Kindel 2024 cited in Surg Obes Relat Dis; non-ADA antibiotics labeled. Approved for merge.

## v3.2.0 — Oct 23, 2026
- New module: **Deep neck space infection** (hospital consult flow). Airway first → can lie supine for CT → workup (CT neck ± chest, labs, cultures) → empiric IV antibiotics by host → necrotizing/septic/mediastinal → abscess or multispace → single low-risk space medical trial. Look-fors: spread routes, Lemierre, mediastinitis, cavernous sinus thrombosis, non-improvement, discharge.
- Listed under Hospital on-call; Odontogenic infection's emergency outcome links to it.
- Sources: Long et al., Am J Emerg Med 2021 (Ludwig's angina evidence-based review); UNC Radiology teaching file (DNM, Endo classification); your lecture pearls and board notes. Chest-CT threshold, dexamethasone and medical-trial timing tagged verify.
- Odontogenic infection emergency outcome: IV clindamycin now paired with levofloxacin 750 mg q24h; clindamycin alone not recommended (>30% resistance, Long et al. 2021). Approved by Steven.
- Reviewed and approved for merge by Steven, Oct 23, 2026.

## v3.1.0 — Oct 23, 2026
- **Medical gate.** Colour-coded block at the top of procedure modules (sedation, extractions, canine, implants, grafting, sinus, full-arch, peri-implantitis, biopsy, infection, mandible fracture, dentoalveolar trauma, displaced root, oroantral) summarizing Pre-op clearance answers. Red = unstable condition, defer elective. Amber = item to address (IE prophylaxis, antithrombotic, MRONJ/ORN, SGLT2/GLP-1, airway) or any Unknown or incomplete screen. Green only when the screen is complete with no hit, labelled "not a clearance". Links to Pre-op clearance and, when findings exist, the Assessment.
- **Hospital on-call switch** on Home, remembered on the device (preference only, no patient data). On: Facial trauma triage, Mandible fracture, Dentoalveolar trauma and Odontogenic infection listed first under "Hospital on-call". Off: the first two are hidden from the list; dentoalveolar trauma moves to Dentoalveolar & acute. All 30+ modules kept; search reaches everything.
- **Intraop checklist** as a second tab of the Assessment drawer, plus an Intraop button in the bottom bar (bar now also shows inside any module). Time-out, if sedated, pause points (with jumps to Bleeding, Displaced root, Oroantral, Nerve, Calc, SOS) and sign-out. Adapted from the WHO Surgical Safety Checklist (2009); author's draft. Memory only; New patient clears it.
- Yes / No / ? step buttons raised to 44 px.
- Decisions kept from review: Yes / No / Unknown buttons instead of swipe (Unknown stays; swipes misfire with gloves); no "proceed = cleared" wording.
- Tests: 132 checks (25 new for gate tones, on-call grouping and persistence, checklist state, storage privacy, tap targets).

## v3.0.0 — Oct 23, 2026
- **Findings layer.** Search a medication (brand or generic), lab, or prior treatment → what changes, provisional action, what it depends on, targeted questions, next steps, escalation triggers, and an expandable Why (linked module text, sources with publication and check dates). 12 findings: DOACs, warfarin, antiplatelets, antiresorptives/antiangiogenics, GLP-1 RA, SGLT2 inhibitors, chronic steroids, head & neck radiation/chemotherapy, INR, platelets, HbA1c, kidney disease/dialysis. Findings reuse existing module nodes and sources (one source of truth).
- **Search fix.** Root cause of "Eliquis → No match": literal substring search over module text that never named brands. Now: synonym tables, prefix match, typo tolerance (transposition-aware). A miss says "No Compass entry — not the same as no surgical implications."
- **Unknown everywhere.** Every yes/no step has Unknown (?). Unknown halts the path at "Plan pending · verify first"; it is never read as No. Finding actions stay "provisional" while any visible question is unanswered or Unknown.
- **Screens are not clearances.** Outcomes reworded: preop oLocal/oSed, sed oGo, dm oOk, htn oGo, renal oHd/oCkd, liver oComp, onc oGo, steroid oNo, preg oRoutine. Each now shows "Screen result · not a clearance" and what the screen did not cover.
- **Basis labels** on every plan and finding: Guideline / label, Evidence-informed, Author's practice, Unverified draft (descriptive, not evidence grades). Review line shows source-check dates; independent clinician review shown as "not recorded".
- **Assessment (memory only).** Add findings; shared context (age, weight, procedure bleeding-risk tier, anesthesia, urgency) is reused and editable; overall = most restrictive item, raised to "verify first" by listed conflicts; unresolved items; curated conflicts only (anticoagulant + antiplatelet, compounding bleeding risks, NSAID analgesia, steroids + antiresorptive, radiation + antiresorptive, GLP-1 + SGLT2 under sedation, contradictory entries); de-identified copy. Stale answers are dropped when context makes a question irrelevant.
- **New patient** (bottom bar and Assessment header; two taps) clears all patient-specific inputs, module answers, triage import, weight, calculator entries, findings and search. Language/site preferences and the disclaimer acknowledgement are kept.
- **Phone.** Bottom bar hides while a field has focus (keyboard open); numeric fields use decimal keypads with explicit units; live action chip in the header while typing; 44 px tap targets.
- **Photo triage:** URL import removed (no clinical data in URLs). Old `#triage=` links are wiped unread with a message; paste the CT1 code instead. Follow-up: the preop-triage skill should stop emitting the link.
- **Content changes:** Post-op analgesia "NSAID contraindicated?" adds anticoagulant/antiplatelet (SDCEP advises acetaminophen). AAOMS MRONJ source now links the 2022 PDF. New sources: SDCEP full guidance and DOAC companion page, FDA SGLT2 labeling change (via Drug Topics), van Dijk 2021 (ITP platelet thresholds). Copied notes no longer include the date.
- **Tests:** `tests/run.cjs` (Playwright, phone emulation): 107 checks — search, branching, Unknown, units/validation, context changes, conflicts, reset, URL/storage privacy, all modules/tabs render, basis/review display, phone controls. Software checks only; not clinical validation.

## v2.14.0 — Oct 23, 2026
- Photo triage → Pre-op clearance. The pre-op triage report ends with an "Open in Compass" link and a `CT1;…` code. The link (or the code pasted into the new "Paste triage code" box on Pre-op clearance) pre-fills Pre-op clearance and Office sedation, including ASA class (sed steps a/b) and STOP-Bang (preop f, sed c).
- Pre-filled answers are suggestions tagged verify. The path stops on each one until the clinician taps Yes or No; no plan appears from triage alone. Unreadable items stay blank. Copied plan notes mark each step "photo triage, confirmed" or "changed from photo triage".
- Code format: `CT1;preop:a0,b1,…;sed:…;asa:3;sb:4` — node id + 1/0. Yes/no flags and scores only; no identifiers in the URL.

## v2.13.1 + Handouts app v1.7 — Oct 23, 2026
- Streamlined all five handouts in EN/ES/Kriolu/中文 (~22% fewer words): merged related lines; extraction 18→13 items, implant 14→13, full-arch 11→10, before sedation 10→7, after sedation 8→7. No instruction removed. Dry socket folded into the extraction "Call us" line. Compass Post-op tab and /handouts/ (both ?site versions) checked identical by script.

## v2.13.0 + Handouts app v1.6 — Oct 23, 2026
- New handout: Before IV sedation (4 languages). No solid food/milk/gum 8 h; clear liquids until 2 h (ASA 2023 fasting update); ask which usual meds to take; disclose weekly GLP-1 injections (2024 multisociety guidance) and blood thinners; no smoking 12 h; no cannabis 3 days; escort stays and drives; loose sleeves, flat shoes; remove contacts/jewelry/dentures, no nail polish; call if sick. Note: Bayside website still says no water for 8 h — align office instructions.
- Extraction handout: added tea-bag pressure, ice 36 h then moist heat, sit 1 min before standing, high-protein/no skipped meals, salt water 4–6×/day after meals and bedtime, nausea steps, normal findings, dissolving stitches/socket fills ~1 month, dry socket signs, antibiotic reaction.
- OTC pain regimen (extraction, implant, full-arch): ibuprofen 400 mg q6h with food 2–3 days + Tylenol 500–1,000 mg q6h, together OK, Tylenol max 3,000 mg/day, contraindications, no duplicate acetaminophen, opioid only if insufficient. Doses unverified against full ADA 2024 guideline text.
- Implant handout: ice 36 h then heat; no rinse day of surgery, then Peridex BID + salt water after meals; no chewing on implant side 3–4 weeks (soft diet 3–4 weeks if bilateral); denture out as much as possible, no eating with it until adjusted.
- Source: Bayside Oral & Facial Surgery surgical instructions page, reviewed and approved row by row by Steven.

## Fix — Oct 23, 2026
- Offline cache: opening /handouts/ on a phone with Compass installed no longer overwrites Compass's offline copy (and offline Compass no longer opens the handouts page). Compass page always revalidates with the server when online.
- Handouts page description lists all four languages.

## v2.12.2 + Handouts app v1.5 — Oct 23, 2026
- Bayside review link changed from the Google Maps profile to the direct review form: https://g.page/r/CVPfUjdMh6k6EBM/review

## v2.12.1 + Handouts app v1.4 — Oct 23, 2026
- Bayside version (handouts/?site=bayside and the Compass Bayside switch) now shows and dials the Bayside office: (508) 422-5007. Dr. Young version unchanged at (401) 273-7802.

## v2.12.0 + Handouts app v1.3 — Oct 23, 2026
- Review request: "LLC" removed — now "Steven H. Young, DDS, OMS".
- Bayside version: gnuoyevets.github.io/oms-compass/handouts/?site=bayside names Bayside Oral & Facial Surgery and links its Google Maps profile (Seekonk). Default (no ?site) stays Steven H. Young, DDS, OMS. Compass Post-op tab has a Dr. Young / Bayside switch for shared text. Office phone is the same on both for now.

## v2.11.1 + Handouts app v1.2 — Oct 23, 2026
- Google review request ("Steven H. Young, DDS, OMS, LLC would love your feedback…", g.page review link) added in EN/ES/Kriolu/中文: on the handouts page home screen and below each handout, and appended to handout text shared from the Compass Post-op tab. Printed handouts show the link URL. Kriolu/中文 wording pending native-speaker review.

## v2.11.0 + Handouts app v1.1 — Oct 23, 2026
- Handouts (Compass Post-op tab and /handouts/): added Kriolu (Cape Verdean Creole, Santiago variant) and Mandarin (Simplified Chinese) for all four handouts. Machine-drafted by Claude; pending native-speaker review. Handouts app auto-detects Chinese phones (zh) and pt-CV/kea; direct links e.g. #ext-kea, #ext-zh.
- No smoking or vaping: extraction ≥72 h, ideally 1 week (dry socket); implant/graft/sinus and full-arch ≥2 weeks, quitting best. Full-arch previously had no smoking line. Steven's protocol.
- Extraction handout: soft foods 2 weeks; no hard, crunchy or seedy food 3 weeks (was 3 and 5 days). Steven's protocol.

## Handouts app v1.0 — Oct 23, 2026
- New standalone patient page at /handouts/ (gnuoyevets.github.io/oms-compass/handouts/). Same four approved handouts as the Compass Post-op tab, EN/ES (auto-detects Spanish phones), one link per handout (e.g. #ext-es) for texting or QR codes, tap-to-call office, Share and Print. No clinician content or sources shown. Text is copied from Compass; edit both together.

## v2.10.3 — Oct 23, 2026
- Botulinum toxin, TMD and Full-arch: replaced literature ranges with Steven's protocol. Botox 100 U in 2.5 mL (4 U/0.1 mL); masseter only, 4 posterior-inferior points per side; 25 U per side if toxin-naive, titrate to 40 U per side at the 4–6 week recheck; no temporalis or lateral pterygoid; every 3–4 months after reassessment; full-arch dose 2–3 weeks before surgery. Literature context: 10–75 U per muscle (Gkioka 2024, Balkan J Dent Med); dose-response, peak 5–8 weeks, up to 24 weeks (Chen 2023, Aesthetic Plast Surg, doi:10.1007/s00266-023-03256-8). Verify tags remain on full-arch timing and on the risorius-spread rationale for posterior depots.
- Plan text can now show inline amber verify tags.

## v2.10.2 — Oct 23, 2026
- Handouts: no salt-water rinse when Augma Shield was used for grafting — added to the implant/graft handout and to the extraction handout (socket grafts), EN/ES. Steven’s protocol.

## v2.10.1 — Oct 23, 2026
- Handouts moved to a fifth tab labelled “Post-op” (Decide · SOS · Calc · Ref · Post-op); bottom-of-home entry removed.

## v2.10.0 — Oct 23, 2026
- Handouts approved by Steven and made live: home-screen “Post-op handouts” entry, “Patient handout” button on Extractions, Dry socket, Implants, Ridge augmentation, Sinus lift, Full-arch and Office sedation plans; included in search.

## v2.9.1 — Oct 23, 2026
- Feedback link live on every screen (mailto zeniths-raised-7a@icloud.com, pre-filled with module and version).
- Handouts: full-arch liquids 2 weeks, fork-tender food ~3 months, water flosser lowest setting from ~day 7 (from Steven's Drive post-op sheet); office phone (401) 273-7802. Still gated pending final approval.

## v2.9.0 — Oct 23, 2026
- Search box on the home screen across modules, SOS cards and Ref cards.
- New modules: Peri-implantitis (EFP S3 2023, Herrera et al.), Biopsy & specimens (USC Ostrow; ADA oral cancer guideline), Local anesthetic complications (broken needle, methemoglobinemia, LAST pointer, facial palsy, hematoma, paresthesia; Kodsi 2012, emDocs, Kim & Moon 2013).
- Post-op handouts drafted in English and Spanish (extractions, implants/grafts/sinus lift, full-arch, IV sedation), shareable by text. Gated: HANDOUTS_LIVE=false until Steven approves; preview at #handouts. Blanks to fill: full-arch diet and cleaning timing, office phone.
- Feedback button built (mailto with module and version); hidden until FEEDBACK address is set.

## v2.8.0 — Oct 23, 2026
- New Trauma module: Dentoalveolar trauma. Avulsion by dry time and apex stage, replant contraindications, alveolar fracture, extrusion/lateral luxation, intrusion by depth, root fracture, crown fracture with pulp exposure (Cvek), minor injuries; primary teeth never replanted. Base: IADT 2020 via AAPD 2025 flowsheet and published summaries. AAE Apr 2026 guidelines noted; full text not yet reviewed.

## v2.7.1 — Oct 23, 2026
- Full-arch: new bruxism question. Yes adds a load-control note to the plan (splint, flat occlusion, short cantilevers, extra implant, night guard) and botulinum toxin A as an optional pre-surgical adjunct. Evidence: J Oral Rehabil 2023 meta-analysis (OR 2.19 for failure in bruxers); Mijiritsky 2016 retrospective series (n=26). Timing "~1–2 weeks before" tagged verify.

## v2.7.0 — Oct 23, 2026
- TMD: botulinum toxin step for muscle pain still significant after adequate conservative care. Plan card lists consent points, literature dose ranges (no standard dose), contraindications and repeat-dose cautions. Sources: Ferrillo et al., Toxins 2026; RCS England (not first line); NHS Humber & North Yorkshire policy 2025.

## v2.6.1 — Oct 23, 2026
- Adrenal crisis: dexamethasone (Decadron) 4 mg IV as the alternative when Solu-Cortef is unavailable or the diagnosis is unknown. Source: emDocs/CoreEM 2017.
- "OMS Compass Draft" artifact deleted.

## v2.6.0 — Oct 23, 2026
- SOS: six new cards. Angioedema, bronchospasm/asthma, dropped object/aspiration, adrenal crisis, stroke, hypertensive crisis.
- Anaphylaxis: EpiPen for the first dose; repeat doses drawn from the 1 mg/mL ampule (0.01 mg/kg, max 0.5 mg).
- Malignant hyperthermia: Dantrium (20 mg vial) count from weight, 60 mL sterile water per vial, mannitol note. Ryanodex line removed (office stocks Dantrium).
- Disclaimer screen on first open, remembered per phone.
- "What's new" page in the app; this file added.
- Merged the Oct 22 "OMS Compass Draft" artifact (content identical to v2.5.0).
- Items still tagged *verify*: Magill retrieval line, sharp swallowed object → GI, hereditary angioedema on-demand drug.

Sources added: Australian Asthma Handbook; 2025 AHA choking update; Dionysopoulos 2017 (dental aspiration); AAEM ACE-I angioedema statement (2020); AHA/ASA 2026 acute ischemic stroke guideline; Merck Manual hypertensive emergencies (updated Apr 2026); Tennessee EMS adrenal insufficiency protocol; Dantrium IV and EpiPen prescribing information.

## v2.5.0 — Oct 22, 2026
- Sedation protocol added to Calc.
- Earlier changes were not logged.
