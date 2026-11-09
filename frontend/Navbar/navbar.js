// frontend/Navbar/navbar.js
// Reusable navbar loader & behavior for Record Vault pages

(function loadNavbar() {
  const mount = document.getElementById('navbar');
  if (!mount) return;

  fetch('../Navbar/navbar.html')
    .then(response => {
      if (!response.ok) throw new Error(`Navbar fetch error: ${response.status}`);
      return response.text();
    })
    .then(html => {
      mount.innerHTML = html;
      initNavbar();
    })
    .catch(err => console.error('Navbar load failed:', err));
})();

function initNavbar() {
  /* ---------- THEME ---------- */
  const root = document.documentElement;
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');
  const toggleBtn = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    root.classList.toggle('dark', theme === 'dark');
    if (sunIcon) sunIcon.classList.toggle('hidden', theme !== 'dark');
    if (moonIcon) moonIcon.classList.toggle('hidden', theme === 'dark');
    localStorage.setItem('theme', theme);
  }

  const stored = localStorage.getItem('theme');
  const initial = stored
    ? stored
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(initial);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      applyTheme(root.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  /* ---------- ACTIVE LINK ---------- */
  const currentPage = document.body.dataset.page || '';
  document.querySelectorAll('[data-nav-link]').forEach(link => {
    if (link.dataset.navLink === currentPage) {
      link.classList.add(
        'bg-indigo-50', 'text-indigo-700',
        'dark:bg-indigo-500/10', 'dark:text-indigo-300'
      );
    }
  });

  /* ---------- MOBILE MENU ---------- */
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      hamburger.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- AUTH STATE ---------- */
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  if (auth) {
    const desktopAuth = document.getElementById('nav-auth-desktop');
    const mobileAuth = document.getElementById('nav-auth-mobile');
    const photoSrc = auth.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.name || 'User')}&background=4f46e5&color=fff`;

    if (desktopAuth) {
      desktopAuth.innerHTML = `
        <div class="relative group flex items-center">
          <!-- Hover tab beside profile picture -->
          <div class="pointer-events-none group-hover:pointer-events-auto opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 invisible group-hover:visible transition-all duration-200 absolute right-full top-1/2 -translate-y-1/2 mr-3 pr-2 z-50">
            <div class="relative w-64 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/95 dark:shadow-2xl dark:shadow-black/50">
              <!-- Pointer arrow pointing right toward the profile picture -->
              <div class="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 border-r border-t border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900"></div>
              
              <div class="relative z-10 flex flex-col gap-1">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <span class="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Account</span>
                </div>
                <p class="truncate text-sm font-bold text-slate-900 dark:text-white" title="${auth.name || 'User'}">
                  ${auth.name || 'User'}
                </p>
                <p class="truncate text-xs text-slate-500 dark:text-slate-400" title="${auth.email || ''}">
                  ${auth.email || 'No email associated'}
                </p>

                <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
                  <a href="../Profile/profile.html" class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition">
                    Profile
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5l7 7-7 7" /></svg>
                  </a>
                  <button id="nav-logout" type="button" class="rounded-md px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-950/40 transition">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- User Profile Photo trigger -->
          <a
            id="nav-user-photo-btn"
            href="../Profile/profile.html"
            aria-label="User profile"
            class="relative flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-indigo-500/40 hover:ring-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-sm hover:scale-105 active:scale-95"
          >
            <img
              src="${photoSrc}"
              alt="${auth.name || 'User profile'}"
              class="h-full w-full rounded-full object-cover"
              onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(auth.name || 'User')}&background=4f46e5&color=fff';"
            />
          </a>
        </div>
      `;
    }

    if (mobileAuth) {
      mobileAuth.innerHTML = `
        <div class="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
          <img
            src="${photoSrc}"
            alt="${auth.name || 'User'}"
            class="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/30"
            onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(auth.name || 'User')}&background=4f46e5&color=fff';"
          />
          <div class="flex-1 min-w-0">
            <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">${auth.name || 'User'}</p>
            <p class="truncate text-xs text-slate-500 dark:text-slate-400">${auth.email || ''}</p>
          </div>
        </div>
        <div class="mt-2 flex items-center gap-2">
          <a href="../Profile/profile.html" class="flex-1 rounded-xl bg-indigo-600 py-2 text-center text-xs font-semibold text-white shadow-sm hover:bg-indigo-500">
            View Profile
          </a>
          <button id="nav-logout-mobile" type="button" class="flex-1 rounded-xl border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Sign Out
          </button>
        </div>
      `;
    }

    const logout = (e) => {
      e?.preventDefault();
      localStorage.removeItem('auth');
      if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().catch(() => {});
      }
      window.location.href = '../Auth/login.html';
    };
    document.getElementById('nav-logout')?.addEventListener('click', logout);
    document.getElementById('nav-logout-mobile')?.addEventListener('click', logout);
  }
}
