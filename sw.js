// OMS Compass offline cache.
// To publish an update: edit index.html, bump VERSION, push. Phones pick it up on next open.
const VERSION = 'compass-2026-10-31-v3.11.0';
const CORE = ['./', './index.html', './manifest.webmanifest',
  './apple-touch-icon.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
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
  if (req.mode === 'navigate' && !isApp) return; // other pages: plain network, browser cache rules
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, {cache: 'no-cache'})
      .then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }

  // Own files and Google Fonts: cache first, fill on first use.
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin === self.location.origin || fonts) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return r;
    })));
  }
  // Source links (PubMed, ADA, etc.) open normally and need a connection.
});
