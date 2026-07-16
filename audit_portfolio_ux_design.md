# 📑 AUDIT DE DESIGN INTERACTIF, ANIMATIONS & MICRO-INTERACTIONS : PORTFOLIO CRÉATIF

> **Bastien Agus — Directeur Artistique · Producteur Audiovisuel** · Audit du 2026-07-16
> Base auditée : branche `claude/carousel-redesign-audit-828fcc` (refonte showcase hero-select + roulette, commit `5127136`).
>
> ⚠️ **Note de stack** : ce site est en **HTML/CSS/JS vanilla, sans build, sans dépendance** — c'est un choix
> assumé et documenté (`CLAUDE.md`). Tailwind, Framer Motion et GSAP ne s'appliquent pas ici (GSAP et Lenis ont
> été **testés puis retirés** : ils se battaient contre le scroll-lock). Toutes les propositions de code de cet
> audit sont donc en **CSS natif + vanilla JS**, réutilisent les tokens existants (`--ease-out`, `--dur-*`,
> `--red`, `--cream`…) et respectent les conventions du projet : BEM-ish, IIFE, **coins nets (pas de
> border-radius décoratif)**, `transform`/`opacity` uniquement pour l'animation, `prefers-reduced-motion`
> court-circuité partout.
>
> Légende fiabilité : ✅ = **mesuré** en session (Playwright/DOM, valeurs réelles) · 👁 = à valider à l'œil sur écran réel.

---

## 1. Analyse Technique de l'Existant (Code & Performance)

### 1.1 Structure globale & propreté — verdict : très saine

| Point | État |
|---|---|
| Architecture | Data-driven exemplaire : `js/projects.js` = source de vérité unique, tout dérive de `window.PROJECTS` (cartes, pages, meta OG). Aucun projet codé en dur. |
| JS | 2 981 lignes au total, IIFE partout, zéro global sauf `window.PROJECTS` / `window.Motion`. `js/motion.js` est une vraie micro-lib de motion (boucle rAF **partagée** entre tous les effets — pas un rAF par effet, c'est rare et bien). |
| CSS | 1 011 lignes, tokens centralisés dans `:root`, commentaires de *pourquoi* (pas de *quoi*) — niveau de doc inhabituel et précieux. |
| Reste à nettoyer | `package-lock.json` orphelin, classe morte `.media-tag--dark` (`styles.css:73`), **cache-busters `?v=dev3`** sur les `<link>`/`<script>` d'`index.html` (lignes 25, 385-387) — **à retirer avant merge**, c'est un outil de dev documenté dans `SHOWCASE-REDESIGN.md` §9. |

### 1.2 Focus technique carrousel (showcase) — verdict : performant, avec un tradeoff assumé

Ce qui est **déjà bon** (et ne doit pas être « ré-optimisé ») :

- ✅ **Scale roulette en calcul pur** : `scale = PEAK − (min(RADIUS,|dist|)/RADIUS)·(PEAK−FLOOR)` — zéro
  `getBoundingClientRect` dans la boucle des vignettes (l'ancienne version en lisait 12/frame = layout
  thrashing, c'était LA cause du jank d'origine).
- ✅ **Lerp indexé sur le delta-time** (`smooth(k, dt)`, `js/main.js`) : convergence **517 ms quelle que soit la
  cadence** (mesuré : avant 517/258/215 ms en 60/120/144 Hz — un écran 120 Hz rendait la roulette 2× plus sèche).
- ✅ **Écritures filtrées** : transform/z-index/barre de progression ne sont réécrits que sur changement réel
  (avant : ~1 440 écritures identiques/s).
- ✅ `will-change: transform` sur `.showcase__thumb`, transitions CSS **sans** `transform` (le lerp JS s'en
  charge — une transition par-dessus retraînerait, effet « poisseux » documenté).
- ✅ Hardware acceleration : tout ce qui bouge par frame est en `transform`/`opacity` (compositor). Ken Burns en
  `@keyframes` CSS pur. Cross-fade des fonds en `opacity`.

Le **tradeoff connu** : en mode lock, la bande est positionnée via `track.scrollLeft` à chaque frame (thread
principal). Un `transform` serait pris par le compositor **mais ne fait pas la même chose** (il déplace le
conteneur, pas son contenu — régression testée et documentée dans `js/main.js`, ne pas retenter sans conteneur
interne dédié). Le coût réel est faible (une écriture/frame, layout simple) : **à garder tel quel**.

**Risques CLS (décalage de mise en page)** :

| Source | Risque | Correctif |
|---|---|---|
| Vignettes | Aucun — `aspect-ratio: 3/4` fixe la boîte avant chargement de l'image. | — |
| Stage desktop | Aucun — hauteur en `vh` bornée. | — |
| **Polices** | Réel mais léger : `display=swap` fait flasher Bebas Neue (titres massifs → reflow visible). | `size-adjust` sur une fallback locale, voir §6-T3. |
| Hero vidéo | Aucun (poster + `absolute inset:0`). | — |

### 1.3 Gestion des assets média — 🔴 **c'est ici que se joue la fluidité perçue**

Mesures réelles du repo :

```
assets/video/hero_slideshow.mp4     54,4 Mo   ← autoplay au chargement de l'accueil (!)
assets/video/  (total)              102 Mo    (dont 4 projets déjà migrés vers YouTube)
assets/img/    (total)              65 Mo     (196 JPEG, zéro WebP/AVIF, dont _originals/ et voyages/)
cartes card-N-*.jpg                 116→377 Ko chacune
```

- 🔴 **`hero_slideshow.mp4` : 54 Mo en autoplay** est le premier problème de performance du site — sur mobile
  4G c'est ~1 min de téléchargement en tâche de fond qui **concurrence les 12 fonds du showcase** et peut faire
  ramer les animations au premier scroll (bande passante + décodage vidéo). Recompresser est non négociable :

  ```bash
  # 1080p, CRF 30, sans audio, faststart (lecture avant téléchargement complet) → viser 6-10 Mo
  ffmpeg -i hero_slideshow.mp4 -vf "scale=1920:-2" -c:v libx264 -crf 30 -preset slow \
         -movflags +faststart -an hero_slideshow_web.mp4
  # variante mobile 720p → ~3-4 Mo
  ffmpeg -i hero_slideshow.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 31 -preset slow \
         -movflags +faststart -an hero_slideshow_mobile.mp4
  ```

  Et ne servir la vidéo qu'aux viewports qui la méritent (le `<source media>` n'existe pas pour `<video>`,
  on injecte en JS — à brancher dans `initHeroVideo()` existant) :

  ```js
  // js/main.js — initHeroVideo() : source selon le viewport, décidée une fois au load
  var mobile = window.matchMedia('(max-width: 900px)').matches;
  var src = document.createElement('source');
  src.src = mobile ? 'assets/video/hero_slideshow_mobile.mp4' : 'assets/video/hero_slideshow_web.mp4';
  src.type = 'video/mp4';
  video.appendChild(src); // le <video> du HTML ne contient plus de <source> en dur
  ```

