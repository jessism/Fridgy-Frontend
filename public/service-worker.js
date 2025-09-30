/* eslint-disable no-restricted-globals */

// Cache name versioning
const CACHE_NAME = 'trackabite-v4'; // v4: Remove HTML caching for auth redirect
const urlsToCache = [
  // Removed '/' to prevent caching landing page - fixes auth redirect issue
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('[Service Worker] Cache install error:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate at', new Date().toISOString());
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Caches cleaned, claiming clients');
      return self.clients.claim();
    }).then(() => {
      // Notify all clients that service worker is ready
      return self.clients.matchAll().then(clients => {
        console.log('[Service Worker] Notifying', clients.length, 'clients of activation');
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            timestamp: new Date().toISOString()
          });
        });
      });
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests (except auth refresh)
  if (event.request.method !== 'GET') {
    // Special handling for auth refresh requests
    if (event.request.url.includes('/api/auth/refresh') && event.request.method === 'POST') {
      event.respondWith(
        fetch(event.request).catch(error => {
          console.error('[Service Worker] Auth refresh failed:', error);
          throw error;
        })
      );
    }
    return;
  }

  // NEVER cache auth endpoints - always go to network
  if (event.request.url.includes('/api/auth/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Skip other API requests from cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first for HTML documents (for auth redirect to work)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Only use cache when offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first for static assets (CSS, JS, images)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then(fetchResponse => {
          // Don't cache if not a valid response
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type === 'opaque') {
            return fetchResponse;
          }

          // Only cache static assets, not HTML
          const isStaticAsset = event.request.url.includes('/static/') ||
                                event.request.url.includes('.css') ||
                                event.request.url.includes('.js') ||
                                event.request.url.includes('.png') ||
                                event.request.url.includes('.jpg') ||
                                event.request.url.includes('.ico');

          if (isStaticAsset) {
            // Clone the response before caching
            const responseToCache = fetchResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return fetchResponse;
        });
      })
      .catch(() => {
        // Return a simple offline message for failed requests
        return new Response('Offline - Please check your connection', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Message handler for test notifications
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SHOW_TEST_NOTIFICATION') {
    const { title, body, timestamp } = event.data.data;

    console.log('[Service Worker] Showing test notification:', { title, body });

    self.registration.showNotification(title || '🔔 Test Notification', {
      body: body || 'If you see this, notifications are working!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'test-notification',
      timestamp: timestamp || Date.now(),
      requireInteraction: false,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    }).then(() => {
      console.log('[Service Worker] Test notification displayed successfully');
    }).catch(error => {
      console.error('[Service Worker] Failed to show test notification:', error);
    });
  }
});

// Push event - show notifications with detailed logging
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received at', new Date().toISOString());

  let data = {
    title: 'Trackabite Reminder',
    body: 'You have items expiring soon!',
    icon: '/logo192.png',
    badge: '/logo192.png'
  };

  // Parse push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[Service Worker] Push payload parsed:', payload);
      data = { ...data, ...payload };
    } catch (e) {
      console.log('[Service Worker] Push payload as text:', event.data.text());
      data.body = event.data.text();
    }
  } else {
    console.log('[Service Worker] No push data received');
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/logo192.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    tag: data.tag || 'trackabite-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'view', title: 'View Items' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => {
        console.log('[Service Worker] Push notification displayed:', data.title);
        // Send message back to clients about successful notification
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NOTIFICATION_SHOWN',
              data: { title: data.title, timestamp: new Date().toISOString() }
            });
          });
        });
      })
      .catch(error => {
        console.error('[Service Worker] Failed to show push notification:', error);
        // Send error back to clients
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NOTIFICATION_ERROR',
              error: error.message
            });
          });
        });
      })
  );
});

// Notification click event with detailed logging
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked:', {
    action: event.action,
    tag: event.notification.tag,
    title: event.notification.title
  });
  event.notification.close();

  let urlToOpen = '/inventory';

  if (event.action === 'view') {
    urlToOpen = '/inventory';
  } else if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if there's already a window/tab open
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-inventory') {
    event.waitUntil(syncInventory());
  }
});

async function syncInventory() {
  // This will be implemented later to sync offline changes
  console.log('[Service Worker] Syncing inventory changes...');
}

// Listen for messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});