# Refonte de la section « Travaux » — Showcase Hero-Select + Roulette

> Branche `carousel-redesign`. Ce document décrit la **refonte de la section projets**
> qui remplace l'ancien carrousel 3D scroll-lock par une **vitrine hero plein cadre +
> bande de vignettes « roulette »**. Il complète le `CLAUDE.md` racine (non modifié) —
> à fusionner dedans au moment du merge si la refonte est validée.
>
> ⚠️ **Avant merge** : retirer les cache-busters `?v=devN` sur les `<link>`/`<script>`
> d'`index.html` (voir § Cache-buster).

---

## 1. Ce qui a changé (en une phrase)

L'ancien **carrousel 3D scroll-lock** (cartes qui pivotent en `rotateY`, pilotées par le
scroll vertical) est remplacé par une section **« Salle de projection »** : une **grande
image hero** du projet sélectionné + un **cluster de vignettes en bas-droite** qui se
comporte comme une **roulette** (la vignette centrée grossit, les voisines rétrécissent).
Inspiration directe : la réf Dribbble *Globe Express* fournie par le client.

Le système reste **100 % data-driven** depuis `window.PROJECTS` (`js/projects.js`) — aucun
projet n'est codé en dur, rien à changer côté données.

---

## 2. Fichiers touchés

| Fichier | Changement |
|---|---|
| `index.html` | Bloc `#projets` réécrit : `.showcase` (outer) → `.showcase__sticky` → `.showcase__header` + `.showcase__stage` (fonds cross-fade, contenu bas-gauche, hint scroll, cluster vignettes, barre de progression). Cache-busters `?v=devN` ajoutés sur les assets (temporaire). |
| `css/styles.css` | Ancien bloc `.carousel-*`/`.card*` supprimé → nouveau bloc `.showcase*`. Fond section `--cream`. Règles `.showcase.is-locked` (capture sticky desktop) + fallback natif/mobile. |
| `js/main.js` | `renderProjects()`→`renderShowcase()`, `initCarousel()`→`initShowcase()` (réécriture complète : mode lock + mode natif, scale mathématique, hover boost lerpé). Sélecteur magnétique de `initMotion()` mis à jour (`.carousel-nav__btn`→`.showcase__thumbs-btn`). |
| `js/projects.js` | **Inchangé** (source de vérité des projets). |

---

## 3. Architecture d'interaction (le point clé)

Deux modes **tranchés une fois au chargement** (même philosophie que l'ancien
desktop/mobile), via `matchMedia` + `prefers-reduced-motion` :

