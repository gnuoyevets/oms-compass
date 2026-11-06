# v3.23.0 consultation and audit corrections — review draft

Compass gains an **EMR-neutral** consultation workspace while retaining the existing quick-reference app. Initial consultation identifies a justified next diagnostic/treatment step; before-booking and surgery-day views add their respective prerequisites. A consultation can end with investigation, observation, referral or further discussion. A complete checklist does not mean comprehensive medical clearance.

## Review scope and preservation

Preservation baseline: **v3.22.0**, `68b5c33ee3e92dc9b335aa28bf0ab8f67697483f`. Implementation parent: **v3.22.1**, `f90ff26773bba734e20b6e7981a9f8b8a533263f`. The later patient-sharing and emergency-handout improvements are retained.

All 41 tree definitions, all baseline node IDs, 22 findings and their questions, 16 SOS cards, 10 pediatric SOS variants, 25 reference cards, 5 handouts, 15 FAQs, 3 option grids, all four languages, 30 static intraoperative checklist items, six pins and original named functions remain. The test compares IDs, languages and helper access against the baseline rather than relying only on counts. All four app icons and both QR PDFs match the canonical v3.22.1 blobs. The standalone patient page and QR generator are unchanged.

The original node ledger (kept privately, not in this repository) covers every baseline node. The resulting runtime graph has **400 nodes, 328 terminal paths and 180 question nodes**. Every terminal path is exercised and every question is checked to stop on Unknown. The unreachable legacy `jaw.o2` is retained; its topic remains reachable through the biopsy tools. These are software/routing checks, not validation of every clinical claim.

## Consultation behavior

- Enter structured facts or paste/device-dictate a de-identified summary. The existing on-device fixed-rule parser proposes supported facts, with source snippets, negation/unsupported-content warnings and competing result selection. No proposal in the new intake is preselected. Confirm selected facts before they enter the shared assessment; dates, units and unresolved conflicts still need review. Raw pasted text is excluded from the note.
- Choose implants/full arch, mucosal lesions/masses, jaw radiolucency, medical/anesthesia suitability, or a full postoperative symptom review. The detailed existing algorithms remain available. Pathology prompts do not calculate diagnostic probabilities. Broad differential categories are explicitly draft material; the original discriminating pathways remain linked.
- Implant planning separates restorative endpoint, growth/development, records, clinical complexity, placement/loading and contingency. Complexity entries are clinician judgments, **not an official ITI SAC calculation**. All-on-X records and detailed intraoperative tools remain available.
- Cytotoxic therapy, immunotherapy/targeted therapy, relevant radiation, immunosuppression, bone-modifying treatment and steroids are recorded separately. Suggestions ask a focused treating-team question. No blanket laboratory panel, drug holiday or definitive cancer treatment is generated.
- Medical and prosthetic-lab suggestions explain the question they could resolve. The surgeon selects tasks, owner, status and review point. Requested/received/reviewed are distinct; changed clinical facts reopen review. Procedure/core-fact changes also reopen dependent readiness confirmations; a known negative constraint or merely requested imaging cannot count as complete. A pathology result task is post-sampling follow-up, so awaiting the report does not itself prevent the planned biopsy. It still requires an owner/review plan.
- Before-booking review covers records, imaging, consent/capacity/alternatives, investigations/lab work, individual instructions and follow-up. Surgery day adds interval changes, reassessment, site/consent and applicable fasting/medication/escort/recovery confirmation.
- The exact concise EMR note and outstanding tasks are previewed before copy. A surgeon review action enables copy and is invalidated by changed facts or task state. Provisional and draft status travel in the text. Copying sends nothing, signs nothing, orders nothing and creates no EMR tasks. The app has no vendor-specific EMR dependency.
- Clinical state is session-only. Reloading loses it. New patient clears consultation, reviewed state, overrides and draft selection while retaining existing device preferences. Durable continuity/re-entry belongs in the chosen EMR.

## Reducing steps and improving usability

The Consult tab adds a direct entry without removing or pushing down the existing quick pins. One shared encounter header reuses procedure, anesthesia, age and medical findings. The next action/rationale appears before detail; original criteria/history/tools remain accessible. Opening a detailed algorithm provides a return to the consultation.

Postoperative symptoms are collected together; the highest urgency is retained alongside other reported problems. Emergency screening remains first. After recording positives and Unknowns, an explicit “remaining groups reviewed and absent” action can confirm the other unassessed groups in one action. It never converts Unknown to No and is disabled until the emergency screen is explicitly negative. This replaces the old first-positive-stops-interview behavior without removing that original script.

Typed fields remain mounted during input, detail panels/focus are preserved across selections, tasks reopen after changes, and no unassigned task is presented as completed. The narrower tree-closing action is labelled **Close this decision**; **New patient** retains its complete encounter reset.

