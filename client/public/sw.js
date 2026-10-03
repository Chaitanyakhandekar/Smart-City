const CACHE_NAME = 'smart-city-pwa-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through to network, fallback to cache if available
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ==========================================
// WEB PUSH NOTIFICATION HANDLERS
// ==========================================

self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    console.warn('[SW] Push payload not JSON, falling back to text:', err);
    data = {
      title: 'SmartCity Notification',
      body: event.data ? event.data.text() : 'You have a new update.'
    };
  }

  const title = data.title || 'SmartCity Alert';
  const options = {
    body: data.body || 'You have an update regarding civic services.',
    icon: data.icon || '/favicon.png',
    badge: data.badge || '/favicon.png',
    tag: data.tag || 'smartcity-notification',
    data: {
      url: data.url || '/',
      notificationId: data.notificationId || null,
      type: data.type || 'SYSTEM',
      timestamp: Date.now()
    },
    vibrate: [150, 50, 100, 50, 200],
    renotify: true,
    requireInteraction: false,
    actions: data.actions || [
      { action: 'open', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url && 'focus' in client) {
          client.focus();
          if ('navigate' in client && client.url !== targetUrl) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
