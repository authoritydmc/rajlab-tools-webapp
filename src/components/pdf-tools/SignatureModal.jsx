import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../themeContext';
import { FaPen, FaFont, FaImage, FaTimes, FaCheck, FaTrash, FaSave, FaHistory } from 'react-icons/fa';
import { loadPrefs, savePrefs, loadSignatures, addSignature, removeSignature, compressImageForStorage } from '../../utils/signatureStorage';
import { toast } from 'react-hot-toast';

function trimCanvasToDataUrl(sourceCanvas) {
  try {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const ctx = sourceCanvas.getContext('2d');
    const data = ctx.getImageData(0, 0, w, h).data;
    let top = h, left = w, right = 0, bottom = 0;
    let found = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 12) {
          found = true;
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }
    if (!found) return null;
    const pad = 8;
    const sx = Math.max(0, left - pad);
    const sy = Math.max(0, top - pad);
    const sw = Math.min(w - sx, right - left + pad * 2 + 1);
    const sh = Math.min(h - sy, bottom - top + pad * 2 + 1);
    const out = document.createElement('canvas');
    out.width = sw;
    out.height = sh;
    out.getContext('2d').drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
    return out.toDataURL('image/png');
  } catch (e) {
    try { return sourceCanvas.toDataURL('image/png'); } catch (e2) { return null; }
  }
}

