/* global window, document */
// Game script two. Records its run after script one in window.E2E_RES.order; on res_show it writes the
// order and whether the packaged font has loaded.
(window.E2E_RES = window.E2E_RES || { order: [] }).order.push('two');
window.addEventListener('qspider-event', function (e) {
  if (e.detail.name !== 'res_show') return;
  const put = function (qa, text) {
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
    let el = document.querySelector('[data-qa="' + qa + '"]');
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('data-qa', qa);
      box.appendChild(el);
    }
    el.textContent = text;
  };
  put('res-script-two', 'RES SCRIPT TWO');
  put('res-order', 'RES ORDER ' + window.E2E_RES.order.join(','));
  document.fonts.load('16px E2eFont', 'A').then(function () {
    const loaded = Array.from(document.fonts).some(function (f) {
      return f.family.indexOf('E2eFont') >= 0 && f.status === 'loaded';
    });
    put('res-font-status', 'RES FONT ' + (loaded ? 'LOADED' : 'NOT LOADED'));
  });
});
