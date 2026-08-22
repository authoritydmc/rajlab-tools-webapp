import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaRulerCombined } from 'react-icons/fa';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

const BASE_FONT_SIZE = 16;

const UNITS = ['px', 'rem', 'em', '%', 'vw', 'vh', 'pt'];

function convertFromPx(px, unit, viewportWidth = 1920, viewportHeight = 1080) {
  switch (unit) {
    case 'px': return px;
    case 'rem': case 'em': return px / BASE_FONT_SIZE;
    case '%': return (px / BASE_FONT_SIZE) * 100;
    case 'vw': return (px / viewportWidth) * 100;
    case 'vh': return (px / viewportHeight) * 100;
    case 'pt': return px * 0.75;
    default: return px;
  }
}

function convertToPx(value, unit, viewportWidth = 1920, viewportHeight = 1080) {
  switch (unit) {
    case 'px': return value;
    case 'rem': case 'em': return value * BASE_FONT_SIZE;
    case '%': return (value / 100) * BASE_FONT_SIZE;
    case 'vw': return (value / 100) * viewportWidth;
    case 'vh': return (value / 100) * viewportHeight;
    case 'pt': return value / 0.75;
    default: return value;
  }
}

export default function CssUnitConverter() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const siblings = useCategorySiblings('/css-unit-converter');
  const [inputValue, setInputValue] = useState(16);
  const [inputUnit, setInputUnit] = useState('px');
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [viewportHeight, setViewportHeight] = useState(1080);
  const [results, setResults] = useState({});

  useEffect(() => {
    const qVal = searchParams.get('val') || searchParams.get('value') || searchParams.get('v');
    const qUnit = searchParams.get('unit') || searchParams.get('u');
    if (qVal && !isNaN(qVal)) setInputValue(Number(qVal));
    if (qUnit && UNITS.includes(qUnit.toLowerCase())) setInputUnit(qUnit.toLowerCase());
  }, [searchParams]);

  useEffect(() => {
    document.title = 'CSS Unit Converter | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  useEffect(() => {
    const px = convertToPx(inputValue, inputUnit, viewportWidth, viewportHeight);
    const converted = {};
    for (const unit of UNITS) {
      converted[unit] = convertFromPx(px, unit, viewportWidth, viewportHeight);
    }
    setResults(converted);
  }, [inputValue, inputUnit, viewportWidth, viewportHeight]);

  const copyValue = (val) => {
    navigator.clipboard.writeText(String(val));
    toast.success('Copied!');
  };

  const formatVal = (val) => {
    if (Number.isInteger(val)) return String(val);
    return val.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  };

  return (
    <ToolPageLayout 
      title="CSS Unit Converter" 
      icon={<FaRulerCombined />} 
      siblings={siblings} 
      currentPath="/css-unit-converter" 
      breadcrumb={[{label: 'CSS Utilities', path: '/color-picker'}]}
      activeParams={{
        val: inputValue !== 16 ? inputValue : undefined,
        unit: inputUnit !== 'px' ? inputUnit : undefined,
      }}
    >
      <Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
        {/* Input */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Base Font Size: {BASE_FONT_SIZE}px (1rem = 16px)</label>
        </div>
        <div className="flex gap-2 mb-4">
          <input type="number" value={inputValue} onChange={(e) => setInputValue(+e.target.value)}
            className={`flex-1 p-2 border rounded-md font-mono ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
          <select value={inputUnit} onChange={(e) => setInputUnit(e.target.value)}
            className={`p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        {/* Viewport */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div>
            <label className="block text-sm font-bold mb-1">Viewport Width (px)</label>
            <input type="number" value={viewportWidth} onChange={(e) => setViewportWidth(+e.target.value)}
              className={`w-full p-2 border rounded-md font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Viewport Height (px)</label>
            <input type="number" value={viewportHeight} onChange={(e) => setViewportHeight(+e.target.value)}
              className={`w-full p-2 border rounded-md font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
          </div>
        </div>
        {/* Results */}
        <div className={`rounded border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-900 border-gray-700'}`}>
          {UNITS.map((unit) => (
            <div key={unit} className={`flex items-center justify-between px-4 py-3 border-b border-gray-700 group ${unit === inputUnit ? 'bg-blue-900/30' : ''}`}>
              <span className="text-blue-300 font-semibold text-sm w-12">{unit}</span>
              <span className="text-green-400 font-mono text-sm flex-1 text-right">{formatVal(results[unit] || 0)}</span>
              <button onClick={() => copyValue(formatVal(results[unit] || 0))} className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300">
                <FaClipboard size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToolPageLayout>
  );
}
