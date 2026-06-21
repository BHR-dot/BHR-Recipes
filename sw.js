const CACHE = "bhr-v3";
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
  const req = e.request;
  // Network-first for the page itself so new versions always load; fall back to cache when offline.
  if (req.mode === "navigate" || req.destination === "document") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put("/BHR-Recipes/index.html", copy));
        return res;
      }).catch(() => caches.match("/BHR-Recipes/index.html"))
    );
    return;
  }
  // Cache-first for everything else (logo, manifest, etc.)
  e.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
