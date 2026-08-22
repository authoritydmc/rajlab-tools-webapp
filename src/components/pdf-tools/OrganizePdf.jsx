import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { 
  FaFilePdf, FaUpload, FaDownload, FaRedo, FaUndo, 
  FaTrash, FaArrowUp, FaArrowDown, FaPlus, FaCheck, FaLayerGroup, FaFile, FaEye 
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';
import { pdfjsLib } from '../../utils/pdfWorker';

export default function OrganizePdf() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState([]); // [{ originalIndex, rotation, thumbnail, isDeleted }]
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadSize, setDownloadSize] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState('organized_document.pdf');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    setIsProcessing(true);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setDownloadSize(null);
    setPdfFile(file);
    setDownloadFilename(`organized_${file.name.replace('.pdf', '')}.pdf`);
    setPages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const loadedPages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 }); // thumbnail scale
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;
        const thumb = canvas.toDataURL('image/jpeg', 0.8);

        loadedPages.push({
          id: `page-${i}-${Date.now()}`,
          originalIndex: i - 1,
          displayNumber: i,
          rotation: 0,
          thumbnail: thumb,
        });
      }

      setPages(loadedPages);
      toast.success(`Loaded ${loadedPages.length} pages.`);
    } catch (err) {
      console.error('Organize PDF load error:', err);
      toast.error('Failed to load PDF: ' + err.message);
      setPdfFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const rotatePage = (index, angle) => {
    setPages(prev => {
      const updated = [...prev];
      const currentRotation = updated[index].rotation || 0;
      updated[index] = {
        ...updated[index],
        rotation: (currentRotation + angle + 360) % 360
      };
      return updated;
    });
  };

  const rotateAllPages = (angle) => {
    setPages(prev => prev.map(p => ({
      ...p,
      rotation: ((p.rotation || 0) + angle + 360) % 360
    })));
  };

  const movePage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const deletePage = (index) => {
    if (pages.length <= 1) {
      toast.error('Cannot delete the only page in the document.');
      return;
    }
    setPages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAndDownload = async () => {
    if (!pdfFile || pages.length === 0) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      for (const p of pages) {
        const [copiedPage] = await newPdf.copyPages(originalPdf, [p.originalIndex]);
        if (p.rotation) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((currentRotation + p.rotation) % 360));
        }
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadSize(pdfBytes.length);
      toast.success('Organized PDF ready for download!');
    } catch (err) {
      console.error('Save organized PDF error:', err);
      toast.error('Failed to organize PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const siblings = useCategorySiblings('/organize-pdf');

  return (
    <ToolPageLayout
      title="Organize & Rotate PDF"
      icon={<FaLayerGroup />}
      breadcrumb={[{ label: 'PDF Tools', path: '/organize-pdf' }]}
      siblings={siblings}
      currentPath="/organize-pdf"
    >
      <div className="w-full flex flex-col gap-5">
        <Toaster />

        {/* Toolbar Header */}
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-lg ${
          isDarkMode ? 'bg-slate-900/80 border-slate-700/60 backdrop-blur-xl' : 'bg-white/80 border-slate-200/80 backdrop-blur-xl'
        }`}>
          <div className="flex items-center gap-3 flex-wrap">
            <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
              <FaUpload /> {pdfFile ? 'Change PDF' : 'Upload PDF'}
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>

            {pages.length > 0 && (
              <span className="text-xs font-semibold px-2 py-1 bg-slate-500/10 rounded-lg">
                {pages.length} Pages
              </span>
            )}
          </div>

          {pages.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => rotateAllPages(-90)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 hover:bg-slate-500/10 flex items-center gap-1.5"
                title="Rotate All Left (90° Counter-Clockwise)"
              >
                <FaUndo size={11} /> Rotate All Left
              </button>
              <button
                onClick={() => rotateAllPages(90)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 hover:bg-slate-500/10 flex items-center gap-1.5"
                title="Rotate All Right (90° Clockwise)"
              >
                <FaRedo size={11} /> Rotate All Right
              </button>

              <button
                onClick={handleSaveAndDownload}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <FaCheck /> {isProcessing ? 'Processing...' : 'Apply & Save'}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={downloadFilename.endsWith('.pdf') ? downloadFilename : `${downloadFilename}.pdf`}
                  onClick={() => setTimeout(() => triggerChaiModal('Organize PDF'), 600)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all"
                >
                  <FaDownload /> Download PDF
                </a>
              )}
            </div>
          )}
        </div>

        {/* Workspace Page Grid */}
        {!pdfFile ? (
          <div className={`flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed ${
            isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'
          }`}>
            <FaLayerGroup size={56} className="text-indigo-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">Visual Page Organizer & Rotator</h3>
            <p className="text-sm text-slate-400 max-w-md text-center mb-6">
              Drag, reorder, rotate individual pages, and delete unwanted pages in a visual thumbnail grid.
            </p>
            <label className="cursor-pointer px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-xl shadow-indigo-600/25 transition-all">
              <FaUpload /> Select PDF File
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 rounded-2xl border border-slate-700/40 bg-slate-950/20">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`relative group flex flex-col items-center p-3 rounded-xl border transition-all ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-700/70 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-500 shadow-sm'
                }`}
              >
                {/* Page Number Badge */}
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                  #{index + 1}
                </div>

                {/* Page Thumbnail with Rotation */}
                <div className="w-full h-44 flex items-center justify-center overflow-hidden my-2">
                  <img
                    src={page.thumbnail}
                    alt={`Page ${index + 1}`}
                    style={{
                      transform: `rotate(${page.rotation}deg)`,
                      transition: 'transform 0.2s ease-in-out'
                    }}
                    className="max-h-full max-w-full object-contain shadow-md rounded"
                  />
                </div>

                {/* Card Controls */}
                <div className="w-full flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => rotatePage(index, -90)}
                      className="p-1.5 rounded hover:bg-slate-500/20 text-slate-400 hover:text-white transition-colors"
                      title="Rotate Left 90°"
                    >
                      <FaUndo size={11} />
                    </button>
                    <button
                      onClick={() => rotatePage(index, 90)}
                      className="p-1.5 rounded hover:bg-slate-500/20 text-slate-400 hover:text-white transition-colors"
                      title="Rotate Right 90°"
                    >
                      <FaRedo size={11} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => movePage(index, index - 1)}
                      className="p-1.5 rounded hover:bg-slate-500/20 disabled:opacity-20 text-slate-400 hover:text-white transition-colors"
                      title="Move Left"
                    >
                      <FaArrowUp className="-rotate-90" size={11} />
                    </button>
                    <button
                      disabled={index === pages.length - 1}
                      onClick={() => movePage(index, index + 1)}
                      className="p-1.5 rounded hover:bg-slate-500/20 disabled:opacity-20 text-slate-400 hover:text-white transition-colors"
                      title="Move Right"
                    >
                      <FaArrowDown className="-rotate-90" size={11} />
                    </button>
                    <button
                      onClick={() => deletePage(index)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Page"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Download Section with Preview */}
        {downloadUrl && (
          <div className={`mt-6 p-5 rounded-2xl border animate-fade-in ${
            isDarkMode ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <FaCheck className="text-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">PDF Organized Successfully!</span>
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
                    src={downloadUrl}
                    className="w-full h-96"
                    title="Organized PDF Preview"
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
                    {downloadSize ? formatFileSize(downloadSize) : 'Calculating...'}
                  </div>
                </div>
              </div>

              <a
                href={downloadUrl}
                download={downloadFilename.endsWith('.pdf') ? downloadFilename : `${downloadFilename}.pdf`}
                onClick={() => setTimeout(() => triggerChaiModal('Organize PDF'), 600)}
                className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/25 transition-all"
              >
                <FaDownload /> Download Organized PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
