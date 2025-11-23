import {showInstallModalIfNeeded} from './sw_modal.js';
import {setupLiveSuggestions,loadChampionsList} from './champs_suggestions.js';
import {startTimer, stopTimer} from './timer.js';
import {loadRandomChampImage,checkChampionGuess} from './image.js';


export let gameDifficulty;
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready");
});
showInstallModalIfNeeded();
// -----------------------------
// 🎬 ÉCRANS / NAVIGATION
// -----------------------------
const welcomeScreen = document.getElementById("welcome-screen");
const infiniteModeDiv = document.getElementById("infinite-mode");

function showScreen(screenDiv) {
  [welcomeScreen, infiniteModeDiv].forEach(div => {
    if(div === screenDiv) div.style.display = "flex";
    else div.style.display = "none";
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  await loadChampionsList();
  setupLiveSuggestions("champ-input", "suggestions", (value) => {
  checkChampionGuess(value, "infinite");
  });

  document.querySelectorAll(".difficulty-card").forEach(card => {
    card.addEventListener("click", async () => {
      
      gameDifficulty = card.dataset.difficulty;
      console.log(gameDifficulty);
      document.getElementById("mode-infini-title").textContent = `♾️ Mode Infini - ${gameDifficulty.charAt(0).toUpperCase() + gameDifficulty.slice(1)}`;
      await loadRandomChampImage(gameDifficulty);
      startTimer();
      showScreen(infiniteModeDiv);
    });
  });

  document.getElementById("back-from-infinite").addEventListener("click", () => {
    stopTimer();
    showScreen(welcomeScreen);
  });

  document.getElementById("skip-current-champ").addEventListener("click", () => {
    loadRandomChampImage(gameDifficulty);
  });
});





