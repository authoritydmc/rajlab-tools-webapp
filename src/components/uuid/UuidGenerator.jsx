import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaSync, FaRandom, FaDownload, FaCheck, FaSearch } from 'react-icons/fa';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';

function generateUUID() { return crypto.randomUUID(); }
function downloadBlob(content, filename, mime='text/plain'){ const blob=new Blob([content],{type:mime}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); setTimeout(()=>triggerChaiModal('UUID Generator'),600); }
function isValidUUID(s){ return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || /^[0-9a-f]{32}$/i.test(s) || /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/.test(s); }

export default function UuidGenerator() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);
  const [version, setVersion] = useState('v4'); // v4 | v4-no-dashes | bulk
  const [validateInput, setValidateInput] = useState('');
  const siblings = useCategorySiblings('/uuid-generator');

  useEffect(() => { document.title = 'UUID Generator | Rajlabs'; return () => { document.title = 'Utilities || Rajlabs'; }; }, []);

  useEffect(() => {
    const qCount = searchParams.get('count') || searchParams.get('n') || searchParams.get('c');
    const qUpper = searchParams.get('uppercase') || searchParams.get('upper');
    const qNoDash = searchParams.get('nodashes') || searchParams.get('raw');
    let initialCount = count; let initialUpper = uppercase; let initialNoDash = noDashes;
    if (qCount && !isNaN(qCount)) { initialCount = Math.max(1, Math.min(100, Number(qCount))); setCount(initialCount); }
    if (qUpper !== null && qUpper !== undefined) { initialUpper = qUpper === 'true' || qUpper === '1'; setUppercase(initialUpper); }
    if (qNoDash !== null && qNoDash !== undefined) { initialNoDash = qNoDash === 'true' || qNoDash === '1'; setNoDashes(initialNoDash); }
    const initial = Array.from({ length: initialCount }, () => {
      let u = generateUUID(); if (initialUpper) u = u.toUpperCase(); if (initialNoDash) u = u.replace(/-/g, ''); return u;
    });
    setUuids(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => {
      let uuid = generateUUID(); if (uppercase) uuid = uuid.toUpperCase(); if (noDashes) uuid = uuid.replace(/-/g, ''); return uuid;
    });
    setUuids(newUuids); toast.success(`Generated ${count} UUID(s)!`);
  };
  const copyAll = () => { navigator.clipboard.writeText(uuids.join('\n')); toast.success('All UUIDs copied!'); };
  const copyOne = (uuid) => { navigator.clipboard.writeText(uuid); toast.success('Copied!'); };
  const handleClear = () => { setUuids([]); };
  const validation = useMemo(()=> validateInput ? isValidUUID(validateInput.trim()) : null, [validateInput]);

  return (
    <ToolPageLayout 
      title="UUID Generator" 
      icon={<FaRandom />} 
      breadcrumb={[{ label: 'Developer Tools', path: '/regex-tester' }]} 
      siblings={siblings} 
      currentPath="/uuid-generator"
      activeParams={{ count, uppercase, nodashes: noDashes }}
    >
      <div className="w-full">
        <Toaster position="top-right" />
        <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
          <div className={`px-4 sm:px-6 py-4 border-b space-y-3 ${isDarkMode?'bg-slate-800/40 border-slate-700/50':'bg-slate-50/50 border-slate-200'}`}>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className={`block font-bold mb-1 text-xs ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Count (1-100)</label>
                <input type="range" min="1" max="100" value={count} onChange={e=>setCount(+e.target.value)} className="w-32 accent-indigo-600" />
                <input type="number" min="1" max="100" value={count} onChange={e=>setCount(Math.max(1, Math.min(100, +e.target.value||1)))} className={`ml-2 w-20 p-1.5 border rounded-xl text-sm text-center font-mono ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`} />
              </div>
              <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl border text-xs font-semibold ${uppercase? 'bg-indigo-600 text-white border-indigo-600':' '+ (isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700')}`}>
                <input type="checkbox" checked={uppercase} onChange={e=>setUppercase(e.target.checked)} className="w-3.5 h-3.5 accent-indigo-600" /> Uppercase
              </label>
              <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl border text-xs font-semibold ${noDashes? 'bg-indigo-600 text-white border-indigo-600':' '+(isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700')}`}>
                <input type="checkbox" checked={noDashes} onChange={e=>setNoDashes(e.target.checked)} className="w-3.5 h-3.5 accent-indigo-600" /> No dashes
              </label>
              <div className="flex gap-2 ml-auto">
                <button onClick={generate} className="px-5 py-2 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow inline-flex items-center gap-1"><FaSync size={12}/> Generate</button>
                <button onClick={copyAll} disabled={uuids.length===0} className={`px-4 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-1 ${uuids.length? 'bg-emerald-600 hover:bg-emerald-700 text-white':'bg-slate-300 text-slate-500 cursor-not-allowed'}`}><FaClipboard size={12}/> Copy All</button>
                <button onClick={()=>downloadBlob(uuids.join('\n'),'uuids.txt')} disabled={uuids.length===0} className={`px-3 py-2 rounded-xl text-xs font-semibold border inline-flex items-center gap-1 ${uuids.length? (isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'):'opacity-40 cursor-not-allowed'}`}><FaDownload size={12}/> .txt</button>
                <button onClick={handleClear} className={`px-3 py-2 rounded-xl text-xs font-semibold ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash size={12}/></button>
              </div>
            </div>
            {/* Validator */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row gap-2 ${isDarkMode?'bg-slate-900/50 border-slate-700':'bg-white border-slate-200'}`}>
              <div className="flex-1">
                <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}><FaSearch className="inline mr-1"/> Validate UUID</label>
                <input value={validateInput} onChange={e=>setValidateInput(e.target.value)} placeholder="Paste UUID to validate..." className={`w-full px-3 py-1.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode?'bg-slate-800 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                {validation===null ? <span className={`text-xs ${isDarkMode?'text-slate-500':'text-slate-400'}`}>Enter UUID</span> : validation ? <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs"><FaCheck/> Valid UUID</span> : <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs">✗ Invalid</span>}
                {validateInput && <button onClick={()=>setValidateInput('')} className={`px-2 py-1 rounded-lg text-xs border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-600'}`}>Clear</button>}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {uuids.length > 0 ? (
              <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`px-4 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800 text-slate-300 border-slate-700':'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  <span>UUIDs ({uuids.length}) • {noDashes ? '32 chars' : '36 chars'} • v4</span>
                  <span className="hidden sm:inline normal-case tracking-normal opacity-60">Click row to copy • Hover for action</span>
                </div>
                <div className="max-h-[400px] overflow-auto">
                  {uuids.map((uuid, i) => (
                    <div key={i} onClick={()=>copyOne(uuid)} className={`flex items-center justify-between px-4 py-2.5 border-b font-mono text-sm group cursor-pointer ${isDarkMode?'border-slate-800 hover:bg-slate-800/50':'border-slate-100 hover:bg-slate-50'} ${i%2===0? (isDarkMode?'bg-slate-900':'bg-white'):(isDarkMode?'bg-slate-900/50':'bg-slate-50/50')}`}>
                      <span className={`flex items-center gap-3 ${isDarkMode?'text-emerald-400':'text-emerald-700'}`}><span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${isDarkMode?'bg-slate-800 text-slate-400':'bg-slate-200 text-slate-600'}`}>{String(i+1).padStart(2,'0')}</span>{uuid}</span>
                      <button onClick={(e)=>{ e.stopPropagation(); copyOne(uuid); }} className={`ml-2 p-1.5 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode?'bg-slate-800 text-slate-200 hover:bg-slate-700':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} title="Copy"><FaClipboard size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className={`px-4 py-2 flex flex-wrap gap-2 ${isDarkMode?'bg-slate-800/50':'bg-slate-50'}`}>
                  <button onClick={()=>downloadBlob(JSON.stringify(uuids,null,2),'uuids.json','application/json')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}><FaDownload className="inline mr-1"/> JSON</button>
                  <button onClick={()=>downloadBlob(uuids.join(','),'uuids.csv')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}>CSV (comma)</button>
                  <span className={`ml-auto text-xs ${isDarkMode?'text-slate-500':'text-slate-400'}`}>All UUIDs are cryptographically random (crypto.randomUUID)</span>
                </div>
              </div>
            ) : (
              <div className={`text-center py-12 border-2 border-dashed rounded-xl ${isDarkMode?'border-slate-700 text-slate-500 bg-slate-800/30':'border-slate-200 text-slate-400 bg-slate-50'}`}>
                <FaRandom className="mx-auto mb-2 opacity-50" size={28}/>
                <div className="font-semibold">No UUIDs yet</div>
                <div className="text-xs mt-1">Adjust count/options and hit Generate</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
