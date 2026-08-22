import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaRulerCombined, FaEye, FaCog } from 'react-icons/fa';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

const UNITS = ['px', 'rem', 'em', '%', 'vw', 'vh', 'pt', 'ch', 'ex'];

function convertFromPx(px, unit, ctx) {
  const { baseFont, viewportWidth, viewportHeight, chWidth } = ctx;
  switch (unit) {
    case 'px': return px;
    case 'rem': case 'em': return px / baseFont;
    case '%': return (px / baseFont) * 100;
    case 'vw': return (px / viewportWidth) * 100;
    case 'vh': return (px / viewportHeight) * 100;
    case 'pt': return px * 0.75;
    case 'ch': return px / chWidth;
    case 'ex': return px / (chWidth * 0.5);
    default: return px;
  }
}
function convertToPx(value, unit, ctx) {
  const { baseFont, viewportWidth, viewportHeight, chWidth } = ctx;
  switch (unit) {
    case 'px': return value;
    case 'rem': case 'em': return value * baseFont;
    case '%': return (value / 100) * baseFont;
    case 'vw': return (value / 100) * viewportWidth;
    case 'vh': return (value / 100) * viewportHeight;
    case 'pt': return value / 0.75;
    case 'ch': return value * chWidth;
    case 'ex': return value * chWidth * 0.5;
    default: return value;
  }
}

