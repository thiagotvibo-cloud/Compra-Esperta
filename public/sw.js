const CACHE_NAME = 'compra-esperta-v2';
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
  // Use Network First for navigation (HTML) and API/dynamic content if any.
  // We'll apply NetworkFirst for everything to avoid stuck PWA versions easily.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Obtenha uma cópia para o cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          // Apenas adicione ao cache se a requisição for suportada
          if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
            cache.put(event.request, resClone);
          }
        });
        return response;
      })
      .catch(() => {
        // Em caso de falha (offline), tente buscar do cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se for uma navegação para rota e não estiver em cache, retorne index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
