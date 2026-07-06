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
     intro           phrase d'accroche en haut de la page détail — sert AUSSI de meta
                     description SEO + de description Open Graph/Twitter. Vise 110-160
                     caractères, riche en mots-clés (direction artistique, production
                     audiovisuelle, photographie, motion design, Lyon, Marseille…).
     context         paragraphes du texte de contexte (liste de chaînes) — traités comme
                     une étude de cas : contexte / défi → direction artistique / solution
                     → résultat. Ne jamais inventer de métrique chiffrée.
     galleryCount    nombre de photos dans assets/img/projets/SLUG/ (01.jpg…)
     video           projet VIDÉO (fichier local) : { src:"assets/video/SLUG.mp4", poster:"..." }
                     — mets  null  pour un projet sans vidéo locale
     youtube         projet VIDÉO (YouTube) : l'ID de la vidéo (la partie après v= dans l'URL,
                     ex. "iPqWPpsW8dg"). Affiche la même vignette « play » qui charge un
                     <iframe> YouTube au clic (rien n'est chargé tant qu'on ne clique pas).
                     Le poster par défaut = la miniature YouTube (maxresdefault). Prioritaire
                     sur `video` si les deux sont renseignés.
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
    intro: "La campagne d'affichage annuelle de Wellness Sport Club — direction artistique et réalisation, déployées en France et en Suisse.",
    context: [
      "Chaque année, Wellness Sport Club doit réaffirmer sa présence dans le paysage urbain de deux pays. Le défi : une campagne d'affichage qui garde le même impact sur un 4×3 en bord de route comme sur un écran mobile.",
      "J'ai pris en charge la direction artistique et la réalisation de bout en bout — conception créative, direction photo, puis déclinaison rigoureuse sur l'ensemble des supports urbains (abribus, 4×3, réseau JCDecaux) et leurs formats digitaux.",
      "Le résultat : une identité forte et cohérente, pensée pour l'extérieur comme pour les réseaux, diffusée en continu sur deux pays pendant douze mois."
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
    stats: [["244K", "VUES"], ["+7K", "ENGAGEMENTS"]],
    year: "2023",
    role: "Direction artistique · Réalisation",
    intro: "Un clip immersif tourné dans les rues de Lyon pour LUNE, le single d'Hakai — direction artistique et étalonnage cinématographique.",
    context: [
      "Pour accompagner la sortie de LUNE, Hakai voulait un clip qui vive au rythme de la ville. La direction : capter l'énergie d'un Lyon un soir de concert, entre lumières urbaines et intimité du morceau.",
      "Direction artistique, réalisation et étalonnage cinématographique : chaque plan a été pensé pour servir le tempo du titre, avec un traitement colorimétrique dense qui ancre l'image dans une esthétique nocturne et contrastée.",
      "Un clip musical immersif, taillé pour les plateformes de streaming et les réseaux, qui prolonge l'univers de l'artiste au-delà du son."
    ],
    galleryCount: 4,
    video: null,
    youtube: "46kiss-VKco"
  },
  {
    slug: "hakai-allumer",
    image: "https://img.youtube.com/vi/iPqWPpsW8dg/maxresdefault.jpg",
    watermark: "HAKAI ALLUMER",
    watermarkScript: "hakai",
    client: "HAKAI",
    title: "CLIP<br>D'HAKAI ALLUMER",
    stats: [["465K", "VUES"], ["12K", "LIKES"], ["800", "COMMENTAIRES"]],
    year: "2023",
    role: "Direction artistique · Réalisation",
    intro: "Un clip à couper le souffle pour ALLUMER, extrait de l'album AKUMA d'Hakai — une terre ocre et brûlée qui épouse le morceau, en direction artistique et réalisation.",
    context: [
      "Pour porter la sortie de son album AKUMA, Hakai voulait un clip singulier, à la hauteur du morceau ALLUMER. Le défi : un décor unique, à couper le souffle, capable de devenir un personnage à part entière.",
      "Direction artistique et réalisation dans un paysage de terre ocre et brûlée : chaque plan a été composé pour que la matière et la lumière du lieu servent l'intensité du titre.",
      "Un clip immersif au fort impact visuel, devenu un vrai succès sur les plateformes : 465K vues, 12K likes et 800 commentaires."
    ],
    galleryCount: 4,
    video: null,
    youtube: "iPqWPpsW8dg"
  },
  {
    slug: "smaa-alterations",
    image: "assets/img/card-1-wsc-affichage.jpg",
    watermark: "SMAA ALTERATIONS",
    watermarkScript: "smaa",
    client: "SMAA ALTERATIONS",
    title: "POCHETTE<br>D'ALBUM",
    stats: [["360°", "ACCOMPAGNEMENT"], ["EP", "6 TITRES INÉDITS"]],
    year: "2022",
    role: "Direction artistique · Photographie",
    intro: "Direction artistique et photographie pour la pochette et les visuels de l'EP « Alterations » de SMAA — six titres, deux visages d'un artiste.",
    context: [
      "SMAA arrive avec un EP intime : six morceaux inédits qui basculent de l'ombre à la lumière. Le brief — une direction artistique capable de porter cette dualité sans la trahir.",
      "Direction artistique et photographie pensées comme un fil narratif : une palette sombre et texturée sur les titres introspectifs, qui glisse vers des tons plus chauds et colorés à mesure que le projet s'éclaire.",
      "Résultat : une pochette d'album et une série de visuels promotionnels cohérents, déclinables sur toutes les plateformes de streaming et les réseaux, qui donnent un visage à l'univers de l'artiste."
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
    stats: [["+70k", "vues cumulées"], ["360°", "dispositif multicanal"]],
    year: "2023",
    role: "Direction artistique · Réalisation",
    intro: "La communication visuelle et digitale du 97 Café, pensée à 360° pour réussir le lancement d'un nouveau lieu.",
    context: [
      "Ouvrir un restaurant, c'est d'abord se faire une place dans le regard des gens. Le 97 Café avait besoin d'une communication complète pour exister en ligne dès son lancement.",
      "Accompagnement à 360° : direction artistique, shooting photo culinaire et lifestyle, réalisation d'une vidéo promotionnelle, puis déclinaison de l'ensemble sur les réseaux sociaux.",
      "Une image de marque appétissante et cohérente sur tous les canaux, qui a donné au lieu la visibilité d'un établissement déjà installé dès ses premières semaines."
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
    intro: "Le film d'annonce en motion design qui a dévoilé la nouvelle identité visuelle de Dimension Stores.",
    context: [
      "Changer d'identité visuelle, c'est un moment de vérité pour une marque retail. Dimension Stores voulait annoncer sa transformation avec un geste fort, pensé pour Instagram.",
      "Direction artistique et motion design : un film d'annonce animé qui met en scène le passage de l'ancienne à la nouvelle identité, rythmé pour capter l'attention dès la première seconde du feed.",
      "Une prise de parole soignée qui installe le nouveau territoire de marque et donne le ton de sa communication à venir."
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
    stats: [["CLIP", "musical"], ["MULTI-ARTS", "mise en scène"]],
    year: "2024",
    role: "Direction artistique · Réalisation",
    intro: "Un clip musical qui dévoile la sortie du nouveau projet de l'artiste Ludeo — direction artistique et réalisation.",
    context: [
      "Pour la sortie de son projet, Ludeo cherchait un clip capable de traduire son univers en images. Le défi : une réalisation qui mêle les disciplines sans jamais se disperser.",
      "Direction artistique et réalisation de bout en bout : une mise en scène qui croise plusieurs arts pour plonger le spectateur dans le monde de l'artiste, entièrement au service du morceau.",
      "Un clip immersif, calibré pour les plateformes et les réseaux, qui prolonge l'identité de Ludeo au-delà de la musique."
    ],
    galleryCount: 6,
    video: null,
    youtube: "2bMtH2pRMXk"
  },
  {
    slug: "maison-lyne-st-andre",
    image: "assets/img/card-3-techteam.jpg",
    watermark: "Maison Lyne St. André",
    watermarkScript: "Direction artistique",
    client: "MAISON LYNE ST. ANDRÉ · 3 FILMS",
    title: "SHOOTING<br>DE COLLECTION",
    stats: [["+50", "visuels livrés"], ["1", "film de marque"]],
    year: "2026",
    role: "Photographie et réalisation",
    intro: "Un shooting de collection et un film de marque pour la Maison Lyne St. André, au service de la créatrice et de son savoir-faire.",
    context: [
      "La Maison Lyne St. André voulait des images à la hauteur de son exigence : valoriser une collection et la main de la créatrice avec la précision qu'impose l'univers de la mode.",
      "Photographie et réalisation d'un film de marque : direction artistique, lumière travaillée et cadrage soigné pour révéler la matière, les détails et le geste couture.",
      "Une bibliothèque de plus de cinquante visuels et un film de marque, prêts pour le e-commerce, la presse et les réseaux — une identité visuelle fidèle au raffinement de la Maison."
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
    intro: "La direction photo d'une soirée événementielle au Docks40, à Lyon — reportage nocturne entre club, portraits et performances.",
    context: [
      "Capturer l'atmosphère d'un club en une nuit, sans jamais trahir son énergie : c'est tout l'enjeu d'un reportage événementiel au Docks40.",
      "Direction photo complète : ambiance de soirée, portraits, performances de cirque et captation du lieu, travaillées entièrement à la lumière disponible.",
      "Un reportage nocturne à la fois vivant et léché, décliné pour le print comme pour le digital, qui restitue l'ADN du lieu."
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
    intro: "Une vidéo RSE à diffusion nationale, portée par une direction artistique éditoriale et un motion design au service du propos.",
    context: [
      "Faire le bilan RSE d'une année et le rendre désirable en interne : Solerys voulait une vidéo capable de parler à tous ses collaborateurs, sans tomber dans le rapport institutionnel.",
      "Direction artistique et motion design : un film de quatre minutes au traitement éditorial et humain, qui met en récit les actions de l'entreprise en matière de responsabilité sociale.",
      "Une prise de parole claire et incarnée, diffusée à l'ensemble des collaborateurs à l'échelle nationale."
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
    intro: "Le spot national Wellness Sport Club — direction artistique et réalisation, diffusé en TV, au cinéma et en digital.",
    context: [
      "Porter une marque sportive à l'échelle nationale demande un film qui fonctionne partout : sur grand écran comme dans un feed. Wellness Sport Club voulait un spot au cœur de son dispositif de campagne.",
      "Direction artistique et réalisation de bout en bout : de la stratégie créative au tournage, jusqu'à la livraison multi-format.",
      "Un film de trente secondes décliné pour la TV, le cinéma et le digital, pensé comme la pièce maîtresse de la campagne nationale."
    ],
    galleryCount: 4,
    video: null,
    youtube: "8XN_C3yKQ9Y"
  }
];
