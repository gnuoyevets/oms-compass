# OMS Compass — Change log

Newest first. Every change is reviewed by Steven before publishing. The app shows the same list under the version number (top right).

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
