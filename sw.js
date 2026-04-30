// Cache එකේ නම සහ Version එක (Update එකක් කරන්න ඕන වුණාම 'v1' වෙනස් කරන්න)
const CACHE_NAME = 'k-win-cache-v1';

// Offline වැඩ කිරීමට අවශ්‍ය Files මෙතන ඇතුළත් කරන්න
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// 1. Install Event: Files ටික Cache එකට දා ගැනීම
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // අලුත් SW එකක් තිබේ නම් වහාම ක්‍රියාත්මක කරවන්න
  self.skipWaiting();
});

// 2. Activate Event: පරණ Cache ඉබේම අයින් කිරීම (Cleanup)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // අලුත් SW එක පාලනය ලබා ගැනීම
  return self.clients.claim();
});

// 3. Fetch Event: Offline වෙලාවට Cache එකෙන් දත්ත ලබාදීම
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache එකේ තියෙනවා නම් ඒක දෙනවා, නැත්නම් Network එකෙන් ගන්නවා
      return response || fetch(event.request);
    })
  );
});
self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  // මෙය හිස්ව තිබුණත් කමක් නැත, නමුත් fetch event එක තිබිය යුතුමයි
});
