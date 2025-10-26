const CACHE_NAME = "lol-pixel-guesser-v3"; // ← incrémente à chaque nouvelle version
const urlsToCache = [
  "./",
  "./index.html",
  "./js_logic/app.js",
  "./js_logic/image.js",
  "./manifest.webmanifest",
  "./assets/favicon/favicon192.png",
  "./assets/favicon/favicon512.png",
  // ajoute ici toutes tes images / assets nécessaires
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker : installation...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activation et suppression des anciens caches
self.addEventListener("activate", (event) => {
  console.log("⚡ Service Worker activé !");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Interception des requêtes pour le cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener('controllerchange', () => {
  console.log("🔄 Nouvelle version du Service Worker activée !");
});
