import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import {
  FaMarkdown, FaClipboard, FaTrash, FaUpload, FaCopy, FaLink, FaImage, FaListUl, FaListOl,
  FaQuoteLeft, FaCode, FaTable, FaMinus, FaCheckSquare, FaHeading, FaBold, FaItalic, FaStrikethrough,
  FaEye, FaEdit, FaColumns, FaFileAlt, FaFileCode, FaFilePdf, FaExpand, FaCompress, FaChevronDown
} from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';
import Editor from '@monaco-editor/react';
import { marked } from 'marked';

const DEFAULT_MD = `# Hello World

This is a **markdown** preview tool — now supercharged.

## Features
- **Bold**, *italic*, ~~strikethrough~~, \`inline code\`
- [Links](https://example.com) and ![Images](https://images.unsplash.com/photo-1787238347889-be19be24c8f5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)
- > Blockquotes with citations
- Ordered & unordered lists
- Task lists:
  - [x] Task 1
  - [ ] Task 2

### Code Example
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

### Table
| Name | Role | Age |
|------|------|-----|
| John | Dev  | 30  |
| Jane | Designer | 25 |

---

> Tip: Try the headers control (H1-H6 / Paragraph) or drag & drop a \`.md\` file.

## Second Section
Lorem ipsum dolor sit amet, consectetur adipiscing elit.

### Subsection
More content here to demo Table of Contents auto-generation.

#### Level 4
##### Level 5
###### Level 6 — finest detail
`;

