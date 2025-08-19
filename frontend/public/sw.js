const CACHE_NAME = 'self-music-cache-v1';
const MAX_AGE = 2 * 24 * 60 * 60 * 1000; // 2 days in ms

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.add('/offline'))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const networkResponse = await fetch(event.request);
        const headers = new Headers(networkResponse.headers);
        headers.set('sw-cache-time', Date.now().toString());
        const body = await networkResponse.clone().blob();
        await cache.put(
          event.request,
          new Response(body, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers,
          })
        );
        return networkResponse;
      } catch (err) {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          const cacheTime = cachedResponse.headers.get('sw-cache-time');
          if (!cacheTime || Date.now() - Number(cacheTime) < MAX_AGE) {
            return cachedResponse;
          }
        }
        if (event.request.mode === 'navigate') {
          const offlinePage = await cache.match('/offline');
          if (offlinePage) {
            return offlinePage;
          }
        }
        throw err;
      }
    })()
  );
});
