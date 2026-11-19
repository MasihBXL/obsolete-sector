# 🛸 OBSOLETE SECTOR // Complete 0-to-100 Developer & AI Agent Handover Guide

> **Project Name:** Obsolete Sector / "Hello, I am MOPTAM"  
> **Repository:** `https://github.com/MasihBXL/obsolete-sector.git` (`branch: main`)  
> **Local Workspace:** `D:\Coding & Programing\WEB`  
> **Current Version:** v2.5 (November 2026)  
> **Default Admin Passcode:** `1986` (Username: `admin`)  
> **Primary Technology Stack:** Node.js, Express 5, Better-SQLite3, Vanilla HTML5 / Modern Modular CSS3 / ES6 JavaScript (No bulky frameworks), Web Audio API.

---

## 📖 Table of Contents
1. [Project Overview & Core Identity](#1-project-overview--core-identity)
2. [Quickstart & Local Environment](#2-quickstart--local-environment)
3. [Architecture & Project Directory Map](#3-architecture--project-directory-map)
4. [Database & Data Models](#4-database--data-models)
5. [Frontend Anatomy (SPA & Hash Routing)](#5-frontend-anatomy-spa--hash-routing)
6. [Detailed Page-by-Page Breakdown](#6-detailed-page-by-page-breakdown)
7. [Theming System & Audio Engine](#7-theming-system--audio-engine)
8. [Authentication, User Profiles & Admin Portal](#8-authentication-user-profiles--admin-portal)
9. [Complete Backend API Reference](#9-complete-backend-api-reference)
10. [User Preferences, UX Rules & Strict Guidelines](#10-user-preferences-ux-rules--strict-guidelines)
11. [Troubleshooting & Next Steps](#11-troubleshooting--next-steps)

---

## 1. Project Overview & Core Identity

### What is this project?
**Obsolete Sector** is the personal creative portfolio, indie game archive, audio laboratory, and community hub for **MOPTAM** — an independent game developer, tactile sound designer, and low-poly 3D artist.

### Thematic & Aesthetic Direction
- **Inspiration:** Atmospheric analog horror developers (specifically Mike Klubnika, creator of *Buckshot Roulette*), classic Cold War technology, liminal spaces, and authentic early-2000s computing (Web 1.0, Windows XP Luna, Windows 98).
- **Core Visual Pillars:**
  - Nostalgic window frames (Windows XP Luna with blue titlebars, Windows 98 bevels).
  - Software-simulated CRT scanlines overlay with real-time toggle.
  - Web Audio API synthesizer for hardware clicks, relays, floppy seeks, and sub-bass ambient drones.
  - Multi-theme support: Windows XP, Windows 98 Classic, Backrooms Wiki theme, and multiple CRT phosphor monitors (Dark, Green, Amber, Blood Noir).
- **Language / UX Rule:** While the visual aesthetic is vintage, the text and interface language must be **simple, clear, and accessible**. Avoid confusing military or cryptographic jargon (e.g. use "Download" instead of "Acquisition Clearance & Dispatch Console", "Username" instead of "Call-Sign", "Screenshots" instead of "Telemetry").

---

## 2. Quickstart & Local Environment

### Prerequisites
- Node.js 18.x or 20.x+
- npm (Node Package Manager)
- Git

### Running Locally
```powershell
# Navigate to workspace
cd "D:\Coding & Programing\WEB"

# Install dependencies
npm install

# Start Express server (runs on port 3000)
npm start
# or: node server.js
```
The application will be accessible at:
- **Main Site:** `http://localhost:3000/`
- **Admin Portal:** `http://localhost:3000/admin.html` (Password: `1986`)

### Git Workflow
All commits must be clean and pushed to `origin main`:
```powershell
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

---

## 3. Architecture & Project Directory Map

```
D:\Coding & Programing\WEB\
│
├── server.js              # Core Express 5 server: API routes, authentication, OAuth, uploads
├── db.js                  # SQLite database connection & schema tables (better-sqlite3)
├── package.json           # Dependencies: express, better-sqlite3, multer, cors
├── cloudflared.exe        # Cloudflare tunnel utility for public web exposure
│
├── data/                  # File-based JSON backups & seed storage
│   ├── games.json         # Catalog of archived games, screenshots, downloads, links
│   ├── art.json           # 3D models, renders, pixel art, sketch data
│   ├── music.json         # Audio tracks, covers, MP3 streaming URLs
│   ├── sfx.json           # Sound effects / foley library samples
│   ├── updates.json       # Devlog entries, update patch notes, YouTube embeds
│   ├── socials.json       # Social media links, thumbnails, short reels info
│   ├── settings.json      # Dynamic site configuration (e.g. marquee ticker text)
│   └── obsolete_sector.db # SQLite database file (users, comments, reactions, guestbook)
│
├── uploads/               # User-uploaded files (avatars, game builds, screenshots)
│
└── public/                # Static assets served to the browser
    ├── index.html         # Main Single Page Application (XP window frame, views, modals)
    ├── admin.html         # Admin dashboard for uploads, devlogs, socials, ticker
    │
    ├── css/
    │   └── style.css      # Master stylesheet (7,000+ lines): layout, themes, CRT, modals
    │
    ├── js/
    │   ├── app.js         # Core frontend logic (3,500+ lines): SPA routing, auth, UI
    │   └── audio.js       # Web Audio API procedural sound engine
    │
    └── assets/            # Icons, avatar presets, badges, screenshots, cover images
        ├── avatars/       # Theme-default avatars (XP knight, Win98 operative, etc.)
        ├── badges/        # Web 1.0 88x31 badges & SVG platform icons
        └── images/        # Game banner covers, art pieces, reel thumbnails
```

---

## 4. Database & Data Models

The database is managed via `better-sqlite3` in `db.js` / `server.js` (`data/obsolete_sector.db`):

### 1. `users` Table
- `id` (TEXT, Primary Key, e.g. `usr-xxxx`)
- `username` (TEXT, Unique)
- `email` (TEXT, Unique)
- `password_hash` (TEXT, bcrypt hashed)
- `role` (TEXT: `'user'` or `'admin'`)
- `provider` (TEXT: `'local'`, `'google'`, `'github'`, `'facebook'`)
- `provider_id` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (DATETIME)

### 2. `game_feedback` Table
- `id` (INTEGER, Primary Key Auto-increment)
- `game_id` (TEXT)
- `user_id` (TEXT)
- `username` (TEXT)
- `type` (TEXT: `'comment'`, `'suggestion'`, `'bug_report'`)
- `content` (TEXT)
- `created_at` (DATETIME)

### 3. `devlog_comments` Table
- `id` (INTEGER, Primary Key Auto-increment)
- `devlog_id` (INTEGER)
- `user_id` (TEXT)
- `username` (TEXT)
- `content` (TEXT)
- `created_at` (DATETIME)

### 4. `guestbook` Table
- `id` (INTEGER, Primary Key Auto-increment)
- `user_id` (TEXT)
- `username` (TEXT)
- `user_role` (TEXT)
- `text` (TEXT)
- `created_at` (DATETIME)

### 5. `reactions` Table
- `id` (INTEGER, Primary Key Auto-increment)
- `target_id` (TEXT: game ID or devlog ID)
- `user_id` (TEXT)
- `reaction_type` (TEXT: `'heart'`, `'skull'`, `'fire'`, `'tape'`)
- `created_at` (DATETIME)

### 6. `ticker_settings` (in `settings.json`)
Stores the dynamic marquee text displayed across the header of the site.

---

## 5. Frontend Anatomy (SPA & Hash Routing)

The frontend operates as a hash-routed Single Page Application (SPA). `public/js/app.js` listens to `hashchange` and toggles `.site-view` elements inside `public/index.html`:

| Hash Route | Target View Element | Purpose |
|------------|---------------------|---------|
| `#home` | `#view-home` | Hero profile, 4 navigation cards, latest update, latest videos |
| `#games` | `#view-games` (`#gamesGalleryView`) | 2D banner catalog of games with category filters |
| `#game/:id` | `#view-games` (`#gameDetailPage`) | Dedicated single-game page with banner, gallery, downloads, feedback |
| `#art` | `#view-art` | 3D render showcase, pixel art, sketch gallery, modal viewer |
| `#audio` | `#view-audio` | Retro Windows Media Player, streaming links, tracklist, foley SFX |
| `#updates` | `#view-updates` | Full devlog list, patch notes, YouTube embeds, inline comment drawers |
| `#socials` | `#view-socials` | Social profile quick-bar, long-form YouTube player, vertical reels grid |
| `#guestbook` | `#view-guestbook` | Visitor guestbook stream, message submission form |
| `terminal [~]` | `#terminalDrawer` | Retro slide-down command-line console (hotkey: `~` or `ESC`) |

---

## 6. Detailed Page-by-Page Breakdown

### 1. Home Page (`#view-home`)
- **Hero Box:** Concise 2-sentence intro of MOPTAM + 3 stat pills (`🕹️ 4 INDIE GAMES`, `⚡ FREE BUILDS & STEAM`, `🎨 3D ART & SOUND LAB`).
- **Explore Sectors Grid:** 4 Windows XP task-style cards leading to Games, Art, Audio, Devlogs.
- **Latest Devlog Highlight:** Displays the most recent post from `updates.json`, with a random spotlight comment and collapsible comment drawer.
- **Latest Videos & Reels:** Side-by-side display of the latest long-form YouTube documentary and latest short vertical reel with a CRT 16:9 facade.
- **Guestbook CTA:** Direct banner encouraging users to leave a message.

### 2. Games Archive & Dedicated Game Sub-page (`#view-games`)
- **Banner Gallery View:** Filter buttons (`ALL`, `FREE`, `STEAM`, `PSYCH`, `ANALOG TECH`, `SURVIVAL`). Each card has cover art, price badge, tags, size, and a `VIEW GAME ➔` button.
- **Dedicated Game Page:**
  1. Breadcrumb navigation (`← BACK TO GAMES GALLERY / ...`).
  2. Full-width 21:9 hero banner with price and version badge.
  3. Header with Title + **Quick Download Button (`📥 Download the Game`)** that soft-pulses and smooth-scrolls down to the download card.
  4. "About This Game" synopsis and Key Features list.
  5. **Horizontal Screenshot Gallery:** Scrollable track with `◄ PREV` and `NEXT ►` buttons, large cards, and click-to-zoom full-resolution lightbox (`#imageLightboxModal`).
  6. **Download & Acquisition Box:** Warm cream card containing platform specs, file size, download count, the primary Direct Download button (`📥 DOWNLOAD STANDALONE GAME`), companion `Play on itch.io` button, Steam purchase link, and Browser Play button.
  7. **Reactions Bar:** 4 reaction buttons (`❤️`, `💀`, `🔥`, `📼`) with real-time toggle.
  8. **Community Feedback:** Tabbed view (`ALL`, `💬 OPINIONS`, `💡 SUGGESTIONS`, `🐛 BUG REPORTS`) with submission form and live list.

### 3. Art Gallery (`#view-art`)
- Category filters: `ALL (8)`, `3D ART (4)`, `PIXEL ART (2)`, `SKETCHES (2)`.
- Clicking any artwork opens the `#artModal` with pixelated zoom, medium info, description, and optional 3D asset itch.io store link.

### 4. Audio Lab & Sound Vault (`#view-audio`)
- Custom retro **MOPTAM Audio Player** styled as Windows Media Player with track cover, title, artist, live seek slider, transport buttons (`PREV`, `-5s`, `PLAY/PAUSE`, `+5s`, `NEXT`, `STOP`), volume slider, and track download.
- Streaming platform buttons (SoundCloud, Spotify).
- Tracklist with clickable play items.
- Tactile Sound Effects & Foley Library: interactive grid of mechanical sample buttons with live playback.

### 5. Devlogs & Updates (`#view-updates`)
- Chronological devlog feed.
- Supports attached media: responsive YouTube iframe embeds, direct HTML5 video player, or full-resolution click-to-zoom images.
- Devlog comments drawer with real-time posting and admin deletion.

### 6. Socials Hub (`#view-socials`)
- Profile quick-bar with uniform cards for YouTube, TikTok, Instagram, Discord, Itch.io, and Steam.
- Long-Form YouTube broadcast section.
- Cross-Platform Short Reels section: clicking open triggers either a platform choice modal (`#platformPickerModal`) or the vertical 9:16 theater modal (`#reelTheaterModal`).

### 7. Guestbook & Contact (`#view-guestbook`)
- Direct communication links (Email, Itch.io, Steam, Bandcamp, Discord).
- Message board with Admin/User status badges.

---

## 7. Theming System & Audio Engine

### The 7 Visual Themes
Themes are controlled via the `data-theme` attribute on `document.documentElement`:
1. `win-xp` (Default): Windows XP Luna Light Mode, royal blue titlebar, periwinkle cards, bliss sky background, `VT323` and `Share Tech Mono` fonts.
2. `win98`: Windows 98 Classic, `#008080` teal desktop background, gray 3D bevels, square borders, clean system typography.
3. `backrooms`: Wikidot-style yellow/cream dingy wallpaper palette (`#EDE9DF`), olive-brown borders, amber alerts.
4. `dark`: Modern retro dark CRT terminal, high contrast.
5. `green`: Phosphor green monochrome terminal.
6. `amber`: Warm amber monochrome terminal.
7. `blood`: High-tension crimson noir CRT monitor.

### CRT Scanlines Overlay
- Controlled by `#crtToggleBtn`.
- Adds/removes the `.crt-active` class and overlay scanline raster lines across the viewport.

### Web Audio API Engine (`public/js/audio.js`)
- Controlled by `#audioToggleBtn` (`AUDIO: ON / OFF`).
- Procedural audio synthesized via native Web Audio API oscillators:
  - Button hover click (mechanical relay sound).
  - Button select / click.
  - CRT degauss hum.
  - Floppy disk head seek sound during downloads.
  - Low-frequency ambient drone.

---

## 8. Authentication, User Profiles & Admin Portal

### User Authentication (`#authModal`)
- **Login Tab:** Username/Email + Password.
- **Register Tab:** Username + Email + Password.
- **Social OAuth SSO:** Google, GitHub, Facebook.
  - *Note:* Apple OAuth was **permanently removed** per user instruction.
  - New social sign-ups prompt the user to choose their preferred display username.
- **Admin Tab:** Admin passcode login (`1986`).

### User Profile Modal (`#userProfileModal`)
- Displays user avatar, username, role, join date, post counts.
- **Avatar System:** Supports custom uploaded image (PNG/JPG/WEBP/GIF/SVG up to 5MB) or automatic theme-default avatar (switches portrait to match XP, Win98, Backrooms, etc.).

### Admin Portal (`/admin.html`)
- Protected by password `1986`.
- Features:
  - Game uploader (ZIP, RAR, 7Z, EXE up to 500MB) with thumbnail and up to 6 screenshots.
  - Marquee Ticker customizer (updates top scrolling text in real time).
  - Devlog publisher.
  - Art gallery item manager.
  - Social media channel manager.

---

## 9. Complete Backend API Reference

### Public Content APIs
- `GET /api/games` — Returns list of all archived games.
- `GET /api/games/:id` — Returns single game metadata.
- `GET /api/art` — Returns art gallery items.
- `GET /api/music` — Returns audio albums and tracks.
- `GET /api/sfx` — Returns sound effects list.
- `GET /api/updates` — Returns devlogs.
- `GET /api/socials` — Returns social channels and reels.
- `GET /api/ticker` — Returns current marquee text.

### Community & Feedback APIs
- `GET /api/games/:id/feedback` — List feedback for a game (supports `?type=comment|suggestion|bug_report`).
- `POST /api/games/:id/feedback` — Submit feedback (requires user auth).
- `GET /api/devlogs/:id/comments` — List comments for a devlog.
- `POST /api/devlogs/:id/comments` — Add comment to devlog (requires user auth).
- `DELETE /api/devlogs/comments/:id` — Delete comment (admin only).
- `GET /api/guestbook` — List guestbook messages.
- `POST /api/guestbook` — Post guestbook message (requires user auth).
- `DELETE /api/guestbook/:id` — Delete guestbook message (admin only).
- `GET /api/reactions` — Get reaction counts for all targets.
- `POST /api/reactions/toggle` — Toggle a user's reaction (`heart`, `skull`, `fire`, `tape`).

### Authentication & Profile APIs
- `POST /api/auth/register` — Register local user `{ username, email, password }`.
- `POST /api/auth/login` — Login user `{ identifier, password }`.
- `GET /api/auth/me` — Get current logged-in user profile from Bearer token.
- `POST /api/auth/avatar` — Upload custom avatar (Multer image upload).
- `DELETE /api/auth/avatar` — Reset avatar to theme default.
- `GET /api/auth/providers-status` — Returns configured OAuth providers (google, github, facebook).

### Admin APIs (Require Header `x-admin-passcode: 1986` or Bearer Token)
- `POST /api/admin/games` — Add/edit game with file uploads.
- `POST /api/admin/updates` — Publish new devlog.
- `POST /api/admin/art` — Upload artwork.
- `POST /api/admin/socials` — Update socials metadata.
- `POST /api/admin/ticker` — Update live marquee ticker string.

---

## 10. User Preferences, UX Rules & Strict Guidelines

Whenever working on this codebase, **any AI agent must respect the following rules**:

1. **Communication Language:**
   - The user communicates in **Persian (Farsi)**. Always reply politely, concisely, and informatively in Persian.
2. **Language Clarity vs. Retro Style:**
   - Keep the retro visual design intact (XP window frames, bevels, CRT, scanlines).
   - **Do NOT** use confusing military/sci-fi jargon for standard UI concepts. Always use clear, universally understood English labels:
     - Use `Download` (NOT `Acquisition Clearance & Dispatch Console`).
     - Use `Username` & `Password` (NOT `Call-Sign` & `Security Passcode`).
     - Use `Screenshots` (NOT `Archive Telemetry`).
     - Use `About This Game` (NOT `Atmospheric Synopsis & Logs`).
     - Use `Community & Feedback` (NOT `Community Intel`).
3. **No Commercial/Ad Looking Buttons:**
   - The user strongly dislikes generic, bright, modern ad-style buttons. Keep buttons authentic to Windows XP Luna (`.btn-pixel`, `.xp-btn-action`) or retro Windows 98 styles.
4. **No Apple OAuth:**
   - Apple sign-in was permanently removed upon user request. Do not re-add Apple OAuth.
5. **Git Discipline:**
   - Every batch of changes must be verified and pushed to `origin main`.
6. **Progressive Approval:**
   - For major UI changes or restructuring, explain the proposal first and obtain user confirmation before making destructive edits.

---

## 11. Troubleshooting & Next Steps

### Known Observations & Roadmap:
- **OAuth Keys:** In `.env`, live Google, GitHub, and Facebook Client IDs and Secrets can be placed when production OAuth is desired; the system currently supports both OAuth callback and simulated developer flows.
- **TikTok Thumbnails:** TikTok video oEmbed has occasional network timeouts on strict firewalls; local cached thumbnails in `public/assets/images/` are preferred for performance.
- **Adding Games:** New games can be easily added either via `http://localhost:3000/admin.html` or by directly appending records into `data/games.json`.

---

## 12. Changelog — All Changes Must Be Logged Here

> **⚠️ IMPORTANT FOR ALL AI AGENTS:** After every change you make to this project, you **MUST** append a new entry to this changelog. Each entry should include the date, commit hash, and a clear description of what was changed.

### Session 1 — 2026-11-11 (Initial Build)
| Commit | Description |
|--------|-------------|
| `0bd5b36` | Complete RBAC user/admin system, SQLite database, reactions, free hosting configs |
| `a6a3de5` | Add free hosting deployment guide |
| `8f0aef4` | Update gitignore to exclude cloudflared and sqlite temp files |
| `4dec424` | Add Deploy to Render button to README |
| `16cac06` | Transform site into modular multi-part experience (Home, Games, Art, Audio, Devlogs) |
| `d3f6586` | Implement 2D Banner Gallery, dedicated game pages, Winamp-style audio player |
| `156b284` | Integrate social auth inside login/signup tabs, restyle audio player |
| `369d65b` | Revamp XP Luna color palette, 1-click social OAuth with username prompt |
| `b197e54` | Restore authentic Bliss wallpaper background, eliminate modern colored stripes |
| `d5853bc` | Restore neutral cream music player, isolate card/button styles across themes |
| `3b499ca` | Fix SyntaxError in app.js: remove duplicate block with stray await |
| `ba57e0f` | Fix dark CRT button styles, integrate quick social buttons inside login/register panes |
| `a1d5e94` | Sync outer window across themes, fix Win98 font wrapping, add screenshot lightbox |
| `e9e819a` | Implement genuine OAuth 2.0 (Google + GitHub) with token exchange and SQLite sessions |
| `22edac6` | Remove red horror badge icon next to MOPTAM header title |
| `067e0b1` | Add User Profile modal with custom avatar upload and 7 theme-matching default avatars |
| `d5994b1` | Implement devlog reactions & comments with spotlight quote |
| `18d902a` | Add rich multimedia, responsive YouTube embed, social links to Devlogs |
| `62e7f7d` | Add dedicated Socials view with embedded YouTube, cross-platform reels launcher |
| `5f2ca3e` | Add commercial asset store links, pricing, and format specs to Art Gallery |
| `6a4b3c7` | Add SoundCloud and Spotify buttons to Music Player |
| `c77faab` | Fix music player title contrast across all themes |

### Session 2 — 2026-11-14 (Themes, Socials, TikTok)
| Commit | Description |
|--------|-------------|
| `8b5c432` | Enhance Win98 3D bevels, Backrooms liminal theme, audio player contrast |
| `89acc6a` | Retro typography for Win98, single-line nav, YouTube thumbnail facades, marquee editor |
| `1f5a48b` | Fix home devlog comments sync, restore MS Sans Serif for Win98 |
| `224d44a` | Restore VT323 pixel font and Share Tech Mono for Win98 |
| `d0038c0` | Add TikTok embed, replace Twitter→Itch.io, generate 6 retro SVG icons, add Facebook OAuth |
| `b8106de` | Refactor short reel display with CRT facade and 9:16 theater modal, **remove Apple login permanently** |

### Session 3 — 2026-11-17 (Game Pages, Download UX, UX Overhaul)
| Commit | Description |
|--------|-------------|
| `3638c8d` | Add short reel thumbnail, balance socials row, overhaul game page with scroll gallery and download console |
| `9b48ad9` | Update download card to warm cream style, add animated quick download button, add "Play on itch.io" button |
| `198ae50` | **Major UX overhaul:** simplify retro military jargon to clear English, reduce text density, add spacing |
| `5cd475b` | **UX overhaul continued:** simplify jargon across Games, Art, Audio, Devlogs, Socials, and all modals |

### Session 4 — 2026-11-18 (Documentation)
| Commit | Description |
|--------|-------------|
| `6732eb6` | Create comprehensive 0-to-100 developer and AI agent handover guide |
| `ae06e3c` | Add changelog section with full commit history to handover guide |

### Session 5 — 2026-11-19 (Custom Aseprite Pixel Art Icons)
| Commit | Description |
|--------|-------------|
| `b5816a9` | Integrate user custom Aseprite pixel art icons (YouTube, TikTok, Instagram, Discord, Itch.io) with pixelated rendering |

### Template for Future Entries
```
### Session N — YYYY-MM-DD (Brief Topic)
| Commit | Description |
|--------|-------------|
| `abc1234` | Description of changes |
```

---
*Document prepared for seamless handoff to any AI agent or software engineer. Last updated: 2026-11-19.*
