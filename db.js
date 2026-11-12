const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'obsolete_sector.db');
const db = new Database(DB_PATH);

// Enable WAL mode for high performance and concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL COLLATE NOCASE,
            email TEXT UNIQUE COLLATE NOCASE,
            password_hash TEXT,
            salt TEXT,
            role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
            provider TEXT DEFAULT 'local',     -- 'local', 'google', 'apple', 'github'
            provider_id TEXT,
            avatar TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reactions (
            id TEXT PRIMARY KEY,
            game_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            reaction_type TEXT NOT NULL, -- 'heart', 'skull', 'fire', 'tape'
            created_at TEXT NOT NULL,
            UNIQUE(game_id, user_id, reaction_type),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS guestbook (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            username TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS downloads (
            id TEXT PRIMARY KEY,
            game_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS game_feedback (
            id TEXT PRIMARY KEY,
            game_id TEXT NOT NULL,
            user_id TEXT,
            username TEXT NOT NULL,
            user_role TEXT DEFAULT 'user',
            type TEXT NOT NULL DEFAULT 'comment', -- 'comment', 'suggestion', 'bug_report'
            content TEXT NOT NULL,
            status TEXT DEFAULT 'open',           -- 'open', 'reviewed', 'fixed'
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
    `);

    // Ensure default Admin account exists
    const adminUser = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
    if (!adminUser) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync('1986', salt, 64).toString('hex');
        db.prepare(`
            INSERT INTO users (id, username, email, password_hash, salt, role, provider, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            'admin-master',
            'admin',
            'admin@obsolete-sector.net',
            hash,
            salt,
            'admin',
            'local',
            new Date().toISOString()
        );
        console.log('✓ Master Admin account initialized: username "admin", password "1986"');
    }

    // Migrate existing guestbook JSON if any exists into SQLite
    const guestbookJsonPath = path.join(DATA_DIR, 'guestbook.json');
    const countGuestbook = db.prepare('SELECT COUNT(*) as count FROM guestbook').get();
    if (countGuestbook.count === 0 && fs.existsSync(guestbookJsonPath)) {
        try {
            const raw = JSON.parse(fs.readFileSync(guestbookJsonPath, 'utf8'));
            if (Array.isArray(raw)) {
                const insertStmt = db.prepare(`
                    INSERT OR IGNORE INTO guestbook (id, user_id, username, text, created_at)
                    VALUES (?, ?, ?, ?, ?)
                `);
                const insertMany = db.transaction((entries) => {
                    for (const e of entries) {
                        insertStmt.run(e.id || `msg-${Date.now()}-${Math.random()}`, null, e.name || 'Anonymous', e.text || '', e.date || new Date().toISOString());
                    }
                });
                insertMany(raw);
                console.log(`✓ Migrated ${raw.length} legacy guestbook entries into SQLite.`);
            }
        } catch (e) {
            console.warn('Guestbook migration notice:', e.message);
        }
    }
}

// Password utilities
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(storedHash, 'hex'));
}

// User Operations
function createUser({ username, email, password, role = 'user', provider = 'local', providerId = null, avatar = null }) {
    // Check if username or email already exists
    const existing = db.prepare('SELECT id, username, email FROM users WHERE username = ? COLLATE NOCASE OR (email = ? AND email IS NOT NULL COLLATE NOCASE)').get(username, email);
    if (existing) {
        if (existing.username.toLowerCase() === username.toLowerCase()) {
            throw new Error('This username is already taken. Please choose another.');
        }
        if (email && existing.email && existing.email.toLowerCase() === email.toLowerCase()) {
            throw new Error('An account with this email already exists.');
        }
    }

    let salt = null;
    let passwordHash = null;
    if (password) {
        const hashed = hashPassword(password);
        salt = hashed.salt;
        passwordHash = hashed.hash;
    }

    const id = 'usr-' + crypto.randomUUID();
    const createdAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO users (id, username, email, password_hash, salt, role, provider, provider_id, avatar, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, username, email || null, passwordHash, salt, role, provider, providerId, avatar, createdAt);

    return getUserById(id);
}

function getUserByProviderId(provider, providerId) {
    if (!provider || !providerId) return null;
    return db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').get(provider, providerId) || null;
}

function getUserByEmail(email) {
    if (!email) return null;
    return db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email) || null;
}

function getUserById(id) {
    const user = db.prepare('SELECT id, username, email, role, provider, avatar, created_at FROM users WHERE id = ?').get(id);
    return user || null;
}

function updateUserAvatar(id, avatarUrl) {
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatarUrl || null, id);
    return getUserById(id);
}

function getUserByUsernameOrEmail(identifier) {
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(identifier, identifier);
    return user || null;
}

function getAllUsers() {
    return db.prepare('SELECT id, username, email, role, provider, created_at FROM users ORDER BY created_at DESC').all();
}

function deleteUser(id) {
    const user = getUserById(id);
    if (!user) throw new Error('User not found');
    if (user.role === 'admin') throw new Error('Cannot delete admin account');
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return true;
}