function downloadBlob(content, filename, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildStyledHtml(innerHtml, title = 'Markdown Export') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>
  body{font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 24px; line-height: 1.75; color: #1e293b; background:#ffffff}
  h1{font-size:2.1em; border-bottom:1px solid #e2e8f0; padding-bottom:0.35em}
  h2{font-size:1.6em; border-bottom:1px solid #f1f5f9; padding-bottom:0.3em}
  h3{font-size:1.3em} h4{font-size:1.1em; color:#334155} h5,h6{color:#64748b}
  h1,h2,h3,h4{line-height:1.25; margin-top:2em; scroll-margin-top:20px}
  pre{background:#0f172a; color:#e2e8f0; padding:16px; border-radius:10px; overflow:auto}
  code{background: #f1f5f9; padding:0.15em 0.35em; border-radius:4px; font-size:0.9em}
  pre code{background:transparent; padding:0}
  blockquote{border-left:4px solid #6366f1; margin:1em 0; padding:0.5em 1em; background:#f8fafc; color:#475569}
  table{width:100%; border-collapse:collapse; margin:1em 0}
  th,td{border:1px solid #e2e8f0; padding:8px 12px; text-align:left}
  th{background:#f1f5f9}
  img{max-width:100%; border-radius:8px}
  hr{border:none; border-top:1px solid #e2e8f0; margin:2em 0}
  a{color:#4f46e5; text-decoration:none} a:hover{text-decoration:underline}
</style>
</head>
<body>
${innerHtml}
<hr style="margin-top:40px" />
<p style="font-size:12px; color:#94a3b8">Exported from <a href="https://utility.rajlabs.in/markdown-playground">Rajlabs Markdown Playground</a> — ${new Date().toLocaleString()}</p>
</body>
</html>`;
}

function stripMarkdownToText(md) {
  const html = marked.parse(md || '');
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\n{3,}/g, '\n\n').trim();
}

function slugify(v) {
  return String(v ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function MarkdownPlayground() {
  const siblings = useCategorySiblings('/markdown-playground');
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const initialFromUrl = searchParams.get('text') || searchParams.get('md') || searchParams.get('content') || '';
  const [input, setInput] = useState(initialFromUrl || DEFAULT_MD);
  const [html, setHtml] = useState('');
  const [viewMode, setViewMode] = useState('split'); // split | edit | preview
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [docTitle, setDocTitle] = useState('document');
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [activeHeaderLevel, setActiveHeaderLevel] = useState(0);
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    document.title = 'Markdown Playground | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  useEffect(() => {
    if (initialFromUrl && initialFromUrl !== input) setInput(initialFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Local renderer — handles both legacy (text,level,raw) and new token-object API (marked >=12)
    // Keeps third-party usage minimal: only `marked`, no extra deps
    const renderer = new marked.Renderer();
    renderer.heading = function (arg1, arg2, arg3) {
      if (arg1 && typeof arg1 === 'object' && 'depth' in arg1) {
        const token = arg1;
        const level = token.depth;
        const raw = token.raw || token.text || '';
        const id = slugify(String(raw).replace(/^#{1,6}\s+/, ''));
        const inner = token.tokens ? this.parser.parseInline(token.tokens) : String(token.text || '');
        return `<h${level} id="${id}">${inner} <a href="#${id}" style="opacity:0.25; text-decoration:none; font-weight:400; margin-left:6px">#</a></h${level}>`;
      }
      const text = arg1;
      const level = arg2;
      const raw = arg3;
      const id = slugify(String(raw || text).replace(/^#{1,6}\s+/, ''));
      return `<h${level} id="${id}">${String(text)} <a href="#${id}" style="opacity:0.25; text-decoration:none; font-weight:400; margin-left:6px">#</a></h${level}>`;
    };
    try {
      const htmlWithIds = marked.parse(input || '', { gfm: true, breaks: true, headerIds: false, renderer });
      setHtml(htmlWithIds);
    } catch {
      setHtml(marked.parse(input || '', { gfm: true, breaks: true }));
    }
  }, [input]);

  useEffect(() => {
    // derive docTitle from first H1 or fallback
    const m = input.match(/^#\s+(.+)/m);
    if (m) setDocTitle(slugify(m[1]).slice(0, 40) || 'document');
  }, [input]);

  const stats = useMemo(() => {
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).filter(Boolean).length : 0;
    const lines = input ? input.split('\n').length : 0;
    const reading = Math.max(1, Math.ceil(words / 200));
    return { chars, words, lines, reading };
  }, [input]);

  const toc = useMemo(() => {
    const tokens = marked.lexer(input || '');
    const headings = tokens.filter(t => t.type === 'heading');
    return headings.map(h => ({
      depth: h.depth,
      text: h.text,
      id: slugify(h.text),
    }));
  }, [input]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    // track header level at cursor
    const updateHeader = () => {
      try {
        const pos = editor.getPosition();
        if (!pos) return;
        const line = editor.getModel().getLineContent(pos.lineNumber);
        const m = line.match(/^(#{1,6})\s/);
        setActiveHeaderLevel(m ? m[1].length : 0);
      } catch { /* ignore */ }
    };
    updateHeader();
    editor.onDidChangeCursorPosition(updateHeader);
    editor.onDidChangeModelContent(updateHeader);
    // keyboard shortcuts for headers: Ctrl+1..6
    for (let lv = 1; lv <= 6; lv++) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode[`Digit${lv}`], () => setHeading(lv));
    }
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0, () => setHeading(0));
  };

  // close header dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (headerRef.current && !headerRef.current.contains(e.target)) setHeaderDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const insertAtCursor = (before, after = '', placeholder = '') => {
    const editor = editorRef.current;
    if (!editor) {
      setInput(prev => prev + `\n${before}${placeholder}${after}`);
      return;
    }
    const sel = editor.getSelection();
    const selected = editor.getModel().getValueInRange(sel);
    const text = selected || placeholder;
    const newText = `${before}${text}${after}`;
    editor.executeEdits('insert', [{ range: sel, text: newText, forceMoveMarkers: true }]);
    editor.focus();
  };

  const insertLinePrefix = (prefix) => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = editor.getSelection();
    const startLine = sel.startLineNumber;
    const endLine = sel.endLineNumber;
    const model = editor.getModel();
    const edits = [];
    for (let ln = startLine; ln <= endLine; ln++) {
      const lineContent = model.getLineContent(ln);
      if (lineContent.startsWith(prefix)) continue;
      edits.push({ range: { startLineNumber: ln, startColumn: 1, endLineNumber: ln, endColumn: 1 }, text: prefix, forceMoveMarkers: true });
    }
    if (edits.length) editor.executeEdits('line-prefix', edits);
    editor.focus();
  };

  const setHeading = (level) => {
    const editor = editorRef.current;
    if (!editor) return;
    const pos = editor.getPosition();
    const ln = pos.lineNumber;
    const model = editor.getModel();
    const lineContent = model.getLineContent(ln);
    const stripped = lineContent.replace(/^#{1,6}\s+/, '').replace(/^\s+/, '');
    const newText = level === 0 ? stripped : `${'#'.repeat(level)} ${stripped || `Heading ${level}`}`;
    const range = { startLineNumber: ln, startColumn: 1, endLineNumber: ln, endColumn: lineContent.length + 1 };
    editor.executeEdits('header', [{ range, text: newText }]);
    editor.setPosition({ lineNumber: ln, column: newText.length + 1 });
    editor.focus();
    setActiveHeaderLevel(level);
    setHeaderDropdownOpen(false);
  };

  const headerOptions = [
    { level: 0, label: 'Paragraph', preview: 'Normal text', style: 'text-xs font-normal' },
    { level: 1, label: 'Heading 1', preview: 'H1 — Title', style: 'text-lg font-extrabold' },
    { level: 2, label: 'Heading 2', preview: 'H2 — Section', style: 'text-base font-bold' },
    { level: 3, label: 'Heading 3', preview: 'H3 — Subsection', style: 'text-sm font-bold' },
    { level: 4, label: 'Heading 4', preview: 'H4', style: 'text-sm font-semibold' },
    { level: 5, label: 'Heading 5', preview: 'H5', style: 'text-xs font-semibold' },
    { level: 6, label: 'Heading 6', preview: 'H6', style: 'text-xs font-medium opacity-80' },
  ];

  const toolbarGroups = [
    {
      name: 'Format',
      items: [
        { icon: <FaBold />, label: 'Bold', title: 'Bold (Ctrl+B)', action: () => insertAtCursor('**', '**', 'bold') },
        { icon: <FaItalic />, label: 'Italic', title: 'Italic (Ctrl+I)', action: () => insertAtCursor('*', '*', 'italic') },
        { icon: <FaStrikethrough />, label: 'Strike', title: 'Strikethrough', action: () => insertAtCursor('~~', '~~', 'strike') },
        { icon: <FaCode />, label: 'Code', title: 'Inline code', action: () => insertAtCursor('`', '`', 'code') },
      ]
    },
    {
      name: 'Blocks',
      items: [
        { icon: <FaQuoteLeft />, label: 'Quote', title: 'Blockquote', action: () => insertLinePrefix('> ') },
        { icon: <FaCode />, label: 'Block', title: 'Code block', action: () => insertAtCursor('\n```\n', '\n```\n', 'code here') },
        { icon: <FaListUl />, label: 'UL', title: 'Bullet list', action: () => insertLinePrefix('- ') },
        { icon: <FaListOl />, label: 'OL', title: 'Ordered list', action: () => insertLinePrefix('1. ') },
        { icon: <FaCheckSquare />, label: 'Task', title: 'Task list', action: () => insertLinePrefix('- [ ] ') },
        { icon: <FaTable />, label: 'Table', title: 'Table', action: () => insertAtCursor('\n| Col1 | Col2 |\n|------|------|\n| ', ' |  |\n', 'A') },
        { icon: <FaMinus />, label: 'HR', title: 'Horizontal rule', action: () => insertAtCursor('\n---\n', '', '') },
      ]
    },
    {
      name: 'Insert',
      items: [
        { icon: <FaLink />, label: 'Link', title: 'Link', action: () => insertAtCursor('[', '](https://example.com)', 'text') },
        { icon: <FaImage />, label: 'Image', title: 'Image', action: () => insertAtCursor('![', '](https://images.unsplash.com/photo-1787238347889-be19be24c8f5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', 'alt') },
      ]
    },
  ];

  const handleCopy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); toast.success(msg); }
    catch { toast.error('Copy failed'); }
  };

  const handleClear = () => { setInput(''); toast.success('Cleared'); };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast.error('File too large (max 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setInput(String(ev.target.result || '')); toast.success(`Loaded ${f.name}`); };
    reader.readAsText(f);
    e.target.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith('.md') || f.name.endsWith('.txt') || f.type.startsWith('text/'))) {
      const r = new FileReader(); r.onload = ev => setInput(String(ev.target.result || '')); r.readAsText(f);
      toast.success(`Loaded ${f.name}`);
    } else {
      const txt = e.dataTransfer.getData('text/plain');
      if (txt) { setInput(txt); toast.success('Pasted dropped text'); }
    }
  };

  const exportMd = () => downloadBlob(input, `${docTitle}.md`, 'text/markdown');
  const exportHtmlRaw = () => downloadBlob(html, `${docTitle}.html`, 'text/html');
  const exportHtmlStyled = () => downloadBlob(buildStyledHtml(html, docTitle), `${docTitle}-styled.html`, 'text/html');
  const exportTxt = () => downloadBlob(stripMarkdownToText(input), `${docTitle}.txt`, 'text/plain');
  const exportPdf = () => {
    const win = window.open('', '_blank');
    if (!win) { toast.error('Popup blocked — allow popups to export PDF'); return; }
    win.document.write(buildStyledHtml(html, `${docTitle} — Markdown PDF`));
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };

  const previewContent = (
    <div
      ref={previewRef}
      className={`prose prose-sm max-w-none p-4 overflow-auto h-full ${isDarkMode ? 'prose-invert' : ''}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html || '<p class="text-slate-400">Nothing to preview — start typing…</p>' }}
    />
  );

  const currentHeaderLabel = headerOptions.find(o => o.level === activeHeaderLevel)?.label || 'Paragraph';

  return (
    <ToolPageLayout
      title="Markdown Playground"
      icon={<FaMarkdown />}
      siblings={siblings}
      currentPath="/markdown-playground"
      breadcrumb={[{ label: 'Text Utilities', path: '/format-text' }]}
      activeParams={{ text: input.slice(0, 200) }}
    >
      <Toaster position="top-right" />
      <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt,.html" className="hidden" onChange={handleFileChange} />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-[60] rounded-none' : ''} ${isDarkMode ? 'bg-slate-900/70 border-slate-700/50 backdrop-blur-xl' : 'bg-white/70 border-slate-200/60 backdrop-blur-xl'} ${dragOver ? 'ring-2 ring-indigo-500' : ''}`}
        style={isFullscreen ? { height: '100vh' } : undefined}
      >
        {/* Top toolbar — Header control + Format */}
        <div className={`flex flex-col gap-2 px-3 sm:px-4 py-3 border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-200/60'}`}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Header Control — enhanced */}
            <div ref={headerRef} className="relative flex items-center gap-1">
              <div className={`inline-flex items-center rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <button
                  onClick={() => setHeading(activeHeaderLevel === 0 ? 2 : 0)}
                  title="Toggle paragraph / heading"
                  className={`px-2.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 border-r ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <FaHeading className="text-indigo-400" size={12} />
                  <span className="hidden sm:inline">{currentHeaderLabel}</span>
                  <span className="sm:hidden">H</span>
                </button>
                <div className="flex">
                  {[1,2,3].map(lv => (
                    <button
                      key={lv}
                      onClick={() => setHeading(lv)}
                      title={`Heading ${lv} (Ctrl+${lv})`}
                      className={`w-8 h-[32px] inline-flex items-center justify-center text-xs font-bold border-r last:border-0 transition-colors ${activeHeaderLevel === lv ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-slate-200'}`}
                    >
                      H{lv}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setHeaderDropdownOpen(v => !v)}
                  className={`px-2 h-[32px] inline-flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                  title="More headings"
                >
                  <FaChevronDown size={10} className={`transition-transform ${headerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {headerDropdownOpen && (
                <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl border shadow-2xl overflow-hidden z-20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className={`px-3 py-2 text-[10px] font-bold tracking-widest uppercase border-b ${isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>Header level — current: {currentHeaderLabel}</div>
                  <div className="py-1">
                    {headerOptions.map(opt => (
                      <button
                        key={opt.level}
                        onClick={() => setHeading(opt.level)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-indigo-500/10 transition-colors ${activeHeaderLevel === opt.level ? (isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600') : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        <span className="flex flex-col">
                          <span className={`${opt.style}`}>{opt.label}</span>
                          <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{opt.preview} {opt.level>0 ? `• ${'#'.repeat(opt.level)} title` : '• plain paragraph'} • Ctrl+{opt.level}</span>
                        </span>
                        {activeHeaderLevel === opt.level && <span className="text-indigo-500 text-xs">●</span>}
                      </button>
                    ))}
                  </div>
                  <div className={`px-3 py-2 text-[10px] leading-relaxed border-t ${isDarkMode ? 'bg-slate-900/50 text-slate-500 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    Markdown headers: <code className={`px-1 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}># H1</code> … <code className={`px-1 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>###### H6</code>. Place cursor on line and pick a level.
                  </div>
                </div>
              )}
            </div>

            <div className={`hidden md:block h-6 w-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

            {/* Format / Blocks / Insert groups */}
            <div className="flex flex-wrap items-center gap-1">
              {toolbarGroups.map((group) => (
                <div key={group.name} className={`inline-flex rounded-xl border overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  {group.items.map((a, idx) => (
                    <button
                      key={idx}
                      onClick={a.action}
                      title={`${a.title} — ${group.name}`}
                      className={`w-8 h-8 inline-flex items-center justify-center border-r last:border-0 text-xs transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <span className="text-[12px]">{a.icon}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1 ml-auto">
              <div className={`inline-flex rounded-xl border p-1 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                {[
                  { id: 'edit', icon: <FaEdit />, label: 'Edit' },
                  { id: 'split', icon: <FaColumns />, label: 'Split' },
                  { id: 'preview', icon: <FaEye />, label: 'Preview' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setViewMode(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${viewMode === m.id ? 'bg-indigo-600 text-white shadow' : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {m.icon} <span className="hidden sm:inline">{m.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsFullscreen(v => !v)}
                className={`w-8 h-8 inline-flex items-center justify-center rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
              </button>
            </div>
          </div>

          {/* Second row: file & export + title */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button onClick={handleUploadClick} className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <FaUpload size={11} /> Import .md
              </button>
              <button onClick={handleClear} className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                <FaTrash size={11} /> Clear
              </button>
            </div>

            <div className={`flex-1 flex items-center justify-center gap-2 min-w-[180px] px-2 py-1 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              <FaFileAlt size={10} className="text-indigo-400 shrink-0" />
              <input
                value={docTitle}
                onChange={e => setDocTitle(slugify(e.target.value) || 'document')}
                className={`bg-transparent outline-none text-xs font-mono font-semibold min-w-0 flex-1 ${isDarkMode ? 'text-slate-200 placeholder-slate-500' : 'text-slate-700 placeholder-slate-400'}`}
                placeholder="filename (auto from H1)"
                title="Export filename (without extension)"
              />
              <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>.md/.html</span>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <button onClick={() => handleCopy(input, 'Markdown copied!')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <FaCopy size={11} /> Copy MD
              </button>
              <button onClick={() => handleCopy(html, 'HTML copied!')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                <FaClipboard size={11} /> Copy HTML
              </button>
              <div className={`inline-flex rounded-xl overflow-hidden border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <button onClick={exportMd} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`} title="Download .md"><FaFileAlt /> .md</button>
                <button onClick={exportHtmlStyled} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 border-l ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500 border-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 border-slate-200'}`} title="Download styled HTML"><FaFileCode /> .html</button>
                <button onClick={exportHtmlRaw} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 border-l ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'}`} title="Download raw HTML">raw</button>
                <button onClick={exportTxt} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 border-l ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'}`} title="Download .txt"><FaFileAlt /> .txt</button>
                <button onClick={exportPdf} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 border-l ${isDarkMode ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border-slate-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-slate-200'}`} title="Print / Save as PDF"><FaFilePdf /> PDF</button>
              </div>
            </div>
          </div>

          {/* Stats + TOC toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className={`flex flex-wrap items-center gap-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{stats.words}</strong> words</span>
              <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{stats.chars}</strong> chars</span>
              <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{stats.lines}</strong> lines</span>
              <span>~{stats.reading} min read • {toc.length} headers</span>
              <span className="hidden sm:inline">• Ctrl+1…6 = H1…H6, Ctrl+0 = Paragraph</span>
            </div>
            <label className={`inline-flex items-center gap-1.5 cursor-pointer select-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <input type="checkbox" checked={showToc} onChange={e => setShowToc(e.target.checked)} className="rounded" />
              TOC
            </label>
          </div>
        </div>

        {/* Editor + Preview — both panes independently scrollable */}
        <div className={`flex-1 grid min-h-[520px] h-[58vh] sm:h-[640px] ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} ${isFullscreen ? '!h-[calc(100vh-140px)] !max-h-none' : ''} overflow-hidden`}>
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`flex flex-col border-r ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'} min-h-0`}>
              <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode ? 'bg-slate-800/50 text-slate-300 border-slate-700/50' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span className="inline-flex items-center gap-2"><FaEdit className="text-indigo-400" /> Markdown {activeHeaderLevel ? `• H${activeHeaderLevel}` : '• Paragraph'}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>md</span>
              </div>
              <div className="flex-1 min-h-[300px]">
                <Editor
                  height="100%"
                  language="markdown"
                  value={input}
                  onChange={(v) => setInput(v ?? '')}
                  onMount={handleEditorMount}
                  theme={isDarkMode ? 'vs-dark' : 'light'}
                  options={{
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                    quickSuggestions: false,
                    folding: true,
                    renderWhitespace: 'none',
                    padding: { top: 12, bottom: 12 },
                  }}
                  loading={<div className={`p-4 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading editor…</div>}
                />
              </div>
            </div>
          )}

          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex flex-col min-h-0">
              <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode ? 'bg-slate-800/50 text-slate-300 border-slate-700/50' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span className="inline-flex items-center gap-2"><FaEye className="text-emerald-400" /> Preview</span>
                <button onClick={() => handleCopy(html, 'HTML copied!')} className={`px-2 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 ${isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <FaClipboard size={10} /> Copy HTML
                </button>
              </div>

              {showToc && toc.length > 0 && (
                <div className={`mx-3 mt-3 p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <div className="font-bold mb-1 flex items-center gap-1"><FaFileAlt size={10} /> Table of Contents • {toc.length}</div>
                  <ol className="list-none space-y-0.5 max-h-36 overflow-auto pr-1">
                    {toc.map((h, i) => (
                      <li key={i} style={{ paddingLeft: `${(h.depth - 1) * 10}px` }} className="truncate">
                        <a href={`#${h.id}`} onClick={(e) => {
                          e.preventDefault();
                          const el = previewRef.current;
                          if (!el) return;
                          const target = el.querySelector(`#${CSS.escape(h.id)}`);
                          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }} className={`hover:underline ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                          <span className={`font-mono text-[10px] mr-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>H{h.depth}</span>{h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className={`flex-1 overflow-auto ${isDarkMode ? 'bg-[#1e1e1e] text-slate-100' : 'bg-white text-slate-900'}`} style={{ borderTop: '1px solid transparent' }}>
                {previewContent}
              </div>
            </div>
          )}
        </div>

        {dragOver && (
          <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className={`px-6 py-4 rounded-2xl border-2 border-dashed font-semibold ${isDarkMode ? 'bg-slate-900 border-indigo-400 text-indigo-300' : 'bg-white border-indigo-500 text-indigo-600 shadow-xl'}`}>
              Drop .md / .txt file to load
            </div>
          </div>
        )}
      </div>

      <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-center`}>
        Header tip: Put cursor on any line → pick H1-H6 or Paragraph • <code className={`px-1 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>Ctrl+1…6</code> / <code className={`px-1 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>Ctrl+0</code> • Filename auto-fills from first H1
      </div>
    </ToolPageLayout>
  );
}
