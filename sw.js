/* service-worker.js – PediCalc PWA */
const CACHE_NAME = 'pedicalc-cache-v13-interactive';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './clinical-math.js',
  './clinical-enhancements.js',
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

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        const isSuccessfulSameOriginRequest =
          networkResponse &&
          networkResponse.ok &&
          new URL(event.request.url).origin === self.location.origin;

        if (isSuccessfulSameOriginRequest) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 408, statusText: 'Request timeout' });
      });

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all([
        ...cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
        self.clients.claim()
      ])
    )
  );
});
