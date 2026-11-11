// Main Frontend Logic for Hello, I am MOPTAM: Personal Creative Hub & Games Archive
document.addEventListener('DOMContentLoaded', () => {
    let allGames = [];
    let currentSelectedGame = null;
    let currentFilter = 'ALL';
    let currentFeedbackType = 'all';

    let allArt = [];
    let currentArtFilter = 'ALL';

    // User & Authentication State
    let currentUser = null;
    let authToken = localStorage.getItem('auth_token') || '';

    // Reactions State
    let gameReactions = {};
    let userReactionsMap = {};

    // ========================================================================
    // DOM ELEMENTS
    // ========================================================================

    // Multi-Part Views
    const views = {
        home: document.getElementById('view-home'),
        games: document.getElementById('view-games'),
        art: document.getElementById('view-art'),
        audio: document.getElementById('view-audio'),
        updates: document.getElementById('view-updates'),
        guestbook: document.getElementById('view-guestbook')
    };
    const navLinkItems = document.querySelectorAll('.nav-link-item');

    // Homepage Elements
    const homeLatestUpdateDate = document.getElementById('homeLatestUpdateDate');
    const homeLatestUpdateTitle = document.getElementById('homeLatestUpdateTitle');
    const homeLatestUpdateBody = document.getElementById('homeLatestUpdateBody');

    // Catalogue / Games Archive
    const gamesListEl = document.getElementById('catalogueList');
    const previewImgEl = document.getElementById('cataloguePreviewImg');
    const catTitleEl = document.getElementById('catTitle');
    const catSubtitleEl = document.getElementById('catSubtitle');
    const catVersionEl = document.getElementById('catVersion');
    const catPriceBadge = document.getElementById('catPriceBadge');
    const catTagsEl = document.getElementById('catTags');
    const catDescEl = document.getElementById('catDesc');
    const catSizeEl = document.getElementById('catSize');
    const catDateEl = document.getElementById('catDate');
    const catDownloadsEl = document.getElementById('catDownloads');
    const btnDownloadEl = document.getElementById('btnDownload');
    const btnSteamEl = document.getElementById('btnSteam');
    const btnDetailsEl = document.getElementById('btnDetails');
    const btnPlayBrowserEl = document.getElementById('btnPlayBrowser');
    const gameFilterBtns = document.querySelectorAll('.filter-btn');

    // Game Community Feedback & Bug Reports
    const feedbackGameTargetTitle = document.getElementById('feedbackGameTargetTitle');
    const feedbackTabBtns = document.querySelectorAll('.feedback-tab-btn');
    const fbAuthPrompt = document.getElementById('fbAuthPrompt');
    const btnPromptFbAuth = document.getElementById('btnPromptFbAuth');
    const gameFeedbackForm = document.getElementById('gameFeedbackForm');
    const fbContentInput = document.getElementById('fbContent');
    const btnSubmitFeedback = document.getElementById('btnSubmitFeedback');
    const fbSubmitStatus = document.getElementById('fbSubmitStatus');
    const gameFeedbackList = document.getElementById('gameFeedbackList');

    // Art Gallery Elements
    const artGalleryGrid = document.getElementById('artGalleryGrid');
    const artFilterBtns = document.querySelectorAll('.art-filter-btn');
    const artModal = document.getElementById('artModal');
    const artModalClose = document.getElementById('artModalClose');
    const artModalCloseBtn = document.getElementById('artModalCloseBtn');
    const artModalImg = document.getElementById('artModalImg');
    const artModalHeading = document.getElementById('artModalHeading');
    const artModalCategory = document.getElementById('artModalCategory');
    const artModalMedium = document.getElementById('artModalMedium');
    const artModalDesc = document.getElementById('artModalDesc');

    // Audio & SFX Elements
    const musicGridEl = document.getElementById('musicGrid');
    const sfxGridEl = document.getElementById('sfxGrid');

    // Devlogs / Updates Elements
    const updatesListEl = document.getElementById('updatesList');
    const adminNewDispatchBtn = document.getElementById('adminNewDispatchBtn');

    // Guestbook Elements
    const guestbookListEl = document.getElementById('guestbookList');
    const guestbookForm = document.getElementById('guestbookForm');
    const gbStatusEl = document.getElementById('gbStatus');
    const gbGuestWarning = document.getElementById('gbGuestWarning');
    const gbUserNotice = document.getElementById('gbUserNotice');
    const gbUserCallsign = document.getElementById('gbUserCallsign');
    const btnGbPromptAuth = document.getElementById('btnGbPromptAuth');

    // Controls & Header
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

    // Windows XP Start Menu & Clocks
    const xpStartBtn = document.getElementById('xpStartBtn');
    const xpStartMenu = document.getElementById('xpStartMenu');
    const trayClockEl = document.getElementById('trayClock');

    function updateClock() {
        const now = new Date();
        if (trayClockEl) {
            trayClockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

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

    // ========================================================================
    // 1. MULTI-PART VIEW ROUTING (NO SINGLE LONG SCROLL)
    // ========================================================================

    function handleRoute() {
        const rawHash = window.location.hash.replace('#', '').trim().toLowerCase();
        let targetView = 'home';

        if (rawHash === 'games' || rawHash === 'catalogue') {
            targetView = 'games';
        } else if (rawHash === 'art') {
            targetView = 'art';
        } else if (rawHash === 'audio' || rawHash === 'music') {
            targetView = 'audio';
        } else if (rawHash === 'updates' || rawHash === 'devlogs') {
            targetView = 'updates';
        } else if (rawHash === 'guestbook' || rawHash === 'contact') {
            targetView = 'guestbook';
        } else {
            targetView = 'home';
        }

        switchView(targetView);
    }

    function switchView(viewName) {
        Object.keys(views).forEach(key => {
            if (views[key]) {
                if (key === viewName) {
                    views[key].classList.add('active');
                } else {
                    views[key].classList.remove('active');
                }
            }
        });

        // Update nav links active styling
        navLinkItems.forEach(link => {
            const linkView = link.getAttribute('data-view');
            if (linkView === viewName) {
                link.classList.add('nav-active');
            } else {
                link.classList.remove('nav-active');
            }
        });

        // Scroll to top of window
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Play subtle sound
        if (window.soundEngine) window.soundEngine.playSelect();
    }

    window.addEventListener('hashchange', handleRoute);

    // ========================================================================
    // 2. THEMES & CRT ENGINE
    // ========================================================================

    const themes = ['xp-luna', 'win98', 'backrooms', 'dark', 'green', 'amber', 'blood'];
    const savedTheme = localStorage.getItem('crt_theme') || 'xp-luna';
    setTheme(savedTheme);

    const crtEnabled = localStorage.getItem('crt_scanlines') !== 'false';
    setCRT(crtEnabled);
    updateAudioBtnState();

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('crt_theme', theme);
        if (themeBtn) {
            const labels = {
                'xp-luna': 'THEME: WINDOWS XP',
                'win98': 'THEME: WIN 98',
                'backrooms': 'THEME: BACKROOMS',
                'dark': 'THEME: DARK CRT',
                'green': 'THEME: GREEN',
                'amber': 'THEME: AMBER',
                'blood': 'THEME: BLOOD NOIR'
            };
            themeBtn.textContent = labels[theme] || 'THEME: ' + theme.toUpperCase();
        }
    }

    function setCRT(enabled) {
        if (enabled) {
            document.body.classList.remove('crt-off');
            if (crtBtn) crtBtn.textContent = 'CRT: ON';
        } else {
            document.body.classList.add('crt-off');
            if (crtBtn) crtBtn.textContent = 'CRT: OFF';
        }
        localStorage.setItem('crt_scanlines', enabled);
    }

    function updateAudioBtnState() {
        if (audioBtn && window.soundEngine) {
            audioBtn.textContent = window.soundEngine.enabled ? 'AUDIO: ON' : 'AUDIO: OFF';
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = localStorage.getItem('crt_theme') || 'xp-luna';
            const nextIdx = (themes.indexOf(current) + 1) % themes.length;
            setTheme(themes[nextIdx]);
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    }

    if (crtBtn) {
        crtBtn.addEventListener('click', () => {
            const isOff = document.body.classList.contains('crt-off');
            setCRT(isOff);
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    }

    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            if (window.soundEngine) {
                window.soundEngine.toggleSound();
                updateAudioBtnState();
            }
        });
    }

    // Windows Titlebar Window Buttons
    const winBtnMin = document.getElementById('winBtnMin');
    const winBtnMax = document.getElementById('winBtnMax');
    const winBtnClose = document.getElementById('winBtnClose');

    if (winBtnMin) {
        winBtnMin.addEventListener('click', () => {
            const doc = document.querySelector('.doccontents');
            if (doc) {
                doc.style.display = doc.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    if (winBtnMax) {
        winBtnMax.addEventListener('click', () => {
            const doc = document.querySelector('.doc');
            if (doc) {
                doc.classList.toggle('maximized');
            }
        });
    }

    if (winBtnClose) {
        winBtnClose.addEventListener('click', () => {
            if (confirm('Leave Hello, I am MOPTAM creative hub?')) {
                window.location.hash = '#home';
            }
        });
    }

    // ========================================================================
    // 3. AUTHENTICATION & SESSIONS
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
            currentUser = null;
        }
        updateUserUI();
    }

    function updateUserUI() {
        if (currentUser) {
            if (currentUser.role === 'admin') {
                authBtn.textContent = `[ADMIN: ${currentUser.username}] LOGOUT`;
                if (adminUploadBtn) adminUploadBtn.style.display = 'inline-flex';
                if (adminNewDispatchBtn) adminNewDispatchBtn.style.display = 'inline-flex';
            } else {
                authBtn.textContent = `[USER: ${currentUser.username}] LOGOUT`;
                if (adminUploadBtn) adminUploadBtn.style.display = 'none';
                if (adminNewDispatchBtn) adminNewDispatchBtn.style.display = 'none';
            }

            if (gbGuestWarning) gbGuestWarning.style.display = 'none';
            if (gbUserNotice) gbUserNotice.style.display = 'block';
            if (gbUserCallsign) gbUserCallsign.textContent = `${currentUser.username} (${currentUser.role.toUpperCase()})`;

            // Game Feedback Form
            if (fbAuthPrompt) fbAuthPrompt.style.display = 'none';
            if (gameFeedbackForm) gameFeedbackForm.style.display = 'block';
        } else {
            authBtn.textContent = 'LOGIN / REGISTER';
            if (adminUploadBtn) adminUploadBtn.style.display = 'none';
            if (adminNewDispatchBtn) adminNewDispatchBtn.style.display = 'none';

            if (gbGuestWarning) gbGuestWarning.style.display = 'flex';
            if (gbUserNotice) gbUserNotice.style.display = 'none';

            // Game Feedback Form
            if (fbAuthPrompt) fbAuthPrompt.style.display = 'flex';
            if (gameFeedbackForm) gameFeedbackForm.style.display = 'none';
        }

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

    if (btnPromptFbAuth) {
        btnPromptFbAuth.addEventListener('click', () => {
            openAuthModal('Sign in or register to submit opinions, suggestions, or bug reports.', 'login');
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
        } else if (tab === 'register') {
            authTabRegister.classList.add('active-auth-tab');
            authPaneRegister.style.display = 'block';
        } else if (tab === 'social') {
            authTabSocial.classList.add('active-auth-tab');
            authPaneSocial.style.display = 'block';
        }
    }

    authTabLogin.addEventListener('click', () => switchAuthTab('login'));
    authTabRegister.addEventListener('click', () => switchAuthTab('register'));
    authTabSocial.addEventListener('click', () => switchAuthTab('social'));

    // Login Form
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = loginIdentifier.value.trim();
        const password = loginPassword.value;
        authStatusMsg.textContent = 'Authenticating...';
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
                authStatusMsg.textContent = `Clearance granted: Welcome ${currentUser.username}`;
                authStatusMsg.style.color = '#2e7d32';
                setTimeout(() => {
                    closeAuthModal();
                    updateUserUI();
                    loadReactions();
                    if (currentSelectedGame) loadGameFeedback(currentSelectedGame.id);
                }, 600);
            } else {
                authStatusMsg.textContent = data.error || 'Authentication denied.';
                authStatusMsg.style.color = 'var(--accent)';
            }
        } catch (err) {
            authStatusMsg.textContent = 'Server connection error.';
            authStatusMsg.style.color = 'var(--accent)';
        }
    });

    // Register Form
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = regUsername.value.trim();
        const email = regEmail.value.trim();
        const password = regPassword.value;
        authStatusMsg.textContent = 'Generating operator account...';
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
                authStatusMsg.textContent = `Account created! Welcome, ${currentUser.username}.`;
                authStatusMsg.style.color = '#2e7d32';
                setTimeout(() => {
                    closeAuthModal();
                    updateUserUI();
                    loadReactions();
                    if (currentSelectedGame) loadGameFeedback(currentSelectedGame.id);
                }, 600);
            } else {
                authStatusMsg.textContent = data.error || 'Registration failed.';
                authStatusMsg.style.color = 'var(--accent)';
            }
        } catch (err) {
            authStatusMsg.textContent = 'Server connection error.';
            authStatusMsg.style.color = 'var(--accent)';
        }
    });

    // Social Login
    socialProviderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedSocialProvider = btn.getAttribute('data-provider');
            const names = { google: 'Google Account', apple: 'Apple ID', github: 'GitHub Account' };
            socialProviderLabel.textContent = `LINKING ${names[selectedSocialProvider].toUpperCase()}`;
            socialUsernameBox.style.display = 'block';
            socialUsername.focus();
        });
    });

    btnSubmitSocial.addEventListener('click', async () => {
        const username = socialUsername.value.trim();
        if (!username || username.length < 3) {
            authStatusMsg.textContent = 'Please enter a call-sign of at least 3 characters.';
            authStatusMsg.style.color = 'var(--accent)';
            return;
        }

        authStatusMsg.textContent = `Signing in via ${selectedSocialProvider.toUpperCase()}...`;
        authStatusMsg.style.color = 'var(--link-color)';

        try {
            const res = await fetch('/api/auth/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: selectedSocialProvider,
                    username: username
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                authToken = data.token;
                currentUser = data.user;
                localStorage.setItem('auth_token', authToken);
                authStatusMsg.textContent = `Clearance verified via ${selectedSocialProvider.toUpperCase()}!`;
                authStatusMsg.style.color = '#2e7d32';
                setTimeout(() => {
                    closeAuthModal();
                    updateUserUI();
                    loadReactions();
                    if (currentSelectedGame) loadGameFeedback(currentSelectedGame.id);
                }, 600);
            } else {
                authStatusMsg.textContent = data.error || 'Social sign-in rejected.';
                authStatusMsg.style.color = 'var(--accent)';
            }
        } catch (err) {
            authStatusMsg.textContent = 'Server connection error.';
            authStatusMsg.style.color = 'var(--accent)';
        }
    });

    // ========================================================================
    // 4. GAMES ARCHIVE & COMMUNITY FEEDBACK
    // ========================================================================

    async function loadGames() {
        try {
            const res = await fetch('/api/games');
            allGames = await res.json();
            renderGamesList();
            if (allGames.length > 0) {
                selectGame(allGames[0]);
            }
        } catch (e) {
            if (gamesListEl) {
                gamesListEl.innerHTML = '<div style="color:red; padding:10px;">Failed to load archive database.</div>';
            }
        }
    }

    function renderGamesList() {
        if (!gamesListEl) return;
        gamesListEl.innerHTML = '';

        const filtered = allGames.filter(g => {
            if (currentFilter === 'ALL') return true;
            if (currentFilter === 'FREE') return g.isFree !== false;
            if (currentFilter === 'PAID') return g.isFree === false;
            return g.tags && g.tags.some(t => t.toUpperCase().includes(currentFilter));
        });

        if (filtered.length === 0) {
            gamesListEl.innerHTML = '<div style="padding: 12px; font-size: 12px; color: var(--text-dim);">No game builds matched this filter.</div>';
            return;
        }

        filtered.forEach(game => {
            const row = document.createElement('div');
            row.className = 'gamerow';
            if (currentSelectedGame && currentSelectedGame.id === game.id) {
                row.classList.add('selected');
            }

            const isFree = game.isFree !== false;
            const priceTag = isFree ? '<span class="badge-free">FREE</span>' : `<span class="badge-steam">${game.price || 'STEAM'}</span>`;

            row.innerHTML = `
                <div class="game-row-title">
                    <span>${game.title}</span>
                    ${priceTag}
                </div>
                <div class="game-row-info">
                    <span>${game.tags ? game.tags[0] : 'HORROR'}</span> &bull; 
                    <span>[v${game.version || '1.0'}]</span> &bull; 
                    <span>${game.fileSize || '30 MB'}</span>
                </div>
            `;

            row.addEventListener('click', () => selectGame(game));
            row.addEventListener('mouseenter', () => {
                if (window.soundEngine) window.soundEngine.playHover();
            });

            gamesListEl.appendChild(row);
        });
    }

    function selectGame(game) {
        currentSelectedGame = game;

        if (catTitleEl) catTitleEl.textContent = game.title;
        if (catSubtitleEl) catSubtitleEl.textContent = game.subtitle || '';
        if (catVersionEl) catVersionEl.textContent = `v${game.version || '1.0'}`;
        if (catDescEl) catDescEl.textContent = game.description || '';
        if (catSizeEl) catSizeEl.textContent = `FILE SIZE: ${game.fileSize || '35 MB'}`;
        if (catDateEl) catDateEl.textContent = `DATE: ${game.releaseDate || '2026'}`;
        if (catDownloadsEl) catDownloadsEl.textContent = `DOWNLOADS: ${game.downloadsCount || 0}`;

        if (previewImgEl) {
            previewImgEl.src = game.coverImage || '/assets/images/cover_chamber.svg';
        }

        // Tags
        if (catTagsEl && game.tags) {
            catTagsEl.innerHTML = game.tags.map(t => `<span class="tag-badge">${t}</span>`).join('');
        }

        // Price badge and download/steam buttons
        const isFree = game.isFree !== false;
        if (catPriceBadge) {
            if (isFree) {
                catPriceBadge.className = 'badge-free';
                catPriceBadge.textContent = 'FREE DOWNLOAD';
            } else {
                catPriceBadge.className = 'badge-steam';
                catPriceBadge.textContent = `STEAM: ${game.price || '$6.99'}`;
            }
        }

        if (btnDownloadEl) {
            btnDownloadEl.style.display = isFree ? 'inline-flex' : 'none';
        }

        if (btnSteamEl) {
            if (!isFree) {
                btnSteamEl.style.display = 'inline-flex';
                btnSteamEl.href = game.steamUrl || (game.externalLinks && game.externalLinks.steam) || 'https://store.steampowered.com';
            } else {
                btnSteamEl.style.display = 'none';
            }
        }

        if (btnPlayBrowserEl) {
            btnPlayBrowserEl.style.display = game.playInBrowserUrl ? 'inline-flex' : 'none';
        }

        // Update selected row
        const rows = document.querySelectorAll('.gamerow');
        rows.forEach(r => r.classList.remove('selected'));
        renderGamesList();

        // Update reactions display for this game
        updateReactionButtons();

        // Load community feedback for this game
        if (feedbackGameTargetTitle) {
            feedbackGameTargetTitle.textContent = game.title;
        }
        loadGameFeedback(game.id, currentFeedbackType);

        if (window.soundEngine) window.soundEngine.playSelect();
    }

    // Filter Buttons
    gameFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gameFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderGamesList();
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    });

    // Direct Download
    if (btnDownloadEl) {
        btnDownloadEl.addEventListener('click', () => {
            if (!currentSelectedGame) return;
            if (!currentUser) {
                openAuthModal('An operator account is required to download archive files.', 'login');
                return;
            }
            startDownloadProcess(currentSelectedGame);
        });
    }

    function startDownloadProcess(game) {
        if (!downloadDialog) return;
        dlDialogTitle.textContent = `Downloading ${game.title.replace(/\s+/g, '_')}_v${game.version}.zip`;
        dlProgressBar.style.width = '0%';
        dlTimeLeft.textContent = '00:00:02 (calculating checksum)';
        downloadDialog.classList.add('open');

        if (window.soundEngine) window.soundEngine.playDownload();

        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            dlProgressBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                dlTimeLeft.textContent = 'Package verified. Ready to save.';
            }
        }, 120);

        dlBtnConfirm.onclick = () => {
            clearInterval(interval);
            downloadDialog.classList.remove('open');
            window.location.href = `/api/games/${game.id}/download?token=${authToken}`;
            setTimeout(() => {
                if (currentSelectedGame && currentSelectedGame.id === game.id) {
                    currentSelectedGame.downloadsCount = (currentSelectedGame.downloadsCount || 0) + 1;
                    if (catDownloadsEl) catDownloadsEl.textContent = `DOWNLOADS: ${currentSelectedGame.downloadsCount}`;
                }
            }, 1000);
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

    // Expand Spec Sheet Modal
    if (btnDetailsEl) {
        btnDetailsEl.addEventListener('click', () => {
            if (!currentSelectedGame) return;
            const game = currentSelectedGame;
            document.getElementById('modalGameTitle').textContent = game.title;
            document.getElementById('modalHeroImg').src = game.coverImage || '/assets/images/cover_chamber.svg';
            document.getElementById('modalGameDesc').textContent = game.description || '';
            document.getElementById('modalVersion').textContent = game.version || '1.0';
            document.getElementById('modalFileSize').textContent = game.fileSize || '35 MB';
            document.getElementById('modalDownloads').textContent = game.downloadsCount || '0';

            const featuresList = document.getElementById('modalFeaturesList');
            featuresList.innerHTML = '';
            if (game.features && game.features.length) {
                game.features.forEach(f => {
                    const li = document.createElement('li');
                    li.textContent = f;
                    featuresList.appendChild(li);
                });
            }

            const modalDownloadBtn = document.getElementById('modalDownloadBtn');
            const modalSteamBtn = document.getElementById('modalSteamBtn');
            const modalItchBtn = document.getElementById('modalItchBtn');

            const isFree = game.isFree !== false;
            modalDownloadBtn.style.display = isFree ? 'inline-block' : 'none';
            modalDownloadBtn.onclick = () => {
                gameModal.classList.remove('open');
                if (!currentUser) {
                    openAuthModal('Account required to download.', 'login');
                } else {
                    startDownloadProcess(game);
                }
            };

            const steamUrl = game.steamUrl || (game.externalLinks && game.externalLinks.steam);
            if (steamUrl) {
                modalSteamBtn.style.display = 'inline-block';
                modalSteamBtn.href = steamUrl;
            } else {
                modalSteamBtn.style.display = 'none';
            }

            if (game.externalLinks && game.externalLinks.itch) {
                modalItchBtn.style.display = 'inline-block';
                modalItchBtn.href = game.externalLinks.itch;
            } else {
                modalItchBtn.style.display = 'none';
            }

            gameModal.classList.add('open');
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', () => gameModal.classList.remove('open'));
    }

    // Play in Browser
    if (btnPlayBrowserEl) {
        btnPlayBrowserEl.addEventListener('click', () => {
            if (!currentSelectedGame || !currentSelectedGame.playInBrowserUrl) return;
            document.getElementById('playGameTitle').textContent = `RUNNING // ${currentSelectedGame.title}`;
            playIframe.src = currentSelectedGame.playInBrowserUrl;
            playModal.classList.add('open');
        });
    }

    if (playModalClose) {
        playModalClose.addEventListener('click', () => {
            playIframe.src = 'about:blank';
            playModal.classList.remove('open');
        });
    }

    // ========================================================================
    // 5. REACTIONS SYSTEM
    // ========================================================================

    async function loadReactions() {
        try {
            const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
            const res = await fetch('/api/reactions', { headers });
            const data = await res.json();
            gameReactions = data.counts || {};
            userReactionsMap = data.userReactions || {};
            updateReactionButtons();
        } catch (e) {}
    }

    function updateReactionButtons() {
        if (!currentSelectedGame) return;
        const gid = currentSelectedGame.id;
        const counts = gameReactions[gid] || {};
        const userHas = userReactionsMap[gid] || {};

        document.querySelectorAll('.rx-btn').forEach(btn => {
            const type = btn.getAttribute('data-type');
            const countSpan = btn.querySelector('.rx-count');
            if (countSpan) {
                countSpan.textContent = counts[type] || 0;
            }
            if (userHas[type]) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.rx-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!currentSelectedGame) return;
            if (!currentUser) {
                openAuthModal('Sign in or create an account to react to games.', 'login');
                return;
            }

            const type = btn.getAttribute('data-type');
            try {
                const res = await fetch(`/api/games/${currentSelectedGame.id}/reactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ reactionType: type })
                });
                const data = await res.json();
                if (data.success && data.reactions) {
                    gameReactions = data.reactions.counts || {};
                    userReactionsMap = data.reactions.userReactions || {};
                    updateReactionButtons();
                    if (window.soundEngine) window.soundEngine.playSelect();
                }
            } catch (e) {}
        });
    });

    // ========================================================================
    // 6. PER-GAME COMMUNITY FEEDBACK (OPINIONS, SUGGESTIONS & BUG REPORTS)
    // ========================================================================

    async function loadGameFeedback(gameId, type = 'all') {
        if (!gameFeedbackList) return;
        gameFeedbackList.innerHTML = '<div style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 12px;">Scanning transmission logs...</div>';

        try {
            const url = type === 'all' ? `/api/games/${gameId}/feedback` : `/api/games/${gameId}/feedback?type=${type}`;
            const res = await fetch(url);
            const feedbackItems = await res.json();

            // Update tab badge counts
            const allItems = await (await fetch(`/api/games/${gameId}/feedback`)).json();
            const counts = { all: allItems.length, comment: 0, suggestion: 0, bug_report: 0 };
            allItems.forEach(i => { if (counts[i.type] !== undefined) counts[i.type]++; });

            feedbackTabBtns.forEach(btn => {
                const t = btn.getAttribute('data-fb-type');
                if (t === 'all') btn.textContent = `ALL (${counts.all})`;
                else if (t === 'comment') btn.textContent = `💬 OPINIONS (${counts.comment})`;
                else if (t === 'suggestion') btn.textContent = `💡 SUGGESTIONS (${counts.suggestion})`;
                else if (t === 'bug_report') btn.textContent = `🐛 BUG REPORTS (${counts.bug_report})`;
            });

            if (!feedbackItems || feedbackItems.length === 0) {
                gameFeedbackList.innerHTML = `
                    <div style="background: var(--bg-card-inner); border: 1px dashed var(--border-color); padding: 16px; text-align: center; font-size: 12px; color: var(--text-dim);">
                        No entries recorded under this category yet. Be the first to submit your opinion, suggestion, or bug report.
                    </div>
                `;
                return;
            }

            gameFeedbackList.innerHTML = '';
            feedbackItems.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'feedback-item';

                const typeLabels = {
                    comment: '<span class="feedback-type-badge badge-comment">💬 OPINION / REVIEW</span>',
                    suggestion: '<span class="feedback-type-badge badge-suggestion">💡 SUGGESTION</span>',
                    bug_report: '<span class="feedback-type-badge badge-bug">🐛 BUG REPORT</span>'
                };

                const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : '';
                const roleBadge = item.user_role === 'admin' 
                    ? '<span style="background: var(--accent); color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 2px;">ADMIN</span>' 
                    : '<span style="background: #0055ea; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 2px;">USER</span>';

                const deleteBtnHtml = (currentUser && currentUser.role === 'admin')
                    ? `<button class="btn-pixel btn-delete-feedback" data-id="${item.id}" style="font-size: 10px; color: red; padding: 1px 5px;">[DELETE]</button>`
                    : '';

                itemEl.innerHTML = `
                    <div class="feedback-item-header">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            ${typeLabels[item.type] || typeLabels.comment}
                            <strong style="color: var(--link-color);">${escapeHtml(item.username)}</strong>
                            ${roleBadge}
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--text-dim);">${dateStr}</span>
                            ${deleteBtnHtml}
                        </div>
                    </div>
                    <div class="feedback-item-content">${escapeHtml(item.content)}</div>
                `;

                gameFeedbackList.appendChild(itemEl);
            });

            // Bind delete buttons for admin
            document.querySelectorAll('.btn-delete-feedback').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = btn.getAttribute('data-id');
                    if (confirm('Delete this feedback entry?')) {
                        await fetch(`/api/admin/feedback/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        loadGameFeedback(gameId, currentFeedbackType);
                    }
                });
            });

        } catch (e) {
            gameFeedbackList.innerHTML = '<div style="color: red; padding: 8px;">Error loading feedback.</div>';
        }
    }

    feedbackTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            feedbackTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFeedbackType = btn.getAttribute('data-fb-type');
            if (currentSelectedGame) {
                loadGameFeedback(currentSelectedGame.id, currentFeedbackType);
            }
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    });

    if (gameFeedbackForm) {
        gameFeedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentSelectedGame) return;
            if (!currentUser) {
                openAuthModal('Please sign in or register to submit feedback.', 'login');
                return;
            }

            const typeRadio = document.querySelector('input[name="fbType"]:checked');
            const type = typeRadio ? typeRadio.value : 'comment';
            const content = fbContentInput.value.trim();

            if (!content) return;

            btnSubmitFeedback.disabled = true;
            fbSubmitStatus.textContent = 'Transmitting...';
            fbSubmitStatus.style.color = 'var(--link-color)';

            try {
                const res = await fetch(`/api/games/${currentSelectedGame.id}/feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ type, content })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    fbSubmitStatus.textContent = 'Intel logged successfully.';
                    fbSubmitStatus.style.color = '#2e7d32';
                    fbContentInput.value = '';
                    setTimeout(() => {
                        fbSubmitStatus.textContent = '';
                        loadGameFeedback(currentSelectedGame.id, currentFeedbackType);
                    }, 500);
                } else {
                    fbSubmitStatus.textContent = data.error || 'Failed to submit.';
                    fbSubmitStatus.style.color = 'var(--accent)';
                }
            } catch (err) {
                fbSubmitStatus.textContent = 'Server transmission failed.';
                fbSubmitStatus.style.color = 'var(--accent)';
            } finally {
                btnSubmitFeedback.disabled = false;
            }
        });
    }

    // ========================================================================
    // 7. ART GALLERY (3D, PIXEL ART, DRAWINGS)
    // ========================================================================

    async function loadArt() {
        try {
            const res = await fetch('/api/art');
            allArt = await res.json();
            renderArtGallery();
        } catch (e) {
            if (artGalleryGrid) artGalleryGrid.innerHTML = '<div style="color: red; padding: 10px;">Failed to load art catalog.</div>';
        }
    }

    function renderArtGallery() {
        if (!artGalleryGrid) return;
        artGalleryGrid.innerHTML = '';

        const filtered = allArt.filter(a => {
            if (currentArtFilter === 'ALL') return true;
            return a.category === currentArtFilter;
        });

        if (filtered.length === 0) {
            artGalleryGrid.innerHTML = '<div style="padding: 12px; font-size: 12px; color: var(--text-dim);">No artwork matches this category.</div>';
            return;
        }

        filtered.forEach(art => {
            const card = document.createElement('div');
            card.className = 'art-card';
            card.innerHTML = `
                <div class="art-card-img-holder">
                    <img src="${art.image}" class="art-card-img" alt="${escapeHtml(art.title)}">
                    <div class="art-card-badge">${art.categoryLabel || art.category.toUpperCase()}</div>
                </div>
                <h4 class="art-card-title">${escapeHtml(art.title)}</h4>
                <div class="art-card-medium">${escapeHtml(art.medium)} &bull; ${art.date}</div>
                <div class="art-card-desc">${escapeHtml(art.description)}</div>
                <div style="margin-top: 10px; font-size: 11px; font-weight: bold; color: var(--link-color);">
                    [+] CLICK TO INSPECT IN VIEWFINDER
                </div>
            `;

            card.addEventListener('click', () => openArtModal(art));
            card.addEventListener('mouseenter', () => {
                if (window.soundEngine) window.soundEngine.playHover();
            });

            artGalleryGrid.appendChild(card);
        });
    }

    function openArtModal(art) {
        if (!artModal) return;
        artModalImg.src = art.image;
        artModalHeading.textContent = art.title;
        artModalCategory.textContent = art.categoryLabel || art.category.toUpperCase();
        artModalMedium.textContent = `MEDIUM: ${art.medium} // DATE: ${art.date}`;
        artModalDesc.textContent = art.description;
        artModal.classList.add('open');
        if (window.soundEngine) window.soundEngine.playSelect();
    }

    if (artModalClose) artModalClose.addEventListener('click', () => artModal.classList.remove('open'));
    if (artModalCloseBtn) artModalCloseBtn.addEventListener('click', () => artModal.classList.remove('open'));
    if (artModal) {
        artModal.addEventListener('click', (e) => {
            if (e.target === artModal) artModal.classList.remove('open');
        });
    }

    artFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            artFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentArtFilter = btn.getAttribute('data-category');
            renderArtGallery();
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    });

    // ========================================================================
    // 8. AUDIO LAB & SOUND VAULT (MUSIC & TACTILE SFX)
    // ========================================================================

    async function loadMusic() {
        if (!musicGridEl) return;
        try {
            const res = await fetch('/api/music');
            const albums = await res.json();
            musicGridEl.innerHTML = '';

            albums.forEach(album => {
                const card = document.createElement('div');
                card.className = 'music-card';

                const tracksHtml = album.tracks ? album.tracks.map(t => `<li style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 2px;">${escapeHtml(t)}</li>`).join('') : '';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                        <h4 style="font-family: var(--font-title); font-size: 20px; color: var(--link-color); margin: 0;">${escapeHtml(album.title)}</h4>
                        <span style="font-size: 10px; color: var(--text-dim); border: 1px solid var(--border-color); padding: 1px 4px;">${album.year}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--accent); font-weight: bold; margin-bottom: 6px;">${album.genre}</div>
                    <p style="font-size: 12px; color: var(--text-muted); line-height: 1.45; margin-bottom: 8px;">${escapeHtml(album.description)}</p>
                    
                    <div style="background: var(--bg-card-inner); border: 1px solid var(--border-color); padding: 8px; margin-bottom: 10px;">
                        <span style="font-size: 10.5px; font-weight: bold; color: var(--text-dim); display: block; margin-bottom: 4px;">TRACKLIST SAMPLER:</span>
                        <ul style="padding-left: 16px; margin: 0;">${tracksHtml}</ul>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 11px; color: var(--text-dim);">${album.tracksCount} Tracks Mastered</span>
                        <a href="${album.bandcampUrl || 'https://bandcamp.com'}" target="_blank" class="btn-pixel" style="text-decoration: none;">
                            <span>▶</span> STREAM ON BANDCAMP
                        </a>
                    </div>
                `;

                musicGridEl.appendChild(card);
            });
        } catch (e) {
            musicGridEl.innerHTML = '<div style="color: red; padding: 10px;">Failed to load music releases.</div>';
        }
    }

    async function loadSfx() {
        if (!sfxGridEl) return;
        try {
            const res = await fetch('/api/sfx');
            const sfxList = await res.json();
            sfxGridEl.innerHTML = '';

            sfxList.forEach(sfx => {
                const card = document.createElement('div');
                card.className = 'sfx-card';
                card.innerHTML = `
                    <div>
                        <div class="sfx-header">
                            <h4 class="sfx-title">${escapeHtml(sfx.name)}</h4>
                            <span class="sfx-type-badge">${escapeHtml(sfx.type)}</span>
                        </div>
                        <div class="sfx-desc">${escapeHtml(sfx.description)}</div>
                    </div>
                    <div class="sfx-action-row">
                        <span style="font-size: 10px; color: var(--text-dim);">${sfx.format}</span>
                        <button class="btn-pixel btn-audition-sfx" data-synth="${sfx.synth}">
                            <span>▶</span> AUDITION SAMPLE
                        </button>
                    </div>
                `;

                const btn = card.querySelector('.btn-audition-sfx');
                btn.addEventListener('click', () => {
                    if (window.soundEngine) {
                        window.soundEngine.auditionSample(sfx.synth);
                    }
                });

                sfxGridEl.appendChild(card);
            });
        } catch (e) {
            sfxGridEl.innerHTML = '<div style="color: red; padding: 10px;">Failed to load sound effects vault.</div>';
        }
    }

    // ========================================================================
    // 9. DEVLOGS & LATEST UPDATE ON HOMEPAGE
    // ========================================================================

    async function loadUpdates() {
        try {
            const res = await fetch('/api/updates');
            const updates = await res.json();
            
            if (updatesListEl) {
                updatesListEl.innerHTML = '';
                if (updates.length === 0) {
                    updatesListEl.innerHTML = '<div style="font-size: 12px; color: var(--text-dim); padding: 12px;">No transmissions logged yet.</div>';
                    return;
                }

                updates.forEach(u => {
                    const box = document.createElement('div');
                    box.style.background = 'var(--bg-card)';
                    box.style.border = '1px solid var(--border-color)';
                    box.style.padding = '14px 18px';
                    box.style.marginBottom = '14px';

                    box.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                            <h3 style="font-family: var(--font-title); font-size: 22px; color: var(--link-color); margin: 0;">${escapeHtml(u.title)}</h3>
                            <span style="font-size: 11px; color: var(--text-dim); font-weight: bold;">${u.date}</span>
                        </div>
                        <div style="font-size: 12.5px; line-height: 1.6; color: var(--text-primary); white-space: pre-wrap;">${escapeHtml(u.body)}</div>
                        <div style="margin-top: 10px; font-size: 10.5px; color: var(--text-dim); border-top: 1px dashed var(--border-color); padding-top: 6px;">
                            LOGGED BY: MOPTAM // VERIFIED DISPATCH
                        </div>
                    `;
                    updatesListEl.appendChild(box);
                });
            }

            // Also load latest into homepage
            if (updates.length > 0) {
                const latest = updates[0];
                if (homeLatestUpdateDate) homeLatestUpdateDate.textContent = latest.date;
                if (homeLatestUpdateTitle) homeLatestUpdateTitle.textContent = latest.title;
                if (homeLatestUpdateBody) homeLatestUpdateBody.textContent = latest.body;
            }
        } catch (e) {}
    }

    // ========================================================================
    // 10. GUESTBOOK / TRANSMISSIONS STREAM
    // ========================================================================

    async function loadGuestbook() {
        if (!guestbookListEl) return;
        try {
            const res = await fetch('/api/guestbook');
            const entries = await res.json();
            guestbookListEl.innerHTML = '';

            if (entries.length === 0) {
                guestbookListEl.innerHTML = '<div style="font-size: 12px; color: var(--text-dim); padding: 12px;">The transmission ledger is currently clear.</div>';
                return;
            }

            entries.forEach(e => {
                const row = document.createElement('div');
                row.className = 'guestbook-entry';

                const dateStr = e.created_at ? new Date(e.created_at).toLocaleDateString() : '';
                const roleBadge = e.user_role === 'admin' 
                    ? '<span style="background: var(--accent); color: #fff; font-size: 9.5px; padding: 1px 4px; border-radius: 2px;">ADMIN</span>' 
                    : '<span style="background: #0055ea; color: #fff; font-size: 9.5px; padding: 1px 4px; border-radius: 2px;">USER</span>';

                const deleteBtnHtml = (currentUser && currentUser.role === 'admin')
                    ? `<button class="btn-pixel btn-delete-gb" data-id="${e.id}" style="font-size: 10px; color: red; padding: 1px 5px;">[DELETE]</button>`
                    : '';

                row.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 11px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <strong style="color: var(--link-color);">${escapeHtml(e.username)}</strong>
                            ${roleBadge}
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--text-dim);">${dateStr}</span>
                            ${deleteBtnHtml}
                        </div>
                    </div>
                    <div style="font-size: 12.5px; line-height: 1.5; color: var(--text-primary); white-space: pre-wrap;">${escapeHtml(e.text)}</div>
                `;

                guestbookListEl.appendChild(row);
            });

            // Bind admin delete buttons
            document.querySelectorAll('.btn-delete-gb').forEach(b => {
                b.addEventListener('click', async () => {
                    const id = b.getAttribute('data-id');
                    if (confirm('Delete transmission?')) {
                        await fetch(`/api/guestbook/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        loadGuestbook();
                    }
                });
            });
        } catch (e) {}
    }

    if (guestbookForm) {
        guestbookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) {
                openAuthModal('Sign in or register an account to transmit to the guestbook.', 'login');
                return;
            }

            const gbText = document.getElementById('gbText');
            const text = gbText.value.trim();
            if (!text) return;

            gbStatusEl.textContent = 'Transmitting...';
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
                    gbStatusEl.textContent = 'Transmission logged.';
                    gbStatusEl.style.color = '#2e7d32';
                    gbText.value = '';
                    setTimeout(() => {
                        gbStatusEl.textContent = '';
                        loadGuestbook();
                    }, 500);
                } else {
                    const data = await res.json();
                    gbStatusEl.textContent = data.error || 'Failed to transmit.';
                    gbStatusEl.style.color = 'var(--accent)';
                }
            } catch (err) {
                gbStatusEl.textContent = 'Transmission error.';
                gbStatusEl.style.color = 'var(--accent)';
            }
        });
    }

    // ========================================================================
    // 11. WINDOWS XP START MENU & SECRET TERMINAL
    // ========================================================================

    window.toggleStartMenu = function(show) {
        if (!xpStartMenu) return;
        if (show === undefined) {
            xpStartMenu.classList.toggle('open');
        } else if (show) {
            xpStartMenu.classList.add('open');
        } else {
            xpStartMenu.classList.remove('open');
        }
        if (window.soundEngine) window.soundEngine.playSelect();
    };

    if (xpStartBtn) {
        xpStartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.toggleStartMenu();
        });
    }

    document.addEventListener('click', (e) => {
        if (xpStartMenu && xpStartMenu.classList.contains('open')) {
            if (!xpStartMenu.contains(e.target) && e.target !== xpStartBtn) {
                window.toggleStartMenu(false);
            }
        }
    });

    // Terminal Emulator
    function openTerminal() {
        if (terminalDrawer) {
            terminalDrawer.classList.add('open');
            if (terminalInput) terminalInput.focus();
            if (window.soundEngine) window.soundEngine.playSelect();
        }
    }

    function closeTerminal() {
        if (terminalDrawer) terminalDrawer.classList.remove('open');
    }

    openTerminalLinks.forEach(l => {
        l.addEventListener('click', (e) => {
            e.preventDefault();
            openTerminal();
        });
    });

    if (terminalCloseBtn) terminalCloseBtn.addEventListener('click', closeTerminal);

    document.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~') {
            if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (terminalDrawer && terminalDrawer.classList.contains('open')) {
                    closeTerminal();
                } else {
                    openTerminal();
                }
            }
        } else if (e.key === 'Escape') {
            closeTerminal();
            closeAuthModal();
            if (artModal) artModal.classList.remove('open');
            if (gameModal) gameModal.classList.remove('open');
            if (playModal) {
                playIframe.src = 'about:blank';
                playModal.classList.remove('open');
            }
        }
    });

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (window.soundEngine) window.soundEngine.playTerminalKey();
            if (e.key === 'Enter') {
                const cmd = terminalInput.value.trim().toLowerCase();
                terminalInput.value = '';
                executeTerminalCommand(cmd);
            }
        });
    }

    function executeTerminalCommand(cmd) {
        logTerminal(`TERMINAL> ${cmd}`);
        const parts = cmd.split(' ');
        const main = parts[0];

        switch (main) {
            case 'help':
                logTerminal('AVAILABLE COMMANDS:');
                logTerminal('  help             - Show command listing');
                logTerminal('  games            - Navigate to Games Archive');
                logTerminal('  art              - Navigate to Art Gallery');
                logTerminal('  audio            - Navigate to Audio Lab & Vault');
                logTerminal('  updates          - Navigate to Devlogs');
                logTerminal('  guestbook        - Open Guestbook ledger');
                logTerminal('  theme <name>     - xp-luna, win98, backrooms, dark, green, amber, blood');
                logTerminal('  crt on|off       - Toggle cathode ray tube scanlines');
                logTerminal('  sound on|off     - Toggle web audio synthesizer');
                logTerminal('  clear            - Wipe terminal buffer');
                break;
            case 'games':
                location.hash = '#games';
                closeTerminal();
                break;
            case 'art':
                location.hash = '#art';
                closeTerminal();
                break;
            case 'audio':
                location.hash = '#audio';
                closeTerminal();
                break;
            case 'updates':
                location.hash = '#updates';
                closeTerminal();
                break;
            case 'guestbook':
                location.hash = '#guestbook';
                closeTerminal();
                break;
            case 'theme':
                if (parts[1] && themes.includes(parts[1])) {
                    setTheme(parts[1]);
                    logTerminal(`Theme calibrated to: ${parts[1].toUpperCase()}`);
                } else {
                    logTerminal(`Invalid theme. Available: ${themes.join(', ')}`);
                }
                break;
            case 'crt':
                if (parts[1] === 'off') setCRT(false);
                else setCRT(true);
                logTerminal(`CRT Scanlines: ${parts[1] === 'off' ? 'DISABLED' : 'ACTIVATED'}`);
                break;
            case 'sound':
                if (parts[1] === 'off') {
                    if (window.soundEngine && window.soundEngine.enabled) window.soundEngine.toggleSound();
                    logTerminal('Web Audio Muted.');
                } else {
                    if (window.soundEngine && !window.soundEngine.enabled) window.soundEngine.toggleSound();
                    logTerminal('Web Audio Synthesizer Engaged.');
                }
                updateAudioBtnState();
                break;
            case 'clear':
                if (terminalLog) terminalLog.innerHTML = '';
                break;
            default:
                logTerminal(`Unknown directive: "${main}". Type "help" for syntax.`);
        }
    }

    function logTerminal(msg) {
        if (!terminalLog) return;
        const line = document.createElement('div');
        line.textContent = msg;
        terminalLog.appendChild(line);
        terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    checkAuth();
    loadGames();
    loadReactions();
    loadArt();
    loadMusic();
    loadSfx();
    loadUpdates();
    handleRoute();
});
