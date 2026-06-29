/**
 * Navbar Component
 * Reusable navigation bar with mobile drawer support
 */

export function renderNavbar() {
    return `
    <!-- Sticky Top Navigation Bar -->
    <nav class="top-nav" id="navbar" style="display: none;">
        <div class="nav-container">
            <a href="dashboard.html" class="nav-brand">
                <svg class="brand-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22H22L12 2Z" fill="url(#brandGrad)"/><circle cx="12" cy="14" r="3" fill="#ffffff"/><defs><linearGradient id="brandGrad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse"><stop stop-color="#2563EB"/><stop offset="1" stop-color="#10B981"/></linearGradient></defs></svg>
                <span>Lakshya</span><span class="brand-blue">₹100K</span>
            </a>
            
            <div class="nav-links">
                <a href="dashboard.html" class="nav-link">Home</a>
                <a href="add-saving.html" class="nav-link">Add Saving</a>
                <a href="history.html" class="nav-link">History</a>
                <a href="analytics.html" class="nav-link">Analytics</a>
                <a href="gallery.html" class="nav-link">Gallery</a>
                <a href="achievements.html" class="nav-link">Achievements</a>
                <a href="settings.html" class="nav-link">Settings</a>
            </div>
            
            <div class="nav-right">
                <button class="nav-icon-btn" id="themeToggle" title="Toggle Theme">
                    <i data-lucide="moon"></i>
                </button>
                <div class="profile-dropdown" id="profileDropdown">
                    <button class="avatar-btn" id="avatarDropdownToggle">
                        <div class="avatar-circle" id="userAvatar">U</div>
                    </button>
                    <div class="dropdown-menu">
                        <div style="padding: 12px 16px; font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;" id="usernameDisplay">@username</div>
                        <div class="dropdown-divider"></div>
                        <a href="profile.html" class="dropdown-item">
                            <i data-lucide="user"></i> Profile
                        </a>
                        <a href="settings.html" class="dropdown-item">
                            <i data-lucide="settings"></i> Settings
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item logout" id="logoutBtn">
                            <i data-lucide="log-out"></i> Logout
                        </a>
                    </div>
                </div>
                <button class="hamburger" id="mobileMenuBtn">
                    <i data-lucide="menu"></i>
                </button>
            </div>
        </div>
    </nav>
    
    <!-- Mobile Navigation Drawer -->
    <div class="mobile-drawer" id="mobileDrawer">
        <div class="drawer-header">
            <a href="dashboard.html" class="nav-brand">
                <svg class="brand-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22H22L12 2Z" fill="url(#brandGrad)"/><circle cx="12" cy="14" r="3" fill="#ffffff"/><defs><linearGradient id="brandGrad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse"><stop stop-color="#2563EB"/><stop offset="1" stop-color="#10B981"/></linearGradient></defs></svg>
                <span>Lakshya</span><span class="brand-blue">₹100K</span>
            </a>
            <button class="close-btn" id="closeDrawerBtn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="drawer-links">
            <a href="dashboard.html" class="drawer-link">Home</a>
            <a href="add-saving.html" class="drawer-link">Add Saving</a>
            <a href="history.html" class="drawer-link">History</a>
            <a href="analytics.html" class="drawer-link">Analytics</a>
            <a href="gallery.html" class="drawer-link">Gallery</a>
            <a href="achievements.html" class="drawer-link">Achievements</a>
            <a href="settings.html" class="drawer-link">Settings</a>
            <div class="drawer-divider"></div>
            <a href="profile.html" class="drawer-link"><i data-lucide="user" style="display:inline; vertical-align:middle; margin-right:8px;"></i>Profile</a>
            <a href="settings.html" class="drawer-link"><i data-lucide="settings" style="display:inline; vertical-align:middle; margin-right:8px;"></i>Settings</a>
            <a href="#" class="drawer-link logout" id="drawerLogoutBtn"><i data-lucide="log-out" style="display:inline; vertical-align:middle; margin-right:8px;"></i>Logout</a>
        </div>
    </div>
    <div class="drawer-overlay" id="drawerOverlay"></div>
    `;
}

export function setupNavbarEventListeners(logoutUser) {
    const avatarBtn = document.getElementById('avatarDropdownToggle');
    const profileDropdown = document.getElementById('profileDropdown');
    if (avatarBtn && profileDropdown) {
        avatarBtn.addEventListener('click', e => { e.stopPropagation(); profileDropdown.classList.toggle('open'); });
        document.addEventListener('click', () => profileDropdown.classList.remove('open'));
    }
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    if (mobileMenuBtn && mobileDrawer && drawerOverlay) {
        mobileMenuBtn.addEventListener('click', () => { mobileDrawer.classList.add('open'); drawerOverlay.classList.add('open'); });
        const closeDrawer = () => { mobileDrawer.classList.remove('open'); drawerOverlay.classList.remove('open'); };
        drawerOverlay.addEventListener('click', closeDrawer);
        if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    const drawerLogoutBtn = document.getElementById('drawerLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', async e => { e.preventDefault(); await logoutUser(); });
    if (drawerLogoutBtn) drawerLogoutBtn.addEventListener('click', async e => { e.preventDefault(); await logoutUser(); });
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); themeToggle.innerHTML = '<i data-lucide="sun"></i>'; }
        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            lucide.createIcons();
        });
    }
}