No claim of measured time savings is made. Real-device and representative-case timing studies remain pending.

## Corrections linked to the audit

| Audit | Changed behavior and retained capability |
|---|---|
| A01 | Infection outcome puts threatened-airway stabilization before CT; CT is not a prerequisite to airway care. |
| A02 | Today's plan and direct pain outcomes share recorded age/weight and medication restrictions. Lithium/methotrexate, renal/bleeding/transplant precautions suppress routine NSAIDs; recorded pregnancy and liver-pathway context withhold inappropriate generic regimens. An incomplete contraindication screen does not supply a routine adult regimen. |
| A03 | Office sedation flow, its dose table and copied pathway text require confirmed age 13 or older (Steven, Nov 6, 2026; weight 40 kg or more if entered), with an adolescent AAP/AAPD note for 13–17. This is separate from pediatric SOS/local-anesthetic logic. Younger patients need an age-appropriate plan. |
| A04 | Copy distinguishes Yes, No, Unknown and Not answered. |
| A05 | New `nerve.implantEarly → oImplantEarly` branch addresses possible ongoing implant/foreign-body insult immediately. The phone script also distinguishes this scenario. Transection referral wording no longer imposes one universal repair window. |
| A06 | Copied jaw differential outcomes no longer append a blanket aspiration/incisional-biopsy instruction. Clinical/imaging correlation and diagnosis-specific observation, radiology review or sampling remain, with a vascularity precaution and access to biopsy planning. |
| A07 | New `mronj.eligibleDrug`, `eligibleExclusion`, `oNotMronj` require case-definition exposure and exclusion review before staging. Stage 3 question explicitly includes infected/inflamed exposed/probeable disease plus extension/complication. |
| A08 | Avulsion asks cumulative dry time <60 minutes or immediate replantation; later storage medium no longer negates prolonged dry time. Detailed avulsion treatment still requires source review. |
| A09 | TMD caveat correctly reports BMJ 2023's conditional recommendation against botulinum toxin for chronic TMD pain; personal alternative remains labelled. |
| A10 | New `preop.ieProcedure` requires a qualifying procedure before prophylaxis. Pediatric doses are capped at the corresponding adult dose; current antibiotic use requires regimen review. |
| A11 | Added full symptom review, urgency aggregation, culprit-medication qualification and 911 transport wording. Existing callback promises in the legacy script remain draft content requiring office approval. |
| A12 | Dialysis timing/anticoagulation is coordinated with nephrology; the tree no longer directs resuming dialysis about two days after dental surgery. |
| A13 | Finite decimal parsing; negative/nonfinite CBCT values halt approach selection. Manual/automatic disagreement requires correction or an explained override tied to current inputs. Changed measurements invalidate the override; copied notes include the reason. Unusual but finite measurements still need clinician plausibility review. |
| A14 | Infection/socket and peri-implant outcomes state what the screen supports and the further assessment needed. Opioid wording requires an exact selected formulation and reconciliation of total acetaminophen. |
| A15 | Removed the borrowed 72-hour INR rule off anticoagulants; added an explicit clinical-currency question. New `onc.therapy` separates relevant radiation history from a chemotherapy-only route. Other advanced specialty/drug details remain source-unverified draft content. |

The seven added tree nodes are explicitly listed above (one IE qualifier, two nerve nodes, three MRONJ nodes and one radiation-history question). Existing nodes/links are retained and all new questions stop on Unknown.

## Source status and draft controls

