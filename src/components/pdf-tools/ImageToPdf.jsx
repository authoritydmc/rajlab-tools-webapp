import React, { useState } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { 
  FaFileImage, FaUpload, FaDownload, FaTrash, 
  FaArrowUp, FaArrowDown, FaPlus, FaCheck, FaFilePdf, FaFile, FaEye 
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';

export default function ImageToPdf() {
  const { isDarkMode } = useTheme();
  const [images, setImages] = useState([]); // [{ id, file, previewUrl, name, size }]
  const [pageSize, setPageSize] = useState('A4'); // 'A4' | 'LETTER' | 'FIT'
  const [orientation, setOrientation] = useState('portrait'); // 'portrait' | 'landscape'
  const [margin, setMargin] = useState(20); // in pt
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfSize, setPdfSize] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState('converted_images.pdf');
  const [showPreview, setShowPreview] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter(f => f.type.startsWith('image/'));

    if (validImages.length !== files.length) {
      toast.error('Only image files (PNG, JPG, WebP) are allowed.');
    }

    const newImageObjs = validImages.map(f => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2)
    }));

    setImages(prev => [...prev, ...newImageObjs]);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfSize(null);
  };

  const removeImage = (index) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfSize(null);
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleConvertToPdf = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();

      for (const imgItem of images) {
        const arrayBuffer = await imgItem.file.arrayBuffer();
        let pdfImage;

        if (imgItem.file.type === 'image/jpeg' || imgItem.file.type === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        } else if (imgItem.file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          // Canvas fallback for WebP / others
          const imgBitmap = await createImageBitmap(imgItem.file);
          const canvas = document.createElement('canvas');
          canvas.width = imgBitmap.width;
          canvas.height = imgBitmap.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(imgBitmap, 0, 0);
          const pngDataUrl = canvas.toDataURL('image/png');
          pdfImage = await pdfDoc.embedPng(pngDataUrl);
        }

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;

        let pageWidth, pageHeight;

        if (pageSize === 'FIT') {
          pageWidth = imgWidth + margin * 2;
          pageHeight = imgHeight + margin * 2;
        } else {
          const baseSize = pageSize === 'LETTER' ? PageSizes.Letter : PageSizes.A4;
          if (orientation === 'landscape') {
            pageWidth = baseSize[1];
            pageHeight = baseSize[0];
          } else {
            pageWidth = baseSize[0];
            pageHeight = baseSize[1];
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate aspect ratio to fit inside page margin bounds
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;
        const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        const drawX = (pageWidth - drawWidth) / 2;
        const drawY = (pageHeight - drawHeight) / 2;

        page.drawImage(pdfImage, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfSize(pdfBytes.length);
      toast.success('Images converted to PDF successfully!');
    } catch (err) {
      console.error('Image to PDF error:', err);
      toast.error('Failed to create PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const siblings = useCategorySiblings('/image-to-pdf');

  return (
    <ToolPageLayout
      title="Images to PDF Converter"
      icon={<FaFileImage />}
      breadcrumb={[{ label: 'PDF Tools', path: '/image-to-pdf' }]}
      siblings={siblings}
      currentPath="/image-to-pdf"
    >
      <div className="w-full flex flex-col gap-5">
        <Toaster />

        {/* Toolbar Settings Header */}
        <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 shadow-lg ${
          isDarkMode ? 'bg-slate-900/80 border-slate-700/60 backdrop-blur-xl' : 'bg-white/80 border-slate-200/80 backdrop-blur-xl'
        }`}>
          <div className="flex items-center gap-3 flex-wrap">
            <label className={`cursor-pointer px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
              <FaPlus /> Add Images
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            {images.length > 0 && (
              <span className="text-xs font-semibold px-3 py-1.5 bg-slate-500/10 rounded-xl">
                {images.length} Images Added
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Page Size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Page Size:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="A4">A4 (Standard)</option>
                <option value="LETTER">US Letter</option>
                <option value="FIT">Fit to Image</option>
              </select>
            </div>

            {/* Orientation */}
            {pageSize !== 'FIT' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Orientation:</span>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            )}

            {/* Margins */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Margin:</span>
              <select
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value={0}>No Margin</option>
                <option value={20}>Small (20pt)</option>
                <option value={40}>Wide (40pt)</option>
              </select>
            </div>

            <button
              onClick={handleConvertToPdf}
              disabled={images.length === 0 || isProcessing}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FaCheck /> {isProcessing ? 'Generating PDF...' : 'Convert to PDF'}
            </button>

            {pdfUrl && (
              <a
                href={pdfUrl}
                download={downloadFilename.endsWith('.pdf') ? downloadFilename : `${downloadFilename}.pdf`}
                onClick={() => setTimeout(() => triggerChaiModal('Images to PDF'), 600)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all"
              >
                <FaDownload /> Download PDF
              </a>
            )}
          </div>
        </div>

        {/* Empty State */}
        {images.length === 0 && (
          <div className={`flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed ${
            isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'
          }`}>
            <FaFileImage size={56} className="text-indigo-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">Convert Images to Single Clean PDF</h3>
            <p className="text-sm text-slate-400 max-w-md text-center mb-6">
              Combine multiple JPG, PNG, or WebP images into a formatted PDF. Reorder pages and customize paper size and margins.
            </p>
            <label className="cursor-pointer px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-xl shadow-indigo-600/25 transition-all">
              <FaUpload /> Choose Image Files
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 rounded-2xl border border-slate-700/40 bg-slate-950/20">
            {images.map((img, index) => (
              <div
                key={img.id}
                className={`relative group flex flex-col items-center p-3 rounded-xl border transition-all ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-700/70 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-500 shadow-sm'
                }`}
              >
                {/* Order badge */}
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                  #{index + 1}
                </div>

                {/* Thumbnail */}
                <div className="w-full h-36 flex items-center justify-center overflow-hidden my-2">
                  <img src={img.previewUrl} alt={img.name} className="max-h-full max-w-full object-contain rounded shadow" />
                </div>

                <div className="w-full truncate text-[11px] font-medium text-center text-slate-400 mb-2">
                  {img.name} ({img.size} MB)
                </div>

                {/* Controls */}
                <div className="w-full flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => moveImage(index, index - 1)}
                      className="p-1.5 rounded hover:bg-slate-500/20 disabled:opacity-20 text-slate-400 hover:text-white transition-colors"
                      title="Move Left"
                    >
                      <FaArrowUp className="-rotate-90" size={11} />
                    </button>
                    <button
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, index + 1)}
                      className="p-1.5 rounded hover:bg-slate-500/20 disabled:opacity-20 text-slate-400 hover:text-white transition-colors"
                      title="Move Right"
                    >
                      <FaArrowDown className="-rotate-90" size={11} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeImage(index)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Remove Image"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Download Section with Preview */}
        {pdfUrl && (
          <div className={`mt-6 p-5 rounded-2xl border animate-fade-in ${
            isDarkMode ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <FaCheck className="text-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">PDF Created Successfully!</span>
            </div>

            {/* Preview Section */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Preview
                </label>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    showPreview 
                      ? 'bg-indigo-600 text-white' 
                      : isDarkMode 
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              
              {showPreview && (
                <div className={`rounded-xl overflow-hidden border ${
                  isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-100'
                }`}>
                  <iframe
                    src={pdfUrl}
                    className="w-full h-96"
                    title="Generated PDF Preview"
                  />
                </div>
              )}
            </div>

            {/* Download Section */}
            <div className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-300'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Filename
                  </label>
                  <div className="flex items-center gap-2">
                    <FaFile className="text-slate-400" />
                    <input
                      type="text"
                      value={downloadFilename}
                      onChange={(e) => setDownloadFilename(e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    File Size
                  </label>
                  <div className={`px-3 py-2 rounded-lg border text-sm font-mono ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                  }`}>
                    {pdfSize ? formatFileSize(pdfSize) : 'Calculating...'}
                  </div>
                </div>
              </div>

              <a
                href={pdfUrl}
                download={downloadFilename.endsWith('.pdf') ? downloadFilename : `${downloadFilename}.pdf`}
                onClick={() => setTimeout(() => triggerChaiModal('Images to PDF'), 600)}
                className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/25 transition-all"
              >
                <FaDownload /> Download PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
