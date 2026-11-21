# OMS Compass — AI Partner & Contributor Guide (`AGENTS.md`)

OMS Compass is an offline-first, zero-backend clinical decision-support and patient-handout PWA for Oral & Maxillofacial Surgery (OMS), hosted on GitHub Pages at `https://gnuoyevets.github.io/oms-compass/`.

This file defines the non-negotiable rules every AI coding partner and contributor must follow.

---

## 1. Non-Negotiable Clinical Safety & Privacy Rules

1. **Software checks never establish clinical validity.** Never claim a change is clinically validated just because automated tests pass.
2. **Never invent or silently alter clinical content.** Doses, age/weight cutoffs, drug-hold windows, triage thresholds, and patient instructions must come from explicit clinician direction (`Dr. Steven Young, DDS`) and/or verified primary sources. Unverified content stays tagged `[verify]` or draft-gated.
3. **Never write "approved by Steven" on a PR or changelog entry ahead of time.** Mark draft PRs/changelogs as pending review until Steven explicitly approves them.
4. **Preserve safety invariants:**
   - `Unknown` never resolves to `Proceed` and never finalizes a clinical plan.
   - Urgent/emergency outcomes (`SOS`, threatened airway, 911 scripts) are never hidden behind the draft gate.
   - `Colleague` (guideline) mode is the first-use default; `Author` protocols remain explicitly labeled.
   - Keep `V2_LIVE = false` in `handouts/v2.js` until Steven explicitly approves the English v2 content for publication.
5. **Zero PHI & zero telemetry:**
   - Clinical encounter data stays in memory only and resets on reload or **New patient**.
   - Never persist patient facts to `localStorage`, `sessionStorage`, cookies, URLs, or QR codes. Only device settings (acknowledgment, practice mode, on-call switch, recent module IDs, staff view, office address/phone, and anonymous SOS event log) may be stored locally.
   - Patient page links (`handouts/`) allow only `?site=` or `?ph=` in the query string and strictly coded hashes (`#...`).

---

## 2. Architecture & Zero-Build Discipline

- **Pure static web app:** Plain HTML, CSS, and JavaScript with **zero runtime npm dependencies** and **no build step**. GitHub Pages serves the repository root directly.
- **Key files:**
  - `index.html` — Clinician PWA (`Decide`, `SOS`, `Calc`, `Ref`, `Patient`, `Assessment`, `Intraop`, SOAP note).
  - `handouts/v2.js` — Shared deterministic v2 patient-journey engine, link parser, and draft content (loaded by both `index.html` and `handouts/index.html`).
  - `handouts/index.html` — Standalone patient handout & FAQ page.
  - `handouts/qr/make_qr_sheets.py` — Regenerates front-desk PDF QR sheets (`handouts/qr/*.pdf`) whenever handout topics or languages change.
  - `sw.js` — Offline Service Worker. HTML pages and same-origin `.js`/`.css` files are **network-first with cache fallback** so code stays in lockstep during updates; icons, manifest, and fonts are cache-first.
  - `tests/preflight.cjs` — One-command local & CI verifier (version sync, Service Worker checks, plus all 4 dependency-free test suites).
  - `tests/run.cjs` — Playwright iPhone 13 browser suite (runs in GitHub Actions on every PR).
  - `tests/feature-baseline.json` — Baseline preservation contract; do not modify unless removing/renaming a baseline feature with explicit approval.

---

## 3. Release & Pull Request Workflow

1. **Always work on a feature branch and open a Pull Request** so GitHub Actions (`.github/workflows/tests.yml`) runs the full suite — including iPhone 13 Playwright checks — before merging to `main`.
2. **Keep versions in sync on every user-facing release:**
   - `index.html`: bump `const VER = 'X.Y.Z'` and add a matching top entry in `CHANGES`.
   - `sw.js`: bump `const VERSION = 'compass-YYYY-MM-DD-vX.Y.Z'` (must end with `-v<VER>` so phones refresh their offline cache).
   - `CHANGELOG.md`: add a matching top `## vX.Y.Z — ...` heading.
3. **Run pre-flight before pushing:**
   ```bash
   node tests/preflight.cjs
   ```
   Every check must pass with zero warnings before opening or updating a PR.
