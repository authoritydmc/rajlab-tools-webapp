# Contributing to Rajlab Tools Webapp

Thanks for considering a contribution! This guide is tailored to this codebase — React + Vite + Tailwind, `toolCategories.json`-driven, Firebase-hosted.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Adding a New Tool (5-Step Checklist)](#adding-a-new-tool-5-step-checklist)
- [Project Conventions](#project-conventions)
- [Commit Messages](#commit-messages)
- [Pull Request Checklist](#pull-request-checklist)
- [Reporting Bugs & Requesting Tools](#reporting-bugs--requesting-tools)
- [License](#license)

---

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating you agree to uphold it. Report issues to `raj@rajlabs.in`.

---

## Getting Started

### Prerequisites

- Node.js **18+** and npm **9+**
- Git
- Optional: Firebase CLI (`npm i -g firebase-tools`) for manual deploys
- Optional: Python 3 for `generateSiteMap.py`

### Setup

```bash
git clone https://github.com/authoritydmc/rajlab-tools-webapp.git
cd rajlab-tools-webapp
npm ci
npm run dev        # http://localhost:5173
```

`src/firebaseConfig.json` is git-ignored. The app runs without it (analytics disabled). In CI it is injected from `secrets.FIREBASE_API_CONFIG` — see `.github/workflows/firebase-hosting-merge.yml:20`.

### Useful Commands

```bash
npm run dev        # dev server + HMR
npm run build      # production build → dist/
npm run preview    # preview prod build
npm run lint       # ESLint 9 across the codebase
python3 generateSiteMap.py -f src/routers.jsx  # regenerate sitemaps
```

---

## How to Contribute

1. **Find or open an issue** — check existing issues first. For new tools, open a feature request describing the use case and whether it can be fully client-side (this project avoids server-side processing).
2. **Fork & branch:**
   ```bash
   git checkout -b feat/my-tool
   # or fix/bug-description, docs/readme-update, chore/deps-update
   ```
3. **Make changes** (see checklist below).
4. **Test locally:** `npm run lint && npm run build`, manual QA in Chrome + Firefox, mobile viewport, and dark/light themes.
5. **Commit** with [Conventional Commits](#commit-messages).
6. **Push and open a PR** — fill out the template at `.github/PULL_REQUEST_TEMPLATE.md`.

> Keep PRs focused. One tool / one fix per PR makes review fast.

---

## Adding a New Tool (5-Step Checklist)

Every tool in this app follows the same contract. Example: adding **"Case Converter"** at `/case-converter`.

### 1. Create the component

```
src/components/case/CaseConverter.jsx
```

Guidelines:
- Use `ToolPageLayout` (`src/components/common/ToolPageLayout.jsx:1`) for consistent header, SEO, and `DeveloperEmbedGuide` integration.
- Support **URL query params** for instant compute (e.g., `?text=hello&mode=upper`). Parse via `useSearchParams()` from `react-router-dom`.
- Support **raw output** if meaningful: check `searchParams.get('raw')` — return plain text/JSON when `?raw=text` or `?raw=json` is set. See `src/components/embeds/RawResultView.jsx:1` and `src/MainLayout.jsx:11` for the chrome-stripping pattern.
- All logic must be **client-side**. Prefer browser APIs / WASM (`pdf-lib`, `@ffmpeg/ffmpeg`, `crypto-js`, etc.). Never send user data to a server.
- Handle large inputs gracefully (progress indicators, `try/catch`, user-friendly errors via `GlobalError`).

Minimal skeleton:

```jsx
import ToolPageLayout from '../common/ToolPageLayout';
import { useSearchParams } from 'react-router-dom';

export default function CaseConverter() {
  const [searchParams] = useSearchParams();
  const initialText = searchParams.get('text') ?? '';
  // ... state + conversion logic ...

  // If ?raw=text is requested, RawResultView or inline check returns plain text
  return (
    <ToolPageLayout
      title="Case Converter"
      description="Convert text between upper, lower, title case — 100% client-side."
      toolSlug="case-converter"
    >
      {/* your UI */}
    </ToolPageLayout>
  );
}
```

### 2. Register in `toolCategories.json`

Add an entry to the appropriate category in `src/toolCategories.json:1`:

```json
{
  "name": "Case Converter",
  "link": "/case-converter",
  "iconName": "FaTextHeight",
  "isEnabled": true,
  "description": "Convert text between upper, lower, title, and sentence case."
}
```

- `link` must match the router path (without domain).
- `iconName` must be a valid export from `react-icons/fa` (or the relevant pack). Import it where you use it — don't import the whole library.
- `isEnabled: false` hides the tool from the grid (useful for WIP).

### 3. Add a lazy route in `routers.jsx`

In `src/routers.jsx:18`:

```js
const CaseConverter = lazy(() => import('./components/case/CaseConverter'));
// ...
{ path: "case-converter", element: <S fallback={<Loading />}><CaseConverter /></S> },
```

Keep the import **lazy** — every tool is code-split.

### 4. Wire Developer Embed Guide (if applicable)

If your tool has meaningful query params / raw output, pass `toolSlug` and param docs to `DeveloperEmbedGuide` inside `ToolPageLayout`. See `src/components/common/DeveloperEmbedGuide.jsx` for the prop contract. This auto-generates cURL / `<iframe>` / `<img>` / React / Markdown snippets.

### 5. Update sitemaps & docs

```bash
python3 generateSiteMap.py -f src/routers.jsx
```

- Test `?raw=` and `/raw/:toolSlug` and `/embed/:toolSlug` variants.
- Update `README.md` Tool Catalog table if needed.
- Add an entry to `public/CHANGELOG.md` under `## [Unreleased]`.

---

## Project Conventions

### File & Naming

- Components: `PascalCase.jsx` (e.g., `QRScanner.jsx`), folders kebab or domain-based (`qrCodes/`, `pdf-tools/`).
- Routes: kebab-case, no `/tools` prefix (`/qr-code-generator`, not `/tools/qr-code-generator`).
- One component per file; colocate helpers in `src/utils/`.

### Styling

- **Tailwind CSS 3** only — no CSS modules or styled-components. Use the mesh/glass utilities from `src/index.css`.
- Support both themes: test with `prefers-color-scheme` and the manual toggle in `themeContext.jsx`. Use `isDarkMode` from `useTheme()` for conditional classes.
- Responsive: mobile-first, check `sm` / `lg` / `xl` breakpoints (split side-by-side on `lg+`, stacked on mobile).

### React & Performance

- Lazy-load every tool route (`React.lazy` + `Suspense`) — see `routers.jsx:58`.
- Tree-shake `react-icons` (import `FaQrcode` from `react-icons/fa`, not `*`).
- Avoid adding heavy dependencies without discussion — prefer browser APIs. If you add one, justify bundle impact (`npm run build` → check `dist/` size).

### Linting

- ESLint 9 is enforced (`eslint.config.js:1`). Run `npm run lint` before pushing. CI will fail on lint errors.
- No `console.log` in committed code (use `logView.jsx` or remove before PR).

### Data Contract

- `toolCategories.json` is the single source of truth. Do not duplicate tool lists elsewhere.
- `localStorage` keys for favorites/most-used are managed in `favoritesContext.jsx` — don't introduce new storage keys without namespacing (`rajlab_*`).

### Accessibility & UX

- All interactive elements must be keyboard-accessible and have visible focus states.
- Provide empty states, loading states, and copy-feedback (see `react-hot-toast` usage).
- Validate file inputs (size, type) before processing — especially for PDF/Excel/video tools.

---

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(tools): add case converter with raw text output
fix(qr): correct bg/fg color swap in dark mode
docs(readme): update embed API examples
chore(deps): bump pdf-lib to 1.17.1
```

Scopes: `tools`, `qr`, `pdf`, `json`, `ui`, `router`, `deps`, `docs`, `ci`, etc.

---

## Pull Request Checklist

Before requesting review:

- [ ] `npm run lint` passes with no warnings
- [ ] `npm run build` succeeds
- [ ] Tested manually: desktop + mobile, light + dark theme
- [ ] Tested `?raw=` / `/raw/` and `/embed/` variants if applicable
- [ ] `toolCategories.json` entry added (or intentionally omitted for hidden tools)
- [ ] No secrets committed (`src/firebaseConfig.json` stays git-ignored)
- [ ] Sitemaps regenerated if routes changed (`generateSiteMap.py`)
- [ ] Screenshots / screen recording attached for UI changes
- [ ] `CHANGELOG.md` updated (Unreleased section)

PR template: `.github/PULL_REQUEST_TEMPLATE.md`.

---

## Reporting Bugs & Requesting Tools

- **Bug:** use the Bug Report issue template. Include route, repro steps, expected vs actual, browser + OS, and console errors.
- **Tool request:** use the Feature Request template. Describe the tool, why it should be client-side, and any prior art.
- **Security:** do **not** open a public issue — email `raj@rajlabs.in` per [SECURITY.md](SECURITY.md).

---

## License

By contributing you agree that your contributions will be licensed under the same [GPL-3.0](LICENSE) license that covers this project. See `LICENSE` for the full text.

---

*Questions? Open a discussion or reach out at [rajlabs.in](https://rajlabs.in).*
