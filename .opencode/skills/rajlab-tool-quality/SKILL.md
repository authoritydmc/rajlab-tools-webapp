---
name: rajlab-tool-quality
description: Make any Rajlab Tools webapp tool feature-rich with UX excellence. Use when creating or enhancing any tool at rajlab-tools-webapp — for case transforms, editors, previews, QR/PDF/JSON utilities, or any client-side tool — to apply UX standards for mobile, scroll/pane heights, header controls, exports, and polish.
license: MIT
metadata:
  author: rajlabs
  version: "1.0.0"
  stack: React 18 + Vite 5 + Tailwind 3 + Monaco + marked + Firebase Hosting
---

# Rajlab Tool Quality — Feature-Rich Tool Skill

You are enhancing a tool in **rajlab-tools-webapp** (`src/components/**/`, `src/toolCategories.json`, `src/utils/toolRegistry.js`, `src/routers.jsx`).
Every tool is **100% client-side** (no uploads), lives at a root path (`/tool-slug`), and must feel premium on **mobile first**, then desktop.

## Iron Rules (non-negotiable)

1. **100% client-side.** Never send user data to a server. Use browser APIs / WASM (`pdf-lib`, `@ffmpeg/ffmpeg`, `crypto-js`, `marked`, `papaparse`, etc.). If a transform can't be done locally, propose but don't add server dependency.
2. **Single source of truth.** Tool metadata only in `src/toolCategories.json` (name/link/icon/description) and `src/utils/toolRegistry.js` (title/sourceFile/category/queryParams). Never duplicate lists.
3. **Lazy + small bundles.** Every tool `React.lazy` + `Suspense` in `src/routers.jsx`. Tree-shake `react-icons` (import specific icon, not `*`). No heavy dep without justification + `npm run build` size check.
4. **Fixed-height scrollable panes, not page growth.** See Scroll Contract below. Non-fullscreen must behave like fullscreen — content scrolls *inside* panes.
5. **Mobile-first touch targets.** Minimum 32-44px tappable area, `gap-1.5`+, text never <12px for controls, toolbar must be swipeable.
6. **No silent breaking renames.** If you rename a tool slug (e.g. `markdown-preview` → `markdown-playground`), rename the file, update `toolCategories.json`, `toolRegistry.js`, `routers.jsx`, `DirectEmbedView.jsx` map, sitemap (`python3 generateSiteMap.py -f src/routers.jsx`), and README catalog. If old URL must die, do not keep alias unless explicitly requested.
7. **Exports are real features, not afterthoughts.** Every transform/preview tool must offer Copy + Download (`.md`/`.html`/`.txt`/`.json`) and Print/PDF where meaningful — 100% client-side `Blob`/`window.print` via `buildStyledHtml`.

---

## UX Contract — What "Feature-Rich" Means

### A. Capability not toy
- A formatter with 5 buttons (upper/lower/capitalize/trim/reverse) is a *demo*, not a tool. Ship **dozens** of meaningful transforms grouped logically:
  - *Examples:* Text Formatter: `UPPER/lower/Title/Sentence/tOGGLE/Alternating/snake/kebab/camel/Pascal/CONSTANT/dot/slugify` + Clean (trim/collapse/empty/dedup/accents/punctuation) + Lines (sort/reverse/shuffle/reverseWords/addLineNumbers/duplicate) + Extract (emails/urls) + Find/Replace (plain+regex) + Prefix/Suffix.
  - Markdown Playground: Monaco + header H1-H6 controls + TOC + stats + drag/drop + file import + URL `?text=` prefill + 5 export formats.
- Each button must have a `title` (tooltip) and toast feedback (`Copied!`/`Applied!`). Never use "Copied" feedback for mere state changes (e.g. changing preview size).

