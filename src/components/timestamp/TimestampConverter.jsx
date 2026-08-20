import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaSync, FaClock, FaExchangeAlt } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland"
];

function getRelativeTime(date) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffMs = date.getTime() - Date.now();
  
  const diffSecs = Math.round(diffMs / 1000);
  if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second');
  
  const diffMins = Math.round(diffMs / (1000 * 60));
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute');
  
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
  
  const diffMonths = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30));
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');
  
  const diffYears = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365));
  return rtf.format(diffYears, 'year');
}

function parseDateInput(val) {
  const trimmed = val.trim();
  if (!trimmed) return null;
  let date;
  const num = Number(trimmed);
  if (!isNaN(num) && num > 0) {
    if (num > 1e12 || num < -1e12) date = new Date(num);
    else date = new Date(num * 1000);
  } else {
    date = new Date(trimmed);
  }
  if (isNaN(date.getTime())) return null;
  return date;
}

function formatDuration(ms) {
  const isNegative = ms < 0;
  ms = Math.abs(ms);
  
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days} days`);
  if (hours > 0) parts.push(`${hours} hours`);
  if (minutes > 0) parts.push(`${minutes} minutes`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} seconds`);
  
  return `${isNegative ? '-' : ''}${parts.join(', ')}`;
}

