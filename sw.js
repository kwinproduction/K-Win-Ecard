// =========================
// K-Win Admin Service Worker
// =========================

// 1. Version එක - මෙහි අංකය වෙනස් කළ විට පරණ Cache එක Auto Clear වේ
const CACHE_VERSION = 'v2.32';
const CACHE_NAME = `kwin-admin-cache-${CACHE_VERSION}`;

// 2. Cache කළ යුතු ගොනු ලැයිස්තුව (Assets)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpeg'
];

// 3. Service Worker එක Install වීම සහ Assets Cache කිරීම
self.addEventListener('install', (event) => {
  console.log('K-Win Admin Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('K-Win Admin Service Worker: Caching Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// 4. පරණ Cache Auto-Delete කිරීම (Activate Event)
self.addEventListener('activate', (event) => {
  console.log('K-Win Admin Service Worker: Activated');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('K-Win Admin Service Worker: Deleting Old Cache...', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 5. ගොනු ලබාදීම (Fetch Event)
self.addEventListener('fetch', (event) => {
  // Supabase API requests cache නොකර live fetch කරන්න
  if (event.request.url.includes('supabase.co') || event.request.url.includes('onesignal.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigation requests සඳහා network-first, fallback cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', clone));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // අනෙක් assets සඳහා cache-first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => caches.match('./index.html'))
  );
});
