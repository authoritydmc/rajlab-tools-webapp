import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaPalette, FaEyeDropper, FaRandom, FaDownload, FaCheck, FaTimes, FaHistory, FaMagic } from 'react-icons/fa';
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
function luminance(r,g,b){
  const a=[r,g,b].map(v=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); });
  return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
}
function contrastRatio(l1,l2){ const lighter=Math.max(l1,l2), darker=Math.min(l1,l2); return (lighter+0.05)/(darker+0.05); }

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
  '#F43F5E', '#A855F7', '#0EA5E9', '#10B981', '#F59E0B',
];

function harmonyColors(hsl, type){
  const {h,s,l}=hsl;
  const toHex = (hh)=> rgbToHex(...Object.values(hslToRgb((hh+360)%360,s,l)));
  switch(type){
    case 'complementary': return [toHex(h), toHex(h+180)];
    case 'analogous': return [toHex(h-30), toHex(h), toHex(h+30)];
    case 'triadic': return [toHex(h), toHex(h+120), toHex(h+240)];
    case 'tetradic': return [toHex(h), toHex(h+90), toHex(h+180), toHex(h+270)];
    case 'split': return [toHex(h), toHex(h+150), toHex(h+210)];
    case 'monochromatic': return [0.2,0.4,0.6,0.8,1].map(f=> rgbToHex(...Object.values(hslToRgb(h, s, Math.round(l*f + (1-f)* (l>50? 20:80))))));
    default: return [toHex(h)];
  }
}

