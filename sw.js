/* Little Angel Electronics — service worker
   Goal: make the app installable and fully usable offline, WITHOUT ever serving
   a stale app or interfering with Supabase cloud sync.
   Strategy:
     • Navigations  -> network-first (always get the newest app when online,
                       fall back to the cached shell when offline).
     • Own static   -> stale-while-revalidate (icons, manifest, fonts).
     • Cross-origin -> pass straight through (Supabase API, CDNs). Never cached
                       as app data, so sync and auth are untouched.
   Bump CACHE whenever you want every device to drop its old copy. */
const CACHE = 'lae-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest',
  './icon.svg', './icon-maskable.svg',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                         // never touch POST/PATCH (Supabase writes)
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // App navigations: network-first, offline -> cached shell.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put('./index.html', net.clone()).catch(() => {});
        return net;
      } catch (_) {
        return (await caches.match(req)) || (await caches.match('./index.html')) ||
               (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Our own static assets: serve fast from cache, refresh in the background.
  if (sameOrigin) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      const net = fetch(req).then((r) => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || Response.error();
    })());
    return;
  }

  // Cross-origin (Supabase, Google Fonts, CDNs): go to the network; opportunistically
  // cache font files so the UI still looks right offline. Everything else passes through.
  if (/fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      const net = fetch(req).then((r) => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || Response.error();
    })());
  }
  // (no respondWith otherwise -> browser handles Supabase/other requests normally)
});
