(function () {
  var STORAGE_KEY = 'espejo-settings';

  function readSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      /* storage unavailable, ignore */
    }
  }

  // Word + text size + draw rate controls, wired straight to the sketch's globals.
  var wordInput = document.getElementById('wordInput');
  var sizeSlider = document.getElementById('sizeSlider');
  var sizeValue = document.getElementById('sizeValue');
  var rateSlider = document.getElementById('rateSlider');
  var rateValue = document.getElementById('rateValue');

  var saved = readSettings() || {};

  if (wordInput && typeof saved.word === 'string') {
    wordInput.value = saved.word;
    window.inputText = saved.word;
  }
  if (sizeSlider && typeof saved.size === 'number') {
    sizeSlider.value = saved.size;
    window.fontSize = saved.size;
    if (sizeValue) sizeValue.textContent = saved.size;
  }
  if (rateSlider && typeof saved.rate === 'number') {
    rateSlider.value = saved.rate;
    window.drawRate = saved.rate;
    if (rateValue) rateValue.textContent = saved.rate;
  }

  function persist() {
    writeSettings({
      word: wordInput ? wordInput.value : undefined,
      size: sizeSlider ? Number(sizeSlider.value) : undefined,
      rate: rateSlider ? Number(rateSlider.value) : undefined
    });
  }

  if (wordInput) {
    wordInput.addEventListener('input', function () {
      window.inputText = wordInput.value;
      persist();
    });
  }

  if (sizeSlider) {
    sizeSlider.addEventListener('input', function () {
      window.fontSize = Number(sizeSlider.value);
      if (sizeValue) sizeValue.textContent = sizeSlider.value;
      persist();
    });
  }

  if (rateSlider) {
    rateSlider.addEventListener('input', function () {
      window.drawRate = Number(rateSlider.value);
      if (rateValue) rateValue.textContent = rateSlider.value;
      persist();
    });
  }

  // Cmd/Ctrl + I saves the current frame as a PNG.
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      if (typeof saveCanvas === 'function' && typeof gd !== 'undefined') {
        saveCanvas(gd.timestamp(), 'png');
      }
    }
  });
})();
