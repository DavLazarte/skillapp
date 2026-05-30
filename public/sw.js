// Service worker for SkillFitness PWA
const CACHE_VERSION = 'v1.4.0';
const CACHE_NAME = `skillfitness-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/iconlogo.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Remove old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy: always try the network, fallback to cache
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
