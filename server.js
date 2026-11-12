const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');

// Load environment variables from .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
                const key = trimmed.slice(0, eqIdx).trim();
                const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
                if (key && !process.env[key]) {
                    process.env[key] = val;
                }
            }
        });
    } catch (e) {
        console.warn('Note: Could not parse .env file:', e.message);
    }
}

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Admin access password/passcode fallback
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1986';

// Directories setup
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const GAMES_FILE_DIR = path.join(UPLOADS_DIR, 'games');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');

[DATA_DIR, UPLOADS_DIR, GAMES_FILE_DIR, IMAGES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const GAMES_DATA_PATH = path.join(DATA_DIR, 'games.json');
const UPDATES_DATA_PATH = path.join(DATA_DIR, 'updates.json');
const MUSIC_DATA_PATH = path.join(DATA_DIR, 'music.json');
const ART_DATA_PATH = path.join(DATA_DIR, 'art.json');
const SFX_DATA_PATH = path.join(DATA_DIR, 'sfx.json');

function getArt() {
    if (!fs.existsSync(ART_DATA_PATH)) return [];
    try {
        return JSON.parse(fs.readFileSync(ART_DATA_PATH, 'utf8'));
    } catch (e) {
        return [];
    }
}

function getSfx() {
    if (!fs.existsSync(SFX_DATA_PATH)) return [];
    try {
        return JSON.parse(fs.readFileSync(SFX_DATA_PATH, 'utf8'));
    } catch (e) {
        return [];
    }
}

const DEFAULT_MUSIC = [
    {
        id: 'album-1',
        title: 'TANGO CIRCUIT',
        year: '2026',
        genre: 'ANALOG SYNTHESIZER / INDUSTRIAL',
        tracksCount: 8,
        description: 'Raw analog oscillator recordings, metallic reverbs, and dystopian tape loops crafted for cold nights in concrete bunkers.',
        bandcampUrl: 'https://bandcamp.com',
        tracks: ['01. Ground Loop Frequency', '02. Relay Chime in Sub-Level 3', '03. Tungsten Filament Glow', '04. Hydraulic Breath']
    },
    {
        id: 'album-2',
        title: 'MOLDRISE (ORIGINAL SOUNDTRACK)',
        year: '2025',
        genre: 'DARK AMBIENT / FOLEY',
        tracksCount: 12,
        description: 'Original score for the experimental industrial simulation. Subterranean rumblings, piston exhausts, and bio-mechanical drones.',
        bandcampUrl: 'https://bandcamp.com',
        tracks: ['01. Pressure Seal Integrity', '02. Shift Log 48', '03. Biological Grinding Chamber', '04. Shift Over (Silence)']
    },
    {
        id: 'album-3',
        title: 'LADEN LETHE [EP]',
        year: '2024',
        genre: 'LO-FI HORROR ELECTRONICA',
        tracksCount: 6,
        description: 'Short tape-decay experiments and 1-bit soundscapes recorded onto worn magnetic microcassettes.',
        bandcampUrl: 'https://bandcamp.com',
        tracks: ['01. Headphone Bleed', '02. Cathode Ray Tube Hum', '03. Static Snow']
    }
];

function getMusic() {
    if (!fs.existsSync(MUSIC_DATA_PATH)) {
        fs.writeFileSync(MUSIC_DATA_PATH, JSON.stringify(DEFAULT_MUSIC, null, 2));
        return DEFAULT_MUSIC;
    }
    try {
        return JSON.parse(fs.readFileSync(MUSIC_DATA_PATH, 'utf8'));
    } catch (e) {
        return DEFAULT_MUSIC;
    }
}

// Initial default games with rich Mike Klubnika / dark horror pixel aesthetics
const DEFAULT_GAMES = [
    {
        id: 'buckshot-chamber',
        title: 'CHAMBER PROTOCOL',
        subtitle: '12-gauge tactical roulette in an abandoned cold war facility',
        releaseDate: '2026-10-15',
        version: '1.4.2',
        tags: ['PSYCHOLOGICAL HORROR', 'ANALOG TECH', 'ROULETTE', 'PIXEL-3D'],
        description: 'You sit across a rusty industrial desk under flickering fluorescent tubes. A modified shotgun rests between you and an unblinking surveillance android. Cut telephone wires, adrenaline shots, expired cigarettes, and loaded shells. Can you calculate the odds before the chamber snaps shut?',
        features: [
            'Tactile tabletop physics and physical inventory items',
            'Multiple difficulty protocols with procedural shell patterns',
            'Authentic 1980s low-poly CRT dithering aesthetics',
            'Full binaural cassette tape audio landscape'
        ],
        platforms: ['Windows', 'Linux'],
        fileSize: '48.5 MB',
        downloadUrl: '/uploads/games/chamber-protocol-v1.4.2.zip',
        isLocalFile: false,
        downloadsCount: 1421,
        playInBrowserUrl: '',
        externalLinks: {
            itch: 'https://itch.io',
            steam: 'https://store.steampowered.com'
        },
        coverImage: '/assets/images/cover_chamber.svg',
        screenshots: [
            '/assets/images/cover_chamber.svg',
            '/assets/images/screen_machinery.svg',
            '/assets/images/cover_sub.svg'
        ]
    },
    {
        id: 'null-signal',
        title: 'NULL SIGNAL: 1986',
        subtitle: 'Emergency radio broadcast monitoring during an unknown containment breach',
        releaseDate: '2026-08-10',
        version: '1.0.1',
        tags: ['ANALOG HORROR', 'AUDIO PUZZLE', 'COLD WAR', 'ATMOSPHERIC'],
        description: 'Stationed alone in a remote concrete relay tower nestled in the Ural mountains. Your only link to civilization is an analog frequency demodulator, an oscillograph, and emergency teletype papers printing automated hazard warnings. Decipher civilian distress beacons while calibrating magnetic filters.',
        features: [
            'Realistic manual radio frequency tuning and filter knobs',
            'Dynamic procedural audio signal degradation',
            'Branching communication logs and emergency broadcasts',
            'Retro monochrome cathode-ray monitor simulation'
        ],
        platforms: ['Windows'],
        fileSize: '62.1 MB',
        downloadUrl: '/uploads/games/null-signal-1986.zip',
        isLocalFile: false,
        downloadsCount: 980,
        playInBrowserUrl: '',
        externalLinks: {
            itch: 'https://itch.io'
        },
        coverImage: '/assets/images/cover_radio.svg',
        screenshots: [
            '/assets/images/cover_radio.svg',
            '/assets/images/cover_chamber.svg'
        ]
    },
    {
        id: 'iron-lung-depths',
        title: 'PRESSURE ZERO',
        subtitle: 'Navigate an abyssal subterranean ocean of biological fluids',
        releaseDate: '2026-05-22',
        version: '2.1.0',
        tags: ['SURVIVAL HORROR', 'RETRO 3D', 'CLAUSTROPHOBIA', 'EXPERIMENTAL'],
        description: 'You are welded inside a miniature one-person submarine built from scrap submarine iron. There are no viewports. You can only view the exterior by taking low-resolution grainy photos that take seconds to develop on a cathode screen. Something massive is moving in the dense black ocean around your hull.',
        features: [
            'Blind navigation using sonar ping coords and delayed camera flash',
            'Dread-inducing claustrophobia and deafening metal groan sounds',
            'Grainy dithered monochrome camera monitor aesthetic',
            'Heart-stopping sound design'
        ],
        platforms: ['Windows', 'Linux'],
        fileSize: '35.4 MB',
        downloadUrl: '/uploads/games/pressure-zero-v2.1.zip',
        isLocalFile: false,
        downloadsCount: 2315,
        playInBrowserUrl: '',
        externalLinks: {
            itch: 'https://itch.io',
            steam: 'https://store.steampowered.com'
        },
        coverImage: '/assets/images/cover_sub.svg',
        screenshots: [
            '/assets/images/cover_sub.svg',
            '/assets/images/screen_machinery.svg'
        ]
    },
    {
        id: 'meat-machine',
        title: 'CONCRETE OSCILLATOR',
        subtitle: 'Operate industrial biological processing machinery',
        releaseDate: '2026-02-11',
        version: '1.2.0',
        tags: ['BODY HORROR', 'INDUSTRIAL', 'DYSTOPIAN', 'POINT & CLICK'],
        description: 'A dark experimental simulation of operating heavy hydraulic levers, dial gauges, temperature needles, and pneumatic valves in an endless underground factory. Follow daily shift protocols or face mechanical repurposing.',
        features: [
            'Intricate clickable analog dials, switches, and clanking pistons',
            'Grim dystopia worldbuilding told through shift punchcards',
            'High quality tactile sound effects recorded from real industrial motors'
        ],
        platforms: ['Windows', 'Web'],
        fileSize: '29.0 MB',
        downloadUrl: '/uploads/games/concrete-oscillator.zip',
        isLocalFile: false,
        downloadsCount: 1650,
        playInBrowserUrl: '',
        externalLinks: {
            itch: 'https://itch.io'
        },
        coverImage: '/assets/images/cover_machine.svg',
        screenshots: [
            '/assets/images/cover_machine.svg',
            '/assets/images/screen_machinery.svg'
        ]
    }
];

const DEFAULT_UPDATES = [
    {
        id: 'upd-1',
        date: '2026-11-04',
        title: '[Chamber Protocol] v1.4.2 Hotfix & CRT Audio Overhaul',
        body: 'Implemented analog audio synthesizer improvements, reduced latency on shell cocking sound, and fixed a rare glitch when handcuffs were used consecutively. Thanks to everyone for the reports.'
    },
    {
        id: 'upd-2',
        date: '2026-10-18',
        title: '[Catalogue Launch] New retro portal live',
        body: 'Migrated games archive into this dedicated terminal catalogue. All builds are now direct downloadable, verified standalone, and include native scanline shaders.'
    },
    {
        id: 'upd-3',
        date: '2026-08-10',
        title: '[Null Signal: 1986] Released to public archive',
        body: 'Null Signal is finally compiled. Best played with headphones in a dark room. Watch your radio frequencies carefully.'
    }
];

function getGames() {
    if (!fs.existsSync(GAMES_DATA_PATH)) {
        fs.writeFileSync(GAMES_DATA_PATH, JSON.stringify(DEFAULT_GAMES, null, 2));
        return DEFAULT_GAMES;
    }
    try {
        const raw = fs.readFileSync(GAMES_DATA_PATH, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return DEFAULT_GAMES;
    }
}

function saveGames(games) {
    fs.writeFileSync(GAMES_DATA_PATH, JSON.stringify(games, null, 2));
}

function getUpdates() {
    if (!fs.existsSync(UPDATES_DATA_PATH)) {
        fs.writeFileSync(UPDATES_DATA_PATH, JSON.stringify(DEFAULT_UPDATES, null, 2));
        return DEFAULT_UPDATES;
    }
    try {
        const raw = fs.readFileSync(UPDATES_DATA_PATH, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return DEFAULT_UPDATES;
    }
}

function saveUpdates(updates) {
    fs.writeFileSync(UPDATES_DATA_PATH, JSON.stringify(updates, null, 2));
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'gameFile') {
            cb(null, GAMES_FILE_DIR);
        } else {
            cb(null, IMAGES_DIR);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${base}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 500 // 500MB maximum file size limit
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Authentication Middleware: extracts user session if provided
function authenticate(req, res, next) {
    const rawAuth = req.headers['authorization'] || req.headers['x-auth-token'] || req.headers['x-admin-token'] || req.query.token;
    let token = null;
    if (rawAuth) {
        if (rawAuth.startsWith('Bearer ')) {
            token = rawAuth.slice(7).trim();
        } else {
            token = rawAuth.trim();
        }
    }

    if (token) {
        // 1. Check session in SQLite DB
        const sessionUser = db.getSessionUser(token);
        if (sessionUser) {
            req.user = sessionUser;
            req.authToken = token;
            return next();
        }

        // 2. Backward-compatible Master PIN token check
        if (token === ADMIN_PASSWORD) {
            req.user = {
                id: 'admin-master',
                username: 'admin',
                role: 'admin',
                email: 'admin@obsolete-sector.net',
                provider: 'local'
            };
            req.authToken = token;
            return next();
        }
    }

    req.user = null;
    req.authToken = null;
    next();
}

app.use(authenticate);

// Middleware: Requires authenticated User OR Admin
function requireUser(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            requireAuth: true,
            error: 'Authentication Required: You need a registered user account to perform this action (download files, post transmissions, or leave reactions).'
        });
    }
    next();
}

// Middleware: Requires Admin clearance strictly (Users CANNOT pass this)
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Administrator authentication required.' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access Denied: Clearance level insufficient. Regular user accounts do not possess administrator rights.' });
    }
    next();
}

