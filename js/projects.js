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
     categories      expertise(s) de la section « Services » que ce projet illustre —
                     tableau d'un ou plusieurs libellés PARMI window.PROJECT_CATEGORIES
                     ("Direction artistique", "Production vidéo", "Photographie",
                     "Motion design"). Doit correspondre AU CARACTÈRE PRÈS au data-type
                     des blocs .svc (index.html) et aux <option> du select de contact.
                     C'est le lien technique service → bibliothèque de projets
                     (window.projectsByCategory) : taguer un projet suffit à l'associer.
     intro           phrase d'accroche en haut de la page détail — sert AUSSI de meta
                     description SEO + de description Open Graph/Twitter. Vise 110-160
                     caractères, riche en mots-clés (direction artistique, production
                     audiovisuelle, photographie, motion design, Lyon, Marseille…).
     context         paragraphes du texte de contexte (liste de chaînes) — traités comme
                     une étude de cas : contexte / défi → direction artistique / solution
                     → résultat. Ne jamais inventer de métrique chiffrée.
     galleryCount    nombre de photos dans assets/img/projets/SLUG/ (01.jpg…)
     galleryMotion   items de galerie ANIMÉS (boucle vidéo au lieu d'une photo fixe) —
                     tableau des numéros concernés, ex. [1,2,3]. Chaque numéro N attend
                     TROIS fichiers dans assets/img/projets/SLUG/ : 0N.mp4 + 0N.webm
                     (les deux sources) + 0N.jpg (l'affiche, = 1re image). Absent = tout
                     en photo fixe (.jpg), comportement historique.
                     ⚠️ NE JAMAIS mettre de .gif : un GIF pèse 5 à 20× un MP4 équivalent
                     pour une qualité inférieure. Conversion documentée dans
                     assets/img/projets/README.txt.
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
    slug: "hakai-allumer",
    categories: ["Direction artistique", "Production vidéo"],
    image: "assets/img/hakai-allumer.jpg",
    watermark: "HAKAI ALLUMER",
    watermarkScript: "hakai",
    client: "HAKAI",
    title: "CLIP<br>D'HAKAI ALLUMER",
    stats: [["465K", "VUES"], ["13K", "ENGAGEMENTS"]],
    year: "2023",
    role: "Direction artistique · Réalisation",
    focal: "53% 29%",
    intro: "Un clip à couper le souffle pour ALLUMER, extrait de l'album AKUMA d'Hakai — une terre ocre et brûlée qui épouse le morceau, en direction artistique et réalisation.",
    context: [
      "Pour porter la sortie de son album AKUMA, Hakai voulait un clip singulier, à la hauteur du morceau ALLUMER. Le défi : un décor unique, à couper le souffle, capable de devenir un personnage à part entière.",
      "Direction artistique et réalisation dans un paysage de terre ocre et brûlée : chaque plan a été composé pour que la matière et la lumière du lieu servent l'intensité du titre.",
      "Un clip immersif au fort impact visuel, devenu un vrai succès sur les plateformes : 465K vues, 13K engagements."
    ],
    galleryCount: 8,
    video: null,
    youtube: "iPqWPpsW8dg"
  },
  {
    slug: "mathieu-tsunami",
    categories: ["Production vidéo", "Photographie"],
    image: "assets/img/mathieu-tsunami.jpg",
    watermark: "TSUNAMI",
    watermarkScript: "Freestyle",
    client: "MATHIEU TSUNAMI · FREESTYLE",
    title: "CAPTATION<br>FREESTYLE",
    stats: [],
    year: "2026",
    role: "Réalisation · Photographie sportive",
    intro: "Une captation sportive et une série photo pour les réseaux sociaux du footballer freestyle Mathieu Tsunami, à l'occasion de la Coupe du Monde 2026.",
    context: [
      "À l'occasion de la Coupe du Monde 2026, Mathieu Tsunami voulait des images fidèles à sa pratique du freestyle, pensées spécifiquement pour ses réseaux sociaux — un contenu capable de capter l'attention pendant la ferveur de la compétition.",
      "Réalisation et photographie construites en deux temps : le travail technique sur tapis de course en salle, puis une série en extérieur, sur les toits de la ville, pour donner du relief à chaque figure.",
      "Une série de clichés et de plans diffusés sur les réseaux sociaux de l'athlète pendant la Coupe du Monde 2026, documentant son geste freestyle avec précision."
    ],
    galleryCount: 6,
    video: { src: "assets/video/mathieu-tsunami.mp4", poster: "assets/img/mathieu-tsunami.jpg" }
  },
  {
    slug: "wsc-affichage",
    categories: ["Direction artistique", "Photographie"],
    image: "assets/img/wsc-affichage.jpg",
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
      "En collaboration avec l'agence Chouchou, j'ai pu prendre part à la direction artistique et j'ai pu réaliser ces clichés en studio, puis un travail de post-production rigoureux sur l'ensemble des supports urbains (abribus, 4×3, réseau JCDecaux) et leurs formats digitaux.",
      "Le résultat : une identité forte et cohérente, pensée pour l'extérieur comme pour les réseaux, diffusée en continu sur deux pays pendant douze mois."
    ],
    galleryCount: 5,
    video: null
  },
  {
    slug: "maison-lyne-st-andre",
    categories: ["Photographie", "Production vidéo"],
    image: "assets/img/maison-lyne-st-andre.jpg",
    watermark: "Maison Lyne St. André",
    watermarkScript: "Direction artistique",
    client: "MAISON LYNE ST. ANDRÉ · 3 FILMS",
    title: "SHOOTING<br>DE COLLECTION",
    stats: [["+50", "visuels livrés"], ["1", "film de marque"]],
    year: "2026",
    role: "Photographie et réalisation",
    focal: "49% 32%",
    intro: "Un shooting de collection et un film de marque pour la Maison Lyne St. André, au service de la créatrice et de son savoir-faire.",
    context: [
      "La Maison Lyne St. André voulait des images à la hauteur de son exigence : valoriser une collection et la main de la créatrice avec la précision qu'impose l'univers de la mode.",
      "Photographie et réalisation d'un film de marque : direction artistique, lumière travaillée et cadrage soigné pour révéler la matière, les détails et le geste couture.",
      "Une bibliothèque de plus de cinquante visuels et un film de marque, prêts pour le e-commerce, la presse et les réseaux — une identité visuelle fidèle au raffinement de la Maison."
    ],
    galleryCount: 19,
    video: null,
    youtube: "OfZet5qsKLE"
  },
  {
    slug: "docks40",
    categories: ["Photographie"],
    image: "assets/img/docks40.jpg",
    watermark: "DOCKS40",
    watermarkScript: "Lyon",
    client: "LE DOCKS40 · LYON",
    title: "DIRECTION<br>PHOTO",
    stats: [],
    year: "2025",
    role: "Direction photo",
    focal: "51% 61%",
    intro: "La direction photo d'une soirée événementielle au Docks40, à Lyon — reportage nocturne entre club, portraits et performances.",
    context: [
      "Capturer l'atmosphère d'un club en une nuit, sans jamais trahir son énergie : c'est tout l'enjeu d'un reportage événementiel au Docks40.",
      "Direction photo complète : ambiance de soirée, portraits, performances de cirque et captation du lieu, travaillées entièrement à la lumière disponible.",
      "Un reportage nocturne à la fois vivant et léché, décliné pour le print comme pour le digital, qui restitue l'ADN du lieu."
    ],
    galleryCount: 16,
    video: null
  },
  {
    slug: "wsc-boutique",
    categories: ["Photographie"],
    image: "assets/img/wsc-boutique.jpg",
    watermark: "WELLNESS",
    watermarkScript: "Boutique",
    client: "WELLNESS SPORT CLUB",
    title: "PHOTO PRODUIT<br>& LIFESTYLE",
    stats: [],
    year: "2024",
    role: "Photographie produit · Lifestyle",
    intro: "Photographie produit et lifestyle pour la boutique en ligne Wellness Sport Club — packs training et looks du quotidien, en studio et en extérieur.",
    context: [
      "Une boutique en ligne se joue sur la qualité de ses visuels : Wellness Sport Club avait besoin d'un catalogue photo cohérent pour présenter ses packs et articles à la vente.",
      "Photographie produit en studio pour les packs training, complétée par une série lifestyle en extérieur mettant en scène les pièces portées, dans une lumière naturelle et urbaine.",
      "Un ensemble de visuels prêts pour la fiche produit comme pour les réseaux, qui donne à la boutique en ligne une image soignée et engageante."
    ],
    galleryCount: 11,
    video: { src: "assets/video/wsc-boutique.mp4", poster: "assets/img/wsc-boutique.jpg" }
  },
  {
    slug: "97-cafe",
    categories: ["Direction artistique", "Production vidéo", "Photographie"],
    image: "assets/img/97-cafe.jpg",
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
    galleryCount: 6,
    video: { src: "assets/video/97-cafe.mp4", poster: "assets/img/97-cafe.jpg" }
  },
  {
    slug: "smaa-alterations",
    categories: ["Direction artistique", "Photographie", "Motion design"],
    image: "assets/img/card-10-smaa-alterations.jpg",
    watermark: "SMAA ALTERATIONS",
    watermarkScript: "smaa",
    client: "SMAA ALTERATIONS",
    title: "POCHETTE<br>D'ALBUM",
    stats: [["360°", "ACCOMPAGNEMENT"], ["EP", "6 TITRES INÉDITS"]],
    year: "2022",
    role: "Direction artistique · Photographie · Motion design",
    intro: "Direction artistique, photographie et motion design pour la pochette et les visuels de l'EP « Alterations » de SMAA — six titres, deux visages d'un artiste.",
    context: [
      "SMAA arrive avec un EP intime : six morceaux inédits qui basculent de l'ombre à la lumière. Le brief — une direction artistique capable de porter cette dualité sans la trahir.",
      "Direction artistique, photographie et motion design pensés comme un fil narratif : une palette sombre et texturée sur les titres introspectifs, qui glisse vers des tons plus chauds et colorés à mesure que le projet s'éclaire.",
      "Résultat : une pochette d'album et une série de visuels promotionnels cohérents, déclinables sur toutes les plateformes de streaming et les réseaux, qui donnent un visage à l'univers de l'artiste."
    ],
    galleryCount: 1,
    video: { src: "assets/video/smaa-alterations.mp4", poster: "assets/img/card-10-smaa-alterations.jpg" }
  },
  {
    slug: "hakai-lune",
    categories: ["Direction artistique", "Production vidéo"],
    image: "assets/img/hakai-lune.jpg",
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
    slug: "solerys",
    categories: ["Direction artistique", "Motion design"],
    image: "assets/img/hero_solerysjpg0.jpg",
    watermark: "Solerys RSE",
    watermarkScript: "Solerys",
    client: "Solerys",
    title: "BILAN<br>RSE 2026",
    stats: [["FR", "diffusion à l'ensemble du groupe"], ["+400", "salariés sensibilisés"]],
    year: "2026",
    role: "Direction artistique · Motion design",
    intro: "Un bilan RSE pour le groupe Solerys, pensé pour retracer l'engagement des salariés autour des enjeux environnementaux et sociaux.",
    context: [
      "Solerys souhaitait un bilan RSE qui ne se limite pas à un document statique, mais qui engage et sensibilise ses salariés à travers une narration visuelle dynamique.",
      "Il fallait créer une vidéo retraçant les nombreuses actions de l'entreprise. Une approche mélant motion design et humain qui synthétise les actions et les résultats du groupe, tout en restant fidèle à l'identité visuelle de Solerys.",
      "Un bilan RSE animé, diffusé à l'ensemble du groupe, qui sensibilise plus de 400 salariés aux enjeux environnementaux et sociaux, tout en renforçant la culture d'entreprise."
    ],
    galleryCount: 5,
    galleryMotion: [1, 2, 3, 4, 5],
    video: null,
    youtube: "2Qbz0dZI4n0"
  },
  {
    slug: "loan-cc",
    categories: ["Direction artistique", "Photographie"],
    image: "assets/img/card-9-loan-cc.jpg",
    watermark: "LOAN",
    watermarkScript: "Conatus",
    client: "LOAN",
    title: "PORTRAIT<br>& POCHETTE",
    stats: [],
    year: "2022",
    role: "Direction artistique · Photographie",
    intro: "La pochette de l'album « Conatus » de Loan, coproduite avec le beatmaker Isox — une image qui renvoie à chaque titre à travers un décor construit sur mesure.",
    context: [
      "Habiller un album d'une image forte commence par un concept capable de tenir toutes ses pistes ensemble. Loan et le beatmaker Isox voulaient une pochette à la hauteur de « Conatus », coproduit à deux voix.",
      "Direction artistique et photographie autour d'un décor construit sur mesure, pensé pour qu'un détail renvoie à chaque titre de l'album — une lecture différente à chaque écoute.",
      "Une pochette dense et cohérente, où chaque titre trouve sa trace visuelle, prête à accompagner la sortie de l'album sur les plateformes et les réseaux."
    ],
    galleryCount: 7,
    video: null
  },
  {
    slug: "ludeo",
    categories: ["Direction artistique", "Production vidéo"],
    image: "assets/img/ludeo.jpg",
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
    galleryCount: 4,
    video: null,
    youtube: "2bMtH2pRMXk"
  },
  {
    slug: "wsc-spot",
    categories: ["Direction artistique", "Production vidéo"],
    image: "assets/img/wsc-spot.jpg",
    watermark: "WELLNESS",
    watermarkScript: "Sport Club",
    client: "WELLNESS SPORT CLUB",
    title: "SPOT TV<br>/ CINÉMA",
    stats: [["TV", "cinéma · digital"], ["30\"", "spot national"]],
    year: "2026",
    role: "Direction artistique · Réalisation",
    intro: "Le spot national Wellness Sport Club, réalisé en collaboration avec l'agence Innolive — diffusé en TV, au cinéma et en digital.",
    context: [
      "Porter une marque sportive à l'échelle nationale demande un film qui fonctionne partout : sur grand écran comme dans un feed. Wellness Sport Club voulait un spot au cœur de son dispositif de campagne.",
      "Direction artistique et réalisation de bout en bout, en collaboration avec l'agence Innolive : de la stratégie créative au tournage, jusqu'à la livraison multi-format.",
      "Un film de trente secondes décliné pour la TV, le cinéma et le digital, pensé comme la pièce maîtresse de la campagne nationale."
    ],
    galleryCount: 7,
    video: null,
    youtube: "8XN_C3yKQ9Y"
  }
];

/* ============================================================
   CATÉGORIES DE SERVICE ⇄ PROJETS
   ============================================================
   Les 4 expertises de la section « Services » (index.html) sont reliées à leurs
   projets par le champ `categories` de chaque projet ci-dessus. C'est LA source
   unique du lien : taguer un projet suffit à l'associer à la bonne expertise,
   sans toucher au HTML ni au JS de rendu. Les libellés sont identiques au
   caractère près sur les trois surfaces (bloc .svc[data-type], <option> du
   select de contact, ce champ) pour que la correspondance soit exacte.

   NB Motion design : à ce jour seul `wsc-spot` (spot national TV/cinéma, qui
   implique un habillage/titrage broadcast) y est rattaché — valeur par défaut
   à confirmer/ajuster par Bastien selon ses projets réels. */
window.PROJECT_CATEGORIES = ['Direction artistique', 'Production vidéo', 'Photographie', 'Motion design'];

/* Renvoie la liste des projets rattachés à une catégorie (dans l'ordre de la
   bibliothèque). Tolérant : un projet sans `categories` n'est jamais retenu. */
window.projectsByCategory = function (category) {
  return (window.PROJECTS || []).filter(function (p) {
    return (p.categories || []).indexOf(category) !== -1;
  });
};
