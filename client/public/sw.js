// StumbleLele Service Worker - Offline Support for Kids
const CACHE_NAME = 'stumblelele-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/lele-main.png',
  '/static/js/bundle.js',
  '/static/css/main.css',
  // Add other static assets
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('SW: Cache failed', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline - return a friendly message
        if (event.request.mode === 'navigate') {
          return new Response(`
            <html>
              <body style="font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%);">
                <h1>🌟 Lele está offline! 🌟</h1>
                <p>Parece que você não tem internet agora.</p>
                <p>Tente novamente quando estiver conectado!</p>
                <button onclick="window.location.reload()" style="padding: 15px 30px; font-size: 18px; background: #e91e63; color: white; border: none; border-radius: 25px; cursor: pointer;">
                  Tentar Novamente
                </button>
              </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync any pending data when connection is restored
      console.log('SW: Background sync triggered')
    );
  }
});