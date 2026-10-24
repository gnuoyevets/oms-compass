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
- Suppression can remove a composite step containing otherwise usable treatments. The app requests a patient-specific alternative; it does not invent a replacement dose or allow a generic clearance override.
- Author DOAC and INR protocols remain intentionally different from SDCEP and require clinician review. Existing applicability explanations remain available.
- Ranking explores visible option branches only. Numeric values, hidden downstream questions and clinical facts outside Compass may change a plan.
- Consultation drafts contain only selected findings and entered context, not a complete medical history. Review before external use.
- Comparison is not an anesthesia candidacy or procedure eligibility assessment. A staged lower-risk comparison requires explicit confirmation of qualifying simple care.

## Validation

- `node tests/reconciliation.cjs`: 63 checks passed, including 720 seeded combined cases.
- Covers brand/generic/abbreviation aliases; Unknown; INR completeness; lab unit equivalence/mismatch; branch changes; combined conflicts; Author/Colleague behavior; hypothetical isolation and Apply; copied notes; context pruning; consultation output; reset; all module/finding render generation; storage allowlist.
- `git diff --check`: passed.
- Manual cloud Chromium preview at a phone-sized viewport: Eliquis search, immediate provisional action, Unknown selection, add to assessment, grouped plan, next question, hypothetical comparison, Apply recomputation and double-tap New patient reset passed. Measured 375 px content/viewport with no horizontal overflow; checked primary question/reset targets were at least 44 px high.
- Existing full Playwright suite: blocked before execution by missing local Chromium. Browser installation was attempted but returned an invalid/truncated archive. No full-suite pass is claimed.

Software tests do not establish clinical validity. Native iOS Safari, VoiceOver and a full clinical review remain outstanding.

## Files

- index.html — runtime, assessment UI, comparisons, consultation draft and review version history.
- sw.js — review cache version.
- tests/reconciliation.cjs — dependency-free deterministic checks.
- CHANGELOG.md and README.md — review change log and validation commands.
- RECONCILIATION-REVIEW.md — this review record.