- 🟡 **12 fonds de showcase chargés d'emblée** (`background-image` sur chaque `.showcase__bg`) : les
  `background-image` CSS échappent au `loading="lazy"` natif. Charger les 3 premiers, différer le reste :

  ```js
  // js/main.js — renderShowcase() : ne poser que les 3 premiers fonds, différer les autres
  bg.style.backgroundImage = (i < 3) ? "url('" + p.image + "')" : '';
  if (i >= 3) bg.dataset.bgSrc = p.image;
  // …puis au premier kick() du showcase (l'utilisateur approche) :
  bgs.forEach(function (bg) {
    if (bg.dataset.bgSrc) { bg.style.backgroundImage = "url('" + bg.dataset.bgSrc + "')"; delete bg.dataset.bgSrc; }
  });
  ```

- 🟡 **Formats modernes** : 100 % JPEG. Le pipeline Pillow existant (redim. 1400px, JPEG progressif) peut sortir
  du **WebP à −30/40 %** sans perte visible (`img.save(out, 'WEBP', quality=82)`). AVIF : gain supérieur mais
  encodage lent — WebP est le bon ratio effort/gain ici. Servir en `image-set()` pour les fonds CSS :

  ```css
  .showcase__bg { background-image: image-set(url('….webp') type('image/webp'), url('….jpg') type('image/jpeg')); }
  ```

- 🟢 Les `.mp4` de projets migrés vers YouTube (`hakai-lune`, `hakai-allumer`, `ludeo`, `wsc-spot`) et
  `assets/img/_originals/` ne servent plus au site : les ajouter à `.vercelignore` (comme `project/` et
  `.claude/`) pour alléger chaque déploiement.

---

## 2. Refonte du Design Visuel & Direction Artistique (Desktop vs Mobile)

### 2.1 Ce qui fait déjà « signature » — à protéger, pas à toucher

