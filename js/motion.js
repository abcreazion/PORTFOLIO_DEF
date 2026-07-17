/* ============================================================
   BASTIEN AGUS — Motion primitives (cinématique scroll & micro-design)
   ------------------------------------------------------------
   Micro-lib vanilla SANS dépendance / SANS build, pensée pour élever
   l'existant vers une finition premium (ADN "Don Molinico") sans jamais
   réintroduire ni smooth-scroll global (Lenis) ni GSAP — tous deux testés
   puis retirés sur ce projet car ils se battaient contre le carrousel
   scroll-lock (voir CLAUDE.md).

   Principes :
   - tout est en transform/opacity uniquement (compositor, 60fps) ;
   - une SEULE boucle rAF partagée (raf.add) pour tous les effets continus
     (scrub-parallax, curseur magnétique) — pas un rAF par effet ;
   - prefers-reduced-motion court-circuite chaque primitive (rendu final figé) ;
   - ne touche jamais .card (le <a> cliquable du carrousel) ni la section
     #projets (scroll-lock à hauteur dynamique) ;
   - exposé en window.Motion, consommé par js/main.js.
   ============================================================ */
(function () {
  'use strict';

  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var FINE = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  /* ——— Boucle rAF partagée ———
     Tous les effets "continus" (scrub, magnétique) s'abonnent ici. Un seul
     requestAnimationFrame tourne pour la page entière, et seulement tant qu'il
     y a au moins un abonné actif — sinon la boucle s'endort (0 coût CPU). */
  var raf = (function () {
    var subs = [];
    var running = false;
    function frame() {
      for (var i = 0; i < subs.length; i++) subs[i]();
      if (subs.length) requestAnimationFrame(frame);
      else running = false;
    }
    return {
      add: function (fn) {
        subs.push(fn);
        if (!running) { running = true; requestAnimationFrame(frame); }
        return function remove() {
          var idx = subs.indexOf(fn);
          if (idx > -1) subs.splice(idx, 1);
        };
      }
    };
  })();

  /* lerp : interpolation linéaire (amortissement). t≈0.1–0.2 = doux/lourd. */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

  /* ============================================================
     1. SPLIT-TEXT — reveal en masque, mot par mot
     ------------------------------------------------------------
     Signature du genre. On enveloppe chaque MOT dans un masque
     (overflow:hidden) contenant un inner qui translate depuis le bas.
     Le reveal est déclenché en ajoutant .is-split-in sur la cible
     (via IntersectionObserver, cf. reveal()).

     Accessibilité : on ne casse pas la sémantique — les mots restent du
     texte réel dans le flux ; on préserve les nœuds enfants existants
     (<br>, <span class="red">…) en les traitant comme des unités. En
     reduced-motion on ne découpe rien (rendu natif intact).
     ============================================================ */
  function splitText(el) {
    if (!el || el.dataset.split === 'done') return;
    if (REDUCE) { el.dataset.split = 'done'; el.classList.add('is-split-in'); return; }

    var nodes = Array.prototype.slice.call(el.childNodes);
    var frag = document.createDocumentFragment();
    var index = 0;

    function wrapUnit(content) {
      var mask = document.createElement('span');
      mask.className = 'm-word';
      var inner = document.createElement('span');
      inner.className = 'm-word__i';
      // stagger : chaque mot part légèrement après le précédent
      inner.style.transitionDelay = (index * 34) + 'ms';
      if (typeof content === 'string') inner.textContent = content;
      else inner.appendChild(content);
      mask.appendChild(inner);
      frag.appendChild(mask);
      index++;
    }

    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        // nœud texte → découpe en mots (on garde les espaces entre les masques)
        var parts = node.textContent.split(/(\s+)/);
        parts.forEach(function (p) {
          if (p === '') return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          wrapUnit(p);
        });
      } else if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        if (tag === 'br') { frag.appendChild(node.cloneNode(true)); return; }
        // élément inline (ex: <span class="red">.</span>) → unité à part entière
        wrapUnit(node.cloneNode(true));
      }
    });

    el.innerHTML = '';
    el.appendChild(frag);
    el.dataset.split = 'done';
  }

  /* ============================================================
     2. REVEAL directionnel (up & down) via IntersectionObserver
     ------------------------------------------------------------
     Élève le concept déjà présent sur le site : entrée mémorable au
     scroll-down, retrait élégant au scroll-up. Bascule une classe dans les
     DEUX sens (jamais de unobserve) → réversible par construction.
     - si l'élément porte [data-split], on le découpe d'abord ;
     - la classe .is-in (ou .is-split-in pour le split) pilote l'anim CSS.
     ============================================================ */
  function reveal(selector, opts) {
    opts = opts || {};
    var items = Array.prototype.slice.call(
      typeof selector === 'string' ? document.querySelectorAll(selector) : selector
    );
    if (!items.length) return;

    items.forEach(function (el) {
      if (el.hasAttribute('data-split')) splitText(el);
    });

    if (REDUCE || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-in');
        if (el.hasAttribute('data-split')) el.classList.add('is-split-in');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var on = e.isIntersecting;
        e.target.classList.toggle('is-in', on);
        if (e.target.hasAttribute('data-split')) {
          e.target.classList.toggle('is-split-in', on);
        }
      });
    }, {
      threshold: opts.threshold || 0.18,
      rootMargin: opts.rootMargin || '0px 0px -10% 0px'
    });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     3. CURSEUR MAGNÉTIQUE (lerp, style quickTo)
     ------------------------------------------------------------
     Le survol tire l'élément vers le curseur, amorti. Uniquement sur
     pointeur fin + hover (desktop) et hors reduced-motion. La force est
     bornée pour que l'élément ne quitte jamais sa hit-box (cf. guideline).
     N'applique le transform que via une variable interne — n'écrase pas
     d'éventuels autres transforms CSS (on compose sur un wrapper dédié si besoin).
     ============================================================ */
  function magnetic(selector, opts) {
    if (REDUCE || !FINE) return;
    opts = opts || {};
    var strength = opts.strength != null ? opts.strength : 0.32;
    var ease = opts.ease != null ? opts.ease : 0.18;
    var radiusPad = opts.radius != null ? opts.radius : 0; // extension de la zone d'attraction

    var els = Array.prototype.slice.call(
      typeof selector === 'string' ? document.querySelectorAll(selector) : selector
    );

    els.forEach(function (el) {
      var tx = 0, ty = 0, cx = 0, cy = 0; // target vs current
      var active = false, stop = null;

      function apply() {
        cx = lerp(cx, tx, ease);
        cy = lerp(cy, ty, ease);
        el.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
        // au repos, si on est quasiment revenu à 0, on coupe la boucle
        if (!active && Math.abs(cx) < 0.1 && Math.abs(cy) < 0.1) {
          el.style.transform = '';
          if (stop) { stop(); stop = null; }
        }
      }
      function ensureLoop() { if (!stop) stop = raf.add(apply); }

      el.addEventListener('mouseenter', function () { active = true; ensureLoop(); });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        tx = clamp((e.clientX - (r.left + r.width / 2)) * strength, -r.width, r.width);
        ty = clamp((e.clientY - (r.top + r.height / 2)) * strength, -r.height, r.height);
      });
      el.addEventListener('mouseleave', function () {
        active = false; tx = 0; ty = 0; ensureLoop();
      });
      el.classList.add('is-magnetic');
      void radiusPad; // réservé (extension future de la zone d'attraction)
    });
  }

  /* ============================================================
     4. SCRUB-PARALLAX (lié à la position de scroll, pas à un timer)
     ------------------------------------------------------------
     Translate un élément proportionnellement à sa position dans le viewport.
     Décoratif uniquement (bg-words, portrait) — jamais de texte de lecture ni
     d'élément interactif. Tous les éléments partagent la boucle rAF unique et
     ne sont recalculés qu'au scroll (drapeau dirty), donc coût quasi nul à l'arrêt.
     speed > 0 = suit plus lentement (recule), < 0 = devance.
     ============================================================ */
  function parallax(selector, opts) {
    if (REDUCE) return;
    opts = opts || {};
    var els = Array.prototype.slice.call(
      typeof selector === 'string' ? document.querySelectorAll(selector) : selector
    ).map(function (el) {
      return { el: el, speed: parseFloat(el.dataset.parallax) || opts.speed || 0.12 };
    });
    if (!els.length) return;

    var vh = window.innerHeight;
    window.addEventListener('resize', function () { vh = window.innerHeight; }, { passive: true });

    var dirty = true;
    window.addEventListener('scroll', function () { dirty = true; }, { passive: true });

    raf.add(function () {
      if (!dirty) return;
      dirty = false;
      for (var i = 0; i < els.length; i++) {
        var o = els[i];
        var r = o.el.getBoundingClientRect();
        // progression -1 (sous le viewport) → +1 (au-dessus), 0 au centre
        var prog = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        var y = clamp(prog, -1.4, 1.4) * o.speed * 100;
        o.el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      }
    });
  }

  /* ============================================================
     5. CURSEUR-BADGE contextuel
     ------------------------------------------------------------
     Un carré rouge suit le pointeur (lerp, boucle rAF partagée) et s'étend en
     badge libellé au survol de tout élément portant [data-cursor="VOIR ↗"].
     L'affordance se déplace sur le curseur lui-même plutôt que de surcharger
     la vignette.

     Le curseur natif n'est jamais masqué (`cursor:none`) : le badge amorti
     accompagne le vrai curseur, il ne le remplace pas — le masquer donnerait
     une latence perçue à chaque geste et casserait l'accessibilité.
     Pointeur fin uniquement, coupé sous reduced-motion.
     ============================================================ */
  function cursor() {
    if (REDUCE || !FINE) return;
    var el = document.getElementById('cursor');
    var label = document.getElementById('cursorLabel');
    if (!el || !label) return;

    var tx = -100, ty = -100, cx = tx, cy = ty;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      el.classList.add('is-on');
    }, { passive: true });

    raf.add(function () {
      cx = lerp(cx, tx, 0.22); cy = lerp(cy, ty, 0.22);
      // Le `translate(-50%,-50%)` final centre le badge sur le pointeur SANS
      // lire la moindre géométrie : un pourcentage de translate se résout sur
      // la propre boîte de l'élément, il suit donc tout seul l'animation de
      // taille de .is-label. Un centrage par offsetWidth marcherait aussi mais
      // forcerait un calcul de layout à chaque frame — interdit dans une
      // boucle de rendu ici (cf. le layout thrashing de l'ancien carrousel).
      el.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) translate(-50%,-50%)';
    });

    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cursor]') : null;
      if (t) { label.textContent = t.dataset.cursor; el.classList.add('is-label'); }
      else el.classList.remove('is-label');
    }, { passive: true });
  }

  window.Motion = {
    reduce: REDUCE,
    fine: FINE,
    raf: raf,
    lerp: lerp,
    clamp: clamp,
    splitText: splitText,
    reveal: reveal,
    magnetic: magnetic,
    parallax: parallax,
    cursor: cursor
  };
})();
