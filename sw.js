// 1. Version එක - මෙහි අංකය වෙනස් කළ විට පරණ Cache එක Auto Clear වේ
const CACHE_VERSION = 'v2.2'; 
const CACHE_NAME = `kwin-cache-${CACHE_VERSION}`;

// 2. Cache කළ යුතු ගොනු ලැයිස්තුව
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  
  'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// 3. Service Worker එක Install වීම
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); 
});

// 4. පරණ Cache Auto-Delete කිරීම (Activate Event)
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Deleting Old Cache...', cache);
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
    }).catch(() => {
        // Network එකත් නැත්නම් (Offline නම්) index.html එක පෙන්නන්න පුළුවන්
        return caches.match('./index.html');
    })
  );
});
// sw.js
self.addEventListener('install', (e) => {
  console.log('K-Win Service Worker Installed');
});

self.addEventListener('fetch', (e) => {
  // App එක offline වැඩ කිරීමට අවශ්‍ය මූලික සැකසුම
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
