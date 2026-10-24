/* global document */
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
  var marker = document.createElement('div');
  marker.setAttribute('data-qa', 'e2e-theme-script');
  marker.textContent = 'THEME SCRIPT RAN';
  box.appendChild(marker);
})();
