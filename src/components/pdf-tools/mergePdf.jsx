import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { FaFilePdf, FaTrash, FaDownload, FaPlus, FaObjectGroup } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function MergePdfTool() {
  const { isDarkMode } = useTheme();
  const [pdfFiles, setPdfFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.type === 'application/pdf');
    if (validFiles.length !== files.length) {
      toast.error('Only PDF files are allowed.');
    }
    setPdfFiles([...pdfFiles, ...validFiles]);
    setMergedPdfUrl(null);
  };

  const removeFile = (index) => {
    const updatedFiles = [...pdfFiles];
    updatedFiles.splice(index, 1);
    setPdfFiles(updatedFiles);
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

      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      toast.success('PDFs merged successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error merging PDFs.');
    } finally {
      setIsMerging(false);
    }
  };

  const siblings = useCategorySiblings('/merge-pdf');
  return (
    <ToolPageLayout title="Merge PDF" icon={<FaObjectGroup />} breadcrumb={[{label: 'PDF Tools', path: '/merge-pdf'}]} siblings={siblings} currentPath="/merge-pdf">
      <div className="w-full">
<Toaster />

      <div className={`w-full mx-auto p-6 shadow-lg rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
        <p className="mb-4 text-center">Select multiple PDF files and merge them in seconds.</p>

        <div className="flex justify-center mb-6">
          <label className={`cursor-pointer px-6 py-3 rounded-md flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
            <FaPlus /> Select PDF files
            <input type="file" multiple accept="application/pdf" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {pdfFiles.length > 0 && (
          <div className="mb-6 space-y-2">
            {pdfFiles.map((file, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <FaFilePdf className="text-red-500 text-xl" />
                  <span className="font-medium truncate max-w-[200px] sm:w-full">{file.name}</span>
                  <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 p-1" title="Remove">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleMerge}
            disabled={pdfFiles.length < 2 || isMerging}
            className={`px-8 py-3 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            {isMerging ? 'Merging...' : 'Merge PDFs'}
          </button>

          {mergedPdfUrl && (
            <a
              href={mergedPdfUrl}
              download="merged_document.pdf"
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
            >
              <FaDownload /> Download Merged PDF
            </a>
          )}
        </div>
      </div>
    </div>
    </ToolPageLayout>

  );
}
