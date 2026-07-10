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

  /* ——— Build the project cards from js/projects.js ———
     Cards are data-driven: the peek "projet suivant" thumbnail, the last-card
     "retour début", and the counter total all derive from the list length. */
  function renderProjects() {
    var track = document.getElementById('carouselTrack');
    var data = window.PROJECTS;
    if (!track || !data || !data.length) return;
    var n = data.length;

    track.innerHTML = data.map(function (p, i) {
      var next = data[(i + 1) % n];
      var last = i === n - 1;
      var href = p.url || (p.slug ? 'projet.html?p=' + p.slug : '#');

      var cardLabel = stripTags(p.client) + ' — ' + stripTags(p.title);

      var statsHtml = (p.stats && p.stats.length)
        ? '<div class="card__stats">' + p.stats.map(function (s, si) {
            var gap = si < p.stats.length - 1 ? ' card__stat-label--gap' : '';
            return '<div class="card__stat-num">' + s[0] + '</div>' +
                   '<div class="card__stat-label' + gap + '">' + s[1] + '</div>';
          }).join('') + '</div>'
        : '';

      var focal = p.focal || 'center';

      return '' +
        '<a data-card href="' + href + '" class="card">' +
          '<div class="card__frame">' +
            '<div class="card__media" data-media>' +
              '<div class="card__media-shift" data-media-shift>' +
                '<img class="card__media-img" data-media-img src="' + cardImage(p) + '"' + (p.youtube && isYoutubeThumbUrl(cardImage(p)) ? ' data-hqfallback="' + ytThumb(p.youtube, 'hqdefault') + '"' : '') + ' alt="' + cardLabel + '" loading="lazy" style="object-position:' + focal + '">' +
              '</div>' +
            '</div>' +
            '<div class="card__scrim-b"></div>' +
            '<div class="card__scrim-l"></div>' +
            '<div class="card__watermark">' +
              '<div class="card__watermark-main">' + p.watermark + '</div>' +
              '<div class="card__watermark-script">' + p.watermarkScript + '</div>' +
            '</div>' +
            statsHtml +
            '<div class="card__meta">' +
              '<div class="card__client">' + p.client + '</div>' +
              '<div class="card__title">' + p.title + '</div>' +
              '<div class="card__bar" data-bar></div>' +
            '</div>' +
            '<div class="card__peek" data-peek aria-hidden="true">' +
              '<div class="card__peek-inner">' +
                '<div class="card__peek-thumb"' + (next.youtube && isYoutubeThumbUrl(cardImage(next)) ? ' data-hqfallback="' + ytThumb(next.youtube, 'hqdefault') + '"' : '') + ' style="background-image:url(\'' + cardImage(next) + '\')"></div>' +
                '<div class="card__peek-label">' + (last ? 'RETOUR DÉBUT' : 'PROJET SUIVANT') + ' <span>↗</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</a>';
    }).join('');

    var countEl = document.getElementById('carouselCount');
    if (countEl) countEl.textContent = '01 / ' + String(n).padStart(2, '0');

    fixYtThumbs(track);
  }

  /* ——— Fallback miniatures YouTube ———
     maxresdefault n'existe pas pour toutes les vidéos (ex. ludeo → placeholder gris 120px
     renvoyé en succès HTTP). On bascule alors sur hqdefault (toujours dispo). Gère à la fois
     les <img> (cartes) et les fonds background-image (vignettes « projet suivant »). */
  function fixYtThumbs(root) {
    // <img> des cartes
    Array.prototype.forEach.call(root.querySelectorAll('.card__media-img[data-hqfallback]'), function (img) {
      var hq = img.getAttribute('data-hqfallback');
      function swap() { if (img.naturalWidth && img.naturalWidth <= 120) img.src = hq; }
      img.addEventListener('error', function () { img.src = hq; }, { once: true });
      if (img.complete) swap(); else img.addEventListener('load', swap, { once: true });
    });
    // fonds background-image des vignettes peek
    Array.prototype.forEach.call(root.querySelectorAll('.card__peek-thumb[data-hqfallback]'), function (el) {
      var hq = el.getAttribute('data-hqfallback');
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
      return 'mailto:contact@bastienagus.com' +
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
            status.textContent = detail + ' Vous pouvez réessayer ou écrire directement à contact@bastienagus.com.';
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

  /* ——— Carrousel projets : 3D scroll-lock sur desktop, scroll horizontal natif
     + snap sur mobile. Le scroll-jack (transform piloté par le scroll vertical de
     la page) est illisible et quasi non-cliquable au tactile — testé en conditions
     réelles (retours utilisateur), donc pas de patch cosmétique : le mobile utilise
     un vrai <div overflow-x:auto scroll-snap> où les cartes ne sont jamais
     transformées par JS et restent des liens natifs pleinement cliquables. Les
     effets ci-dessous (parallax/Ken Burns/mise au point/reveal) ne touchent JAMAIS
     .card lui-même (le <a> cliquable) — uniquement ses enfants internes
     (.card__media-shift, .card__media-img), sur les deux breakpoints. ——— */
  function initCarousel() {
    var outer = document.getElementById('carouselOuter');
    var track = document.getElementById('carouselTrack');
    var stage = outer && outer.querySelector('.carousel-stage');
    var progress = document.getElementById('carouselProgress');
    var counter = document.getElementById('carouselCount');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    if (!outer || !track || !stage) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll('[data-card]'));
    var total = cards.length;
    if (!total) return;

    // Navigation intra-carrousel (amener une carte au centre). Réassignée par
    // initDesktop/initMobile car chacun a sa propre mécanique de scroll (scroll de
    // fenêtre vs scroll horizontal du stage). Le peek s'en sert pour avancer d'une
    // carte plutôt que d'ouvrir une page projet.
    var goToCard = function () {};

    // La carte entière est un <a> vers sa page projet. Le peek « PROJET SUIVANT »
    // n'ouvre PAS cette page : il fait AVANCER le carrousel d'une carte (comme la
    // flèche →), pour amener le projet suivant au centre, là où il devient facilement
    // cliquable. C'est ce qui rend les cartes du milieu accessibles : en scroll libre,
    // seules la 1re (haut) et la dernière (bas) se posent naturellement au centre ;
    // avancer carte par carte recentre proprement chaque projet.
    // preventDefault coupe la navigation par défaut du <a> parent, stopPropagation
    // évite tout autre handler. Le reste de la carte reste le lien vers sa page.
    cards.forEach(function (card, i) {
      var peek = card.querySelector('[data-peek]');
      if (!peek) return;
      peek.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToCard((i + 1) % total); // wrap : la dernière (« RETOUR DÉBUT ») revient à la 1re
      });
    });

    var GAP = 40;
    var getCardW = function () { return cards[0] ? cards[0].offsetWidth : 760; };

    // Un seul scroll listener qui déclenche potentiellement plusieurs fois par
    // frame native : on ne garde que le dernier appel par frame (rAF), le calcul
    // réel ne tourne jamais plus d'une fois par 16ms. Aucune dépendance, même
    // principe que Lenis/GSAP visaient mais sans intercepter le scroll lui-même.
    function rafThrottle(fn) {
      var scheduled = false;
      return function () {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () { scheduled = false; fn(); });
      };
    }

    // Seuil sous lequel une carte est considérée "au centre" : révèle son texte
    // (client/titre/stats/barre, via la classe .is-focused) et déclenche le zoom
    // Ken Burns. Volontairement plus large que le seuil du peek (0.35) — sinon les
    // voisines immédiates (absDist ~1.11 au repos) n'auraient jamais leur texte.
    var FOCUS_THRESHOLD = 0.5;

    /* Applique aux enfants internes d'une carte (jamais à .card) :
       - reveal bidirectionnel du texte (classe .is-focused, réversible par construction
         puisque dérivée de dist/absDist — remonter rejoue juste l'autre sens)
       - parallax interne à l'image (translate proportionnel à dist, indépendant
         de la rotation/scale de la carte parente)
       - mise au point : flou + désaturation croissants avec absDist (Concept 2)
       - zoom Ken Burns (classe .is-kenburns) uniquement sur la carte focalisée —
         piloté par une @keyframes CSS, pas par du JS à chaque tick (gratuit,
         compositor-only, continue même si le scroll s'arrête pendant qu'on dwell) */
    function applyCardEffects(card, dist, absDist) {
      var focused = absDist < FOCUS_THRESHOLD;
      card.classList.toggle('is-focused', focused);

      var shift = card.querySelector('[data-media-shift]');
      if (shift) {
        var panX = Math.max(-26, Math.min(26, dist * -22));
        var panY = Math.min(14, absDist * 6);
        var t = 'scale(1.1) translate(' + panX.toFixed(1) + 'px,' + panY.toFixed(1) + 'px)';
        shift.style.transform = t;
        if (!REDUCE) {
          var blur = Math.min(6, absDist * 4.5);
          var gray = Math.min(70, absDist * 46);
          shift.style.filter = 'blur(' + blur.toFixed(2) + 'px) grayscale(' + gray.toFixed(0) + '%)';
        }
      }

      var img = card.querySelector('[data-media-img]');
      if (img && !REDUCE) img.classList.toggle('is-kenburns', focused);

      var peek = card.querySelector('[data-peek]');
      if (peek) {
        if (absDist < 0.35) {
          peek.style.opacity = '1';
          peek.style.transform = 'translateY(0)';
        } else {
          peek.style.opacity = '0';
          peek.style.transform = 'translateY(8px)';
        }
      }
    }

    if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
      initMobile();
    } else {
      initDesktop();
    }

    function initMobile() {
      var getStep = function () { return getCardW() + GAP; };
      var getIdx = function () { return Math.round(stage.scrollLeft / getStep()); };

      var update = function () {
        var max = Math.max(1, stage.scrollWidth - stage.clientWidth);
        var pct = Math.min(1, stage.scrollLeft / max);
        if (progress) progress.style.width = (((pct * (total - 1)) + 1) / total * 100) + '%';
        if (counter) {
          var idx = Math.min(total, getIdx() + 1);
          counter.textContent = String(idx).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
        }

        var cardW = getCardW();
        var stageCenterX = stage.clientWidth / 2;
        cards.forEach(function (card, i) {
          var cardLeft = i * getStep() - stage.scrollLeft;
          var cardCenter = cardLeft + cardW / 2;
          var dist = (cardCenter - stageCenterX) / stageCenterX;
          applyCardEffects(card, dist, Math.abs(dist));
        });
      };
      stage.addEventListener('scroll', rafThrottle(update), { passive: true });
      update();

      var goTo = function (idx) {
        idx = Math.max(0, Math.min(total - 1, idx));
        stage.scrollTo({ left: idx * getStep(), behavior: REDUCE ? 'auto' : 'smooth' });
      };
      goToCard = goTo; // le peek avance d'une carte (cf. handler plus haut)
      if (prevBtn) prevBtn.addEventListener('click', function () { goTo(getIdx() - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { goTo(getIdx() + 1); });
    }

    function initDesktop() {
      var getMaxScroll = function () {
        var cardW = getCardW();
        var trackW = (cardW + GAP) * total - GAP;
        var viewW = window.innerWidth;
        var padLeft = (viewW - cardW) / 2; // center first card
        return Math.max(0, trackW - viewW + padLeft * 2);
      };

      // The cards travel getMaxScroll() px horizontally, but we only spend a
      // fraction of that as vertical scroll so the section isn't a long slog.
      var SCROLL_FACTOR = 0.55;
      var getScrollDist = function () { return Math.max(1, getMaxScroll() * SCROLL_FACTOR); };

      var setHeight = function () {
        // Si le viewport descend sous le breakpoint mobile APRÈS un chargement desktop
        // (redimensionnement de fenêtre, rotation d'écran, preview qui se rétrécit), le CSS
        // bascule le carrousel en mode natif (`.carousel-sticky` statique) : il faut alors
        // EFFACER la hauteur desktop, sinon elle reste collée sous un carrousel court et crée
        // un grand vide avant la section « à propos ». (Le mode/scroll-lock lui-même n'est pas
        // recalculé — limitation connue et acceptée — mais au moins plus de trou visuel.)
        if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
          outer.style.height = '';
          return;
        }
        outer.style.height = (window.innerHeight + getScrollDist()) + 'px';
      };
      setHeight();
      window.addEventListener('resize', setHeight);

      var updateCarousel = function () {
        var rect = outer.getBoundingClientRect();
        var scrolled = Math.max(0, -rect.top);
        var travel = Math.max(1, getMaxScroll());
        var pct = Math.min(1, scrolled / getScrollDist());
        var cardW = getCardW();
        var centerX = window.innerWidth / 2;

        track.style.transform = 'translateX(' + (-pct * travel) + 'px)';

        cards.forEach(function (card, i) {
          var cardLeft = (cardW + GAP) * i - (pct * travel) + (window.innerWidth - cardW) / 2;
          var cardCenter = cardLeft + cardW / 2;
          var dist = (cardCenter - centerX) / centerX; // dépasse largement ±1 pour les cartes loin du centre (6 cartes de 760px+)
          var absDist = Math.abs(dist);

          // Rotation plafonnée : sans borne, les cartes les plus excentrées atteignaient ~-77 à -90deg
          // (mesuré), donc quasi sur la tranche à l'écran → zone cliquable réduite à un fil, de fait
          // impossible à viser malgré un hit-test techniquement correct.
          var rotY = Math.max(-22, Math.min(22, dist * -18));
          var scale = 1 - absDist * 0.08;
          var opacity = 1 - absDist * 0.35;
          var tz = -absDist * 80;

          card.style.transform = 'perspective(1200px) rotateY(' + rotY + 'deg) scale(' +
            Math.max(0.85, scale) + ') translateZ(' + tz + 'px)';
          card.style.opacity = Math.max(0.5, opacity);

          applyCardEffects(card, dist, absDist);
        });

        if (progress) {
          progress.style.width = (((pct * (total - 1)) + 1) / total * 100) + '%';
        }
        if (counter) {
          var idx = Math.min(total, Math.round(pct * (total - 1)) + 1);
          counter.textContent = String(idx).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
        }
      };

      window.addEventListener('scroll', rafThrottle(updateCarousel), { passive: true });
      updateCarousel();

      // ——— Snap-to-card (desktop uniquement) ———
      // Le carrousel desktop est en scroll libre (scroll vertical de page → position
      // horizontale des cartes). S'arrêter entre deux cartes laisse une carte à moitié
      // pivotée, difficile à cliquer (retour utilisateur). On "aimante" donc la carte la
      // plus proche au centre dès que le scroll s'immobilise — MAIS uniquement dans la
      // zone épinglée du carrousel (scrolled strictement entre 0 et getScrollDist), jamais
      // pendant l'entrée depuis le hero ni la sortie vers À propos, pour ne pas piéger le
      // scroll de page. Ce n'est PAS un smooth-scroll global (Lenis) ni un scroll-jack en
      // continu : c'est un recentrage ponctuel déclenché seulement à l'arrêt du scroll.
      // Le mobile a déjà son propre snap natif (scroll-snap-type:x mandatory en CSS).
      var isSnapping = false;   // verrou : coupe l'auto-snap pendant un scroll programmatique
      var snapTimer = null;     // debounce du "scroll arrêté"
      var releaseTimer = null;  // relâche isSnapping une fois le scroll programmatique posé

      var getOuterTop = function () {
        return window.scrollY + outer.getBoundingClientRect().top;
      };

      var snapScrollTo = function (top) {
        isSnapping = true;
        window.scrollTo({ top: top, behavior: REDUCE ? 'auto' : 'smooth' });
        window.clearTimeout(releaseTimer);
        // 700ms couvre la durée d'un smooth scroll. Même si c'était trop court, la
        // prochaine évaluation trouverait delta<4 et ne ferait rien → aucune boucle possible.
        releaseTimer = window.setTimeout(function () { isSnapping = false; }, REDUCE ? 60 : 700);
      };

      var scrollToCard = function (idx) {
        var targetPct = Math.max(0, Math.min(1, idx / (total - 1)));
        snapScrollTo(getOuterTop() + targetPct * getScrollDist());
      };
      goToCard = scrollToCard; // le peek et les flèches amènent une carte au centre

      var getCurrentIdx = function () {
        var scrolled = Math.max(0, -outer.getBoundingClientRect().top);
        return Math.round((scrolled / getScrollDist()) * (total - 1));
      };

      var maybeSnap = function () {
        if (isSnapping) return;
        var scrollDist = getScrollDist();
        var scrolled = -outer.getBoundingClientRect().top;
        // Hors zone épinglée (au-dessus du carrousel ou déjà passé) → on laisse filer le
        // scroll de page, aucun aimantage (sinon on piégerait l'entrée/sortie de section).
        if (scrolled <= 0 || scrolled >= scrollDist) return;
        var idx = Math.round((scrolled / scrollDist) * (total - 1));
        var targetTop = getOuterTop() + (idx / (total - 1)) * scrollDist;
        if (Math.abs(targetTop - window.scrollY) < 4) return; // déjà centré, rien à faire
        snapScrollTo(targetTop);
      };

      window.addEventListener('scroll', function () {
        if (isSnapping) return;
        window.clearTimeout(snapTimer);
        // attend ~140ms sans scroll (inclut le momentum trackpad) avant de recentrer
        snapTimer = window.setTimeout(maybeSnap, 140);
      }, { passive: true });

      if (prevBtn) prevBtn.addEventListener('click', function () { scrollToCard(Math.max(0, getCurrentIdx() - 1)); });
      if (nextBtn) nextBtn.addEventListener('click', function () { scrollToCard(Math.min(total - 1, getCurrentIdx() + 1)); });
    }
  }

  /* ——— Micro-interactions premium (curseur magnétique + parallax scrubbé) ———
     Additif, isolé dans window.Motion (js/motion.js). Ne touche jamais .card ni
     la section #projets (scroll-lock). Court-circuité sous reduced-motion / tactile
     directement dans les primitives. */
  function initMotion() {
    var M = window.Motion;
    if (!M) return;
    // Curseur magnétique : réservé aux CTA focaux + flèches du carrousel.
    M.magnetic('.btn-primary, .nav__cta, .carousel-nav__btn', { strength: 0.3, ease: 0.16 });
    // Parallax scrubbé : uniquement les grands mots décoratifs de fond.
    M.parallax('.about__bgword, .services__bgword, .contact__bgword', { speed: 0.14 });
  }

  function init() {
    renderProjects();
    initReveals();
    initNav();
    initMobileNav();
    initServicesConnector();
    initServicesReveal();
    initContactForm();
    initHeroVideo();
    initParallax();
    initCarousel();
    initMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
