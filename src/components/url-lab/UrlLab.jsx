import React, { useState, useEffect, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaLink, FaCopy, FaTrash, FaPlus, FaExternalLinkAlt, FaRandom } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';

function parseUrl(input){
  try{
    // handle relative urls by prepending dummy base
    const hasProtocol = /^[a-zA-Z]+:\/\//.test(input);
    const url = new URL(hasProtocol ? input : 'https://example.com' + (input.startsWith('/') ? '' : '/') + input);
    const isRelative = !hasProtocol;
    return {
      valid: true,
      isRelative,
      protocol: url.protocol.replace(':',''),
      username: url.username,
      password: url.password,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash.replace('#',''),
      origin: isRelative ? '' : url.origin,
      href: isRelative ? input : url.href,
      params: Array.from(url.searchParams.entries()).map(([k,v])=>({key:k, value:v})),
    };
  }catch(e){ return { valid:false, error:e.message, href:input, params:[] }; }
}

export default function UrlLab(){
  const siblings=useCategorySiblings('/url-lab');
  const { isDarkMode }=useTheme();
  const [input,setInput]=useState('https://utility.rajlabs.in/markdown-playground?text=hello%20world&lang=en#section-2');
  const [builtParams,setBuiltParams]=useState([{key:'q', value:'hello'}, {key:'page', value:'1'}]);
  const [baseUrl,setBaseUrl]=useState('https://example.com/search');

  useEffect(()=>{document.title='URL Lab | Rajlabs'; return()=>{document.title='Utilities || Rajlabs';};},[]);
  const parsed=useMemo(()=>parseUrl(input),[input]);

  const builtUrl = useMemo(()=>{
    try{
      const hasProto = /^[a-zA-Z]+:\/\//.test(baseUrl);
      const u = new URL(hasProto ? baseUrl : 'https://example.com'+ (baseUrl.startsWith('/')?'':'/')+baseUrl);
      u.search='';
      builtParams.filter(p=>p.key).forEach(p=>u.searchParams.set(p.key, p.value));
      return hasProto ? u.href : u.pathname + u.search + u.hash;
    }catch{ return baseUrl + '?' + builtParams.filter(p=>p.key).map(p=>`${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&'); }
  },[baseUrl, builtParams]);

  const handleCopy=(t,m)=>{ navigator.clipboard.writeText(t); toast.success(m); };

  const updateBuiltParam=(idx,field,val)=>{
    const cp=[...builtParams]; cp[idx][field]=val; setBuiltParams(cp);
  };

  return (
    <ToolPageLayout title="URL Lab" icon={<FaLink/>} siblings={siblings} currentPath="/url-lab" breadcrumb={[{label:'Developer Tools', path:'/regex-tester'}]} activeParams={{ text:input.slice(0,80) }}>
      <Toaster position="top-right"/>
      <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden flex flex-col ${isDarkMode?'bg-slate-900/70 border-slate-700/50':'bg-white/70 border-slate-200/60'}`}>
        {/* Parser */}
        <div className={`px-3 sm:px-4 py-3 border-b ${isDarkMode?'bg-slate-800/50 border-slate-700/50':'bg-slate-50/70 border-slate-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaLink className="text-indigo-400" size={14}/>
            <h3 className={`text-sm font-bold ${isDarkMode?'text-slate-200':'text-slate-800'}`}>URL Parser — Paste any URL</h3>
            <button onClick={()=>{ setInput('https://utility.rajlabs.in/markdown-playground?text=hello%20world&lang=en#section-2'); toast.success('Sample'); }} className={`ml-auto px-2 py-1 rounded-lg text-xs border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}>Sample</button>
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="https://example.com/path?foo=bar&baz=qux#hash" className={`flex-1 px-3 py-2 rounded-xl border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode?'bg-slate-900 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
            <button onClick={()=>{ setInput(''); toast.success('Cleared'); }} className={`p-2 rounded-xl ${isDarkMode?'bg-red-600 text-white':'bg-red-500 text-white'}`} title="Clear"><FaTrash size={12}/></button>
            <button onClick={()=>handleCopy(input,'URL copied')} className={`p-2 rounded-xl ${isDarkMode?'bg-slate-800 border border-slate-700 text-slate-200':'bg-white border border-slate-200 text-slate-700'}`} title="Copy"><FaCopy size={12}/></button>
          </div>
          {!parsed.valid ? (
            <div className="mt-2 text-xs text-red-500">Invalid URL: {parsed.error}</div>
          ) : (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {[
                {label:'Protocol', value:parsed.protocol || '(none)'},
                {label:'Hostname', value:parsed.hostname || '(none)'},
                {label:'Port', value:parsed.port || '(none)'},
                {label:'Pathname', value:parsed.pathname || '/'},
                {label:'Hash', value:parsed.hash ? '#'+parsed.hash : '(none)'},
                {label:'Origin', value:parsed.origin || '(relative)'},
              ].map(f=>(
                <div key={f.label} className={`p-2.5 rounded-xl border flex flex-col gap-1 ${isDarkMode?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${isDarkMode?'text-slate-500':'text-slate-400'}`}>{f.label}</span>
                  <span className={`font-mono text-xs break-all ${isDarkMode?'text-slate-200':'text-slate-800'}`}>{f.value}</span>
                  <button onClick={()=>handleCopy(f.value, f.label+' copied')} className={`self-start mt-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${isDarkMode?'bg-slate-800 text-slate-300 border border-slate-700':'bg-slate-100 text-slate-600 border border-slate-200'}`}>Copy</button>
                </div>
              ))}
            </div>
          )}
          {parsed.valid && (
            <div className={`mt-3 p-3 rounded-xl border ${isDarkMode?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode?'text-slate-300':'text-slate-600'}`}>Query Parameters ({parsed.params.length}) — Click to edit in builder below</div>
              {parsed.params.length===0 ? <div className={`text-xs ${isDarkMode?'text-slate-500':'text-slate-400'}`}>No query params</div> : (
                <div className="flex flex-wrap gap-1.5">
                  {parsed.params.map((p,i)=>(
                    <button key={i} onClick={()=>{ setBuiltParams(ps=>[...ps, {key:p.key, value:p.value}]); toast.success('Added to builder'); }} className={`px-2.5 py-1 rounded-xl border text-xs font-mono flex items-center gap-1 ${isDarkMode?'bg-slate-800 border-slate-700 text-emerald-300 hover:border-emerald-500/50':'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400'}`} title="Add to builder">
                      <span className="font-bold">{p.key}</span><span>=</span><span className="opacity-80">{p.value}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Builder */}
        <div className={`px-3 sm:px-4 py-3 ${isDarkMode?'bg-slate-800/30':'bg-slate-50/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaPlus className="text-emerald-400" size={12}/>
            <h3 className={`text-sm font-bold ${isDarkMode?'text-slate-200':'text-slate-800'}`}>Query Builder — Compose URL</h3>
            <button onClick={()=>setBuiltParams([...builtParams, {key:'', value:''}])} className={`ml-auto px-2.5 py-1 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200':'bg-white border-slate-200 text-slate-700'}`}>+ Add Param</button>
          </div>
          <input value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="https://example.com/search" className={`w-full px-3 py-2 rounded-xl border font-mono text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode?'bg-slate-900 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900'}`} />
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {builtParams.map((p,i)=>(
              <div key={i} className="flex gap-2">
                <input value={p.key} onChange={e=>updateBuiltParam(i,'key',e.target.value)} placeholder="key" className={`flex-1 px-2.5 py-1.5 rounded-xl border text-sm font-mono focus:outline-none ${isDarkMode?'bg-slate-800 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900'}`} />
                <input value={p.value} onChange={e=>updateBuiltParam(i,'value',e.target.value)} placeholder="value" className={`flex-1 px-2.5 py-1.5 rounded-xl border text-sm font-mono focus:outline-none ${isDarkMode?'bg-slate-800 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900'}`} />
                <button onClick={()=>setBuiltParams(ps=>ps.filter((_,idx)=>idx!==i))} className={`px-2.5 py-1.5 rounded-xl bg-red-600 text-white text-xs`}><FaTrash size={10}/></button>
              </div>
            ))}
            {builtParams.length===0 && <div className={`text-xs text-center py-2 ${isDarkMode?'text-slate-500':'text-slate-400'}`}>No params — add one</div>}
          </div>
          <div className={`mt-3 p-2.5 rounded-xl border font-mono text-xs break-all flex items-center gap-2 ${isDarkMode?'bg-slate-900 border-slate-700 text-emerald-300':'bg-white border-slate-200 text-emerald-700'}`}>
            <span className="flex-1 select-all">{builtUrl}</span>
            <button onClick={()=>handleCopy(builtUrl,'Built URL copied')} className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-xs shrink-0"><FaCopy size={10}/></button>
            <a href={builtUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-xs inline-flex items-center gap-1 shrink-0"><FaExternalLinkAlt size={10}/> Open</a>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
