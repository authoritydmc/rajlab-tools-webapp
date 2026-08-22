import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { 
  FaFilePdf, FaTrash, FaDownload, FaPlus, FaObjectGroup, 
  FaArrowUp, FaArrowDown, FaCheck, FaFileAlt 
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';
import { pdfjsLib } from '../../utils/pdfWorker';

export default function MergePdfTool() {
  const { isDarkMode } = useTheme();
  const [pdfFiles, setPdfFiles] = useState([]); // [{ id, file, name, size, pageCount, thumbnail }]
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    return () => {
      if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    };
  }, [mergedPdfUrl]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.type === 'application/pdf');
    if (validFiles.length !== files.length) {
      toast.error('Only PDF files are allowed.');
    }
    if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    setMergedPdfUrl(null);

    const newEntries = [];
    for (const file of validFiles) {
      let pageCount = '?';
      let thumbnail = null;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        pageCount = doc.numPages;
        const firstPage = await doc.getPage(1);
        const viewport = firstPage.getViewport({ scale: 0.25 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await firstPage.render({ canvasContext: ctx, viewport }).promise;
        thumbnail = canvas.toDataURL('image/jpeg', 0.7);
      } catch (err) {
        console.warn('Thumbnail generation warning:', err);
      }

      newEntries.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
        pageCount,
        thumbnail
      });
    }

    setPdfFiles(prev => [...prev, ...newEntries]);
  };

  const removeFile = (index) => {
    const updatedFiles = [...pdfFiles];
    updatedFiles.splice(index, 1);
    setPdfFiles(updatedFiles);
    if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    setMergedPdfUrl(null);
  };

  const moveFile = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= pdfFiles.length) return;
    setPdfFiles(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
    if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    setMergedPdfUrl(null);
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      toast.error('Please select at least 2 PDF files to merge.');
      return;
    }
    
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfFiles) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      toast.success('PDFs merged successfully!');
    } catch (error) {
      console.error('Merge error:', error);
      if (error.message && error.message.includes('encrypted')) {
        toast.error('Cannot merge encrypted/password-protected PDFs.');
      } else {
        toast.error(`Merge failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsMerging(false);
    }
  };

  const siblings = useCategorySiblings('/merge-pdf');
  const totalMergedPages = pdfFiles.reduce((acc, f) => typeof f.pageCount === 'number' ? acc + f.pageCount : acc, 0);

  return (
    <ToolPageLayout
      title="Merge PDF"
      icon={<FaObjectGroup />}
      breadcrumb={[{ label: 'PDF Tools', path: '/merge-pdf' }]}
      siblings={siblings}
      currentPath="/merge-pdf"
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
              <FaPlus /> Add PDF Files
              <input type="file" multiple accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>

            {pdfFiles.length > 0 && (
              <span className="text-xs font-semibold px-3 py-1.5 bg-slate-500/10 rounded-xl">
                {pdfFiles.length} Files ({totalMergedPages > 0 ? `${totalMergedPages} pages total` : ''})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMerge}
              disabled={pdfFiles.length < 2 || isMerging}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FaCheck /> {isMerging ? 'Merging PDFs...' : 'Merge All Files'}
            </button>

            {mergedPdfUrl && (
              <a
                href={mergedPdfUrl}
                download="merged_document.pdf"
                onClick={() => setTimeout(() => triggerChaiModal('Merge PDF'), 600)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all"
              >
                <FaDownload /> Download Merged PDF
              </a>
            )}
          </div>
        </div>

        {/* Empty State */}
        {pdfFiles.length === 0 && (
          <div className={`flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed ${
            isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'
          }`}>
            <FaObjectGroup size={56} className="text-indigo-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">Combine Multiple PDFs in Seconds</h3>
            <p className="text-sm text-slate-400 max-w-md text-center mb-6">
              Select multiple documents, arrange their order, and merge them cleanly right inside your browser.
            </p>
            <label className="cursor-pointer px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-xl shadow-indigo-600/25 transition-all">
              <FaPlus /> Select PDF Files
              <input type="file" multiple accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}

        {/* Reorderable List with Visual Preview */}
        {pdfFiles.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {pdfFiles.map((fileItem, index) => (
              <div
                key={fileItem.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-slate-900/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-500/20 text-indigo-400 shrink-0">
                    {index + 1}
                  </span>

                  {fileItem.thumbnail ? (
                    <img src={fileItem.thumbnail} alt="preview" className="w-10 h-12 object-cover rounded border border-slate-700 shrink-0" />
                  ) : (
                    <FaFilePdf className="text-red-500 text-2xl shrink-0" />
                  )}

                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{fileItem.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{fileItem.size} MB</span>
                      <span>&bull;</span>
                      <span>{fileItem.pageCount} {fileItem.pageCount === 1 ? 'page' : 'pages'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    disabled={index === 0}
                    onClick={() => moveFile(index, index - 1)}
                    className="p-2 rounded-lg hover:bg-slate-500/20 disabled:opacity-20 text-slate-400 hover:text-white transition-colors"
                    title="Move Up"
                  >
                    <FaArrowUp size={12} />
                  </button>
                  <button
                    disabled={index === pdfFiles.length - 1}
                    onClick={() => moveFile(index, index + 1)}
                    className="p-2 rounded-lg hover:bg-slate-500/20 disabled:opacity-20 text-slate-400 hover:text-white transition-colors"
                    title="Move Down"
                  >
                    <FaArrowDown size={12} />
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors ml-1"
                    title="Remove File"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
