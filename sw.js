// sw.js
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker : installation...");
  event.waitUntil(
    caches.open("pyodide-cache-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./js_logic/app.js",
        "./manifest.webmanifest",
        "./assets/favicon/favicon192.png",
        "./assets/favicon/favicon512.png",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("⚡ Service Worker activé !");
  event.waitUntil(self.clients.claim());
});
