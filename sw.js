// Service worker du menu : met le menu en cache pour qu'il s'ouvre hors ligne.
// Les deux applis ont leur propre service worker (enregistré depuis index.html) : on ne touche pas à leurs dossiers.
const CACHE = 'hub-v2';
const FILES = [
  '/', '/index.html',
  '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png',
  '/previews/tycoon.jpg', '/previews/learning.jpg', '/previews/trainer.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('hub-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const path = url.pathname;
  if (!FILES.includes(path)) return; // tout le reste (dont les applis) passe sans intervention
  // Réseau d'abord pour avoir les mises à jour, copie locale si hors ligne.
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(path, cp)); }
    return res;
  }).catch(() => caches.match(path)));
});