L'identité est **forte et cohérente** : dark éditorial, coins nets militants, rouge unique discipliné
(`--red` + variantes AA calculées), Bebas massif en `line-height .84-.86`, labels JetBrains Mono espacés
(`.16em`), ponctuation manuscrite Ms Madi (« une sélection »), mots fantômes géants en fond
(`.hero__ghost`, `.about__bgword`, `-webkit-text-stroke`), liserés 1px (`rgba(255,255,255,.08)`), et la
**rupture chromatique** dark → crème (showcase, services) → dark qui rythme la page. La barre `.hero__baseline`
(dégradé rouge 3px) referme le hero — c'est un vrai système. **Rien de tout ça n'est à « moderniser »** : c'est
précisément ce qui distingue ce portfolio d'un template.

### 2.2 Les vrais défauts visuels, par priorité

**🔴 V1 — Recouvrement texte/vignettes du showcase desktop (~1280 px)** — ✅ mesuré en session :
`.showcase__content` (`left:40px; max-width:560px`, z-index 3) et `.showcase__thumbs`
(`right:32px; max-width:min(58vw,640px)`, z-index 5) se croisent sur les stages étroites. Sur une fenêtre
1280×800 : zone de texte `97..656`, vignettes `536..1176` → **jusqu'à 119 px de chevauchement**, titre et
accroche passent *sous* les vignettes. À 1920 px : aucun recouvrement (d'où le fait qu'il soit passé
inaperçu à la validation). Correctif minimal, sans toucher au layout ≥1440 px :

```css
/* css/styles.css — .showcase__content : la largeur du texte cède AVANT de passer
   sous les vignettes. 42% ≈ ce qui reste à gauche du cluster (max-width 58vw)
   dans la stage, moins l'ancrage left:40px et une gouttière de sécurité. */
.showcase__content { max-width: min(560px, calc(42% - 100px)); }
```

Vérification attendue : à 1280×800, `content.right` (≈ 481) < `thumbs.left` (536). L'accroche
(`-webkit-line-clamp: 2`) et le titre wrappent naturellement dans la nouvelle largeur.

**🟡 V2 — Numéro de vignette illisible** — ✅ mesuré 3.12:1 (échoue AA) :

```css
/* css/styles.css:403 — .35 → .55 : ~4.6:1 sur le scrim sombre, AA pour du 9px bold */
.showcase__thumb-num { color: rgba(255,255,255,.55); }
```

**🟡 V3 — Grain photographique sur les aplats sombres** 👁 : les longs dégradés sombres (scrims du hero et du
showcase) peuvent *bander* sur les écrans bon marché. Un bruit très léger casse le banding et donne le rendu
« pellicule » cohérent avec un profil de producteur vidéo — en SVG inline data-URI, zéro requête :

```css
/* Voile de grain fixe, sous le contenu. Opacité volontairement infime. */
.grain {
  position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: .05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
}
```
```html
<!-- index.html, juste après <body> --> <div class="grain" aria-hidden="true"></div>
```
*(statique volontairement : un grain animé coûte un repaint plein écran permanent — interdit ici.)*

**🟢 V4 — Plancher typographique du hero** : `font-size: min(10vw,128px)` n'a pas de borne basse → 37 px à
375 px de large, un peu timide pour un titre-manifeste. `clamp()` règle ça sans toucher au desktop :

```css
.hero__title { font-size: clamp(52px, 10vw, 128px); }
.showcase__title { font-size: clamp(34px, 6.2vw, 72px); }
```

**🟢 V5 — Respiration verticale uniforme** 👁 : toutes les sections sont à `padding: 160px 56px`. Un rythme
*varié* est plus éditorial qu'un rythme régulier — suggestion : About 200px (elle suit la densité du showcase),
Services 160px, Contact 180px. À juger à l'œil, aucune contrainte technique.

### 2.3 Desktop vs Mobile

Le mobile a été **réparé et vérifié en session** (✅ CTA hit-testé 0/12 mort sur 375×667, 360×740, 320×480 —
il était mort 10/12 avant) : texte et vignettes y sont désormais **empilés en flux** (plus de calques absolus),
le chevauchement y est impossible par construction. Le desktop garde les calques absolus — d'où V1 ci-dessus,
qui est le *même défaut de famille* côté desktop. Après V1, les deux modes sont structurellement sains.

---

## 3. Le Guide du Motion : Animations & Transitions Globales

### 3.0 Un token d'easing premium à ajouter (utilisé par tout ce qui suit)

