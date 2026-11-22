// OMS Compass offline cache.
// To publish an update: edit index.html, bump VERSION, push. Phones pick it up on next open.
const VERSION = 'compass-2026-11-21-v3.29.1';
const CORE = ['./', './index.html', './manifest.webmanifest',
  './apple-touch-icon.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './handouts/', './handouts/v2.js'];

self.addEventListener('install', e => {
  // Let an existing encounter finish under its current worker. Activate after old tabs close.
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // App page: network first (fresh content when online), cache fallback offline.
  // Only the Compass page itself; /handouts/ is a separate page and must not overwrite it.
  const isApp = url.pathname.endsWith('/oms-compass/') || url.pathname.endsWith('/oms-compass/index.html');
  // Patient page: network first, its own cached copy offline (never the app's).
  const isHandouts = url.pathname.endsWith('/oms-compass/handouts/') || url.pathname.endsWith('/oms-compass/handouts/index.html');
  if (req.mode === 'navigate' && isHandouts) {
    e.respondWith(fetch(req, {cache: 'no-cache'})
      .then(r => { if (!r.ok) throw new Error('Patient page response not usable'); const copy = r.clone(); caches.open(VERSION).then(c => c.put('./handouts/', copy)); return r; })
      .catch(() => caches.match('./handouts/')));
    return;
  }
  if (req.mode === 'navigate' && !isApp) return; // other pages: plain network, browser cache rules
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, {cache: 'no-cache'})
      .then(r => { if (!r.ok) throw new Error('App response not usable'); const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }

  // Own JS/CSS files (e.g. handouts/v2.js): network first so scripts stay in
  // lockstep with network-first HTML during updates; fall back to cache offline.
  const isCode = url.origin === self.location.origin && /\.(js|css)$/.test(url.pathname) && !url.pathname.endsWith('/sw.js');
  if (isCode) {
    e.respondWith(fetch(req, {cache: 'no-cache'})
      .then(r => { if (!r.ok) throw new Error('Asset response not usable'); const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req)));
    return;
  }

  // Other own static files (icons, manifest) and Google Fonts: cache first, fill on first use.
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin === self.location.origin || fonts) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return r;
    })));
  }
  // Source links (PubMed, ADA, etc.) open normally and need a connection.
});
