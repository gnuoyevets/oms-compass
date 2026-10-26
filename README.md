# OMS Compass — home-screen app

Offline web app version of OMS Compass. This repo is the canonical copy; the "OMS Compass" artifact mirrors it. Changes: see CHANGELOG.md.

## Files
- `index.html` — the app
- `manifest.webmanifest` — name, icon, full-screen mode
- `sw.js` — offline cache
- `CHANGELOG.md` — dated change log
- `handouts/index.html` — standalone patient page: post-op instructions and FAQs; text mirrors the Compass Patient tab (a test checks they match)
- `*.png` — app icons
- `tests/run.cjs` — automated checks (software behavior, not clinical validation). Run: `npm i -D playwright && npx playwright install chromium && node tests/run.cjs`

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
1. Replace `index.html` with the new version.
2. In `sw.js`, change `VERSION` (e.g., `compass-2026-11-01a`).
3. Upload both. Phones refresh on the next open while online.

## Validation

Run `node tests/reconciliation.cjs` for dependency-free reconciliation and state-isolation checks.
See `RECONCILIATION-REVIEW.md` for scope, source checks and limitations.
The existing browser suite remains `node tests/run.cjs` (requires Playwright Chromium).
Software tests do not establish clinical validity.
