import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaTrash, FaDownload, FaImage, FaCompressAlt } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function ImageCompressor() {
  const { isDarkMode } = useTheme();
  const [originalFile, setOriginalFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState('');
  const [compressedPreview, setCompressedPreview] = useState('');
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [maxSizeMB, setMaxSizeMB] = useState(1);
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState(1024);
  const [quality, setQuality] = useState(0.8);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const siblings = useCategorySiblings('/image-compressor');

  useEffect(() => {
    document.title = 'Image Compressor | Rajlabs';
  return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setOriginalFile(file);
    setOriginalSize(file.size);
    setCompressedPreview('');
    setCompressedBlob(null);
    setCompressedSize(0);
    const reader = new FileReader();
    reader.onload = (e) => setOriginalPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const compress = async () => {
    if (!originalFile) return;
    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
        initialQuality: quality,
        alwaysKeepResolution: false,
      };
      const compressed = await imageCompression(originalFile, options);
      setCompressedBlob(compressed);
      setCompressedSize(compressed.size);
      const reader = new FileReader();
      reader.onload = (e) => setCompressedPreview(e.target.result);
      reader.readAsDataURL(compressed);
      toast.success('Image compressed!');
    } catch (e) {
      toast.error('Compression failed: ' + e.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${originalFile.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setOriginalFile(null); setOriginalPreview(''); setCompressedPreview('');
    setCompressedBlob(null); setOriginalSize(0); setCompressedSize(0);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const reduction = originalSize > 0 && compressedSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0;

  return (
    <ToolPageLayout title="Image Compressor" icon={<FaCompressAlt />} breadcrumb={[{label: 'Multimedia Utilities', path: '/video-converter'}]} siblings={siblings} currentPath="/image-compressor">
      <div className="w-full">
<Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        {/* Upload */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Upload Image</label>
          <div className={`border-2 border-dashed p-8 rounded-md text-center cursor-pointer ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-400 hover:border-gray-500'}`}
            onClick={() => document.getElementById('imgInput').click()}>
            {originalFile ? (
              <p>{originalFile.name} ({formatSize(originalSize)})</p>
            ) : (
              <div><FaImage className="mx-auto text-4xl mb-2 text-gray-400" /><p>Click to select an image</p></div>
            )}
          </div>
          <input type="file" id="imgInput" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>
        {/* Settings */}
        {originalFile && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-1 text-sm">Max Size (MB)</label>
              <input type="number" min="0.1" step="0.1" value={maxSizeMB} onChange={(e) => setMaxSizeMB(+e.target.value)}
                className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
            </div>
            <div>
              <label className="block font-bold mb-1 text-sm">Max Dimension (px)</label>
              <input type="number" min="100" step="100" value={maxWidthOrHeight} onChange={(e) => setMaxWidthOrHeight(+e.target.value)}
                className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
            </div>
            <div>
              <label className="block font-bold mb-1 text-sm">Quality ({Math.round(quality * 100)}%)</label>
              <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full mt-2" />
            </div>
          </div>
        )}
        <div className="flex gap-2 justify-center mb-4">
          <button onClick={compress} disabled={!originalFile || isCompressing}
            className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'} ${!originalFile || isCompressing ? 'opacity-50' : ''}`}>
            {isCompressing ? 'Compressing...' : 'Compress'}
          </button>
          <button onClick={handleClear} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
        </div>
        {/* Previews */}
        {originalPreview && compressedPreview && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <h3 className="font-bold mb-2">Original</h3>
                <img src={originalPreview} alt="Original" className="max-h-48 mx-auto rounded border" />
                <p className="text-sm mt-1">{formatSize(originalSize)}</p>
              </div>
              <div className="text-center">
                <h3 className="font-bold mb-2">Compressed</h3>
                <img src={compressedPreview} alt="Compressed" className="max-h-48 mx-auto rounded border" />
                <p className="text-sm mt-1">{formatSize(compressedSize)} <span className="text-green-400">(-{reduction}%)</span></p>
              </div>
            </div>
            <div className="text-center">
              <button onClick={handleDownload} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}><FaDownload className="inline mr-1" />Download Compressed</button>
            </div>
          </>
        )}
      </div>
    </div>
    </ToolPageLayout>

  );
}
