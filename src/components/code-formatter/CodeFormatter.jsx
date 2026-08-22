import React, { useState, useEffect, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaCode, FaCopy, FaTrash, FaDownload, FaMagic, FaCompress, FaExpand } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';
import { triggerChaiModal } from '../../chaiModalContext';
import Editor from '@monaco-editor/react';

function formatJson(str, indent=2){
  try{ const obj=JSON.parse(str); return JSON.stringify(obj,null,indent);}catch(e){ throw new Error('Invalid JSON: '+e.message); }
}
function minifyJson(str){
  try{ const obj=JSON.parse(str); return JSON.stringify(obj);}catch(e){ throw new Error('Invalid JSON: '+e.message); }
}
function formatHtml(str){
  let indent=0;
  const tokens=str.replace(/>\s*</g,'><').split(/(<[^>]+>)/g).filter(Boolean);
  let out='';
  for(const t of tokens){
    if(t.startsWith('</')) indent=Math.max(0,indent-1);
    out += '  '.repeat(indent)+t.trim()+'\n';
    if(t.startsWith('<') && !t.startsWith('</') && !t.endsWith('/>') && !t.startsWith('<!') && !['<br>','<hr>','<img','<input','<meta','<link'].some(x=>t.toLowerCase().startsWith(x))) indent++;
  }
  return out.trim();
}
function formatCss(str){
  return str.replace(/\s+/g,' ').replace(/\s*{\s*/g,' {\n  ').replace(/;\s*/g,';\n  ').replace(/\s*}\s*/g,'\n}\n').replace(/\n\s*\n/g,'\n').trim();
}
function formatSql(str){
  const kw=['SELECT','FROM','WHERE','GROUP BY','ORDER BY','HAVING','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','UNION','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','CREATE TABLE','ALTER TABLE','DROP TABLE'];
  let out=str;
  kw.forEach(k=>{
    const re=new RegExp(`\\b${k.replace(' ','\\s+')}\\b`,'gi');
    out=out.replace(re, `\n${k}`);
  });
  return out.replace(/\n{2,}/g,'\n').trim();
}