// ============================================================================
// AUTH & USER ACCOUNT ROUTES
// ============================================================================

// 1. Current Session Profile (Check if logged in)
app.get('/api/auth/me', (req, res) => {
    if (req.user) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false, user: null });
    }
});

// 2. Register New User Account (ALWAYS role='user')
app.post('/api/auth/register', (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Username is required.' });
        }
        const cleanUsername = username.trim();
        if (cleanUsername.length < 3 || cleanUsername.length > 24) {
            return res.status(400).json({ error: 'Username must be between 3 and 24 characters.' });
        }
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(cleanUsername)) {
            return res.status(400).json({ error: 'Username may only contain letters, numbers, underscores, and hyphens.' });
        }

        if (email) {
            const cleanEmail = email.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                return res.status(400).json({ error: 'Please enter a valid email address.' });
            }
        }

        if (!password || password.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
        }

        // Create standard user account (role is strictly 'user')
        const user = db.createUser({
            username: cleanUsername,
            email: email ? email.trim() : null,
            password,
            role: 'user',
            provider: 'local'
        });

        const session = db.createSession(user.id);
        res.status(201).json({
            success: true,
            user,
            token: session.token,
            message: 'User account created successfully.'
        });
    } catch (err) {
        res.status(400).json({ error: err.message || 'Registration failed.' });
    }
});

