// -----------------------------
// 🧠 LOGIQUE MODE INFINI
// -----------------------------
let currentChampion = null;
let currentImage = null;
let currentSoluce = null;

export async function loadRandomImage(mode, difficulty) {
  if (mode !== "infinite") {
    // Mode challenge ou autre
    document.getElementById("champ-image-challenge").src = "ImagesChamps/DefaultChamps/Yasuo.png";
    return;
  }

  try {
    const includeSkins = document.getElementById("include-skins").checked;

    // Charger le JSON
    const gameData = await fetch("game_data.json").then(res => res.json());
    const images = gameData.images || [];

    // Filtrer selon catégorie
    const champions = images.filter(img => includeSkins || img.category === "default");

    if (champions.length === 0) throw new Error("Aucune image disponible après filtrage");

    // Tirer un champion aléatoire
    const randomEntry = champions[Math.floor(Math.random() * champions.length)];

    // Déterminer la pixelisation selon difficulty
    const difficulties = { facile: 20, moyen: 33, difficile: 46, extreme: 59 };
    const pixelSize = difficulties[difficulty];

    const folder = randomEntry.category === "skin" ? "SkinChamps" : "DefaultChamps";
    const imagePath = `ImagesChamps/${folder}/${randomEntry.file}`;

    // Pixeliser l'image dynamiquement
    const pixelizedSrc = await pixelizeImage(imagePath, pixelSize);
    console.log("Pixelized src :", pixelizedSrc);

    // Afficher l'image
    const img = document.getElementById("champ-image");
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject("Erreur de chargement de l'image");
      img.src = pixelizedSrc;
    });

    // Stocker les infos pour le jeu
    currentChampion = randomEntry.champion;
    currentImage = pixelizedSrc;
    currentSoluce = imagePath;

  } catch (err) {
    console.error("Erreur lors du chargement de l'image :", err);
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
export function checkChampionGuess(guess, mode = 'infinite') {
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

// Fonction de pixelisation JS
async function pixelizeImage(src, pixelSize) {
  const img = new Image();
  img.src = src;

  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject("Erreur chargement image");
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Pixelisation
  const w = Math.max(1, Math.floor(img.width / pixelSize));
  const h = Math.max(1, Math.floor(img.height / pixelSize));

  // Étape 1 : réduire
  canvas.width = w;
  canvas.height = h;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, w, h);

  // Étape 2 : ré-agrandir
  const canvas2 = document.createElement("canvas");
  canvas2.width = img.width;
  canvas2.height = img.height;
  const ctx2 = canvas2.getContext("2d");
  ctx2.imageSmoothingEnabled = false;
  ctx2.drawImage(canvas, 0, 0, w, h, 0, 0, img.width, img.height);

  return canvas2.toDataURL();
}
