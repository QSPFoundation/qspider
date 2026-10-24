/* global document */
// A game.cfg script of the standalone fixture: writes a data-qa mark when it runs.
(function () {
  var box = document.querySelector('[data-qa="e2e-marks"]');
  if (!box) {
    // The marks live in a fixed, on-screen box: appended under the player's 100vh overflow:hidden body they
    // would sit below the viewport, where Chromium's WebDriver reads no text and the page grows a scroll range.
    box = document.createElement('div');
    box.setAttribute('data-qa', 'e2e-marks');
    box.style.cssText =
      'position:fixed;top:0;right:0;z-index:2147483647;pointer-events:none;font:10px/1.2 sans-serif;background:#ffffffd9;color:#000';
    document.body.appendChild(box);
  }
  let el = document.querySelector('[data-qa="standalone-script"]');
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('data-qa', 'standalone-script');
    box.appendChild(el);
  }
  el.textContent = 'STANDALONE SCRIPT';
})();
