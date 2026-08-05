/* ========================================
   Lightbox — click images & Mermaid to zoom
   ======================================== */

(function () {
  'use strict';

  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image agrandie');
  overlay.innerHTML =
    '<span class="lightbox-close" aria-label="Fermer" role="button">&times;</span>' +
    '<img class="lightbox-img" alt="" />' +
    '<div class="lightbox-svg" aria-label="Diagramme agrandi"></div>' +
    '<div class="lightbox-caption"></div>';
  document.body.appendChild(overlay);

  var img = overlay.querySelector('.lightbox-img');
  var svgContainer = overlay.querySelector('.lightbox-svg');
  var caption = overlay.querySelector('.lightbox-caption');
  var closeBtn = overlay.querySelector('.lightbox-close');

  function openImage(src, alt, cap) {
    img.src = src;
    img.alt = alt || '';
    img.style.display = '';
    svgContainer.style.display = 'none';
    svgContainer.innerHTML = '';
    caption.textContent = cap || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function openMermaid(el, cap) {
    var svg = el.querySelector('svg');
    if (!svg) return;
    var clone = svg.cloneNode(true);
    clone.style.maxWidth = 'none';
    /* Ensure concrete width: use width attr, or fall back to viewBox */
    var w = clone.getAttribute('width');
    if (!w || w.indexOf('%') !== -1) {
      var vb = svg.viewBox;
      if (vb && vb.baseVal && vb.baseVal.width) {
        clone.setAttribute('width', vb.baseVal.width);
      }
    }
    /* Clear any height attribute so it derives from viewBox ratio */
    clone.removeAttribute('height');
    svgContainer.innerHTML = '';
    svgContainer.appendChild(clone);
    img.style.display = 'none';
    svgContainer.style.display = 'block';
    caption.textContent = cap || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    svgContainer.innerHTML = '';
    img.src = '';
  }

  overlay.addEventListener('click', close);
  svgContainer.addEventListener('click', function (e) { e.stopPropagation(); });
  closeBtn.addEventListener('click', function (e) { e.stopPropagation(); close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      e.preventDefault();
      close();
    }
  });

  /* Images */
  document.querySelectorAll('.img-hover img').forEach(function (image) {
    image.addEventListener('click', function () {
      var src = image.src;
      var alt = image.alt || '';
      var cap = '';
      var card = image.closest('.bracket-card');
      if (card) {
        var p = card.querySelector('p.font-mono');
        if (p) cap = p.textContent.trim();
      }
      openImage(src, alt, cap);
    });
  });

  /* Mermaid diagrams */
  document.querySelectorAll('.mermaid').forEach(function (el) {
    el.addEventListener('click', function () {
      var cap = '';
      var prev = el.previousElementSibling;
      if (prev && prev.tagName === 'P' && prev.classList.contains('text-warm-dim')) {
        cap = prev.textContent.trim();
      }
      if (!cap) {
        var section = el.closest('section');
        if (section) {
          var h2 = section.querySelector('h2');
          if (h2) cap = h2.textContent.replace(/^\/\/\s*/, '').trim();
        }
      }
      openMermaid(el, cap);
    });
  });
})();