### Mode LOCK — desktop, hors reduced-motion (`initLock`)
**Capture sticky** : `.showcase__sticky` se fige (`position: sticky; top:0; height:100vh`)
tant que la section occupe l'écran ; le **scroll vertical de la page** pilote la roulette,
projet par projet, avec **snap** (aimantage sur le projet le plus proche à l'arrêt).
- **Aucune rotation de carte** → on évite le défaut qui avait fait rejeter l'ancien
  carrousel 3D (cartes sur la tranche, incliquables). Ici uniquement `scale` + translation
  horizontale de la bande.
- La hauteur de l'outer = `100vh + (N-1)·100vh·STEP_VH` ; le hero change au **franchissement
  du milieu** de chaque projet (commit projet par projet, pas de scrub continu).
- Clic vignette / flèches / clavier → déplacent le **scroll page** (source de vérité) via
  `snapTo`, pour que roulette et hero restent synchronisés.

### Mode NATIF — mobile OU reduced-motion (`initNative`)
Pas de capture : la bande de vignettes est en **scroll horizontal natif** (`overflow-x`),
le hero est confirmé **à l'arrêt** (debounce 140 ms). Molette verticale redirigée en
horizontal quand le curseur est sur la bande.
- Respecte l'**interdit « pas de scroll-jack mobile »** du `CLAUDE.md` et la règle
  `prefers-reduced-motion` du skill UI/UX (capture désactivée = aucun risque de nausée).

---

## 4. Techniques utilisées

- **Scale « roulette » en calcul mathématique pur** — le grossissement de chaque vignette
  est dérivé de `distance = index − positionCourante`, sans **aucun** `getBoundingClientRect`
  par frame. L'ancienne version lisait 12 rects/frame = *layout thrashing* → c'était **la**
  cause du jank signalé. Formule : `scale = PEAK − (min(RADIUS,|dist|)/RADIUS)·(PEAK−FLOOR)`.
- **Une seule boucle `requestAnimationFrame`** partagée : lisse à la fois la position de la
  bande (`currentProgress` en lerp vers la cible) et le **pic de survol** (`boost[]` lerpé).
  La boucle s'arrête quand tout est stabilisé, se relance sur scroll/hover.
- **Zéro transition CSS sur `transform`** des vignettes — le lissage est fait **en amont**
  par le lerp JS. Une transition CSS par-dessus une valeur déjà mise à jour chaque frame
  retraînerait (~effet « poisseux » déjà documenté sur `.card` et sur le retrait de Lenis).
- **Hover boost lerpé** (au lieu d'un `scale(PEAK)` sec) : le survol pousse `boostTarget=1`,
  la boucle interpole → le grossissement au survol est aussi doux que celui de la roulette.
  Le survol **prévisualise** aussi le hero (image + texte) sans modifier la sélection confirmée.
- **Cross-fade du hero** par `opacity` (une `div` de fond par projet, superposées) +
  **Ken Burns** en `@keyframes` CSS pur (compositor, gratuit, coupé sous reduced-motion).
- **Split-letters par mot** (voir § 5) pour l'entrée du titre.
- **Snap** anti-boucle (`isSnapping` + `releaseTimer`), repris tel quel de l'ancien
  snap-to-card desktop (verrou éprouvé).
- **Padding horizontal dynamique** de la bande = `(largeur − vignette)/2` : sans lui, la 1re
  et la dernière vignette ne pourraient jamais atteindre le centre (ancrage centre).

---

## 5. Le bug de titre (capture fournie par le client) — corrigé

**Symptôme** : « SHOOTING DE COLLECTIO » puis « N » seul à la ligne — le mot `COLLECTION`
était coupé en plein milieu.

**Cause** : chaque lettre du titre est un `display:inline-block` indépendant. Le navigateur
peut insérer un retour à la ligne **entre n'importe quelles deux lettres** (chaque
inline-block est une boîte inline atomique avec une opportunité de coupure entre elles).

**Correctif** (`splitTitle` dans `js/main.js` + `.showcase__word` dans `css/styles.css`) :
on groupe les lettres **par mot** dans un conteneur `.showcase__word { display:inline-block;
white-space:nowrap }`. Un mot devient insécable ; la coupure ne peut tomber qu'**entre**
deux mots (nœud texte espace). Le compteur `--i` de la cascade reste global (le balayage
gauche→droite du titre est préservé). Vérifié : `CLIP D'HAKAI ALLUMER` casse en
`CLIP / D'HAKAI / ALLUMER`, jamais au milieu d'un mot.

---

## 6. Contenu texte du hero

Par projet, le hero affiche : **client** (eyebrow rouge) → **titre** (Bebas, split-letters)
→ **accroche** (`intro`, clampée 2 lignes — réutilise la copie premium déjà écrite pour le
SEO) → **méta** (`rôle · année`, mono discrète) → **CTA** « VOIR LE PROJET ». La cascade
d'entrée est échelonnée (client .08s → titre → lead .16s → méta .24s → CTA .32s).
Sur mobile, l'accroche est masquée (hero court) — elle reste sur la page projet.

---

## 7. Design / cohérence charte

- **Fond section `--cream`** (blanc cassé) : rupture éditoriale hero(dark) → showcase(clair)
  → about(dark). La stage sombre devient une « fenêtre » cadrée (liseré + ombre) qui claque.
- **Contraste AA** : l'eyebrow du header passe en `--red-text-on-cream` (#c40427) — `--red-text`
  (#ff3b5c) tombe à 2.98:1 sur crème et échoue l'AA.
- Coins nets partout, rouge `--red`/`--red-text`, Bebas Neue (titres), JetBrains Mono
  (labels/compteur), rail rouge sous la vignette active (convention `.card__bar` reprise).
- **Anti-chevauchement** : `gap` 22px + `PEAK` 1.14 → une vignette agrandie déborde de ~9px
  par côté, absorbés par le gap. `transform-origin: bottom center` (grandit vers le haut).

---

## 8. Paramètres réglables (tuning rapide)

Tous dans `initShowcase` (`js/main.js`) :

| Constante | Valeur | Rôle |
|---|---|---|
| `STEP_VH` (dans `lockScrollDist`) | `0.5` | Longueur de scroll par projet en mode lock. ↓ = section plus courte / plus rapide. |
| `PEAK` | `1.14` | Scale de la vignette centrée / survolée. |
| `FLOOR` | `0.90` | Scale des vignettes éloignées. |
| `RADIUS` | `3` | Nombre de vignettes avant d'atteindre `FLOOR`. |
| `PROG_LERP` | `0.20` | Nervosité du déplacement de bande (~120 ms). |
| `BOOST_LERP` | `0.22` | Vitesse du pic de survol. |

---

## 9. Cache-buster `?v=devN` (à retirer avant merge)

`index.html` charge `styles.css?v=dev3` / `main.js?v=dev3` etc. **Raison** : le serveur
Python (`http.server`) n'envoie pas de `Cache-Control`, et le navigateur de preview met en
cache les assets **par URL** — même un port neuf ne suffit pas à forcer le rechargement.
Le seul moyen fiable de voir ses modifs était d'incrémenter `devN` à chaque édition.
**Ce n'est pas nécessaire en production** (les vrais visiteurs chargent les fichiers frais
au 1er accès). → Retirer les `?v=devN`, ou les remplacer par un `?v=N` propre versionné
volontairement si on veut garder un cache-buster légitime.

---

## 10. Ce qui reste à valider « en vrai »

L'onglet de preview de l'assistant tourne **en arrière-plan** (`document.hidden`), ce qui
**met `requestAnimationFrame` en pause** → toute l'animation pilotée par rAF (scale roulette,
hover boost, position de bande) **est invisible et non testable depuis l'assistant**. Ont été
validés : structure DOM, build des 12 fonds/vignettes, détection du mode lock, hauteur sticky,
fond cream + contrastes, contenu hero + accroche, non-coupure des titres, fallback mobile/natif,
console sans erreur. **À juger par l'humain sur un navigateur réel** : fluidité du scroll-roulette,
vitesse et douceur du snap, ressenti du pic de scale, du hover et du cross-fade.

