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