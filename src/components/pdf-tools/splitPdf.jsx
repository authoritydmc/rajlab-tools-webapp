import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { FaFilePdf, FaDownload, FaUpload, FaCut, FaCheckSquare, FaSquare, FaCheck } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';
import { pdfjsLib } from '../../utils/pdfWorker';

export default function SplitPdfTool() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [splitRange, setSplitRange] = useState('');
  const [pageThumbnails, setPageThumbnails] = useState([]); // [{ pageNum, thumbnail, selected }]
  const [splitPdfUrl, setSplitPdfUrl] = useState(null);
  const [isSplitting, setIsSplitting] = useState(false);

  useEffect(() => {
    return () => {
      if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
    };
  }, [splitPdfUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
    setPdfFile(file);
    setSplitPdfUrl(null);
    setSplitRange('');
    setPageThumbnails([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(doc.numPages);

      const thumbs = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push({
          pageNum: i,
          thumbnail: canvas.toDataURL('image/jpeg', 0.7),
          selected: false
        });
      }
      setPageThumbnails(thumbs);
    } catch (error) {
      console.error('PDF read error:', error);
      toast.error(`Error reading PDF: ${error.message || 'Unknown error'}`);
      setPdfFile(null);
    }
  };

  const togglePageSelection = (pageNum) => {
    setPageThumbnails(prev => {
      const updated = prev.map(p => p.pageNum === pageNum ? { ...p, selected: !p.selected } : p);
      
      // Sync splitRange text input with selected pages
      const selectedNums = updated.filter(p => p.selected).map(p => p.pageNum);
      setSplitRange(selectedNums.join(', '));
      return updated;
    });
  };

  const selectAll = (select) => {
    setPageThumbnails(prev => {
      const updated = prev.map(p => ({ ...p, selected: select }));
      if (select) {
        setSplitRange(`1-${prev.length}`);
      } else {
        setSplitRange('');
      }
      return updated;
    });
  };

  const handleSplit = async () => {
    if (!pdfFile) {
      toast.error('Please upload a valid PDF.');
      return;
    }
    
    const pagesToExtract = new Set();

    // Parse text range or thumbnail selections
    if (splitRange.trim()) {
      const ranges = splitRange.split(',').map(r => r.trim());
      for (const r of ranges) {
        if (r.includes('-')) {
          const parts = r.split('-').map(Number);
          const start = parts[0];
          const end = parts[1];
          if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= totalPages) {
            for (let i = start; i <= end; i++) {
              pagesToExtract.add(i - 1);
            }
          } else {
            toast.error(`Invalid range: "${r}".`);
          }
        } else {
          const page = Number(r);
          if (!isNaN(page) && page >= 1 && page <= totalPages) {
            pagesToExtract.add(page - 1);
          }
        }
      }
    } else {
      pageThumbnails.filter(p => p.selected).forEach(p => pagesToExtract.add(p.pageNum - 1));
    }

    if (pagesToExtract.size === 0) {
      toast.error('Please select at least one page to extract.');
      return;
    }

    setIsSplitting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const sortedPages = Array.from(pagesToExtract).sort((a, b) => a - b);
      const copiedPages = await newPdf.copyPages(originalPdf, sortedPages);
      
      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);
      toast.success(`Extracted ${sortedPages.length} pages successfully!`);
    } catch (error) {
      console.error('Split error:', error);
      if (error.message && error.message.includes('encrypted')) {
        toast.error('Cannot split encrypted/password-protected PDFs.');
      } else {
        toast.error(`Split failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSplitting(false);
    }
  };

  const siblings = useCategorySiblings('/split-pdf');

  return (
    <ToolPageLayout
      title="Split PDF"
      icon={<FaCut />}
      breadcrumb={[{ label: 'PDF Tools', path: '/split-pdf' }]}
      siblings={siblings}
      currentPath="/split-pdf"
    >
      <div className="w-full flex flex-col gap-5">
        <Toaster />

        {/* Toolbar Header */}
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
              <span className="text-xs font-semibold px-3 py-1.5 bg-slate-500/10 rounded-xl">
                {totalPages} {totalPages === 1 ? 'Page' : 'Pages'} Total
              </span>
            )}
          </div>

          {pdfFile && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => selectAll(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 hover:bg-slate-500/10"
              >
                Select All
              </button>
              <button
                onClick={() => selectAll(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 hover:bg-slate-500/10"
              >
                Clear All
              </button>

              <button
                onClick={handleSplit}
                disabled={isSplitting}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <FaCheck /> {isSplitting ? 'Extracting...' : 'Extract Pages'}
              </button>

              {splitPdfUrl && (
                <a
                  href={splitPdfUrl}
                  download="extracted_document.pdf"
                  onClick={() => setTimeout(() => triggerChaiModal('Split PDF'), 600)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all"
                >
                  <FaDownload /> Download PDF
                </a>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!pdfFile ? (
          <div className={`flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed ${
            isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'
          }`}>
            <FaCut size={56} className="text-indigo-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">Visual PDF Page Splitter & Extractor</h3>
            <p className="text-sm text-slate-400 max-w-md text-center mb-6">
              Click individual page thumbnails to select pages, or specify page ranges (e.g. 1-3, 5, 8-10) to extract.
            </p>
            <label className="cursor-pointer px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-xl shadow-indigo-600/25 transition-all">
              <FaUpload /> Choose PDF File
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Range Text Input */}
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Page Range or Selected Pages (e.g. 1-3, 5, 7):
              </label>
              <input
                type="text"
                placeholder="e.g. 1-3, 5, 7"
                value={splitRange}
                onChange={(e) => setSplitRange(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Thumbnail Grid for Visual Click-to-Select */}
            {pageThumbnails.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 rounded-2xl border border-slate-700/40 bg-slate-950/20">
                {pageThumbnails.map((thumb) => (
                  <div
                    key={thumb.pageNum}
                    onClick={() => togglePageSelection(thumb.pageNum)}
                    className={`relative cursor-pointer flex flex-col items-center p-3 rounded-xl border transition-all ${
                      thumb.selected
                        ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                        : isDarkMode ? 'bg-slate-900/80 border-slate-700/70 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {/* Checkbox badge */}
                    <div className="absolute top-2 right-2 z-10">
                      {thumb.selected ? (
                        <FaCheckSquare className="text-indigo-400 text-base" />
                      ) : (
                        <FaSquare className="text-slate-500 text-base opacity-60" />
                      )}
                    </div>

                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white">
                      #{thumb.pageNum}
                    </div>

                    <div className="w-full h-40 flex items-center justify-center overflow-hidden my-2">
                      <img src={thumb.thumbnail} alt={`Page ${thumb.pageNum}`} className="max-h-full max-w-full object-contain rounded shadow" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
