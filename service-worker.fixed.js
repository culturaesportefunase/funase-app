// Fixed service worker for FUNASE PWA (cache-only static site)
const CACHE_NAME = 'funase-app-final-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : Promise.resolve()))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // only cache GET + same-origin successful basic requests
        try {
          if (event.request.method === 'GET' && response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
        } catch (e) {}
        return response;
      }).catch(() => {
        // fallback to offline page for navigations
        if (event.request.mode === 'navigate' || (event.request.destination === 'document')) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
