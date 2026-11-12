// Main Frontend Logic for Hello, I am MOPTAM: Personal Creative Hub & Games Archive
document.addEventListener('DOMContentLoaded', () => {
    let allGames = [];
    let currentSelectedGame = null;
    let currentFilter = 'ALL';
    let currentFeedbackType = 'all';

    let allArt = [];
    let currentArtFilter = 'ALL';

    // Music Player State
    let allAlbums = [];
    let allTracks = [];
    let currentTrackIndex = 0;
    let isPlaying = false;
    let audioPlaybackTimer = null;
    let currentTrackPlaybackSeconds = 0;

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
    const xpAddressText = document.getElementById('xpAddressText');

    // Homepage Elements
    const homeLatestUpdateDate = document.getElementById('homeLatestUpdateDate');
    const homeLatestUpdateTitle = document.getElementById('homeLatestUpdateTitle');
    const homeLatestUpdateBody = document.getElementById('homeLatestUpdateBody');

    // Games Archive Elements (Gallery View vs Dedicated Page)
    const gamesGalleryView = document.getElementById('gamesGalleryView');
    const gamesGalleryGrid = document.getElementById('gamesGalleryGrid');
    const gameDetailPage = document.getElementById('gameDetailPage');
    const btnBackToGamesGallery = document.getElementById('btnBackToGamesGallery');
    const gameBreadcrumbTitle = document.getElementById('gameBreadcrumbTitle');
    const gameDetailHeroImg = document.getElementById('gameDetailHeroImg');
    const gameDetailPriceBadge = document.getElementById('gameDetailPriceBadge');
    const gameDetailVersion = document.getElementById('gameDetailVersion');
    const gameDetailTitle = document.getElementById('gameDetailTitle');
    const gameDetailSubtitle = document.getElementById('gameDetailSubtitle');
    const gameDetailTags = document.getElementById('gameDetailTags');
    const gameDetailDesc = document.getElementById('gameDetailDesc');
    const gameDetailScreenshots = document.getElementById('gameDetailScreenshots');
    const gameDetailFeaturesList = document.getElementById('gameDetailFeaturesList');
    const gameMetaStatus = document.getElementById('gameMetaStatus');
    const gameMetaPlatforms = document.getElementById('gameMetaPlatforms');
    const gameMetaSize = document.getElementById('gameMetaSize');
    const gameMetaDate = document.getElementById('gameMetaDate');
    const gameMetaDownloads = document.getElementById('gameMetaDownloads');
    const btnPageDownload = document.getElementById('btnPageDownload');
    const btnPageSteam = document.getElementById('btnPageSteam');
    const btnPagePlayBrowser = document.getElementById('btnPagePlayBrowser');
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

    // Full Resolution Image Lightbox Viewer
    const imageLightboxModal = document.getElementById('imageLightboxModal');
    const lightboxModalTitle = document.getElementById('lightboxModalTitle');
    const lightboxModalClose = document.getElementById('lightboxModalClose');
    const lightboxImg = document.getElementById('lightboxImg');
    const btnLightboxPrev = document.getElementById('btnLightboxPrev');
    const btnLightboxNext = document.getElementById('btnLightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    let currentLightboxScreens = [];
    let currentLightboxIndex = 0;

    // Built-In Music Player Elements
    const playerCurrentCover = document.getElementById('playerCurrentCover');
    const playerCurrentTitle = document.getElementById('playerCurrentTitle');
    const playerCurrentArtist = document.getElementById('playerCurrentArtist');
    const playerTimeCurrent = document.getElementById('playerTimeCurrent');
    const playerTimeDuration = document.getElementById('playerTimeDuration');
    const playerSeekSlider = document.getElementById('playerSeekSlider');
    const btnPlayerPlay = document.getElementById('btnPlayerPlay');
    const playerPlayIcon = document.getElementById('playerPlayIcon');
    const playerPlayText = document.getElementById('playerPlayText');
    const btnPlayerPrev = document.getElementById('btnPlayerPrev');
    const btnPlayerNext = document.getElementById('btnPlayerNext');
    const btnPlayerRewind = document.getElementById('btnPlayerRewind');
    const btnPlayerForward = document.getElementById('btnPlayerForward');
    const btnPlayerStop = document.getElementById('btnPlayerStop');
    const btnPlayerDownloadTrack = document.getElementById('btnPlayerDownloadTrack');
    const playerVolume = document.getElementById('playerVolume');
    const playerStatusIndicator = document.getElementById('playerStatusIndicator');
    const musicTracksList = document.getElementById('musicTracksList');
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
    const playModal = document.getElementById('playModal');
    const playModalClose = document.getElementById('playModalClose');
    const playIframe = document.getElementById('playIframe');

    // Auth Modal Elements (Windows XP Luna Authentication & Tabs)
    const authModal = document.getElementById('authModal');
    const authModalClose = document.getElementById('authModalClose');
    const authTabLogin = document.getElementById('authTabLogin');
    const authTabRegister = document.getElementById('authTabRegister');
    const authTabAdmin = document.getElementById('authTabAdmin');
    const authPaneLogin = document.getElementById('authPaneLogin');
    const authPaneRegister = document.getElementById('authPaneRegister');
    const authPaneAdmin = document.getElementById('authPaneAdmin');
    const authPaneUsernamePrompt = document.getElementById('authPaneUsernamePrompt');
    const loginForm = document.getElementById('loginForm');
    const loginIdentifier = document.getElementById('loginIdentifier');
    const loginPassword = document.getElementById('loginPassword');
    const registerForm = document.getElementById('registerForm');
    const regUsername = document.getElementById('regUsername');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const adminPasscodeForm = document.getElementById('adminPasscodeForm');
    const adminPasscodeInput = document.getElementById('adminPasscodeInput');
    const ssoVerifiedNotice = document.getElementById('ssoVerifiedNotice');
    const ssoVerifiedEmail = document.getElementById('ssoVerifiedEmail');
    const ssoUsernameInput = document.getElementById('ssoUsernameInput');
    const btnConfirmUsername = document.getElementById('btnConfirmUsername');
    const btnCancelSocial = document.getElementById('btnCancelSocial');
    const ssoBtns = document.querySelectorAll('.sso-btn');
    const authStatusMsg = document.getElementById('authStatusMsg');

    // User Profile & Avatar Modal Elements
    const userProfileBtn = document.getElementById('userProfileBtn');
    const headerUserAvatar = document.getElementById('headerUserAvatar');
    const headerUserName = document.getElementById('headerUserName');
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    const userProfileModal = document.getElementById('userProfileModal');
    const userProfileModalClose = document.getElementById('userProfileModalClose');
    const profileAvatarImg = document.getElementById('profileAvatarImg');
    const profileAvatarBadge = document.getElementById('profileAvatarBadge');
    const profileUsernameDisplay = document.getElementById('profileUsernameDisplay');
    const profileRoleBadge = document.getElementById('profileRoleBadge');
    const profileProviderBadge = document.getElementById('profileProviderBadge');
    const profileEmailDisplay = document.getElementById('profileEmailDisplay');
    const avatarFileInput = document.getElementById('avatarFileInput');
    const btnTriggerAvatarUpload = document.getElementById('btnTriggerAvatarUpload');
    const btnRemoveCustomAvatar = document.getElementById('btnRemoveCustomAvatar');
    const avatarUploadFeedback = document.getElementById('avatarUploadFeedback');
    const dossierUserId = document.getElementById('dossierUserId');
    const dossierJoinDate = document.getElementById('dossierJoinDate');
    const dossierTransmissionsCount = document.getElementById('dossierTransmissionsCount');
    const dossierFeedbackCount = document.getElementById('dossierFeedbackCount');
    const dossierThemeAvatarName = document.getElementById('dossierThemeAvatarName');
    const profileLogoutActionBtn = document.getElementById('profileLogoutActionBtn');
    const profileModalDoneBtn = document.getElementById('profileModalDoneBtn');

    let pendingSocialAuth = null;

    // ========================================================================
    // 1. MULTI-PART VIEW ROUTING (NO SINGLE LONG SCROLL)
    // ========================================================================

    function handleRoute() {
        const rawHash = window.location.hash.replace('#', '').trim().toLowerCase();

        // Check if routing to specific game page: e.g. #game/buckshot-chamber or #games/buckshot-chamber
        if (rawHash.startsWith('game/') || rawHash.startsWith('games/')) {
            const parts = rawHash.split('/');
            const gameId = parts[1];
            switchView('games');
            if (allGames.length > 0) {
                const found = allGames.find(g => g.id === gameId);
                if (found) {
                    openDedicatedGamePage(found);
                    return;
                }
            }
            return;
        }

        let targetView = 'home';
        if (rawHash === 'games' || rawHash === 'catalogue') {
            targetView = 'games';
            showGamesGalleryView();
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

        // Update Windows XP Explorer Address Bar Text
        if (xpAddressText) {
            const addresses = {
                home: 'C:\\Documents and Settings\\MOPTAM\\Creative_Hub\\home.htm',
                games: 'C:\\Games\\MOPTAM_Archive\\catalogue.htm',
                art: 'C:\\Documents and Settings\\MOPTAM\\My Pictures\\Art_Gallery.htm',
                audio: 'C:\\Documents and Settings\\MOPTAM\\My Music\\Audio_Lab.htm',
                updates: 'C:\\Documents and Settings\\MOPTAM\\Dispatches\\devlogs.htm',
                guestbook: 'C:\\Network Connections\\MOPTAM\\guestbook.htm'
            };
            xpAddressText.textContent = addresses[viewName] || `C:\\MOPTAM\\${viewName}.htm`;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        refreshAvatars();
    }

    function getThemeDefaultAvatarInfo() {
        const theme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('crt_theme') || 'xp';
        const map = {
            'xp': { url: '/assets/avatars/avatar_xp.svg', name: 'Windows XP Luna Knight' },
            'xp-luna': { url: '/assets/avatars/avatar_xp.svg', name: 'Windows XP Luna Knight' },
            'win98': { url: '/assets/avatars/avatar_win98.svg', name: 'Windows 98 Pixel Monitor' },
            'dark': { url: '/assets/avatars/avatar_dark.svg', name: 'Dark CRT Cyber Visor' },
            'green': { url: '/assets/avatars/avatar_green.svg', name: 'Phosphor Green Terminal Skull' },
            'amber': { url: '/assets/avatars/avatar_amber.svg', name: 'Amber 60Hz Vector Radiation' },
            'blood': { url: '/assets/avatars/avatar_blood.svg', name: 'Blood Noir Surveillance Lens' },
            'backrooms': { url: '/assets/avatars/avatar_backrooms.svg', name: 'Liminal Wallpaper Entity' }
        };
        return map[theme] || map['xp'];
    }

    function getUserAvatarUrl(user) {
        if (user && user.avatar) {
            return user.avatar;
        }
        return getThemeDefaultAvatarInfo().url;
    }

    function refreshAvatars() {
        if (headerUserAvatar) {
            headerUserAvatar.src = getUserAvatarUrl(currentUser);
        }
        if (profileAvatarImg && userProfileModal && userProfileModal.classList.contains('open')) {
            profileAvatarImg.src = getUserAvatarUrl(currentUser);
            if (dossierThemeAvatarName) {
                dossierThemeAvatarName.textContent = getThemeDefaultAvatarInfo().name;
            }
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

    // Window Minimize/Max/Close
    const winBtnMin = document.getElementById('winBtnMin');
    const winBtnMax = document.getElementById('winBtnMax');
    const winBtnClose = document.getElementById('winBtnClose');

    if (winBtnMin) {
        winBtnMin.addEventListener('click', () => {
            const doc = document.querySelector('.doccontents');
            if (doc) doc.style.display = doc.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (winBtnMax) {
        winBtnMax.addEventListener('click', () => {
            const doc = document.querySelector('.doc');
            if (doc) doc.classList.toggle('maximized');
        });
    }

    if (winBtnClose) {
        winBtnClose.addEventListener('click', () => {
            if (confirm('Exit Hello, I am MOPTAM portal?')) {
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
            if (authBtn) authBtn.style.display = 'none';
            if (userProfileBtn) {
                userProfileBtn.style.display = 'inline-flex';
                if (headerUserName) headerUserName.textContent = currentUser.username.toUpperCase();
                if (headerUserAvatar) headerUserAvatar.src = getUserAvatarUrl(currentUser);
            }
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'inline-flex';

            if (currentUser.role === 'admin') {
                if (adminUploadBtn) adminUploadBtn.style.display = 'inline-flex';
                if (adminNewDispatchBtn) adminNewDispatchBtn.style.display = 'inline-flex';
            } else {
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
            if (authBtn) {
                authBtn.style.display = 'inline-block';
                authBtn.textContent = 'LOGIN / REGISTER';
            }
            if (userProfileBtn) userProfileBtn.style.display = 'none';
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
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

    if (authBtn) {
        authBtn.addEventListener('click', () => {
            openAuthModal('OPERATOR AUTHENTICATION', 'login');
        });
    }

    if (userProfileBtn) {
        userProfileBtn.addEventListener('click', () => {
            openUserProfileModal();
        });
    }

    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', () => {
            if (confirm(`Terminate current session for [${currentUser.username}]?`)) {
                logout();
            }
        });
    }

    // ========================================================================
    // USER PROFILE MODAL & AVATAR UPLOAD LOGIC
    // ========================================================================

    async function openUserProfileModal() {
        if (!currentUser) {
            openAuthModal('Please sign in to view your operative dossier.', 'login');
            return;
        }

        if (profileAvatarImg) profileAvatarImg.src = getUserAvatarUrl(currentUser);
        if (profileUsernameDisplay) profileUsernameDisplay.textContent = currentUser.username;
        if (profileRoleBadge) profileRoleBadge.textContent = `CLEARANCE: ${(currentUser.role || 'USER').toUpperCase()}`;
        if (profileProviderBadge) profileProviderBadge.textContent = `${(currentUser.provider || 'LOCAL').toUpperCase()} AUTH`;
        if (profileEmailDisplay) profileEmailDisplay.textContent = currentUser.email || 'No email registered';
        if (dossierUserId) dossierUserId.textContent = currentUser.id || 'N/A';
        const joinDate = currentUser.created_at || currentUser.createdAt;
        if (dossierJoinDate) dossierJoinDate.textContent = joinDate ? joinDate.slice(0, 10) : '2026-11-12';
        if (dossierThemeAvatarName) dossierThemeAvatarName.textContent = getThemeDefaultAvatarInfo().name;

        if (currentUser.avatar) {
            if (profileAvatarBadge) {
                profileAvatarBadge.textContent = 'CUSTOM AVATAR';
                profileAvatarBadge.style.background = '#2e7d32';
            }
            if (btnRemoveCustomAvatar) btnRemoveCustomAvatar.style.display = 'inline-block';
        } else {
            if (profileAvatarBadge) {
                profileAvatarBadge.textContent = 'THEME DEFAULT';
                profileAvatarBadge.style.background = 'var(--link-color, #0055ea)';
            }
            if (btnRemoveCustomAvatar) btnRemoveCustomAvatar.style.display = 'none';
        }

        if (avatarUploadFeedback) avatarUploadFeedback.textContent = '';

        if (userProfileModal) userProfileModal.classList.add('open');
        if (window.soundEngine) window.soundEngine.playSelect();

        // Fetch detailed profile stats from server
        try {
            const res = await fetch('/api/user/profile', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.stats) {
                    if (dossierTransmissionsCount) dossierTransmissionsCount.textContent = data.stats.transmissions;
                    if (dossierFeedbackCount) dossierFeedbackCount.textContent = data.stats.feedbackReports;
                }
                if (data.user) {
                    currentUser = { ...currentUser, ...data.user };
                    if (headerUserAvatar) headerUserAvatar.src = getUserAvatarUrl(currentUser);
                    if (profileAvatarImg) profileAvatarImg.src = getUserAvatarUrl(currentUser);
                }
            }
        } catch (e) {}
    }

    function closeUserProfileModal() {
        if (userProfileModal) userProfileModal.classList.remove('open');
        if (avatarUploadFeedback) avatarUploadFeedback.textContent = '';
    }

    if (userProfileModalClose) userProfileModalClose.addEventListener('click', closeUserProfileModal);
    if (profileModalDoneBtn) profileModalDoneBtn.addEventListener('click', closeUserProfileModal);
    if (userProfileModal) {
        userProfileModal.addEventListener('click', (e) => {
            if (e.target === userProfileModal) closeUserProfileModal();
        });
    }

    if (profileLogoutActionBtn) {
        profileLogoutActionBtn.addEventListener('click', () => {
            if (confirm(`Terminate current session for [${currentUser.username}]?`)) {
                closeUserProfileModal();
                logout();
            }
        });
    }

    // Avatar Upload Handler
    if (btnTriggerAvatarUpload && avatarFileInput) {
        btnTriggerAvatarUpload.addEventListener('click', () => {
            avatarFileInput.click();
        });

        avatarFileInput.addEventListener('change', async () => {
            const file = avatarFileInput.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                if (avatarUploadFeedback) {
                    avatarUploadFeedback.textContent = 'File too large! Max image size is 5MB.';
                    avatarUploadFeedback.style.color = 'var(--accent)';
                }
                return;
            }

            const formData = new FormData();
            formData.append('avatar', file);

            if (avatarUploadFeedback) {
                avatarUploadFeedback.textContent = 'Transmitting avatar to sector mainframe...';
                avatarUploadFeedback.style.color = 'var(--link-color)';
            }

            try {
                const res = await fetch('/api/user/avatar', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    body: formData
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    currentUser.avatar = data.avatar;
                    if (headerUserAvatar) headerUserAvatar.src = data.avatar;
                    if (profileAvatarImg) profileAvatarImg.src = data.avatar;
                    if (profileAvatarBadge) {
                        profileAvatarBadge.textContent = 'CUSTOM AVATAR';
                        profileAvatarBadge.style.background = '#2e7d32';
                    }
                    if (btnRemoveCustomAvatar) btnRemoveCustomAvatar.style.display = 'inline-block';
                    if (avatarUploadFeedback) {
                        avatarUploadFeedback.textContent = '✓ Profile avatar updated successfully!';
                        avatarUploadFeedback.style.color = '#2e7d32';
                    }
                    if (window.soundEngine) window.soundEngine.playSelect();
                } else {
                    if (avatarUploadFeedback) {
                        avatarUploadFeedback.textContent = data.error || 'Failed to update avatar.';
                        avatarUploadFeedback.style.color = 'var(--accent)';
                    }
                }
            } catch (err) {
                if (avatarUploadFeedback) {
                    avatarUploadFeedback.textContent = 'Connection error during avatar upload.';
                    avatarUploadFeedback.style.color = 'var(--accent)';
                }
            } finally {
                avatarFileInput.value = '';
            }
        });
    }

    // Reset Custom Avatar to Theme Default
    if (btnRemoveCustomAvatar) {
        btnRemoveCustomAvatar.addEventListener('click', async () => {
            if (!confirm('Reset to theme default avatar? Your avatar will synchronize with each active visual theme.')) {
                return;
            }

            if (avatarUploadFeedback) {
                avatarUploadFeedback.textContent = 'Resetting to theme default...';
                avatarUploadFeedback.style.color = 'var(--link-color)';
            }

            try {
                const res = await fetch('/api/user/avatar', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    currentUser.avatar = null;
                    const def = getThemeDefaultAvatarInfo();
                    if (headerUserAvatar) headerUserAvatar.src = def.url;
                    if (profileAvatarImg) profileAvatarImg.src = def.url;
                    if (profileAvatarBadge) {
                        profileAvatarBadge.textContent = 'THEME DEFAULT';
                        profileAvatarBadge.style.background = 'var(--link-color, #0055ea)';
                    }
                    if (btnRemoveCustomAvatar) btnRemoveCustomAvatar.style.display = 'none';
                    if (avatarUploadFeedback) {
                        avatarUploadFeedback.textContent = `✓ Reset to ${def.name}!`;
                        avatarUploadFeedback.style.color = '#2e7d32';
                    }
                    if (window.soundEngine) window.soundEngine.playSelect();
                }
            } catch (err) {
                if (avatarUploadFeedback) {
                    avatarUploadFeedback.textContent = 'Failed to reset avatar.';
                    avatarUploadFeedback.style.color = 'var(--accent)';
                }
            }
        });
    }

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
        pendingSocialAuth = null;
    }

    if (authModalClose) authModalClose.addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    function switchAuthTab(tab) {
        [authTabLogin, authTabRegister, authTabAdmin].forEach(t => {
            if (t) t.classList.remove('active-auth-tab');
        });
        if (authPaneLogin) authPaneLogin.style.display = 'none';
        if (authPaneRegister) authPaneRegister.style.display = 'none';
        if (authPaneAdmin) authPaneAdmin.style.display = 'none';
        if (authPaneUsernamePrompt) authPaneUsernamePrompt.style.display = 'none';

        if (tab === 'login') {
            if (authTabLogin) authTabLogin.classList.add('active-auth-tab');
            if (authPaneLogin) authPaneLogin.style.display = 'block';
            if (loginIdentifier) loginIdentifier.focus();
        } else if (tab === 'register') {
            if (authTabRegister) authTabRegister.classList.add('active-auth-tab');
            if (authPaneRegister) authPaneRegister.style.display = 'block';
            if (regUsername) regUsername.focus();
        } else if (tab === 'admin') {
            if (authTabAdmin) authTabAdmin.classList.add('active-auth-tab');
            if (authPaneAdmin) authPaneAdmin.style.display = 'block';
            if (adminPasscodeInput) adminPasscodeInput.focus();
        }
    }

    if (authTabLogin) authTabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (authTabRegister) authTabRegister.addEventListener('click', () => switchAuthTab('register'));
    if (authTabAdmin) authTabAdmin.addEventListener('click', () => switchAuthTab('admin'));

    // Manual Sign In Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = loginIdentifier.value.trim();
            const password = loginPassword.value;
            authStatusMsg.textContent = 'Authenticating credentials...';
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
                    authStatusMsg.textContent = `Clearance granted: Welcome ${currentUser.username}!`;
                    authStatusMsg.style.color = '#2e7d32';
                    setTimeout(() => {
                        closeAuthModal();
                        updateUserUI();
                        loadReactions();
                        if (currentSelectedGame) loadGameFeedback(currentSelectedGame.id);
                    }, 500);
                } else {
                    authStatusMsg.textContent = data.error || 'Authentication denied: Invalid credentials.';
                    authStatusMsg.style.color = 'var(--accent)';
                }
            } catch (err) {
                authStatusMsg.textContent = 'Server connection error.';
                authStatusMsg.style.color = 'var(--accent)';
            }
        });
    }

    // Manual Registration Form Submission
    if (registerForm) {
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
                    }, 500);
                } else {
                    authStatusMsg.textContent = data.error || 'Registration failed.';
                    authStatusMsg.style.color = 'var(--accent)';
                }
            } catch (err) {
                authStatusMsg.textContent = 'Server connection error.';
                authStatusMsg.style.color = 'var(--accent)';
            }
        });
    }

    // Submit Admin Master Passcode
    if (adminPasscodeForm) {
        adminPasscodeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const passcode = adminPasscodeInput.value.trim();
            if (!passcode) return;

            authStatusMsg.textContent = 'Verifying administrator passcode...';
            authStatusMsg.style.color = 'var(--link-color)';

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: 'admin', password: passcode })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    authToken = data.token;
                    currentUser = data.user;
                    localStorage.setItem('auth_token', authToken);
                    authStatusMsg.textContent = `Clearance Granted: Welcome Administrator.`;
                    authStatusMsg.style.color = '#2e7d32';
                    setTimeout(() => {
                        closeAuthModal();
                        updateUserUI();
                        loadReactions();
                        if (currentSelectedGame) loadGameFeedback(currentSelectedGame.id);
                    }, 500);
                } else {
                    authStatusMsg.textContent = data.error || 'Access Denied: Invalid passcode.';
                    authStatusMsg.style.color = 'var(--accent)';
                }
            } catch (err) {
                authStatusMsg.textContent = 'Server connection error.';
                authStatusMsg.style.color = 'var(--accent)';
            }
        });
    }

    // Single Sign-On (SSO) Provider Buttons (Google, GitHub, Apple, Facebook)
    ssoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.getAttribute('data-provider') || 'google';
            authStatusMsg.textContent = `Opening genuine ${provider.toUpperCase()} OAuth 2.0 authorization...`;
            authStatusMsg.style.color = 'var(--link-color)';

            // Open genuine OAuth window
            const width = 560;
            const height = 700;
            const left = Math.max(0, (window.screen.width - width) / 2);
            const top = Math.max(0, (window.screen.height - height) / 2);
            const popupUrl = `/api/auth/${encodeURIComponent(provider)}`;

            const oauthWindow = window.open(
                popupUrl,
                'oauth_sso_window',
                `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no`
            );

            if (!oauthWindow || oauthWindow.closed || typeof oauthWindow.closed === 'undefined') {
                authStatusMsg.textContent = 'Popup window blocked by browser. Redirecting directly to ' + provider.toUpperCase() + '...';
                window.location.href = popupUrl;
            }
        });
    });

    // Check if user returned from direct OAuth redirect
    try {
        const initialUrlParams = new URLSearchParams(window.location.search);
        if (initialUrlParams.get('choose_callsign') === '1') {
            const rawPending = sessionStorage.getItem('pending_social');
            if (rawPending) {
                const p = JSON.parse(rawPending);
                sessionStorage.removeItem('pending_social');
                pendingSocialAuth = p;
                openAuthModal();
                if (authPaneLogin) authPaneLogin.style.display = 'none';
                if (authPaneRegister) authPaneRegister.style.display = 'none';
                if (authPaneAdmin) authPaneAdmin.style.display = 'none';
                if (authPaneUsernamePrompt) authPaneUsernamePrompt.style.display = 'block';
                if (ssoVerifiedNotice) ssoVerifiedNotice.textContent = `IDENTITY VERIFIED VIA ${p.provider.toUpperCase()}!`;
                if (ssoVerifiedEmail) ssoVerifiedEmail.textContent = p.email || 'Verified Profile';
                if (ssoUsernameInput) {
                    ssoUsernameInput.value = p.suggestedName || '';
                    ssoUsernameInput.focus();
                }
                authStatusMsg.textContent = 'Account verified. Please choose your call-sign:';
                authStatusMsg.style.color = 'var(--link-color)';
            }
        }
    } catch (e) {}

    // Listen for verified identity message from the OAuth Callback Window
    window.addEventListener('message', async (e) => {
        if (!e.data) return;

        // 1. Handle Real OAuth 2.0 Callback
        if (e.data.type === 'OAUTH_CALLBACK') {
            const { status, token, username, provider, email, suggestedName, providerId, avatar, error } = e.data;

            if (status === 'error' || error) {
                authStatusMsg.textContent = `OAuth Error: ${error || 'Authentication aborted'}`;
                authStatusMsg.style.color = 'var(--accent)';
                return;
            }

            if (status === 'success' && token) {
                authToken = token;
                localStorage.setItem('auth_token', authToken);
                authStatusMsg.textContent = `Identity Verified: Welcome back, ${username}!`;
                authStatusMsg.style.color = '#2e7d32';

                await checkAuthStatus();
                setTimeout(() => {
                    closeAuthModal();
                    loadReactions();
                    if (currentSelectedGame) loadGameFeedback(currentSelectedGame.id);
                }, 600);
                return;
            }

            if (status === 'new_user') {
                pendingSocialAuth = {
                    provider: provider || 'google',
                    email: email || null,
                    providerId: providerId || `${provider}_${Date.now()}`,
                    avatar: avatar || null
                };

                // Switch to Call-Sign prompt pane
                if (authPaneLogin) authPaneLogin.style.display = 'none';
                if (authPaneRegister) authPaneRegister.style.display = 'none';
                if (authPaneAdmin) authPaneAdmin.style.display = 'none';
                if (authPaneUsernamePrompt) authPaneUsernamePrompt.style.display = 'block';

                if (ssoVerifiedNotice) ssoVerifiedNotice.textContent = `IDENTITY VERIFIED VIA ${(provider || 'OAUTH').toUpperCase()}!`;
                if (ssoVerifiedEmail) ssoVerifiedEmail.textContent = email || 'Verified Social Profile';
                if (ssoUsernameInput) {
                    ssoUsernameInput.value = suggestedName || '';
                    ssoUsernameInput.focus();
                }

                authStatusMsg.textContent = `Account verified. Please choose your call-sign:`;
                authStatusMsg.style.color = 'var(--link-color)';
                return;
            }
        }

        // 2. Backward compatibility for legacy popup
        if (e.data.type === 'OAUTH_VERIFIED') {
            const { provider, email, name, providerId } = e.data;
            authStatusMsg.textContent = `Verifying ${provider.toUpperCase()} profile with server...`;
            authStatusMsg.style.color = 'var(--link-color)';

            try {
                const res = await fetch('/api/auth/social-check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider, email, name, providerId })
                });
                const data = await res.json();

                if (data.exists && data.token) {
                    authToken = data.token;
                    currentUser = data.user;
                    localStorage.setItem('auth_token', authToken);
                    authStatusMsg.textContent = `Identity Verified: Welcome back, ${currentUser.username}!`;
                    authStatusMsg.style.color = '#2e7d32';

                    setTimeout(() => {
                        closeAuthModal();
                        updateUserUI();
                        loadReactions();
                        if (currentSelectedGame) loadGameFeedback(currentSelectedGame.id);
                    }, 500);
                } else {
                    pendingSocialAuth = {
                        provider: data.provider,
                        email: data.email,
                        providerId: data.providerId,
                        avatar: null
                    };

                    if (authPaneLogin) authPaneLogin.style.display = 'none';
                    if (authPaneRegister) authPaneRegister.style.display = 'none';
                    if (authPaneAdmin) authPaneAdmin.style.display = 'none';
                    if (authPaneUsernamePrompt) authPaneUsernamePrompt.style.display = 'block';
                    if (ssoVerifiedNotice) ssoVerifiedNotice.textContent = `IDENTITY VERIFIED VIA ${provider.toUpperCase()}!`;
                    if (ssoVerifiedEmail) ssoVerifiedEmail.textContent = email || 'Verified Social Profile';
                    if (ssoUsernameInput) {
                        ssoUsernameInput.value = data.suggestedUsername || '';
                        ssoUsernameInput.focus();
                    }
                    authStatusMsg.textContent = 'Account verified. Please choose your call-sign:';
                    authStatusMsg.style.color = 'var(--link-color)';
                }
            } catch (err) {
                authStatusMsg.textContent = 'Authentication error during verification.';
                authStatusMsg.style.color = 'var(--accent)';
            }
        }
    });

    // Handle Confirm Username for new social user
    if (btnConfirmUsername) {
        btnConfirmUsername.addEventListener('click', async () => {
            if (!pendingSocialAuth) {
                openAuthModal('Session expired. Please select a provider again.');
                return;
            }

            const chosenUsername = ssoUsernameInput.value.trim();
            if (!chosenUsername || chosenUsername.length < 3) {
                authStatusMsg.textContent = 'Username must be at least 3 characters.';
                authStatusMsg.style.color = 'var(--accent)';
                return;
            }

            authStatusMsg.textContent = 'Finalizing your operator account...';
            authStatusMsg.style.color = 'var(--link-color)';

            try {
                const res = await fetch('/api/auth/social-complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: pendingSocialAuth.provider,
                        email: pendingSocialAuth.email,
                        providerId: pendingSocialAuth.providerId,
                        username: chosenUsername,
                        avatar: pendingSocialAuth.avatar
                    })
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
                    }, 500);
                } else {
                    authStatusMsg.textContent = data.error || 'Registration failed.';
                    authStatusMsg.style.color = 'var(--accent)';
                }
            } catch (err) {
                authStatusMsg.textContent = 'Server connection error.';
                authStatusMsg.style.color = 'var(--accent)';
            }
        });

        // Also allow Enter key inside ssoUsernameInput
        if (ssoUsernameInput) {
            ssoUsernameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    btnConfirmUsername.click();
                }
            });
        }
    }

    if (btnCancelSocial) {
        btnCancelSocial.addEventListener('click', () => {
            pendingSocialAuth = null;
            authPaneUsernamePrompt.style.display = 'none';
            switchAuthTab('login');
            authStatusMsg.textContent = '';
        });
    }

    // ========================================================================
    // 4. GAMES ARCHIVE: 2D BANNER GALLERY & DEDICATED PER-GAME PAGES
    // ========================================================================

    async function loadGames() {
        try {
            const res = await fetch('/api/games');
            allGames = await res.json();
            renderGamesGallery();
            
            // Check if URL hash points to a specific game
            const rawHash = window.location.hash.replace('#', '').trim().toLowerCase();
            if (rawHash.startsWith('game/') || rawHash.startsWith('games/')) {
                const parts = rawHash.split('/');
                const target = allGames.find(g => g.id === parts[1]);
                if (target) {
                    openDedicatedGamePage(target);
                    return;
                }
            }
        } catch (e) {
            if (gamesGalleryGrid) {
                gamesGalleryGrid.innerHTML = '<div style="color:red; padding:10px;">Failed to load archive database.</div>';
            }
        }
    }

    function renderGamesGallery() {
        if (!gamesGalleryGrid) return;
        gamesGalleryGrid.innerHTML = '';

        const filtered = allGames.filter(g => {
            if (currentFilter === 'ALL') return true;
            if (currentFilter === 'FREE') return g.isFree !== false;
            if (currentFilter === 'PAID') return g.isFree === false;
            return g.tags && g.tags.some(t => t.toUpperCase().includes(currentFilter));
        });

        if (filtered.length === 0) {
            gamesGalleryGrid.innerHTML = '<div style="padding: 16px; font-size: 13px; color: var(--text-dim);">No game builds matched this filter.</div>';
            return;
        }

        filtered.forEach(game => {
            const isFree = game.isFree !== false;
            const priceBadge = isFree ? '<span class="badge-free">FREE DOWNLOAD</span>' : `<span class="badge-steam">STEAM: ${game.price || '$6.99'}</span>`;
            const bannerImg = game.coverImage || '/assets/images/cover_chamber.svg';

            const card = document.createElement('div');
            card.className = 'game-banner-card';
            card.innerHTML = `
                <div class="game-banner-frame">
                    <img src="${bannerImg}" class="game-banner-img" alt="${escapeHtml(game.title)}">
                    <div class="screen-scanline-fx"></div>
                    <div class="game-banner-badge-strip">
                        ${priceBadge}
                        <span class="tag-badge" style="background: rgba(0,0,0,0.85); color: #fff;">v${game.version || '1.0'}</span>
                    </div>
                </div>
                <div class="game-banner-content">
                    <div>
                        <h3 class="game-banner-title">${escapeHtml(game.title)}</h3>
                        <div class="game-banner-subtitle">${escapeHtml(game.subtitle || '')}</div>
                        <div class="cat-tags" style="margin-bottom: 10px;">
                            ${game.tags ? game.tags.slice(0, 3).map(t => `<span class="tag-badge">${t}</span>`).join('') : ''}
                        </div>
                    </div>
                    <div class="game-banner-meta">
                        <span>SIZE: ${game.fileSize || '35 MB'}</span>
                        <div class="game-banner-cta-btn">
                            OPEN GAME PAGE ➔
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                location.hash = `#game/${game.id}`;
            });

            card.addEventListener('mouseenter', () => {
                if (window.soundEngine) window.soundEngine.playHover();
            });

            gamesGalleryGrid.appendChild(card);
        });
    }

    function showGamesGalleryView() {
        if (gamesGalleryView) gamesGalleryView.style.display = 'block';
        if (gameDetailPage) gameDetailPage.style.display = 'none';
        currentSelectedGame = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openDedicatedGamePage(game) {
        currentSelectedGame = game;
        if (gamesGalleryView) gamesGalleryView.style.display = 'none';
        if (gameDetailPage) gameDetailPage.style.display = 'block';

        // Update Address Bar
        if (xpAddressText) {
            xpAddressText.textContent = `C:\\Games\\MOPTAM_Archive\\${game.id}\\launch.htm`;
        }

        // Fill dedicated page content
        if (gameBreadcrumbTitle) gameBreadcrumbTitle.textContent = game.title;
        if (gameDetailHeroImg) gameDetailHeroImg.src = game.coverImage || '/assets/images/cover_chamber.svg';
        if (gameDetailTitle) gameDetailTitle.textContent = game.title;
        if (gameDetailSubtitle) gameDetailSubtitle.textContent = game.subtitle || '';
        if (gameDetailVersion) gameDetailVersion.textContent = `v${game.version || '1.0'}`;
        if (gameDetailDesc) gameDetailDesc.textContent = game.description || '';
        if (gameMetaPlatforms) gameMetaPlatforms.textContent = (game.platforms || ['Windows']).join(', ');
        if (gameMetaSize) gameMetaSize.textContent = game.fileSize || '40 MB';
        if (gameMetaDate) gameMetaDate.textContent = game.releaseDate || '2026';
        if (gameMetaDownloads) gameMetaDownloads.textContent = game.downloadsCount || 0;

        // Tags
        if (gameDetailTags && game.tags) {
            gameDetailTags.innerHTML = game.tags.map(t => `<span class="tag-badge">${t}</span>`).join('');
        }

        // Features list
        if (gameDetailFeaturesList && game.features) {
            gameDetailFeaturesList.innerHTML = game.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');
        }

        // Screenshots Gallery
        if (gameDetailScreenshots) {
            const screens = game.screenshots && game.screenshots.length > 0 ? game.screenshots : [game.coverImage || '/assets/images/cover_chamber.svg'];
            gameDetailScreenshots.className = 'game-screenshots-grid';
            gameDetailScreenshots.innerHTML = screens.map((s, idx) => `
                <div class="game-shot-card" data-idx="${idx}" title="Click to enlarge full resolution">
                    <div class="game-shot-frame">
                        <img src="${s}" class="game-shot-img" alt="${escapeHtml(game.title)} telemetry ${idx + 1}">
                        <div class="game-shot-overlay">
                            <span class="game-shot-zoom-pill">🔍 ENLARGE</span>
                        </div>
                    </div>
                    <div class="game-shot-caption">TELEMETRY_LOG_0${idx + 1}.RAW</div>
                </div>
            `).join('');

            gameDetailScreenshots.querySelectorAll('.game-shot-card').forEach(card => {
                card.addEventListener('click', () => {
                    const idx = parseInt(card.getAttribute('data-idx') || '0', 10);
                    if (gameDetailHeroImg) gameDetailHeroImg.src = screens[idx];
                    openLightbox(screens, idx, game.title);
                });
            });

            // Also make gameDetailHeroImg clickable to enlarge
            if (gameDetailHeroImg) {
                gameDetailHeroImg.style.cursor = 'zoom-in';
                gameDetailHeroImg.title = 'Click to enlarge full resolution';
                gameDetailHeroImg.onclick = () => {
                    openLightbox(screens, 0, game.title);
                };
            }
        }

        // Price, Download & Steam buttons
        const isFree = game.isFree !== false;
        if (gameDetailPriceBadge) {
            if (isFree) {
                gameDetailPriceBadge.className = 'badge-free';
                gameDetailPriceBadge.textContent = 'FREE DOWNLOAD';
            } else {
                gameDetailPriceBadge.className = 'badge-steam';
                gameDetailPriceBadge.textContent = `STEAM: ${game.price || '$6.99'}`;
            }
        }

        if (gameMetaStatus) {
            gameMetaStatus.textContent = isFree ? 'FREE DOWNLOAD' : `PAID RELEASE (${game.price || '$6.99'})`;
            gameMetaStatus.style.color = isFree ? '#2e7d32' : '#0284c7';
        }

        if (btnPageDownload) {
            btnPageDownload.style.display = isFree ? 'inline-flex' : 'none';
            btnPageDownload.onclick = () => {
                if (!currentUser) {
                    openAuthModal('An operator account is required to download archive files.', 'login');
                } else {
                    startDownloadProcess(game);
                }
            };
        }

        if (btnPageSteam) {
            if (!isFree) {
                btnPageSteam.style.display = 'inline-flex';
                btnPageSteam.href = game.steamUrl || (game.externalLinks && game.externalLinks.steam) || 'https://store.steampowered.com';
            } else {
                btnPageSteam.style.display = 'none';
            }
        }

        if (btnPagePlayBrowser) {
            if (game.playInBrowserUrl) {
                btnPagePlayBrowser.style.display = 'inline-flex';
                btnPagePlayBrowser.onclick = () => {
                    document.getElementById('playGameTitle').textContent = `RUNNING // ${game.title}`;
                    playIframe.src = game.playInBrowserUrl;
                    playModal.classList.add('open');
                };
            } else {
                btnPagePlayBrowser.style.display = 'none';
            }
        }

        // Update Reactions for this game
        updateReactionButtons();

        // Load community feedback for this game
        if (feedbackGameTargetTitle) {
            feedbackGameTargetTitle.textContent = game.title;
        }
        loadGameFeedback(game.id, currentFeedbackType);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.soundEngine) window.soundEngine.playSelect();
    }

    if (btnBackToGamesGallery) {
        btnBackToGamesGallery.addEventListener('click', () => {
            location.hash = '#games';
        });
    }

    // Filter Buttons
    gameFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gameFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderGamesGallery();
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    });

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
                game.downloadsCount = (game.downloadsCount || 0) + 1;
                if (gameMetaDownloads) gameMetaDownloads.textContent = game.downloadsCount;
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

            document.querySelectorAll('.btn-delete-feedback').forEach(btn => {
                btn.addEventListener('click', async () => {
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

    // Full Resolution Image Lightbox Functions
    function openLightbox(screens, index = 0, title = 'ARCHIVE TELEMETRY') {
        if (!screens || screens.length === 0) return;
        currentLightboxScreens = screens;
        currentLightboxIndex = Math.max(0, Math.min(index, screens.length - 1));
        updateLightboxView();
        if (lightboxModalTitle) lightboxModalTitle.textContent = `${title} // FULL RESOLUTION`;
        if (imageLightboxModal) imageLightboxModal.classList.add('open');
        if (window.soundEngine) window.soundEngine.playSelect();
    }

    function updateLightboxView() {
        if (!currentLightboxScreens || currentLightboxScreens.length === 0) return;
        const currentSrc = currentLightboxScreens[currentLightboxIndex];
        if (lightboxImg) lightboxImg.src = currentSrc;
        if (lightboxCounter) {
            lightboxCounter.textContent = `TELEMETRY RECORD ${currentLightboxIndex + 1} OF ${currentLightboxScreens.length}`;
        }
    }

    function closeLightbox() {
        if (imageLightboxModal) imageLightboxModal.classList.remove('open');
    }

    if (lightboxModalClose) lightboxModalClose.addEventListener('click', closeLightbox);
    if (imageLightboxModal) {
        imageLightboxModal.addEventListener('click', (e) => {
            if (e.target === imageLightboxModal) closeLightbox();
        });
    }

    if (btnLightboxPrev) {
        btnLightboxPrev.addEventListener('click', () => {
            if (currentLightboxScreens.length <= 1) return;
            currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxScreens.length) % currentLightboxScreens.length;
            updateLightboxView();
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    }

    if (btnLightboxNext) {
        btnLightboxNext.addEventListener('click', () => {
            if (currentLightboxScreens.length <= 1) return;
            currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxScreens.length;
            updateLightboxView();
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!imageLightboxModal || !imageLightboxModal.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && btnLightboxPrev) btnLightboxPrev.click();
        if (e.key === 'ArrowRight' && btnLightboxNext) btnLightboxNext.click();
    });

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
    // 8. BUILT-IN MUSIC PLAYER & AUDIO LAB (PLAY, SCRUB, DOWNLOAD, COVERS)
    // ========================================================================

    async function loadMusic() {
        try {
            const res = await fetch('/api/music');
            allAlbums = await res.json();
            
            // Flatten tracks
            allTracks = [];
            allAlbums.forEach(album => {
                if (album.tracks && Array.isArray(album.tracks)) {
                    album.tracks.forEach(track => {
                        allTracks.push({
                            ...track,
                            albumTitle: album.title,
                            albumCover: album.coverImage || '/assets/images/cover_chamber.svg'
                        });
                    });
                }
            });

            renderTracksList();
            if (allTracks.length > 0) {
                loadTrackIntoPlayer(0, false);
            }
        } catch (e) {
            if (musicTracksList) musicTracksList.innerHTML = '<div style="color: red; padding: 10px;">Failed to load music tracks.</div>';
        }
    }

    function renderTracksList() {
        if (!musicTracksList) return;
        musicTracksList.innerHTML = '';

        allTracks.forEach((track, idx) => {
            const row = document.createElement('div');
            row.className = 'track-row';
            if (idx === currentTrackIndex) row.classList.add('active');

            const coverSquare = track.cover || track.albumCover || '/assets/images/cover_chamber.svg';

            row.innerHTML = `
                <!-- Square Cover next to track name -->
                <div class="track-cover-square">
                    <img src="${coverSquare}" class="track-cover-img" alt="Cover">
                </div>
                <div class="track-info-col">
                    <div class="track-name">${escapeHtml(track.title)}</div>
                    <div class="track-artist">${escapeHtml(track.artist || 'MOPTAM')} &bull; ${escapeHtml(track.albumTitle || 'Archive Release')}</div>
                </div>
                <div class="track-actions">
                    <span style="font-size: 11px; font-family: var(--font-mono); margin-right: 8px;">${track.duration || '03:30'}</span>
                    <button type="button" class="btn-pixel btn-track-play" style="font-size: 10px; padding: 3px 8px;">
                        ${(idx === currentTrackIndex && isPlaying) ? '❚❚ PAUSE' : '▶ PLAY'}
                    </button>
                    <a href="/api/music/track/${track.id}/download" download class="btn-pixel" style="font-size: 10px; padding: 3px 8px; text-decoration: none;">
                        💾 DL
                    </a>
                </div>
            `;

            row.querySelector('.btn-track-play').addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentTrackIndex === idx) {
                    togglePlayTrack();
                } else {
                    loadTrackIntoPlayer(idx, true);
                }
            });

            row.addEventListener('click', () => {
                loadTrackIntoPlayer(idx, true);
            });

            musicTracksList.appendChild(row);
        });
    }

    function loadTrackIntoPlayer(index, autoPlay = true) {
        if (index < 0 || index >= allTracks.length) return;
        currentTrackIndex = index;
        const track = allTracks[currentTrackIndex];

        if (playerCurrentTitle) playerCurrentTitle.textContent = track.title;
        if (playerCurrentArtist) playerCurrentArtist.textContent = `${track.artist || 'MOPTAM'} • ${track.albumTitle || 'Archive Release'}`;
        if (playerCurrentCover) playerCurrentCover.src = track.cover || track.albumCover || '/assets/images/cover_chamber.svg';
        if (playerTimeDuration) playerTimeDuration.textContent = track.duration || '03:30';

        currentTrackPlaybackSeconds = 0;
        updatePlayerTimeDisplay();

        if (btnPlayerDownloadTrack) {
            btnPlayerDownloadTrack.onclick = () => {
                window.location.href = `/api/music/track/${track.id}/download`;
            };
        }

        renderTracksList();

        if (autoPlay) {
            playTrack();
        } else {
            stopTrackTimer();
            isPlaying = false;
            updatePlayButtonUI();
        }
    }

    function togglePlayTrack() {
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    }

    function playTrack() {
        isPlaying = true;
        updatePlayButtonUI();
        if (playerStatusIndicator) playerStatusIndicator.textContent = '● PLAYING';
        
        // Start synthetic audio playback stream
        const track = allTracks[currentTrackIndex];
        if (track && window.soundEngine) {
            window.soundEngine.auditionSample(track.synth || 'ambient_drone');
        }

        startTrackTimer();
        renderTracksList();
    }

    function pauseTrack() {
        isPlaying = false;
        updatePlayButtonUI();
        if (playerStatusIndicator) playerStatusIndicator.textContent = '❚❚ PAUSED';
        stopTrackTimer();
        renderTracksList();
    }

    function updatePlayButtonUI() {
        if (playerPlayIcon) playerPlayIcon.textContent = isPlaying ? '❚❚' : '▶';
        if (playerPlayText) playerPlayText.textContent = isPlaying ? 'PAUSE' : 'PLAY';
    }

    function startTrackTimer() {
        stopTrackTimer();
        audioPlaybackTimer = setInterval(() => {
            currentTrackPlaybackSeconds += 1;
            updatePlayerTimeDisplay();

            // Loop or next track at 3.5 minutes (210s)
            if (currentTrackPlaybackSeconds >= 210) {
                currentTrackPlaybackSeconds = 0;
                loadTrackIntoPlayer((currentTrackIndex + 1) % allTracks.length, true);
            }
        }, 1000);
    }

    function stopTrackTimer() {
        if (audioPlaybackTimer) {
            clearInterval(audioPlaybackTimer);
            audioPlaybackTimer = null;
        }
    }

    function updatePlayerTimeDisplay() {
        const m = Math.floor(currentTrackPlaybackSeconds / 60);
        const s = currentTrackPlaybackSeconds % 60;
        const timeStr = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        if (playerTimeCurrent) playerTimeCurrent.textContent = timeStr;
        if (playerSeekSlider) {
            playerSeekSlider.value = Math.min(100, Math.floor((currentTrackPlaybackSeconds / 210) * 100));
        }
    }

    // Transport buttons
    if (btnPlayerPlay) btnPlayerPlay.addEventListener('click', togglePlayTrack);
    if (btnPlayerStop) {
        btnPlayerStop.addEventListener('click', () => {
            stopTrackTimer();
            isPlaying = false;
            currentTrackPlaybackSeconds = 0;
            updatePlayerTimeDisplay();
            updatePlayButtonUI();
            if (playerStatusIndicator) playerStatusIndicator.textContent = '■ STOPPED';
            renderTracksList();
        });
    }

    if (btnPlayerPrev) {
        btnPlayerPrev.addEventListener('click', () => {
            const nextIdx = (currentTrackIndex - 1 + allTracks.length) % allTracks.length;
            loadTrackIntoPlayer(nextIdx, isPlaying);
        });
    }

    if (btnPlayerNext) {
        btnPlayerNext.addEventListener('click', () => {
            const nextIdx = (currentTrackIndex + 1) % allTracks.length;
            loadTrackIntoPlayer(nextIdx, isPlaying);
        });
    }

    if (btnPlayerRewind) {
        btnPlayerRewind.addEventListener('click', () => {
            currentTrackPlaybackSeconds = Math.max(0, currentTrackPlaybackSeconds - 5);
            updatePlayerTimeDisplay();
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    }

    if (btnPlayerForward) {
        btnPlayerForward.addEventListener('click', () => {
            currentTrackPlaybackSeconds = Math.min(210, currentTrackPlaybackSeconds + 5);
            updatePlayerTimeDisplay();
            if (window.soundEngine) window.soundEngine.playSelect();
        });
    }

    if (playerSeekSlider) {
        playerSeekSlider.addEventListener('input', (e) => {
            const pct = parseInt(e.target.value);
            currentTrackPlaybackSeconds = Math.floor((pct / 100) * 210);
            updatePlayerTimeDisplay();
        });
    }

    // Load SFX library
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
    // 9. DEVLOGS, SPOTLIGHT RANDOM COMMENTS & REACTIONS (HOMEPAGE & DEVLOGS)
    // ========================================================================

    let devlogCommentsSummary = {};
    let cachedUpdates = [];

    async function loadDevlogCommentsSummary() {
        try {
            const res = await fetch('/api/devlogs/comments/summary');
            if (res.ok) {
                devlogCommentsSummary = await res.json();
            }
        } catch (e) {
            devlogCommentsSummary = {};
        }
    }

    function renderDevlogSpotlightHtml(devlogId) {
        const comments = devlogCommentsSummary[devlogId] || [];
        if (comments.length === 0) {
            return `
                <div class="spotlight-comment-inner">
                    <span class="spotlight-bubble-icon">💭</span>
                    <span class="spotlight-empty-label">No transmissions logged yet.</span>
                </div>
                <button type="button" class="spotlight-expand-pill" data-target="${devlogId}">+ Add Comment</button>
            `;
        }
        // Pick ONE random comment!
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        const cleanContent = randomComment.content.length > 70 
            ? randomComment.content.slice(0, 67) + '...' 
            : randomComment.content;

        return `
            <div class="spotlight-comment-inner" title="${escapeHtml(randomComment.content)}">
                <span class="spotlight-bubble-icon">💬</span>
                <span class="spotlight-comment-quote">"${escapeHtml(cleanContent)}"</span>
                <span class="spotlight-author-tag">— ${escapeHtml(randomComment.username)}</span>
            </div>
            <button type="button" class="spotlight-expand-pill" data-target="${devlogId}">View all (${comments.length}) ▾</button>
        `;
    }

    function renderDevlogReactionsBarHtml(devlogId) {
        const counts = gameReactions[devlogId] || {};
        const userHas = userReactionsMap[devlogId] || {};
        const comments = devlogCommentsSummary[devlogId] || [];

        return `
            <div class="devlog-rx-group" data-target-id="${devlogId}">
                <button type="button" class="btn-pixel devlog-rx-btn ${userHas.heart ? 'active' : ''}" data-target="${devlogId}" data-type="heart" title="Love / Respect">
                    ❤️ <span class="rx-num">${counts.heart || 0}</span>
                </button>
                <button type="button" class="btn-pixel devlog-rx-btn ${userHas.skull ? 'active' : ''}" data-target="${devlogId}" data-type="skull" title="Dread / Horror">
                    💀 <span class="rx-num">${counts.skull || 0}</span>
                </button>
                <button type="button" class="btn-pixel devlog-rx-btn ${userHas.fire ? 'active' : ''}" data-target="${devlogId}" data-type="fire" title="Fire / Hype">
                    🔥 <span class="rx-num">${counts.fire || 0}</span>
                </button>
                <button type="button" class="btn-pixel devlog-rx-btn ${userHas.tape ? 'active' : ''}" data-target="${devlogId}" data-type="tape" title="Energy / Analog">
                    ⚡ <span class="rx-num">${counts.tape || 0}</span>
                </button>
            </div>
            <button type="button" class="btn-pixel devlog-comments-toggle-btn" data-target="${devlogId}">
                💬 Comments (${comments.length}) ▾
            </button>
        `;
    }

    async function handleToggleReaction(targetId, reactionType) {
        if (!currentUser) {
            openAuthModal('Sign in to leave reactions on games and devlog dispatches.', 'login');
            return;
        }

        try {
            const res = await fetch('/api/reactions/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ targetId, reactionType })
            });
            const data = await res.json();
            if (data.success && data.reactions) {
                gameReactions = data.reactions.counts || {};
                userReactionsMap = data.reactions.userReactions || {};
                updateReactionButtons();
                updateAllDevlogReactionBars();
                if (window.soundEngine) window.soundEngine.playSelect();
            }
        } catch (e) {}
    }

    function updateAllDevlogReactionBars() {
        document.querySelectorAll('.devlog-rx-group').forEach(group => {
            const targetId = group.getAttribute('data-target-id');
            if (!targetId) return;
            const counts = gameReactions[targetId] || {};
            const userHas = userReactionsMap[targetId] || {};

            group.querySelectorAll('.devlog-rx-btn').forEach(btn => {
                const type = btn.getAttribute('data-type');
                const numSpan = btn.querySelector('.rx-num');
                if (numSpan) numSpan.textContent = counts[type] || 0;
                if (userHas[type]) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    }

    async function toggleDevlogCommentsDrawer(devlogId) {
        const drawer = document.getElementById(`commentsDrawer_${devlogId}`);
        if (!drawer) return;

        const isCurrentlyOpen = drawer.classList.contains('open');
        if (isCurrentlyOpen) {
            drawer.classList.remove('open');
        } else {
            drawer.classList.add('open');
            await refreshDevlogCommentsList(devlogId);
        }
        if (window.soundEngine) window.soundEngine.playSelect();
    }

    async function refreshDevlogCommentsList(devlogId) {
        const listEl = document.getElementById(`commentsList_${devlogId}`);
        const inputArea = document.getElementById(`commentInputArea_${devlogId}`);
        if (!listEl) return;

        listEl.innerHTML = '<div style="font-size: 11px; color: var(--text-dim); padding: 4px;">Accessing transmission stream...</div>';

        try {
            const res = await fetch(`/api/devlogs/${devlogId}/comments`);
            const comments = await res.json();

            devlogCommentsSummary[devlogId] = comments;

            // Refresh spotlight boxes and comment counts for this devlog
            refreshSpotlightDisplay(devlogId);

            if (comments.length === 0) {
                listEl.innerHTML = '<div style="font-size: 11px; color: var(--text-dim); padding: 6px 0;">No comments logged yet. Transmit your reaction below!</div>';
            } else {
                listEl.innerHTML = comments.map(c => {
                    const avatarSrc = c.user_avatar || getThemeDefaultAvatarInfo().url;
                    const rolePill = c.user_role === 'admin'
                        ? `<span style="background: var(--accent); color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 2px;">ADMIN</span>`
                        : `<span style="background: #0055ea; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 2px;">USER</span>`;
                    const deleteBtn = (currentUser && (currentUser.role === 'admin' || currentUser.username === c.username))
                        ? `<button type="button" class="btn-delete-comment" data-id="${c.id}" data-devlog="${devlogId}" style="background:none; border:none; color:red; cursor:pointer; font-size:10px;">[DELETE]</button>`
                        : '';

                    return `
                        <div class="devlog-comment-item">
                            <img class="devlog-comment-avatar" src="${avatarSrc}" alt="Avatar">
                            <div class="devlog-comment-content">
                                <div class="devlog-comment-meta">
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <span class="devlog-comment-author">${escapeHtml(c.username)}</span>
                                        ${rolePill}
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span class="devlog-comment-date">${c.created_at ? c.created_at.slice(0, 10) : ''}</span>
                                        ${deleteBtn}
                                    </div>
                                </div>
                                <div class="devlog-comment-text">${escapeHtml(c.content)}</div>
                            </div>
                        </div>
                    `;
                }).join('');

                listEl.querySelectorAll('.btn-delete-comment').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const commentId = btn.getAttribute('data-id');
                        if (confirm('Delete this comment transmission?')) {
                            await fetch(`/api/devlogs/comments/${commentId}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${authToken}` }
                            });
                            await refreshDevlogCommentsList(devlogId);
                        }
                    });
                });
            }

            // Render Input Area
            if (inputArea) {
                if (currentUser) {
                    inputArea.innerHTML = `
                        <div class="devlog-comment-form">
                            <textarea class="devlog-comment-textarea" id="textarea_${devlogId}" placeholder="Enter comment transmission as [${currentUser.username}]... (Max 1000 characters)"></textarea>
                            <div style="display: flex; justify-content: flex-end; gap: 8px;">
                                <button type="button" class="btn-pixel btn-pixel-accent btn-submit-comment" data-devlog="${devlogId}">
                                    TRANSMIT COMMENT ➔
                                </button>
                            </div>
                        </div>
                    `;
                    const submitBtn = inputArea.querySelector('.btn-submit-comment');
                    const textarea = inputArea.querySelector(`#textarea_${devlogId}`);
                    submitBtn.addEventListener('click', async () => {
                        const content = textarea.value.trim();
                        if (!content) return;
                        submitBtn.disabled = true;
                        try {
                            const postRes = await fetch(`/api/devlogs/${devlogId}/comments`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${authToken}`
                                },
                                body: JSON.stringify({ content })
                            });
                            if (postRes.ok) {
                                textarea.value = '';
                                await refreshDevlogCommentsList(devlogId);
                                if (window.soundEngine) window.soundEngine.playSelect();
                            }
                        } catch(e) {} finally {
                            submitBtn.disabled = false;
                        }
                    });
                } else {
                    inputArea.innerHTML = `
                        <div style="background: rgba(0,0,0,0.03); border: 1px dashed var(--border-color); padding: 8px 12px; margin-top: 8px; font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
                            <span>Sign in to post comments under this devlog.</span>
                            <button type="button" class="btn-pixel btn-login-prompt" style="font-size: 10.5px;">SIGN IN</button>
                        </div>
                    `;
                    inputArea.querySelector('.btn-login-prompt').addEventListener('click', () => {
                        openAuthModal('Sign in to leave a comment on this devlog.', 'login');
                    });
                }
            }
        } catch (e) {
            listEl.innerHTML = '<div style="font-size: 11px; color: var(--accent);">Failed to load comments stream.</div>';
        }
    }

    function refreshSpotlightDisplay(devlogId) {
        document.querySelectorAll(`.devlog-spotlight-box[data-devlog-id="${devlogId}"], #homeLatestSpotlightBox`).forEach(box => {
            box.innerHTML = renderDevlogSpotlightHtml(devlogId);
            const pill = box.querySelector('.spotlight-expand-pill');
            if (pill) {
                pill.addEventListener('click', () => toggleDevlogCommentsDrawer(devlogId));
            }
        });

        document.querySelectorAll(`.devlog-comments-toggle-btn[data-target="${devlogId}"]`).forEach(btn => {
            const count = (devlogCommentsSummary[devlogId] || []).length;
            btn.innerHTML = `💬 Comments (${count}) ▾`;
        });
    }

    async function loadUpdates() {
        try {
            await loadDevlogCommentsSummary();
            const res = await fetch('/api/updates');
            const updates = await res.json();
            cachedUpdates = updates;

            // 1. Render Devlogs list in Devlogs View
            if (updatesListEl) {
                updatesListEl.innerHTML = '';
                if (updates.length === 0) {
                    updatesListEl.innerHTML = '<div style="font-size: 12px; color: var(--text-dim); padding: 12px;">No transmissions logged yet.</div>';
                } else {
                    updates.forEach(u => {
                        const box = document.createElement('div');
                        box.className = 'devlog-card';
                        box.style.background = 'var(--bg-card)';
                        box.style.border = '1px solid var(--border-color)';
                        box.style.padding = '14px 18px';
                        box.style.marginBottom = '18px';

                        box.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                                <h3 style="font-family: var(--font-title); font-size: 22px; color: var(--link-color); margin: 0;">${escapeHtml(u.title)}</h3>
                                <span style="font-size: 11px; color: var(--text-dim); font-weight: bold;">${u.date}</span>
                            </div>

                            <!-- Subtle Random Spotlight Comment -->
                            <div class="devlog-spotlight-box" data-devlog-id="${u.id}">
                                ${renderDevlogSpotlightHtml(u.id)}
                            </div>

                            <div style="font-size: 12.5px; line-height: 1.6; color: var(--text-primary); white-space: pre-wrap;">${escapeHtml(u.body)}</div>

                            <!-- Devlog Actions Bar (Reactions + Comments Toggle) -->
                            <div class="devlog-actions-bar">
                                ${renderDevlogReactionsBarHtml(u.id)}
                            </div>

                            <!-- Collapsible Comments Drawer -->
                            <div class="devlog-comments-drawer" id="commentsDrawer_${u.id}">
                                <div class="devlog-comments-list" id="commentsList_${u.id}"></div>
                                <div class="devlog-comment-input-area" id="commentInputArea_${u.id}"></div>
                            </div>
                        `;
                        updatesListEl.appendChild(box);
                    });
                }
            }

            // 2. Render Latest Update on Homepage
            if (updates.length > 0) {
                const latest = updates[0];
                if (homeLatestUpdateDate) homeLatestUpdateDate.textContent = latest.date;
                if (homeLatestUpdateTitle) homeLatestUpdateTitle.textContent = latest.title;
                if (homeLatestUpdateBody) homeLatestUpdateBody.textContent = latest.body;

                const homeSpotlight = document.getElementById('homeLatestSpotlightBox');
                if (homeSpotlight) {
                    homeSpotlight.setAttribute('data-devlog-id', latest.id);
                    homeSpotlight.innerHTML = renderDevlogSpotlightHtml(latest.id);
                }

                const homeActionBar = document.getElementById('homeLatestActionBar');
                if (homeActionBar) {
                    homeActionBar.innerHTML = renderDevlogReactionsBarHtml(latest.id);
                }

                const homeCommentsDrawer = document.getElementById('homeLatestCommentsDrawer');
                if (homeCommentsDrawer) {
                    homeCommentsDrawer.id = `commentsDrawer_${latest.id}`;
                    const listEl = homeCommentsDrawer.querySelector('#homeLatestCommentsList');
                    if (listEl) listEl.id = `commentsList_${latest.id}`;
                    const inputArea = homeCommentsDrawer.querySelector('#homeLatestCommentInputArea');
                    if (inputArea) inputArea.id = `commentInputArea_${latest.id}`;
                }
            }

            // 3. Attach Event Listeners for All Devlog Reactions & Comments Buttons
            document.querySelectorAll('.devlog-rx-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = btn.getAttribute('data-target');
                    const type = btn.getAttribute('data-type');
                    handleToggleReaction(target, type);
                });
            });

            document.querySelectorAll('.devlog-comments-toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = btn.getAttribute('data-target');
                    toggleDevlogCommentsDrawer(target);
                });
            });

            document.querySelectorAll('.spotlight-expand-pill').forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = btn.getAttribute('data-target');
                    toggleDevlogCommentsDrawer(target);
                });
            });

        } catch (e) {
            console.error('Error loading updates:', e);
        }
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