function renderTypedToDataUrl(text, fontFamily, color) {
  const tmp = document.createElement('canvas');
  const mctx = tmp.getContext('2d');
  mctx.font = `italic 52px ${fontFamily}`;
  const metrics = mctx.measureText(text);
  const textW = Math.ceil(metrics.width) + 40;
  const canvasW = Math.max(320, Math.min(640, textW));
  const canvasH = 160;
  tmp.width = canvasW;
  tmp.height = canvasH;
  const ctx = tmp.getContext('2d');
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = color;
  ctx.font = `italic 52px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvasW / 2, canvasH / 2);
  const trimmed = trimCanvasToDataUrl(tmp);
  return trimmed || tmp.toDataURL('image/png');
}

const SWATCHES = ['#000000', '#1e40af', '#dc2626', '#15803d', '#7c3aed', '#ea580c'];
const FONT_STYLES = [
  { name: 'Cursive Elegant', font: 'cursive' },
  { name: 'Casual Script', font: 'Brush Script MT, cursive' },
  { name: 'Formal Serif', font: 'Georgia, serif' },
  { name: 'Modern Sans', font: 'sans-serif' },
];

export default function SignatureModal({ isOpen, onClose, onSaveSignature }) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('draw');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [fontFamily, setFontFamily] = useState('cursive');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [savedSigns, setSavedSigns] = useState([]);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const prefs = loadPrefs();
      setStrokeColor(prefs.strokeColor || '#000000');
      setStrokeWidth(prefs.strokeWidth || 3);
      setFontFamily(prefs.fontFamily || 'cursive');
      setTypedText(prefs.typedText || '');
      setPrefsLoaded(true);
      const list = loadSignatures();
      setSavedSigns(list);
      setActiveTab(list.length > 0 ? 'saved' : 'draw');
    } catch (e) { /* prefs load failed */ }
    setHasDrawn(false);
    setUploadedImage(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !prefsLoaded) return;
    savePrefs({ strokeColor, strokeWidth, fontFamily, typedText });
  }, [isOpen, prefsLoaded, strokeColor, strokeWidth, fontFamily, typedText]);

  useEffect(() => {
    if (isOpen && activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const readAsDataUrl = (file) => new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = (ev) => res(ev.target.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    try {
      for (const file of files) {
        const raw = await readAsDataUrl(file);
        const compressed = await compressImageForStorage(raw, 700);
        const label = file.name ? file.name.replace(/\.[^.]+$/, '').slice(0, 28) : 'Uploaded sign';
        addSignature(compressed, label);
        setUploadedImage(compressed);
      }
      setSavedSigns(loadSignatures());
      toast.success(files.length > 1 ? `${files.length} signs saved to your library` : 'Sign saved to your library');
    } catch (e) {
      toast.error('Failed to save uploaded image');
    }
    e.target.value = '';
  };

  const handleDeleteSaved = (id) => {
    const next = removeSignature(id);
    setSavedSigns(next);
    toast.success('Removed from library');
  };

  const handleUseSaved = (dataUrl) => {
    onSaveSignature(dataUrl);
    onClose();
  };

  const handleConfirm = async () => {
    let dataUrl = null;
    let label = 'My Sign';
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const trimmed = trimCanvasToDataUrl(canvas);
      if (!trimmed) { toast.error('Draw something first'); return; }
      dataUrl = trimmed;
      label = 'Drawn sign';
    } else if (activeTab === 'type') {
      if (!typedText.trim()) return;
      dataUrl = renderTypedToDataUrl(typedText.trim(), fontFamily, strokeColor);
      label = typedText.trim().slice(0, 28) || 'Typed sign';
    } else if (activeTab === 'upload') {
      if (!uploadedImage) return;
      dataUrl = uploadedImage;
      label = 'Uploaded sign';
    } else if (activeTab === 'saved') {
      return;
    }
    if (dataUrl) {
      try {
        const compressed = await compressImageForStorage(dataUrl, 700);
        addSignature(compressed, label);
        setSavedSigns(loadSignatures());
        onSaveSignature(compressed);
      } catch (e) {
        addSignature(dataUrl, label);
        onSaveSignature(dataUrl);
      }
      onClose();
    }
  };

  const confirmDisabled =
    (activeTab === 'draw' && !hasDrawn) ||
    (activeTab === 'type' && !typedText.trim()) ||
    (activeTab === 'upload' && !uploadedImage) ||
    activeTab === 'saved';

  const tabBtn = (id, icon, label) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-1.5 pb-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaPen className="text-indigo-500" /> Add Signature or Stamp
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-white transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="flex border-b border-slate-700/50 px-4 pt-3 gap-1 overflow-x-auto scrollbar-thin shrink-0">
          {tabBtn('saved', <FaHistory size={12} />, `Saved${savedSigns.length ? ` (${savedSigns.length})` : ''}`)}
          {tabBtn('draw', <FaPen size={12} />, 'Draw')}
          {tabBtn('type', <FaFont size={12} />, 'Type')}
          {tabBtn('upload', <FaImage size={12} />, 'Upload')}
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-y-auto overscroll-contain">
          {activeTab === 'saved' && (
            <div className="flex flex-col gap-3">
              {savedSigns.length === 0 ? (
                <div className={`rounded-xl border-2 border-dashed p-8 text-center ${isDarkMode ? 'border-slate-700 bg-slate-800/30 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
                  <FaSave size={24} className="mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold">No saved signs yet</p>
                  <p className="text-xs mt-1 opacity-70">Draw, type or upload a sign — we will save it here automatically so you can reuse it next time. Your signs stay on this device only.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-400">Tap any sign to place it on the page. Click precisely where you want it — it will not just land at the top.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {savedSigns.map((s) => (
                      <div key={s.id} className={`group relative rounded-xl border p-2 flex flex-col gap-2 hover:shadow-md transition-all ${isDarkMode ? 'bg-slate-800/60 border-slate-700 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 hover:border-indigo-400'}`}>
                        <button onClick={() => handleUseSaved(s.dataUrl)} className={`flex-1 rounded-lg flex items-center justify-center p-2 min-h-[84px] overflow-hidden ${isDarkMode ? 'bg-white' : 'bg-white border border-slate-100'}`} title="Click to place on PDF">
                          <img src={s.dataUrl} alt={s.name} className="max-w-full max-h-[64px] object-contain" />
                        </button>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-medium truncate flex-1" title={s.name}>{s.name}</span>
                          <button onClick={() => handleDeleteSaved(s.id)} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0" title="Delete">
                            <FaTrash size={10} />
                          </button>
                        </div>
                        <button onClick={() => handleUseSaved(s.dataUrl)} className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold">Use and place</button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">Signs are stored locally in this browser only (up to 12). Transparent PNGs work best.</p>
                </>
              )}
            </div>
          )}

          {activeTab === 'draw' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Color:</span>
                  <div className="flex gap-1.5 items-center">
                    {SWATCHES.map((c) => (
                      <button key={c} onClick={() => setStrokeColor(c)} style={{ backgroundColor: c }} className={`w-6 h-6 rounded-full border-2 transition-transform ${strokeColor === c ? 'scale-110 border-white shadow' : 'border-transparent'}`} title={c} />
                    ))}
                    <label className={`w-6 h-6 rounded-full border-2 overflow-hidden cursor-pointer relative ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`} title="Custom color">
                      <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="absolute -inset-2 w-10 h-10 p-0 border-0 cursor-pointer" />
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Width:</span>
                  {[2, 3, 5, 7].map((w) => (
                    <button key={w} onClick={() => setStrokeWidth(w)} className={`px-2 py-1 rounded-full text-xs font-bold border ${strokeWidth === w ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{w}</button>
                  ))}
                </div>
                <button onClick={clearCanvas} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-500/10">
                  <FaTrash size={10} /> Clear
                </button>
              </div>

              <div className={`w-full h-48 rounded-xl border relative overflow-hidden touch-none ${isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'}`} style={{ cursor: 'crosshair' }}>
                <canvas ref={canvasRef} width={560} height={192} className="w-full h-full cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
                {!hasDrawn && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-500">Sign with your mouse, trackpad or finger here</div>}
              </div>
              <p className="text-[11px] text-slate-500">Tip: after you save, click exactly where on the PDF you want it — your sign will be placed there.</p>
            </div>
          )}

          {activeTab === 'type' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Your Name / Text:</label>
                <input type="text" placeholder="e.g. John Doe" value={typedText} onChange={(e) => setTypedText(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Color:</span>
                <div className="flex gap-1.5 items-center">
                  {SWATCHES.map((c) => (
                    <button key={c} onClick={() => setStrokeColor(c)} style={{ backgroundColor: c }} className={`w-6 h-6 rounded-full border-2 transition-transform ${strokeColor === c ? 'scale-110 border-white' : 'border-transparent'}`} />
                  ))}
                  <label className={`w-6 h-6 rounded-full border-2 overflow-hidden cursor-pointer relative ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}><input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="absolute -inset-2 w-10 h-10 p-0 border-0 cursor-pointer" /></label>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Signature Style:</label>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_STYLES.map((style) => (
                    <button key={style.name} onClick={() => setFontFamily(style.font)} className={`p-3 rounded-xl border text-left transition-all ${fontFamily === style.font ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold' : isDarkMode ? 'border-slate-800 bg-slate-800/40 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                      <div className="text-[11px] opacity-60 mb-1">{style.name}</div>
                      <div style={{ fontFamily: style.font, color: strokeColor }} className="text-lg truncate">{typedText || 'Sample Sign'}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col gap-3">
              <label className={`flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${isDarkMode ? 'border-slate-700 hover:border-indigo-500 bg-slate-800/30' : 'border-slate-300 hover:border-indigo-500 bg-slate-50'}`}>
                {uploadedImage ? <img src={uploadedImage} alt="Uploaded signature" className="max-h-36 object-contain p-2 bg-white rounded" /> : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FaImage size={28} className="text-indigo-400" />
                    <span className="text-xs font-semibold">Click to upload — you can select multiple images</span>
                    <span className="text-[11px] opacity-70">PNG, JPG, SVG. Transparent PNG recommended. All saved to Saved tab</span>
                  </div>
                )}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              {uploadedImage && <button onClick={() => setUploadedImage(null)} className="text-xs text-red-400 self-center hover:underline">Remove preview and upload more</button>}
              {savedSigns.length > 0 && <p className="text-[11px] text-slate-500 text-center">Saved to your library — find everything in the Saved tab.</p>}
            </div>
          )}
        </div>

        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={confirmDisabled} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/25">
            <FaCheck /> Add and place on PDF
          </button>
        </div>
      </div>
    </div>
  );
}
