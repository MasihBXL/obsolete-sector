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
    const tabUsers = document.getElementById('tabUsers');
    const sectionUpload = document.getElementById('sectionUpload');
    const sectionManage = document.getElementById('sectionManage');
    const sectionDevlog = document.getElementById('sectionDevlog');
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
    if (tabUsers) tabUsers.addEventListener('click', () => switchTab('users'));

    function switchTab(tab) {
        [tabUpload, tabManage, tabDevlog, tabUsers].forEach(t => { if (t) t.classList.remove('active'); });
        [sectionUpload, sectionManage, sectionDevlog, sectionUsers].forEach(s => { if (s) s.style.display = 'none'; });

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

    // 8. Load Stats
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
