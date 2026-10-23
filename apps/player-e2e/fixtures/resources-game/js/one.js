/* global window, document, XMLHttpRequest */
// Game script one. Records its run in window.E2E_RES.order and answers the game's events by writing
// markers into the page: res_start (fired by the start location), res_show (the resources location) and res_xhr
// (the media location: reads an absolute http URL with XMLHttpRequest and writes its responseText).
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
  if (e.detail.name === 'res_xhr') {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://127.0.0.1:47631/ext.txt');
    xhr.onload = function () {
      mark('res-xhr', xhr.responseText);
    };
    xhr.send();
  }
});
