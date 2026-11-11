const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const db = require('./db');

const app = express();
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

// 4. Social / OAuth Login (Google, Apple ID, GitHub)
// As requested: Only requires username from the user!
app.post('/api/auth/social', (req, res) => {
    try {
        const { provider, username, email, providerId } = req.body;
        const validProviders = ['google', 'apple', 'github'];

        if (!provider || !validProviders.includes(provider.toLowerCase())) {
            return res.status(400).json({ error: 'Valid social provider required (Google, Apple, or GitHub).' });
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
