/* ============================================================
   PROJETS — LA SEULE LISTE À ÉDITER POUR GÉRER LES PROJETS
   ============================================================

   Chaque projet alimente À LA FOIS sa carte sur l'accueil ET sa
   page détail (projet.html?p=SLUG).

   ➕ AJOUTER un projet :
      1. Dépose l'image principale dans  assets/img/  (ex: assets/img/mon-projet.jpg)
      2. Dépose les photos de galerie dans  assets/img/projets/MON-SLUG/  numérotées 01.jpg, 02.jpg, …
      3. Copie un bloc { ... } ci-dessous et change les valeurs
   ➖ SUPPRIMER : efface le bloc { ... }.
   🔀 RÉORDONNER : l'ordre d'affichage = l'ordre dans la liste.

   Automatique : numérotation (01/0X), vignette « projet suivant », lien de
   chaque carte vers sa page, page « projet suivant » en bas de chaque projet.

   Champs :
     slug            identifiant unique (URL + nom du dossier galerie). pas d'espaces/accents.
     image           visuel principal (carte + hero de la page détail)
     watermark       grand mot filigrane sur la carte
     watermarkScript petit sous-titre manuscrit
     client          nom du client
     title           titre — <br> pour un retour à la ligne
     stats           bloc rouge de la carte : paires ["CHIFFRE","légende"] — [] pour aucun
     year            année (affichée sur la page détail)
     role            prestation (ex. "Direction artistique · Photographie")
     intro           phrase d'accroche en haut de la page détail
     context         paragraphes du texte de contexte (liste de chaînes)
     galleryCount    nombre de photos dans assets/img/projets/SLUG/ (01.jpg…)
     video           projet VIDÉO uniquement : { src:"assets/video/SLUG.mp4", poster:"..." }
                     — mets  null  pour un projet sans vidéo
     url             (optionnel) lien externe qui REMPLACE la page détail (Vimeo, Behance…)
     focal           (optionnel) point focal de la photo sur la carte carrousel (accueil
                      uniquement), en `object-position` CSS — ex. "50% 20%" pour protéger un
                      visage proche du haut. Par défaut "center" (comportement identique à
                      avant). Le cadre carte n'a pas le même ratio que la photo source, donc
                      `object-fit:cover` recadre toujours un peu — ce champ choisit QUELLE
                      partie garder, à régler à l'œil au cas par cas.
   ============================================================ */

window.PROJECTS = [
  {
    slug: "wsc-affichage",
    image: "assets/img/card-1-wsc-affichage.jpg",
    watermark: "WELLNESS",
    watermarkScript: "Sport Club",
    client: "WELLNESS SPORT CLUB",
    title: "CAMPAGNE<br>D'AFFICHAGE",
    stats: [["2 PAYS", "campagne nationale"], ["12 MOIS", "diffusion continue"]],
    year: "2025",
    role: "Direction artistique · Photographie",
    intro: "La campagne d'affichage annuelle de Wellness Sport Club, déployée en France et en Suisse.",
    context: [
      "Direction de la campagne d'affichage nationale : conception créative, direction photo et déclinaison sur l'ensemble des supports urbains (abribus, 4×3, réseaux JCDecaux).",
      "Une identité forte et cohérente, pensée pour l'impact en extérieur comme en digital, diffusée en continu sur deux pays pendant douze mois."
    ],
    galleryCount: 4,
    video: null
  },
  {
    slug: "dimension",
    image: "assets/img/card-2-dimension.jpg",
    watermark: "DIMENSION",
    watermarkScript: "Stores",
    client: "DIMENSION STORES",
    title: "IDENTITÉ<br>RETAIL",
    stats: [["8", "points de vente"], ["DA", "+ identité visuelle"]],
    year: "2025",
    role: "Direction artistique · Identité visuelle",
    intro: "Une identité retail cohérente déployée sur l'ensemble des points de vente.",
    context: [
      "Création de l'identité visuelle et direction artistique retail : du concept au déploiement sur huit points de vente.",
      "Photographie produit et lifestyle, habillage des espaces et cohérence de marque sur tous les points de contact clients."
    ],
    galleryCount: 6,
    video: null
  },
  {
    slug: "techteam",
    image: "assets/img/card-3-techteam.jpg",
    watermark: "TECHTEAM",
    watermarkScript: "Films",
    client: "TECHTEAM · 3 FILMS",
    title: "FILM<br>CORPORATE",
    stats: [["3", "films produits"], ["CORP", "com. interne"]],
    year: "2026",
    role: "Réalisation · Production audiovisuelle",
    intro: "Trois films corporate pour la communication interne de Techteam.",
    context: [
      "Production de trois films corporate : écriture, tournage et post-production, au service de la communication interne de l'entreprise.",
      "Un traitement sobre et premium, pensé pour valoriser les équipes et les savoir-faire de Techteam."
    ],
    galleryCount: 6,
    video: { src: "assets/video/techteam.mp4", poster: "assets/img/card-3-techteam.jpg" }
  },
  {
    slug: "docks40",
    image: "assets/img/card-4-docks40.jpg",
    watermark: "DOCKS40",
    watermarkScript: "Lyon",
    client: "LE DOCKS40 · LYON",
    title: "DIRECTION<br>PHOTO",
    stats: [],
    year: "2025",
    role: "Direction photo",
    focal: "50% 56%",
    intro: "Direction photo d'une soirée événementielle au Docks40, à Lyon.",
    context: [
      "Direction photo complète d'un événement au Docks40 : ambiance de club, portraits, performances de cirque et captation de l'atmosphère du lieu.",
      "Un reportage nocturne travaillé à la lumière disponible, entre énergie de la soirée et images léchées prêtes pour le print et le digital."
    ],
    galleryCount: 8,
    video: null
  },
  {
    slug: "solerys",
    image: "assets/img/card-5-solerys.jpg",
    watermark: "SOLERYS",
    watermarkScript: "Nationale",
    client: "SOLERYS · NATIONALE",
    title: "CAMPAGNE<br>SOCIALE",
    stats: [["FR", "diffusion nationale"], ["SOCIAL", "campagne RSE"]],
    year: "2026",
    role: "Direction artistique · Campagne",
    focal: "50% 20%",
    intro: "Une campagne sociale à diffusion nationale, portée par une direction artistique éditoriale.",
    context: [
      "Direction artistique d'une campagne RSE à vocation sociale, diffusée à l'échelle nationale.",
      "Un traitement éditorial et humain, décliné sur les supports print et digital pour porter le message au plus grand nombre."
    ],
    galleryCount: 8,
    video: null
  },
  {
    slug: "wsc-spot",
    image: "assets/img/card-6-wsc-spot.jpg",
    watermark: "WELLNESS",
    watermarkScript: "Sport Club",
    client: "WELLNESS SPORT CLUB",
    title: "SPOT TV<br>/ CINÉMA",
    stats: [["TV", "cinéma · digital"], ["30\"", "spot national"]],
    year: "2026",
    role: "Direction artistique · Réalisation",
    intro: "Le spot national Wellness Sport Club, diffusé en TV, au cinéma et en digital.",
    context: [
      "Direction artistique et réalisation du spot national : de la stratégie créative au tournage et à la livraison multi-format.",
      "Un film de 30 secondes décliné pour la TV, le cinéma et le digital, au cœur du dispositif de campagne nationale."
    ],
    galleryCount: 4,
    video: { src: "assets/video/wsc-spot.mp4", poster: "assets/img/card-6-wsc-spot.jpg" }
  }
];
