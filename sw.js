// =========================
// K-Win Admin Service Worker
// =========================

// 1. Version එක - මෙහි අංකය වෙනස් කළ විට පරණ Cache එක Auto Clear වේ
const CACHE_VERSION = 'v2.36';
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
// සර්විස් වර්කර් එක ස්ථාපනය වීම
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// App එක වසා තිබියදී හෝ Background එකේ ඇතිවිට ලැබෙන Notification පාලනය කිරීම
self.addEventListener('push', (event) => {
  let title = 'K-Win Notification';
  let options = {
    body: 'உங்களுக்கு ஒரு புதிய செய்தி உள்ளது / ඔබට නව පණිවිඩයක් ඇත.',
    icon: 'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg',
    badge: 'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg',
    vibrate: [200, 100, 200]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options.body = data.message || options.body;
    } catch (e) {
      // ලැබෙන දත්ත Text එකක් නම්
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification එකක් මත ක්ලික් කළ විට ඇප් එක විවෘත කිරීම
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});