### B. Scroll Contract — Fixed Height, Internal Scrollbars
- **Never let pane content grow the page.** The page should not get taller as user types more lines.
- **Non-fullscreen = fullscreen behavior.** Fullscreen uses `calc(100vh-140px)` fixed height with internal scroll — non-fullscreen must mirror it with a fixed height grid, not `flex-1` that expands.
- **Pattern (Markdown Playground reference):**
  ```jsx
  // Outer card: w-full rounded-2xl border overflow-hidden flex flex-col
  // Toolbar: flex-col gap-2 px-3 py-3 border-b (no flex)
  // Panes grid: grid shrink-0 h-[560px] sm:h-[620px] lg:h-[660px] overflow-hidden
  //   - grid-cols-1 lg:grid-cols-2 when split, else grid-cols-1
  //   - fullscreen: !h-[calc(100vh-140px)]
  // Editor pane: flex flex-col min-h-0 overflow-hidden -> div flex-1 min-h-0 overflow-hidden -> <Editor height="100%" />
  // Preview pane: flex flex-col min-h-0 overflow-hidden -> div flex-1 overflow-y-auto overscroll-contain -> prose p-4
  ```
- **Textarea fallback:** `h-[340px] sm:h-[380px] overflow-y-auto resize-none` inside flex columns, not `h-36`.
- **Mobile:** Split hidden on `<1024px` (`isMobile` state), default `viewMode='edit'` on mobile, `split` on desktop. Use `window.innerWidth` check + resize listener.

### C. Mobile Experience — Think Thumb, Not Mouse
- **Default view on mobile is single-pane.** Detect `window.innerWidth < 1024` → `edit`, hide `Split` tab (`hidden lg:inline-flex` or conditional array). On resize `split` → auto-switch to `edit`.
- **Toolbar is swipeable, not wrapping into 3 rows.** Use `flex flex-nowrap overflow-x-auto scrollbar-thin pb-1` for header controls + format groups. Each button `w-8 h-8` minimum, `gap-1`, `flex-1 min-w-0` on container. Test on 360px viewport.
- **Touch-friendly file & export row:** Wrap on mobile (`flex-wrap`) but keep primary actions (`Copy`, `Download .md/.html`) reachable without horizontal scroll. Use `min-w-[180px]` for filename input, not `flex-1` that collapses.
- **No hover-only affordances.** Favorite star, header dropdown, and preview copy must be tappable (no `group-hover:opacity-0` that hides on touch). Provide `onClick` fallback for hover menus.
- **Monaco on mobile:** `fontSize:13`, `wordWrap:'on'`, `minimap:false`, `scrollBeyondLastLine:false`, padding `top:12 bottom:12`. Ensure editor height is `100%` of fixed pane, not `auto`.
- **Preview readability:** `prose prose-sm max-w-none p-4` with `max-h` on TOC (`max-h-36 overflow-auto`), not full-height TOC that pushes preview down. Images `max-width:100% rounded` inside scroll container.

### D. Header Controls — Cursor-Aware, Not Insert-Only
- **Header level is cursor-aware.** Track `editor.getPosition()` → `getLineContent` → `^(#{1,6})\s` → `activeHeaderLevel`. Show current level label (`H2 • Section` vs `Paragraph`).
- **H1-H3 quick buttons + dropdown for H4-H6/Paragraph.** Dropdown `w-64 rounded-xl border shadow-2xl` with `level 0-6` options, each shows `preview` + `Ctrl+1…6` hint. Keyboard shortcuts: `CtrlCmd+Digit1…6` → `setHeading(lv)`, `CtrlCmd+Digit0` → paragraph.
- **Insert-at-cursor vs line-prefix:** Use `executeEdits` with `range` for line-level (header, list, quote) and `getSelection` + `getValueInRange` for wrap (bold `**`, italic `*`, code `` ` ``). Always `focus()` after.

### E. Chrome Polish
- **Stats bar:** Live `words/chars/noSpaces/lines/sentences/paras/~min` (`text.trim().split(/\s+/).filter(Boolean).length`, `reading=Math.ceil(words/200)`). Keep in header `text-xs`, `gap-3`, hide secondary on `sm`.
- **ToC:** Off by default (`showToc=false`), checkbox toggle, `max-h-36 overflow-auto`, `padding-left: (depth-1)*10px`, click scrolls via `querySelector('#id').scrollIntoView({behavior:'smooth'})`. Slugify must be robust: `String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,'-')` — never `text.toLowerCase()` directly (marked token may be object).
- **File handling:** Drag & drop `.md/.txt` anywhere on card (`onDragOver/onDrop` + `ring-2`), file input `accept=.md,.txt,.html`, size guard `>2MB`, toast on load. URL `?text=` / `?md=` prefill via `useSearchParams`.
- **Exports:** `downloadBlob(content, filename, mime)` via `URL.createObjectURL`; styled HTML via `buildStyledHtml(innerHtml,title)` with inline prose CSS + footer attribution + `new Date().toLocaleString()`; PDF via `window.open('', '_blank').document.write(html); print();` with popup-blocked toast.
- **Masonry/home grid:** Use `Masonry className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding"` — not `gap-4` which clips right edge. Container `max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10`.

