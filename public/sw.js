/// <reference lib="webworker" />

const CACHE_NAME = 'zonetv-v1';
const STATIC_CACHE = 'zonetv-static-v1';
const DYNAMIC_CACHE = 'zonetv-dynamic-v1';
const VIDEO_CACHE = 'zonetv-video-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Cache strategies
const CACHE_STRATEGIES = {
  networkFirst: ['api'],
  cacheFirst: ['icons', 'screenshots', '_next/static'],
  staleWhileRevalidate: ['movies', 'series', 'tv', 'dashboard'],
};

// Install event - cache static assets
self.addEventListener('install', (event: any) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Activate immediately
  (self as any).skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: any) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE && 
                   name !== VIDEO_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Take control of all pages immediately
  (self as any).clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event: any) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip video streams (too large to cache)
  if (url.pathname.includes('/stream') || 
      url.pathname.includes('.m3u8') ||
      url.pathname.includes('.ts') ||
      request.headers.get('range')) {
    return;
  }
  
  // Determine cache strategy
  const strategy = getCacheStrategy(url.pathname);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Get cache strategy based on pathname
function getCacheStrategy(pathname: string): 'networkFirst' | 'cacheFirst' | 'staleWhileRevalidate' {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => pathname.includes(pattern))) {
      return strategy as any;
    }
  }
  return 'staleWhileRevalidate';
}

// Handle request based on strategy
async function handleRequest(request: Request, strategy: string): Promise<Response> {
  switch (strategy) {
    case 'networkFirst':
      return networkFirst(request);
    case 'cacheFirst':
      return cacheFirst(request);
    case 'staleWhileRevalidate':
    default:
      return staleWhileRevalidate(request);
  }
}

// Network first strategy - try network, fall back to cache
async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline') as Promise<Response>;
    }
    throw error;
  }
}

// Cache first strategy - serve from cache, fall back to network
async function cacheFirst(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect fill="#1a1a1a" width="200" height="300"/></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

// Stale while revalidate - serve from cache, update in background
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event: any) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncWatchProgress());
  }
});

// Sync favorites when back online
async function syncFavorites(): Promise<void> {
  // Get pending favorites from IndexedDB and sync
  console.log('[SW] Syncing favorites...');
}

// Sync watch progress when back online
async function syncWatchProgress(): Promise<void> {
  // Get pending progress from IndexedDB and sync
  console.log('[SW] Syncing watch progress...');
}

// Push notifications
self.addEventListener('push', (event: any) => {
  console.log('[SW] Push received:', event);
  
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'Nowa aktualizacja!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'Otwórz' },
      { action: 'close', title: 'Zamknij' },
    ],
  };
  
  event.waitUntil(
    (self as any).registration.showNotification(data.title || 'ZONEtv', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event: any) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window' }).then((clients: any[]) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if ((self as any).clients.openWindow) {
        return (self as any).clients.openWindow(url);
      }
    })
  );
});

console.log('[SW] Service worker loaded');
