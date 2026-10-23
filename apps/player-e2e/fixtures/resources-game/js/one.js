/* global window, document */
// Game script one. Records its run in window.E2E_RES.order and answers the game's events by writing
// markers into the page: res_start (fired by the start location) and res_show (the resources location).
(window.E2E_RES = window.E2E_RES || { order: [] }).order.push('one');
function mark(qa, text) {
  let el = document.querySelector('[data-qa="' + qa + '"]');
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('data-qa', qa);
    document.body.appendChild(el);
  }
  el.textContent = text;
}
window.addEventListener('qspider-event', function (e) {
  if (e.detail.name === 'res_start') mark('res-start-seen', 'RES SCRIPT SAW START');
  if (e.detail.name === 'res_show') mark('res-script-one', 'RES SCRIPT ONE');
});
