import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaFileWord,
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaCode,
  FaQuoteRight,
  FaListUl,
  FaListOl,
  FaTasks,
  FaTable,
  FaMinus,
  FaLink,
  FaImage,
  FaDownload,
  FaUpload,
  FaTrash,
  FaCog,
  FaClipboard,
  FaPrint,
  FaFileCode,
  FaFileAlt,
  FaFile,
  FaCheck,
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { marked } from 'marked';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ExternalHyperlink,
} from 'docx';
import ToolPageLayout from '../common/ToolPageLayout';
import { useTheme } from '../../themeContext';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

const DEFAULT_MARKDOWN = `# Document Title

This is a **sample Markdown document** that you can convert to a Word (.docx) file.

## Features

- **Bold**, *italic*, and ~~strikethrough~~ text
- [Hyperlinks](https://example.com)
- Inline \`code\` snippets

### Lists

#### Unordered List
- Item one
- Item two
- Item three

#### Ordered List
1. First step
2. Second step
3. Third step

#### Task List
- [x] Write the document
- [x] Review content
- [ ] Export to Word

### Blockquote

> "The best way to predict the future is to create it." -- Abraham Lincoln

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
\`\`\`

### Table

| Name | Role | Department |
|------|------|------------|
| Alice | Engineer | R&D |
| Bob | Designer | Creative |
| Carol | Manager | Operations |

---

*Tip: Edit the Markdown on the left, preview it live, then download as .docx when ready.*
`;

