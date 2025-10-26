const difficulties = {"facile" : "easy", "moyen" : "medium", "difficile" : "hard", "extreme" : "extreme"};
const defaultDir = "ImagesChampPixel/DefaultChampsPixel";
const skinDir = "ImagesChampPixel/SkinChampsPixel";


// helper pour extraire le nom des fichiers d'un listing HTML
async function extractFilenames(response) {
  const text = await response.text();

  // Trouve tous les fichiers d’images (.png, .jpg, .jpeg)
  const matches = [...text.matchAll(/href="([^"]+\.(png|jpg|jpeg))"/gi)];
  const filenames = matches.map(m => m[1].replace(/\\/g, "/"));

  return filenames.filter(name =>
    !name.endsWith("/") && !name.includes("Parent Directory")
  );
}

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
function showInstallModalIfNeeded() {
  // Si l'app est déjà installée, ne rien faire
  if (isAppInstalled()) return;

  // --- Android / navigateur supportant beforeinstallprompt ---
  if (deferredPrompt && isReady) {
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

// -----------------------------
// 🔹 Initialisation Pyodide
// -----------------------------
let pyodide;
let isReady = false;

// Crée et affiche un loader une seule fois
function showLoader(message) {
  // Tableau de messages possibles
  const messages = ["Salut", "Hey", "Coucou"];

  // Si aucun message n’est passé, on en choisit un au hasard
  const messageToShow = message || messages[Math.floor(Math.random() * messages.length)];

  let loader = document.getElementById("loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loader";
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      <p id="loader-text">${messageToShow}</p>
    `;
    document.body.appendChild(loader);
  } else {
    document.getElementById("loader-text").textContent = messageToShow;
  }
}

// Supprime le loader
function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.remove()
}


// Étape 2 : charger ton module Python
async function loadGameModule() {
  const responseGame = await fetch("game.py");
  const codeGame = await responseGame.text();
  pyodide.FS.writeFile("game.py", codeGame);

  const responseData = await fetch("game_data.py");
  const codeData = await responseData.text();
  pyodide.FS.writeFile("game_data.py", codeData);
}
let championsList = [];

// Initialisation complète de l’app
async function initializeApp() {
  try {
    showLoader();  // 1️⃣ affiche le loader
    pyodide = await loadPyodide();
    await loadGameModule();
    await pyodide.runPythonAsync("import game");

    const response = await fetch("champions_list.json");
    championsList = await response.json();

    hideLoader();  // 2️⃣ Pyodide prêt, on cache le loader
    isReady = true;

    // 3️⃣ afficher le modal d'installation après le loader
    showInstallModalIfNeeded();
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation :", error);
    showLoader("Erreur de chargement. Recharge la page.");
  }
}

// Bloquer les boutons tant que Pyodide n’est pas prêt
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", async e => {
    if (!isReady) {
      alert("Patiente un peu, le moteur Python se charge !");
      return;
    }
  });
});
initializeApp();


// -----------------------------
// 🎬 ÉCRANS / NAVIGATION
// -----------------------------
const welcomeScreen = document.getElementById("welcome-screen");
const infiniteModeDiv = document.getElementById("infinite-mode");
const challengeModeDiv = document.getElementById("challenge-mode");

function showScreen(screenDiv) {
  [welcomeScreen, infiniteModeDiv, challengeModeDiv].forEach(div => {
    if(div === screenDiv) div.style.display = "flex";
    else div.style.display = "none";
  });
}

let difficulty;
let timerInterval = null;
let secondsElapsed = 0;
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".difficulty-card").forEach(card => {
    card.addEventListener("click", async () => {
      difficulty = card.dataset.difficulty;
      document.getElementById("mode-infini-title").textContent = `♾️ Mode Infini - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
      await loadRandomImage("infinite");
      startTimer();
      showScreen(infiniteModeDiv);
    });
  });

  document.getElementById("mode-challenge-btn").addEventListener("click", () => {
    showScreen(challengeModeDiv);
    loadRandomImage("challenge");
  });

  document.getElementById("back-from-infinite").addEventListener("click", () => {
    stopTimer();
    showScreen(welcomeScreen);
  });

    document.getElementById("back-from-challenge").addEventListener("click", () => {
    stopTimer();
    showScreen(welcomeScreen);
  });

  document.getElementById("skip-current-champ").addEventListener("click", () => {
    loadRandomImage("infinite");
  });
});

// -----------------------------
// 🔤 SUGGESTIONS LIVE
// -----------------------------


function setupLiveSuggestions(inputId, suggestionsId, onValidate) {
  const champInput = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);
  let focusedIndex = -1;

  champInput.addEventListener("input", () => {
    const query = champInput.value.toLowerCase().trim();
    suggestions.innerHTML = "";

    // 🔹 Masquer si aucun texte
    if (!query) {
      suggestions.style.display = "none";
      focusedIndex = -1;
      return;
    }

    const matches = championsList.filter(c => c.toLowerCase().includes(query));

    // 🔹 Masquer si aucune correspondance
    if (!matches.length) {
      suggestions.style.display = "none";
      focusedIndex = -1;
      return;
    }

    // 🔹 Affiche les suggestions
    matches.forEach(m => {
      const div = document.createElement("div");
      div.textContent = m;
      div.classList.add("suggestion-item");

      div.addEventListener("click", () => {
        champInput.value = m;
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
        onValidate(m);
      });

      suggestions.appendChild(div);
    });

    // 🔹 Focus sur le premier élément par défaut
    focusedIndex = 0;
    updateFocus();
    suggestions.style.display = "block";
  });

  champInput.addEventListener("keydown", (e) => {
    const items = suggestions.querySelectorAll(".suggestion-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusedIndex = (focusedIndex + 1) % items.length;
      updateFocus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusedIndex = (focusedIndex - 1 + items.length) % items.length;
      updateFocus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedChampion = items[focusedIndex]?.textContent;
      if (selectedChampion) {
        champInput.value = selectedChampion;
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
        onValidate(selectedChampion);
      }
    }
  });

  // 🔹 Gère le focus visuel + scroll automatique
  function updateFocus() {
    const items = suggestions.querySelectorAll(".suggestion-item");
    items.forEach((item, idx) => {
      const isFocused = idx === focusedIndex;
      item.classList.toggle("focused", isFocused);
      if (isFocused) {
        item.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    });
  }
}


