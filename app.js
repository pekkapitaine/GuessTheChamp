const difficulties = ["easy", "medium", "hard", "extreme"];
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
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(reg => console.log("✅ Service Worker enregistré :", reg.scope))
      .catch(err => console.error("Erreur SW :", err));
  });
}

// Gestion de l'installation PWA
let deferredPrompt; // 🔹 variable globale pour stocker l'événement

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("✅ beforeinstallprompt déclenché !");
  e.preventDefault();
  deferredPrompt = e; // on le stocke pour l’utiliser plus tard

  const installBtn = document.createElement("button");
  installBtn.textContent = "📲 Installer l'application";
  installBtn.classList.add("install-btn");
  document.getElementById("welcome-screen").appendChild(installBtn);

  installBtn.addEventListener("click", async () => {
    console.log("🟢 Bouton d'installation cliqué");
    installBtn.remove();

    deferredPrompt.prompt(); // on utilise la variable stockée
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Résultat installation : ${outcome}`);

    deferredPrompt = null; // l'événement ne peut plus être réutilisé
  });
});


// ⚡ app.js (module ES)

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

// Étape 1 : charger Pyodide
async function initPyodide() {
  pyodide = await loadPyodide();
  console.log("✅ Pyodide chargé !");
}

// Étape 2 : charger ton module Python
async function loadGameModule() {
  const responseGame = await fetch("game.py");
  const codeGame = await responseGame.text();
  pyodide.FS.writeFile("game.py", codeGame);

  const responseData = await fetch("game_data.py");
  const codeData = await responseData.text();
  pyodide.FS.writeFile("game_data.py", codeData);

  console.log("✅ game.py et game_data.py écrits dans Pyodide");
}


// Initialisation complète de l’app
async function initializeApp() {
  try {
    showLoader();
    await initPyodide();

    await loadGameModule();
    await pyodide.runPythonAsync("import game");

    console.log("✅ game.py et game_data.py chargés dans Pyodide !");

    loadChampionsList();
    hideLoader();
    isReady = true;
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
    console.log(`🟢 Bouton ${btn.id} cliqué après initialisation`);
  });
});

// Lancer le chargement au démarrage
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

    // Sélectionne toutes les cartes de difficulté
  document.querySelectorAll(".difficulty-card").forEach(card => {
    card.addEventListener("click", async () => {
      difficulty = card.dataset.difficulty;
      console.log(`🎮 Lancement du mode infini (${difficulty})`);

      
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
let championsList = [];

async function loadChampionsList() {
  const response = await fetch("champions_list.json");
  championsList = await response.json();
  console.log("✅ Liste des champions chargée :", championsList.length);
}

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
    // Si on passe une difficulté depuis la carte, on l'utilise, sinon on lit le select
    const includeSkins = document.getElementById("include-skins").checked ? "True" : "False";

    try {
      const result = await pyodide.runPythonAsync(`
        from game import get_random_champion
        get_random_champion("${difficulty}", ${includeSkins})
        `);
      const data = JSON.parse(result);

      currentChampion = data.champion;
      currentImage = data.image;
      currentSoluce = data.image_soluce;
      console.log("Données reçues de Python, champion :", currentChampion, "image :", currentImage, "soluce :", currentSoluce);

      document.getElementById("champ-image").src = currentImage;

    } catch (err) {
      console.error("Erreur Pyodide :", err);
    }
  } else {
    // Placeholder pour le mode challenge
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