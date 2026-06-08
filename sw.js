// 1. Version එක - මෙහි අංකය වෙනස් කළ විට පරණ Cache එක Auto Clear වේ
const CACHE_VERSION = 'v2.29'; 
const CACHE_NAME = `kwin-cache-${CACHE_VERSION}`;

// 2. Cache කළ යුතු ගොනු ලැයිස්තුව (Assets)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg'
];

// 3. Service Worker එක Install වීම සහ Assets Cache කිරීම
self.addEventListener('install', (event) => {
  console.log('K-Win Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('K-Win Service Worker: Caching Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // අලුත් Version එක ඉක්මනින් Active කිරීමට
});

// 4. පරණ Cache Auto-Delete කිරීම (Activate Event)
self.addEventListener('activate', (event) => {
  console.log('K-Win Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('K-Win Service Worker: Deleting Old Cache...', cache);
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
  
  // 💡 Supabase API හෝ බාහිර API requests හඳුනාගෙන ඒවා Cache කිරීමෙන් වැළකීම (Live Data සඳහා)
  if (event.request.url.includes('supabase.co') || event.request.url.includes('onesignal.com')) {
    event.respondWith(fetch(event.request));
    return; 
  }

  // සාමාන්‍ය Assets (HTML, CSS, Images) සඳහා Cache ක්‍රමය
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache එකේ ඇත්නම් එය ලබා දෙයි, නැත්නම් Network එකෙන් ලබා ගනී
      return response || fetch(event.request);
    }).catch(() => {
      // Network එකත් නැත්නම් (Offline නම්) index.html එක පෙන්වයි
      return caches.match('./index.html');
    })
  );
});
