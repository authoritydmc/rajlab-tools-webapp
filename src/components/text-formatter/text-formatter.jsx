import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { CgFormatText } from 'react-icons/cg';
import {
  FaClipboard, FaTrash, FaCopy, FaDownload, FaUpload, FaExchangeAlt, FaUndo, FaMagic, FaSearch,
  FaSortAlphaDown, FaSortAlphaUpAlt, FaRandom, FaListOl, FaFilter, FaCut, FaCode, FaLink
} from 'react-icons/fa';
import { PiSelectionAllFill } from 'react-icons/pi';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

const SAMPLE = `Hello World
this is a sample Text to FORmAT.
  extra   spaces   and

duplicate lines
duplicate lines
  trailing spaces   
lorem ipsum dolor sit amet
apple, Banana, cherry
123 numbers 456`;

function downloadBlob(content, filename, mime='text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// --- transforms ---
const t = {
  upper: s => s.toUpperCase(),
  lower: s => s.toLowerCase(),
  capitalize: s => s.replace(/\b\w/g, c => c.toUpperCase()),
  titleCase: s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace(/\b\w+\b/g, w => w.charAt(0).toUpperCase()+w.slice(1)),
  sentenceCase: s => s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()),
  toggleCase: s => s.split('').map(c => c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()).join(''),
  alternatingCase: s => s.split('').map((c,i) => i%2===0 ? c.toLowerCase() : c.toUpperCase()).join(''),
  snakeCase: s => s.trim().replace(/[\s\-]+/g,'_').replace(/([a-z0-9])([A-Z])/g,'$1_$2').replace(/[^A-Za-z0-9_]/g,'').toLowerCase().replace(/_+/g,'_'),
  kebabCase: s => s.trim().replace(/[\s_]+/g,'-').replace(/([a-z0-9])([A-Z])/g,'$1-$2').replace(/[^A-Za-z0-9\-]/g,'').toLowerCase().replace(/-+/g,'-'),
  camelCase: s => s.trim().replace(/[^A-Za-z0-9]+(.)/g, (_,c)=>c.toUpperCase()).replace(/^[A-Z]/, c=>c.toLowerCase()).replace(/[^A-Za-z0-9]/g,''),
  pascalCase: s => { const c = s.trim().replace(/[^A-Za-z0-9]+(.)/g,(_,x)=>x.toUpperCase()).replace(/[^A-Za-z0-9]/g,''); return c.charAt(0).toUpperCase()+c.slice(1);},
  constantCase: s => s.trim().replace(/[\s\-]+/g,'_').replace(/([a-z0-9])([A-Z])/g,'$1_$2').replace(/[^A-Za-z0-9_]/g,'').toUpperCase().replace(/_+/g,'_'),
  dotCase: s => s.trim().replace(/[\s_\-]+/g,'.').replace(/([a-z0-9])([A-Z])/g,'$1.$2').replace(/[^A-Za-z0-9.]/g,'').toLowerCase().replace(/\.+/g,'.'),
  trim: s => s.trim(),
  trimLines: s => s.split('\n').map(l=>l.trim()).join('\n'),
  collapseSpaces: s => s.replace(/[ \t]+/g,' '),
  collapseWhitespace: s => s.replace(/\s+/g,' ').trim(),
  removeExtraBlankLines: s => s.replace(/\n{3,}/g,'\n\n'),
  removeEmptyLines: s => s.split('\n').filter(l=>l.trim()!=='').join('\n'),
  removeDuplicateLines: s => [...new Set(s.split('\n'))].join('\n'),
  removeDuplicateLinesCaseInsensitive: s => { const seen=new Set(); return s.split('\n').filter(l=>{ const k=l.toLowerCase(); if(seen.has(k))return false; seen.add(k); return true;}).join('\n');},
  sortAsc: s => s.split('\n').slice().sort((a,b)=>a.localeCompare(b)).join('\n'),
  sortDesc: s => s.split('\n').slice().sort((a,b)=>b.localeCompare(a)).join('\n'),
  sortByLength: s => s.split('\n').slice().sort((a,b)=>a.length-b.length).join('\n'),
  reverseLines: s => s.split('\n').reverse().join('\n'),
  shuffleLines: s => { const a=s.split('\n'); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a.join('\n');},
  reverseText: s => s.split('').reverse().join(''),
  reverseWords: s => s.split(/\s+/).reverse().join(' '),
  reverseEachLine: s => s.split('\n').map(l=>l.split('').reverse().join('')).join('\n'),
  addLineNumbers: s => s.split('\n').map((l,i)=>`${String(i+1).padStart(3,' ')} | ${l}`).join('\n'),
  removeLineNumbers: s => s.split('\n').map(l=>l.replace(/^\s*\d+\s*[:|.]\s*/,'').replace(/^\s*\d+\s*\|\s*/,'')).join('\n'),
  slugify: s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),
  removeAccents: s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,''),
  removePunctuation: s => s.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g,''),
  removeNumbers: s => s.replace(/[0-9]/g,''),
  keepOnlyNumbers: s => s.replace(/[^0-9\n]/g,''),
  extractEmails: s => (s.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).join('\n'),
  extractUrls: s => (s.match(/https?:\/\/[^\s]+/g) || []).join('\n'),
  duplicateLines: s => s.split('\n').map(l=>`${l}\n${l}`).join('\n'),
};

