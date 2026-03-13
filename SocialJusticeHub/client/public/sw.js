// Self-unregistering service worker
// This replaces a stale Workbox SW that was causing console errors
// by intercepting GTM and API requests it couldn't handle.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.registration.unregister().then(() => {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.navigate(client.url));
    });
  });
});