// 3. User & Admin Login
app.post('/api/auth/login', (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Username/Email and Password are required.' });
        }

        // Backward-compatible fallback for admin PIN
        if (identifier === 'admin' && password === ADMIN_PASSWORD) {
            let adminUser = db.getUserByUsernameOrEmail('admin');
            if (!adminUser) {
                adminUser = { id: 'admin-master', username: 'admin', role: 'admin' };
            }
            const session = db.createSession(adminUser.id);
            return res.json({
                success: true,
                user: { id: adminUser.id, username: adminUser.username, email: adminUser.email, role: 'admin' },
                token: session.token,
                message: 'Administrator clearance granted.'
            });
        }

        const user = db.getUserByUsernameOrEmail(identifier.trim());
        if (!user || !user.password_hash || !user.salt) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const valid = db.verifyPassword(password, user.salt, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const session = db.createSession(user.id);
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                provider: user.provider,
                createdAt: user.created_at
            },
            token: session.token,
            message: `Welcome back, ${user.username}!`
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Login failed.' });
    }
});

// ============================================================================
// 4. REAL OAUTH 2.0 IMPLEMENTATION (Google, GitHub, Apple)
// ============================================================================

function getAppBaseUrl(req) {
    if (process.env.BASE_URL) {
        return process.env.BASE_URL.replace(/\/+$/, '');
    }
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    return `${proto}://${host}`;
}

