const API_KEY = "oa_pk_yIwfyQtlWjdGvZcIgnXCUUBmOaOoitgwkOrNPYCXRKOnXvUcxxpawBlMCsJPYVpR";
const AGENDA_UID = "6875632";

let tousLesEvenements = []; // stocke tous les événements récupérés

async function chargerEvenements() {
  const container = document.getElementById("events-container");
  if (!container) return;

  container.textContent = "Chargement des événements...";

  try {
    const response = await fetch(
      `https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events?key=${API_KEY}&size=20`
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log("Données reçues de l'API OpenAgenda:", data);

    if (!data.events?.length) {
      container.textContent = "Aucun événement disponible.";
      return;
    }

    tousLesEvenements = data.events;

    initFiltres(tousLesEvenements);
    afficherEvenements(tousLesEvenements);

  } catch (error) {
    console.error(error);
    container.textContent = "Impossible de charger les événements.";
  }
}

/* affichage des cartes */
function afficherEvenements(events) {
  const container = document.getElementById("events-container");
  container.innerHTML = "";

  if (!events.length) {
    container.textContent = "Aucun événement ne correspond à ces filtres.";
    return;
  }

  events.forEach(event => {
    const titre = event.title?.fr || event.title?.en || "Événement";

    const description = (event.description?.fr || event.description?.en || "")
      .replace(/<[^>]*>/g, "");

    const descriptionLongue = (event.longDescription?.fr || event.longDescription?.en || description)
      .replace(/<[^>]*>/g, "");

    let image = "https://via.placeholder.com/600x400?text=Villa+Nova";

    if (event.image?.base && event.image?.filename) {
      const variant = event.image.variants?.find(v => v.type === "thumbnail")
        || event.image.variants?.[0];

      image = variant?.base && variant?.filename
        ? `${variant.base}${variant.filename}`
        : `${event.image.base}${event.image.filename}`;
    }

    const date = event.firstTiming?.begin
      ? new Date(event.firstTiming.begin).toLocaleDateString("fr-FR")
      : "Date à venir";

    const card = document.createElement("article");
    card.className = "event-card";

    const img = document.createElement("img");
    img.src = image;
    img.alt = titre;
    img.loading = "lazy";
    img.onerror = () => {
      img.onerror = null;
      img.src = "https://via.placeholder.com/600x400?text=Villa+Nova";
    };

    const content = document.createElement("div");
    content.className = "event-content";

    const h3 = document.createElement("h3");
    h3.textContent = titre;

    const pDate = document.createElement("p");
    pDate.innerHTML = `<strong>${date}</strong>`;

    const pDesc = document.createElement("p");
    pDesc.textContent = description.substring(0, 180) + "...";

    const btnDetails = document.createElement("button");
    btnDetails.className = "btn-details";
    btnDetails.textContent = "Détails";
    btnDetails.addEventListener("click", () => {
      ouvrirModale({ titre, date, image, description: descriptionLongue });
    });

    content.append(h3, pDate, pDesc, btnDetails);
    card.append(img, content);
    container.appendChild(card);
  });
}

/* filtres*/
function initFiltres(events) {
  const selectCategorie = document.getElementById("filtre-categorie");
  const selectLieu = document.getElementById("filtre-lieu");
  const inputDate = document.getElementById("filtre-date");
  const btnReset = document.getElementById("reset-filtres");

  if (!selectCategorie || !selectLieu || !inputDate) return;

  // --- Catégories uniques ---
  // Adapte "event.category" selon le vrai champ de ton agenda OpenAgenda
  // (vérifie dans console.log la structure exacte si besoin)
  const categories = new Set();
  events.forEach(e => {
    const cat = e.category?.fr || e.category?.name || e.tags?.[0];
    if (cat) categories.add(cat);
  });

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    selectCategorie.appendChild(opt);
  });

  // Lieux uniques (villes) 
  const lieux = new Set();
  events.forEach(e => {
    const ville = e.location?.city;
    if (ville) lieux.add(ville);
  });

  lieux.forEach(ville => {
    const opt = document.createElement("option");
    opt.value = ville;
    opt.textContent = ville;
    selectLieu.appendChild(opt);
  });

  // Écouteurs
  [selectCategorie, selectLieu, inputDate].forEach(el => {
    el.addEventListener("change", appliquerFiltres);
  });

  btnReset?.addEventListener("click", () => {
    selectCategorie.value = "";
    selectLieu.value = "";
    inputDate.value = "";
    afficherEvenements(tousLesEvenements);
  });
}