export default function TimestampConverter() {
  const siblings = useCategorySiblings('/timestamp-converter');
  const { isDarkMode } = useTheme();
  
  // Main Converter
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  
  // Comparison Calculator
  const [comp1, setComp1] = useState('');
  const [comp2, setComp2] = useState('');
  const [compResult, setCompResult] = useState('');

  const [now, setNow] = useState(new Date());
  const [targetTz, setTargetTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    document.title = 'Advanced Timestamp Converter | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Main Converter Logic
  useEffect(() => {
    if (!input.trim()) { setError(''); setResults(null); return; }
    const date = parseDateInput(input);
    if (!date) {
      setError('Invalid date or timestamp format.'); 
      setResults(null); 
    } else {
      setResults(date);
      setError('');
    }
  }, [input, targetTz]);

  // Comparison Logic
  useEffect(() => {
    if (!comp1.trim() || !comp2.trim()) {
      setCompResult('');
      return;
    }
    const d1 = parseDateInput(comp1);
    const d2 = parseDateInput(comp2);
    if (!d1 || !d2) {
      setCompResult('Invalid format in one or both inputs.');
      return;
    }
    
    const diffMs = d2.getTime() - d1.getTime();
    const duration = formatDuration(diffMs);
    
    if (diffMs > 0) {
      setCompResult(`Time 2 is ${duration} after Time 1`);
    } else if (diffMs < 0) {
      setCompResult(`Time 2 is ${duration.replace('-', '')} before Time 1`);
    } else {
      setCompResult('Both times are exactly the same.');
    }
  }, [comp1, comp2]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(String(text));
    toast.success('Copied!');
  };

  const formatTz = (date, tz) => {
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: tz, dateStyle: 'full', timeStyle: 'long' }).format(date);
    } catch(e) {
      return "Invalid Timezone";
    }
  };

  return (
    <ToolPageLayout 
      title="Timestamp Converter" 
      icon={<FaClock />} 
      breadcrumb={[{label: 'Developer Tools', path: '/timestamp-converter'}]}
      siblings={siblings} 
      currentPath="/timestamp-converter"
    >
      <div className={`max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 shadow-lg rounded-md ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
        
        {/* Live Current Time Dashboard */}
        <div className={`mb-8 p-5 rounded-xl border-l-4 shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 border-l-blue-500' : 'bg-blue-50 border-gray-200 border-l-blue-500'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-blue-500 flex items-center gap-2"><FaClock className="animate-pulse"/> Live Current Time</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className={`p-3 rounded-md ${isDarkMode ? 'bg-slate-900/60 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl'}`}>
              <div className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Unix Epoch (sec)</div>
              <div className="font-mono text-blue-400 font-bold flex justify-between items-center">
                {Math.floor(now.getTime() / 1000)}
                <button onClick={() => copyToClipboard(Math.floor(now.getTime() / 1000))} className="text-gray-400 hover:text-blue-400"><FaClipboard/></button>
              </div>
            </div>
            <div className={`p-3 rounded-md ${isDarkMode ? 'bg-slate-900/60 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl'}`}>
              <div className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Unix Epoch (ms)</div>
              <div className="font-mono text-yellow-400 font-bold flex justify-between items-center">
                {now.getTime()}
                <button onClick={() => copyToClipboard(now.getTime())} className="text-gray-400 hover:text-yellow-400"><FaClipboard/></button>
              </div>
            </div>
            <div className={`p-3 rounded-md ${isDarkMode ? 'bg-slate-900/60 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl'}`}>
              <div className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Local Time</div>
              <div className={`font-mono font-bold truncate ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{now.toLocaleString()}</div>
            </div>
            <div className={`p-3 rounded-md ${isDarkMode ? 'bg-slate-900/60 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl'}`}>
              <div className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">UTC Time</div>
              <div className={`font-mono font-bold truncate ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{now.toISOString()}</div>
            </div>
          </div>
        </div>

        {/* Converter Area */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          
          {/* Input Side */}
          <div className="flex-1">
            <label className="block font-bold mb-3 text-lg">Instant Converter</label>
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 1700000000, 1700000000123, 2024-01-15T12:00:00Z, or Jan 15, 2024"
              className={`w-full h-32 p-4 border rounded-xl resize-none font-mono text-[15px] shadow-inner focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'}`} 
            />
            
            <div className="mt-6">
               <label className="block font-bold mb-3 text-sm text-gray-500 uppercase tracking-wide">Target Timezone</label>
               <select 
                  value={targetTz} 
                  onChange={(e) => setTargetTz(e.target.value)}
                  className={`w-full p-3 rounded-lg border font-medium outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <optgroup label="Detected Local Timezone">
                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>{Intl.DateTimeFormat().resolvedOptions().timeZone} (Local)</option>
                  </optgroup>
                  <optgroup label="Common Timezones">
                    {COMMON_TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </optgroup>
               </select>
            </div>
            {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">{error}</div>}
          </div>

          {/* Results Side */}
          <div className="flex-1 min-w-0">
            <label className="block font-bold mb-3 text-lg opacity-0 hidden lg:block">Output</label>
            {results ? (
              <div className={`rounded-xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                {[
                  { label: 'Relative Time', value: getRelativeTime(results), color: 'text-orange-400' },
                  { label: `Time in ${targetTz}`, value: formatTz(results, targetTz), color: 'text-indigo-400' },
                  { label: 'Local Time', value: results.toLocaleString(), color: 'text-green-400' },
                  { label: 'UTC Time', value: results.toUTCString(), color: 'text-purple-400' },
                  { label: 'ISO 8601', value: results.toISOString(), color: 'text-pink-400' },
                  { label: 'Unix Epoch (seconds)', value: Math.floor(results.getTime() / 1000), color: 'text-yellow-400' },
                  { label: 'Unix Epoch (milliseconds)', value: results.getTime(), color: 'text-yellow-400' },
                ].map((row, idx) => (
                  <div key={row.label} className={`flex items-center justify-between px-5 py-4 group ${idx !== 0 ? (isDarkMode ? 'border-t border-gray-700/50' : 'border-t border-gray-200') : ''}`}>
                    <div className="flex-1 min-w-0 pr-4">
                      <span className={`block font-semibold text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{row.label}</span>
                      <div className={`font-mono text-[15px] font-medium break-all ${isDarkMode ? row.color : row.color.replace('400', '600')}`}>{String(row.value)}</div>
                    </div>
                    <button onClick={() => copyToClipboard(row.value)} className="opacity-0 group-hover:opacity-100 p-2 rounded hover:bg-gray-700 transition-all text-gray-400 hover:text-white shrink-0">
                      <FaClipboard size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
               <div className={`h-full min-h-[300px] flex items-center justify-center rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
                 <span className="font-medium text-sm">Valid output will appear here</span>
               </div>
            )}
          </div>
        </div>

        {/* Time Comparison Area */}
        <div className={`p-6 rounded-xl border shadow-sm mt-8 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-6">
            <FaExchangeAlt className="text-indigo-500" />
            <h3 className="text-xl font-bold">Time Difference Calculator</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 w-full">
               <label className="block text-sm font-semibold mb-2">Time 1</label>
               <input 
                 type="text" 
                 value={comp1} 
                 onChange={e => setComp1(e.target.value)}
                 placeholder="Epoch or Date (e.g. 1700000000)"
                 className={`w-full p-3 rounded-lg border outline-none font-mono text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
               />
             </div>
             <div className="font-bold text-gray-400 hidden md:block mt-6">VS</div>
             <div className="flex-1 w-full">
               <label className="block text-sm font-semibold mb-2">Time 2</label>
               <input 
                 type="text" 
                 value={comp2} 
                 onChange={e => setComp2(e.target.value)}
                 placeholder="Epoch or Date (e.g. 2024-12-31)"
                 className={`w-full p-3 rounded-lg border outline-none font-mono text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
               />
             </div>
          </div>

          <div className="mt-6 text-center">
            {compResult ? (
              <div className={`inline-block p-4 rounded-lg font-mono font-bold text-lg border ${compResult.includes('Invalid') ? 'bg-red-100 text-red-600 border-red-200' : (isDarkMode ? 'bg-indigo-900/50 text-indigo-300 border-indigo-700' : 'bg-indigo-50 text-indigo-700 border-indigo-200')}`}>
                {compResult}
              </div>
            ) : (
              <span className="text-gray-500 text-sm italic">Enter two valid timestamps to see the exact duration between them.</span>
            )}
          </div>
        </div>

      </div>
    </ToolPageLayout>
  );
}
