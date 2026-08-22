import React, { useState, useEffect, useRef } from 'react';
import { FaClipboard, FaDownload, FaTrash, FaImage, FaUpload, FaEye, FaInfoCircle, FaPaste, FaExternalLinkAlt } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';

function parseBase64Info(b64) {
  if (!b64) return { valid: false, mime: '', sizeKB: 0, dims: null };
  const m = b64.match(/^data:([^;,]+)?((?:;[^,]+)*),/);
  let mime = '';
  let headerLen = 0;
  if (m) {
    mime = m[1] || '';
    headerLen = m[0].length;
  }
  // size estimate: base64 length * 0.75
  const b64data = m ? b64.slice(headerLen) : b64;
  const clean = b64data.replace(/\s/g, '');
  const valid = /^[A-Za-z0-9+/]*={0,2}$/.test(clean) && clean.length % 4 === 0;
  const sizeBytes = clean.length ? Math.floor(clean.length * 0.75) - (clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0) : 0;
  // guess mime if missing
  if (!mime && valid && clean) {
    if (clean.startsWith('/9j/')) mime = 'image/jpeg';
    else if (clean.startsWith('iVBORw0KGgo')) mime = 'image/png';
    else if (clean.startsWith('R0lGOD')) mime = 'image/gif';
    else if (clean.startsWith('UklGR')) mime = 'image/webp';
  }
  return { valid: !!valid && sizeBytes>0, mime: mime || 'image/png', sizeKB: (sizeBytes/1024).toFixed(2), sizeBytes, cleanLen: clean.length };
}