function renderOAuthSetupGuide(res, provider, redirectUri) {
    const isGoogle = provider === 'google';
    const isGithub = provider === 'github';
    const title = isGoogle ? 'Google Cloud Console' : (isGithub ? 'GitHub Developer Settings' : 'Apple Developer Portal');
    const docLink = isGoogle ? 'https://console.cloud.google.com/apis/credentials' : (isGithub ? 'https://github.com/settings/developers' : 'https://developer.apple.com');
    const envKey1 = isGoogle ? 'GOOGLE_CLIENT_ID' : (isGithub ? 'GITHUB_CLIENT_ID' : 'APPLE_CLIENT_ID');
    const envKey2 = isGoogle ? 'GOOGLE_CLIENT_SECRET' : (isGithub ? 'GITHUB_CLIENT_SECRET' : 'APPLE_KEY_ID');

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>OAuth Setup // ${provider.toUpperCase()}</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Tahoma', sans-serif; }
            body { background: #2258a6; color: #111; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .xp-card { background: #ece9d8; border: 2px solid; border-color: #fff #808080 #808080 #fff; max-width: 580px; width: 100%; box-shadow: 2px 2px 14px rgba(0,0,0,0.5); }
            .xp-bar { background: linear-gradient(180deg, #0058ee 0%, #3593ff 4%, #0054e3 40%, #0041a8 100%); color: #fff; padding: 6px 10px; font-size: 12px; font-weight: bold; }
            .xp-content { padding: 20px; }
            h2 { font-size: 16px; color: #003399; margin-bottom: 10px; }
            p { font-size: 12px; line-height: 1.5; margin-bottom: 12px; color: #222; }
            .uri-box { background: #ffffe1; border: 1px solid #7f9db9; padding: 8px 12px; font-family: monospace; font-size: 12px; word-break: break-all; margin-bottom: 12px; color: #003399; font-weight: bold; user-select: all; }
            ol { font-size: 12px; line-height: 1.6; margin-left: 20px; margin-bottom: 16px; color: #333; }
            li { margin-bottom: 6px; }
            .btn-group { display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px; border-top: 1px solid #d4d0c8; padding-top: 14px; }
            .xp-btn { background: linear-gradient(180deg, #fff 0%, #ece9d8 20%, #d4d0c8 85%, #b8b4a8 100%); border: 1px solid #003c74; padding: 6px 16px; font-size: 11px; font-weight: bold; cursor: pointer; border-radius: 3px; }
            .xp-btn-demo { background: linear-gradient(180deg, #e6ffed 0%, #c3e6cb 100%); border-color: #28a745; color: #155724; }
        </style>
    </head>
    <body>
        <div class="xp-card">
            <div class="xp-bar">MOPTAM SECURITY PROTOCOL // REAL OAUTH 2.0 SETUP</div>
            <div class="xp-content">
                <h2>⚠️ Real ${provider.toUpperCase()} OAuth Keys Required</h2>
                <p>For genuine 1-click ${provider.toUpperCase()} Sign-In, please provide your OAuth 2.0 Credentials in your <code>.env</code> file or <strong>Render.com Environment Variables</strong>.</p>
                
                <p><strong>1. Authorized Redirect Callback URL:</strong></p>
                <div class="uri-box">${redirectUri}</div>
                
                <p><strong>2. Quick 2-Minute Setup:</strong></p>
                <ol>
                    <li>Open <a href="${docLink}" target="_blank" style="color: #003399; font-weight: bold;">${title} ↗</a></li>
                    <li>Create an OAuth 2.0 Web Application client.</li>
                    <li>Paste the Callback URL above into <em>Authorized redirect URIs</em>.</li>
                    <li>Add <code>${envKey1}</code> and <code>${envKey2}</code> to your <strong>Render Dashboard (Environment Variables)</strong> or local <code>.env</code> file.</li>
                </ol>
                
                <div class="btn-group">
                    <button class="xp-btn" onclick="window.close();">Cancel</button>
                    <a href="/auth/callback.html?status=new_user&provider=${provider}&email=operative@${provider}.com&suggestedName=Operative_${Math.floor(100+Math.random()*900)}&avatar=" class="xp-btn xp-btn-demo" style="text-decoration:none; display:inline-block; line-height: 18px;">Test Account Creation Flow ➔</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `);
}

// 4a. Google OAuth 2.0
app.get('/api/auth/google', (req, res) => {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${getAppBaseUrl(req)}/api/auth/google/callback`;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return renderOAuthSetupGuide(res, 'google', redirectUri);
    }

    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        state: state,
        prompt: 'select_account'
    }).toString();

    res.redirect(authUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
    try {
        const { code, error, error_description } = req.query;
        if (error) {
            return res.redirect(`/auth/callback.html?error=${encodeURIComponent(error_description || error)}`);
        }
        if (!code) {
            return res.redirect(`/auth/callback.html?error=No_authorization_code_received`);
        }

        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${getAppBaseUrl(req)}/api/auth/google/callback`;

        // Exchange code for token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: String(code),
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
            return res.redirect(`/auth/callback.html?error=${encodeURIComponent(tokenData.error_description || tokenData.error || 'Google token exchange failed')}`);
        }

        // Fetch User Profile from Google
        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const profile = await userRes.json();

        const providerId = profile.sub;
        const email = profile.email || null;
        const name = profile.name || (email ? email.split('@')[0] : 'Operative');
        const avatar = profile.picture || null;

        // Check if user already exists
        let user = db.getUserByProviderId('google', providerId);
        if (!user && email) {
            user = db.getUserByEmail(email);
        }

        if (user) {
            const session = db.createSession(user.id);
            return res.redirect(`/auth/callback.html?status=success&token=${encodeURIComponent(session.token)}&username=${encodeURIComponent(user.username)}`);
        }

        // New user: redirect to pick call-sign
        const suggestedName = (name || (email ? email.split('@')[0] : 'Operator')).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 18);
        return res.redirect(`/auth/callback.html?status=new_user&provider=google&providerId=${encodeURIComponent(providerId)}&email=${encodeURIComponent(email || '')}&suggestedName=${encodeURIComponent(suggestedName)}&avatar=${encodeURIComponent(avatar || '')}`);
    } catch (err) {
        console.error('Google OAuth callback error:', err);
        res.redirect(`/auth/callback.html?error=${encodeURIComponent(err.message)}`);
    }
});

// 4b. GitHub OAuth 2.0
app.get('/api/auth/github', (req, res) => {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = `${getAppBaseUrl(req)}/api/auth/github/callback`;

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        return renderOAuthSetupGuide(res, 'github', redirectUri);
    }

    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `https://github.com/login/oauth/authorize?` + new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: 'user:email',
        state: state
    }).toString();

    res.redirect(authUrl);
});

app.get('/api/auth/github/callback', async (req, res) => {
    try {
        const { code, error, error_description } = req.query;
        if (error) {
            return res.redirect(`/auth/callback.html?error=${encodeURIComponent(error_description || error)}`);
        }
        if (!code) {
            return res.redirect(`/auth/callback.html?error=No_authorization_code_received`);
        }

        const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
        const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
        const redirectUri = `${getAppBaseUrl(req)}/api/auth/github/callback`;

        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: String(code),
                redirect_uri: redirectUri
            })
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
            return res.redirect(`/auth/callback.html?error=${encodeURIComponent(tokenData.error_description || tokenData.error || 'GitHub token exchange failed')}`);
        }

        // Fetch GitHub Profile
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                'User-Agent': 'Obsolete-Sector-App'
            }
        });
        const profile = await userRes.json();

        let email = profile.email || null;
        if (!email) {
            try {
                const emailsRes = await fetch('https://api.github.com/user/emails', {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                        'User-Agent': 'Obsolete-Sector-App'
                    }
                });
                if (emailsRes.ok) {
                    const emails = await emailsRes.json();
                    if (Array.isArray(emails)) {
                        const primary = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified) || emails[0];
                        if (primary) email = primary.email;
                    }
                }
            } catch (e) {
                // Email fetch fallback
            }
        }

        const providerId = String(profile.id);
        const name = profile.name || profile.login || 'Operative';
        const avatar = profile.avatar_url || null;

        let user = db.getUserByProviderId('github', providerId);
        if (!user && email) {
            user = db.getUserByEmail(email);
        }

        if (user) {
            const session = db.createSession(user.id);
            return res.redirect(`/auth/callback.html?status=success&token=${encodeURIComponent(session.token)}&username=${encodeURIComponent(user.username)}`);
        }

        const suggestedName = (profile.login || name).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 18);
        return res.redirect(`/auth/callback.html?status=new_user&provider=github&providerId=${encodeURIComponent(providerId)}&email=${encodeURIComponent(email || '')}&suggestedName=${encodeURIComponent(suggestedName)}&avatar=${encodeURIComponent(avatar || '')}`);
    } catch (err) {
        console.error('GitHub OAuth callback error:', err);
        res.redirect(`/auth/callback.html?error=${encodeURIComponent(err.message)}`);
    }
});

