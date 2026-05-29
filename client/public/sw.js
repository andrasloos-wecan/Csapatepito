// Minimális service worker — csak az appot cache-eli alapszinten.
// PWA telepíthetőség és offline-fallback a P0 minimumon.
const CACHE = "csapatepito-v1";
const ASSETS = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api/")) return;
  e.respondWith(
    caches.match(request).then(
      (cached) => cached || fetch(request).catch(() => caches.match("/"))
    )
  );
});
