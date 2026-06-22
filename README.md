# villanova
# creation de la page d'accueil principale
# creation de la page des evenements
# Maquette de base : création de la structure HTML des 3 pages (header avec navbar + logo, footer commun, balises sémantiques main, section).
# Identité visuelle : intégration du logo Villa Nova, choix d'une palette bleu/violet, ajout d'un hero en     page d'accueil.
# Connexion à l'API OpenAgenda : récupération des événements via fetch() avec une clé API et un UID d'agenda, stockage dans tousLesEvenements.
# Affichage dynamique : génération des cartes événements (image, titre, date, description tronquée) directement en JS, avec gestion d'image de secours (onerror).
# Système de filtres (page Événements) : extraction dynamique des catégories et lieux disponibles dans les données, filtrage par catégorie / ville / date, bouton de réinitialisation.
# Modale de détails : ouverture au clic sur "Détails", affichage de la description longue, fermeture via bouton, clic extérieur ou touche Échap.
# Page À propos : réutilisation de l'API pour afficher la version complète et détaillée de chaque événement (sans troncature).
# Mode sombre : application d'un thème sombre spécifique aux pages Événements et À propos via la classe .page-sombre.
# Accessibilité : ajout d'un lien d'évitement (skip-link), attributs aria-label, aria-current, role="dialog" sur la modale.
# Responsive : media queries pour adapter la navbar, les cartes événements et le hero sur mobile.
# les problèmes rencontrés sont nombreux mais le plus dur c'était la connexion de l'API