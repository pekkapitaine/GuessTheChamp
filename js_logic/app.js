import {showInstallModalIfNeeded} from './sw_modal.js';
import {setupLiveSuggestions,loadChampionsList} from './champs_suggestions.js';
import {startTimer, stopTimer} from './timer.js';
import {loadRandomImage,checkChampionGuess} from './image.js';

let difficulty;
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready");
});
showInstallModalIfNeeded();
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


document.addEventListener("DOMContentLoaded", async () => {
  await loadChampionsList();
  setupLiveSuggestions("champ-input", "suggestions", (value) => {
  checkChampionGuess(value, "infinite");
  });

  setupLiveSuggestions("champ-input-challenge", "suggestions-challenge", (value) => {
    checkChampionGuess(value, "challenge");
  });
  document.querySelectorAll(".difficulty-card").forEach(card => {
    card.addEventListener("click", async () => {
      console.log("Card clicked:", card);
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





