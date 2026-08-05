/* ========================================
   Mermaid post-render fix
   Renders diagrams after DOM is ready
   ======================================== */

(function () {
  function run() {
    if (typeof mermaid === 'undefined') return;
    mermaid.run({ querySelector: '.mermaid' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
