import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { 
  FaFilePdf, FaUpload, FaDownload, FaRedo, FaUndo, 
  FaTrash, FaArrowUp, FaArrowDown, FaPlus, FaCheck, FaLayerGroup 
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

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    setIsProcessing(true);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setPdfFile(file);
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
                  download={`organized_${pdfFile?.name || 'document.pdf'}`}
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
      </div>
    </ToolPageLayout>
  );
}
