// Zockbox – Service Worker. made by Oskar
//
// Ziel: Die Zockbox startet auch ohne Netz (Flugmodus, Schul-WLAN down).
// Zwischengespeichert werden nur die eigenen Dateien: Startseite, Statistik,
// Fehlerseite, Styles, Skripte und Schriften. Spiele und PeerJS laufen weiter
// direkt über das Netz; fremde Hosts werden nie angefasst.
//
// Strategie:
//   · Seiten (HTML): erst Netz, sonst aus dem Cache, sonst Startseite.
//   · Dateien (CSS/JS/SVG/WOFF): aus dem Cache, parallel im Hintergrund erneuern.
//   · Anderes (PeerJS, Wikipedia, Assets in Spielen): unverändert durchreichen.

const VERSION = 'zockbox-v6';
const CACHE = VERSION;

const CORE = [
  './',
  './index.html',
  './statistik.html',
  './404.html',
  './manifest.webmanifest',
  './shared/ui.css',
  './shared/fonts.css',
  './shared/games.css',
  './shared/home.css',
  './shared/statistik.css',
  './shared/spiel-fonts.css',
  './shared/hub.js',
  './shared/game-art.js',
  './shared/stats.js',
  './shared/stats-page.js',
  './shared/profile.js',
  './shared/capacity.js',
  './shared/i18n.js',
  './shared/promo.js',
  './shared/tarnung.js',
  './shared/tarnung-theme.css',
  './shared/fonts/Inter-Variable.woff2',
  './shared/fonts/Bangers-latin.woff2',
  './assets/favicon.svg',
  './assets/favicon-32.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/promo/hain-icon.webp',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Einzeln hinzufügen: eine fehlende Datei soll die Installation nicht kippen.
    await Promise.all(CORE.map((url) => c.add(new Request(url, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // fremde Hosts nie anfassen
  if (url.pathname.includes('/games/')) return;          // Spiele laufen direkt über das Netz
  if (url.pathname.includes('/shared/vendor/')) return;  // PeerJS

  // Seiten: Netz zuerst (frische Version), sonst Cache, sonst Startseite.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(CACHE);
        c.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch (err) {
        const hit = await caches.match(req, { ignoreSearch: true });
        return hit || (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Dateien: aus dem Cache (schnell), im Hintergrund aktualisieren.
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req);
    const net = fetch(req).then((res) => {
      if (res && res.ok) c.put(req, res.clone()).catch(() => {});
      return res;
    }).catch(() => null);
    return hit || (await net) || Response.error();
  })());
});

// Auf Wunsch (Einstellungen → Offline-Daten) alles wieder löschen.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'zb-clear') {
    e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
  }
});
