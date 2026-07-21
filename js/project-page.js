/* ============================================================
   PAGE PROJET — projet.html?p=SLUG
   Rendu depuis window.PROJECTS (js/projects.js). Aucun framework.
   ============================================================ */
(function () {
  'use strict';

  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Hébergement gratuit Vercel — même valeur que le <link rel="canonical"> statique de index.html/projet.html.
  var SITE_URL = 'https://bastienagus.vercel.app';

  function absUrl(path) {
    var p = String(path || '');
    if (/^https?:\/\//i.test(p)) return p;
    return SITE_URL + '/' + p.replace(/^\//, '');
  }

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
    var motion = p.galleryMotion || [];
    var items = '';
    for (var i = 1; i <= p.galleryCount; i++) {
      var base = 'assets/img/projets/' + p.slug + '/' + (i < 10 ? '0' + i : i);
      var isMotion = motion.indexOf(i) !== -1;
      var label = stripTags(p.client) + ' — ' + stripTags(p.title) + ', ' +
        (isMotion ? 'animation ' : 'photographie ') + i;
      // Item ANIMÉ : boucle vidéo muette. preload="none" + poster → la page ne télécharge
      // que l'affiche au chargement ; la vidéo ne part qu'une fois l'item à l'écran
      // (initGallery), et jamais sous prefers-reduced-motion (l'affiche suffit).
      // Pas d'attribut controls : sans lui, <video> reste du contenu phrasing, donc
      // légalement imbricable dans le <button> qui ouvre la lightbox.
      var media = isMotion
        ? '<video class="pgal__video" poster="' + base + '.jpg" preload="none" muted loop playsinline ' +
            'aria-label="' + label + '" data-motion>' +
            '<source src="' + base + '.webm" type="video/webm">' +
            '<source src="' + base + '.mp4" type="video/mp4">' +
          '</video>'
        : '<img src="' + base + '.jpg" alt="' + label + '" loading="lazy">';
      items += '<figure class="pgal__item" data-reveal>' +
        '<button class="pgal__btn" type="button" aria-label="Agrandir : ' + label + '">' +
          media +
        '</button>' +
      '</figure>';
    }
    return '<section class="pgal">' +
      '<div class="pgal__head" data-reveal>' +
        '<span class="eyebrow__line"></span>' +
        '<h2 class="eyebrow__text eyebrow__h">LA GALERIE</h2>' +
      '</div>' +
      '<div class="pgal__grid">' + items + '</div></section>';
  }

  function lightboxHtml() {
    return '<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Visionneuse photo" hidden>' +
      '<button class="lightbox__close" type="button" aria-label="Fermer la visionneuse">✕</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Photo précédente">←</button>' +
      '<img class="lightbox__img" id="lightboxImg" alt="">' +
      '<video class="lightbox__video" id="lightboxVideo" controls loop playsinline hidden></video>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Photo suivante">→</button>' +
      '<div class="lightbox__counter" id="lightboxCounter"></div>' +
    '</div>';
  }

  function ytThumb(id, kind) { return 'https://img.youtube.com/vi/' + id + '/' + (kind || 'maxresdefault') + '.jpg'; }
  function isYoutubeThumbUrl(url) { return /^https?:\/\/img\.youtube\.com\//.test(String(url || '')); }

  function videoHtml(p) {
    var yt = p.youtube;
    var src = p.video && p.video.src;
    if (!yt && !src) return '';
    // Poster YouTube : maxresdefault (HD 1280px) quand elle existe, sinon fallback hqdefault
    // (toujours disponible) — géré par fixYtPosters() car maxres absente renvoie un placeholder
    // gris 120px (succès HTTP, pas une erreur), indétectable par onerror seul.
    var customPoster = p.video && p.video.poster;
    var poster = customPoster || (yt ? ytThumb(yt) : p.image);
    var hqAttr = (yt && !customPoster) ? ' data-hqfallback="' + ytThumb(yt, 'hqdefault') + '"' : '';
    // data-youtube (embed iframe au clic) OU data-video (fichier <video> local au clic)
    var dataAttr = yt ? ' data-youtube="' + yt + '"' : ' data-video="' + src + '"';
    return '<section class="pvid"><div class="pvid__inner">' +
      '<div class="pvid__label" data-reveal><span class="eyebrow__line"></span><h2 class="eyebrow__text eyebrow__h">LA VIDÉO</h2></div>' +
      '<div class="pvid__frame" data-reveal' + dataAttr + '>' +
        '<img class="pvid__poster" src="' + poster + '"' + hqAttr + ' alt="' + stripTags(p.client) + ' — vidéo">' +
        '<button class="pvid__play" type="button" aria-label="Lire la vidéo"><span>▶</span></button>' +
      '</div>' +
    '</div></section>';
  }

  function fixYtPosters(root) {
    var img = root.querySelector('.pvid__poster[data-hqfallback]');
    if (!img) return;
    var hq = img.getAttribute('data-hqfallback');
    function swapIfPlaceholder() {
      // La miniature maxres absente = image grise 120px de large ; on bascule alors sur hqdefault.
      if (img.naturalWidth && img.naturalWidth <= 120) img.src = hq;
    }
    img.addEventListener('error', function () { img.src = hq; }, { once: true });
    if (img.complete) swapIfPlaceholder();
    else img.addEventListener('load', swapIfPlaceholder, { once: true });
  }

  function fixYtHero(root) {
    // Le hero est un div avec background-image (pas de onerror possible) : on précharge la
    // miniature maxres via une Image() de test, et on bascule le fond sur hqdefault si elle
    // est absente (placeholder gris 120px) ou en erreur.
    var el = root.querySelector('.ph__media[data-hqfallback]');
    if (!el) return;
    var hq = el.getAttribute('data-hqfallback');
    var m = /url\(['"]?(.*?)['"]?\)/.exec(el.style.backgroundImage || '');
    if (!m || !m[1]) return;
    var probe = new Image();
    probe.onload = function () {
      if (probe.naturalWidth <= 120) el.style.backgroundImage = "url('" + hq + "')";
    };
    probe.onerror = function () { el.style.backgroundImage = "url('" + hq + "')"; };
    probe.src = m[1];
  }

  function contextHtml(p) {
    var paras = (p.context || []).map(function (t) {
      return '<p class="pctx__p" data-reveal>' + t + '</p>';
    }).join('');
    return '<section class="pctx"><div class="pctx__inner">' +
      '<div class="pctx__label" data-reveal><span class="eyebrow__line"></span><h2 class="eyebrow__text eyebrow__h">L\'ÉTUDE DE CAS</h2></div>' +
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
    // L'image personnalisée du projet (`image`, importée via le CMS) est toujours
    // prioritaire. Pour un projet YouTube sans image personnalisée, le hero retombe
    // sur la miniature du clip (maxres, fallback hqdefault via fixYtHero() pour les
    // vidéos sans miniature HD).
    var heroImg = p.image || (p.youtube ? ytThumb(p.youtube) : '');
    var heroHq = (p.youtube && isYoutubeThumbUrl(heroImg)) ? ' data-hqfallback="' + ytThumb(p.youtube, 'hqdefault') + '"' : '';
    return '<header class="ph">' +
      '<div class="ph__media"' + heroHq + ' style="background-image:url(\'' + heroImg + '\')"></div>' +
      '<div class="ph__scrim"></div>' +
      '<div class="ph__inner">' +
        '<div class="ph__eyebrow"><span class="ph__eyebrow-line"></span><span class="ph__eyebrow-text">' + p.client + '</span></div>' +
        '<h1 class="ph__title">' + p.title + '</h1>' +
        (p.intro ? '<p class="ph__intro">' + p.intro + '</p>' : '') +
      '</div>' +
      '<div class="ph__scroll"><span>SCROLL</span><div class="ph__scroll-track"><div class="ph__scroll-dot"></div></div></div>' +
    '</header>';
  }

  function ctaHtml(p) {
    return '<section class="pcta">' +
      '<div class="pcta__inner">' +
        '<div class="pcta__label" data-reveal><span class="eyebrow__line"></span><span class="eyebrow__text">ON EN PARLE ?</span></div>' +
        '<h2 class="pcta__title" data-reveal>Un projet dans le même esprit<span class="red"> ?</span></h2>' +
        '<p class="pcta__text" data-reveal>De la direction artistique à la livraison finale, donnons à votre marque des images qui marquent. Basé entre Lyon et Marseille, disponible partout.</p>' +
        '<a class="btn-primary pcta__btn" data-reveal href="index.html#contact">Démarrer votre projet <span class="btn-primary__arrow btn-primary__arrow--sm">↗</span></a>' +
      '</div>' +
    '</section>';
  }

  function nextHtml(list, index) {
    var next = list[(index + 1) % list.length];
    return '<a class="pnext" href="projet.html?p=' + next.slug + '">' +
      '<div class="pnext__media" style="background-image:url(\'' + next.image + '\')"></div>' +
      '<div class="pnext__scrim"></div>' +
      '<div class="pnext__inner">' +
        '<div class="pnext__k">PROJET SUIVANT</div>' +
        '<div class="pnext__title">' + next.title + '</div>' +
        '<div class="pnext__cta">Explorer l\'étude de cas <span>↗</span></div>' +
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
      if (frame.classList.contains('is-playing')) return;
      frame.classList.add('is-playing');

      // Embed YouTube : injecte un <iframe> à la demande (pas de chargement tant qu'on ne clique pas).
      var ytId = frame.getAttribute('data-youtube');
      if (ytId) {
        var iframe = document.createElement('iframe');
        iframe.className = 'pvid__video';
        iframe.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0';
        iframe.title = 'Vidéo YouTube';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('allowfullscreen', '');
        frame.appendChild(iframe);
        return;
      }

      var src = frame.getAttribute('data-video');
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

  // Boucles animées de la galerie : rien n'est téléchargé tant que l'item n'approche pas
  // de l'écran (preload="none" + .load() différé), et la lecture s'arrête dès qu'il en sort
  // — 5 vidéos qui tournent hors champ, c'est du décodage payé pour rien sur mobile.
  // Sous prefers-reduced-motion on ne charge RIEN : le poster reste, définitivement.
  function initGalleryMotion(root) {
    var vids = Array.prototype.slice.call(root.querySelectorAll('video[data-motion]'));
    if (!vids.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
          var play = v.play();
          if (play && play.catch) play.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { rootMargin: '200px 0px' });

    vids.forEach(function (v) { io.observe(v); });
  }

  function initGallery(root) {
    var lightbox = document.getElementById('lightbox');
    var buttons = Array.prototype.slice.call(root.querySelectorAll('.pgal__btn'));
    if (!lightbox || !buttons.length) return;

    var lbImg = document.getElementById('lightboxImg');
    var lbVideo = document.getElementById('lightboxVideo');
    var counter = document.getElementById('lightboxCounter');
    var closeBtn = lightbox.querySelector('.lightbox__close');
    var prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    var nextBtn = lightbox.querySelector('.lightbox__nav--next');
    var current = 0;
    var lastFocused = null;
    var focusable = [closeBtn, prevBtn, nextBtn];

    function show(i) {
      current = (i + buttons.length) % buttons.length;
      var vid = buttons[current].querySelector('video');
      // Un seul des deux médias est visible à la fois. La vidéo agrandie, elle, prend
      // ses controls (on est en consultation volontaire, plus en aperçu de grille).
      lbVideo.pause();
      if (vid) {
        lbImg.hidden = true;
        lbImg.removeAttribute('src');
        lbVideo.hidden = false;
        lbVideo.poster = vid.poster;
        lbVideo.innerHTML = vid.innerHTML;
        lbVideo.setAttribute('aria-label', vid.getAttribute('aria-label') || '');
        lbVideo.load();
        var play = lbVideo.play();
        if (play && play.catch) play.catch(function () {});
      } else {
        var img = buttons[current].querySelector('img');
        lbVideo.hidden = true;
        lbVideo.innerHTML = '';
        lbVideo.removeAttribute('poster');
        lbVideo.load(); // vide le buffer : sans ça la piste précédente reste en mémoire
        lbImg.hidden = false;
        lbImg.src = img.src;
        lbImg.alt = img.alt;
      }
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
      lbVideo.pause();
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(i); });
    });

    initGalleryMotion(root);
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
      ctaHtml(p) + nextHtml(hit.list, hit.index) + (p.galleryCount ? lightboxHtml() : '');

    document.title = stripTags(p.title) + ' — ' + p.client + ' · Bastien Agus';
    var meta = document.querySelector('meta[name="description"]');
    if (meta && p.intro) meta.setAttribute('content', p.intro);
    updateSocialMeta(p, slug);

    initReveals(root);
    initVideo(root);
    fixYtPosters(root);
    fixYtHero(root);
    initGallery(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
