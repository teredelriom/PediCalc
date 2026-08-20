/* service-worker.js – PediCalc PWA */
const CACHE_NAME = 'hydration-cache-v3';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icons/favicon-16x16.png',
  './icons/favicon-32x32.png',
  './icons/icon-152x152.png',
  './icons/icon-180x180.png',
  './icons/icon-192x192.png',
  './icons/safari-pinned-tab.svg'
];

/* =====================================================
   Install – precache core assets
   ===================================================== */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

/* =====================================================
   Fetch – cache-first for static assets, network fallback
   ===================================================== */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // Skip non-GET

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request)
    )
  );
});

/* =====================================================
   Activate – purge outdated caches
   ===================================================== */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});
