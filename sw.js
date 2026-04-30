// වෙබ් අඩවියේ වෙනසක් කළ විට v1 යන්න v2 ලෙස මාරු කරන්න
const CACHE_NAME = 'k-win-v2'; 

const assets = [
  './',
  './index.html',
  // වැදගත්: මෙතනට අලුත් Logo Link එක ඇතුළත් කළා
  'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg' 
];

// 1. Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting(); // අලුත් එක වහාම ඉන්ස්ටෝල් කරන්න
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // මෙහිදී වැදගත් වෙන්නේ assets එකින් එක cache කිරීමයි (එකක් fail වුණත් අනිත් ඒවා වැඩ කිරීමට)
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.log('Fetch failed for:', url));
        })
      );
    })
  );
});

// 2. Activate Event - පරණ Cache මැකීම
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
  return self.clients.claim();
});

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // තිබේනම් cache එකෙන් ලබාදේ, නැතිනම් ඉන්ටර්නෙට් එකෙන් ලබාගෙන cache එකට දමයි
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // අලුතින් ගන්නා දත්ත cache එකට එක් කරයි (Dynamic Caching)
          cache.put(event.request.url, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
        // Network සහ Cache දෙකම නැති අවස්ථාවක (Offline) index.html පෙන්වීමට
        if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
        }
    })
  );
});
