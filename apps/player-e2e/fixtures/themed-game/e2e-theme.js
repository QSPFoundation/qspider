/* global document */
(function () {
  var marker = document.createElement('div');
  marker.setAttribute('data-qa', 'e2e-theme-script');
  marker.textContent = 'THEME SCRIPT RAN';
  document.body.appendChild(marker);
})();
