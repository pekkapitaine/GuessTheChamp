
let championsList = [];

export async function loadChampionsList() {
  const res = await fetch("champions_list.json");
  championsList = await res.json();
  return championsList;
}
export function setupLiveSuggestions(inputId, suggestionsId, onValidate) {
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
