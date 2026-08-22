import React, { useState } from 'react';
import JSZip from 'jszip';
import { useTheme } from '../../themeContext';
import { FaFilePdf, FaUpload, FaDownload, FaImages, FaFileArchive, FaCheck } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';
import { pdfjsLib } from '../../utils/pdfWorker';

export default function PdfToImage() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [renderedImages, setRenderedImages] = useState([]); // [{ pageNum, dataUrl, blob }]
  const [scale, setScale] = useState(2); // 2x high resolution
  const [imageFormat, setImageFormat] = useState('image/png'); // 'image/png' | 'image/jpeg'
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipBlobUrl, setZipBlobUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    setPdfFile(file);
    setRenderedImages([]);
    if (zipBlobUrl) URL.revokeObjectURL(zipBlobUrl);
    setZipBlobUrl(null);
  };

  const convertPdfToImages = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setRenderedImages([]);
    if (zipBlobUrl) URL.revokeObjectURL(zipBlobUrl);
    setZipBlobUrl(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const images = [];
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const ext = imageFormat === 'image/jpeg' ? 'jpg' : 'png';
        const dataUrl = canvas.toDataURL(imageFormat, 0.92);

        // Add to array for UI preview
        images.push({
          pageNum: i,
          dataUrl,
          ext
        });

        // Add to ZIP
        const base64Data = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');
        zip.file(`page_${i}.${ext}`, base64Data, { base64: true });
      }

      setRenderedImages(images);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setZipBlobUrl(url);

      toast.success(`Successfully rendered ${images.length} pages to images!`);
    } catch (err) {
      console.error('PDF to Image error:', err);
      toast.error('Failed to convert PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const siblings = useCategorySiblings('/pdf-to-image');

  return (
    <ToolPageLayout
      title="PDF to Image Converter"
      icon={<FaImages />}
      breadcrumb={[{ label: 'PDF Tools', path: '/pdf-to-image' }]}
      siblings={siblings}
      currentPath="/pdf-to-image"
    >
      <div className="w-full flex flex-col gap-5">
        <Toaster />

        {/* Options & Upload Header */}
        <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 shadow-lg ${
          isDarkMode ? 'bg-slate-900/80 border-slate-700/60 backdrop-blur-xl' : 'bg-white/80 border-slate-200/80 backdrop-blur-xl'
        }`}>
          <div className="flex items-center gap-3 flex-wrap">
            <label className={`cursor-pointer px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
              <FaUpload /> {pdfFile ? 'Change PDF' : 'Select PDF File'}
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>

            {pdfFile && (
              <span className="text-xs font-semibold px-3 py-1.5 bg-slate-500/10 rounded-xl truncate max-w-[200px]">
                {pdfFile.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Format Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Format:</span>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="image/png">PNG (Lossless)</option>
                <option value="image/jpeg">JPG (Compressed)</option>
              </select>
            </div>

            {/* DPI Scale */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Quality:</span>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value={1}>Standard (1x)</option>
                <option value={2}>High Quality (2x HD)</option>
                <option value={3}>Ultra Crisp (3x UHD)</option>
              </select>
            </div>

            <button
              onClick={convertPdfToImages}
              disabled={!pdfFile || isProcessing}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FaCheck /> {isProcessing ? 'Converting...' : 'Convert to Images'}
            </button>

            {zipBlobUrl && (
              <a
                href={zipBlobUrl}
                download={`${pdfFile?.name?.replace('.pdf', '') || 'pages'}_images.zip`}
                onClick={() => setTimeout(() => triggerChaiModal('PDF to Image'), 600)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all"
              >
                <FaFileArchive /> Download All (ZIP)
              </a>
            )}
          </div>
        </div>

        {/* Workspace Results */}
        {!pdfFile && (
          <div className={`flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed ${
            isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'
          }`}>
            <FaImages size={56} className="text-indigo-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">Convert PDF Pages to High-Res Images</h3>
            <p className="text-sm text-slate-400 max-w-md text-center mb-6">
              Export every page of your PDF into crisp PNG or JPEG images with custom resolution. Download individually or as a single ZIP archive.
            </p>
            <label className="cursor-pointer px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-xl shadow-indigo-600/25 transition-all">
              <FaUpload /> Choose PDF File
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}

        {renderedImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-2xl border border-slate-700/40 bg-slate-950/20">
            {renderedImages.map((img) => (
              <div
                key={img.pageNum}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-700/70' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="w-full flex items-center justify-between text-xs font-semibold mb-2">
                  <span>Page {img.pageNum}</span>
                  <a
                    href={img.dataUrl}
                    download={`page_${img.pageNum}.${img.ext}`}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <FaDownload size={11} /> Download
                  </a>
                </div>
                <div className="w-full h-56 flex items-center justify-center overflow-hidden rounded bg-slate-950/40 p-1">
                  <img src={img.dataUrl} alt={`Page ${img.pageNum}`} className="max-h-full max-w-full object-contain rounded shadow" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
