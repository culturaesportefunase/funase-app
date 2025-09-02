const CACHE_NAME = 'funase-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/scripts/app.js',
    '/offline.html',
    // Adicione outros recursos necessários
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Estratégia de cache: Cache First, Fallback to Network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .catch(() => caches.match('/offline.html'));
            })
    );
});