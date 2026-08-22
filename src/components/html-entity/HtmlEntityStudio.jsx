import React, { useState, useEffect, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaCode, FaExchangeAlt, FaCopy, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';

const ENTITIES = [
  { char:'&', entity:'&amp;', name:'Ampersand' }, { char:'<', entity:'&lt;', name:'Less than' },
  { char:'>', entity:'&gt;', name:'Greater than' }, { char:'"', entity:'&quot;', name:'Double quote' },
  { char:"'", entity:'&#39;', name:'Single quote' }, { char:'©', entity:'&copy;', name:'Copyright' },
  { char:'®', entity:'&reg;', name:'Registered' }, { char:'™', entity:'&trade;', name:'Trademark' },
  { char:'€', entity:'&euro;', name:'Euro' }, { char:'£', entity:'&pound;', name:'Pound' },
  { char:'¥', entity:'&yen;', name:'Yen' }, { char:'—', entity:'&mdash;', name:'Em dash' },
  { char:'–', entity:'&ndash;', name:'En dash' }, { char:'…', entity:'&hellip;', name:'Ellipsis' },
  { char:' ', entity:'&nbsp;', name:'Non-breaking space' },
];

function encodeHtml(str, mode='named'){
  if(mode==='named'){
    let out=str;
    ENTITIES.forEach(e=>{ out=out.split(e.char).join(e.entity); });
    // also encode remaining non-ascii as numeric
    out = out.replace(/[\u0080-\uFFFF]/g, c=>`&#${c.charCodeAt(0)};`);
    return out;
  }
  if(mode==='numeric') return str.replace(/[\u0080-\uFFFF&<>"']/g, c=>`&#${c.charCodeAt(0)};`);
  if(mode==='hex') return str.replace(/[\u0080-\uFFFF&<>"']/g, c=>`&#x${c.charCodeAt(0).toString(16)};`);
  return str;
}
function decodeHtml(str){
  const txt=document.createElement('textarea');
  txt.innerHTML=str;
  return txt.value;
}

export default function HtmlEntityStudio(){
  const siblings=useCategorySiblings('/html-entity');
  const { isDarkMode }=useTheme();
  const [input,setInput]=useState('<div class="greeting">Hello & welcome — © 2026</div>');
  const [mode,setMode]=useState('named'); // named | numeric | hex
  const [decoded,setDecoded]=useState('');
  const [encoded,setEncoded]=useState('');

  useEffect(()=>{document.title='HTML Entity Studio | Rajlabs'; return()=>{document.title='Utilities || Rajlabs';};},[]);
  useEffect(()=>{
    setEncoded(encodeHtml(input, mode));
    setDecoded(decodeHtml(input));
  },[input,mode]);

  const stats=useMemo(()=>({ chars:input.length, lines:input.split('\n').length, entities: (encoded.match(/&[a-z#0-9]+;/gi)||[]).length }),[input,encoded]);

  const handleCopy=(t,m)=>{ navigator.clipboard.writeText(t); toast.success(m); };

  return (
    <ToolPageLayout title="HTML Entity Studio" icon={<FaCode/>} siblings={siblings} currentPath="/html-entity" breadcrumb={[{label:'Developer Tools', path:'/regex-tester'}]} activeParams={{ text:input.slice(0,100) }}>
      <Toaster position="top-right"/>
      <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden flex flex-col ${isDarkMode?'bg-slate-900/70 border-slate-700/50':'bg-white/70 border-slate-200/60'}`}>
        {/* Controls */}
        <div className={`flex flex-wrap items-center gap-2 px-3 sm:px-4 py-3 border-b ${isDarkMode?'bg-slate-800/50 border-slate-700/50':'bg-slate-50/70 border-slate-200/60'}`}>
          <div className={`inline-flex rounded-xl border p-1 ${isDarkMode?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
            {[
              {id:'named', label:'Named (&amp;)'}, {id:'numeric', label:'Numeric (&#169;)'}, {id:'hex', label:'Hex (&#xA9;)'},
            ].map(o=>(
              <button key={o.id} onClick={()=>setMode(o.id)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${mode===o.id?'bg-indigo-600 text-white':'text-slate-500 dark:text-slate-400'}`}>{o.label}</button>
            ))}
          </div>
          <div className={`ml-auto flex items-center gap-2 text-xs ${isDarkMode?'text-slate-400':'text-slate-500'}`}>
            <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.chars}</strong> chars</span>
            <span>{stats.entities} entities</span>
            <span>{stats.lines} lines</span>
          </div>
        </div>

        {/* Input */}
        <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b flex items-center justify-between ${isDarkMode?'bg-slate-800/30 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
          <span>Input (HTML / Text)</span>
          <div className="flex gap-1">
            <button onClick={()=>{ setInput(''); toast.success('Cleared'); }} className={`p-1.5 rounded-lg ${isDarkMode?'bg-red-600 text-white':'bg-red-500 text-white'}`} title="Clear"><FaTrash size={12}/></button>
            <button onClick={()=>handleCopy(input,'Input copied')} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-white':'bg-white border border-slate-200'}`} title="Copy"><FaCopy size={12}/></button>
          </div>
        </div>
        <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste HTML with entities, e.g. &lt;div&gt; &copy; ..." className={`w-full h-[160px] sm:h-[180px] p-3 font-mono text-sm resize-none focus:outline-none overflow-y-auto ${isDarkMode?'bg-[#1e1e1e] text-slate-100 placeholder-slate-500':'bg-white text-slate-900 placeholder-slate-400'}`} spellCheck={false} />

        {/* Encoded / Decoded grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 shrink-0 border-t divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700">
          <div className="flex flex-col min-h-0">
            <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode?'bg-emerald-900/20 text-emerald-300 border-slate-700/50':'bg-emerald-50 text-emerald-700 border-slate-200'}`}>
              <span>Encoded ({mode})</span>
              <div className="flex gap-1">
                <button onClick={()=>handleCopy(encoded,'Encoded copied')} className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white">Copy</button>
                <button onClick={()=>{ const b=new Blob([encoded],{type:'text/plain'}); const u=URL.createObjectURL(b); const a=document.createElement('a');a.href=u;a.download='encoded.html';a.click();URL.revokeObjectURL(u);}} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-white':'bg-white border border-slate-200'}`} title="Download"><FaDownload size={12}/></button>
              </div>
            </div>
            <textarea readOnly value={encoded} className={`w-full h-[220px] sm:h-[260px] p-3 font-mono text-sm resize-none focus:outline-none overflow-y-auto ${isDarkMode?'bg-[#1e1e1e] text-emerald-200':'bg-slate-50 text-emerald-800'}`} />
          </div>
          <div className="flex flex-col min-h-0">
            <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode?'bg-indigo-900/20 text-indigo-300 border-slate-700/50':'bg-indigo-50 text-indigo-700 border-slate-200'}`}>
              <span>Decoded (Preview)</span>
              <div className="flex gap-1">
                <button onClick={()=>handleCopy(decoded,'Decoded copied')} className="px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white">Copy</button>
                <button onClick={()=>handleCopy(decoded,'Preview text copied')} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-white':'bg-white border border-slate-200'}`} title="Copy preview"><FaCopy size={12}/></button>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto h-[220px] sm:h-[260px] p-3 ${isDarkMode?'bg-[#1e1e1e]':'bg-white'}`}>
              <div className={`prose prose-sm max-w-none p-2 rounded border ${isDarkMode?'bg-slate-900 border-slate-700 prose-invert':'bg-white border-slate-200'}`} dangerouslySetInnerHTML={{__html: encoded || '<span class="text-slate-400">Preview</span>'}} />
              <div className={`mt-2 p-2 rounded font-mono text-xs whitespace-pre-wrap break-words border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-slate-50 border-slate-200 text-slate-700'}`}>{decoded || 'Decoded text'}</div>
            </div>
          </div>
        </div>

        {/* Entity map */}
        <div className={`px-3 sm:px-4 py-3 border-t ${isDarkMode?'bg-slate-800/30 border-slate-700/50':'bg-slate-50/50 border-slate-200'}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode?'text-slate-300':'text-slate-600'}`}>Quick Reference — Click to insert</div>
          <div className="flex flex-wrap gap-1.5">
            {ENTITIES.map(e=>(
              <button key={e.entity} onClick={()=>setInput(v=>v+e.char)} title={`${e.name}: ${e.entity}`} className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex flex-col items-center gap-0.5 min-w-[64px] ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:border-indigo-500/50':'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}`}>
                <span className="text-base leading-none">{e.char}</span>
                <span className="text-[10px] opacity-70">{e.entity}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
