import React, { useState, useEffect, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaBalanceScale, FaCopy, FaTrash, FaExchangeAlt, FaDownload, FaUpload, FaEye, FaCode, FaColumns } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';
import { diffLines, diffWords, diffChars, diffTrimmedLines } from 'diff';
import { triggerChaiModal } from '../../chaiModalContext';

const SAMPLE_A = `Hello world
This is the original text.
It has three lines.
- Item A
- Item B
Duplicate line
Duplicate line`;

const SAMPLE_B = `Hello World
This is the modified text!
It has three lines.
- Item A
- Item C
Duplicate line
New line here`;

function downloadBlob(c,f,m='text/plain'){const b=new Blob([c],{type:m});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=f;a.click();URL.revokeObjectURL(u);setTimeout(()=>triggerChaiModal('Text Diff Studio'),600);}

export default function TextDiffStudio(){
  const siblings = useCategorySiblings('/text-diff');
  const { isDarkMode } = useTheme();
  const [a, setA] = useState(SAMPLE_A);
  const [b, setB] = useState(SAMPLE_B);
  const [mode, setMode] = useState('lines'); // lines | words | chars | trimmed
  const [viewMode, setViewMode] = useState('split'); // split | unified | inline
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [showStats, setShowStats] = useState(true);

  useEffect(()=>{document.title='Text Diff Studio | Rajlabs'; return()=>{document.title='Utilities || Rajlabs';};},[]);

  const diff = useMemo(()=>{
    let aa=a, bb=b;
    if(ignoreCase){ aa=aa.toLowerCase(); bb=bb.toLowerCase(); }
    if(ignoreWs){ aa=aa.replace(/\s+/g,' ').trim(); bb=bb.replace(/\s+/g,' ').trim(); }
    try{
      if(mode==='words') return diffWords(aa,bb);
      if(mode==='chars') return diffChars(aa,bb);
      if(mode==='trimmed') return diffTrimmedLines(aa,bb);
      return diffLines(aa,bb);
    }catch{ return diffLines(aa,bb); }
  },[a,b,mode,ignoreCase,ignoreWs]);

  const stats = useMemo(()=>{
    let added=0, removed=0, common=0;
    diff.forEach(p=>{ const count = p.count || (p.value? p.value.split('\n').length : 0); if(p.added) added+=p.value.length; else if(p.removed) removed+=p.value.length; else common+=p.value.length; });
    const total = added+removed+common;
    return { added, removed, common, total, parts: diff.length, isIdentical: added===0 && removed===0 };
  },[diff]);

  const renderInline = () => (
    <div className="font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words p-3">
      {diff.map((p,i)=>(
        <span key={i} className={p.added ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-b border-emerald-500/30' : p.removed ? 'bg-red-500/20 text-red-700 dark:text-red-300 line-through decoration-red-500/50 border-b border-red-500/30' : isDarkMode?'text-slate-300':'text-slate-700'}>
          {p.value}
        </span>
      ))}
    </div>
  );

  const renderUnified = () => (
    <div className="font-mono text-xs sm:text-sm divide-y divide-slate-200 dark:divide-slate-700">
      {diff.map((p,i)=>(
        <div key={i} className={`px-3 py-1 whitespace-pre-wrap break-words ${p.added?'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-l-4 border-emerald-500': p.removed?'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-l-4 border-red-500':'bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 border-l-4 border-transparent'}`}>
          <span className="select-none mr-2 text-[10px] font-bold opacity-60">{p.added?'+':p.removed?'-':' '}</span>{p.value}
        </div>
      ))}
    </div>
  );

  const renderSplit = () => {
    // For split, we show left (removals) and right (additions) side by side via simple columns
    const leftParts = diff.filter(p=>!p.added).map((p,i)=>(
      <div key={i} className={`px-2 py-1 whitespace-pre-wrap break-words min-h-[1.2em] ${p.removed?'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300':'text-slate-700 dark:text-slate-300'}`}>{p.value || ' '}</div>
    ));
    const rightParts = diff.filter(p=>!p.removed).map((p,i)=>(
      <div key={i} className={`px-2 py-1 whitespace-pre-wrap break-words min-h-[1.2em] ${p.added?'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300':'text-slate-700 dark:text-slate-300'}`}>{p.value || ' '}</div>
    ));
    return (
      <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700 font-mono text-xs sm:text-sm">
        <div className="overflow-hidden"><div className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border-b">Original</div><div className="divide-y divide-slate-100 dark:divide-slate-800">{leftParts}</div></div>
        <div className="overflow-hidden"><div className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b">Modified</div><div className="divide-y divide-slate-100 dark:divide-slate-800">{rightParts}</div></div>
      </div>
    );
  };

  const handleCopyDiff = ()=>{
    const txt = diff.map(p=>`${p.added?'+':p.removed?'-':' '} ${p.value}`).join('');
    navigator.clipboard.writeText(txt); toast.success('Diff copied');
  };

  const handleSwap = ()=>{ const tmp=a; setA(b); setB(tmp); toast.success('Swapped'); };

  return (
    <ToolPageLayout title="Text Diff Studio" icon={<FaBalanceScale/>} siblings={siblings} currentPath="/text-diff" breadcrumb={[{label:'Text Utilities', path:'/format-text'}]} activeParams={{ text:a.slice(0,100) }}>
      <Toaster position="top-right"/>
      <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden flex flex-col ${isDarkMode?'bg-slate-900/70 border-slate-700/50 backdrop-blur-xl':'bg-white/70 border-slate-200/60 backdrop-blur-xl'}`}>
        {/* Controls */}
        <div className={`flex flex-col gap-2 px-3 sm:px-4 py-3 border-b ${isDarkMode?'bg-slate-800/50 border-slate-700/50':'bg-slate-50/70 border-slate-200/60'}`}>
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex rounded-xl border p-1 ${isDarkMode?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
              {[
                {id:'lines', label:'Lines'}, {id:'words', label:'Words'}, {id:'chars', label:'Chars'}, {id:'trimmed', label:'Trimmed'},
              ].map(m=>(
                <button key={m.id} onClick={()=>setMode(m.id)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${mode===m.id?'bg-indigo-600 text-white shadow':'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>{m.label}</button>
              ))}
            </div>
            <div className={`inline-flex rounded-xl border p-1 ${isDarkMode?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
              {[
                {id:'split', icon:<FaColumns/>, label:'Split'}, {id:'unified', icon:<FaCode/>, label:'Unified'}, {id:'inline', icon:<FaEye/>, label:'Inline'},
              ].map(m=>(
                <button key={m.id} onClick={()=>setViewMode(m.id)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${viewMode===m.id?'bg-indigo-600 text-white shadow':'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}>{m.icon}<span className="hidden sm:inline">{m.label}</span></button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <label className={`inline-flex items-center gap-1 text-xs ${isDarkMode?'text-slate-400':'text-slate-600'}`}><input type="checkbox" checked={ignoreCase} onChange={e=>setIgnoreCase(e.target.checked)}/> Ignore case</label>
              <label className={`inline-flex items-center gap-1 text-xs ${isDarkMode?'text-slate-400':'text-slate-600'}`}><input type="checkbox" checked={ignoreWs} onChange={e=>setIgnoreWs(e.target.checked)}/> Ignore WS</label>
              <button onClick={handleSwap} className={`p-1.5 rounded-xl border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`} title="Swap"><FaExchangeAlt size={12}/></button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={()=>{ setA(SAMPLE_A); setB(SAMPLE_B); toast.success('Sample loaded'); }} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200':'bg-white border-slate-200 text-slate-700'}`}>Sample</button>
            <button onClick={()=>{ setA(''); setB(''); toast.success('Cleared'); }} className={`px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700`}>Clear</button>
            <div className="ml-auto flex gap-1.5">
              <button onClick={handleCopyDiff} className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${isDarkMode?'bg-emerald-600 text-white':'bg-emerald-600 text-white'}`}><FaCopy size={11}/> Copy Diff</button>
              <button onClick={()=>downloadBlob(diff.map(p=>p.value).join(''), 'diff.txt')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border inline-flex items-center gap-1 ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200':'bg-white border-slate-200 text-slate-700'}`}><FaDownload size={11}/> .txt</button>
            </div>
          </div>
          {showStats && (
            <div className={`flex flex-wrap gap-3 text-xs ${isDarkMode?'text-slate-400':'text-slate-500'}`}>
              <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.parts}</strong> hunks</span>
              <span className="text-emerald-600">+{stats.added} added</span>
              <span className="text-red-600">-{stats.removed} removed</span>
              <span>{stats.common} common</span>
              {stats.isIdentical && <span className="text-emerald-600 font-bold">✓ Identical</span>}
              <label className="ml-auto inline-flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={showStats} onChange={e=>setShowStats(e.target.checked)}/> Stats</label>
            </div>
          )}
        </div>

        {/* Editors — fixed height with internal scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 shrink-0">
          <div className={`flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r ${isDarkMode?'border-slate-700/50':'border-slate-200/50'}`}>
            <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <span>Original</span><span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDarkMode?'bg-slate-700 text-slate-300':'bg-slate-200 text-slate-600'}`}>{a.length} chars</span>
            </div>
            <textarea value={a} onChange={e=>setA(e.target.value)} placeholder="Original text..." className={`w-full h-[300px] sm:h-[360px] p-3 font-mono text-sm resize-none focus:outline-none overflow-y-auto ${isDarkMode?'bg-[#1e1e1e] text-slate-100 placeholder-slate-500':'bg-white text-slate-900 placeholder-slate-400'}`} spellCheck={false} />
          </div>
          <div className="flex flex-col min-h-0">
            <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <span>Modified</span><span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDarkMode?'bg-slate-700 text-slate-300':'bg-slate-200 text-slate-600'}`}>{b.length} chars</span>
            </div>
            <textarea value={b} onChange={e=>setB(e.target.value)} placeholder="Modified text..." className={`w-full h-[300px] sm:h-[360px] p-3 font-mono text-sm resize-none focus:outline-none overflow-y-auto ${isDarkMode?'bg-[#1e1e1e] text-slate-100 placeholder-slate-500':'bg-white text-slate-900 placeholder-slate-400'}`} spellCheck={false} />
          </div>
        </div>

        {/* Diff output — fixed height scrollable */}
        <div className={`border-t flex flex-col min-h-0 ${isDarkMode?'border-slate-700/50 bg-slate-900/30':'border-slate-200 bg-slate-50/50'}`}>
          <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between ${isDarkMode?'text-slate-300':'text-slate-600'}`}>
            <span className="inline-flex items-center gap-1.5"><FaBalanceScale className="text-indigo-400"/> Diff Output — {viewMode}</span>
            <span className={`text-[10px] ${isDarkMode?'text-slate-500':'text-slate-400'}`}>{diff.length} blocks</span>
          </div>
          <div className={`mx-3 mb-3 rounded-xl border overflow-y-auto overscroll-contain h-[320px] sm:h-[360px] ${isDarkMode?'bg-[#1e1e1e] border-slate-700':'bg-white border-slate-200'}`}>
            {stats.isIdentical ? <div className="p-8 text-center text-emerald-600 font-semibold">✓ No differences — texts are identical</div> : viewMode==='inline' ? renderInline() : viewMode==='unified' ? renderUnified() : renderSplit()}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
