# Agent Guidelines & Development Rules

This document outlines mandatory protocols and guidelines for all AI agents, assistants, and developers contributing to **Rajlab Tools Webapp**.

---

## 🚨 1. Mandatory Changelog Updates

> **CRITICAL RULE**: Every feature addition, bug fix, tool overhaul, UI polish, or notable enhancement **MUST ALWAYS** be recorded in `public/CHANGELOG.md`.

Whenever you complete a task:
1. **Update `public/CHANGELOG.md`** with the new changes under the appropriate version section (or create a new version section if bumping).
2. **Ensure `package.json` version** is synchronized with the latest version in `public/CHANGELOG.md`.
3. **The app footer** (`src/MainLayout.jsx`) reads from `package.json` to display the active version badge (`vX.Y.Z`) linking directly to `/changelog`.

---

## ✍️ 2. Changelog Tone & Style Guide

All changelog entries **must be written in a public-facing, user-friendly tone**:

- **Audience**: End-users, web designers, and developers utilizing the utilities.
- **Tone**: Professional, encouraging, clear, and benefit-oriented. Focus on what users can achieve and the value delivered.
- **Avoid**: Raw internal commit hashes, git shorthand, cryptic variable names, or uncontextualized developer jargon.
- **Organization**: Use standard Keep a Changelog categories:
  - `### Added`: For new tools, features, URL query parameter capabilities, export formats, or UI additions.
  - `### Changed`: For enhancements, refactors, dependency updates, or UI/UX redesigns.
  - `### Fixed`: For bug fixes, layout clipping issues, browser compatibility corrections, or error handling.
  - `### Performance`: For speed improvements, bundle optimizations, or memory savings.
- **Entry Format**:
  - Start with a bold feature title and tool path in backticks:
    ```markdown
    - **Passport Photo Grid Studio (`/passport-grid`)**: Generate printable passport and ID photo sheets straight in your browser with live interactive cropping and standard international dimensions.
    ```

---

## 🛠️ 3. Semantic Versioning & Release Checklist

Follow [Semantic Versioning (SemVer)](https://semver.org/):
- **MAJOR (`X.0.0`)**: Breaking changes, massive redesigns, or foundational platform architectural shifts.
- **MINOR (`0.X.0`)**: New tools, new major features, or significant feature-rich upgrades.
- **PATCH (`0.0.X`)**: Bug fixes, minor UI tweaks, typo fixes, or small optimizations.

### Quick Release Checklist
- [ ] Added entry to `public/CHANGELOG.md` under `## [X.Y.Z] — YYYY-MM-DD`.
- [ ] Updated `"version": "X.Y.Z"` in `package.json`.
- [ ] Verified build passing (`npm run build`).

---

## 💡 4. Tool Development Standards

When creating or modifying tools:
1. **100% Client-Side**: All computation, hashing, conversion, and rendering must execute strictly in the user's browser without sending sensitive data to external servers.
2. **Dark Mode & Responsive UI**: Must look elegant in both light and dark modes, and adapt seamlessly across mobile, tablet, and desktop viewports.
3. **Breadcrumbs & Registry**: Include `Breadcrumbs` at the top and register new tools in `src/toolCategories.json` and `src/utils/toolRegistry.js`.
4. **Interactive Controls & Embeds**: Provide rich inputs, copy buttons, live previews, and embed capabilities where applicable.
