import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { FaFilePdf, FaDownload, FaUpload, FaCut } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function SplitPdfTool() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [splitRange, setSplitRange] = useState('');
  const [splitPdfUrl, setSplitPdfUrl] = useState(null);
  const [isSplitting, setIsSplitting] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    setPdfFile(file);
    setSplitPdfUrl(null);
    setSplitRange('');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdf.getPageCount());
    } catch (error) {
      toast.error('Error reading PDF file.');
      setPdfFile(null);
    }
  };

  const handleSplit = async () => {
    if (!pdfFile || !splitRange) {
      toast.error('Please provide a valid PDF and a page range.');
      return;
    }
    
    // Parse range (e.g. "1-3, 5, 7-9")
    const pagesToExtract = new Set();
    const ranges = splitRange.split(',').map(r => r.trim());
    
    for (const r of ranges) {
      if (r.includes('-')) {
        const [start, end] = r.split('-').map(Number);
        if (start && end && start <= end && start >= 1 && end <= totalPages) {
          for (let i = start; i <= end; i++) {
            pagesToExtract.add(i - 1); // 0-indexed for pdf-lib
          }
        }
      } else {
        const page = Number(r);
        if (page && page >= 1 && page <= totalPages) {
          pagesToExtract.add(page - 1);
        }
      }
    }

    if (pagesToExtract.size === 0) {
      toast.error('Invalid page range.');
      return;
    }

    setIsSplitting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const sortedPages = Array.from(pagesToExtract).sort((a, b) => a - b);
      const copiedPages = await newPdf.copyPages(originalPdf, sortedPages);
      
      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);
      toast.success('PDF split successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error splitting PDF.');
    } finally {
      setIsSplitting(false);
    }
  };

  const siblings = useCategorySiblings('/split-pdf');
  return (
    <ToolPageLayout title="Split PDF" icon={<FaCut />} breadcrumb={[{label: 'PDF Tools', path: '/merge-pdf'}]} siblings={siblings} currentPath="/split-pdf">
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
            <div className={`flex items-center gap-3 p-3 rounded border w-full w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <FaFilePdf className="text-red-500 text-2xl" />
              <div>
                <div className="font-medium truncate max-w-[250px]">{pdfFile.name}</div>
                <div className="text-xs text-gray-400">{totalPages} pages</div>
              </div>
            </div>

            <div className="w-full w-full">
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
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
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
