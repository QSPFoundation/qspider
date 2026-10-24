/* global document */
// A game.cfg script of the standalone fixture: writes a data-qa mark when it runs.
(function () {
  let el = document.querySelector('[data-qa="standalone-script"]');
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('data-qa', 'standalone-script');
    document.body.appendChild(el);
  }
  el.textContent = 'STANDALONE SCRIPT';
})();
