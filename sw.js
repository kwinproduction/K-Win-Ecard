const CACHE_NAME = 'K-Win';
const assets = [
  './',
  './index.html',
  // GitHub Raw link එක භාවිතා කර ඇත
  'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// Install Event - Assets Cache කිරීම
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('K-Win: Caching assets');
      return cache.addAll(assets);
    })
  );
});

// Activate Event - පරණ Caches ඉවත් කිරීම
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('K-Win: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event - Offline වැඩ කිරීමට Cache එකෙන් දත්ත ලබා දීම
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