export default function ColorPicker() {
  const siblings = useCategorySiblings('/color-picker');
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [history, setHistory] = useState(['#3B82F6']);
  const [harmony, setHarmony] = useState('complementary');

  useEffect(() => {
    const qHex = searchParams.get('hex') || searchParams.get('color') || searchParams.get('c');
    if (qHex) {
      const formatted = qHex.startsWith('#') ? qHex : `#${qHex}`;
      const parsedRgb = hexToRgb(formatted);
      if (parsedRgb) { setHex(formatted); setRgb(parsedRgb); setHsl(rgbToHsl(parsedRgb.r, parsedRgb.g, parsedRgb.b)); }
    }
  }, [searchParams]);

  useEffect(() => { document.title = 'Color Picker | Rajlabs'; return () => { document.title = 'Utilities || Rajlabs'; }; }, []);
  useEffect(()=>{ try{ const h=JSON.parse(localStorage.getItem('color-history')||'null'); if(Array.isArray(h)) setHistory(h.slice(0,16)); }catch{} },[]);
  useEffect(()=>{ localStorage.setItem('color-history', JSON.stringify(history.slice(0,16))); },[history]);

  const pushHistory = (c)=> setHistory(h=> [c, ...h.filter(x=>x!==c)].slice(0,16));

  const updateFromHex = (val, skipHistory=false) => {
    let v = val.trim();
    if (/^#[0-9A-Fa-f]{3}$/.test(v)) v = '#'+v.slice(1).split('').map(c=>c+c).join('');
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      setHex(v);
      const r = hexToRgb(v);
      if (r) { setRgb(r); setHsl(rgbToHsl(r.r, r.g, r.b)); }
      if (!skipHistory) pushHistory(v);
    } else if (/^[0-9A-Fa-f]{6}$/.test(v)) {
      updateFromHex('#'+v, skipHistory);
    }
  };
  const updateFromRgb = (r, g, b) => {
    const newRgb = { r: Math.max(0, Math.min(255, r)), g: Math.max(0, Math.min(255, g)), b: Math.max(0, Math.min(255, b)) };
    setRgb(newRgb); const h=rgbToHex(newRgb.r, newRgb.g, newRgb.b); setHex(h); setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b)); pushHistory(h);
  };
  const updateFromHsl = (h, s, l) => {
    const newHsl = { h: Math.max(0, Math.min(360, h)), s: Math.max(0, Math.min(100, s)), l: Math.max(0, Math.min(100, l)) };
    setHsl(newHsl); const r = hslToRgb(newHsl.h, newHsl.s, newHsl.l); setRgb(r); const hx=rgbToHex(r.r, r.g, r.b); setHex(hx); pushHistory(hx);
  };
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };
  const pickEyeDropper = async ()=>{
    if (!window.EyeDropper) { toast.error('EyeDropper not supported in this browser'); return; }
    try{ const ed=new window.EyeDropper(); const {sRGBHex}=await ed.open(); updateFromHex(sRGBHex); toast.success('Picked '+sRGBHex); }catch{}
  };
  const randomColor = ()=>{
    const h='#'+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0');
    updateFromHex(h);
  };

  const harm = useMemo(()=> harmonyColors(hsl, harmony), [hsl, harmony]);
  const lum = useMemo(()=> luminance(rgb.r,rgb.g,rgb.b), [rgb]);
  const contrastWhite = useMemo(()=> contrastRatio(lum, luminance(255,255,255)), [lum]);
  const contrastBlack = useMemo(()=> contrastRatio(lum, luminance(0,0,0)), [lum]);
  const bestText = contrastWhite > contrastBlack ? '#ffffff' : '#000000';

  const cssVar = `--primary: ${hex};\n--primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n--primary-hsl: ${hsl.h} ${hsl.s}% ${hsl.l}%;`;
  const tailwind = `// tailwind.config.js\ncolors: {\n  primary: '${hex}',\n  'primary-rgb': 'rgb(${rgb.r} ${rgb.g} ${rgb.b})',\n}`;

  return (
    <ToolPageLayout 
      title="Color Picker & Converter" 
      icon={<FaPalette />} 
      siblings={siblings} 
      currentPath="/color-picker" 
      breadcrumb={[{label: 'Design Utilities', path: '/color-picker'}]}
      activeParams={{ hex: hex !== '#3B82F6' ? hex.replace('#', '') : undefined }}
    >
      <Toaster position="top-right" />
      <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
        {/* Preview header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="lg:col-span-2 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={pickEyeDropper} className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}><FaEyeDropper size={12}/> Eyedropper</button>
              <button onClick={randomColor} className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${isDarkMode?'bg-indigo-600 text-white hover:bg-indigo-700':'bg-indigo-600 text-white hover:bg-indigo-700'}`}><FaRandom size={12}/> Random</button>
              <button onClick={()=>copyToClipboard(hex)} className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-bold border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200':'bg-white border-slate-200 text-slate-700'}`}><FaClipboard className="inline mr-1"/> Copy HEX</button>
            </div>
            <div className="w-full h-36 sm:h-40 rounded-xl border-2 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: hex, borderColor: isDarkMode?'#334155':'#e2e8f0' }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`, backgroundSize:'20px 20px', backgroundPosition:'0 0, 0 10px, 10px -10px, -10px 0px' }} />
              <div className="relative px-4 py-2 rounded-xl font-mono text-sm font-bold shadow-lg border" style={{ backgroundColor: bestText==='white'?'rgba(0,0,0,0.6)':'rgba(255,255,255,0.85)', color: hex, borderColor: isDarkMode?'#475569':'#cbd5e1' }}>{hex.toUpperCase()} • {bestText==='white'?'white text':'black text'} best</div>
            </div>
            {/* Sliders */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                {label:'R', val:rgb.r, min:0,max:255, onChange:v=>updateFromRgb(v,rgb.g,rgb.b)},
                {label:'G', val:rgb.g, min:0,max:255, onChange:v=>updateFromRgb(rgb.r,v,rgb.b)},
                {label:'B', val:rgb.b, min:0,max:255, onChange:v=>updateFromRgb(rgb.r,rgb.g,v)},
              ].map(s=>(
                <div key={s.label}>
                  <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}>{s.label}</label>
                  <input type="range" min={s.min} max={s.max} value={s.val} onChange={e=>s.onChange(+e.target.value)} className="w-full accent-indigo-600" />
                  <input type="number" min={s.min} max={s.max} value={s.val} onChange={e=>s.onChange(+e.target.value)} className={`w-full mt-1 p-1 border rounded-lg font-mono text-xs text-center ${isDarkMode?'bg-slate-800 text-white border-slate-700':'bg-white text-slate-900 border-slate-200'}`} />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                {label:'H', val:hsl.h, min:0,max:360, onChange:v=>updateFromHsl(v,hsl.s,hsl.l)},
                {label:'S', val:hsl.s, min:0,max:100, onChange:v=>updateFromHsl(hsl.h,v,hsl.l)},
                {label:'L', val:hsl.l, min:0,max:100, onChange:v=>updateFromHsl(hsl.h,hsl.s,v)},
              ].map(s=>(
                <div key={s.label}>
                  <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}>{s.label}</label>
                  <input type="range" min={s.min} max={s.max} value={s.val} onChange={e=>s.onChange(+e.target.value)} className="w-full accent-indigo-600" />
                  <input type="number" min={s.min} max={s.max} value={s.val} onChange={e=>s.onChange(+e.target.value)} className={`w-full mt-1 p-1 border rounded-lg font-mono text-xs text-center ${isDarkMode?'bg-slate-800 text-white border-slate-700':'bg-white text-slate-900 border-slate-200'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: inputs & contrast */}
          <div className={`p-4 sm:p-6 border-t lg:border-t-0 lg:border-l space-y-4 ${isDarkMode?'bg-slate-800/30 border-slate-700/50':'bg-slate-50/50 border-slate-200'}`}>
            {/* HEX */}
            <div>
              <label className={`block font-bold mb-2 text-sm ${isDarkMode?'text-slate-200':'text-slate-700'}`}>HEX</label>
              <div className="flex gap-2">
                <input type="color" value={hex} onChange={(e) => updateFromHex(e.target.value)} className="w-10 h-9 rounded cursor-pointer p-0 border-0" />
                <input type="text" value={hex} onChange={(e) => updateFromHex(e.target.value)} className={`flex-1 p-2 border rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`} />
                <button onClick={() => copyToClipboard(hex)} className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}><FaClipboard /></button>
              </div>
            </div>
            {/* RGB/HSL copy rows */}
            <div className="grid grid-cols-1 gap-2">
              <div className={`flex items-center justify-between p-2 rounded-xl border ${isDarkMode?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
                <span className="font-mono text-xs">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
                <button onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className={`px-2 py-1 rounded-lg text-xs font-bold ${isDarkMode?'bg-slate-800 text-slate-200':'bg-slate-100 text-slate-700'}`}>Copy</button>
              </div>
              <div className={`flex items-center justify-between p-2 rounded-xl border ${isDarkMode?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
                <span className="font-mono text-xs">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</span>
                <button onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} className={`px-2 py-1 rounded-lg text-xs font-bold ${isDarkMode?'bg-slate-800 text-slate-200':'bg-slate-100 text-slate-700'}`}>Copy</button>
              </div>
            </div>
            {/* Contrast checker */}
            <div className={`p-3 rounded-xl border ${isDarkMode?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
              <div className={`text-xs font-bold mb-2 ${isDarkMode?'text-slate-200':'text-slate-700'}`}>WCAG Contrast</div>
              <div className="space-y-2">
                {[
                  {label:'On white', ratio: contrastRatio(lum, luminance(255,255,255)), bg:'#ffffff', fg:hex},
                  {label:'On black', ratio: contrastRatio(lum, luminance(0,0,0)), bg:'#000000', fg:hex},
                ].map(r=>(
                  <div key={r.label} className="flex items-center justify-between p-2 rounded-lg" style={{ background: r.bg, color: r.fg }}>
                    <span className="text-xs font-bold" style={{ color: r.bg==='white' ? '#000' : r.fg }}>{r.label}</span>
                    <span className="font-mono text-xs font-bold flex items-center gap-1" style={{ color: r.fg }}>
                      {r.ratio.toFixed(2)}:1 {r.ratio>=7 ? <FaCheck className="text-emerald-500"/> : r.ratio>=4.5 ? <FaCheck className="text-lime-500"/> : <FaTimes className="text-red-500"/>}
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${r.ratio>=7?'bg-emerald-600 text-white': r.ratio>=4.5?'bg-lime-600 text-white':'bg-red-600 text-white'}`}>{r.ratio>=7?'AAA': r.ratio>=4.5?'AA':'Fail'}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Quick colors */}
            <div>
              <label className={`block font-bold mb-2 text-sm ${isDarkMode?'text-slate-200':'text-slate-700'}`}>Quick Colors</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button key={color} onClick={() => updateFromHex(color)} className="w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: color, borderColor: isDarkMode?'#334155':'#e2e8f0' }} title={color} />
                ))}
              </div>
            </div>
            {/* History */}
            {history.length>0 && (
              <div>
                <label className={`block font-bold mb-2 text-sm flex items-center gap-1 ${isDarkMode?'text-slate-200':'text-slate-700'}`}><FaHistory size={12}/> Recent</label>
                <div className="flex flex-wrap gap-1.5">
                  {history.map(c=>(
                    <button key={c} onClick={()=>updateFromHex(c)} className="w-7 h-7 rounded-lg border hover:scale-105 transition-transform" style={{ backgroundColor: c, borderColor: isDarkMode?'#334155':'#e2e8f0' }} title={c} />
                  ))}
                  <button onClick={()=>{ setHistory([]); localStorage.removeItem('color-history'); }} className={`px-2 py-1 rounded-lg text-xs border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-400':'bg-white border-slate-200 text-slate-500'}`}>Clear</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Harmony & exports */}
        <div className={`px-4 sm:px-6 py-4 border-t space-y-4 ${isDarkMode?'bg-slate-800/20 border-slate-700/50':'bg-white border-slate-200'}`}>
          <div className="flex flex-wrap items-center gap-2">
            {['complementary','analogous','triadic','tetradic','split','monochromatic'].map(t=>(
              <button key={t} onClick={()=>setHarmony(t)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border ${harmony===t ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}>{t}</button>
            ))}
            <span className={`ml-auto text-xs ${isDarkMode?'text-slate-500':'text-slate-400'}`}><FaMagic className="inline mr-1"/>Click color to apply</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {harm.map(c=>(
              <button key={c} onClick={()=>updateFromHex(c)} className="group rounded-xl overflow-hidden border hover:scale-[1.02] transition-transform" style={{ borderColor: isDarkMode?'#334155':'#e2e8f0' }}>
                <div className="h-16" style={{ backgroundColor: c }} />
                <div className={`px-2 py-1.5 text-xs font-mono font-bold flex items-center justify-between ${isDarkMode?'bg-slate-800 text-slate-200':'bg-slate-50 text-slate-700'}`}><span>{c.toUpperCase()}</span><FaClipboard size={10} className="opacity-0 group-hover:opacity-100"/></div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${isDarkMode?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`}>
              <div className={`text-xs font-bold mb-2 flex items-center justify-between ${isDarkMode?'text-slate-300':'text-slate-700'}`}>CSS Variables <button onClick={()=>copyToClipboard(cssVar)} className={`px-2 py-1 rounded-lg text-xs ${isDarkMode?'bg-slate-800 text-slate-200':'bg-white border border-slate-200 text-slate-700'}`}>Copy</button></div>
              <pre className={`p-2 rounded-lg font-mono text-xs overflow-auto ${isDarkMode?'bg-slate-800 text-slate-200':'bg-white text-slate-700 border border-slate-200'}`}>{cssVar}</pre>
            </div>
            <div className={`p-3 rounded-xl border ${isDarkMode?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`}>
              <div className={`text-xs font-bold mb-2 flex items-center justify-between ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Tailwind <button onClick={()=>copyToClipboard(tailwind)} className={`px-2 py-1 rounded-lg text-xs ${isDarkMode?'bg-slate-800 text-slate-200':'bg-white border border-slate-200 text-slate-700'}`}>Copy</button></div>
              <pre className={`p-2 rounded-lg font-mono text-xs overflow-auto ${isDarkMode?'bg-slate-800 text-slate-200':'bg-white text-slate-700 border border-slate-200'}`}>{tailwind}</pre>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