La courbe actuelle `--ease-out: cubic-bezier(.22,.61,.36,1)` est un ease-out générique correct. Pour les
*entrées* (reveals, cascade, rideau), un **easeOutExpo** — départ vif, atterrissage très long — donne cette
sensation « lourde et précise » des sites primés :

```css
:root {
  --ease-expo: cubic-bezier(.16, 1, .3, 1);   /* easeOutExpo — entrées, reveals */
  /* --ease-out reste pour les hovers/sorties courtes : sur 200-300ms, expo est trop brutal au départ */
}
```

Règle d'usage : **expo pour ce qui entre en scène (400 ms+), ease-out actuel pour ce qui réagit au pointeur
(≤300 ms)**. Ne pas tout basculer en expo : un hover expo paraît cassant.

### 3.1 Animation d'arrivée (loader / première impression)

Il n'y a aujourd'hui **aucun moment d'entrée** : le site apparaît d'un bloc. Pour un DA, les 800 premières
millisecondes sont une pièce du portfolio. Proposition : **rideau typographique** — le nom se dévoile en masque,
puis le rideau se lève et révèle le hero. 100 % CSS + 10 lignes de JS, une seule fois par session
(`sessionStorage`), coupé sous reduced-motion :

```html
<!-- index.html, juste après <body> -->
<div class="curtain" id="curtain" aria-hidden="true">
  <div class="curtain__brand">
    <span class="curtain__word">BASTIEN<span class="red">&nbsp;AGUS</span></span>
  </div>
</div>
```

```css
/* ——— Rideau d'entrée : nom en masque → levée du rideau. Une fois par session. ——— */
.curtain {
  position: fixed; inset: 0; z-index: 900; background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  transition: transform .9s var(--ease-expo) .9s; /* la levée attend la fin du dévoilement */
}
.curtain__brand { overflow: hidden; } /* le masque */
.curtain__word {
  display: inline-block; font-family: var(--display); font-size: clamp(44px, 8vw, 110px);
  letter-spacing: .04em; color: var(--ink);
  transform: translateY(110%);
  transition: transform .8s var(--ease-expo) .15s;
}
.curtain.is-in .curtain__word { transform: none; }
.curtain.is-done { transform: translateY(-100%); }
.curtain.is-gone { display: none; }
@media (prefers-reduced-motion: reduce) { .curtain { display: none; } }
```

```js
// js/main.js — init() : à appeler en premier
function initCurtain() {
  var el = document.getElementById('curtain');
  if (!el) return;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCE || sessionStorage.getItem('curtainSeen')) { el.remove(); return; }
  sessionStorage.setItem('curtainSeen', '1');
  requestAnimationFrame(function () { el.classList.add('is-in'); });      // dévoile le nom
  setTimeout(function () { el.classList.add('is-done'); }, 950);          // lève le rideau
  el.addEventListener('transitionend', function (e) {
    if (e.propertyName === 'transform' && el.classList.contains('is-done')) el.classList.add('is-gone');
  });
}
```

*Total : ~1,8 s la première fois, 0 ms ensuite. Pas de spinner — un loader qui « charge » est un aveu, un rideau
est une signature.*

### 3.2 Entrées de contenu au défilement (scroll reveals)

L'infrastructure existe déjà et elle est bonne : `Motion.reveal()` (IntersectionObserver **bidirectionnel** —
remonter rejoue l'animation en sens inverse, jamais de `unobserve`) et `Motion.splitText()` (masques par mot,
stagger 34 ms). Deux enrichissements dans le même langage :

**a) Reveal d'image par masque d'écrêtage (clip-path)** — pour le portrait About et les images de galerie,
plus cinématographique qu'un fondu (l'image est *découverte*, pas *allumée*) :

```css
/* Révélation en essuyage vertical — compositor-friendly (clip-path est animable GPU).
   S'appuie sur la classe .is-in déjà posée par Motion.reveal(). */
[data-clip-reveal] {
  clip-path: inset(100% 0 0 0);
  transition: clip-path 1s var(--ease-expo);
}
[data-clip-reveal].is-in { clip-path: inset(0 0 0 0); }
/* variante image : léger dé-zoom simultané (l'image "se pose") */
[data-clip-reveal] > img, .about__portrait[data-clip-reveal] {
  transform: scale(1.08); transition: transform 1.2s var(--ease-expo);
}
[data-clip-reveal].is-in > img, .about__portrait[data-clip-reveal].is-in { transform: none; }
@media (prefers-reduced-motion: reduce) {
  [data-clip-reveal] { clip-path: none; transition: none; }
  [data-clip-reveal] > img { transform: none; }
}
```
```js
// js/main.js — initMotion() : une ligne
Motion.reveal('[data-clip-reveal]');
```
```html
<!-- usage : --> <div class="about__portrait" data-clip-reveal></div>
```

