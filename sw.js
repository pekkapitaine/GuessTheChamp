// sw.js
const CACHE_NAME = "lol-pixel-guesser-v0.0.tesfet1eaa";
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
  self.skipWaiting(); // permet l'activation immédiate
});

// --- ACTIVATION ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );

  self.clients.claim();
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({ type: 'NEW_VERSION_AVAILABLE' }));
  });
});


// --- FETCH (offline support) ---
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// --- 🔥 DÉTECTION DE NOUVELLE VERSION ---
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_FOR_UPDATE") {
    self.registration.update(); // force la vérification du SW distant
  }
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting(); // force le SW à devenir actif
  }
});

// Quand une nouvelle version du SW est trouvée
self.addEventListener("updatefound", () => {
  const newSW = self.registration.installing;
  if (newSW) {
    newSW.addEventListener("statechange", () => {
      if (newSW.state === "installed") {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "NEW_VERSION_AVAILABLE" });
          });
        });
      }
    });
  }
});