function appliquerFiltres() {
  console.log("Filtre déclenché !");
  const categorie = document.getElementById("filtre-categorie").value;
  const lieu = document.getElementById("filtre-lieu").value;
  const dateMin = document.getElementById("filtre-date").value;

  console.log("Lieu sélectionné :", JSON.stringify(lieu)); // debug

  const filtres = tousLesEvenements.filter(e => {
    const cat = e.category?.fr || e.category?.name || e.tags?.[0] || "";
    const ville = e.location?.city || "";
    const dateEvent = e.firstTiming?.begin ? new Date(e.firstTiming.begin) : null;

    const matchCategorie = !categorie || cat === categorie;
    const matchLieu = !lieu || ville === lieu;
    const matchDate = !dateMin || (dateEvent && dateEvent >= new Date(dateMin));

    console.log("Ville événement:", JSON.stringify(ville), "| match:", matchLieu); // debug

    return matchCategorie && matchLieu && matchDate;
  });

  console.log("Résultat filtré :", filtres.length, "/", tousLesEvenements.length); // debug

  afficherEvenements(filtres);
}

/* modale de détails */
function ouvrirModale({ titre, date, image, description }) {
  fermerModale();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "modal-titre");

  modal.innerHTML = `
    <button class="modal-close" aria-label="Fermer">&times;</button>
    <img src="${image}" alt="${titre}" class="modal-img">
    <h3 id="modal-titre">${titre}</h3>
    <p class="modal-date"><strong>${date}</strong></p>
    <p class="modal-description">${description}</p>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  overlay.querySelector(".modal-close").addEventListener("click", fermerModale);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fermerModale();
  });
  document.addEventListener("keydown", fermerModaleEchap);
}

function fermerModaleEchap(e) {
  if (e.key === "Escape") fermerModale();
}

function fermerModale() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.remove();
    document.body.style.overflow = "";
    document.removeEventListener("keydown", fermerModaleEchap);
  }
}
/* page à propos et descriptions complètes */
async function chargerEvenementsComplets() {
  const container = document.getElementById("apropos-events-container");
  if (!container) return;

  container.textContent = "Chargement des événements...";

  try {
    const response = await fetch(
      `https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events?key=${API_KEY}&size=20`
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    container.innerHTML = "";

    if (!data.events?.length) {
      container.textContent = "Aucun événement disponible.";
      return;
    }

    data.events.forEach(event => {
      const titre = event.title?.fr || event.title?.en || "Événement";

      const descriptionLongue = (event.longDescription?.fr || event.description?.fr || event.description?.en || "")
        .replace(/<[^>]*>/g, "");

      const ville = event.location?.city || "";
      const lieu = event.location?.name || "";

      let image = "https://via.placeholder.com/600x400?text=Villa+Nova";
      if (event.image?.base && event.image?.filename) {
        const variant = event.image.variants?.find(v => v.type === "thumbnail")
          || event.image.variants?.[0];
        image = variant?.base && variant?.filename
          ? `${variant.base}${variant.filename}`
          : `${event.image.base}${event.image.filename}`;
      }

      const date = event.firstTiming?.begin
        ? new Date(event.firstTiming.begin).toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          })
        : "Date à venir";

      const heure = event.firstTiming?.begin
        ? new Date(event.firstTiming.begin).toLocaleTimeString("fr-FR", {
            hour: "2-digit", minute: "2-digit"
          })
        : "";

      const article = document.createElement("article");
      article.className = "event-full";

      article.innerHTML = `
        <img src="${image}" alt="${titre}" loading="lazy">
        <div class="event-full-content">
          <h3>${titre}</h3>
          <p class="event-full-meta">
            <strong>${date}</strong>${heure ? " à " + heure : ""}
            ${lieu ? " — " + lieu : ""}${ville ? ", " + ville : ""}
          </p>
          <p class="event-full-description">${descriptionLongue}</p>
        </div>
      `;

      article.querySelector("img").onerror = function () {
        this.onerror = null;
        this.src = "https://via.placeholder.com/600x400?text=Villa+Nova";
      };

      container.appendChild(article);
    });

  } catch (error) {
    console.error(error);
    container.textContent = "Impossible de charger les événements.";
  }
}

document.addEventListener("DOMContentLoaded", chargerEvenementsComplets);

document.addEventListener("DOMContentLoaded", chargerEvenements);