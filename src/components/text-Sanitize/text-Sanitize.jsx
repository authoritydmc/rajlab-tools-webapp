import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaClipboard, FaTrash, FaDownload, FaUpload, FaMagic, FaCode, FaEraser, FaExchangeAlt, FaCopy, FaEye } from 'react-icons/fa';
import { MdCleaningServices } from 'react-icons/md';
import { PiSelectionAllFill } from 'react-icons/pi';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { logFirebaseEvent } from '../../firebaseConfig';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

const SAMPLE = `<h1>Hello <b>World</b>! 👋</h1>
<p>   This   has   <em>extra</em>   spaces,   </p>
<script>alert('xss')</script>
Email: test@example.com • Price: $123.45
Line 1
Line 2

Line 3 — with — em—dashes & “smart quotes”
emoji 😀😃 and accents café naïve`;

function downloadBlob(content, filename, mime='text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const sanitizeFns = {
  stripHtml: s => s.replace(/<[^>]*>/g, ''),
  stripScriptStyle: s => s.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ''),
  removeSpecialChars: s => s.replace(/[^\w\s]/g, ''),
  keepAlphaNumSpace: s => s.replace(/[^A-Za-z0-9\s]/g, ''),
  removeExtraSpaces: s => s.replace(/[ \t]+/g, ' '),
  trimLines: s => s.split('\n').map(l => l.trim()).join('\n'),
  collapseWhitespace: s => s.replace(/\s+/g, ' ').trim(),
  removeEmptyLines: s => s.split('\n').filter(l => l.trim() !== '').join('\n'),
  removeLineBreaks: s => s.replace(/\n+/g, ' '),
  removeEmojis: s => s.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''),
  removeAccents: s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  removeUrls: s => s.replace(/https?:\/\/[^\s]+/g, ''),
  removeEmails: s => s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ''),
  removeNumbers: s => s.replace(/[0-9]/g, ''),
  keepOnlyText: s => s.replace(/[^A-Za-z\s]/g, ''),
  normalizeQuotes: s => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/—/g, '--').replace(/–/g, '-'),
  decodeHtmlEntities: s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' '),
  slugify: s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
};

const PRESETS = {
  cleanAll: { label: 'Deep Clean', fns: ['stripScriptStyle','stripHtml','decodeHtmlEntities','normalizeQuotes','removeEmojis','removeExtraSpaces','trimLines','removeEmptyLines'] },
  htmlToText: { label: 'HTML → Text', fns: ['stripScriptStyle','stripHtml','decodeHtmlEntities','removeExtraSpaces','trimLines'] },
  minimal: { label: 'Minimal', fns: ['decodeHtmlEntities','removeExtraSpaces','trimLines'] },
  alphanumeric: { label: 'AlphaNum Only', fns: ['stripHtml','keepAlphaNumSpace','removeExtraSpaces','trimLines','removeEmptyLines'] },
  noPii: { label: 'Remove PII', fns: ['removeEmails','removeUrls'] },
};

