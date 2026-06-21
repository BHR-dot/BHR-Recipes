const CACHE = "bhr-v4";
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
  const url = new URL(req.url);
  // Network-first for the page itself AND the manifest, so updates always land; fall back to cache offline.
  if (req.mode === "navigate" || req.destination === "document" || url.pathname.endsWith("/manifest.json")) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(c => c || caches.match("/BHR-Recipes/index.html")))
    );
    return;
  }
  // Cache-first for everything else (logo, etc.)
  e.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
