# OMS Compass — home-screen app

Offline web app version of OMS Compass. This repo is the canonical copy; the "OMS Compass" artifact mirrors it. Changes: see CHANGELOG.md.

The v3.23.0 review branch adds an **EMR-neutral** consultation, booking and surgery-day workspace. Use **Consult** for a reviewed copy-ready note and selected tasks; the existing Decide, SOS, Calc, Ref, Patient and intraoperative tools remain available. Clinical information stays in memory and is lost on reload. Your chosen EMR owns durable notes, orders and task follow-up; no vendor-specific integration is assumed.

See [IMPLEMENTATION-REVIEW.md](IMPLEMENTATION-REVIEW.md) for corrections, feature preservation, source limits and remaining clinical review (the every-node audit ledger is kept privately). Software checks do not establish clinical validity.

## Files
- `index.html` — the app
- `consultation.js`, `consultation.css` — additive consultation/readiness workspace
- `manifest.webmanifest` — name, icon, full-screen mode
- `sw.js` — offline cache
- `CHANGELOG.md` — dated change log
- `handouts/index.html` — standalone patient page: post-op instructions and FAQs; text mirrors the Compass Patient tab (a test checks they match)
- `handouts/qr/` — front-desk QR sheets (PDF, Dr. Young and Bayside; English, Spanish, Kriolu and 中文, two pages each). Regenerate after adding or renaming topics: `python3 handouts/qr/make_qr_sheets.py`
- `*.png` — app icons
- `tests/run.cjs` — automated checks (software behavior, not clinical validation). Run: `npm i -D playwright && npx playwright install chromium && node tests/run.cjs`
- `tests/consultation.cjs` — all graph paths/Unknown stops, audit regressions and v3.22.0 feature-preservation checks
- `tests/consultation-browser.cjs` — consultation intake, task/review invalidation, EMR preview, narrow screens and session reset

## Publish (GitHub Pages, free)
1. Sign in at github.com and create a repo named `oms-compass`.
2. Choose **Add file → Upload files** and drop in every file from this folder.
3. Open **Settings → Pages**. Set Source to `main` branch, root folder. Save.
4. Wait 1–2 minutes. The site appears at `https://<username>.github.io/oms-compass/`.

Note: a public repo makes the site public. It contains no patient data.

## Install on iPhone
1. Open the site in **Safari**.
2. Tap **Share → Add to Home Screen → Add**.
3. Open it once while online so it caches for offline use.

## Update later
1. Replace `index.html` and changed app assets (`consultation.js` and `consultation.css` when applicable) with the new version.
2. In `sw.js`, change `VERSION` (e.g., `compass-2026-11-01a`).
3. Upload both. Phones refresh on the next open while online.

## Validation

Run `node tests/reconciliation.cjs` for dependency-free reconciliation and state-isolation checks.
See `RECONCILIATION-REVIEW.md` for scope, source checks and limitations.
The existing browser suite remains `node tests/run.cjs` (requires Playwright Chromium).
Software tests do not establish clinical validity.

## v3.16.0 clinical workflow repair

See `CLINICAL-WORKFLOW-REVIEW.md` for the approved changes, primary sources and validation. Run `node tests/clinical-workflow.cjs` in addition to the existing suites. Set `COMPASS_REVIEW_OUTPUT` to an artifact directory to save the two mobile review screenshots during the browser suite. No patient data is included.