---

## 11. Recommandations / pistes UX à explorer

Priorisées. Les 🟢 sont des gains rapides, les 🟡 plus ambitieux.

### Accessibilité & robustesse
- 🟢 **`aria-live` sur le hero** : quand le projet change, annoncer le nouveau titre à un
  lecteur d'écran (le hero mute visuellement sans notification pour l'instant).
- 🟢 **`role`/`aria` de la roulette** : exposer la bande comme un groupe navigable
  (`role="tablist"` / `aria-selected` sur la vignette active), et rendre le CTA « VOIR LE
  PROJET » toujours atteignable au clavier même en mode lock.
- 🟢 **Focus visible** sur la vignette centrée pendant la navigation clavier (déjà
  `:focus-visible`, mais vérifier qu'il suit bien le `confirmedIdx`).
- 🟡 **Barre de progression cliquable** (scrubber) : permettre de sauter à un projet en
  cliquant/glissant sur `.showcase__progress` (raccourci pour 12 projets).

### Motion & finition premium
- 🟢 **Parallax léger de l'image hero** au scroll (translate interne ±2 %) pour donner de la
  profondeur sans Ken Burns permanent — respecter reduced-motion.
- 🟢 **Micro-délai de « peek »** : laisser dépasser légèrement la vignette suivante/précédente
  hors du cadre pour signaler qu'il y en a d'autres (affordance de défilement).
- 🟡 **Transition partagée vignette → hero** (shared-element) : au changement, faire « monter »
  la vignette active vers le hero plutôt qu'un simple cross-fade — très premium, plus coûteux.
- 🟡 **Spring physics** sur le snap (au lieu du lerp linéaire) pour un arrêt plus organique
  (skill UI/UX : `spring-physics` > cubic-bezier pour le ressenti naturel).

### Contenu & conversion
- 🟢 **Chiffres-clés** : réafficher les `stats` du projet (ex. « 465K vues ») en surimpression
  discrète sur le hero — elles existent dans `js/projects.js` et sont actuellement inutilisées
  par le showcase.
- 🟢 **Filtre par prestation** (Direction artistique / Vidéo / Photo…) au-dessus de la roulette,
  pour aider un prospect à trouver le type de travail qui le concerne.
- 🟡 **Autoplay doux** (avance toutes ~6 s, pause au survol/focus/`prefers-reduced-motion`) —
  à tester : peut aider la découverte, mais risque de distraire ; à valider en usage réel.

### Performance & technique
- 🟢 **Lazy-load des fonds** : les 12 images hero sont toutes en `background-image` d'emblée.
  Charger en priorité les 2-3 premières, différer le reste (skill : `lazy-load-below-fold`).
- 🟢 **`content-visibility: auto`** sur la section pour alléger le rendu hors écran.
- 🟡 **Re-init au franchissement du breakpoint 900px** : aujourd'hui le mode (lock/natif) est
  décidé une fois au load (limitation connue, comme l'ancien carrousel). Un vrai re-init au
  resize améliorerait le cas « rotation d'écran / fenêtre redimensionnée ».

---

## 12. Points de vigilance pour la prochaine session

- Ne pas réintroduire de `getBoundingClientRect` par frame dans la boucle de scale.
- Ne pas ajouter de transition CSS sur `transform` des `.showcase__thumb` (le lerp JS s'en charge).
- Garder le cloisonnement **lock (desktop) / natif (mobile + reduced-motion)** décidé une fois.
- La capture sticky ne doit **jamais** s'activer en mobile (garde CSS `.showcase.is-locked` sous
  900px + garde JS qui efface la hauteur inline — sinon « grand vide » sous la section, bug déjà
  connu de l'ancien carrousel).
- Penser à re-synchroniser ce doc dans le `CLAUDE.md` racine au merge, et à supprimer `?v=devN`.
