/* service-worker.js – PediCalc PWA */
const CACHE_NAME = 'hydration-cache-v4';

const ASSETS = [
  './',
  './index.html',
  './app.js',
  './styles.css',
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
   Fetch – Stale-While-Revalidate strategy
   ===================================================== */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // Skip non-GET

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Validate response before caching
        const isSuccessfulSameOriginRequest =
          response &&
          response.ok &&
          networkResponse &&
          networkResponse.ok &&
          new URL(event.request.url).origin === self.location.origin;

        if (isSuccessfulSameOriginRequest) {
          const responseClone = response.clone();
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }

        return Response.error();
      });

      // Return cached immediately if available, while fetching in background
      return cachedResponse || fetchPromise;
    })
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
