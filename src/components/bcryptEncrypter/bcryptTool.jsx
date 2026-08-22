import React, { useState, useEffect, useMemo } from 'react';
import { FaClipboard, FaTrash, FaHashtag, FaCheck, FaTimes, FaHistory, FaKey, FaEye, FaEyeSlash, FaDownload, FaShieldAlt } from 'react-icons/fa';
import { PiSelectionAllFill } from 'react-icons/pi';
import { toast, Toaster } from 'react-hot-toast';
import bcrypt from 'bcryptjs';
import { useTheme } from '../../themeContext';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

function parseBcryptHash(hash) {
  // $2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  const m = hash.match(/^\$(2[aby])\$(\d{2})\$(.{53})$/);
  if (!m) return null;
  return { version: m[1], rounds: parseInt(m[2],10), saltAndHash: m[3], algo: 'bcrypt', length: hash.length };
}

export default function BcryptTool() {
  const { isDarkMode } = useTheme();
  const [mode, setMode] = useState('hash'); // hash | verify
  const [inputText, setInputText] = useState('');
  const [outputHash, setOutputHash] = useState('');
  const [saltRounds, setSaltRounds] = useState(10);
  const [showPassword, setShowPassword] = useState(false);
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHashing, setIsHashing] = useState(false);
  const siblings = useCategorySiblings('/bcrypt-hashing');

  useEffect(() => {
    document.title = 'BCrypt Hashing Tool | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bcrypt-history')||'[]');
      if (Array.isArray(saved)) setHistory(saved.slice(0,20));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem('bcrypt-history', JSON.stringify(history.slice(0,20)));
  }, [history]);

  const parsed = useMemo(()=> outputHash ? parseBcryptHash(outputHash) : null, [outputHash]);
  const verifyParsed = useMemo(()=> verifyHash ? parseBcryptHash(verifyHash) : null, [verifyHash]);

  const generateHash = async () => {
    if (!inputText) { toast.error('Please enter text to hash'); return; }
    setIsHashing(true);
    try {
      const t0 = performance.now();
      const hash = await bcrypt.hash(inputText, saltRounds);
      const ms = Math.round(performance.now()-t0);
      setOutputHash(hash);
      setHistory(h=> [{ input: inputText.slice(0,30), hash, rounds: saltRounds, ms, at: new Date().toISOString() }, ...h].slice(0,20));
      toast.success(`Hashed in ${ms}ms`);
    } catch (e) { toast.error('Error generating hash: '+e.message); }
    setIsHashing(false);
  };

  const handleVerify = async () => {
    if (!inputText || !verifyHash) { toast.error('Enter both password and hash'); return; }
    try {
      const ok = await bcrypt.compare(inputText, verifyHash);
      setVerifyResult(ok);
      toast[ok?'success':'error'](ok ? '✓ Password matches hash!' : '✗ Password does NOT match');
    } catch (e) { toast.error('Invalid hash: '+e.message); setVerifyResult(null); }
  };

  const handleSelectAll = (id) => document.getElementById(id)?.select();
  const handleCopy = (txt) => { navigator.clipboard.writeText(txt); toast.success('Copied!'); };
  const handleClear = () => { setInputText(''); setOutputHash(''); setVerifyHash(''); setVerifyResult(null); };

  const strengthInfo = useMemo(()=>{
    if (!inputText) return null;
    const len = inputText.length;
    let score = 0;
    if (len>=8) score++; if (len>=12) score++; if (/[A-Z]/.test(inputText)) score++; if (/[0-9]/.test(inputText)) score++; if (/[^A-Za-z0-9]/.test(inputText)) score++;
    const labels = ['Very weak','Weak','Fair','Good','Strong','Very strong'];
    const colors = ['text-red-500','text-orange-500','text-yellow-500','text-lime-500','text-emerald-500','text-green-500'];
    return { score: Math.min(score,5), label: labels[Math.min(score,5)], color: colors[Math.min(score,5)] };
  }, [inputText]);

  return (
    <ToolPageLayout title="BCrypt Hashing" icon={<FaHashtag />} breadcrumb={[{label: 'Encryption & Encoding Utilities', path: '/base64-encoder-decoder'}]} siblings={siblings} currentPath="/bcrypt-hashing" activeParams={{ rounds: saltRounds }}>
      <div className="w-full">
        <Toaster position="top-right" />
        <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
          {/* Mode tabs */}
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDarkMode?'bg-slate-800/50 border-slate-700/50':'bg-slate-50 border-slate-200'}`}>
            <button onClick={()=>setMode('hash')} className={`px-4 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 ${mode==='hash' ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}><FaHashtag size={11}/> Hash</button>
            <button onClick={()=>setMode('verify')} className={`px-4 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 ${mode==='verify' ? 'bg-emerald-600 text-white border-emerald-600' : isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}><FaCheck size={11}/> Verify</button>
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-xs hidden sm:inline ${isDarkMode?'text-slate-400':'text-slate-500'}`}>All client-side • no server</span>
              <button onClick={handleClear} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${isDarkMode?'bg-red-600 text-white hover:bg-red-700':'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1"/>Clear</button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Input */}
            <div>
              <label htmlFor="input" className={`block mb-2 font-bold text-sm ${isDarkMode?'text-slate-200':'text-slate-700'}`}>
                {mode==='verify' ? 'Password to Verify' : 'Text to Hash'}
              </label>
              <div className="relative">
                <textarea
                  id="input"
                  value={inputText}
                  onChange={e=>setInputText(e.target.value)}
                  placeholder={mode==='verify' ? 'Enter password to check against hash...' : 'Enter text to hash using bcrypt...'}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full h-28 p-3 pr-12 border rounded-xl resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 placeholder-slate-500' : 'bg-white text-gray-900 border-slate-200 placeholder-slate-400'}`}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={()=>setShowPassword(s=>!s)} className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-slate-200 hover:bg-slate-600':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} title={showPassword ? 'Hide' : 'Show'}>{showPassword ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}</button>
                  <button onClick={() => handleSelectAll('input')} className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`} title="Select All"><PiSelectionAllFill size={14} /></button>
                </div>
              </div>
              {strengthInfo && (
                <div className={`mt-2 flex items-center gap-2 text-xs ${isDarkMode?'text-slate-400':'text-slate-500'}`}>
                  <FaShieldAlt size={12}/>
                  <span>Strength: <strong className={strengthInfo.color}>{strengthInfo.label}</strong></span>
                  <span>• {inputText.length} chars</span>
                  <div className="flex gap-0.5 ml-2">
                    {[0,1,2,3,4].map(i=> <div key={i} className={`w-6 h-1.5 rounded-full ${i < strengthInfo.score ? 'bg-emerald-500' : isDarkMode?'bg-slate-700':'bg-slate-200'}`} />)}
                  </div>
                </div>
              )}
            </div>

            {/* Salt rounds */}
            <div className={`p-3 rounded-xl border flex flex-wrap gap-4 items-end ${isDarkMode?'bg-slate-800/50 border-slate-700':'bg-slate-50 border-slate-200'}`}>
              <div className="flex-1 min-w-[200px]">
                <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Cost Factor (Salt Rounds): {saltRounds}</label>
                <input type="range" min="4" max="15" value={saltRounds} onChange={e=>setSaltRounds(parseInt(e.target.value))} className="w-full accent-indigo-600" />
                <div className="flex justify-between text-[11px] opacity-60">
                  <span>4 (fast)</span><span>10 (default)</span><span>15 (very slow)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min="4" max="15" value={saltRounds} onChange={e=>setSaltRounds(Math.max(4,Math.min(15,parseInt(e.target.value)||10)))} className={`w-20 p-2 border rounded-xl font-mono text-sm text-center ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`} />
                <button onClick={generateHash} disabled={isHashing} className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap ${isHashing? 'opacity-60 cursor-not-allowed bg-slate-400 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'}`}>{isHashing ? 'Hashing...' : mode==='verify' ? 'Hash & Compare' : 'Generate Hash'}</button>
              </div>
            </div>
            <div className={`text-[11px] ${isDarkMode?'text-slate-500':'text-slate-400'}`}>Higher rounds = stronger but slower (10 is recommended). Time grows exponentially ~2^rounds.</div>

            {/* Output hash */}
            <div>
              <label htmlFor="output" className={`block mb-2 font-bold text-sm ${isDarkMode?'text-slate-200':'text-slate-700'}`}>BCrypt Hash Output</label>
              <div className="relative">
                <textarea
                  id="output"
                  value={outputHash}
                  placeholder="Your hashed bcrypt output will appear here..."
                  readOnly
                  className={`w-full h-28 p-3 border rounded-xl resize-none font-mono text-xs break-all focus:outline-none ${isDarkMode ? 'bg-slate-800 text-emerald-400 border-slate-700 placeholder-slate-500' : 'bg-slate-50 text-emerald-700 border-slate-200 placeholder-slate-400'}`}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => handleSelectAll('output')} className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`} title="Select All"><PiSelectionAllFill size={14} /></button>
                  <button onClick={()=>handleCopy(outputHash)} disabled={!outputHash} className={`p-1.5 rounded-lg ${outputHash? (isDarkMode ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'):'opacity-40 cursor-not-allowed bg-slate-300 text-slate-600'}`} title="Copy"><FaClipboard size={14} /></button>
                </div>
              </div>
              {parsed && (
                <div className={`mt-2 flex flex-wrap gap-2 text-xs font-mono ${isDarkMode?'text-slate-400':'text-slate-600'}`}>
                  <span className={`px-2 py-1 rounded-lg border ${isDarkMode?'bg-slate-800 border-slate-700':'bg-slate-100 border-slate-200'}`}>Version: <strong className={isDarkMode?'text-white':'text-slate-800'}>${parsed.version}</strong></span>
                  <span className={`px-2 py-1 rounded-lg border ${isDarkMode?'bg-slate-800 border-slate-700':'bg-slate-100 border-slate-200'}`}>Rounds: <strong className={isDarkMode?'text-white':'text-slate-800'}>{parsed.rounds}</strong></span>
                  <span className={`px-2 py-1 rounded-lg border ${isDarkMode?'bg-slate-800 border-slate-700':'bg-slate-100 border-slate-200'}`}>Length: {parsed.length}</span>
                  <span className={`px-2 py-1 rounded-lg border ${parsed.rounds < 10 ? 'bg-amber-500/20 border-amber-500/30 text-amber-600' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600'}`}>{parsed.rounds < 10 ? 'Weak cost' : 'Secure'}</span>
                </div>
              )}
            </div>

            {/* Verify mode */}
            {mode==='verify' && (
              <div className={`p-4 rounded-xl border space-y-3 ${isDarkMode?'bg-slate-800/50 border-slate-700':'bg-amber-50 border-amber-200'}`}>
                <label className={`block font-bold text-sm ${isDarkMode?'text-slate-200':'text-slate-700'}`}><FaKey className="inline mr-1"/> Paste hash to verify against</label>
                <div className="relative">
                  <textarea value={verifyHash} onChange={e=>{ setVerifyHash(e.target.value.trim()); setVerifyResult(null); }} placeholder="$2a$10$..." className={`w-full h-20 p-3 border rounded-xl resize-none font-mono text-xs break-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDarkMode?'bg-slate-900 text-white border-slate-700 placeholder-slate-500':'bg-white text-slate-900 border-amber-200 placeholder-slate-400'}`} />
                  {verifyParsed && <div className={`mt-2 text-xs ${isDarkMode?'text-slate-400':'text-slate-600'}`}>Detected: version ${verifyParsed.version} • {verifyParsed.rounds} rounds</div>}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleVerify} className="px-5 py-2 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white">Verify Now</button>
                  <button onClick={()=>{ setVerifyHash(outputHash); setVerifyResult(null); toast.success('Copied generated hash'); }} disabled={!outputHash} className={`px-4 py-2 rounded-xl text-xs font-semibold border ${outputHash? (isDarkMode?'bg-slate-700 border-slate-600 text-white hover:bg-slate-600':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'):'opacity-40 cursor-not-allowed'}`}>Use generated hash</button>
                </div>
                {verifyResult !== null && (
                  <div className={`p-3 rounded-xl flex items-center gap-2 font-bold text-sm border ${verifyResult ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400'}`}>
                    {verifyResult ? <FaCheck className="text-emerald-500"/> : <FaTimes className="text-red-500"/>}
                    {verifyResult ? 'Password MATCHES the hash' : 'Password DOES NOT match'}
                  </div>
                )}
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className={`rounded-xl border overflow-hidden ${isDarkMode?'bg-slate-800/50 border-slate-700':'bg-white border-slate-200'}`}>
                <div className={`px-4 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800 text-slate-300 border-slate-700':'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  <span><FaHistory className="inline mr-1"/> History ({history.length})</span>
                  <button onClick={()=>{ setHistory([]); localStorage.removeItem('bcrypt-history'); toast.success('History cleared'); }} className={`px-2 py-1 rounded-lg text-xs border ${isDarkMode?'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600':'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Clear</button>
                </div>
                <div className="max-h-[220px] overflow-auto">
                  {history.map((h,i)=>(
                    <div key={i} className={`px-4 py-2 border-b flex items-start justify-between gap-2 group ${isDarkMode?'border-slate-800 hover:bg-slate-900/50':'border-slate-100 hover:bg-slate-50'}`}>
                      <div className="min-w-0">
                        <div className={`font-mono text-xs break-all ${isDarkMode?'text-emerald-400':'text-emerald-700'}`}>{h.hash}</div>
                        <div className={`text-[11px] ${isDarkMode?'text-slate-500':'text-slate-400'}`}>"{h.input}" • {h.rounds} rounds • {h.ms}ms • {new Date(h.at).toLocaleTimeString()}</div>
                      </div>
                      <button onClick={()=>handleCopy(h.hash)} className={`p-1.5 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode?'bg-slate-700 text-slate-200 hover:bg-slate-600':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} title="Copy"><FaClipboard size={11}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
