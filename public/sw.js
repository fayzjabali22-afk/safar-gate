const CACHE_NAME = 'safar-carrier-cache-v1';
const OFFLINE_URL = 'offline.html';

// List of files to cache
const urlsToCache = [
  '/',
  '/offline.html',
  '/dashboard',
  '/history',
  '/profile',
  '/login',
  '/signup',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other important assets here, e.g., CSS, JS files
  // Be careful not to cache too much, especially large images.
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
        (async () => {
          try {
            const preloadResponse = await event.preloadResponse;
            if (preloadResponse) {
              return preloadResponse;
            }

            const networkResponse = await fetch(event.request);
            return networkResponse;
          } catch (error) {
            console.log('Fetch failed; returning offline page instead.', error);

            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(OFFLINE_URL);
            return cachedResponse;
          }
        })()
    );
  } else {
      event.respondWith(
          caches.match(event.request)
              .then(response => {
                  return response || fetch(event.request);
              })
      );
  }
});


// Update a service worker
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
});
