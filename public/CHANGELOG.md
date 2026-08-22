# Changelog

All notable changes to **Rajlab Tools Webapp** are documented here, organized by version and date.

---

## [3.1.2] — 2026-08-24

### Changed
- **App Check Debug Cleanup (`src/firebaseConfig.jsx`, `src/utils/toolUsageService.js`, `src/utils/feedbackService.js`)**: Removed temporary `AppCheck DEBUG` console logs, `_debug` Firestore writes, and `window.__APPCHECK_DEBUG` exposure now that enforcement is live and stable (65% verified on `utils.rajlabs.in`). `tool_usage` increments are now silent fire-and-forget with API-layer enforcement; no more noisy `onTokenChanged`/`getToken` logs in production.

## [3.1.1] — 2026-08-24

### Fixed
- **Firestore App Check Enforcement (`firestore.rules:42` `tool_usage`)**: Removed `request.app != null` from `tool_usage` create/update rules. `request.app` is a Cloud Functions concept and is always `null` in Firestore rules (`firebase-js-sdk#9914`/`#9915`) — valid tokens (`len=965` on `utils.rajlabs.in`) were still `permission-denied`. Enforcement is now correctly handled at the API layer via Firebase Console → App Check → Cloud Firestore → Enforced (65% verified, 13% outdated, 22% invalid as of Aug 24), while rules retain whitelist, `count==1`/`+1`, `link`/`title` validation, and 2s throttle. This aligns `tool_usage` with `feedback`/`_debug` which already allow without `request.app`.

---

## [3.1.0] — 2026-08-23

### Changed
- **Build Toolchain Modernization (`vite`, `tailwindcss`)**: Upgraded `vite` from `6.4.3` to `8.2.2` with `@vitejs/plugin-react` `4.7.0` → `6.1.0` (Rolldown-powered, 5× faster build: 14s → 2.4s), and `tailwindcss` from `3.4.19` to `4.3.3` with `@tailwindcss/postcss` `4.3.3` — migrated `postcss.config.js:2` to `@tailwindcss/postcss` and `src/index.css:3` to `@import "tailwindcss"` per Tailwind 4 migration guide. Verified `npm audit` remains **0 vulnerabilities**.
- **Additional Dependency Refresh**: Updated `eslint-plugin-react-hooks` `5.2.0` → `7.1.1`, `eslint-plugin-react-refresh` `0.4.20` → `0.5.4`, `react-hot-toast` `2.5.2` → `2.6.0`, and `bcryptjs` `2.4.3` → `3.0.3`. Kept `eslint` at `9.39.5` / `@eslint/js` at `9.39.5` until `eslint-plugin-react` adds ESLint 10 support — current setup has no deprecation or audit issues.
- **React 19 Upgrade (`/` all tools)**: Migrated `react` and `react-dom` from `18.3.1` to `19.2.8` with updated `@types/react` `19.2.18`, `@types/react-dom` `19.2.4`, and `globals` `17.11.0`. Verified compatibility with `@monaco-editor/react`, `react-modal`, `react-easy-crop`, `react-hot-toast`, and other peer dependencies — all support React 19 natively. Delivers faster concurrent rendering and future-proof React Compiler readiness.

### Fixed
- **Zero Vulnerabilities**: `npm audit` now reports **0 vulnerabilities** after comprehensive upgrades from 38 → 0, removing all `rimraf`/`tar`/`glob`/`inflight`/`crypto-js` deprecation warnings.
- **Vite EBUSY Handling**: Fixed intermittent `EBUSY`/`eperm` on `esbuild.exe`/`rollup` during `npm install` by stopping stale `esbuild` processes — builds now reliably complete on Windows.

---

## [3.0.0] — 2026-08-23

