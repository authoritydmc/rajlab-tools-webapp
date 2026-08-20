import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaPalette } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => { const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16); return hex.length === 1 ? '0' + hex : hex; }).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
  '#F43F5E', '#A855F7', '#0EA5E9', '#10B981', '#F59E0B',
];

export default function ColorPicker() {
  const siblings = useCategorySiblings('/color-picker');
  const { isDarkMode } = useTheme();
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });

  useEffect(() => {
    document.title = 'Color Picker | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  const updateFromHex = (val) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setHex(val);
      const r = hexToRgb(val);
      if (r) { setRgb(r); setHsl(rgbToHsl(r.r, r.g, r.b)); }
    }
  };

  const updateFromRgb = (r, g, b) => {
    const newRgb = { r: Math.max(0, Math.min(255, r)), g: Math.max(0, Math.min(255, g)), b: Math.max(0, Math.min(255, b)) };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const updateFromHsl = (h, s, l) => {
    const newHsl = { h: Math.max(0, Math.min(360, h)), s: Math.max(0, Math.min(100, s)), l: Math.max(0, Math.min(100, l)) };
    setHsl(newHsl);
    const r = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(r);
    setHex(rgbToHex(r.r, r.g, r.b));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <ToolPageLayout title="Color Picker & Converter" icon={<FaPalette />} siblings={siblings} currentPath="/color-picker" breadcrumb={[{label: 'Design Utilities', path: '/color-picker'}]}>
      <Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        {/* Color Preview */}
        <div className="mb-6">
          <div className="w-full h-32 rounded-lg border-2 border-gray-600" style={{ backgroundColor: hex }} />
        </div>
        {/* HEX */}
        <div className="mb-4">
          <label className="block font-bold mb-2">HEX</label>
          <div className="flex gap-2">
            <input type="color" value={hex} onChange={(e) => updateFromHex(e.target.value)} className="w-12 h-10 rounded cursor-pointer" />
            <input type="text" value={hex} onChange={(e) => updateFromHex(e.target.value)} className={`flex-1 p-2 border rounded-md font-mono ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
            <button onClick={() => copyToClipboard(hex)} className={`p-2 rounded-md ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}><FaClipboard /></button>
          </div>
        </div>
        {/* RGB */}
        <div className="mb-4">
          <label className="block font-bold mb-2">RGB</label>
          <div className="grid grid-cols-3 gap-2">
            {['r', 'g', 'b'].map(ch => (
              <div key={ch}>
                <label className="text-xs text-gray-400 uppercase">{ch}</label>
                <input type="number" min="0" max="255" value={rgb[ch]}
                  onChange={(e) => updateFromRgb(ch === 'r' ? +e.target.value : rgb.r, ch === 'g' ? +e.target.value : rgb.g, ch === 'b' ? +e.target.value : rgb.b)}
                  className={`w-full p-2 border rounded-md font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
              </div>
            ))}
          </div>
          <button onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className={`mt-2 p-2 rounded-md text-sm ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Copy RGB</button>
        </div>
        {/* HSL */}
        <div className="mb-4">
          <label className="block font-bold mb-2">HSL</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-400">H (0-360)</label>
              <input type="number" min="0" max="360" value={hsl.h}
                onChange={(e) => updateFromHsl(+e.target.value, hsl.s, hsl.l)}
                className={`w-full p-2 border rounded-md font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
            </div>
            <div>
              <label className="text-xs text-gray-400">S (0-100)</label>
              <input type="number" min="0" max="100" value={hsl.s}
                onChange={(e) => updateFromHsl(hsl.h, +e.target.value, hsl.l)}
                className={`w-full p-2 border rounded-md font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
            </div>
            <div>
              <label className="text-xs text-gray-400">L (0-100)</label>
              <input type="number" min="0" max="100" value={hsl.l}
                onChange={(e) => updateFromHsl(hsl.h, hsl.s, +e.target.value)}
                className={`w-full p-2 border rounded-md font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
            </div>
          </div>
          <button onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} className={`mt-2 p-2 rounded-md text-sm ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Copy HSL</button>
        </div>
        {/* Preset Colors */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Quick Colors</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(color => (
              <button key={color} onClick={() => updateFromHex(color)} className="w-8 h-8 rounded-md border-2 border-gray-600 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