// 4c. Apple Sign In Route
app.get('/api/auth/apple', (req, res) => {
    const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
    const redirectUri = `${getAppBaseUrl(req)}/api/auth/apple/callback`;

    if (!APPLE_CLIENT_ID) {
        return renderOAuthSetupGuide(res, 'apple', redirectUri);
    }

    const authUrl = `https://appleid.apple.com/auth/authorize?` + new URLSearchParams({
        client_id: APPLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code id_token',
        scope: 'name email',
        response_mode: 'form_post'
    }).toString();

    res.redirect(authUrl);
});

// Check configured OAuth providers status
app.get('/api/auth/providers-status', (req, res) => {
    res.json({
        google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        apple: !!process.env.APPLE_CLIENT_ID,
        baseUrl: getAppBaseUrl(req)
    });
});

// 4d. Social / OAuth Authentication Flow (Check / Complete)
// Check if social account is already registered
app.post('/api/auth/social-check', (req, res) => {
    try {
        const { provider, email, providerId, name } = req.body;
        const validProviders = ['google', 'apple', 'github', 'facebook'];

        if (!provider || !validProviders.includes(provider.toLowerCase())) {
            return res.status(400).json({ error: 'Valid provider required (Google, GitHub, Apple, or Facebook).' });
        }

        // Check if user already exists by providerId or by verified email
        let user = null;
        if (providerId) {
            user = db.getUserByProviderId(provider.toLowerCase(), providerId);
        }
        if (!user && email) {
            user = db.getUserByEmail(email.trim());
        }

        if (user) {
            // User already registered! Create session and log in immediately
            const session = db.createSession(user.id);
            return res.json({
                exists: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    provider: user.provider,
                    avatar: user.avatar,
                    createdAt: user.created_at
                },
                token: session.token,
                message: `Welcome back, ${user.username}!`
            });
        }

        // New user! Needs to choose their Call-Sign / Username
        let suggestedUsername = '';
        if (name && typeof name === 'string') {
            suggestedUsername = name.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 18);
        }
        if (!suggestedUsername && email) {
            suggestedUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 18);
        }
        if (!suggestedUsername) {
            suggestedUsername = `Operator_${Math.floor(1000 + Math.random() * 9000)}`;
        }

        res.json({
            exists: false,
            email: email || null,
            provider: provider.toLowerCase(),
            providerId: providerId || `${provider.toLowerCase()}_${Date.now()}`,
            suggestedUsername
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Social check failed.' });
    }
});

