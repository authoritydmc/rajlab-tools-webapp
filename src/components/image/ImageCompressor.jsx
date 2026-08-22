import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaTrash, FaDownload, FaImage, FaCompressAlt, FaExchangeAlt, FaFileImage } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function Slider({ label, value, onChange, min, max, step, unit, formatValue, dark, accent }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${dark ? 'bg-white/10 text-white' : 'bg-black/5 text-gray-800'}`}>
          {formatValue ? formatValue(value) : value + (unit || '')}
        </span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${pct}%, ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`,
          }}
        />
      </div>
    </div>
  );
}

export default function ImageCompressor() {
  const { isDarkMode } = useTheme();
  const [originalFile, setOriginalFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState('');
  const [compressedPreview, setCompressedPreview] = useState('');
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [maxSizeMB, setMaxSizeMB] = useState(2);
  const [outputFormat, setOutputFormat] = useState('keep');

  const [isCompressing, setIsCompressing] = useState(false);
  const debounceRef = useRef(null);
  const compressCountRef = useRef(0);
  const siblings = useCategorySiblings('/image-compressor');

  const reduction = originalSize > 0 && compressedSize > 0
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : 0;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setOriginalFile(file);
    setOriginalSize(file.size);
    setCompressedPreview('');
    setCompressedBlob(null);
    setCompressedSize(0);
    const reader = new FileReader();
    reader.onload = (e) => setOriginalPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const compress = useCallback(async (file, opts) => {
    if (!file) return;
    setIsCompressing(true);
    try {
      compressCountRef.current += 1;
      const myCount = compressCountRef.current;

      const compressionOpts = {
        maxSizeMB: opts.maxSizeMB,
        maxWidthOrHeight: Math.max(opts.maxWidth, opts.maxHeight),
        useWebWorker: true,
        initialQuality: opts.quality,
        alwaysKeepResolution: false,
      };

      const compressed = await imageCompression(file, compressionOpts);

      if (myCount !== compressCountRef.current) return;

      setCompressedBlob(compressed);
      setCompressedSize(compressed.size);

      const reader = new FileReader();
      reader.onload = (e) => setCompressedPreview(e.target.result);
      reader.readAsDataURL(compressed);
    } catch (e) {
      if (e.name !== 'AbortError') {
        toast.error('Compression failed: ' + e.message);
      }
    } finally {
      setIsCompressing(false);
    }
  }, []);

  useEffect(() => {
    if (!originalFile) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      compress(originalFile, { quality, maxWidth, maxHeight, maxSizeMB });
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [originalFile, quality, maxWidth, maxHeight, maxSizeMB, compress]);

  const handleDownload = () => {
    if (!compressedBlob) return;
    const ext = outputFormat === 'keep'
      ? originalFile.name.split('.').pop()
      : outputFormat;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${originalFile.name.replace(/\.[^.]+$/, '')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => triggerChaiModal('Image Compressor'), 600);
  };

  const handleClear = () => {
    setOriginalFile(null);
    setOriginalPreview('');
    setCompressedPreview('');
    setCompressedBlob(null);
    setOriginalSize(0);
    setCompressedSize(0);
  };

  return (
    <ToolPageLayout title="Image Compressor" icon={<FaCompressAlt />} breadcrumb={[{ label: 'Multimedia Utilities', path: '/video-converter' }]} siblings={siblings} currentPath="/image-compressor">
      <div className="w-full">
        <Toaster />

        <div className={`w-full mx-auto p-6 shadow-lg rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>

          {/* Upload Zone */}
          <div className="mb-6">
            <div
              className={`border-2 border-dashed p-8 rounded-xl text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'border-gray-600 hover:border-indigo-500 hover:bg-indigo-500/5' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}`}
              onClick={() => document.getElementById('imgInput').click()}
            >
              {originalFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FaFileImage className="text-3xl text-indigo-400" />
                  <div className="text-left">
                    <p className="font-bold">{originalFile.name}</p>
                    <p className="text-sm opacity-60">{formatBytes(originalSize)} • {originalFile.type.split('/')[1].toUpperCase()}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <FaImage className="mx-auto text-5xl mb-3 text-gray-400" />
                  <p className="font-semibold">Click or drop an image here</p>
                  <p className="text-sm opacity-50 mt-1">Supports JPG, PNG, WebP, GIF, BMP</p>
                </div>
              )}
            </div>
            <input type="file" id="imgInput" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {/* Controls */}
          {originalFile && (
            <div className="space-y-5 mb-6">
              <Slider
                label="Quality"
                value={quality}
                onChange={setQuality}
                min={0.05} max={1} step={0.05}
                formatValue={(v) => Math.round(v * 100) + '%'}
                dark={isDarkMode}
                accent="#6366f1"
              />

              <Slider
                label="Max Width"
                value={maxWidth}
                onChange={setMaxWidth}
                min={100} max={4096} step={50}
                unit="px"
                dark={isDarkMode}
                accent="#8b5cf6"
              />

              <Slider
                label="Max Height"
                value={maxHeight}
                onChange={setMaxHeight}
                min={100} max={4096} step={50}
                unit="px"
                dark={isDarkMode}
                accent="#a855f7"
              />

              <Slider
                label="Target Max Size"
                value={maxSizeMB}
                onChange={setMaxSizeMB}
                min={0.1} max={10} step={0.1}
                formatValue={(v) => v.toFixed(1) + ' MB'}
                dark={isDarkMode}
                accent="#d946ef"
              />

              {/* Live Stats Bar */}
              {compressedBlob && (
                <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-300 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="opacity-50">Original</span>
                      <p className="font-mono font-bold">{formatBytes(originalSize)}</p>
                    </div>
                    <FaExchangeAlt className={isDarkMode ? 'text-indigo-400' : 'text-indigo-500'} />
                    <div>
                      <span className="opacity-50">Compressed</span>
                      <p className="font-mono font-bold text-green-400">{formatBytes(compressedSize)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${Number(reduction) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {Number(reduction) > 0 ? `↓ ${reduction}% saved` : `↑ ${Math.abs(reduction)}% larger`}
                    </span>
                    <span className="text-sm opacity-50">{isCompressing ? 'Compressing...' : 'Done'}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                {compressedBlob && (
                  <button
                    onClick={handleDownload}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-200 hover:scale-[1.02] ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  >
                    <FaDownload /> Download ({formatBytes(compressedSize)})
                  </button>
                )}
                <button
                  onClick={handleClear}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-200 hover:scale-[1.02] ${isDarkMode ? 'bg-red-600/80 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                  <FaTrash /> Clear
                </button>
              </div>
            </div>
          )}

          {/* Side-by-Side Preview */}
          {originalPreview && compressedPreview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`text-center p-4 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="font-bold mb-3 text-sm uppercase tracking-wider opacity-60">Original</h3>
                <img src={originalPreview} alt="Original" className="max-h-64 mx-auto rounded-lg shadow-md" />
                <p className="text-sm mt-3 font-mono">{formatBytes(originalSize)}</p>
              </div>
              <div className={`text-center p-4 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="font-bold mb-3 text-sm uppercase tracking-wider opacity-60">Compressed</h3>
                <img src={compressedPreview} alt="Compressed" className="max-h-64 mx-auto rounded-lg shadow-md" />
                <p className="text-sm mt-3 font-mono">
                  {formatBytes(compressedSize)}
                  {Number(reduction) > 0 && (
                    <span className="text-green-400 ml-2">↓ {reduction}%</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