### Changed
- **Hash Generator (`/hash-generator`) and Embed (`/raw/hash-generator`)**: Migrated from deprecated `crypto-js@4.2.0` to modern `WebCrypto Subtle` for SHA-1/256/384/512 and lightweight `spark-md5@3.0.2` for MD5 (WebCrypto does not support MD5 by design) plus native HMAC-SHA via `crypto.subtle` and manual HMAC-MD5 — no `crypto-js` needed. SHA-2 family is fully available natively, so retaining `crypto-js` is unnecessary.
- **Dependencies & Security Hardening**: Upgraded `firebase` `10.13.1` → `12.18.0`, `pdfjs-dist` `3.11.174` → `6.2.108` (now `@napi-rs/canvas`, no `tar`/`rimraf` chain), `react-router-dom` `6.26.1` → `7.18.2`, `vite` `5.4.1` → `6.4.2` (initial), `tailwindcss` `3.4.10` → `3.4.19` with `overrides` for `brace-expansion` `1.1.12` and `dompurify` `3.4.14`, bringing `npm audit` from 38 to **0 vulnerabilities**.

### Fixed
- **Deprecated Chain Removal**: Eliminated `rimraf@3.0.2`, `tar@6.2.1`, `glob@7.2.3`, `inflight@1.0.6`, `npmlog@5.0.1`, `gauge@3.0.2`, `are-we-there-yet@2.0.0`, and `crypto-js@4.2.0` warnings (`src/components/hash/HashGenerator.jsx:6`, `src/components/embeds/RawResultView.jsx:4`).

---

## [2.8.2] — 2026-08-22

### Fixed
- **App Check Diagnostics (`/merge-pdf`, `/lorem-ipsum` and all tools)**: Fixed the false `Invalid time value` error that made the console report `AppCheck getToken FAILED` even though reCAPTCHA v3 had passed and a valid token (`len=965`) was present. The diagnostic helper incorrectly expected `expireTimeMillis` from `getToken()` — which only returns `{ token }` — causing `new Date(undefined)` to throw and mask the real status. Now correctly logs token length and prefix, making `permission-denied` debugging actionable. The underlying `Missing or insufficient permissions` still indicates the Firebase Console reCAPTCHA secret does not match the site key `6LfUX5Mt...9-p` and must be corrected under Project Settings → App Check.
- **PDF Preview & Build (`/merge-pdf`, `/split-pdf`, `/organize-pdf`, `/pdf-to-image`)**: Updated PDF.js import to `pdfjs-dist/build/pdf.mjs` and worker to `6.2.108` for Vite 6 compatibility, restoring the production build that previously failed with `Rollup failed to resolve import "pdfjs-dist"`.

### Changed
- **Hash Generator (`/hash-generator`) and Embed (`/raw/hash-generator`)**: Migrated MD5 hashing from `crypto-js` to lightweight `spark-md5` and SHA-1/256/384/512 plus HMAC to native `WebCrypto Subtle`, reducing bundle size and using modern browser cryptography. Includes a manual HMAC-MD5 implementation and asynchronous hash handling for embed previews.
- **Dependencies & Tooling**: Upgraded `firebase` to `12.18.0`, `pdfjs-dist` to `6.2.108`, `react-router-dom` to `7.18.2`, `vite` to `6.4.3`, `tailwindcss` to `3.4.19`, and related lint/build tooling for improved performance, compatibility, and security.

---

## [2.8.1] — 2026-08-22

### Changed
- **Markdown to Word Converter (`/markdown-to-word`)**: Replaced `html-docx-js` with the `docx` library for Word document generation. The new approach parses HTML via DOM and builds native docx elements (Paragraphs, TextRuns, Tables, ExternalHyperlinks) directly, producing cleaner and more reliable .docx output. Supports headings, bold/italic/strikethrough, inline code with Courier New font and shading, code blocks with monospace background, hyperlinks, bullet and numbered lists (including nested), blockquotes with left border and indent, tables with header shading and borders, horizontal rules, and line breaks. Font family, font size, and line height settings are applied throughout the document.

---

## [2.8.0] — 2026-08-22

### Added
- **Markdown to Word Converter (`/markdown-to-word`)**: Convert Markdown documents to Word (.docx) files entirely in the browser. Features a Monaco code editor with live HTML preview in split view, a formatting toolbar with quick-insert buttons for bold, italic, lists, tables, blockquotes, code blocks, links, and images. Includes configurable DOCX export settings (font family, font size, line height), multiple export formats (.docx, .html, .md, .txt), clipboard copy, print/PDF, drag-and-drop file import, and keyboard shortcut (Ctrl+S) for instant Word download.

---

## [2.7.0] — 2026-08-22

