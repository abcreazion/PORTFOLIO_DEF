/* ============================================================
   PAGE PROJET — projet.html?p=SLUG
   Rendu depuis window.PROJECTS (js/projects.js). Aucun framework.
   ============================================================ */
(function () {
  'use strict';

  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Domaine de prod à confirmer — même valeur que le <link rel="canonical"> statique de index.html/projet.html.
  var SITE_URL = 'https://bastienagus.com';

  function absUrl(path) { return SITE_URL + '/' + String(path).replace(/^\//, ''); }

  function setMeta(id, attr, value) {
    var el = document.getElementById(id);
    if (el) el.setAttribute(attr, value);
  }

  function updateSocialMeta(p, slug) {
    var title = stripTags(p.title) + ' — ' + p.client + ' · Bastien Agus';
    var desc = p.intro || '';
    var url = absUrl('projet.html?p=' + slug);
    var image = absUrl(p.image);

    setMeta('metaCanonical', 'href', url);
    setMeta('metaOgUrl', 'content', url);
    setMeta('metaOgTitle', 'content', title);
    setMeta('metaOgDescription', 'content', desc);
    setMeta('metaOgImage', 'content', image);
    setMeta('metaTwitterTitle', 'content', title);
    setMeta('metaTwitterDescription', 'content', desc);
    setMeta('metaTwitterImage', 'content', image);
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function stripTags(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }

  function findProject(slug) {
    var list = window.PROJECTS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].slug === slug) return { project: list[i], index: i, list: list };
    }
    return null;
  }

  function galleryHtml(p) {
    if (!p.galleryCount) return '';
    var items = '';
    for (var i = 1; i <= p.galleryCount; i++) {
      var src = 'assets/img/projets/' + p.slug + '/' + (i < 10 ? '0' + i : i) + '.jpg';
      items += '<figure class="pgal__item" data-reveal>' +
        '<button class="pgal__btn" type="button" aria-label="Agrandir la photo ' + i + '">' +
          '<img src="' + src + '" alt="' + stripTags(p.client) + ' — photographie ' + i + '" loading="lazy">' +
        '</button>' +
      '</figure>';
    }
    return '<section class="pgal"><div class="pgal__grid">' + items + '</div></section>';
  }

  function lightboxHtml() {
    return '<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Visionneuse photo" hidden>' +
      '<button class="lightbox__close" type="button" aria-label="Fermer la visionneuse">✕</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Photo précédente">←</button>' +
      '<img class="lightbox__img" id="lightboxImg" alt="">' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Photo suivante">→</button>' +
      '<div class="lightbox__counter" id="lightboxCounter"></div>' +
    '</div>';
  }

  function videoHtml(p) {
    if (!p.video || !p.video.src) return '';
    return '<section class="pvid"><div class="pvid__inner">' +
      '<div class="pvid__label" data-reveal><span class="eyebrow__line"></span><span class="eyebrow__text">LA VIDÉO</span></div>' +
      '<div class="pvid__frame" data-reveal data-video="' + p.video.src + '">' +
        '<img class="pvid__poster" src="' + (p.video.poster || p.image) + '" alt="' + stripTags(p.client) + ' — vidéo">' +
        '<button class="pvid__play" type="button" aria-label="Lire la vidéo"><span>▶</span></button>' +
      '</div>' +
    '</div></section>';
  }

  function contextHtml(p) {
    var paras = (p.context || []).map(function (t) {
      return '<p class="pctx__p" data-reveal>' + t + '</p>';
    }).join('');
    return '<section class="pctx"><div class="pctx__inner">' +
      '<div class="pctx__label" data-reveal><span class="eyebrow__line"></span><span class="eyebrow__text">LE PROJET</span></div>' +
      '<div class="pctx__body">' +
        (p.intro ? '<p class="pctx__intro" data-reveal>' + p.intro + '</p>' : '') +
        paras +
      '</div>' +
    '</div></section>';
  }

  function metaHtml(p) {
    function item(k, v) {
      return v ? '<div class="pmeta__item"><div class="pmeta__k">' + k + '</div><div class="pmeta__v">' + v + '</div></div>' : '';
    }
    var statsHtml = (p.stats || []).map(function (s) {
      return '<div class="pmeta__stat"><div class="pmeta__stat-num">' + s[0] + '</div><div class="pmeta__stat-label">' + s[1] + '</div></div>';
    }).join('');
    return '<section class="pmeta"><div class="pmeta__inner">' +
      item('CLIENT', p.client) + item('ANNÉE', p.year) + item('PRESTATION', p.role) + statsHtml +
    '</div></section>';
  }

  function heroHtml(p) {
    return '<header class="ph">' +
      '<div class="ph__media" style="background-image:url(\'' + p.image + '\')"></div>' +
      '<div class="ph__scrim"></div>' +
      '<div class="ph__inner">' +
        '<div class="ph__eyebrow"><span class="ph__eyebrow-line"></span><span class="ph__eyebrow-text">' + p.client + '</span></div>' +
        '<h1 class="ph__title">' + p.title + '</h1>' +
        (p.intro ? '<p class="ph__intro">' + p.intro + '</p>' : '') +
      '</div>' +
      '<div class="ph__scroll"><span>SCROLL</span><div class="ph__scroll-track"><div class="ph__scroll-dot"></div></div></div>' +
    '</header>';
  }

  function nextHtml(list, index) {
    var next = list[(index + 1) % list.length];
    return '<a class="pnext" href="projet.html?p=' + next.slug + '">' +
      '<div class="pnext__media" style="background-image:url(\'' + next.image + '\')"></div>' +
      '<div class="pnext__scrim"></div>' +
      '<div class="pnext__inner">' +
        '<div class="pnext__k">PROJET SUIVANT</div>' +
        '<div class="pnext__title">' + next.title + '</div>' +
        '<div class="pnext__cta">Voir le projet <span>↗</span></div>' +
      '</div>' +
    '</a>';
  }

  function notFoundHtml() {
    return '<section class="pempty">' +
      '<div class="eyebrow"><span class="eyebrow__line"></span><span class="eyebrow__text">ERREUR 404</span></div>' +
      '<h1 class="pempty__title">PROJET<br>INTROUVABLE<span class="red">.</span></h1>' +
      '<a class="btn-primary" href="index.html#projets">← Retour aux projets <span class="btn-primary__arrow btn-primary__arrow--sm">↗</span></a>' +
    '</section>';
  }

  function initReveals(root) {
    var items = root.querySelectorAll('[data-reveal]');
    if (REDUCE || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  function initVideo(root) {
    var frame = root.querySelector('.pvid__frame');
    if (!frame) return;
    frame.addEventListener('click', function () {
      var src = frame.getAttribute('data-video');
      if (frame.classList.contains('is-playing')) return;
      frame.classList.add('is-playing');
      var v = document.createElement('video');
      v.setAttribute('controls', '');
      v.setAttribute('autoplay', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('preload', 'auto');
      v.className = 'pvid__video';
      v.src = src;
      v.addEventListener('error', function () {
        frame.classList.remove('is-playing');
        frame.classList.add('is-missing'); // affiche le message "vidéo bientôt disponible"
      });
      frame.appendChild(v);
    });
  }

  function initGallery(root) {
    var lightbox = document.getElementById('lightbox');
    var buttons = Array.prototype.slice.call(root.querySelectorAll('.pgal__btn'));
    if (!lightbox || !buttons.length) return;

    var lbImg = document.getElementById('lightboxImg');
    var counter = document.getElementById('lightboxCounter');
    var closeBtn = lightbox.querySelector('.lightbox__close');
    var prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    var nextBtn = lightbox.querySelector('.lightbox__nav--next');
    var current = 0;
    var lastFocused = null;
    var focusable = [closeBtn, prevBtn, nextBtn];

    function show(i) {
      current = (i + buttons.length) % buttons.length;
      var img = buttons[current].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      counter.textContent = (current + 1) + ' / ' + buttons.length;
    }
    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(i); });
    });
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'Tab') {
        // Focus trap : la lightbox est modale, le Tab ne doit pas s'échapper vers le contenu masqué derrière.
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  function init() {
    var root = document.getElementById('project-root');
    if (!root) return;
    var slug = param('p');
    var hit = slug ? findProject(slug) : null;

    if (!hit) {
      root.innerHTML = notFoundHtml();
      document.title = 'Projet introuvable — Bastien Agus';
      initReveals(root);
      return;
    }

    var p = hit.project;
    // Hero → meta (chiffres clés inclus) → vidéo (livrable principal si projet vidéo) →
    // contexte éditorial → galerie → projet suivant.
    root.innerHTML =
      heroHtml(p) + metaHtml(p) + videoHtml(p) + contextHtml(p) + galleryHtml(p) +
      nextHtml(hit.list, hit.index) + (p.galleryCount ? lightboxHtml() : '');

    document.title = stripTags(p.title) + ' — ' + p.client + ' · Bastien Agus';
    var meta = document.querySelector('meta[name="description"]');
    if (meta && p.intro) meta.setAttribute('content', p.intro);
    updateSocialMeta(p, slug);

    initReveals(root);
    initVideo(root);
    initGallery(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
