// Service worker for CrossFit SkillFitness PWA
const CACHE_VERSION = 'v1.0.1'; // Incrementado para forzar actualización del SW

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle standard requests
});
