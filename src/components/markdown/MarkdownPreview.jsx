import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import {
  FaMarkdown, FaClipboard, FaTrash, FaDownload, FaUpload, FaCopy,
  FaBold, FaItalic, FaStrikethrough, FaLink, FaImage, FaListUl, FaListOl,
  FaQuoteLeft, FaCode, FaTable, FaMinus, FaCheckSquare, FaHeading,
  FaEye, FaEdit, FaColumns, FaFileAlt, FaFileCode, FaFilePdf, FaExpand, FaCompress
} from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';
import Editor from '@monaco-editor/react';
import { marked } from 'marked';

const DEFAULT_MD = `# Hello World

This is a **markdown** preview tool — now supercharged.

## Features
- **Bold**, *italic*, ~~strikethrough~~, \`inline code\`
- [Links](https://example.com) and ![Images](https://via.placeholder.com/320x120)
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

### Math-ish
Inline \`code\` and fenced blocks work great.

---

> Tip: Try the toolbar above or drag & drop a \`.md\` file.

## Second Section
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.

### Subsection
More content here to demo Table of Contents auto-generation.
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
  body{font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #1e293b; background:#ffffff}
  h1,h2,h3{line-height:1.25; margin-top:2em}
  pre{background:#0f172a; color:#e2e8f0; padding:16px; border-radius:10px; overflow:auto}
  code{background: #f1f5f9; padding:0.15em 0.35em; border-radius:4px; font-size:0.9em}
  pre code{background:transparent; padding:0}
  blockquote{border-left:4px solid #6366f1; margin:1em 0; padding:0.5em 1em; background:#f8fafc; color:#475569}
  table{width:100%; border-collapse:collapse; margin:1em 0}
  th,td{border:1px solid #e2e8f0; padding:8px 12px; text-align:left}
  th{background:#f1f5f9}
  img{max-width:100%; border-radius:8px}
  hr{border:none; border-top:1px solid #e2e8f0; margin:2em 0}
  a{color:#4f46e5}
</style>
</head>
<body>
${innerHtml}
<hr style="margin-top:40px" />
<p style="font-size:12px; color:#94a3b8">Exported from <a href="https://utility.rajlabs.in/markdown-preview">Rajlabs Markdown Preview</a> — ${new Date().toLocaleString()}</p>
</body>
</html>`;
}

function stripMarkdownToText(md) {
  // naive stripping via marked -> html -> text
  const html = marked.parse(md || '');
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\n{3,}/g, '\n\n').trim();
}