### Added
- **Community Popularity & Firestore Telemetry (`/` homepage)**: Live community-driven ranking powered by Cloud Firestore. Each tool open increments a `tool_usage` counter (`portfolio-site-ba08a/(default)`) via `increment(1)` — homepage shows a **Most Popular** top-3 section and a subtle `· 12` grey count next to every tool. Includes real-time `onSnapshot` sync, `Popular (Community)` sort mode that reorders categories and tools by community usage, and `firestore.rules`/`firestore.indexes.json` with validated anonymous writes.
- **Firestore Feedback Backend (`SupportChaiModal`)**: Ratings and written feedback now persist to Firestore `feedback` collection (in addition to localStorage fallback) with server timestamps, tool context, and analytics events. Includes hardened `firestore.rules` validating `rating 1-5`, `comment ≤500`, and `tool ≤120`.
- **Global Tool View Tracker**: `ToolRouteTracker` auto-increments usage for any direct navigation or bookmark, ensuring accurate community counts without double-counting (2s throttle).

### Changed
- **Most Popular UI Polish**: Removed duplicate rank badge — now single orange `FaFire` pill per top-3 card. General tool cards show only a minute grey suffix (`· 1k`) instead of a pill, keeping the grid subtle.
- **Firebase Config (`firebase.json`)**: Added `firestore` section for `rules`/`indexes` and removed hardcoded hosting `site` for project-agnostic deploys.
- **Support Modal Copy**: Updated feedback footer from “Client-side” to “Stored in Firestore · Anonymous · Zero PII”.

---

## [2.6.0] — 2026-08-22

### Added
- **PDF Editor & Signer (`/pdf-editor`)**: True click-to-place signature mode — after creating or selecting a signature, a ghost preview follows your cursor so you can drop it exactly where you want instead of always landing at the top-left corner. Same click-to-place behavior for Text, Whiteout, and Highlight tools with live cursor-tracked ghost previews.
- **PDF Editor & Signer**: Saved Signatures Library — every signature you create (drawn, typed, or uploaded) is automatically saved to an on-device library so you can reuse it on future documents. Supports up to 12 saved signs with delete management. Upload multiple images at once — all get saved to the library.
- **PDF Editor & Signer**: Filename Export Popup — clicking Export now opens a clean dialog where you can preview and rename the output file before downloading. The default filename automatically appends `_signed` or `_edited` based on what was added.
- **PDF Editor & Signer**: Locked PDF Detection — uploading a password-protected PDF now shows a clear notification with a direct link to the Unlock PDF tool instead of a generic error.
- **PDF Editor & Signer**: Persistent Preferences — font size, text color, stroke color, stroke width, font family, and typed text are all saved to localStorage so your settings survive page reloads.

### Changed
- **PDF Editor & Signer**: Tool-specific cursors (crosshair for draw/whiteout, text cursor for text tool, copy cursor for signature placement) make it visually clear what will happen when you click.
- **PDF Editor & Signer**: Placement hint bar appears above the canvas when a placement tool is active, showing contextual instructions with an Esc-to-cancel reminder.
- **PDF Editor & Signer**: Signature modal now defaults to the Saved tab if you already have saved signatures, for faster reuse.
- **PDF Editor & Signer**: Drawn and typed signatures are now automatically trimmed to remove transparent padding, resulting in cleaner placement and smaller export files.

### Fixed
- **PDF Editor & Signer**: "PDF exported successfully" toast no longer appears before the file is actually ready — replaced with "PDF ready for download" shown only after successful export.

---

## [2.5.3] — 2026-08-22

### Changed
- **Video & Audio Converter (`/video-converter`)**: FFmpeg WASM binaries are now self-hosted directly from the app server instead of fetched from third-party CDNs (jsDelivr/unpkg). Binaries are copied from `node_modules` into `public/vendor/ffmpeg-core/` automatically at build time via a `prebuild` script — no CDN dependency, no CORS issues, no random stuck-at-95% hangs during WebAssembly instantiation. The loading UI now shows a clean indeterminate progress bar with stage labels instead of a misleading percent counter that froze at 95%.

---

## [2.5.2] — 2026-08-22


