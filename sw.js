// =========================
// K-Win Admin Service Worker
// =========================

// Version change කළාම old cache auto delete වෙනවා
const CACHE_VERSION = 'v2.37';
const CACHE_NAME = `kwin-admin-cache-${CACHE_VERSION}`;

// Cache කරන්න ඕන assets
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpeg'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate
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
    }).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Supabase / OneSignal requests cache නොකර live fetch කරන්න
  if (requestUrl.includes('supabase.co') || requestUrl.includes('onesignal.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigation requests -> network first, fallback cache
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

  // Other assets -> cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => caches.match('./index.html'))
  );
});

// Push notification
self.addEventListener('push', (event) => {
  let title = 'K-Win Notification';
  let body = 'ඔබට නව පණිවිඩයක් ඇත.';
  let icon = 'https://raw.githubusercontent.com/kwinproduction/K-Win-Ecard/main/logo.jpeg';
  let url = './index.html';

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || data.message || body;
      icon = data.icon || icon;
      url = data.url || url;
    } catch (e) {
      try {
        const text = event.data.text();
        if (text) body = text;
      } catch (err) {}
    }
  }

  const options = {
    body,
    icon,
    badge: icon,
    vibrate: [200, 100, 200],
    silent: false,
    data: {
      url
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Optional: notification close event
self.addEventListener('notificationclose', () => {
  // no-op
});
