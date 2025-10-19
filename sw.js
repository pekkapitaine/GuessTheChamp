const CACHE_NAME = "pyodide-cache-v1";
const BASE_ASSETS = [
  "./",
  "./index.html",
  "./mode_infini.html",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/favicon/favicon192.png",
  "./assets/favicon/favicon512.png"
];

self.addEventListener("install", (event) => {
  console.log("📦 SW install...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1️⃣ cache de base
      await cache.addAll(BASE_ASSETS);

      // 2️⃣ cache des images depuis JSON en batch
      try {
        const response = await fetch("images_list.json");
        const images = await response.json();
        await cache.addAll(images);  // tout en une seule fois
        console.log(`✅ ${images.length} images mises en cache`);
      } catch(e){ 
        console.warn("❌ Impossible de charger ou mettre en cache images_list.json", e); 
      }
    })
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignore les query params pour cache sauf si c'est une image ou JS/CSS
  if (url.pathname.endsWith(".html")) {
    event.respondWith(fetch(event.request));
    return;
  }

  const cacheKey = url.origin + url.pathname;
  event.respondWith(
    caches.match(cacheKey).then((resp) => resp || fetch(event.request))
  );
});


self.addEventListener("activate", (event) => {
  console.log("⚡ SW activé !");
  event.waitUntil(self.clients.claim());
});
