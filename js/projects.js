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
    stats: [["2", "PAYS"], ["12", "MOIS DE DIFFUSION"]],
    year: "2023",
    role: "Direction artistique · Réalisation",
    intro: "La campagne d'affichage annuelle de Wellness Sport Club, déployée en France et en Suisse.",
    context: [
      "Direction de la campagne d'affichage nationale : conception créative, direction photo et déclinaison sur l'ensemble des supports urbains (abribus, 4×3, réseaux JCDecaux).",
      "Une identité forte et cohérente, pensée pour l'impact en extérieur comme en digital, diffusée en continu sur deux pays pendant douze mois."
    ],
    galleryCount: 4,
    video: null
  },
    {
    slug: "hakai-lune",
    image: "assets/img/card-1-wsc-affichage.jpg",
    watermark: "HAKAI LUNE",
    watermarkScript: "hakai",
    client: "HAKAI",
    title: "CLIP<br>D'HAKAI LUNE",
    stats: [["244K", "VUES"], ["+7K", "ENGAGMENTS"]],
    year: "2023",
    role: "Direction artistique · Réalisation",
    intro: "Un clip musical immersif dans les rues de Lyon, pour le morceau LUNE de l'artiste Hakai.",
    context: [
      "Un univers urbain se passant dans les rues de Lyon. Le clip viens servir de manière dynamique le morceau LUNE  de l'artiste Hakai.",
      "Une direction artistique et un étallonage cinématographique pour un clip musical immersif au coeur de lyon un jour de concert."
    ],
    galleryCount: 4,
    video: null
  },
   {
    slug: "smaa-alterations",
    image: "assets/img/card-1-wsc-affichage.jpg",
    watermark: "SMAA ALTERATIONS",
    watermarkScript: "smaa",
    client: "SMAA ALTERATIONS",
    title: "POCHETTE<br>D'ALBUM",
    stats: [["244K", "VUES"], ["+7K", "ENGAGMENTS"]],
    year: "2022",
    role: "Direction artistique · Photographie",
    intro: "Une pochette d'album qui intereple",
    context: [
      "Direction Artistique visuelle que nous avons pu mettre en place autour de L'EP de SMAA",
      "Ce projet comportant 6 titres inédits, nous permet de découvrir deux facettes de l'artiste. Il nous plonge au coeur des émotions de celui-ci. Certains morceaux sont sombres, mais le projet se finit par des titres plus joyeux et colorés.",
      "Un travail de direction artistique et de photographie pour la pochette d'album et les visuels promotionnels de l'EP d'Alterations."
    ],
    galleryCount: 4,
    video: null
  },

    {
    slug: "97-cafe",
    image: "assets/img/card-1-wsc-affichage.jpg",
    watermark: "97 CAFÉ",
    watermarkScript: "97cafe",
    client: "97 CAFÉ",
    title: "COMMUNICATION<br>360",
    stats: [["+70k", "Vues cumulées"], ["360°", "des assets multicanaux"]],
    year: "2023",
    role: "Direction artistique · realisation",
    intro: "Accompagner un restaurant dans sa communication visuelle et digitale, pour un lancement réussi.",
    context: [
      "Accompagnement de 97 Café dans sa communication visuelle et digitale : shooting photo, réalisation d'une vidéo promotionnelle et déclinaison sur les réseaux sociaux.",
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
    stats: [["+157k", "vues"], ["+10%", "d'engagements"]],
    year: "2025",
    role: "Direction artistique · Motion design",
    intro: "Création de la vidéo annonçant le changement de l'identité visuelle de Dimension Stores.",
    context: [
      "Accompagnement de Dimension Stores dans le changement de son identité visuelle : création d'une vidéo d'annonce sur instagram en motion design."
    ],
    galleryCount: 6,
    video: null
  },
  {
    slug: "ludeo",
    image: "assets/img/card-2-dimension.jpg",
    watermark: "LUDEO",
    watermarkScript: "LUDEO",
    client: "LUDEO",
    title: "DIRECTION ARTISTIQUE<br>réalisation",
    stats: [["+157k", "vues"], ["+10%", "d'engagements"]],
    year: "2024",
    role: "Direction artistique · Réalisation",
    intro: "Un clip muscial dévoilant la sortie du projet de l'artiste Ludeo",
    context: [
      "Nous avons accompagné l'artiste Ludeo dans la réalisation de son clip musical dévoilant la sortie de son projet.",
      "Un travail de direction artistique et de réalisation pour un clip musical plongeant le spectateur dans l'univers de l'artiste. Une réalisation qui mêle différents arts."
    ],
    galleryCount: 6,
    video: null
  },
  {
    slug: "masion-lyne-standre",
    image: "assets/img/card-3-techteam.jpg",
    watermark: "Maison Lyne St. André",
    watermarkScript: "Direction artistique",
    client: "MAISON LYNE ST. ANDRÉ · 3 FILMS",
    title: "SHOOTING<br>DE COLLECTION",
    stats: [["+50", "ressources photos"], ["1", "VIDÉO DE MARQUE"]],
    year: "2026",
    role: "Photographie et réalisation",
    intro: "Un shooting photos et une vidéo de marque pour la Maison Lyne St. André, valorisant la créatrice et son savoir faire.",
    context: [
      "Shooting photos et réalisation d'une vidéo de marque pour la Maison Lyne St. André, valorisant la créatrice et son savoir faire. Un travail précis et exigeant dans l'univers de la mode.",
      
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
    title: "VIDÉO<br>RSE",
    stats: [["FR", "diffusion nationale"], ["RSE", "vidéo sociale"]],
    year: "2026",
    role: "Motion design · Direction artistique",
    focal: "50% 20%",
    intro: "Une campagne sociale à diffusion nationale, portée par une direction artistique éditoriale.",
    context: [
      "Direction artistique et animation d'une vidéo RSE à vocation sociale, diffusée à tout les collaborateurs de l'entreprise.",
      "Un traitement éditorial et humain, dans une vidéo de 4minutes, pour faire le bilan rse de l'année écoulée et présenter les actions de l'entreprise en matière de responsabilité sociale."
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