export default function Base64ToImagePreviewGenerator() {
  const { isDarkMode } = useTheme();
  const [base64String, setBase64String] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [dims, setDims] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const siblings = useCategorySiblings('/base64-to-image');

  useEffect(() => {
    document.title = 'Base64 to Image Decoder | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  const info = parseBase64Info(base64String);

  const handleBase64InputChange = (event) => {
    const v = event.target.value.trim();
    setBase64String(v);
    setError('');
    setDims(null);
    if (!v) { setImagePreview(''); return; }
    const parsed = parseBase64Info(v);
    if (!parsed.valid) { setImagePreview(''); setError('Invalid Base64 string'); return; }
    // normalize: if missing data: prefix, add it
    let src = v;
    if (!v.startsWith('data:')) {
      src = `data:${parsed.mime};base64,${v.replace(/\s/g,'')}`;
    }
    setImagePreview(src);
  };

  const handleCopy = () => { navigator.clipboard.writeText(base64String); toast.success('Copied!'); };
  const handleDownload = () => {
    if (!imagePreview) { toast.error('No image to download!'); return; }
    const ext = info.mime.includes('jpeg') ? 'jpg' : info.mime.includes('png') ? 'png' : info.mime.includes('gif') ? 'gif' : info.mime.includes('webp') ? 'webp' : 'png';
    const link = document.createElement('a');
    link.href = imagePreview;
    link.download = `image.${ext}`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success('Downloaded');
    setTimeout(() => triggerChaiModal('Base64 to Image'), 600);
  };
  const handleClear = () => { setBase64String(''); setImagePreview(''); setDims(null); setError(''); };
  const handleFile = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
      const v = String(e.target.result||'');
      setBase64String(v); setImagePreview(v); setError(''); toast.success('Loaded '+file.name);
    };
    r.readAsDataURL(file);
  };
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { setBase64String(text.trim()); handleBase64InputChange({ target: { value: text.trim() }}); toast.success('Pasted'); }
    } catch { toast.error('Clipboard read failed'); }
  };
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
    else {
      const txt = e.dataTransfer.getData('text');
      if (txt) handleBase64InputChange({ target: { value: txt }});
    }
  };

  return (
    <ToolPageLayout title="Base64 to Image" icon={<FaImage />} breadcrumb={[{label: 'Encryption & Encoding Utilities', path: '/base64-encoder-decoder'}]} siblings={siblings} currentPath="/base64-to-image" activeParams={{ text: base64String.slice(0,120) }}>
      <div className="w-full">
        <Toaster position="top-right" />
        <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
          {/* Header stats */}
          <div className={`flex flex-wrap items-center gap-3 px-4 py-3 border-b text-xs ${isDarkMode?'bg-slate-800/50 border-slate-700/50 text-slate-300':'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <div className="flex flex-wrap gap-3">
              <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{info.cleanLen || 0}</strong> b64 chars</span>
              <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{info.sizeKB}</strong> KB</span>
              {info.mime && <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${isDarkMode?'bg-slate-700 text-slate-200':'bg-slate-200 text-slate-700'}`}>{info.mime}</span>}
              {info.valid ? <span className="text-emerald-500 font-bold">● valid</span> : base64String ? <span className="text-red-500 font-bold">● invalid</span> : <span className="text-slate-400">● empty</span>}
              {dims && <span className="text-indigo-400 font-bold">{dims.w}×{dims.h}px</span>}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={handlePaste} className={`px-2.5 py-1 rounded-xl text-xs font-semibold border inline-flex items-center gap-1 ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}><FaPaste size={11}/> Paste</button>
              <button onClick={()=>fileRef.current?.click()} className={`px-2.5 py-1 rounded-xl text-xs font-semibold border inline-flex items-center gap-1 ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}><FaUpload size={11}/> Upload</button>
              <button onClick={handleClear} className={`p-1.5 rounded-xl ${isDarkMode?'bg-red-600 text-white hover:bg-red-700':'bg-red-500 text-white hover:bg-red-600'}`} title="Clear"><FaTrash size={12}/></button>
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*,.txt" className="hidden" onChange={e=>handleFile(e.target.files?.[0])} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Input */}
            <div className={`flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r ${isDarkMode?'border-slate-700/50':'border-slate-200/50'}`}>
              <div className={`px-3 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span className="inline-flex items-center gap-1.5"><FaImage className="text-indigo-400" size={12}/> Base64 Input</span>
                <div className="flex items-center gap-1">
                  <button onClick={handleCopy} disabled={!base64String} className={`p-1.5 rounded-lg ${base64String? (isDarkMode?'bg-slate-700 text-slate-200 hover:bg-slate-600':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'):'opacity-40 cursor-not-allowed bg-slate-200'}`} title="Copy"><FaClipboard size={12}/></button>
                </div>
              </div>
              <div
                onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
                onDragLeave={()=>setDragOver(false)}
                onDrop={handleDrop}
                className={`relative flex-1 ${dragOver ? 'bg-indigo-500/10' : ''}`}
              >
                <textarea
                  value={base64String}
                  onChange={handleBase64InputChange}
                  placeholder="Paste Base64 string here (with or without data:image/png;base64, prefix) — or drop image/text file..."
                  className={`w-full h-[340px] p-3 font-mono text-xs resize-none focus:outline-none overflow-y-auto ${isDarkMode?'bg-[#1e1e1e] text-slate-100 placeholder-slate-500':'bg-white text-slate-900 placeholder-slate-400'}`}
                  spellCheck={false}
                />
                {dragOver && <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/20 backdrop-blur-sm pointer-events-none"><span className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm">Drop to load</span></div>}
              </div>
              <div className={`px-3 py-2 flex items-center justify-between border-t text-[11px] ${isDarkMode?'bg-slate-800/30 border-slate-700/50 text-slate-400':'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <span>{base64String.length} chars • {error ? <span className="text-red-500">{error}</span> : info.valid ? <span className="text-emerald-500">ready to preview</span> : 'enter base64'}</span>
                <span className="hidden sm:inline">Supports drag-drop & paste</span>
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col min-h-0">
              <div className={`px-3 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span className="inline-flex items-center gap-1.5"><FaEye className="text-emerald-400" size={12}/> Preview</span>
                <div className="flex items-center gap-1">
                  <button onClick={handleCopy} disabled={!base64String} className={`px-2 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${base64String? 'bg-emerald-600 text-white hover:bg-emerald-700':'opacity-40 cursor-not-allowed bg-slate-300 text-slate-600'}`}><FaClipboard size={11}/> Copy</button>
                  <button onClick={handleDownload} disabled={!imagePreview} className={`p-1.5 rounded-lg ${imagePreview? (isDarkMode?'bg-blue-600 text-white hover:bg-blue-700':'bg-blue-600 text-white hover:bg-blue-700'):'opacity-40 cursor-not-allowed bg-slate-300 text-slate-600'}`} title="Download"><FaDownload size={12}/></button>
                  {imagePreview && <a href={imagePreview} target="_blank" rel="noreferrer" className={`p-1.5 rounded-lg ${isDarkMode?'bg-slate-700 text-slate-200 hover:bg-slate-600':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} title="Open in new tab"><FaExternalLinkAlt size={12}/></a>}
                </div>
              </div>
              <div className={`flex-1 flex items-center justify-center p-4 min-h-[340px] ${isDarkMode?'bg-[#0f172a]':'bg-slate-50'}`}>
                {imagePreview && !error ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-[320px] object-contain rounded-lg border shadow-lg"
                    style={{ background: isDarkMode ? '#1e293b' : '#fff' }}
                    onLoad={e=> setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                    onError={()=> setError('Failed to render image — check Base64 validity')}
                  />
                ) : (
                  <div className={`text-center ${isDarkMode?'text-slate-500':'text-slate-400'}`}>
                    <FaImage className="mx-auto mb-2 opacity-50" size={36}/>
                    <div className="text-sm font-semibold">No preview</div>
                    <div className="text-xs mt-1 max-w-[240px] mx-auto">Paste a Base64 string (with or without <span className="font-mono">data:image/…;base64,</span> prefix) to see preview</div>
                    {error && <div className="mt-3 text-red-500 text-xs font-mono">{error}</div>}
                  </div>
                )}
              </div>
              <div className={`px-3 py-2 border-t text-[11px] space-y-1 ${isDarkMode?'bg-slate-800/30 border-slate-700/50 text-slate-400':'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <div className="flex items-center gap-2"><FaInfoCircle size={11}/><span>Auto-detects MIME from header or content; downloads with correct extension.</span></div>
                {info.mime && dims && <div className="font-mono">{info.mime} • {dims.w}×{dims.h} • {info.sizeKB} KB • {info.cleanLen} chars</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