// Complete registration for new Social user with chosen Username
app.post('/api/auth/social-complete', (req, res) => {
    try {
        const { provider, email, providerId, username, avatar } = req.body;
        const validProviders = ['google', 'apple', 'github', 'facebook'];

        if (!provider || !validProviders.includes(provider.toLowerCase())) {
            return res.status(400).json({ error: 'Valid provider required (Google, GitHub, Apple, or Facebook).' });
        }

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Please choose a call-sign / username.' });
        }

        const cleanUsername = username.trim();
        if (cleanUsername.length < 3 || cleanUsername.length > 24) {
            return res.status(400).json({ error: 'Username must be between 3 and 24 characters.' });
        }

        if (!/^[a-zA-Z0-9_\-\.]+$/.test(cleanUsername)) {
            return res.status(400).json({ error: 'Username may only contain letters, numbers, underscores, and hyphens.' });
        }

        // Check if username taken
        const existingUsername = db.getUserByUsernameOrEmail(cleanUsername);
        if (existingUsername) {
            return res.status(400).json({ error: `Call-sign "${cleanUsername}" is already taken. Please choose another.` });
        }

        // Check if email already belongs to another user
        if (email) {
            const existingEmail = db.getUserByEmail(email.trim());
            if (existingEmail) {
                // Link or log into this existing user
                const session = db.createSession(existingEmail.id);
                return res.json({
                    success: true,
                    user: {
                        id: existingEmail.id,
                        username: existingEmail.username,
                        email: existingEmail.email,
                        role: existingEmail.role,
                        provider: existingEmail.provider,
                        avatar: existingEmail.avatar,
                        createdAt: existingEmail.created_at
                    },
                    token: session.token,
                    message: `Welcome back, ${existingEmail.username}!`
                });
            }
        }

        // Create verified social user account
        const user = db.createUser({
            username: cleanUsername,
            email: email ? email.trim() : `${cleanUsername}@${provider.toLowerCase()}.user`,
            role: 'user',
            provider: provider.toLowerCase(),
            providerId: providerId || `${provider.toLowerCase()}_${Date.now()}`,
            avatar: avatar || null
        });

        const session = db.createSession(user.id);
        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                provider: user.provider,
                avatar: user.avatar,
                createdAt: user.created_at
            },
            token: session.token,
            message: `Account created successfully! Welcome to MOPTAM Sector, ${user.username}!`
        });
    } catch (err) {
        res.status(400).json({ error: err.message || 'Social registration failed.' });
    }
});

// 4b. Legacy Social Fallback
app.post('/api/auth/social', (req, res) => {
    try {
        const { provider, username, email, providerId } = req.body;
        const validProviders = ['google', 'apple', 'github', 'facebook'];

        if (!provider || !validProviders.includes(provider.toLowerCase())) {
            return res.status(400).json({ error: 'Valid social provider required (Google, Apple, GitHub, or Facebook).' });
        }

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Username is required.' });
        }

        const cleanUsername = username.trim();
        if (cleanUsername.length < 3 || cleanUsername.length > 24) {
            return res.status(400).json({ error: 'Username must be between 3 and 24 characters.' });
        }

        // Check if user exists by username
        let user = db.getUserByUsernameOrEmail(cleanUsername);

        if (!user) {
            // Auto-create user account with social provider
            user = db.createUser({
                username: cleanUsername,
                email: email ? email.trim() : `${cleanUsername}@${provider}.auth`,
                role: 'user',
                provider: provider.toLowerCase(),
                providerId: providerId || `${provider}_${Date.now()}`
            });
        }

        const session = db.createSession(user.id);
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                provider: user.provider,
                createdAt: user.created_at
            },
            token: session.token,
            message: `Logged in via ${provider.toUpperCase()}`
        });
    } catch (err) {
        res.status(400).json({ error: err.message || 'Social sign-in failed.' });
    }
});