**b) Parallax déjà en place** (`Motion.parallax`, scrub lié au scroll avec drapeau dirty) : l'étendre aux mots
fantômes des sections si ce n'est pas déjà branché — `data-parallax=".08"` sur `.about__bgword` /
`.services__bgword` suffit, la lib lit l'attribut.

### 3.3 Fluidité du carrousel (showcase)

État mesuré : lerp dt-indexé (✅ 517 ms constants), décroissance exponentielle propre sur 38 frames
(✅ −71→−0.03 px sans à-coup). Ce qui reste est du **réglage de goût**, pas de la correction :

| Réglage | Actuel | Proposition 👁 | Effet |
|---|---|---|---|
| `PROG_LERP` | 0.20 (~517 ms) | **0.14** (~750 ms) | Bande plus « lourde », inertie premium. À tester : peut sembler flotter. |
| `BOOST_LERP` | 0.22 | 0.22 (garder) | Le hover doit rester réactif. |
| Snap | `scrollTo smooth` natif | garder | Le natif est fiable ; un snap custom rAF se battrait avec `isSnapping`. |

**Cross-fade du hero enrichi** — aujourd'hui pur `opacity`. Un micro-zoom du fond *entrant* (1.045 → 1) donne
la sensation que chaque projet « se pose » (transition *spatiale*, pas juste lumineuse) — et se marie avec le
Ken Burns existant qui prend le relais :

```css
/* css/styles.css — remplace la transition de .showcase__bg */
.showcase__bg {
  opacity: 0; transform: scale(1.045);
  transition: opacity var(--dur-slow) var(--ease-out), transform 1.1s var(--ease-expo);
}
.showcase__bg.is-active { opacity: 1; transform: scale(1); }
@media (prefers-reduced-motion: reduce) {
  .showcase__bg { transform: none; transition: opacity var(--dur-slow) ease; }
}
```
*Compatibilité Ken Burns : `animation` (`showcaseKenBurns`) écrase `transform` de transition une fois active —
séquencer en décalant le Ken Burns : `animation-delay: 1.1s` sur `.showcase__bg.is-active`, le zoom d'entrée
fait le pont.*

**Cascade du titre** : le split-letters existant (`--i` global, stagger) est bon. Un raffinement d'une ligne —
easing expo sur la montée des lettres :

```css
.showcase__letter { transition-timing-function: var(--ease-expo); }
```

### 3.4 Transitions inter-pages (accueil ↔ page projet)

Site multi-pages sans framework → deux options honnêtes :

- **Niveau 1 (gratuit, 5 lignes)** : fondu de sortie CSS sur les liens internes.
- **Niveau 2 (moderne, progressif)** : l'API **View Transitions** cross-document — deux lignes de CSS,
  ignorées par les navigateurs non compatibles (Chrome/Edge OK, dégradation propre ailleurs) :

```css
/* Transition de page native, sans JS. Fallback : navigation classique. */
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: vt-out .35s var(--ease-out) both; }
::view-transition-new(root) { animation: vt-in .5s var(--ease-expo) both; }
@keyframes vt-out { to { opacity: 0; transform: translateY(-12px); } }
@keyframes vt-in { from { opacity: 0; transform: translateY(18px); } }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
}
```

---

## 4. Guide des Micro-Interactions : Sublimer l'Expérience

### 4.1 Boutons & CTA

Déjà en place : effet **magnétique** lerpé (`Motion.magnetic`, borné à la hit-box — correct), lift
`translateY(-2px)` + assombrissement au hover. Deux ajouts dans le langage du site :

**a) Translation de texte au survol (text-swap)** — le label sort par le haut pendant que son double entre par
le bas. Réservé aux CTA primaires :

```html
<!-- remplace le texte nu des .btn-primary : -->
<span class="btn-swap"><span class="btn-swap__inner">
  <span>DÉMARRER UN PROJET</span><span aria-hidden="true">DÉMARRER UN PROJET</span>
</span></span>
```
```css
.btn-swap { display: inline-block; overflow: hidden; line-height: 1.1; }
.btn-swap__inner {
  display: flex; flex-direction: column;
  transition: transform var(--dur-med) var(--ease-expo);
}
.btn-primary:hover .btn-swap__inner { transform: translateY(-50%); }
@media (prefers-reduced-motion: reduce) { .btn-primary:hover .btn-swap__inner { transform: none; } }
```

