// 1. Version එක - මෙහි අංකය වෙනස් කළ විට පරණ Cache එක Auto Clear වේ
const CACHE_VERSION = 'v2.1'; 
const CACHE_NAME = `kwin-cache-${CACHE_VERSION}`;

// 2. Cache කළ යුතු ගොනු ලැයිස්තුව
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// 3. Service Worker එක Install වීම
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Installing New Cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // අලුත් එක වහාම ක්‍රියාත්මක කරවන්න
});

// 4. පරණ Cache Auto-Delete කිරීම (Activate Event)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // අලුත් Cache Name එකට වඩා වෙනස් සියලු පරණ Cache මකා දමන්න
          if (cache !== CACHE_NAME) {
            console.log('Deleting Old Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 5. ගොනු ලබාදීම (Fetch Event)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache එකේ ඇත්නම් එය ලබා දෙයි, නැත්නම් Network එකෙන් ලබා ගනී
      return response || fetch(event.request);
    })
  );
});
