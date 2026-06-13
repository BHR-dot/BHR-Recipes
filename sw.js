const CACHE = "bhr-v2";
const ASSETS = ["/BHR-Recipes/", "/BHR-Recipes/index.html", "/BHR-Recipes/bhr-logo.svg", "/BHR-Recipes/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match("/BHR-Recipes/index.html")))
  );
});
