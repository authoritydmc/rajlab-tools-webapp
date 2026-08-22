import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { FaFilePdf, FaDownload, FaUpload, FaCut } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';

export default function SplitPdfTool() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [splitRange, setSplitRange] = useState('');
  const [splitPdfUrl, setSplitPdfUrl] = useState(null);
  const [isSplitting, setIsSplitting] = useState(false);

  useEffect(() => {
    return () => {
      if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
    };
  }, [splitPdfUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
    setPdfFile(file);
    setSplitPdfUrl(null);
    setSplitRange('');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setTotalPages(pdf.getPageCount());
    } catch (error) {
      console.error('PDF read error:', error);
      toast.error(`Error reading PDF: ${error.message || 'Unknown error'}`);
      setPdfFile(null);
    }
  };

  const handleSplit = async () => {
    if (!pdfFile || !splitRange) {
      toast.error('Please provide a valid PDF and a page range.');
      return;
    }
    
    const pagesToExtract = new Set();
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
          toast.error(`Invalid range: "${r}". Use format like 1-3.`);
        }
      } else {
        const page = Number(r);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          pagesToExtract.add(page - 1);
        } else {
          toast.error(`Invalid page: "${r}". Must be between 1 and ${totalPages}.`);
        }
      }
    }

    if (pagesToExtract.size === 0) {
      toast.error('No valid pages found. Check your range syntax.');
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
    <ToolPageLayout title="Split PDF" icon={<FaCut />} breadcrumb={[{label: 'PDF Tools', path: '/split-pdf'}]} siblings={siblings} currentPath="/split-pdf">
      <div className="w-full">
        <Toaster />

        <div className={`w-full mx-auto p-6 shadow-lg rounded-md border ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
          <p className="mb-4 text-center">Extract specific pages from your PDF file.</p>

          <div className="flex justify-center mb-6">
            <label className={`cursor-pointer px-6 py-3 rounded-md flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
              <FaUpload /> Select PDF file
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {pdfFile && (
            <div className="flex flex-col items-center gap-6">
              <div className={`flex items-center gap-3 p-3 rounded border w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <FaFilePdf className="text-red-500 text-2xl" />
                <div>
                  <div className="font-medium truncate max-w-[250px]">{pdfFile.name}</div>
                  <div className="text-xs text-gray-400">{totalPages} pages</div>
                </div>
              </div>

              <div className="w-full">
                <label className="block mb-2 font-medium">Pages to extract (e.g. 1-3, 5, 8-10):</label>
                <input
                  type="text"
                  placeholder="1-3, 5"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                />
              </div>

              <button
                onClick={handleSplit}
                disabled={!splitRange || isSplitting}
                className={`px-8 py-3 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                {isSplitting ? 'Extracting...' : 'Extract Pages'}
              </button>

              {splitPdfUrl && (
                <a
                  href={splitPdfUrl}
                  download="split_document.pdf"
                  onClick={() => setTimeout(() => triggerChaiModal('Split PDF'), 600)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors cursor-pointer ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                >
                  <FaDownload /> Download Extracted PDF
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
