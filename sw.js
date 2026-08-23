/* service-worker.js – PediCalc PWA */
const CACHE_NAME='pedicalc-cache-v14-interactive';
const ASSETS=['./','./index.html','./app.js','./clinical-math.js','./clinical-enhancements.js','./styles.css','./manifest.json','./favicon.ico','./icons/favicon-16x16.png','./icons/favicon-32x32.png','./icons/icon-152x152.png','./icons/icon-180x180.png','./icons/icon-192x192.png','./icons/safari-pinned-tab.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(cached=>{const network=fetch(e.request).then(r=>{if(r&&r.ok&&new URL(e.request.url).origin===self.location.origin)caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):new Response('',{status:408}));return cached||network}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ns=>Promise.all([...ns.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n)),self.clients.claim()]))));