### Changed
- **Firebase Hosting Deploy Cache**: Removed generated Firebase hosting cache files from source tracking so deployments stay cleaner and repository updates focus on app source changes.

---

## [2.5.1] — 2026-08-22

### Changed
- **PDF Editor & Signer (`/pdf-editor`)**: Refined the tool’s naming and catalog description to use clear Rajlab Tools language throughout the PDF editing experience.

---

## [2.5.0] — 2026-08-22

### Added
- **Passport Photo Grid Studio (`/passport-grid`)**: Generate printable passport and ID photo sheets straight in your browser. Features live interactive face cropping, support for standard international dimensions (US, India, Schengen, UK, Japan, Australia, Canada, UAE), custom border styles, gap adjustments, and instant high-resolution image/PDF downloads.
- **Code Formatter Studio (`/code-formatter`)**: Multi-language code beautifier powered by Monaco Editor. Supports instant formatting, syntax validation, indent configuration (2/4 spaces or tabs), and minification across JavaScript, JSON, HTML, CSS, Markdown, Python, and SQL.
- **Text Diff Studio (`/text-diff`)**: Side-by-side and inline visual difference comparison tool with real-time character/word-level diff highlights, line numbering, change stats, and whitespace toggle.
- **HTML Entity Studio (`/html-entity`)**: Bidirectional encoder and decoder for named HTML entities, decimal, and hexadecimal codes with quick symbol insertion palettes and instant preview.
- **URL Lab & Query Analyzer (`/url-lab`)**: Complete URL inspector and visual query parameter table editor. Inspect protocols, hostnames, and paths, edit search parameters dynamically, and copy normalized clean URLs with a single click.
- **Interactive "Buy Us a Chai" Support Hub**: Floating support trigger and modal with real-time UPI QR code generation, quick support tiers (₹20, ₹50, ₹100, ₹250), custom amounts, one-click payment app deep links (GPay, PhonePe, Paytm, BHIM), and animated steaming chai visual.
- **Footer Version Badge**: Live app version display integrated directly into the footer linking seamlessly to this Changelog.

### Changed
- **Video & Audio Converter Overhaul**: Upgraded to FFmpeg WASM 0.12.10 with real-time conversion progress indicators, multi-mirror CDN fallbacks, client-side asset caching, audio extraction, resolution presets, and bitrate controls.
- **Markdown Playground (`/markdown-playground`)**: Enhanced with a full Monaco Editor workspace, formatting toolbar, table of contents auto-generator, live GitHub Flavored Markdown preview, responsive fixed-height scrolling panes, and multi-format exports (MD, styled HTML, clean TXT, PDF print).
- **Text Formatter Enhancements**: Expanded transformation options including case conversion (camelCase, PascalCase, kebab-case, snake_case, Title Case), line cleanup (trimming, deduplication, alphabetical sorting), and regex find/replace.
- **Developer Tools Polish**: Enriched Bcrypt Hashing, Color Picker, CSS Unit Converter, Lorem Ipsum Generator, and UUID Generator with richer customization presets, batch generation modes, and collapsible Developer Embed guides.

### Fixed
- **Smart 404 URL Suggestions**: Page-not-found screen now intelligently suggests matching tools based on fuzzy path matching and Levenshtein similarity to prevent dead ends.
- **Masonry Layout Overflow**: Fixed horizontal card clipping on right-side grid boundaries on medium and large desktop screens.

---

## [2.4.0] — 2026-08-22

### Added
- **Suite-Wide Developer Embed Guide & REST API**: Expanded interactive `DeveloperEmbedGuide` across all 35+ tools featuring real-time generated URLs, cURL CLI commands, HTML `<img>` & `<iframe>` tags, React JSX components, Markdown image links, and asynchronous JSON Fetch APIs.
- **Universal URL Query Parameter Execution**: URL search parameters (`?length=...`, `?token=...`, `?json=...`, `?csv=...`, `?xml=...`, `?yaml=...`, `?pattern=...`, `?ts=...`, `?val=...`, `?hex=...`) are parsed and computed immediately across Password Generator, JWT Decoder, CSV/JSON/XML/YAML Converters, Regex Tester, Timestamp Converter, CSS Unit Converter, Color Picker, and Lorem Ipsum.
- **Headless Programmatic Computation Engine (`RawResultView.jsx`)**: Added instant computation handlers returning raw calculated plaintext (`?raw=text`, `?raw=csv`, `?raw=xml`, `?raw=yaml`) and structured responses (`?raw=json`) for automated workflows, CLI queries, and third-party integrations.
- **Side-by-Side Responsive Layout**: Responsive split view on large displays (`lg` / `xl`) placing input forms side-by-side with live output panels and customizers, gracefully collapsing to stacked views on mobile.