export default function CssUnitConverter() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const siblings = useCategorySiblings('/css-unit-converter');
  const [inputValue, setInputValue] = useState(16);
  const [inputUnit, setInputUnit] = useState('px');
  const [baseFont, setBaseFont] = useState(16);
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [viewportHeight, setViewportHeight] = useState(1080);
  const [chWidth, setChWidth] = useState(8);
  const [results, setResults] = useState({});

  useEffect(() => {
    const qVal = searchParams.get('val') || searchParams.get('value') || searchParams.get('v');
    const qUnit = searchParams.get('unit') || searchParams.get('u');
    if (qVal && !isNaN(qVal)) setInputValue(Number(qVal));
    if (qUnit && UNITS.includes(qUnit.toLowerCase())) setInputUnit(qUnit.toLowerCase());
  }, [searchParams]);

  useEffect(() => { document.title = 'CSS Unit Converter | Rajlabs'; return () => { document.title = 'Utilities || Rajlabs'; }; }, []);

  const ctx = useMemo(()=> ({ baseFont, viewportWidth, viewportHeight, chWidth }), [baseFont, viewportWidth, viewportHeight, chWidth]);

  useEffect(() => {
    const px = convertToPx(inputValue, inputUnit, ctx);
    const converted = {};
    for (const unit of UNITS) converted[unit] = convertFromPx(px, unit, ctx);
    setResults(converted);
  }, [inputValue, inputUnit, ctx]);

  const copyValue = (val) => { navigator.clipboard.writeText(String(val)); toast.success('Copied!'); };
  const formatVal = (val) => { if (Number.isInteger(val)) return String(val); return val.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''); };
  const pxValue = convertToPx(inputValue, inputUnit, ctx);

  return (
    <ToolPageLayout 
      title="CSS Unit Converter" 
      icon={<FaRulerCombined />} 
      siblings={siblings} 
      currentPath="/css-unit-converter" 
      breadcrumb={[{label: 'CSS Utilities', path: '/color-picker'}]}
      activeParams={{ val: inputValue !== 16 ? inputValue : undefined, unit: inputUnit !== 'px' ? inputUnit : undefined }}
    >
      <Toaster position="top-right" />
      <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
        {/* Input */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className={`block font-bold mb-2 text-sm ${isDarkMode?'text-slate-200':'text-slate-700'}`}>Value</label>
              <div className="flex gap-2">
                <input type="number" value={inputValue} onChange={e=>setInputValue(+e.target.value)} className={`flex-1 p-3 border rounded-xl font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`} />
                <select value={inputUnit} onChange={e=>setInputUnit(e.target.value)} className={`px-4 py-3 border rounded-xl font-mono font-bold ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className={`mt-2 text-xs ${isDarkMode?'text-slate-400':'text-slate-500'}`}>= {formatVal(pxValue)}px base • {formatVal(convertToPx(1,'rem',ctx))}px per rem</div>
            </div>
            {/* Visual preview */}
            <div className={`flex-1 p-3 rounded-xl border flex flex-col items-center justify-center ${isDarkMode?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`}>
              <div className={`text-xs font-bold mb-2 ${isDarkMode?'text-slate-400':'text-slate-500'}`}><FaEye className="inline mr-1"/> Preview ({formatVal(pxValue)}px)</div>
              <div className="w-full flex items-center justify-center p-4">
                <div className="bg-indigo-600 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-xs" style={{ width: Math.min(280, Math.max(40, pxValue)) , height: 40 }}>{formatVal(pxValue)}px</div>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, (pxValue/400)*100)}%` }} />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className={`p-3 rounded-xl border grid grid-cols-2 lg:grid-cols-4 gap-3 ${isDarkMode?'bg-slate-800/50 border-slate-700':'bg-slate-50 border-slate-200'}`}>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}><FaCog className="inline mr-1"/> Base Font (px)</label>
              <input type="number" value={baseFont} onChange={e=>setBaseFont(Math.max(1, +e.target.value||16))} className={`w-full p-2 border rounded-xl font-mono text-sm ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`} />
              <div className="text-[11px] opacity-60">1rem = {baseFont}px</div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Viewport W (px)</label>
              <input type="number" value={viewportWidth} onChange={e=>setViewportWidth(+e.target.value||1920)} className={`w-full p-2 border rounded-xl font-mono text-sm ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Viewport H (px)</label>
              <input type="number" value={viewportHeight} onChange={e=>setViewportHeight(+e.target.value||1080)} className={`w-full p-2 border rounded-xl font-mono text-sm ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Ch width (px)</label>
              <input type="number" value={chWidth} onChange={e=>setChWidth(+e.target.value||8)} className={`w-full p-2 border rounded-xl font-mono text-sm ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`} />
              <div className="text-[11px] opacity-60">~ char width</div>
            </div>
          </div>

          {/* Results */}
          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`px-4 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800 text-slate-300 border-slate-700':'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <span>All Units</span>
              <span className="normal-case tracking-normal opacity-60">Click to copy • {UNITS.length} units</span>
            </div>
            {UNITS.map((unit) => (
              <div key={unit} className={`flex items-center justify-between px-4 py-3 border-b group cursor-pointer ${isDarkMode?'border-slate-800 hover:bg-slate-800/50':'border-slate-100 hover:bg-slate-50'} ${unit === inputUnit ? (isDarkMode?'bg-indigo-900/20':'bg-indigo-50') : ''}`} onClick={() => copyValue(formatVal(results[unit] || 0))}>
                <span className={`font-bold text-sm w-14 px-2 py-1 rounded-lg text-center ${unit===inputUnit ? 'bg-indigo-600 text-white' : isDarkMode?'bg-slate-800 text-indigo-300 border border-slate-700':'bg-slate-100 text-indigo-600 border border-slate-200'}`}>{unit}</span>
                <span className={`font-mono text-sm flex-1 text-right ${unit===inputUnit?'text-indigo-600 dark:text-indigo-400 font-bold': isDarkMode?'text-emerald-400':'text-emerald-700'}`}>{formatVal(results[unit] || 0)}<span className="opacity-60 ml-1">{unit}</span></span>
                <button onClick={(e)=>{ e.stopPropagation(); copyValue(formatVal(results[unit]||0)); }} className={`ml-3 p-1.5 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode?'bg-slate-800 text-slate-200 hover:bg-slate-700':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} title="Copy"><FaClipboard size={12} /></button>
              </div>
            ))}
            <div className={`px-4 py-3 ${isDarkMode?'bg-slate-800/30':'bg-slate-50'}`}>
              <div className={`p-2 rounded-xl font-mono text-xs ${isDarkMode?'bg-slate-800 text-slate-300 border border-slate-700':'bg-white text-slate-700 border border-slate-200'}`}>
                CSS: <span className="text-indigo-600 dark:text-indigo-400">width: {formatVal(results[inputUnit]||0)}{inputUnit};</span> <span className="opacity-60">/* {formatVal(pxValue)}px */</span>
                <button onClick={()=>copyValue(`width: ${formatVal(results[inputUnit]||0)}${inputUnit}; /* ${formatVal(pxValue)}px */`)} className={`ml-2 px-2 py-0.5 rounded-lg text-xs font-bold ${isDarkMode?'bg-slate-700 text-slate-200':'bg-slate-100 text-slate-700'}`}>Copy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
