/* global window, document */
// Game script two. Records its run after script one in window.E2E_RES.order; on res_show it writes the
// order and whether the packaged font has loaded.
(window.E2E_RES = window.E2E_RES || { order: [] }).order.push('two');
window.addEventListener('qspider-event', function (e) {
  if (e.detail.name !== 'res_show') return;
  const put = function (qa, text) {
    let el = document.querySelector('[data-qa="' + qa + '"]');
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('data-qa', qa);
      document.body.appendChild(el);
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