export default function CodeFormatter(){
  const siblings=useCategorySiblings('/code-formatter');
  const { isDarkMode }=useTheme();
  const [input,setInput]=useState('{\n  "name": "rajlabs",\n  "tools": 42,\n  "features": ["fast", "client-side"]\n}');
  const [output,setOutput]=useState('');
  const [lang,setLang]=useState('json'); // json | html | css | sql | javascript
  const [indent,setIndent]=useState(2);
  const [error,setError]=useState('');

  useEffect(()=>{document.title='Code Formatter | Rajlabs'; return()=>{document.title='Utilities || Rajlabs';};},[]);
  useEffect(()=>{ handleFormat(); },[]);

  const handleFormat=()=>{
    if(!input.trim()){ toast.error('Enter code first'); return; }
    try{
      let res='';
      if(lang==='json') res=formatJson(input, indent);
      else if(lang==='html') res=formatHtml(input);
      else if(lang==='css') res=formatCss(input);
      else if(lang==='sql') res=formatSql(input);
      else res=input; // js passthrough
      setOutput(res); setError(''); toast.success('Formatted');
    }catch(e){ setError(e.message); toast.error(e.message); }
  };
  const handleMinify=()=>{
    if(!input.trim()){ toast.error('Enter code first'); return; }
    try{
      let res='';
      if(lang==='json') res=minifyJson(input);
      else res=input.replace(/\s+/g,' ').trim();
      setOutput(res); setError(''); toast.success('Minified');
    }catch(e){ setError(e.message); }
  };

  const stats=useMemo(()=>({ inChars:input.length, outChars:output.length, inLines:input.split('\n').length, outLines:output.split('\n').length }),[input,output]);

  return (
    <ToolPageLayout title="Code Formatter" icon={<FaCode/>} siblings={siblings} currentPath="/code-formatter" breadcrumb={[{label:'Developer Tools', path:'/regex-tester'}]} activeParams={{ text:input.slice(0,80) }}>
      <Toaster position="top-right"/>
      <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden flex flex-col ${isDarkMode?'bg-slate-900/70 border-slate-700/50':'bg-white/70 border-slate-200/60'}`}>
        <div className={`flex flex-wrap items-center gap-2 px-3 sm:px-4 py-3 border-b ${isDarkMode?'bg-slate-800/50 border-slate-700/50':'bg-slate-50/70 border-slate-200/60'}`}>
          <div className={`inline-flex rounded-xl border p-1 ${isDarkMode?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
            {['json','html','css','sql','javascript'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${lang===l?'bg-indigo-600 text-white':'text-slate-500 dark:text-slate-400'}`}>{l}</button>
            ))}
          </div>
          {lang==='json' && (
            <div className="flex items-center gap-1 ml-2">
              <span className={`text-xs ${isDarkMode?'text-slate-400':'text-slate-500'}`}>Indent:</span>
              {[2,4].map(n=>(
                <button key={n} onClick={()=>setIndent(n)} className={`px-2 py-1 rounded-lg text-xs font-mono border ${indent===n?'bg-indigo-600 text-white border-indigo-600':'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{n}</button>
              ))}
            </div>
          )}
          <div className="ml-auto flex gap-1.5">
            <button onClick={handleFormat} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1"><FaMagic size={11}/> Beautify</button>
            <button onClick={handleMinify} className={`px-3 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1 ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200':'bg-white border-slate-200 text-slate-700'}`}><FaCompress size={11}/> Minify</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 shrink-0">
          <div className={`flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r ${isDarkMode?'border-slate-700/50':'border-slate-200/50'}`}>
            <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <span>Input — {lang}</span>
              <div className="flex gap-1">
                <button onClick={()=>{ setInput(''); setOutput(''); setError(''); }} className={`p-1.5 rounded-lg ${isDarkMode?'bg-red-600 text-white':'bg-red-500 text-white'}`}><FaTrash size={11}/></button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <Editor height="100%" language={lang==='json'?'json':lang} value={input} onChange={v=>setInput(v||'')} theme={isDarkMode?'vs-dark':'light'} options={{wordWrap:'on', minimap:{enabled:false}, fontSize:13, scrollBeyondLastLine:false, tabSize:indent}} />
            </div>
            <div className={`px-3 py-2 text-[11px] border-t flex justify-between ${isDarkMode?'bg-slate-800/30 border-slate-700/50 text-slate-400':'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span>{stats.inChars} chars • {stats.inLines} lines</span>
              {error && <span className="text-red-500 font-mono">{error.slice(0,60)}</span>}
            </div>
          </div>
          <div className="flex flex-col min-h-0 overflow-hidden">
            <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <span>Output — {lang} beautified</span>
              <div className="flex gap-1">
                <button onClick={()=>{ navigator.clipboard.writeText(output); toast.success('Copied'); }} className="px-2 py-1 rounded-lg text-xs bg-emerald-600 text-white">Copy</button>
                <button onClick={()=>{ const b=new Blob([output],{type:'text/plain'}); const u=URL.createObjectURL(b); const a=document.createElement('a');a.href=u;a.download=`formatted.${lang==='json'?'json':lang==='html'?'html':lang==='css'?'css':'txt'}`;a.click();URL.revokeObjectURL(u); setTimeout(()=>triggerChaiModal('Code Formatter'),600);}} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-white':'bg-white border border-slate-200'}`}><FaDownload size={11}/></button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <Editor height="100%" language={lang==='json'?'json':lang} value={output} theme={isDarkMode?'vs-dark':'light'} options={{wordWrap:'on', minimap:{enabled:false}, readOnly:true, fontSize:13, scrollBeyondLastLine:false}} />
            </div>
            <div className={`px-3 py-2 text-[11px] border-t flex justify-between ${isDarkMode?'bg-slate-800/30 border-slate-700/50 text-slate-400':'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span>{stats.outChars} chars • {stats.outLines} lines</span>
              <span>{stats.outChars < stats.inChars ? `-${stats.inChars-stats.outChars} saved` : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
