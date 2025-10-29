// ===============================
// 🧩 SERVICE WORKER : sw.js
// ===============================
const CACHE_NAME = "lol-pixel-guesser-v0.0.www";
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // ⚡ activation immédiate
});

// --- ACTIVATION ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// --- FETCH (network first, fallback cache) ---
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

// --- COMMUNICATION AVEC LE CLIENT ---
self.addEventListener("message", (event) => {
  if (event.data?.type === "CHECK_FOR_UPDATE") {
    self.registration.update();
  }
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
