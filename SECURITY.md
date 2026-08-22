# Security Policy

## Overview

**Rajlab Tools Webapp** (`utility.rajlabs.in`) is a **100% client-side** application. All transformations — hashing, PDF merge/split/unlock, Excel unlock, image compression, video conversion, QR generation — run in the browser via WASM / browser APIs. No user files or inputs are uploaded to a server.

This does not mean the attack surface is zero. Client-side XSS, insecure dependencies, and Firebase Hosting misconfigurations are in scope.

---

## Supported Versions

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| Any deployed preview channel | ✅ (for the lifetime of the PR) |
| Older tags / forks | ❌ — please update to `main` |

We deploy from `main` on every merge (see `.github/workflows/firebase-hosting-merge.yml:1`).

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security reports.**

Email **raj@rajlabs.in** with:

- A clear description of the vulnerability and its impact
- Steps to reproduce (URL, payload, browser, OS)
- Whether user data or privacy is affected (remember: we store only `localStorage` preferences)
- Your suggested fix, if any
- Your contact preference for follow-ups

You can also report via GitHub's **Private vulnerability reporting** (Security → Report a vulnerability) if you prefer not to use email.

### What to expect

- **Acknowledgement** within **48 hours**
- **Triage & initial assessment** within **5 business days**
- **Fix timeline:** critical issues (XSS, data exfiltration) patched within **7 days** on `main` and deployed to Firebase Hosting; lower-severity issues in the next regular release
- **Credit:** we will credit you in the fix PR / `CHANGELOG.md` unless you ask to remain anonymous

Please give us reasonable time to fix before any public disclosure (we follow a 90-day disclosure window or sooner by mutual agreement).

---

## Scope

### In scope

- Stored / reflected XSS via any tool input (`?text=`, `?data=`, file names, JSON/XML/YAML content, etc.)
- PDF / Excel / image / video parsing that leads to code execution or data exfiltration
- `RawResultView` (`/raw/:toolSlug`, `?raw=`) returning unintended content types or leaking data
- Dependency vulnerabilities with reachable exploit paths (`npm audit`, `pdf-lib`, `jszip`, `@ffmpeg/ffmpeg`, `crypto-js`, etc.)
- Firebase Hosting / GitHub Actions misconfiguration leading to unauthorized deploys or secret exposure
- `localStorage` / `favoritesContext.jsx` / `themeContext.jsx` misuse that leaks data across origins

### Out of scope

- Social engineering, physical access, or browser / OS vulnerabilities
- Denial-of-service via large file uploads (client-side only; the browser enforces limits)
- Reports that require a user to paste untrusted content into a tool and then claim XSS (we treat paste as explicit user action; focus on *unexpected* execution)
- Theoretical issues without a reproducible proof-of-concept on `main`

---

## Secure Development Practices

- **No server-side processing** — user data never leaves the browser; see `src/MainLayout.jsx:109` footer statement and `README.md`
- **Dependencies pinned** via `package-lock.json`; review `npm audit` before releases
- **ESLint 9** enforced in CI (`eslint.config.js:1`)
- **Firebase Hosting** SPA rewrite (`firebase.json:10`) — no directory listing, no server logs of user content
- **Secrets:** `src/firebaseConfig.json` is git-ignored (`.gitignore:25`) and injected only in CI from `secrets.FIREBASE_API_CONFIG`

---

## After a Fix

- A patch PR will be opened against `main` and deployed via the normal Firebase Hosting workflow
- `public/CHANGELOG.md` will document the fix (without exploit details until disclosure)
- If the issue affects a deployed version, we will deploy immediately — no waiting for the next feature release

---

*Thank you for helping keep Rajlab Tools safe for everyone.*
