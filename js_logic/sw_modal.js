// ===============================
// 🌐 CLIENT : script principal
// ===============================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js");
      console.log("✅ SW enregistré", registration);

      // 🔍 Force une vérification à chaque démarrage
      registration.update();

      // ⚡ Détection de nouvelle version
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            if (majModal) majModal.classList.remove("hidden");
          }
        });
      });

      // 🔔 Communication SW -> Client
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "NEW_VERSION_AVAILABLE") {
          if (majModal) majModal.classList.remove("hidden");
        }
      });
    } catch (err) {
      console.error("❌ Erreur SW :", err);
    }
  });
}

// --- INSTALLATION PWA ---
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallModalIfNeeded();
});

let deferredPrompt;
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const modal = document.getElementById("install-modal");
const btnAndroid = document.getElementById("tab-android");
const btnIOS = document.getElementById("tab-ios");
const contentAndroid = document.getElementById("content-android");
const contentIOS = document.getElementById("content-ios");
const closeModal = document.getElementById("close-modal");
const installBtn = document.getElementById("install-btn");
const majModal = document.getElementById("maj-modal");
const majBtn = document.getElementById("maj-btn");

// --- FERMETURE POPIN ---
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

// --- SWITCH ONGLET ---
btnAndroid.addEventListener("click", () => {
  btnAndroid.classList.add("active");
  btnIOS.classList.remove("active");
  contentAndroid.classList.remove("hidden");
  contentIOS.classList.add("hidden");
});

btnIOS.addEventListener("click", () => {
  btnIOS.classList.add("active");
  btnAndroid.classList.remove("active");
  contentIOS.classList.remove("hidden");
  contentAndroid.classList.add("hidden");
});

// --- INSTALLATION / iOS ---
function isAppInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export function showInstallModalIfNeeded() {
  if (isAppInstalled()) return;

  if (deferredPrompt) {
    modal.classList.remove("hidden");
    btnAndroid.classList.add("active");
    contentAndroid.classList.remove("hidden");
    contentIOS.classList.add("hidden");
    return;
  }

  if (isIOS) {
    modal.classList.remove("hidden");
    btnIOS.classList.add("active");
    contentIOS.classList.remove("hidden");
    contentAndroid.classList.add("hidden");
  }
}

// --- BOUTON MAJ ---
if (majBtn) {
  majBtn.addEventListener("click", async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  });
}

// --- BOUTON INSTALL ---
if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") console.log("App installée !");
      deferredPrompt = null;
      modal.classList.add("hidden");
    } else {
      alert("Sur iOS, utilisez le bouton 'Partager' puis 'Sur l'écran d'accueil'");
    }
  });
};
