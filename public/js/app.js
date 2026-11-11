// Main Frontend Logic for Obsolete Sector: Personal Creative Hub & Games Archive
document.addEventListener('DOMContentLoaded', () => {
    let allGames = [];
    let currentSelectedGame = null;
    let currentFilter = 'ALL';

    // User & Authentication State
    let currentUser = null;
    let authToken = localStorage.getItem('auth_token') || '';

    // Reactions State
    let gameReactions = {};
    let userReactionsMap = {};

    // DOM Elements - Catalogue
    const gamesListEl = document.getElementById('catalogueList');
    const previewImgEl = document.getElementById('cataloguePreviewImg');
    const catTitleEl = document.getElementById('catTitle');
    const catSubtitleEl = document.getElementById('catSubtitle');
    const catVersionEl = document.getElementById('catVersion');
    const catTagsEl = document.getElementById('catTags');
    const catDescEl = document.getElementById('catDesc');
    const catSizeEl = document.getElementById('catSize');
    const catDateEl = document.getElementById('catDate');
    const catDownloadsEl = document.getElementById('catDownloads');
    const btnDownloadEl = document.getElementById('btnDownload');
    const btnDetailsEl = document.getElementById('btnDetails');
    const btnPlayBrowserEl = document.getElementById('btnPlayBrowser');
    const updatesListEl = document.getElementById('updatesList');
    const tabGamesCountEl = document.getElementById('tabGamesCount');

    const musicGridEl = document.getElementById('musicGrid');
    const guestbookListEl = document.getElementById('guestbookList');
    const guestbookForm = document.getElementById('guestbookForm');
    const gbStatusEl = document.getElementById('gbStatus');
    const gbGuestWarning = document.getElementById('gbGuestWarning');
    const gbUserNotice = document.getElementById('gbUserNotice');
    const gbUserCallsign = document.getElementById('gbUserCallsign');
    const btnGbPromptAuth = document.getElementById('btnGbPromptAuth');

    // Controls
    const themeBtn = document.getElementById('themeToggleBtn');
    const crtBtn = document.getElementById('crtToggleBtn');
    const audioBtn = document.getElementById('audioToggleBtn');
    const authBtn = document.getElementById('authBtn');
    const adminUploadBtn = document.getElementById('adminUploadBtn');
    const terminalDrawer = document.getElementById('terminalDrawer');
    const terminalInput = document.getElementById('terminalInput');
    const terminalLog = document.getElementById('terminalLog');
    const terminalCloseBtn = document.getElementById('terminalCloseBtn');
    const openTerminalLinks = document.querySelectorAll('.open-terminal-btn');

    // Windows XP Start Menu
    const xpStartBtn = document.getElementById('xpStartBtn');
    const xpStartMenu = document.getElementById('xpStartMenu');

    // Windows XP Download Dialog Elements
    const downloadDialog = document.getElementById('downloadDialog');
    const dlDialogClose = document.getElementById('dlDialogClose');
    const dlDialogTitle = document.getElementById('dlDialogTitle');
    const dlProgressBar = document.getElementById('dlProgressBar');
    const dlTimeLeft = document.getElementById('dlTimeLeft');
    const dlBtnConfirm = document.getElementById('dlBtnConfirm');
    const dlBtnCancel = document.getElementById('dlBtnCancel');

    // Modals
    const gameModal = document.getElementById('gameModal');
    const modalClose = document.getElementById('modalClose');
    const playModal = document.getElementById('playModal');
    const playModalClose = document.getElementById('playModalClose');
    const playIframe = document.getElementById('playIframe');

    // Auth Modal Elements
    const authModal = document.getElementById('authModal');
    const authModalClose = document.getElementById('authModalClose');
    const authModalTitle = document.getElementById('authModalTitle');
    const authTabLogin = document.getElementById('authTabLogin');
    const authTabRegister = document.getElementById('authTabRegister');
    const authTabSocial = document.getElementById('authTabSocial');
    const authPaneLogin = document.getElementById('authPaneLogin');
    const authPaneRegister = document.getElementById('authPaneRegister');
    const authPaneSocial = document.getElementById('authPaneSocial');
    const loginForm = document.getElementById('loginForm');
    const loginIdentifier = document.getElementById('loginIdentifier');
    const loginPassword = document.getElementById('loginPassword');
    const registerForm = document.getElementById('registerForm');
    const regUsername = document.getElementById('regUsername');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const authStatusMsg = document.getElementById('authStatusMsg');
    const socialProviderBtns = document.querySelectorAll('.social-provider-btn');
    const socialUsernameBox = document.getElementById('socialUsernameBox');
    const socialProviderLabel = document.getElementById('socialProviderLabel');
    const socialUsername = document.getElementById('socialUsername');
    const btnSubmitSocial = document.getElementById('btnSubmitSocial');
    let selectedSocialProvider = 'google';

    // Clocks
    const winClockEl = document.getElementById('winClock');
    const trayClockEl = document.getElementById('trayClock');

    function updateClocks() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const shortTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (winClockEl) winClockEl.textContent = `⏰ ${timeStr}`;
        if (trayClockEl) trayClockEl.textContent = shortTimeStr;
    }
    setInterval(updateClocks, 1000);
    updateClocks();

    // 1. Theme Setup (Windows XP Luna is default)
    const themes = ['xp-luna', 'win98', 'backrooms', 'dark', 'green', 'amber', 'blood'];
    const savedTheme = localStorage.getItem('crt_theme') || 'xp-luna';
    setTheme(savedTheme);

    // Initialize CRT Scanlines
    const crtEnabled = localStorage.getItem('crt_scanlines') !== 'false';
    setCRT(crtEnabled);

    // Initialize Audio state
    updateAudioBtnState();

    // ========================================================================
    // AUTHENTICATION & USER PROFILE MANAGEMENT
    // ========================================================================

    async function checkAuth() {
        if (!authToken) {
            currentUser = null;
            updateUserUI();
            return;
        }

        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.authenticated && data.user) {
                currentUser = data.user;
            } else {
                currentUser = null;
                authToken = '';
                localStorage.removeItem('auth_token');
            }
        } catch (e) {
            console.warn('Auth check error:', e);
            currentUser = null;
        }
        updateUserUI();
    }

    function updateUserUI() {
        if (currentUser) {
            // Logged in
            if (currentUser.role === 'admin') {
                authBtn.textContent = `[ADMIN: ${currentUser.username}] LOGOUT`;
                authBtn.title = 'Click to log out of Administrator account';
                if (adminUploadBtn) adminUploadBtn.style.display = 'inline-flex';
            } else {
                authBtn.textContent = `[USER: ${currentUser.username}] LOGOUT`;
                authBtn.title = 'Click to log out';
                if (adminUploadBtn) adminUploadBtn.style.display = 'none';
            }

            if (gbGuestWarning) gbGuestWarning.style.display = 'none';
            if (gbUserNotice) gbUserNotice.style.display = 'block';
            if (gbUserCallsign) {
                gbUserCallsign.textContent = `${currentUser.username} (${currentUser.role.toUpperCase()})`;
            }
        } else {
            // Guest
            authBtn.textContent = 'LOGIN / REGISTER';
            authBtn.title = 'Sign in or register an account for downloads & transmissions';
            if (adminUploadBtn) adminUploadBtn.style.display = 'none';

            if (gbGuestWarning) gbGuestWarning.style.display = 'flex';
            if (gbUserNotice) gbUserNotice.style.display = 'none';
        }

        // Re-render guestbook if loaded to update moderation buttons
        loadGuestbook();
    }

    authBtn.addEventListener('click', () => {
        if (currentUser) {
            if (confirm(`Terminate current session for [${currentUser.username}]?`)) {
                logout();
            }
        } else {
            openAuthModal('OPERATOR AUTHENTICATION', 'login');
        }
    });

    if (btnGbPromptAuth) {
        btnGbPromptAuth.addEventListener('click', () => {
            openAuthModal('Sign in or register to transmit entries to the visitor log.', 'login');
        });
    }

    async function logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
        } catch (e) {}

        authToken = '';
        currentUser = null;
        localStorage.removeItem('auth_token');
        updateUserUI();
        if (window.soundEngine) window.soundEngine.playSelect();
    }

    // Auth Modal Logic
    function openAuthModal(noticeText = '', defaultTab = 'login') {
        if (authStatusMsg) {
            authStatusMsg.textContent = noticeText;
            authStatusMsg.style.color = 'var(--accent)';
        }
        switchAuthTab(defaultTab);
        authModal.classList.add('open');
        if (window.soundEngine) window.soundEngine.playSelect();
    }

    function closeAuthModal() {
        authModal.classList.remove('open');
        if (authStatusMsg) authStatusMsg.textContent = '';
    }

    if (authModalClose) authModalClose.addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    function switchAuthTab(tab) {
        [authTabLogin, authTabRegister, authTabSocial].forEach(t => t.classList.remove('active-auth-tab'));
        authPaneLogin.style.display = 'none';
        authPaneRegister.style.display = 'none';
        authPaneSocial.style.display = 'none';

        if (tab === 'login') {
            authTabLogin.classList.add('active-auth-tab');
            authPaneLogin.style.display = 'block';
            loginIdentifier.focus();
        } else if (tab === 'register') {
            authTabRegister.classList.add('active-auth-tab');
            authPaneRegister.style.display = 'block';
            regUsername.focus();
        } else if (tab === 'social') {
            authTabSocial.classList.add('active-auth-tab');
            authPaneSocial.style.display = 'block';
        }
    }

    authTabLogin.addEventListener('click', () => switchAuthTab('login'));
    authTabRegister.addEventListener('click', () => switchAuthTab('register'));
    authTabSocial.addEventListener('click', () => switchAuthTab('social'));

    // Handle Login Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = loginIdentifier.value.trim();
        const password = loginPassword.value;
        if (!identifier || !password) return;

        authStatusMsg.textContent = 'Verifying security credentials...';
        authStatusMsg.style.color = 'var(--link-color)';

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                authToken = data.token;
                currentUser = data.user;
                localStorage.setItem('auth_token', authToken);
                updateUserUI();
                closeAuthModal();
                if (window.soundEngine) window.soundEngine.playDownload();
                loadReactions();
            } else {
                authStatusMsg.textContent = data.error || 'Authentication denied.';
                authStatusMsg.style.color = '#ff4444';
            }
        } catch (err) {
            authStatusMsg.textContent = 'Connection error.';
            authStatusMsg.style.color = '#ff4444';
        }
    });

    // Handle Register Submit
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = regUsername.value.trim();
        const email = regEmail.value.trim();
        const password = regPassword.value;
        if (!username || !password) return;

        authStatusMsg.textContent = 'Registering operator clearance...';
        authStatusMsg.style.color = 'var(--link-color)';

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                authToken = data.token;
                currentUser = data.user;
                localStorage.setItem('auth_token', authToken);
                updateUserUI();
                closeAuthModal();
                if (window.soundEngine) window.soundEngine.playDownload();
                loadReactions();
            } else {
                authStatusMsg.textContent = data.error || 'Registration failed.';
                authStatusMsg.style.color = '#ff4444';
            }
        } catch (err) {
            authStatusMsg.textContent = 'Connection error.';
            authStatusMsg.style.color = '#ff4444';
        }
    });

    // Social Provider Buttons (Google, Apple ID, GitHub)
    socialProviderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedSocialProvider = btn.dataset.provider;
            socialProviderLabel.textContent = `LINKING WITH ${selectedSocialProvider.toUpperCase()}`;
            socialUsernameBox.style.display = 'block';
            socialUsername.value = '';
            socialUsername.focus();
            if (window.soundEngine) window.soundEngine.playHover();
        });
    });

    btnSubmitSocial.addEventListener('click', async () => {
        const username = socialUsername.value.trim();
        if (!username) {
            authStatusMsg.textContent = 'Please enter your preferred call-sign / username.';
            authStatusMsg.style.color = '#ff4444';
            return;
        }

        authStatusMsg.textContent = `Authenticating with ${selectedSocialProvider.toUpperCase()}...`;
        authStatusMsg.style.color = 'var(--link-color)';

        try {
            const res = await fetch('/api/auth/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: selectedSocialProvider,
                    username,
                    providerId: `${selectedSocialProvider}_${Date.now()}`
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                authToken = data.token;
                currentUser = data.user;
                localStorage.setItem('auth_token', authToken);
                updateUserUI();
                closeAuthModal();
                if (window.soundEngine) window.soundEngine.playDownload();
                loadReactions();
            } else {
                authStatusMsg.textContent = data.error || 'Social sign-in failed.';
                authStatusMsg.style.color = '#ff4444';
            }
        } catch (err) {
            authStatusMsg.textContent = 'Connection error.';
            authStatusMsg.style.color = '#ff4444';
        }
    });

    // ========================================================================
    // TAB NAVIGATION
    // ========================================================================

    window.switchNavTab = function(tabName) {
        document.querySelectorAll('.xp-tab').forEach(t => {
            if (t.dataset.tab === tabName) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        const tabPaneMap = {
            'about': 'tabPaneAbout',
            'games': 'tabPaneGames',
            'music': 'tabPaneMusic',
            'art': 'tabPaneArt',
            'updates': 'tabPaneUpdates',
            'guestbook': 'tabPaneGuestbook'
        };

        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const activePane = document.getElementById(tabPaneMap[tabName]);
        if (activePane) {
            activePane.classList.add('active');
        }

        if (window.soundEngine) window.soundEngine.playHover();
    };

    document.querySelectorAll('.xp-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            if (tabName) switchNavTab(tabName);
        });
    });

    // XP Start Menu Toggle
    window.toggleStartMenu = function(force) {
        const isOpen = xpStartMenu.classList.contains('open');
        const newState = force !== undefined ? force : !isOpen;
        if (newState) {
            xpStartMenu.classList.add('open');
            if (window.soundEngine) window.soundEngine.playSelect();
        } else {
            xpStartMenu.classList.remove('open');
        }
    };

    if (xpStartBtn) {
        xpStartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleStartMenu();
        });
    }

    document.addEventListener('click', (e) => {
        if (xpStartMenu && !xpStartMenu.contains(e.target) && xpStartBtn && !xpStartBtn.contains(e.target)) {
            toggleStartMenu(false);
        }
    });

    // ========================================================================
    // GAMES ARCHIVE & REACTIONS
    // ========================================================================

    async function loadGames() {
        try {
            const res = await fetch('/api/games');
            allGames = await res.json();
            if (tabGamesCountEl) tabGamesCountEl.textContent = allGames.length;
            renderGamesList();
            if (allGames.length > 0) {
                selectGame(allGames[0]);
            }
            loadReactions();
        } catch (err) {
            console.error('Failed to load games archive:', err);
            gamesListEl.innerHTML = `<div style="padding: 16px; color: var(--accent);">ERROR: Archive connection timed out.</div>`;
        }
    }

    async function loadReactions() {
        try {
            const headers = {};
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
            const res = await fetch('/api/reactions', { headers });
            const data = await res.json();
            gameReactions = data.counts || {};
            userReactionsMap = data.userReactions || {};
            if (currentSelectedGame) {
                updateReactionsUI(currentSelectedGame.id);
            }
        } catch (e) {
            console.warn('Failed to load reactions:', e);
        }
    }

    function updateReactionsUI(gameId) {
        const counts = gameReactions[gameId] || {};
        const userMap = userReactionsMap[gameId] || {};

        document.querySelectorAll('.rx-btn').forEach(btn => {
            const type = btn.dataset.type;
            const countEl = btn.querySelector('.rx-count');
            if (countEl) {
                countEl.textContent = counts[type] || 0;
            }
            if (userMap[type]) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Reaction click listener
    document.querySelectorAll('.rx-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!currentSelectedGame) return;

            if (!currentUser) {
                openAuthModal('🔒 GUEST CLEARANCE RESTRICTION\n\nPlease sign in or create an account to leave reactions.', 'login');
                return;
            }

            const reactionType = btn.dataset.type;
            try {
                const res = await fetch(`/api/games/${currentSelectedGame.id}/reactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ reactionType })
                });
                const data = await res.json();
                if (data.success) {
                    gameReactions = data.reactions.counts || {};
                    userReactionsMap = data.reactions.userReactions || {};
                    updateReactionsUI(currentSelectedGame.id);
                    if (window.soundEngine) window.soundEngine.playSelect();
                }
            } catch (err) {
                console.error('Failed to toggle reaction:', err);
            }
        });
    });

    // Render Games List
    function renderGamesList() {
        gamesListEl.innerHTML = '';
        const filtered = allGames.filter(game => {
            if (currentFilter === 'ALL') return true;
            return game.tags && game.tags.some(t => t.toUpperCase().includes(currentFilter));
        });

        if (filtered.length === 0) {
            gamesListEl.innerHTML = `<div style="padding: 18px; color: var(--text-dim);">No transmissions logged under this frequency.</div>`;
            return;
        }

        filtered.forEach((game) => {
            const row = document.createElement('div');
            row.className = `game-row ${currentSelectedGame && currentSelectedGame.id === game.id ? 'active' : ''}`;
            row.innerHTML = `
                <div class="game-row-title">
                    <span class="game-pointer">></span>
                    <span>${escapeHtml(game.title)}</span>
                </div>
                <div class="game-row-info">
                    <span>${game.tags ? game.tags[0] : 'HORROR'}</span>
                    <span>${escapeHtml(game.fileSize || '')}</span>
                    <span>▼ ${game.downloadsCount || 0}</span>
                </div>
            `;

            row.addEventListener('click', () => {
                selectGame(game);
                if (window.soundEngine) window.soundEngine.playHover();
            });

            gamesListEl.appendChild(row);
        });
    }

    function selectGame(game) {
        currentSelectedGame = game;

        document.querySelectorAll('.game-row').forEach(r => r.classList.remove('active'));
        const activeRows = Array.from(document.querySelectorAll('.game-row')).filter(r =>
            r.querySelector('.game-row-title span:last-child').textContent === game.title
        );
        if (activeRows[0]) activeRows[0].classList.add('active');

        catTitleEl.textContent = game.title;
        catSubtitleEl.textContent = game.subtitle || '';
        catVersionEl.textContent = `v${game.version || '1.0'}`;
        catDescEl.textContent = game.description || '';
        catSizeEl.textContent = `FILE SIZE: ${game.fileSize || 'N/A'}`;
        catDateEl.textContent = `DATE: ${game.releaseDate || 'UNKNOWN'}`;
        catDownloadsEl.textContent = `DOWNLOADS: ${game.downloadsCount || 0}`;

        previewImgEl.src = game.coverImage || '/assets/images/cover_chamber.svg';

        catTagsEl.innerHTML = '';
        (game.tags || []).forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag-badge';
            span.textContent = tag;
            catTagsEl.appendChild(span);
        });

        if (game.playInBrowserUrl && game.playInBrowserUrl.trim() !== '') {
            btnPlayBrowserEl.style.display = 'inline-flex';
            btnPlayBrowserEl.onclick = () => openBrowserPlay(game);
        } else {
            btnPlayBrowserEl.style.display = 'none';
        }

        updateReactionsUI(game.id);
    }

    // ========================================================================
    // DOWNLOAD FLOW (REQUIRES USER ACCOUNT)
    // ========================================================================

    btnDownloadEl.addEventListener('click', (e) => {
        e.preventDefault();
        triggerDownloadFlow(currentSelectedGame);
    });

    function triggerDownloadFlow(game) {
        if (!game) return;

        // Strict RBAC: Guest cannot download without account!
        if (!currentUser) {
            openAuthModal(
                '🔒 GUEST CLEARANCE RESTRICTION\n\nYou must have an active user account to download standalone game archives. Please sign in or create an account (only takes a few seconds).',
                'register'
            );
            return;
        }

        dlDialogTitle.textContent = `Saving: ${game.id}-v${game.version}.zip`;
        dlProgressBar.style.width = '0%';
        dlTimeLeft.textContent = '00:00:03 (at 56.6 KB/sec)';
        downloadDialog.classList.add('open');

        if (window.soundEngine) window.soundEngine.playSelect();

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 20) + 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                dlTimeLeft.textContent = 'Transfer complete (100%)';
            } else {
                const rem = Math.max(1, Math.ceil((100 - progress) / 30));
                dlTimeLeft.textContent = `00:00:0${rem} (at 56.6 KB/sec)`;
            }
            dlProgressBar.style.width = progress + '%';
        }, 120);

        dlBtnConfirm.onclick = () => {
            clearInterval(interval);
            downloadDialog.classList.remove('open');
            if (window.soundEngine) window.soundEngine.playDownload();

            game.downloadsCount = (game.downloadsCount || 0) + 1;
            catDownloadsEl.textContent = `DOWNLOADS: ${game.downloadsCount}`;
            document.getElementById('modalDownloads').textContent = `${game.downloadsCount} units`;

            // Deliver download with token
            window.location.href = `/api/games/${game.id}/download?token=${encodeURIComponent(authToken)}`;
        };

        dlBtnCancel.onclick = () => {
            clearInterval(interval);
            downloadDialog.classList.remove('open');
        };

        dlDialogClose.onclick = () => {
            clearInterval(interval);
            downloadDialog.classList.remove('open');
        };
    }

    // Game Details Modal
    btnDetailsEl.addEventListener('click', () => {
        if (!currentSelectedGame) return;
        if (window.soundEngine) window.soundEngine.playSelect();
        openGameModal(currentSelectedGame);
    });

    function openGameModal(game) {
        document.getElementById('modalGameTitle').textContent = `BLUEPRINTS: ${game.title}`;
        document.getElementById('modalGameDesc').textContent = game.description || '';
        document.getElementById('modalFileSize').textContent = game.fileSize || 'N/A';
        document.getElementById('modalVersion').textContent = `v${game.version}`;
        document.getElementById('modalDownloads').textContent = `${game.downloadsCount || 0} units`;

        const heroImg = document.getElementById('modalHeroImg');
        const thumbsEl = document.getElementById('modalThumbs');
        thumbsEl.innerHTML = '';

        const images = (game.screenshots && game.screenshots.length > 0) ? game.screenshots : [game.coverImage];
        heroImg.src = images[0];

        images.forEach((imgSrc, idx) => {
            const thumb = document.createElement('img');
            thumb.className = `modal-thumb ${idx === 0 ? 'active' : ''}`;
            thumb.src = imgSrc;
            thumb.onclick = () => {
                heroImg.src = imgSrc;
                thumbsEl.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                if (window.soundEngine) window.soundEngine.playHover();
            };
            thumbsEl.appendChild(thumb);
        });

        const featList = document.getElementById('modalFeaturesList');
        featList.innerHTML = '';
        (game.features || []).forEach(f => {
            const li = document.createElement('li');
            li.textContent = f;
            featList.appendChild(li);
        });

        const modalDlBtn = document.getElementById('modalDownloadBtn');
        modalDlBtn.onclick = (e) => {
            e.preventDefault();
            gameModal.classList.remove('open');
            triggerDownloadFlow(game);
        };

        const itchBtn = document.getElementById('modalItchBtn');
        const steamBtn = document.getElementById('modalSteamBtn');
        if (game.externalLinks && game.externalLinks.itch) {
            itchBtn.style.display = 'inline-block';
            itchBtn.href = game.externalLinks.itch;
        } else {
            itchBtn.style.display = 'none';
        }
        if (game.externalLinks && game.externalLinks.steam) {
            steamBtn.style.display = 'inline-block';
            steamBtn.href = game.externalLinks.steam;
        } else {
            steamBtn.style.display = 'none';
        }

        gameModal.classList.add('open');
    }

    modalClose.addEventListener('click', () => {
        gameModal.classList.remove('open');
        if (window.soundEngine) window.soundEngine.playHover();
    });

    gameModal.addEventListener('click', (e) => {
        if (e.target === gameModal) gameModal.classList.remove('open');
    });

    // Play in Browser Modal
    function openBrowserPlay(game) {
        if (window.soundEngine) window.soundEngine.playSelect();
        document.getElementById('playGameTitle').textContent = `PLAYING: ${game.title}`;
        playIframe.src = game.playInBrowserUrl;
        playModal.classList.add('open');
    }

    playModalClose.addEventListener('click', () => {
        playModal.classList.remove('open');
        playIframe.src = 'about:blank';
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || 'ALL';
            if (window.soundEngine) window.soundEngine.playHover();
            renderGamesList();
        });
    });

    // ========================================================================
    // DEVLOGS & MUSIC
    // ========================================================================

    async function loadUpdates() {
        try {
            const res = await fetch('/api/updates');
            const updates = await res.json();
            renderUpdates(updates);
        } catch (err) {
            console.error('Failed to load updates:', err);
        }
    }

    function renderUpdates(updates) {
        updatesListEl.innerHTML = '';
        updates.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = `ue ${index % 2 === 1 ? 'uebg' : ''}`;
            row.innerHTML = `
                <div>
                    <span class="entrydate">[${escapeHtml(item.date)}]</span>
                    <a class="entrytext">${escapeHtml(item.title)}</a>
                </div>
                <div class="entrytimeago">#${updates.length - index}</div>
            `;

            const details = document.createElement('div');
            details.className = 'update-details';
            details.textContent = item.body;

            const link = row.querySelector('.entrytext');
            link.addEventListener('click', () => {
                const isOpen = details.classList.contains('open');
                document.querySelectorAll('.update-details').forEach(d => d.classList.remove('open'));
                if (!isOpen) {
                    details.classList.add('open');
                    if (window.soundEngine) window.soundEngine.playHover();
                }
            });

            updatesListEl.appendChild(row);
            updatesListEl.appendChild(details);
        });
    }

    async function loadMusic() {
        try {
            const res = await fetch('/api/music');
            const albums = await res.json();
            renderMusic(albums);
        } catch (err) {
            console.error('Failed to load music:', err);
        }
    }

    function renderMusic(albums) {
        musicGridEl.innerHTML = '';
        albums.forEach(album => {
            const card = document.createElement('div');
            card.className = 'album-card';
            card.innerHTML = `
                <div style="font-size: 11px; color: var(--text-dim);">[RELEASE YEAR: ${escapeHtml(album.year)}]</div>
                <div class="album-title">${escapeHtml(album.title)}</div>
                <div style="font-size: 11px; color: var(--accent); font-weight: bold; margin-bottom: 6px;">${escapeHtml(album.genre)}</div>
                <p style="font-size: 12px; color: var(--text-primary); margin-bottom: 10px;">${escapeHtml(album.description)}</p>
                <div style="font-size: 11.5px; font-weight: bold; color: var(--link-color); margin-bottom: 4px;">TRACKS (${album.tracksCount}):</div>
                <ul class="tracklist">
                    ${album.tracks.map(t => `<li><span>${escapeHtml(t)}</span><span style="color: var(--text-dim); font-size: 10px;">[3:42]</span></li>`).join('')}
                </ul>
                <div style="margin-top: 10px; display: flex; gap: 8px;">
                    <button class="btn-pixel play-album-btn"><span>▶</span> Play Preview</button>
                    <a href="${album.bandcampUrl}" target="_blank" class="btn-pixel">Bandcamp</a>
                </div>
            `;

            const playBtn = card.querySelector('.play-album-btn');
            playBtn.addEventListener('click', () => {
                if (window.soundEngine) {
                    window.soundEngine.playSelect();
                    window.soundEngine.startAmbientDrone();
                }
                alert(`Now Streaming synthesized tape preview from: ${album.title}`);
            });

            musicGridEl.appendChild(card);
        });
    }

    // ========================================================================
    // GUESTBOOK TRANSMISSIONS (REQUIRES USER ACCOUNT TO POST)
    // ========================================================================

    async function loadGuestbook() {
        try {
            const res = await fetch('/api/guestbook');
            const entries = await res.json();
            renderGuestbook(entries);
        } catch (err) {
            console.error('Failed to load guestbook:', err);
        }
    }

    function renderGuestbook(entries) {
        guestbookListEl.innerHTML = '';
        if (entries.length === 0) {
            guestbookListEl.innerHTML = `<div style="font-size: 12px; color: var(--text-dim);">No transmissions logged yet. Be the first to transmit!</div>`;
            return;
        }

        entries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'guestbook-entry';

            const roleBadge = entry.user_role === 'admin'
                ? `<span style="background: var(--accent); color: #fff; font-size: 9px; padding: 1px 4px; margin-left: 6px; font-weight: bold;">ADMIN</span>`
                : `<span style="background: var(--border-color); color: var(--text-primary); font-size: 9px; padding: 1px 4px; margin-left: 6px;">USER</span>`;

            const deleteBtn = (currentUser && currentUser.role === 'admin')
                ? `<button class="btn-pixel delete-gb-btn" data-id="${entry.id}" style="font-size: 9px; padding: 1px 5px; color: #ff5252;">[DELETE]</button>`
                : '';

            item.innerHTML = `
                <div class="guestbook-meta">
                    <div>
                        <strong>👤 ${escapeHtml(entry.username || entry.name)}</strong>
                        ${roleBadge}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>[${escapeHtml((entry.created_at || entry.date || '').slice(0, 10))}]</span>
                        ${deleteBtn}
                    </div>
                </div>
                <div style="font-size: 12.5px; color: var(--text-primary);">${escapeHtml(entry.text)}</div>
            `;

            const delBtn = item.querySelector('.delete-gb-btn');
            if (delBtn) {
                delBtn.addEventListener('click', async () => {
                    if (confirm('Delete this visitor transmission permanently?')) {
                        try {
                            await fetch(`/api/guestbook/${entry.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${authToken}` }
                            });
                            loadGuestbook();
                        } catch (e) {}
                    }
                });
            }

            guestbookListEl.appendChild(item);
        });
    }

    guestbookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Strict check: Guest cannot post without account
        if (!currentUser) {
            openAuthModal('🔒 GUEST CLEARANCE RESTRICTION\n\nYou must be signed in with a user account to transmit messages to the visitor log.', 'login');
            return;
        }

        const text = document.getElementById('gbText').value.trim();
        if (!text) return;

        gbStatusEl.textContent = 'Transmitting to archive...';
        gbStatusEl.style.color = 'var(--link-color)';

        try {
            const res = await fetch('/api/guestbook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ text })
            });

            if (res.ok) {
                gbStatusEl.textContent = 'Transmission logged successfully!';
                gbStatusEl.style.color = '#2e7d32';
                document.getElementById('gbText').value = '';
                if (window.soundEngine) window.soundEngine.playDownload();
                loadGuestbook();
                setTimeout(() => { gbStatusEl.textContent = ''; }, 4000);
            } else {
                const errData = await res.json();
                gbStatusEl.textContent = errData.error || 'Transmission failed.';
                gbStatusEl.style.color = '#cc0000';
            }
        } catch (err) {
            gbStatusEl.textContent = 'Network error.';
            gbStatusEl.style.color = '#cc0000';
        }
    });

    // ========================================================================
    // THEMES & WINDOW CONTROLS
    // ========================================================================

    function setTheme(theme) {
        if (theme === 'xp-luna') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem('crt_theme', theme);

        const displayNames = {
            'xp-luna': 'WINDOWS XP',
            'win98': 'WINDOWS 98',
            'backrooms': 'BACKROOMS WIKI',
            'dark': 'DARK CRT',
            'green': 'PHOSPHOR GREEN',
            'amber': 'AMBER CRT',
            'blood': 'BLOOD NOIR'
        };
        if (themeBtn) themeBtn.textContent = `THEME: ${displayNames[theme] || theme.toUpperCase()}`;

        const titleLabel = document.getElementById('xpTitlebarLabel');
        if (titleLabel) {
            const systemTags = {
                'xp-luna': '[XP PRO]',
                'win98': '[WIN98]',
                'backrooms': '[LEVEL 0 - LIMINAL]',
                'dark': '[CRT 60Hz]',
                'green': '[PHOSPHOR]',
                'amber': '[AMBER]',
                'blood': '[BLOOD]'
            };
            titleLabel.textContent = `OBSOLETE SECTOR // PERSONAL HUB & GAMES ARCHIVE ${systemTags[theme] || ''}`;
        }
    }

    themeBtn.addEventListener('click', () => {
        const cur = localStorage.getItem('crt_theme') || 'xp-luna';
        const nextIdx = (themes.indexOf(cur) + 1) % themes.length;
        setTheme(themes[nextIdx]);
        if (window.soundEngine) window.soundEngine.playSelect();
    });

    // CRT Scanline Toggle
    function setCRT(enabled) {
        if (enabled) {
            document.body.classList.remove('crt-off');
            crtBtn.textContent = 'CRT: ON';
        } else {
            document.body.classList.add('crt-off');
            crtBtn.textContent = 'CRT: OFF';
        }
        localStorage.setItem('crt_scanlines', enabled);
    }

    crtBtn.addEventListener('click', () => {
        const isCurrentlyOn = !document.body.classList.contains('crt-off');
        setCRT(!isCurrentlyOn);
        if (window.soundEngine) window.soundEngine.playSelect();
    });

    // Titlebar Window Controls
    const winBtnClose = document.getElementById('winBtnClose');
    if (winBtnClose) {
        winBtnClose.onclick = () => {
            if (confirm('Exit Obsolete Sector Archive Terminal?')) {
                document.body.innerHTML = '<div style="background:#000; color:#40f567; font-family:monospace; height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column;"><h2>IT IS NOW SAFE TO TURN OFF YOUR COMPUTER.</h2><p><a href="/" style="color:#fff;">[ REBOOT TERMINAL ]</a></p></div>';
            }
        };
    }
    const winBtnMin = document.getElementById('winBtnMin');
    if (winBtnMin) {
        winBtnMin.onclick = () => {
            const doc = document.querySelector('.doccontents');
            doc.style.display = doc.style.display === 'none' ? 'block' : 'none';
        };
    }
    const winBtnMax = document.getElementById('winBtnMax');
    if (winBtnMax) {
        winBtnMax.onclick = () => {
            const doc = document.querySelector('.doc');
            doc.style.width = doc.style.width === '100%' ? '900px' : '100%';
        };
    }

    // Audio state
    function updateAudioBtnState() {
        const isEnabled = localStorage.getItem('sound_enabled') === 'true';
        audioBtn.textContent = isEnabled ? 'AUDIO: ON' : 'AUDIO: OFF';
    }

    audioBtn.addEventListener('click', () => {
        if (window.soundEngine) {
            window.soundEngine.toggleSound();
            updateAudioBtnState();
        }
    });

    // ========================================================================
    // SECRET RETRO TERMINAL DRAWER
    // ========================================================================

    openTerminalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTerminal();
        });
    });

    terminalCloseBtn.addEventListener('click', () => toggleTerminal(false));

    window.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~') {
            if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                toggleTerminal();
            }
        }
    });

    function toggleTerminal(forceState) {
        const isOpen = terminalDrawer.classList.contains('open');
        const newState = forceState !== undefined ? forceState : !isOpen;
        if (newState) {
            terminalDrawer.classList.add('open');
            terminalInput.focus();
            if (window.soundEngine) window.soundEngine.playSelect();
        } else {
            terminalDrawer.classList.remove('open');
        }
    }

    terminalInput.addEventListener('keydown', (e) => {
        if (window.soundEngine) window.soundEngine.playTerminalKey();
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim();
            terminalInput.value = '';
            executeTerminalCommand(cmd);
        }
    });

    function logTerminal(text, color = '#40f567') {
        const line = document.createElement('div');
        line.style.color = color;
        line.innerHTML = text;
        terminalLog.appendChild(line);
        terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    function executeTerminalCommand(raw) {
        logTerminal(`> ${escapeHtml(raw)}`, '#88ff99');
        const parts = raw.split(' ');
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ');

        switch (cmd) {
            case 'help':
                logTerminal('AVAILABLE PROTOCOLS:');
                logTerminal('  whoami               - View current operator clearance & role');
                logTerminal('  login &lt;user&gt; &lt;pass&gt;   - Authenticate in terminal');
                logTerminal('  logout               - Terminate active session');
                logTerminal('  list                 - View all indexed games in archive');
                logTerminal('  theme &lt;name&gt;        - Switch theme (xp-luna, win98, backrooms, dark, green, amber, blood)');
                logTerminal('  sound on|off         - Toggle synthetic audio & drone');
                logTerminal('  crt on|off           - Toggle CRT scanline overlay');
                logTerminal('  upload / admin       - Open terminal administrator portal');
                logTerminal('  clear                - Flush terminal buffer');
                break;
            case 'whoami':
                if (currentUser) {
                    logTerminal(`OPERATOR: ${currentUser.username} | ROLE: ${currentUser.role.toUpperCase()} | PROVIDER: ${currentUser.provider}`);
                } else {
                    logTerminal('STATUS: GUEST (Unauthenticated). Type "login <username> <pass>" or use website login button.');
                }
                break;
            case 'login':
                const userParts = arg.split(' ');
                if (userParts.length < 2) {
                    logTerminal('Usage: login <username> <password>');
                } else {
                    fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ identifier: userParts[0], password: userParts[1] })
                    }).then(r => r.json()).then(data => {
                        if (data.success) {
                            authToken = data.token;
                            currentUser = data.user;
                            localStorage.setItem('auth_token', authToken);
                            updateUserUI();
                            logTerminal(`Access Granted. Welcome ${currentUser.username} [${currentUser.role.toUpperCase()}].`);
                        } else {
                            logTerminal(`Access Denied: ${data.error}`, '#ff4444');
                        }
                    });
                }
                break;
            case 'logout':
                logout();
                logTerminal('Session terminated.');
                break;
            case 'list':
                allGames.forEach(g => {
                    logTerminal(`* [${g.id}] ${g.title} (v${g.version}) - ${g.fileSize}`);
                });
                break;
            case 'theme':
                if (themes.includes(arg)) {
                    setTheme(arg);
                    logTerminal(`Theme changed to ${arg.toUpperCase()}`);
                } else {
                    logTerminal(`Invalid theme. Options: ${themes.join(', ')}`, '#ff5555');
                }
                break;
            case 'sound':
                if (arg === 'on') {
                    if (window.soundEngine && !window.soundEngine.enabled) window.soundEngine.toggleSound();
                    updateAudioBtnState();
                    logTerminal('Synthetic audio and drone activated.');
                } else if (arg === 'off') {
                    if (window.soundEngine && window.soundEngine.enabled) window.soundEngine.toggleSound();
                    updateAudioBtnState();
                    logTerminal('Audio muted.');
                } else {
                    logTerminal('Usage: sound on OR sound off');
                }
                break;
            case 'crt':
                setCRT(arg === 'on');
                logTerminal(`CRT Scanlines ${arg === 'on' ? 'Enabled' : 'Disabled'}`);
                break;
            case 'admin':
            case 'upload':
                logTerminal('Redirecting to upload terminal...');
                setTimeout(() => { window.location.href = '/admin.html'; }, 600);
                break;
            case 'clear':
                terminalLog.innerHTML = '';
                break;
            default:
                if (cmd === '') return;
                logTerminal(`Unknown protocol "${cmd}". Type "help" for commands.`, '#ff4444');
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Initial Load Sequence
    checkAuth();
    loadGames();
    loadUpdates();
    loadMusic();
    loadGuestbook();
});
