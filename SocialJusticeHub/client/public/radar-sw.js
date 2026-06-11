/**
 * Service worker del Radar ¡BASTA! (scope /radar).
 * - Navegaciones: network-first con fallback al shell cacheado (uso offline).
 * - Assets estáticos same-origin: stale-while-revalidate.
 * - /api/: siempre red, nunca cache (la cola offline vive en la app).
 */
const CACHE = 'radar-shell-v1';
const SHELL_URL = '/radar';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(SHELL_URL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('radar-shell-') && k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // siempre red

  // Navegaciones dentro del scope: red primero, shell cacheado si no hay conexión
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(SHELL_URL, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(SHELL_URL).then((hit) => hit || Response.error()))
    );
    return;
  }

  // Assets estáticos: stale-while-revalidate
  const isStatic = /\.(js|css|png|svg|webmanifest|woff2?|ico)$/.test(url.pathname) || url.pathname.startsWith('/assets/');
  if (isStatic) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
