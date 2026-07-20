/* ============================================================
   BASTIEN AGUS — Portfolio interactions
   ============================================================ */
(function () {
  'use strict';

  var EASE = 'cubic-bezier(.22,.61,.36,1)';
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Tranché UNE fois au chargement, comme l'ancien carrousel. Ce n'est pas qu'un
  // habillage CSS : mobile et desktop ont des structures DOM entièrement
  // différentes (panneaux plein écran vs hero + roulette), d'où un branchement
  // dès le rendu. Conséquence assumée et documentée : franchir 900px en cours de
  // session (rotation d'écran) ne rebascule pas le mode.
  var IS_MOBILE = !!(window.matchMedia && window.matchMedia('(max-width: 900px)').matches);

  function showAll(items) {
    items.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  function stripTags(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }

  // Retard d'entrée en scène des reveals, posé par initCurtain() et lu par
  // initReveals(). Sans lui, la cascade du hero jouerait DERRIÈRE le rideau et
  // serait finie avant qu'il ne se lève : le visiteur découvrirait un hero déjà
  // figé. 0 dès qu'il n'y a pas de rideau (2e page vue, reduced-motion).
  var REVEAL_DELAY = 0;

  /* ——— Rideau d'entrée : le nom se dévoile en masque, puis le rideau se lève ———
     Une seule fois par session : la signature vaut au premier contact, elle
     devient un péage dès la deuxième page vue. Séquence : dévoilement (0→950ms)
     → levée (950→1850ms) → display:none.

     Tout est séquencé au setTimeout, jamais au transitionend : `transform` est
     aussi transitionné sur .curtain__word, dont l'événement REMONTE jusqu'au
     rideau et le ferait disparaître d'un coup. Et dans un onglet ouvert en
     arrière-plan, un transitionend qui ne vient jamais laisserait un calque
     opaque bloquant toute la page — un timer, lui, finit toujours par tomber. */
  function initCurtain() {
    var el = document.getElementById('curtain');
    if (!el) return;
    var seen = false;
    // sessionStorage lève en navigation privée / cookies bloqués : le rideau
    // rejouerait à chaque page, il vaut mieux ne pas le jouer du tout.
    try {
      seen = !!window.sessionStorage.getItem('curtainSeen');
      window.sessionStorage.setItem('curtainSeen', '1');
    } catch (e) { seen = true; }
    if (REDUCE || seen) { el.remove(); return; }

    REVEAL_DELAY = 1700; // la cascade du hero démarre juste avant la fin de la levée
    requestAnimationFrame(function () { el.classList.add('is-in'); });   // dévoile le nom
    window.setTimeout(function () { el.classList.add('is-done'); }, 950); // lève le rideau
    window.setTimeout(function () { el.classList.add('is-gone'); }, 1900);
  }

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
    if (IS_MOBILE) { renderShowcasePanels(stage, data); return; }

    // Les `background-image` CSS échappent au loading="lazy" natif : les 12 fonds
    // partaient tous au chargement de l'accueil, en concurrence avec la vidéo du
    // hero. Seuls les 3 premiers sont posés d'emblée ; les autres attendent
    // `loadDeferredBgs()`, appelé au premier geste dans le showcase.
    stage.insertAdjacentHTML('afterbegin', data.map(function (p, i) {
      var focal = p.focal || 'center';
      var yt = (p.youtube && isYoutubeThumbUrl(cardImage(p))) ? p.youtube : '';
      var eager = i < 3;
      return '<div class="showcase__bg" data-showcase-bg data-idx="' + i + '" data-yt="' + yt + '"' +
        (eager ? '' : ' data-bg-src="' + cardImage(p) + '"') +
        ' style="' + (eager ? 'background-image:url(\'' + cardImage(p) + '\');' : '') + 'background-position:' + focal + '"></div>';
    }).join(''));

    // Vignettes en <a> (et non <button>) : le clic ouvre la page projet — en
    // laissant le lien faire, on garde la navigation native (View Transition
    // cross-document, ctrl/cmd+clic et clic-molette → nouvel onglet, URL visible
    // au survol). En mode scrub, tout clic navigue directement (le badge « VOIR ↗ »
    // l'annonce) ; seul le repli natif reduced-motion (initNative) intercepte encore
    // une vignette non centrée pour la sélectionner d'abord.
    track.innerHTML = data.map(function (p, i) {
      var num = String(i + 1).padStart(2, '0');
      var label = stripTags(p.client) + ' — ' + stripTags(p.title);
      var yt = (p.youtube && isYoutubeThumbUrl(cardImage(p))) ? p.youtube : '';
      var href = p.url || (p.slug ? 'projet.html?p=' + p.slug : '#');
      var ext = p.url ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '' +
        '<a class="showcase__thumb" href="' + href + '"' + ext + ' data-showcase-thumb data-idx="' + i + '" data-cursor="VOIR ↗" aria-label="Voir ' + label + '">' +
          '<div class="showcase__thumb-img" data-yt="' + yt + '" style="background-image:url(\'' + cardImage(p) + '\')"></div>' +
          '<div class="showcase__thumb-scrim"></div>' +
          '<div class="showcase__thumb-num">' + num + '</div>' +
          '<div class="showcase__thumb-rail"></div>' +
          '<div class="showcase__thumb-label">' + stripTags(p.client) + '</div>' +
        '</a>';
    }).join('');

    fixYtFallback(stage.querySelectorAll('[data-showcase-bg][data-yt]:not([data-yt=""])'));
    fixYtFallback(track.querySelectorAll('.showcase__thumb-img[data-yt]:not([data-yt=""])'));
  }

  /* ——— MOBILE : un projet = un panneau plein écran ———————————————————————————
     Structure DOM entièrement distincte du desktop, et pas par confort : le
     concept « grande image + cluster de vignettes à survoler » suppose une scène
     large, un survol et un pointeur fin. Aucun des trois n'existe sur un
     téléphone. Comprimé, il produisait exactement l'inverse de ce qu'on veut
     pour un portfolio (mesuré en 390×844) : une bande de vignettes de 202px PLUS
     HAUTE que le contenu qu'elle sert à naviguer, un titre à 38px, une section à
     52% de l'écran, et la photo — l'œuvre — réduite à un fond entrevu derrière
     deux calques.

     Ici : la photo occupe tout le panneau, on glisse (scroll-snap natif, aucun
     scroll-jack), et le panneau ENTIER est le lien — plus de parcours en deux
     temps (sélectionner une vignette, puis viser un CTA séparé).
     ————————————————————————————————————————————————————————————————————————— */
  function renderShowcasePanels(stage, data) {
    var outer = document.getElementById('showcaseOuter');
    var sticky = stage.parentNode;

    // La structure desktop est DÉMONTÉE, pas masquée : la laisser en place
    // chargerait 12 fonds pour rien et garderait des cibles tactiles fantômes
    // par-dessus les panneaux.
    ['#showcaseContent', '#showcaseHint', '.showcase__thumbs', '.showcase__scrim', '.showcase__progress']
      .forEach(function (sel) {
        var el = stage.querySelector(sel);
        if (el) el.remove();
      });

    if (outer) outer.classList.add('is-panels');
    stage.classList.add('showcase__stage--panels');

    stage.innerHTML = data.map(function (p, i) {
      var href = p.url || (p.slug ? 'projet.html?p=' + p.slug : '#');
      var ext = p.url ? ' target="_blank" rel="noopener noreferrer"' : '';
      var yt = (p.youtube && isYoutubeThumbUrl(cardImage(p))) ? p.youtube : '';
      var meta = stripTags(p.role || '') + (p.year ? ' · ' + p.year : '');
      // alt="" volontaire : le lien porte déjà le client et le titre en texte
      // réel juste en dessous — un alt redondant ferait tout lire deux fois.
      return '' +
        '<a class="showcase__panel" href="' + href + '"' + ext + ' data-showcase-panel data-idx="' + i + '">' +
          '<img class="showcase__panel-img" src="' + cardImage(p) + '" alt="" data-yt="' + yt + '"' +
            ' loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async"' +
            ' style="object-position:' + (p.focal || 'center') + '">' +
          '<div class="showcase__panel-scrim"></div>' +
          '<div class="showcase__panel-body">' +
            '<span class="showcase__eyebrow"><span class="showcase__dot"></span>' +
              '<span class="showcase__client">' + stripTags(p.client) + '</span></span>' +
            '<h3 class="showcase__panel-title">' + stripTags(p.title) + '</h3>' +
            '<span class="showcase__panel-meta">' + meta + '</span>' +
            '<span class="showcase__panel-cta">VOIR LE PROJET <span class="showcase__cta-arrow">↗</span></span>' +
          '</div>' +
        '</a>';
    }).join('');

    // Repère de position : 12 segments + compteur, ~10px de haut — contre 202px
    // pour l'ancienne bande de vignettes, pour la même information utile
    // (« où j'en suis dans les 12 »). Hors de la stage, qui est le conteneur de
    // défilement : un enfant absolu y défilerait avec les panneaux.
    sticky.insertAdjacentHTML('beforeend',
      '<div class="showcase__mnav">' +
        '<div class="showcase__segs" id="showcaseSegs" aria-hidden="true">' +
          data.map(function () { return '<span class="showcase__seg"></span>'; }).join('') +
        '</div>' +
        '<div class="showcase__counter" id="showcaseCounter">01<span>/ ' + String(data.length).padStart(2, '0') + '</span></div>' +
      '</div>');

    fixYtImgs(stage.querySelectorAll('.showcase__panel-img[data-yt]:not([data-yt=""])'));
  }

  /* Même repli maxres→hqdefault que fixYtFallback, mais pour de vraies <img>
     (panneaux mobiles) au lieu d'un background CSS. Aucun projet n'en dépend
     aujourd'hui — tous ont leur `image` propre — c'est un filet pour un futur
     projet qui n'aurait qu'un `youtube`. */
  function fixYtImgs(els) {
    Array.prototype.forEach.call(els, function (img) {
      var hq = ytThumb(img.getAttribute('data-yt'), 'hqdefault');
      var swap = function () { if (img.src !== hq) img.src = hq; };
      img.addEventListener('error', swap);
      img.addEventListener('load', function () { if (img.naturalWidth <= 120) swap(); });
    });
  }

  /* ——— Chargement différé des fonds du showcase ———
     Pose la vraie image d'un fond resté en attente (`data-bg-src`). Idempotent :
     une fois posée, l'attribut disparaît et l'élément est ignoré. Le fallback
     miniature YouTube ne peut être branché qu'ICI pour ces fonds — il lit le
     `background-image` courant, qui n'existait pas tant que le fond était différé. */
  function loadBg(el) {
    if (!el || !el.dataset.bgSrc) return;
    el.style.backgroundImage = "url('" + el.dataset.bgSrc + "')";
    delete el.dataset.bgSrc;
    if (el.getAttribute('data-yt')) fixYtFallback([el]);
  }
  function loadDeferredBgs() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-showcase-bg][data-bg-src]'), loadBg);
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
    // Observation retardée tant qu'un rideau est en scène (cf. REVEAL_DELAY) :
    // l'état masqué est déjà posé, le hero attend simplement derrière le rideau
    // et sa cascade se déclenche au moment où il devient visible.
    var observe = function () { items.forEach(function (el) { io.observe(el); }); };
    if (REVEAL_DELAY) window.setTimeout(observe, REVEAL_DELAY); else observe();
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

  /* ——— Services → projets + formulaire ———
     Chaque bloc .svc[data-type] (data-type = libellé EXACT de la catégorie, aligné
     sur les <option> du select) est relié à sa bibliothèque de projets via
     window.projectsByCategory (source unique = le champ `categories` de
     js/projects.js). On en fait deux choses :
       1. Remplir la bande de vignettes .svc__projects (jusqu'à 4 projets), chacune
          un lien vers sa page projet — l'utilisateur voit des exemples sans quitter
          la section. Data-driven : taguer un projet le fait apparaître ici, zéro HTML.
       2. Le lien « Demander un devis » (.svc__cta → #contact) pré-remplit l'option
          correspondante du select #f-type au clic.
     Le bloc .svc n'est PLUS un <a> global (il contient maintenant des liens : les
     vignettes ET le CTA) — c'était la condition pour rendre les projets cliquables. */
  function initServicesConnector() {
    var svcs = Array.prototype.slice.call(document.querySelectorAll('.svc[data-type]'));
    var select = document.getElementById('f-type');
    if (!svcs.length) return;

    // iOS : un listener touchstart quelque part rend :active fiable au tap (retour
    // tactile sur les blocs service / vignettes). Inoffensif au pointeur fin.
    var hasFinePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    if (!hasFinePointer) {
      document.addEventListener('touchstart', function () {}, { passive: true });
    }

    var byCat = (typeof window.projectsByCategory === 'function')
      ? window.projectsByCategory : function () { return []; };

    svcs.forEach(function (svc) {
      var type = svc.dataset.type;
      var list = byCat(type);
      svc._projects = list;
      svc.setAttribute('data-project-count', String(list.length));

      // Bande de vignettes : jusqu'à 4 projets de ce service → page projet.
      var wrap = svc.querySelector('.svc__projects');
      if (wrap) {
        wrap.innerHTML = list.slice(0, 4).map(function (p) {
          var href = p.url || (p.slug ? 'projet.html?p=' + p.slug : '#');
          var ext = p.url ? ' target="_blank" rel="noopener noreferrer"' : '';
          var client = stripTags(p.client);
          return '<a class="svc__project" href="' + href + '"' + ext +
                   ' aria-label="Voir le projet ' + client + '">' +
                   '<span class="svc__project-thumb">' +
                     '<img src="' + cardImage(p) + '" alt="" loading="lazy" decoding="async">' +
                   '</span>' +
                   '<span class="svc__project-name">' + client + '</span>' +
                 '</a>';
        }).join('');
      }

      // « Demander un devis » : pré-remplit le type de projet. Le lien <a href="#contact">
      // fait la navigation nativement (jump + scroll-behavior:smooth global), pas de preventDefault.
      var cta = svc.querySelector('.svc__cta');
      if (cta && select) {
        cta.addEventListener('click', function () { select.value = type; });
      }
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
    // aria-invalid double l'état visuel .is-invalid : la bordure rouge ne dit
    // rien à un lecteur d'écran, qui annonce alors un champ « valide » qu'on
    // vient de lui refuser.
    var setValid = function (f, valid) {
      f.classList.toggle('is-invalid', !valid);
      if (valid) f.removeAttribute('aria-invalid');
      else f.setAttribute('aria-invalid', 'true');
    };
    fields.forEach(function (f) {
      ['input', 'change'].forEach(function (evt) {
        f.addEventListener(evt, function () { setValid(f, true); });
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
        setValid(f, valid);
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
  /* Le choix de source (720p/1080p, AV1/H.264) est fait par un script INLINE dans
     index.html, juste après l'élément : ici on tournerait au DOMContentLoaded, soit
     après que le scanner de préchargement a déjà lancé le téléchargement. Il ne
     reste donc que la garde reduced-motion, doublée de celle du script inline (qui
     ne pose alors aucune source du tout — le poster suffit et rien n'est téléchargé). */
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

     • DESKTOP hors reduced-motion → SCRUB (`initScrub`) : PLUS de capture sticky. La
       page défile normalement ; la molette ne pilote la roulette que lorsque le
       curseur survole le cluster de vignettes (bas-droite) — sinon le geste
       appartient à la page. Aux deux extrémités de la roulette (1er / dernier projet), la molette
       rend la main au scroll page (fall-through), pour qu'on puisse toujours
       traverser la section. Aucune hauteur factice n'est posée sur #showcaseOuter :
       la barre de défilement dit la vérité. Position de bande lissée en JS (lerp),
       comme avant ; le hero change projet par projet (au franchissement du milieu).

     • MOBILE ou reduced-motion → NATIF (`initNative`) : pas de capture, scroll
       horizontal natif de la bande (overflow-x), hero confirmé à l'arrêt (debounce).
       Respecte l'interdit "pas de scroll-jack mobile" du CLAUDE.md + prefers-reduced-motion.

     Tout le scale (roulette + pic au survol) passe par UNE boucle rAF unique, en
     calcul mathématique pur (aucun getBoundingClientRect par vignette et par frame →
     plus de layout thrashing) et sans transition CSS sur `transform` (le lissage est
     fait en amont par lerp — une transition par-dessus retraînerait, cf. .card). */
  /* ——— MOBILE : pilotage des panneaux ———
     Volontairement minuscule comparé au mode desktop : il n'y a AUCUNE animation
     JS ici, donc aucune boucle rAF, aucun lerp, aucun transform posé par le JS.
     Le défilement est 100% natif (scroll-snap), la navigation est un simple <a>.
     Le JS ne fait que LIRE scrollLeft pour mettre à jour le repère de position —
     c'est tout ce qu'il reste à faire quand la structure est juste. */
  function initShowcasePanels() {
    var stage = document.getElementById('showcaseStage');
    var counterEl = document.getElementById('showcaseCounter');
    var segsWrap = document.getElementById('showcaseSegs');
    if (!stage || !counterEl || !segsWrap) return;

    var panels = Array.prototype.slice.call(stage.querySelectorAll('[data-showcase-panel]'));
    var segs = Array.prototype.slice.call(segsWrap.children);
    var n = panels.length;
    if (!n) return;

    // Le pas est MESURÉ sur le DOM plutôt que recalculé depuis les valeurs CSS
    // (largeur du panneau + gap) : il reste juste si le CSS change.
    var step = 1;
    function measure() {
      step = (n > 1 ? panels[1].offsetLeft - panels[0].offsetLeft : panels[0].offsetWidth) || 1;
    }

    var current = -1;
    function setCurrent(i) {
      if (i === current) return;
      current = i;
      counterEl.innerHTML = String(i + 1).padStart(2, '0') + '<span>/ ' + String(n).padStart(2, '0') + '</span>';
      segs.forEach(function (s, j) { s.classList.toggle('is-on', j === i); });
      panels.forEach(function (p, j) {
        if (j === i) p.setAttribute('aria-current', 'true');
        else p.removeAttribute('aria-current');
      });
    }

    // Throttle rAF : `scroll` tire bien plus souvent qu'on ne repeint.
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        setCurrent(Math.max(0, Math.min(n - 1, Math.round(stage.scrollLeft / step))));
      });
    }
    stage.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); onScroll(); });

    // Un clavier peut être branché sur n'importe quel appareil, et ce mode sert
    // aussi aux fenêtres desktop étroites.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var r = stage.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      e.preventDefault();
      var i = Math.max(0, Math.min(n - 1, current + (e.key === 'ArrowRight' ? 1 : -1)));
      stage.scrollTo({ left: i * step, behavior: REDUCE ? 'auto' : 'smooth' });
    });

    measure();
    setCurrent(0);
  }

  function initShowcase() {
    if (IS_MOBILE) { initShowcasePanels(); return; }

    var outer = document.getElementById('showcaseOuter');
    var stage = document.getElementById('showcaseStage');
    var track = document.getElementById('showcaseThumbs');
    var content = document.getElementById('showcaseContent');
    var clientEl = document.getElementById('showcaseClient');
    var titleEl = document.getElementById('showcaseTitle');
    var leadEl = document.getElementById('showcaseLead');
    var metaEl = document.getElementById('showcaseMeta');
    var statsEl = document.getElementById('showcaseStats');
    var stageLink = document.getElementById('showcaseStageLink');
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

    // Le mobile est déjà parti sur initShowcasePanels() : ici on est forcément en
    // desktop. Reste à distinguer le scrub (molette sur la scène pilote une
    // position de bande lissée par JS) du repli natif sous prefers-reduced-motion
    // (scroll horizontal natif de la roulette).
    var SCRUB = !REDUCE;

    // Roulette : scale au pic (centre / survol) → plancher (loin). Delta doux pour
    // éviter tout chevauchement (le gap CSS de 22px absorbe le +14%) et rester fluide.
    var PEAK = 1.14, FLOOR = 0.90, RADIUS = 3;
    // Coefficients de lissage exprimés POUR UNE FRAME À 60Hz, puis convertis en
    // fonction du delta-time réel (voir `smooth`). Un lerp brut `v += (t-v)*k` est
    // lié à la cadence : à 120Hz il rattrape deux fois plus vite (animation trop
    // sèche sur écran rapide) et à chaque frame sautée il avance d'un à-coup —
    // c'est une des causes du rendu haché. La conversion rend la course identique
    // en temps réel quelle que soit la cadence (60, 120, 144Hz) ou les frames perdues.
    var PROG_LERP = 0.14;   // rattrapage de la position de bande (~750ms de course)
    var BOOST_LERP = 0.22;  // rattrapage du pic de survol — délibérément plus vif : le hover doit rester réactif
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

      // Filet de sécurité du chargement différé : si le fond demandé n'est pas
      // encore posé (l'utilisateur a sauté directement ici), on le pose maintenant
      // plutôt que d'activer une div vide.
      loadBg(bgs[idx]);
      bgs.forEach(function (bg, i) { bg.classList.toggle('is-active', i === idx); });
      thumbs.forEach(function (t, i) {
        t.classList.toggle('is-active', i === idx);
        // aria-current plutôt que role="tab"/aria-selected : sans tabpanel associé
        // ni roving tabindex, une fausse tablist annoncerait « onglet 1 sur 12 »
        // puis enverrait Tab sur l'onglet suivant au lieu du panneau — plus
        // trompeur que pas de sémantique du tout. Ces vignettes sont des boutons,
        // aria-current dit simplement lequel est actif.
        if (i === idx) t.setAttribute('aria-current', 'true');
        else t.removeAttribute('aria-current');
      });
      if (counterEl) counterEl.innerHTML = String(idx + 1).padStart(2, '0') + '<span>/ ' + String(n).padStart(2, '0') + '</span>';

      content.classList.remove('is-in');
      void content.offsetWidth; // reflow → rejoue la cascade même si is-in était déjà posé
      clientEl.textContent = p.client;
      splitTitle(titleEl, stripTags(p.title));
      if (leadEl) leadEl.textContent = p.intro || '';
      metaEl.textContent = (p.role || '') + (p.year ? ' · ' + p.year : '');
      // Stats (paires ["CHIFFRE","légende"]) — bloc retiré du flux si le projet n'en a pas.
      if (statsEl) {
        var stats = p.stats || [];
        statsEl.innerHTML = stats.map(function (s) {
          return '<span class="showcase__stat"><b>' + s[0] + '</b><i>' + s[1] + '</i></span>';
        }).join('');
        statsEl.style.display = stats.length ? '' : 'none';
      }
      var href = p.url || (p.slug ? 'projet.html?p=' + p.slug : '#');
      ctaEl.href = href;
      // Projet externe (champ `url`) → nouvel onglet, comme les vignettes/panneaux.
      if (p.url) { ctaEl.target = '_blank'; ctaEl.rel = 'noopener noreferrer'; }
      else { ctaEl.removeAttribute('target'); ctaEl.removeAttribute('rel'); }
      // Le lien plein cadre suit le projet AFFICHÉ (donc aussi la prévisualisation au survol).
      if (stageLink) {
        stageLink.href = href;
        if (p.url) { stageLink.target = '_blank'; stageLink.rel = 'noopener noreferrer'; }
        else { stageLink.removeAttribute('target'); stageLink.removeAttribute('rel'); }
      }
      requestAnimationFrame(function () { content.classList.add('is-in'); });
    }

    // ——— État partagé + boucle de rendu unique ———
    var confirmedIdx = 0;
    // hoveredIdx : conservé pour la garde du commit hero, mais le survol ne le
    // renseigne PLUS (le hero ne se prévisualise plus au survol — cf. handlers).
    // Il reste donc null, la garde est toujours vraie : le hero suit la roulette.
    var hoveredIdx = null;
    var currentProgress = 0;     // position float de la bande (index centré)
    var scrubProgress = 0;       // cible de position en mode scrub (0..n-1), pilotée à la molette
    var boost = [];              // pic de survol courant par vignette
    var boostTarget = [];
    for (var b = 0; b < n; b++) { boost.push(0); boostTarget.push(0); }
    var rafId = null;

    // Cible de progression : l'accumulateur `scrubProgress` (molette sur la scène)
    // en mode scrub, le `scrollLeft` natif en repli reduced-motion. Aucune lecture
    // de géométrie ici : la source scrub est un simple nombre tenu par le handler
    // wheel (voir initScrub), donc pas de rect à lire par frame.
    function progressTarget() {
      if (SCRUB) return scrubProgress;
      return track.scrollLeft / step;
    }

    // Mémo des dernières valeurs écrites : réécrire une propriété inchangée déclenche
    // quand même un recalcul de style. Avec 12 vignettes × 2 propriétés × 60 fps, ça
    // fait 1440 écritures/s dont l'immense majorité sont identiques.
    var lastScale = [], lastZ = [], lastProgW = -1, lastSL = null;
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

      // 2) En scrub, la bande est positionnée par JS (overflow-x:hidden) pour centrer
      //    `currentProgress`. En natif, c'est le scroll natif qui l'a déjà positionnée.
      //    ⚠️ Ne PAS remplacer ce `scrollLeft` par un `transform` sur `track` : les deux
      //    ne sont pas équivalents. `scrollLeft` fait défiler le CONTENU du conteneur,
      //    alors qu'un transform déplace le CONTENEUR lui-même — la bande entière sort
      //    du cluster et les vignettes disparaissent de l'écran (régression introduite
      //    puis corrigée). Une translation ne serait possible qu'en ajoutant un
      //    conteneur interne à translater, mais `track` doit rester le conteneur de
      //    scroll pour le mode natif : le gain compositor ne vaut pas ce détour.
      //    `trackMaxSL`/`trackClientW` sont mis en cache par `measure()` pour ne pas
      //    relire de géométrie ici.
      if (SCRUB) {
        var sl = padSide + currentProgress * step + thumbW / 2 - trackClientW / 2;
        sl = Math.max(0, Math.min(trackMaxSL, sl));
        if (sl !== lastSL) { track.scrollLeft = sl; lastSL = sl; }
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

      // 5) Hero. En scrub : commit projet par projet, au franchissement du milieu
      //    (le survol ne prévisualise plus → hoveredIdx reste null, la garde passe
      //    toujours). En natif : géré au settle (debounce).
      if (SCRUB && hoveredIdx === null) {
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
    if (hint) hint.querySelector('.showcase__hint-label').textContent = SCRUB ? 'SCROLLER' : 'GLISSER';

    // ——— Survol / focus (pointeur fin + clavier) : SEUL le pic de scale lerpé ———
    //     Le hero ne se prévisualise PLUS au survol d'une AUTRE vignette (demande
    //     explicite) : survoler met la vignette en avant (scale + curseur-badge
    //     « VOIR ↗ »), mais l'arrière-plan et le contenu du hero restent sur le
    //     projet centré par la roulette. Le clic sur une vignette ouvre directement
    //     son projet (lien <a> natif), exactement ce que le badge « VOIR ↗ » annonce.
    var hasFinePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    thumbs.forEach(function (t, i) {
      if (hasFinePointer) {
        t.addEventListener('mouseenter', function () { boostTarget[i] = 1; kick(); });
        t.addEventListener('mouseleave', function () { boostTarget[i] = 0; kick(); });
      }
      // Symétrie clavier : le focus met aussi la vignette en avant (scale), sans
      // toucher au hero. Hors du garde hasFinePointer : un clavier peut être
      // branché sur n'importe quel appareil.
      t.addEventListener('focus', function () { boostTarget[i] = 1; kick(); });
      t.addEventListener('blur', function () { boostTarget[i] = 0; kick(); });
    });

    // Préchargement en bloc des 9 fonds différés quand la stage entre à l'écran.
    // rootMargin volontairement à 0 : la stage ne commence qu'à ~200px sous le
    // pli (mesuré à 1280×800), donc la MOINDRE marge de préchargement rendrait
    // l'observateur intersectant dès le chargement — le report ne servirait plus
    // à rien. À 0, il faut un vrai geste de scroll pour déclencher, ce qui laisse
    // la fenêtre de chargement initiale à la vidéo du hero. Le temps de traverser
    // la roulette couvre le chargement, et showDisplay() garde son filet de
    // sécurité par fond si l'utilisateur saute directement à un projet lointain.
    if ('IntersectionObserver' in window) {
      var bgIo = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        loadDeferredBgs();
        bgIo.disconnect();
      });
      bgIo.observe(stage);
    } else {
      loadDeferredBgs();
    }

    if (SCRUB) initScrub(); else initNative();

    // ============================ MODE SCRUB (desktop, pointeur fin) ============================
    // Plus de capture sticky ni de hauteur factice : la page défile normalement.
    // La roulette n'avance que quand la molette agit au-dessus du cluster de
    // vignettes (bas-droite). Aux extrémités, la molette repasse la main au scroll page.
    function initScrub() {
      outer.classList.add('is-scrub');
      measure();

      // Snap doux à l'arrêt : après 140ms sans molette, la cible se recale sur
      // l'entier le plus proche ; le lerp de renderFrame l'y amène en douceur.
      var snapTimer = null;
      function scheduleSnap() {
        window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(function () {
          scrubProgress = Math.max(0, Math.min(n - 1, Math.round(scrubProgress)));
          kick();
        }, 140);
      }

      // La molette ne pilote la roulette QUE si le curseur est sur le cluster de
      // vignettes (bas-droite) — demande explicite : « locké si et seulement si la
      // souris est au niveau des cartes ». Le listener est donc posé sur
      // .showcase__thumbs (et non la scène) : partout ailleurs (grande image, texte,
      // reste de la page) le scroll vertical appartient à la page, sans capture.
      var wheelZone = stage.querySelector('.showcase__thumbs') || track;
      wheelZone.addEventListener('wheel', function (e) {
        // Normalisation deltaMode : certaines molettes envoient des « lignes »
        // (deltaMode 1) ou des « pages » (2) au lieu de pixels → sans conversion,
        // un cran ferait à peine bouger la roulette.
        var unit = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? window.innerHeight : 1);
        var raw = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
        if (!raw) return;
        var atStart = scrubProgress <= 0.0005;
        var atEnd = scrubProgress >= (n - 1) - 0.0005;
        // Fall-through aux bornes : même le curseur sur les cartes, au 1er/dernier
        // projet la molette est rendue à la page (on peut toujours sortir de la section).
        if ((raw < 0 && atStart) || (raw > 0 && atEnd)) return;
        e.preventDefault();
        dismissHint();
        // Clamp par événement : évite qu'un « fling » trackpad saute 5 projets d'un coup.
        var dp = Math.max(-1.2, Math.min(1.2, raw / step));
        scrubProgress = Math.max(0, Math.min(n - 1, scrubProgress + dp));
        scheduleSnap();
        kick();
      }, { passive: false });

      // Flèches ← → , boutons prev/next, clavier → avancent d'un projet (source =
      // scrubProgress, l'entier le plus proche sert de point de départ).
      var goTo = function (idx) {
        scrubProgress = Math.max(0, Math.min(n - 1, idx));
        dismissHint(); kick();
      };
      if (prevBtn) prevBtn.addEventListener('click', function () { goTo(Math.round(scrubProgress) - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { goTo(Math.round(scrubProgress) + 1); });
      document.addEventListener('keydown', function (e) {
        var rect = stage.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.round(scrubProgress) + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.round(scrubProgress) - 1); }
      });

      // Appareils hybrides (écran tactile + pointeur fin > 900px) : un glissement
      // horizontal sur la scène avance / recule d'un projet. Le scroll vertical
      // tactile reste à la page (aucune capture touch).
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
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          dismissHint(); goTo(Math.round(scrubProgress) + (dx < 0 ? 1 : -1));
        }
      }, { passive: true });

      window.addEventListener('resize', function () { measure(); kick(); });

      // Clic sur une vignette : navigation DIRECTE (le lien <a> fait foi, aucun
      // preventDefault). Plus de « sélectionner puis ouvrir » : au pointeur fin le
      // badge « VOIR ↗ » annonce l'ouverture, le clic la tient — et ctrl/cmd+clic,
      // clic-molette, View Transition restent nativement intacts sur les 12 liens.

      scrubProgress = 0;
      currentProgress = 0;
      showDisplay(0);
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
      // Même logique de lien qu'en mode lock : navigation si la vignette est le
      // projet AFFICHÉ (displayIdx — survol inclus), sélection sinon. Voir le
      // commentaire du mode lock pour le pourquoi (confirmedIdx peut être périmé).
      thumbs.forEach(function (t, i) {
        t.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          if (i === displayIdx) return;
          e.preventDefault();
          dismissHint(); go(i);
        });
      });
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
    // Révélation en essuyage des images (portrait About) — l'image est découverte,
    // pas allumée. Bidirectionnel comme le reste des reveals. On ARME d'abord
    // l'état masqué depuis le JS : le CSS ne découpe que [data-clip-reveal="armed"],
    // pour qu'un JS absent laisse l'image visible au lieu de la faire disparaître.
    Array.prototype.forEach.call(document.querySelectorAll('[data-clip-reveal]'), function (el) {
      el.dataset.clipReveal = 'armed';
    });
    M.reveal('[data-clip-reveal]');
    // Curseur-badge contextuel : lit [data-cursor], posé sur les vignettes du showcase.
    M.cursor();
  }

  function init() {
    initCurtain(); // en premier : il pose REVEAL_DELAY, lu par initReveals()
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
