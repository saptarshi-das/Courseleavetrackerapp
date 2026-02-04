const CACHE_NAME = 'margin-app-v3'; // Updated for performance optimizations
const urlsToCache = [
  '/'
  // Static assets will be cached as they're requested (cache-first strategy)
];

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => {
        console.log('Cache failed:', error);
      })
  );
});

// Listen for SKIP_WAITING message from update prompt
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests (skip POST/PUT/DELETE from Firestore)
  // This prevents "Request method 'POST' is unsupported" errors
  if (event.request.method !== 'GET') {
    return; // Don't handle non-GET requests
  }

  // Skip caching for Firebase/Firestore API calls
  const url = new URL(event.request.url);
  if (url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebase.google.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firestore.googleapis.com')) {
    return; // Let Firestore handle its own caching
  }

  // CACHE-FIRST strategy for static assets (instant loading!)
  // Serve from cache if available, update cache in background
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version immediately if available
        if (cachedResponse) {
          // Update cache in background for next time (stale-while-revalidate)
          fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, response.clone());
                });
              }
            })
            .catch(() => {
              // Network failed, but we already returned cached version
            });

          return cachedResponse; // Return cached response immediately!
        }

        // If not in cache, fetch from network and cache it
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});
