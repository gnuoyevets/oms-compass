# OMS Compass — Change log

Newest first. Every change is reviewed by Steven before publishing. The app shows the same list under the version number (top right).

## v3.2.0 (draft, branch `deep-neck-draft`) — Oct 23, 2026
- New module: **Deep neck space infection** (hospital consult flow). Airway first → can lie supine for CT → workup (CT neck ± chest, labs, cultures) → empiric IV antibiotics by host → necrotizing/septic/mediastinal → abscess or multispace → single low-risk space medical trial. Look-fors: spread routes, Lemierre, mediastinitis, cavernous sinus thrombosis, non-improvement, discharge.
- Listed under Hospital on-call; Odontogenic infection's emergency outcome links to it.
- Sources: Long et al., Am J Emerg Med 2021 (Ludwig's angina evidence-based review); UNC Radiology teaching file (DNM, Endo classification); your lecture pearls and board notes. Chest-CT threshold, dexamethasone and medical-trial timing tagged verify.
- Awaiting Steven's review before merge.

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
