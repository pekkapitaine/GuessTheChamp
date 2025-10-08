// Elements accueil
const welcomeScreen = document.getElementById("welcome-screen");
const infiniteModeDiv = document.getElementById("infinite-mode");
const challengeModeDiv = document.getElementById("challenge-mode");

document.getElementById("mode-infinite-btn").addEventListener("click", () => {
  welcomeScreen.style.display = "none";
  infiniteModeDiv.style.display = "block";
  loadRandomImage("infinite"); // placeholder, on branchera Python plus tard
});

document.getElementById("mode-challenge-btn").addEventListener("click", () => {
  welcomeScreen.style.display = "none";
  challengeModeDiv.style.display = "block";
  loadRandomImage("challenge"); // placeholder
});

// Boutons retour
document.getElementById("back-from-infinite").addEventListener("click", () => {
  infiniteModeDiv.style.display = "none";
  welcomeScreen.style.display = "block";
});

document.getElementById("back-from-challenge").addEventListener("click", () => {
  challengeModeDiv.style.display = "none";
  welcomeScreen.style.display = "block";
});

// Placeholder champions
let championsList = ["Aatrox","Ahri","Akali","Alistar","Amumu","Anivia","Annie","Ashe"];

// Suggestions live pour input
function setupLiveSuggestions(inputId, suggestionsId) {
  const champInput = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);
  champInput.addEventListener("input", () => {
    const query = champInput.value.toLowerCase();
    suggestions.innerHTML = "";
    if(query.length === 0) return;
    const matches = championsList.filter(c => c.toLowerCase().startsWith(query));
    matches.forEach(m => {
      const div = document.createElement("div");
      div.textContent = m;
      div.addEventListener("click", () => {
        champInput.value = m;
        suggestions.innerHTML = "";
      });
      suggestions.appendChild(div);
    });
  });
}

setupLiveSuggestions("champ-input","suggestions");
setupLiveSuggestions("champ-input-challenge","suggestions-challenge");

// Placeholder pour charger image
function loadRandomImage(mode) {
  if(mode === "infinite") {
    document.getElementById("champ-image").src = "assets/ImagesChampPixel/easy/Aatrox-default.png";
  } else {
    document.getElementById("champ-image-challenge").src = "assets/ImagesChampPixel/hard/Ahri-default.png";
  }
}
