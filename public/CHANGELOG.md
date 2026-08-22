# Changelog

All notable changes to **Rajlab Tools Webapp** are documented here, organized by version and date.

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
