/* ========================================
   Keyboard Navigation System
   Cmd/Ctrl+K palette, vim scrolling, number nav
   Cross-platform: Mac (⌘) / Windows & Linux (Ctrl)
   ======================================== */

(function () {
  'use strict';

  // --- Platform detection (userAgentData with fallback) ---
  const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  const isMac = /Mac|iPhone|iPad|iPod/.test(platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  // --- Page type detection ---
  const isIndex = !window.location.pathname.includes('/projects/');

  // --- Command palette data ---
  const indexCommands = [
    { id: 'about',      label: 'About',      hint: 'Aller à la section About',      section: '#about',      key: '1' },
    { id: 'stats',      label: 'Git Stats',  hint: 'Aller à la section Stats',      section: '#stats',      key: '2' },
    { id: 'stack',      label: 'Tech Stack', hint: 'Aller à la section Stack',      section: '#stack',      key: '3' },
    { id: 'projects',   label: 'Projects',   hint: 'Aller à la section Projects',   section: '#projects',   key: '4' },
    { id: 'experience', label: 'Experience', hint: 'Aller à la section Experience', section: '#experience', key: '5' },
    { id: 'contact',    label: 'Contact',    hint: 'Aller à la section Contact',    section: '#contact',    key: '6' },
    { id: 'github',     label: 'GitHub',     hint: 'Ouvrir GitHub dans un nouvel onglet', url: 'https://github.com/AlexisChartier', key: 'G' },
    { id: 'linkedin',   label: 'LinkedIn',   hint: 'Ouvrir LinkedIn',                url: 'https://www.linkedin.com/in/alexis-chartier-8120671b7/', key: 'L' },
    { id: 'email',      label: 'Email',      hint: 'Envoyer un email',               url: 'mailto:alexischartier30130pse@gmail.com', key: 'E' },
    { id: 'shopyverse', label: '→ ShopyVerse',     hint: 'Voir le projet ShopyVerse',     url: 'projects/shopyverse.html', category: 'project' },
    { id: 'cohoma',     label: '→ COHOMA',         hint: 'Voir le projet COHOMA',         url: 'projects/cohoma.html', category: 'project' },
    { id: 'eventy',     label: '→ Eventy',         hint: 'Voir le projet Eventy',         url: 'projects/eventy.html', category: 'project' },
    { id: 'festival',   label: '→ Festival du Jeu',hint: 'Voir le projet Festival du Jeu', url: 'projects/festival-du-jeu.html', category: 'project' },
    { id: 'hydro',      label: '→ Hydrosciences',  hint: 'Voir le projet Hydrosciences',  url: 'projects/hydrosciences.html', category: 'project' },
    { id: 'scala',      label: '→ Realtime Poll',  hint: 'Voir le projet Realtime Poll',  url: 'projects/scala-poll.html', category: 'project' },
    { id: 'racin',      label: '→ RACIN',          hint: 'Voir le projet RACIN',          url: 'projects/racin.html', category: 'project' },
    { id: 'nlp',        label: '→ NLP Analysis',   hint: 'Voir le projet NLP Analysis',   url: 'projects/data-science.html', category: 'project' },
  ];

  const projectCommands = [
    { id: 'back',     label: '← Retour',       hint: 'Retour à la page principale', url: '../index.html#projects', key: 'B' },
    { id: 'github',   label: 'GitHub',         hint: 'Ouvrir le repo GitHub',      url: '', key: 'G' },
    { id: 'linkedin', label: 'LinkedIn',       hint: 'Ouvrir LinkedIn',            url: 'https://www.linkedin.com/in/alexis-chartier-8120671b7/', key: 'L' },
    { id: 'email',    label: 'Email',          hint: 'Envoyer un email',           url: 'mailto:alexischartier30130pse@gmail.com', key: 'E' },
    { id: 'top',     label: '↑ Top',          hint: 'Remonter en haut',           section: 'top', key: 'T' },
    { id: 'home',    label: '⌂ Home',         hint: "Retour à l'accueil",         url: '../index.html', key: 'H' },
  ];

  let commands = isIndex ? indexCommands : projectCommands;

  // For project pages, try to find the GitHub link from the page
  if (!isIndex) {
    const ghLink = document.querySelector('a[href*="github.com/AlexisChartier"]');
    if (ghLink) {
      const cmd = commands.find(function (c) { return c.id === 'github'; });
      if (cmd) cmd.url = ghLink.href;
    }
    // Add next/prev project navigation
    var projectOrder = ['shopyverse', 'cohoma', 'eventy', 'festival-du-jeu', 'hydrosciences', 'scala-poll', 'racin', 'data-science'];
    var currentPath = window.location.pathname.split('/').pop().replace('.html', '');
    var currentIdx = projectOrder.indexOf(currentPath);
    if (currentIdx > 0) {
      commands.splice(1, 0, {
        id: 'prev', label: '← Projet précédent', hint: 'Projet précédent',
        url: projectOrder[currentIdx - 1] + '.html', key: 'P'
      });
    }
    if (currentIdx >= 0 && currentIdx < projectOrder.length - 1) {
      commands.splice(currentIdx > 0 ? 2 : 1, 0, {
        id: 'next', label: '→ Projet suivant', hint: 'Projet suivant',
        url: projectOrder[currentIdx + 1] + '.html', key: 'N'
      });
    }
  }

  // --- Vim keys (lowercase, no modifiers) ---
  // These are checked BEFORE command shortcuts to avoid conflicts.
  // j/k = scroll, g = top, Shift+G = bottom (handled separately)
  var vimKeys = { 'j': 'down', 'k': 'up' };

  // --- Build palette DOM ---
  var overlay = document.createElement('div');
  overlay.id = 'kbd-overlay';
  overlay.className = 'kbd-overlay';
  overlay.innerHTML = ''
    + '<div class="kbd-palette" role="dialog" aria-label="Palette de commandes">'
    + '  <div class="kbd-input-wrap">'
    + '    <span class="kbd-search-icon">\u2315</span>'
    + '    <input type="text" id="kbd-input" class="kbd-input" placeholder="Rechercher une commande..." autocomplete="off" spellcheck="false" />'
    + '    <kbd class="kbd-esc">Esc</kbd>'
    + '  </div>'
    + '  <div id="kbd-results" class="kbd-results" role="listbox"></div>'
    + '  <div class="kbd-footer">'
    + '    <span><kbd>\u2191</kbd><kbd>\u2193</kbd> naviguer</span>'
    + '    <span><kbd>\u21b5</kbd> s\u00e9lectionner</span>'
    + '    <span><kbd>Esc</kbd> fermer</span>'
    + '  </div>'
    + '</div>';
  document.body.appendChild(overlay);

  var input = overlay.querySelector('#kbd-input');
  var resultsEl = overlay.querySelector('#kbd-results');
  var selectedIdx = 0;
  var filtered = [];

  function renderResults(query) {
    query = (query || '').toLowerCase().trim();
    filtered = commands.filter(function (c) {
      if (!query) return true;
      return c.label.toLowerCase().indexOf(query) !== -1
        || c.hint.toLowerCase().indexOf(query) !== -1
        || c.id.indexOf(query) !== -1;
    });

    selectedIdx = 0;
    var html = filtered.map(function (c, i) {
      var active = i === selectedIdx ? ' kbd-active' : '';
      var kbdKey = c.key ? '<kbd class="kbd-shortcut">' + c.key + '</kbd>' : '';
      var cat = c.category === 'project' ? '<span class="kbd-cat">projet</span>' : '';
      return '<div class="kbd-item' + active + '" data-idx="' + i + '" role="option">'
        + '<span class="kbd-item-label">' + c.label + '</span>'
        + '<span class="kbd-item-hint">' + c.hint + '</span>'
        + cat + kbdKey
        + '</div>';
    }).join('');

    resultsEl.innerHTML = html || '<div class="kbd-empty">Aucun r\u00e9sultat</div>';

    // Attach click/mouseenter handlers
    var items = resultsEl.querySelectorAll('.kbd-item');
    items.forEach(function (el) {
      el.addEventListener('click', function () {
        executeCommand(parseInt(el.dataset.idx));
      });
      el.addEventListener('mouseenter', function () {
        selectedIdx = parseInt(el.dataset.idx);
        updateActive();
      });
    });
  }

  function updateActive() {
    var items = resultsEl.querySelectorAll('.kbd-item');
    items.forEach(function (el, i) {
      el.classList.toggle('kbd-active', i === selectedIdx);
    });
    var active = resultsEl.querySelector('.kbd-active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function executeCommand(idx) {
    var cmd = filtered[idx];
    if (!cmd) return;
    closePalette();
    if (cmd.url) {
      window.location.href = cmd.url;
    } else if (cmd.section) {
      if (cmd.section === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        var el = document.querySelector(cmd.section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function openPalette() {
    overlay.classList.add('kbd-open');
    input.value = '';
    renderResults('');
    setTimeout(function () { input.focus(); }, 50);
  }

  function closePalette() {
    overlay.classList.remove('kbd-open');
  }

  // --- Palette events ---
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePalette();
  });

  input.addEventListener('input', function () { renderResults(input.value); });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, filtered.length - 1);
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      updateActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(selectedIdx);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    }
  });

  // --- Helper: is a modifier key pressed? ---
  function hasModifier(e) { return e.metaKey || e.ctrlKey; }

  // --- Global keyboard shortcuts ---
  document.addEventListener('keydown', function (e) {
    var typing = ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName) !== -1;
    var inPalette = overlay.classList.contains('kbd-open');

    // 1. Cmd/Ctrl+K — toggle palette (always works, even in inputs)
    if (hasModifier(e) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (inPalette) closePalette(); else openPalette();
      return;
    }

    // 2. Escape — close palette (always works)
    if (e.key === 'Escape' && inPalette) {
      e.preventDefault();
      closePalette();
      return;
    }

    // Stop here if typing or palette is open
    if (typing || inPalette) return;

    // 3. Shift+G — vim scroll to bottom (checked before command lookup
    //    because Shift+G produces 'G' which would match the GitHub command key)
    if (e.shiftKey && !hasModifier(e) && !e.altKey && e.key === 'G') {
      e.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }

    // 4. Vim scroll keys — lowercase j/k only (no modifiers, no shift)
    if (!hasModifier(e) && !e.altKey && !e.shiftKey && vimKeys[e.key]) {
      e.preventDefault();
      if (vimKeys[e.key] === 'down') {
        window.scrollBy({ top: 120, behavior: 'smooth' });
      } else {
        window.scrollBy({ top: -120, behavior: 'smooth' });
      }
      return;
    }

    // 5. Number keys 1-6 — navigate sections (index page only)
    //    Use e.code (physical key) instead of e.key to support AZERTY
    //    where Shift+1 produces "1" (not "&"). e.code "Digit1".."Digit6"
    //    is layout-independent. On QWERTY the Shift isn't pressed, on
    //    AZERTY it is — either way, the physical key is the same.
    if (isIndex && !hasModifier(e) && !e.altKey) {
      var digitMatch = /^Digit([1-6])$/.exec(e.code);
      if (digitMatch) {
        e.preventDefault();
        var sections = ['#about', '#stats', '#stack', '#projects', '#experience', '#contact'];
        var el = document.querySelector(sections[parseInt(digitMatch[1]) - 1]);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // 6. Single-key command shortcuts — match e.key against command.key.
    //    For letters: we accept both cases (g matches G, l matches L).
    //    For digits (command keys 1-6): already handled above via e.code,
    //    so they won't reach here on QWERTY. On AZERTY they arrive with
    //    shiftKey=true, which is allowed since we only block hasModifier+altKey.
    if (!hasModifier(e) && !e.altKey && e.key.length === 1) {
      var cmd = commands.find(function (c) { return c.key === e.key; });
      if (!cmd) {
        var upper = e.key.toUpperCase();
        if (upper !== e.key) {
          cmd = commands.find(function (c) { return c.key === upper; });
        }
      }
      if (cmd) {
        e.preventDefault();
        if (cmd.url) {
          window.location.href = cmd.url;
        } else if (cmd.section) {
          if (cmd.section === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            var el2 = document.querySelector(cmd.section);
            if (el2) el2.scrollIntoView({ behavior: 'smooth' });
          }
        }
        return;
      }
    }
  });

  // --- Inject keyboard hint badges ---
  function injectHints() {
    // Add kbd hint to nav links on index page
    if (isIndex) {
      var navMap = { '#about': '1', '#stats': '2', '#stack': '3', '#projects': '4', '#experience': '5', '#contact': '6' };
      document.querySelectorAll('.nav-link').forEach(function (link) {
        var href = link.getAttribute('href');
        if (navMap[href]) {
          var kbd = document.createElement('kbd');
          kbd.className = 'kbd-nav-hint';
          kbd.textContent = navMap[href];
          link.appendChild(kbd);
        }
      });
    }

    // Add ⌘K / Ctrl+K hint to sidebar
    var sidebar = document.querySelector('aside');
    if (sidebar) {
      var hint = document.createElement('div');
      hint.className = 'kbd-trigger-hint';
      hint.innerHTML = 'Appuyez sur <kbd class="kbd-mod">' + modKey + '</kbd><span class="kbd-plus">+</span><kbd class="kbd-mod">K</kbd> pour la palette';
      var contactLink = sidebar.querySelector('a[href*="mailto"]');
      if (contactLink && contactLink.parentElement) {
        contactLink.parentElement.insertBefore(hint, contactLink.nextSibling);
      }
    }

    // Add trigger button on project pages (top bar)
    if (!isIndex) {
      var statusBar = document.querySelector('.status-bar');
      if (statusBar) {
        var trigger = document.createElement('span');
        trigger.className = 'kbd-status-trigger';
        trigger.innerHTML = '<kbd class="kbd-mod">' + modKey + '</kbd>+<kbd class="kbd-mod">K</kbd>';
        trigger.style.cursor = 'pointer';
        trigger.addEventListener('click', openPalette);
        statusBar.appendChild(trigger);
      }
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHints);
  } else {
    injectHints();
  }

  // Expose for debugging
  window.__kbdNav = { openPalette: openPalette, closePalette: closePalette, isMac: isMac, modKey: modKey };
})();
