import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaFingerprint, FaDownload, FaUpload, FaExchangeAlt, FaEye, FaFileAlt, FaKey, FaCheck, FaTimes } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

async function hashMessage(message, algorithm) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function hashFile(file, algorithm) {
  const buf = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest(algorithm, buf);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function downloadBlob(content, filename, mime='text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
}

const ALGORITHMS = [
  { name: 'MD5', alg: 'MD5', custom: true },
  { name: 'SHA-1', alg: 'SHA-1' },
  { name: 'SHA-256', alg: 'SHA-256' },
  { name: 'SHA-384', alg: 'SHA-384' },
  { name: 'SHA-512', alg: 'SHA-512' },
];

export default function HashGenerator() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [isComputing, setIsComputing] = useState(false);
  const [hmacKey, setHmacKey] = useState('');
  const [hmacHashes, setHmacHashes] = useState({});
  const [hexUpper, setHexUpper] = useState(false);
  const [compareHash, setCompareHash] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [mode, setMode] = useState('text'); // text | file
  const fileRef = useRef(null);
  const siblings = useCategorySiblings('/hash-generator');

  useEffect(() => {
    document.title = 'Hash Generator | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  useEffect(() => {
    const qText = searchParams.get('text') || searchParams.get('input') || searchParams.get('q');
    if (qText !== null && qText !== undefined) {
      setInput(qText);
    }
  }, [searchParams]);

  const computeTextHashes = useCallback(async (text) => {
    if (!text) { setHashes({}); setHmacHashes({}); return; }
    setIsComputing(true);
    const results = {};
    for (const algo of ALGORITHMS) {
      try {
        if (algo.name === 'MD5') {
          results[algo.name] = CryptoJS.MD5(text).toString();
        } else {
          results[algo.name] = await hashMessage(text, algo.alg);
        }
      } catch { results[algo.name] = 'Error'; }
    }
    setHashes(results);
    // HMAC if key
    if (hmacKey) {
      const hmacRes = {};
      for (const algo of ALGORITHMS) {
        const map = { 'MD5':'MD5', 'SHA-1':'SHA1', 'SHA-256':'SHA256', 'SHA-384':'SHA384', 'SHA-512':'SHA512' };
        try {
          const fn = CryptoJS[`Hmac${map[algo.name]}`];
          if (fn) hmacRes[algo.name] = fn(text, hmacKey).toString();
          else hmacRes[algo.name] = 'N/A';
        } catch { hmacRes[algo.name]='Error'; }
      }
      setHmacHashes(hmacRes);
    } else {
      setHmacHashes({});
    }
    setIsComputing(false);
  }, [hmacKey]);

  useEffect(() => {
    if (mode !== 'text') return;
    computeTextHashes(input);
  }, [input, hmacKey, mode, computeTextHashes]);

  const handleFile = async (file) => {
    if (!file) return;
    setMode('file');
    setFileInfo({ name: file.name, size: file.size });
    setIsComputing(true);
    const results = {};
    for (const algo of ALGORITHMS) {
      try {
        if (algo.name === 'MD5') {
          const buf = await file.arrayBuffer();
          const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buf));
          results[algo.name] = CryptoJS.MD5(wordArray).toString();
        } else {
          results[algo.name] = await hashFile(file, algo.alg);
        }
      } catch { results[algo.name]='Error'; }
    }
    setHashes(results);
    setHmacHashes({});
    setIsComputing(false);
    toast.success('Hashed '+file.name);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const copyHash = (hash) => {
    const v = hexUpper ? hash.toUpperCase() : hash.toLowerCase();
    navigator.clipboard.writeText(v);
    toast.success('Copied!');
  };
  const copyAll = () => {
    const txt = Object.entries(hashes).map(([k,v])=>`${k}: ${hexUpper? v.toUpperCase():v}`).join('\n');
    navigator.clipboard.writeText(txt); toast.success('All copied!');
  };
  const downloadJson = () => {
    const payload = { input: mode==='file' ? fileInfo?.name : input, hashes: Object.fromEntries(Object.entries(hashes).map(([k,v])=>[k, hexUpper?v.toUpperCase():v])), hmac: Object.keys(hmacHashes).length? hmacHashes: undefined };
    downloadBlob(JSON.stringify(payload,null,2),'hashes.json','application/json');
  };

  const formatHash = (h) => hexUpper ? h.toUpperCase() : h.toLowerCase();
  const matchInfo = compareHash ? Object.entries(hashes).find(([,v])=> v.toLowerCase()===compareHash.toLowerCase().trim()) : null;

  return (
    <ToolPageLayout 
      title="Hash Generator" 
      icon={<FaFingerprint />} 
      breadcrumb={[{ label: 'Encryption & Encoding Utilities', path: '/base64-encoder-decoder' }]} 
      siblings={siblings} 
      currentPath="/hash-generator"
      activeParams={{ text: input.slice(0,120) }}
    >
      <div className="w-full">
        <Toaster position="top-right" />
        <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
          {/* Tabs */}
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDarkMode?'bg-slate-800/50 border-slate-700/50':'bg-slate-50 border-slate-200'}`}>
            <button onClick={()=>setMode('text')} className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${mode==='text' ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}><FaFileAlt className="inline mr-1"/> Text</button>
            <button onClick={()=>setMode('file')} className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${mode==='file' ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}><FaUpload className="inline mr-1"/> File</button>
            <div className="ml-auto flex items-center gap-2">
              <label className={`inline-flex items-center gap-1.5 text-xs ${isDarkMode?'text-slate-300':'text-slate-700'}`}><input type="checkbox" checked={hexUpper} onChange={e=>setHexUpper(e.target.checked)} className="accent-indigo-600"/> UPPERCASE</label>
              <button onClick={copyAll} disabled={!Object.keys(hashes).length} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${Object.keys(hashes).length? 'bg-emerald-600 text-white hover:bg-emerald-700':'bg-slate-300 text-slate-500 cursor-not-allowed'}`}><FaClipboard className="inline mr-1"/> Copy All</button>
              <button onClick={downloadJson} disabled={!Object.keys(hashes).length} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${Object.keys(hashes).length? (isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'):'opacity-40 border'}`}><FaDownload className="inline mr-1"/> JSON</button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {mode==='text' ? (
              <div>
                <label className={`block font-bold mb-2 text-sm ${isDarkMode?'text-slate-200':'text-slate-700'}`}>Input Text</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter text to hash... (live)"
                  className={`w-full h-28 p-3 border rounded-xl resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}
                />
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <button onClick={() => { setInput(''); setHashes({}); setFileInfo(null); }} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
                  <span className={`text-xs ${isDarkMode?'text-slate-400':'text-slate-500'}`}>{input.length} chars • {input ? new Blob([input]).size + ' bytes' : '0 bytes'}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <FaKey className={`${isDarkMode?'text-slate-400':'text-slate-500'}`} size={12}/>
                    <input value={hmacKey} onChange={e=>setHmacKey(e.target.value)} placeholder="HMAC key (optional)" className={`px-3 py-1.5 rounded-xl border text-xs font-mono w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode?'bg-slate-800 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <input ref={fileRef} type="file" className="hidden" onChange={e=>handleFile(e.target.files?.[0])} />
                <div onDragOver={e=>e.preventDefault()} onDrop={onDrop} onClick={()=>fileRef.current?.click()} className={`w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDarkMode?'border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300':'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600'}`}>
                  <FaUpload className="mx-auto mb-2 text-indigo-500" size={22}/>
                  <div className="font-semibold">Drop file here or click to browse</div>
                  <div className="text-xs opacity-70 mt-1">Any file • hashed client-side via WebCrypto</div>
                  {fileInfo && <div className="mt-3 text-xs font-mono">Selected: {fileInfo.name} ({(fileInfo.size/1024).toFixed(2)} KB)</div>}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={()=>fileRef.current?.click()} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${isDarkMode?'bg-blue-600 text-white hover:bg-blue-700':'bg-blue-600 text-white hover:bg-blue-700'}`}><FaUpload className="inline mr-1"/>Choose File</button>
                  <button onClick={()=>{ setMode('text'); setFileInfo(null); setHashes({}); }} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}><FaExchangeAlt className="inline mr-1"/>Back to Text</button>
                </div>
              </div>
            )}

            {/* Compare */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row gap-2 items-start sm:items-center ${isDarkMode?'bg-slate-800/50 border-slate-700':'bg-slate-50 border-slate-200'}`}>
              <div className="flex-1 w-full">
                <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Compare hash (paste expected)</label>
                <input value={compareHash} onChange={e=>setCompareHash(e.target.value)} placeholder="Paste expected hash to verify..." className={`w-full px-3 py-1.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode?'bg-slate-900 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
              </div>
              <div className="flex items-center gap-2 pt-4">
                {compareHash ? (matchInfo ? <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs"><FaCheck/> Match: {matchInfo[0]}</span> : <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs"><FaTimes/> No match</span>) : <span className={`text-xs ${isDarkMode?'text-slate-500':'text-slate-400'}`}>No compare hash</span>}
                {compareHash && <button onClick={()=>setCompareHash('')} className={`px-2 py-1 rounded-xl text-xs border ${isDarkMode?'bg-slate-700 border-slate-600 text-slate-300':'bg-white border-slate-200 text-slate-600'}`}>Clear</button>}
              </div>
            </div>

            {isComputing && <div className="text-center text-sm text-indigo-400 animate-pulse">Computing hashes...</div>}

            {Object.keys(hashes).length > 0 && (
              <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`px-4 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800 text-slate-300 border-slate-700':'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  <span><FaFingerprint className="inline mr-1 text-indigo-500"/> Hashes ({Object.keys(hashes).length})</span>
                  <span className={`${isDarkMode?'text-slate-400':'text-slate-500'} normal-case tracking-normal`}>{mode==='file' ? fileInfo?.name : `${input.length} chars`}</span>
                </div>
                {Object.entries(hashes).map(([name, hash]) => {
                  const isMatch = compareHash && hash.toLowerCase()===compareHash.toLowerCase().trim();
                  return (
                    <div key={name} className={`flex items-start justify-between px-4 py-3 border-b group ${isDarkMode?'border-slate-800':'border-slate-100'} ${isMatch ? (isDarkMode?'bg-emerald-900/20':'bg-emerald-50') : ''}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs px-2 py-0.5 rounded ${isMatch?'bg-emerald-600 text-white': isDarkMode?'bg-slate-800 text-indigo-300 border border-slate-700':'bg-slate-100 text-indigo-600 border border-slate-200'}`}>{name}</span>
                          <span className={`text-[11px] ${isDarkMode?'text-slate-500':'text-slate-400'}`}>{hash.length*4} bits • {hash.length} hex chars</span>
                          {isMatch && <span className="text-emerald-600 text-xs font-bold">✓ match</span>}
                        </div>
                        <div className={`font-mono text-xs break-all mt-1 ${isMatch?'text-emerald-600 dark:text-emerald-400': isDarkMode?'text-emerald-400':'text-emerald-700'}`}>{formatHash(hash)}</div>
                        {hmacHashes[name] && <div className={`font-mono text-[11px] break-all mt-1 ${isDarkMode?'text-amber-400':'text-amber-600'}`}>HMAC: {formatHash(hmacHashes[name])}</div>}
                      </div>
                      <div className="ml-2 flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => copyHash(hash)} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-800 text-slate-200 hover:bg-slate-700':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} title="Copy"><FaClipboard size={12} /></button>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(hmacHashes).length>0 && <div className={`px-4 py-2 text-[11px] ${isDarkMode?'text-amber-300 bg-amber-900/10':'text-amber-700 bg-amber-50'}`}>HMAC mode active — key length {hmacKey.length} chars</div>}
              </div>
            )}

            <div className={`text-[11px] text-center ${isDarkMode?'text-slate-500':'text-slate-400'}`}>All hashing is 100% client-side • MD5 via CryptoJS, SHA via WebCrypto Subtle</div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