Selected primary-source corrections were checked during the audit: [CALAOMS nerve evaluation 2024](https://assets.noviams.com/novi-file-uploads/calaoms/documents/CALAOMS_Nerve_Evaluation_Protocol_2024.pdf), [AAOMS MRONJ 2022](https://aaoms.org/wp-content/uploads/2024/03/mronj_position_paper.pdf), [AHA/ADA prophylaxis](https://www.ada.org/resources/ada-library/oral-health-topics/antibiotic-prophylaxis), [IADT avulsion 2020](https://doi.org/10.1111/edt.12573), [BMJ TMD 2023](https://www.bmj.com/content/383/bmj-2023-076227), and [AAP/AAPD pediatric sedation](https://doi.org/10.1542/peds.2019-1000). They support the particular corrections; they do not validate every derivative instruction in the app.

Guideline/Colleague mode remains the first-use default. Existing explicit Author preference is preserved. Personal alternatives remain labelled. A separate **encounter-only clinician draft selection** exposes source-unverified terminal recommendations, reference/author material and affected findings. Source keys/review annotations and a conservative module list determine these gates; this is not an automated evidence grader. Draft selection cannot resolve Unknown, invalid inputs, contradictions, age restrictions or contraindications. Emergency response/SOS access stays available while detailed source-unverified advice requires review. Draft status is retained in relevant copies.

Unverified verification queue remains: advanced sedation combinations/ASA III dosing, antibiotic regimens, deep-space drainage criteria, OAC/displaced-root thresholds, fracture/laceration recipes, ORN drug regimens, canine/transplantation selection, dysplasia subgroups, specialist bleeding-disorder details and other source-marked extrapolations. Gating makes these reviewable; it does not validate them or imply they are all wrong.

The requested Laskin/Abubaker decision workflow, ITI SAC dimensions, AAOMS coverage, AO organization and other books/apps inform problem → discriminating facts → action/rationale → alternatives → follow-up structure. Full texts, subscription resources, NCCN versions and institutional protocols were **not all accessible**. The reference alignment report (kept privately) records that distinction. No proprietary algorithm is reproduced and no official endorsement is claimed.

## NY, CT, RI, MA and NH

Separate profiles link official sources and ask for case-specific provider, facility/location, technique and age-scope verification. Changing state clears that confirmation. None returns “legally compliant.”

| State | Review basis as of 2026-11-06 |
|---|---|
| NY | [NYSED certificate page](https://www.op.nysed.gov/professions/dentists/dental-anesthesia-sedation-certification), [Part 61](https://www.op.nysed.gov/title8/regulations-commissioner-education/part-61): indexed official material located; full rule review pending. |
| CT | [DPH overview](https://portal.ct.gov/DPH/Practitioner-Licensing--Investigations/Dentist/Administration-of-Dental-Anesthesia-and-Consious-Sedation) read; [current statute](https://www.cga.ct.gov/2026/sup/chap_379.htm) and office-specific applicability review pending. |
| RI | [216-RICR-40-05-2 §2.11](https://rules.sos.ri.gov/Regulations/part/216-40-05-2) read; provider/facility and pediatric scope remain case-specific. |
| MA | [Permit page](https://www.mass.gov/how-to/apply-for-an-individual-dentists-anesthesia-sedation-permit), [234 CMR 6](https://www.mass.gov/doc/234-cmr-6-administration-of-anesthesia-and-sedation/download): indexed official material located; full rule review pending. |
| NH | [Official Den rules page](https://gc.nh.gov/rules/state_agencies/den100-500.html) read; detailed category and office-specific applicability review pending. |

## Verification and remaining review

Run `node tests/reconciliation.cjs`, `node tests/clinical-workflow.cjs`, `node tests/consultation.cjs`, `node tests/run.cjs`, and `node tests/consultation-browser.cjs` (Playwright/Chromium required for the last two).

The dependency-free suites cover reconciliation, 720 combined cases, clinical regressions, all graph paths/Unknown stops, baseline preservation, source/draft/age guards, tasks and handoff invalidation. Browser suites exercise existing features and new intake/selection/preview/reset, focus, three widths (320/390/768), storage and offline/update behavior. Existing-content browser fixtures explicitly select draft and confirmed adult age where those are now prerequisites; dedicated new tests cover defaults and restrictions.

Service-worker assets include the new versioned JS/CSS. Non-success navigation responses do not replace a usable cached app. An update waits for existing clients to close instead of force-claiming an active encounter; external source links and the standalone patient page still need a connection as before.

Pending before clinical release: independent specialty/source review of the remaining queue, full applicable state-rule/credential/facility review, real iPhone/iPad/Safari/installed-PWA and assistive-technology testing, and clinician review of representative de-identified scenarios. Translation review remains as in the baseline. No autonomous EMR integration, persistent reminder service or automatic order/referral capability is represented as complete.


## Independent validation before merge (Claude, Nov 6, 2026)

- Patch applied cleanly to main `f90ff26`; all five suites reproduced the recorded counts before changes.
- Changes to the existing browser suite were reviewed: mechanical draft-mode/age fixtures and local-only routing, plus intended behavior changes (sedation age, jaw next step, IE qualifying procedure, update activation). No assertion was removed.
- **Defect fixed: draft gate breadth.** Gating keyed on missing `chk` dates in source metadata, hiding 37/39 modules, 25/25 Ref cards and 10/22 findings by default. Now keyed on the app's own basis label (`basisOf` = Unverified draft) plus the listed specialty modules; urgent outcomes always render in full; author content keeps its Author/Colleague handling.
- **Change requested by Steven:** office sedation from age 13 (entered weight <40 kg still gates), adolescent note for 13–17.
- Service worker reviewed: online navigation is network-first, and the old worker caches the new versioned assets on first use, so delayed activation does not break offline use.
- Not independently re-verified here: every clinical threshold and citation in the new consultation workspace, state-rule applicability, translations and real-device Safari/PWA behavior. These remain as listed above.
