// ඔබ වෙබ් අඩවියේ වෙනසක් කළ සෑම අවස්ථාවකම මෙම v1 යන්න v2, v3 ලෙස වෙනස් කරන්න.
const CACHE_NAME = 'k-win-v1'; 

const assets = [
  './',
  './index.html',
  'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// 1. Install Event - අලුත් දත්ත ටික Cache කරගැනීම
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('K-Win: New Cache Created');
      return cache.addAll(assets);
    })
  );
  // අලුත් Service Worker එක එවෙලේම Active කරන්න (Wait කරන්නේ නැතුව)
  self.skipWaiting();
});

// 2. Activate Event - පරණ තිබුණු Cache ඔක්කොම ස්වයංක්‍රීයව මකා දැමීම
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('K-Win: Clearing Old Cache...', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // අලුත් Cache එක වහාම ක්‍රියාත්මක කිරීමට බල කිරීම
  return self.clients.claim();
});

// 3. Fetch Event - දත්ත පෙන්වීම
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache එකේ තියෙනවා නම් ඒක දෙනවා, නැත්නම් Network එකෙන් ගන්නවා
      return response || fetch(event.request);
    })
  );
});
