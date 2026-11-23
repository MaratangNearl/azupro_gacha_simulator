(() => {
  const storageKey = 'azur-promilia-theme';
  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function setTheme(theme) {
    root.dataset.theme = theme;
    themeColor.content = theme === 'dark' ? '#100e1b' : '#f7f2fb';
  }

  try {
    if (localStorage.getItem(storageKey) === 'dark') setTheme('dark');
  } catch {
    // The toggle still works for this page when storage is unavailable.
  }

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme-toggle');
    const label = document.getElementById('theme-label');
    const icon = document.getElementById('theme-icon');

    function renderToggle() {
      const isDark = root.dataset.theme === 'dark';
      label.textContent = isDark ? '라이트 모드' : '다크 모드';
      button.title = `${label.textContent}로 전환`;
      button.setAttribute('aria-label', button.title);
      icon.setAttribute('href', isDark ? '#icon-sun' : '#icon-moon');
    }

    button.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(theme);
      renderToggle();
      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        // Keep the selected theme for the current page.
      }
    });

    renderToggle();
  });
})();