// Session Operations
function createSession(userId) {
    const token = 'os_' + crypto.randomBytes(32).toString('hex');
    const createdAt = new Date().toISOString();
    // 30 days session expiry
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
        INSERT INTO sessions (token, user_id, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    `).run(token, userId, createdAt, expiresAt);

    return { token, expiresAt };
}

function getSessionUser(token) {
    if (!token) return null;
    const row = db.prepare(`
        SELECT s.token, s.expires_at, u.id, u.username, u.email, u.role, u.provider, u.avatar, u.created_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ?
    `).get(token);

    if (!row) return null;

    if (new Date(row.expires_at) < new Date()) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
        return null;
    }

    return {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        provider: row.provider,
        avatar: row.avatar || null,
        createdAt: row.created_at
    };
}

function deleteSession(token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// Guestbook Operations
function getGuestbookEntries() {
    return db.prepare(`
        SELECT g.id, g.user_id, g.username, g.text, g.created_at, u.role as user_role
        FROM guestbook g
        LEFT JOIN users u ON g.user_id = u.id
        ORDER BY g.created_at DESC
        LIMIT 100
    `).all();
}

function addGuestbookEntry({ userId, username, text }) {
    const id = 'msg-' + Date.now();
    const createdAt = new Date().toISOString();
    db.prepare(`
        INSERT INTO guestbook (id, user_id, username, text, created_at)
        VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, username, text, createdAt);
    return { id, user_id: userId, username, text, created_at: createdAt };
}

function deleteGuestbookEntry(id) {
    db.prepare('DELETE FROM guestbook WHERE id = ?').run(id);
}

// Reactions Operations
function toggleReaction(gameId, userId, reactionType) {
    const existing = db.prepare(`
        SELECT id FROM reactions WHERE game_id = ? AND user_id = ? AND reaction_type = ?
    `).get(gameId, userId, reactionType);

    if (existing) {
        db.prepare('DELETE FROM reactions WHERE id = ?').run(existing.id);
        return { action: 'removed' };
    } else {
        const id = 'rx-' + crypto.randomUUID();
        const createdAt = new Date().toISOString();
        db.prepare(`
            INSERT INTO reactions (id, game_id, user_id, reaction_type, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(id, gameId, userId, reactionType, createdAt);
        return { action: 'added' };
    }
}

function getReactionsForGames(userId = null) {
    const rows = db.prepare(`
        SELECT game_id, reaction_type, COUNT(*) as count
        FROM reactions
        GROUP BY game_id, reaction_type
    `).all();

    let userReactions = [];
    if (userId) {
        userReactions = db.prepare(`
            SELECT game_id, reaction_type
            FROM reactions
            WHERE user_id = ?
        `).all(userId);
    }

    const map = {};
    for (const r of rows) {
        if (!map[r.game_id]) map[r.game_id] = {};
        map[r.game_id][r.reaction_type] = r.count;
    }

    const userMap = {};
    for (const ur of userReactions) {
        if (!userMap[ur.game_id]) userMap[ur.game_id] = {};
        userMap[ur.game_id][ur.reaction_type] = true;
    }

    return { counts: map, userReactions: userMap };
}

// Downloads Logging
function logDownload(gameId, userId) {
    const id = 'dl-' + crypto.randomUUID();
    const createdAt = new Date().toISOString();
    db.prepare(`
        INSERT INTO downloads (id, game_id, user_id, created_at)
        VALUES (?, ?, ?, ?)
    `).run(id, gameId, userId, createdAt);
}

// Game Feedback (Opinions/Comments, Suggestions, Bug Reports)
function addGameFeedback({ gameId, userId, username, userRole = 'user', type = 'comment', content }) {
    const id = 'fb-' + Date.now() + '-' + Math.round(Math.random() * 1000);
    const createdAt = new Date().toISOString();
    db.prepare(`
        INSERT INTO game_feedback (id, game_id, user_id, username, user_role, type, content, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)
    `).run(id, gameId, userId, username, userRole, type, content, createdAt);

    return { id, game_id: gameId, user_id: userId, username, user_role: userRole, type, content, status: 'open', created_at: createdAt };
}

function getGameFeedback(gameId, type = null) {
    if (type && type !== 'all') {
        return db.prepare(`
            SELECT id, game_id, user_id, username, user_role, type, content, status, created_at
            FROM game_feedback
            WHERE game_id = ? AND type = ?
            ORDER BY created_at DESC
            LIMIT 100
        `).all(gameId, type);
    }
    return db.prepare(`
        SELECT id, game_id, user_id, username, user_role, type, content, status, created_at
        FROM game_feedback
        WHERE game_id = ?
        ORDER BY created_at DESC
        LIMIT 100
    `).all(gameId);
}

function deleteGameFeedback(id) {
    db.prepare('DELETE FROM game_feedback WHERE id = ?').run(id);
}

// Run schema initialization
initSchema();

module.exports = {
    db,
    verifyPassword,
    createUser,
    getUserById,
    updateUserAvatar,
    getUserByUsernameOrEmail,
    getUserByProviderId,
    getUserByEmail,
    getAllUsers,
    deleteUser,
    createSession,
    getSessionUser,
    deleteSession,
    getGuestbookEntries,
    addGuestbookEntry,
    deleteGuestbookEntry,
    toggleReaction,
    getReactionsForGames,
    logDownload,
    addGameFeedback,
    getGameFeedback,
    deleteGameFeedback
};
