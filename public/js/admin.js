// Admin & Upload Terminal Management Logic
document.addEventListener('DOMContentLoaded', () => {
    // Sync theme
    const savedTheme = localStorage.getItem('crt_theme') || 'default';
    if (savedTheme !== 'default') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    let adminToken = sessionStorage.getItem('admin_token') || localStorage.getItem('auth_token') || '';

    // DOM Elements
    const loginSection = document.getElementById('loginSection');
    const adminMainSection = document.getElementById('adminMainSection');
    const loginForm = document.getElementById('loginForm');
    const loginPassInput = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');

    const logoutBtn = document.getElementById('adminLogoutBtn');
    const uploadForm = document.getElementById('uploadGameForm');
    const devlogForm = document.getElementById('postDevlogForm');
    const adminGamesTableBody = document.getElementById('adminGamesTableBody');
    const adminUsersTableBody = document.getElementById('adminUsersTableBody');

    // Tabs
    const tabUpload = document.getElementById('tabUpload');
    const tabManage = document.getElementById('tabManage');
    const tabDevlog = document.getElementById('tabDevlog');
    const tabArt = document.getElementById('tabArt');
    const tabSocials = document.getElementById('tabSocials');
    const tabSettings = document.getElementById('tabSettings');
    const tabUsers = document.getElementById('tabUsers');
    const sectionUpload = document.getElementById('sectionUpload');
    const sectionManage = document.getElementById('sectionManage');
    const sectionDevlog = document.getElementById('sectionDevlog');
    const sectionArt = document.getElementById('sectionArt');
    const sectionSocials = document.getElementById('sectionSocials');
    const sectionSettings = document.getElementById('sectionSettings');
    const sectionUsers = document.getElementById('sectionUsers');

    // Upload components
    const gameFileInput = document.getElementById('gameFileInput');
    const gameDropzone = document.getElementById('gameDropzone');
    const gameFileInfo = document.getElementById('gameFileInfo');

    const coverInput = document.getElementById('coverInput');
    const coverDropzone = document.getElementById('coverDropzone');
    const coverInfo = document.getElementById('coverInfo');

    const screenshotsInput = document.getElementById('screenshotsInput');
    const screenshotsInfo = document.getElementById('screenshotsInfo');

    const uploadProgressBarContainer = document.getElementById('uploadProgressBarContainer');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadStatus = document.getElementById('uploadStatus');

    // Check if token exists, verify if it has admin role
    async function verifyAdminAuth() {
        if (!adminToken) {
            showLogin();
            return;
        }

        try {
            const res = await fetch('/api/admin/stats', {
                headers: {
                    'x-admin-token': adminToken,
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            if (res.ok) {
                showAdminDashboard();
            } else if (res.status === 403) {
                showLogin();
                loginError.textContent = 'ACCESS DENIED: You are currently signed in as a standard USER. Only the administrator account has access to this portal.';
                loginError.style.display = 'block';
            } else {
                showLogin();
            }
        } catch (e) {
            showLogin();
        }
    }

    verifyAdminAuth();

    // 1. Login Handling
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = loginPassInput.value.trim();
        loginError.style.display = 'none';

        try {
            // First try admin login endpoint
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: 'admin', password: pass })
            });

            const data = await res.json();
            if (res.ok && data.success && data.user.role === 'admin') {
                adminToken = data.token;
                sessionStorage.setItem('admin_token', adminToken);
                localStorage.setItem('auth_token', adminToken);
                showAdminDashboard();
            } else if (pass === '1986') {
                // Backward compatible passcode fallback
                adminToken = '1986';
                sessionStorage.setItem('admin_token', adminToken);
                showAdminDashboard();
            } else {
                loginError.textContent = data.error || 'Access Denied: Invalid administrator passcode';
                loginError.style.display = 'block';
            }
        } catch (err) {
            loginError.textContent = 'Server connection failed';
            loginError.style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', () => {
        adminToken = '';
        sessionStorage.removeItem('admin_token');
        showLogin();
    });

    function showLogin() {
        loginSection.style.display = 'block';
        adminMainSection.style.display = 'none';
        logoutBtn.style.display = 'none';
        loginPassInput.value = '';
    }

    function showAdminDashboard() {
        loginSection.style.display = 'none';
        adminMainSection.style.display = 'block';
        logoutBtn.style.display = 'inline-block';
        loadAdminStats();
        loadAdminGames();
        loadAdminUsers();
    }

    // 2. Tab Navigation
    tabUpload.addEventListener('click', () => switchTab('upload'));
    tabManage.addEventListener('click', () => switchTab('manage'));
    tabDevlog.addEventListener('click', () => switchTab('devlog'));
    if (tabArt) tabArt.addEventListener('click', () => switchTab('art'));
    if (tabSocials) tabSocials.addEventListener('click', () => switchTab('socials'));
    if (tabSettings) tabSettings.addEventListener('click', () => switchTab('settings'));
    if (tabUsers) tabUsers.addEventListener('click', () => switchTab('users'));

    function switchTab(tab) {
        [tabUpload, tabManage, tabDevlog, tabArt, tabSocials, tabSettings, tabUsers].forEach(t => { if (t) t.classList.remove('active'); });
        [sectionUpload, sectionManage, sectionDevlog, sectionArt, sectionSocials, sectionSettings, sectionUsers].forEach(s => { if (s) s.style.display = 'none'; });

        if (tab === 'upload') {
            tabUpload.classList.add('active');
            sectionUpload.style.display = 'block';
        } else if (tab === 'manage') {
            tabManage.classList.add('active');
            sectionManage.style.display = 'block';
            loadAdminGames();
        } else if (tab === 'devlog') {
            tabDevlog.classList.add('active');
            sectionDevlog.style.display = 'block';
            loadAdminDevlogs();
        } else if (tab === 'art') {
            tabArt.classList.add('active');
            sectionArt.style.display = 'block';
            loadAdminArt();
        } else if (tab === 'socials') {
            tabSocials.classList.add('active');
            sectionSocials.style.display = 'block';
            loadAdminSocials();
        } else if (tab === 'settings') {
            if (tabSettings) tabSettings.classList.add('active');
            if (sectionSettings) sectionSettings.style.display = 'block';
            loadAdminSettings();
        } else if (tab === 'users') {
            tabUsers.classList.add('active');
            sectionUsers.style.display = 'block';
            loadAdminUsers();
        }
    }

    // 3. File Input UI handling
    gameFileInput.addEventListener('change', () => {
        if (gameFileInput.files && gameFileInput.files[0]) {
            const f = gameFileInput.files[0];
            const sizeMb = (f.size / (1024 * 1024)).toFixed(2);
            gameFileInfo.textContent = `SELECTED: ${f.name} (${sizeMb} MB)`;
            gameFileInfo.style.display = 'block';
        }
    });

    coverInput.addEventListener('change', () => {
        if (coverInput.files && coverInput.files[0]) {
            coverInfo.textContent = `COVER: ${coverInput.files[0].name}`;
            coverInfo.style.display = 'block';
        }
    });

    screenshotsInput.addEventListener('change', () => {
        if (screenshotsInput.files && screenshotsInput.files.length > 0) {
            screenshotsInfo.textContent = `SCREENSHOTS: ${screenshotsInput.files.length} file(s) selected`;
            screenshotsInfo.style.display = 'block';
        }
    });

    // 4. Submit Game Upload
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(uploadForm);
        const xhr = new XMLHttpRequest();

        uploadProgressBarContainer.style.display = 'block';
        uploadProgressBar.style.width = '0%';
        uploadStatus.textContent = 'TRANSMITTING ARCHIVE FILE TO SERVER...';
        uploadStatus.style.color = '#ffaa33';

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                uploadProgressBar.style.width = percent + '%';
                uploadStatus.textContent = `TRANSMITTING: ${percent}% (${(e.loaded / 1048576).toFixed(1)}MB / ${(e.total / 1048576).toFixed(1)}MB)`;
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 201 || xhr.status === 200) {
                uploadProgressBar.style.width = '100%';
                uploadStatus.textContent = 'SUCCESS: GAME ARCHIVE CATALOGUED AND DEPLOYED!';
                uploadStatus.style.color = '#4ade80';
                uploadForm.reset();
                gameFileInfo.style.display = 'none';
                coverInfo.style.display = 'none';
                screenshotsInfo.style.display = 'none';
                loadAdminStats();
                setTimeout(() => {
                    uploadProgressBarContainer.style.display = 'none';
                }, 3500);
            } else {
                uploadStatus.textContent = `ERROR: ${xhr.responseText || 'Upload failed'}`;
                uploadStatus.style.color = '#ff4444';
            }
        });

        xhr.addEventListener('error', () => {
            uploadStatus.textContent = 'CRITICAL: NETWORK PROTOCOL FAILURE DURING TRANSFER';
            uploadStatus.style.color = '#ff4444';
        });

        xhr.open('POST', '/api/games');
        xhr.setRequestHeader('x-admin-token', adminToken);
        xhr.setRequestHeader('Authorization', `Bearer ${adminToken}`);
        xhr.send(formData);
    });

    // 5. Load & Manage Games
    async function loadAdminGames() {
        try {
            const res = await fetch('/api/games');
            const games = await res.json();
            renderAdminGames(games);
        } catch (e) {
            console.error(e);
        }
    }

    function renderAdminGames(games) {
        adminGamesTableBody.innerHTML = '';
        games.forEach(g => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(g.title)}</strong></td>
                <td><code>v${escapeHtml(g.version || '1.0')}</code></td>
                <td>${escapeHtml(g.fileSize || 'N/A')}</td>
                <td>${g.downloadsCount || 0}</td>
                <td>
                    <button class="win98-btn delete-btn" data-id="${g.id}" style="color: #ff5252; padding: 2px 8px;">
                        [PURGE]
                    </button>
                </td>
            `;

            tr.querySelector('.delete-btn').addEventListener('click', async () => {
                if (confirm(`Permanently purge "${g.title}" from server database and filesystem?`)) {
                    await deleteGame(g.id);
                }
            });

            adminGamesTableBody.appendChild(tr);
        });
    }

    async function deleteGame(id) {
        try {
            const res = await fetch(`/api/games/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-token': adminToken,
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            if (res.ok) {
                loadAdminGames();
                loadAdminStats();
            } else {
                alert('Failed to delete game.');
            }
        } catch (e) {
            alert('Communication error.');
        }
    }

    // 6. Manage User Accounts
    async function loadAdminUsers() {
        if (!adminUsersTableBody) return;
        try {
            const res = await fetch('/api/admin/users', {
                headers: {
                    'x-admin-token': adminToken,
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            const data = await res.json();
            if (data.success && data.users) {
                renderAdminUsers(data.users);
            }
        } catch (e) {
            console.error('Failed to load users:', e);
        }
    }

    function renderAdminUsers(users) {
        adminUsersTableBody.innerHTML = '';
        users.forEach(u => {
            const tr = document.createElement('tr');
            const isMasterAdmin = u.role === 'admin';
            const roleBadge = isMasterAdmin
                ? `<span style="background: #991b1b; color: #fff; padding: 2px 6px; font-weight: bold; font-size: 11px;">ADMIN</span>`
                : `<span style="background: #1e3a8a; color: #93c5fd; padding: 2px 6px; font-size: 11px;">USER</span>`;

            const deleteAction = isMasterAdmin
                ? `<span style="color: #64748b; font-size: 11px;">[PROTECTED]</span>`
                : `<button class="win98-btn delete-user-btn" data-id="${u.id}" style="color: #ff5252; padding: 2px 8px;">[DELETE]</button>`;

            tr.innerHTML = `
                <td><strong>${escapeHtml(u.username)}</strong></td>
                <td>${escapeHtml(u.email || 'N/A')}</td>
                <td>${roleBadge}</td>
                <td><code>${escapeHtml(u.provider || 'local')}</code></td>
                <td>${escapeHtml((u.created_at || '').slice(0, 10))}</td>
                <td>${deleteAction}</td>
            `;

            const delBtn = tr.querySelector('.delete-user-btn');
            if (delBtn) {
                delBtn.addEventListener('click', async () => {
                    if (confirm(`Delete user account "${u.username}"?`)) {
                        try {
                            const res = await fetch(`/api/admin/users/${u.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'x-admin-token': adminToken,
                                    'Authorization': `Bearer ${adminToken}`
                                }
                            });
                            if (res.ok) {
                                loadAdminUsers();
                                loadAdminStats();
                            } else {
                                const errData = await res.json();
                                alert(errData.error || 'Failed to delete user.');
                            }
                        } catch (e) {
                            alert('Network error.');
                        }
                    }
                });
            }

            adminUsersTableBody.appendChild(tr);
        });
    }

    // 7. Post Devlogs with Multimedia & Social Channels
    if (devlogForm) {
        devlogForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('devlogTitle').value.trim();
            const body = document.getElementById('devlogBody').value.trim();
            const date = document.getElementById('devlogDate').value || new Date().toISOString().split('T')[0];
            const mediaFileInput = document.getElementById('devlogMediaFile');
            const mediaUrlInput = document.getElementById('devlogMediaUrl');
            const mediaTypeInput = document.getElementById('devlogMediaType');
            const youtubeUrlInput = document.getElementById('devlogYoutubeUrl');
            const discordUrlInput = document.getElementById('devlogDiscordUrl');
            const twitterUrlInput = document.getElementById('devlogTwitterUrl');
            const steamUrlInput = document.getElementById('devlogSteamUrl');
            const customUrlInput = document.getElementById('devlogCustomUrl');
            const customLabelInput = document.getElementById('devlogCustomLabel');
            const statusEl = document.getElementById('devlogStatus');
            const submitBtn = document.getElementById('btnSubmitDevlog');

            if (!title || !body) {
                if (statusEl) {
                    statusEl.textContent = 'TITLE AND BODY ARE REQUIRED';
                    statusEl.style.color = '#ff4444';
                }
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'TRANSMITTING DISPATCH...';
                }
                if (statusEl) {
                    statusEl.textContent = 'UPLOADING AND BROADCASTING...';
                    statusEl.style.color = '#60a5fa';
                }

                const formData = new FormData();
                formData.append('title', title);
                formData.append('body', body);
                formData.append('date', date);

                if (mediaFileInput && mediaFileInput.files && mediaFileInput.files[0]) {
                    formData.append('devlogMedia', mediaFileInput.files[0]);
                }
                if (mediaUrlInput && mediaUrlInput.value.trim()) {
                    formData.append('mediaUrl', mediaUrlInput.value.trim());
                }
                if (mediaTypeInput && mediaTypeInput.value) {
                    formData.append('mediaType', mediaTypeInput.value);
                }
                if (youtubeUrlInput && youtubeUrlInput.value.trim()) {
                    formData.append('youtubeUrl', youtubeUrlInput.value.trim());
                }
                if (discordUrlInput && discordUrlInput.value.trim()) {
                    formData.append('discordUrl', discordUrlInput.value.trim());
                }
                if (twitterUrlInput && twitterUrlInput.value.trim()) {
                    formData.append('twitterUrl', twitterUrlInput.value.trim());
                }
                if (steamUrlInput && steamUrlInput.value.trim()) {
                    formData.append('steamUrl', steamUrlInput.value.trim());
                }
                if (customUrlInput && customUrlInput.value.trim()) {
                    formData.append('customUrl', customUrlInput.value.trim());
                    formData.append('customLabel', customLabelInput ? (customLabelInput.value.trim() || 'LINK') : 'LINK');
                }

                const res = await fetch('/api/updates', {
                    method: 'POST',
                    headers: {
                        'x-admin-token': adminToken,
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: formData
                });

                const data = await res.json();
                if (res.ok) {
                    if (statusEl) {
                        statusEl.textContent = 'SUCCESS: DEVLOG DISPATCH LOGGED TO SYSTEM';
                        statusEl.style.color = '#4ade80';
                    }
                    devlogForm.reset();
                    loadAdminDevlogs();
                } else {
                    if (statusEl) {
                        statusEl.textContent = 'ERROR: ' + (data.error || 'FAILED TO POST DISPATCH');
                        statusEl.style.color = '#ff4444';
                    }
                }
            } catch (err) {
                if (statusEl) {
                    statusEl.textContent = 'COMMUNICATION ERROR: ' + err.message;
                    statusEl.style.color = '#ff4444';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '+ TRANSMIT DEVLOG DISPATCH';
                }
            }
        });
    }

    // 7.1 Load & Manage Admin Devlogs List
    async function loadAdminDevlogs() {
        const container = document.getElementById('adminDevlogsList');
        const countBadge = document.getElementById('adminDevlogCount');
        if (!container) return;

        try {
            const res = await fetch('/api/updates');
            const devlogs = await res.json();

            if (countBadge) countBadge.textContent = `${devlogs.length} DISPATCHES`;

            if (devlogs.length === 0) {
                container.innerHTML = '<div style="font-size: 12px; color: #94a3b8; padding: 12px;">No devlog dispatches recorded.</div>';
                return;
            }

            container.innerHTML = '';
            devlogs.forEach(u => {
                const item = document.createElement('div');
                item.style.background = 'rgba(255, 255, 255, 0.02)';
                item.style.border = '1px solid #334155';
                item.style.padding = '12px 16px';
                item.style.borderRadius = '4px';
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.alignItems = 'center';
                item.style.gap = '14px';

                // Media indicators
                const badges = [];
                if (u.youtubeUrl) badges.push('<span style="background: #991b1b; color: #fecaca; font-size: 10px; padding: 2px 6px; border-radius: 2px; font-weight: bold;">🔴 YOUTUBE</span>');
                if (u.mediaUrl) {
                    if (u.mediaType === 'video') {
                        badges.push('<span style="background: #1e3a8a; color: #bfdbfe; font-size: 10px; padding: 2px 6px; border-radius: 2px; font-weight: bold;">📼 VIDEO</span>');
                    } else {
                        badges.push('<span style="background: #065f46; color: #a7f3d0; font-size: 10px; padding: 2px 6px; border-radius: 2px; font-weight: bold;">📸 IMG/GIF</span>');
                    }
                }
                if (u.discordUrl || u.twitterUrl || u.steamUrl || u.customUrl) {
                    badges.push('<span style="background: #581c87; color: #e9d5ff; font-size: 10px; padding: 2px 6px; border-radius: 2px; font-weight: bold;">🌐 SOCIAL</span>');
                }

                item.innerHTML = `
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
                            <span style="font-size: 11px; color: #94a3b8; font-weight: bold;">${u.date}</span>
                            <span style="font-weight: bold; color: #e2e8f0; font-size: 13.5px;">${escapeHtml(u.title)}</span>
                            ${badges.join(' ')}
                        </div>
                        <div style="font-size: 11.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 600px;">
                            ${escapeHtml(u.body)}
                        </div>
                    </div>
                    <div>
                        <button type="button" class="btn-danger btn-delete-devlog" data-id="${u.id}" style="padding: 5px 12px; font-size: 11px;">
                            DELETE
                        </button>
                    </div>
                `;

                const delBtn = item.querySelector('.btn-delete-devlog');
                delBtn.addEventListener('click', () => deleteAdminDevlog(u.id, u.title));

                container.appendChild(item);
            });
        } catch (e) {
            container.innerHTML = '<div style="color: #ff4444; font-size: 12px;">Failed to load devlogs list.</div>';
        }
    }

    // 7.2 Delete Devlog Dispatch
    async function deleteAdminDevlog(id, title) {
        if (!confirm(`Confirm deletion of devlog dispatch:\n"${title}"?\nAll associated comments will also be permanently removed.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/updates/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-token': adminToken,
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                loadAdminDevlogs();
            } else {
                alert('Deletion failed: ' + (data.error || 'Server error'));
            }
        } catch (e) {
            alert('Communication failure: ' + e.message);
        }
    }

    // ========================================================================
    // 8. SOCIALS & EMBEDDED MEDIA ADMIN LOGIC
    // ========================================================================
    const socialProfilesForm = document.getElementById('socialProfilesForm');
    const addLongVideoForm = document.getElementById('addLongVideoForm');
    const addShortReelForm = document.getElementById('addShortReelForm');

    async function loadAdminSocials() {
        const profYoutube = document.getElementById('profYoutube');
        const profTiktok = document.getElementById('profTiktok');
        const profInstagram = document.getElementById('profInstagram');
        const profDiscord = document.getElementById('profDiscord');
        const profTwitter = document.getElementById('profTwitter');
        const profSteam = document.getElementById('profSteam');

        const longVideosList = document.getElementById('adminLongVideosList');
        const shortReelsList = document.getElementById('adminShortReelsList');

        try {
            const res = await fetch('/api/socials');
            if (!res.ok) return;
            const data = await res.json();

            // Populate profiles form
            if (data.profiles) {
                if (profYoutube) profYoutube.value = data.profiles.youtube || '';
                if (profTiktok) profTiktok.value = data.profiles.tiktok || '';
                if (profInstagram) profInstagram.value = data.profiles.instagram || '';
                if (profDiscord) profDiscord.value = data.profiles.discord || '';
                if (profTwitter) profTwitter.value = data.profiles.twitter || '';
                if (profSteam) profSteam.value = data.profiles.steam || '';
            }

            // Populate long videos
            if (longVideosList) {
                const longs = data.longVideos || [];
                if (longs.length === 0) {
                    longVideosList.innerHTML = '<div style="font-size: 12px; color: #94a3b8;">No long videos logged yet.</div>';
                } else {
                    longVideosList.innerHTML = '';
                    longs.forEach(v => {
                        const row = document.createElement('div');
                        row.style.background = 'rgba(255, 255, 255, 0.02)';
                        row.style.border = '1px solid #334155';
                        row.style.padding = '10px 14px';
                        row.style.borderRadius = '4px';
                        row.style.display = 'flex';
                        row.style.justifyContent = 'space-between';
                        row.style.alignItems = 'center';
                        row.style.gap = '12px';

                        row.innerHTML = `
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 11px; color: #94a3b8; font-weight: bold;">${v.date || ''}</span>
                                    <span style="font-weight: bold; color: #e2e8f0; font-size: 13px;">${escapeHtml(v.title)}</span>
                                    <span style="background: #991b1b; color: #fecaca; font-size: 10px; padding: 2px 6px; border-radius: 2px; font-weight: bold;">🔴 YOUTUBE</span>
                                </div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${escapeHtml(v.youtubeUrl)}
                                </div>
                            </div>
                            <button type="button" class="btn-danger btn-del-long" data-id="${v.id}" style="padding: 4px 10px; font-size: 11px;">
                                DELETE
                            </button>
                        `;

                        row.querySelector('.btn-del-long').addEventListener('click', async () => {
                            if (!confirm(`Delete long video "${v.title}"?`)) return;
                            const delRes = await fetch(`/api/socials/long-videos/${v.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'x-admin-token': adminToken,
                                    'Authorization': `Bearer ${adminToken}`
                                }
                            });
                            if (delRes.ok) loadAdminSocials();
                        });

                        longVideosList.appendChild(row);
                    });
                }
            }

            // Populate short reels
            if (shortReelsList) {
                const reels = data.shortReels || [];
                if (reels.length === 0) {
                    shortReelsList.innerHTML = '<div style="font-size: 12px; color: #94a3b8;">No short reels logged yet.</div>';
                } else {
                    shortReelsList.innerHTML = '';
                    reels.forEach(r => {
                        const row = document.createElement('div');
                        row.style.background = 'rgba(255, 255, 255, 0.02)';
                        row.style.border = '1px solid #334155';
                        row.style.padding = '10px 14px';
                        row.style.borderRadius = '4px';
                        row.style.display = 'flex';
                        row.style.justifyContent = 'space-between';
                        row.style.alignItems = 'center';
                        row.style.gap = '12px';

                        const pBadges = [];
                        if (r.links && r.links.youtube) pBadges.push('🔴 Shorts');
                        if (r.links && r.links.tiktok) pBadges.push('🎵 TikTok');
                        if (r.links && r.links.instagram) pBadges.push('📸 IG Reels');

                        row.innerHTML = `
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 11px; color: #94a3b8; font-weight: bold;">${r.date || ''}</span>
                                    <span style="font-weight: bold; color: #e2e8f0; font-size: 13px;">${escapeHtml(r.title)}</span>
                                    <span style="font-size: 10px; color: #38bdf8;">[${pBadges.join(' | ')}]</span>
                                </div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                                    ${escapeHtml(r.desc || 'No description')}
                                </div>
                            </div>
                            <button type="button" class="btn-danger btn-del-reel" data-id="${r.id}" style="padding: 4px 10px; font-size: 11px;">
                                DELETE
                            </button>
                        `;

                        row.querySelector('.btn-del-reel').addEventListener('click', async () => {
                            if (!confirm(`Delete short reel "${r.title}"?`)) return;
                            const delRes = await fetch(`/api/socials/shorts/${r.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'x-admin-token': adminToken,
                                    'Authorization': `Bearer ${adminToken}`
                                }
                            });
                            if (delRes.ok) loadAdminSocials();
                        });

                        shortReelsList.appendChild(row);
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load admin socials:', e);
        }
    }

    // Save Social Profiles
    if (socialProfilesForm) {
        socialProfilesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const profStatus = document.getElementById('profStatus');
            try {
                if (profStatus) {
                    profStatus.textContent = 'SAVING PROFILES...';
                    profStatus.style.color = '#60a5fa';
                }
                const res = await fetch('/api/socials/profiles', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-token': adminToken,
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({
                        youtube: document.getElementById('profYoutube').value,
                        tiktok: document.getElementById('profTiktok').value,
                        instagram: document.getElementById('profInstagram').value,
                        discord: document.getElementById('profDiscord').value,
                        twitter: document.getElementById('profTwitter').value,
                        steam: document.getElementById('profSteam').value
                    })
                });
                if (res.ok) {
                    if (profStatus) {
                        profStatus.textContent = 'PROFILES SAVED TO BROADCAST DATABASE';
                        profStatus.style.color = '#4ade80';
                    }
                } else {
                    if (profStatus) {
                        profStatus.textContent = 'ERROR SAVING PROFILES';
                        profStatus.style.color = '#ff4444';
                    }
                }
            } catch (err) {
                if (profStatus) {
                    profStatus.textContent = 'COMMUNICATION ERROR: ' + err.message;
                    profStatus.style.color = '#ff4444';
                }
            }
        });
    }

    // Add Long Video
    if (addLongVideoForm) {
        addLongVideoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('longVideoTitle').value.trim();
            const youtubeUrl = document.getElementById('longVideoYoutubeUrl').value.trim();
            const date = document.getElementById('longVideoDate').value || new Date().toISOString().split('T')[0];
            const desc = document.getElementById('longVideoDesc').value.trim();
            const statusEl = document.getElementById('longVideoStatus');

            try {
                if (statusEl) {
                    statusEl.textContent = 'SAVING LONG VIDEO...';
                    statusEl.style.color = '#60a5fa';
                }
                const res = await fetch('/api/socials/long-videos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-token': adminToken,
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({ title, youtubeUrl, date, desc })
                });
                if (res.ok) {
                    if (statusEl) {
                        statusEl.textContent = 'LONG VIDEO LOGGED SUCCESSFULLY';
                        statusEl.style.color = '#4ade80';
                    }
                    addLongVideoForm.reset();
                    loadAdminSocials();
                } else {
                    if (statusEl) {
                        statusEl.textContent = 'ERROR LOGGING VIDEO';
                        statusEl.style.color = '#ff4444';
                    }
                }
            } catch (err) {
                if (statusEl) {
                    statusEl.textContent = 'ERROR: ' + err.message;
                    statusEl.style.color = '#ff4444';
                }
            }
        });
    }

    // Add Short Reel
    if (addShortReelForm) {
        addShortReelForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('reelTitle').value.trim();
            const previewEmbedUrl = document.getElementById('reelPreviewEmbedUrl').value.trim();
            const date = document.getElementById('reelDate').value || new Date().toISOString().split('T')[0];
            const desc = document.getElementById('reelDesc').value.trim();
            const youtubeShortUrl = document.getElementById('reelYtShortUrl').value.trim();
            const tiktokUrl = document.getElementById('reelTiktokUrl').value.trim();
            const instagramReelUrl = document.getElementById('reelInstagramUrl').value.trim();
            const statusEl = document.getElementById('reelStatus');

            try {
                if (statusEl) {
                    statusEl.textContent = 'SAVING SHORT REEL...';
                    statusEl.style.color = '#60a5fa';
                }
                const res = await fetch('/api/socials/shorts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-token': adminToken,
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({
                        title,
                        previewEmbedUrl,
                        date,
                        desc,
                        youtubeShortUrl,
                        tiktokUrl,
                        instagramReelUrl
                    })
                });
                if (res.ok) {
                    if (statusEl) {
                        statusEl.textContent = 'SHORT REEL LOGGED SUCCESSFULLY';
                        statusEl.style.color = '#4ade80';
                    }
                    addShortReelForm.reset();
                    loadAdminSocials();
                } else {
                    const d = await res.json();
                    if (statusEl) {
                        statusEl.textContent = 'ERROR: ' + (d.error || 'Failed to save');
                        statusEl.style.color = '#ff4444';
                    }
                }
            } catch (err) {
                if (statusEl) {
                    statusEl.textContent = 'ERROR: ' + err.message;
                    statusEl.style.color = '#ff4444';
                }
            }
        });
    }

    // ========================================================================
    // 9. ARTWORK & ASSET SALES ADMIN LOGIC
    // ========================================================================
    const addArtForm = document.getElementById('addArtForm');

    async function loadAdminArt() {
        const artListContainer = document.getElementById('adminArtList');
        const artCountBadge = document.getElementById('adminArtCount');
        if (!artListContainer) return;

        try {
            const res = await fetch('/api/art');
            if (!res.ok) return;
            const artworks = await res.json();

            if (artCountBadge) artCountBadge.textContent = `${artworks.length} ARTWORKS`;

            if (artworks.length === 0) {
                artListContainer.innerHTML = '<div style="font-size: 12px; color: #94a3b8; padding: 12px;">No artworks registered yet.</div>';
                return;
            }

            artListContainer.innerHTML = '';
            artworks.forEach(art => {
                const item = document.createElement('div');
                item.style.background = 'rgba(255, 255, 255, 0.02)';
                item.style.border = '1px solid #334155';
                item.style.padding = '12px 16px';
                item.style.borderRadius = '4px';
                item.style.display = 'flex';
                item.style.flexDirection = 'column';
                item.style.gap = '10px';

                const asset = art.assetSale;
                const hasAsset = asset && asset.url;

                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${art.image}" style="width: 44px; height: 44px; object-fit: cover; border: 1px solid #475569; border-radius: 2px;" alt="thumb">
                            <div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: bold; color: #e2e8f0; font-size: 13.5px;">${escapeHtml(art.title)}</span>
                                    <span style="font-size: 10px; background: #1e293b; color: #94a3b8; padding: 2px 6px; border-radius: 2px;">${art.categoryLabel || art.category}</span>
                                    ${hasAsset ? `<span style="background: #065f46; color: #6ee7b7; font-size: 10px; padding: 2px 6px; border-radius: 2px; font-weight: bold;">🛒 ASSET LINKED (${escapeHtml(asset.price || 'FOR SALE')})</span>` : '<span style="background: #334155; color: #94a3b8; font-size: 10px; padding: 2px 6px; border-radius: 2px;">NO ASSET LINK</span>'}
                                </div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                                    ${escapeHtml(art.medium)} &bull; ${art.date}
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="btn-primary btn-edit-asset" style="padding: 4px 10px; font-size: 11px;">
                                ${hasAsset ? 'EDIT ASSET LINK' : '+ LINK ASSET PACK'}
                            </button>
                            <button type="button" class="btn-danger btn-del-art" style="padding: 4px 10px; font-size: 11px;">
                                DELETE
                            </button>
                        </div>
                    </div>

                    <!-- Inline Quick Asset Link Editor Form (Toggled) -->
                    <div class="asset-edit-box" style="display: none; background: #0b1120; border: 1px dashed #3b82f6; padding: 12px; border-radius: 3px; margin-top: 4px;">
                        <div style="font-size: 11.5px; font-weight: bold; color: #60a5fa; margin-bottom: 8px;">
                            COMMERCIAL STOREFRONT LINK FOR: "${escapeHtml(art.title)}"
                        </div>
                        <div class="form-row" style="margin-bottom: 8px;">
                            <div class="form-group form-col">
                                <label class="form-label">Asset Pack Title:</label>
                                <input type="text" class="form-input edit-asset-name" value="${escapeHtml(asset ? (asset.name || '') : art.title + ' Asset Pack')}">
                            </div>
                            <div class="form-group form-col">
                                <label class="form-label">Price Tag (e.g. $15.00):</label>
                                <input type="text" class="form-input edit-asset-price" value="${escapeHtml(asset ? (asset.price || '') : '')}">
                            </div>
                        </div>
                        <div class="form-row" style="margin-bottom: 8px;">
                            <div class="form-group form-col">
                                <label class="form-label">Store Platform:</label>
                                <select class="form-input edit-asset-platform">
                                    <option value="itch.io" ${asset && asset.platform === 'itch.io' ? 'selected' : ''}>itch.io</option>
                                    <option value="Gumroad" ${asset && asset.platform === 'Gumroad' ? 'selected' : ''}>Gumroad</option>
                                    <option value="Unity Asset Store" ${asset && asset.platform === 'Unity Asset Store' ? 'selected' : ''}>Unity Asset Store</option>
                                    <option value="Unreal Fab / Marketplace" ${asset && asset.platform === 'Unreal Fab / Marketplace' ? 'selected' : ''}>Unreal Fab / Marketplace</option>
                                    <option value="Ko-fi" ${asset && asset.platform === 'Ko-fi' ? 'selected' : ''}>Ko-fi</option>
                                    <option value="Direct Store" ${asset && asset.platform === 'Direct Store' ? 'selected' : ''}>Direct Store</option>
                                </select>
                            </div>
                            <div class="form-group form-col">
                                <label class="form-label">Storefront Page URL *:</label>
                                <input type="url" class="form-input edit-asset-url" value="${escapeHtml(asset ? (asset.url || '') : '')}" placeholder="https://itch.io/...">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 8px;">
                            <label class="form-label">Included Formats &amp; Specs:</label>
                            <input type="text" class="form-input edit-asset-formats" value="${escapeHtml(asset ? (asset.formats || '') : '')}" placeholder="FBX, OBJ, PSX Textures, Aseprite, etc.">
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 8px;">
                            <button type="button" class="btn-primary btn-save-asset-link" style="padding: 5px 14px; font-size: 11px;">
                                SAVE ASSET LINK
                            </button>
                            <button type="button" class="btn-cancel-asset-edit" style="background: none; border: 1px solid #475569; color: #94a3b8; padding: 5px 12px; font-size: 11px; cursor: pointer;">
                                CANCEL
                            </button>
                        </div>
                    </div>
                `;

                // Toggle quick editor
                const editBtn = item.querySelector('.btn-edit-asset');
                const editBox = item.querySelector('.asset-edit-box');
                const cancelBtn = item.querySelector('.btn-cancel-asset-edit');
                const saveBtn = item.querySelector('.btn-save-asset-link');

                editBtn.addEventListener('click', () => {
                    editBox.style.display = editBox.style.display === 'none' ? 'block' : 'none';
                });
                cancelBtn.addEventListener('click', () => {
                    editBox.style.display = 'none';
                });

                // Save updated asset link
                saveBtn.addEventListener('click', async () => {
                    const name = item.querySelector('.edit-asset-name').value;
                    const price = item.querySelector('.edit-asset-price').value;
                    const platform = item.querySelector('.edit-asset-platform').value;
                    const url = item.querySelector('.edit-asset-url').value;
                    const formats = item.querySelector('.edit-asset-formats').value;

                    try {
                        saveBtn.disabled = true;
                        saveBtn.textContent = 'SAVING...';
                        const updRes = await fetch(`/api/art/${art.id}/asset`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-admin-token': adminToken,
                                'Authorization': `Bearer ${adminToken}`
                            },
                            body: JSON.stringify({ name, price, platform, url, formats })
                        });
                        if (updRes.ok) {
                            loadAdminArt();
                        } else {
                            alert('Failed to update asset link');
                        }
                    } catch (e) {
                        alert('Error: ' + e.message);
                    } finally {
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'SAVE ASSET LINK';
                    }
                });

                // Delete artwork
                item.querySelector('.btn-del-art').addEventListener('click', async () => {
                    if (!confirm(`Are you sure you want to delete artwork "${art.title}"?`)) return;
                    try {
                        const delRes = await fetch(`/api/art/${art.id}`, {
                            method: 'DELETE',
                            headers: {
                                'x-admin-token': adminToken,
                                'Authorization': `Bearer ${adminToken}`
                            }
                        });
                        if (delRes.ok) loadAdminArt();
                    } catch (e) {
                        alert('Delete error: ' + e.message);
                    }
                });

                artListContainer.appendChild(item);
            });
        } catch (e) {
            console.error('Failed to load admin art list:', e);
        }
    }

    // Submit New Artwork Form
    if (addArtForm) {
        addArtForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('artTitle').value.trim();
            const category = document.getElementById('artCategory').value;
            const medium = document.getElementById('artMedium').value.trim();
            const date = document.getElementById('artDate').value || new Date().toISOString().split('T')[0];
            const fileInput = document.getElementById('artImageFile');
            const imageUrlInput = document.getElementById('artImageUrl');
            const desc = document.getElementById('artDescription').value.trim();

            const assetName = document.getElementById('artAssetName').value.trim();
            const assetPrice = document.getElementById('artAssetPrice').value.trim();
            const assetPlatform = document.getElementById('artAssetPlatform').value;
            const assetUrl = document.getElementById('artAssetUrl').value.trim();
            const assetFormats = document.getElementById('artAssetFormats').value.trim();

            const statusEl = document.getElementById('artStatus');
            const submitBtn = document.getElementById('btnSubmitArt');

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'REGISTERING ARTWORK...';
                }
                if (statusEl) {
                    statusEl.textContent = 'UPLOADING AND PUBLISHING...';
                    statusEl.style.color = '#60a5fa';
                }

                const formData = new FormData();
                formData.append('title', title);
                formData.append('category', category);
                formData.append('medium', medium);
                formData.append('date', date);
                formData.append('description', desc);

                if (fileInput && fileInput.files && fileInput.files[0]) {
                    formData.append('artImage', fileInput.files[0]);
                }
                if (imageUrlInput && imageUrlInput.value.trim()) {
                    formData.append('imageUrl', imageUrlInput.value.trim());
                }

                if (assetUrl) {
                    formData.append('assetUrl', assetUrl);
                    formData.append('assetName', assetName);
                    formData.append('assetPrice', assetPrice);
                    formData.append('assetPlatform', assetPlatform);
                    formData.append('assetFormats', assetFormats);
                }

                const res = await fetch('/api/art', {
                    method: 'POST',
                    headers: {
                        'x-admin-token': adminToken,
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: formData
                });

                if (res.ok) {
                    if (statusEl) {
                        statusEl.textContent = 'SUCCESS: ARTWORK & ASSET LINK PUBLISHED';
                        statusEl.style.color = '#4ade80';
                    }
                    addArtForm.reset();
                    loadAdminArt();
                } else {
                    const data = await res.json();
                    if (statusEl) {
                        statusEl.textContent = 'ERROR: ' + (data.error || 'Failed to publish');
                        statusEl.style.color = '#ff4444';
                    }
                }
            } catch (err) {
                if (statusEl) {
                    statusEl.textContent = 'COMMUNICATION ERROR: ' + err.message;
                    statusEl.style.color = '#ff4444';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '+ PUBLISH ARTWORK & LINK ASSET';
                }
            }
        });
    }

    // 9.5 Marquee & Site Settings Management
    const marqueeForm = document.getElementById('marqueeSettingsForm');
    const marqueeInput = document.getElementById('adminMarqueeInput');
    const marqueePreview = document.getElementById('marqueeLivePreview');
    const marqueeFeedback = document.getElementById('marqueeStatusFeedback');
    const btnResetMarquee = document.getElementById('btnResetMarquee');

    const DEFAULT_MARQUEE_TEMPLATE = '⚡ Hello, I am MOPTAM // PERSONAL CREATIVE HUB & GAMES ARCHIVE // ANOMALY DETECTED // VISITORS LOGGED: 004,924 // TRANSMISSIONS VERIFIED ⚡';

    if (marqueeInput && marqueePreview) {
        marqueeInput.addEventListener('input', () => {
            const val = marqueeInput.value.trim();
            marqueePreview.textContent = val || '⚡ (Marquee is empty...)';
        });
    }

    // Quick Templates
    const btnTplAnomaly = document.getElementById('btnTplAnomaly');
    const btnTplNewRelease = document.getElementById('btnTplNewRelease');
    const btnTplDevlog = document.getElementById('btnTplDevlog');
    const btnTplMaintenance = document.getElementById('btnTplMaintenance');

    if (btnTplAnomaly) {
        btnTplAnomaly.addEventListener('click', () => {
            if (marqueeInput) {
                marqueeInput.value = '🚨 CRITICAL ANOMALY DETECTED // SUBTERRANEAN SECTOR BREACHED // SYSTEM PURGE IMMINENT // STAY ALERT 🚨';
                marqueeInput.dispatchEvent(new Event('input'));
            }
        });
    }
    if (btnTplNewRelease) {
        btnTplNewRelease.addEventListener('click', () => {
            if (marqueeInput) {
                marqueeInput.value = '🎮 NEW RELEASE: [Chamber Protocol v1.4.2] IS NOW ARCHIVED // DOWNLOAD STANDALONE FREE BUILD IN GAMES ARCHIVE ➔';
                marqueeInput.dispatchEvent(new Event('input'));
            }
        });
    }
    if (btnTplDevlog) {
        btnTplDevlog.addEventListener('click', () => {
            if (marqueeInput) {
                marqueeInput.value = '📝 NEW DISPATCH: Tactile Foley & CRT Audio Engine Breakdown Published // Inspect Devlogs For Full Post-Mortem ⚡';
                marqueeInput.dispatchEvent(new Event('input'));
            }
        });
    }
    if (btnTplMaintenance) {
        btnTplMaintenance.addEventListener('click', () => {
            if (marqueeInput) {
                marqueeInput.value = '🔧 SCHEDULED TAPE ALIGNMENT // AUDIO LAB CALIBRATING 56K DIAL-UP PROTOCOLS // ARCHIVE REMAINS OPERATIONAL 🔧';
                marqueeInput.dispatchEvent(new Event('input'));
            }
        });
    }

    if (btnResetMarquee) {
        btnResetMarquee.addEventListener('click', () => {
            if (marqueeInput) {
                marqueeInput.value = DEFAULT_MARQUEE_TEMPLATE;
                marqueeInput.dispatchEvent(new Event('input'));
            }
        });
    }

    if (marqueeForm) {
        marqueeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = marqueeInput ? marqueeInput.value.trim() : '';
            if (!text) {
                if (marqueeFeedback) {
                    marqueeFeedback.textContent = 'ERROR: Marquee text cannot be empty.';
                    marqueeFeedback.style.color = '#ef4444';
                }
                return;
            }

            const saveBtn = document.getElementById('btnSaveMarquee');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.textContent = 'TRANSMITTING TO TERMINAL...';
            }

            try {
                const res = await fetch('/api/settings/marquee', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-token': adminToken,
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({ marqueeText: text })
                });

                const data = await res.json();
                if (res.ok) {
                    if (marqueeFeedback) {
                        marqueeFeedback.textContent = '✓ MARQUEE ANNOUNCEMENT BROADCASTED ACROSS ENTIRE SECTOR SUCCESSFULLY!';
                        marqueeFeedback.style.color = '#4ade80';
                    }
                } else {
                    if (marqueeFeedback) {
                        marqueeFeedback.textContent = 'UPDATE FAILED: ' + (data.error || 'Server error');
                        marqueeFeedback.style.color = '#ef4444';
                    }
                }
            } catch (err) {
                if (marqueeFeedback) {
                    marqueeFeedback.textContent = 'NETWORK FAULT: ' + err.message;
                    marqueeFeedback.style.color = '#ef4444';
                }
            } finally {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = '💾 SAVE MARQUEE ANNOUNCEMENT';
                }
            }
        });
    }

    async function loadAdminSettings() {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const settings = await res.json();
                if (marqueeInput && settings.marqueeText) {
                    marqueeInput.value = settings.marqueeText;
                    if (marqueePreview) marqueePreview.textContent = settings.marqueeText;
                }
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    // 10. Load Stats
    async function loadAdminStats() {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: {
                    'x-admin-token': adminToken,
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            if (res.ok) {
                const stats = await res.json();
                document.getElementById('statTotalGames').textContent = stats.totalGames;
                document.getElementById('statTotalDownloads').textContent = stats.totalDownloads;
                const statUsersEl = document.getElementById('statTotalUsers');
                if (statUsersEl) statUsersEl.textContent = stats.totalUsers || 0;
            }
        } catch (e) {}
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
});