---

## [2.3.0] — 2026-08-22

### Added
- **Advanced QR Code Customizer**: Brand center logos (Upload custom PNG/JPG/SVG + Built-in presets for UPI, GPay, PhonePe, Paytm, WhatsApp, Rajlabs, Link, WiFi).
- **Custom Outer Frames & CTA Banners**: Bottom and Top Call-to-Action banner frames (e.g. "SCAN TO PAY", "CHAT ON WHATSAPP", "SCAN ME") with customizable colors and text.
- **Pattern & Eye Styling**: Data dot shapes (Square, Rounded, Dots, Classy) and Corner Eye Shapes (Square, Rounded, Circular, Dot).
- **URL Query Parameters & Raw Image Support**: Control brand logo, pattern, and outer frame directly via `logo=...`, `dots=...`, `frame=...`, `frameText=...`, and `?raw=image`.
- **Integrated SEO Enhancements**: Dynamic client-side canonical tags, Open Graph cards, Twitter cards, and `schema.org/WebApplication` structured JSON-LD schemas.

---

## [2.2.0] — 2026-08-22

### Added
- Direct URL query parameter support across core tools (`?data=...`, `?size=...`, `?pa=...`, `?pn=...`, `?text=...`, `?mode=...`, `?count=...`) for instant output computation.
- Direct Raw Output Engine (`?raw=image`, `?raw=svg`, `?raw=json`, `?raw=text`, `?download=true`) and dedicated `/raw/:toolSlug` endpoints for embedding pure assets into other apps, websites, and markdown.
- QR Code Background & Foreground Color Customization (Standard Black-on-White, Dark Inverted BG, and Custom Color Pickers) via `theme=light|dark` and `bg=...&fg=...`.
- Interactive Developer Guide & Live Embed Code Generator on every tool page with parameter reference tables, live URLs, HTML `<iframe>`, HTML `<img>`, React JSX, and Markdown embed snippets.
- 1-Click exact GitHub source code links under each tool connecting directly to the component file in the open-source repository.
- Dedicated standalone embed route `/embed/:toolSlug` and `?embed=true` for headless widget presentation.

### Fixed
- Fixed top Flip Clock ghosting and inverted duplicate number overlap during second transitions using 3D backface clipping and bounded flap geometry.
- Made receiver name optional in UPI QR Code Generator.
- Polished category header spacing and responsive padding on the main tools grid.

---

## [2.1.0] — 2026-08-21

### Added
- Dynamic auto-sorting of tools by most used (tracked in local storage)
- Custom category reordering via drag and interact
- Direct changelog link in the footer

### Changed
- Removed the double card visual effect for a cleaner list design inside categories
- Repositioned PDF Tools to the top and Excel Tools directly under Developer Tools

---

## [2.0.0] — 2026-08-20

### Added
- Global error boundaries with auto-refresh and quick-copy stack traces
- Random, dynamic hover effects on tool cards
- Breadcrumb-style dropdowns inside tool pages to jump between related tools
- Animated mesh gradient background behind the entire app

### Changed
- Migrated homepage tool grid to a true masonry layout, eliminating empty vertical gaps
- Restored category bento grid while keeping modern wide tool cards
- Standardized all 40+ tool pages to a responsive, full-width layout
- Switched category data loading to synchronous imports for instant initial renders
- Made tool backgrounds transparent to show the mesh gradient

### Fixed
- Mesh background attachment now stays visible on long pages
- Grid items no longer artificially stretch vertically

### Other
- Updated and regenerated sitemaps

---

## [1.4.0] — 2026-02-01

### Changed
- Updated tool categories and disabled features that are not yet implemented

---

## [1.3.0] — 2025-08-23

