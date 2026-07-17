# Bastien Agus — Portfolio

Site portfolio one-page + pages projet pour **Bastien Agus**, Directeur Artistique & Producteur Audiovisuel (Lyon · Marseille). Recréé à partir d'un handoff **Claude Design** (`project/Bastien Agus Site.dc.html`, prototype `.dc.html` non utilisé en prod — voir `README.md`).

**État (2026-07-17) : refonte showcase mobile + passe audit validées par l'utilisateur sur téléphone réel (via tunnel localtunnel), RIEN N'EST ENCORE COMMIT.** `git status` montre 6 fichiers modifiés (`.vercelignore`, `css/styles.css`, `index.html`, `js/main.js`, `js/motion.js`, ce fichier) par rapport au dernier commit (`2b03ca1`, l'audit `audit_portfolio_ux_design.md`). Deux chantiers faits dans la foulée, **les deux confirmés fonctionnels sur mobile réel par l'utilisateur** (« j'ai testé sur téléphone et ça me va ») après une première mesure DOM/Playwright :
1. **Passe audit** : correctifs T1/T3-T6/T12/T13/T15/T16 de `audit_portfolio_ux_design.md` appliqués (recouvrement showcase, CLS police, lazy-load fonds, a11y, tokens motion, contrastes, cache-busters…) + 3 ajouts « signature » validés par l'utilisateur (rideau d'entrée, curseur-badge, View Transitions). **T2 (recompression vidéo hero 54 Mo) et T11 (re-init au breakpoint) restent non faits** — voir TODO. Deux bugs trouvés *dans* les propositions de l'audit et corrigés en les implémentant : le clip-reveal image ne pouvait pas fonctionner tel quel (IntersectionObserver rapporte ratio 0 sur un élément déjà découpé à 0), et la formule de recouvrement `42%` ne tenait qu'à 1280px (référentiels vw/% incompatibles avec ceux des vignettes) — voir détails dans « Détails de comportement ».
2. **Refonte showcase mobile** (panneaux plein écran) : demandée après retour direct de l'utilisateur sur capture d'écran (section à 52% de l'écran, bande de vignettes plus haute que son contenu, CTA à viser séparément). Voir bloc « Showcase projets » ci-dessous.

**Reste à faire avant de considérer cette branche terminée : commit + merge** (aucun des deux n'a été demandé/fait à ce stade — ne pas commit sans que l'utilisateur le demande explicitement, cf. règles générales). « TODO / dette connue » liste ce qui reste bloqué (ffmpeg) vs mineur — ne pas re-auditer ce qui est déjà marqué résolu sans raison.

**Passe contenu / SEO (2026-07-06)** : réécriture rédactionnelle des 10 projets (`intro` + `context` en études de cas premium, français corrigé), stats placeholder dupliquées remplacées par les vrais chiffres fournis par le client (Ludeo reste sans chiffres, volontairement), nouveaux CTA + bloc de conversion sur les pages projet, structure `<h2>` sémantique, `alt` galerie enrichi, `sitemap.xml` resynchronisé. **Slug renommé : `masion-lyne-standre` → `maison-lyne-st-andre`** (faute d'orthographe ; pré-lancement, aucune URL diffusée). Le H1 hero d'accueil est sanctuarisé (non modifié). **Localisation mise à jour : « Lyon · Marseille » (avant « Lyon · Genève ») partout dans les fichiers de prod** (les prototypes `.dc.html` non-prod ne sont pas touchés). **Ajout du projet `hakai-allumer`** (clip AKUMA, embed YouTube) et **passage des projets vidéo à des embeds YouTube** (`hakai-lune`, `hakai-allumer`, `ludeo`, `wsc-spot`) via le champ `youtube`.

## Stack & principes

- **Site statique pur : HTML + CSS + JS vanilla. AUCUN framework, AUCUN build, AUCUNE dépendance npm.** (Le `package-lock.json` orphelin que ce fichier signalait n'existe plus — inutile de le chercher.)
- Le formulaire de contact fait un `fetch()` direct vers **Formspree** (service externe, pas une dépendance npm/build) — voir section dédiée plus bas.
- Scroll **natif** (une intégration Lenis a été testée puis **retirée** : son inertie rendait la page poisseuse par-dessus le carrousel scroll-lock). Ne pas réintroduire de smooth-scroll JS sans raison.
- Pas de GSAP non plus (testé pour les reveals, positions peu fiables à cause du carrousel `sticky` à hauteur dynamique). Les animations sont en **CSS + IntersectionObserver**.
- Langue du contenu : **français**. Coins nets (pas de border-radius), esthétique dark éditorial.
- Polices (Google Fonts) : **Bebas Neue** (titres), **Inter** (corps), **JetBrains Mono** (labels/mono), **Ms Madi** (manuscrit rouge).

## Lancer en local

Site statique → n'importe quel serveur HTTP. Depuis `F:\BASTIEN\PORTFOLIO` (⚠️ **`D:\BASTIEN\PORTFOLIO` n'existe plus** — migration de disque, voir mémoire `portfolio-drive-migration-worktrees` ; ne pas chercher le projet sur D:) :
```
python -m http.server 4610
```
Puis http://localhost:4610 . Ne PAS ouvrir en `file://` (le showcase/JS ont besoin d'HTTP).

`.claude/launch.json` définit **trois** configs preview, une par usage (évite de se marcher dessus entre le dev courant et un audit/preview en parallèle) :
| Config | Port |
|---|---|
| `portfolio` | 4610 |
| `portfolio-audit` | 4611 |
| `portfolio-preview` | 4612 |

⚠️ **Le port 4610 peut être occupé par un `python.exe` qui n'est PAS un serveur preview** (observé cette session : un vieux process traînait dessus). Dans ce cas ne pas le tuer à l'aveugle — utiliser un autre port de la table ci-dessus (`portfolio-audit`/4611 a servi de repli cette session) plutôt que de forcer le 4610.

⚠️ En test : `html { scroll-behavior: smooth }` fait que `window.scrollTo` programmatique **s'anime** — utiliser `behavior:'instant'` pour mesurer des positions de scroll fiablement, et privilégier `'auto'`/`'instant'` (pas `'smooth'`) si le test tourne dans un onglet sans focus/non visible (`document.hasFocus()===false`) : les navigateurs mettent en pause le `requestAnimationFrame` qui anime le smooth scroll en arrière-plan — ce n'est pas un bug du site, juste une limite de l'environnement de test.

Pour tester sur un vrai téléphone sans exposer publiquement le projet en continu : `npx --yes localtunnel --port <port du serveur local>`. Génère une URL `https://xxxxx.loca.lt` temporaire ; **une page interstitielle "Tunnel website ahead!" s'affiche pour les navigateurs mobiles** (détection par user-agent) et demande de cliquer sur "Click to Continue" — à prévenir l'utilisateur, ce n'est pas une erreur du site. ⚠️ **Le tunnel gratuit localtunnel tombe silencieusement au bout de quelques minutes** (observé deux fois le 2026-07-17, sans message d'erreur côté utilisateur — juste une page qui ne charge plus) : si l'utilisateur dit que ça ne marche pas, ne pas supposer une erreur de sa part, relancer le tunnel (et vérifier avec `curl` que la nouvelle URL répond bien *avant* de la lui donner — le process peut mettre quelques secondes à s'annoncer ou mourir tout de suite après le lancement).

## Design tokens (définis dans `css/styles.css` `:root`)

- `--bg:#0a0a0a` `--ink:#f5f5f5` `--red:#d90429` `--red-dark:#b80324` `--cream:#f0ede8`
- `--red-text:#ff3b5c` — variante rouge AA (~5.7:1 sur `--bg`) pour tout texte < 18px (`--red` seul est à 3.77:1, échoue en petit texte). Utilisée pour tous les eyebrows/labels rouges.
- `--ink-dim: rgba(245,245,245,.6)` — gris atténué AA (~6.8:1) pour labels/petit texte secondaire.
- `--display:'Bebas Neue','Bebas Fallback'` `--sans:'Inter'` `--mono:'JetBrains Mono'` `--script:'Ms Madi'` — `Bebas Fallback` est un `@font-face` local (`Arial Narrow`, `size-adjust:82%`) qui absorbe le reflow du `display=swap` sur les titres massifs (CLS).
- `--ease-out: cubic-bezier(.22,.61,.36,1)` (réactions au pointeur, ≤300ms) et `--ease-expo: cubic-bezier(.16,1,.3,1)` (easeOutExpo — **entrées en scène uniquement**, ≥400ms : rideau, cross-fade du hero, cascade des lettres). Ne pas passer les hovers en expo : sur une durée courte, son départ vif paraît cassant.

## Architecture des fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil : nav (+ burger mobile), hero (vidéo autoplay), marquee, **carrousel projets**, à propos, services, contact, footer. Meta OG/Twitter Card + canonical statiques dans le `<head>`. |
| `projet.html` | **Template unique** de page projet (rempli en JS via `?p=SLUG`). Meta OG/Twitter Card en placeholders (`id="metaOg..."`), réécrits par projet via JS. |
| `css/styles.css` | Styles de l'accueil + tokens + nav/footer/boutons/grain partagés + responsive (breakpoints 900px / 560px) |
| `css/project.css` | Styles des pages projet (s'appuie sur les tokens de styles.css) |
| **`js/projects.js`** | **⭐ LA SOURCE DE VÉRITÉ des projets** — `window.PROJECTS` (liste d'objets) |
| `js/main.js` | Logique de l'accueil : rendu des cartes, carrousel (3D desktop / scroll natif mobile), reveals, nav, formulaire Formspree, hero vidéo, parallax |
| `js/project-page.js` | Rendu d'une page projet depuis `window.PROJECTS` : hero → meta → vidéo → contexte → galerie (+ lightbox focus-trappée) → projet suivant. Injecte aussi les meta OG/Twitter par projet (constante `SITE_URL`). |
| `favicon.svg` | Favicon SVG simple (carré noir + point rouge, repris du `.dot` de la nav) |
| `robots.txt` / `sitemap.xml` | SEO — sitemap statique listant l'accueil + les 11 projets (`projet.html?p=slug`). À resynchroniser à chaque ajout/suppression/renommage de projet. |
| `assets/img/` | `card-N-*.jpg` (= visuel carte + hero page projet), `hero-1..3.jpg`, `about-portrait.jpg` |
| `assets/img/projets/<slug>/` | Galerie d'un projet : `01.jpg`, `02.jpg`, … |
| `assets/video/` | Vidéos web des projets (`<slug>.mp4`) + `hero_slideshow.mp4`. **`techteam.mp4` (projet `maison-lyne-st-andre`) n'existe pas encore** (voir TODO). Les autres projets vidéo passent désormais par un embed YouTube (champ `youtube` dans `js/projects.js`), pas de fichier local requis. |

## ⭐ Système data-driven des projets (à connaître avant toute modif projet)

Les 11 projets ne sont **pas** codés en dur. Ils sont générés depuis `window.PROJECTS` dans **`js/projects.js`** (le SEUL fichier à éditer pour gérer les projets). Chaque objet alimente **à la fois** sa carte sur l'accueil, sa page détail `projet.html?p=SLUG`, et ses meta Open Graph/Twitter (titre, description = `intro`, image).

**⚠️ `intro` = double emploi SEO** : c'est l'accroche affichée en haut de la page projet ET la `meta description` / description Open Graph/Twitter. Viser 110-160 caractères riches en mots-clés. `context` est traité comme une **étude de cas** (contexte/défi → direction artistique → résultat) — ne jamais y inventer de métrique chiffrée.

- `renderShowcase()` (dans `js/main.js`) construit le showcase de l'accueil (fonds + vignettes desktop, ou panneaux mobiles selon `IS_MOBILE`) ; il tourne **en premier** dans `init()` pour que `initShowcase()` voie les éléments générés.
- `js/project-page.js` lit `?p=slug`, trouve le projet, et rend : hero plein écran → barre méta (client/année/prestation) → contexte éditorial 2 colonnes → **vidéo (seulement si `video` défini)** → **galerie masonry** → teaser « projet suivant » (numéro `01/0X`, vignette = image du projet suivant dans la liste, lien `projet.html?p=slug`). Met aussi à jour `document.title`, `meta[description]`, le `<link rel="canonical">` et les meta OG/Twitter (`updateSocialMeta`) via la constante `SITE_URL` en tête du fichier.

**Ajouter un projet** = 1) déposer l'image principale dans `assets/img/`, 2) déposer les photos dans `assets/img/projets/<slug>/` (01.jpg…), 3) copier un bloc `{…}` dans `js/projects.js`, 4) penser à ajouter l'URL dans `sitemap.xml`. **Supprimer** = effacer le bloc (+ retirer du sitemap). Champs documentés en tête de `js/projects.js`. `stats: []` masque le bloc rouge ; `video: null` = pas de lecteur vidéo ; `url` (optionnel) remplace la page détail par un lien externe.

Les images de galerie ont été générées via un script **Pillow** (redimension max-width 1400, JPEG progressif). Refaire pareil pour de nouveaux projets (pas de tooling image auto dans le repo).

## Détails de comportement

- **⭐ Showcase projets : DEUX structures DOM distinctes, pas un habillage responsive.** `IS_MOBILE` (`matchMedia('(max-width:900px)')`, en tête de `js/main.js`) est tranché **une fois au chargement** et branche à la fois le rendu et l'init :
  - **≤900px → panneaux plein écran** (`renderShowcasePanels` + `initShowcasePanels`). Un projet = un panneau, la photo occupe tout, on glisse (scroll-snap natif), et **le panneau ENTIER est un `<a>`** : taper n'importe où ouvre le projet. Aucune animation JS, aucune boucle rAF, aucun transform posé par le JS — le JS ne fait que lire `scrollLeft` pour piloter le repère (12 segments + compteur). La structure desktop est **démontée du DOM** (pas masquée) pour ne pas charger 12 fonds inutiles ni laisser des cibles tactiles fantômes.
    - **Pourquoi cette refonte (2026-07-16)** : « hero + roulette » est un concept *desktop* — il suppose une scène large, un survol et un pointeur fin. Comprimé sur un téléphone il donnait exactement l'inverse de ce qu'on veut d'un portfolio (mesuré en 390×844) : bande de vignettes de **202px, plus haute que le contenu qu'elle sert à naviguer**, titre à 38px, section à **52% de l'écran**, photo réduite à un fond entrevu derrière deux calques, et un parcours en deux temps (sélectionner une vignette *puis* viser un CTA séparé). Après : section à **100% de l'écran**, photo à **69-73%**, tap direct. **Ne pas revenir à une roulette comprimée sur mobile.**
    - ⚠️ **`100svh`, jamais `100vh`** (`.showcase.is-panels .showcase__sticky`) : `100vh` compte la zone sous la barre d'URL sur iOS Safari / Chrome Android → le bas du panneau (donc le CTA) serait coupé. Le `100vh` juste au-dessus n'est qu'un repli.
    - ⚠️ **Pas de `height:100%` sur `.showcase__panel`** : la stage est un flex-item en `flex:1`, sa hauteur n'est définie qu'après layout — un pourcentage s'y résout à zéro (mesuré : panneau de **2px** de haut). C'est l'`align-items:stretch` du conteneur qui les étire.
    - ⚠️ **Cale `::after`, pas un `padding-right`** sur la stage : le padding de *fin* d'un conteneur de défilement flex est ignoré par plusieurs moteurs — sans la cale, le dernier panneau n'atteint jamais son alignement de snap.
    - La largeur du panneau est volontairement `calc(100% - 40px)` : le **débord du panneau suivant est l'affordance de glissement**. À 100% pile, rien n'indique qu'il y a une suite.
    - Tout le CSS est scopé à `.is-panels` / `.showcase__stage--panels` : une page chargée en desktop puis réduite sous 900px garde la structure desktop et ses anciennes règles de repli, intactes.
  - **≥901px → hero + roulette** (structure historique ci-dessous), avec `LOCK = !REDUCE` (capture sticky, ou repli natif sous `prefers-reduced-motion`).
- **Rideau d'entrée** (`initCurtain` dans `js/main.js` + `.curtain`) : le nom se dévoile en masque (0→950ms) puis le rideau se lève (950→1850ms), **une seule fois par session** (`sessionStorage`), retiré d'emblée sous `prefers-reduced-motion` ou si `sessionStorage` lève (navigation privée). ⚠️ **Toute la séquence est au `setTimeout`, jamais au `transitionend`** : `transform` est aussi transitionné sur `.curtain__word`, dont l'événement **remonte** jusqu'au rideau et le ferait disparaître d'un coup ; et dans un onglet ouvert en arrière-plan, un `transitionend` qui ne vient jamais laisserait un calque opaque bloquant toute la page. Le `.curtain` **n'a pas de `transition-delay`** — c'est le `setTimeout` qui fait attendre la levée ; ajouter les deux donne 2,75s au lieu de 1,85s. `initCurtain()` tourne **en premier** dans `init()` car il pose `REVEAL_DELAY`, lu par `initReveals()` : sans ce retard, la cascade du hero jouerait *derrière* le rideau et serait finie avant qu'il ne se lève (vérifié : le titre attend bien, puis cascade à 1749ms).
- **Curseur-badge** (`Motion.cursor` dans `js/motion.js`, `.cursor`) : carré rouge lerpé qui s'étend en badge libellé sur tout élément portant `data-cursor="…"` (posé sur les vignettes du showcase). Pointeur fin + hors reduced-motion uniquement. **Ne jamais masquer le curseur natif** (`cursor:none`) : le badge accompagne, il ne remplace pas. Le centrage est un `translate(-50%,-50%)` **suffixé au translate en px** — surtout pas un calcul par `offsetWidth`, qui forcerait une lecture de layout à chaque frame (le pourcentage se résout sur la propre boîte de l'élément et suit donc tout seul l'animation de taille).
- **Essuyage d'image** (`[data-clip-reveal]` / `[data-clip-target]`) : ⚠️ **deux éléments distincts, obligatoirement**. Un élément découpé à `clip-path: inset(100%)` a une aire visible nulle et un `IntersectionObserver` le rapporte à **ratio 0 même en plein écran** (mesuré) — il se cacherait de l'observateur censé le révéler et ne s'ouvrirait jamais. L'élément **observé** (`[data-clip-reveal]`, où `.is-in` est basculée) n'est donc jamais découpé ; c'est `[data-clip-target]` à l'intérieur qui se fait essuyer. L'état masqué est **armé par JS** (`data-clip-reveal="armed"` posé dans `initMotion`) et non par le CSS seul : sans ça, un `motion.js` absent ferait disparaître le portrait pour de bon.
- **Transitions de page** : View Transitions API cross-document (`@view-transition { navigation: auto }` dans `css/styles.css`, chargé par les 3 pages). Zéro JS ; Safari/Firefox ignorent le bloc et naviguent normalement.
- **Reveals** : éléments `[data-reveal]` révélés par IntersectionObserver (accueil : styles inline ; page projet : classe `.is-in`). `prefers-reduced-motion` respecté partout ; le slideshow ne s'auto-avance plus sous reduced-motion.
- **Hero** : `.hero__scrim` est un dégradé **horizontal** (gauche→droite, 88%→12% d'opacité) dédié à la zone où le texte est réellement affiché, + un second calque en bas. Un dégradé diagonal 135deg était utilisé avant et tombait à ~40-55% d'opacité pile sous le texte (lisibilité insuffisante contre une vidéo claire, retour utilisateur direct). `.hero__title`/`.hero__lead` ont aussi un `text-shadow` en filet de sécurité (même technique que `.card__title`). Ne pas repasser à un dégradé diagonal sans revérifier le contraste réel sous le texte.
- **Nav mobile** : burger fonctionnel (`nav__mobile-panel`), et **`.nav__cta` ("PRENDRE RDV") est masqué sous 900px** — il fait doublon avec le lien équivalent du panneau mobile et surchargeait le header (bug corrigé cette session, ne pas le réafficher sans repenser l'espace disponible). ⚠️ **La règle de masquage doit être `.nav .nav__cta` (spécificité 0,2,0), pas `.nav__cta` (0,1,0)** : l'effet magnétique ajoute la classe `is-magnetic` sur les pointeurs fins (desktop/devtools mobile/tablettes hybrides), et `a.is-magnetic { display:inline-flex }` (0,1,1) réaffichait sinon le CTA grossi sur la nav mobile. Régression identifiée puis corrigée (commit « nav glassmorphism »). Sur un vrai téléphone tactile pur, `magnetic()` ne s'active pas (`!FINE`), donc `is-magnetic` n'est pas posé — d'où un bug invisible en test tactile mais bien réel en émulation/hybride.
- **Boutons hero** : `.btn-primary--lg` a un override mobile (font-size/padding réduits, `.hero__actions` en `flex-wrap`) pour ne pas déborder sur petit viewport.
- **Galerie** (page projet) : **masonry** en `column-count` (3 desktop / 2 ≤1100px / 2 mobile), proportions naturelles, pas de recadrage. Images `<img>` avec `alt` + `loading="lazy"`. La **lightbox** (`role="dialog"`) a un **focus trap** (Tab/Shift+Tab bouclent entre close/prev/next, ne s'échappent plus vers le contenu masqué derrière) + Escape/flèches clavier + focus renvoyé à l'élément déclencheur à la fermeture.
- **Vidéo** (page projet) : vignette poster + bouton play qui injecte le lecteur **à la demande** (rien n'est chargé tant qu'on ne clique pas). Deux sources possibles par projet, gérées par `videoHtml`/`initVideo` :
  - **`youtube: "ID"`** → injecte un `<iframe>` YouTube au clic ; poster par défaut = miniature YouTube (`img.youtube.com/vi/ID/maxresdefault.jpg`). Projets concernés : `hakai-lune`, `hakai-allumer`, `ludeo`, `wsc-spot`. **Prioritaire** sur `video` si les deux sont définis. Le **hero de la page projet** utilise aussi cette miniature (via `heroHtml`, pas `p.image`) pour les projets YouTube.
  - **Fallback miniature** : `maxresdefault` n'existe pas pour toutes les vidéos (ex. `ludeo` → renvoie un placeholder gris 120px en succès HTTP, pas une erreur). `fixYtPosters()` (poster vidéo) et `fixYtHero()` (fond du hero) détectent ce cas (`naturalWidth ≤ 120`) ou une erreur, et basculent sur `hqdefault` (toujours disponible, 480×360).
  - **`video: { src, poster }`** → injecte un `<video controls>` local ; si le fichier manque → message « vidéo bientôt disponible ». Seul `maison-lyne-st-andre` utilise encore un fichier local (`assets/video/techteam.mp4`, pas encore livré — voir TODO).
  La section vidéo porte un `<h2>` « LA VIDÉO ».
- **Structure Hn (SEO) & CTA des pages projet** : chaque page a **un seul `<h1>`** (titre projet) + des `<h2>` sur les sections (`L'ÉTUDE DE CAS`, `LA VIDÉO`, `LA GALERIE`, bloc CTA) — rendus visuellement comme des eyebrows via la classe `.eyebrow__h` (reset des marges `<h2>`). En bas de page, **avant** le teaser « projet suivant », un **bloc CTA de conversion** (`ctaHtml` → `.pcta`) pousse vers `index.html#contact` (« Démarrer votre projet »). Le teaser « projet suivant » dit « Explorer l'étude de cas » (plus « Voir le projet »).
- **A11y des images du showcase** : pas de hack `role="img"`/`aria-label` sur un `div` — chaque mode expose l'info nativement. Desktop : les vignettes restent en `background-image` (CSS, pour le scale roulette lerpé) mais le `<button>` parent porte `aria-label="Voir CLIENT — TITRE"` ; le fond du hero (`.showcase__bg`) est purement décoratif, l'info équivalente est dans le texte réel de `.showcase__content` (`aria-live`). Mobile : chaque panneau est une vraie `<img alt="">` (vide volontairement — le client/titre/CTA existent déjà en texte réel juste en dessous dans le même `<a>`, un `alt` rempli ferait tout lire deux fois). Point focal par projet via `object-position`/`background-position` (champ optionnel `focal` dans `js/projects.js`, défaut `center` — ne réduit pas le % de recadrage `cover`, choisit juste quelle partie de la photo garder).
- **Formulaire de contact** (`initContactForm` dans `js/main.js`) : **branché sur Formspree, opérationnel**. `<form action="https://formspree.io/f/xbdvqbor" method="POST">` dans `index.html`. JS fait un vrai `fetch()` POST en JSON (`Accept: application/json` pour éviter la redirection par défaut de Formspree) avec 3 issues gérées dans l'UI existante (`#contactStatus`, `role="status" aria-live="polite"`) :
  1. Succès (`res.ok`) → message de succès + `form.reset()`.
  2. Formspree répond mais refuse (ID invalide, quota, anti-spam) → message d'erreur inline avec détail, **pas** de repli mailto (le service est joignable, ce n'est pas une panne).
  3. Échec réseau total (`fetch` rejette — hors ligne, Formspree injoignable) → repli automatique sur `mailto:abcreazion@gmail.com` pré-rempli.
  Testé en conditions réelles : soumission de test envoyée avec succès (`200 OK`) sur le compte Formspree du client. Plan Free (50 soumissions/mois), usage attendu ~10/mois.
- **SEO/partage** : favicon SVG, meta Open Graph + Twitter Card (statiques sur l'accueil, réécrites par projet via JS), `robots.txt` + `sitemap.xml`. **Toutes les URLs absolues utilisent `https://bastienagus.vercel.app` en dur** (hébergement gratuit Vercel, pas de nom de domaine acheté pour l'instant — voir TODO).

## TODO / dette connue

🔴 **Bloqué, à faire dès que possible** :
- **`assets/video/hero_slideshow.mp4` pèse 54 Mo et part en autoplay au chargement de l'accueil** — premier problème de perf du site (~1 min de téléchargement en 4G, concurrence les fonds du showcase). **ffmpeg n'est pas installé sur la machine de dev**, donc la recompression n'a pas pu être faite : à exécuter là où ffmpeg est dispo (cibles ~6-10 Mo en 1080p CRF 30 `-movflags +faststart -an`, + une variante 720p ~3-4 Mo pour le mobile), puis brancher le choix de source par viewport dans `initHeroVideo()`. **Le code de sélection de source n'a délibérément PAS été écrit** : il référencerait des fichiers inexistants et casserait le hero.

🟡 **À faire mais pas urgent** :
- **Vidéo manquante** : `assets/video/techteam.mp4` (projet `maison-lyne-st-andre`) n'existe pas — le client doit fournir les rushes sources (procédure de compression déjà documentée dans `assets/video/README.txt`, ffmpeg requis). Non bloquant pour la mise en ligne : la page affiche un repli propre (« vidéo bientôt disponible ») tant que le fichier manque. `wsc-spot` ne nécessite plus de `.mp4` : il passe désormais par un embed YouTube.
- **Domaine provisoire** : `https://bastienagus.vercel.app` (sous-domaine gratuit Vercel) est utilisé partout (meta OG/Twitter/canonical statiques d'`index.html`/`projet.html`/`voyages.html`, constante `SITE_URL` en tête de `js/project-page.js`, `robots.txt`, `sitemap.xml`). Si un nom de domaine personnalisé est acheté plus tard et branché sur Vercel, mettre à jour ces emplacements (recherche/remplacement simple, tout est centralisé en quelques endroits documentés).
- **Projets retirés temporairement** : `dimension` et `solerys-rse` sont commentés dans `js/projects.js` (le client s'en occupe plus tard) et donc absents de `sitemap.xml`. Les images/vidéos associées restent dans le repo au cas où ils seraient réactivés.
- **Dossier `project/`** : prototype de handoff Claude Design (`.dc.html`, captures, uploads), non destiné au public. Exclu du déploiement via `.vercelignore` (racine du repo) — ne pas le retirer de `.vercelignore` sans une bonne raison, sous peine d'exposer publiquement ces fichiers internes sur le déploiement Vercel.

🟢 **Dette mineure restante (issue de l'audit WCAG, non bloquante)** :
- Sous-titres/captions pour les vidéos projet (à intégrer *au moment* de l'upload des vidéos manquantes, pas séparément).
- **Re-init du showcase au franchissement du breakpoint 900px** (rotation d'écran / redimensionnement) : le mode est toujours tranché une fois au `init()`, et il détermine désormais la **structure DOM** (panneaux vs hero+roulette), plus seulement le comportement — un vrai re-init supposerait de démonter le DOM *et* tous les listeners (aucun n'est détachable). Le CSS des deux modes est scopé par classe, donc une fenêtre redimensionnée reste cohérente avec la structure qu'elle a rendue ; c'est la mise en page qui n'est pas idéale, pas cassée. Limitation acceptée.
- **Text-swap sur les CTA** (le label sort par le haut, son double entre par le bas) : proposé par l'audit §4.1, non appliqué — impose de dupliquer le libellé de chaque CTA dans le HTML (+ `aria-hidden` sur la copie). À trancher au goût, ce n'est pas une correction.
- **WebP / `image-set()`** pour les 65 Mo d'images (100% JPEG aujourd'hui, −30/40% attendu via le pipeline Pillow existant).
- Page 404 réelle (au lieu du "Projet introuvable" rendu en SPA sans statut HTTP).
- Version anglaise / `hreflang` — décision business, pas technique.

**Points de l'ancien audit désormais résolus** (ne pas re-découvrir/ré-auditer inutilement) : menu burger mobile, contraste texte (`--red-text`/`--ink-dim`), `:focus-visible`, skip-link, landmark `<main>`, `prefers-reduced-motion`, alt text cartes projet, focus trap lightbox, favicon/OG/robots/sitemap, formulaire de contact réellement fonctionnel, lisibilité du hero, boutons mobile disproportionnés, carrousel `.card` desktop (rotation) et mobile (scroll natif) — tout ça a été audité puis corrigé et **vérifié fonctionnellement en direct sur mobile et desktop réels** le 2026-07-04. ⚠️ **Note historique** : ce carrousel `.card` (`initCarousel`/`initDesktop`/`initMobile`) n'existe plus du tout dans le code — il a depuis été intégralement remplacé par le **showcase** (`renderShowcase`/`initShowcase`, voir « Détails de comportement »). Cette ligne reste comme trace de ce qui a été résolu à l'époque, pas comme pointeur vers du code actuel.

## Conventions

- Écrire du code qui ressemble à l'existant : vanilla, IIFE dans les JS, classes BEM-ish (`.card__meta`, `.pgal__item`), variables CSS pour les couleurs/polices.
- Après une modif observable, **vérifier dans le navigateur** (serveur preview) plutôt que demander à l'utilisateur. Pour les vérifications fonctionnelles sans capture d'écran : DOM (`getBoundingClientRect`, `getComputedStyle`), `document.elementFromPoint` pour le hit-test de zones cliquables, dispatch d'événements clavier/souris synthétiques.
- ⚠️ **Tester une animation : passer par Playwright, pas par l'onglet de preview.** L'onglet de preview de l'assistant est `document.hidden === true` → le navigateur y **met `requestAnimationFrame` en pause** (mesuré : **0 frame en 500 ms**). Tout ce qui est piloté par rAF (roulette du showcase, hover boost) y est figé, **et les transitions CSS n'avancent pas non plus** — un `getComputedStyle` y renvoie donc l'état de *départ*, pas l'état final (piège vérifié : un CTA semblait déborder de 10px, c'était son `translateY` de reveal jamais joué). Le **MCP Playwright** (`mcp__playwright__browser_navigate` + `browser_evaluate`) lance un vrai navigateur visible : `document.hidden === false`, **60 fps réels**, animations et transitions testables. C'est ainsi qu'a été validée la refonte de fluidité de la roulette. Pour mesurer un état final malgré tout dans la preview : injecter `*{transition:none!important;animation:none!important}` avant de mesurer.
- Autre piège de mesure : `resize_window` du harness **n'émet aucun événement `resize`** → les gardes JS branchées dessus (ex. `setHeight`) ne se déclenchent pas, ce qui fait apparaître de faux bugs de mise en page (un « grand vide » fantôme a déjà été rapporté à tort ainsi). Émettre `window.dispatchEvent(new Event('resize'))` pour tester ces gardes.
- Ne pas réintroduire de framework / build / lib de smooth-scroll sans validation explicite.
- Ne pas réintroduire de scroll-jack sur mobile (ni pour le showcase, ni ailleurs) — voir « Détails de comportement ». (Le clamp de rotation `rotateY` ±22deg d'un ancien carrousel `.card` 3D, longtemps documenté ici, ne s'applique plus : ce carrousel a été intégralement remplacé par le showcase actuel, qui n'utilise aucune rotation — plus la peine de le chercher dans le code.)

## Outils

### `ui-ux-pro-max` — installé dans le projet

Skill maison de design intelligence (50+ styles, 161 palettes, 57 pairings de polices, 99 guidelines UX). **Installé dans le repo** : `.claude/skills/ui-ux-pro-max/` (~5,3 Mo, CSV + scripts Python, aucune dépendance npm). L'invoquer pour les décisions de style/couleur/UX.

Il vit désormais **dans le projet** (et non dans `~/.claude/skills`) pour survivre aux changements de profil Windows : la source de référence est `F:/BASTIEN/SKILLS/claude-skills/ui-ux-pro-max`. Historique utile — ce fichier l'a longtemps annoncé « installé » alors qu'il ne l'était plus : il avait été installé sous un **ancien profil** (`C:/Users/test/.claude/skills`, cf. les entrées périmées de `.claude/settings.local.json`), profil remplacé depuis par `bagus`. La doc a survécu à l'installation, pas l'inverse. D'où l'installation *dans le repo* : le skill suit le projet.

⚠️ `.claude/` est exclu du déploiement via `.vercelignore` — ne pas l'en retirer, sous peine de publier 5,3 Mo de CSV sur le site.

### Skills du plugin `design`

Le plugin `design` est **déjà actif** : ces skills s'invoquent directement via l'outil Skill, **aucune installation n'est requise**.

| Skill | Quand l'invoquer sur ce projet |
|---|---|
| `design:design-critique` | Retour structuré sur une section (hero, carrousel, page projet) : hiérarchie, lisibilité, cohérence. Le réflexe par défaut pour une décision de style/UX. |
| `design:accessibility-review` | Audit WCAG 2.1 AA formel. Déjà passé et corrigé le 2026-07-04 — ne relancer que sur une **nouvelle** zone (ex. le carrousel redesigné), pas sur l'existant validé. |
| `design:design-system` | Cohérence des tokens `:root` (`--red-text`, `--ink-dim`, polices) et des classes BEM-ish ; repérer les valeurs codées en dur au lieu des variables CSS. |
| `design:ux-copy` | Microcopie française : libellés de CTA, messages du formulaire Formspree (succès/erreur/repli mailto), états vides, textes de nav. |
| `design:design-handoff` | Spéc d'implémentation quand une maquette doit devenir du HTML/CSS (états, breakpoints 900/560px, détails d'animation). |
| `design:user-research` / `design:research-synthesis` | Si un vrai retour utilisateur est collecté un jour. Pas de données de recherche sur ce projet à ce jour. |
| `dataviz` | Aucun graphique sur le site (les `stats` sont des chiffres en texte). À ne sortir que si une dataviz est réellement ajoutée. |

⚠️ **Contexte à rappeler au skill** : site vitrine dark éditorial (`--bg:#0a0a0a`), **coins nets** (aucun `border-radius`), contenu **en français**, vanilla sans build. Les skills ne connaissent pas ces contraintes — les énoncer dans l'invocation, sinon leurs recommandations par défaut (coins arrondis, palettes claires, composants React) sont hors sujet.

Les autres skills locaux disponibles : `graphify` (`~/.claude/skills/graphify`, base de connaissances du code, déclencheur `/graphify`).
