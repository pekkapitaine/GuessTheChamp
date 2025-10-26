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
