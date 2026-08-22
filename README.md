# Rajlabs Tools & Utilities — 40+ Free, Client-Side Developer Tools

<p align="center">
  <a href="https://utility.rajlabs.in"><strong>Live Demo: utility.rajlabs.in</strong></a> •
  <a href="https://github.com/authoritydmc/rajlab-tools-webapp">GitHub</a> •
  <a href="https://utility.rajlabs.in/changelog">Changelog</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/authoritydmc/rajlab-tools-webapp?style=flat-square" alt="License: GPL-3.0" />
  <img src="https://img.shields.io/github/stars/authoritydmc/rajlab-tools-webapp?style=flat-square" alt="Stars" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=flat-square&logo=firebase" alt="Firebase Hosting" />
</p>

> **Privacy-first, 100% client-side.** All 40+ utilities run entirely in the browser — no data leaves your device. No signup, no tracking, no server processing.

---

## Table of Contents

- [Features](#features)
- [Tool Catalog](#tool-catalog)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Developer & Embed API](#developer--embed-api)
- [Scripts](#scripts)
- [Environment & Config](#environment--config)
- [Deployment](#deployment)
- [SEO & Sitemaps](#seo--sitemaps)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Security](#security)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

- **40+ utilities** across 9 categories — text, PDF, QR, JSON, crypto/encoding, dev, design & media
- **Privacy-first:** every transform (hashing, PDF merge, image compress) runs via WASM / browser APIs — zero uploads
- **URL Query API:** drive any tool headlessly via query params (`?text=...&length=16`, `?data=...&size=300`)
- **Raw Output Engine:** `?raw=image|svg|json|text|csv|xml|yaml` + `/raw/:toolSlug` for CLI, `curl`, and automation
- **Embed Widgets:** `/embed/:toolSlug` + `?embed=true` for clean iframe/widget embedding
- **Developer Embed Guide** on every tool page — live-generated cURL, `<img>` / `<iframe>`, React JSX, and Markdown snippets
- **Progressive UI:** masonry bento grid, mesh gradient, glass header, dark/light theme (`prefers-color-scheme`), flip clock, global error boundary with auto-refresh
- **Favorites & Most-Used sorting** persisted in `localStorage` + draggable category reordering
- **Dynamic SEO:** per-tool canonical, Open Graph, Twitter Cards, and `schema.org/WebApplication` JSON-LD (see `index.html:64` and `src/components/common/DeveloperEmbedGuide.jsx`)

---

## Tool Catalog

> Source of truth: [`src/toolCategories.json:1`](src/toolCategories.json)

| Category | Tools |
|---|---|
| **Text Utilities** | Sanitize Text (`/sanitize-text`), Text Formatter (`/format-text`), Lorem Ipsum Generator (`/lorem-ipsum`), Markdown Playground (`/markdown-playground`) |
| **PDF Tools** | Merge PDF (`/merge-pdf`), Split PDF (`/split-pdf`), Unlock PDF (`/unlock-pdf`) — powered by `pdf-lib` |
| **Calculators** | Print Cost Estimator (`/print-cost-estimator`) with currency selector & UPI QR share |
| **Encryption & Encoding** | Base64 Encode/Decode (`/base64-encoder-decoder`), Password Generator (`/password-generator`), JWT Decoder (`/jwt-decoder`), BCrypt Hashing (`/bcrypt-hashing`), Hash Generator (`/hash-generator` MD5/SHA-1/256/384/512 via `crypto-js`), Image ↔ Base64 (`/image-to-base64`, `/base64-to-image`), URL Encoder/Decoder (`/url-encoder-decoder`) |
| **QR Codes** | QR Generator (`/qr-code-generator` with logo/frame/pattern/eye styling via `qr-code-styling`), UPI QR (`/upi-code-generator`), WhatsApp QR (`/whatsapp-qr-code`), QR Scanner (`/qr-scanner` via `jsqr`) |
| **JSON Utilities** | JSON Viewer (`/json-viewer` + `@monaco-editor/react`), JSON Diff (`/json-diff-checker` via `diff`), JSON↔CSV (`/json-to-csv`, `/csv-to-json` via `papaparse` + `js-yaml`), JSON↔XML (`/json-to-xml`, `/xml-to-json` via `fast-xml-parser`), JSON↔YAML (`/json-to-yaml`, `/yaml-to-json`) |
| **Developer Tools** | Regex Tester (`/regex-tester`), UUID Generator (`/uuid-generator`), Timestamp Converter (`/timestamp-converter`), CSS Unit Converter (`/css-unit-converter`) |
| **Excel Tools** | Unlock Excel Sheet (`/unlock-excel` removes sheet/workbook protection via `jszip`) |
| **Design Utilities** | Color Picker & Converter (`/color-picker` HEX/RGB/HSL) |
| **Multimedia** | Video Converter (`/video-converter` via `@ffmpeg/ffmpeg` WASM), Image Compressor (`/image-compressor` via `browser-image-compression`) |

> Disabled or WIP tools are flagged with `"isEnabled": false` in `toolCategories.json` and are hidden from the grid automatically.

---

## Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | React 18 + React Router 6 (`src/routers.jsx:60`, `src/App.jsx:1`) |
| **Build** | Vite 5 (`vite.config.js:1`) |
| **Styling** | Tailwind CSS 3 + PostCSS + Autoprefixer |
| **State** | React Context (`themeContext.jsx`, `favoritesContext.jsx`) + `localStorage` |
| **Icons** | `react-icons` (tree-shaken per-icon imports) |
| **PDF** | `pdf-lib` |
| **Media** | `@ffmpeg/ffmpeg` + `@ffmpeg/util`, `browser-image-compression` |
| **Data** | `papaparse`, `fast-xml-parser`, `js-yaml`, `jszip`, `qrcode.react` / `qr-code-styling`, `jsqr` |
| **Editor** | `@monaco-editor/react` |
| **Hosting** | Firebase Hosting (`firebase.json:1`, SPA rewrite `** → /index.html`) |
| **CI/CD** | GitHub Actions — `firebase-hosting-merge.yml` (live) + `firebase-hosting-pull-request.yml` (preview channels) |
| **Lint** | ESLint 9 + `eslint-plugin-react` / `react-hooks` / `react-refresh` (`eslint.config.js:1`) |
| **Analytics** | Firebase Analytics (optional, via `src/firebaseConfig.jsx`) |

Browser support: evergreen Chrome / Firefox / Safari / Edge (ES2020+). No IE.

---

## Quick Start

**Prerequisites:** Node.js 18+ and npm 9+.

```bash
# 1. Clone
git clone https://github.com/authoritydmc/rajlab-tools-webapp.git
cd rajlab-tools-webapp

# 2. Install
npm ci

# 3. Configure Firebase (optional — app works without it, analytics just stays disabled)
# Create src/firebaseConfig.json from Firebase console, or:
# cp src/firebaseConfig.json.example src/firebaseConfig.json  # if you add one
# The CI creates this file from the FIREBASE_API_CONFIG secret (see .github/workflows/firebase-hosting-merge.yml:20)

# 4. Run dev server
npm run dev
# → http://localhost:5173

# 5. Build & preview production
npm run build
npm run preview
```

No env variables are required for local dev. Missing `src/firebaseConfig.json` is handled gracefully (see `.gitignore:25`).

---

## Project Structure

```
rajlab-tools-webapp/
├── public/
│   ├── CHANGELOG.md          # Versioned changelog (rendered at /changelog)
│   ├── favicon-*.png / logo_*.png
│   └── sitemap*.xml          # Generated by generateSiteMap.py
├── src/
│   ├── App.jsx               # Theme + Favorites providers + RouterProvider
│   ├── MainLayout.jsx        # Header (glass), footer, raw-mode bypass (?raw=...)
│   ├── routers.jsx           # All lazy routes + /raw/:toolSlug & /embed/:toolSlug
│   ├── themeContext.jsx      # Dark/light toggle + prefers-color-scheme
│   ├── favoritesContext.jsx  # Favorites + most-used sorting (localStorage)
│   ├── toolCategories.json   # Single source of truth for all tools & categories
│   ├── components/
│   │   ├── MainToolPage.jsx  # Masonry bento grid + search/filter
│   │   ├── common/           # ToolPageLayout, DeveloperEmbedGuide, RelatedTools, FlipClock, etc.
│   │   ├── embeds/           # RawResultView (headless computation), DirectEmbedView (widget)
│   │   ├── qrCodes/          # QR generator / UPI / WhatsApp / Scanner
│   │   ├── json/             # Viewer, Diff, CSV/XML/YAML converters, JWT
│   │   ├── pdf-tools/        # Merge / Split / Unlock
│   │   ├── ...               # One folder per domain (see Tool Catalog)
│   │   └── Changelog.jsx
│   ├── hooks/
│   ├── utils/
│   └── index.css             # Tailwind base + mesh gradient + glass utilities
├── .github/workflows/        # Firebase Hosting deploy (merge + PR preview)
├── generateSiteMap.py        # Parses src/routers.jsx → sitemap.xml
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
└── firebase.json
```

Key conventions:
- **One component per tool**, lazy-loaded in `routers.jsx:18` — keep bundles small.
- **Tool metadata lives only in `toolCategories.json`** — never hardcode tool lists elsewhere.
- **Raw-mode bypass** in `MainLayout.jsx:11` — when `?raw=` or `?format=` is present, header/footer/mesh are stripped for clean programmatic responses.

---

## Developer & Embed API

Every tool supports three consumption modes:

### 1. URL Query Parameters (instant compute)
Append query params to any tool URL and the tool computes immediately on load:

```
/password-generator?length=24&uppercase=true&numbers=true&symbols=false
/jwt-decoder?token=eyJhbGci...
/json-to-csv?json=%7B%22a%22%3A1%7D
/regex-tester?pattern=%5Cd%2B&text=abc123&flags=g
/timestamp-converter?ts=1700000000
/qr-code-generator?data=https://example.com&size=400&bg=%23ffffff&fg=%23000000
/qr-code-generator?data=hello&logo=upi&dots=dots&frame=bottom&frameText=SCAN%20ME
```

### 2. Raw Output (headless / automation)
Add `?raw=<type>` or use the dedicated `/raw/:toolSlug` route for machine-readable responses:

```
/qr-code-generator?data=hello&raw=image        # PNG binary
/qr-code-generator?data=hello&raw=svg          # SVG markup
/password-generator?length=16&raw=text         # plaintext
/password-generator?length=16&raw=json         # { "password": "..." }
/json-to-csv?json=%7B%22a%22%3A1%7D&raw=csv
/raw/qr-code-generator?data=hello&raw=image    # same, via /raw/ prefix
```

Raw mode strips all chrome (header/footer) via `MainLayout.jsx:15`. Useful for `curl`, server-side fetches, and third-party integrations.

### 3. Embed Widgets
```
/embed/qr-code-generator?data=hello&size=300   # widget-only view
/qr-code-generator?embed=true                  # same via query flag
```

Embed as:
```html
<iframe src="https://utility.rajlabs.in/embed/qr-code-generator?data=hello&size=300" width="360" height="360" frameborder="0"></iframe>
<img src="https://utility.rajlabs.in/qr-code-generator?data=hello&raw=image&size=400" alt="QR" />
```

Each tool page renders a live **Developer Embed Guide** (`src/components/common/DeveloperEmbedGuide.jsx`) with copy-paste snippets for cURL, `<img>`, `<iframe>`, React JSX, and Markdown.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across the project |
| `python3 generateSiteMap.py -f src/routers.jsx` | Regenerate `public/sitemap*.xml` from routes |

---

## Environment & Config

- **`src/firebaseConfig.json`** — Firebase web config (apiKey, authDomain, projectId, etc.). Git-ignored (` .gitignore:25`). In CI it's injected from `secrets.FIREBASE_API_CONFIG` (see `firebase-hosting-merge.yml:20`). App runs fine without it — analytics/features degrade gracefully.
- **`firebase.json`** — Hosting config; `public: dist` with SPA rewrite (`src/routers.jsx` handles client routing).
- **No `.env` file** is required. All tool logic is client-side.

---

## Deployment

**Automatic (recommended):**
- Push to `main` → GitHub Action builds (`npm ci && npm run build`) and deploys to Firebase Hosting `live` channel (`portfolio-site-ba08a`).
- Pull requests → preview channel deploy via `firebase-hosting-pull-request.yml`.

**Manual:**
```bash
npm run build
npx firebase deploy --only hosting --project portfolio-site-ba08a
# or: firebase deploy --only hosting  # if .firebaserc is configured
```

Pre-deploy checklist: `npm run lint`, `npm run build` succeeds, `generateSiteMap.py` re-run if routes changed.

---

## SEO & Sitemaps

- `index.html` ships canonical, Open Graph, Twitter Card, and JSON-LD `WebApplication` schema (`index.html:24`).
- Per-tool SEO is managed client-side via dynamic meta updates and `DeveloperEmbedGuide` structured data.
- Sitemaps are generated from `src/routers.jsx` via `generateSiteMap.py` and also run in CI before build.

---

## Contributing

We welcome contributions — new tools, bug fixes, a11y, and docs. Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** for:

- Local setup and branch workflow
- How to add a new tool (5-step checklist)
- Coding standards (ESLint, Tailwind, lazy loading, `toolCategories.json` contract)
- PR checklist and commit conventions

Quick start for contributors:

```bash
git checkout -b feat/my-new-tool
# ... make changes ...
npm run lint && npm run build
git commit -m "feat(tools): add My New Tool"
git push -u origin feat/my-new-tool
# Open a PR — see .github/PULL_REQUEST_TEMPLATE.md
```

---

## Code of Conduct

This project adheres to the Contributor Covenant. See **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**. By participating you agree to uphold its terms. Report unacceptable behavior to `raj@rajlabs.in`.

---

## Security

All tools are client-side; no user data is sent to a server. If you find a vulnerability (e.g., XSS via tool input, PDF/Excel parsing issue):

- **Do not** open a public issue.
- Email `raj@rajlabs.in` with details — see **[SECURITY.md](SECURITY.md)** for the full policy and response timeline.
- We aim to acknowledge within 48 hours and patch within 7 days for critical issues.

---

## License

**GPL-3.0** — see **[LICENSE](LICENSE)**. Copyright © 2024–2026 Rajlabs (authoritydmc).

You are free to use, modify, and distribute this project under the GPL-3.0 terms. If you need a different license for embedding in a proprietary product, open an issue to discuss.

---

## Acknowledgements

- Built and maintained by [@authoritydmc](https://github.com/authoritydmc) at [Rajlabs](https://rajlabs.in).
- Icons by [react-icons](https://react-icons.github.io/react-icons/), QR styling by [qr-code-styling](https://github.com/kozakdenys/qr-code-styling), PDFs by [pdf-lib](https://pdf-lib.js.org/), video via [ffmpeg.wasm](https://ffmpegwasm.netlify.app/).
- Hosting and CI by Firebase Hosting + GitHub Actions.

---

<p align="center"><em>Made with care for developers, by developers. PRs welcome!</em></p>
