/* ============================================================
   BASTIEN AGUS — Portfolio interactions
   ============================================================ */
(function () {
  'use strict';

  var EASE = 'cubic-bezier(.22,.61,.36,1)';
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function showAll(items) {
    items.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  function stripTags(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }

  // Miniature YouTube (maxres HD par défaut). Un projet avec un champ `youtube`
  // ET sans image personnalisée affiche cette miniature sur sa carte carrousel
  // + sa vignette « projet suivant ». Une image personnalisée (`image`, importée
  // via le CMS) est toujours prioritaire sur la miniature YouTube automatique.
  function ytThumb(id, kind) { return 'https://img.youtube.com/vi/' + id + '/' + (kind || 'maxresdefault') + '.jpg'; }
  function isYoutubeThumbUrl(url) { return /^https?:\/\/img\.youtube\.com\//.test(String(url || '')); }
  function cardImage(p) { return p.image || (p.youtube ? ytThumb(p.youtube) : ''); }

  /* ——— Build le showcase (fonds cross-fade + vignettes roulette) depuis js/projects.js ———
     Data-driven comme l'ancien carrousel : le compteur total et le nombre de vignettes
     dérivent de la liste. La sélection initiale (idx 0) est posée par initShowcase(). */
  function renderShowcase() {
    var stage = document.getElementById('showcaseStage');
    var track = document.getElementById('showcaseThumbs');
    var data = window.PROJECTS;
    if (!stage || !track || !data || !data.length) return;

    stage.insertAdjacentHTML('afterbegin', data.map(function (p, i) {
      var focal = p.focal || 'center';
      var yt = (p.youtube && isYoutubeThumbUrl(cardImage(p))) ? p.youtube : '';
      return '<div class="showcase__bg" data-showcase-bg data-idx="' + i + '" data-yt="' + yt + '" style="background-image:url(\'' + cardImage(p) + '\'); background-position:' + focal + '"></div>';
    }).join(''));

    track.innerHTML = data.map(function (p, i) {
      var num = String(i + 1).padStart(2, '0');
      var label = stripTags(p.client) + ' — ' + stripTags(p.title);
      var yt = (p.youtube && isYoutubeThumbUrl(cardImage(p))) ? p.youtube : '';
      return '' +
        '<button class="showcase__thumb" type="button" data-showcase-thumb data-idx="' + i + '" aria-label="Voir ' + label + '">' +
          '<div class="showcase__thumb-img" data-yt="' + yt + '" style="background-image:url(\'' + cardImage(p) + '\')"></div>' +
          '<div class="showcase__thumb-scrim"></div>' +
          '<div class="showcase__thumb-num">' + num + '</div>' +
          '<div class="showcase__thumb-rail"></div>' +
          '<div class="showcase__thumb-label">' + stripTags(p.client) + '</div>' +
        '</button>';
    }).join('');

    fixYtFallback(stage.querySelectorAll('[data-showcase-bg][data-yt]:not([data-yt=""])'));
    fixYtFallback(track.querySelectorAll('.showcase__thumb-img[data-yt]:not([data-yt=""])'));
  }

  /* ——— Fallback miniature YouTube (fonds background-image) ———
     maxresdefault n'existe pas pour toutes les vidéos (ex. ludeo → placeholder gris 120px
     renvoyé en succès HTTP). On bascule alors sur hqdefault (toujours dispo). */
  function fixYtFallback(els) {
    Array.prototype.forEach.call(els, function (el) {
      var hq = ytThumb(el.getAttribute('data-yt'), 'hqdefault');
      var m = /url\(['"]?(.*?)['"]?\)/.exec(el.style.backgroundImage || '');
      if (!m || !m[1]) return;
      var probe = new Image();
      probe.onload = function () { if (probe.naturalWidth <= 120) el.style.backgroundImage = "url('" + hq + "')"; };
      probe.onerror = function () { el.style.backgroundImage = "url('" + hq + "')"; };
      probe.src = m[1];
    });
  }

  /* ——— Scroll reveals (IntersectionObserver) ———
     Robuste face au carrousel sticky à hauteur dynamique — contrairement à un
     calcul de position de scroll, l'IO révèle chaque élément quand il entre.

     Élevé vers une finition "Don Molinico" :
     - directionnel/bidirectionnel : entrée mémorable au scroll-down, retrait
       élégant au scroll-up (toggle .is-in dans les deux sens, plus de unobserve) ;
     - split-text : les titres display portant [data-split] sont découpés mot par
       mot (masque + montée), délégué à window.Motion ;
     - l'état caché initial est posé PAR JS (pas en CSS) : si le JS échoue, le
       contenu reste visible (dégradation sûre, bon pour LCP/SEO) ;
     - reduced-motion : tout est révélé d'emblée, rien n'est masqué. */
  function initReveals() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    var M = window.Motion;

    function isSplit(el) { return el.hasAttribute('data-split'); }
    function revealSplit(el) { if (M) M.splitText(el); el.classList.add('is-split-in'); }

    if (REDUCE || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { if (isSplit(el)) revealSplit(el); });
      showAll(items.filter(function (el) { return !isSplit(el); }));
      return;
    }

    // État initial masqué, posé par JS (no-JS ⇒ contenu visible).
    items.forEach(function (el) {
      if (isSplit(el)) { M && M.splitText(el); return; } // le split porte son propre état initial
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.willChange = 'opacity, transform';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        var on = e.isIntersecting;
        var d = parseInt(el.dataset.d, 10) || 0;
        if (isSplit(el)) { el.classList.toggle('is-split-in', on); return; }
        el.style.transition = 'opacity .9s ' + EASE + ' ' + d + 'ms, transform .9s ' + EASE + ' ' + d + 'ms';
        el.style.opacity = on ? '1' : '0';
        el.style.transform = on ? 'none' : 'translateY(28px)';
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
    // Pas de failsafe "reveal-all" ici : contrairement à l'ancien modèle "once"
    // (unobserve au 1er passage), l'observateur reste attaché et bascule .is-in /
    // .is-split-in dans les DEUX sens — un éventuel "miss" se corrige de lui-même
    // au prochain changement d'intersection. Un reveal-all permanent figerait au
    // contraire les titres en état révélé et casserait le retrait au scroll-up.
  }

  /* ——— Nav : bandeau plein largeur au repos, split en 2 pilules (logo / burger)
     dès les tout premiers pixels de scroll. Seuil à 2px (pas 0) pour absorber le
     rubber-banding du scroll au tout point haut (trackpad/mobile) sans faire
     clignoter le split. ——— */
  function initNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    if (nav.hasAttribute('data-static')) return; // état final déjà figé dans le HTML (pages projet, pas de hero)
    var onScroll = function () {
      nav.classList.toggle('is-split', (window.scrollY || 0) > 2);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ——— Mobile nav (burger) ——— */
  function initMobileNav() {
    var burger = document.getElementById('navBurger');
    var panel = document.getElementById('navMobilePanel');
    if (!burger || !panel) return;

    var close = function () {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      panel.classList.remove('is-open');
    };
    var open = function () {
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fermer le menu');
      panel.classList.add('is-open');
    };

    burger.addEventListener('click', function () {
      var isOpen = burger.getAttribute('aria-expanded') === 'true';
      if (isOpen) close(); else open();
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    document.addEventListener('click', function (e) {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (!panel.contains(e.target) && !burger.contains(e.target)) close();
    });
  }

  /* ——— Services → formulaire : chaque bloc .svc est un vrai <a href="#contact">
     (jump natif + scroll-behavior:smooth déjà global) ; on se contente d'en profiter
     pour pré-sélectionner l'option correspondante du select #f-type. data-type
     correspond exactement au texte des <option> du select (pas de value= explicite
     dessus, donc option.value === texte).

     Feedback tactile (B) : sur tactile/mobile (pas de hover), le seul retour visuel
     possible est :active — mais il ne se déclenche de façon fiable sur iOS Safari
     que s'il existe un listener touchstart quelque part dans le document. Sur ces
     appareils on retarde aussi légèrement la navigation (~150ms) pour laisser le
     temps de voir le flash :active avant que la page saute vers #contact — sur
     desktop (hover:hover + pointer:fine) le survol a déjà montré l'état enrichi
     avant le clic, donc pas de délai ajouté là. ——— */
  function initServicesConnector() {
    var svcs = Array.prototype.slice.call(document.querySelectorAll('.svc[data-type]'));
    var select = document.getElementById('f-type');
    if (!svcs.length) return;

    var hasFinePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    if (!hasFinePointer) {
      document.addEventListener('touchstart', function () {}, { passive: true });
    }

    svcs.forEach(function (svc) {
      svc.addEventListener('click', function (e) {
        if (select) select.value = svc.dataset.type;
        if (hasFinePointer) return;
        e.preventDefault();
        setTimeout(function () {
          window.location.hash = 'contact';
        }, REDUCE ? 0 : 150);
      });
    });
  }

  /* ——— Services : reveal scroll bidirectionnel (cascade num→titre→texte→icône/cta),
     dédié à cette section — ne touche pas le système [data-reveal] global (once,
     utilisé ailleurs sur le site). Bascule .is-revealed dans les DEUX sens à chaque
     croisement du seuil (jamais de unobserve) : remonter rejoue le fondu en sens
     inverse, même principe que le reveal bidirectionnel déjà en place sur le
     carrousel (js/main.js applyCardEffects, dérivé de absDist en continu). ——— */
  function initServicesReveal() {
    var svcs = Array.prototype.slice.call(document.querySelectorAll('.svc'));
    if (!svcs.length) return;
    if (REDUCE || !('IntersectionObserver' in window)) {
      svcs.forEach(function (svc) { svc.classList.add('is-revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-revealed', entry.isIntersecting);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    svcs.forEach(function (svc) { io.observe(svc); });
  }

  /* ——— Contact form : POST JSON vers Formspree, fallback mailto si le fetch échoue totalement ———
     Mise en route (une seule fois, à faire par le propriétaire du site) :
       1. Créer un compte gratuit sur https://formspree.io (plan Free : 50 soumissions/mois).
       2. Créer un formulaire dans le dashboard Formspree, copier son ID (ou l'URL "endpoint" fournie),
          et remplacer YOUR_FORMSPREE_ID dans l'attribut action= du <form id="contactForm"> (index.html).
       3. Vérifier l'email de réception (Formspree envoie un mail de confirmation à la 1ère soumission
          test) pour que les demandes arrivent bien en boîte mail. */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    var status = document.getElementById('contactStatus');
    var submitBtn = document.getElementById('contactSubmit');
    if (!form || !status || !submitBtn) return;

    var fields = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    fields.forEach(function (f) {
      ['input', 'change'].forEach(function (evt) {
        f.addEventListener(evt, function () { f.classList.remove('is-invalid'); });
      });
    });

    function buildMailto(payload) {
      var subject = 'Nouvelle demande — ' + (payload.type || 'Projet');
      var body =
        'Nom / entreprise : ' + payload.name + '\n' +
        'Email : ' + payload.email + '\n' +
        'Type de projet : ' + payload.type + '\n\n' +
        payload.message;
      return 'mailto:abcreazion@gmail.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (f) {
        var valid = f.checkValidity();
        f.classList.toggle('is-invalid', !valid);
        if (!valid && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) {
        status.className = 'field__status is-error';
        status.textContent = 'Merci de vérifier les champs en rouge avant d’envoyer.';
        firstInvalid.focus();
        return;
      }

      var data = new FormData(form);
      var payload = {
        name: data.get('name'),
        email: data.get('email'),
        type: data.get('type'),
        message: data.get('message')
      };

      submitBtn.disabled = true;
      status.className = 'field__status is-pending';
      status.textContent = 'Envoi en cours…';

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (res.ok) {
            status.className = 'field__status is-success';
            status.textContent = 'Merci, votre demande a bien été envoyée — je vous réponds rapidement.';
            form.reset();
            submitBtn.disabled = false;
            return;
          }
          // Formspree a répondu mais refusé la demande (ID de formulaire invalide/placeholder,
          // quota atteint, filtre anti-spam…) — pas une panne réseau, donc pas de repli mailto ici.
          return res.json().catch(function () { return null; }).then(function (json) {
            var detail = (json && json.errors && json.errors.length)
              ? json.errors.map(function (er) { return er.message; }).join(' ')
              : 'Le service d’envoi a refusé la demande (formulaire pas encore configuré ?).';
            status.className = 'field__status is-error';
            status.textContent = detail + ' Vous pouvez réessayer ou écrire directement à abcreazion@gmail.com.';
            submitBtn.disabled = false;
          });
        })
        .catch(function () {
          // Échec réseau total (hors ligne, Formspree injoignable…) → repli sur mailto.
          status.className = 'field__status is-error';
          status.textContent = 'La connexion a échoué. Votre messagerie va s’ouvrir avec la demande pré-remplie — il ne reste qu’à l’envoyer.';
          window.location.href = buildMailto(payload);
          submitBtn.disabled = false;
        });
    });
  }

  /* ——— Hero video ——— */
  function initHeroVideo() {
    var video = document.getElementById('heroVideo');
    if (!video) return;
    // Respect prefers-reduced-motion: freeze on the poster frame instead of looping.
    if (REDUCE) { video.removeAttribute('autoplay'); video.pause(); }
  }

  /* ——— Hero ghost parallax ——— */
  function initParallax() {
    var ghost = document.getElementById('heroGhost');
    if (!ghost) return;
    var tick = function () {
      var y = window.scrollY || 0;
      ghost.style.transform = 'translate(-50%, calc(-50% + ' + (y * 0.12) + 'px))';
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ——— Showcase projets : hero plein cadre + cluster de vignettes « roulette » ———
     Deux modes tranchés une fois au chargement (comme l'ancien carrousel) :

     • DESKTOP hors reduced-motion → CAPTURE STICKY (`initLock`) : la section se fige
       (`.showcase.is-locked` → `.showcase__sticky` sticky), le scroll VERTICAL de la
       page pilote la roulette. Aucune rotation de carte (donc pas le défaut de
       l'ancien carrousel 3D) : seul un scale continu + un translate horizontal de la
       bande. Le hero change projet par projet (au franchissement du milieu), et le
       scroll s'aimante sur le projet le plus proche à l'arrêt.

     • MOBILE ou reduced-motion → NATIF (`initNative`) : pas de capture, scroll
       horizontal natif de la bande (overflow-x), hero confirmé à l'arrêt (debounce).
       Respecte l'interdit "pas de scroll-jack mobile" du CLAUDE.md + prefers-reduced-motion.

     Tout le scale (roulette + pic au survol) passe par UNE boucle rAF unique, en
     calcul mathématique pur (aucun getBoundingClientRect par vignette et par frame →
     plus de layout thrashing) et sans transition CSS sur `transform` (le lissage est
     fait en amont par lerp — une transition par-dessus retraînerait, cf. .card). */
  function initShowcase() {
    var outer = document.getElementById('showcaseOuter');
    var stage = document.getElementById('showcaseStage');
    var track = document.getElementById('showcaseThumbs');
    var content = document.getElementById('showcaseContent');
    var clientEl = document.getElementById('showcaseClient');
    var titleEl = document.getElementById('showcaseTitle');
    var leadEl = document.getElementById('showcaseLead');
    var metaEl = document.getElementById('showcaseMeta');
    var ctaEl = document.getElementById('showcaseCta');
    var counterEl = document.getElementById('showcaseCounter');
    var progressFill = document.getElementById('showcaseProgress');
    var hint = document.getElementById('showcaseHint');
    var prevBtn = document.getElementById('showcasePrev');
    var nextBtn = document.getElementById('showcaseNext');
    if (!outer || !stage || !track || !content) return;

    var data = window.PROJECTS || [];
    var n = data.length;
    if (!n) return;

    var bgs = Array.prototype.slice.call(stage.querySelectorAll('[data-showcase-bg]'));
    var thumbs = Array.prototype.slice.call(track.querySelectorAll('[data-showcase-thumb]'));

    var IS_MOBILE = !!(window.matchMedia && window.matchMedia('(max-width: 900px)').matches);
    var LOCK = !REDUCE && !IS_MOBILE;

    // Roulette : scale au pic (centre / survol) → plancher (loin). Delta doux pour
    // éviter tout chevauchement (le gap CSS de 22px absorbe le +14%) et rester fluide.
    var PEAK = 1.14, FLOOR = 0.90, RADIUS = 3;
    // Coefficients de lissage exprimés POUR UNE FRAME À 60Hz, puis convertis en
    // fonction du delta-time réel (voir `smooth`). Un lerp brut `v += (t-v)*k` est
    // lié à la cadence : à 120Hz il rattrape deux fois plus vite (animation trop
    // sèche sur écran rapide) et à chaque frame sautée il avance d'un à-coup —
    // c'est une des causes du rendu haché. La conversion rend la course identique
    // en temps réel quelle que soit la cadence (60, 120, 144Hz) ou les frames perdues.
    var PROG_LERP = 0.20;   // rattrapage de la position de bande (~120ms)
    var BOOST_LERP = 0.22;  // rattrapage du pic de survol
    function smooth(k, dt) { return 1 - Math.pow(1 - k, dt / 16.667); }

    // ——— Géométrie (mesurée une fois, recalculée au resize) ———
    // Tout ce qui coûte une lecture de layout est mesuré ICI et mis en cache : la
    // boucle de rendu ne doit lire aucune géométrie (cf. `renderFrame`).
    var thumbW = 0, gap = 0, step = 1, padSide = 0;
    var trackClientW = 0, trackMaxSL = 0;
    function measure() {
      if (!thumbs.length) return;
      thumbW = thumbs[0].offsetWidth || 128;
      var cs = window.getComputedStyle(track);
      gap = parseFloat(cs.columnGap || cs.gap) || 22;
      step = thumbW + gap;
      trackClientW = track.clientWidth;
      padSide = Math.max(0, (trackClientW - thumbW) / 2);
      track.style.paddingLeft = padSide + 'px';
      track.style.paddingRight = padSide + 'px';
      // après écriture du padding : la largeur scrollable a changé
      trackMaxSL = Math.max(0, track.scrollWidth - trackClientW);
    }

    // Split-letters SANS casser les mots : chaque mot est un conteneur inline-block
    // insécable (.showcase__word) → un retour à la ligne ne peut tomber qu'ENTRE deux
    // mots (nœud texte espace), jamais au milieu ("COLLECTIO"/"N"). Le compteur --i
    // reste global pour que la cascade balaye tout le titre de gauche à droite.
    function splitTitle(el, text) {
      var frag = document.createDocumentFragment();
      var words = String(text).split(' ');
      var i = 0;
      words.forEach(function (word, w) {
        var wordEl = document.createElement('span');
        wordEl.className = 'showcase__word';
        for (var c = 0; c < word.length; c++) {
          var span = document.createElement('span');
          span.className = 'showcase__letter';
          span.style.setProperty('--i', i++);
          span.textContent = word[c];
          wordEl.appendChild(span);
        }
        frag.appendChild(wordEl);
        if (w < words.length - 1) frag.appendChild(document.createTextNode(' '));
      });
      el.innerHTML = '';
      el.appendChild(frag);
    }

    // ——— Affichage du hero (cross-fade + cascade texte). Séparé de la sélection :
    //     le survol prévisualise sans toucher confirmedIdx. ———
    var displayIdx = -1;
    function showDisplay(idx) {
      if (idx === displayIdx) return;
      displayIdx = idx;
      var p = data[idx];

      bgs.forEach(function (bg, i) { bg.classList.toggle('is-active', i === idx); });
      thumbs.forEach(function (t, i) { t.classList.toggle('is-active', i === idx); });
      if (counterEl) counterEl.innerHTML = String(idx + 1).padStart(2, '0') + '<span>/ ' + String(n).padStart(2, '0') + '</span>';

      content.classList.remove('is-in');
      void content.offsetWidth; // reflow → rejoue la cascade même si is-in était déjà posé
      clientEl.textContent = p.client;
      splitTitle(titleEl, stripTags(p.title));
      if (leadEl) leadEl.textContent = p.intro || '';
      metaEl.textContent = (p.role || '') + (p.year ? ' · ' + p.year : '');
      ctaEl.href = p.url || (p.slug ? 'projet.html?p=' + p.slug : '#');
      requestAnimationFrame(function () { content.classList.add('is-in'); });
    }

    // ——— État partagé + boucle de rendu unique ———
    var confirmedIdx = 0;
    var hoveredIdx = null;
    var currentProgress = 0;     // position float de la bande (index centré)
    var boost = [];              // pic de survol courant par vignette
    var boostTarget = [];
    for (var b = 0; b < n; b++) { boost.push(0); boostTarget.push(0); }
    var rafId = null;

    // Cible de progression : dérivée du scroll page en lock, du scrollLeft en natif.
    // La lecture de rect reste volontairement ici : elle est faite UNE fois, tout en
    // haut de la frame, avant la moindre écriture — le layout vient d'être peint, elle
    // ne force donc aucun recalcul. La mettre en cache au chargement la figerait, et
    // tout décalage ultérieur de la page (polices, images) désynchroniserait la
    // roulette du scroll. Ce qu'il ne faut pas faire, c'est lire de la géométrie DANS
    // la boucle des vignettes, entre deux écritures (cf. § layout thrashing).
    function progressTarget() {
      if (LOCK) {
        var scrolled = Math.max(0, -outer.getBoundingClientRect().top);
        return Math.min(1, scrolled / lockScrollDist()) * (n - 1);
      }
      return track.scrollLeft / step;
    }

    // Mémo des dernières valeurs écrites : réécrire une propriété inchangée déclenche
    // quand même un recalcul de style. Avec 12 vignettes × 2 propriétés × 60 fps, ça
    // fait 1440 écritures/s dont l'immense majorité sont identiques.
    var lastScale = [], lastZ = [], lastProgW = -1, lastTx = null;
    for (var m = 0; m < n; m++) { lastScale.push(-1); lastZ.push(-1); }

    var prevTs = 0;
    function renderFrame(ts) {
      // dt borné à 50ms : après un onglet en arrière-plan ou un gros freeze, un dt
      // énorme ferait sauter l'animation d'un coup à la cible (effet de téléportation).
      var dt = prevTs ? Math.min(50, ts - prevTs) : 16.667;
      prevTs = ts;

      // 1) Lisse la position de bande + les pics de survol (indépendant de la cadence).
      var tgt = progressTarget();
      if (REDUCE) currentProgress = tgt;
      else {
        currentProgress += (tgt - currentProgress) * smooth(PROG_LERP, dt);
        if (Math.abs(tgt - currentProgress) < 0.0006) currentProgress = tgt;
      }
      var animating = Math.abs(tgt - currentProgress) > 0.0006;

      // 2) En lock, la bande est positionnée par JS pour centrer `currentProgress`.
      //    On la déplace en `transform` et non plus via `scrollLeft` : écrire scrollLeft
      //    à chaque frame est un scroll piloté sur le thread principal (repaint du
      //    conteneur à chaque frame), là où une translation est prise en charge par le
      //    compositor. `scrollLeft` est remis à 0 car le navigateur scrolle malgré tout
      //    un conteneur overflow:hidden quand une vignette reçoit le focus clavier —
      //    ce décalage parasite s'ajouterait à notre translation.
      //    En natif, c'est le scroll natif qui positionne la bande (on n'y touche pas).
      if (LOCK) {
        var maxTx = Math.max(0, trackMaxSL);
        var tx = padSide + currentProgress * step + thumbW / 2 - trackClientW / 2;
        tx = Math.max(0, Math.min(maxTx, tx));
        if (tx !== lastTx) {
          track.style.transform = 'translate3d(' + (-tx).toFixed(2) + 'px,0,0)';
          lastTx = tx;
        }
        track.scrollLeft = 0;
      }

      // 3) Scale de chaque vignette (calcul pur, zéro lecture de layout).
      for (var i = 0; i < n; i++) {
        if (Math.abs(boost[i] - boostTarget[i]) > 0.001) {
          boost[i] += (boostTarget[i] - boost[i]) * smooth(BOOST_LERP, dt);
          animating = true;
        } else { boost[i] = boostTarget[i]; }

        var dist = i - currentProgress;
        var a = Math.min(RADIUS, Math.abs(dist)) / RADIUS;
        var base = PEAK - a * (PEAK - FLOOR);
        var sc = +(base * (1 - boost[i]) + PEAK * boost[i]).toFixed(3);
        var z = Math.round(30 - Math.min(20, Math.abs(dist) * 4) + boost[i] * 40);
        var t = thumbs[i];
        if (sc !== lastScale[i]) { t.style.transform = 'scale(' + sc + ')'; lastScale[i] = sc; }
        if (z !== lastZ[i]) { t.style.zIndex = String(z); lastZ[i] = z; }
      }

      // 4) Barre de progression.
      if (progressFill) {
        var pw = n > 1 ? +(currentProgress / (n - 1)).toFixed(4) : 1;
        if (pw !== lastProgW) { progressFill.style.transform = 'scaleX(' + pw + ')'; lastProgW = pw; }
      }

      // 5) Hero. En lock : commit projet par projet (au franchissement du milieu),
      //    sauf pendant un survol qui prévisualise. En natif : géré au settle (debounce).
      if (LOCK && hoveredIdx === null) {
        var idxRound = Math.max(0, Math.min(n - 1, Math.round(currentProgress)));
        if (idxRound !== confirmedIdx) confirmedIdx = idxRound;
        showDisplay(confirmedIdx);
      }

      if (animating) rafId = requestAnimationFrame(renderFrame);
      else { rafId = null; prevTs = 0; }
    }
    function kick() { if (rafId == null) { prevTs = 0; rafId = requestAnimationFrame(renderFrame); } }

    // ——— Indice de scroll : masqué au 1er geste dans la section ———
    var hintDismissed = false;
    function dismissHint() {
      if (hintDismissed || !hint) return;
      hintDismissed = true;
      hint.classList.add('is-hidden');
    }
    if (hint) hint.querySelector('.showcase__hint-label').textContent = LOCK ? 'SCROLLER' : 'GLISSER';

    // ——— Survol (pointer fin) : pic de scale lerpé + prévisualisation hero ———
    var hasFinePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    thumbs.forEach(function (t, i) {
      if (hasFinePointer) {
        t.addEventListener('mouseenter', function () {
          hoveredIdx = i; boostTarget[i] = 1;
          showDisplay(i); kick();
        });
        t.addEventListener('mouseleave', function () {
          hoveredIdx = null; boostTarget[i] = 0;
          showDisplay(confirmedIdx); kick();
        });
      }
    });

    if (LOCK) initLock(); else initNative();

    // ============================ MODE LOCK (desktop) ============================
    function lockScrollDist() { return Math.max(1, (n - 1) * window.innerHeight * 0.5); }

    function initLock() {
      outer.classList.add('is-locked');

      var setHeight = function () {
        // Garde : si le viewport repasse sous 900px après un load desktop, le CSS
        // neutralise le sticky — on efface la hauteur inline pour ne pas laisser un
        // grand vide (même correctif que l'ancien carrousel).
        if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
          outer.style.height = '';
          return;
        }
        outer.style.height = (window.innerHeight + lockScrollDist()) + 'px';
      };
      measure();
      setHeight();

      window.addEventListener('scroll', function () { dismissHint(); kick(); }, { passive: true });
      window.addEventListener('resize', function () { measure(); setHeight(); kick(); });

      // Snap : aimante le scroll page sur le projet le plus proche à l'arrêt, mais
      // uniquement dans la zone épinglée (jamais pendant l'entrée/sortie de section).
      var isSnapping = false, snapTimer = null, releaseTimer = null;
      var outerTop = function () { return window.scrollY + outer.getBoundingClientRect().top; };
      var scrollYForIdx = function (idx) {
        idx = Math.max(0, Math.min(n - 1, idx));
        return outerTop() + (idx / (n - 1)) * lockScrollDist();
      };
      var snapTo = function (idx) {
        isSnapping = true;
        window.scrollTo({ top: scrollYForIdx(idx), behavior: REDUCE ? 'auto' : 'smooth' });
        window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(function () { isSnapping = false; }, REDUCE ? 60 : 650);
      };
      window.addEventListener('scroll', function () {
        if (isSnapping) return;
        window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(function () {
          if (isSnapping) return;
          var scrolled = -outer.getBoundingClientRect().top;
          var dist = lockScrollDist();
          if (scrolled <= 0 || scrolled >= dist) return;
          var idx = Math.round((scrolled / dist) * (n - 1));
          if (Math.abs(scrollYForIdx(idx) - window.scrollY) > 4) snapTo(idx);
        }, 140);
      }, { passive: true });

      // Clic vignette / flèches / clavier → déplacent le SCROLL PAGE (source de vérité
      // en lock), pour que roulette et hero restent synchronisés.
      thumbs.forEach(function (t, i) { t.addEventListener('click', function () { dismissHint(); snapTo(i); }); });
      if (prevBtn) prevBtn.addEventListener('click', function () { dismissHint(); snapTo(confirmedIdx - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { dismissHint(); snapTo(confirmedIdx + 1); });
      document.addEventListener('keydown', function (e) {
        var rect = stage.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); dismissHint(); snapTo(confirmedIdx + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); dismissHint(); snapTo(confirmedIdx - 1); }
      });

      currentProgress = progressTarget();
      showDisplay(Math.round(currentProgress));
      kick();
    }

    // ============================ MODE NATIF (mobile / reduced-motion) ============================
    function initNative() {
      measure();

      var settleTimer = null;
      var nearest = function () { return Math.max(0, Math.min(n - 1, Math.round(track.scrollLeft / step))); };
      var centerTo = function (idx, instant) {
        track.scrollTo({ left: Math.max(0, Math.min(n - 1, idx)) * step, behavior: (REDUCE || instant) ? 'auto' : 'smooth' });
      };

      track.addEventListener('scroll', function () {
        dismissHint(); kick();
        if (hoveredIdx !== null) return;
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(function () {
          confirmedIdx = nearest();
          showDisplay(confirmedIdx);
        }, 140);
      }, { passive: true });

      // Molette verticale → défilement horizontal (trackpad/swipe natifs déjà OK).
      track.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
        var atStart = track.scrollLeft <= 0;
        var atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
        if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }, { passive: false });

      var go = function (idx) {
        confirmedIdx = Math.max(0, Math.min(n - 1, idx));
        showDisplay(confirmedIdx);
        centerTo(confirmedIdx);
      };
      thumbs.forEach(function (t, i) { t.addEventListener('click', function () { dismissHint(); go(i); }); });
      if (prevBtn) prevBtn.addEventListener('click', function () { dismissHint(); go(confirmedIdx - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { dismissHint(); go(confirmedIdx + 1); });
      document.addEventListener('keydown', function (e) {
        var rect = stage.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); dismissHint(); go(confirmedIdx + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); dismissHint(); go(confirmedIdx - 1); }
      });

      // Swipe tactile sur la stage entière (avance/recule d'un projet).
      var tX = 0, tY = 0, tOn = false;
      stage.addEventListener('touchstart', function (e) {
        if (!e.touches[0]) return;
        tX = e.touches[0].clientX; tY = e.touches[0].clientY; tOn = true;
      }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        if (!tOn || !e.changedTouches[0]) return;
        tOn = false;
        var dx = e.changedTouches[0].clientX - tX;
        var dy = e.changedTouches[0].clientY - tY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) { dismissHint(); go(dx < 0 ? confirmedIdx + 1 : confirmedIdx - 1); }
      }, { passive: true });

      window.addEventListener('resize', function () { measure(); centerTo(confirmedIdx, true); kick(); });

      centerTo(0, true);
      showDisplay(0);
      kick();
    }
  }

  /* ——— Micro-interactions premium (curseur magnétique + parallax scrubbé) ———
     Additif, isolé dans window.Motion (js/motion.js). Ne touche jamais aux
     vignettes du showcase (leur scale roulette est piloté par initShowcase).
     Court-circuité sous reduced-motion / tactile directement dans les primitives. */
  function initMotion() {
    var M = window.Motion;
    if (!M) return;
    // Curseur magnétique : réservé aux CTA focaux + flèches du showcase.
    M.magnetic('.btn-primary, .nav__cta, .showcase__thumbs-btn', { strength: 0.3, ease: 0.16 });
    // Parallax scrubbé : uniquement les grands mots décoratifs de fond.
    M.parallax('.about__bgword, .services__bgword, .contact__bgword', { speed: 0.14 });
  }

  function init() {
    renderShowcase();
    initReveals();
    initNav();
    initMobileNav();
    initServicesConnector();
    initServicesReveal();
    initContactForm();
    initHeroVideo();
    initParallax();
    initShowcase();
    initMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
