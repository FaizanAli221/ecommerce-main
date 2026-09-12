// Theme Initialization (runs immediately to prevent flash of unstyled content)
(function() {
  const savedTheme = localStorage.getItem('theme');
  const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (userPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

async function initBackendConnection() {
  const banner = document.getElementById('backend-status');
  if (!banner) return true;

  const setBanner = (type, html) => {
    banner.className = `backend-status backend-status--${type}`;
    banner.innerHTML = html;
    banner.hidden = false;
  };

  const hideBanner = () => {
    banner.hidden = true;
    banner.className = 'backend-status backend-status--ok';
    banner.innerHTML = '';
  };

  if (window.location.protocol === 'file:') {
    setBanner(
      'error',
      `<strong>Wrong way to open the site.</strong> Run <code>npm start</code>, then open 
      <a href="http://localhost:${API_PORT}">http://localhost:${API_PORT}</a> — do not double-click HTML files.`
    );
    return false;
  }

  try {
    const health = await API.checkHealth();

    if (health.mongo === 'connected') {
      hideBanner();
      return true;
    }

    if (health.mongo === 'disconnected') {
      setBanner(
        'warn',
        `<strong>API connected</strong> — database is still connecting. 
        <a href="#" onclick="location.reload();return false">Refresh</a> in a few seconds.`
      );
      return false;
    }

    hideBanner();
    return true;
  } catch {
    setBanner(
      'error',
      `<strong>Cannot reach backend.</strong> In the project folder run <code>npm start</code>, 
      then open <a href="http://localhost:${API_PORT}">http://localhost:${API_PORT}</a>`
    );
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initBackendConnection();

  // Setup theme toggle buttons dynamically
  const themeToggleBtns = document.querySelectorAll('#theme-toggle-btn, .theme-toggle-btn');
  
  const updateToggleIcons = (theme) => {
    themeToggleBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
      }
    });
  };

  const currentTheme = document.documentElement.getAttribute('data-theme');
  updateToggleIcons(currentTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme');
      const target = current === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('theme', target);
      updateToggleIcons(target);
    });
  });
});

