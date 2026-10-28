/**
 * BoardsBuddy - UI Utilities & Shared Components
 * Manages Toast Notifications, Theme Toggling, Navigation Tabs, Search, and Modals.
 */

const UI = (function () {
  const config = window.BOARDSBUDDY_CONFIG || {};

  /* ==========================================================================
     1. Theme Management (Light / Dark Mode)
     ========================================================================== */
  function initTheme() {
    const savedTheme = localStorage.getItem(config.STORAGE_KEYS.THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyTheme(activeTheme);

    // Watch system changes if user hasn't explicitly set theme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(config.STORAGE_KEYS.THEME)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateThemeToggleIcons(theme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(config.STORAGE_KEYS.THEME, newTheme);
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info', 2000);
  }

  function updateThemeToggleIcons(theme) {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    btns.forEach(btn => {
      if (theme === 'dark') {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
        btn.setAttribute('title', 'Switch to Light Mode');
        btn.setAttribute('aria-label', 'Switch to Light Mode');
      } else {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
        btn.setAttribute('title', 'Switch to Dark Mode');
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
    });
  }

  /* ==========================================================================
     2. Toast Notifications
     ========================================================================== */
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
      error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    toast.innerHTML = `
      <div style="flex-shrink: 0; margin-top: 1px;">${icons[type] || icons.info}</div>
      <div style="flex: 1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  /* ==========================================================================
     3. Horizontal Study Navigation Tabs (The Unified 6 Tabs)
     ========================================================================== */
  function renderStudyNav(activeTabKey) {
    const navPlaceholder = document.getElementById('study-nav-placeholder');
    if (!navPlaceholder) return;

    // Detect path depth to support both /pages/ and root /index.html
    const isPagesDir = window.location.pathname.includes('/pages/');
    const prefix = isPagesDir ? '' : 'pages/';

    const tabs = [
      {
        key: 'textbooks',
        label: 'TextBooks',
        url: `${prefix}textbooks.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
      },
      {
        key: 'notes',
        label: 'Notes',
        url: `${prefix}notes.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
      },
      {
        key: 'short-notes',
        label: 'Short Notes',
        url: `${prefix}short-notes.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
      },
      {
        key: 'pyqs',
        label: 'PYQs',
        url: `${prefix}pyqs.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
      },
      {
        key: 'chapterwise-pyqs',
        label: 'Chapterwise PYQs',
        url: `${prefix}chapterwise-pyqs.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`
      },
      {
        key: 'pyq-solutions',
        label: 'PYQ Solutions',
        url: `${prefix}pyq-solutions.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      }
    ];

    navPlaceholder.innerHTML = `
      <nav class="study-nav-bar" aria-label="Study Resource Categories">
        <div class="study-nav-container">
          <ul class="study-tabs-list">
            ${tabs.map(tab => `
              <li class="study-tab-item">
                <a href="${tab.url}" class="study-tab-link ${tab.key === activeTabKey ? 'active' : ''}">
                  ${tab.icon}
                  <span>${tab.label}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      </nav>
    `;
  }

  /* ==========================================================================
     4. Global Header Dynamic User & Board Context
     ========================================================================== */
  async function updateHeaderContext() {
    const isPagesDir = window.location.pathname.includes('/pages/');
    const isRoot = !isPagesDir && !window.location.pathname.includes('/admin/');
    const homeUrl = isRoot ? 'index.html' : '../index.html';
    const selectUrl = isPagesDir ? 'select.html' : 'pages/select.html';
    const authUrl = isPagesDir ? 'auth.html' : 'pages/auth.html';
    const profileUrl = isPagesDir ? 'profile.html' : 'pages/profile.html';

    const selectedBoard = localStorage.getItem(config.STORAGE_KEYS.SELECTED_BOARD) || config.DEFAULTS.BOARD_NAME;
    const selectedClass = localStorage.getItem(config.STORAGE_KEYS.SELECTED_CLASS) || config.DEFAULTS.CLASS_NAME;

    // Update board/class pill if exists
    const pill = document.querySelector('.board-class-pill');
    if (pill) {
      pill.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        <span>${selectedBoard} • ${selectedClass}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;"><path d="M6 9l6 6 6-6"/></svg>
      `;
      pill.setAttribute('href', selectUrl);
      pill.setAttribute('title', 'Change Board or Class');
    }

    // Check user auth status
    const userContainer = document.getElementById('header-user-actions');
    if (userContainer && window.AuthService) {
      const user = await window.AuthService.getCurrentUser();
      const isAdmin = await window.AuthService.checkIsAdmin();

      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
        userContainer.innerHTML = `
          ${isAdmin ? `<a href="${isPagesDir ? '../admin/index.html' : 'admin/index.html'}" class="btn btn-sm btn-outline" style="border-color: #ef4444; color: #ef4444;">Admin Portal</a>` : ''}
          <a href="${profileUrl}" class="btn btn-sm btn-secondary" title="View Account Profile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>${name}</span>
          </a>
          <button id="logout-btn" class="btn btn-sm btn-ghost" title="Logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        `;
        document.getElementById('logout-btn')?.addEventListener('click', () => {
          window.AuthService.signOut();
        });
      } else {
        userContainer.innerHTML = `
          <a href="${authUrl}#login" class="btn btn-sm btn-ghost">Login</a>
          <a href="${authUrl}#signup" class="btn btn-sm btn-primary">Sign Up</a>
        `;
      }
    }
  }

  /* ==========================================================================
     5. Global Search Dialog Modal (Ctrl + K)
     ========================================================================== */
  function initGlobalSearch() {
    let dialog = document.getElementById('search-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'search-dialog';
      dialog.className = 'modal search-modal-box';
      dialog.innerHTML = `
        <div class="search-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="global-search-input" placeholder="Search chapters, formulas, notes, or PYQs..." autocomplete="off">
          <kbd class="kbd-shortcut">ESC</kbd>
        </div>
        <div id="search-dialog-results" class="search-results-list">
          <div class="text-center text-muted" style="padding: 2rem;">Type to start searching...</div>
        </div>
      `;
      document.body.appendChild(dialog);

      // Close on backdrop click
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });

      const input = dialog.querySelector('#global-search-input');
      const resultsContainer = dialog.querySelector('#search-dialog-results');

      let debounceTimer = null;
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          const query = input.value.trim();
          if (!query) {
            resultsContainer.innerHTML = '<div class="text-center text-muted" style="padding: 2rem;">Type to start searching...</div>';
            return;
          }

          resultsContainer.innerHTML = '<div class="text-center text-muted" style="padding: 2rem;">Searching...</div>';
          if (window.DbService) {
            const results = await window.DbService.searchResources(query);
            if (results.length === 0) {
              resultsContainer.innerHTML = `<div class="text-center text-muted" style="padding: 2rem;">No study materials found for "${query}".</div>`;
              return;
            }

            const isPages = window.location.pathname.includes('/pages/');
            const viewerUrl = isPages ? 'viewer.html' : 'pages/viewer.html';

            resultsContainer.innerHTML = results.map(r => `
              <a href="${viewerUrl}?resourceId=${r.id}" class="search-result-item">
                <div>
                  <div style="font-weight: 600; font-size: 0.95rem;">${r.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${r.subjects?.name || 'Class 10'} • ${r.type.toUpperCase().replace('_', ' ')}</div>
                </div>
                <span class="badge badge-primary">${r.type}</span>
              </a>
            `).join('');
          }
        }, 250);
      });
    }

    // Bind Ctrl+K and search button triggers
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      }
    });

    document.querySelectorAll('.header-search-btn').forEach(btn => {
      btn.addEventListener('click', openSearchModal);
    });
  }

  function openSearchModal() {
    const dialog = document.getElementById('search-dialog');
    if (dialog) {
      dialog.showModal();
      setTimeout(() => dialog.querySelector('#global-search-input')?.focus(), 50);
    }
  }

  /* ==========================================================================
     6. Simple Mathematical & Markdown Text Formatter
     ========================================================================== */
  function formatContent(text) {
    if (!text) return '';
    let html = text
      // Headings
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Inline math $$ or `
      .replace(/\$\$(.*?)\$\$/gim, '<span class="math-block" style="font-family: var(--font-mono); background: var(--bg-surface-muted); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; color: var(--primary-600);">$1</span>')
      .replace(/\$(.*?)\$/gim, '<span class="math-inline" style="font-family: var(--font-mono); background: var(--bg-surface-muted); padding: 0.1rem 0.35rem; border-radius: 4px; color: var(--primary-600);">$1</span>')
      .replace(/`([^`]+)`/gim, '<code style="font-family: var(--font-mono); background: var(--bg-surface-muted); padding: 0.1rem 0.4rem; border-radius: 4px;">$1</code>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--primary-500); padding-left: 1rem; color: var(--text-secondary); margin: 1rem 0; font-style: italic;">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid var(--border-subtle); margin: 2rem 0;">')
      // Newlines to breaks
      .replace(/\n\n/gim, '<p style="margin-bottom: 1rem;"></p>');

    return html;
  }

  /* ==========================================================================
     7. Protected Navigation Interceptor
     Redirects logged-out visitors clicking protected sections to login/signup
     ========================================================================== */
  function initProtectedNavigation() {
    const protectedPages = [
      'notes.html',
      'short-notes.html',
      'chapterwise-pyqs.html',
      'pyq-solutions.html',
      '/notes',
      '/short-notes',
      '/chapterwise-pyqs',
      '/pyq-solutions'
    ];

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      const isProtected = protectedPages.some(page => {
        return href.endsWith(page) || href.includes(page + '?') || href.includes(page + '#') || href.includes(page + '/');
      });

      if (!isProtected) return;

      if (window.AuthService && typeof window.AuthService.hasUserSessionSync === 'function') {
        const hasSession = window.AuthService.hasUserSessionSync();
        if (!hasSession) {
          e.preventDefault();
          const message = 'Please log in or create an account to access this content.';
          const isPagesDir = window.location.pathname.includes('/pages/');
          const authPath = isPagesDir ? 'auth.html' : 'pages/auth.html';

          let targetUrl;
          try {
            const resolved = new URL(href, window.location.href);
            targetUrl = resolved.pathname + resolved.search + resolved.hash;
          } catch (_) {
            targetUrl = href;
          }

          window.location.href = `${authPath}?redirect=${encodeURIComponent(targetUrl)}&message=${encodeURIComponent(message)}`;
        }
      }
    });
  }

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateHeaderContext();
    initGlobalSearch();
    initProtectedNavigation();

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });

  return {
    initTheme,
    toggleTheme,
    showToast,
    renderStudyNav,
    updateHeaderContext,
    initGlobalSearch,
    openSearchModal,
    formatContent
  };
})();

window.UI = UI;
