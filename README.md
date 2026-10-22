# OMS Compass — home-screen app

Offline web app version of OMS Compass. Source: "OMS Compass" artifact, Oct 22, 2026.

## Files
- `index.html` — the app
- `manifest.webmanifest` — name, icon, full-screen mode
- `sw.js` — offline cache
- `*.png` — app icons

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