export default function SanitizeText() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [enabled, setEnabled] = useState({ stripScriptStyle: true, stripHtml: true, decodeHtmlEntities: true, removeExtraSpaces: true, trimLines: true, removeEmptyLines: false });
  const [history, setHistory] = useState([]);
  const fileRef = useRef(null);
  const siblings = useCategorySiblings('/sanitize-text');

  useEffect(() => {
    logFirebaseEvent('Sanitize Page loaded', { page_title: "Sanitize Text", page_path: "/sanitize-text" });
    document.title = 'Sanitize Text Tool | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  useEffect(() => {
    const qText = searchParams.get('text') || searchParams.get('input');
    if (qText !== null && qText !== undefined) {
      setInputText(qText);
      setOutputText(applySanitize(qText, enabled));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function applySanitize(text, opts) {
    let out = text;
    // order matters: script before html
    const order = ['stripScriptStyle','stripHtml','decodeHtmlEntities','normalizeQuotes','removeEmojis','removeUrls','removeEmails','removeSpecialChars','keepAlphaNumSpace','keepOnlyText','removeNumbers','removeAccents','slugify','removeLineBreaks','removeEmptyLines','removeExtraSpaces','collapseWhitespace','trimLines'];
    for (const k of order) {
      if (opts[k]) out = sanitizeFns[k](out);
    }
    return out;
  }

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputText(v);
    setOutputText(applySanitize(v, enabled));
  };

  const toggle = (key) => {
    const next = { ...enabled, [key]: !enabled[key] };
    setEnabled(next);
    setOutputText(applySanitize(inputText, next));
  };

  const applyPreset = (key) => {
    const preset = PRESETS[key];
    if (!preset) return;
    const next = {};
    preset.fns.forEach(f => next[f] = true);
    setEnabled(prev => ({ ...next }));
    setHistory(h => [...h.slice(-19), outputText]);
    setOutputText(applySanitize(inputText, next));
    toast.success(preset.label + ' applied');
  };

  const handleSelectAll = (id) => document.getElementById(id)?.select();
  const handleCopy = (txt) => { navigator.clipboard.writeText(txt); toast.success('Copied!'); };
  const handleClear = () => { setInputText(''); setOutputText(''); setHistory([]); };
  const handleUndo = () => {
    if (!history.length) { toast.error('Nothing to undo'); return; }
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setOutputText(prev);
    toast.success('Undone');
  };
  const handleUpload = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => { const v = String(ev.target.result || ''); setInputText(v); setOutputText(applySanitize(v, enabled)); toast.success('Loaded '+f.name); };
    r.readAsText(f); e.target.value='';
  };
  const handleSwap = () => { setInputText(outputText); setOutputText(inputText); toast.success('Swapped'); };

  const stats = useMemo(() => {
    const inChars = inputText.length; const outChars = outputText.length;
    const inWords = inputText.trim()? inputText.trim().split(/\s+/).length:0;
    const outWords = outputText.trim()? outputText.trim().split(/\s+/).length:0;
    const removed = inChars - outChars;
    return { inChars, outChars, inWords, outWords, removed, pct: inChars? Math.round((removed/inChars)*100):0 };
  }, [inputText, outputText]);

  const diffBadge = stats.removed > 0 ? `${stats.removed} chars removed (${stats.pct}%)` : stats.removed < 0 ? `${-stats.removed} added` : 'no change';

  return (
    <ToolPageLayout 
      title="Sanitize Text" 
      icon={<MdCleaningServices />} 
      breadcrumb={[{ label: 'Text Utilities', path: '/format-text' }]} 
      siblings={siblings} 
      currentPath="/sanitize-text"
      activeParams={{ text: inputText.slice(0,200) }}
    >
      <Toaster position="top-right" />
      <input ref={fileRef} type="file" accept=".txt,.md,.csv,.html,.json" className="hidden" onChange={handleUpload} />

      <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900/70 border-slate-700/50 backdrop-blur-xl' : 'bg-white/70 border-slate-200/60 backdrop-blur-xl'}`}>
        {/* Stats header */}
        <div className={`flex flex-wrap items-center gap-3 px-3 sm:px-4 py-2.5 border-b text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-slate-50/70 border-slate-200/60 text-slate-600'}`}>
          <div className="flex flex-wrap gap-3">
            <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.inChars}</strong> → <strong className={isDarkMode?'text-emerald-400':'text-emerald-600'}>{stats.outChars}</strong> chars</span>
            <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.inWords}</strong> → <strong className={isDarkMode?'text-emerald-400':'text-emerald-600'}>{stats.outWords}</strong> words</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${stats.removed>0 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{diffBadge}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={()=>{ setInputText(SAMPLE); setOutputText(applySanitize(SAMPLE, enabled)); toast.success('Sample loaded'); }} className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Sample</button>
            <button onClick={()=>fileRef.current?.click()} className={`px-2.5 py-1 rounded-xl text-xs font-semibold inline-flex items-center gap-1 border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}><FaUpload size={11}/> Import</button>
            <button onClick={handleUndo} className={`p-1.5 rounded-xl border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`} title="Undo"><FaEraser size={12}/></button>
            <button onClick={handleSwap} className={`p-1.5 rounded-xl border ${isDarkMode?'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500':'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'}`} title="Swap"><FaExchangeAlt size={12}/></button>
          </div>
        </div>

        {/* Input / Output panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 shrink-0">
          <div className={`flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r ${isDarkMode?'border-slate-700/50':'border-slate-200/50'}`}>
            <div className={`px-3 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <span className="inline-flex items-center gap-1.5"><FaCode className="text-indigo-400" size={12}/> Input</span>
              <div className="flex items-center gap-1">
                <button onClick={()=>handleCopy(inputText)} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-slate-200 hover:bg-slate-600':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} title="Copy input"><FaCopy size={12}/></button>
                <button onClick={handleClear} className={`p-1.5 rounded-lg ${isDarkMode?'bg-red-600 text-white hover:bg-red-700':'bg-red-500 text-white hover:bg-red-600'}`} title="Clear"><FaTrash size={12}/></button>
              </div>
            </div>
            <textarea
              id="input"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Paste dirty text, HTML, or any content to sanitize..."
              className={`w-full h-[300px] sm:h-[360px] p-3 font-mono text-sm resize-none focus:outline-none overflow-y-auto ${isDarkMode?'bg-[#1e1e1e] text-slate-100 placeholder-slate-500':'bg-white text-slate-900 placeholder-slate-400'}`}
              spellCheck={false}
            />
            <div className={`px-3 py-2 flex items-center justify-between border-t text-[11px] ${isDarkMode?'bg-slate-800/30 border-slate-700/50 text-slate-400':'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span>{inputText.length} chars • {inputText.split('\n').length} lines</span>
              <button onClick={()=>handleSelectAll('input')} className="inline-flex items-center gap-1 hover:underline"><PiSelectionAllFill size={12}/> Select</button>
            </div>
          </div>

          <div className="flex flex-col min-h-0">
            <div className={`px-3 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <span className="inline-flex items-center gap-1.5"><FaEye className="text-emerald-400" size={12}/> Sanitized</span>
              <div className="flex items-center gap-1">
                <button onClick={()=>handleCopy(outputText)} className={`px-2 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${isDarkMode?'bg-emerald-600 text-white hover:bg-emerald-700':'bg-emerald-600 text-white hover:bg-emerald-700'}`}><FaClipboard size={11}/> Copy</button>
                <button onClick={()=>downloadBlob(outputText,'sanitized.txt')} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-slate-200 hover:bg-slate-600':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} title="Download"><FaDownload size={12}/></button>
              </div>
            </div>
            <textarea
              id="output"
              value={outputText}
              readOnly
              placeholder="Sanitized output appears here..."
              className={`w-full h-[300px] sm:h-[360px] p-3 font-mono text-sm resize-none focus:outline-none overflow-y-auto ${isDarkMode?'bg-[#1e1e1e] text-slate-100 placeholder-slate-500':'bg-slate-50 text-slate-900 placeholder-slate-400'}`}
            />
            <div className={`px-3 py-2 flex items-center justify-between border-t text-[11px] ${isDarkMode?'bg-slate-800/30 border-slate-700/50 text-slate-400':'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span>{outputText.length} chars • {outputText.split('\n').length} lines</span>
              <button onClick={()=>handleSelectAll('output')} className="inline-flex items-center gap-1 hover:underline"><PiSelectionAllFill size={12}/> Select</button>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className={`px-3 sm:px-4 py-3 border-t space-y-3 ${isDarkMode?'bg-slate-800/40 border-slate-700/50':'bg-slate-50/50 border-slate-200'}`}>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([k,v])=>(
              <button key={k} onClick={()=>applyPreset(k)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-indigo-500/30':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300'}`}><FaMagic className="inline mr-1 text-indigo-400" size={10}/>{v.label}</button>
            ))}
            <button onClick={()=>{ setEnabled({}); setOutputText(inputText); toast.success('Reset'); }} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-red-900/30 border-red-700 text-red-300':'bg-white border-slate-200 text-slate-600'}`}>Reset</button>
          </div>

          {/* Option grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              ['stripScriptStyle','Strip <script>/<style>'],
              ['stripHtml','Strip all HTML tags'],
              ['decodeHtmlEntities','Decode HTML entities'],
              ['normalizeQuotes','Normalize smart quotes/dashes'],
              ['removeEmojis','Remove emojis'],
              ['removeUrls','Remove URLs'],
              ['removeEmails','Remove emails'],
              ['removeSpecialChars','Remove special chars [^\\w\\s]'],
              ['keepAlphaNumSpace','Keep only A-Z, 0-9, space'],
              ['keepOnlyText','Keep only letters/spaces'],
              ['removeNumbers','Remove numbers'],
              ['removeAccents','Remove accents (café→cafe)'],
              ['removeLineBreaks','Remove line breaks'],
              ['removeEmptyLines','Remove empty lines'],
              ['removeExtraSpaces','Collapse extra spaces'],
              ['collapseWhitespace','Collapse all whitespace'],
              ['trimLines','Trim each line'],
              ['slugify','Slugify (→ kebab-case)'],
            ].map(([key,label])=>(
              <label key={key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs font-medium transition-colors ${enabled[key] ? (isDarkMode?'bg-indigo-600/20 border-indigo-500/40 text-indigo-200':'bg-indigo-50 border-indigo-300 text-indigo-700') : (isDarkMode?'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800':'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}`}>
                <input type="checkbox" checked={!!enabled[key]} onChange={()=>toggle(key)} className="w-3.5 h-3.5 accent-indigo-600" />
                {label}
              </label>
            ))}
          </div>

          <div className={`text-[11px] text-center ${isDarkMode?'text-slate-500':'text-slate-400'}`}>
            All sanitization is 100% client-side • Toggle options to customize • Share via <span className={`px-1 rounded ${isDarkMode?'bg-slate-700':'bg-slate-200'}`}>?text=hello</span>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
