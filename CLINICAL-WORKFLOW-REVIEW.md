# Clinical workflow fixes — v3.16.0

Prepared November 2, 2026, against main `f795ac02fa7ccec7df9c872c7163648d1ac93afa`. Local branch: `fix/clinical-workflow-audit`. Publication approved by Steven in this chat November 2, 2026.

## Changes

- Acetaminophen: recommend no more than 3,000 mg/24 h; retain 4,000 mg/24 h as the absolute adult ceiling from all products, with lower individual limits. Updated extraction, implant and full-arch instructions in all four languages and the standalone patient page. The 3,000 mg recommendation is Steven's practice preference, confirmed in this chat November 2.
- Insulin: removed the blanket 50% morning reduction for long/intermediate insulin. The fasting-surgery reference separates 75–80% long-acting basal analog dosing from half-dose NPH, retains basal insulin in type 1 diabetes, and requires individual planning for timing, pumps, premixed/concentrated insulin and hypoglycemia/renal risk. Normal eating under local anesthesia does not automatically trigger fasting reductions. No insulin dose calculator or prescription generator added.
- GLP-1: shared policy text across pre-op, sedation and medication findings. Separate escalation and GI-symptom deferral branches from maintenance-dose risk mitigation. Unknown maintenance risk cannot produce a final low-risk plan. Urgent care requires individualized setting/airway planning. No blanket week-long medication hold.
- Parser: negated or historical procedure/anesthesia/urgency context stays unselected. Multiple results for a lab remain visible and unselected, with their source snippets. Selecting one deselects others; importing multiple competing results is rejected. Result date remains a separate required check. Rules are conservative proposals, not a full language-understanding system.
- Practice mode: missing preference defaults to Colleague; acknowledgment no longer implies Author. Existing saved Author/Colleague preferences remain intact. Previously auto-migrated Author preferences cannot be distinguished from deliberate choices, so saved preferences are not reset.
- Patient export: a review preview precedes copy/share. Recorded renal, transplant, antithrombotic, bleeding-disorder, buprenorphine, age/weight and explicit NSAID precautions withhold the generic adult analgesic schedule; the patient is directed to an individual written plan. This does not invent replacement medication orders. Preview text is regenerated from current state, language and practice before confirmation; New patient clears the preview selection.
- Handout, FAQ and option-grid text carry version/language and general-instruction status. Translated text carries its draft-review warning. The standalone QR page remains general information; it cannot carry encounter-specific medication changes. Patient clinical facts are not encoded in links.
- Decision criteria now appear beside each question, with the redundant criteria button removed. References/history remain in the drawer. The NSAID-contraindication outcome no longer points to an unreachable opioid eligibility step. Sedation handouts now use an elapsed 24-hour restriction rather than “tomorrow morning.”

## Sources and applicability

- [ADA Standards of Care 2026, section 16](https://diabetesjournals.org/care/article/49/Supplement_1/S339/163925/16-Diabetes-Care-in-the-Hospital-Standards-of-Care): perioperative insulin, glucose target, A1C and type 1 basal safeguards. Primary ADA text retrieved through search November 2 after direct page access returned 403. This is hospital/perioperative guidance; office dental applicability still requires clinical judgment.
- [ASA multisociety GLP-1 guidance](https://www.asahq.org/about-asa/newsroom/news-releases/2024/10/new-multi-society-glp-1-guidance): reviewed November 2; dose escalation, GI symptoms, maintenance risk and individualized management.
- [FDA acetaminophen guidance](https://www.fda.gov/consumers/consumer-updates/dont-overuse-acetaminophen): adult all-product 4,000 mg/day ceiling. Product labeling and individual lower limits still apply.
- [RCoA patient guidance](https://rcoa.ac.uk/patients/more-about-anaesthesia/patient-faqs): at least 24 hours without driving after sedation.

## Validation

- `node tests/reconciliation.cjs`: **78 passed**, including **720 combined cases**.
- `node tests/clinical-workflow.cjs`: **34 passed** for the new failure scenarios and policy consistency.
- `node tests/run.cjs`: **532 passed, 0 failed**, including actual UI result selection, first acknowledgment/reload, preserved explicit mode, preview-before-share, current text on confirmation, translated draft status and 320/390 px preview layout.
- `git diff --check`: passed.
- Visually inspected local pre-op criteria and patient-export preview screenshots. Browser tests required execution outside the filesystem sandbox because Chromium could not initialize its macOS process services inside it.
- Software checks do not establish clinical validity. Native iOS Safari, installed iPhone PWA and fluent-speaker translation validation remain unverified.

## Scope remaining

This is a targeted repair, not revalidation of all 37 modules, rescue doses, decision-aid risk estimates or legacy draft protocols. Translation warnings remain visible; translated clinical text still requires human review. The parser can still misinterpret complex, unsupported language; clinicians must review proposed facts. No patient data was used or transmitted. Publication is authorized; the deployment status is verified separately.