export default function TextFormatter() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [activeGroup, setActiveGroup] = useState('case');
  const [history, setHistory] = useState([]);
  const fileRef = useRef(null);
  const siblings = useCategorySiblings('/format-text');

  useEffect(() => { document.title = 'Text Formatter | Rajlabs'; return () => { document.title = 'Utilities || Rajlabs'; }; }, []);
  useEffect(() => {
    const q = searchParams.get('text') || searchParams.get('input');
    if (q) { setInputText(q); setOutputText(q); }
  }, [searchParams]);

  const stats = useMemo(() => {
    const text = outputText || inputText;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g,'').length;
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const lines = text ? text.split('\n').length : 0;
    const sentences = text ? (text.match(/[.!?]+/g) || []).length : 0;
    const paragraphs = text.trim() ? text.trim().split(/\n{2,}/).filter(Boolean).length : 0;
    const reading = Math.max(1, Math.ceil(words/200));
    return { chars, charsNoSpaces, words, lines, sentences, paragraphs, reading };
  }, [inputText, outputText]);

  const pushHistory = (val) => {
    setHistory(h => [...h.slice(-19), val]);
  };

  const apply = (fn, label) => {
    const src = outputText || inputText;
    if (!src) { toast.error('Enter text first'); return; }
    pushHistory(outputText || inputText);
    const res = fn(src);
    setOutputText(res);
    toast.success(label);
  };

  const handleFindReplace = () => {
    if (!findText) { toast.error('Enter find text'); return; }
    const src = outputText || inputText;
    pushHistory(src);
    try {
      let res;
      if (useRegex) {
        const flags = matchCase ? 'g' : 'gi';
        const re = new RegExp(findText, flags);
        res = src.replace(re, replaceText);
      } else {
        if (matchCase) res = src.split(findText).join(replaceText);
        else {
          const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
          res = src.replace(re, replaceText);
        }
      }
      setOutputText(res);
      toast.success('Replaced');
    } catch (e) { toast.error('Invalid regex: '+e.message); }
  };

  const handlePrefixSuffix = () => {
    const src = outputText || inputText;
    pushHistory(src);
    const res = src.split('\n').map(l => `${prefix}${l}${suffix}`).join('\n');
    setOutputText(res);
    toast.success('Prefix/Suffix added');
  };

  const handleUndo = () => {
    if (history.length === 0) { toast.error('Nothing to undo'); return; }
    const prev = history[history.length-1];
    setHistory(h=>h.slice(0,-1));
    setOutputText(prev);
    toast.success('Undone');
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText(inputText);
    toast.success('Swapped');
  };

  const handleCopy = (txt, msg='Copied!') => {
    navigator.clipboard.writeText(txt);
    toast.success(msg);
  };

  const handleUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => { const v=String(ev.target.result||''); setInputText(v); setOutputText(v); toast.success('Loaded '+f.name); };
    r.readAsText(f);
    e.target.value='';
  };

  const Btn = ({ onClick, children, active, title }) => (
    <button onClick={onClick} title={title}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${active ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
      {children}
    </button>
  );

  const groups = {
    case: [
      { label:'UPPER', fn:t.upper }, { label:'lower', fn:t.lower }, { label:'Title Case', fn:t.titleCase },
      { label:'Sentence case', fn:t.sentenceCase }, { label:'Capitalize', fn:t.capitalize }, { label:'tOGGLE', fn:t.toggleCase },
      { label:'AlTeRnAtInG', fn:t.alternatingCase }, { label:'snake_case', fn:t.snakeCase }, { label:'kebab-case', fn:t.kebabCase },
      { label:'camelCase', fn:t.camelCase }, { label:'PascalCase', fn:t.pascalCase }, { label:'CONSTANT', fn:t.constantCase }, { label:'dot.case', fn:t.dotCase },
      { label:'slugify', fn:t.slugify },
    ],
    clean: [
      { label:'Trim', fn:t.trim }, { label:'Trim Lines', fn:t.trimLines }, { label:'Collapse Spaces', fn:t.collapseSpaces },
      { label:'Single Line', fn:t.collapseWhitespace }, { label:'Remove Empty Lines', fn:t.removeEmptyLines }, { label:'Remove Extra Blanks', fn:t.removeExtraBlankLines },
      { label:'Remove Duplicates', fn:t.removeDuplicateLines }, { label:'De-dupe (ci)', fn:t.removeDuplicateLinesCaseInsensitive },
      { label:'Remove Accents', fn:t.removeAccents }, { label:'Remove Punctuation', fn:t.removePunctuation },
      { label:'Remove Numbers', fn:t.removeNumbers }, { label:'Keep Numbers', fn:t.keepOnlyNumbers },
    ],
    lines: [
      { label:'Sort A→Z', fn:t.sortAsc, icon:<FaSortAlphaDown/> }, { label:'Sort Z→A', fn:t.sortDesc, icon:<FaSortAlphaUpAlt/> },
      { label:'Sort by Length', fn:t.sortByLength }, { label:'Reverse Lines', fn:t.reverseLines }, { label:'Shuffle Lines', fn:t.shuffleLines, icon:<FaRandom/> },
      { label:'Reverse Text', fn:t.reverseText }, { label:'Reverse Words', fn:t.reverseWords }, { label:'Reverse Each Line', fn:t.reverseEachLine },
      { label:'Add Line Numbers', fn:t.addLineNumbers, icon:<FaListOl/> }, { label:'Remove Numbers', fn:t.removeLineNumbers },
      { label:'Duplicate Lines', fn:t.duplicateLines },
    ],
    extract: [
      { label:'Extract Emails', fn:t.extractEmails }, { label:'Extract URLs', fn:t.extractUrls },
    ]
  };

  return (
    <ToolPageLayout 
      title="Text Formatter" 
      icon={<CgFormatText />} 
      breadcrumb={[{ label: 'Text Utilities', path: '/format-text' }]} 
      siblings={siblings} 
      currentPath="/format-text"
      activeParams={{ text: inputText.slice(0,200) }}
    >
      <Toaster position="top-right" />
      <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json" className="hidden" onChange={handleUpload} />

      <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900/70 border-slate-700/50 backdrop-blur-xl' : 'bg-white/70 border-slate-200/60 backdrop-blur-xl'}`}>
        {/* Header stats */}
        <div className={`flex flex-wrap items-center gap-3 px-3 sm:px-4 py-2.5 border-b text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-slate-50/70 border-slate-200/60 text-slate-600'}`}>
          <div className="flex flex-wrap gap-3">
            <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.words}</strong> words</span>
            <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.chars}</strong> chars</span>
            <span className="hidden sm:inline"><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.charsNoSpaces}</strong> no-spaces</span>
            <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.lines}</strong> lines</span>
            <span className="hidden md:inline">{stats.sentences} sentences • {stats.paragraphs} paras • ~{stats.reading} min</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={()=>{ setInputText(SAMPLE); setOutputText(SAMPLE); toast.success('Sample loaded'); }} className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Sample</button>
            <button onClick={()=>fileRef.current?.click()} className={`px-2.5 py-1 rounded-xl text-xs font-semibold inline-flex items-center gap-1 ${isDarkMode?'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700':'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}><FaUpload size={11}/> Import</button>
            <button onClick={handleUndo} className={`p-1.5 rounded-xl border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`} title="Undo"><FaUndo size={12}/></button>
            <button onClick={handleSwap} className={`p-1.5 rounded-xl border ${isDarkMode?'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500':'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'}`} title="Swap input ↔ output"><FaExchangeAlt size={12}/></button>
          </div>
        </div>

        {/* Input / Output fixed-height panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 shrink-0">
          <div className={`flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r ${isDarkMode?'border-slate-700/50':'border-slate-200/50'}`}>
            <div className={`px-3 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <span className="inline-flex items-center gap-1.5"><FaCode className="text-indigo-400" size={12}/> Input</span>
              <div className="flex items-center gap-1">
                <button onClick={()=>handleCopy(inputText,'Input copied')} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-slate-200 hover:bg-slate-600':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} title="Copy input"><FaCopy size={12}/></button>
                <button onClick={()=>{ setInputText(''); setOutputText(''); setHistory([]); toast.success('Cleared'); }} className={`p-1.5 rounded-lg ${isDarkMode?'bg-red-600 text-white hover:bg-red-700':'bg-red-500 text-white hover:bg-red-600'}`} title="Clear"><FaTrash size={12}/></button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={e=>{ setInputText(e.target.value); setOutputText(e.target.value); }}
              placeholder="Type or paste text to format... (supports multi-line, paste from clipboard)"
              className={`w-full h-[340px] sm:h-[380px] p-3 font-mono text-sm resize-none focus:outline-none overflow-y-auto ${isDarkMode?'bg-[#1e1e1e] text-slate-100 placeholder-slate-500':'bg-white text-slate-900 placeholder-slate-400'}`}
              spellCheck={false}
            />
            <div className={`px-3 py-2 flex items-center justify-between border-t text-[11px] ${isDarkMode?'bg-slate-800/30 border-slate-700/50 text-slate-400':'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span>{inputText.length} chars • {inputText.split('\n').length} lines</span>
              <button onClick={()=>document.getElementById('input')?.select()} className="inline-flex items-center gap-1 hover:underline"><PiSelectionAllFill size={12}/> Select</button>
            </div>
          </div>

          <div className="flex flex-col min-h-0">
            <div className={`px-3 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <span className="inline-flex items-center gap-1.5"><FaMagic className="text-emerald-400" size={12}/> Output</span>
              <div className="flex items-center gap-1">
                <button onClick={()=>handleCopy(outputText)} className={`px-2 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${isDarkMode?'bg-emerald-600 text-white hover:bg-emerald-700':'bg-emerald-600 text-white hover:bg-emerald-700'}`}><FaClipboard size={11}/> Copy</button>
                <button onClick={()=>downloadBlob(outputText,'formatted.txt')} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-slate-200 hover:bg-slate-600':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} title="Download .txt"><FaDownload size={12}/></button>
              </div>
            </div>
            <textarea
              readOnly
              value={outputText}
              placeholder="Formatted text will appear here..."
              className={`w-full h-[340px] sm:h-[380px] p-3 font-mono text-sm resize-none focus:outline-none overflow-y-auto ${isDarkMode?'bg-[#1e1e1e] text-slate-100 placeholder-slate-500':'bg-slate-50 text-slate-900 placeholder-slate-400'}`}
            />
            <div className={`px-3 py-2 flex items-center justify-between border-t text-[11px] ${isDarkMode?'bg-slate-800/30 border-slate-700/50 text-slate-400':'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span>{outputText.length} chars • {outputText.split('\n').length} lines</span>
              <span className="hidden sm:inline">Click a transform below → updates instantly</span>
            </div>
          </div>
        </div>

        {/* Transform groups */}
        <div className={`px-3 sm:px-4 py-3 border-t space-y-3 ${isDarkMode?'bg-slate-800/40 border-slate-700/50':'bg-slate-50/50 border-slate-200'}`}>
          <div className="flex flex-wrap items-center gap-2">
            {['case','clean','lines','extract'].map(g=>(
              <button key={g} onClick={()=>setActiveGroup(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border ${activeGroup===g ? 'bg-indigo-600 text-white border-indigo-600 shadow' : isDarkMode?'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                {g}
              </button>
            ))}
            <span className={`ml-auto text-[11px] ${isDarkMode?'text-slate-500':'text-slate-400'}`}>Click to apply to output (or input if output empty)</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(groups[activeGroup]||[]).map((b,i)=>(
              <button key={i} onClick={()=>apply(b.fn, b.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-indigo-500/30':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300'}`} title={b.label}>
                {b.icon ? <span className="text-[11px] opacity-80">{b.icon}</span> : null}
                {b.label}
              </button>
            ))}
          </div>

          {/* Find & Replace */}
          <div className={`p-3 rounded-xl border flex flex-col lg:flex-row gap-2 ${isDarkMode?'bg-slate-900/50 border-slate-700':'bg-white border-slate-200'}`}>
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12}/>
                <input value={findText} onChange={e=>setFindText(e.target.value)} placeholder="Find" className={`w-full pl-8 pr-2 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode?'bg-slate-800 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
              </div>
              <div className="relative flex-1">
                <FaExchangeAlt className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12}/>
                <input value={replaceText} onChange={e=>setReplaceText(e.target.value)} placeholder="Replace" className={`w-full pl-8 pr-2 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode?'bg-slate-800 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className={`inline-flex items-center gap-1 text-xs ${isDarkMode?'text-slate-400':'text-slate-600'}`}><input type="checkbox" checked={useRegex} onChange={e=>setUseRegex(e.target.checked)} /> Regex</label>
              <label className={`inline-flex items-center gap-1 text-xs ${isDarkMode?'text-slate-400':'text-slate-600'}`}><input type="checkbox" checked={matchCase} onChange={e=>setMatchCase(e.target.checked)} /> Case</label>
              <button onClick={handleFindReplace} className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">Replace All</button>
            </div>
          </div>

          {/* Prefix / Suffix */}
          <div className={`p-3 rounded-xl border flex flex-col lg:flex-row gap-2 ${isDarkMode?'bg-slate-900/50 border-slate-700':'bg-white border-slate-200'}`}>
            <input value={prefix} onChange={e=>setPrefix(e.target.value)} placeholder="Prefix each line" className={`flex-1 px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode?'bg-slate-800 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
            <input value={suffix} onChange={e=>setSuffix(e.target.value)} placeholder="Suffix each line" className={`flex-1 px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode?'bg-slate-800 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
            <button onClick={handlePrefixSuffix} className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Apply to Lines</button>
            <button onClick={()=>apply(s=>s.split('\n').filter(Boolean).join(', '), 'Join with comma')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200':'bg-white border-slate-200 text-slate-700'}`}>Join ,</button>
            <button onClick={()=>apply(s=>s.split('\n').join(' '), 'Join space')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200':'bg-white border-slate-200 text-slate-700'}`}>Join space</button>
          </div>

          <div className={`text-[11px] text-center ${isDarkMode?'text-slate-500':'text-slate-400'}`}>
            All transforms are 100% client-side • Use <span className={`px-1 rounded ${isDarkMode?'bg-slate-700':'bg-slate-200'}`}>?text=hello</span> in URL to prefill • Export via Copy or Download
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
