// =====================================================================
// SmartCity Service Worker — v3
// Handles:
//   - Background push notifications (works when PWA is fully closed)
//   - Notification click → deep-link navigation
//   - Cache-first fetch strategy for offline resilience
//
// IMPORTANT: This file must NOT import React / Socket.IO / window / document.
// It runs in a separate worker context independent of the React app.
// =====================================================================

const CACHE_NAME = 'smart-city-pwa-v3';
const ICON_URL   = '/icon-192.png';  // Small optimized icon (<600 bytes)
const BADGE_URL  = '/badge-72.png';  // Monochrome badge (<200 bytes)

// ------------------------------------------------------------------
// INSTALL — skip waiting so the new SW activates immediately
// ------------------------------------------------------------------
self.addEventListener('install', (event) => {
  console.log('[SW] Installing SmartCity SW v3');
  self.skipWaiting();
});

// ------------------------------------------------------------------
// ACTIVATE — claim all clients and clean up old caches
// ------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating SmartCity SW v3');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        )
      )
    ])
  );
});

// ------------------------------------------------------------------
// FETCH — network-first, fall back to cache for GET requests only
// ------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for offline fallback
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ------------------------------------------------------------------
// PUSH — receive Web Push from backend and show system notification
//
// This fires even when the PWA is COMPLETELY CLOSED.
// DO NOT check clients.length — notification must show regardless.
//
// Backend payload format:
// {
//   "title": "...",
//   "body": "...",
//   "icon": "/icon-192.png",        (optional override)
//   "badge": "/badge-72.png",       (optional override)
//   "tag": "smartcity-<id>",        (optional)
//   "data": {
//     "notificationId": "...",
//     "complaintId": "...",
//     "type": "COMPLAINT_CREATED",
//     "url": "/citizen/complaints/..."
//   }
// }
// ------------------------------------------------------------------
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received at:', new Date().toISOString());

  let payload = {};

  // Parse payload — fall back to safe defaults if malformed
  try {
    if (event.data) {
      payload = event.data.json();
      console.log('[SW] Push payload parsed:', JSON.stringify(payload));
    } else {
      console.warn('[SW] Push event had no data payload');
    }
  } catch (err) {
    console.warn('[SW] Push payload parse error (falling back to text):', err.message);
    payload = {
      title: 'SmartCity Notification',
      body: event.data ? event.data.text() : 'You have a new civic update.'
    };
  }

  // Extract fields — payload.data contains the nested metadata object
  const title   = payload.title  || 'SmartCity Alert';
  const body    = payload.body   || 'You have an update regarding civic services.';
  const icon    = payload.icon   || ICON_URL;
  const badge   = payload.badge  || BADGE_URL;

  // Nested data object from backend
  const meta    = payload.data   || {};
  const notificationId = meta.notificationId || null;
  const complaintId    = meta.complaintId    || null;
  const type           = meta.type           || 'SYSTEM';
  const url            = meta.url            || '/';

  console.log('[SW] Showing notification:', { title, body, url, notificationId, type });

  const options = {
    body,
    icon,
    badge,
    // Unique tag groups repeated notifications — prevents spam but replaces old
    tag: notificationId ? `smartcity-${notificationId}` : 'smartcity-default',
    // renotify: true ensures a new vibration/sound even when tag matches
    renotify: true,
    // requireInteraction: false — don't force user to dismiss on desktop
    requireInteraction: false,
    // Vibration pattern (Android)
    vibrate: [200, 100, 200, 100, 400],
    // Timestamp for notification ordering in notification drawer
    timestamp: Date.now(),
    // Store metadata for notificationclick handler
    data: {
      url,
      notificationId,
      complaintId,
      type
    },
    // Action buttons
    actions: [
      { action: 'open',    title: '📋 View Details' },
      { action: 'dismiss', title: '✕ Dismiss'       }
    ]
  };

  // CRITICAL: event.waitUntil prevents the SW from being terminated
  // before showNotification completes. This is what makes closed-app
  // delivery work — the browser wakes the SW, we call waitUntil, and
  // the notification is shown before the browser suspends the SW again.
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('[SW] Notification displayed successfully:', title);
      })
      .catch((err) => {
        console.error('[SW] showNotification failed:', err.message);
      })
  );
});

// ------------------------------------------------------------------
// NOTIFICATION CLICK — handle tap on system notification
// ------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked, action:', event.action);
  event.notification.close();

  // User tapped "Dismiss" button — do nothing further
  if (event.action === 'dismiss') {
    return;
  }

  // Determine target URL (from notification data or default to '/')
  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';

  console.log('[SW] Opening URL:', targetUrl);

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If PWA window is already open — focus it and navigate
        for (const client of windowClients) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
            return;
          }
        }

        // PWA is completely closed — open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ------------------------------------------------------------------
// NOTIFICATION CLOSE — user dismissed without tapping (optional log)
// ------------------------------------------------------------------
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};
  console.log('[SW] Notification dismissed by user:', data.notificationId || 'unknown');
});
