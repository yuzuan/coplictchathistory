(function () {
  var THEME_KEY = "copilot-chat-sync.theme";
  var prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var params = new URLSearchParams(window.location.search);
  var explicitTheme = params.get('theme');
  var embedded = params.get('embedded') === '1';
  var root = document.documentElement;

  function safeGetTheme() {
    if (explicitTheme === 'light' || explicitTheme === 'dark' || explicitTheme === 'auto') {
      return explicitTheme;
    }

    try {
      var stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored;
      }
    } catch (error) {
      // ignore
    }

    return 'auto';
  }

  function resolveTheme(choice) {
    if (choice === 'light' || choice === 'dark') {
      return choice;
    }
    return prefersDark && prefersDark.matches ? 'dark' : 'light';
  }

  function applyTheme() {
    root.setAttribute('data-theme', resolveTheme(safeGetTheme()));
  }

  if (embedded) {
    document.body.setAttribute('data-embedded', 'true');
  }

  applyTheme();

  if (prefersDark && typeof prefersDark.addEventListener === 'function') {
    prefersDark.addEventListener('change', function () {
      if (safeGetTheme() === 'auto') {
        applyTheme();
      }
    });
  }
})();