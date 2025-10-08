self.addEventListener("install", (event) => {
  console.log("📦 Service Worker : installation...");
  event.waitUntil(
    caches.open("pyodide-cache-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./app.js",
        "./manifest.webmanifest",
        "./assets/favicon192.png",
        "./assets/favicon512.png"
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

// Enregistrement du service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("✅ Service worker enregistré"))
    .catch(err => console.error("Erreur SW :", err));
}
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("✅ beforeinstallprompt déclenché !");
  e.preventDefault();
  const installBtn = document.createElement("button");
  installBtn.textContent = "📲 Installer l'application";
  document.body.appendChild(installBtn);
  installBtn.addEventListener("click", async () => {
    e.prompt();
    const { outcome } = await e.userChoice;
    console.log(`Résultat installation : ${outcome}`);
  });
});