### Added
- JWT Decoder component with byte size calculation, signature verification, and local/UTC epoch date formatting
- Auto-paste functionality for JWTs from clipboard
- Improved JWT display with table format and JSON syntax highlighting
- JSON Utilities tools suite

---

## [1.2.0] — 2024-10-15

### Added
- WhatsApp QR message generator (`#10`)

### Changed
- Major UI rewrite and optimization of core components (`#11`)
- Adjusted header sizing for better responsiveness

### Fixed
- Double WhatsApp link in JSON definitions
- Disabled tools no longer clickable in list view
- Fixed PR not deploying to live channel

---

## [1.1.0] — 2024-10-11

### Added
- Media Converter (WIP — foundational work started)
- Tools now default to category view instead of list view

### Fixed
- Disabled tools remained clickable

---

## [1.0.1] — 2024-10-09

### Changed
- Updated print rates in the Print Cost Estimator
- Hid ink cost details when not applicable

---

## [1.0.0] — 2024-10-07

### Added
- Homepage redesigned with a stagger-style category layout
- Share button in the Print Cost Estimator QR output
- Updated favicons, logos, and header font for a refreshed brand look

### Fixed
- Color print ink cost now correctly includes black ink cost
- Currency unit defaults to Indian Rupees on first load and resets properly
- Added padding when print settings panel is opened
- Removed leftover console logs

---

## [0.9.0] — 2024-10-06

### Added
- Print Cost Calculator released (`#6`) — detailed cost estimation with internal breakdown
- QR Code generator framework (`#8`)
- UPI QR Code generation inside Print Cost Estimator (`#9`)
- Currency Selector component supporting multiple currencies (sorted alphabetically)
- deepMerge utility for merging localStorage settings with new defaults
- Auto-generated sitemaps
- Print function for cost estimator output

### Changed
- Improved UPI transaction note display
- Enhanced dark mode styles for better UI visibility

### Fixed
- Print window page not auto closing
- Currency unit not updating on screen when changed

---

## [0.8.0] — 2024-10-05

### Added
- Print Cost Calculator — initial design and working prototype with internal cost breakdown
- Detailed internal cost estimator view

### Fixed
- Default settings initialization

---

## [0.7.0] — 2024-10-02

### Added
- Password Generator component
- FaKey icon for authentication-related tools
- Auto-generated meta descriptions from JSON tool definitions

---

## [0.6.0] — 2024-09-09

### Added
- Global error handler (`#1`)
- robots.txt
- Utils sitemap generator

### Changed
- Reduced JS bundle size by importing only used icons instead of the entire icon library (`#2`)
- Reduced redirect times
- Updated sitemap.xml

### Fixed
- filterTool not defined; empty categories no longer shown
- Non-working GIFs replaced
- Duplicate import of FaCog removed
- Site generator producing trailing `"` characters

---

## [0.5.0] — 2024-09-08

### Added
- Base64 Encode/Decode tool
- Bcrypt Hashing tool
- Image to Base64 Encoder and Base64 to Image Generator
- URL Encoder/Decoder
- Footer component
- Firebase Analytics integration
- Sitemap generator (Python script)
- SEO meta tags, per-tool titles, and improved descriptions
- Category icons

### Changed
- Separated router into its own file
- Dropped `/tools` sub-URI — tools now live at root paths
- Multiple UI improvements across tool pages

### Fixed
- Meta tags
- View mode not working properly
- Firebase deployment script
- Removed debug logs

---

## [0.4.0] — 2024-09-07

### Fixed
- SPA routing fix for Firebase Hosting
- Updated `firebase.json` configuration

---

## [0.3.0] — 2024-09-06

### Added
- Text Sanitize tool with router setup
- Text Formatter tool
- Theme detection based on user's OS preference (`prefers-color-scheme`)

### Changed
- Rewrote routing to properly work with hash/browser router
- Improved UI across dashboard and tool pages
- Added page titles

### Fixed
- Wrong production folder in deployment
- Site missing from Firebase deploy
- Firebase deployment issues

---

## [0.2.0] — 2024-09-06

### Added
- Main layout scaffolding
- Initial webapp structure (React + Vite)

---

## [0.1.0] — 2024-09-06

### Added
- First commit — project initialized
