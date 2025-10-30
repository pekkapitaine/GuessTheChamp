const CACHE_NAME = "lol-pixel-guesser-v0.0.zeezrzezer";
const urlsToCache = [
  "./",
  "./index.html",
  "./js_logic/app.js",
  "./js_logic/image.js",
  "./manifest.webmanifest",
  "./assets/favicon/favicon192.png",
  "./assets/favicon/favicon512.png",
];

// --- INSTALLATION ---
self.addEventListener("install", (event) => {
  console.log("[SW] Nouvelle version installée.");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// --- ACTIVATION ---
self.addEventListener("activate", (event) => {
  console.log("[SW] Activé, prêt à contrôler les pages.");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  return self.clients.claim();
});
  
// --- FETCH ---
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// --- MESSAGE ---
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting demandé → activation immédiate");
    self.skipWaiting();
  }
});
