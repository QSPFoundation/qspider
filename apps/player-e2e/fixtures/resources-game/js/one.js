/* global window, document, getComputedStyle, XMLHttpRequest, TextDecoder */
// Game script one. Records its run in window.E2E_RES.order and answers the game's events by writing
// markers into the page: res_start (fired by the start location), res_show (the resources location) and res_xhr
// (the media location: reads an absolute http URL with XMLHttpRequest and writes its responseText) and res_xhr_rel
// (reads the game's own data/rel.txt by a relative URL and writes the decoded response).
(window.E2E_RES = window.E2E_RES || { order: [] }).order.push('one');
function mark(qa, text) {
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
}
window.addEventListener('qspider-event', function (e) {
  if (e.detail.name === 'res_start') {
    mark('res-start-seen', 'RES SCRIPT SAW START');
    // Reads the FontFace status without requesting a load: true only if the game start waited for the font.
    const fontReady = Array.from(document.fonts).some(function (f) {
      return f.family.indexOf('E2eFont') >= 0 && f.status === 'loaded';
    });
    const one = getComputedStyle(document.documentElement).getPropertyValue('--e2e-one').trim();
    mark('res-start-ready', 'RES START ONE=' + one);
    mark('res-start-font', 'RES START FONT=' + fontReady);
  }
  if (e.detail.name === 'res_show') mark('res-script-one', 'RES SCRIPT ONE');
  if (e.detail.name === 'res_xhr') {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://127.0.0.1:47631/ext.txt');
    xhr.onload = function () {
      mark('res-xhr', xhr.responseText);
    };
    xhr.send();
  }
  if (e.detail.name === 'res_xhr_rel') {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/rel.txt');
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      // The desktop shim answers through response; its responseText stays empty while it replaces a request.
      mark('xhr-rel', new TextDecoder().decode(xhr.response));
    };
    xhr.send();
  }
});