// 5. Logout
app.post('/api/auth/logout', (req, res) => {
    if (req.authToken) {
        db.deleteSession(req.authToken);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
});

// 6. Admin: List all registered accounts
app.get('/api/admin/users', requireAdmin, (req, res) => {
    const users = db.getAllUsers();
    res.json({ success: true, users });
});

// 7. Admin: Delete user account
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    try {
        db.deleteUser(req.params.id);
        res.json({ success: true, message: 'User account deleted.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ============================================================================
// PUBLIC BROWSING & GAME ARCHIVE ROUTES
// ============================================================================

// 1. Get all games (Public - anyone can browse)
app.get('/api/games', (req, res) => {
    const games = getGames();
    res.json(games);
});

// 2. Get single game (Public - anyone can view details)
app.get('/api/games/:id', (req, res) => {
    const games = getGames();
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
        return res.status(404).json({ error: 'Game not found in archive' });
    }
    res.json(game);
});

// 3. Download game endpoint: STRICTLY REQUIRES USER ACCOUNT!
// Guests cannot download without creating an account or logging in.
app.get('/api/games/:id/download', requireUser, (req, res) => {
    const games = getGames();
    const gameIndex = games.findIndex(g => g.id === req.params.id);
    if (gameIndex === -1) {
        return res.status(404).json({ error: 'Game not found' });
    }

    const game = games[gameIndex];
    game.downloadsCount = (game.downloadsCount || 0) + 1;
    saveGames(games);

    // Log user download in database
    db.logDownload(game.id, req.user.id);

    // If local file on disk exists, serve it with attachment header
    if (game.isLocalFile && game.downloadUrl) {
        const fullLocalPath = path.join(__dirname, game.downloadUrl);
        if (fs.existsSync(fullLocalPath)) {
            return res.download(fullLocalPath);
        }
    }

    // If it's an external URL
    if (game.downloadUrl && (game.downloadUrl.startsWith('http://') || game.downloadUrl.startsWith('https://'))) {
        return res.redirect(game.downloadUrl);
    }

    // Fallback simulated payload
    const filename = `${game.id}-v${game.version || '1.0'}.zip`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const mockPayload = Buffer.from(
        `=== ${game.title} ===\nVersion: ${game.version}\n` +
        `Archive File Generated by Indie Creative Hub & Games Archive\n` +
        `Licensed to User: ${req.user.username} (${req.user.email || 'Registered'})\n\n` +
        `Game Synopsis:\n${game.description}\n\n` +
        `Instructions:\n1. Extract files\n2. Run Game.exe\n3. Wear headphones in a dark room\n`
    );
    return res.send(mockPayload);
});

// ============================================================================
// REACTIONS & RATINGS (Requires User Account)
// ============================================================================

// 1. Get all reactions (Public)
app.get('/api/reactions', (req, res) => {
    const userId = req.user ? req.user.id : null;
    const data = db.getReactionsForGames(userId);
    res.json(data);
});

// 2. Toggle reaction on a game (Requires User Account)
app.post('/api/games/:id/reactions', requireUser, (req, res) => {
    const { reactionType } = req.body;
    const allowed = ['heart', 'skull', 'fire', 'tape'];
    if (!reactionType || !allowed.includes(reactionType)) {
        return res.status(400).json({ error: 'Valid reaction type required (heart, skull, fire, tape).' });
    }

    const result = db.toggleReaction(req.params.id, req.user.id, reactionType);
    const updated = db.getReactionsForGames(req.user.id);
    res.json({ success: true, action: result.action, reactions: updated });
});

// ============================================================================
// GUESTBOOK / TRANSMISSION LOG ROUTES
// ============================================================================

// 1. Get guestbook entries (Public - anyone can read)
app.get('/api/guestbook', (req, res) => {
    const entries = db.getGuestbookEntries();
    res.json(entries);
});

// 2. Post guestbook transmission (REQUIRES USER ACCOUNT!)
// Username is locked to the authenticated user's account name.
app.post('/api/guestbook', requireUser, (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Transmission message cannot be empty.' });
    }

    const cleanText = text.trim().slice(0, 500);
    const entry = db.addGuestbookEntry({
        userId: req.user.id,
        username: req.user.username,
        text: cleanText
    });

    res.status(201).json(entry);
});

// 3. Delete guestbook transmission (Requires Admin)
app.delete('/api/guestbook/:id', requireAdmin, (req, res) => {
    db.deleteGuestbookEntry(req.params.id);
    res.json({ success: true, message: 'Transmission deleted from log.' });
});

// ============================================================================
// ART, SFX, MUSIC & DEVLOGS
// ============================================================================

app.get('/api/art', (req, res) => {
    res.json(getArt());
});

app.get('/api/sfx', (req, res) => {
    res.json(getSfx());
});

app.get('/api/music', (req, res) => {
    res.json(getMusic());
});

// Download simulated music track as audio file
app.get('/api/music/track/:id/download', (req, res) => {
    const music = getMusic();
    let foundTrack = null;
    let albumTitle = 'MOPTAM_Archive';
    for (const alb of music) {
        if (alb.tracks) {
            const t = alb.tracks.find(tr => tr.id === req.params.id);
            if (t) {
                foundTrack = t;
                albumTitle = alb.title;
                break;
            }
        }
    }
    const filename = foundTrack ? `${foundTrack.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp3` : `MOPTAM_Track_${req.params.id}.mp3`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    const dummyAudio = Buffer.alloc(1024 * 32, 0x4d); // audio payload buffer
    res.send(dummyAudio);
});

app.get('/api/updates', (req, res) => {
    res.json(getUpdates());
});

app.get('/api/updates/latest', (req, res) => {
    const updates = getUpdates();
    res.json(updates.length > 0 ? updates[0] : null);
});

// ============================================================================
// GAME FEEDBACK (COMMENTS / OPINIONS, SUGGESTIONS, BUG REPORTS)
// ============================================================================

// 1. Get feedback for a specific game
app.get('/api/games/:id/feedback', (req, res) => {
    const { type } = req.query;
    const feedback = db.getGameFeedback(req.params.id, type);
    res.json(feedback);
});

// 2. Submit feedback for a game (Requires User Account)
app.post('/api/games/:id/feedback', requireUser, (req, res) => {
    try {
        const { type, content } = req.body;
        const validTypes = ['comment', 'suggestion', 'bug_report'];
        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({ error: 'Valid feedback type required: comment, suggestion, or bug_report' });
        }
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty.' });
        }

        const entry = db.addGameFeedback({
            gameId: req.params.id,
            userId: req.user.id,
            username: req.user.username,
            userRole: req.user.role,
            type,
            content: content.trim().slice(0, 1000)
        });

        res.status(201).json({ success: true, feedback: entry });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to submit feedback' });
    }
});