export default function MarkdownPreview() {
  const siblings = useCategorySiblings('/markdown-preview');
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const initialFromUrl = searchParams.get('text') || searchParams.get('md') || searchParams.get('content') || '';
  const [input, setInput] = useState(initialFromUrl || DEFAULT_MD);
  const [html, setHtml] = useState('');
  const [viewMode, setViewMode] = useState('split'); // split | edit | preview
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Markdown Preview | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  // Sync URL param if present (also listen to activeParams via ToolPageLayout? keep simple)
  useEffect(() => {
    if (initialFromUrl && initialFromUrl !== input) setInput(initialFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Marked options: GFM + breaks
    marked.setOptions({ gfm: true, breaks: true });
    setHtml(marked.parse(input || ''));
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
      id: h.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  }, [input]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    // small: focus
  };

  const insertAtCursor = (before, after = '', placeholder = '') => {
    const editor = editorRef.current;
    if (!editor) {
      // fallback textarea behavior not needed (monaco always present), but safe
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
    const model = editor.getModel();
    const startLine = sel.startLineNumber;
    const endLine = sel.endLineNumber;
    const edits = [];
    for (let ln = startLine; ln <= endLine; ln++) {
      const lineContent = model.getLineContent(ln);
      edits.push({ range: { startLineNumber: ln, startColumn: 1, endLineNumber: ln, endColumn: 1 }, text: prefix, forceMoveMarkers: true });
      // avoid duplicate prefix if already there
      if (lineContent.startsWith(prefix)) continue;
    }
    // simpler: insert prefix at start of each selected line
    editor.executeEdits('line-prefix', edits);
    editor.focus();
  };

  const toolbarActions = [
    { icon: <FaHeading />, label: 'H1', title: 'Heading 1', action: () => insertAtCursor('# ', '', 'Heading 1') },
    { icon: <FaBold />, label: 'Bold', title: 'Bold (Ctrl+B)', action: () => insertAtCursor('**', '**', 'bold') },
    { icon: <FaItalic />, label: 'Italic', title: 'Italic', action: () => insertAtCursor('*', '*', 'italic') },
    { icon: <FaStrikethrough />, label: 'Strike', title: 'Strikethrough', action: () => insertAtCursor('~~', '~~', 'strike') },
    { icon: <FaQuoteLeft />, label: 'Quote', title: 'Blockquote', action: () => insertLinePrefix('> ') },
    { icon: <FaCode />, label: 'Code', title: 'Code block', action: () => insertAtCursor('\n```\n', '\n```\n', 'code here') },
    { icon: <FaLink />, label: 'Link', title: 'Link', action: () => insertAtCursor('[', '](https://example.com)', 'text') },
    { icon: <FaImage />, label: 'Image', title: 'Image', action: () => insertAtCursor('![', '](https://via.placeholder.com/320x120)', 'alt') },
    { icon: <FaListUl />, label: 'UL', title: 'Bullet list', action: () => insertLinePrefix('- ') },
    { icon: <FaListOl />, label: 'OL', title: 'Ordered list', action: () => insertLinePrefix('1. ') },
    { icon: <FaCheckSquare />, label: 'Task', title: 'Task list', action: () => insertLinePrefix('- [ ] ') },
    { icon: <FaTable />, label: 'Table', title: 'Table', action: () => insertAtCursor('\n| Col1 | Col2 |\n|------|------|\n| ', ' |  |\n', 'A') },
    { icon: <FaMinus />, label: 'HR', title: 'Horizontal rule', action: () => insertAtCursor('\n---\n', '', '') },
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

  const exportMd = () => downloadBlob(input, 'document.md', 'text/markdown');
  const exportHtmlRaw = () => downloadBlob(html, 'document.html', 'text/html');
  const exportHtmlStyled = () => downloadBlob(buildStyledHtml(html, 'Markdown Export'), 'document-styled.html', 'text/html');
  const exportTxt = () => downloadBlob(stripMarkdownToText(input), 'document.txt', 'text/plain');
  const exportPdf = () => {
    const win = window.open('', '_blank');
    if (!win) { toast.error('Popup blocked — allow popups to export PDF'); return; }
    win.document.write(buildStyledHtml(html, 'Markdown PDF Export'));
    win.document.close();
    // Give DOM a tick then print
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

  return (
    <ToolPageLayout
      title="Markdown Preview"
      icon={<FaMarkdown />}
      siblings={siblings}
      currentPath="/markdown-preview"
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
        {/* Top toolbar */}
        <div className={`flex flex-col gap-2 px-3 sm:px-4 py-3 border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-200/60'}`}>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex flex-wrap gap-1">
              {toolbarActions.map((a, i) => (
                <button
                  key={i}
                  onClick={a.action}
                  title={a.title}
                  className={`w-8 h-8 inline-flex items-center justify-center rounded-lg border text-xs transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <span className="text-[12px]">{a.icon}</span>
                </button>
              ))}
            </div>
            <div className={`hidden sm:block h-6 w-px mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-1 ml-auto">
              {/* View modes */}
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

          {/* Second row: file & export */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleUploadClick} className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <FaUpload size={11} /> Import .md
            </button>
            <button onClick={handleClear} className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
              <FaTrash size={11} /> Clear
            </button>

            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <button onClick={() => handleCopy(input, 'Markdown copied!')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <FaCopy size={11} /> Copy MD
              </button>
              <button onClick={() => handleCopy(html, 'HTML copied!')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                <FaClipboard size={11} /> Copy HTML
              </button>

              {/* Export dropdown-like group */}
              <div className={`inline-flex rounded-xl overflow-hidden border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <button onClick={exportMd} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`} title="Download .md"><FaFileAlt /> .md</button>
                <button onClick={exportHtmlStyled} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 border-l ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500 border-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 border-slate-200'}`} title="Download styled HTML"><FaFileCode /> .html</button>
                <button onClick={exportHtmlRaw} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 border-l ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'}`} title="Download raw HTML">raw</button>
                <button onClick={exportTxt} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 border-l ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'}`} title="Download .txt"><FaFileAlt /> .txt</button>
                <button onClick={exportPdf} className={`px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 border-l ${isDarkMode ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border-slate-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-slate-200'}`} title="Print / Save as PDF"><FaFilePdf /> PDF</button>
                <button onClick={() => downloadBlob(buildStyledHtml(html), 'document.html', 'text/html')} className="hidden" aria-hidden />
              </div>
            </div>
          </div>

          {/* Stats + TOC toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className={`flex flex-wrap items-center gap-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{stats.words}</strong> words</span>
              <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{stats.chars}</strong> chars</span>
              <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{stats.lines}</strong> lines</span>
              <span>~{stats.reading} min read</span>
              <span className="hidden sm:inline">• {html.length} HTML chars</span>
            </div>
            <label className={`inline-flex items-center gap-1.5 cursor-pointer select-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <input type="checkbox" checked={showToc} onChange={e => setShowToc(e.target.checked)} className="rounded" />
              Show TOC
            </label>
          </div>
        </div>

        {/* Editor + Preview */}
        <div className={`flex-1 grid min-h-[520px] max-h-[70vh] ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} ${isFullscreen ? '!max-h-none' : ''} overflow-hidden`}>
          {/* Editor pane */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`flex flex-col border-r ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'} min-h-0`}>
              <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode ? 'bg-slate-800/50 text-slate-300 border-slate-700/50' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span className="inline-flex items-center gap-2"><FaEdit className="text-indigo-400" /> Markdown</span>
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

          {/* Preview pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex flex-col min-h-0">
              <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode ? 'bg-slate-800/50 text-slate-300 border-slate-700/50' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span className="inline-flex items-center gap-2"><FaEye className="text-emerald-400" /> Preview</span>
                <button onClick={() => handleCopy(html, 'HTML copied!')} className={`px-2 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 ${isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <FaDownload size={10} /> Copy HTML
                </button>
              </div>

              {showToc && toc.length > 0 && (
                <div className={`mx-3 mt-3 p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <div className="font-bold mb-1 flex items-center gap-1"><FaFileAlt size={10} /> Table of Contents</div>
                  <ol className="list-none space-y-0.5">
                    {toc.map((h, i) => (
                      <li key={i} style={{ paddingLeft: `${(h.depth - 1) * 12}px` }}>
                        <a href={`#${h.id}`} onClick={(e) => {
                          e.preventDefault();
                          // naive: scroll to heading in preview by finding by text
                          const el = previewRef.current;
                          if (!el) return;
                          const headings = el.querySelectorAll(`h${h.depth}`);
                          for (const hd of headings) {
                            if (hd.textContent.trim().toLowerCase() === h.text.toLowerCase()) { hd.scrollIntoView({ behavior: 'smooth', block: 'start' }); break; }
                          }
                        }} className={`hover:underline ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                          {h.text}
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

        {/* Drag overlay hint */}
        {dragOver && (
          <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className={`px-6 py-4 rounded-2xl border-2 border-dashed font-semibold ${isDarkMode ? 'bg-slate-900 border-indigo-400 text-indigo-300' : 'bg-white border-indigo-500 text-indigo-600 shadow-xl'}`}>
              Drop .md / .txt file to load
            </div>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-center`}>
        Tip: Drag & drop a <code className={`px-1 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>.md</code> file anywhere on the editor. URL param <code className={`px-1 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>?text=</code> / <code className={`px-1 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>?md=</code> pre-fills content • Exports are 100% client-side.
      </div>
    </ToolPageLayout>
  );
}
