const CACHE_NAME = 'K-Win';
const ASSETS_TO_CACHE = [
  './',
  './index.html', // ඔබේ ප්‍රධාන HTML ගොනුවේ නම index.html නොවේ නම් එය මෙතනට යොදන්න
  'https://raw.githubusercontent.com/janithdidula025-design/ecard/main/logo.png'
];

// Install Service Worker and Cache Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate and Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Assets from Cache or Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
