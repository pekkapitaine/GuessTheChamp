// scripts/mode_infini.js

let difficulty;
let includeSkin = false;
let timerInterval = null;
let secondsElapsed = 0;
let currentChampion = null;
let currentImage = null;
let currentSoluce = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Bouton retour
  document.getElementById("back-from-infinite").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Récupérer paramètres URL
  const params = new URLSearchParams(window.location.search);
  difficulty = params.get("difficulty") || "easy";
  includeSkin = params.get("includeSkin") || false;

  // Attendre que Pyodide soit prêt
  await window.pyodideReadyPromise;
  const pyodide = window.pyodide;
  console.log("♾️ Pyodide prêt dans mode_infini.js");

  // Charger une première image
  await loadRandomImage(pyodide);
  startTimer();

  // Passer au champion suivant
  document.getElementById("skip-current-champ").addEventListener("click", async () => {
    await loadRandomImage(pyodide);
  });

  setupLiveSuggestions("champ-input", "suggestions", (value) => {
    checkChampionGuess(value);
  });
});

async function loadRandomImage(pyodide) {
  try {
    const result = await pyodide.runPythonAsync(`
      from game import get_random_champion
      get_random_champion("${difficulty}", ${includeSkin})
    `);
    const data = JSON.parse(result);
    currentChampion = data.champion;
    currentImage = data.image;
    currentSoluce = data.image_soluce;
    document.getElementById("champ-image").src = currentImage;
  } catch (err) {
    console.error("Erreur Python:", err);
  }
}

// Timer
function startTimer() {
  const el = document.getElementById("timer");
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const min = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
    const sec = String(secondsElapsed % 60).padStart(2, "0");
    el.textContent = `⏱️ ${min}:${sec}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  document.getElementById("timer").textContent = "⏱️ 00:00";
}

// Système de suggestions (copié de ton app.js, mais isolé ici)
function setupLiveSuggestions(inputId, suggestionsId, onValidate) {
  const champInput = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);
  let focusedIndex = -1;

  champInput.addEventListener("input", () => {
    const query = champInput.value.toLowerCase().trim();
    suggestions.innerHTML = "";
    if (!query) {
      suggestions.style.display = "none";
      focusedIndex = -1;
      return;
    }

    const matches = window.championsList.filter(c => c.toLowerCase().includes(query));
    if (!matches.length) {
      suggestions.style.display = "none";
      focusedIndex = -1;
      return;
    }

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
    suggestions.style.display = "block";
  });
}

function checkChampionGuess(guess) {
  const resultDiv = document.getElementById("result");
  const normalized = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalized(guess) === normalized(currentChampion)) {
    resultDiv.textContent = "✅ Correct !";
    resultDiv.style.color = "limegreen";
    document.getElementById("champ-image").src = currentSoluce;
    setTimeout(async () => {
      await loadRandomImage(window.pyodide);
      resultDiv.textContent = "";
    }, 1000);
  } else {
    resultDiv.textContent = "❌ Faux !";
    resultDiv.style.color = "red";
    setTimeout(() => resultDiv.textContent = "", 1500);
  }
}