### F. 404 & Discovery
- **`src/errorHandler.jsx` must suggest.** Compute Levenshtein + substring bonus over `TOOL_REGISTRY` keys; show top 3 clickable cards with icon (`getIconByName`), title, `link • category`, `FaArrowRight`. Show `Attempted: {location.pathname}`. Keep Harry Potter flavor but add suggestion block `Did you mean?`. Special-case old slugs (e.g. `markdown-preview` → `markdown-playground`).

### G. Third-Party Minimalism
- Prefer browser APIs. When you must use a dep, keep it one: `marked` for markdown, `pdf-lib` for PDF, `monaco` for code, `papaparse` for CSV. Never add `html2canvas`/`jspdf`/`prism` unless needed. For `marked` heading renderer, handle both APIs: legacy `(text,level,raw)` and token-object `{depth,text,raw,tokens}` — check `typeof arg1==='object' && 'depth' in arg1` and use `this.parser.parseInline(token.tokens)` for inner.

---

## Workflow — Enhancing Any Tool

1. **Read** `src/components/<domain>/<tool>.jsx`, `toolCategories.json`, `toolRegistry.js`, `routers.jsx`.
2. **Design grouped transforms** (case/clean/lines/extract etc.) — list all planned buttons before coding.
3. **Implement fixed-height panes** per Scroll Contract. Verify: typing 500 lines does NOT grow page height; scrollbars appear inside panes on both fullscreen and non-fullscreen.
4. **Implement mobile:** `isMobile` state, hide split on `<1024`, horizontal toolbar scroll, touch targets. Test at 360, 768, 1024, 1440.
5. **Wire header/stats/exports/file/URL params.** Ensure `slugify` is `String(v)`, heading renderer is dual-API.
6. **Regenerate sitemap** if routes change: `python3 generateSiteMap.py -f src/routers.jsx`.
7. **Build** `npm run build` must pass. Check bundled chunk size.
8. **Commit** with scope: `feat(text-formatter): ...` / `fix(markdown): ...` and push. Never keep old slug alias unless requested.

## Self-Check Before Push

- [ ] Mobile 360: toolbar swipeable, single pane default, fixed height scroll works, no page growth
- [ ] Desktop split: both panes 660px fixed, independent scroll, fullscreen calc matches
- [ ] Header controls cursor-aware, Ctrl+1..6 works, dropdown shows active ●
- [ ] TOC off by default, slugify handles non-string, heading renderer dual-API
- [ ] Exports: Copy + Download `.md`/`.html`/`.txt` + PDF print, filename from H1
- [ ] Drag & drop + file import + `?text=` prefill
- [ ] `npm run build` passes, sitemap regenerated if needed, no `text.toLowerCase` crash
- [ ] 404 shows 3 clickable suggestions, attempted path visible

## References

- Example excellence: `src/components/markdown/MarkdownPlayground.jsx` (fixed-height, header controls, stats, exports, mobile)
- Example excellence: `src/components/text-formatter/text-formatter.jsx` (25+ grouped transforms, find/replace, prefix/suffix)
- Home grid fix: `src/components/MainToolPage.jsx` masonry `-ml-4/pl-4`
- 404 fix: `src/errorHandler.jsx` levenshtein
