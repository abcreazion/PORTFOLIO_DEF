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

      return '' +
        '<a data-card href="' + href + '" class="card">' +
          '<div class="card__frame">' +
            '<div class="card__media" data-media role="img" aria-label="' + cardLabel + '" style="background-image:url(\'' + p.image + '\')"></div>' +
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
            '<div class="card__peek" data-peek>' +
              '<div class="card__peek-inner">' +
                '<div class="card__peek-thumb" aria-hidden="true" style="background-image:url(\'' + next.image + '\')"></div>' +
                '<div class="card__peek-label">' + (last ? 'RETOUR DÉBUT' : 'PROJET SUIVANT') + ' <span>↗</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</a>';
    }).join('');

    var countEl = document.getElementById('carouselCount');
    if (countEl) countEl.textContent = '01 / ' + String(n).padStart(2, '0');
  }

  /* ——— Scroll reveals (IntersectionObserver) ———
     Robust against the sticky, dynamically-sized 3D carousel — unlike scroll-position
     math, IO reveals each element exactly when it enters the viewport. */
  function initReveals() {
    var items = document.querySelectorAll('[data-reveal]');
    if (REDUCE) { showAll(items); return; }
    if (!('IntersectionObserver' in window)) { showAll(items); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var d = parseInt(el.dataset.d, 10) || 0;
        el.style.transition = 'opacity .8s ' + EASE + ' ' + d + 'ms, transform .8s ' + EASE + ' ' + d + 'ms';
        el.style.opacity = '1';
        el.style.transform = 'none';
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
    // Failsafe: reveal everything after 4s in case an observer misses.
    setTimeout(function () { showAll(items); }, 4000);
  }

  /* ——— Nav background on scroll ——— */
  function initNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    if (nav.hasAttribute('data-static')) return; // always-on background (project pages)
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', (window.scrollY || 0) > 80);
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
     transformées par JS et restent des liens natifs pleinement cliquables. ——— */
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

    var GAP = 40;
    var getCardW = function () { return cards[0] ? cards[0].offsetWidth : 760; };

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
      };
      stage.addEventListener('scroll', update, { passive: true });
      update();

      var goTo = function (idx) {
        idx = Math.max(0, Math.min(total - 1, idx));
        stage.scrollTo({ left: idx * getStep(), behavior: REDUCE ? 'auto' : 'smooth' });
      };
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
        });

        if (progress) {
          progress.style.width = (((pct * (total - 1)) + 1) / total * 100) + '%';
        }
        if (counter) {
          var idx = Math.min(total, Math.round(pct * (total - 1)) + 1);
          counter.textContent = String(idx).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
        }
      };

      window.addEventListener('scroll', updateCarousel, { passive: true });
      updateCarousel();

      var scrollToCard = function (idx) {
        var rect = outer.getBoundingClientRect();
        var outerTop = window.scrollY + rect.top;
        var targetPct = Math.max(0, Math.min(1, idx / (total - 1)));
        window.scrollTo({ top: outerTop + targetPct * getScrollDist(), behavior: 'smooth' });
      };

      var getCurrentIdx = function () {
        var rect = outer.getBoundingClientRect();
        var scrolled = Math.max(0, -rect.top);
        return Math.round((scrolled / getScrollDist()) * (total - 1));
      };

      if (prevBtn) prevBtn.addEventListener('click', function () { scrollToCard(Math.max(0, getCurrentIdx() - 1)); });
      if (nextBtn) nextBtn.addEventListener('click', function () { scrollToCard(Math.min(total - 1, getCurrentIdx() + 1)); });
    }
  }

  function init() {
    renderProjects();
    initReveals();
    initNav();
    initMobileNav();
    initContactForm();
    initHeroVideo();
    initParallax();
    initCarousel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
