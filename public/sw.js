const CACHE_NAME = 'compra-esperta-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Error caching on install:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o cache se houver, caso contrário busca da rede
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            // Em caso de falha de rede (offline), retornar o App Shell (index.html) para navegação
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        });
      })
  );
});