**b) Soulignement animé des liens de nav** — origine gauche à l'entrée, sortie vers la droite (le trait
« traverse », il ne rebrousse pas) :

```css
.nav__link { position: relative; }
.nav__link::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -6px; height: 1px;
  background: var(--red); transform: scaleX(0); transform-origin: right;
  transition: transform var(--dur-base) var(--ease-out);
}
.nav__link:hover::after, .nav__link:focus-visible::after { transform: scaleX(1); transform-origin: left; }
```

**c) La flèche-cercle des `.btn-primary__arrow`** : remplissage fluide au hover —

```css
.btn-primary__arrow { transition: background var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-expo); }
.btn-primary:hover .btn-primary__arrow { background: #fff; color: var(--red); transform: rotate(45deg); }
```
*(la flèche ↗ pivote à 45° → pointe vers la droite : « on y va ». Détail, mais c'est le genre de détail qui se remarque.)*

### 4.2 Vignettes projets — Desktop

Déjà riche : dé-grisaillement progressif (`grayscale(55%)→0`), bord, rail rouge `scaleX`, grossissement lerpé
JS, prévisualisation du hero au survol. **Ne pas surcharger** — un seul ajout à considérer : le badge-curseur
(cf. 4.4), qui remplace avantageusement tout ce qu'on pourrait ajouter *dans* la vignette.

### 4.3 Vignettes projets — Mobile (tactile)

- Le site suit déjà la bonne doctrine (commentaire `styles.css` §services) : `:hover` cantonné à
  `@media (hover:hover)`, retour tactile via `:active`. Il manque juste ce retour sur les vignettes :

```css
/* Retour tactile immédiat : la vignette "s'enfonce" sous le doigt. Transition
   uniquement au retour (au press c'est instantané → zéro latence perçue). */
@media (hover: none) {
  .showcase__thumb:active { transform: scale(.96); transition: transform .08s ease; }
  .showcase__thumb:active .showcase__thumb-img { filter: grayscale(0%) brightness(1); }
}
```
*Nuance importante : en mode natif mobile les vignettes ne reçoivent **aucun** transform JS — ce `:active` ne
se bat donc avec personne. Ne pas l'activer en desktop où le JS pilote le scale.*

- **Tap highlight** : ajouter `-webkit-tap-highlight-color: transparent;` sur `body` (le flash gris système
  casse le noir profond), maintenant que chaque élément interactif a son propre état `:active`.
- **Retour haptique** (`navigator.vibrate(8)` au snap de la roulette) : possible, mais Safari iOS ne le
  supporte pas et l'effet Android est inégal — **déconseillé**, le gain ne vaut pas l'aléa.

### 4.4 Curseur personnalisé (optionnel — mais pertinent ici)

Pour un portfolio de DA, un curseur-badge contextuel (« VOIR ↗ » sur les vignettes) est le micro-détail le plus
rentable : il déplace l'affordance *sur le curseur lui-même*. Implémentation dans l'esprit `motion.js` (lerp,
boucle rAF partagée, pointeur fin uniquement, reduced-motion off) :

```html
<!-- index.html, avant </body> -->
<div class="cursor" id="cursor" aria-hidden="true"><span class="cursor__label" id="cursorLabel"></span></div>
```
```css
.cursor {
  position: fixed; top: 0; left: 0; z-index: 950; pointer-events: none;
  width: 10px; height: 10px; background: var(--red);
  transform: translate(-50%, -50%); opacity: 0;
  display: flex; align-items: center; justify-content: center;
  transition: width var(--dur-base) var(--ease-expo), height var(--dur-base) var(--ease-expo), opacity .2s ease;
  /* coins nets assumés : le badge est un carré, pas une bulle — cohérence charte */
}
.cursor.is-on { opacity: 1; }
.cursor.is-label { width: 74px; height: 74px; }
.cursor__label {
  font: 600 10px/1 var(--mono); letter-spacing: .14em; color: #fff;
  opacity: 0; transition: opacity .18s ease .08s;
}
.cursor.is-label .cursor__label { opacity: 1; }
@media (hover: none), (prefers-reduced-motion: reduce) { .cursor { display: none; } }
```
```js
// js/motion.js — nouvelle primitive, même IIFE (utilise raf + lerp existants)
function cursor() {
  if (REDUCE || !FINE) return;
  var el = document.getElementById('cursor');
  var label = document.getElementById('cursorLabel');
  if (!el) return;
  var tx = -100, ty = -100, cx = tx, cy = ty;
  document.addEventListener('mousemove', function (e) {
    tx = e.clientX; ty = e.clientY;
    el.classList.add('is-on');
  }, { passive: true });
  raf.add(function () {
    cx = lerp(cx, tx, 0.22); cy = lerp(cy, ty, 0.22);
    el.style.transform = 'translate(' + (cx - el.offsetWidth / 2).toFixed(1) + 'px,' + (cy - el.offsetHeight / 2).toFixed(1) + 'px)';
  });
  // [data-cursor="VOIR ↗"] sur n'importe quel élément → le badge s'étend avec ce texte
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest('[data-cursor]');
    if (t) { label.textContent = t.dataset.cursor; el.classList.add('is-label'); }
    else el.classList.remove('is-label');
  }, { passive: true });
}
// window.Motion.cursor = cursor;  puis Motion.cursor() dans initMotion()
```
```js
// js/main.js — renderShowcase() : poser l'attribut sur chaque vignette
thumb.setAttribute('data-cursor', 'VOIR ↗');
```
*Ne PAS masquer le curseur natif (`cursor:none`) : le badge accompagne, il ne remplace pas — masquer le vrai
curseur est le piège classique (latence perçue, accessibilité).* 👁 À valider au goût — c'est réversible en
retirant deux appels.

### 4.5 Détail « craft » déjà exemplaire (à citer, pas à refaire)

Les rangées Services : barre d'accent qui se déploie, numéro qui s'intensifie, **pictogramme qui se dessine**
(`stroke-dashoffset`), CTA qui n'apparaît qu'au hover en desktop mais entre dans la cascade de reveal en mobile
(seul moment d'interaction garanti au doigt). C'est le niveau de finition à répliquer partout ailleurs.

---

## 5. Audit UX, Ergonomie & Parcours Tactile

### 5.1 Navigation & menu mobile

- ✅ Burger 44×44, `aria-expanded`/`aria-controls`, barres → croix animées, panneau glass en fondu+translation.
- 🟡 **Entrée des liens du panneau non étagée** — le panneau apparaît d'un bloc. Cascade en 4 lignes :

```css
.nav__mobile-link { opacity: 0; transform: translateY(-8px); transition: opacity .3s var(--ease-out), transform .3s var(--ease-expo); }
.nav__mobile-panel.is-open .nav__mobile-link { opacity: 1; transform: none; }
.nav__mobile-panel.is-open .nav__mobile-link:nth-child(2) { transition-delay: 40ms; }
.nav__mobile-panel.is-open .nav__mobile-link:nth-child(3) { transition-delay: 80ms; }
.nav__mobile-panel.is-open .nav__mobile-link:nth-child(4) { transition-delay: 120ms; }
.nav__mobile-panel.is-open .nav__mobile-link:nth-child(5) { transition-delay: 160ms; }
```

- 🟡 Le panneau ne se ferme pas à `Escape` (à vérifier dans `initMobileNav()` — si absent, 3 lignes).

### 5.2 Accessibilité du showcase (reliquat de l'audit mobile du 2026-07-16, confirmé ✅)

1. **`aria-live` absent** : le hero change de projet en silence pour un lecteur d'écran.
   ```html
   <div class="showcase__content" id="showcaseContent" aria-live="polite" aria-atomic="true">
   ```
2. **Rôles de la roulette** : la bande n'expose aucune sémantique. Minimum viable sans réécrire le clavier :
   ```js
   // renderShowcase() :
   track.setAttribute('role', 'tablist'); track.setAttribute('aria-label', 'Projets');
   thumb.setAttribute('role', 'tab');
   // showDisplay() :
   thumbs.forEach(function (t, i) { t.setAttribute('aria-selected', String(i === idx)); });
   ```
3. **Le focus clavier ne prévisualise pas le hero** (seul `mouseenter` le fait) — symétriser :
   ```js
   // à côté des listeners mouseenter/mouseleave existants :
   t.addEventListener('focus', function () { showDisplay(i); });
   t.addEventListener('blur', function () { showDisplay(confirmedIdx); });
   ```
4. **Rotation d'écran desktop→mobile** : la roulette reste en mode lock figé (mode tranché une fois au load,
   limitation documentée). Le vrai re-init au franchissement du breakpoint est le correctif propre — chantier
   moyen (§6-T11), pas une rustine.

### 5.3 Formulaire de contact & conversion

- ✅ Formspree opérationnel, 3 issues gérées (succès / refus service / repli mailto), `role="status"` sur le
  statut. Solide.
- 🟡 Dette connue à solder (5 min) : `autocomplete` et liaison d'erreurs —
  ```html
  <input … name="name"  autocomplete="name">
  <input … name="email" autocomplete="email" inputmode="email">
  <!-- en cas d'erreur, en JS : -->  input.setAttribute('aria-invalid', 'true');
  ```
- 🟡 `.about__social-link` : 40×40 → passer à 44×44 (cible tactile).
- 👁 Le CTA nav « PRENDRE RDV » est masqué ≤900px (doublon assumé du panneau burger — documenté). OK, mais le
  bloc conversion en bas de page projet (`.pcta`) reste le seul CTA fort mobile : vérifier qu'il est bien
  au-dessus du footer *avant* le teaser « projet suivant » sur petit écran (c'est le cas dans `project-page.js`).

---

## 6. Plan de Route & Code Backlog (Prêt à Copier-Coller)

> Le code complet de chaque tâche est dans la section indiquée. Ordre = ordre d'exécution recommandé.

| # | Priorité | Type | Tâche | Où / code |
|---|---|---|---|---|
| T1 | **Critique** | Design visuel | Recouvrement texte/vignettes desktop ~1280px — `max-width: min(560px, calc(42% - 100px))` sur `.showcase__content` | §2.2-V1 |
| T2 | **Critique** | Technique | `hero_slideshow.mp4` 54 Mo → recompresser (cibles 6-10 Mo / 3-4 Mo mobile) + source par viewport | §1.3 |
| T3 | **Haute** | Technique | CLS polices : fallback `size-adjust` pour Bebas — `@font-face { font-family:'Bebas Fallback'; src:local('Arial Narrow'); size-adjust:82%; }` puis `--display:'Bebas Neue','Bebas Fallback',sans-serif` | §1.2 |
| T4 | **Haute** | Technique | Lazy-load des 12 fonds showcase (3 immédiats, 9 différés) | §1.3 |
| T5 | **Haute** | Micro-interaction | A11y showcase : `aria-live`, `role=tablist/tab`, `aria-selected`, focus→preview | §5.2 |
| T6 | **Haute** | Animation | Token `--ease-expo` + cross-fade spatial du hero (`scale 1.045→1`) + lettres en expo | §3.0, §3.3 |
| T7 | **Moyenne** | Animation | Rideau d'entrée typographique (1× par session, reduced-motion off) | §3.1 |
| T8 | **Moyenne** | Animation | Clip-path reveal du portrait About + galeries | §3.2 |
| T9 | **Moyenne** | Micro-interaction | Curseur-badge « VOIR ↗ » (desktop, sans `cursor:none`) | §4.4 |
| T10 | **Moyenne** | Micro-interaction | Text-swap CTA + soulignement nav + flèche-cercle 45° + `:active` tactile vignettes + tap-highlight | §4.1, §4.3 |
| T11 | **Moyenne** | Technique | Re-init du showcase au franchissement du breakpoint 900px (rotation d'écran) | §5.2-4 |
| T12 | **Basse** | Design visuel | Contraste `.showcase__thumb-num` .35→.55 ; grain SVG ; `clamp()` typographique ; cadence des paddings | §2.2 |
| T13 | **Basse** | Micro-interaction | Cascade des liens du panneau mobile + fermeture `Escape` | §5.1 |
| T14 | **Basse** | Animation | View Transitions API inter-pages (progressif) | §3.4 |
| T15 | **Basse** | UX | Formulaire : `autocomplete`/`aria-invalid` ; social links 44px | §5.3 |
| T16 | **Basse** | Technique | Avant merge : retirer `?v=dev3` ; `.vercelignore` += `assets/img/_originals/` + mp4 migrés YouTube ; purger `package-lock.json`, `.media-tag--dark` | §1.1, §1.3 |

### Garde-fous (issus des erreurs déjà commises et documentées sur CE projet)

1. **Jamais de transition CSS sur `transform`** des éléments pilotés par le lerp JS (vignettes, bande).
2. **Jamais de lecture de layout dans la boucle** de rendu (le `getBoundingClientRect` de `progressTarget()` est
   l'exception calculée : une lecture en tête de frame, layout déjà propre).
3. **`scrollLeft` ≠ `transform`** — ne pas retenter la substitution (régression du 2026-07-16).
4. Vérifier chaque changement visuel **sous Playwright** (l'onglet de preview fige rAF et transitions) et
   comparer les positions **à un cadre englobant**, pas une valeur isolée.
5. Chaque nouvelle animation : sortie `prefers-reduced-motion` + `transform`/`opacity` uniquement.