function SelectField({ label, value, onChange, options, isDarkMode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`text-sm rounded-lg px-3 py-1.5 border outline-none transition-colors ${
          isDarkMode
            ? 'bg-slate-800 border-slate-600 text-slate-200 focus:border-indigo-500'
            : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
        }`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function parseFontSize(sizeStr) {
  const num = parseFloat(sizeStr);
  return Math.round(num * 2);
}

function buildStyledHtml(innerHtml, title = 'Document') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 24px;
    color: #1e293b;
    line-height: 1.7;
    background: #f8fafc;
  }
  @media print {
    body { max-width: 100%; padding: 0; background: #fff; }
  }
  @media (prefers-color-scheme: dark) {
    body { color: #e2e8f0; background: #0f172a; }
    pre { background: #1e293b; border-color: #334155; }
    blockquote { background: #1e293b; border-left-color: #475569; color: #94a3b8; }
    th { background: #1e293b; }
  }
  p { margin: 0 0 12px 0; }
  h1, h2, h3, h4, h5, h6 { font-weight: 700; margin: 24px 0 12px 0; color: #0f172a; }
  @media (prefers-color-scheme: dark) { h1,h2,h3,h4,h5,h6 { color: #f1f5f9; } }
  h1 { font-size: 2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  ul, ol { margin: 8px 0; padding-left: 28px; }
  li { margin: 4px 0; }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.875em;
  }
  @media (prefers-color-scheme: dark) { code { background: #1e293b; } }
  pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #334155;
  }
  pre code { background: none; padding: 0; color: inherit; }
  blockquote {
    border-left: 4px solid #6366f1;
    margin: 12px 0;
    padding: 12px 20px;
    color: #64748b;
    background: #f1f5f9;
    border-radius: 0 8px 8px 0;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 10px 14px;
    text-align: left;
  }
  th { background: #f1f5f9; font-weight: 600; }
  tr:hover { background: #f8fafc; }
  hr {
    border: none;
    border-top: 2px solid #e2e8f0;
    margin: 24px 0;
  }
  a { color: #6366f1; text-decoration: none; }
  a:hover { text-decoration: underline; }
  img { max-width: 100%; border-radius: 8px; }
  input[type="checkbox"] { margin-right: 6px; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  del { text-decoration: line-through; opacity: 0.7; }
</style>
</head>
<body>
${innerHtml}
</body>
</html>`;
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(v) {
  return String(v ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const FONT_OPTIONS = [
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
];

const FONT_SIZE_OPTIONS = [
  { value: '9pt', label: '9 pt' },
  { value: '10pt', label: '10 pt' },
  { value: '10.5pt', label: '10.5 pt' },
  { value: '11pt', label: '11 pt' },
  { value: '12pt', label: '12 pt' },
  { value: '14pt', label: '14 pt' },
  { value: '16pt', label: '16 pt' },
  { value: '18pt', label: '18 pt' },
  { value: '20pt', label: '20 pt' },
];

const LINE_HEIGHT_OPTIONS = [
  { value: '1.0', label: '1.0' },
  { value: '1.15', label: '1.15' },
  { value: '1.3', label: '1.3' },
  { value: '1.5', label: '1.5' },
  { value: '2.0', label: '2.0' },
  { value: '2.5', label: '2.5' },
];

function htmlToDocxChildren(html, fontFamily, fontSizeNum, lineHeight) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  const children = [];

  const HEADING_MAP = {
    h1: HeadingLevel.HEADING_1,
    h2: HeadingLevel.HEADING_2,
    h3: HeadingLevel.HEADING_3,
    h4: HeadingLevel.HEADING_4,
    h5: HeadingLevel.HEADING_5,
    h6: HeadingLevel.HEADING_6,
  };

  const spacingVal = Math.round(parseFloat(lineHeight) * 240);

  function inlineRuns(node, baseOpts) {
    const runs = [];
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) runs.push(new TextRun({ text, ...baseOpts }));
      return runs;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return runs;

    const tag = node.tagName.toLowerCase();
    const opts = { ...baseOpts };

    if (tag === 'strong' || tag === 'b') {
      opts.bold = true;
    } else if (tag === 'em' || tag === 'i') {
      opts.italics = true;
    } else if (tag === 'del' || tag === 's') {
      opts.strike = true;
    } else if (tag === 'code') {
      opts.font = { name: 'Courier New' };
      opts.shading = { fill: 'E8E8E8', color: 'auto' };
    } else if (tag === 'a') {
      const href = node.getAttribute('href');
      if (href) {
        for (const child of node.childNodes) {
          for (const r of inlineRuns(child, opts)) {
            runs.push(new ExternalHyperlink({ link: href, children: [r] }));
          }
        }
        return runs;
      }
    } else if (tag === 'br') {
      runs.push(new TextRun({ break: 1, ...baseOpts }));
      return runs;
    } else if (tag === 'img') {
      const alt = node.getAttribute('alt') || '';
      if (alt) runs.push(new TextRun({ text: `[${alt}]`, ...baseOpts }));
      return runs;
    }

    for (const child of node.childNodes) {
      runs.push(...inlineRuns(child, opts));
    }
    return runs;
  }

  function baseOpts() {
    return { font: { name: fontFamily }, size: fontSizeNum };
  }

  function makePara(runs, extraParaOpts) {
    return new Paragraph({
      children: runs,
      spacing: { line: spacingVal, after: 120 },
      ...extraParaOpts,
    });
  }

  function processBlock(el) {
    const tag = el.tagName.toLowerCase();

    if (HEADING_MAP[tag]) {
      const runs = [];
      for (const ch of el.childNodes) runs.push(...inlineRuns(ch, baseOpts()));
      if (!runs.length) runs.push(new TextRun({ text: el.textContent || '', ...baseOpts() }));
      return [new Paragraph({
        children: runs,
        heading: HEADING_MAP[tag],
        spacing: { line: spacingVal, before: 240, after: 120 },
      })];
    }

    if (tag === 'p') {
      const runs = [];
      for (const ch of el.childNodes) runs.push(...inlineRuns(ch, baseOpts()));
      if (!runs.length) runs.push(new TextRun({ text: el.textContent || '', ...baseOpts() }));
      return [makePara(runs)];
    }

    if (tag === 'pre') {
      const codeEl = el.querySelector('code');
      const text = codeEl ? codeEl.textContent : el.textContent;
      return text.split('\n').map(line =>
        new Paragraph({
          children: [new TextRun({ text: line || ' ', font: { name: 'Courier New' }, size: fontSizeNum })],
          spacing: { line: 240, after: 0 },
          shading: { fill: 'F0F0F0', color: 'auto' },
        })
      );
    }

    if (tag === 'ul' || tag === 'ol') {
      const isBullet = tag === 'ul';
      const paras = [];
      for (const li of el.children) {
        if (li.tagName.toLowerCase() !== 'li') continue;
        const liRuns = [];
        const subLists = [];
        for (const ch of li.childNodes) {
          if (ch.nodeType === Node.ELEMENT_NODE) {
            const ct = ch.tagName.toLowerCase();
            if (ct === 'ul' || ct === 'ol') { subLists.push(ch); continue; }
          }
          liRuns.push(...inlineRuns(ch, baseOpts()));
        }
        if (!liRuns.length) liRuns.push(new TextRun({ text: '', ...baseOpts() }));

        const numberingProps = isBullet
          ? { bullet: { level: 0 } }
          : { numbering: { reference: 'ordered-list', level: 0 } };
        paras.push(makePara(liRuns, { ...numberingProps }));

        for (const sl of subLists) {
          const subTag = sl.tagName.toLowerCase();
          for (const sli of sl.children) {
            if (sli.tagName.toLowerCase() !== 'li') continue;
            const subRuns = [];
            for (const ch of sli.childNodes) {
              if (ch.nodeType === Node.ELEMENT_NODE) {
                const ct = ch.tagName.toLowerCase();
                if (ct === 'ul' || ct === 'ol') continue;
              }
              subRuns.push(...inlineRuns(ch, baseOpts()));
            }
            if (!subRuns.length) subRuns.push(new TextRun({ text: '', ...baseOpts() }));
            const subNumbering = subTag === 'ul'
              ? { bullet: { level: 1 } }
              : { numbering: { reference: 'ordered-list', level: 1 } };
            paras.push(makePara(subRuns, { ...subNumbering }));
          }
        }
      }
      return paras;
    }

    if (tag === 'blockquote') {
      const bqRuns = [];
      for (const ch of el.childNodes) {
        if (ch.nodeType === Node.ELEMENT_NODE) {
          const ct = ch.tagName.toLowerCase();
          if (ct === 'br') {
            bqRuns.push(new TextRun({ break: 1, ...baseOpts() }));
          } else {
            bqRuns.push(...inlineRuns(ch, { ...baseOpts(), italics: true, color: '555555' }));
          }
        } else if (ch.nodeType === Node.TEXT_NODE && ch.textContent) {
          bqRuns.push(new TextRun({ text: ch.textContent, ...baseOpts(), italics: true, color: '555555' }));
        }
      }
      if (!bqRuns.length) {
        bqRuns.push(new TextRun({ text: el.textContent || '', ...baseOpts(), italics: true, color: '555555' }));
      }
      return [
        new Paragraph({
          children: bqRuns,
          indent: { left: 720 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'DDDDDD', space: 10 } },
          spacing: { line: spacingVal, after: 120 },
        }),
      ];
    }

    if (tag === 'table') {
      const rows = [];
      for (const tr of el.querySelectorAll('tr')) {
        const cells = [];
        for (const cell of tr.querySelectorAll('th, td')) {
          const cellChildren = [];
          for (const ch of cell.childNodes) {
            if (ch.nodeType === Node.ELEMENT_NODE) {
              const ct = ch.tagName.toLowerCase();
              if (['p', 'ul', 'ol', 'pre', 'blockquote'].includes(ct)) {
                cellChildren.push(...processBlock(ch));
              } else {
                cellChildren.push(...inlineRuns(ch, baseOpts()));
              }
            } else {
              cellChildren.push(...inlineRuns(ch, baseOpts()));
            }
          }
          if (!cellChildren.length) cellChildren.push(new TextRun({ text: cell.textContent || '', ...baseOpts() }));
          const isHeader = cell.tagName.toLowerCase() === 'th';
          cells.push(new TableCell({
            children: [new Paragraph({ children: cellChildren, spacing: { after: 0 } })],
            shading: isHeader ? { fill: 'E8E8E8', color: 'auto', val: 'clear' } : undefined,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
              left: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
              right: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
            },
          }));
        }
        rows.push(new TableRow({ children: cells }));
      }
      return rows.length > 0 ? [new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })] : [];
    }

    if (tag === 'hr') {
      return [new Paragraph({
        children: [],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 1 } },
        spacing: { before: 240, after: 240 },
      })];
    }

    if (tag === 'br') {
      return [new Paragraph({
        children: [new TextRun({ text: '', ...baseOpts(), break: 1 })],
        spacing: { after: 0 },
      })];
    }

    if (tag === 'img') {
      const alt = el.getAttribute('alt') || '';
      return alt ? [makePara([new TextRun({ text: `[${alt}]`, ...baseOpts(), color: '888888', italics: true })])] : [];
    }

    if (tag === 'div' || tag === 'section' || tag === 'article') {
      const paras = [];
      for (const ch of el.childNodes) {
        if (ch.nodeType === Node.ELEMENT_NODE) paras.push(...processBlock(ch));
        else if (ch.nodeType === Node.TEXT_NODE && ch.textContent.trim()) {
          paras.push(makePara([new TextRun({ text: ch.textContent.trim(), ...baseOpts() })]));
        }
      }
      return paras;
    }

    const runs = [];
    for (const ch of el.childNodes) runs.push(...inlineRuns(ch, baseOpts()));
    return runs.length > 0 ? [makePara(runs)] : [];
  }

  for (const ch of body.childNodes) {
    if (ch.nodeType === Node.ELEMENT_NODE) {
      children.push(...processBlock(ch));
    } else if (ch.nodeType === Node.TEXT_NODE && ch.textContent.trim()) {
      children.push(makePara([new TextRun({ text: ch.textContent.trim(), ...baseOpts() })]));
    }
  }

  return children;
}

function exportToDocx(html, fontFamily, fontSize, lineHeight, title) {
  const fontSizeNum = parseFontSize(fontSize);
  const children = htmlToDocxChildren(html, fontFamily, fontSizeNum, lineHeight);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'bullet-list',
          levels: [
            { level: 0, format: 'bullet', text: '\u2022', alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: 'bullet', text: '\u25E6', alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
          ],
        },
        {
          reference: 'ordered-list',
          levels: [
            { level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: 'decimal', text: '%2.', alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
          ],
        },
      ],
    },
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children: children.length > 0
        ? children
        : [new Paragraph({ children: [new TextRun({ text: '', font: { name: fontFamily }, size: parseFontSize(fontSize) })] })],
    }],
  });

  return Packer.toBlob(doc);
}

export default function MarkdownToWord() {
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useTheme();
  const siblings = useCategorySiblings('/markdown-to-word');
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [html, setHtml] = useState('');
  const [title, setTitle] = useState('Document Title');
  const [viewMode, setViewMode] = useState('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState('11pt');
  const [lineHeight, setLineHeight] = useState('1.15');

  useEffect(() => {
    const textParam = searchParams.get('text') || searchParams.get('md');
    if (textParam) {
      try {
        setMarkdown(decodeURIComponent(textParam));
      } catch {
        // ignore malformed param
      }
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      const result = marked.parse(markdown);
      if (result && typeof result === 'string') {
        setHtml(result);
      } else if (result && typeof result.then === 'function') {
        result.then(setHtml).catch(() => setHtml('<p>Error rendering markdown.</p>'));
      }
    } catch {
      setHtml('<p>Error rendering markdown.</p>');
    }
  }, [markdown]);

  useEffect(() => {
    const firstH1 = markdown.match(/^#\s+(.+)$/m);
    if (firstH1) {
      setTitle(firstH1[1].trim());
    }
  }, [markdown]);

  const getStats = useCallback(text => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const minRead = Math.max(1, Math.ceil(words / 200));
    return { words, chars, lines, sentences, minRead };
  }, []);

  const stats = getStats(markdown);

  const insertAtCursor = useCallback((before, after = '') => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    const selected = editor.getModel().getValueInRange(selection);
    const text = selected || '';
    const insert = before + text + after;
    editor.executeEdits('toolbar', [
      {
        range: selection,
        text: insert,
        forceMoveMarkers: true,
      },
    ]);
    editor.focus();
  }, []);

  const handleFileImport = useCallback(file => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setMarkdown(e.target.result);
      toast.success('File imported successfully');
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = useCallback(e => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    e => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileImport(file);
    },
    [handleFileImport]
  );

  const exportDocx = useCallback(async () => {
    try {
      const docxBlob = await exportToDocx(html, fontFamily, fontSize, lineHeight, title);
      downloadBlob(docxBlob, `${slugify(title) || 'document'}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      toast.success('DOCX downloaded');
    } catch (err) {
      toast.error('Failed to generate DOCX: ' + err.message);
    }
  }, [html, fontFamily, fontSize, lineHeight, title]);

  const exportHtml = useCallback(() => {
    const styled = buildStyledHtml(html, title);
    downloadBlob(styled, `${slugify(title) || 'document'}.html`, 'text/html');
    toast.success('HTML downloaded');
  }, [html, title]);

  const exportMarkdown = useCallback(() => {
    downloadBlob(markdown, `${slugify(title) || 'document'}.md`, 'text/markdown');
    toast.success('Markdown downloaded');
  }, [markdown, title]);

  const exportTxt = useCallback(() => {
    const plain = markdown
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/~~(.+?)~~/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      .replace(/^>\s+/gm, '')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/^- \[[ x]\]\s+/gm, '')
      .replace(/\|/g, '')
      .replace(/^---+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    downloadBlob(plain, `${slugify(title) || 'document'}.txt`, 'text/plain');
    toast.success('Text downloaded');
  }, [markdown, title]);

  const copyHtml = useCallback(() => {
    navigator.clipboard.writeText(html).then(
      () => toast.success('HTML copied to clipboard'),
      () => toast.error('Failed to copy')
    );
  }, [html]);

  const copyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(markdown).then(
      () => toast.success('Markdown copied to clipboard'),
      () => toast.error('Failed to copy')
    );
  }, [markdown]);

  const printPreview = useCallback(() => {
    const styled = buildStyledHtml(html, title);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(styled);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 400);
    } else {
      toast.error('Pop-up blocked. Please allow pop-ups for this site.');
    }
  }, [html, title]);

  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportDocx();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [exportDocx]);

  const toolbarButtons = [
    { icon: <FaBold />, action: () => insertAtCursor('**', '**'), tip: 'Bold' },
    { icon: <FaItalic />, action: () => insertAtCursor('*', '*'), tip: 'Italic' },
    { icon: <FaStrikethrough />, action: () => insertAtCursor('~~', '~~'), tip: 'Strikethrough' },
    { icon: <FaCode />, action: () => insertAtCursor('`', '`'), tip: 'Inline Code' },
    { icon: <FaQuoteRight />, action: () => insertAtCursor('\n> '), tip: 'Blockquote' },
    { icon: <FaListUl />, action: () => insertAtCursor('\n- '), tip: 'Bullet List' },
    { icon: <FaListOl />, action: () => insertAtCursor('\n1. '), tip: 'Numbered List' },
    { icon: <FaTasks />, action: () => insertAtCursor('\n- [ ] '), tip: 'Task List' },
    { icon: <FaTable />, action: () => insertAtCursor('\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'), tip: 'Table' },
    { icon: <FaMinus />, action: () => insertAtCursor('\n---\n'), tip: 'Horizontal Rule' },
    { icon: <FaLink />, action: () => insertAtCursor('[', '](url)'), tip: 'Link' },
    { icon: <FaImage />, action: () => insertAtCursor('![alt](', ')'), tip: 'Image' },
  ];

  return (
    <ToolPageLayout
      title="Markdown to Word Converter"
      icon={<FaFileWord />}
      siblings={siblings}
      currentPath="/markdown-to-word"
      breadcrumb={[{ label: 'Text Utilities', path: '/format-text' }]}
      activeParams={{ text: markdown.slice(0, 200) }}
    >
      <Toaster position="top-center" />
      <div
        ref={containerRef}
        className={`rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 ${
          isDarkMode ? 'bg-slate-900/70 border-slate-700/50' : 'bg-white/70 border-slate-200/60'
        } ${isFullscreen ? '!h-[calc(100vh-140px)]' : ''} ${
          isDragging ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
        } ${isDarkMode && isDragging ? 'ring-offset-slate-900' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div
          className={`flex flex-wrap items-center gap-2 px-4 py-3 border-b ${
            isDarkMode ? 'border-slate-700/50' : 'border-slate-200/60'
          }`}
        >
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Document title..."
            className={`flex-1 min-w-[140px] text-sm font-semibold bg-transparent border-none outline-none px-2 py-1 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-slate-200 placeholder-slate-500 hover:bg-slate-800 focus:bg-slate-800'
                : 'text-slate-800 placeholder-slate-400 hover:bg-slate-100 focus:bg-slate-100'
            }`}
          />
          <div className="flex items-center gap-1">
            {/* View Mode Toggle */}
            <div
              className={`flex rounded-lg border overflow-hidden text-xs ${
                isDarkMode ? 'border-slate-600' : 'border-slate-300'
              }`}
            >
              {['edit', 'split', 'preview'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 capitalize font-medium transition-colors ${
                    mode === 'split' ? 'hidden sm:block' : ''
                  } ${
                    viewMode === mode
                      ? 'bg-indigo-600 text-white'
                      : isDarkMode
                      ? 'text-slate-400 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className={`p-1.5 rounded-lg text-sm transition-colors ${
                isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? '⊡' : '⊞'}
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div
          className={`flex flex-wrap items-center gap-1 px-3 py-2 border-b ${
            isDarkMode ? 'border-slate-700/50' : 'border-slate-200/60'
          }`}
        >
          <div
            className={`flex items-center gap-0.5 rounded-xl border px-1.5 py-1 ${
              isDarkMode ? 'border-slate-600' : 'border-slate-300'
            }`}
          >
            {toolbarButtons.slice(0, 4).map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                title={btn.tip}
                className={`p-1.5 rounded-lg text-sm transition-colors ${
                  isDarkMode
                    ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {btn.icon}
              </button>
            ))}
          </div>
          <div
            className={`flex items-center gap-0.5 rounded-xl border px-1.5 py-1 ${
              isDarkMode ? 'border-slate-600' : 'border-slate-300'
            }`}
          >
            {toolbarButtons.slice(4, 8).map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                title={btn.tip}
                className={`p-1.5 rounded-lg text-sm transition-colors ${
                  isDarkMode
                    ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {btn.icon}
              </button>
            ))}
          </div>
          <div
            className={`flex items-center gap-0.5 rounded-xl border px-1.5 py-1 ${
              isDarkMode ? 'border-slate-600' : 'border-slate-300'
            }`}
          >
            {toolbarButtons.slice(8).map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                title={btn.tip}
                className={`p-1.5 rounded-lg text-sm transition-colors ${
                  isDarkMode
                    ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {btn.icon}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div
            className={`flex items-center gap-0.5 rounded-xl border px-1.5 py-1 ${
              isDarkMode ? 'border-slate-600' : 'border-slate-300'
            }`}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import .md/.txt"
              className={`p-1.5 rounded-lg text-sm transition-colors ${
                isDarkMode
                  ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FaUpload />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt"
              className="hidden"
              onChange={e => handleFileImport(e.target.files?.[0])}
            />
            <button
              onClick={() => {
                setMarkdown(DEFAULT_MARKDOWN);
                toast.success('Reset to default');
              }}
              title="Reset to default"
              className={`p-1.5 rounded-lg text-sm transition-colors ${
                isDarkMode
                  ? 'text-slate-300 hover:bg-slate-700 hover:text-red-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-red-500'
              }`}
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* Editor + Preview Panes */}
        <div
          className={`grid h-[560px] sm:h-[620px] lg:h-[660px] overflow-hidden ${
            viewMode === 'edit'
              ? 'grid-cols-1'
              : viewMode === 'preview'
              ? 'grid-cols-1'
              : 'lg:grid-cols-2'
          } ${viewMode !== 'edit' && viewMode !== 'preview' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
        >
          {/* Editor Pane */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div
              className={`border-r ${
                isDarkMode ? 'border-slate-700/50' : 'border-slate-200/60'
              } ${viewMode === 'split' ? 'hidden lg:block' : ''}`}
            >
              <Editor
                height="100%"
                language="markdown"
                theme={isDarkMode ? 'vs-dark' : 'light'}
                value={markdown}
                onChange={val => setMarkdown(val || '')}
                onMount={editor => {
                  editorRef.current = editor;
                }}
                options={{
                  wordWrap: 'on',
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  overviewRulerBorder: false,
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              className={`overflow-y-auto ${
                viewMode === 'split' ? 'hidden lg:block' : ''
              } ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50/50'}`}
            >
              <div
                className={`prose prose-sm max-w-none p-4 ${
                  isDarkMode ? 'prose-invert' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}
        </div>

        {/* Export Settings Panel */}
        {showSettings && (
          <div
            className={`px-4 py-3 border-t ${
              isDarkMode ? 'border-slate-700/50 bg-slate-800/40' : 'border-slate-200/60 bg-slate-50/50'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SelectField
                label="Font Family"
                value={fontFamily}
                onChange={setFontFamily}
                options={FONT_OPTIONS}
                isDarkMode={isDarkMode}
              />
              <SelectField
                label="Font Size"
                value={fontSize}
                onChange={setFontSize}
                options={FONT_SIZE_OPTIONS}
                isDarkMode={isDarkMode}
              />
              <SelectField
                label="Line Height"
                value={lineHeight}
                onChange={setLineHeight}
                options={LINE_HEIGHT_OPTIONS}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}

        {/* Footer: Stats + Export Buttons */}
        <div
          className={`px-4 py-3 border-t ${
            isDarkMode ? 'border-slate-700/50' : 'border-slate-200/60'
          }`}
        >
          {/* Stats Bar */}
          <div
            className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-3 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>
              <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{stats.words}</strong> words
            </span>
            <span>
              <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{stats.chars}</strong> chars
            </span>
            <span>
              <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{stats.lines}</strong> lines
            </span>
            <span>
              <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{stats.sentences}</strong> sentences
            </span>
            <span>
              ~<strong className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{stats.minRead}</strong> min read
            </span>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportDocx}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
            >
              <FaFileWord /> Download .docx
            </button>

            <button
              onClick={exportHtml}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FaFileCode /> .html
            </button>

            <button
              onClick={exportMarkdown}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FaFile /> .md
            </button>

            <button
              onClick={exportTxt}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FaFileAlt /> .txt
            </button>

            <div
              className={`w-px h-5 mx-1 ${
                isDarkMode ? 'bg-slate-600' : 'bg-slate-300'
              }`}
            />

            <button
              onClick={copyHtml}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FaClipboard /> Copy HTML
            </button>

            <button
              onClick={copyMarkdown}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FaClipboard /> Copy MD
            </button>

            <button
              onClick={printPreview}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FaPrint /> Print / PDF
            </button>

            <div className="flex-1" />

            <button
              onClick={() => setShowSettings(s => !s)}
              title="Export settings"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                showSettings
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FaCog /> Settings
            </button>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
