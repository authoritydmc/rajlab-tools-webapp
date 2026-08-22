import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../themeContext';
import { FaPen, FaFont, FaImage, FaTimes, FaCheck, FaTrash } from 'react-icons/fa';

export default function SignatureModal({ isOpen, onClose, onSaveSignature }) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'type' | 'upload'
  
  // Draw state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Type state
  const [typedText, setTypedText] = useState('');
  const [fontFamily, setFontFamily] = useState('cursive');
  
  // Upload state
  const [uploadedImage, setUploadedImage] = useState(null);

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

  // Canvas drawing handlers
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Image Upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Convert Typed text into an image DataURL
  const renderTypedToDataURL = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = strokeColor;
    ctx.font = `italic 48px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedText, 300, 100);
    return canvas.toDataURL('image/png');
  };

  const handleConfirm = () => {
    let dataUrl = null;
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      dataUrl = canvas.toDataURL('image/png');
    } else if (activeTab === 'type') {
      if (!typedText.trim()) return;
      dataUrl = renderTypedToDataURL();
    } else if (activeTab === 'upload') {
      if (!uploadedImage) return;
      dataUrl = uploadedImage;
    }

    if (dataUrl) {
      onSaveSignature(dataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaPen className="text-indigo-500" /> Add Signature or Stamp
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-white transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-700/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'draw'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FaPen /> Draw
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'type'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FaFont /> Type
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FaImage /> Upload Image
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex flex-col gap-4">
          {/* DRAW TAB */}
          {activeTab === 'draw' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Color:</span>
                  <div className="flex gap-1.5">
                    {['#000000', '#1e40af', '#dc2626', '#15803d'].map(c => (
                      <button
                        key={c}
                        onClick={() => setStrokeColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${strokeColor === c ? 'scale-110 border-white' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-500/10"
                >
                  <FaTrash size={10} /> Clear
                </button>
              </div>

              <div className={`w-full h-48 rounded-xl border relative cursor-crosshair overflow-hidden touch-none ${
                isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
              }`}>
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={192}
                  className="w-full h-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-500">
                    Sign with your mouse, trackpad, or finger here
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TYPE TAB */}
          {activeTab === 'type' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Your Name / Text:</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Color:</span>
                <div className="flex gap-1.5">
                  {['#000000', '#1e40af', '#dc2626', '#15803d'].map(c => (
                    <button
                      key={c}
                      onClick={() => setStrokeColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${strokeColor === c ? 'scale-110 border-white' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Signature Style:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Cursive Elegant', font: 'cursive' },
                    { name: 'Casual Script', font: 'Brush Script MT, cursive' },
                    { name: 'Formal Serif', font: 'Georgia, serif' },
                    { name: 'Modern Sans', font: 'sans-serif' }
                  ].map(style => (
                    <button
                      key={style.name}
                      onClick={() => setFontFamily(style.font)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        fontFamily === style.font
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold'
                          : isDarkMode ? 'border-slate-800 bg-slate-800/40 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] opacity-60 mb-1">{style.name}</div>
                      <div style={{ fontFamily: style.font, color: strokeColor }} className="text-lg truncate">
                        {typedText || 'Sample Sign'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="flex flex-col gap-3">
              <label className={`flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDarkMode ? 'border-slate-700 hover:border-indigo-500 bg-slate-800/30' : 'border-slate-300 hover:border-indigo-500 bg-slate-50'
              }`}>
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded signature" className="max-h-36 object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FaImage size={28} className="text-indigo-400" />
                    <span className="text-xs font-semibold">Click to upload signature (PNG, JPG, SVG)</span>
                    <span className="text-[11px] opacity-70">Transparent PNG recommended</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {uploadedImage && (
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-xs text-red-400 self-center hover:underline"
                >
                  Remove & Upload Another
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              (activeTab === 'draw' && !hasDrawn) ||
              (activeTab === 'type' && !typedText.trim()) ||
              (activeTab === 'upload' && !uploadedImage)
            }
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/25"
          >
            <FaCheck /> Add to Document
          </button>
        </div>
      </div>
    </div>
  );
}
