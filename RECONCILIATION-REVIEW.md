# Reconciled chairside plans — review notes

Review date: October 24, 2026. Base: main at de713a8. Branch: feat/reconciled-chairside-plans.
This branch is a clinician-review draft, not approved for deployment.

## Changes

- Reuse FIND plans, existing question definitions, overlap rules and SRC references as the clinical source of truth.
- Render a grouped plan, named unresolved questions and suppressed conflicting source instructions. Copied assessment notes omit suppressed prescriptions.
- Block definitive clearance when a visible answer is missing/Unknown; require numeric INR and result timing. Cross-check entered findings against negative pre-op screening answers.
- Suppress routine NSAID instructions when an entered kidney/transplant/bleeding/antithrombotic precaution conflicts. Suppress age-restricted local anesthetic instructions when age is absent or excluded.
- Rank unanswered option questions by evaluating existing rule branches. Numeric questions remain required; no synthetic lab values are generated.
- Compare local/IV or qualified staged care using cloned state. Explicit Apply changes actual context and recomputes recommendations. Staging alone never assigns a lower procedure risk.
- Explain the most recent edit, retaining at most five changes in memory. Generate a de-identified consultation draft for copying; never send it.
- New patient clears clinical inputs, findings, results, hypothetical context and history. No new dependencies, storage, accounts, network patient transport or AI integration.

## Source checks and clinical scope

Checked against primary organizations on October 24, 2026:

- National Kidney Foundation, Pain Medicines and Kidney Disease: https://www.kidney.org/kidney-topics/pain-medicines-and-kidney-disease — supports avoiding routine NSAID advice in CKD, especially eGFR below 60. The app guard is conservative and does not calculate a renal analgesic regimen.
- AAPD, Use of Local Anesthesia for Pediatric Dental Patients: https://www.aapd.org/globalassets/media/policies_guidelines/bp_localanesthesia.pdf — supports existing dental bupivacaine restriction below age 12 and articaine manufacturer restriction below age 4. Unknown age is an unresolved input, not a normal adult assumption.
- SDCEP 2022 anticoagulant guidance already linked in SRC: https://www.sdcep.org.uk/published-guidance/anticoagulants-and-antiplatelets/ — existing antithrombotic instructions and Author/Colleague alternatives are retained. This branch changes reconciliation and completeness checks, not anticoagulant dosing thresholds.

No new medication dose or blanket hold instruction is introduced. Content containing an existing [verify] marker is labelled Unverified draft in both individual and combined plans.

## Remaining clinical uncertainties

- This is a targeted reconciliation review, not a full clinical revalidation of all 35 modules, 18 findings, doses or emergency cards. Unverified legacy content remains explicitly marked.
- Reconciliation covers named interactions only. Absence of a listed conflict does not establish safety.
- NSAID suppression is triggered by the presence of a kidney, transplant, bleeding-disorder or antithrombotic finding, without eGFR or calcineurin-inhibitor detail. This matches the existing finding text (each already advises against NSAIDs) but is broader than NKF's eGFR <60 emphasis.
- INR off anticoagulants older than 72 h is held as Verify first. No source was located for a recency window outside warfarin; tagged [verify] in the app.
- Author DOAC and INR protocols remain intentionally different from SDCEP and require clinician review. Existing applicability explanations remain available.
- Ranking explores visible option branches only. Numeric values, hidden downstream questions and clinical facts outside Compass may change a plan.
- Consultation drafts contain only selected findings and entered context, not a complete medical history. Review before external use.
- Comparison is not an anesthesia candidacy or procedure eligibility assessment. A staged lower-risk comparison requires explicit confirmation of qualifying simple care.

## Independent review — Oct 24, 2026 (second reviewer, before PR)

Main was still at de713a8, so nothing newer needed merging. The handoff arrived as a ZIP only (no Git bundle); the branch was rebuilt from the ZIP on top of main.

Defects found and fixed:

- **Existing browser suite regressed** (1 failure, then a crash in section 13). Cause: New patient force-collapsed the Context panel (unrequested behavior change, reverted), and per-finding steps moved under a collapsed section (intended; the assertion now accepts the new "Follow-up / escalation" heading).
- **Age-label suppression removed whole composite steps.** With age not entered, the hemophilia exam step lost the intraligamentary alternative to an IAN block, and the buprenorphine plan lost acetaminophen. Both steps were split into their original components without changing wording or doses; only the label-restricted drug is withheld.
- **Over-escalation from missing age.** Unknown age turned a bleeding-disorder exam into Verify first and raised a conflict, although age only affects articaine/bupivacaine eligibility. Age is now an optional refinement: the restricted drug is withheld and disclosed, with no disposition change. Unknown age is still never treated as adult.
- **Age field vanished after the first digit** (two-digit ages could not be typed on the finding page). The field now stays rendered.
- **Duplicate element IDs and controls** when the next decisive question was a Context question on the assessment page. Context questions now point to the Context panel; other questions render with unique IDs.
- **Author protocol hidden** behind the collapsed individual-findings section. It is now shown in the reconciled plan as well.

## Validation (actual results)

- `node tests/reconciliation.cjs`: 69 checks passed, including 720 seeded combined cases (7 added for the fixes above).
- `node tests/run.cjs` (Playwright, phone viewport): 314 passed, 0 failed; repeated runs are listed in the PR. Main at de713a8: 286 passed. Added section 15 (28 checks): reconciled plan, comparison preview/Apply and staged qualification through the UI, change explanations, consultation draft, Author protocol, accessible names and unique IDs on all 18 finding pages and the assessment, 44 px targets, two-digit age entry, no overflow at 320 and 390 px with all panels open, double-tap reset, storage allowlist, and real service-worker offline load, update and old-cache deletion over HTTP.
- One existing invariant was narrowed: "unanswered → provisional" now applies to required questions; the optional age field is excluded by design.
- Render cost (4× CPU throttle): 15–35 ms for 1–8 findings, 100 ms for all 18 (main <10 ms).
- `git diff --check`: passed.

Not tested: native iOS Safari, VoiceOver, and an installed home-screen PWA. Software tests do not establish clinical validity.

## Source re-check (Oct 24, 2026)

- NKF page (last updated Feb 21, 2025): "People with CKD should avoid NSAIDs, especially if your eGFR is lower than 60"; acetaminophen generally safe at recommended doses.
- SDCEP 2nd ed. 2022, §4.4 p. 15: advise paracetamol, unless contraindicated, "rather than NSAIDs such as aspirin, ibuprofen, diclofenac or naproxen."
- WFH Monograph 40 (2006): paracetamol for dental pain; NSAIDs only after discussion with the hematologist; intraligamentary injection instead of an IAN block without cover; articaine buccal infiltration for lower molars. The source is dated 2006.
- AAPD local anesthesia (revised 2023): articaine not recommended under 4 years (manufacturers); bupivacaine not recommended under 12 years. The existing SRC link resolves.

## Files

- index.html — runtime, assessment UI, comparisons, consultation draft and review version history.
- sw.js — review cache version.
- tests/reconciliation.cjs — dependency-free deterministic checks.
- CHANGELOG.md and README.md — review change log and validation commands.
- RECONCILIATION-REVIEW.md — this review record.