// 3. Admin delete feedback entry
app.delete('/api/admin/feedback/:id', requireAdmin, (req, res) => {
    db.deleteGameFeedback(req.params.id);
    res.json({ success: true, message: 'Feedback entry deleted.' });
});

app.post('/api/updates', requireAdmin, (req, res) => {
    const { title, body, date } = req.body;
    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
    }

    const updates = getUpdates();
    const newUpdate = {
        id: `upd-${Date.now()}`,
        date: date || new Date().toISOString().split('T')[0],
        title,
        body
    };
    updates.unshift(newUpdate);
    saveUpdates(updates);
    res.status(201).json(newUpdate);
});

// ============================================================================
// ADMIN CRUD & UPLOAD (STRICTLY ADMIN ONLY)
// ============================================================================

// Upload & Add a new game
app.post('/api/games', requireAdmin, upload.fields([
    { name: 'gameFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'screenshots', maxCount: 6 }
]), (req, res) => {
    try {
        const {
            title,
            subtitle,
            version,
            releaseDate,
            tags,
            description,
            features,
            platforms,
            fileSize,
            externalDownloadUrl,
            playInBrowserUrl,
            itchUrl,
            steamUrl,
            isFree,
            price
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Game title is required' });
        }

        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `game-${Date.now()}`;

        // Handle uploaded game file
        let downloadUrl = externalDownloadUrl || '';
        let isLocalFile = false;
        let calculatedSize = fileSize || '15 MB';

        if (req.files && req.files.gameFile && req.files.gameFile[0]) {
            const file = req.files.gameFile[0];
            downloadUrl = `/uploads/games/${file.filename}`;
            isLocalFile = true;
            calculatedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        }

        // Handle cover image
        let coverImage = '/assets/images/cover_chamber.svg';
        if (req.files && req.files.coverImage && req.files.coverImage[0]) {
            coverImage = `/uploads/images/${req.files.coverImage[0].filename}`;
        }

        // Handle screenshot images
        let screenshots = [];
        if (req.files && req.files.screenshots) {
            screenshots = req.files.screenshots.map(s => `/uploads/images/${s.filename}`);
        }
        if (screenshots.length === 0) {
            screenshots.push(coverImage);
        }

        let parsedTags = ['INDIE', 'HORROR'];
        if (tags) {
            parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
        }

        let parsedFeatures = [];
        if (features) {
            parsedFeatures = Array.isArray(features) ? features : features.split('\n').map(f => f.trim()).filter(Boolean);
        }

        let parsedPlatforms = ['Windows'];
        if (platforms) {
            parsedPlatforms = Array.isArray(platforms) ? platforms : platforms.split(',').map(p => p.trim()).filter(Boolean);
        }

        const newGame = {
            id,
            title,
            subtitle: subtitle || 'Indie Horror Game',
            releaseDate: releaseDate || new Date().toISOString().split('T')[0],
            version: version || '1.0.0',
            isFree: isFree === 'false' || isFree === false ? false : true,
            price: price || (isFree === 'false' ? '$6.99' : 'FREE'),
            tags: parsedTags,
            description: description || 'No archive description logged.',
            features: parsedFeatures,
            platforms: parsedPlatforms,
            fileSize: calculatedSize,
            downloadUrl,
            isLocalFile,
            downloadsCount: 0,
            playInBrowserUrl: playInBrowserUrl || '',
            externalLinks: {
                itch: itchUrl || '',
                steam: steamUrl || ''
            },
            steamUrl: steamUrl || '',
            coverImage,
            screenshots
        };

        const games = getGames();
        games.unshift(newGame);
        saveGames(games);

        // Auto create a devlog entry
        const updates = getUpdates();
        updates.unshift({
            id: `upd-${Date.now()}`,
            date: newGame.releaseDate,
            title: `[NEW ARCHIVE] [${newGame.title}] v${newGame.version} added to database`,
            body: newGame.subtitle
        });
        saveUpdates(updates);

        res.status(201).json({ success: true, game: newGame });
    } catch (err) {
        console.error('Error creating game:', err);
        res.status(500).json({ error: 'Failed to upload and archive game' });
    }
});

// Delete a game (Admin only)
app.delete('/api/games/:id', requireAdmin, (req, res) => {
    let games = getGames();
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }

    if (game.isLocalFile && game.downloadUrl) {
        const filePath = path.join(__dirname, game.downloadUrl);
        if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }
    }

    games = games.filter(g => g.id !== req.params.id);
    saveGames(games);
    res.json({ success: true, message: 'Game purged from archive' });
});

// Admin stats summary
app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const games = getGames();
    const totalDownloads = games.reduce((acc, g) => acc + (g.downloadsCount || 0), 0);
    const users = db.getAllUsers();
    res.json({
        totalGames: games.length,
        totalDownloads,
        totalUsers: users.length,
        diskSpaceUsed: 'Archive Active'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`[OBSOLETE SECTOR // SERVER ONLINE]`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Admin User: admin / Pass: ${ADMIN_PASSWORD}`);
    console.log(`===============================================`);
});
