/* ============================================================
   GALERIE VOYAGES — voyages.html (page dédiée)
   Photographie personnelle de Bastien Agus (distincte des projets
   clients). Rendu de la grille masonry + lightbox focus-trappée,
   même niveau d'a11y que la galerie de js/project-page.js.
   Aucun framework, IIFE isolée.
   ============================================================ */
(function () {
  'use strict';

  // 59 photos exportées par le script de traitement (Pillow, voir rapport de
  // livraison) dans assets/img/voyages/01.jpg…59.jpg. Nombre à ajuster ici si
  // des photos sont ajoutées/retirées du dossier source.
  var PHOTO_COUNT = 59;

  function buildPhotos() {
    var list = [];
    for (var i = 1; i <= PHOTO_COUNT; i++) {
      var n = i < 10 ? '0' + i : String(i);
      list.push('assets/img/voyages/' + n + '.jpg');
    }
    return list;
  }

  function renderGrid(photos) {
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = photos.map(function (src, i) {
      return '<figure class="vgal__item" data-reveal data-d="' + ((i % 6) * 40) + '">' +
        '<button class="vgal__btn" type="button" aria-label="Agrandir la photo de voyage ' + (i + 1) + '">' +
          '<img src="' + src + '" alt="Photo de voyage — Bastien Agus" loading="lazy">' +
        '</button>' +
      '</figure>';
    }).join('');
  }

  function lightboxHtml() {
    return '<div class="vlightbox" id="vlightbox" role="dialog" aria-modal="true" aria-label="Visionneuse photo de voyage" hidden>' +
      '<button class="vlightbox__close" type="button" aria-label="Fermer la visionneuse">✕</button>' +
      '<button class="vlightbox__nav vlightbox__nav--prev" type="button" aria-label="Photo précédente">←</button>' +
      '<img class="vlightbox__img" id="vlightboxImg" alt="">' +
      '<button class="vlightbox__nav vlightbox__nav--next" type="button" aria-label="Photo suivante">→</button>' +
      '<div class="vlightbox__counter" id="vlightboxCounter"></div>' +
    '</div>';
  }

  /* Focus trap identique dans l'esprit à celui de js/project-page.js (Tab/Shift+Tab
     bouclent entre close/prev/next, Escape ferme, flèches naviguent, focus rendu au
     déclencheur à la fermeture). Dupliqué plutôt que partagé : les deux galeries
     vivent sur des pages différentes (index.html vs projet.html), pas de module
     commun chargé sur les deux — extraire un helper commun ajouterait une dépendance
     de chargement (ordre de <script>) pour un gain marginal sur ~60 lignes stables. */
  function initLightbox(root) {
    var lightbox = document.getElementById('vlightbox');
    var buttons = Array.prototype.slice.call(root.querySelectorAll('.vgal__btn'));
    if (!lightbox || !buttons.length) return;

    var lbImg = document.getElementById('vlightboxImg');
    var counter = document.getElementById('vlightboxCounter');
    var closeBtn = lightbox.querySelector('.vlightbox__close');
    var prevBtn = lightbox.querySelector('.vlightbox__nav--prev');
    var nextBtn = lightbox.querySelector('.vlightbox__nav--next');
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
    var section = document.getElementById('voyages');
    if (!section) return;
    var photos = buildPhotos();
    renderGrid(photos);
    section.insertAdjacentHTML('beforeend', lightboxHtml());
    initLightbox(section);
  }

  // Chargé avant js/main.js dans voyages.html : le rendu (et la pose des
  // [data-reveal] sur les items générés) doit être terminé avant que
  // initReveals() de main.js interroge le DOM au même événement DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
