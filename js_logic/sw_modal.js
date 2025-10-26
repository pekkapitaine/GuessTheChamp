
// -----------------------------
// 🔧 SERVICE WORKER & PWA
// -----------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.error('SW failed', err));
  });
}

// --- ÉVÉNEMENT INSTALLATION ---
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallModalIfNeeded();
  
});

// --- VARIABLES ---
let deferredPrompt;
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const modal = document.getElementById("install-modal");
const btnAndroid = document.getElementById("tab-android");
const btnIOS = document.getElementById("tab-ios");
const contentAndroid = document.getElementById("content-android");
const contentIOS = document.getElementById("content-ios");
const closeModal = document.getElementById("close-modal");
const installBtn = document.getElementById('install-btn');

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

// --- FONCTION : vérifier si l'app est déjà installée ---
function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true; // iOS Safari
}

// --- FONCTION : afficher la popin si besoin ---
export function showInstallModalIfNeeded() {
  // Si l'app est déjà installée, ne rien faire
  if (isAppInstalled()) return;

  // --- Android / navigateur supportant beforeinstallprompt ---
  if (deferredPrompt) {
    modal.classList.remove('hidden');
    btnAndroid.classList.add("active");
    btnIOS.classList.remove("active");
    contentAndroid.classList.remove("hidden");
    contentIOS.classList.add("hidden");
    return;
  }

  // --- iOS (Safari) ---
  if (isIOS) {
    modal.classList.remove('hidden');
    btnIOS.classList.add("active");
    btnAndroid.classList.remove("active");
    contentIOS.classList.remove("hidden");
    contentAndroid.classList.add("hidden");
    return;
  }
}

// --- BOUTON INSTALLATION ---
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();   // lance l'installation PWA
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('App installée !');
      }
      deferredPrompt = null;
      modal.classList.add('hidden'); // fermer la popin après installation
    } else {
      alert("Sur iOS, utilisez le bouton 'Partager' puis 'Sur l'écran d'accueil'");
    }
  });
}