setupLiveSuggestions("champ-input", "suggestions", (value) => {
  checkChampionGuess(value, "infinite");
});

setupLiveSuggestions("champ-input-challenge", "suggestions-challenge", (value) => {
  checkChampionGuess(value, "challenge");
});

// -----------------------------
// 🧠 LOGIQUE MODE INFINI
// -----------------------------
let currentChampion = null;
let currentImage = null;
let currentSoluce = null;

async function loadRandomImage(mode) {
  if (mode === "infinite") {
    const includeSkins = document.getElementById("include-skins").checked ? "True" : "False";

    try {
      const result = await pyodide.runPythonAsync(`
        from game import get_random_champion
        get_random_champion("${difficulties[difficulty]}", ${includeSkins})
      `);

      const data = JSON.parse(result);

      currentChampion = data.champion;
      currentImage = data.image;
      currentSoluce = data.image_soluce;

      console.log("Données reçues de Python, champion :", currentChampion, "image :", currentImage, "soluce :", currentSoluce);

      // Créer une promesse pour attendre que l'image soit chargée
      await new Promise((resolve, reject) => {
        const img = document.getElementById("champ-image");
        img.onload = () => resolve();
        img.onerror = () => reject("Erreur de chargement de l'image");
        img.src = currentImage;
      });

    } catch (err) {
      console.error("Erreur :", err);
    }
  } else {
    document.getElementById("champ-image-challenge").src = "/ImagesChampPixel/DefaultChampsPixel/easy/Yasuo-default.png";
  }
}

// -----------------------------
// 🏁 VALIDATION
// -----------------------------
// normalisation simple (supprime accents, met en minuscule)
function normalizeStr(s) {
  return String(s || '')
    .normalize('NFD')                     // décompose les accents
    .replace(/[\u0300-\u036f]/g, '')      // supprime les diacritiques
    .replace(/\s+/g, ' ')                 // écrase espaces multiples
    .trim()
    .toLowerCase();
}

/**
 * Validate a guess.
 * mode: 'infinite' (default) or 'challenge' -> chooses which UI elements to update
 * Returns true if correct, false otherwise.
 */
function checkChampionGuess(guess, mode = 'infinite') {
  guess = String(guess || '').trim();
  if (!guess) return false;

  const resultDiv = mode === 'infinite'
    ? document.getElementById("result")
    : document.getElementById("feedback-challenge");

  const inputEl = mode === 'infinite'
    ? document.getElementById("champ-input")
    : document.getElementById("champ-input-challenge");

  const suggestionsEl = mode === 'infinite'
    ? document.getElementById("suggestions")
    : document.getElementById("suggestions-challenge");

  if (!currentChampion) return false;

  const normalizedGuess = normalizeStr(guess);
  const normalizedChampion = normalizeStr(currentChampion);

  const champImg = mode === 'infinite'
    ? document.getElementById("champ-image")
    : document.getElementById("champ-image-challenge");

  // Nettoie l'input / suggestions
  if (inputEl) inputEl.value = "";
  if (normalizedGuess === normalizedChampion) {
    // ✅ Bonne réponse
    if (resultDiv) {
      resultDiv.textContent = "✅ Correct !";
      resultDiv.style.color = "limegreen";
      resultDiv.classList.add("visible");
    }

    if (suggestionsEl) {
      suggestionsEl.innerHTML = "";
      suggestionsEl.style.display = "none";
    }

    // Affiche la solution si disponible
    if (champImg && currentSoluce) {
      champImg.src = currentSoluce;
    }

    // 🔹 attend 1s puis charge l'image suivante et cache le feedback
    setTimeout(() => {
      resultDiv.classList.remove("visible");
      if (mode === 'infinite') {
        loadRandomImage("infinite");
      } else {
        loadRandomImage("challenge");
      }
    }, 1000);

    return true;
  } else {
    // ❌ Mauvaise réponse
    if (resultDiv) {
      resultDiv.textContent = "❌ Faux !";
      resultDiv.style.color = "red";
      resultDiv.classList.add("visible");
    }

    setTimeout(() => {
      if (resultDiv) resultDiv.classList.remove("visible");
    }, 2000);

    return false;
  }
}

// INCLUDE SKIN IN MEMORY
// --- Gestion du choix "Inclure les skins" ---
const includeSkinsCheckbox = document.getElementById('include-skins');

// 1️⃣ Charger la préférence au démarrage
const savedPreference = localStorage.getItem('includeSkins');
if (savedPreference !== null) {
  includeSkinsCheckbox.checked = savedPreference === 'true';
}

// 2️⃣ Sauvegarder à chaque changement
includeSkinsCheckbox.addEventListener('change', () => {
  localStorage.setItem('includeSkins', includeSkinsCheckbox.checked);
});

// Gestion du Timer
function startTimer() {
  const timerElement = document.getElementById("timer");
  secondsElapsed = 0;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    secondsElapsed++;
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    timerElement.textContent = `⏱️ ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById("timer").textContent = "⏱️ 00:00";
}